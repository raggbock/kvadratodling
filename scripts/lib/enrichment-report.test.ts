// scripts/lib/enrichment-report.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReviewReport } from './enrichment-report';
import type { PlantEnrichment } from './enrichment-types';

const sample: PlantEnrichment[] = [
  {
    slug: 'morot',
    commonName: 'Morot',
    fields: [
      {
        field: 'days_to_maturity_max',
        proposedValue: 100,
        currentValue: null,
        sourceUrl: 'https://www.impecta.se/morot',
        quote: 'Skördetid cirka 90–100 dagar efter sådd.',
        confidence: 'high',
        flagged: false,
      },
      {
        field: 'companions',
        proposedValue: ['lok'],
        currentValue: null,
        sourceUrl: null,
        quote: null,
        confidence: 'low',
        flagged: true,
        note: 'Folklore — ingen källa i allowlisten bekräftar.',
      },
    ],
  },
];

test('renders the batch heading and date', () => {
  const md = renderReviewReport(sample, 'pilot-01', '2026-05-29');
  assert.match(md, /pilot-01/);
  assert.match(md, /2026-05-29/);
});

test('high-confidence field shows value, source, quote and an approve checkbox', () => {
  const md = renderReviewReport(sample, 'pilot-01', '2026-05-29');
  assert.match(md, /days_to_maturity_max/);
  assert.match(md, /100/);
  assert.match(md, /impecta\.se/);
  assert.match(md, /90–100 dagar/);
  assert.match(md, /- \[ \]/); // an unchecked approve box
});

test('flagged/low field is placed under the review-required section', () => {
  const md = renderReviewReport(sample, 'pilot-01', '2026-05-29');
  const idx = md.indexOf('Kräver din bedömning');
  assert.ok(idx > -1, 'has a review-required section');
  assert.ok(md.indexOf('companions') > idx, 'companions appears after that heading');
});
