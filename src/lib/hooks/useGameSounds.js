// useGameSounds.js — React hook for game audio
// Routes through AudioService (Howler) — zero-latency, Capacitor-ready.
// API unchanged — all 25+ components work without modification.
import {
  playUiTap,
  playWrongTap,
  playMagicSparkle,
  playMagicBloom,
  playDivineGlow,
  playCelebrationTwinkle,
  playCardRevealChime,
  playAmbient,
  stopAmbient,
  setAmbientVolume,
  duckAmbient,
  unduckAmbient,
  setGlobalVolume,
} from '../services/AudioService';

export function useGameSounds() {
  return {
    playUiTap,
    playWrongTap,
    playSparkle:  playMagicSparkle,
    playBloom:    playMagicBloom,
    playGlow:     playDivineGlow,
    playTwinkle:  playCelebrationTwinkle,
    playChime:    playCardRevealChime,
    playAmbient,
    stopAmbient,
    setAmbientVolume,
    duckAmbient,
    unduckAmbient,
    setGlobalVolume,
  };
}
