// PortraitLockOverlay.jsx
// ---------------------------------------------------------------------------
// TEMPORARY ALL-SCREENS LANDSCAPE LOCK — beta testing only.
//
// During this testing phase EVERY screen is locked to landscape with no
// exemptions: onboarding (Splash, Parent Gate, Sign-in, Child Name,
// Age + Avatar, PWA install nudge), the map, all zones, and all gameplay.
// Proper portrait support for the onboarding flow may be revisited
// post-launch (see DECISIONS.md — full portrait support is a later phase).
//
// Design notes:
//  - Visibility is 100% CSS-driven via `@media (orientation: portrait)`.
//    There are NO JS orientationchange / resize listeners. The overlay is
//    always in the DOM; CSS decides whether it shows. This means there is
//    zero flash of the app in portrait before any JS runs — the moment the
//    stylesheet parses, a portrait device is covered.
//  - Single self-contained file: markup + styles live here, no CSS import,
//    no external animation library. Styles are injected once via a <style>
//    tag with a stable id so multiple mounts can't duplicate it.
//  - Palette: lavender / purple, matched to the marketing landing page.
//  - Fonts: Baloo 2 for the heading, Nunito for the body (loaded in
//    index.html — project font rule, no exceptions).
// ---------------------------------------------------------------------------

import React from 'react';

const STYLE_ID = 'portrait-lock-overlay-styles';

const CSS = `
.portrait-lock-overlay {
  /* Hidden by default (landscape / desktop). Only portrait un-hides it. */
  display: none;
}

@media (orientation: portrait) {
  .portrait-lock-overlay {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 99999; /* above every app / onboarding layer */
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 24px;
    box-sizing: border-box;
    /* block ALL interaction with whatever is underneath */
    pointer-events: auto;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    background: linear-gradient(160deg, #EFE7F8 0%, #CDC1E3 60%, #B7A6D6 100%);
    color: #5e49a8;
    font-family: 'Nunito', sans-serif;
  }
}

/* Friendly phone/tablet shape that rocks from upright to sideways */
.portrait-lock-device {
  width: 92px;
  height: 150px;
  border-radius: 20px;
  background: #ffffff;
  border: 6px solid #7E6BB8;
  box-shadow: 0 10px 26px rgba(94, 73, 168, 0.35);
  position: relative;
  margin-bottom: 34px;
  animation: portrait-lock-rock 2.4s ease-in-out infinite;
  transform-origin: 50% 50%;
}

/* camera dot + home pill so it reads as a device, not a card */
.portrait-lock-device::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #CDC1E3;
}
.portrait-lock-device::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 34px;
  height: 5px;
  border-radius: 3px;
  background: #CDC1E3;
}

@keyframes portrait-lock-rock {
  0%   { transform: rotate(0deg); }
  45%  { transform: rotate(0deg); }
  70%  { transform: rotate(-90deg); }
  100% { transform: rotate(-90deg); }
}

.portrait-lock-title {
  font-family: 'Baloo 2', cursive;
  font-size: clamp(22px, 6vw, 30px);
  font-weight: 700;
  margin: 0 0 10px;
  color: #4a3a90;
}

.portrait-lock-body {
  font-family: 'Nunito', sans-serif;
  font-size: clamp(15px, 4vw, 18px);
  line-height: 1.45;
  margin: 0;
  max-width: 320px;
  color: #6b5f8e;
}

/* Respect users who ask for less motion — freeze the rock, keep the shape. */
@media (prefers-reduced-motion: reduce) {
  .portrait-lock-device {
    animation: none;
    transform: rotate(-90deg);
  }
}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

export default function PortraitLockOverlay() {
  // Inject once, synchronously on first render, so there is no frame where
  // the markup exists without its styles.
  ensureStyles();

  return (
    <div
      className="portrait-lock-overlay"
      role="alertdialog"
      aria-label="Please turn your device sideways to play"
    >
      <div className="portrait-lock-device" aria-hidden="true" />
      <h2 className="portrait-lock-title">Turn me sideways to play!</h2>
      <p className="portrait-lock-body">
        Ganesha and Mooshika need a little more room. Hold your device the long
        way and the fun pops right back!
      </p>
    </div>
  );
}
