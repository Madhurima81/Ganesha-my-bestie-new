// AudioService.js — Unified audio abstraction layer
//
// Web (now):     Howler.js — zero-latency, overlapping SFX, auto format selection
// Native (later): swap _backend to @capacitor-community/native-audio in one place
//
// Ambient & voice remain in SoundManager (Web Audio API synthesis — keep as-is)

import { Howl, Howler } from 'howler';
import {
  playUiTap        as synthUiTap,
  playWrongTap     as synthWrongTap,
  playMagicSparkle as synthSparkle,
  playMagicBloom   as synthBloom,
  playDivineGlow   as synthGlow,
  playCelebrationTwinkle as synthTwinkle,
  playCardRevealChime    as synthChime,
  playAmbient,
  stopAmbient,
  setAmbientVolume,
  duckAmbient,
  unduckAmbient,
  setGlobalVolume as setSoundManagerVolume,
} from '../audio/SoundManager';

// ── Sound definitions ────────────────────────────────────────────────────────
// src: shared SFX bank in /public/audio/sfx
// If a file is missing, Howl fails and we fall back to synthesized SFX.

const SFX = {
  uiTap:              { src: ['/audio/sfx/sfx-tap.mp3'],          volume: 0.32, fallback: synthUiTap },
  wrongTap:           { src: ['/audio/sfx/sfx-oops.mp3'],         volume: 0.40, fallback: synthWrongTap },
  magicSparkle:       { src: ['/audio/sfx/sfx-pop.mp3'],          volume: 0.50, fallback: synthSparkle },
  magicBloom:         { src: ['/audio/sfx/sfx-success.mp3'],      volume: 0.50, fallback: synthBloom },
  divineGlow:         { src: ['/audio/sfx/sfx-power-unlock.mp3'], volume: 0.45, fallback: synthGlow },
  celebrationTwinkle: { src: ['/audio/sfx/sfx-celebration.wav'],  volume: 0.55, fallback: synthTwinkle },
  cardRevealChime:    { src: ['/audio/sfx/sfx-chime.mp3'],        volume: 0.50, fallback: synthChime },
};

// ── Howl instances (lazy-created per sound) ──────────────────────────────────

const _howls = {};
const _loaded = {};   // true = MP3 loaded OK, false = failed (use synth)

function getHowl(id) {
  if (_howls[id]) return _howls[id];

  const def = SFX[id];
  const howl = new Howl({
    src: def.src,
    volume: def.volume,
    preload: true,
    onload:      () => { _loaded[id] = true; },
    onloaderror: () => { _loaded[id] = false; },  // MP3 missing — fallback to synth
  });

  _howls[id] = howl;
  return howl;
}

// ── Preload all SFX on service init ─────────────────────────────────────────

export function initAudioService() {
  Object.keys(SFX).forEach(id => getHowl(id));
}

// ── Core play function ───────────────────────────────────────────────────────

function playSfx(id, volumeOverride) {
  const def = SFX[id];
  if (!def) return;

  const howl = getHowl(id);

  // MP3 loaded and ready — use Howler (zero-latency, can overlap)
  if (_loaded[id] === true) {
    if (volumeOverride !== undefined) howl.volume(volumeOverride);
    howl.play();
    return;
  }

  // MP3 failed or still loading — use synthesized fallback
  def.fallback(volumeOverride);
}

// ── Global volume ────────────────────────────────────────────────────────────

export function setGlobalVolume(v) {
  const clamped = Math.max(0, Math.min(1, v));
  Howler.volume(clamped);          // Howler SFX
  setSoundManagerVolume(clamped);  // SoundManager ambient/voice
}

// ── Named exports (same API as useGameSounds — drop-in replacement) ──────────

export const playUiTap              = (vol) => playSfx('uiTap', vol);
export const playWrongTap           = (vol) => playSfx('wrongTap', vol);
export const playMagicSparkle       = (vol) => playSfx('magicSparkle', vol);
export const playMagicBloom         = (vol) => playSfx('magicBloom', vol);
export const playDivineGlow         = (vol) => playSfx('divineGlow', vol);
export const playCelebrationTwinkle = (vol) => playSfx('celebrationTwinkle', vol);
export const playCardRevealChime    = (vol) => playSfx('cardRevealChime', vol);

// Ambient & voice pass through to SoundManager unchanged
export { playAmbient, stopAmbient, setAmbientVolume, duckAmbient, unduckAmbient };

/*
 * ── Capacitor swap (when you go native) ─────────────────────────────────────
 *
 * npm install @capacitor-community/native-audio
 *
 * Replace playSfx() with:
 *   import { NativeAudio } from '@capacitor-community/native-audio';
 *   NativeAudio.preload({ assetId: id, assetPath: def.src[0] });
 *   NativeAudio.play({ assetId: id });
 *
 * Everything else stays identical.
 * ────────────────────────────────────────────────────────────────────────────
 */
