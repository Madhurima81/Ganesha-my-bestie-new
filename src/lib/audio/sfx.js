// sfx.js — the ONE shared SFX engine. Scenes ask for a ROLE, never a file.
//
//   import { sfx } from '../audio/sfx';   sfx.play('correct');
//
// Rules enforced here (so no scene has to):
//   1. Parent Settings > Sound effects (isSfxOn) is always honoured.
//   2. SFX duck ~30% while a voice-over is speaking (setVoiceActive).
//   3. One reward sound at a time: inside REWARD_WINDOW_MS a lower-or-equal priority reward is
//      dropped; a higher one fades the earlier one out and takes over.
//   4. If an MP3 is missing/slow, the synthesized fallback plays so a tap is never silent.
// Legacy names (playChime, playGlow, 'success', 'error' ...) resolve through ALIASES.

import { Howl } from 'howler';
import { isSfxOn } from '../utils/soundPrefs';
import {
  playUiTap as synthTap,
  playWrongTap as synthWrong,
  playMagicSparkle as synthSparkle,
  playMagicBloom as synthBloom,
  playDivineGlow as synthGlow,
  playCelebrationTwinkle as synthTwinkle,
  playCardRevealChime as synthChime,
} from './SoundManager';

const SFX_DIR = '/audio/sfx/';
const ROLE2_DIR = '/audio/sfx-role-mapping-2/';

// priority: 0 = interaction (never gated), 1+ = reward ladder. vol = base level 0-1.
export const ROLES = {
  tap:         { src: `${SFX_DIR}sfx-tap.mp3`,            vol: 0.32, priority: 0, fallback: synthTap },
  select:      { src: `${SFX_DIR}sfx-tap.mp3`,            vol: 0.34, priority: 0, fallback: synthTap },      // TODO own sound
  place:       { src: `${SFX_DIR}sfx-place.wav`,          vol: 0.33, priority: 0, fallback: synthTap },
  softWrong:   { src: `${SFX_DIR}sfx-soft-wrong.wav`,     vol: 0.28, priority: 0, fallback: synthWrong },    // TODO: file is a copy of emotional-glow
  idleHint:    { src: `${SFX_DIR}sfx-idle-hint.wav`,      vol: 0.22, priority: 0, fallback: synthChime },
  transition:  { src: `${SFX_DIR}sfx-transition.wav`,     vol: 0.29, priority: 0, fallback: synthBloom },
  correct:     { src: `${SFX_DIR}sfx-chime.mp3`,          vol: 0.42, priority: 1, fallback: synthChime },
  discovery:   { src: `${SFX_DIR}sfx-discovery.wav`,      vol: 0.37, priority: 2, fallback: synthSparkle },
  bloom:       { src: `${SFX_DIR}sfx-reveal-bloom.wav`,   vol: 0.41, priority: 2, fallback: synthBloom },
  powerUnlock: { src: `${SFX_DIR}sfx-power-unlock.mp3`,   vol: 0.47, priority: 3, fallback: synthGlow },
  emotionalGlow:{ src: `${SFX_DIR}sfx-emotional-glow.wav`, vol: 0.47, priority: 3, fallback: synthGlow },
  celebration: { src: `${SFX_DIR}sfx-celebration.wav`,    vol: 0.43, priority: 4, fallback: synthTwinkle },
  zoneComplete:{ src: `${SFX_DIR}sfx-celebration.wav`,    vol: 0.48, priority: 5, fallback: synthTwinkle },   // TODO own sound
  frogHop:     { src: `${ROLE2_DIR}sfx-frog-hop.mp3`,     vol: 0.35, priority: 0, fallback: synthTap },
  frogReunion: { src: `${ROLE2_DIR}sfx-frog-reunion.mp3`, vol: 0.40, priority: 1, fallback: synthChime },
};

// Old names -> role. Lets every existing scene keep working untouched.
export const ALIASES = {
  // useGameSounds / AudioService names
  uiTap: 'tap', wrongTap: 'softWrong', magicSparkle: 'discovery', magicBloom: 'bloom',
  divineGlow: 'powerUnlock', celebrationTwinkle: 'celebration', cardRevealChime: 'correct',
  // useVoiceGuidance legacy keys
  success: 'correct', error: 'softWrong', chime: 'correct', pop: 'discovery', whoosh: 'transition',
  revealBloom: 'bloom',
};

const REWARD_WINDOW_MS = 400;
const TAP_THROTTLE_MS = 60;
const VO_DUCK_FACTOR = 0.7;

const _howls = {};
const _ready = {};            // true = MP3 loaded, false = failed -> synth
let _voiceActive = false;
let _masterScale = 0.85;      // overall SFX trim: midway between the two old engines (A louder, B quieter)
let _last = { priority: -1, at: 0, howl: null, id: null };
let _lastTapAt = 0;

const resolve = (name) => (ROLES[name] ? name : ALIASES[name] || null);

function getHowl(role) {
  if (_howls[role]) return _howls[role];
  const def = ROLES[role];
  _howls[role] = new Howl({
    src: [def.src],
    volume: def.vol,
    preload: true,
    onload: () => { _ready[role] = true; },
    onloaderror: () => { _ready[role] = false; },
  });
  return _howls[role];
}

const level = (def, base) => Math.min(1, Math.max(0, (base ?? def.vol) * _masterScale * (_voiceActive ? VO_DUCK_FACTOR : 1)));

// volumeOverride (optional): replaces the role's base level, e.g. the quiet 0.22 taps on the welcome screen.
function play(name, volumeOverride) {
  if (!isSfxOn()) return;
  const role = resolve(name);
  if (!role) {
    if (import.meta.env?.DEV) console.warn(`[sfx] unknown role "${name}"`);
    return;
  }
  const def = ROLES[role];
  const now = Date.now();

  if (def.priority === 0) {
    if (role === 'tap' && now - _lastTapAt < TAP_THROTTLE_MS) return; // double-fire guard
    if (role === 'tap') _lastTapAt = now;
  } else if (now - _last.at < REWARD_WINDOW_MS && _last.priority >= 0) {
    if (def.priority <= _last.priority) return;                         // weaker reward: drop
    try { _last.howl?.fade(_last.howl.volume(), 0, 80, _last.id); } catch { /* already done */ }
  }

  const vol = level(def, volumeOverride);
  const howl = getHowl(role);
  let id = null;
  if (_ready[role] === true) {
    howl.volume(vol);
    id = howl.play();
  } else {
    def.fallback(vol);   // still loading or missing -> synthesized stand-in
  }
  if (def.priority > 0) _last = { priority: def.priority, at: now, howl: id !== null ? howl : null, id };
}

export const sfx = {
  play,
  preload: (roles = Object.keys(ROLES)) => roles.forEach((r) => { const k = resolve(r); if (k) getHowl(k); }),
  setVoiceActive: (on) => { _voiceActive = !!on; },
  setVolumeScale: (v) => { _masterScale = Math.min(1, Math.max(0, v)); },
  roles: () => Object.keys(ROLES),
};

export default sfx;
