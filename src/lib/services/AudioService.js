// AudioService.js — compatibility layer over the shared SFX engine (src/lib/audio/sfx.js).
//
// SFX:     every playXxx below is just an alias for a ROLE in sfx.js (one sound per role,
//          one volume table, one duck rule, one reward-at-a-time rule).
// Ambient: still Web Audio in ../audio/SoundManager (no live callers found in the 2026-10-09 audit).
// Native (later): swap the backend inside sfx.js in one place.

import { Howler } from 'howler';
import { sfx } from '../audio/sfx';
import {
  playAmbient,
  stopAmbient,
  setAmbientVolume,
  duckAmbient,
  unduckAmbient,
  setGlobalVolume as setSoundManagerVolume,
} from '../audio/SoundManager';

export function initAudioService() {
  sfx.preload();
}

// ── Global volume ────────────────────────────────────────────────────────────

export function setGlobalVolume(v) {
  const clamped = Math.max(0, Math.min(1, v));
  Howler.volume(clamped);          // Howler SFX
  setSoundManagerVolume(clamped);  // SoundManager ambient/voice
}

// ── Named exports (same API as before; optional vol = base-level override) ───

export const playUiTap              = (vol) => sfx.play('tap', vol);
export const playWrongTap           = (vol) => sfx.play('softWrong', vol);
export const playMagicSparkle       = (vol) => sfx.play('discovery', vol);
export const playMagicBloom         = (vol) => sfx.play('bloom', vol);
export const playDivineGlow         = (vol) => sfx.play('powerUnlock', vol);
export const playCelebrationTwinkle = (vol) => sfx.play('celebration', vol);
export const playCardRevealChime    = (vol) => sfx.play('correct', vol);

// Ambient & voice pass through to SoundManager unchanged
export { playAmbient, stopAmbient, setAmbientVolume, duckAmbient, unduckAmbient };
