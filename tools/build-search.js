#!/usr/bin/env node
'use strict';
/*
 * Builds search-index.json: the full text of every page the site lists, keyed by
 * its slug, for the in-browser search (search.html / search.js).
 *
 *   node tools/build-search.js
 *
 * Sources: the Tanach chapters in tanach-data.js, and the `articles`, `masters`,
 * `dissertation` (script.js) and `letters` (letters.js) entries. Titles and
 * descriptions are not stored here: the search page reads them from those same
 * files, so the index holds only the text.
 *
 * PDF text needs `pdftotext` (brew install poppler). Without it, PDF texts are
 * kept from the previous search-index.json, so a build elsewhere loses nothing.
 * Scanned PDFs have no text layer; they are found by title and description only.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);
const OUT = 'search-index.json';

// ---------------------------------------------------------------- load the site's data files
function loadData() {
  const ctx = vm.createContext({ document: { getElementById: () => null, querySelector: () => null } });
  const code = ['tanach-data.js', 'script.js', 'letters.js']
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n;\n');
  return vm.runInContext(code + '\n;({ chapters: TANACH_CHAPTERS, articles, masters, dissertation, researchReports: typeof researchReports !== "undefined" ? researchReports : [], letters })', ctx);
}

// ---------------------------------------------------------------- text extraction
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ndash: '–', mdash: '—', minus: '−', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

function htmlToText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(head|style|script)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|div|tr|blockquote|figcaption)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

// Bidi control marks (pdftotext wraps Hebrew runs in them) and soft hyphens carry no text.
const INVISIBLE = /[­‎‏‪-‮⁦-⁩]/g;

function tidy(text) {
  return text
    .replace(INVISIBLE, '')
    .split('\f')
    .map((page) => page.replace(/[ \t\r]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim())
    .join('\f')
    .trim();
}

let pdftotext = null;
for (const c of [process.env.PDFTOTEXT, '/opt/homebrew/bin/pdftotext', '/usr/local/bin/pdftotext', 'pdftotext'].filter(Boolean)) {
  try { execFileSync(c, ['-v'], { stdio: 'ignore' }); pdftotext = c; break; } catch { /* next */ }
}

// ---------------------------------------------------------------- build
function main() {
  const data = loadData();
  const previous = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')).docs || {} : {};
  const docs = {};
  const report = { chapters: 0, html: 0, pdf: 0, pdfKept: 0, pdfEmpty: [], missing: [] };

  for (const c of data.chapters) {
    if (!fs.existsSync(c.htmlFile)) { report.missing.push(c.htmlFile); continue; }
    docs[c.slug] = tidy(htmlToText(fs.readFileSync(c.htmlFile, 'utf8')));
    report.chapters++;
  }

  const entries = [...data.articles, data.masters, data.dissertation, ...data.researchReports, ...data.letters];
  for (const e of entries) {
    if (e.htmlFile) {
      if (!fs.existsSync(e.htmlFile)) { report.missing.push(e.htmlFile); continue; }
      docs[e.slug] = tidy(htmlToText(fs.readFileSync(e.htmlFile, 'utf8')));
      report.html++;
    } else if (e.content) {
      docs[e.slug] = tidy(htmlToText(e.content));
      report.html++;
    } else if (e.pdf) {
      if (!fs.existsSync(e.pdf)) { report.missing.push(e.pdf); continue; }
      let text = '';
      if (pdftotext) {
        // pdftotext ends each page with \f: kept, so a match can link to its PDF page.
        text = tidy(execFileSync(pdftotext, ['-enc', 'UTF-8', e.pdf, '-'], { maxBuffer: 64 << 20 }).toString('utf8'));
      } else if (previous[e.slug]) {
        text = previous[e.slug];
        report.pdfKept++;
      }
      if (text.replace(/\f/g, '').trim()) { docs[e.slug] = text; report.pdf++; }
      else report.pdfEmpty.push(e.pdf);
    }
  }

  const index = { version: 1, built: new Date().toISOString().slice(0, 10), docs };
  const json = JSON.stringify(index);
  const before = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
  const same = before && before.replace(/"built":"[^"]*"/, '') === json.replace(/"built":"[^"]*"/, '');
  if (!same) fs.writeFileSync(OUT, json);

  console.log(`\n${OUT}: ${Object.keys(docs).length} pages, ${(Buffer.byteLength(json) / 1024 / 1024).toFixed(1)} MB${same ? ' (ללא שינוי)' : ''}`);
  console.log(`  פרקי תנ"ך: ${report.chapters}, מאמרים ומכתבים (HTML): ${report.html}, PDF: ${report.pdf}`);
  if (!pdftotext) console.log(`  ! pdftotext לא נמצא (brew install poppler) — נשמר הטקסט הקודם של ${report.pdfKept} קובצי PDF`);
  if (report.pdfEmpty.length) console.log(`  קובצי PDF סרוקים ללא טקסט (יימצאו לפי כותרת ותיאור בלבד): ${report.pdfEmpty.join(', ')}`);
  if (report.missing.length) console.log(`  !! קבצים חסרים: ${report.missing.join(', ')}`);
}

main();
