/**
 * Static roster definitions for the 7-unit Sellswords roster. Names and
 * ordering are original to Collector's Tower — never the reference
 * game's unit names.
 *
 * Each unit gets its own growth curve: its own base power and its own
 * pair of per-level growth rates. The confirmed shape from planning is
 * ~5.5%/level up to level 50, accelerating to ~6.5%/level from 50-100.
 * Per-unit rates vary slightly around that shape (rather than sharing
 * one curve with a flat multiplier) so units are differentiated by
 * curve shape, not just a starting-value scalar. Recruit/level-up gold
 * costs are game-balance choices, not confirmed planning data.
 */

import type { SoldierId } from './types';

export interface SoldierDefinition {
  id: SoldierId;
  name: string;
  role: string;
  icon: string;
  /** Power at level 1 (once recruited). */
  basePower: number;
  /** Per-level growth rate applied for levels 1-50. */
  rateEarly: number;
  /** Per-level growth rate applied for levels 50-100. */
  rateLate: number;
  /** Gold cost to recruit this unit for the first time. */
  recruitCost: number;
}

export const SOLDIER_ROSTER: SoldierDefinition[] = [
  {
    id: 'squire',
    name: 'Squire',
    role: 'Recruit',
    icon: 'shield-outline',
    basePower: 3,
    rateEarly: 0.053,
    rateLate: 0.063,
    recruitCost: 50,
  },
  {
    id: 'footman',
    name: 'Footman',
    role: 'Melee',
    icon: 'sword',
    basePower: 4,
    rateEarly: 0.054,
    rateLate: 0.064,
    recruitCost: 150,
  },
  {
    id: 'archer',
    name: 'Archer',
    role: 'Ranged',
    icon: 'bow-arrow',
    basePower: 5,
    rateEarly: 0.055,
    rateLate: 0.065,
    recruitCost: 400,
  },
  {
    id: 'knight',
    name: 'Knight',
    role: 'Vanguard',
    icon: 'shield-sword',
    basePower: 7,
    rateEarly: 0.055,
    rateLate: 0.065,
    recruitCost: 900,
  },
  {
    id: 'druid',
    name: 'Druid',
    role: 'Support',
    icon: 'flower',
    basePower: 6,
    rateEarly: 0.056,
    rateLate: 0.066,
    recruitCost: 1800,
  },
  {
    id: 'witch',
    name: 'Witch',
    role: 'Dark Magic',
    icon: 'hat-fedora',
    basePower: 8,
    rateEarly: 0.056,
    rateLate: 0.066,
    recruitCost: 3500,
  },
  {
    id: 'wizard',
    name: 'Wizard',
    role: 'Arcane',
    icon: 'auto-fix',
    basePower: 10,
    rateEarly: 0.057,
    rateLate: 0.067,
    recruitCost: 7000,
  },
];

export function getSoldierDefinition(id: SoldierId): SoldierDefinition {
  const def = SOLDIER_ROSTER.find((unit) => unit.id === id);
  if (!def) throw new Error(`Unknown soldier id: ${id}`);
  return def;
}
