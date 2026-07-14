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
  isWallFloor,
} from './formulas';
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

  const nextFloor = state.floor + 1;
  const nextMaxHp = getEnemyMaxHp(nextFloor);
  const nextState: GameState = {
    ...state,
    floor: nextFloor,
    enemyMaxHp: nextMaxHp,
    enemyCurrentHp: nextMaxHp,
    floorsCleared: state.floorsCleared + 1,
    autoAttackUnlocked:
      state.autoAttackUnlocked || nextFloor >= AUTO_ATTACK_UNLOCK_FLOOR,
  };
  events.push({ type: 'floorAdvanced', payload: { floor: nextFloor } });
  if (isWallFloor(nextFloor)) {
    events.push({ type: 'wallReached', payload: { floor: nextFloor } });
  }

  return { state: nextState, events };
}

/** A manual player tap. Counts toward lifetime tap stats. */
export function applyManualTap(state: GameState): EngineResult {
  const result = applyDamage(state, state.attackPower);
  return {
    state: { ...result.state, totalTaps: result.state.totalTaps + 1 },
    events: result.events,
  };
}

/** An automated attack tick. Does not count as a manual tap. */
export function applyAutoAttackTick(state: GameState): EngineResult {
  if (!state.autoAttackActive) return { state, events: [] };
  return applyDamage(state, state.attackPower);
}

export function toggleAutoAttack(state: GameState): GameState {
  if (!state.autoAttackUnlocked) return state;
  return { ...state, autoAttackActive: !state.autoAttackActive };
}
