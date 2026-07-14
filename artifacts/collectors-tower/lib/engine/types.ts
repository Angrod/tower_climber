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

  /**
   * Shop Currency — earn-only, never purchasable with real money. Earned
   * from daily login and opt-in rewarded ads. Spent on Shop boosts and
   * the Fire Sword.
   */
  shopCurrency: number;
  /** Epoch ms when the active Power Surge boost expires; null if none is active. */
  boostActiveUntil: number | null;
  /** Whether the player owns the Fire Sword. Shop-Currency-only — never for sale with real money. */
  fireSwordOwned: boolean;
  /** YYYY-MM-DD of the last claimed daily login reward, or null if never claimed. */
  lastDailyLoginDate: string | null;
  /** Whether the player purchased the one-time ad-free buyout — the only real-money purchase in the game. */
  adsRemoved: boolean;
  /** Weapon/gear collection — see lib/engine/gearFormulas.ts for the family-stacking math. */
  gear: GearState;
}

/** Per-item collection progress. Level starts at 1 on first drop; a repeat drop increments it rather than duplicating the entry. */
export interface GearItemState {
  level: number;
}

export interface GearState {
  /** Keyed by WeaponDefinition.id. Presence in this map means the item has been collected at least once. */
  owned: Record<string, GearItemState>;
  /** Item ids currently equipped. Only equipped items contribute to the attack multiplier. */
  equippedIds: string[];
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
  | 'soldierWallReached'
  | 'shopCurrencyEarned'
  | 'dailyLoginClaimed'
  | 'boostPurchased'
  | 'fireSwordPurchased'
  | 'adsRemoved'
  | 'gearDropped'
  | 'gearLeveledUp'
  | 'gearEquipped'
  | 'gearUnequipped';

export interface GameEvent {
  type: GameEventType;
  payload?: Record<string, number>;
  /** Item id this event concerns — only set for gear events, kept separate from the numeric payload. */
  itemId?: string;
}
