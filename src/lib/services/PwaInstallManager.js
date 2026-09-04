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

export function isAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

// Coarse OS + browser sniff, only for choosing which "Add to Home Screen"
// walkthrough to show. Never used for feature gating.
export function detectPlatform() {
  const ua = (typeof navigator !== 'undefined' && (navigator.userAgent || '')) || '';
  const os = isIOS() ? 'ios' : isAndroid() ? 'android' : 'desktop';

  let browser = 'other';
  if (os === 'ios') {
    if (/CriOS/.test(ua)) browser = 'chrome';
    else if (/FxiOS/.test(ua)) browser = 'firefox';
    else if (/EdgiOS/.test(ua)) browser = 'edge';
    else browser = 'safari'; // any other iOS browser uses the Safari-style share sheet
  } else if (os === 'android') {
    if (/SamsungBrowser/.test(ua)) browser = 'samsung';
    else if (/Firefox/.test(ua)) browser = 'firefox';
    else if (/EdgA/.test(ua)) browser = 'edge';
    else if (/Chrome/.test(ua)) browser = 'chrome';
  } else {
    if (/Edg\//.test(ua)) browser = 'edge';
    else if (/Chrome\//.test(ua) && !/OPR|Brave/.test(ua)) browser = 'chrome';
    else if (/Safari/.test(ua) && /Version\//.test(ua)) browser = 'safari';
    else if (/Firefox/.test(ua)) browser = 'firefox';
  }
  return { os, browser };
}

// Returns the walkthrough to render in the "Show me how" in-card step view.
// `canNativePrompt` means we can just call promptInstall() and skip the steps.
export function getInstallGuide() {
  const { os, browser } = detectPlatform();
  const canNativePrompt = pwaInstallManager.isAvailable();
  const installed = isStandalone();

  if (installed) {
    return { os, browser, canNativePrompt, installed, title: 'Already added', steps: [] };
  }

  if (canNativePrompt) {
    return {
      os,
      browser,
      canNativePrompt,
      installed,
      title: 'One tap to add',
      steps: [{ icon: '⬇️', text: 'Tap the button below and confirm “Install”.' }],
    };
  }

  if (os === 'ios') {
    // Every iOS browser routes through the OS share sheet; only the button's
    // spot differs (Safari = bottom bar, Chrome/Edge/Firefox = address bar).
    const shareSpot =
      browser === 'safari'
        ? 'the Share button at the bottom of the screen'
        : 'the Share button in the address bar';
    return {
      os,
      browser,
      canNativePrompt,
      installed,
      title: 'Add to Home Screen',
      steps: [
        { icon: '⬆️', text: `Tap ${shareSpot} (the box with an arrow).` },
        { icon: '➕', text: 'Choose “Add to Home Screen”.' },
        { icon: '✅', text: 'Tap “Add” — the Ganesha icon appears on your home screen.' },
      ],
    };
  }

  if (os === 'android') {
    const menuHint =
      browser === 'samsung'
        ? 'Open the menu (☰), then “Add page to” → “Home screen”.'
        : browser === 'firefox'
          ? 'Open the menu (⋮), then “Install” (or “Add to Home screen”).'
          : 'Open the menu (⋮), then “Add to Home screen” (or “Install app”).';
    return {
      os,
      browser,
      canNativePrompt,
      installed,
      title: 'Add to Home Screen',
      steps: [
        { icon: '⋮', text: menuHint },
        { icon: '✅', text: 'Confirm — the Ganesha icon appears on your home screen.' },
      ],
    };
  }

  // Desktop, no install prompt available
  const desktopHint =
    browser === 'safari'
      ? 'Open the Share menu, then “Add to Dock”.'
      : browser === 'firefox'
        ? 'Firefox desktop can’t add app icons — open GMB in Chrome or Edge to install.'
        : 'Click the install icon (⊕ / monitor) at the right of the address bar.';
  return {
    os,
    browser,
    canNativePrompt,
    installed,
    title: 'Add GMB as an app',
    steps: [{ icon: '🖥️', text: desktopHint }],
  };
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
