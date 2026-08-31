// PwaInstallManager.js
// App-wide singleton that listens for `beforeinstallprompt` independent of the onboarding
// sequence, so return visits can still trigger the install nudge after onboarding is long
// done. The onboarding step 6 banner (InstallPromptBanner) reads from this manager, but so
// can any later re-prompt (a settings menu item, etc) — single source of truth either way.

const DISMISS_COUNT_KEY = 'pwaInstallDismissCount';
const MAX_DISMISSALS = 2;

// iOS Safari never fires `beforeinstallprompt` — there is no programmatic install
// trigger at all there, only the manual Share -> Add to Home Screen path. So instead
// of waiting on an event that will never come, detect iOS Safari directly and let
// InstallPromptBanner render visual instructions instead of an "Install" button.
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as "MacIntel" with touch support — the classic iPad sniff misses it.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return isAppleMobile && !window.MSStream;
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone === true;
}

class PwaInstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.listeners = new Set();
    this._attachListener();
  }

  _attachListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.listeners.forEach((cb) => cb(true));
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.listeners.forEach((cb) => cb(false));
    });
  }

  isAvailable() {
    return !!this.deferredPrompt;
  }

  // True when we should show SOME install nudge — either the real Chrome/Android
  // prompt, or (on iOS Safari, which has no such prompt) the manual instructions.
  shouldShowAnyNudge() {
    if (this.hasExhaustedDismissals()) return false;
    if (isStandalone()) return false; // already installed
    return this.isAvailable() || isIOS();
  }

  // Subscribe to prompt-availability changes. Returns an unsubscribe function.
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getDismissCount() {
    return Number(localStorage.getItem(DISMISS_COUNT_KEY) || 0);
  }

  hasExhaustedDismissals() {
    return this.getDismissCount() >= MAX_DISMISSALS;
  }

  recordDismissal() {
    const next = this.getDismissCount() + 1;
    localStorage.setItem(DISMISS_COUNT_KEY, String(next));
    return next;
  }

  async promptInstall() {
    if (!this.deferredPrompt) return null;
    this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    return choice;
  }
}

const pwaInstallManager = new PwaInstallManager();
export default pwaInstallManager;
