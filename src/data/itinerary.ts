export type Stop = {
  time?: string;
  title: string;
  detail?: string;
  note?: string;
  warn?: string;
  star?: boolean;
  lat?: number;
  lng?: number;
  query?: string;
};

export type Day = {
  id: string;
  date: string;
  weekday: string;
  theme: string;
  star?: boolean;
  closed?: string;
  open?: string;
  warn?: string;
  stops: Stop[];
  alternatives: string[];
};

export const days: Day[] = [
  {
    id: "sat",
    date: "19.9",
    weekday: "שבת",
    theme: "הגעה",
    stops: [
      {
        time: "לפני 14:00",
        title: "שוק הפשפשים בנשמרקט",
        detail: "רק בשבת · 8 דק' מהמלון. אם הנחיתה מוקדמת",
        lat: 48.1968,
        lng: 16.3627,
        query: "Naschmarkt Flohmarkt Wien",
      },
      {
        time: "16:00",
        title: "kaffemik",
        detail: "Zollergasse 5 · third wave, 5 דק' מהמלון",
        lat: 48.199,
        lng: 16.3506,
        query: "kaffemik Zollergasse 5 Wien",
      },
      {
        time: "17:30",
        title: "מריהילפר שטראסה",
        detail: "החנויות פתוחות עד 18:00. מחר הכל סגור",
        lat: 48.1988,
        lng: 16.3492,
        query: "Mariahilfer Strasse Wien",
      },
      {
        time: "19:30",
        title: "Plachutta Wollzeile 38",
        detail: "טאפלשפיץ בסיר נחושת. הזמן מראש",
        warn:
          "מרק ראשון עם הלחם ועצם המח, אחר כך הבשר. מנה מספיקה לשניים. בלי טרטר",
        lat: 48.2087,
        lng: 16.3775,
        query: "Plachutta Wollzeile 38 Wien",
      },
    ],
    alternatives: [
      "Gasthaus zu den 3 Hacken (ביזל מ‑1618, חצר)",
      "Meissl & Schadn (שניצל עגל, אולם מפואר)",
      "Skopik & Lohn (מודרני, קליל, מ‑18:00)",
    ],
  },
  {
    id: "sun",
    date: "20.9",
    weekday: "ראשון",
    theme: "אמנות, יין וקונצרט",
    star: true,
    warn: "כל החנויות סגורות. מוזיאונים ומסעדות פתוחים",
    stops: [
      {
        time: "9:00",
        title: "בלוודרה",
        detail: "הנשיקה של קלימט · ריק בשעה הזו",
        lat: 48.1915,
        lng: 16.3809,
        query: "Belvedere Wien",
      },
      {
        time: "11:00",
        title: "Beethovengang",
        detail: "שביל שטוח לאורך פלג מים, 2 ק\"מ · U4 היילגנשטאדט + אוטובוס",
        lat: 48.2495,
        lng: 16.335,
        query: "Beethovengang Wien",
      },
      {
        time: "13:30",
        title: "הויריגר בנוסדורף",
        detail: "מרק דלעת עם שמן גרעיני דלעת",
        warn: "Sturm אלכוהולי → Traubenmost לאשתך",
        lat: 48.2585,
        lng: 16.348,
        query: "Heuriger Nussdorf Wien",
      },
      {
        time: "15:30 / 19:00",
        title: "50 הפסנתרים · קונצרטהאוס",
        detail: "שתי הופעות, 44–59 יורו",
        star: true,
        lat: 48.2003,
        lng: 16.3773,
        query: "Wiener Konzerthaus",
      },
      {
        time: "ערב",
        title: "Gerstner",
        detail: "Kärntner Str. 51 · היחיד ברמה הזו שפתוח היום, עד 22:00",
        lat: 48.2039,
        lng: 16.3705,
        query: "Gerstner Kärntner Strasse 51 Wien",
      },
    ],
    alternatives: [
      "Palmenhaus (חממת זכוכית, עד 23:00)",
      "Kahlenberg (נוף וכרמים)",
      "סטדטפארק",
      "לאופולד / אלברטינה בגשם",
    ],
  },
  {
    id: "mon",
    date: "21.9",
    weekday: "שני",
    theme: "טבע ושוק",
    closed:
      "KHM, סצסיון, Wien Museum, יוזפינום, נארנטורם, גלריות, Schnitzelwirt, Staud's",
    open: "Prunksaal, Schatzkammer, Café Central, Zuckerlwerkstatt, אלברטינה, לאופולד",
    stops: [
      {
        time: "9:00",
        title: "Lainzer Tiergarten",
        detail:
          "חזירי בר על השביל · U4 היצינג + אוטובוס 60B · שטוח, 20 דק' לווילה הרמס",
        star: true,
        lat: 48.1746,
        lng: 16.2312,
        query: "Lainzer Tiergarten Wien",
      },
      {
        time: "13:00",
        title: "Brunnenmarkt",
        detail: "U6 Josefstädter Str. · בקצה הצפוני Yppenplatz – אוכל טוב",
        lat: 48.2098,
        lng: 16.3349,
        query: "Brunnenmarkt Yppenplatz Wien",
      },
      {
        time: "15:30",
        title: "Prunksaal",
        detail: "Josefsplatz 1 · אולם ברוקי מ‑1726, 80 מ' אורך, גלובוסים ענקיים",
        star: true,
        lat: 48.2064,
        lng: 16.366,
        query: "Prunksaal Josefsplatz 1 Wien",
      },
      {
        time: "16:45",
        title: "Café Central",
        detail: "Herrengasse 14 · 4 דק' משם. הזמן מראש",
        lat: 48.2103,
        lng: 16.3654,
        query: "Cafe Central Herrengasse 14 Wien",
      },
      {
        time: "17:30",
        title: "Zuckerlwerkstatt",
        detail: "Herrengasse 6 · סוכריות ביד מולך. עד 18:00",
        lat: 48.2098,
        lng: 16.366,
        query: "Zuckerlwerkstatt Herrengasse 6 Wien",
      },
      {
        time: "20:00",
        title: "Figlmüller Wollzeile",
        detail: "הזמן עכשיו. יש שניצל עגל. סלט תפו\"א עם שמן דלעת חובה",
        star: true,
        lat: 48.2087,
        lng: 16.3745,
        query: "Figlmüller Wollzeile Wien",
      },
    ],
    alternatives: [
      "Schatzkammer (כתרי הקיסרות – סגור מחר, אז היום או בכלל לא)",
      "Café Landtmann (הקפה האמיתי של פרויד)",
      "Meissl & Schadn / Pöschl",
      "Hundertwasserhaus + Kunst Haus Wien",
    ],
  },
  {
    id: "tue",
    date: "22.9",
    weekday: "שלישי",
    theme: "עיר, חנויות, גלריות",
    closed: "Schatzkammer, לאופולד",
    stops: [
      {
        time: "8:00",
        title: "Oberlaa",
        detail: "Neuer Markt 16 · Kardinalschnitte – מה שוינאים באמת קונים",
        lat: 48.2049,
        lng: 16.3703,
        query: "Oberlaa Neuer Markt 16 Wien",
      },
      {
        time: "9:00",
        title: "KHM",
        detail: "מגדל בבל של ברויגל, ורמיר, קרוואג'ו · שעתיים",
        lat: 48.2038,
        lng: 16.3616,
        query: "Kunsthistorisches Museum Wien",
      },
      {
        time: "12:00",
        title: "שעון האנקר",
        detail: "Hoher Markt · 12 דמויות בתהלוכה, בדיוק ב‑12:00",
        lat: 48.2113,
        lng: 16.3729,
        query: "Ankeruhr Hoher Markt Wien",
      },
      {
        time: "12:30",
        title: "Schönbichler → Haas & Haas",
        detail: "Wollzeile 4 (תה מ‑1870) · Stephansplatz 4 (בית התה)",
        lat: 48.2085,
        lng: 16.3735,
        query: "Schönbichler Wollzeile 4 Wien",
      },
      {
        time: "14:00",
        title: "Altmann & Kühne · Julius Meinl · Lobmeyr",
        detail: "ב‑Lobmeyr עלה לקומה 3 – מוזיאון זכוכית",
        lat: 48.2091,
        lng: 16.3699,
        query: "Altmann & Kühne Graben Wien",
      },
      {
        time: "15:00",
        title: "קונצרט עוגב חינם · פטרסקירכה",
        detail: "30 דק'",
        star: true,
        lat: 48.2088,
        lng: 16.3699,
        query: "Peterskirche Wien",
      },
      {
        time: "16:30",
        title: "Gegenbauer",
        detail: "נשמרקט 111 · חומץ אומנותי, טעימות של הכל + שמן דלעת. עד 18:00",
        lat: 48.198,
        lng: 16.3635,
        query: "Gegenbauer Naschmarkt Wien",
      },
      {
        time: "17:15",
        title: "Vollpension + 3 גלריות",
        detail: "באותו רחוב – Schleifmühlgasse",
        lat: 48.1966,
        lng: 16.3651,
        query: "Vollpension Schleifmühlgasse Wien",
      },
      {
        time: "20:00",
        title: "Schnitzelwirt",
        detail: "Neubaugasse 52 · 6 דק' מהמלון, מנות ענק",
        lat: 48.1975,
        lng: 16.3486,
        query: "Schnitzelwirt Neubaugasse 52 Wien",
      },
    ],
    alternatives: [
      "Demel (קייזרשמארן מולך)",
      "Café Hawelka (Buchteln בערב)",
      "סצסיון (פריז בטהובן)",
      "Supersense (מקליטים ויניל)",
      "Café Sperl",
    ],
  },
  {
    id: "wed",
    date: "23.9",
    weekday: "רביעי",
    theme: "טבעוני + אופרה",
    star: true,
    warn: "טבעוני נסגר ב‑22:00, אופרה נגמרת ב‑22:15. תאכל לפני",
    stops: [
      {
        time: "10:00",
        title: "נארנטורם",
        detail: "פתוח רק היום אצלכם · 10:00–17:00",
        star: true,
        lat: 48.2166,
        lng: 16.351,
        query: "Narrenturm Wien",
      },
      {
        time: "12:30",
        title: "Der Wiener Deewan",
        detail: "400 מ' משם · קאריז טבעוניים, שלם כמה שבא לך",
        lat: 48.2148,
        lng: 16.3557,
        query: "Der Wiener Deewan Wien",
      },
      {
        time: "14:30",
        title: "תעלת הדנובה",
        detail: "הליכה שטוחה, גרפיטי",
        lat: 48.213,
        lng: 16.379,
        query: "Donaukanal Wien",
      },
      { time: "15:30", title: "מנוחה" },
      {
        time: "17:00",
        title: "Swing Kitchen",
        detail: "Schwedenplatz (או Yamm! לאוסטרי‑טבעוני)",
        lat: 48.2116,
        lng: 16.379,
        query: "Swing Kitchen Schwedenplatz Wien",
      },
      {
        time: "19:00",
        title: "שטאטסאופר",
        detail: "La clemenza di Tito",
        star: true,
        lat: 48.203,
        lng: 16.369,
        query: "Wiener Staatsoper",
      },
    ],
    alternatives: [
      "יוזפינום (דגמי שעווה, קל יותר)",
      "TIAN (מישלן צמחוני, ⚠️ מתנגש עם האופרה)",
      "Harvest",
      "Hundertwasserhaus",
    ],
  },
  {
    id: "thu",
    date: "24.9",
    weekday: "חמישי",
    theme: "יציאה",
    stops: [
      {
        time: "7:30",
        title: "Joseph Brot",
        lat: 48.202,
        lng: 16.38,
        query: "Joseph Brot Wien",
      },
      {
        time: "10:00",
        title: "בית הפרפרים",
        detail: "20 דק'",
        lat: 48.2044,
        lng: 16.367,
        query: "Schmetterlinghaus Wien",
      },
      {
        time: "10:00",
        title: "Demel",
        lat: 48.2091,
        lng: 16.369,
        query: "Demel Kohlmarkt Wien",
      },
      {
        title: "אופציה ליום שלם: ברטיסלבה",
        detail:
          "Twin City Liner, 75 דק', מ‑28 יורו. עובר בפארק הלאומי Donau-Auen",
        warn: "דרכונים",
      },
    ],
    alternatives: [],
  },
];

export const bookings = [
  "קונצרטהאוס 20.9",
  "אופרה 23.9",
  "Figlmüller",
  "Plachutta",
  "Café Central",
];

export const foodList: { title: string; items: { name: string; text: string }[] }[] = [
  {
    title: "מנות עיקריות",
    items: [
      {
        name: "Wiener Schnitzel",
        text: "עגל מרודד. אם זה חזיר זה נקרא \"Schnitzel Wiener Art\". מוגש עם לימון וסלט תפוחי אדמה",
      },
      {
        name: "Tafelspitz",
        text: "בקר מבושל בסיר נחושת עם מרק, עצם מח, רוטב עירית וחזרת בתפוחים. המנה של פרנץ יוזף",
      },
      { name: "Gulasch", text: "גולש וינאי, סמיך, עם בצל וכמון. שונה מההונגרי" },
      { name: "Backhendl", text: "עוף מטוגן בציפוי, קלאסיקה של הויריגר" },
      { name: "Beuschel", text: "ראגו ריאות ולב עם כופתה. הכי אותנטי, לא לכולם" },
      { name: "Käsespätzle", text: "אטריות ביצים עם גבינה ובצל מטוגן. הנחמה" },
      { name: "Erdäpfelgulasch", text: "גולש תפוחי אדמה, טבעוני לרוב" },
    ],
  },
  {
    title: "עונתי – ספטמבר",
    items: [
      {
        name: "Zwetschkenknödel",
        text: "כופתאות שזיף מבצק תפו\"א בפירורי לחם מטוגנים בחמאה. קיימות רק עכשיו",
      },
      { name: "Kürbiscremesuppe", text: "מרק דלעת עם טפטוף שמן גרעיני דלעת" },
      { name: "Wild / Hirschragout", text: "עונת הציד נפתחת בספטמבר" },
      {
        name: "Sturm",
        text: "מיץ ענבים בתסיסה. ⚠️ אלכוהולי. הגרסה הבטוחה: Traubenmost",
      },
      { name: "Maroni", text: "ערמונים קלויים, דוכני רחוב מסוף ספטמבר" },
    ],
  },
  {
    title: "מאפים ועוגות",
    items: [
      { name: "Kaiserschmarrn", text: "פנקייק קרוע עם חמאה, צימוקים ורוטב שזיפים. ב‑Demel מוכן מולך" },
      { name: "Apfelstrudel", text: "עם רוטב וניל חם" },
      { name: "Topfenstrudel", text: "שטרודל גבינה חמה. יותר טוב מהתפוחים, פחות מוכר" },
      { name: "Topfengolatsche", text: "מאפה ריבועי עם גבינת קוטג'. ארוחת בוקר וינאית" },
      { name: "Buchteln", text: "כופתאות שמרים אפויות עם ריבת שזיפים, חמות" },
      { name: "Kardinalschnitte", text: "שכבות מרנג וביסקוויט עם קרם קפה" },
      { name: "Sachertorte", text: "שוקולד עם ריבת משמש. Demel מול Sacher – מלחמה בת 200 שנה" },
      { name: "Esterházytorte", text: "שכבות שקדים וקרם, ציפוי לבן עם דוגמת חץ" },
      { name: "Malakofftorte", text: "ביסקוויטים ספוגים בקרם" },
      { name: "Punschkrapfen", text: "קוביה ורודה עם רום. ⚠️ אלכוהול" },
      { name: "Cremeschnitte", text: "בצק עלים עם קרם וניל" },
      { name: "Marillenknödel", text: "כופתאות משמש. סוף העונה, אולי עוד תתפסו" },
    ],
  },
  {
    title: "משקאות",
    items: [
      { name: "Melange", text: "הקפוצ'ינו הוינאי. ההזמנה הדיפולטית" },
      { name: "Einspänner", text: "אספרסו כפול בכוס זכוכית עם הר קצפת" },
      { name: "Fiaker", text: "קפה שחור עם רום ⚠️" },
      { name: "Almdudler", text: "לימונדת עשבים אוסטרית. הקולה המקומית" },
      { name: "Traubenmost", text: "מיץ ענבים טרי, עונתי" },
    ],
  },
  {
    title: "לקנות הביתה",
    items: [
      { name: "שמן גרעיני דלעת סטיירי", text: "חותמת g.g.A." },
      { name: "חומץ Gegenbauer", text: "נשמרקט 111" },
      { name: "ריבת משמש Staud's", text: "" },
      { name: "Altmann & Kühne", text: "קופסת המזוודה" },
      { name: "Manner", text: "ופלים ורודים" },
      { name: "תה Schönbichler", text: "" },
      { name: "קפה Julius Meinl", text: "" },
    ],
  },
];
