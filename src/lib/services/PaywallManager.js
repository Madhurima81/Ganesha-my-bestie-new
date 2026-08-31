// PaywallManager.js
// Extension point for the freemium paywall. Deliberately NOT building any paywall UI here —
// this only defines where the trigger check belongs, wired at its call sites, so the paywall
// can be built later without hunting for where it should plug in.
//
// The paywall must stay OUT of the onboarding sequence entirely. It is called from:
//   1. GameStateManager.unlockNextScene() — the moment Zone 1 (Symbol Mountain, the free
//      zone) completes and Zone 2 unlocks.
//   2. CleanMapZone.jsx on mount — a "Day 3 (or later) return" check against the active
//      profile's createdAt.

const DAY_MS = 24 * 60 * 60 * 1000;

export function checkPaywallTrigger(context = {}) {
  // context: { reason: 'zone1-complete' | 'day3-return', profile }
  // TODO: implement real paywall surfacing once the paywall UI exists.
  console.log('💰 PaywallManager: checkPaywallTrigger stub called with', context);
  return { shouldShowPaywall: false, reason: context.reason || null };
}

export function isDayThreeOrLaterReturn(profile) {
  if (!profile || !profile.createdAt) return false;
  return Date.now() - profile.createdAt >= 3 * DAY_MS;
}
