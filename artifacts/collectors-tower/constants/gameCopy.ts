/**
 * Plain UI copy for Collector's Tower. This is presentation copy only —
 * it has no bearing on game logic (see lib/engine/) and is not a
 * swappable/skin abstraction; this is a single-product game.
 */

export const gameCopy = {
  productName: "Collector's Tower",
  attackShortLabel: 'ATK',
  floorLabel: (floor: number) => `Floor ${floor}`,
  enemyLabel: 'Enemy',
  wallLabel: 'Wall Floor',
  wallSubLabel: 'Enemy HP ×3 — hold the line',

  soldiersTitle: 'Soldiers',
  goldLabel: 'Gold',
  notRecruitedLabel: 'Not Recruited',
  soldierLevelLabel: (level: number) => `Lv. ${level}`,
  soldierMaxLevelLabel: 'MAX LVL',
  soldierPowerLabel: 'Power',
  recruitButtonLabel: (cost: number) => `Recruit — ${cost}g`,
  levelUpButtonLabel: (cost: number) => `Level Up — ${cost}g`,
  soldierWallTitle: 'Level Wall',
  soldierWallSubLabel: (name: string) => `${name} has hit the Level 100 wall`,
};
