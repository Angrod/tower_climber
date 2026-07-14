/**
 * Abstract engine types — the logical data model.
 *
 * Nothing in this file (or the rest of lib/engine) may reference sprites,
 * colors, movement axes, icon names, or copy strings for a specific
 * product variant. That mapping lives entirely in lib/engine/skins/*.
 * This separation is what lets the same engine power multiple visually
 * distinct products later (vertical climber, downward digger, radial
 * defense, etc.) as pure presentation swaps.
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

/**
 * A "skin" is the entire presentation-layer contract for a product
 * variant. It maps abstract engine state onto product-specific visuals,
 * labels, and movement direction — never the other way around.
 */
export interface GameSkin {
  id: string;
  productName: string;
  /** Long-form label for the attack stat, e.g. "Sword Damage". */
  attackLabel: string;
  /** Short badge label for the attack stat, e.g. "ATK". */
  attackShortLabel: string;
  /** Which way the hero/player-aligned unit visually travels. */
  heroVerticalDirection: 'up' | 'down';
  /** Which way enemies visually travel. */
  enemyVerticalDirection: 'up' | 'down';
  floorLabel: (floor: number) => string;
  enemyLabel: string;
  wallLabel: string;
  wallSubLabel: string;
}
