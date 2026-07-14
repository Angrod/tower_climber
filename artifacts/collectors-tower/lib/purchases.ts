/**
 * Ad-free buyout purchase flow — the ONLY real-money purchase surface in
 * Collector's Tower. Never wire this module to Gold, Shop Currency, or
 * gear; it exists solely to remove ads.
 *
 * This project has no live payment processor connected yet (the
 * RevenueCat mobile-IAP integration was proposed and declined). This
 * stub simulates a successful purchase confirmation so the rest of the
 * app — state, persistence, UI — is fully wired end to end. Swap the
 * body of `purchaseAdFreeBuyout` for RevenueCat's
 * `Purchases.purchasePackage(...)` once the integration is connected;
 * everything else (GameContext.markAdsRemoved, the Shop screen) needs
 * no changes.
 */

export const AD_FREE_BUYOUT_PRICE_LABEL = '$4.99';

export interface PurchaseResult {
  success: boolean;
}

/** Simulates the real-money ad-free buyout confirmation. Resolves true on success. */
export async function purchaseAdFreeBuyout(): Promise<PurchaseResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true };
}
