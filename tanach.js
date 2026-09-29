// Runtime for the "פרשנות פרקי תנ"ך" section.
// Depends on tanach-data.js (TANACH_BOOKS, TANACH_CHAPTERS), which is generated
// by tools/build-tanach.js. Load order: tanach-data.js -> script.js -> tanach.js

const TANACH_GROUPS = ['תורה', 'נביאים', 'כתובים'];

function tanachBooks() {
    return typeof TANACH_BOOKS !== 'undefined' ? TANACH_BOOKS : [];
}

function tanachChapters() {
    return typeof TANACH_CHAPTERS !== 'undefined' ? TANACH_CHAPTERS : [];
}

// 1..499 -> Hebrew numeral. punct=true adds geresh/gershayim ("י'", "כ\"ג").
function hebrewNumeral(n, punct) {
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
    let s = hundreds[Math.floor(n / 100)] || '';
    const r = n % 100;
    if (r === 15) s += 'טו';
    else if (r === 16) s += 'טז';
    else s += tens[Math.floor(r / 10)] + ones[r % 10];
    if (!punct) return s;
    return s.length === 1 ? s + "'" : s.slice(0, -1) + '"' + s.slice(-1);
}

// "פרק ג'" or, for a document covering several chapters, "פרקים ל"ז–נ'".
function chapterLabel(c) {
    if (!c.chapter) return 'על הספר';
    if (c.chapterEnd) return `פרקים ${hebrewNumeral(c.chapter, true)}–${hebrewNumeral(c.chapterEnd, true)}`;
    return `פרק ${hebrewNumeral(c.chapter, true)}`;
}

// Compact form for the chapter strip: "ג" or "לז–נ".
function chapterShort(c) {
    if (!c.chapter) return 'הספר';
    if (c.chapterEnd) return `${hebrewNumeral(c.chapter)}–${hebrewNumeral(c.chapterEnd)}`;
    return hebrewNumeral(c.chapter);
}

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function tanachBook(id) {
    return tanachBooks().find(b => b.id === id) || null;
}

function tanachChaptersOf(bookId) {
    return tanachChapters().filter(c => c.bookId === bookId);
}

function findChapter(slug) {
    if (!slug) return null;
    return tanachChapters().find(c => c.slug === slug) || null;
}

function setMetaDescription(text) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
    }
    meta.content = text;
}

// items: [[href|null, label], ...] — the last item is the current page.
function breadcrumbHTML(items) {
    return '<nav class="breadcrumb" aria-label="ניווט">' +
        items.map(([href, label]) => href
            ? `<a href="${href}">${escapeHtml(label)}</a>`
            : `<span class="current">${escapeHtml(label)}</span>`
        ).join('<span class="sep">›</span>') +
        '</nav>';
}

function chapterCountLabel(book, full) {
    const entries = tanachChaptersOf(book.id);
    const n = entries.filter(c => c.chapter).length;
    if (!n) {
        // Only essays about the whole book.
        return entries.length === 1 ? 'מאמר על הספר' : `${entries.length} מאמרים על הספר`;
    }
    if (full && n < book.chapters) return `${n} מתוך ${book.chapters} פרקים`;
    return `${n} פרקים`;
}

function bookChipHTML(book) {
    return `<a class="book-chip" href="tanach.html?book=${book.id}">` +
        `<span class="book-chip-name">${escapeHtml(book.name)}</span>` +
        `<span class="book-chip-count">${chapterCountLabel(book)}</span>` +
        '</a>';
}

function bookGridHTML() {
    return TANACH_GROUPS
        .map(g => ({ name: g, books: tanachBooks().filter(b => b.group === g) }))
        .filter(g => g.books.length)
        .map(g => `<div class="book-group-label">${g.name}</div>` +
                  `<div class="book-grid">${g.books.map(bookChipHTML).join('')}</div>`)
        .join('');
}

function bookPillsHTML(activeId) {
    return '<div class="book-pills">' +
        tanachBooks().map(b =>
            `<a class="pill${b.id === activeId ? ' active' : ''}" href="tanach.html?book=${b.id}">${escapeHtml(b.name)}</a>`
        ).join('') +
        '</div>';
}

function chapterCardHTML(book, c) {
    const label = chapterLabel(c);
    const title = c.title || (c.chapter ? `${book.name} ${label}` : `${book.name}: ${label}`);
    return `<a class="chapter-card" href="article.html?id=${c.slug}">` +
        `<span class="chapter-badge">${label}</span>` +
        '<span class="chapter-body">' +
        `<h3>${escapeHtml(title)}</h3>` +
        (c.blurb ? `<span class="blurb">${escapeHtml(c.blurb)}</span>` : '') +
        '</span>' +
        '<span class="chapter-arrow" aria-hidden="true">←</span>' +
        '</a>';
}

// ---------------------------------------------------------------- home hero
function renderTanachHero() {
    const hero = document.getElementById('tanach-hero');
    if (!hero) return;
    const heading = document.querySelector('.section-title');
    if (!tanachChapterCount()) {
        hero.style.display = 'none';
        if (heading) heading.style.display = 'none';
        return;
    }
    hero.innerHTML =
        '<div class="tanach-hero">' +
            '<div class="hero-head">' +
                '<h2><a href="tanach.html">פרשנות פרקי תנ"ך</a></h2>' +
                `<span class="book-meta">${tanachChapterCount()} פרקים</span>` +
            '</div>' +
            '<p class="hero-intro">עיון בפרקי התנ"ך, פרק אחר פרק. בחרו ספר כדי לעבור לרשימת הפרקים.</p>' +
            bookGridHTML() +
        '</div>';
}

// ---------------------------------------------------------------- book page
function renderBookPage(bookId) {
    const el = document.getElementById('tanach-page');
    if (!el) return;
    const book = tanachBook(bookId);

    if (!book || !tanachChaptersOf(book.id).length) {
        document.title = 'פרשנות פרקי תנ"ך – מיכאל פדידה';
        setMetaDescription('פרשנות פרקי תנ"ך מאת מיכאל פדידה, ספר אחר ספר ופרק אחר פרק.');
        el.innerHTML =
            breadcrumbHTML([['index.html', 'בית'], [null, 'פרשנות תנ"ך']]) +
            '<div class="book-heading">' +
                '<h2>פרשנות פרקי תנ"ך</h2>' +
                `<span class="book-meta">${tanachChapterCount()} פרקים</span>` +
            '</div>' +
            (tanachChapterCount()
                ? bookGridHTML()
                : '<p class="empty-note">הפרקים יתפרסמו בקרוב.</p>');
        return;
    }

    const chapters = tanachChaptersOf(book.id);
    document.title = `${book.name} – פרשנות תנ"ך – מיכאל פדידה`;
    setMetaDescription(`פרשנות לפרקי ספר ${book.name} מאת מיכאל פדידה.`);
    el.innerHTML =
        breadcrumbHTML([['index.html', 'בית'], ['tanach.html', 'פרשנות תנ"ך'], [null, book.name]]) +
        bookPillsHTML(book.id) +
        '<div class="book-heading">' +
            `<h2>ספר ${escapeHtml(book.name)}</h2>` +
            `<span class="book-meta">${chapterCountLabel(book, true)}</span>` +
        '</div>' +
        `<div class="chapter-list">${chapters.map(c => chapterCardHTML(book, c)).join('')}</div>`;
}

// ---------------------------------------------------------------- chapter page
function normalizeTitle(s) {
    return String(s || '').replace(/["'׳״‘’“”]/g, '').replace(/\s+/g, ' ').trim();
}

function renderChapterPage(chapter) {
    const book = tanachBook(chapter.bookId);
    const chapters = tanachChaptersOf(chapter.bookId);
    const idx = chapters.findIndex(c => c.slug === chapter.slug);
    const prev = idx > 0 ? chapters[idx - 1] : null;
    const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null;
    const label = chapterLabel(chapter);
    const defaultTitle = chapter.chapter ? `${book.name} ${label}` : `${book.name}: ${label}`;
    const pageTitle = chapter.title || defaultTitle;

    document.title = `${pageTitle} – ${defaultTitle} – מיכאל פדידה`;
    setMetaDescription(chapter.blurb || `פרשנות ל${defaultTitle} מאת מיכאל פדידה.`);

    ['pdf-embed', 'view-link', 'download-link'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.style.display = 'none';
    });

    const strip = '<nav class="chapter-strip" aria-label="פרקי הספר">' +
        chapters.map(c =>
            `<a class="strip-num${c.slug === chapter.slug ? ' active' : ''}" href="article.html?id=${c.slug}" title="${chapterLabel(c)}">${chapterShort(c)}</a>`
        ).join('') +
        '</nav>';

    const navLink = (c, cls, label) => c
        ? `<a class="${cls}" href="article.html?id=${c.slug}">` +
              `<span class="pn-label">${label}</span>` +
              `<span class="pn-title">${escapeHtml(book.name)} ${chapterLabel(c)}</span>` +
          '</a>'
        : `<span class="${cls} disabled" aria-hidden="true"></span>`;

    const prevNext = '<nav class="prev-next" aria-label="פרק קודם והבא">' +
        navLink(prev, 'pn-prev', 'הפרק הקודם') +
        `<a class="pn-all" href="tanach.html?book=${book.id}">כל פרקי ${escapeHtml(book.name)}</a>` +
        navLink(next, 'pn-next', 'הפרק הבא') +
        '</nav>';

    const content = document.getElementById('article-content');
    content.innerHTML =
        breadcrumbHTML([
            ['index.html', 'בית'],
            ['tanach.html', 'פרשנות תנ"ך'],
            [`tanach.html?book=${book.id}`, book.name],
            [null, label]
        ]) +
        `<div class="chapter-eyebrow">${escapeHtml(defaultTitle)}</div>` +
        `<h2 class="chapter-title">${escapeHtml(pageTitle)}</h2>` +
        strip +
        '<div class="article-text tanach-text" id="tanach-text"></div>' +
        prevNext;

    fetch(chapter.htmlFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const box = document.getElementById('tanach-text');
            box.innerHTML = html;
            const first = box.firstElementChild;
            if (first && /^H[1-3]$/.test(first.tagName)) {
                const t = normalizeTitle(first.textContent);
                if (t === normalizeTitle(pageTitle) || t === normalizeTitle(defaultTitle)) first.remove();
            }
        })
        .catch(error => {
            console.error('Error loading chapter file:', error);
            document.getElementById('tanach-text').innerHTML =
                `<p>Content not available. Error: ${escapeHtml(error.message)}</p>` +
                `<p>Trying to load: ${escapeHtml(chapter.htmlFile)}</p>`;
        });
}

// ---------------------------------------------------------------- auto-init
if (document.getElementById('tanach-hero')) {
    renderTanachHero();
}
if (document.getElementById('tanach-page')) {
    renderBookPage(new URLSearchParams(window.location.search).get('book'));
}

// Number of chapter entries, excluding essays about a whole book.
function tanachChapterCount() {
    return tanachChapters().filter(c => c.chapter).length;
}
