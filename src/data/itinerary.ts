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
    date: "Sep 19",
    weekday: "Saturday",
    theme: "Arrival",
    stops: [
      {
        time: "Before 14:00",
        title: "Naschmarkt Flea Market",
        detail: "Saturdays only · 8 min from the hotel. If you land early",
        lat: 48.1968,
        lng: 16.3627,
        query: "Naschmarkt Flohmarkt Wien",
      },
      {
        time: "16:00",
        title: "kaffemik",
        detail: "Zollergasse 5 · third wave, 5 min from the hotel",
        lat: 48.199,
        lng: 16.3506,
        query: "kaffemik Zollergasse 5 Wien",
      },
      {
        time: "17:30",
        title: "Mariahilfer Straße",
        detail: "Shops open until 18:00. Tomorrow everything is closed",
        lat: 48.1988,
        lng: 16.3492,
        query: "Mariahilfer Strasse Wien",
      },
      {
        time: "19:30",
        title: "Plachutta Wollzeile 38",
        detail: "Tafelspitz in a copper pot. Book ahead",
        warn:
          "Soup first, with the bread and the marrow bone, then the beef. One portion feeds two. Skip the tartare",
        lat: 48.2087,
        lng: 16.3775,
        query: "Plachutta Wollzeile 38 Wien",
      },
    ],
    alternatives: [
      "Gasthaus zu den 3 Hacken (Beisl from 1618, courtyard)",
      "Meissl & Schadn (veal schnitzel, grand hall)",
      "Skopik & Lohn (modern, relaxed, from 18:00)",
    ],
  },
  {
    id: "sun",
    date: "Sep 20",
    weekday: "Sunday",
    theme: "Art, wine and a concert",
    star: true,
    warn: "All shops are closed. Museums and restaurants are open",
    stops: [
      {
        time: "9:00",
        title: "Belvedere",
        detail: "Klimt's The Kiss · empty at this hour",
        lat: 48.1915,
        lng: 16.3809,
        query: "Belvedere Wien",
      },
      {
        time: "11:00",
        title: "Beethovengang",
        detail: "Flat path along a stream, 2 km · U4 Heiligenstadt + bus",
        lat: 48.2495,
        lng: 16.335,
        query: "Beethovengang Wien",
      },
      {
        time: "13:30",
        title: "Heuriger in Nussdorf",
        detail: "Pumpkin soup with pumpkin seed oil",
        warn: "Sturm is alcoholic → Traubenmost for your wife",
        lat: 48.2585,
        lng: 16.348,
        query: "Heuriger Nussdorf Wien",
      },
      {
        time: "15:30 / 19:00",
        title: "50 Pianos · Konzerthaus",
        detail: "Two performances, €44–59",
        star: true,
        lat: 48.2003,
        lng: 16.3773,
        query: "Wiener Konzerthaus",
      },
      {
        time: "Evening",
        title: "Gerstner",
        detail:
          "Kärntner Str. 51 · the only place at this level open today, until 22:00",
        lat: 48.2039,
        lng: 16.3705,
        query: "Gerstner Kärntner Strasse 51 Wien",
      },
    ],
    alternatives: [
      "Palmenhaus (glass greenhouse, until 23:00)",
      "Kahlenberg (views and vineyards)",
      "Stadtpark",
      "Leopold / Albertina if it rains",
    ],
  },
  {
    id: "mon",
    date: "Sep 21",
    weekday: "Monday",
    theme: "Nature and markets",
    closed:
      "KHM, Secession, Wien Museum, Josephinum, Narrenturm, galleries, Schnitzelwirt, Staud's",
    open: "Prunksaal, Schatzkammer, Café Central, Zuckerlwerkstatt, Albertina, Leopold",
    stops: [
      {
        time: "9:00",
        title: "Lainzer Tiergarten",
        detail:
          "Wild boar on the trail · U4 Hietzing + bus 60B · flat, 20 min to Villa Hermes",
        star: true,
        lat: 48.1746,
        lng: 16.2312,
        query: "Lainzer Tiergarten Wien",
      },
      {
        time: "13:00",
        title: "Brunnenmarkt",
        detail: "U6 Josefstädter Str. · Yppenplatz at the north end – good food",
        lat: 48.2098,
        lng: 16.3349,
        query: "Brunnenmarkt Yppenplatz Wien",
      },
      {
        time: "15:30",
        title: "Prunksaal",
        detail: "Josefsplatz 1 · Baroque hall from 1726, 80 m long, giant globes",
        star: true,
        lat: 48.2064,
        lng: 16.366,
        query: "Prunksaal Josefsplatz 1 Wien",
      },
      {
        time: "16:45",
        title: "Café Central",
        detail: "Herrengasse 14 · 4 min away. Book ahead",
        lat: 48.2103,
        lng: 16.3654,
        query: "Cafe Central Herrengasse 14 Wien",
      },
      {
        time: "17:30",
        title: "Zuckerlwerkstatt",
        detail: "Herrengasse 6 · candy made by hand in front of you. Until 18:00",
        lat: 48.2098,
        lng: 16.366,
        query: "Zuckerlwerkstatt Herrengasse 6 Wien",
      },
      {
        time: "20:00",
        title: "Figlmüller Wollzeile",
        detail:
          "Book now. They do have veal schnitzel. The potato salad with pumpkin seed oil is a must",
        star: true,
        lat: 48.2087,
        lng: 16.3745,
        query: "Figlmüller Wollzeile Wien",
      },
    ],
    alternatives: [
      "Schatzkammer (imperial crowns – closed tomorrow, so today or never)",
      "Café Landtmann (Freud's actual café)",
      "Meissl & Schadn / Pöschl",
      "Hundertwasserhaus + Kunst Haus Wien",
    ],
  },
  {
    id: "tue",
    date: "Sep 22",
    weekday: "Tuesday",
    theme: "City, shops, galleries",
    closed: "Schatzkammer, Leopold",
    stops: [
      {
        time: "8:00",
        title: "Oberlaa",
        detail: "Neuer Markt 16 · Kardinalschnitte – what the Viennese actually buy",
        lat: 48.2049,
        lng: 16.3703,
        query: "Oberlaa Neuer Markt 16 Wien",
      },
      {
        time: "9:00",
        title: "KHM",
        detail: "Bruegel's Tower of Babel, Vermeer, Caravaggio · two hours",
        lat: 48.2038,
        lng: 16.3616,
        query: "Kunsthistorisches Museum Wien",
      },
      {
        time: "12:00",
        title: "Anker Clock",
        detail: "Hoher Markt · 12 figures on parade, exactly at 12:00",
        lat: 48.2113,
        lng: 16.3729,
        query: "Ankeruhr Hoher Markt Wien",
      },
      {
        time: "12:30",
        title: "Schönbichler → Haas & Haas",
        detail: "Wollzeile 4 (tea since 1870) · Stephansplatz 4 (tea house)",
        lat: 48.2085,
        lng: 16.3735,
        query: "Schönbichler Wollzeile 4 Wien",
      },
      {
        time: "14:00",
        title: "Altmann & Kühne · Julius Meinl · Lobmeyr",
        detail: "At Lobmeyr go up to the 3rd floor – glass museum",
        lat: 48.2091,
        lng: 16.3699,
        query: "Altmann & Kühne Graben Wien",
      },
      {
        time: "15:00",
        title: "Free organ concert · Peterskirche",
        detail: "30 min",
        star: true,
        lat: 48.2088,
        lng: 16.3699,
        query: "Peterskirche Wien",
      },
      {
        time: "16:30",
        title: "Gegenbauer",
        detail:
          "Naschmarkt 111 · artisan vinegar, tastings of everything + pumpkin seed oil. Until 18:00",
        lat: 48.198,
        lng: 16.3635,
        query: "Gegenbauer Naschmarkt Wien",
      },
      {
        time: "17:15",
        title: "Vollpension + 3 galleries",
        detail: "All on the same street – Schleifmühlgasse",
        lat: 48.1966,
        lng: 16.3651,
        query: "Vollpension Schleifmühlgasse Wien",
      },
      {
        time: "20:00",
        title: "Schnitzelwirt",
        detail: "Neubaugasse 52 · 6 min from the hotel, huge portions",
        lat: 48.1975,
        lng: 16.3486,
        query: "Schnitzelwirt Neubaugasse 52 Wien",
      },
    ],
    alternatives: [
      "Demel (Kaiserschmarrn made in front of you)",
      "Café Hawelka (Buchteln in the evening)",
      "Secession (Beethoven Frieze)",
      "Supersense (cut your own vinyl)",
      "Café Sperl",
    ],
  },
  {
    id: "wed",
    date: "Sep 23",
    weekday: "Wednesday",
    theme: "Vegan + opera",
    star: true,
    warn: "The vegan place closes at 22:00, the opera ends at 22:15. Eat beforehand",
    stops: [
      {
        time: "10:00",
        title: "Narrenturm",
        detail: "The only day it is open during your stay · 10:00–17:00",
        star: true,
        lat: 48.2166,
        lng: 16.351,
        query: "Narrenturm Wien",
      },
      {
        time: "12:30",
        title: "Der Wiener Deewan",
        detail: "400 m away · vegan curries, pay as you wish",
        lat: 48.2148,
        lng: 16.3557,
        query: "Der Wiener Deewan Wien",
      },
      {
        time: "14:30",
        title: "Donaukanal",
        detail: "Flat walk, graffiti",
        lat: 48.213,
        lng: 16.379,
        query: "Donaukanal Wien",
      },
      { time: "15:30", title: "Rest" },
      {
        time: "17:00",
        title: "Swing Kitchen",
        detail: "Schwedenplatz (or Yamm! for Austrian-vegetarian)",
        lat: 48.2116,
        lng: 16.379,
        query: "Swing Kitchen Schwedenplatz Wien",
      },
      {
        time: "19:00",
        title: "Staatsoper",
        detail: "La clemenza di Tito",
        star: true,
        lat: 48.203,
        lng: 16.369,
        query: "Wiener Staatsoper",
      },
    ],
    alternatives: [
      "Josephinum (wax models, an easier visit)",
      "TIAN (Michelin vegetarian, ⚠️ clashes with the opera)",
      "Harvest",
      "Hundertwasserhaus",
    ],
  },
  {
    id: "thu",
    date: "Sep 24",
    weekday: "Thursday",
    theme: "Departure",
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
        title: "Butterfly House",
        detail: "20 min",
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
        title: "Full-day option: Bratislava",
        detail:
          "Twin City Liner, 75 min, from €28. Passes through Donau-Auen National Park",
        warn: "Passports",
      },
    ],
    alternatives: [],
  },
];

export const bookings = [
  "Konzerthaus Sep 20",
  "Opera Sep 23",
  "Figlmüller",
  "Plachutta",
  "Café Central",
];

export const foodList: { title: string; items: { name: string; text: string }[] }[] = [
  {
    title: "Main dishes",
    items: [
      {
        name: "Wiener Schnitzel",
        text: 'Pounded veal. If it is pork it is called "Schnitzel Wiener Art". Served with lemon and potato salad',
      },
      {
        name: "Tafelspitz",
        text: "Beef boiled in a copper pot with broth, marrow bone, chive sauce and apple horseradish. Franz Joseph's dish",
      },
      {
        name: "Gulasch",
        text: "Viennese goulash, thick, with onion and caraway. Different from the Hungarian one",
      },
      { name: "Backhendl", text: "Breaded fried chicken, a Heuriger classic" },
      {
        name: "Beuschel",
        text: "Lung and heart ragout with a dumpling. The most authentic, not for everyone",
      },
      { name: "Käsespätzle", text: "Egg noodles with cheese and fried onion. Pure comfort" },
      { name: "Erdäpfelgulasch", text: "Potato goulash, usually vegan" },
    ],
  },
  {
    title: "Seasonal – September",
    items: [
      {
        name: "Zwetschkenknödel",
        text: "Plum dumplings in potato dough rolled in buttered breadcrumbs. Available only now",
      },
      { name: "Kürbiscremesuppe", text: "Pumpkin soup with a drizzle of pumpkin seed oil" },
      { name: "Wild / Hirschragout", text: "Game season opens in September" },
      {
        name: "Sturm",
        text: "Fermenting grape juice. ⚠️ Alcoholic. The safe version: Traubenmost",
      },
      { name: "Maroni", text: "Roasted chestnuts, street stalls from late September" },
    ],
  },
  {
    title: "Pastries and cakes",
    items: [
      {
        name: "Kaiserschmarrn",
        text: "Torn pancake with butter, raisins and plum sauce. At Demel it is made in front of you",
      },
      { name: "Apfelstrudel", text: "With warm vanilla sauce" },
      {
        name: "Topfenstrudel",
        text: "Warm cheese strudel. Better than the apple one, less known",
      },
      { name: "Topfengolatsche", text: "Square pastry with curd cheese. A Viennese breakfast" },
      { name: "Buchteln", text: "Baked yeast dumplings with plum jam, served warm" },
      { name: "Kardinalschnitte", text: "Layers of meringue and sponge with coffee cream" },
      {
        name: "Sachertorte",
        text: "Chocolate with apricot jam. Demel vs Sacher – a 200-year-old war",
      },
      {
        name: "Esterházytorte",
        text: "Almond and cream layers, white icing with an arrow pattern",
      },
      { name: "Malakofftorte", text: "Biscuits soaked in cream" },
      { name: "Punschkrapfen", text: "Pink cube with rum. ⚠️ Alcohol" },
      { name: "Cremeschnitte", text: "Puff pastry with vanilla cream" },
      {
        name: "Marillenknödel",
        text: "Apricot dumplings. End of the season, you might still catch them",
      },
    ],
  },
  {
    title: "Drinks",
    items: [
      { name: "Melange", text: "The Viennese cappuccino. The default order" },
      { name: "Einspänner", text: "Double espresso in a glass with a mountain of whipped cream" },
      { name: "Fiaker", text: "Black coffee with rum ⚠️" },
      { name: "Almdudler", text: "Austrian herbal lemonade. The local cola" },
      { name: "Traubenmost", text: "Fresh grape juice, seasonal" },
    ],
  },
  {
    title: "To take home",
    items: [
      { name: "Styrian pumpkin seed oil", text: "Look for the g.g.A. seal" },
      { name: "Gegenbauer vinegar", text: "Naschmarkt 111" },
      { name: "Staud's apricot jam", text: "" },
      { name: "Altmann & Kühne", text: "The little suitcase box" },
      { name: "Manner", text: "Pink wafers" },
      { name: "Schönbichler tea", text: "" },
      { name: "Julius Meinl coffee", text: "" },
    ],
  },
];
