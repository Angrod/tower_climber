/**
 * Pure game-state transitions. No React, no storage, no presentation
 * concerns — every function here takes a GameState and returns a new
 * GameState plus a list of generic events for the presentation layer
 * to react to (haptics, animations, banners) without the engine ever
 * knowing those things exist.
 */

import {
  AUTO_ATTACK_UNLOCK_FLOOR,
  BASE_ATTACK_POWER,
  getEnemyMaxHp,
  getGoldReward,
  isWallFloor,
} from './formulas';
import { createInitialSoldiersState } from './soldierEngine';
import { getEffectiveAttackPower } from './shopFormulas';
import { createInitialGearState, dropGearFromChest } from './gearEngine';
import { applyEnemyAttack, createInitialHeroesState, summonHero } from './heroEngine';
import { getActiveHeroesAttack } from './heroFormulas';
import type { GameEvent, GameState } from './types';

export function createInitialState(): GameState {
  const floor = 1;
  const enemyMaxHp = getEnemyMaxHp(floor);
  return {
    floor,
    enemyMaxHp,
    enemyCurrentHp: enemyMaxHp,
    attackPower: BASE_ATTACK_POWER,
    autoAttackUnlocked: false,
    autoAttackActive: false,
    totalTaps: 0,
    floorsCleared: 0,
    gold: 0,
    soldiers: createInitialSoldiersState(),
    shopCurrency: 0,
    boostActiveUntil: null,
    fireSwordOwned: false,
    lastDailyLoginDate: null,
    adsRemoved: false,
    gear: createInitialGearState(),
    heroes: createInitialHeroesState(),
  };
}

interface EngineResult {
  state: GameState;
  events: GameEvent[];
}

/** Apply a flat amount of damage to the current enemy. Advances the floor on kill. */
function applyDamage(state: GameState, amount: number): EngineResult {
  const events: GameEvent[] = [];
  const damage = Math.max(0, amount);
  events.push({ type: 'damageDealt', payload: { amount: damage } });

  const remainingHp = state.enemyCurrentHp - damage;
  if (remainingHp > 0) {
    return { state: { ...state, enemyCurrentHp: remainingHp }, events };
  }

  events.push({ type: 'enemyDefeated', payload: { floor: state.floor } });

  const goldReward = getGoldReward(state.floor);
  const nextFloor = state.floor + 1;
  const nextMaxHp = getEnemyMaxHp(nextFloor);
  const stateAfterClear: GameState = {
    ...state,
    floor: nextFloor,
    enemyMaxHp: nextMaxHp,
    enemyCurrentHp: nextMaxHp,
    floorsCleared: state.floorsCleared + 1,
    gold: state.gold + goldReward,
    autoAttackUnlocked:
      state.autoAttackUnlocked || nextFloor >= AUTO_ATTACK_UNLOCK_FLOOR,
  };
  events.push({ type: 'goldEarned', payload: { amount: goldReward } });
  events.push({ type: 'floorAdvanced', payload: { floor: nextFloor } });
  if (isWallFloor(nextFloor)) {
    events.push({ type: 'wallReached', payload: { floor: nextFloor } });
  }

  // Every floor clear opens a loot chest — gear drop resolution lives
  // entirely in gearEngine/gearFormulas so this stays a single call.
  const dropResult = dropGearFromChest(stateAfterClear);
  events.push(...dropResult.events);

  return { state: dropResult.state, events };
}

/**
 * A manual player tap. Counts toward lifetime tap stats. Also attempts
 * to summon a Hero into any free concurrent slot, then applies real
 * enemy retaliation — the current floor's enemy strikes one active Hero
 * for its attack power (see heroEngine.ts `applyEnemyAttack`), freeing
 * that Hero's slot for a future resummon if it runs out of HP. Total
 * damage dealt to the enemy is the Player's effective attack plus every
 * currently-active Hero's effective attack.
 */
export function applyManualTap(state: GameState, rng: () => number = Math.random): EngineResult {
  const summonResult = summonHero(state, rng);
  const retaliationResult = applyEnemyAttack(summonResult.state, rng);
  const stateBeforeDamage = retaliationResult.state;

  const totalDamage =
    getEffectiveAttackPower(stateBeforeDamage) + getActiveHeroesAttack(stateBeforeDamage);
  const damageResult = applyDamage(stateBeforeDamage, totalDamage);

  return {
    state: { ...damageResult.state, totalTaps: damageResult.state.totalTaps + 1 },
    events: [...summonResult.events, ...retaliationResult.events, ...damageResult.events],
  };
}

/**
 * An automated attack tick. Does not count as a manual tap. Enemy
 * retaliation applies here too — every exchange of damage, manual or
 * automated, carries the same real combat risk to active Heroes.
 */
export function applyAutoAttackTick(state: GameState, rng: () => number = Math.random): EngineResult {
  if (!state.autoAttackActive) return { state, events: [] };
  const retaliationResult = applyEnemyAttack(state, rng);
  const damageResult = applyDamage(retaliationResult.state, getEffectiveAttackPower(retaliationResult.state));
  return { state: damageResult.state, events: [...retaliationResult.events, ...damageResult.events] };
}

export function toggleAutoAttack(state: GameState): GameState {
  if (!state.autoAttackUnlocked) return state;
  return { ...state, autoAttackActive: !state.autoAttackActive };
}
