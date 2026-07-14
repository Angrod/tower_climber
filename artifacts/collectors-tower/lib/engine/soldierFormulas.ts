/**
 * Growth curve math for the Sellswords roster. Each unit compounds its
 * own power at its own per-level rate — see soldierData.ts for why the
 * rates differ per unit instead of sharing one curve.
 *
 * Only the level-100 wall is implemented here. Levels 10 and 50 are
 * growth-rate transitions baked into the curve shape, not walls, and
 * deeper breakpoints (500, 1,000) have no confirmed curve/wall data yet
 * — they are explicitly deferred to a future task.
 */

import type { SoldierDefinition } from './soldierData';

export const SOLDIER_LEVEL_WALL = 100;
export const SOLDIER_RATE_TRANSITION_LEVEL = 50;

/** A unit cannot recruit/level past the level-100 wall in this milestone. */
export function isSoldierAtWall(level: number): boolean {
  return level >= SOLDIER_LEVEL_WALL;
}

/**
 * Power at a given level. Level 0 (not recruited) has no power.
 * Level 1 is the unit's base power; each subsequent level compounds by
 * `rateEarly` up to level 50, then by `rateLate` from 50-100.
 */
export function getSoldierPower(def: SoldierDefinition, level: number): number {
  if (level <= 0) return 0;
  let power = def.basePower;
  for (let lvl = 2; lvl <= level; lvl++) {
    const rate = lvl <= SOLDIER_RATE_TRANSITION_LEVEL ? def.rateEarly : def.rateLate;
    power *= 1 + rate;
  }
  return Math.round(power * 10) / 10;
}

/** Gold cost to raise this unit from `currentLevel` to `currentLevel + 1`. */
export function getSoldierLevelUpCost(
  def: SoldierDefinition,
  currentLevel: number,
): number {
  const base = def.recruitCost * 0.2;
  return Math.round(base * Math.pow(1.12, Math.max(0, currentLevel - 1)));
}
