export interface CompanionMap {
  [slug: string]: { companions: string[]; antagonists: string[] };
}

const ORTHOGONAL = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

/**
 * Given the planted cells ("row:col" -> plantSlug) and the companion graph,
 * return the set of cell keys whose plant has an antagonist in an orthogonally
 * adjacent cell. The relationship is treated as symmetric: a conflict is flagged
 * if EITHER plant lists the other as an antagonist. Both cells of a conflicting
 * pair are returned so the UI can highlight both. Diagonal neighbours don't count.
 */
export function findConflictCells(
  planted: Map<string, string>,
  companions: CompanionMap,
): Set<string> {
  const conflicts = new Set<string>();
  for (const [key, slug] of planted) {
    const [r, c] = key.split(':').map(Number);
    const myAntagonists = companions[slug]?.antagonists ?? [];
    for (const [dr, dc] of ORTHOGONAL) {
      const neighbourKey = `${r + dr}:${c + dc}`;
      const neighbourSlug = planted.get(neighbourKey);
      if (!neighbourSlug) continue;
      const theirAntagonists = companions[neighbourSlug]?.antagonists ?? [];
      if (myAntagonists.includes(neighbourSlug) || theirAntagonists.includes(slug)) {
        conflicts.add(key);
      }
    }
  }
  return conflicts;
}
