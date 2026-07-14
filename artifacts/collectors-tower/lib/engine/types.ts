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
}

export type GameEventType =
  | 'damageDealt'
  | 'enemyDefeated'
  | 'floorAdvanced'
  | 'wallReached';

export interface GameEvent {
  type: GameEventType;
  payload?: Record<string, number>;
}
