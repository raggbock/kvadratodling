// Derives FAQ question/answer pairs for a plant detail page.
//
// TRUTH CONTRACT — read before editing:
//   * Every answer is built ONLY from a verified field on the plant row
//     (the same data shown elsewhere on the page and curated in the DB).
//   * If the field that would back an answer is missing, the question is
//     omitted entirely. We never invent a fact to fill a gap.
//   * Sowing timing is stored relative to the last frost date (it varies by
//     zone), so answers are phrased relative to frost — never as an absolute
//     month/date, which would be false for most of the country.
//
// The output feeds both the visible "Vanliga frågor" section and the
// FAQPage JSON-LD, so the two always say exactly the same thing.

import type { SunRequirement, WaterNeed } from './plant-display';

export interface FaqItem {
  question: string;
  answer: string;
}

// Decoupled from the DB row on purpose — the builder only sees verified facts,
// which keeps it trivially testable and impossible to feed unverified prose.
export interface PlantFaqInput {
  commonName: string;
  plantsPerSqft: number;
  sunRequirement: SunRequirement;
  waterNeed: WaterNeed;
  daysToMaturityMin: number | null;
  daysToMaturityMax: number | null;
  frostTolerant: boolean;
  sowIndoorsDaysBeforeFrost: number | null;
  directSowDaysBeforeFrost: number | null;
  transplantDaysAfterFrost: number | null;
  zonesMin: string | null;
  zonesMax: string | null;
  zonesNote: string | null;
  companions: string[];
  antagonists: string[];
}

// Natural placement phrasing — a faithful restatement of the enum, not a new
// fact. (SUN_LABELS/WATER_LABELS read as standalone labels; these read inside
// a sentence.)
const SUN_PHRASE: Record<SunRequirement, string> = {
  full_sun: 'soligt läge',
  part_shade: 'halvskugga',
  full_shade: 'skuggigt läge',
};
const WATER_PHRASE: Record<WaterNeed, string> = {
  low: 'lågt',
  medium: 'medelhögt',
  high: 'högt',
};

function naturalList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} och ${items[items.length - 1]}`;
}

// Days → "ca N vecka(or)", or "kring sista frosten" when within ~half a week.
function frostOffsetPhrase(days: number, side: 'före' | 'efter'): string {
  const abs = Math.abs(days);
  if (abs < 4) return 'kring sista frostnatten';
  const weeks = Math.round(abs / 7);
  return `ca ${weeks} ${weeks === 1 ? 'vecka' : 'veckor'} ${side} sista frost`;
}

function formatPerSquare(value: number): string {
  // Values are typically whole numbers (16, 9, 4, 1); keep any fraction
  // faithful with a Swedish decimal comma rather than rounding the fact away.
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
}

export function buildPlantFaq(p: PlantFaqInput): FaqItem[] {
  const lower = p.commonName.toLowerCase();
  const items: FaqItem[] = [];

  // 1. Plants per square — the signature kvadratodling question. Always present.
  if (p.plantsPerSqft >= 1) {
    items.push({
      question: `Hur många ${lower} kan jag odla per ruta?`,
      answer: `I kvadratodling får du plats med ${formatPerSquare(p.plantsPerSqft)} st per ruta på 30×30 cm.`,
    });
  } else {
    const squares = Math.round(1 / p.plantsPerSqft);
    items.push({
      question: `Hur många ${lower} kan jag odla per ruta?`,
      answer: `Den är storväxande och behöver gott om plats — räkna med ungefär ${squares} rutor (30×30 cm) per planta.`,
    });
  }

  // 2. Sowing — only if the data defines at least one sowing step. Phrased
  //    relative to last frost, with a pointer to the frost tool for the date.
  const sowParts: string[] = [];
  if (p.sowIndoorsDaysBeforeFrost != null) {
    const abs = Math.abs(p.sowIndoorsDaysBeforeFrost);
    const weeks = Math.round(abs / 7);
    sowParts.push(
      abs < 4
        ? 'förkultiveras inomhus kring sista frostnatten'
        : `förkultiveras inomhus ca ${weeks} ${weeks === 1 ? 'vecka' : 'veckor'} före sista frost`,
    );
  }
  if (p.directSowDaysBeforeFrost != null) {
    // Positive = before last frost, negative = after.
    const side = p.directSowDaysBeforeFrost >= 0 ? 'före' : 'efter';
    sowParts.push(`direktsås utomhus ${frostOffsetPhrase(p.directSowDaysBeforeFrost, side)}`);
  }
  if (p.transplantDaysAfterFrost != null) {
    sowParts.push(`planteras ut ${frostOffsetPhrase(p.transplantDaysAfterFrost, 'efter')}`);
  }
  if (sowParts.length > 0) {
    items.push({
      question: `När ska jag så ${lower}?`,
      answer: `${p.commonName} ${naturalList(sowParts)}. Exakt datum beror på din odlingszon — använd frostkalkylatorn för ditt läge.`,
    });
  }

  // 3. Time to harvest — only if maturity data exists.
  if (p.daysToMaturityMin != null || p.daysToMaturityMax != null) {
    const min = p.daysToMaturityMin;
    const max = p.daysToMaturityMax;
    const span = min != null && max != null && min !== max ? `${min}–${max} dagar` : `${min ?? max} dagar`;
    items.push({
      question: `Hur lång tid tar det innan ${lower} kan skördas?`,
      answer: `Den blir skördeklar på ungefär ${span}.`,
    });
  }

  // 4. Sun + water — both always present.
  items.push({
    question: `Hur mycket sol och vatten behöver ${lower}?`,
    answer: `Den vill stå i ${SUN_PHRASE[p.sunRequirement]} och har ${WATER_PHRASE[p.waterNeed]} vattenbehov.`,
  });

  // 5. Frost tolerance — boolean, always present.
  items.push({
    question: `Tål ${lower} frost?`,
    answer: p.frostTolerant
      ? 'Ja, den är frosttålig och klarar nattfrost på våren.'
      : 'Nej, den är frostkänslig och bör inte planteras ut förrän risken för nattfrost är över.',
  });

  // 6. Companion planting — only from verified compatibility data.
  if (p.companions.length > 0) {
    let answer = `Goda grannar är ${naturalList(p.companions)}.`;
    if (p.antagonists.length > 0) answer += ` Undvik däremot att plantera nära ${naturalList(p.antagonists)}.`;
    items.push({ question: `Vilka växter passar bra ihop med ${lower} i pallkragen?`, answer });
  } else if (p.antagonists.length > 0) {
    items.push({
      question: `Vilka växter bör jag inte plantera nära ${lower}?`,
      answer: `Undvik att plantera ${lower} nära ${naturalList(p.antagonists)}.`,
    });
  }

  // 7. Growing zones — only if a zone is set.
  if (p.zonesMin) {
    const span = p.zonesMax && p.zonesMax !== p.zonesMin ? `${p.zonesMin}–${p.zonesMax}` : p.zonesMin;
    let answer = `Den rekommenderas för odlingszon ${span} i Sverige.`;
    if (p.zonesNote) answer += ` ${p.zonesNote}`;
    items.push({ question: `Vilka odlingszoner passar ${lower}?`, answer });
  }

  return items;
}

// FAQPage structured data built from the SAME items rendered on the page.
export function faqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}
