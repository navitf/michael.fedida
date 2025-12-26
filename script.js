// Articles data - add new articles here
const articles = [
    {
        title: "\"מקוה ישראל\" מאת ישראל קושטא – אנטומיה של\n" +
          "מקראה",
        date: "",
        description: "המחקר דן בהרחבה באנתולוגיה \"מקוה ישראל\" של הרב ישראל קושטא (ליוורנו 1851). הספר\n" +
          "נמנה עם המקראות הראשונות בעברית לילדים בעולם החינוך היהודי. ",
        pdf: "pdfs/mikve.pdf",
        image: "pictures/mikve.png",
        slug: "mikve"
    },
    {
        title: "הגדה של פסח: עבדות בתוך חירות או מה נשתנה וחד גדיא",
        date: "",
        description: "ניתוח מוטיב הגלות והגאולה בהגדה של פסח, המשווה בין השעבוד בעבר ליציאת מצרים לבין הגלות בהווה והערגה לגאולה משיחית",
        pdf: "pdfs/hagada.pdf",
        image: "pictures/hagada.jpg",
        slug: "hagada"
    },
    {
        title: "אגדת האחים ומקום המקדש",
        date: "",
        description: "אודות אגדת האחים ומקורותיה השונים",
        pdf: "pdfs/haachim.pdf",
        image: "pictures/hahachim.jpg",
        slug: "haachim"
    },
    {
        title: "האותות והאתונות - שמואל א' י'",
        date: "",
        description: "ניתוח מעמיק של סיפור האותות ששמואל נתן לשאול והמשמעות הסמלית של האתונות",
        htmlFile: "articles/haotot_atonot.html",
        image: "pictures/atonot.jpg",
        slug: "haotot-atonot"
    },
    {
        title: "על הרי גלבוע - שמואל ב' א'",
        date: "",
        description: "ניתוח הבלדה של טשרניחובסקי על הקרב האחרון של שאול: המבנה המתמטי של השיר, השפעת קינת דוד, ותפקיד התקיעה בשופר",
        htmlFile: "articles/gilboa.html",
        image: "pictures/gilboa.jpg",
        slug: "gilboa"
    },
    {
        title: "טשרניחובסקי בעין דור",
        date: "",
        description: "הסיפור המקראי על שאול ובעלת האוב בראי הבלדה ״בעין דור״ מאת שאול טשרניחובסקי",
        htmlFile: "articles/ein_dor.html",
        // image: "pictures/ein_dor.jpg",
        slug: "ein-dor-article"
    },
    {
        title: "ניסוי דידקטי | ירמיהו ל\"ה",
        date: "",
        description: "ניתוח הסיפור על בני רכב בירמיהו ל\"ה: נאמנות למצוות אבותיהם, אורח חיים נוודי מול חברה עירונית, והמסר הדידקטי של ירמיהו לעם ישראל",
        htmlFile: "articles/nisui_didacti_yirmiyaho.html",
        image: "pictures/nisui_didacti.jpg",
        slug: "nisui-didacti-article"
    },
    {
        title: "מים לדוד ואוריה החתי - שמואל ב' כ\"ג",
        date: "",
        description: "ההנגדה בין דוד ששפך מים שהושגו בדם לבין דוד ששפך את דם אוריה החתי: ניתוח רשימת הגיבורים ומעשי הגבורה בשמואל ב' כ\"ג",
        htmlFile: "articles/david_uria.html",
        image: "pictures/david_uria.jpg",
        slug: "david-uria"
    },
    {
        title: "פלימו והשטן - החטא וענשו",
        date: "",
        description: "פרשנות חדשה לסיפור התלמודי על פלימו והשטן: על חשיבות קבלת העני בכבוד, הסכנה ביראת חטא מופרזת, והלקח שהשטן מלמד על אהבת הזולת",
        htmlFile: "articles/plimo_satan.html",
        image: "pictures/plimo.jpg",
        slug: "plimo-satan"
    },
    {
        title: "הנער בן מאה שנה ימות - ישעיהו ס\"ה",
        date: "",
        description: "על החזון האוטופי בישעיהו ס\"ה: היעלמות המוות בטרם עת, חברה של צדיקים, והשלום בין האדם ועולם החי",
        htmlFile: "articles/100years_boy.html",
        image: "pictures/100years_boy.jpg",
        slug: "100years-boy"
    },
    {
        title: "אל רחום וחנון - תהלים פ\"ו",
        date: "",
        description: "על הספק והריחוק מאלהים במזמור פ\"ו: המשורר מתפלל לישועה אך אינו בטוח שאלהים מאזין, בניגוד לביטחון המוחלט במזמור כג",
        htmlFile: "articles/merciful_god.html",
        image: "pictures/merciful_god.jpg",
        slug: "merciful-god"
    },
    {
        title: "מבט אחר על ספר איוב",
        date: "",
        description: "",
        pdf: "pdfs/eyov.pdf",
        slug: "eyov"
    }
];

function formatDate(dateStr) {
    if (!dateStr || isNaN(new Date(dateStr))) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createArticleHTML(article) {
    const links = article.pdf 
        ? `<a href="${article.pdf}" target="_blank">View PDF</a> | <a href="${article.pdf}" download>Download PDF</a>`
        : `<a href="article.html?id=${article.slug}">Read Article</a>`;
    
    const thumbnail = article.image 
        ? `<img src="${article.image}" alt="${article.title}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 10px; margin-left: 20px; float: left;">`
        : '';
    
    return `
        <div class="article">
            ${thumbnail}
            <h3><a href="article.html?id=${article.slug}">${article.title}</a></h3>
            <div class="date">${formatDate(article.date)}</div>
            <div class="description">${article.description}</div>
            ${links}
        </div>
    `;
}

// Load all articles on homepage
if (document.getElementById('articles')) {
    document.getElementById('articles').innerHTML = 
        articles.map(article => createArticleHTML(article)).join('');
}
