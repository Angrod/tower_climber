---
name: Collector's Tower scope
description: Whether the game engine should support multiple visual products (skins) or just this one game.
---

Collector's Tower is scoped as a single game, not a reusable multi-product engine. A "GameSkin" swappable-presentation abstraction was added during Milestone 1 planning, then explicitly walked back by the user after milestone acceptance and removed.

**Why:** the multi-skin idea originated from a strategy document meant as inspiration, not a confirmed requirement — it got promoted to an "architectural requirement" without the user deciding that on purpose. On review, the abstraction's unused surface (skin id, long-form attack label, hero/enemy movement direction fields) had zero real usage; only a handful of plain UI-copy strings were ever read through it.

**How to apply:** don't add abstraction layers, generic hooks, or presentation-swap seams in anticipation of hypothetical future reskins (e.g. "Deep Digger", "Radial Defense") unless the user explicitly brings that requirement back. Keep formulas/state logic and UI/presentation cleanly separated (that split is still good practice — see the event-based `GameEvent` system in `context/GameContext.tsx`, which is real load-bearing logic, not part of the dropped abstraction), but don't build a swappable-skin system on top of it for a single-product game. Plain UI copy now lives in `constants/gameCopy.ts`.
