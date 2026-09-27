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

## הוספת פרק תנ"ך (פרשנות פרקי תנ"ך)

פרקי התנ"ך מנוהלים אוטומטית: קובץ Word אחד לכל פרק, סקריפט ממיר אותו ל-HTML ומעדכן את רשימת הפרקים.
דרוש `pandoc` (`brew install pandoc`) ו-`node`.

1. שמור את קובץ ה-Word בתיקיית הספר, בתוך תיקיית המקור (ברירת המחדל: `source-docx/`, או כל תיקייה אחרת עם `--src`), למשל:
   - `bible_chapters/bereshit/בראשית ג.docx`
   - `bible_chapters/שמות/פרק יב.docx` (שם התיקייה יכול להיות גם בעברית)
   - `bible_chapters/shmuel-a/10.docx`

   מספר הפרק נלקח משורת הציון בראש המסמך (למשל `בראשית ל"ז – נ'`), ואם אין כזו – משם הקובץ.
   מספרים בסוגריים כמו `(2)` מתעלמים. מסמך המכסה כמה פרקים (`לז-נ`) מוצג כטווח.

   המסמך צריך להיפתח בשלוש שורות קצרות (בכל סדר): כותרת המאמר, ציון הפרק, ושם המחבר.
   הכותרת תופיע ככותרת הפרק, והפסקה הראשונה שאחריהן תשמש כתקציר ברשימה.
2. הרץ מתיקיית האתר:
   ```
   node tools/build-tanach.js --src=/Users/navitpadan/workspace/michaelfedida/bible_chapters
   ```
   הסקריפט ממיר את כל הקבצים, כותב רק פרקים שהשתנו ל-`articles/tanach/<ספר>/<פרק>.html`,
   מעדכן את `tanach-data.js` ומדפיס דוח (כולל קבצים שלא זוהו או שאינם תואמים לשם הקובץ).
   אפשרויות: `--src=<תיקייה>`, `--only=<ספר>`, `--no-images`, `--sitemap`.
3. בדוק את הדוח, ואת הפרק בדפדפן (`python3 -m http.server 8000` ואז `http://localhost:8000/tanach.html`).
4. בצע commit ו-push לקבצים שנוצרו: `articles/tanach/`, `pictures/tanach/` (אם יש תמונות) ו-`tanach-data.js`.

תיקיית `source-docx/` אינה נשמרת ב-git (ראה `.gitignore`), כדי שקבצי ה-Word לא יפורסמו באתר. שמור עליהם גיבוי משלך.

**אין לערוך את `tanach-data.js` ידנית** – הוא נוצר מחדש בכל הרצה.

### מזהי הספרים (שמות התיקיות)

| ספר | מזהה | ספר | מזהה | ספר | מזהה |
|---|---|---|---|---|---|
| בראשית | `bereshit` | שופטים | `shoftim` | תהלים | `tehilim` |
| שמות | `shemot` | שמואל א | `shmuel-a` | משלי | `mishlei` |
| ויקרא | `vayikra` | שמואל ב | `shmuel-b` | איוב | `iyov` |
| במדבר | `bamidbar` | מלכים א | `melachim-a` | שיר השירים | `shir-hashirim` |
| דברים | `devarim` | מלכים ב | `melachim-b` | רות | `rut` |
| יהושע | `yehoshua` | ישעיהו | `yeshayahu` | איכה | `eicha` |
| | | ירמיהו | `yirmiyahu` | קהלת | `kohelet` |
| | | יחזקאל | `yechezkel` | אסתר | `esther` |
| | | תרי עשר | `hoshea`, `yoel`, `amos`, `ovadia`, `yona`, `micha`, `nachum`, `chavakuk`, `tzefania`, `chagai`, `zecharia`, `malachi` | דניאל, עזרא, נחמיה | `daniel`, `ezra`, `nechemia` |
| | | | | דברי הימים א/ב | `divrei-hayamim-a`, `divrei-hayamim-b` |

הרשימה המלאה, כולל מספר הפרקים בכל ספר, נמצאת ב-`tools/books.js`.

## מבנה הקבצים

- `index.html` – דף הבית: פאנל פרשנות התנ"ך ורשימת שאר המאמרים
- `tanach.html` – עמוד ספר: רשימת הפרקים של ספר אחד (`tanach.html?book=bereshit`)
- `article.html` – תצוגת מאמר בודד (PDF, HTML או פרק תנ"ך)
- `about.html` – דף אודות
- `style.css` – עיצוב האתר
- `script.js` – נתוני המאמרים הכלליים ולוגיקת הטעינה
- `tanach.js` – לוגיקת התצוגה של פרקי התנ"ך
- `tanach-data.js` – רשימת הספרים והפרקים (נוצר אוטומטית)
- `tools/` – סקריפט ההמרה (`build-tanach.js`) וטבלת הספרים (`books.js`)
- `pdfs/` – קבצי PDF של המאמרים
- `pictures/` – תמונות המאמרים (`pictures/tanach/` – תמונות שחולצו מפרקי התנ"ך)
- `articles/` – מאמרים בפורמט HTML (`articles/tanach/` – פרקי התנ"ך שהומרו)
- `source-docx/` – קבצי ה-Word המקוריים של הפרקים (לא נשמר ב-git)
