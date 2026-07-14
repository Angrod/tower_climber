/**
 * Growth curve math for the Sellswords roster. Each unit compounds its
 * own power at its own per-level rate — see soldierData.ts for why the
 * rates differ per unit instead of sharing one curve.
 *
 * The level-100 wall is confirmed data. Levels 10 and 50 are growth-rate
 * transitions baked into the curve shape, not walls.
 *
 * Levels 500 and 1,000 are ALSO walls, per design, but only their
 * existence is confirmed — there is no real reference data for their
 * magnitude/shape yet. Rather than invent numbers, they reuse the exact
 * same hard-cap mechanic as the level-100 wall. Treat 500/1,000 here as
 * a placeholder to swap out the moment real curve/wall data shows up;
 * the level-100 wall itself is untouched and must stay that way.
 */

import type { SoldierDefinition } from './soldierData';

export const SOLDIER_LEVEL_WALL = 100;
export const SOLDIER_RATE_TRANSITION_LEVEL = 50;

/**
 * Ordered hard-cap wall thresholds. 100 is confirmed; 500 and 1,000 are
 * an unverified extension of the same mechanic (see file header) — swap
 * these two out if real data is ever found, but keep 100 as-is.
 */
export const SOLDIER_LEVEL_WALLS = [SOLDIER_LEVEL_WALL, 500, 1000] as const;

/**
 * A unit cannot level past a wall threshold in this milestone. Walls are
 * exact stopping points, not "any lower threshold forever" — a unit sits
 * at wall 100 until something unlocks it (out of scope here), then would
 * climb freely again until it exactly reaches wall 500, and so on. Using
 * `>=` against every threshold would permanently lock a unit at 100 and
 * make 500/1,000 unreachable even after a future unlock, so this checks
 * exact membership instead.
 */
export function isSoldierAtWall(level: number): boolean {
  return (SOLDIER_LEVEL_WALLS as readonly number[]).includes(level);
}

/**
 * Which wall threshold a level is currently sitting at, or `null` if the
 * unit isn't at a wall. Used purely for presentation (e.g. "Level 500
 * wall" copy) — leveling logic only needs `isSoldierAtWall`.
 */
export function getSoldierWallLevel(level: number): number | null {
  return (SOLDIER_LEVEL_WALLS as readonly number[]).find((wall) => wall === level) ?? null;
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
