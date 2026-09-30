// מכתבים למערכת "הארץ". רשומה אחת לכל מכתב, מהחדש לישן.
// שדות: title, date (YYYY-MM-DD, תאריך הפרסום בעיתון), description (שורה-שתיים),
// ואחד מאלה: htmlFile (קובץ ב-articles/letters/), pdf (קובץ ב-pdfs/), או content (HTML בתוך הרשומה).
// link (לא חובה): כתובת המכתב באתר "הארץ". slug: מזהה באנגלית לכתובת הדף (article.html?id=<slug>).
const letters = [
];

function createLetterHTML(letter) {
    const paper = letter.link
        ? ` | <a href="${letter.link}" target="_blank" rel="noopener">המכתב באתר "הארץ"</a>`
        : '';
    const read = letter.pdf
        ? `<a href="${letter.pdf}" target="_blank">לקריאה (PDF)</a>`
        : `<a href="article.html?id=${letter.slug}">לקריאה</a>`;
    return `
        <div class="article">
            <h3><a href="${letter.pdf ? letter.pdf : 'article.html?id=' + letter.slug}">${letter.title}</a></h3>
            <div class="date">${formatDate(letter.date)}</div>
            <div class="description">${letter.description || ''}</div>
            ${read}${paper}
        </div>
    `;
}

if (document.getElementById('letters')) {
    document.getElementById('letters').innerHTML = letters.length
        ? letters.map(createLetterHTML).join('')
        : '<p class="empty-note">המכתבים יתפרסמו בקרוב.</p>';
}
