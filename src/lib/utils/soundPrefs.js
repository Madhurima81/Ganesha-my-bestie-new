// Parent Settings > Sound effects / Ambience (Voice lives in voiceMute.js).
// Keys keep the existing gmb_parent_sound_* names; value is '1' (on) / '0' (off), default ON.
// Any value > 0 counts as on (old slider values), only an explicit 0 is off.

export const SOUND_PREF_KEYS = {
  sfx: 'gmb_parent_sound_sfx',
  ambience: 'gmb_parent_sound_ambience',
};
export const SOUND_PREF_EVENT = 'ganesha:sound-pref-change';

const isOn = (kind) => {
  try {
    const raw = localStorage.getItem(SOUND_PREF_KEYS[kind]);
    if (raw == null) return true;
    const n = Number(raw);
    return Number.isNaN(n) ? true : n > 0;
  } catch {
    return true;
  }
};

export const isSfxOn = () => isOn('sfx');
export const isAmbientOn = () => isOn('ambience');

export const setSoundPref = (kind, on) => {
  try {
    localStorage.setItem(SOUND_PREF_KEYS[kind], on ? '1' : '0');
  } catch {
    // ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SOUND_PREF_EVENT, { detail: { kind, on } }));
  }
};

// onChange(kind, on) for 'sfx' | 'ambience'; covers this tab and other tabs.
export const subscribeSoundPrefs = (onChange) => {
  if (typeof window === 'undefined') return () => {};
  const onCustom = (e) => onChange(e.detail.kind, e.detail.on);
  const onStorage = (e) => {
    const kind = Object.keys(SOUND_PREF_KEYS).find((k) => SOUND_PREF_KEYS[k] === e.key);
    if (kind) onChange(kind, isOn(kind));
  };
  window.addEventListener(SOUND_PREF_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SOUND_PREF_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
};
