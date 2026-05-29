// scripts/lib/plant-density.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spacingToPlantsPerSqft } from './plant-density';

test('grid densities match SFG standard', () => {
  assert.equal(spacingToPlantsPerSqft(7.5), 16); // morot
  assert.equal(spacingToPlantsPerSqft(10), 9);
  assert.equal(spacingToPlantsPerSqft(15), 4);
  assert.equal(spacingToPlantsPerSqft(30), 1);
});

test('spacing wider than a square yields a fraction < 1', () => {
  assert.equal(spacingToPlantsPerSqft(60), 0.25); // squash-like
  assert.equal(spacingToPlantsPerSqft(45), 0.44); // rounded to 2 decimals
});

test('rounds down to whole plants per side', () => {
  assert.equal(spacingToPlantsPerSqft(8), 9); // 30/8 = 3.75 → 3 per side → 9
});

test('rejects non-positive spacing', () => {
  assert.throws(() => spacingToPlantsPerSqft(0));
  assert.throws(() => spacingToPlantsPerSqft(-5));
});
