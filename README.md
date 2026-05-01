# אתר המאמרים של מיכאל פדידה

אתר מינימלי ואלגנטי לפרסום מאמריו של מיכאל פדידה בנושאי תנ"ך, ספרות ומחשבת ישראל, עם תמיכה בצפייה ב-PDF.

## הוספת מאמר חדש

1. העלה את קובץ ה-PDF לתיקיית `pdfs/`
2. אם יש תמונה למאמר, העלה אותה לתיקיית `pictures/`
3. ערוך את `script.js` והוסף רשומה חדשה למערך `articles`:
   ```javascript
   {
       title: "שם המאמר",
       date: "",
       description: "תיאור קצר של המאמר.",
       pdf: "pdfs/your-article.pdf",
       image: "pictures/your-image.jpg",
       slug: "article-slug"
   }
   ```
4. בצע commit ו-push

## מבנה הקבצים

- `index.html` – דף הבית עם רשימת כל המאמרים
- `article.html` – תצוגת מאמר בודד עם PDF
- `about.html` – דף אודות
- `style.css` – עיצוב האתר
- `script.js` – נתוני המאמרים ולוגיקת הטעינה
- `pdfs/` – קבצי PDF של המאמרים
- `pictures/` – תמונות המאמרים
- `articles/` – מאמרים בפורמט HTML
