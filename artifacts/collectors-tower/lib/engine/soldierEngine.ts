/**
 * Pure state transitions for the Sellswords roster. Same contract as
 * gameEngine.ts: no React, no storage, no presentation concerns — every
 * function takes a GameState and returns a new GameState plus events.
 */

import { getSoldierDefinition, SOLDIER_ROSTER } from './soldierData';
import {
  getSoldierLevelUpCost,
  isSoldierAtWall,
} from './soldierFormulas';
import type { GameEvent, GameState, SoldierId, SoldiersState } from './types';

export function createInitialSoldiersState(): SoldiersState {
  const units = {} as SoldiersState['units'];
  for (const def of SOLDIER_ROSTER) {
    units[def.id] = { level: 0 };
  }
  return { units };
}

interface EngineResult {
  state: GameState;
  events: GameEvent[];
}

/** Recruit a not-yet-hired unit, spending gold. No-op if already recruited. */
export function recruitSoldier(state: GameState, id: SoldierId): EngineResult {
  const unit = state.soldiers.units[id];
  const def = getSoldierDefinition(id);

  if (unit.level > 0 || state.gold < def.recruitCost) {
    return { state, events: [] };
  }

  const nextState: GameState = {
    ...state,
    gold: state.gold - def.recruitCost,
    soldiers: {
      units: { ...state.soldiers.units, [id]: { level: 1 } },
    },
  };
  return {
    state: nextState,
    events: [{ type: 'soldierRecruited', payload: { level: 1 } }],
  };
}

/** Level up an already-recruited unit by one level, spending gold. */
export function levelUpSoldier(state: GameState, id: SoldierId): EngineResult {
  const unit = state.soldiers.units[id];
  const def = getSoldierDefinition(id);

  if (unit.level <= 0 || isSoldierAtWall(unit.level)) {
    return { state, events: [] };
  }

  const cost = getSoldierLevelUpCost(def, unit.level);
  if (state.gold < cost) {
    return { state, events: [] };
  }

  const nextLevel = unit.level + 1;
  const nextState: GameState = {
    ...state,
    gold: state.gold - cost,
    soldiers: {
      units: { ...state.soldiers.units, [id]: { level: nextLevel } },
    },
  };

  const events: GameEvent[] = [
    { type: 'soldierLeveledUp', payload: { level: nextLevel } },
  ];
  if (isSoldierAtWall(nextLevel)) {
    events.push({ type: 'soldierWallReached', payload: { level: nextLevel } });
  }

  return { state: nextState, events };
}
