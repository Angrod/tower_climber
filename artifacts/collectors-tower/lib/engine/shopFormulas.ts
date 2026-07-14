/**
 * Shop constants and pure derived-state helpers for the two-currency
 * monetization system. Design rule, confirmed during planning and not
 * to be relaxed: currency is earn-only. Gold and Shop Currency are never
 * purchasable with real money, and the Fire Sword is Shop-Currency-only.
 *
 * - Gold: earned from floor clears (see formulas.ts), spent on Hero /
 *   Skill / Soldier upgrades.
 * - Shop Currency: earned only from daily login and opt-in rewarded
 *   ads, spent on Shop boosts and the Fire Sword.
 */

import { getGearAttackMultiplier } from './gearFormulas';
import type { GameState } from './types';

/** Shop Currency granted once per calendar day on first open. */
export const DAILY_LOGIN_REWARD = 15;

/** Shop Currency granted per completed opt-in rewarded-ad view. */
export const REWARDED_AD_REWARD = 10;

/** Shop Currency cost of one Power Surge boost purchase. */
export const BOOST_COST = 30;
/** How long a purchased Power Surge boost lasts. */
export const BOOST_DURATION_MS = 60_000;
/** Attack power multiplier while a Power Surge boost is active. */
export const BOOST_MULTIPLIER = 2;

/** Shop Currency cost of the Fire Sword — the shop's premier earn-only collectible. */
export const FIRE_SWORD_COST = 500;

/** One-time real-money price of the ad-free buyout — the only real-money purchase in the game. */
export const AD_FREE_BUYOUT_PRICE_LABEL = '$4.99';

export function todayDateKey(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function canClaimDailyLogin(state: GameState, now: number = Date.now()): boolean {
  return state.lastDailyLoginDate !== todayDateKey(now);
}

export function isBoostActive(state: GameState, now: number = Date.now()): boolean {
  return state.boostActiveUntil !== null && state.boostActiveUntil > now;
}

/** Milliseconds remaining on the active Power Surge boost, or 0 if none is active. */
export function boostMsRemaining(state: GameState, now: number = Date.now()): number {
  if (!isBoostActive(state, now)) return 0;
  return Math.max(0, (state.boostActiveUntil as number) - now);
}

/**
 * Attack power after applying equipped-gear family stacking and any
 * active Power Surge boost. Gear multiplies first (base × gear
 * multiplier), then the boost multiplies on top — consistent with the
 * "gear stacks, then account-wide effects multiply last" order from
 * the progression model.
 */
export function getEffectiveAttackPower(state: GameState, now: number = Date.now()): number {
  const gearAdjusted = state.attackPower * getGearAttackMultiplier(state.gear);
  return isBoostActive(state, now) ? gearAdjusted * BOOST_MULTIPLIER : gearAdjusted;
}
