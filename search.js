// חיפוש באתר. רץ כולו בדפדפן: טוען את search-index.json (נבנה ע"י tools/build-search.js)
// ומחפש בו יחד עם הכותרות והתיאורים שבקובצי הנתונים (tanach-data.js, script.js, letters.js).
// תלוי ב: tanach-data.js, script.js, letters.js, tanach.js (escapeHtml, chapterLabel, tanachBook).

const SEARCH_SECTIONS = [
    { key: 'tanach', name: 'פרשנות תנ"ך' },
    { key: 'articles', name: 'חיבורים ומאמרים' },
    { key: 'research', name: 'מחקר' },
    { key: 'letters', name: 'מכתבים למערכת הארץ' }
];

// ---------------------------------------------------------------- Hebrew-aware normalisation
// Niqqud and cantillation, quote marks and bidi marks are dropped; final letters fold to
// their regular form; whitespace collapses. `map[i]` = index in the original of norm char i,
// so a match can be cut back out of the original text for its snippet.
const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
const DROP = /[֑-ׇֽֿׁׂׅׄ"'`׳״‘’“”­‎‏‪-‮⁦-⁩]/;
const SPACE = /[\s־׀׃׆]/;

function normalize(text, withMap) {
    const out = [];
    const map = withMap ? new Int32Array(text.length) : null;
    let n = 0;
    for (let i = 0; i < text.length; i++) {
        let ch = text[i];
        if (DROP.test(ch)) continue;
        if (SPACE.test(ch)) {
            if (n === 0 || out[n - 1] === ' ') continue;
            ch = ' ';
        } else {
            ch = FINALS[ch] || ch.toLowerCase();
        }
        out.push(ch);
        if (map) map[n] = i;
        n++;
    }
    const norm = out.join('');
    return withMap ? { norm, map: map.subarray(0, n) } : norm;
}

// A Hebrew word often carries a one- or two-letter prefix (ו, ה, ב, כ, ל, מ, ש). The text is
// searched by substring, so "גבעה" already finds "בגבעה"; for the other direction the query
// term is also tried without its prefix.
const PREFIX = 'והבכלמש';

function termVariants(term) {
    const variants = [term];
    if (term.length >= 4 && PREFIX.includes(term[0])) variants.push(term.slice(1));
    if (term.length >= 5 && PREFIX.includes(term[0]) && PREFIX.includes(term[1])) variants.push(term.slice(2));
    return variants;
}

function countHits(hay, needle, cap) {
    let count = 0;
    for (let i = hay.indexOf(needle); i !== -1 && count < cap; i = hay.indexOf(needle, i + needle.length)) count++;
    return count;
}

// ---------------------------------------------------------------- the documents
function searchDocs(texts) {
    const docs = [];
    const add = (d) => {
        const body = texts[d.slug] || '';
        docs.push(Object.assign(d, {
            body,
            normTitle: normalize(d.title),
            normMeta: normalize(`${d.meta} ${d.desc || ''}`),
            normBody: null // built on first search
        }));
    };

    for (const c of tanachChapters()) {
        const book = tanachBook(c.bookId);
        const label = chapterLabel(c);
        const fallback = c.chapter ? `${book.name} ${label}` : `${book.name}: ${label}`;
        add({ slug: c.slug, section: 'tanach', title: c.title || fallback, meta: `${book.name} · ${label}`, desc: c.blurb, url: `article.html?id=${c.slug}` });
    }
    for (const a of articles) {
        add({ slug: a.slug, section: 'articles', title: a.title, meta: a.pdf ? 'PDF' : '', desc: a.description, url: `article.html?id=${a.slug}`, pdf: a.pdf });
    }
    for (const r of [masters, dissertation]) {
        add({ slug: r.slug, section: 'research', title: r.title, meta: r === masters ? 'עבודת מאסטר' : 'עבודת דוקטורט', desc: r.description, url: `article.html?id=${r.slug}`, pdf: r.pdf });
    }
    for (const r of (typeof researchReports !== 'undefined' ? researchReports : [])) {
        add({ slug: r.slug, section: 'research', title: r.title, meta: 'דוח מחקר', desc: r.description, url: `article.html?id=${r.slug}`, pdf: r.pdf });
    }
    for (const l of letters) {
        add({ slug: l.slug, section: 'letters', title: l.title, meta: letterDate(l.date), desc: l.description, url: `article.html?id=${l.slug}` });
    }
    return docs;
}

function bodyOf(doc) {
    if (!doc.normBody) doc.normBody = normalize(doc.body, true);
    return doc.normBody;
}

// ---------------------------------------------------------------- search
function runSearch(docs, query) {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length || terms.join('').length < 2) return { terms: [], results: [] };
    const groups = terms.map(termVariants);
    const phrase = terms.length > 1 ? terms.join(' ') : null;
    const results = [];

    for (const doc of docs) {
        const body = bodyOf(doc).norm;
        let score = 0;
        let all = true;
        for (const variants of groups) {
            let t = 0;
            for (const v of variants) {
                t += countHits(doc.normTitle, v, 5) * 20 + countHits(doc.normMeta, v, 5) * 5 + Math.min(countHits(body, v, 30), 30);
            }
            if (!t) { all = false; break; }
            score += t;
        }
        if (!all) continue;
        // The words side by side, as typed, rank far above the same words scattered.
        if (phrase) score += countHits(doc.normTitle, phrase, 5) * 200 + countHits(doc.normMeta, phrase, 5) * 50 + Math.min(countHits(body, phrase, 30), 30) * 20;
        results.push({ doc, score });
    }
    results.sort((a, b) => b.score - a.score);
    return { terms: phrase ? [phrase, ...groups.flat()] : groups.flat(), results };
}

// ---------------------------------------------------------------- snippets
const SNIPPET_RADIUS = 80;

function snippets(doc, needles, max) {
    const { norm, map } = bodyOf(doc);
    if (!norm) return [];
    const firsts = needles
        .map((n) => norm.indexOf(n))
        .filter((i) => i !== -1)
        .sort((a, b) => a - b);
    const windows = [];
    for (const pos of firsts) {
        if (windows.length && pos < windows.at(-1).end) continue;
        windows.push({ start: Math.max(0, pos - SNIPPET_RADIUS), end: Math.min(norm.length, pos + SNIPPET_RADIUS) });
        if (windows.length === max) break;
    }
    return windows.map((w) => {
        // Every match inside the window, in original-text positions.
        const ranges = [];
        for (const n of needles) {
            for (let i = norm.indexOf(n, w.start); i !== -1 && i + n.length <= w.end; i = norm.indexOf(n, i + 1)) {
                let end = map.at(i + n.length - 1) + 1;
                while (end < doc.body.length && /[\u0591-\u05c7]/.test(doc.body[end]) && doc.body[end] !== '\u05be') end++;
                ranges.push([map.at(i), end]);
            }
        }
        ranges.sort((a, b) => a[0] - b[0]);
        const merged = [];
        for (const r of ranges) {
            if (merged.length && r[0] <= merged.at(-1)[1]) merged.at(-1)[1] = Math.max(merged.at(-1)[1], r[1]);
            else merged.push(r.slice());
        }
        const from = map.at(w.start);
        const to = w.end >= norm.length ? doc.body.length : map.at(w.end);
        let html = w.start > 0 ? '…' : '';
        let cursor = from;
        for (const [a, b] of merged) {
            html += escapeHtml(doc.body.slice(cursor, a)) + '<mark>' + escapeHtml(doc.body.slice(a, b)) + '</mark>';
            cursor = b;
        }
        html += escapeHtml(doc.body.slice(cursor, to)) + (to < doc.body.length ? '…' : '');
        html = html.replace(/[\n\f]+/g, ' · ');
        // PDF texts keep a form feed per page: count them to link the match to its page.
        const page = doc.pdf ? doc.body.slice(0, from).split('\f').length : null;
        return { html, page };
    });
}

// ---------------------------------------------------------------- rendering
function resultHTML(doc, needles) {
    const snips = snippets(doc, needles, 2);
    const body = snips.length
        ? snips.map((s) => `<p class="sr-snippet">${s.html}${s.page ? ` <a class="sr-page" href="${doc.pdf}#page=${s.page}" target="_blank" rel="noopener">עמ' ${s.page}</a>` : ''}</p>`).join('')
        : (doc.desc ? `<p class="sr-snippet">${escapeHtml(doc.desc)}</p>` : '');
    return '<article class="search-result">' +
        (doc.meta ? `<div class="sr-meta">${escapeHtml(doc.meta)}</div>` : '') +
        `<h3><a href="${doc.url}">${escapeHtml(doc.title)}</a></h3>` +
        body +
        '</article>';
}

function renderResults(el, query, found) {
    if (!found.terms.length) {
        el.innerHTML = '<p class="sr-status">הקלידו מילה או ביטוי לחיפוש בכל המאמרים, פרקי התנ"ך והמכתבים.</p>';
        return;
    }
    if (!found.results.length) {
        el.innerHTML = `<p class="sr-status">לא נמצאו תוצאות עבור "${escapeHtml(query)}". נסו מילה אחרת או חלק ממנה.</p>`;
        return;
    }
    const n = found.results.length;
    let html = `<p class="sr-status">${n === 1 ? 'נמצאה תוצאה אחת' : `נמצאו ${n} תוצאות`} עבור "${escapeHtml(query)}"</p>`;
    for (const sec of SEARCH_SECTIONS) {
        const hits = found.results.filter((r) => r.doc.section === sec.key);
        if (!hits.length) continue;
        html += `<section class="sr-section"><h2 class="section-title">${sec.name} <span class="sr-count">${hits.length}</span></h2>` +
            hits.map((r) => resultHTML(r.doc, found.terms)).join('') + '</section>';
    }
    el.innerHTML = html;
}

// ---------------------------------------------------------------- page wiring
(function initSearchPage() {
    const input = document.getElementById('search-input');
    const out = document.getElementById('search-results');
    if (!input || !out) return;

    const query = new URLSearchParams(location.search).get('q') || '';
    input.value = query;
    out.innerHTML = '<p class="sr-status">טוען את מאגר החיפוש…</p>';

    fetch('search-index.json')
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((index) => {
            const docs = searchDocs(index.docs || {});
            let timer = null;
            const go = () => {
                const q = input.value.trim();
                const url = new URL(location.href);
                if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
                history.replaceState(null, '', url);
                document.title = q ? `חיפוש: ${q} – מיכאל פדידה` : 'חיפוש באתר – מיכאל פדידה';
                renderResults(out, q, runSearch(docs, q));
            };
            input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(go, 200); });
            input.form.addEventListener('submit', (e) => { e.preventDefault(); clearTimeout(timer); go(); });
            go();
        })
        .catch((err) => {
            out.innerHTML = `<p class="sr-status">לא ניתן לטעון את מאגר החיפוש (${escapeHtml(err.message)}). נסו לרענן את הדף.</p>`;
        });
})();
