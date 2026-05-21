// Swedish growing zones based on approximate last/first frost dates.
// Sources: Riksförbundet Svensk Trädgård zone map, SMHI frost data,
// plantmaps.com frost date maps, and garden.org city calendars.
//
// The "zones" here are informal growing region groupings useful for
// vegetable gardening (not the official woody-plant hardiness zones).
//
// lastFrostMD / firstFrostMD format: "MM-DD" — these are AVERAGES.
// Gardeners should add a safety margin of 7-14 days for tender plants.

export interface SwedishZone {
  id: string;
  name: string;
  nameSv: string;
  description: string;
  /** Representative cities / areas */
  cities: string[];
  /** Average last spring frost date (MM-DD) */
  lastFrostMD: string;
  /** Average first autumn frost date (MM-DD) */
  firstFrostMD: string;
  /** Average frost-free growing days */
  frostFreeDays: number;
  /** Approximate USDA hardiness zone range */
  usdaZone: string;
  /** Riksförbundet Svensk Trädgård zone (woody plants, 1=mildest, 8=harshest) */
  svTradgardZone: string;
}

export const SWEDISH_ZONES: SwedishZone[] = [
  {
    id: "Z1",
    name: "Southernmost Sweden",
    nameSv: "Sydligaste Sverige (Skåne)",
    description:
      "The warmest, mildest part of Sweden. Long growing season, mild winters. Excellent for most vegetables and even some borderline-hardy crops.",
    cities: ["Malmö", "Helsingborg", "Kristianstad", "Ystad", "Trelleborg"],
    lastFrostMD: "04-01",
    firstFrostMD: "11-01",
    frostFreeDays: 213,
    usdaZone: "7b–8a",
    svTradgardZone: "1",
  },
  {
    id: "Z2",
    name: "West Coast & Southwest",
    nameSv: "Västkusten & Sydväst",
    description:
      "Maritime climate from the North Sea keeps winters mild and summers moderate. Gothenburg area. Good growing season for most vegetables.",
    cities: ["Gothenburg", "Göteborg", "Kungsbacka", "Halmstad", "Varberg", "Borås"],
    lastFrostMD: "04-15",
    firstFrostMD: "10-15",
    frostFreeDays: 183,
    usdaZone: "7a–7b",
    svTradgardZone: "1–2",
  },
  {
    id: "Z3",
    name: "South-Central Sweden",
    nameSv: "Sydcentrala Sverige",
    description:
      "Includes the Götaland plains, eastern coast to Blekinge. Continental influence, warm summers, cold but manageable winters.",
    cities: ["Växjö", "Karlskrona", "Kalmar", "Jönköping", "Linköping", "Norrköping"],
    lastFrostMD: "04-20",
    firstFrostMD: "10-10",
    frostFreeDays: 173,
    usdaZone: "6b–7a",
    svTradgardZone: "2–3",
  },
  {
    id: "Z4",
    name: "Mälardalen & Greater Stockholm",
    nameSv: "Mälardalen & Storstockholm",
    description:
      "Lake Mälaren moderates temperatures. Stockholm's urban heat island extends the season. Good for most vegetables, challenging for heat-lovers.",
    cities: ["Stockholm", "Uppsala", "Västerås", "Örebro", "Eskilstuna", "Södertälje"],
    lastFrostMD: "05-01",
    firstFrostMD: "11-01",
    frostFreeDays: 184,
    usdaZone: "6a–6b",
    svTradgardZone: "3–4",
  },
  {
    id: "Z5",
    name: "East Coast Mid-Sweden",
    nameSv: "Ostkusten Mellansverige",
    description:
      "Baltic Sea coast from Gävle to Söderhamn. Cooler than Stockholm, shorter season. Hardy vegetables recommended.",
    cities: ["Gävle", "Söderhamn", "Hudiksvall", "Nyköping", "Norrköping coast"],
    lastFrostMD: "05-10",
    firstFrostMD: "10-01",
    frostFreeDays: 144,
    usdaZone: "5b–6a",
    svTradgardZone: "4–5",
  },
  {
    id: "Z6",
    name: "North-Central Sweden",
    nameSv: "Norrlands Kust (Sundsvall–Härnösand)",
    description:
      "Shorter growing season, cold winters. Focus on fast-maturing varieties and cold-tolerant crops. Good light in summer compensates.",
    cities: ["Sundsvall", "Härnösand", "Kramfors", "Örnsköldsvik"],
    lastFrostMD: "05-15",
    firstFrostMD: "09-20",
    frostFreeDays: 128,
    usdaZone: "5a–5b",
    svTradgardZone: "5–6",
  },
  {
    id: "Z7",
    name: "Northern Sweden",
    nameSv: "Övre Norrland (Umeå–Luleå)",
    description:
      "Short but intense growing season with very long summer days. Choose early-maturing varieties. Frost risk well into June.",
    cities: ["Umeå", "Skellefteå", "Luleå", "Piteå", "Boden"],
    lastFrostMD: "06-01",
    firstFrostMD: "09-10",
    frostFreeDays: 101,
    usdaZone: "4a–5a",
    svTradgardZone: "6–7",
  },
  {
    id: "Z8",
    name: "Far North & Highlands",
    nameSv: "Fjäll & Lapland",
    description:
      "Subarctic conditions. Very short season (60–80 days), midnight sun. Extremely hardy varieties and cold frames recommended.",
    cities: ["Kiruna", "Gällivare", "Jokkmokk", "Östersund", "Åre", "Lycksele"],
    lastFrostMD: "06-15",
    firstFrostMD: "08-25",
    frostFreeDays: 71,
    usdaZone: "2a–4a",
    svTradgardZone: "7–8",
  },
];

/** Look up a zone by its id (e.g. "Z4") */
export function getZoneById(id: string): SwedishZone | undefined {
  return SWEDISH_ZONES.find((z) => z.id === id);
}

/**
 * Given a lastFrostMD string like "05-01", return a Date for the
 * current calendar year. Useful for calculating planting windows.
 */
export function lastFrostDateForYear(
  lastFrostMD: string,
  year = new Date().getFullYear()
): Date {
  const [month, day] = lastFrostMD.split("-").map(Number);
  return new Date(year, month - 1, day);
}
