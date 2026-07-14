/**
 * Pure drop-resolution and stacking math for the weapon/gear collection
 * system. Ported faithfully from the tower-climber-progression-model
 * spreadsheet's "Loot Tiers" and "Gear Stacking Model" sheets — the
 * confirmed source of truth for these numbers. Do not deviate from the
 * mechanics below; only the exact item roster (gearData.ts) is a
 * game-balance choice.
 *
 * Loot Tiers: each tier has one shared total drop chance. That chance
 * is split evenly across however many items exist in the tier — never
 * hand-tuned per item. Adding/removing an item from a tier
 * automatically redistributes the tier's shared chance, because
 * `chancePerItem` divides by the live item count from gearData.ts
 * rather than a hardcoded number.
 *
 * Gear Stacking Model: items in the same Family ID sum their bonus %.
 * Each distinct family then contributes its own multiplier
 * (1 + summed bonus / 100) onto attack power, and those family
 * multipliers multiply against each other — never add. All matching is
 * keyed off Family ID, never display name.
 */

import { GEAR_TIER_ORDER, WEAPON_ROSTER, weaponsByTier, type GearTier, type WeaponDefinition } from './gearData';
import type { GearState } from './types';

/**
 * Shared total drop chance per tier, from the spreadsheet's "Loot
 * Tiers" sheet. These do not sum to 1 — the remainder is a chest that
 * yields nothing, matching the spreadsheet's per-tier design intent
 * (Starter is "near-guaranteed", Mythic is "effectively aspirational").
 */
export const LOOT_TIER_TOTAL_CHANCE: Record<GearTier, number> = {
  starter: 0.85,
  common: 0.075,
  uncommon: 0.025,
  rare: 0.004,
  epic: 0.0006,
  legendary: 0.00005,
  mythic: 0.000003,
};

/** This tier's shared chance split evenly across its current item count. Redistributes automatically as items are added/removed. */
export function chancePerItemInTier(tier: GearTier): number {
  const items = weaponsByTier(tier);
  if (items.length === 0) return 0;
  return LOOT_TIER_TOTAL_CHANCE[tier] / items.length;
}

/** Resolves one loot-chest roll to a specific item, or null on a miss. */
export function resolveGearDrop(rng: () => number = Math.random): WeaponDefinition | null {
  const roll = rng();
  let cursor = 0;
  for (const tier of GEAR_TIER_ORDER) {
    const items = weaponsByTier(tier);
    if (items.length === 0) continue;
    const tierChance = LOOT_TIER_TOTAL_CHANCE[tier];
    if (roll < cursor + tierChance) {
      // Land in this tier — pick the specific item by an even split of
      // the tier's own chance range, keyed only by array position.
      const withinTier = (roll - cursor) / tierChance;
      const index = Math.min(items.length - 1, Math.floor(withinTier * items.length));
      return items[index];
    }
    cursor += tierChance;
  }
  return null;
}

/** Bonus % this item contributes at a given level. Level 1 is the first-collect level; leveling is linear per the spreadsheet's per-item datapoints. */
export function getItemBonusPercent(def: WeaponDefinition, level: number): number {
  if (level <= 0) return 0;
  return def.bonusPerLevel * level;
}

export interface FamilyTotal {
  familyId: string;
  familyName: string;
  /** Summed bonus % across every equipped item in this family. */
  summedBonusPercent: number;
  /** 1 + summedBonusPercent / 100 — this family's contribution to the overall multiplier. */
  multiplier: number;
}

/**
 * Groups equipped items by Family ID and sums their bonus %, per the
 * stacking model. Only equipped items count — owning an item that
 * isn't equipped contributes nothing, which is what makes "equip"
 * a real strategic choice.
 */
export function getEquippedFamilyTotals(gear: GearState): FamilyTotal[] {
  const totals = new Map<string, FamilyTotal>();

  for (const itemId of gear.equippedIds) {
    const itemState = gear.owned[itemId];
    if (!itemState) continue;
    const def = WEAPON_ROSTER.find((item) => item.id === itemId);
    if (!def) continue;

    const bonus = getItemBonusPercent(def, itemState.level);
    const existing = totals.get(def.familyId);
    if (existing) {
      existing.summedBonusPercent += bonus;
      existing.multiplier = 1 + existing.summedBonusPercent / 100;
    } else {
      totals.set(def.familyId, {
        familyId: def.familyId,
        familyName: def.familyName,
        summedBonusPercent: bonus,
        multiplier: 1 + bonus / 100,
      });
    }
  }

  return Array.from(totals.values());
}

/** Overall attack multiplier from equipped gear — each distinct family's multiplier stacked (multiplied) against the others. */
export function getGearAttackMultiplier(gear: GearState): number {
  const familyTotals = getEquippedFamilyTotals(gear);
  return familyTotals.reduce((product, family) => product * family.multiplier, 1);
}

/**
 * Previews the overall attack multiplier after toggling
 * `candidateItemId`'s equipped state — equips it if currently
 * unequipped, unequips it if currently equipped. Lets the UI show
 * "how this stacks with what you already own" before committing,
 * for both the equip and unequip directions.
 */
export function previewMultiplierAfterToggle(
  gear: GearState,
  candidateItemId: string,
): number {
  const isEquipped = gear.equippedIds.includes(candidateItemId);
  const preview: GearState = {
    owned: gear.owned,
    equippedIds: isEquipped
      ? gear.equippedIds.filter((id) => id !== candidateItemId)
      : [...gear.equippedIds, candidateItemId],
  };
  return getGearAttackMultiplier(preview);
}
