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
  const nextState: GameState = {
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

  return { state: nextState, events };
}

/** A manual player tap. Counts toward lifetime tap stats. */
export function applyManualTap(state: GameState): EngineResult {
  const result = applyDamage(state, getEffectiveAttackPower(state));
  return {
    state: { ...result.state, totalTaps: result.state.totalTaps + 1 },
    events: result.events,
  };
}

/** An automated attack tick. Does not count as a manual tap. */
export function applyAutoAttackTick(state: GameState): EngineResult {
  if (!state.autoAttackActive) return { state, events: [] };
  return applyDamage(state, getEffectiveAttackPower(state));
}

export function toggleAutoAttack(state: GameState): GameState {
  if (!state.autoAttackUnlocked) return state;
  return { ...state, autoAttackActive: !state.autoAttackActive };
}
