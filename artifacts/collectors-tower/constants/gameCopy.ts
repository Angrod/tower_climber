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
  soldierMaxLevelLabel: (wallLevel: number) => `LVL ${wallLevel} WALL`,
  soldierPowerLabel: 'Power',
  recruitButtonLabel: (cost: number) => `Recruit — ${cost}g`,
  levelUpButtonLabel: (cost: number) => `Level Up — ${cost}g`,
  soldierWallTitle: 'Level Wall',
  soldierWallSubLabel: (name: string, wallLevel: number) =>
    `${name} has hit the Level ${wallLevel} wall`,

  shopTitle: 'Shop',
  shopCurrencyLabel: 'Shop Currency',
  goldSectionTitle: 'Gold — Upgrades',
  goldSectionSubtitle: 'Earned from floor clears. Never for sale.',
  shopCurrencySectionTitle: 'Shop Currency — Boosts & Gear',
  shopCurrencySectionSubtitle: 'Earned from daily login and rewarded ads. Never for sale.',

  soldierUpgradesCardTitle: 'Soldier Upgrades',
  soldierUpgradesCardBody: 'Recruit and level up your Sellswords roster with Gold.',
  goToSoldiersLabel: 'Go to Soldiers',
  heroUpgradesCardTitle: 'Hero Upgrades',
  skillUpgradesCardTitle: 'Skill Upgrades',
  comingSoonLabel: 'Coming Soon',

  dailyLoginCardTitle: 'Daily Login Bonus',
  dailyLoginAvailableBody: (amount: number) => `Claim ${amount} Shop Currency for logging in today.`,
  dailyLoginClaimedBody: 'Claimed for today — come back tomorrow.',
  claimLabel: 'Claim',
  claimedLabel: 'Claimed',

  boostCardTitle: 'Power Surge',
  boostCardBody: (multiplier: number, seconds: number) =>
    `${multiplier}x attack power for ${seconds}s.`,
  boostActiveBody: (secondsLeft: number) => `Active — ${secondsLeft}s left`,
  buyBoostLabel: (cost: number) => `Buy — ${cost} SC`,

  fireSwordCardTitle: 'Fire Sword',
  fireSwordCardBody: 'A rare blade for the collection. Shop-Currency-only — never purchasable with real money.',
  fireSwordOwnedLabel: 'Owned',
  buyFireSwordLabel: (cost: number) => `Buy — ${cost} SC`,

  adsSectionTitle: 'Support the Tower',
  adFreeCardTitle: 'Remove Ads',
  adFreeCardBody: (price: string) => `One-time purchase, ${price}. Removes all ads forever.`,
  adFreeOwnedBody: 'Ads removed — thanks for your support!',
  removeAdsLabel: (price: string) => `Remove Ads — ${price}`,
  rewardedAdCardTitle: 'Watch an Ad',
  rewardedAdCardBody: (amount: number) => `Opt in to a short video for ${amount} Shop Currency.`,
  watchAdLabel: 'Watch Ad',
  watchingAdLabel: 'Watching…',
  adRewardGrantedLabel: (amount: number) => `+${amount} Shop Currency!`,
  purchaseConfirmTitle: 'Remove Ads',
  purchaseConfirmBody: (price: string) =>
    `One-time purchase of ${price}. This is the only real-money purchase in Collector's Tower — it never grants Gold, Shop Currency, or gear.`,
  purchaseConfirmButton: (price: string) => `Confirm — ${price}`,
  purchaseCancelButton: 'Not Now',
  purchaseDemoNote: 'Demo checkout — no real charge until payments are connected.',

  bannerAdLabel: 'Advertisement',
  bannerAdPlaceholder: 'Your ad could be here',

  weaponsTitle: 'Weapons',
  weaponsSubtitle: 'Collection log',
  weaponsMultiplierLabel: 'Gear Multiplier',
  weaponsUndiscoveredLabel: '???',
  weaponsUndiscoveredBody: 'Undiscovered — keep clearing floors to find it.',
  weaponsLevelLabel: (level: number) => `Lv. ${level}`,
  weaponsEquippedLabel: 'Equipped',
  weaponsEquipLabel: 'Equip',
  weaponsUnequipLabel: 'Unequip',
  weaponsFamilyBonusLabel: (percent: string) => `+${percent}% family bonus`,
  weaponsFamilyMultiplierLabel: (multiplier: string) => `×${multiplier}`,
  weaponsCompareIfEquippedLabel: (multiplier: string) => `Equip for ×${multiplier} total`,
  weaponsCompareIfUnequippedLabel: (multiplier: string) => `Unequip → ×${multiplier} total`,
  weaponsDropNewLabel: (name: string) => `New item: ${name}!`,
  weaponsDropLeveledUpLabel: (name: string, level: number) => `${name} → Lv. ${level}!`,
  weaponsOwnedCountLabel: (owned: number, total: number) => `${owned} / ${total} discovered`,
  weaponsDetailTitle: 'Item Details',
  weaponsCloseLabel: 'Close',
};
