// Canonical Tanach book table used by tools/build-tanach.js.
// Order is the canonical order; `chapters` is the canonical chapter count.
// `aliases` are extra folder names the generator recognises (the id and the
// Hebrew name are always recognised, with or without geresh/gershayim).
module.exports = [
  // תורה
  { id: 'bereshit', name: 'בראשית', group: 'תורה', chapters: 50, aliases: ['Genesis'] },
  { id: 'shemot', name: 'שמות', group: 'תורה', chapters: 40, aliases: ['Exodus', 'shmot'] },
  { id: 'vayikra', name: 'ויקרא', group: 'תורה', chapters: 27, aliases: ['Leviticus'] },
  { id: 'bamidbar', name: 'במדבר', group: 'תורה', chapters: 36, aliases: ['Numbers'] },
  { id: 'devarim', name: 'דברים', group: 'תורה', chapters: 34, aliases: ['Deuteronomy', 'dvarim'] },

  // נביאים
  { id: 'yehoshua', name: 'יהושע', group: 'נביאים', chapters: 24, aliases: ['Joshua', 'yehusha', 'yehoshua'] },
  { id: 'shoftim', name: 'שופטים', group: 'נביאים', chapters: 21, aliases: ['Judges'] },
  { id: 'shmuel-a', name: 'שמואל א', group: 'נביאים', chapters: 31, aliases: ['שמו"א', 'שמואל 1', '1 Samuel', 'Samuel 1', 'shmuel-1', 'shmuel1', 'shmuel_aleph', 'shmuel-aleph'] },
  { id: 'shmuel-b', name: 'שמואל ב', group: 'נביאים', chapters: 24, aliases: ['שמו"ב', 'שמואל 2', '2 Samuel', 'Samuel 2', 'shmuel-2', 'shmuel2', 'shmuel_bet', 'shmuel-bet'] },
  { id: 'melachim-a', name: 'מלכים א', group: 'נביאים', chapters: 22, aliases: ['מל"א', 'מלכים 1', '1 Kings', 'Kings 1', 'melachim-1', 'melachim1', 'melachim_aleph', 'melachim-aleph'] },
  { id: 'melachim-b', name: 'מלכים ב', group: 'נביאים', chapters: 25, aliases: ['מל"ב', 'מלכים 2', '2 Kings', 'Kings 2', 'melachim-2', 'melachim2', 'melachim_bet', 'melachim-bet'] },
  { id: 'yeshayahu', name: 'ישעיהו', group: 'נביאים', chapters: 66, aliases: ['ישעיה', 'Isaiah', 'ishayahou', 'ishayahu', 'yeshayahou'] },
  { id: 'yirmiyahu', name: 'ירמיהו', group: 'נביאים', chapters: 52, aliases: ['ירמיה', 'Jeremiah'] },
  { id: 'yechezkel', name: 'יחזקאל', group: 'נביאים', chapters: 48, aliases: ['Ezekiel', 'yehezkel', 'yehezkiel'] },
  { id: 'hoshea', name: 'הושע', group: 'נביאים', chapters: 14, aliases: ['Hosea'] },
  { id: 'yoel', name: 'יואל', group: 'נביאים', chapters: 4, aliases: ['Joel'] },
  { id: 'amos', name: 'עמוס', group: 'נביאים', chapters: 9, aliases: [] },
  { id: 'ovadia', name: 'עובדיה', group: 'נביאים', chapters: 1, aliases: ['Obadiah'] },
  { id: 'yona', name: 'יונה', group: 'נביאים', chapters: 4, aliases: ['Jonah'] },
  { id: 'micha', name: 'מיכה', group: 'נביאים', chapters: 7, aliases: ['Micah'] },
  { id: 'nachum', name: 'נחום', group: 'נביאים', chapters: 3, aliases: ['Nahum'] },
  { id: 'chavakuk', name: 'חבקוק', group: 'נביאים', chapters: 3, aliases: ['Habakkuk'] },
  { id: 'tzefania', name: 'צפניה', group: 'נביאים', chapters: 3, aliases: ['Zephaniah'] },
  { id: 'chagai', name: 'חגי', group: 'נביאים', chapters: 2, aliases: ['Haggai'] },
  { id: 'zecharia', name: 'זכריה', group: 'נביאים', chapters: 14, aliases: ['Zechariah'] },
  { id: 'malachi', name: 'מלאכי', group: 'נביאים', chapters: 3, aliases: [] },

  // כתובים
  { id: 'tehilim', name: 'תהלים', group: 'כתובים', chapters: 150, aliases: ['תהילים', 'Psalms'] },
  { id: 'mishlei', name: 'משלי', group: 'כתובים', chapters: 31, aliases: ['Proverbs'] },
  { id: 'iyov', name: 'איוב', group: 'כתובים', chapters: 42, aliases: ['Job', 'eyov'] },
  { id: 'shir-hashirim', name: 'שיר השירים', group: 'כתובים', chapters: 8, aliases: ['Song of Songs'] },
  { id: 'rut', name: 'רות', group: 'כתובים', chapters: 4, aliases: ['Ruth'] },
  { id: 'eicha', name: 'איכה', group: 'כתובים', chapters: 5, aliases: ['Lamentations'] },
  { id: 'kohelet', name: 'קהלת', group: 'כתובים', chapters: 12, aliases: ['Ecclesiastes'] },
  { id: 'esther', name: 'אסתר', group: 'כתובים', chapters: 10, aliases: [] },
  { id: 'daniel', name: 'דניאל', group: 'כתובים', chapters: 12, aliases: [] },
  { id: 'ezra', name: 'עזרא', group: 'כתובים', chapters: 10, aliases: [] },
  { id: 'nechemia', name: 'נחמיה', group: 'כתובים', chapters: 13, aliases: ['Nehemiah'] },
  { id: 'divrei-hayamim-a', name: 'דברי הימים א', group: 'כתובים', chapters: 29, aliases: ['דברי הימים 1', '1 Chronicles', 'Chronicles 1'] },
  { id: 'divrei-hayamim-b', name: 'דברי הימים ב', group: 'כתובים', chapters: 36, aliases: ['דברי הימים 2', '2 Chronicles', 'Chronicles 2'] }
];
