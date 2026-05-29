// scripts/lib/enrichment-report.ts
import type { PlantEnrichment, FieldProvenance } from './enrichment-types';

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '_(saknas)_';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '_(tom)_';
  return String(v);
}

function fieldBlock(f: FieldProvenance): string {
  const src = f.sourceUrl ? `[källa](${f.sourceUrl})` : '_ingen källa_';
  const quote = f.quote ? `\n  > ${f.quote}` : '';
  const note = f.note ? `\n  _${f.note}_` : '';
  return (
    `- [ ] **${f.field}**: ${fmt(f.proposedValue)} ` +
    `(nu: ${fmt(f.currentValue)}) · konfidens: ${f.confidence} · ${src}${quote}${note}`
  );
}

/**
 * Render the human review gate. `isoDate` is passed in so the function stays
 * pure and testable. High/medium fields are approvable inline; low or flagged
 * fields are isolated under "Kräver din bedömning".
 */
export function renderReviewReport(
  records: PlantEnrichment[],
  batch: string,
  isoDate: string,
): string {
  const lines: string[] = [
    `# Granskning: ${batch}`,
    '',
    `Datum: ${isoDate} · Bocka i ✓ för fält du godkänner. Inget importeras utan din signoff.`,
    '',
  ];

  for (const plant of records) {
    lines.push(`## ${plant.commonName} (\`${plant.slug}\`)`, '');

    const ready = plant.fields.filter((f) => !f.flagged && f.confidence !== 'low');
    const review = plant.fields.filter((f) => f.flagged || f.confidence === 'low');

    if (ready.length) {
      lines.push('### Föreslås (källgrundat)', '');
      for (const f of ready) lines.push(fieldBlock(f));
      lines.push('');
    }
    if (review.length) {
      lines.push('### ⚠ Kräver din bedömning', '');
      for (const f of review) lines.push(fieldBlock(f));
      lines.push('');
    }
  }

  return lines.join('\n');
}
