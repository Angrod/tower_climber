/**
 * Pure state transitions for the two-currency shop system. Same contract
 * as gameEngine.ts / soldierEngine.ts: no React, no storage, no
 * presentation concerns.
 *
 * Every function here only ever adds Shop Currency from earn-only
 * sources (daily login, rewarded ads) or spends it on boosts/Fire
 * Sword. Nothing in this file accepts real money — `markAdsRemoved` is
 * the sole entry point for the real-money buyout, and it only ever
 * flips a boolean flag, never grants currency or gear.
 */

import {
  BOOST_COST,
  BOOST_DURATION_MS,
  canClaimDailyLogin,
  DAILY_LOGIN_REWARD,
  FIRE_SWORD_COST,
  REWARDED_AD_REWARD,
  todayDateKey,
} from './shopFormulas';
import type { GameEvent, GameState } from './types';

interface EngineResult {
  state: GameState;
  events: GameEvent[];
}

/** Claims the daily login reward if it hasn't been claimed yet today. No-op otherwise. */
export function claimDailyLogin(state: GameState, now: number = Date.now()): EngineResult {
  if (!canClaimDailyLogin(state, now)) return { state, events: [] };

  const nextState: GameState = {
    ...state,
    shopCurrency: state.shopCurrency + DAILY_LOGIN_REWARD,
    lastDailyLoginDate: todayDateKey(now),
  };
  return {
    state: nextState,
    events: [{ type: 'dailyLoginClaimed', payload: { amount: DAILY_LOGIN_REWARD } }],
  };
}

/**
 * Grants Shop Currency after the player opts into and finishes watching
 * a rewarded ad. Called only after ad playback completes — never forced,
 * and never grants Gold or the Fire Sword directly.
 */
export function grantRewardedAdReward(state: GameState): EngineResult {
  const nextState: GameState = {
    ...state,
    shopCurrency: state.shopCurrency + REWARDED_AD_REWARD,
  };
  return {
    state: nextState,
    events: [{ type: 'shopCurrencyEarned', payload: { amount: REWARDED_AD_REWARD } }],
  };
}

/** Spends Shop Currency on a temporary Power Surge attack boost. No-op if unaffordable. */
export function purchaseBoost(state: GameState, now: number = Date.now()): EngineResult {
  if (state.shopCurrency < BOOST_COST) return { state, events: [] };

  const nextState: GameState = {
    ...state,
    shopCurrency: state.shopCurrency - BOOST_COST,
    boostActiveUntil: now + BOOST_DURATION_MS,
  };
  return {
    state: nextState,
    events: [{ type: 'boostPurchased', payload: { durationMs: BOOST_DURATION_MS } }],
  };
}

/** Spends Shop Currency to permanently own the Fire Sword. No-op if already owned or unaffordable. */
export function purchaseFireSword(state: GameState): EngineResult {
  if (state.fireSwordOwned || state.shopCurrency < FIRE_SWORD_COST) {
    return { state, events: [] };
  }

  const nextState: GameState = {
    ...state,
    shopCurrency: state.shopCurrency - FIRE_SWORD_COST,
    fireSwordOwned: true,
  };
  return { state: nextState, events: [{ type: 'fireSwordPurchased' }] };
}

/**
 * Marks the one-time ad-free buyout as owned. Call only after a
 * successful real-money purchase confirmation — this never grants Gold,
 * Shop Currency, or gear, and is the only function in the engine that
 * should ever be reachable from a real-money purchase flow.
 */
export function markAdsRemoved(state: GameState): EngineResult {
  if (state.adsRemoved) return { state, events: [] };
  return { state: { ...state, adsRemoved: true }, events: [{ type: 'adsRemoved' }] };
}
