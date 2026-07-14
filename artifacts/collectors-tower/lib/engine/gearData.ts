/**
 * Static weapon/gear roster for the collection-log system. Confirmed
 * design rules (from the tower-climber-progression-model spreadsheet's
 * "Loot Tiers" and "Gear Stacking Model" sheets — see gearFormulas.ts
 * for the math these feed):
 *
 * - Every item has a permanent `id` and `familyId` used by all engine
 *   logic. `name` and `familyName` are UI-only display strings that can
 *   be renamed freely without touching any formula — never match on
 *   them.
 * - Items in the same family sum their bonus%; each distinct family
 *   then contributes its own multiplier, and those multipliers stack
 *   against each other (multiply), never add.
 * - `bonusPerLevel` is the % this item contributes per level, linear
 *   with level (matches the spreadsheet's per-item bonus-at-level
 *   datapoints, e.g. a 10%/level solo item or a 2.15%/level family
 *   item). Exact roster/content is a game-balance choice — the
 *   mechanics (tiering, stacking, leveling) are the locked part.
 * - Rarity tiers and their shared drop chances live in gearFormulas.ts,
 *   split evenly across however many items exist in that tier here —
 *   never hand-tuned per item.
 */

export type GearTier =
  | 'starter'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export const GEAR_TIER_ORDER: GearTier[] = [
  'starter',
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

export const GEAR_TIER_LABELS: Record<GearTier, string> = {
  starter: 'Starter',
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

export interface WeaponDefinition {
  /** Permanent identity used by all matching/formula logic. Never rename. */
  id: string;
  /** Freely renameable, shown to the player. */
  name: string;
  /** Permanent family identity used by the stacking formula. Never rename. */
  familyId: string;
  /** Freely renameable, shown to the player. */
  familyName: string;
  tier: GearTier;
  /** % attack bonus this item contributes per level (linear with level). */
  bonusPerLevel: number;
  icon: string;
}

export const WEAPON_ROSTER: WeaponDefinition[] = [
  // Starter — near-guaranteed, first chest or two.
  {
    id: 'rusty_blade',
    name: 'Rusty Blade',
    familyId: 'starter_family',
    familyName: 'Starter Family',
    tier: 'starter',
    bonusPerLevel: 1.0,
    icon: 'sword',
  },

  // Common — reached within the first real play session.
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    familyId: 'sword_family',
    familyName: 'Sword Family',
    tier: 'common',
    bonusPerLevel: 2.0,
    icon: 'sword',
  },
  {
    id: 'iron_dagger',
    name: 'Iron Dagger',
    familyId: 'dagger_family',
    familyName: 'Dagger Family',
    tier: 'common',
    bonusPerLevel: 2.0,
    icon: 'knife-military',
  },
  {
    id: 'wood_bow',
    name: 'Wooden Bow',
    familyId: 'bow_family',
    familyName: 'Bow Family',
    tier: 'common',
    bonusPerLevel: 2.0,
    icon: 'bow-arrow',
  },
  {
    id: 'stone_hammer',
    name: 'Stone Hammer',
    familyId: 'hammer_family',
    familyName: 'Hammer Family',
    tier: 'common',
    bonusPerLevel: 2.0,
    icon: 'hammer',
  },
  {
    id: 'iron_spear',
    name: 'Iron Spear',
    familyId: 'spear_family',
    familyName: 'Spear Family',
    tier: 'common',
    bonusPerLevel: 2.0,
    icon: 'spear',
  },

  // Uncommon — a solid early-to-mid goal, days not weeks.
  {
    id: 'steel_sword',
    name: 'Steel Sword',
    familyId: 'sword_family',
    familyName: 'Sword Family',
    tier: 'uncommon',
    bonusPerLevel: 3.0,
    icon: 'sword',
  },
  {
    id: 'twin_daggers',
    name: 'Twin Daggers',
    familyId: 'dagger_family',
    familyName: 'Dagger Family',
    tier: 'uncommon',
    bonusPerLevel: 3.0,
    icon: 'knife-military',
  },
  {
    id: 'long_bow',
    name: 'Longbow',
    familyId: 'bow_family',
    familyName: 'Bow Family',
    tier: 'uncommon',
    bonusPerLevel: 3.0,
    icon: 'bow-arrow',
  },
  {
    id: 'war_hammer',
    name: 'War Hammer',
    familyId: 'hammer_family',
    familyName: 'Hammer Family',
    tier: 'uncommon',
    bonusPerLevel: 3.0,
    icon: 'hammer',
  },

  // Rare — mid-game chase item, weeks of play.
  {
    id: 'flame_sword',
    name: 'Flame Sword',
    familyId: 'sword_family',
    familyName: 'Sword Family',
    tier: 'rare',
    bonusPerLevel: 5.0,
    icon: 'sword',
  },
  {
    id: 'shadow_daggers',
    name: 'Shadow Daggers',
    familyId: 'dagger_family',
    familyName: 'Dagger Family',
    tier: 'rare',
    bonusPerLevel: 5.0,
    icon: 'knife-military',
  },
  {
    id: 'storm_crossbow',
    name: 'Crossbow of Storms',
    familyId: 'bow_family',
    familyName: 'Bow Family',
    tier: 'rare',
    bonusPerLevel: 5.0,
    icon: 'bow-arrow',
  },

  // Epic — long-haul goal, months of consistent play.
  {
    id: 'excalibur_fragment',
    name: 'Excalibur Fragment',
    familyId: 'sword_family',
    familyName: 'Sword Family',
    tier: 'epic',
    bonusPerLevel: 8.0,
    icon: 'sword',
  },
  {
    id: 'ravager_axe',
    name: 'Ravager Axe',
    familyId: 'axe_solo',
    familyName: 'Ravager Family',
    tier: 'epic',
    bonusPerLevel: 8.0,
    icon: 'axe',
  },

  // Legendary — rare bragging-rights item, most players won't finish.
  {
    id: 'godslayer',
    name: 'Godslayer',
    familyId: 'sword_family',
    familyName: 'Sword Family',
    tier: 'legendary',
    bonusPerLevel: 12.0,
    icon: 'sword',
  },
  {
    id: 'worldbreaker_maul',
    name: 'Worldbreaker Maul',
    familyId: 'maul_solo',
    familyName: 'Worldbreaker Family',
    tier: 'legendary',
    bonusPerLevel: 12.0,
    icon: 'hammer',
  },

  // Mythic / trophy — effectively aspirational.
  {
    id: 'dragonfang_blade',
    name: 'Dragonfang Blade',
    familyId: 'dragon_solo',
    familyName: 'Dragonfang Family',
    tier: 'mythic',
    bonusPerLevel: 20.0,
    icon: 'sword',
  },
];

export function getWeaponDefinition(id: string): WeaponDefinition | undefined {
  return WEAPON_ROSTER.find((item) => item.id === id);
}

export function weaponsByTier(tier: GearTier): WeaponDefinition[] {
  return WEAPON_ROSTER.filter((item) => item.tier === tier);
}
