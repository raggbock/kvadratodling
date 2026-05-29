// src/lib/zones.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstFrostDateForYear, firstFrostMDForLastFrostMD } from './zones';

test('firstFrostDateForYear parses MD into a Date', () => {
  const d = firstFrostDateForYear('10-15', 2026);
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 9); // October
  assert.equal(d.getDate(), 15);
});

test('firstFrostMDForLastFrostMD maps a spring MD to the nearest zone autumn frost', () => {
  // Z1 lastFrost 04-01 → firstFrost 11-01 ; Z2 lastFrost 04-15 → firstFrost 10-15
  assert.equal(firstFrostMDForLastFrostMD('04-01'), '11-01');
  assert.equal(firstFrostMDForLastFrostMD('04-15'), '10-15');
});
