import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findConflictCells } from './companionConflicts';

const companions = {
  // Asymmetric on purpose: only morot lists dill as an antagonist.
  morot: { companions: ['lok'], antagonists: ['dill'] },
  dill: { companions: [], antagonists: [] },
  lok: { companions: ['morot'], antagonists: [] },
};

test('flags both cells when antagonists are orthogonally adjacent (symmetric)', () => {
  const planted = new Map([
    ['0:0', 'morot'],
    ['0:1', 'dill'],
  ]);
  const conflicts = findConflictCells(planted, companions);
  assert.ok(conflicts.has('0:0'));
  assert.ok(conflicts.has('0:1'));
  assert.equal(conflicts.size, 2);
});

test('no conflict when antagonists are not adjacent', () => {
  const planted = new Map([
    ['0:0', 'morot'],
    ['2:2', 'dill'],
  ]);
  assert.equal(findConflictCells(planted, companions).size, 0);
});

test('companions (non-antagonist) are never flagged', () => {
  const planted = new Map([
    ['0:0', 'morot'],
    ['0:1', 'lok'],
  ]);
  assert.equal(findConflictCells(planted, companions).size, 0);
});

test('diagonal adjacency does not count', () => {
  const planted = new Map([
    ['0:0', 'morot'],
    ['1:1', 'dill'],
  ]);
  assert.equal(findConflictCells(planted, companions).size, 0);
});
