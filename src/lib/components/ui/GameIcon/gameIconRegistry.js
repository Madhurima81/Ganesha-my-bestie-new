/**
 * Central registry for all game UI icons.
 *
 * Each entry:
 *   emoji   — current fallback rendered as text (always works)
 *   src     — path to custom image asset (set to null until image is ready)
 *   alt     — screen-reader label
 *
 * To swap in a custom icon:
 *   1. Drop the image into src/assets/images/icons/  (or public/images/icons/)
 *   2. Import it at the top of this file
 *   3. Set src to the imported value
 *
 * Usage:
 *   import GameIcon from '../ui/GameIcon';
 *   <GameIcon name="refresh" size={28} />
 */

// -- Uncomment and add imports here as you add custom images --
// import refreshIcon   from '../../../../assets/images/icons/refresh.png';
// import playIcon      from '../../../../assets/images/icons/play.png';
// etc.

const registry = {

  // ── Buttons ──────────────────────────────────────────────────────────────

  /** Restart / Play Again button */
  refresh: {
    emoji: '🔄',
    src: null,
    alt: 'Restart',
  },

  /** Hear Song / Hear Word — audio playback */
  play: {
    emoji: '▶️',
    src: null,
    alt: 'Play',
  },

  /** Pause menu trigger */
  pause: {
    emoji: '⏸️',
    src: null,
    alt: 'Pause',
  },

  /** Continue to next scene */
  scene_continue: {
    emoji: '➡️',
    src: null,
    alt: 'Continue',
  },

  /** Primary CTA — "Try Another!" / "Let's Play!" */
  target: {
    emoji: '🎯',
    src: null,
    alt: 'Go',
  },

  /** Primary CTA — "Let's Begin" */
  cta_start: {
    emoji: '🌱',
    src: null,
    alt: 'Start',
  },

  /** CTA — "Meet My Family!" */
  cta_family: {
    emoji: '💛',
    src: null,
    alt: 'Family',
  },

  /** CTA — celebratory game start/complete */
  cta_play: {
    emoji: '✨',
    src: null,
    alt: 'Play',
  },

  /** "Send helper animal" action in Meaning Cave */
  rescue_action: {
    emoji: '🐾',
    src: null,
    alt: 'Send helper',
  },

  // ── Feedback / Status ─────────────────────────────────────────────────────

  /** Correct answer marker */
  confirm: {
    emoji: '✓',
    src: null,
    alt: 'Correct',
  },

  /** Wrong answer marker */
  wrong: {
    emoji: '✗',
    src: null,
    alt: 'Wrong',
  },

  /** Audio playing state */
  audio_on: {
    emoji: '🔊',
    src: null,
    alt: 'Playing',
  },

  /** Audio ready / not playing state */
  audio_off: {
    emoji: '🎵',
    src: null,
    alt: 'Audio',
  },

  // ── Progress / Navigation ─────────────────────────────────────────────────

  /** Zone completion — filled star */
  star_filled: {
    emoji: '⭐',
    src: null,
    alt: 'Completed',
  },

  /** Zone completion — empty star */
  star_empty: {
    emoji: '☆',
    src: null,
    alt: 'Not completed',
  },

  /** Zone locked */
  lock: {
    emoji: '🔒',
    src: null,
    alt: 'Locked',
  },

  /** Zone unlocked */
  unlock: {
    emoji: '🔓',
    src: null,
    alt: 'Unlocked',
  },

  /** Loading / progress state */
  loading: {
    emoji: '🌟',
    src: null,
    alt: 'Loading',
  },

  // ── Zone Stat Card Labels ─────────────────────────────────────────────────

  /** Stat card — Sacred Symbols */
  zone_stat_symbols: {
    emoji: '🕉️',
    src: '/images/icons/symbols-icon.png',
    alt: 'Sacred Symbols',
  },

  /** Stat card — Meanings / Stories */
  zone_stat_meanings: {
    emoji: '📜',
    src: '/images/icons/meanings-icon.png',
    alt: 'Meanings',
  },

  /** Stat card — Chants */
  zone_stat_chants: {
    emoji: '🎵',
    src: '/images/icons/chant-icon.png',
    alt: 'Chants',
  },
};

export default registry;

