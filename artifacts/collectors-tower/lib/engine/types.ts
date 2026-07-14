/**
 * Engine types — the logical data model for the game state and the
 * events the engine emits. Nothing in this file (or the rest of
 * lib/engine) references colors, icon names, or UI copy — that lives in
 * constants/gameCopy.ts and the components that render the game.
 */

export interface GameState {
  /** Current tower floor, 1-indexed. */
  floor: number;
  /** Max HP of the enemy currently occupying `floor`. */
  enemyMaxHp: number;
  /** Remaining HP of the enemy currently occupying `floor`. */
  enemyCurrentHp: number;
  /** Flat damage dealt per attack (manual or auto). */
  attackPower: number;
  /** Whether the auto-attack system has been unlocked. */
  autoAttackUnlocked: boolean;
  /** Whether auto-attack is currently toggled on. */
  autoAttackActive: boolean;
  /** Lifetime count of manual taps (does not include auto-attack hits). */
  totalTaps: number;
  /** Lifetime count of floors cleared. */
  floorsCleared: number;
  /** Gold earned by clearing floors; spent recruiting/leveling soldiers. */
  gold: number;
  /** Sellswords roster progression. */
  soldiers: SoldiersState;
}

/**
 * The 7-unit Sellswords roster. These are the only valid soldier ids —
 * original names for this product, never the reference game's unit names.
 */
export type SoldierId =
  | 'squire'
  | 'footman'
  | 'archer'
  | 'knight'
  | 'druid'
  | 'witch'
  | 'wizard';

export interface SoldierUnitState {
  /** 0 means the unit has not been recruited yet. */
  level: number;
}

export interface SoldiersState {
  units: Record<SoldierId, SoldierUnitState>;
}

export type GameEventType =
  | 'damageDealt'
  | 'enemyDefeated'
  | 'floorAdvanced'
  | 'wallReached'
  | 'goldEarned'
  | 'soldierRecruited'
  | 'soldierLeveledUp'
  | 'soldierWallReached';

export interface GameEvent {
  type: GameEventType;
  payload?: Record<string, number>;
}
