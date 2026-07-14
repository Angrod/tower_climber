---
name: Collector's Tower monetization
description: Two-currency shop, ads, and ad-free buyout design decisions for Collector's Tower.
---

- Currency is earn-only by hard design rule: Gold (floor clears) and Shop Currency (daily login + opt-in rewarded ads) are never purchasable with real money. The Fire Sword is Shop-Currency-only. Do not add any real-money path to either currency or to gear.
- The RevenueCat integration proposal for the ad-free buyout was declined by the user. The buyout and ad placements were built as clearly-labeled local stubs (`lib/purchases.ts`, `components/ads/*`) wired through the same real GameContext/state path a live SDK would use, so connecting RevenueCat/an ad network later only requires swapping those modules' internals — no data-flow changes.
- **Why:** keeps the real money surface isolated to one purchase (`markAdsRemoved`) and avoids hand-rolled billing logic bleeding into game state.
