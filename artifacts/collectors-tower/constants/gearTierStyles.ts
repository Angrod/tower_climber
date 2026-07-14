/**
 * UI-only rarity color treatment for gear tiers. Deliberately separate
 * from lib/engine/gearData.ts — the engine only knows tier ids, never
 * colors. Tier colors are fixed across light/dark scheme (rarity should
 * read the same regardless of theme, like a physical card border).
 */

import type { GearTier } from '@/lib/engine/gearData';

export const GEAR_TIER_COLORS: Record<GearTier, string> = {
  starter: '#9B9B9B',
  common: '#8FB98B',
  uncommon: '#4E9DD6',
  rare: '#8B5FD6',
  epic: '#D6785F',
  legendary: '#E3B04B',
  mythic: '#E35B8F',
};
