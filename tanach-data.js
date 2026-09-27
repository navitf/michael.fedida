// נוצר אוטומטית על ידי tools/build-tanach.js (2026-09-27) — אין לערוך ידנית.
// כדי לעדכן: הניחו קובץ Word בתיקיית הספר והריצו: node tools/build-tanach.js --src=<תיקיית המקור>
const TANACH_BOOKS = [
  {"id":"bereshit","name":"בראשית","group":"תורה","chapters":50}
];
const TANACH_CHAPTERS = [
  {"bookId":"bereshit","chapter":3,"slug":"bereshit-3","htmlFile":"articles/tanach/bereshit/3.html","title":"כי מעפר באת...","blurb":"מה המשמעות של האמונה בספר בראשית שהאדם נוצר מעפר?"},
  {"bookId":"bereshit","chapter":21,"slug":"bereshit-21","htmlFile":"articles/tanach/bereshit/21.html","title":"מי אתה אברהם?","blurb":"המעיין היטב בביוגרפיה של אברהם ימצא שדמותו משולשת פנים: מצד אחד הוא מתואר כמצביא מהולל כאילו היה שר צבא של אומה שלמה."},
  {"bookId":"bereshit","chapter":22,"slug":"bereshit-22","htmlFile":"articles/tanach/bereshit/22.html","title":"לפשר השתיקה","blurb":"פרשנים רבים מאז חז\"ל עמדו על כך שאברהם קיבל את צו העקידה בשתיקה גמורה, ללא כל סימן או רמז לביקורת כלשהי על הצו."},
  {"bookId":"bereshit","chapter":23,"slug":"bereshit-23","htmlFile":"articles/tanach/bereshit/23.html","title":"מו\"מ על אחוזת קבר","blurb":"כיסיו של אברהם מלאים בהבטחות אלוהיות שזרעו יירש את ארץ כנען."},
  {"bookId":"bereshit","chapter":24,"slug":"bereshit-24","htmlFile":"articles/tanach/bereshit/24.html","title":"וגם גמליך אשקה","blurb":"יש בפרק שתי גירסאות על בחירת רבקה ככלה ליצחק: גירסת המספר המקראי וגירסת אליעזר כפי שהוא סיפר למשפחת רבקה."},
  {"bookId":"bereshit","chapter":25,"slug":"bereshit-25","htmlFile":"articles/tanach/bereshit/25.html","title":"מן האדום האדום הזה","blurb":"המאבק על הבכורה בין ישמעאל ועשיו חוזר על עצמו אצל עשיו ויעקב."},
  {"bookId":"bereshit","chapter":27,"slug":"bereshit-27","htmlFile":"articles/tanach/bereshit/27.html","title":"יעקב הרמאי?","blurb":"עד כמה חמורה המרמה של יעקב בפרשת ההתחזות לעשיו?"},
  {"bookId":"bereshit","chapter":28,"slug":"bereshit-28","htmlFile":"articles/tanach/bereshit/28.html","title":"חלום יעקב","blurb":"יעקב ברח מהארץ לחרן, בעקבות חשש של אמו שעשיו יממש את כוונתו לפגוע בו על שגנב לו את הברכה."},
  {"bookId":"bereshit","chapter":29,"slug":"bereshit-29","htmlFile":"articles/tanach/bereshit/29.html","title":"צדק פואטי","blurb":"יעקב מגיע לחרן חסר כל, כעבריין נמלט."},
  {"bookId":"bereshit","chapter":30,"slug":"bereshit-30","htmlFile":"articles/tanach/bereshit/30.html","title":"לאה ורחל","blurb":"הקורא את פרשת היחסים בקרב המשולש: יעקב, רחל ולאה (והשפחות) חש שהוא נקלע לתחרות על אהבה וילדים ובמגרש לוח אלקטרוני ענק שמתעדכן עם מספר הילדים לכל אשה."},
  {"bookId":"bereshit","chapter":31,"slug":"bereshit-31","htmlFile":"articles/tanach/bereshit/31.html","title":"רחל והתרפים","blurb":"לרחל לא היו ייסורי מצפון על שגנבה את התרפים של אביה, כי חשבה כמו יעקב שלבן ניצל את כוח העבודה של יעקב."},
  {"bookId":"bereshit","chapter":32,"slug":"bereshit-32-33","htmlFile":"articles/tanach/bereshit/32-33.html","title":"ויאבק איש עמו","blurb":"המאבק של יעקב עם המלאך הוא מאוד אניגמטי.","chapterEnd":33},
  {"bookId":"bereshit","chapter":34,"slug":"bereshit-34","htmlFile":"articles/tanach/bereshit/34.html","title":"נבלה בישראל","blurb":"להלן מספר התייחסויות לפרשת האונס של דינה."},
  {"bookId":"bereshit","chapter":35,"slug":"bereshit-35","htmlFile":"articles/tanach/bereshit/35.html","title":"חטאו של ראובן","blurb":"כל חטאו של ראובן מסופר לאחר מות רחל והוא נדחס לפסוק אחד בלבד: \"וילך ראובן וישכב את בלהה פילגש אביו וישמע ישראל\"."},
  {"bookId":"bereshit","chapter":37,"slug":"bereshit-37","htmlFile":"articles/tanach/bereshit/37.html","title":"בעל החלומות","blurb":"פרקנו פותח בסאגה ארוכה, שתימשך עד סוף ספר בראשית."},
  {"bookId":"bereshit","chapter":37,"slug":"bereshit-37-50","htmlFile":"articles/tanach/bereshit/37-50.html","title":"השגחה ומקריות","blurb":"אופן ההתערבות של אלהים בחיי האדם בספר בראשית (מנקודת הראות של המספר) עובר שינוי בחטיבת הסיפורים על יוסף ואחיו.","chapterEnd":50},
  {"bookId":"bereshit","chapter":38,"slug":"bereshit-38","htmlFile":"articles/tanach/bereshit/38.html","title":"שאלה לעורך","blurb":"כל מי שקורא את פרשת תמר ויהודה יבחין מן הסתם שהיא קוטעת את רצף הסיפור בסאגה של יוסף ואחיו."},
  {"bookId":"bereshit","chapter":44,"slug":"bereshit-44","htmlFile":"articles/tanach/bereshit/44.html","title":"ולא זכר...","blurb":"יוסף פתר את החלומות של פרעה בהיותו בן 30."},
  {"bookId":"bereshit","chapter":48,"slug":"bereshit-48","htmlFile":"articles/tanach/bereshit/48.html","title":"ואני בבואי מפדן","blurb":"\"ואני בבואי מפדן מתה עלי רחל בארץ כנען בדרך...ואקברה שם בדרך אפרת\"."}
];
