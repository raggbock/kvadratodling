// Square-foot gardening constants (all in cm)
const SQUARE_CM = 30;
const MAX_BED_WIDTH_CM = 120;       // 4 squares — reachable from both sides
const PATH_CM = 60;
const MAX_BED_LENGTH_SQUARES = 10;  // 300cm — longer beds are unwieldy
const MIN_BED_LENGTH_SQUARES = 4;   // 120cm — anything shorter isn't worth the path overhead

export interface BedConfig {
  name: string;
  cols: number; // width in squares
  rows: number; // depth in squares
}

export interface BedLayout {
  beds: BedConfig[];
  usedWidthCm: number;
  usedLengthCm: number;
}

/**
 * Packs the plot with square-foot beds in a 2-D grid.
 *
 * Beds are MAX_BED_WIDTH_CM wide (4 squares) and capped at MAX_BED_LENGTH_SQUARES
 * (10 squares / 300 cm) long. Each row of beds is separated from the next by a
 * PATH_CM-wide cross path; the final row can be shorter than the others to use
 * up remaining length (down to MIN_BED_LENGTH_SQUARES).
 *
 * Returns an empty layout when the plot is too small for at least one bed.
 */
export function computeOptimalBeds(widthCm: number, lengthCm: number): BedLayout {
  const BED_WIDTH_UNIT = MAX_BED_WIDTH_CM + PATH_CM; // 180cm per bed column (bed + path)

  // How many full-width beds fit across the width?
  // Last bed doesn't need a trailing path, so add PATH_CM back before dividing.
  const bedsAcrossWidth = Math.max(0, Math.floor((widthCm + PATH_CM) / BED_WIDTH_UNIT));

  if (bedsAcrossWidth === 0) {
    return { beds: [], usedWidthCm: 0, usedLengthCm: 0 };
  }

  const usedWidthCm = bedsAcrossWidth * MAX_BED_WIDTH_CM + (bedsAcrossWidth - 1) * PATH_CM;
  const bedCols = MAX_BED_WIDTH_CM / SQUARE_CM; // always 4

  // Pack rows of beds greedily along the length axis: each row consumes
  // PATH_CM (except the first) + N×SQUARE_CM. Stop when the remainder can't
  // hold a minimum-length bed.
  const beds: BedConfig[] = [];
  let usedLengthCm = 0;

  for (let rowIndex = 0; ; rowIndex++) {
    const pathBefore = rowIndex === 0 ? 0 : PATH_CM;
    const remainingCm = lengthCm - usedLengthCm - pathBefore;
    const squares = Math.min(MAX_BED_LENGTH_SQUARES, Math.floor(remainingCm / SQUARE_CM));
    if (squares < MIN_BED_LENGTH_SQUARES) break;

    usedLengthCm += pathBefore + squares * SQUARE_CM;
    for (let i = 0; i < bedsAcrossWidth; i++) {
      beds.push({
        name: `Odlingslåda ${beds.length + 1}`,
        cols: bedCols,
        rows: squares,
      });
    }
  }

  return { beds, usedWidthCm, usedLengthCm };
}

/**
 * Groups beds by physical size for display. e.g. for a layout of 3×(4×10) +
 * 3×(4×4), returns [{ size: "120×300", count: 3 }, { size: "120×120", count: 3 }].
 */
export function summarizeBedSizes(beds: BedConfig[]): { size: string; count: number }[] {
  const groups = new Map<string, number>();
  for (const b of beds) {
    const key = `${b.cols * SQUARE_CM}×${b.rows * SQUARE_CM}`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups.entries()].map(([size, count]) => ({ size, count }));
}
