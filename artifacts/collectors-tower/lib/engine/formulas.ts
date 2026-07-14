/**
 * Confirmed scaling formulas, ported faithfully from the Godot reference
 * implementation (Main.gd) — the single source of truth for enemy HP
 * scaling. Do not duplicate these constants elsewhere.
 *
 * - Base enemy HP: 20
 * - Growth: +8% per floor (compounding)
 * - Tower Floor Wall: every 10th floor, HP x3
 */

export const ENEMY_BASE_HP = 20;
export const ENEMY_GROWTH_RATE = 0.08;
export const WALL_INTERVAL = 10;
export const WALL_MULTIPLIER = 3;

export const BASE_ATTACK_POWER = 5;
export const AUTO_ATTACK_INTERVAL_MS = 1000;
export const AUTO_ATTACK_UNLOCK_FLOOR = 3;

export function isWallFloor(floor: number): boolean {
  return floor > 0 && floor % WALL_INTERVAL === 0;
}

/** Floors remaining until the next Tower Floor Wall (0 if `floor` is one). */
export function floorsUntilNextWall(floor: number): number {
  if (isWallFloor(floor)) return 0;
  const nextWall = Math.ceil(floor / WALL_INTERVAL) * WALL_INTERVAL;
  return nextWall - floor;
}

export function getEnemyMaxHp(floor: number): number {
  const scaled = ENEMY_BASE_HP * Math.pow(1 + ENEMY_GROWTH_RATE, floor - 1);
  const wallAdjusted = isWallFloor(floor) ? scaled * WALL_MULTIPLIER : scaled;
  return Math.round(wallAdjusted);
}

/**
 * Gold reward for clearing a floor — the resource spent recruiting and
 * leveling Sellswords. Scales gently with floor so the early game funds
 * a first recruit within the first few clears.
 */
const GOLD_PER_FLOOR_BASE = 4;
const GOLD_PER_FLOOR_STEP = 1.5;

export function getGoldReward(floor: number): number {
  return Math.round(GOLD_PER_FLOOR_BASE + floor * GOLD_PER_FLOOR_STEP);
}
