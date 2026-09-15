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
  stops: Stop[];
  /** Fallbacks for the day — same shape as a stop, so they can be added to it. */
  alternatives: Stop[];
};

export const HOTEL = {
  name: "Jaz in the City Vienna",
  address: "Windmühlgasse 3, 1060 Wien",
  lat: 48.1979,
  lng: 16.3576,
  query: "Jaz in the City Vienna",
};

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

const breakfast = (day: string): Stop => ({
  id: `${day}-hotel`,
  kind: "hotel",
  time: "08:30",
  title: HOTEL.name,
  about: `Your hotel at ${HOTEL.address}, one street off Mariahilfer Straße.`,
  plan: "Wake up around 08:00–09:00, breakfast downstairs, out the door by 10:00.",
  fixed: true,
  lat: HOTEL.lat,
  lng: HOTEL.lng,
  query: HOTEL.query,
  hours: { week: daily("06:30-10:30"), note: "Breakfast service", source: "manual" },
});

export const days: Day[] = [
  {
    id: "sat",
    iso: "2026-09-19",
    date: "Sep 19",
    weekday: "Saturday",
    theme: "Arrival",
    warn: "You land late — the whole day is really just check-in and dinner",
    stops: [
      {
        id: "sat-hotel",
        minutes: 60,
        kind: "hotel",
        time: "18:00",
        title: HOTEL.name,
        about: `Your hotel at ${HOTEL.address}, a two-minute walk from Mariahilfer Straße.`,
        plan: "Arrive, check in, drop the bags and change before dinner.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
      {
        id: "sat-plachutta",
        minutes: 120,
        kind: "food",
        time: "19:30",
        title: "Plachutta Wollzeile 38",
        about:
          "The Tafelspitz institution since 1993 — boiled beef served in its copper pot, still the dish Vienna is judged by.",
        plan:
          "Dinner. 20 minutes by U3 from the hotel, so leave by 19:00. Book ahead, this place fills up.",
        warn:
          "Soup first, with the bread and the marrow bone, then the beef. One portion feeds two. Skip the tartare",
        lat: 48.2087,
        lng: 16.3775,
        query: "Plachutta Wollzeile 38 Wien",
        hours: { week: daily("11:30-23:30"), source: "manual" },
      },
      {
        id: "sat-back",
        kind: "hotel",
        time: "21:30",
        title: "Back to the hotel",
        about: `${HOTEL.name}, ${HOTEL.address}.`,
        plan: "After dinner. Nothing else is open by now and you have been travelling all day.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
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
    theme: "Art, a walk and a concert",
    star: true,
    warn: "Every shop in Vienna is closed. Museums, cafés and restaurants are open",
    stops: [
      breakfast("sun"),
      {
        id: "sun-belvedere",
        minutes: 120,
        kind: "museum",
        time: "10:15",
        title: "Belvedere",
        about:
          "A baroque palace holding the world's largest Klimt collection — The Kiss hangs in the Upper Belvedere.",
        plan:
          "Two hours, Upper Belvedere only. Go straight to The Kiss before the tour groups land, then work backwards through the rest.",
        lat: 48.1915,
        lng: 16.3809,
        query: "Belvedere Wien",
        hours: { week: daily("09:00-18:00"), source: "manual" },
      },
      {
        id: "sun-beethovengang",
        minutes: 45,
        kind: "walk",
        time: "12:30",
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
        id: "sun-palmenhaus",
        minutes: 90,
        kind: "food",
        time: "14:30",
        title: "Palmenhaus",
        about:
          "The imperial glass palm house of 1901 on the Burggarten — a brasserie under the iron and glass, with palms still growing inside.",
        plan:
          "Late lunch on the way back into town, and it is open all day Sunday. Order the pumpkin soup with pumpkin seed oil.",
        lat: 48.2047,
        lng: 16.3673,
        query: "Palmenhaus Burggarten Wien",
        hours: {
          week: [
            "09:00-23:00",
            "10:00-23:00",
            "10:00-23:00",
            "10:00-23:00",
            "10:00-23:00",
            "10:00-23:00",
            "09:00-23:00",
          ],
          source: "manual",
        },
      },
      {
        id: "sun-konzerthaus",
        minutes: 120,
        kind: "concert",
        time: "19:00",
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
        id: "sun-gerstner",
        minutes: 45,
        kind: "cafe",
        time: "21:30",
        title: "Gerstner",
        about:
          "Imperial court confectioner since 1847, three floors above Kärntner Straße opposite the opera.",
        plan:
          "A cake and a Melange after the concert — five minutes' walk from the Konzerthaus and the only place at this level still open.",
        lat: 48.2039,
        lng: 16.3705,
        query: "Gerstner Kärntner Strasse 51 Wien",
        hours: { week: daily("10:00-23:00"), source: "manual" },
      },
      {
        id: "sun-back",
        kind: "hotel",
        time: "22:15",
        title: "Back to the hotel",
        about: `${HOTEL.name}, ${HOTEL.address}.`,
        plan: "After the cake at Gerstner — the last stop of the day.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
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
    theme: "Nature and markets",
    closed:
      "KHM, Secession, Wien Museum, Josephinum, Narrenturm, galleries, Schnitzelwirt, Staud's",
    open: "Prunksaal, Schatzkammer, Café Central, Zuckerlwerkstatt, Albertina, Leopold",
    stops: [
      breakfast("mon"),
      {
        id: "mon-lainzer",
        minutes: 150,
        kind: "park",
        time: "10:15",
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
        time: "14:30",
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
        id: "mon-prunksaal",
        minutes: 45,
        kind: "sight",
        time: "16:00",
        title: "Prunksaal",
        about:
          "The State Hall of the Austrian National Library, 1726 — an 80-metre baroque room of dark wood, frescoes and two giant Renaissance globes.",
        plan:
          "45 minutes is enough. Last entry is 17:30, so do not push it later.",
        star: true,
        lat: 48.2064,
        lng: 16.366,
        query: "Prunksaal Josefsplatz 1 Wien",
        hours: { week: daily("10:00-18:00"), note: "Last entry 17:30", source: "manual" },
      },
      {
        id: "mon-central",
        minutes: 45,
        kind: "cafe",
        time: "17:00",
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
        time: "17:45",
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
        time: "20:00",
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
        id: "mon-back",
        kind: "hotel",
        time: "21:30",
        title: "Back to the hotel",
        about: `${HOTEL.name}, ${HOTEL.address}.`,
        plan: "After dinner at Figlmüller.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
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
    theme: "City, shops, galleries",
    closed: "Schatzkammer, Leopold",
    stops: [
      breakfast("tue"),
      {
        id: "tue-khm",
        minutes: 120,
        kind: "museum",
        time: "10:15",
        title: "Kunsthistorisches Museum",
        about:
          "The Habsburg art collection in a purpose-built palace — the largest Bruegel room anywhere, plus Vermeer and Caravaggio.",
        plan:
          "Two hours, picture gallery only. Bruegel first (Tower of Babel, Hunters in the Snow), then the Kunstkammer if legs allow.",
        lat: 48.2038,
        lng: 16.3616,
        query: "Kunsthistorisches Museum Wien",
        hours: {
          week: ["10:00-18:00", null, "10:00-18:00", "10:00-18:00", "10:00-21:00", "10:00-18:00", "10:00-18:00"],
          note: "Closed Mondays, late on Thursdays",
          source: "manual",
        },
      },
      {
        id: "tue-ankeruhr",
        minutes: 15,
        kind: "sight",
        time: "12:00",
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
        time: "12:30",
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
        time: "14:00",
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
        time: "15:00",
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
        time: "16:30",
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
        time: "17:15",
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
        time: "20:00",
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
        id: "tue-back",
        kind: "hotel",
        time: "21:30",
        title: "Back to the hotel",
        about: `${HOTEL.name}, ${HOTEL.address}.`,
        plan: "After Schnitzelwirt, which is the closest dinner to the hotel all week.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
    ],
    alternatives: [
      {
        id: "alt-tue-demel",
        minutes: 45,
        kind: "cafe",
        title: "Demel",
        about: "Imperial court bakery on the Kohlmarkt, where the bakers work behind glass.",
        plan: "Kaiserschmarrn made in front of you. Half an hour.",
        lat: 48.2091,
        lng: 16.369,
        query: "Demel Kohlmarkt Wien",
      },
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
    theme: "Vegan + opera",
    star: true,
    warn: "The vegan kitchen closes at 22:00 and the opera runs to 22:15 — eat before, not after",
    stops: [
      breakfast("wed"),
      {
        id: "wed-josephinum",
        minutes: 60,
        kind: "museum",
        time: "10:15",
        title: "Josephinum",
        about:
          "Twelve hundred anatomical wax models, made in Florence in the 1780s so army surgeons could learn without corpses, in the old military-medical academy.",
        plan:
          "An hour. Two minutes from the Deewan, where you eat next.",
        star: true,
        lat: 48.2166,
        lng: 16.3513,
        query: "Josephinum Wien",
      },
      {
        id: "wed-deewan",
        minutes: 60,
        kind: "food",
        time: "12:30",
        title: "Der Wiener Deewan",
        about:
          "Pakistani canteen run on a pay-as-you-wish basis — the curries are all vegan and the students keep it full.",
        plan: "Lunch, 400 m from the Josephinum. Take what you want, pay what you think it was worth.",
        lat: 48.2148,
        lng: 16.3557,
        query: "Der Wiener Deewan Wien",
        hours: { week: [null, "11:00-22:00", "11:00-22:00", "11:00-22:00", "11:00-22:00", "11:00-22:00", "11:00-22:00"], source: "manual" },
      },
      {
        id: "wed-donaukanal",
        minutes: 45,
        kind: "walk",
        time: "14:30",
        title: "Donaukanal",
        about:
          "The canal embankment through the middle of town, walled in legal graffiti and lined with bars on pontoons.",
        plan: "A flat walk along the water, as long or short as you feel. Nothing to book.",
        lat: 48.213,
        lng: 16.379,
        query: "Donaukanal Wien",
      },
      {
        id: "wed-rest",
        minutes: 60,
        kind: "hotel",
        time: "15:30",
        title: "Hotel — rest and change",
        about: "Your own room, ten minutes from the opera house.",
        plan: "Rest and change — the opera is long and you have been walking for five days.",
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
      },
      {
        id: "wed-swing",
        minutes: 45,
        kind: "food",
        time: "17:00",
        title: "Swing Kitchen",
        about: "Austrian vegan fast food — burgers that started as a Heuriger family's side project.",
        plan: "Early dinner before the curtain. Yamm! at Schwedenplatz is the sit-down alternative.",
        lat: 48.2116,
        lng: 16.379,
        query: "Swing Kitchen Schwedenplatz Wien",
        hours: { week: daily("11:00-22:00"), source: "manual" },
      },
      {
        id: "wed-oper",
        minutes: 195,
        kind: "concert",
        time: "19:00",
        title: "Wiener Staatsoper",
        about:
          "The 1869 state opera house, still running a different production almost every night of the season.",
        plan:
          "La clemenza di Tito. Be seated by 18:45. Ends around 22:15 — hence the early dinner.",
        star: true,
        lat: 48.203,
        lng: 16.369,
        query: "Wiener Staatsoper",
      },
      {
        id: "wed-back",
        kind: "hotel",
        time: "22:30",
        title: "Back to the hotel",
        about: `${HOTEL.name}, ${HOTEL.address}.`,
        plan: "The opera ends around 22:15, so this is the walk straight back.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
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
    warn: "You leave straight after breakfast — nothing else fits this morning",
    stops: [
      {
        id: "thu-hotel",
        minutes: 60,
        kind: "hotel",
        time: "08:00",
        title: HOTEL.name,
        about: `Your hotel at ${HOTEL.address}.`,
        plan: "Last breakfast, pack, check out.",
        fixed: true,
        lat: HOTEL.lat,
        lng: HOTEL.lng,
        query: HOTEL.query,
        hours: { week: daily("06:30-10:30"), note: "Breakfast service", source: "manual" },
      },
      {
        id: "thu-depart",
        minutes: 30,
        kind: "transport",
        time: "09:00",
        title: "Leave for the airport",
        about: "City Airport Train or the S7 from Wien Mitte, about 20–25 minutes to VIE.",
        plan: "Out of the hotel by 09:00. Anything you still want is on the wish list below.",
        fixed: true,
        lat: 48.2065,
        lng: 16.3854,
        query: "Wien Mitte Bahnhof",
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
    title: "Mariahilfer Straße",
    about: "The long pedestrian shopping street your hotel sits behind.",
    plan: "Shops run to about 19:00 on weekdays and 18:00 on Saturday. Closed Sunday.",
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
    id: "w-demel",
    kind: "cafe",
    title: "Demel",
    about: "Imperial court bakery on the Kohlmarkt, where the bakers work behind glass.",
    plan: "Kaiserschmarrn made in front of you. Half an hour, any afternoon.",
    lat: 48.2091,
    lng: 16.369,
    query: "Demel Kohlmarkt Wien",
    hours: { week: daily("10:00-19:00"), source: "manual" },
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
