---
name: Collector's Tower gear/weapon system
description: Locked mechanics for the Weapons collection-log system (family stacking, pool-based rarity, duplicate-drop leveling) — spreadsheet-derived, don't reinvent.
---

The weapon/gear system's mechanics come from the `tower-climber-progression-model` spreadsheet and are locked design, not placeholders:

- **Family stacking, not flat addition.** Items share a family identity; same-family bonus% sums, then each distinct family's multiplier (1 + summed%/100) multiplies against other families' multipliers. Matching must key off the permanent family id, never a display name.
- **Duplicate-drop leveling.** Items start at level 1 on first collect; no random level ever rolls. A repeat drop of the same item increments its level (and bonus%) instead of creating a new entry.
- **Pool-based rarity tiers.** Each tier has one shared total drop chance, split evenly (computed live, not hardcoded) across whatever items currently exist in that tier, so adding/removing roster items auto-redistributes the chance.
- Gear currently affects attack power only (not HP/armor) — an explicit scope boundary from the task that introduced it, not a technical limitation. A follow-up task covers extending it to HP/armor.

**Why:** these are spreadsheet-derived, cross-checked design decisions — don't switch to flat/random/hand-tuned alternatives even if simpler.

**How to apply:** when extending gear (new item types, new stats it affects, new slots), preserve these three rules exactly; only the item roster/content is a free game-balance choice.
