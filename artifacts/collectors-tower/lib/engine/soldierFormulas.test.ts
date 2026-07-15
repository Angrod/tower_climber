/**
 * Focused checks for the soldier level-wall mechanic. Run with:
 *   node --test lib/engine/soldierFormulas.test.ts
 * (Node 22+ can execute this .ts file directly — no build step needed.)
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getSoldierPower,
  getSoldierWallLevel,
  getTotalSoldierAttack,
  isSoldierAtWall,
  SOLDIER_LEVEL_WALLS,
} from './soldierFormulas';
import { getSoldierDefinition, SOLDIER_ROSTER } from './soldierData';
import { createInitialSoldiersState } from './soldierEngine';

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

test('getTotalSoldierAttack sums getSoldierPower across the whole roster', () => {
  const empty = createInitialSoldiersState();
  assert.equal(getTotalSoldierAttack(empty), 0);

  const partial = {
    units: {
      ...empty.units,
      squire: { level: 10 },
      wizard: { level: 3 },
    },
  };
  const expected =
    getSoldierPower(getSoldierDefinition('squire'), 10) +
    getSoldierPower(getSoldierDefinition('wizard'), 3);
  assert.equal(getTotalSoldierAttack(partial), expected);

  const fullRoster = {
    units: Object.fromEntries(SOLDIER_ROSTER.map((def) => [def.id, { level: 5 }])) as typeof empty.units,
  };
  const fullExpected = SOLDIER_ROSTER.reduce(
    (sum, def) => sum + getSoldierPower(def, 5),
    0,
  );
  assert.equal(getTotalSoldierAttack(fullRoster), fullExpected);
});
