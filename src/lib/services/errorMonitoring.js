// errorMonitoring.js — Sentry wrapper
// Silently disabled if VITE_SENTRY_DSN is not set.

import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN;

export function initErrorMonitoring() {
  if (!DSN || DSN.startsWith('your_')) return;

  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,   // 'development' or 'production'
    // Only send errors in production — keeps dev noise out of dashboard
    enabled: import.meta.env.PROD,
    // Sample 10% of performance traces (errors are always 100%)
    tracesSampleRate: 0.1,
    // Don't attach user PII
    beforeSend(event) {
      delete event.user;
      return event;
    }
  });
}

// Wrap your top-level component with this for automatic error boundaries
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Manual error reporting (use sparingly — Sentry auto-catches unhandled errors)
export function reportError(error, context = {}) {
  if (!DSN || DSN.startsWith('your_')) {
    console.error('[Error]', error, context);
    return;
  }
  Sentry.withScope(scope => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
}
