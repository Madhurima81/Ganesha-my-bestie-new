// Single source of truth for the VOICE mute (DECISIONS: Home mute, voice only).
// One flag: localStorage 'ganesha_audio_enabled' ('false' = muted). Home and the
// Parent Dashboard (Settings > Voice) write it; scenes only read it.
// SFX and ambient are NOT affected.

export const VOICE_PREF_KEY = 'ganesha_audio_enabled';
export const VOICE_MUTE_EVENT = 'ganesha:voice-mute-change';

// Legacy Settings key (1/0). Settings > Voice used to write this and nothing read it.
const LEGACY_PARENT_VOICE_KEY = 'gmb_parent_sound_voice';

export const isVoiceMuted = () => {
  try {
    return localStorage.getItem(VOICE_PREF_KEY) === 'false';
  } catch {
    return false;
  }
};

export const setVoiceMuted = (muted) => {
  try {
    localStorage.setItem(VOICE_PREF_KEY, muted ? 'false' : 'true');
  } catch {
    // ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VOICE_MUTE_EVENT, { detail: { muted } }));
  }
};

// Run once: a parent who switched Voice OFF in Settings before they were linked
// keeps that choice. Only an explicit 0 counts as off; the new flag wins if already set.
export const migrateLegacyVoicePref = () => {
  try {
    if (localStorage.getItem(VOICE_PREF_KEY) !== null) return;
    const legacy = localStorage.getItem(LEGACY_PARENT_VOICE_KEY);
    if (legacy !== null && Number(legacy) === 0) {
      localStorage.setItem(VOICE_PREF_KEY, 'false');
    }
  } catch {
    // ignore storage errors
  }
};

// Subscribe to mute changes from this tab (custom event) or another (storage event).
export const subscribeVoiceMute = (onChange) => {
  if (typeof window === 'undefined') return () => {};
  const onCustom = () => onChange(isVoiceMuted());
  const onStorage = (e) => { if (e.key === VOICE_PREF_KEY) onChange(isVoiceMuted()); };
  window.addEventListener(VOICE_MUTE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(VOICE_MUTE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
};
