/**
 * Focused checks for the Hero summon system's math: promotion
 * breakpoints, the Hero Level Wall, the concurrent-cap formula, and the
 * summon/resummon engine flow. Run with:
 *   pnpm exec tsx --test lib/engine/heroFormulas.test.ts
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getActiveHeroesAttack,
  getFameAttackBonus,
  getHeroRank,
  getMaxConcurrentHeroes,
  getNextHeroRank,
  getVariantSpawnChance,
  isHeroAtWall,
  HERO_LEVEL_WALLS,
} from './heroFormulas';
import { BASE_HERO_POOL, HERO_POOL_PER_SUMMON_LEVEL, VARIANT_SPAWN_CHANCE_CAP } from './heroData';
import { createInitialHeroesState, summonHero, maybeDefeatHero, upgradeFameSkill } from './heroEngine';
import { recruitSoldier, levelUpSoldier } from './soldierEngine';
import { getTotalSoldierAttack } from './soldierFormulas';
import { createInitialState } from './gameEngine';
import type { GameState } from './types';

test('rank breakpoints follow the confirmed title track', () => {
  assert.equal(getHeroRank(0).name, 'Recruit');
  assert.equal(getHeroRank(9).name, 'Recruit');
  assert.equal(getHeroRank(10).name, 'Blade Adept');
  assert.equal(getHeroRank(49).name, 'Blade Adept');
  assert.equal(getHeroRank(50).name, 'Vanguard');
  assert.equal(getHeroRank(99).name, 'Vanguard');
  assert.equal(getHeroRank(100).name, 'Champion');
  assert.equal(getHeroRank(499).name, 'Champion');
  assert.equal(getHeroRank(500).name, 'Legend');
  assert.equal(getHeroRank(999).name, 'Legend');
  assert.equal(getHeroRank(1000).name, 'Hero');
  assert.equal(getNextHeroRank(1000), null);
});

test('Hero Level Wall reuses the same 100/500/1000 mechanic', () => {
  assert.deepEqual(HERO_LEVEL_WALLS, [100, 500, 1000]);
  assert.equal(isHeroAtWall(99), false);
  assert.equal(isHeroAtWall(100), true);
});

test('Max Concurrent Heroes = Base Pool + 2 x Summon Skill Level', () => {
  assert.equal(getMaxConcurrentHeroes(0), BASE_HERO_POOL);
  assert.equal(getMaxConcurrentHeroes(3), BASE_HERO_POOL + HERO_POOL_PER_SUMMON_LEVEL * 3);
});

test('variant spawn chance is clamped at its configured cap', () => {
  assert.ok(getVariantSpawnChance(1000) <= VARIANT_SPAWN_CHANCE_CAP);
});

function freshState(): GameState {
  return createInitialState();
}

test('summonHero fills up to the concurrent cap, then no-ops', () => {
  let state = freshState();
  const alwaysNormal = () => 0.99; // never rolls under the variant chance

  const first = summonHero(state, alwaysNormal);
  assert.equal(first.state.heroes.instances.filter((h) => h.active).length, 1);
  assert.equal(first.state.heroes.level, 1);
  state = first.state;

  // Base pool is 1 concurrent Hero with no Summon skill levels — the cap is already full.
  const second = summonHero(state, alwaysNormal);
  assert.equal(second.state, state);
  assert.equal(second.events.length, 0);
});

test('a defeated Hero frees its slot for resummon instead of being removed', () => {
  let state = freshState();
  const alwaysNormal = () => 0.99;
  state = summonHero(state, alwaysNormal).state;
  assert.equal(state.heroes.instances.length, 1);

  // Force the death roll to land (rng below the death chance threshold).
  const alwaysDies = () => 0;
  const afterDeath = maybeDefeatHero(state, alwaysDies);
  assert.equal(afterDeath.state.heroes.instances.length, 1);
  assert.equal(afterDeath.state.heroes.instances[0].active, false);

  const resummon = summonHero(afterDeath.state, alwaysNormal);
  assert.equal(resummon.state.heroes.instances.length, 1);
  assert.equal(resummon.state.heroes.instances[0].active, true);
  assert.equal(resummon.state.heroes.level, 2);
});

test('rng below the variant threshold spawns the rare variant instead of a normal Hero', () => {
  const state = freshState();
  const alwaysVariant = () => 0; // 0 is always below any positive spawn chance
  const result = summonHero(state, alwaysVariant);
  assert.equal(result.state.heroes.instances[0].isVariant, true);
  assert.equal(result.events[0].type, 'heroVariantSummoned');
});

test('createInitialHeroesState starts empty with no skill levels', () => {
  const initial = createInitialHeroesState();
  assert.deepEqual(initial, {
    instances: [],
    level: 0,
    summonSkillLevel: 0,
    variantSkillLevel: 0,
    fameSkillLevel: 0,
  });
});

test('Fame skill adds Total Soldier Attack x (Fame Level x 1%) onto Hero attack', () => {
  let state = freshState();
  // Force the gold high enough to afford recruiting/leveling/upgrading in this test.
  state = { ...state, gold: 1_000_000 };
  state = recruitSoldier(state, 'squire').state;

  // No Fame levels yet — no bonus regardless of soldier attack.
  assert.equal(getFameAttackBonus(state), 0);

  state = upgradeFameSkill(state).state;
  assert.equal(state.heroes.fameSkillLevel, 1);

  const totalSoldierAttack = getTotalSoldierAttack(state.soldiers);
  assert.ok(totalSoldierAttack > 0);
  assert.equal(getFameAttackBonus(state), totalSoldierAttack * 0.01);

  // Leveling a soldier raises Total Soldier Attack and, in turn, the Fame bonus —
  // the exact same soldierFormulas/soldierEngine curve, never recomputed here.
  state = levelUpSoldier(state, 'squire').state;
  const raisedTotal = getTotalSoldierAttack(state.soldiers);
  assert.ok(raisedTotal > totalSoldierAttack);
  assert.equal(getFameAttackBonus(state), raisedTotal * 0.01);

  // The bonus flows into active Heroes' effective attack, not a parallel mechanic.
  const alwaysNormal = () => 0.99;
  const withHero = summonHero(state, alwaysNormal).state;
  const attackWithoutFame = withHero.heroes.instances.length; // sanity: at least one instance exists
  assert.ok(attackWithoutFame > 0);
  const activeAttack = getActiveHeroesAttack(withHero);
  assert.ok(activeAttack >= getFameAttackBonus(withHero));
});
