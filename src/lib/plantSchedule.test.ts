// src/lib/plantSchedule.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSchedule, type PlantScheduleInput } from './plantSchedule';

const garlic: PlantScheduleInput = {
  id: 'vitlok', commonName: 'Vitlök', emoji: '🧄',
  sowIndoorsDaysBeforeFrost: null, directSowDaysBeforeFrost: null, transplantDaysAfterFrost: null,
  daysToMaturityMin: 270, daysToMaturityMax: 300,
  autumnPlantDaysBeforeFirstFrost: 0,
};
const lastFrost = new Date(2026, 3, 15);  // 15 Apr 2026
const firstFrost = new Date(2026, 9, 15); // 15 Oct 2026

test('autumn crop: plant_autumn at first frost, harvest next summer', () => {
  const ev = computeSchedule(lastFrost, [garlic], firstFrost);
  const plant = ev.find((e) => e.kind === 'plant_autumn');
  assert.ok(plant, 'has a plant_autumn event');
  assert.equal(plant!.date.getMonth(), 9); // October
  const harvest = ev.find((e) => e.kind === 'harvest_start');
  assert.ok(harvest, 'has a harvest_start event');
  assert.equal(harvest!.date.getFullYear(), 2027); // next year
  assert.equal(harvest!.date.getMonth(), 6); // ~July (15 Oct + 270 d)
});

test('no firstFrostDate → no autumn events', () => {
  const ev = computeSchedule(lastFrost, [garlic]);
  assert.equal(ev.filter((e) => e.kind === 'plant_autumn').length, 0);
});

test('spring crop unaffected when firstFrostDate is supplied', () => {
  const carrot: PlantScheduleInput = {
    id: 'morot', commonName: 'Morot', emoji: '🥕',
    sowIndoorsDaysBeforeFrost: null, directSowDaysBeforeFrost: 14, transplantDaysAfterFrost: null,
    daysToMaturityMin: 70, daysToMaturityMax: 70, autumnPlantDaysBeforeFirstFrost: null,
  };
  const ev = computeSchedule(lastFrost, [carrot], firstFrost);
  assert.equal(ev.filter((e) => e.kind === 'plant_autumn').length, 0);
  assert.ok(ev.find((e) => e.kind === 'direct_sow'), 'still emits spring direct_sow');
});
