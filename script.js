// Articles data - add new articles here
const articles = [
    {
        title: "טשרניחובסקי בעין דור",
        date: "",
        description: "הסיפור המקראי על שאול ובעלת האוב בראי הבלדה ״בעין דור״ מאת שאול טשרניחובסקי",
        htmlFile: "articles/ein_dor.html",
        slug: "ein-dor-article"
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
        slug: "haachim"
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
    
    return `
        <div class="article">
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
