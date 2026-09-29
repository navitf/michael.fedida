#!/usr/bin/env node
'use strict';
/*
 * Converts the Tanach chapter Word documents to HTML fragments and
 * regenerates tanach-data.js.
 *
 *   node tools/build-tanach.js [convert|index|all] [--src=<dir>] [--only=<bookId>] [--no-images] [--sitemap]
 *
 * convert : <src>/<book>/<file>.docx  ->  articles/tanach/<bookId>/<n>.html   (via pandoc)
 * index   : articles/tanach/** -> tanach-data.js  (TANACH_BOOKS, TANACH_CHAPTERS)
 * all     : both (default)
 *
 * <src> defaults to source-docx/ (git-ignored). Each sub-folder is a book: its
 * name may be the bookId ("bereshit"), the Hebrew name ("בראשית") or an alias.
 * The chapter is read from the document's own reference line ("בראשית ל"ז – נ'")
 * when present, otherwise from the file name ("בראשית לז.docx", "12.docx",
 * "פרק טו.docx"). Numbers in parentheses such as "(2)" are ignored.
 *
 * Each document is expected to open with up to three short lines in any order:
 * the article title, the chapter reference and the author. They are replaced by
 * an <h1> holding the title. Files that cannot be matched are reported, never fatal.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const BOOKS = require('./books');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

const OUT_DIR = path.join('articles', 'tanach');
const MEDIA_DIR = path.join('pictures', 'tanach');
const DATA_FILE = 'tanach-data.js';
const SITE_URL = 'https://navitf.github.io/michael.fedida/';
const AUTHOR = 'מיכאל פדידה';
const BLURB_MAX = 160;
const HEADER_MAX_CHARS = 80;

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const flags = argv.filter((a) => a.startsWith('--'));
const mode = argv.find((a) => !a.startsWith('--')) || 'all';
const has = (f) => flags.includes(f);
const flagValue = (name) => {
  const hit = flags.find((f) => f.startsWith(name + '='));
  return hit ? hit.slice(name.length + 1) : null;
};
const SRC_DIR = flagValue('--src') || 'source-docx';
const NO_IMAGES = has('--no-images');
const ONLY = flagValue('--only');
const SITEMAP = has('--sitemap');

if (!['convert', 'index', 'all'].includes(mode)) {
  console.error(`Unknown mode "${mode}". Use convert | index | all.`);
  process.exit(1);
}

// ---------------------------------------------------------------- helpers
const QUOTES = /["'׳״‘’“”]/g;

const HEB_VALUES = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400
};

function parseHebrewNumeral(s) {
  const clean = String(s || '').replace(QUOTES, '').trim();
  if (!clean) return null;
  let total = 0;
  for (const ch of clean) {
    const v = HEB_VALUES[ch];
    if (!v) return null;
    total += v;
  }
  return total || null;
}

function parseNumber(token) {
  if (/^\d+$/.test(token)) return parseInt(token, 10);
  return parseHebrewNumeral(token);
}

function normalizeName(s) {
  return String(s).replace(QUOTES, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

const BOOK_BY_ID = new Map(BOOKS.map((b) => [b.id, b]));
const BOOK_BY_NAME = new Map();
for (const b of BOOKS) {
  for (const key of [b.id, b.name, ...(b.aliases || [])]) BOOK_BY_NAME.set(normalizeName(key), b);
}

function findBook(folderName) {
  return BOOK_BY_NAME.get(normalizeName(folderName)) || null;
}

function bookNamesOf(book) {
  return [book.name, book.id, ...(book.aliases || [])];
}

// Parses "ל"ז – נ'", "לז-נ", "12", "בראשית כ"א" into { chapter, chapterEnd }.
function parseChapterRef(text, book) {
  let s = String(text || '').replace(QUOTES, '').replace(/[,،]/g, ' ').replace(/\bפרק(ים)?\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
  s = s.replace(/^\((.*)\)$/, '$1').trim();
  for (const name of bookNamesOf(book)) {
    const n = name.replace(QUOTES, '');
    if (s.startsWith(n + ' ')) { s = s.slice(n.length + 1).trim(); break; }
  }
  const m = s.match(/^(\d+|[א-ת]{1,4})(?:\s*[-–]\s*(\d+|[א-ת]{1,4}))?$/);
  if (!m) return null;
  const chapter = parseNumber(m[1]);
  const chapterEnd = m[2] ? parseNumber(m[2]) : null;
  if (!chapter || chapter > book.chapters) return null;
  if (chapterEnd && (chapterEnd <= chapter || chapterEnd > book.chapters)) return null;
  return { chapter, chapterEnd };
}

// The book whose name opens a reference line such as "שמות א" (null if none / no name given).
function bookNamedIn(text) {
  const s = String(text || '').replace(QUOTES, '').replace(/[,،]/g, ' ').replace(/\bפרק(ים)?\b/g, ' ')
    .replace(/\s+/g, ' ').trim().replace(/^\((.*)\)$/, '$1').trim();
  for (const b of BOOKS) {
    for (const name of bookNamesOf(b)) {
      const n = name.replace(QUOTES, '');
      if (s.startsWith(n + ' ') && parseChapterRef(s, b)) return b;
    }
  }
  return null;
}

// Chapter (or range) from a file name such as "בראשית לז-נ", "בראשית ל סופי (2)", "פרק 12".
function chapterFromStem(stem, book) {
  let s = stem.replace(/\(\d+\)/g, ' ').replace(QUOTES, '');
  for (const name of bookNamesOf(book)) {
    s = s.split(name.replace(QUOTES, '')).join(' ');
  }
  for (const token of s.split(/\s+/).filter(Boolean)) {
    const ref = parseChapterRef(token, book);
    if (ref) return ref;
  }
  return null;
}

// chapter 0 marks an essay about the whole book (no chapter number); it is
// stored as book.html and listed after the last chapter.
const BOOK_LEVEL = { chapter: 0, chapterEnd: null };

function chapterKey(ref) {
  if (!ref.chapter) return 'book';
  return ref.chapterEnd ? `${ref.chapter}-${ref.chapterEnd}` : String(ref.chapter);
}

function outPath(bookId, ref) {
  return path.join(OUT_DIR, bookId, `${chapterKey(ref)}.html`);
}
function mediaPath(bookId, ref) {
  return path.join(MEDIA_DIR, bookId, chapterKey(ref));
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function encodeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function textOf(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
    .replace(/[­‎‏‪-‮⁦-⁩]/g, '')
    .replace(/\s+/g, ' ').trim();
}

function resolvePandoc() {
  const candidates = [process.env.PANDOC, '/opt/homebrew/bin/pandoc', '/usr/local/bin/pandoc', 'pandoc'].filter(Boolean);
  for (const c of candidates) {
    try {
      execFileSync(c, ['--version'], { stdio: 'ignore' });
      return c;
    } catch { /* try next */ }
  }
  return null;
}

// ---------------------------------------------------------------- scan sources
function scanSources() {
  const result = { files: [], unmatched: [], wrongBook: [] };
  if (!fs.existsSync(SRC_DIR)) {
    console.warn(`  ! source folder not found: ${SRC_DIR}`);
    return result;
  }
  const isDocx = (name) => /\.docx$/i.test(name) && !name.startsWith('~$') && !name.startsWith('.');

  for (const entry of fs.readdirSync(SRC_DIR, { withFileTypes: true })) {
    const full = path.join(SRC_DIR, entry.name);
    if (entry.isDirectory()) {
      const book = findBook(entry.name);
      for (const f of fs.readdirSync(full)) {
        if (!isDocx(f)) continue;
        const src = path.join(full, f);
        if (!book) { result.unmatched.push(`${src} (תיקייה לא מזוהה)`); continue; }
        const stem = path.basename(f, path.extname(f));
        const namedBook = bookNamedIn(stem.replace(/\(\d+\)/g, ' '));
        if (namedBook && namedBook !== book) {
          result.wrongBook.push(`${src}: שם הקובץ מציין ${namedBook.name}, אבל נמצא בתיקיית ${book.name}`);
          continue;
        }
        result.files.push({ book, src, fileRef: chapterFromStem(stem, book) });
      }
    } else if (entry.isFile() && isDocx(entry.name)) {
      const stem = path.basename(entry.name, path.extname(entry.name));
      const m = stem.match(/^(.+?)[-_ ](\d+)$/);
      const book = m ? findBook(m[1]) : null;
      if (!book) { result.unmatched.push(full); continue; }
      result.files.push({ book, src: full, fileRef: parseChapterRef(m[2], book) });
    }
  }
  if (ONLY) result.files = result.files.filter((f) => f.book.id === ONLY);
  result.files.sort((a, b) => BOOKS.indexOf(a.book) - BOOKS.indexOf(b.book) || a.src.localeCompare(b.src, 'he'));
  return result;
}

// ---------------------------------------------------------------- convert
// Turns the leading title / reference / author paragraphs into <h1>title</h1>.
function promoteHeader(html, book) {
  // A header line may be a plain paragraph or a Word heading. Up to four short
  // lines are examined: the title, an optional subtitle, the chapter reference
  // and the author, in any order. Consumption stops at the first long paragraph.
  const paraRe = /^\s*<(p|h[1-3])\b[^>]*>([\s\S]*?)<\/\1>\s*/;
  const lines = [];
  let rest = html;
  while (lines.length < 4) {
    const m = rest.match(paraRe);
    if (!m) break;
    const text = textOf(m[2]);
    if (text && text.length > HEADER_MAX_CHARS) break;
    lines.push({ text, len: m[0].length });
    rest = rest.slice(m[0].length);
  }

  let title = null;
  let subtitle = null;
  let ref = null;
  let otherBook = null;
  let lastMeta = -1;
  let titleIdx = -1;
  let subtitleIdx = -1;

  lines.forEach((line, i) => {
    const text = line.text;
    if (!text) return;
    const asRef = parseChapterRef(text, book);
    const named = asRef ? null : bookNamedIn(text);
    if (text === AUTHOR) lastMeta = i;
    else if (asRef && !ref) { ref = asRef; lastMeta = i; }
    else if (named && named !== book && !otherBook) { otherBook = named; lastMeta = i; }
    else if (!title) { title = text; titleIdx = i; }
    else if (!subtitle) { subtitle = text; subtitleIdx = i; }
  });

  // A second plain line counts as a subtitle only when header lines follow it.
  if (subtitle && subtitleIdx > lastMeta) { subtitle = null; subtitleIdx = -1; }
  const consumeThrough = Math.max(lastMeta, titleIdx, subtitleIdx);
  if (consumeThrough < 0) return { html, title: null, ref: null, otherBook: null };

  const keptLines = lines.slice(consumeThrough + 1);
  const consumedLen = lines.slice(0, consumeThrough + 1).reduce((n, l) => n + l.len, 0);
  const putBack = html.slice(html.length - rest.length - keptLines.reduce((n, l) => n + l.len, 0));
  void consumedLen;

  const heading = (title ? `<h1>${encodeText(title)}</h1>\n` : '') +
    (subtitle ? `<p class="subtitle">${encodeText(subtitle)}</p>\n` : '');
  return { html: heading + putBack, title, ref, otherBook };
}

function cleanFragment(html) {
  let h = html;
  if (NO_IMAGES) {
    h = h.replace(/<figure[\s\S]*?<\/figure>/g, '').replace(/<img[^>]*>/g, '');
  }
  h = h.replace(/<span dir="rtl">([\s\S]*?)<\/span>/g, '$1');
  // Drop fixed image sizes so the stylesheet can scale pictures to the page.
  h = h.replace(/(<img\b[^>]*?)\s+style="[^"]*"/g, '$1');
  h = h.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/g, '');
  h = h.replace(/\n{3,}/g, '\n\n');
  return h.trim() + '\n';
}

function removeIfEmptyDir(dir) {
  try {
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.isDirectory()) walk(path.join(d, e.name));
        else return false;
      }
      fs.rmdirSync(d);
      return true;
    };
    if (fs.existsSync(dir)) walk(dir);
  } catch { /* leave it */ }
}

function convertAll(scan) {
  const stats = { written: 0, unchanged: 0, failed: [], unmatched: [], duplicates: [], mismatched: [], wrongBook: [], extra: [], stale: [], bookLevel: [] };
  if (!scan.files.length) return stats;

  const pandoc = resolvePandoc();
  if (!pandoc) {
    console.error('pandoc not found. Install it (brew install pandoc) or set PANDOC=/path/to/pandoc.');
    process.exit(1);
  }

  // Pass 1: convert every document and work out its chapter.
  const docs = [];
  scan.files.forEach((item, i) => {
    const { book, src } = item;
    const tmpMedia = path.join(MEDIA_DIR, book.id, `_tmp${i}`);
    let raw;
    try {
      raw = execFileSync(pandoc, [
        src, '--from', 'docx', '--to', 'html5', '--wrap=none', '--strip-comments',
        `--extract-media=${tmpMedia}`
      ], { stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8');
    } catch (err) {
      const msg = (err.stderr && err.stderr.toString().trim()) || err.message;
      stats.failed.push(`${src}: ${msg}`);
      removeIfEmptyDir(tmpMedia);
      return;
    }
    const promoted = promoteHeader(raw, book);
    if (promoted.otherBook) {
      stats.wrongBook.push(`${src}: המסמך מציין ${promoted.otherBook.name}, אבל נמצא בתיקיית ${book.name}`);
      removeIfEmptyDir(tmpMedia);
      return;
    }
    let fileRef = item.fileRef;
    if (!promoted.ref && !fileRef) {
      // No chapter anywhere: an essay about the whole book.
      fileRef = BOOK_LEVEL;
      stats.bookLevel.push(`${src} → ${book.name}, "${promoted.title || '(ללא כותרת)'}"`);
    }
    docs.push({ item, book, src, tmpMedia, html: cleanFragment(promoted.html), docRef: promoted.ref, fileRef });
  });

  // The document's own reference line wins over the file name, unless that
  // would collide with a file whose name and reference agree.
  const confirmed = new Set();
  for (const d of docs) {
    if (d.docRef && d.fileRef && chapterKey(d.docRef) === chapterKey(d.fileRef)) confirmed.add(`${d.book.id}/${chapterKey(d.docRef)}`);
  }
  for (const d of docs) {
    if (d.docRef && d.fileRef && chapterKey(d.docRef) !== chapterKey(d.fileRef)) {
      const docKey = `${d.book.id}/${chapterKey(d.docRef)}`;
      if (confirmed.has(docKey)) {
        d.ref = d.fileRef;
        stats.mismatched.push(`${d.src}: המסמך מציין ${chapterKey(d.docRef)} אבל פרק זה כבר תפוס; נלקח ${chapterKey(d.fileRef)} משם הקובץ`);
      } else {
        d.ref = d.docRef;
        stats.mismatched.push(`${d.src}: שם הקובץ מציין ${chapterKey(d.fileRef)}, המסמך מציין ${chapterKey(d.docRef)} (נלקח מהמסמך)`);
      }
    } else {
      d.ref = d.docRef || d.fileRef;
    }
    d.key = `${d.book.id}/${chapterKey(d.ref)}`;
  }

  // Several articles on the same chapter get a letter suffix (2.html, 2b.html, ...),
  // in file-name order. Byte-identical duplicates are skipped.
  const groups = new Map();
  for (const d of docs) {
    if (!groups.has(d.key)) groups.set(d.key, []);
    groups.get(d.key).push(d);
  }
  const produced = new Set();
  for (const group of groups.values()) {
    // The plainest file name ("שמואל ב כד.docx" before "שמואל ב כד המשך.docx") is the main article.
    group.sort((a, b) => path.basename(a.src).length - path.basename(b.src).length || a.src.localeCompare(b.src, 'he'));
    let letter = 0;
    const kept = [];
    for (const d of group) {
      const twin = kept.find((k) => k.html === d.html);
      if (twin) { stats.duplicates.push(`${d.src} זהה ל-${twin.src}`); removeIfEmptyDir(d.tmpMedia); continue; }
      d.part = letter ? String.fromCharCode(96 + letter) : '';
      letter++;
      kept.push(d);
      if (d.part) stats.extra.push(`${d.src}: מאמר נוסף על ${d.book.name} ${chapterKey(d.ref)} (${chapterKey(d.ref)}${d.part}.html)`);
    }
  }

  // Pass 2: write the outputs.
  for (const d of docs) {
    if (d.part === undefined) continue;
    const name = chapterKey(d.ref) + d.part;
    const out = path.join(OUT_DIR, d.book.id, `${name}.html`);
    const media = path.join(MEDIA_DIR, d.book.id, name);
    let html = d.html;
    if (fs.existsSync(d.tmpMedia)) {
      fs.rmSync(media, { recursive: true, force: true });
      fs.renameSync(d.tmpMedia, media);
      html = html.split(d.tmpMedia.split(path.sep).join('/')).join(media.split(path.sep).join('/'));
      removeIfEmptyDir(media);
    }
    produced.add(out.split(path.sep).join('/'));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
    if (before === html) { stats.unchanged++; continue; }
    fs.writeFileSync(out, html);
    stats.written++;
    console.log(`  ✓ ${d.src}  →  ${out}`);
  }

  // Outputs that no source produced this run (renamed or removed documents).
  if (!ONLY && fs.existsSync(OUT_DIR)) {
    for (const dir of fs.readdirSync(OUT_DIR, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const f of fs.readdirSync(path.join(OUT_DIR, dir.name))) {
        const p = [OUT_DIR, dir.name, f].join('/');
        if (f.endsWith('.html') && !produced.has(p)) stats.stale.push(p);
      }
    }
  }
  return stats;
}

// ---------------------------------------------------------------- index
function extractTitleAndBlurb(html) {
  let rest = html.trim();
  let title = null;

  const heading = rest.match(/^<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/);
  if (heading) {
    title = textOf(heading[2]) || null;
    rest = rest.slice(heading[0].length);
  } else {
    const bold = rest.match(/^<p\b[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/);
    if (bold) {
      const t = textOf(bold[1]);
      if (t && t.length < HEADER_MAX_CHARS) { title = t; rest = rest.slice(bold[0].length); }
    }
  }

  let blurb = '';
  const paraRe = /<p\b([^>]*)>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = paraRe.exec(rest))) {
    if (/class="subtitle"/.test(m[1])) continue;
    const t = textOf(m[2]);
    if (!t) continue;
    const sentence = t.match(/^(.*?[.!?])(\s|$)/);
    blurb = sentence ? sentence[1] : t;
    if (blurb.length > BLURB_MAX) blurb = blurb.slice(0, BLURB_MAX - 1).replace(/\s+\S*$/, '') + '…';
    break;
  }
  return { title, blurb };
}

function scanOutputs() {
  const chapters = [];
  if (!fs.existsSync(OUT_DIR)) return chapters;
  for (const dir of fs.readdirSync(OUT_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const book = BOOK_BY_ID.get(dir.name);
    if (!book) { console.warn(`  ! ${path.join(OUT_DIR, dir.name)} is not a known bookId, ignored`); continue; }
    for (const f of fs.readdirSync(path.join(OUT_DIR, dir.name))) {
      const m = f.match(/^(\d+|book)(?:-(\d+))?([a-z])?\.html$/);
      if (!m) continue;
      const chapter = m[1] === 'book' ? 0 : parseInt(m[1], 10);
      const chapterEnd = m[2] ? parseInt(m[2], 10) : null;
      const part = m[3] || '';
      const htmlFile = path.join(OUT_DIR, dir.name, f).split(path.sep).join('/');
      const { title, blurb } = extractTitleAndBlurb(fs.readFileSync(htmlFile, 'utf8'));
      const entry = { bookId: book.id, chapter, slug: `${book.id}-${chapterKey({ chapter, chapterEnd })}${part}`, htmlFile, title, blurb };
      if (chapterEnd) entry.chapterEnd = chapterEnd;
      if (part) entry.part = part;
      chapters.push(entry);
    }
  }
  chapters.sort((a, b) =>
    BOOKS.indexOf(BOOK_BY_ID.get(a.bookId)) - BOOKS.indexOf(BOOK_BY_ID.get(b.bookId)) ||
    (a.chapter || Infinity) - (b.chapter || Infinity) ||
    (a.chapterEnd || 0) - (b.chapterEnd || 0) ||
    (a.part || '').localeCompare(b.part || ''));
  return chapters;
}

function existingSlugs() {
  try {
    const src = fs.readFileSync('script.js', 'utf8');
    return new Set([...src.matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1]));
  } catch { return new Set(); }
}

function writeData(chapters) {
  const used = new Set(chapters.map((c) => c.bookId));
  const books = BOOKS.filter((b) => used.has(b.id)).map(({ id, name, group, chapters: n }) => ({ id, name, group, chapters: n }));
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    `// נוצר אוטומטית על ידי tools/build-tanach.js (${date}) — אין לערוך ידנית.`,
    '// כדי לעדכן: הניחו קובץ Word בתיקיית הספר והריצו: node tools/build-tanach.js --src=<תיקיית המקור>',
    'const TANACH_BOOKS = [',
    books.map((b) => '  ' + JSON.stringify(b)).join(',\n'),
    '];',
    'const TANACH_CHAPTERS = [',
    chapters.map((c) => '  ' + JSON.stringify(c)).join(',\n'),
    '];',
    ''
  ];
  const text = lines.join('\n');
  const before = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, 'utf8') : null;
  // Keep the file (and its date stamp) untouched when nothing but the date would change.
  if (before && before.replace(/\(\d{4}-\d{2}-\d{2}\)/, '') === text.replace(/\(\d{4}-\d{2}-\d{2}\)/, '')) return books;
  fs.writeFileSync(DATA_FILE, text);
  return books;
}

function writeSitemap(books, chapters) {
  const urls = ['index.html', 'about.html', 'tanach.html']
    .concat(books.map((b) => `tanach.html?book=${b.id}`))
    .concat(chapters.map((c) => `article.html?id=${c.slug}`))
    .concat([...existingSlugs()].map((s) => `article.html?id=${s}`));
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    .concat(urls.map((u) => `  <url><loc>${SITE_URL}${u.replace(/&/g, '&amp;')}</loc></url>`))
    .concat(['</urlset>', ''])
    .join('\n');
  fs.writeFileSync('sitemap.xml', xml);
}

// ---------------------------------------------------------------- main
function main() {
  let scan = null;
  let convStats = null;

  if (mode === 'convert' || mode === 'all') {
    scan = scanSources();
    console.log(`\nממיר ${scan.files.length} קבצי Word מתוך ${SRC_DIR}/ ...`);
    convStats = convertAll(scan);
    console.log(`  נכתבו: ${convStats.written}, ללא שינוי: ${convStats.unchanged}, נכשלו: ${convStats.failed.length}`);
  }

  let chapters = [];
  let books = [];
  if (mode === 'index' || mode === 'all') {
    chapters = scanOutputs();
    books = writeData(chapters);
    console.log(`\n${DATA_FILE}: ${books.length} ספרים, ${chapters.length} פרקים`);
    for (const b of books) {
      const n = chapters.filter((c) => c.bookId === b.id && c.chapter).length;
      const missing = n < b.chapters ? `  (חסרים ${b.chapters - n})` : '';
      console.log(`  ${b.name.padEnd(14)} ${String(n).padStart(3)} / ${b.chapters}${missing}`);
    }
    const noTitle = chapters.filter((c) => !c.title).length;
    if (noTitle) console.log(`  ${noTitle} פרקים ללא כותרת בקובץ (יוצגו עם כותרת ברירת מחדל)`);

    const clashes = chapters.filter((c) => existingSlugs().has(c.slug)).map((c) => c.slug);
    if (clashes.length) console.log(`\n  !! slug collisions with script.js: ${clashes.join(', ')}`);

    if (SITEMAP) { writeSitemap(books, chapters); console.log('\nנכתב sitemap.xml'); }
  }

  if (scan) {
    const report = (label, list) => {
      if (!list || !list.length) return;
      console.log(`\n${label} (${list.length}):`);
      list.forEach((x) => console.log('  - ' + x));
    };
    report('לא זוהו', scan.unmatched.concat(convStats.unmatched));
    report('הספר במסמך אינו הספר של התיקייה (דולגו)', scan.wrongBook.concat(convStats.wrongBook));
    report('שם הקובץ והמסמך לא תואמים', convStats.mismatched);
    report('מאמרים על הספר כולו (ללא מספר פרק, מוצגים אחרי הפרק האחרון)', convStats.bookLevel);
    report('מאמרים נוספים על אותו פרק', convStats.extra);
    report('כפילויות זהות (דולגו)', convStats.duplicates);
    report('נכשלו בהמרה', convStats.failed);
    report('קבצי פלט ישנים שאין להם מקור (מומלץ למחוק)', convStats.stale);
  }
  console.log('');
}

main();
