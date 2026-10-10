// sfxNames.js — pure name tables for the SFX engine. NO imports on purpose: the browser engine
// (sfx.js), the Sound Lab page and scripts/sound-usage.mjs (plain Node) all share this one file.

// Every role the engine knows. Must match Object.keys(ROLES) in sfx.js (Sound Lab warns if not).
export const ROLE_IDS = [
  'tap', 'select', 'place', 'softWrong', 'idleHint', 'transition',
  'correct', 'discovery', 'bloom', 'powerUnlock', 'emotionalGlow',
  'celebration', 'zoneComplete', 'frogHop', 'frogReunion',
];

// Old key names -> role. Lets every existing scene keep working untouched.
export const ALIASES = {
  // useGameSounds / AudioService names
  uiTap: 'tap', wrongTap: 'softWrong', magicSparkle: 'discovery', magicBloom: 'bloom',
  divineGlow: 'powerUnlock', celebrationTwinkle: 'celebration', cardRevealChime: 'correct',
  // useVoiceGuidance legacy keys
  success: 'correct', error: 'softWrong', chime: 'correct', pop: 'discovery', whoosh: 'transition',
  revealBloom: 'bloom',
};

// Function names a scene can call -> the role they play.
export const CALL_NAMES = {
  playUiTap: 'tap', playTap: 'tap',
  playWrongTap: 'softWrong', playWrong: 'softWrong',
  playSparkle: 'discovery', playMagicSparkle: 'discovery',
  playBloom: 'bloom', playMagicBloom: 'bloom',
  playGlow: 'powerUnlock', playDivineGlow: 'powerUnlock', playPowerUnlock: 'powerUnlock',
  playTwinkle: 'celebration', playCelebrationTwinkle: 'celebration', playCelebration: 'celebration',
  playChime: 'correct', playCardRevealChime: 'correct', playCorrect: 'correct',
  playPlace: 'place', playIdleHint: 'idleHint',
};
