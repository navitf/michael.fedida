// מכתבים למערכת "הארץ". רשומה אחת לכל מכתב, לפי סדר הפרסום (הישן ראשון).
// שדות: title, date (YYYY-MM-DD, תאריך הפרסום בעיתון), description (שורה-שתיים),
// ואחד מאלה: htmlFile (קובץ ב-articles/letters/), pdf (קובץ ב-pdfs/), או content (HTML בתוך הרשומה).
// link (לא חובה): כתובת המכתב באתר "הארץ". slug: מזהה באנגלית לכתובת הדף (article.html?id=<slug>).
const letters = [
    {
        "title": "תקציב לשמיטה",
        "date": "2014-06-18",
        "description": "מדוע אין המדינה צריכה לתקצב פיצוי לחקלאים שאינם מעבדים את אדמתם בשנת השמיטה.",
        "htmlFile": "articles/letters/2014-06-18-shmita-budget.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2014-06-17/ty-article/0000017f-db73-db5a-a57f-db7bf0330000",
        "slug": "letter-shmita-budget"
    },
    {
        "title": "איך לשקר בעזרת סטטיסטיקה",
        "date": "2020-05-31",
        "description": "לא מספר הקולות אלא מספר המנדטים קובע את גודלה של מפלגה: על טענת נתניהו שהליכוד זכה בהכי הרבה קולות בתולדות המדינה.",
        "htmlFile": "articles/letters/2020-05-31-lying-with-statistics.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2020-05-30/ty-article/.premium/0000017f-db0b-d4e1-a57f-fbcf65a00000",
        "slug": "letter-lying-with-statistics"
    },
    {
        "title": "מתנות זה לא",
        "date": "2022-07-15",
        "description": "על העטיפה שהופכת מוצר למתנה, ומדוע הסיגרים והשמפניות בתיק 1000 אינם מתנות.",
        "htmlFile": "articles/letters/2022-07-15-not-gifts.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2022-07-14/ty-article-opinion/.premium/00000181-fbd4-dfa9-a5b7-fbdff6e80000",
        "slug": "letter-not-gifts"
    },
    {
        "title": "ממי שתייה ועד חשמל",
        "date": "2022-09-19",
        "description": "תורת חיים מחייבת ידע מדעי וטכנולוגי, ולכן התנגדות החרדים ללימודי ליבה נשענת על היפרדות מיתר העם.",
        "htmlFile": "articles/letters/2022-09-19-from-water-to-electricity.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2022-09-18/ty-article-opinion/.premium/00000183-4fac-d54c-a9cb-dfefeabf0000",
        "slug": "letter-from-water-to-electricity"
    },
    {
        "title": "משל הביצה הכשרה",
        "date": "2022-12-16",
        "description": "לא לימוד התלמוד מחדד את השכל, אלא רק בעלי שכל חד מסוגלים ללמוד תלמוד; על גיוס תלמידי הישיבות ושילוב תורה ועבודה.",
        "htmlFile": "articles/letters/2022-12-16-kosher-egg.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2022-12-15/ty-article-opinion/.premium/00000185-14f8-dfc4-aff7-fff9b5e30000",
        "slug": "letter-kosher-egg"
    },
    {
        "title": "שלא כולם יתקבלו לישיבה",
        "date": "2023-08-20",
        "description": "אם משווים תלמידי ישיבה לסטודנטים, נדרשים גם מבחני קבלה: \"אחד מאלף\" לפי רש\"י על קהלת.",
        "htmlFile": "articles/letters/2023-08-20-not-everyone-yeshiva.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2023-08-19/ty-article-opinion/.premium/0000018a-0e1e-d18f-a3fb-1fdfbe310000",
        "slug": "letter-not-everyone-yeshiva"
    },
    {
        "title": "על התיאולוגיה הדרעית",
        "date": "2024-10-22",
        "description": "על התיאולוגיה של אריה דרעי, תפילות מול שירות בצבא, והצו ליהושע \"והגית בו יומם ולילה\".",
        "htmlFile": "articles/letters/2024-10-22-deri-theology.html",
        "link": "https://www.haaretz.co.il/opinions/letters/2024-10-21/ty-article-opinion/.premium/00000192-ae2b-d049-a3db-bf7f6e970000",
        "slug": "letter-deri-theology"
    }
];

function letterDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${d}.${m}.${y}`;
}

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
            <div class="date">${letterDate(letter.date)}</div>
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
