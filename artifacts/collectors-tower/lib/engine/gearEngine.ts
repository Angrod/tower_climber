/**
 * Pure state transitions for the weapon/gear collection system. Same
 * contract as gameEngine.ts / soldierEngine.ts / shopEngine.ts: no
 * React, no storage, no presentation concerns.
 */

import { resolveGearDrop } from './gearFormulas';
import type { GearState, GameEvent, GameState } from './types';

interface EngineResult {
  state: GameState;
  events: GameEvent[];
}

export function createInitialGearState(): GearState {
  return { owned: {}, equippedIds: [] };
}

/**
 * Rolls one loot-chest drop (tier by shared chance, then item within
 * the tier by even split). A repeat drop of an already-owned item
 * levels it up instead of creating a duplicate entry. Newly collected
 * items are auto-equipped so a new drop has an immediate, visible
 * effect; players can freely re-equip afterward.
 */
export function dropGearFromChest(
  state: GameState,
  rng: () => number = Math.random,
): EngineResult {
  const def = resolveGearDrop(rng);
  if (!def) return { state, events: [] };

  const existing = state.gear.owned[def.id];
  const nextLevel = existing ? existing.level + 1 : 1;

  const nextGear: GearState = {
    owned: { ...state.gear.owned, [def.id]: { level: nextLevel } },
    equippedIds: existing
      ? state.gear.equippedIds
      : [...state.gear.equippedIds, def.id],
  };

  const event: GameEvent = {
    type: existing ? 'gearLeveledUp' : 'gearDropped',
    itemId: def.id,
    payload: { level: nextLevel },
  };

  return { state: { ...state, gear: nextGear }, events: [event] };
}

/** Equips an owned item. No-op if not owned or already equipped. */
export function equipGear(state: GameState, itemId: string): EngineResult {
  if (!state.gear.owned[itemId] || state.gear.equippedIds.includes(itemId)) {
    return { state, events: [] };
  }
  const nextGear: GearState = {
    ...state.gear,
    equippedIds: [...state.gear.equippedIds, itemId],
  };
  return {
    state: { ...state, gear: nextGear },
    events: [{ type: 'gearEquipped', itemId }],
  };
}

/** Unequips an item. No-op if not currently equipped. */
export function unequipGear(state: GameState, itemId: string): EngineResult {
  if (!state.gear.equippedIds.includes(itemId)) {
    return { state, events: [] };
  }
  const nextGear: GearState = {
    ...state.gear,
    equippedIds: state.gear.equippedIds.filter((id) => id !== itemId),
  };
  return {
    state: { ...state, gear: nextGear },
    events: [{ type: 'gearUnequipped', itemId }],
  };
}
