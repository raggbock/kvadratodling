// Curated planting presets — colocated with the layout algorithm so each
// preset's `weights` is interpreted the same way everywhere.
//
// Each entry's `weight` is relative; the layout function distributes the
// available squares using the largest-remainder method, then fills the bed
// column-major so each plant gets a contiguous vertical strip — visually
// clean and matches how most people walk along a bed.

export interface PresetPlant {
  slug: string;
  weight: number; // relative; 3:1:1 means first plant gets 3× more squares than the others
}

export interface Preset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** Smallest bed (rows × cols) where this preset makes sense */
  minSquares: number;
  plants: PresetPlant[];
}

export const PRESETS: Preset[] = [
  {
    id: 'spenat',
    name: 'Spenatodling',
    emoji: '🥬',
    description: 'Tät spenatodling med lite gräslök för att hålla bladlöss borta.',
    minSquares: 4,
    plants: [
      { slug: 'spenat', weight: 5 },
      { slug: 'graslok', weight: 1 },
    ],
  },
  {
    id: 'sallad-mix',
    name: 'Salladsblandning',
    emoji: '🥗',
    description: 'Färggrann blandning för kontinuerlig skörd hela sommaren.',
    minSquares: 4,
    plants: [
      { slug: 'huvudsallat', weight: 3 },
      { slug: 'ruccola', weight: 2 },
      { slug: 'spenat', weight: 1 },
      { slug: 'graslok', weight: 1 },
    ],
  },
  {
    id: 'pizza',
    name: 'Pizzaträdgård',
    emoji: '🍕',
    description: 'Allt du behöver för en hemmagjord pizza eller pastasås.',
    minSquares: 6,
    plants: [
      { slug: 'tomat', weight: 3 },
      { slug: 'basilika', weight: 2 },
      { slug: 'oregano', weight: 1 },
      { slug: 'vitlok', weight: 1 },
    ],
  },
  {
    id: 'salsa',
    name: 'Salsa-trädgård',
    emoji: '🌶️',
    description: 'Färska smaker för salsa, guacamole och tex-mex.',
    minSquares: 6,
    plants: [
      { slug: 'tomat', weight: 3 },
      { slug: 'koriander', weight: 2 },
      { slug: 'jalapeno', weight: 1 },
      { slug: 'gullok', weight: 1 },
    ],
  },
  {
    id: 'rotfrukter',
    name: 'Rotfrukter',
    emoji: '🥕',
    description: 'Klassisk rotfruktsbädd — morötter, rödbetor och palsternacka för vintern.',
    minSquares: 4,
    plants: [
      { slug: 'morot', weight: 3 },
      { slug: 'rodbeta', weight: 2 },
      { slug: 'palsternacka', weight: 1 },
      { slug: 'radisa', weight: 1 },
    ],
  },
  {
    id: 'wok',
    name: 'Wok-trädgård',
    emoji: '🥢',
    description: 'Asiatiska smaker — pak choi, salladslök och färsk koriander.',
    minSquares: 6,
    plants: [
      { slug: 'pak-choi', weight: 2 },
      { slug: 'salladslok', weight: 1 },
      { slug: 'salladsgurka', weight: 1 },
      { slug: 'koriander', weight: 1 },
    ],
  },
  {
    id: 'pollinator',
    name: 'Pollinator-paket',
    emoji: '🐝',
    description: 'Lockar bin och nyttoinsekter — bra granne till alla andra bäddar.',
    minSquares: 4,
    plants: [
      { slug: 'ringblomma', weight: 2 },
      { slug: 'solros', weight: 1 },
      { slug: 'lavendel', weight: 1 },
      { slug: 'basilika', weight: 1 },
    ],
  },
];

/**
 * Largest-remainder allocation: distribute `total` units across N buckets
 * proportional to `weights`, exactly summing to `total`.
 */
function allocate(weights: number[], total: number): number[] {
  const sumW = weights.reduce((a, b) => a + b, 0);
  if (sumW === 0) return weights.map(() => 0);

  const exact = weights.map((w) => (w / sumW) * total);
  const counts = exact.map(Math.floor);
  let assigned = counts.reduce((a, b) => a + b, 0);

  // Distribute the remainder to the buckets with the largest fractional parts.
  const fracOrder = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);

  let k = 0;
  while (assigned < total) {
    counts[fracOrder[k % fracOrder.length].i] += 1;
    assigned += 1;
    k += 1;
  }
  return counts;
}

export interface PresetSlot {
  row: number;
  col: number;
  slug: string;
}

/**
 * Lay out a preset over a rows × cols grid, returning one slot per cell.
 * Column-major fill — each plant gets a contiguous vertical strip.
 */
export function applyPreset(rows: number, cols: number, preset: Preset): PresetSlot[] {
  const total = rows * cols;
  if (total === 0) return [];
  const counts = allocate(preset.plants.map((p) => p.weight), total);

  // Build a flat queue of slugs in order: [plant0×n0, plant1×n1, ...]
  const queue: string[] = [];
  preset.plants.forEach((p, i) => {
    for (let k = 0; k < counts[i]; k++) queue.push(p.slug);
  });

  const slots: PresetSlot[] = [];
  let idx = 0;
  // Column-major: walk col 0 top→bottom, then col 1, etc.
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const slug = queue[idx++];
      if (!slug) break;
      slots.push({ row: r, col: c, slug });
    }
  }
  return slots;
}
