// Articles data - add new articles here
// עבודת המאסטר, מוצגת בדף הבית תחת כותרת משלה
const masters = {
    title: "הדינמיקה של קריירות פעילים בקיבוץ צעיר",
    date: "",
    description: "עבודת המאסטר של מיכאל פדידה בהדרכת ד\"ר משה שוקד ופרופסור עמנואל מרקס, אפריל 1972 (סריקה של העבודה המקורית).",
    pdf: "pdfs/masters.pdf",
    image: "",
    slug: "masters-thesis"
};

// עבודת הדוקטורט, מוצגת בדף הבית תחת כותרת משלה
const dissertation = {
    title: "Honor, Kinship and Marriage in Arab Culture – כבוד, שארות ונישואין בתרבות הערבית",
    date: "",
    description: "עבודת הדוקטור של מיכאל פדידה במחלקה לאנתרופולוגיה של אוניברסיטת שיקגו, מארס 1984 (באנגלית; סריקה של כתב היד המקורי).",
    pdf: "pdfs/phd.pdf",
    image: "",
    slug: "phd-dissertation"
};

const articles = [
    // {
    //     title: "טעויות מכוונות כמכשיר פואטי: עיון מחודש בציטוטי המקורות בסיפור \"שני תלמידי חכמים שהיו בעירנו\"",
    //     date: "",
    //     description: "המאמר מראה כי הטעויות בציטוטי המקורות בסיפורו של עגנון אינן שגיאות מקריות אלא בחירה פואטית מכוונת, המשמשת ככלי ליצירת דרמה ספרותית וכמעשה כפרה סמוי של ר' שלמה כלפי ר' פנחס.",
    //     pdf: "pdfs/shnei_talmidei_hachamim.pdf",
    //     image: "",
    //     slug: "shnei-talmidei-hachamim"
    // },
    {
        title: "\"מקוה ישראל\" מאת ישראל קושטא – אנטומיה של\n" +
          "מקראה",
        date: "",
        description: "המחקר דן בהרחבה באנתולוגיה \"מקוה ישראל\" של הרב ישראל קושטא (ליוורנו 1851). הספר\n" +
          "נמנה עם המקראות הראשונות בעברית לילדים בעולם החינוך היהודי. ",
        pdf: "pdfs/mikve_israel_kosta.pdf",
        image: "pictures/mikve_israel_kosta.jpg",
        slug: "mikve"
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
        title: "הגדה של פסח: עבדות בתוך חירות או מה נשתנה וחד גדיא",
        date: "",
        description: "ניתוח מוטיב הגלות והגאולה בהגדה של פסח, המשווה בין השעבוד בעבר ליציאת מצרים לבין הגלות בהווה והערגה לגאולה משיחית",
        pdf: "pdfs/hagada.pdf",
        image: "pictures/hagada.jpg",
        slug: "hagada"
    },
    {
            title: "חד גדיא",
            date: "",
            description: "ניתוח חד גדיא כסיפור המציג שרשרת של חוסר צדק ואי-היגיון",
            pdf: "pdfs/had_gadya.pdf",
            image: "pictures/had_gadya_img.jpeg",
            slug: "had_gadya"
    },
    {
            title: "מבט אחר על ספר איוב",
            date: "",
            description: "",
            pdf: "pdfs/eyov.pdf",
            slug: "eyov"
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
        title: "על הרי גלבוע - שמואל ב' א'",
        date: "",
        description: "ניתוח הבלדה של טשרניחובסקי על הקרב האחרון של שאול: המבנה המתמטי של השיר, השפעת קינת דוד, ותפקיד התקיעה בשופר",
        htmlFile: "articles/gilboa.html",
        image: "pictures/gilboa.jpg",
        slug: "gilboa"
    },
    {
            title: "לפשר השיר \"תפילה\" של אברהם חלפי",
            date: "",
            description: "קריאה בשיר \"תפילה\" של אברהם חלפי כביטוי לחילון שמעניק משמעות חדשה למונחים דתיים.",
            htmlFile: "articles/tfila_halfi.html",
            image: "",
            slug: "tfila-halfi"
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
        title: "אלעזר בן ערך יוצא לחיות בשלושה עולמות",
        date: "",
        description: "על אלעזר בן ערך, תלמידו של רבן יוחנן בן זכאי, ועל שלושה מקורות המציירים שלושה עולמות שונים שבהם יכול היה לחיות לאחר מות רבו.",
        htmlFile: "articles/elazar_ben_arach.html",
        image: "",
        slug: "elazar-ben-arach"
    },
    {
        title: "על הדימוי \"כהררים התלויים בשערה\"",
        date: "",
        description: "פירוש לדימוי \"כהררים התלויים בשערה\" שבמשנת חגיגה, על רקע הביטויים \"סיני\" ו\"עוקר הרים\" ומעמדו של ההר במקרא ובמדרש.",
        htmlFile: "articles/al_hadimuy.html",
        image: "",
        slug: "keharerim-hatluyim-besaara"
    },
    {
        title: "הערות גולמיות לבבא קמא – פרק ח",
        date: "",
        description: "הערות על מבנהו של פרק החובל בבבא קמא, על ההבדל בין נזקי אדם לנזקי שור ועל חמשת ראשי הפיצוי.",
        htmlFile: "articles/hachovel_notes.html",
        image: "",
        slug: "hachovel-notes"
    },
    {
        title: "על צער ועל יחסיות – הערות על בבא קמא על המשנה הראשונה של החובל",
        date: "",
        description: "הערות ביקורתיות על טיעוני חז\"ל בפתיחת פרק החובל: פיצוי על צער, \"עין תחת עין\" ושאלת היחסיות.",
        htmlFile: "articles/tzaar_yachasiut.html",
        image: "",
        slug: "tzaar-yachasiut"
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

if (document.getElementById('masters')) {
    document.getElementById('masters').innerHTML = createArticleHTML(masters);
}

if (document.getElementById('dissertation')) {
    document.getElementById('dissertation').innerHTML = createArticleHTML(dissertation);
}

// Load all articles on homepage
if (document.getElementById('articles')) {
    document.getElementById('articles').innerHTML = 
        articles.map(article => createArticleHTML(article)).join('');
}
