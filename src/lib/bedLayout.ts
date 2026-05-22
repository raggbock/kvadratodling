// Square-foot gardening constants (all in cm)
const SQUARE_CM = 30;
const MAX_BED_WIDTH_CM = 120; // 4 squares — reachable from both sides
const PATH_CM = 60;
const MAX_BED_LENGTH_SQUARES = 10; // 300cm; longer beds are unwieldy

export interface BedConfig {
  name: string;
  cols: number; // width in squares
  rows: number; // depth in squares
}

export interface BedLayout {
  beds: BedConfig[];
  bedsAcrossWidth: number;
  bedCols: number;
  bedRows: number;
  usedWidthCm: number;
  usedLengthCm: number;
}

/**
 * Computes the optimal square-foot bed arrangement for a garden plot.
 *
 * Beds run parallel to the length axis, separated by 60cm paths.
 * Each bed is max 120cm wide (4 squares) and up to 300cm long (10 squares).
 *
 * Returns an empty layout when the plot is too small for at least one bed.
 */
export function computeOptimalBeds(widthCm: number, lengthCm: number): BedLayout {
  const BED_UNIT = MAX_BED_WIDTH_CM + PATH_CM; // 180cm per bed column (bed + path)

  // How many beds fit across the width?
  // Last bed doesn't need a trailing path, so add PATH_CM back before dividing.
  const bedsAcrossWidth = Math.max(0, Math.floor((widthCm + PATH_CM) / BED_UNIT));

  const bedCols = MAX_BED_WIDTH_CM / SQUARE_CM; // always 4
  const bedRows = Math.min(Math.floor(lengthCm / SQUARE_CM), MAX_BED_LENGTH_SQUARES);

  const usedWidthCm = bedsAcrossWidth > 0
    ? bedsAcrossWidth * MAX_BED_WIDTH_CM + (bedsAcrossWidth - 1) * PATH_CM
    : 0;
  const usedLengthCm = bedRows * SQUARE_CM;

  const beds: BedConfig[] = Array.from({ length: bedsAcrossWidth }, (_, i) => ({
    name: `Odlingslåda ${i + 1}`,
    cols: bedCols,
    rows: bedRows,
  }));

  return { beds, bedsAcrossWidth, bedCols, bedRows, usedWidthCm, usedLengthCm };
}
