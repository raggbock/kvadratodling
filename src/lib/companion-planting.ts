export type CompanionKind = 'good' | 'bad';

export interface CompanionRelationship {
  plant1: string;
  plant2: string;
  kind: CompanionKind;
  reason: string;
}

// Canonical companion-planting pairs. Order of plant1/plant2 does not matter —
// getCompanionHint() checks both directions.
export const COMPANION_RELATIONSHIPS: CompanionRelationship[] = [
  // Good combinations
  { plant1: 'tomato', plant2: 'basil', kind: 'good', reason: 'Basil repels aphids and improves tomato flavor' },
  { plant1: 'tomato', plant2: 'carrot', kind: 'good', reason: 'Carrots loosen soil for tomato roots' },
  { plant1: 'tomato', plant2: 'marigold', kind: 'good', reason: 'Marigolds repel nematodes and whiteflies' },
  { plant1: 'tomato', plant2: 'parsley', kind: 'good', reason: 'Parsley attracts predatory insects that eat pests' },
  { plant1: 'basil', plant2: 'pepper', kind: 'good', reason: 'Basil repels aphids that attack peppers' },
  { plant1: 'carrot', plant2: 'onion', kind: 'good', reason: 'Onion scent deters carrot fly; carrot scent deters onion fly' },
  { plant1: 'carrot', plant2: 'leek', kind: 'good', reason: 'Leek deters carrot fly; carrot deters leek moth' },
  { plant1: 'carrot', plant2: 'radish', kind: 'good', reason: 'Radish loosens soil, making room for carrot roots' },
  { plant1: 'carrot', plant2: 'lettuce', kind: 'good', reason: 'Lettuce shades soil, keeping carrots moist' },
  { plant1: 'lettuce', plant2: 'radish', kind: 'good', reason: 'Radish marks slow-germinating lettuce rows and attracts flea beetles away' },
  { plant1: 'peas', plant2: 'carrot', kind: 'good', reason: 'Peas fix nitrogen that carrots use; roots aerate each other' },
  { plant1: 'peas', plant2: 'radish', kind: 'good', reason: 'Radish deters aphids and loosens soil for peas' },
  { plant1: 'peas', plant2: 'lettuce', kind: 'good', reason: 'Lettuce fills space under pea trellises efficiently' },
  { plant1: 'cucumber', plant2: 'dill', kind: 'good', reason: 'Dill attracts beneficial wasps that prey on cucumber beetles' },
  { plant1: 'cucumber', plant2: 'marigold', kind: 'good', reason: 'Marigolds deter cucumber beetles and aphids' },
  { plant1: 'cucumber', plant2: 'lettuce', kind: 'good', reason: 'Lettuce shades soil and deters slugs' },
  { plant1: 'green-beans', plant2: 'carrot', kind: 'good', reason: 'Beans fix nitrogen; carrots break up soil for bean roots' },
  { plant1: 'green-beans', plant2: 'marigold', kind: 'good', reason: 'Marigolds repel Mexican bean beetles' },
  { plant1: 'beet', plant2: 'onion', kind: 'good', reason: 'Onion deters beet leaf miners; beet loosens soil for onion' },
  { plant1: 'beet', plant2: 'lettuce', kind: 'good', reason: 'Both are cool-season crops that use space efficiently together' },
  { plant1: 'broccoli', plant2: 'onion', kind: 'good', reason: 'Onion deters cabbage worms and aphids on broccoli' },
  { plant1: 'broccoli', plant2: 'marigold', kind: 'good', reason: 'Marigolds repel cabbage moths and aphids' },
  { plant1: 'kale', plant2: 'marigold', kind: 'good', reason: 'Marigolds deter caterpillars and whiteflies on brassicas' },
  { plant1: 'spinach', plant2: 'radish', kind: 'good', reason: 'Radish deters leaf miners that target spinach' },
  { plant1: 'leek', plant2: 'carrot', kind: 'good', reason: 'Classic mutual protection — each deters the other\'s main pest' },
  { plant1: 'parsley', plant2: 'tomato', kind: 'good', reason: 'Parsley attracts predatory insects that eat tomato pests' },
  { plant1: 'zucchini', plant2: 'marigold', kind: 'good', reason: 'Marigolds deter squash beetles and vine borers' },

  // Bad combinations
  { plant1: 'tomato', plant2: 'cabbage', kind: 'bad', reason: 'Cabbage releases chemicals that stunt tomato growth' },
  { plant1: 'tomato', plant2: 'potato', kind: 'bad', reason: 'Both are Solanaceae — they share blight and other diseases' },
  { plant1: 'tomato', plant2: 'broccoli', kind: 'bad', reason: 'Brassicas and tomatoes compete for nutrients and inhibit each other' },
  { plant1: 'tomato', plant2: 'cauliflower', kind: 'bad', reason: 'Brassicas and tomatoes compete heavily and suppress each other' },
  { plant1: 'carrot', plant2: 'dill', kind: 'bad', reason: 'Dill inhibits carrot germination and stunts roots when mature' },
  { plant1: 'onion', plant2: 'peas', kind: 'bad', reason: 'Onion stunts pea growth' },
  { plant1: 'onion', plant2: 'green-beans', kind: 'bad', reason: 'Onion inhibits bean growth' },
  { plant1: 'garlic', plant2: 'peas', kind: 'bad', reason: 'Garlic stunts the growth of peas' },
  { plant1: 'garlic', plant2: 'green-beans', kind: 'bad', reason: 'Garlic inhibits bean growth' },
  { plant1: 'cabbage', plant2: 'strawberry', kind: 'bad', reason: 'Strawberry inhibits cabbage growth' },
  { plant1: 'potato', plant2: 'cucumber', kind: 'bad', reason: 'Both are susceptible to similar blights; proximity increases risk' },
  { plant1: 'potato', plant2: 'pumpkin', kind: 'bad', reason: 'Pumpkin vines shade out potato foliage' },
  { plant1: 'leek', plant2: 'peas', kind: 'bad', reason: 'Leek inhibits pea growth' },
  { plant1: 'leek', plant2: 'green-beans', kind: 'bad', reason: 'Leek inhibits bean growth' },
];

export interface CompanionHint {
  kind: CompanionKind;
  reason: string;
  otherPlantSlug: string;
}

/**
 * Returns companion hint between two plants, or null if no relationship is defined.
 */
export function getCompanionHint(slugA: string, slugB: string): CompanionHint | null {
  if (slugA === slugB) return null;
  const rel = COMPANION_RELATIONSHIPS.find(
    (r) =>
      (r.plant1 === slugA && r.plant2 === slugB) ||
      (r.plant1 === slugB && r.plant2 === slugA)
  );
  if (!rel) return null;
  return { kind: rel.kind, reason: rel.reason, otherPlantSlug: slugB };
}

/**
 * Given a plant and a list of its neighbors, returns all companion hints.
 */
export function getNeighborHints(plantSlug: string, neighborSlugs: string[]): CompanionHint[] {
  return neighborSlugs
    .map((n) => getCompanionHint(plantSlug, n))
    .filter((h): h is CompanionHint => h !== null);
}

/**
 * Returns all known companions (good or bad) for a single plant slug.
 * Deduplicates by the other plant — a pair listed in both directions in
 * COMPANION_RELATIONSHIPS yields a single hint (first occurrence wins).
 */
export function getAllCompanions(plantSlug: string): CompanionHint[] {
  const seen = new Set<string>();
  const hints: CompanionHint[] = [];
  for (const r of COMPANION_RELATIONSHIPS) {
    if (r.plant1 !== plantSlug && r.plant2 !== plantSlug) continue;
    const otherPlantSlug = r.plant1 === plantSlug ? r.plant2 : r.plant1;
    if (seen.has(otherPlantSlug)) continue;
    seen.add(otherPlantSlug);
    hints.push({ kind: r.kind, reason: r.reason, otherPlantSlug });
  }
  return hints;
}
