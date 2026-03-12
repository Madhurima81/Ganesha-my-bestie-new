// useGameSounds.js — React hook wrapping the SoundManager
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
} from '../audio/SoundManager';

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
