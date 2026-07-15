---
name: Collector's Tower Fame skill
description: How Soldiers connect to Hero combat — the confirmed rule, not a placeholder.
---

Fame is the one confirmed mechanism linking the Sellswords roster to Hero combat: Hero attack
gains `Total Soldier Attack x (Fame Level x 1%)`, added as a flat additive term inside
`getEffectiveHeroAttack`/`getActiveHeroesAttack` (heroFormulas.ts), on top of the existing
gear/boost multiplier — not a separate parallel damage/income mechanic.

**Why:** the task spec explicitly named Fame as the confirmed rule and ruled out inventing an
alternative soldier-to-combat mechanism (e.g. a separate multiplier or idle income).

**How to apply:** `getTotalSoldierAttack` (soldierFormulas.ts) sums `getSoldierPower` across
`SOLDIER_ROSTER` — never recompute soldier curve/wall math elsewhere. Fame's own level/cost curve
follows the same shape as the Summon/Paragon's Favor skills (own id in heroData.ts, own
`fameSkillLevel` field on `HeroesState`, own upgrade engine fn). Its cost curve numbers are
placeholders, same status as other Hero skill costs — expect a future balancing pass to touch them.
