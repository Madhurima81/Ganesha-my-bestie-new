import React, { useState } from 'react';
import './InAppBrowserBanner.css';
import { detectPlatform, isInAppBrowser, isStandalone } from '../../services/PwaInstallManager';

// Parent-facing nudge, shown ONLY inside an in-app browser (Google app, Facebook, Instagram, ...) and only on
// the first screens, never during play. Those viewers keep their own storage (progress will not follow the
// family to Safari or the Home Screen app) and cannot install the app. Dismissible, remembered, never blocks.
const KEY = 'gmb_inapp_banner_dismissed';

const readDismissed = () => {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
};

export default function InAppBrowserBanner() {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [copied, setCopied] = useState(false);

  if (dismissed || !isInAppBrowser() || isStandalone()) return null;

  const { os } = detectPlatform();
  const target = os === 'ios' ? 'Safari' : os === 'android' ? 'Chrome' : 'your browser';

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(KEY, '1'); } catch { /* private mode: it just shows again next visit */ }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* copy blocked: the on-screen steps still work */ }
  };

  return (
    <div className="inappBanner" role="region" aria-label={`Open in ${target}`}>
      <div className="inappBanner__text">
        <p className="inappBanner__title">Open in {target} for the best experience</p>
        <p className="inappBanner__body">
          This page is open inside another app, so your child&rsquo;s progress may not follow them to the Home Screen app.
          Tap the menu or Share icon, then &ldquo;Open in {target}&rdquo;, or copy the link and paste it there.
        </p>
      </div>
      <div className="inappBanner__actions">
        <button type="button" className="inappBanner__btn inappBanner__btn--secondary" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        <button type="button" className="inappBanner__btn inappBanner__btn--primary" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
