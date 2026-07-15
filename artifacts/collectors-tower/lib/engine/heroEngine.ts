/**
 * Pure state transitions for the Hero summon system. Same contract as
 * gameEngine.ts / soldierEngine.ts: no React, no storage, no
 * presentation concerns.
 */

import { getEnemyAttackPower } from './formulas';
import {
  getFameSkillUpgradeCost,
  getHeroBaseHp,
  getMaxConcurrentHeroes,
  getSummonSkillUpgradeCost,
  getVariantSkillUpgradeCost,
  getVariantSpawnChance,
  getHeroRank,
  isHeroAtWall,
} from './heroFormulas';
import type { GameEvent, GameState, HeroesState, HeroInstance } from './types';

interface EngineResult {
  state: GameState;
  events: GameEvent[];
}

export function createInitialHeroesState(): HeroesState {
  return { instances: [], level: 0, summonSkillLevel: 0, variantSkillLevel: 0, fameSkillLevel: 0 };
}

function makeHeroInstanceId(index: number): string {
  return `hero-slot-${index}`;
}

/**
 * Tap-to-summon a Hero. No-op if the concurrent cap is already full of
 * active Heroes. Fills a freed (inactive) slot first — a resummon — and
 * only creates a brand-new slot if every existing slot is currently
 * active and the cap hasn't been reached yet. Each successful summon
 * advances the shared Hero level by one (capped at the current Hero
 * Level Wall) and rolls the rare variant at the configured rate.
 */
export function summonHero(state: GameState, rng: () => number = Math.random): EngineResult {
  const maxConcurrent = getMaxConcurrentHeroes(state.heroes.summonSkillLevel);
  const activeCount = state.heroes.instances.filter((hero) => hero.active).length;
  if (activeCount >= maxConcurrent) {
    return { state, events: [] };
  }

  const isVariant = rng() < getVariantSpawnChance(state.heroes.variantSkillLevel);
  const inactiveIndex = state.heroes.instances.findIndex((hero) => !hero.active);

  const previousLevel = state.heroes.level;
  const nextLevel = isHeroAtWall(previousLevel) ? previousLevel : previousLevel + 1;
  const previousRank = getHeroRank(previousLevel);
  const nextRank = getHeroRank(nextLevel);
  // Every summon/resummon starts at full HP for the level it's joining at.
  const maxHp = getHeroBaseHp(nextLevel, isVariant);

  let nextInstances: HeroInstance[];
  if (inactiveIndex >= 0) {
    nextInstances = state.heroes.instances.map((hero, index) =>
      index === inactiveIndex ? { ...hero, active: true, isVariant, hp: maxHp } : hero,
    );
  } else if (state.heroes.instances.length < maxConcurrent) {
    nextInstances = [
      ...state.heroes.instances,
      { id: makeHeroInstanceId(state.heroes.instances.length), active: true, isVariant, hp: maxHp },
    ];
  } else {
    // Every slot is active and the cap is full — shouldn't happen given
    // the activeCount guard above, but keeps this function total.
    return { state, events: [] };
  }

  const nextState: GameState = {
    ...state,
    heroes: { ...state.heroes, instances: nextInstances, level: nextLevel },
  };

  const events: GameEvent[] = [
    {
      type: isVariant ? 'heroVariantSummoned' : 'heroSummoned',
      payload: { level: nextLevel },
    },
  ];
  if (nextRank.id !== previousRank.id) {
    events.push({ type: 'heroPromoted', payload: { level: nextLevel } });
  }

  return { state: nextState, events };
}

/**
 * Real enemy retaliation: the current floor's enemy strikes one random
 * active Hero for `getEnemyAttackPower(state.floor)` damage, taken out
 * of that Hero's HP (see `getHeroBaseHp`/HeroInstance.hp). A Hero whose
 * HP is driven to zero or below is marked inactive (not removed),
 * freeing its slot for a future resummon — the same "not permanently
 * lost" contract as before. No-op if no Heroes are currently active.
 */
export function applyEnemyAttack(state: GameState, rng: () => number = Math.random): EngineResult {
  const activeIndices = state.heroes.instances
    .map((hero, index) => (hero.active ? index : -1))
    .filter((index) => index >= 0);
  if (activeIndices.length === 0) {
    return { state, events: [] };
  }

  const targetIndex = activeIndices[Math.floor(rng() * activeIndices.length)];
  const target = state.heroes.instances[targetIndex];
  const damage = getEnemyAttackPower(state.floor);
  const remainingHp = target.hp - damage;
  const defeated = remainingHp <= 0;

  const nextInstances = state.heroes.instances.map((hero, index) =>
    index === targetIndex ? { ...hero, hp: Math.max(0, remainingHp), active: !defeated } : hero,
  );

  return {
    state: { ...state, heroes: { ...state.heroes, instances: nextInstances } },
    events: defeated ? [{ type: 'heroDefeated' }] : [],
  };
}

/** Spends gold to raise the Summon skill by one level, increasing Max Concurrent Heroes. */
export function upgradeSummonSkill(state: GameState): EngineResult {
  const cost = getSummonSkillUpgradeCost(state.heroes.summonSkillLevel);
  if (state.gold < cost) return { state, events: [] };

  const nextLevel = state.heroes.summonSkillLevel + 1;
  return {
    state: {
      ...state,
      gold: state.gold - cost,
      heroes: { ...state.heroes, summonSkillLevel: nextLevel },
    },
    events: [{ type: 'summonSkillUpgraded', payload: { level: nextLevel } }],
  };
}

/** Spends gold to raise the rare-variant skill by one level, increasing its spawn rate. */
export function upgradeVariantSkill(state: GameState): EngineResult {
  const cost = getVariantSkillUpgradeCost(state.heroes.variantSkillLevel);
  if (state.gold < cost) return { state, events: [] };

  const nextLevel = state.heroes.variantSkillLevel + 1;
  return {
    state: {
      ...state,
      gold: state.gold - cost,
      heroes: { ...state.heroes, variantSkillLevel: nextLevel },
    },
    events: [{ type: 'variantSkillUpgraded', payload: { level: nextLevel } }],
  };
}

/** Spends gold to raise the Fame skill by one level, increasing Hero attack via Total Soldier Attack. */
export function upgradeFameSkill(state: GameState): EngineResult {
  const cost = getFameSkillUpgradeCost(state.heroes.fameSkillLevel);
  if (state.gold < cost) return { state, events: [] };

  const nextLevel = state.heroes.fameSkillLevel + 1;
  return {
    state: {
      ...state,
      gold: state.gold - cost,
      heroes: { ...state.heroes, fameSkillLevel: nextLevel },
    },
    events: [{ type: 'fameSkillUpgraded', payload: { level: nextLevel } }],
  };
}
