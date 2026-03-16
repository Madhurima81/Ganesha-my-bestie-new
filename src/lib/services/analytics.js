// analytics.js — PostHog wrapper
// COPPA-safe: no cookies (persistence: 'localStorage'), no PII collected.
// Silently disabled if VITE_POSTHOG_KEY is not set.

import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let _ready = false;

export function initAnalytics() {
  if (!KEY || KEY.startsWith('your_')) return;

  posthog.init(KEY, {
    api_host: HOST,
    persistence: 'localStorage',      // No cookies — COPPA compliant
    autocapture: false,                // Only track what we explicitly call
    capture_pageview: false,           // SPA — we handle this manually
    disable_session_recording: true,   // No screen recording for kids
    loaded: () => { _ready = true; }
  });
}

// ── Core track function ───────────────────────────────────────────────────────

export function track(event, props = {}) {
  if (!_ready) return;
  posthog.capture(event, props);
}

// ── Key events for this app ───────────────────────────────────────────────────

export const Analytics = {
  // Profile
  profileCreated: (profile) =>
    track('profile_created', { avatar: profile.avatar }),

  profileSelected: (profileId) =>
    track('profile_selected'),

  // Zone / Scene navigation
  zoneEntered: (zoneId) =>
    track('zone_entered', { zone: zoneId }),

  sceneStarted: (zoneId, sceneId) =>
    track('scene_started', { zone: zoneId, scene: sceneId }),

  sceneCompleted: (zoneId, sceneId, stars) =>
    track('scene_completed', { zone: zoneId, scene: sceneId, stars }),

  sceneAbandoned: (zoneId, sceneId) =>
    track('scene_abandoned', { zone: zoneId, scene: sceneId }),

  // Audio
  audioToggled: (enabled) =>
    track('audio_toggled', { enabled }),

  // Offline
  offlineDetected: () =>
    track('offline_detected'),
};
