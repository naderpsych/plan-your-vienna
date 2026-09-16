/**
 * Trip data.
 *
 * `about` says what the place is, `plan` says what we actually do there.
 * `hours.week` is indexed 0 = Sunday … 6 = Saturday; null means closed.
 * Hours are a best-effort copy of the published times — the daily agent in
 * .github/workflows/refresh-hours.yml refreshes them from OpenStreetMap, and
 * every card links to Google so you can double-check before you walk over.
 */

export type Hours = {
  week: (string | null)[];
  note?: string;
  source?: "manual" | "osm";
  checked?: string;
};

/** What sort of place this is — drives the label and the colour of the card. */
export type Kind =
  | "hotel"
  | "food"
  | "cafe"
  | "market"
  | "museum"
  | "sight"
  | "view"
  | "park"
  | "walk"
  | "shop"
  | "concert"
  | "transport";

export const KIND_LABEL: Record<Kind, string> = {
  hotel: "Hotel",
  food: "Restaurant",
  cafe: "Café",
  market: "Market",
  museum: "Museum",
  sight: "Landmark",
  view: "Viewpoint",
  park: "Park",
  walk: "Walk",
  shop: "Shop",
  concert: "Concert",
  transport: "Travel",
};

/** Fallback visit length when a place has no figure of its own. */
export const DEFAULT_MINUTES: Record<Kind, number> = {
  hotel: 60,
  food: 90,
  cafe: 45,
  market: 60,
  museum: 120,
  sight: 45,
  view: 20,
  park: 90,
  walk: 45,
  shop: 30,
  concert: 120,
  transport: 30,
};

export function visitMinutes(stop: Stop): number {
  return stop.minutes ?? (stop.kind ? DEFAULT_MINUTES[stop.kind] : 60);
}

/** Anything you eat or drink at — these cards get the warm colour. */
export const FOOD_KINDS: Kind[] = ["food", "cafe", "market"];

export type Stop = {
  id: string;
  kind?: Kind;
  /** Roughly how long the visit takes, in minutes. */
  minutes?: number;
  time?: string;
  title: string;
  about?: string;
  plan?: string;
  warn?: string;
  star?: boolean;
  /** Hotel anchors — always first, never removable. */
  fixed?: boolean;
  lat?: number;
  lng?: number;
  query?: string;
  hours?: Hours;
  links?: { label: string; url: string }[];
};

export type Day = {
  id: string;
  iso: string;
  date: string;
  weekday: string;
  theme: string;
  star?: boolean;
  closed?: string;
  open?: string;
  warn?: string;
  /** The paragraphs that sit under the day's table. */
  notes?: string[];
  stops: Stop[];
  /** Fallbacks for the day — same shape as a stop, so they can be added to it. */
  alternatives: Stop[];
};

export const HOTEL = {
  name: "Jaz in the City Vienna",
  address: "Windmühlgasse 28, 1060 Wien",
  lat: 48.1979,
  lng: 16.3576,
  query: "Jaz in the City Vienna",
};

/** The weather note from the itinerary, folded away in the header. */
export const weatherNote =
  "The latest forecast checked suggests possible showers on Monday and Tuesday, so the " +
  "gardens on Monday are flexible and Tuesday is mostly indoors anyway. Refresh the " +
  "forecast close to the trip.";

const daily = (h: string): (string | null)[] => [h, h, h, h, h, h, h];

/** Austrian public holidays — the planner warns if you aim at one. */
export const holidays: Record<string, string> = {
  "2026-01-01": "Neujahr",
  "2026-01-06": "Heilige Drei Könige",
  "2026-04-06": "Ostermontag",
  "2026-05-01": "Staatsfeiertag",
  "2026-05-14": "Christi Himmelfahrt",
  "2026-05-25": "Pfingstmontag",
  "2026-06-04": "Fronleichnam",
  "2026-08-15": "Mariä Himmelfahrt",
  "2026-10-26": "Nationalfeiertag",
  "2026-11-01": "Allerheiligen",
  "2026-12-08": "Mariä Empfängnis",
  "2026-12-25": "Christtag",
  "2026-12-26": "Stefanitag",
};

export const days: Day[] = [
  {
    id: "sat",
    iso: "2026-09-19",
    date: "Sep 19",
    weekday: "Saturday",
    theme: "Arrival and an evening close to the hotel",
    notes: [
      "Glacis is at Breite Gasse 4, about a 15-minute walk from the hotel. Dinner time depends on the flight.",
    ],
    stops: [
      {
        id: "sat-hotel",
        kind: "hotel",
        time: "Depending on landing",
        title: HOTEL.name,
        plan: "Check in and settle in.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
      {
        id: "sat-glacis",
        kind: "food",
        time: "After settling in",
        about: "A Beisl — a traditional, relaxed Viennese restaurant — with a green courtyard by the museum quarter.",
        plan: "Try the beef goulash with a Kaiser roll; the menu also has beef and fish dishes. About 1–1½ hours for dinner.",
        title: "Glacis Beisl",
        lat: 48.2038,
        lng: 16.3571,
        query: "Glacis Beisl Breite Gasse 4 Wien",
      },
      {
        id: "sat-mq",
        kind: "walk",
        time: "If you have the energy",
        about: "A cultural complex that combines historic buildings, museums, cafés and courtyards with places to sit.",
        plan: "An atmosphere stop and a stroll outside, without going into another museum. 20–40 minutes, sitting down as you like.",
        title: "MuseumsQuartier",
        lat: 48.2033,
        lng: 16.3593,
        query: "MuseumsQuartier Wien",
      },
    ],
    alternatives: [
      {
        id: "alt-sat-hacken",
        minutes: 120,
        kind: "food",
        title: "Gasthaus zu den 3 Hacken",
        about:
          "A Beisl licensed since 1618 and claimed as the oldest inn in the city, with a courtyard at the back.",
        plan: "Plain Viennese tavern cooking if Plachutta is full or feels too formal.",
        lat: 48.2072,
        lng: 16.3723,
        query: "Gasthaus zu den 3 Hacken Wien",
      },
      {
        id: "alt-sat-meissl",
        minutes: 120,
        kind: "food",
        title: "Meissl & Schadn",
        about:
          "A grand dining hall that treats the veal schnitzel as a ceremony, carved and served at the table.",
        plan: "The dressier schnitzel dinner. Book ahead.",
        lat: 48.2028,
        lng: 16.3737,
        query: "Meissl & Schadn Wien",
      },
      {
        id: "alt-sat-skopik",
        minutes: 120,
        kind: "food",
        title: "Skopik & Lohn",
        about:
          "A modern bistro in Leopoldstadt under a ceiling covered in one long black scribble by an artist.",
        plan: "Lighter and later — kitchen from 18:00, good if the flight lands very late.",
        lat: 48.2166,
        lng: 16.3796,
        query: "Skopik & Lohn Wien",
      },
    ],
  },
  {
    id: "sun",
    iso: "2026-09-20",
    date: "Sep 20",
    weekday: "Sunday",
    theme: "Belvedere, Gerstner, CHINACY and the opera",
    star: true,
    notes: [
      "Choose the CHINACY branch at Karlsplatz, which is listed as open on Sunday — not the one on Johannesgasse. From there the walk to the opera is estimated at about 10 minutes, so dinner fits the evening better. Book a table and mention you are going on to a performance.",
      "The Sunday 19:00 opera is confirmed; check availability of seats with a good view.",
    ],
    stops: [
      {
        id: "sun-breakfast",
        kind: "hotel",
        time: "08:30–09:15",
        title: HOTEL.name,
        plan: "Breakfast — at the hotel or close to it.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
      {
        id: "sun-belvedere",
        kind: "museum",
        time: "10:00–12:00",
        about: "A Baroque palace used as an art museum, famous above all for Gustav Klimt's The Kiss.",
        plan: "You come for the paintings and the art, not a tour of royal living rooms. About two hours, with a break to sit down.",
        title: "Upper Belvedere",
        lat: 48.1915,
        lng: 16.3809,
        query: "Oberes Belvedere Wien",
      },
      {
        id: "sun-belvedere-gardens",
        kind: "park",
        time: "12:00–12:30",
        about: "Formal gardens with flowerbeds, fountains and paths between the Upper and Lower palaces.",
        plan: "A short loop and photos; no need to walk down to the Lower Belvedere and back. 20–30 minutes for a short route.",
        title: "Belvedere gardens",
        lat: 48.1937,
        lng: 16.3786,
        query: "Belvedere Garten Wien",
      },
      {
        id: "sun-gerstner",
        kind: "cafe",
        time: "13:00–14:00",
        about: "A confectioner founded in 1847, today a grand café in the Palais Todesco opposite the opera. Kärntner Straße 51.",
        plan: "Austrian desserts — apple strudel and coffee — plus a light meal to leave room for the evening. About an hour. Get there by public transport or taxi.",
        title: "Gerstner",
        lat: 48.2039,
        lng: 16.3705,
        query: "Gerstner Kärntner Strasse 51 Wien",
      },
      {
        id: "sun-hotel-rest",
        kind: "hotel",
        time: "14:00–16:15",
        title: HOTEL.name,
        plan: "Back to the hotel to rest and get ready.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
      {
        id: "sun-chinacy",
        kind: "food",
        time: "16:45–18:00",
        about: "A modern Chinese restaurant near Karlsplatz, for a meal before the opera. Treitlstraße 2/4.",
        plan: "Early dinner. A good direction to order: dumplings with a non-pork filling and a beef, chicken or vegetable dish, depending on the branch menu — also ask about the fillings and sauces. 60–75 minutes; mention when booking that you are going on to a performance.",
        title: "CHINACY Karlsplatz",
        lat: 48.2004,
        lng: 16.366,
        query: "CHINACY am Karlsplatz Treitlstrasse Wien",
        links: [
          { label: "Branch details", url: "https://www.thefork.com/restaurant/chinacy-am-karlsplatz-r862155" },
        ],
      },
      {
        id: "sun-opera-arrive",
        kind: "concert",
        time: "18:30",
        about: "The Vienna State Opera.",
        plan: "Arrive at 18:30. Mozart's La clemenza di Tito, 19:00–21:45 with an interval — a full production with singers, orchestra and a story about a ruler torn between punishment and forgiveness.",
        title: "Wiener Staatsoper",
        lat: 48.203,
        lng: 16.369,
        query: "Wiener Staatsoper",
        links: [
          { label: "Official schedule", url: "https://www.wiener-staatsoper.at/en/calendar/2026/september/" },
        ],
      },
      {
        id: "sun-hotel-back",
        kind: "hotel",
        time: "After the show",
        title: HOTEL.name,
        plan: "Back to the hotel.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
    ],
    alternatives: [
      {
        id: "alt-sun-kahlenberg",
        minutes: 90,
        kind: "view",
        title: "Kahlenberg",
        about:
          "The hill north of the city, with a terrace looking over Vienna and the Danube across the vine slopes.",
        plan:
          "Bus 38A from Heiligenstadt. Best about an hour before sunset. It is a viewpoint — nothing to drink involved.",
        lat: 48.2789,
        lng: 16.3335,
        query: "Kahlenberg Wien",
      },
      {
        id: "alt-sun-stadtpark",
        minutes: 40,
        kind: "park",
        title: "Stadtpark",
        about:
          "The city park on the Ring, with the gilded Johann Strauss statue everyone photographs.",
        plan: "A flat half-hour walk if the day needs slowing down.",
        lat: 48.2049,
        lng: 16.3797,
        query: "Stadtpark Wien",
      },
      {
        id: "alt-sun-leopold",
        minutes: 120,
        kind: "museum",
        title: "Leopold Museum / Albertina",
        about:
          "Two central museums — the largest Schiele collection in the world, and the Habsburg print rooms.",
        plan: "The rain plan. Both open on Sunday, both indoors all day.",
        lat: 48.2025,
        lng: 16.3592,
        query: "Leopold Museum Wien",
      },
    ],
  },
  {
    id: "mon",
    iso: "2026-09-21",
    date: "Sep 21",
    weekday: "Monday",
    theme: "Schönbrunn and Tafelspitz",
    notes: [
      "Tafelspitz is the beef simmered in broth that you wanted, with Viennese sides.",
      "Entry arrangements at Schönbrunn change around the time of your visit. The schedule includes time to arrive, but the right gate for 21.9 still needs to be checked.",
    ],
    stops: [
      {
        id: "mon-breakfast",
        kind: "hotel",
        time: "08:30–09:15",
        title: HOTEL.name,
        plan: "Breakfast.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
      {
        id: "mon-schoenbrunn",
        kind: "sight",
        time: "11:00–12:15",
        about: "The Habsburg summer residence, associated with Maria Theresa, Franz Joseph and Empress Elisabeth (Sisi). You visit the royal rooms and halls, with period furniture and decor.",
        plan: "U4 to Schönbrunn and walk to the entrance (09:45–10:45). About 75 minutes on the Palace Ticket route; entry at a booked time.",
        title: "Schönbrunn Palace",
        lat: 48.1848,
        lng: 16.3122,
        query: "Schloss Schönbrunn Wien",
        links: [
          { label: "Entry guidelines", url: "https://www.schoenbrunn.at/en/visitor-information/how-to-get-here" },
        ],
      },
      {
        id: "mon-schoenbrunn-lunch",
        kind: "food",
        time: "12:30–13:30",
        title: "Gerstner at Schönbrunn",
        about: "A Gerstner branch on the palace grounds.",
        plan: "Lunch and a rest between the palace visit and the gardens. You can add apple strudel if you didn't have it at the central branch. About an hour. The strudel-making show is a separate activity and isn't in the route for now.",
        lat: 48.1858,
        lng: 16.3137,
        query: "Gerstner Schönbrunn Wien",
      },
      {
        id: "mon-schoenbrunn-gardens",
        kind: "park",
        time: "13:30–14:30",
        about: "A large park with symmetrical flowerbeds, statues and fountains, with the Gloriette looking down from the hill.",
        plan: "A loop through the central part with stops, no obligatory climb up the hill. 45–60 minutes; the central park is free.",
        title: "Schönbrunn main gardens",
        lat: 48.1822,
        lng: 16.3118,
        query: "Schlosspark Schönbrunn Wien",
      },
      {
        id: "mon-hotel-rest",
        kind: "hotel",
        time: "15:30–18:30",
        title: HOTEL.name,
        plan: "Back to the hotel (14:30–15:30), then rest. Short shopping nearby only if you feel like it.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
      {
        id: "sat-plachutta",
        kind: "food",
        time: "19:30",
        about: "A restaurant known for Tafelspitz — beef simmered in broth, served with sides. Wollzeile 38.",
        plan: "The dish you wanted: start with the soup, then the beef with potatoes, chive sauce and apple horseradish. About 1½ hours; book a table.",
        title: "Plachutta Wollzeile",
        lat: 48.2087,
        lng: 16.3775,
        query: "Plachutta Wollzeile 38 Wien",
      },
    ],
    alternatives: [
      {
        id: "alt-mon-schatzkammer",
        minutes: 60,
        kind: "museum",
        title: "Schatzkammer",
        about:
          "The imperial treasury in the Hofburg: the crown of the Holy Roman Empire, the Holy Lance, the Habsburg jewels.",
        plan: "An hour. Closed tomorrow — so today or not on this trip.",
        warn: "Closed on Tuesdays",
        lat: 48.2065,
        lng: 16.3647,
        query: "Kaiserliche Schatzkammer Wien",
      },
      {
        id: "alt-mon-landtmann",
        minutes: 60,
        kind: "cafe",
        title: "Café Landtmann",
        about: "The Ring café beside the Burgtheater that was genuinely Freud's regular.",
        plan: "Coffee with far more elbow room than Café Central, and no queue at the door.",
        lat: 48.2117,
        lng: 16.3612,
        query: "Cafe Landtmann Wien",
      },
      {
        id: "alt-mon-poeschl",
        minutes: 90,
        kind: "food",
        title: "Meissl & Schadn / Pöschl",
        about:
          "Two schnitzel houses a few streets apart — one a grand hall, one a tiny panelled room.",
        plan: "The backup if Figlmüller has no table.",
        lat: 48.2033,
        lng: 16.3712,
        query: "Gasthaus Pöschl Wien",
      },
      {
        id: "alt-mon-hundertwasser",
        minutes: 60,
        kind: "sight",
        title: "Hundertwasserhaus + Kunst Haus Wien",
        about:
          "Hundertwasser's council block with uneven floors and trees growing out of the windows, and his museum two streets away.",
        plan: "Twenty minutes at the house from the outside, an hour in the museum.",
        lat: 48.2076,
        lng: 16.3939,
        query: "Hundertwasserhaus Wien",
      },
    ],
  },
  {
    id: "tue",
    iso: "2026-09-22",
    date: "Sep 22",
    weekday: "Tuesday",
    theme: "Art, the library, Demel and schnitzel",
    notes: [
      "This is the easiest sequence on foot in the whole route. Demel does not take reservations, so if there is a queue the shopping window gets shorter.",
      "At Figlmüller, order the Wiener Schnitzel of veal. The house schnitzel is made from pork; also ask about the frying fat.",
    ],
    stops: [
      {
        id: "tue-breakfast",
        kind: "hotel",
        time: "08:30–09:30",
        title: HOTEL.name,
        plan: "Breakfast, then leave the hotel at 09:30.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
      {
        id: "tue-khm",
        kind: "museum",
        time: "10:00–12:30",
        about: "A museum built on the Habsburg collections, with works by Bruegel, Rubens and Titian alongside decorative arts and historical collections. The building and its staircase are impressive too.",
        plan: "Two to two and a half hours; pick the collections that interest you rather than trying to see everything.",
        title: "KHM — Kunsthistorisches Museum",
        lat: 48.2038,
        lng: 16.3616,
        query: "Kunsthistorisches Museum Wien",
      },
      {
        id: "sun-palmenhaus",
        kind: "food",
        time: "12:45–13:45",
        about: "A restaurant and café inside a large glasshouse beside the Burggarten, with tall plants and a special atmosphere.",
        plan: "Lunch and a rest; choose from the daily menu and save dessert for Demel. About an hour.",
        title: "Palmenhaus",
        lat: 48.2047,
        lng: 16.3673,
        query: "Palmenhaus Burggarten Wien",
      },
      {
        id: "mon-prunksaal",
        kind: "sight",
        time: "14:00–14:45",
        about: "An 18th-century Baroque library hall with tall wooden shelves, historic books, globes and ceiling paintings.",
        plan: "You come to look at the hall and its design, not a regular lending library. 30–45 minutes of slow walking and looking.",
        title: "Prunksaal — Austrian National Library",
        lat: 48.2064,
        lng: 16.366,
        query: "Prunksaal Josefsplatz 1 Wien",
      },
      {
        id: "w-demel",
        kind: "cafe",
        time: "15:00–16:00",
        about: "A historic confectioner from 1786 that supplied the imperial court, tied to Vienna's tradition of sweets.",
        plan: "Try the Kaiserschmarrn — a thick, fluffy pancake torn into pieces, served with powdered sugar and fruit. Austrian cakes and desserts too. 45–60 minutes plus a possible queue; no reservations.",
        title: "Demel",
        lat: 48.2091,
        lng: 16.369,
        query: "Demel Kohlmarkt Wien",
      },
      {
        id: "tue-kohlmarkt-graben",
        kind: "shop",
        time: "16:00–16:30",
        about: "Central, elegant old-town streets with historic facades, luxury shops and the Plague Column on the Graben.",
        plan: "A short window for shopping and looking in shop windows. About 30 minutes; the wider stroll is planned for Wednesday.",
        title: "Kohlmarkt and Graben",
        lat: 48.2087,
        lng: 16.3697,
      },
      {
        id: "tue-hotel-rest",
        kind: "hotel",
        time: "16:30–18:45",
        title: HOTEL.name,
        plan: "Back to the hotel and rest.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
      {
        id: "tue-figlmuller",
        kind: "food",
        time: "19:30",
        about: "A restaurant of the Figlmüller family, known for large, thin schnitzels. Bäckerstraße 6.",
        plan: "Order the Wiener Schnitzel of veal with potato salad. The house Figlmüller-Schnitzel is pork; also ask about the frying fat. 60–90 minutes; book a table.",
        title: "Figlmüller Bäckerstraße",
        lat: 48.2094,
        lng: 16.3779,
        query: "Figlmüller Bäckerstraße 6 Wien",
        links: [
          { label: "Official menu", url: "https://www.figlmueller.at/en/baeckerstrasse/menu/" },
        ],
      },
    ],
    alternatives: [
      {
        id: "alt-tue-hawelka",
        minutes: 45,
        kind: "cafe",
        title: "Café Hawelka",
        about: "A dim, unreformed coffee house from 1939 hung with artists' posters.",
        plan: "Go late — the Buchteln come out of the oven in the evening.",
        lat: 48.2087,
        lng: 16.3697,
        query: "Cafe Hawelka Wien",
      },
      {
        id: "alt-tue-secession",
        minutes: 40,
        kind: "museum",
        title: "Secession",
        about:
          "The 1898 hall under a golden dome of laurel leaves, built as a manifesto, holding Klimt's Beethoven Frieze in the basement.",
        plan: "Forty minutes, mostly for the frieze.",
        warn: "Closed on Mondays",
        lat: 48.2007,
        lng: 16.3657,
        query: "Secession Wien",
      },
      {
        id: "alt-tue-supersense",
        minutes: 60,
        kind: "shop",
        title: "Supersense",
        about:
          "An analogue workshop in a palazzo — instant film, letterpress, and a lathe that cuts records.",
        plan: "You can record and cut your own vinyl on the spot. Book the lathe ahead.",
        lat: 48.2135,
        lng: 16.3865,
        query: "Supersense Wien",
      },
      {
        id: "alt-tue-sperl",
        minutes: 45,
        kind: "cafe",
        title: "Café Sperl",
        about: "An 1880 café with its original billiard tables, five minutes from the hotel.",
        plan: "The closest proper coffee house to where you sleep.",
        lat: 48.1985,
        lng: 16.3629,
        query: "Cafe Sperl Wien",
      },
    ],
  },
  {
    id: "wed",
    iso: "2026-09-23",
    date: "Sep 23",
    weekday: "Wednesday",
    theme: "Market, free time and the old town — vegan food",
    notes: [
      "The two hours in the old town include places to sit. For now the cathedral is included from the outside.",
      "Wednesday is a vegan day for your food; the restaurants themselves don't have to be vegan-only. At lunch and at TIAN Bistro, choose the bread, sauces and dessert accordingly too.",
    ],
    stops: [
      {
        id: "wed-breakfast",
        kind: "hotel",
        time: "08:30–09:30",
        title: HOTEL.name,
        plan: "Breakfast.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
      {
        id: "wed-naschmarkt",
        kind: "market",
        time: "10:00–12:00",
        about: "Vienna's famous market, with stalls of vegetables, spices, delicatessens and food from different cuisines.",
        plan: "Wander, look and taste — not necessarily a full meal. On Wednesday pick vegan tastings and ask about ingredients. About two hours at an easy pace; this isn't the Saturday flea market. Open 06:00–19:30 on Wednesday; about 7 minutes on foot from the hotel.",
        title: "Naschmarkt",
        lat: 48.1985,
        lng: 16.3632,
        query: "Naschmarkt Wien",
      },
      {
        id: "wed-free-lunch",
        kind: "food",
        time: "12:00–14:00",
        title: "Free time and a vegan lunch",
        plan: "Free time after the market, with a vegan lunch.",
      },
      {
        id: "wed-hotel-rest",
        kind: "hotel",
        time: "14:30–16:00",
        title: HOTEL.name,
        plan: "Back to the hotel (14:00–14:30), then rest and a chance to start packing.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
      {
        id: "wed-old-town",
        kind: "walk",
        time: "16:30–18:30",
        title: "Old Town Walk",
        about: "A stroll between the Hofburg — the imperial palace complex — Michaelerplatz, Kohlmarkt and Graben, to Stephansplatz and the cathedral.",
        plan: "Enjoy the streets, squares and architecture. About two hours with stops and photos, not two hours of continuous walking. The palace and the cathedral are seen from outside. Leave the hotel at 16:00 — about 25 minutes on foot to the Hofburg.",
        lat: 48.208,
        lng: 16.3668,
      },
      {
        id: "wed-tian-bistro",
        kind: "food",
        time: "19:00–20:15",
        title: "TIAN Bistro",
        about: "A vegetarian bistro serving plant-based soul food, at Schrankgasse 4 on the Spittelberg.",
        plan: "Dinner. It is your vegan day, so choose the vegan dishes. Open from 17:00 on Wednesday. About 28 minutes on foot from Stephansplatz; about 9 minutes back to the hotel afterwards.",
        lat: 48.2027,
        lng: 16.3551,
        query: "TIAN Bistro am Spittelberg Wien",
      },
      {
        id: "wed-hotel-back",
        kind: "hotel",
        time: "After dinner",
        title: HOTEL.name,
        plan: "Back to the hotel and packing.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
    ],
    alternatives: [
      {
        id: "alt-wed-tian",
        minutes: 150,
        kind: "food",
        title: "TIAN",
        about: "Michelin-starred vegetarian tasting menus in the first district.",
        plan: "A whole evening at the table.",
        warn:
          "A tasting menu cannot be squeezed in before a 19:00 curtain — this replaces the opera, it does not fit around it",
        lat: 48.2063,
        lng: 16.3767,
        query: "TIAN Restaurant Wien",
      },
      {
        id: "alt-wed-harvest",
        minutes: 75,
        kind: "food",
        title: "Harvest",
        about: "A long-running vegan bistro in Leopoldstadt, small and unfussy.",
        plan: "A sit-down vegan dinner if Swing Kitchen feels too much like fast food.",
        lat: 48.2166,
        lng: 16.3789,
        query: "Harvest Bistrot Wien",
      },
      {
        id: "alt-wed-hundertwasser",
        minutes: 30,
        kind: "sight",
        title: "Hundertwasserhaus",
        about: "The wavy council block with trees in the windows, 15 minutes from the canal walk.",
        plan: "Slots in neatly after the Donaukanal, before you head back to change.",
        lat: 48.2076,
        lng: 16.3939,
        query: "Hundertwasserhaus Wien",
      },
    ],
  },
  {
    id: "thu",
    iso: "2026-09-24",
    date: "Sep 24",
    weekday: "Thursday",
    theme: "Departure",
    stops: [
      {
        id: "thu-hotel",
        kind: "hotel",
        title: "Breakfast, check-out and off to the airport",
        plan: "The departure time and transfer will be set by the flight time, which is still missing.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
      },
    ],
    alternatives: [],
  },
];

/**
 * Places that did not make it into a day — either because they clash with the
 * schedule or because they were cut when the arrival and departure times were
 * fixed. Add any of them to a day from the wish list at the bottom of the page.
 */
export const wishlist: Stop[] = [
  {
    id: "w-naschmarkt-flea",
    kind: "market",
    title: "Naschmarkt Flea Market",
    about: "Vienna's big Saturday-only flea market, at the far end of the Naschmarkt.",
    plan: "Saturdays only, and it winds down by 16:00 — with an 18:00 landing this trip misses it entirely.",
    warn: "Saturdays only. Your Saturday starts at 18:00, so this one is realistically out",
    lat: 48.1968,
    lng: 16.3627,
    query: "Naschmarkt Flohmarkt Wien",
    hours: { week: [null, null, null, null, null, null, "06:30-16:00"], source: "manual" },
  },
  {
    id: "w-kaffemik",
    kind: "cafe",
    title: "kaffemik",
    about: "Third-wave coffee bar on Zollergasse with rotating roasters.",
    plan: "Five minutes from the hotel — easy to slot in before any morning that starts in the centre.",
    lat: 48.199,
    lng: 16.3506,
    query: "kaffemik Zollergasse 5 Wien",
    hours: { week: [null, "08:30-18:00", "08:30-18:00", "08:30-18:00", "08:30-18:00", "08:30-18:00", "09:00-18:00"], source: "manual" },
  },
  {
    id: "w-mariahilfer",
    kind: "shop",
    about: "A main shopping street with chains, shops and cafés, near the hotel.",
    plan: "An option for free time, not a sight you have to complete. 30–60 minutes on the stretch close to the hotel, as you feel like it.",
    title: "Mariahilfer Straße",
    lat: 48.1988,
    lng: 16.3492,
    query: "Mariahilfer Strasse Wien",
    hours: { week: [null, "09:00-19:00", "09:00-19:00", "09:00-19:00", "09:00-19:00", "09:00-19:00", "09:00-18:00"], source: "manual" },
  },
  {
    id: "w-joseph",
    kind: "cafe",
    title: "Joseph Brot",
    about: "Sourdough bakery and breakfast room, widely held to be the best bread in the city.",
    plan: "Breakfast outside the hotel, if you ever want to skip the buffet.",
    lat: 48.202,
    lng: 16.38,
    query: "Joseph Brot Wien",
    hours: { week: ["08:00-18:00", "07:30-19:00", "07:30-19:00", "07:30-19:00", "07:30-19:00", "07:30-19:00", "07:30-19:00"], source: "manual" },
  },
  {
    id: "w-butterfly",
    kind: "sight",
    title: "Schmetterlinghaus",
    about: "A small art nouveau palm house in the Burggarten flown full of live butterflies.",
    plan: "Twenty minutes, right in the centre — good filler between two city stops.",
    lat: 48.2044,
    lng: 16.367,
    query: "Schmetterlinghaus Wien",
    hours: { week: ["10:00-18:15", "10:00-16:45", "10:00-16:45", "10:00-16:45", "10:00-16:45", "10:00-16:45", "10:00-18:15"], source: "manual" },
  },
  {
    id: "w-bratislava",
    kind: "transport",
    title: "Day trip: Bratislava",
    about:
      "The Slovak capital, 75 minutes down the Danube by Twin City Liner, through the Donau-Auen national park.",
    plan: "A whole day, from €28. Only works if you give up a full Vienna day for it.",
    warn: "Passports",
    lat: 48.2121,
    lng: 16.3789,
    query: "Twin City Liner Wien Schwedenplatz",
  },
  {
    id: "w-hard-rock",
    kind: "food",
    title: "Hard Rock Cafe Vienna",
    plan: "Kept on the list of options, with no fixed slot for now.",
    query: "Hard Rock Cafe Vienna",
  },
  {
    id: "sun-beethovengang",
    minutes: 45,
    kind: "walk",
    title: "Beethovengang",
    about:
      "The shaded stream path in Heiligenstadt where Beethoven walked while going deaf — there is a bust of him halfway along.",
    plan:
      "A flat 2 km stroll, about 45 minutes. U4 to Heiligenstadt, then the bus up. No climbing.",
    lat: 48.2495,
    lng: 16.335,
    query: "Beethovengang Wien",
  },
  {
    id: "sun-konzerthaus",
    minutes: 120,
    kind: "concert",
    title: "50 Pianos · Konzerthaus",
    about:
      "One-off spectacle in Vienna's 1913 concert hall: fifty pianos playing together on one stage.",
    plan:
      "The evening show. €44–59. Book this week — it is the single thing here that sells out.",
    star: true,
    lat: 48.2003,
    lng: 16.3773,
    query: "Wiener Konzerthaus",
  },
  {
    id: "mon-lainzer",
    minutes: 150,
    kind: "park",
    title: "Lainzer Tiergarten",
    about:
      "A walled imperial hunting ground on the city edge, now a nature reserve where wild boar and deer walk the paths.",
    plan:
      "Head out right after breakfast — U4 to Hietzing, then bus 60B, about 50 minutes door to gate. Flat 20-minute walk to Villa Hermes and back.",
    star: true,
    lat: 48.1746,
    lng: 16.2312,
    query: "Lainzer Tiergarten Wien",
    hours: { week: daily("08:00-17:30"), source: "manual" },
  },
  {
    id: "mon-brunnenmarkt",
    minutes: 75,
    kind: "market",
    title: "Brunnenmarkt",
    about:
      "The longest street market in Vienna and the least touristy — Turkish and Balkan stalls, produce, spices.",
    plan:
      "Walk it end to end, then eat at Yppenplatz at the north end where the good small kitchens are.",
    lat: 48.2098,
    lng: 16.3349,
    query: "Brunnenmarkt Yppenplatz Wien",
    hours: {
      week: [null, "06:00-19:30", "06:00-19:30", "06:00-19:30", "06:00-19:30", "06:00-19:30", "06:00-17:00"],
      source: "manual",
    },
  },
  {
    id: "mon-central",
    minutes: 45,
    kind: "cafe",
    title: "Café Central",
    about:
      "The vaulted 1876 coffee house where Trotsky, Freud and half of imperial Vienna sat all day over one coffee.",
    plan: "Coffee and a cake, four minutes' walk from the Prunksaal. Reserve or expect a queue.",
    lat: 48.2103,
    lng: 16.3654,
    query: "Cafe Central Herrengasse 14 Wien",
    hours: {
      week: ["10:00-21:00", "08:00-21:00", "08:00-21:00", "08:00-21:00", "08:00-21:00", "08:00-21:00", "08:00-21:00"],
      source: "manual",
    },
  },
  {
    id: "mon-zuckerl",
    minutes: 15,
    kind: "shop",
    title: "Zuckerlwerkstatt",
    about:
      "A working candy workshop where they pull, roll and cut hard sweets by hand on a marble table in front of you.",
    plan: "Ten minutes and a bag to take home. They shut at 18:00 sharp, so go straight from the café.",
    lat: 48.2098,
    lng: 16.366,
    query: "Zuckerlwerkstatt Herrengasse 6 Wien",
    hours: { week: [null, "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-18:00"], source: "manual" },
  },
  {
    id: "mon-figlmuller",
    minutes: 90,
    kind: "food",
    title: "Figlmüller Wollzeile",
    about:
      "The schnitzel address since 1905 — pounded so wide it hangs off the plate.",
    plan:
      "Dinner. Book now. Ask for the veal version, and the potato salad with pumpkin seed oil is not optional.",
    star: true,
    lat: 48.2087,
    lng: 16.3745,
    query: "Figlmüller Wollzeile Wien",
    hours: { week: daily("11:00-22:30"), source: "manual" },
  },
  {
    id: "tue-ankeruhr",
    minutes: 15,
    kind: "sight",
    title: "Anker Clock",
    about:
      "A 1914 art nouveau clock bridging two buildings, with twelve historical figures that cross it on a track.",
    plan:
      "All twelve figures parade only at noon — be standing in Hoher Markt by 11:55. Takes ten minutes, then you are done.",
    lat: 48.2113,
    lng: 16.3729,
    query: "Ankeruhr Hoher Markt Wien",
  },
  {
    id: "tue-tea",
    minutes: 60,
    kind: "shop",
    title: "Schönbichler → Haas & Haas",
    about:
      "Two old tea houses two streets apart: Schönbichler selling loose leaf since 1870, Haas & Haas with a courtyard behind the cathedral.",
    plan: "Buy tea at Schönbichler, then a light lunch in the Haas & Haas courtyard.",
    lat: 48.2085,
    lng: 16.3735,
    query: "Schönbichler Wollzeile 4 Wien",
    hours: { week: [null, "09:00-18:30", "09:00-18:30", "09:00-18:30", "09:00-18:30", "09:00-18:30", "09:00-17:00"], source: "manual" },
  },
  {
    id: "tue-graben",
    minutes: 60,
    kind: "shop",
    title: "Altmann & Kühne · Julius Meinl · Lobmeyr",
    about:
      "Three shops on the Graben: miniature chocolates in hand-made boxes, the grand grocer, and the glassmaker who lit the Vienna State Opera.",
    plan:
      "Souvenir run. At Lobmeyr climb to the third floor — there is a free glass museum up there nobody visits.",
    lat: 48.2091,
    lng: 16.3699,
    query: "Altmann & Kühne Graben Wien",
    hours: { week: [null, "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-18:00", "10:00-17:00"], source: "manual" },
  },
  {
    id: "tue-peterskirche",
    minutes: 30,
    kind: "concert",
    title: "Free organ concert · Peterskirche",
    about:
      "A baroque church squeezed behind the Graben that runs a free organ recital every afternoon.",
    plan: "Thirty minutes, no ticket, walk in and sit down. Starts at 15:00.",
    star: true,
    lat: 48.2088,
    lng: 16.3699,
    query: "Peterskirche Wien",
    hours: { week: daily("07:00-20:00"), note: "Recital daily at 15:00", source: "manual" },
  },
  {
    id: "tue-gegenbauer",
    minutes: 30,
    kind: "shop",
    title: "Gegenbauer",
    about:
      "A third-generation vinegar house at the Naschmarkt that ferments vinegar from asparagus, tomato and beer.",
    plan:
      "They pour tastings of everything across the counter. Buy a bottle plus the pumpkin seed oil. Closes at 18:00.",
    lat: 48.198,
    lng: 16.3635,
    query: "Gegenbauer Naschmarkt Wien",
    hours: { week: [null, "09:00-18:00", "09:00-18:00", "09:00-18:00", "09:00-18:00", "09:00-18:00", "09:00-17:00"], source: "manual" },
  },
  {
    id: "tue-vollpension",
    minutes: 60,
    kind: "cafe",
    title: "Vollpension + 3 galleries",
    about:
      "A café where grandmothers bake the cakes, on a street lined with contemporary galleries.",
    plan: "Cake at Vollpension, then wander into whichever galleries on Schleifmühlgasse are open.",
    lat: 48.1966,
    lng: 16.3651,
    query: "Vollpension Schleifmühlgasse Wien",
    hours: { week: daily("09:00-20:00"), source: "manual" },
  },
  {
    id: "tue-schnitzelwirt",
    minutes: 90,
    kind: "food",
    title: "Schnitzelwirt",
    about:
      "A plain neighbourhood tavern famous for portions that arrive larger than the plate.",
    plan: "Dinner, six minutes' walk from the hotel. Order one schnitzel between two and still expect leftovers.",
    lat: 48.1975,
    lng: 16.3486,
    query: "Schnitzelwirt Neubaugasse 52 Wien",
    hours: { week: [null, "11:00-21:30", "11:00-21:30", "11:00-21:30", "11:00-21:30", "11:00-21:30", "11:00-21:30"], source: "manual" },
  },
  {
    id: "wed-donaukanal",
    minutes: 45,
    kind: "walk",
    title: "Donaukanal",
    about:
      "The canal embankment through the middle of town, walled in legal graffiti and lined with bars on pontoons.",
    plan: "A flat walk along the water, as long or short as you feel. Nothing to book.",
    lat: 48.213,
    lng: 16.379,
    query: "Donaukanal Wien",
  },
  {
    id: "wed-swing",
    minutes: 45,
    kind: "food",
    title: "Swing Kitchen",
    about: "Austrian vegan fast food — burgers that started as a Heuriger family's side project.",
    plan: "Early dinner before the curtain. Yamm! at Schwedenplatz is the sit-down alternative.",
    lat: 48.2116,
    lng: 16.379,
    query: "Swing Kitchen Schwedenplatz Wien",
    hours: { week: daily("11:00-22:00"), source: "manual" },
  },
  {
    id: "wed-josephinum",
    kind: "museum",
    about: "A museum in an institution founded in 1785, known for its anatomical wax models used for teaching and for showing how medicine developed in Vienna.",
    plan: "A visit for anyone interested in where science, medicine and history meet. 60–90 minutes.",
    title: "Josephinum",
    lat: 48.2166,
    lng: 16.3513,
    query: "Josephinum Wien",
  },
  {
    id: "wed-deewan",
    kind: "food",
    about: "A simple, informal Pakistani restaurant with a buffet on an 'eat what you like, pay what you like' basis.",
    plan: "Try the dal and vegetable curry with rice. The official site says that since August 2025 the five curries on the buffet are vegan; still ask about the sides and dessert. 45–60 minutes.",
    title: "Der Wiener Deewan",
    lat: 48.2148,
    lng: 16.3557,
    query: "Der Wiener Deewan Wien",
  },
  {
    id: "wed-wrenkh",
    kind: "food",
    title: "Wrenkh",
    about: "Bauernmarkt 10.",
    plan: "Dinner with vegan options.",
    lat: 48.2106,
    lng: 16.3731,
    query: "Wrenkh Bauernmarkt 10 Wien",
  },
];

export const bookings = [
  "Upper Belvedere — Sun 20.9, 10:00",
  "CHINACY Karlsplatz — Sun 20.9, 16:45",
  "Opera, seats — Sun 20.9, 19:00",
  "Schönbrunn Palace Ticket — Mon 21.9, 11:00",
  "Plachutta Wollzeile — Mon 21.9, 19:30",
  "Palmenhaus — Tue 22.9, 12:45",
  "Figlmüller Bäckerstraße — Tue 22.9, 19:30",
  "TIAN Bistro — Wed 23.9, 19:00",
];

export const foodList: { title: string; items: { name: string; text: string }[] }[] = [
  {
    title: "Main dishes",
    items: [
      {
        name: "Wiener Schnitzel",
        text: 'Pounded veal. Ask for Kalb — anything labelled "Schnitzel Wiener Art" is pork. Served with lemon and potato salad',
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
        text: "Fermenting grape juice. ⚠️ Alcoholic. For a non-alcoholic drink ask for Traubenmost instead",
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
