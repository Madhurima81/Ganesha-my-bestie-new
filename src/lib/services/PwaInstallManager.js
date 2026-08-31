// PwaInstallManager.js
// App-wide singleton that listens for `beforeinstallprompt` independent of the onboarding
// sequence, so return visits can still trigger the install nudge after onboarding is long
// done. The onboarding step 6 banner (InstallPromptBanner) reads from this manager, but so
// can any later re-prompt (a settings menu item, etc) — single source of truth either way.

const DISMISS_COUNT_KEY = 'pwaInstallDismissCount';
const MAX_DISMISSALS = 2;

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
