// scripts/lib/plant-density.ts

/**
 * Convert a plant spacing (cm, from a Swedish seed-company plantavstånd) into
 * plants per 30×30 cm square, using the Square Foot Gardening grid method:
 * floor(30 / spacing) plants per side, squared. Spacing wider than the square
 * gives a fraction < 1 (the plant occupies multiple squares).
 *
 * This is the ONLY place plants_per_sqft is derived for new plants. Existing
 * values are left untouched unless a review flags a discrepancy.
 */
export function spacingToPlantsPerSqft(spacingCm: number): number {
  if (!(spacingCm > 0)) {
    throw new Error(`spacingCm must be positive, got ${spacingCm}`);
  }
  const perSide = 30 / spacingCm;
  if (perSide >= 1) {
    const whole = Math.floor(perSide);
    return whole * whole;
  }
  // Wider than one square: fractional, rounded to 2 decimals.
  return Math.round(perSide * perSide * 100) / 100;
}
