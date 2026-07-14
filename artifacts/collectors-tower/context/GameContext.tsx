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
import { AUTO_ATTACK_INTERVAL_MS } from '@/lib/engine/formulas';
import type { GameEvent, GameState } from '@/lib/engine/types';

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
  tapAttack: () => void;
  toggleAutoAttack: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [wallBannerVisible, setWallBannerVisible] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && !cancelled) {
          const parsed = JSON.parse(saved) as GameState;
          setState(parsed);
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
      tapAttack,
      toggleAutoAttack,
    }),
    [state, isLoaded, damagePopups, wallBannerVisible, tapAttack, toggleAutoAttack],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
