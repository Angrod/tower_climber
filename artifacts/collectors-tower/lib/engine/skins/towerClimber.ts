/**
 * Presentation mapping for the "Tower Climber" product variant.
 *
 * This is the only file that should need to change if the game is ever
 * reskinned into a different visual product (e.g. a downward digger or a
 * radial defense variant) — the engine and formulas stay identical.
 */

import type { GameSkin } from '../types';

export const towerClimberSkin: GameSkin = {
  id: 'tower-climber',
  productName: "Collector's Tower",
  attackLabel: 'Sword Damage',
  attackShortLabel: 'ATK',
  heroVerticalDirection: 'up',
  enemyVerticalDirection: 'down',
  floorLabel: (floor: number) => `Floor ${floor}`,
  enemyLabel: 'Enemy',
  wallLabel: 'Wall Floor',
  wallSubLabel: 'Enemy HP ×3 — hold the line',
};
