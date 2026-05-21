import { PrismaClient, SunRequirement, WaterNeed, CompatibilityType } from "@prisma/client";

const prisma = new PrismaClient();

// Planting schedule fields use days relative to last frost date:
//   sowIndoorsDaysBeforeFrost: positive = N days BEFORE last frost
//   directSowDaysBeforeFrost:  positive = N days BEFORE last frost (cool-season crops)
//                              negative = N days AFTER last frost (warm-season crops)
//   transplantDaysAfterFrost:  positive = N days AFTER last frost

const PLANTS = [
  {
    slug: "cherry-tomato",
    commonName: "Cherry Tomato",
    scientificName: "Solanum lycopersicum var. cerasiforme",
    family: "Solanaceae",
    emoji: "🍅",
    plantsPerSqft: 1,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 60,
    daysToMaturityMax: 80,
    frostTolerant: false,
    sowIndoorsDaysBeforeFrost: 42,
    transplantDaysAfterFrost: 14,
    notes: "Needs support/staking. One of the most productive plants for small gardens.",
  },
  {
    slug: "beefsteak-tomato",
    commonName: "Beefsteak Tomato",
    scientificName: "Solanum lycopersicum",
    family: "Solanaceae",
    emoji: "🍅",
    plantsPerSqft: 0.25,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 80,
    daysToMaturityMax: 100,
    frostTolerant: false,
    sowIndoorsDaysBeforeFrost: 42,
    transplantDaysAfterFrost: 14,
    notes: "Indeterminate variety, needs strong cage or trellis. 1 plant per 4 sq ft.",
  },
  {
    slug: "butterhead-lettuce",
    commonName: "Butterhead Lettuce",
    scientificName: "Lactuca sativa var. capitata",
    family: "Asteraceae",
    emoji: "🥬",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.part_shade,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 55,
    daysToMaturityMax: 75,
    frostTolerant: true,
    directSowDaysBeforeFrost: 28,
    notes: "Bolts in heat — grow in spring or fall.",
  },
  {
    slug: "romaine-lettuce",
    commonName: "Romaine Lettuce",
    scientificName: "Lactuca sativa var. longifolia",
    family: "Asteraceae",
    emoji: "🥬",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.part_shade,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 70,
    daysToMaturityMax: 85,
    frostTolerant: true,
    directSowDaysBeforeFrost: 28,
    notes: "Upright growth, tolerates light frost.",
  },
  {
    slug: "spinach",
    commonName: "Spinach",
    scientificName: "Spinacia oleracea",
    family: "Amaranthaceae",
    emoji: "🌿",
    plantsPerSqft: 9,
    sunRequirement: SunRequirement.part_shade,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 40,
    daysToMaturityMax: 50,
    frostTolerant: true,
    directSowDaysBeforeFrost: 42,
    notes: "Cool-season crop, bolts quickly in heat.",
  },
  {
    slug: "carrot",
    commonName: "Carrot",
    scientificName: "Daucus carota",
    family: "Apiaceae",
    emoji: "🥕",
    plantsPerSqft: 16,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 70,
    daysToMaturityMax: 80,
    frostTolerant: true,
    directSowDaysBeforeFrost: 14,
    notes: "Needs loose, deep, well-drained soil. Thin to 3 inches apart.",
  },
  {
    slug: "radish",
    commonName: "Radish",
    scientificName: "Raphanus sativus",
    family: "Brassicaceae",
    emoji: "🫛",
    plantsPerSqft: 16,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 22,
    daysToMaturityMax: 35,
    frostTolerant: true,
    directSowDaysBeforeFrost: 28,
    notes: "One of the fastest crops. Great for filling gaps and as a row marker.",
  },
  {
    slug: "bush-bean",
    commonName: "Bush Bean",
    scientificName: "Phaseolus vulgaris",
    family: "Fabaceae",
    emoji: "🫘",
    plantsPerSqft: 9,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 50,
    daysToMaturityMax: 60,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "No support needed. Fixes nitrogen in soil.",
  },
  {
    slug: "pole-bean",
    commonName: "Pole Bean",
    scientificName: "Phaseolus vulgaris",
    family: "Fabaceae",
    emoji: "🫘",
    plantsPerSqft: 8,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 55,
    daysToMaturityMax: 65,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "Needs trellis or poles. More productive per sq ft than bush beans over a full season.",
  },
  {
    slug: "cucumber",
    commonName: "Cucumber",
    scientificName: "Cucumis sativus",
    family: "Cucurbitaceae",
    emoji: "🥒",
    plantsPerSqft: 0.5,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.high,
    daysToMaturityMin: 50,
    daysToMaturityMax: 70,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "Train vertically on trellis to save space.",
  },
  {
    slug: "zucchini",
    commonName: "Zucchini",
    scientificName: "Cucurbita pepo",
    family: "Cucurbitaceae",
    emoji: "🥬",
    plantsPerSqft: 0.25,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.high,
    daysToMaturityMin: 50,
    daysToMaturityMax: 65,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "Very productive. Harvest when small (6-8 inches) for best flavor.",
  },
  {
    slug: "sweet-pepper",
    commonName: "Sweet Pepper",
    scientificName: "Capsicum annuum",
    family: "Solanaceae",
    emoji: "🫑",
    plantsPerSqft: 1,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 70,
    daysToMaturityMax: 90,
    frostTolerant: false,
    sowIndoorsDaysBeforeFrost: 56,
    transplantDaysAfterFrost: 14,
    notes: "Likes warm soil. Start indoors 8-10 weeks before last frost.",
  },
  {
    slug: "jalapeno",
    commonName: "Jalapeño",
    scientificName: "Capsicum annuum",
    family: "Solanaceae",
    emoji: "🌶️",
    plantsPerSqft: 1,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 70,
    daysToMaturityMax: 85,
    frostTolerant: false,
    sowIndoorsDaysBeforeFrost: 56,
    transplantDaysAfterFrost: 14,
    notes: "Stress from dry conditions increases heat. Harvest green or red.",
  },
  {
    slug: "basil",
    commonName: "Basil",
    scientificName: "Ocimum basilicum",
    family: "Lamiaceae",
    emoji: "🌿",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 25,
    daysToMaturityMax: 35,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "Pinch flowers to keep leafy. Excellent companion for tomatoes.",
  },
  {
    slug: "parsley",
    commonName: "Parsley",
    scientificName: "Petroselinum crispum",
    family: "Apiaceae",
    emoji: "🌿",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.part_shade,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 70,
    daysToMaturityMax: 90,
    frostTolerant: true,
    directSowDaysBeforeFrost: 14,
    notes: "Slow to germinate. Biennial — often grown as annual.",
  },
  {
    slug: "cilantro",
    commonName: "Cilantro",
    scientificName: "Coriandrum sativum",
    family: "Apiaceae",
    emoji: "🌿",
    plantsPerSqft: 9,
    sunRequirement: SunRequirement.part_shade,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 45,
    daysToMaturityMax: 70,
    frostTolerant: true,
    directSowDaysBeforeFrost: 14,
    notes: "Bolts quickly in heat. Sow successively for continuous harvest.",
  },
  {
    slug: "dill",
    commonName: "Dill",
    scientificName: "Anethum graveolens",
    family: "Apiaceae",
    emoji: "🌿",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.low,
    daysToMaturityMin: 40,
    daysToMaturityMax: 60,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "Attracts beneficial insects. Keep away from fennel — they cross-pollinate.",
  },
  {
    slug: "kale",
    commonName: "Kale",
    scientificName: "Brassica oleracea var. sabellica",
    family: "Brassicaceae",
    emoji: "🥬",
    plantsPerSqft: 1,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 55,
    daysToMaturityMax: 75,
    frostTolerant: true,
    directSowDaysBeforeFrost: 28,
    notes: "Taste improves after frost. Harvest outer leaves to encourage growth.",
  },
  {
    slug: "swiss-chard",
    commonName: "Swiss Chard",
    scientificName: "Beta vulgaris subsp. vulgaris",
    family: "Amaranthaceae",
    emoji: "🌿",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.part_shade,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 50,
    daysToMaturityMax: 60,
    frostTolerant: true,
    directSowDaysBeforeFrost: 14,
    notes: "Cut-and-come-again. Tolerates both heat and light frost.",
  },
  {
    slug: "beet",
    commonName: "Beet",
    scientificName: "Beta vulgaris",
    family: "Amaranthaceae",
    emoji: "🟣",
    plantsPerSqft: 9,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 55,
    daysToMaturityMax: 70,
    frostTolerant: true,
    directSowDaysBeforeFrost: 28,
    notes: "Both greens and roots are edible. Thin seedlings to 4 inches.",
  },
  {
    slug: "broccoli",
    commonName: "Broccoli",
    scientificName: "Brassica oleracea var. italica",
    family: "Brassicaceae",
    emoji: "🥦",
    plantsPerSqft: 1,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 80,
    daysToMaturityMax: 100,
    frostTolerant: true,
    sowIndoorsDaysBeforeFrost: 42,
    transplantDaysAfterFrost: -14,
    notes: "Harvest central head before flowers open. Side shoots continue after main harvest.",
  },
  {
    slug: "marigold",
    commonName: "Marigold",
    scientificName: "Tagetes spp.",
    family: "Asteraceae",
    emoji: "🌼",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.low,
    daysToMaturityMin: 50,
    daysToMaturityMax: 60,
    frostTolerant: false,
    directSowDaysBeforeFrost: -14,
    notes: "Repels aphids, nematodes, and whiteflies. Excellent border plant.",
  },
  {
    slug: "sugar-snap-pea",
    commonName: "Sugar Snap Pea",
    scientificName: "Pisum sativum var. macrocarpon",
    family: "Fabaceae",
    emoji: "🫛",
    plantsPerSqft: 8,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 60,
    daysToMaturityMax: 70,
    frostTolerant: true,
    directSowDaysBeforeFrost: 42,
    notes: "Cool-season crop. Needs trellis. Plant early spring or fall.",
  },
  {
    slug: "onion",
    commonName: "Onion",
    scientificName: "Allium cepa",
    family: "Amaryllidaceae",
    emoji: "🧅",
    plantsPerSqft: 4,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.medium,
    daysToMaturityMin: 100,
    daysToMaturityMax: 120,
    frostTolerant: true,
    directSowDaysBeforeFrost: 28,
    notes: "Plant sets in early spring. Tops falling over signals maturity.",
  },
  {
    slug: "garlic",
    commonName: "Garlic",
    scientificName: "Allium sativum",
    family: "Amaryllidaceae",
    emoji: "🧄",
    plantsPerSqft: 9,
    sunRequirement: SunRequirement.full_sun,
    waterNeed: WaterNeed.low,
    daysToMaturityMin: 240,
    daysToMaturityMax: 270,
    frostTolerant: true,
    notes: "Plant cloves in fall, harvest next summer. Great space efficiency.",
  },
] as const;

type PlantSlug = (typeof PLANTS)[number]["slug"];

const COMPATIBILITY: Array<{
  plant: PlantSlug;
  other: PlantSlug;
  relationship: CompatibilityType;
  notes?: string;
}> = [
  // Tomato companions
  { plant: "cherry-tomato", other: "basil", relationship: CompatibilityType.companion, notes: "Basil repels aphids and improves tomato flavor" },
  { plant: "cherry-tomato", other: "marigold", relationship: CompatibilityType.companion, notes: "Marigolds repel nematodes and aphids" },
  { plant: "cherry-tomato", other: "carrot", relationship: CompatibilityType.companion, notes: "Carrots loosen soil around tomato roots" },
  { plant: "cherry-tomato", other: "parsley", relationship: CompatibilityType.companion },
  { plant: "cherry-tomato", other: "kale", relationship: CompatibilityType.antagonist, notes: "Both heavy feeders, compete for nutrients" },
  { plant: "beefsteak-tomato", other: "basil", relationship: CompatibilityType.companion, notes: "Basil repels aphids and improves tomato flavor" },
  { plant: "beefsteak-tomato", other: "marigold", relationship: CompatibilityType.companion },

  // Basil
  { plant: "basil", other: "sweet-pepper", relationship: CompatibilityType.companion, notes: "Basil repels aphids and spider mites from peppers" },
  { plant: "basil", other: "jalapeno", relationship: CompatibilityType.companion },

  // Bean companions
  { plant: "bush-bean", other: "carrot", relationship: CompatibilityType.companion },
  { plant: "bush-bean", other: "beet", relationship: CompatibilityType.companion, notes: "Beans fix nitrogen that benefits beets" },
  { plant: "bush-bean", other: "onion", relationship: CompatibilityType.antagonist, notes: "Onions inhibit bean growth" },
  { plant: "bush-bean", other: "garlic", relationship: CompatibilityType.antagonist },
  { plant: "pole-bean", other: "carrot", relationship: CompatibilityType.companion },
  { plant: "pole-bean", other: "onion", relationship: CompatibilityType.antagonist },

  // Brassica family
  { plant: "kale", other: "onion", relationship: CompatibilityType.companion, notes: "Onions repel cabbage worms" },
  { plant: "kale", other: "marigold", relationship: CompatibilityType.companion, notes: "Marigolds deter cabbage pests" },
  { plant: "broccoli", other: "onion", relationship: CompatibilityType.companion },
  { plant: "broccoli", other: "marigold", relationship: CompatibilityType.companion },
  { plant: "radish", other: "carrot", relationship: CompatibilityType.companion, notes: "Radish loosens soil for carrots and deters carrot fly" },
  { plant: "radish", other: "cucumber", relationship: CompatibilityType.companion, notes: "Radish repels cucumber beetles" },

  // Carrot companions
  { plant: "carrot", other: "onion", relationship: CompatibilityType.companion, notes: "Onion scent deters carrot fly" },
  { plant: "carrot", other: "garlic", relationship: CompatibilityType.companion },
  { plant: "carrot", other: "parsley", relationship: CompatibilityType.companion },

  // Cucurbits
  { plant: "cucumber", other: "marigold", relationship: CompatibilityType.companion, notes: "Deters aphids and beetles" },
  { plant: "cucumber", other: "dill", relationship: CompatibilityType.companion, notes: "Attracts beneficial insects that prey on cucumber pests" },
  { plant: "zucchini", other: "marigold", relationship: CompatibilityType.companion },

  // Alliums
  { plant: "onion", other: "garlic", relationship: CompatibilityType.companion, notes: "Both repel many common pests" },
  { plant: "onion", other: "carrot", relationship: CompatibilityType.companion },

  // Pea companions
  { plant: "sugar-snap-pea", other: "carrot", relationship: CompatibilityType.companion, notes: "Classic pairing; peas fix nitrogen for carrots" },
  { plant: "sugar-snap-pea", other: "radish", relationship: CompatibilityType.companion },
  { plant: "sugar-snap-pea", other: "onion", relationship: CompatibilityType.antagonist, notes: "Onions stunt pea growth" },
  { plant: "sugar-snap-pea", other: "garlic", relationship: CompatibilityType.antagonist },

  // Lettuce / greens
  { plant: "butterhead-lettuce", other: "radish", relationship: CompatibilityType.companion, notes: "Radish deters lettuce aphids" },
  { plant: "butterhead-lettuce", other: "carrot", relationship: CompatibilityType.companion },
  { plant: "spinach", other: "beet", relationship: CompatibilityType.companion, notes: "Both cool-season, grow well together" },

  // Garlic as pest deterrent
  { plant: "garlic", other: "marigold", relationship: CompatibilityType.companion, notes: "Both are broad-spectrum pest deterrents" },

  // Dill
  { plant: "dill", other: "cucumber", relationship: CompatibilityType.companion },
  { plant: "dill", other: "carrot", relationship: CompatibilityType.antagonist, notes: "Dill stunts carrot growth when mature; fine when young" },
];

async function main() {
  console.log(`Seeding ${PLANTS.length} plants...`);

  const slugToId: Record<string, string> = {};

  for (const plant of PLANTS) {
    const created = await prisma.plant.upsert({
      where: { slug: plant.slug },
      update: { ...plant, plantsPerSqft: plant.plantsPerSqft.toString() },
      create: { ...plant, plantsPerSqft: plant.plantsPerSqft.toString() },
    });
    slugToId[plant.slug] = created.id;
    console.log(`  ✓ ${created.emoji} ${created.commonName}`);
  }

  console.log(`\nSeeding ${COMPATIBILITY.length} companion/antagonist pairs (×2 for bidirectional)...`);

  for (const entry of COMPATIBILITY) {
    const plantId = slugToId[entry.plant];
    const otherId = slugToId[entry.other];

    await prisma.plantCompatibility.upsert({
      where: { plantId_otherPlantId: { plantId, otherPlantId: otherId } },
      update: { relationship: entry.relationship, notes: entry.notes ?? null },
      create: { plantId, otherPlantId: otherId, relationship: entry.relationship, notes: entry.notes ?? null },
    });

    await prisma.plantCompatibility.upsert({
      where: { plantId_otherPlantId: { plantId: otherId, otherPlantId: plantId } },
      update: { relationship: entry.relationship, notes: entry.notes ?? null },
      create: { plantId: otherId, otherPlantId: plantId, relationship: entry.relationship, notes: entry.notes ?? null },
    });
  }

  const plantCount = await prisma.plant.count();
  const compatCount = await prisma.plantCompatibility.count();
  console.log(`\nDone. ${plantCount} plants, ${compatCount} compatibility pairs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
