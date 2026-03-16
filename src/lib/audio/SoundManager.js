// SoundManager.js — Unified sound effects system for Ganesha My Bestie
// All sounds synthesized via Web Audio API. Calm, soft, spiritual — safe for kids.
// Drop MP3s into /public/audio/fx/ to override any sound automatically.

// ── AudioContext Singleton ──────────────────────────────────────────────────

let _ctx = null;
let _masterGain = null;
let _sfxGain = null;
let _ambientGain = null;

function getCtx() {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _masterGain = _ctx.createGain();
    _masterGain.connect(_ctx.destination);
    _sfxGain = _ctx.createGain();
    _sfxGain.connect(_masterGain);
    _ambientGain = _ctx.createGain();
    _ambientGain.connect(_masterGain);

    // Suspend/resume with page visibility so no SFX fires while tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (!_ctx) return;
      if (document.hidden) {
        _ctx.suspend();
      } else {
        _ctx.resume();
      }
    });
  }
  // Only resume on explicit user-visible call (not when page is hidden)
  if (_ctx.state === 'suspended' && !document.hidden) _ctx.resume();
  return _ctx;
}

// ── Volume Control ──────────────────────────────────────────────────────────

let _globalVolume = 1.0;

export function setGlobalVolume(v) {
  _globalVolume = Math.max(0, Math.min(1, v));
  if (_masterGain) _masterGain.gain.value = _globalVolume;
}

// ── MP3 Override System ─────────────────────────────────────────────────────

const MP3_PATHS = {
  uiTap:              '/audio/fx/fx_ui_tap.mp3',
  wrongTap:           '/audio/fx/fx_wrong_tap.mp3',
  magicSparkle:       '/audio/fx/fx_magic_sparkle.mp3',
  magicBloom:         '/audio/fx/fx_magic_bloom.mp3',
  divineGlow:         '/audio/fx/fx_divine_glow.mp3',
  celebrationTwinkle: '/audio/fx/fx_celebration_twinkle.mp3',
  cardRevealChime:    '/audio/fx/fx_card_reveal_chime.mp3',
};

const _mp3Cache = {};
const _mp3Checked = {};

async function tryLoadMp3(soundId) {
  if (_mp3Checked[soundId]) return _mp3Cache[soundId] || null;
  _mp3Checked[soundId] = true;
  try {
    const resp = await fetch(MP3_PATHS[soundId]);
    if (!resp.ok) return null;
    const buf = await resp.arrayBuffer();
    const decoded = await getCtx().decodeAudioData(buf);
    _mp3Cache[soundId] = decoded;
    return decoded;
  } catch {
    return null;
  }
}

function playMp3Buffer(buffer, volume) {
  const ctx = getCtx();
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.buffer = buffer;
  src.connect(gain);
  gain.connect(_sfxGain);
  src.start();
}

function tryPlayMp3(soundId, volume) {
  const cached = _mp3Cache[soundId];
  if (cached) { playMp3Buffer(cached, volume); return true; }
  if (!_mp3Checked[soundId]) tryLoadMp3(soundId);
  return false;
}

// ── Helper: create oscillator with envelope ─────────────────────────────────

function osc(ctx, { type = 'sine', freq, startTime, attack = 0.005, peak, decay, detune = 0 }) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, startTime);
  if (detune) o.detune.setValueAtTime(detune, startTime);
  o.connect(g);
  g.connect(_sfxGain);

  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(peak, startTime + attack);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + attack + decay);

  o.start(startTime);
  o.stop(startTime + attack + decay + 0.02);
}

// ── Sound 1: Soft UI Tap ────────────────────────────────────────────────────
// Warm, rounded click — like touching a wooden bead gently. ~80ms.

const UI_TAP_VOL = 0.32;

export function playUiTap(volumeOverride) {
  const vol = volumeOverride ?? UI_TAP_VOL;
  if (tryPlayMp3('uiTap', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  osc(ctx, { freq: 420, startTime: now, attack: 0.004, peak: vol * 0.6, decay: 0.07 });
  osc(ctx, { type: 'triangle', freq: 420, startTime: now, attack: 0.005, peak: vol * 0.3, decay: 0.07 });
  osc(ctx, { freq: 840, startTime: now, attack: 0.004, peak: vol * 0.06, decay: 0.04 });
}

// ── Sound 2: Wrong Tap ──────────────────────────────────────────────────────
// Gentle descending two-note — soft "not quite", never punishing. ~300ms.

const WRONG_TAP_VOL = 0.28;

export function playWrongTap(volumeOverride) {
  const vol = volumeOverride ?? WRONG_TAP_VOL;
  if (tryPlayMp3('wrongTap', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Two descending sine tones: E4 (330Hz) → B3 (247Hz)
  osc(ctx, { freq: 330, startTime: now,        attack: 0.005, peak: vol * 0.7, decay: 0.12 });
  osc(ctx, { type: 'triangle', freq: 330, startTime: now, attack: 0.005, peak: vol * 0.2, decay: 0.10 });
  osc(ctx, { freq: 247, startTime: now + 0.09, attack: 0.005, peak: vol * 0.6, decay: 0.14 });
  osc(ctx, { type: 'triangle', freq: 247, startTime: now + 0.09, attack: 0.005, peak: vol * 0.18, decay: 0.12 });
}

// ── Sound 3: Magical Interaction Sparkle ────────────────────────────────────
// Soft pentatonic shimmer — 4 warm bell-like tones. ~350ms.

const SPARKLE_VOL = 0.48;

export function playMagicSparkle(volumeOverride) {
  const vol = volumeOverride ?? SPARKLE_VOL;
  if (tryPlayMp3('magicSparkle', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Pentatonic: E6, G6, B6, E7 — gentle, not piercing
  const notes = [1318.5, 1568, 1975.5, 2637];
  const detunes = [2, -2, 3, -2];

  notes.forEach((freq, i) => {
    const t = now + i * 0.03;
    osc(ctx, { freq, startTime: t, attack: 0.006, peak: vol * 0.28, decay: 0.28, detune: detunes[i] });
    osc(ctx, { type: 'triangle', freq: freq * 0.998, startTime: t, attack: 0.009, peak: vol * 0.12, decay: 0.22, detune: -detunes[i] });
  });
}

// ── Sound 4: Bloom / Growth Magic ───────────────────────────────────────────
// Ascending harp-like glissando, mostly triangle (warm). ~750ms.

const BLOOM_VOL = 0.50;

export function playMagicBloom(volumeOverride) {
  const vol = volumeOverride ?? BLOOM_VOL;
  if (tryPlayMp3('magicBloom', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Ascending pentatonic: D5, E5, G5, A5, D6
  const notes = [587.33, 659.25, 783.99, 880, 1174.66];

  notes.forEach((freq, i) => {
    const t = now + i * 0.1;
    osc(ctx, { freq, startTime: t, attack: 0.01, peak: vol * 0.25, decay: 0.42 });
    // Heavier triangle ratio for warmth
    osc(ctx, { type: 'triangle', freq, startTime: t, attack: 0.012, peak: vol * 0.18, decay: 0.38 });
  });

  // Very subtle shimmer — barely audible, just air
  osc(ctx, { type: 'triangle', freq: 2200, startTime: now + 0.2, attack: 0.2, peak: vol * 0.02, decay: 0.4 });
}

// ── Sound 5: Divine Glow / Completion ───────────────────────────────────────
// Warm airy chord swell — pure sines, slow and spacious. ~1500ms.

const GLOW_VOL = 0.52;

export function playDivineGlow(volumeOverride) {
  const vol = volumeOverride ?? GLOW_VOL;
  if (tryPlayMp3('divineGlow', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Warm chord: C4, G4, C5
  const chord = [261.63, 392, 523.25];

  chord.forEach((freq) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, now);
    o.connect(g);
    g.connect(_sfxGain);

    // Slow 400ms swell, sustain, gentle fade
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol * 0.28, now + 0.4);
    g.gain.setValueAtTime(vol * 0.28, now + 0.8);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    o.start(now);
    o.stop(now + 1.55);
  });
}

// ── Sound 6: Celebration Twinkle ────────────────────────────────────────────
// Cascading soft bells, gentler FM. ~800ms.

const TWINKLE_VOL = 0.55;

export function playCelebrationTwinkle(volumeOverride) {
  const vol = volumeOverride ?? TWINKLE_VOL;
  if (tryPlayMp3('celebrationTwinkle', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Bell pattern: E6 → D6 → B5 → A5 → B5 → D6 → E6 → G6
  const pattern = [1318.5, 1174.66, 987.77, 880, 987.77, 1174.66, 1318.5, 1568];

  pattern.forEach((carrierFreq, i) => {
    const t = now + i * 0.075;

    // FM with reduced mod index (0.28) for less metallic, warmer tone
    const modFreq = carrierFreq * 2.2;
    const modIndex = 0.28;

    const mod = ctx.createOscillator();
    const modGain = ctx.createGain();
    mod.frequency.setValueAtTime(modFreq, t);
    modGain.gain.setValueAtTime(carrierFreq * modIndex, t);
    modGain.gain.exponentialRampToValueAtTime(1, t + 0.3);

    const carrier = ctx.createOscillator();
    const carrierGain = ctx.createGain();
    carrier.frequency.setValueAtTime(carrierFreq, t);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(carrierGain);
    carrierGain.connect(_sfxGain);

    carrierGain.gain.setValueAtTime(0, t);
    carrierGain.gain.linearRampToValueAtTime(vol * 0.22, t + 0.004);
    carrierGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    mod.start(t);
    carrier.start(t);
    mod.stop(t + 0.33);
    carrier.stop(t + 0.33);
  });
}

// ── Sound 7: Card Reveal Chime ──────────────────────────────────────────────
// Single warm bell — soft 2nd harmonic only. ~500ms.

const CHIME_VOL = 0.44;

export function playCardRevealChime(volumeOverride) {
  const vol = volumeOverride ?? CHIME_VOL;
  if (tryPlayMp3('cardRevealChime', vol)) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Fundamental + gentle 2nd harmonic (3rd removed for warmth)
  osc(ctx, { freq: 780,  startTime: now, attack: 0.01, peak: vol * 0.55, decay: 0.48 });
  osc(ctx, { freq: 1560, startTime: now, attack: 0.012, peak: vol * 0.1, decay: 0.38 });
}

// ── Ambient Loop System ─────────────────────────────────────────────────────

let _ambientSource = null;
let _ambientVolume = 0.25;
let _isDucked = false;

export async function playAmbient(loopId) {
  const ctx = getCtx();
  stopAmbient();

  try {
    const resp = await fetch(`/audio/ambient/${loopId}.mp3`);
    if (!resp.ok) return;
    const buf = await resp.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buf);

    _ambientSource = ctx.createBufferSource();
    _ambientSource.buffer = decoded;
    _ambientSource.loop = true;
    _ambientSource.connect(_ambientGain);
    _ambientGain.gain.value = _isDucked ? _ambientVolume * 0.25 : _ambientVolume;
    _ambientSource.start();
  } catch {
    // Ambient is optional — fail silently
  }
}

export function stopAmbient() {
  if (_ambientSource) {
    try { _ambientSource.stop(); } catch { /* already stopped */ }
    _ambientSource.disconnect();
    _ambientSource = null;
  }
}

export function setAmbientVolume(v) {
  _ambientVolume = Math.max(0, Math.min(1, v));
  if (_ambientGain) {
    _ambientGain.gain.value = _isDucked ? _ambientVolume * 0.25 : _ambientVolume;
  }
}

export function duckAmbient() {
  _isDucked = true;
  if (_ambientGain) {
    const ctx = getCtx();
    _ambientGain.gain.linearRampToValueAtTime(_ambientVolume * 0.25, ctx.currentTime + 0.3);
  }
}

export function unduckAmbient() {
  _isDucked = false;
  if (_ambientGain) {
    const ctx = getCtx();
    _ambientGain.gain.linearRampToValueAtTime(_ambientVolume, ctx.currentTime + 0.5);
  }
}

// ── Convenience Export ──────────────────────────────────────────────────────

export const GameSounds = {
  uiTap:              playUiTap,
  wrongTap:           playWrongTap,
  magicSparkle:       playMagicSparkle,
  magicBloom:         playMagicBloom,
  divineGlow:         playDivineGlow,
  celebrationTwinkle: playCelebrationTwinkle,
  cardRevealChime:    playCardRevealChime,
};
