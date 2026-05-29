// scripts/enrich-report.ts
//
// Usage: npx tsx scripts/enrich-report.ts <records.json> <batch-name>
// Reads a PlantEnrichment[] JSON (produced by the enrichment playbook run)
// and writes data/plants/review/<batch>.md.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { renderReviewReport } from './lib/enrichment-report';
import type { PlantEnrichment } from './lib/enrichment-types';

const [recordsPath, batch] = process.argv.slice(2);
if (!recordsPath || !batch) {
  console.error('Usage: npx tsx scripts/enrich-report.ts <records.json> <batch-name>');
  process.exit(1);
}

const records = JSON.parse(readFileSync(recordsPath, 'utf8')) as PlantEnrichment[];
const isoDate = new Date().toISOString().slice(0, 10);
const md = renderReviewReport(records, batch, isoDate);

mkdirSync('data/plants/review', { recursive: true });
const out = `data/plants/review/${batch}.md`;
writeFileSync(out, md, 'utf8');
console.log(`✓ Wrote ${out} (${records.length} plants)`);
