// src/lib/plannerActions.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyChanges, invertChanges, pushAction, type SlotData, type Action } from './plannerActions';

const morot: SlotData = { row: 0, col: 0, plantSlug: 'morot', plantEmoji: '🥕', plantName: 'Morot' };

test('applyChanges sets and deletes cells', () => {
  const start = new Map<string, SlotData>();
  const changes: Action = [{ key: '0:0', before: null, after: morot }];
  const after = applyChanges(start, changes);
  assert.deepEqual(after.get('0:0'), morot);
  assert.equal(start.has('0:0'), false); // input not mutated

  const cleared = applyChanges(after, [{ key: '0:0', before: morot, after: null }]);
  assert.equal(cleared.has('0:0'), false);
});

test('invertChanges is an exact inverse (apply -> invert -> apply == original)', () => {
  const start = new Map<string, SlotData>([['0:0', morot]]);
  const changes: Action = [{ key: '0:0', before: morot, after: null }];
  const applied = applyChanges(start, changes);
  const back = applyChanges(applied, invertChanges(changes));
  assert.deepEqual(back.get('0:0'), morot);
});

test('pushAction caps the stack and drops the oldest', () => {
  let stack: Action[] = [];
  for (let i = 0; i < 25; i++) {
    stack = pushAction(stack, [{ key: `${i}:0`, before: null, after: morot }], 20);
  }
  assert.equal(stack.length, 20);
  assert.equal(stack[stack.length - 1][0].key, '24:0');
  assert.equal(stack[0][0].key, '5:0');
});
