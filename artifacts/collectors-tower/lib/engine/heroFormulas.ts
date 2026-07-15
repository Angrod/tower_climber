/**
 * Pure derived-state math for the Hero summon system: promotion-tier
 * lookup, the Hero Level Wall, the concurrent-cap and rare-variant-rate
 * skill formulas, and effective Hero stats. See heroData.ts for which
 * numbers here are confirmed design vs. flagged placeholders.
 */

import {
  BASE_HERO_POOL,
  HERO_BASE_ATTACK,
  HERO_BASE_HP,
  HERO_POOL_PER_SUMMON_LEVEL,
  HERO_RANKS,
  RARE_HERO_VARIANT_STAT_MULTIPLIER,
  SUMMON_SKILL_BASE_COST,
  SUMMON_SKILL_COST_GROWTH,
  VARIANT_BASE_SPAWN_CHANCE,
  VARIANT_SKILL_BASE_COST,
  VARIANT_SKILL_COST_GROWTH,
  VARIANT_SPAWN_CHANCE_CAP,
  VARIANT_SPAWN_CHANCE_PER_LEVEL,
  type HeroRankDefinition,
} from './heroData';
import { getSharedCombatMultiplier } from './shopFormulas';
import type { GameState } from './types';

/**
 * Hero Level Wall thresholds. Only the existence/level of these walls
 * is confirmed design; per the same placeholder-extension treatment as
 * SOLDIER_LEVEL_WALLS (soldierFormulas.ts), 100 is the confirmed hard
 * cap and 500/1,000 reuse the identical mechanic as an unverified
 * extension. A Hero cannot level past a wall until something unlocks
 * it (out of scope here).
 */
export const HERO_LEVEL_WALLS = [100, 500, 1000] as const;

export function isHeroAtWall(level: number): boolean {
  return (HERO_LEVEL_WALLS as readonly number[]).includes(level);
}

export function getHeroWallLevel(level: number): number | null {
  return (HERO_LEVEL_WALLS as readonly number[]).find((wall) => wall === level) ?? null;
}

/** The highest rank whose level breakpoint has been reached. */
export function getHeroRank(level: number): HeroRankDefinition {
  let current = HERO_RANKS[0];
  for (const rank of HERO_RANKS) {
    if (level >= rank.levelBreakpoint) current = rank;
  }
  return current;
}

/** The next rank to be promoted into, or null if already at the final rank. */
export function getNextHeroRank(level: number): HeroRankDefinition | null {
  const current = getHeroRank(level);
  const index = HERO_RANKS.findIndex((rank) => rank.id === current.id);
  return HERO_RANKS[index + 1] ?? null;
}

/**
 * Cumulative stat multiplier from every rank reached so far. Each
 * rank's `promotionBoostMultiplier` compounds onto the previous rank's
 * total, so a promotion is a permanent, one-time step-up rather than a
 * flat restated value.
 */
export function getHeroRankMultiplier(level: number): number {
  const rank = getHeroRank(level);
  const index = HERO_RANKS.findIndex((r) => r.id === rank.id);
  let multiplier = 1;
  for (let i = 1; i <= index; i++) {
    multiplier *= HERO_RANKS[i].promotionBoostMultiplier;
  }
  return multiplier;
}

/** Max concurrent Heroes = Base Pool + 2 x Summon Skill Level. */
export function getMaxConcurrentHeroes(summonSkillLevel: number): number {
  return BASE_HERO_POOL + HERO_POOL_PER_SUMMON_LEVEL * summonSkillLevel;
}

/** Gold cost to raise the Summon skill from `summonSkillLevel` to `summonSkillLevel + 1`. */
export function getSummonSkillUpgradeCost(summonSkillLevel: number): number {
  return Math.round(SUMMON_SKILL_BASE_COST * Math.pow(SUMMON_SKILL_COST_GROWTH, summonSkillLevel));
}

/** Gold cost to raise the rare-variant skill from `variantSkillLevel` to `variantSkillLevel + 1`. */
export function getVariantSkillUpgradeCost(variantSkillLevel: number): number {
  return Math.round(VARIANT_SKILL_BASE_COST * Math.pow(VARIANT_SKILL_COST_GROWTH, variantSkillLevel));
}

/** Chance a given summon rolls the rare variant instead of a normal Hero. */
export function getVariantSpawnChance(variantSkillLevel: number): number {
  return Math.min(
    VARIANT_SPAWN_CHANCE_CAP,
    VARIANT_BASE_SPAWN_CHANCE + VARIANT_SPAWN_CHANCE_PER_LEVEL * variantSkillLevel,
  );
}

/** Base Hero attack at the shared Hero level, before the shared Power Up multiplier. */
export function getHeroBaseAttack(level: number, isVariant: boolean): number {
  const variantMultiplier = isVariant ? RARE_HERO_VARIANT_STAT_MULTIPLIER : 1;
  return HERO_BASE_ATTACK * getHeroRankMultiplier(level) * variantMultiplier;
}

/** Base Hero HP at the shared Hero level, before the shared Power Up multiplier. */
export function getHeroBaseHp(level: number, isVariant: boolean): number {
  const variantMultiplier = isVariant ? RARE_HERO_VARIANT_STAT_MULTIPLIER : 1;
  return HERO_BASE_HP * getHeroRankMultiplier(level) * variantMultiplier;
}

/**
 * Effective attack of one Hero instance, including the shared Power Up
 * multiplier (gear + boost) — the exact same `getSharedCombatMultiplier`
 * used for the Player's effective attack power, so this is never a
 * duplicated calculation.
 */
export function getEffectiveHeroAttack(
  level: number,
  isVariant: boolean,
  state: GameState,
  now: number = Date.now(),
): number {
  return getHeroBaseAttack(level, isVariant) * getSharedCombatMultiplier(state, now);
}

/** Summed effective attack of every currently-active Hero instance. */
export function getActiveHeroesAttack(state: GameState, now: number = Date.now()): number {
  const multiplier = getSharedCombatMultiplier(state, now);
  return state.heroes.instances
    .filter((hero) => hero.active)
    .reduce(
      (sum, hero) => sum + getHeroBaseAttack(state.heroes.level, hero.isVariant) * multiplier,
      0,
    );
}
