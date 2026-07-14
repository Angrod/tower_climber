/**
 * Focused checks for the soldier level-wall mechanic. Run with:
 *   node --test lib/engine/soldierFormulas.test.ts
 * (Node 22+ can execute this .ts file directly — no build step needed.)
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getSoldierWallLevel,
  isSoldierAtWall,
  SOLDIER_LEVEL_WALLS,
} from './soldierFormulas';

test('walls are exactly 100, 500, 1000', () => {
  assert.deepEqual(SOLDIER_LEVEL_WALLS, [100, 500, 1000]);
});

test('99 -> 100 transition hits the wall', () => {
  assert.equal(isSoldierAtWall(99), false);
  assert.equal(isSoldierAtWall(100), true);
  assert.equal(getSoldierWallLevel(100), 100);
});

test('101 is past the 100 wall and not itself walled', () => {
  // Reachable only once something outside this task's scope unlocks the
  // 100 wall — this just documents that the mechanic doesn't permanently
  // lock every level above 100.
  assert.equal(isSoldierAtWall(101), false);
  assert.equal(getSoldierWallLevel(101), null);
});

test('499 -> 500 transition hits the wall', () => {
  assert.equal(isSoldierAtWall(499), false);
  assert.equal(isSoldierAtWall(500), true);
  assert.equal(getSoldierWallLevel(500), 500);
});

test('999 -> 1000 transition hits the wall', () => {
  assert.equal(isSoldierAtWall(999), false);
  assert.equal(isSoldierAtWall(1000), true);
  assert.equal(getSoldierWallLevel(1000), 1000);
});

test('levels with no wall report null', () => {
  assert.equal(getSoldierWallLevel(50), null);
  assert.equal(getSoldierWallLevel(1001), null);
});
