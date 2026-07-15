---
name: Collector's Tower enemy attack/retaliation
description: How enemies damage Heroes — real HP-based combat, not the old flat coin-flip.
---

Enemy retaliation is real: each enemy has an attack power (`getEnemyAttackPower` in
`lib/engine/formulas.ts`, reuses the confirmed enemy-HP growth/wall shape but the
magnitude itself — `ENEMY_BASE_ATTACK`/`ENEMY_ATTACK_GROWTH_RATE` — is an unverified
placeholder, same as Hero stats). Each Hero instance now has a real `hp` field
(`HeroInstance.hp` in `types.ts`), set to `getHeroBaseHp(level, isVariant)` on every
summon/resummon. `applyEnemyAttack` (`heroEngine.ts`) hits one random active Hero for
that damage on every manual tap and auto-attack tick; HP <= 0 marks it inactive
(frees its slot for resummon, same as before).

**Why:** the old `maybeDefeatHero`/`HERO_DEATH_CHANCE_PER_ATTACK` was an explicit
placeholder flat 5% coin-flip per tap standing in for a real combat mechanic — it has
been removed. Don't reintroduce a flat-chance death roll; enemy attack power vs. Hero
HP is now the confirmed mechanism.

**How to apply:** when tuning combat difficulty or building the enemy-attack
balancing follow-up, treat `ENEMY_BASE_ATTACK`/`ENEMY_ATTACK_GROWTH_RATE` as the
placeholder to replace — the HP-depletion mechanism itself is the confirmed design,
just like the Fame skill previously locked in the soldier→Hero attack link.
