import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  applyAutoAttackTick,
  applyManualTap,
  createInitialState,
  toggleAutoAttack as toggleAutoAttackEngine,
} from '@/lib/engine/gameEngine';
import {
  levelUpSoldier as levelUpSoldierEngine,
  recruitSoldier as recruitSoldierEngine,
} from '@/lib/engine/soldierEngine';
import { SOLDIER_ROSTER } from '@/lib/engine/soldierData';
import { AUTO_ATTACK_INTERVAL_MS } from '@/lib/engine/formulas';
import {
  claimDailyLogin as claimDailyLoginEngine,
  grantRewardedAdReward as grantRewardedAdRewardEngine,
  markAdsRemoved as markAdsRemovedEngine,
  purchaseBoost as purchaseBoostEngine,
  purchaseFireSword as purchaseFireSwordEngine,
} from '@/lib/engine/shopEngine';
import type { GameEvent, GameState, SoldierId } from '@/lib/engine/types';

const STORAGE_KEY = 'collectors-tower.game-state.v1';
const DAMAGE_POPUP_LIFETIME_MS = 700;
const WALL_BANNER_LIFETIME_MS = 1800;

export interface DamagePopup {
  id: string;
  amount: number;
}

interface GameContextValue {
  state: GameState;
  isLoaded: boolean;
  damagePopups: DamagePopup[];
  wallBannerVisible: boolean;
  soldierWallBannerName: SoldierId | null;
  tapAttack: () => void;
  toggleAutoAttack: () => void;
  recruitSoldier: (id: SoldierId) => void;
  levelUpSoldier: (id: SoldierId) => void;
  purchaseBoost: () => void;
  purchaseFireSword: () => void;
  grantRewardedAdReward: () => void;
  markAdsRemoved: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Normalizes a save loaded from AsyncStorage into a valid, current-shape
 * GameState. Older saves predate `gold` and `soldiers` (added for the
 * Sellswords roster) — without this, those fields would be `undefined`,
 * corrupting gold math and crashing the Soldiers tab. Also guards against
 * malformed/partial JSON rather than trusting it directly as GameState.
 */
function normalizeLoadedState(parsed: unknown): GameState {
  const fresh = createInitialState();
  if (typeof parsed !== 'object' || parsed === null) return fresh;
  const raw = parsed as Partial<GameState>;

  const gold = typeof raw.gold === 'number' && Number.isFinite(raw.gold) ? raw.gold : fresh.gold;

  const shopCurrency =
    typeof raw.shopCurrency === 'number' && Number.isFinite(raw.shopCurrency)
      ? raw.shopCurrency
      : fresh.shopCurrency;
  const boostActiveUntil =
    typeof raw.boostActiveUntil === 'number' && Number.isFinite(raw.boostActiveUntil)
      ? raw.boostActiveUntil
      : fresh.boostActiveUntil;
  const fireSwordOwned =
    typeof raw.fireSwordOwned === 'boolean' ? raw.fireSwordOwned : fresh.fireSwordOwned;
  const lastDailyLoginDate =
    typeof raw.lastDailyLoginDate === 'string' ? raw.lastDailyLoginDate : fresh.lastDailyLoginDate;
  const adsRemoved = typeof raw.adsRemoved === 'boolean' ? raw.adsRemoved : fresh.adsRemoved;

  const rawUnits = raw.soldiers?.units;
  const units = { ...fresh.soldiers.units };
  if (rawUnits && typeof rawUnits === 'object') {
    for (const def of SOLDIER_ROSTER) {
      const rawLevel = rawUnits[def.id]?.level;
      if (typeof rawLevel === 'number' && Number.isFinite(rawLevel) && rawLevel >= 0) {
        units[def.id] = { level: rawLevel };
      }
    }
  }

  return {
    ...fresh,
    ...raw,
    gold,
    soldiers: { units },
    shopCurrency,
    boostActiveUntil,
    fireSwordOwned,
    lastDailyLoginDate,
    adsRemoved,
  };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [wallBannerVisible, setWallBannerVisible] = useState(false);
  const [soldierWallBannerName, setSoldierWallBannerName] =
    useState<SoldierId | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && !cancelled) {
          const parsed: unknown = JSON.parse(saved);
          setState(normalizeLoadedState(parsed));
        }
      } catch {
        // Corrupt or missing save — fall back to a fresh run instead of crashing.
      } finally {
        if (!cancelled) setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, isLoaded]);

  // Claim the daily Shop Currency login reward once per calendar day,
  // as soon as the save has loaded. This is the only automatic Shop
  // Currency grant — everything else requires an explicit opt-in action.
  const dailyLoginClaimedRef = useRef(false);
  useEffect(() => {
    if (!isLoaded || dailyLoginClaimedRef.current) return;
    dailyLoginClaimedRef.current = true;
    setState((prev) => claimDailyLoginEngine(prev).state);
  }, [isLoaded]);

  const handleEvents = useCallback((events: GameEvent[]) => {
    for (const event of events) {
      if (event.type === 'damageDealt' && event.payload) {
        const popup: DamagePopup = { id: makeId(), amount: event.payload.amount };
        setDamagePopups((prev) => [...prev, popup]);
        setTimeout(() => {
          setDamagePopups((prev) => prev.filter((p) => p.id !== popup.id));
        }, DAMAGE_POPUP_LIFETIME_MS);
      }
      if (event.type === 'enemyDefeated') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      if (event.type === 'wallReached') {
        setWallBannerVisible(true);
        setTimeout(() => setWallBannerVisible(false), WALL_BANNER_LIFETIME_MS);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
          () => {},
        );
      }
    }
  }, []);

  const tapAttack = useCallback(() => {
    const result = applyManualTap(stateRef.current);
    setState(result.state);
    handleEvents(result.events);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [handleEvents]);

  const toggleAutoAttack = useCallback(() => {
    setState((prev) => toggleAutoAttackEngine(prev));
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const recruitSoldier = useCallback((id: SoldierId) => {
    const result = recruitSoldierEngine(stateRef.current, id);
    if (result.state !== stateRef.current) {
      setState(result.state);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  }, []);

  const levelUpSoldier = useCallback((id: SoldierId) => {
    const before = stateRef.current;
    const result = levelUpSoldierEngine(before, id);
    if (result.state === before) return;
    setState(result.state);
    Haptics.selectionAsync().catch(() => {});
    const reachedWall = result.events.some(
      (event) => event.type === 'soldierWallReached',
    );
    if (reachedWall) {
      setSoldierWallBannerName(id);
      setTimeout(() => setSoldierWallBannerName(null), WALL_BANNER_LIFETIME_MS);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {},
      );
    }
  }, []);

  const purchaseBoost = useCallback(() => {
    const before = stateRef.current;
    const result = purchaseBoostEngine(before);
    if (result.state === before) return;
    setState(result.state);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const purchaseFireSword = useCallback(() => {
    const before = stateRef.current;
    const result = purchaseFireSwordEngine(before);
    if (result.state === before) return;
    setState(result.state);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  /** Grants Shop Currency after a rewarded ad view completes. Never call before playback finishes. */
  const grantRewardedAdReward = useCallback(() => {
    setState((prev) => grantRewardedAdRewardEngine(prev).state);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  /** Flips the ad-free flag. Call only after a successful real-money purchase confirmation. */
  const markAdsRemoved = useCallback(() => {
    setState((prev) => markAdsRemovedEngine(prev).state);
  }, []);

  useEffect(() => {
    if (!state.autoAttackActive) return;
    const interval = setInterval(() => {
      const result = applyAutoAttackTick(stateRef.current);
      setState(result.state);
      handleEvents(result.events);
    }, AUTO_ATTACK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state.autoAttackActive, handleEvents]);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      isLoaded,
      damagePopups,
      wallBannerVisible,
      soldierWallBannerName,
      tapAttack,
      toggleAutoAttack,
      recruitSoldier,
      levelUpSoldier,
      purchaseBoost,
      purchaseFireSword,
      grantRewardedAdReward,
      markAdsRemoved,
    }),
    [
      state,
      isLoaded,
      damagePopups,
      wallBannerVisible,
      soldierWallBannerName,
      tapAttack,
      toggleAutoAttack,
      recruitSoldier,
      levelUpSoldier,
      purchaseBoost,
      purchaseFireSword,
      grantRewardedAdReward,
      markAdsRemoved,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
