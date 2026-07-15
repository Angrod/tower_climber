/**
 * Static data for the Hero summon system: the promotion-tier table, the
 * rare-variant identity, and the two skills that govern summoning
 * (concurrent cap, rare-variant rate). Same id/display-name split as
 * soldierData.ts/gearData.ts — logic must always read `id`/level, never
 * a title or name string.
 *
 * PLACEHOLDER VALUES: Hero base stats, every promotion's stat-boost
 * multiplier, the rare variant's stat multiplier, and both skills' cost
 * curves are game-balance placeholders — same treatment as
 * BASE_ATTACK_POWER in formulas.ts. Only the promotion level
 * breakpoints (10/50/100/500/1,000) and their title order are confirmed
 * design; every multiplier/cost number here is a placeholder to swap
 * out once real balancing data exists.
 */

import type { HeroRankId } from './types';

export interface HeroRankDefinition {
  /** Permanent identity used by all promotion logic. Never rename. */
  id: HeroRankId;
  /** Freely renameable, shown to the player. */
  name: string;
  /** Hero level at which this rank is attained. Confirmed breakpoint. */
  levelBreakpoint: number;
  /**
   * PLACEHOLDER — one-time stat multiplier applied on top of the
   * previous rank's total when this rank is first reached (i.e. these
   * compound across ranks, they don't each restate an absolute total).
   * Magnitude is unverified; only the breakpoints above are confirmed.
   */
  promotionBoostMultiplier: number;
}

export const HERO_RANKS: HeroRankDefinition[] = [
  { id: 'hero_rank_1', name: 'Recruit', levelBreakpoint: 0, promotionBoostMultiplier: 1 },
  { id: 'hero_rank_2', name: 'Blade Adept', levelBreakpoint: 10, promotionBoostMultiplier: 1.5 },
  { id: 'hero_rank_3', name: 'Vanguard', levelBreakpoint: 50, promotionBoostMultiplier: 1.5 },
  { id: 'hero_rank_4', name: 'Champion', levelBreakpoint: 100, promotionBoostMultiplier: 1.5 },
  { id: 'hero_rank_5', name: 'Legend', levelBreakpoint: 500, promotionBoostMultiplier: 1.5 },
  { id: 'hero_rank_6', name: 'Hero', levelBreakpoint: 1000, promotionBoostMultiplier: 1.5 },
];

export function getHeroRankDefinition(id: HeroRankId): HeroRankDefinition {
  const def = HERO_RANKS.find((rank) => rank.id === id);
  if (!def) throw new Error(`Unknown hero rank id: ${id}`);
  return def;
}

/**
 * PLACEHOLDER — Hero base stats at Recruit rank, before any promotion
 * or variant multiplier. Same "flagged placeholder isolated in the
 * data layer" treatment as BASE_ATTACK_POWER in formulas.ts.
 */
export const HERO_BASE_ATTACK = 2;
export const HERO_BASE_HP = 20;

/**
 * The rare stronger Hero variant. Original identity for this product —
 * never the source game's naming, same rule as the Sellswords roster
 * and Weapons collection.
 */
export const RARE_HERO_VARIANT_ID = 'ember_paragon';
export const RARE_HERO_VARIANT_NAME = 'Ember Paragon';
/** PLACEHOLDER — stat multiplier applied on top of the normal Hero's current-rank stats. */
export const RARE_HERO_VARIANT_STAT_MULTIPLIER = 3;

/** The Summon skill — raises Max Concurrent Heroes. Original identity, not from the source game. */
export const SUMMON_SKILL_ID = 'skill_summon';
export const SUMMON_SKILL_NAME = 'Summon';
/** Max Concurrent Heroes = BASE_HERO_POOL + HERO_POOL_PER_SUMMON_LEVEL x Summon Skill Level. */
export const BASE_HERO_POOL = 1;
export const HERO_POOL_PER_SUMMON_LEVEL = 2;
/** PLACEHOLDER — gold cost curve for leveling the Summon skill, same shape as soldier level-up costs. */
export const SUMMON_SKILL_BASE_COST = 150;
export const SUMMON_SKILL_COST_GROWTH = 1.6;

/** The rare-variant spawn-rate skill. Original identity, not from the source game. */
export const VARIANT_SKILL_ID = 'skill_paragons_favor';
export const VARIANT_SKILL_NAME = "Paragon's Favor";
/** PLACEHOLDER — spawn-rate curve and cost curve for the variant-spawn skill. */
export const VARIANT_BASE_SPAWN_CHANCE = 0.02;
export const VARIANT_SPAWN_CHANCE_PER_LEVEL = 0.01;
export const VARIANT_SPAWN_CHANCE_CAP = 0.5;
export const VARIANT_SKILL_BASE_COST = 250;
export const VARIANT_SKILL_COST_GROWTH = 1.7;
