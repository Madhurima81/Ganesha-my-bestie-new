// errorMonitoring.js — Sentry wrapper
// Silently disabled if VITE_SENTRY_DSN is not set.
//
// @sentry/react (~112KB gzip) is dynamic-imported here, not at module top —
// neither SentryErrorBoundary nor reportError has any caller in the app
// (verified), so the only real entry point is initErrorMonitoring(), and
// deferring the import means Sentry's weight no longer blocks first paint.

const DSN = import.meta.env.VITE_SENTRY_DSN;

export async function initErrorMonitoring() {
  if (!DSN || DSN.startsWith('your_')) return;

  const Sentry = await import('@sentry/react');

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

// Manual error reporting (use sparingly — Sentry auto-catches unhandled errors)
export async function reportError(error, context = {}) {
  if (!DSN || DSN.startsWith('your_')) {
    console.error('[Error]', error, context);
    return;
  }
  const Sentry = await import('@sentry/react');
  Sentry.withScope(scope => {
    Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
}
