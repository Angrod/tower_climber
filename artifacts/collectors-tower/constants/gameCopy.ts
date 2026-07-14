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
};
