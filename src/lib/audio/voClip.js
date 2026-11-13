// voClip.js — optional pre-recorded voiceover clips.
//
// A scene line plays /audio/<file_name>.mp3 ONLY if that recording exists. If it doesn't, the
// helpers return null and the caller carries on exactly as before (on-screen text + SFX).
// This file never synthesises speech: no TTS, no placeholder voice.
//
// Which clips exist is read ONCE from /audio/vo-manifest.json (written by voiceover/build-manifest.mjs).
// We use a manifest instead of probing each mp3 because Netlify's SPA fallback answers a missing
// file with index.html and HTTP 200, so "does the URL load?" is not a reliable existence check.
//
// Line -> file name comes from the generated map built from voiceover/script.csv.
import { VO_CLIP_BY_TEXT } from '../config/content/voClipMap.generated';

const MANIFEST_URL = '/audio/vo-manifest.json';
const available = new Set();
let primePromise = null;

export const normalizeVoText = (text) =>
  String(text || '').replace(/\s+/g, ' ').replace(/’/g, "'").trim().toLowerCase();

/** Load the list of recorded clips once. Safe to call many times; never throws; missing manifest = no clips. */
export function primeVoClips() {
  if (primePromise) return primePromise;
  primePromise = fetch(MANIFEST_URL, { cache: 'no-cache' })
    .then((res) => (res.ok && /json/i.test(res.headers.get('content-type') || '') ? res.json() : null))
    .then((manifest) => { (manifest?.files || []).forEach((name) => available.add(name)); })
    .catch(() => {});
  return primePromise;
}

/** Sync: URL of the recording for a clip name ("hut-food-01"), or null if it hasn't been recorded. */
export const getVoClipUrlByName = (name) => (name && available.has(name) ? `/audio/${name}.mp3` : null);

/** Sync: URL of the recording for an exact spoken line, or null (no recording / unknown line). */
export const getVoClipUrl = (text) => getVoClipUrlByName(VO_CLIP_BY_TEXT[normalizeVoText(text)]);

// ── Shared, pre-unlocked audio players ───────────────────────────────────────
// iOS/iPadOS WebKit (Safari AND iPad Chrome) only lets an <audio> element start when it begins inside a tap, and
// every brand-new `new Audio()` needs its own tap. Our lines start on timers (idle hints, the next line of a chain),
// so fresh elements were refused: the line that follows the tap played, later ones and idle hints stayed silent.
// Fix: keep a few reusable elements, "unlock" each one inside the first tap, then play every recording by swapping
// the src of a free one. An unlocked element may start later without a tap. Desktop browsers behave as before.
const POOL_SIZE = 4;
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
const pool = [];
let unlockInstalled = false;

const vlog = (msg, extra) => {
  try {
    const log = (window.__voClipLog = window.__voClipLog || []);
    log.push({ t: Math.round(performance.now()), msg, ...extra });
    if (log.length > 60) log.shift();
  } catch { /* no window */ }
  console.warn(`[voClip] ${msg}`, extra || '');
};

function makePoolEntry() {
  const audio = new Audio();
  audio.preload = 'auto';
  const rec = { audio, busy: false, unlocked: false, lastUsed: 0 };
  const free = () => { rec.busy = false; };
  audio.addEventListener?.('ended', free);
  audio.addEventListener?.('error', free);
  return rec;
}

function ensurePool() {
  if (typeof Audio === 'undefined') return;
  while (pool.length < POOL_SIZE) pool.push(makePoolEntry());
}

/** Call once at startup. Unlocks the shared players inside the first tap/click/key press, then stops listening. */
export function installAudioUnlock() {
  if (unlockInstalled || typeof document === 'undefined') return;
  unlockInstalled = true;
  const events = ['touchend', 'pointerup', 'click', 'keydown'];
  const unlock = () => {
    ensurePool();
    pool.forEach((rec) => {
      if (rec.unlocked || rec.busy) return;
      const a = rec.audio;
      try {
        a.src = SILENT_WAV;
        const p = a.play();
        const ok = () => { rec.unlocked = true; try { a.pause(); } catch { /* ignore */ } };
        if (p && typeof p.then === 'function') p.then(ok, () => {}); else ok();
      } catch { /* try again on the next tap */ }
    });
    if (pool.length && pool.every((r) => r.unlocked || r.busy)) {
      events.forEach((ev) => document.removeEventListener(ev, unlock, true));
    }
  };
  events.forEach((ev) => document.addEventListener(ev, unlock, true));
}

/**
 * A reusable audio element ready to play `url` (volume applied). Prefers a free, unlocked one; falls back to a
 * plain `new Audio` (fine on desktop). Handlers left by the previous line are cleared. Use it like a normal Audio:
 * play(), pause(), onended... It is free again once it ends, errors, or is paused for good.
 */
export function acquireVoiceAudio(url, volume = 1) {
  ensurePool();
  const isFree = (r) => !r.busy || r.audio.paused || r.audio.ended;
  const byAge = (a, b) => a.lastUsed - b.lastUsed;
  let rec = pool.filter((r) => isFree(r) && r.unlocked).sort(byAge)[0] || pool.filter(isFree).sort(byAge)[0];
  if (!rec) {
    if (typeof Audio === 'undefined') return null;
    rec = { audio: new Audio(), busy: false, unlocked: false, lastUsed: 0 };
    vlog('pool exhausted, using a one-off player');
  }
  const a = rec.audio;
  a.onended = null; a.onerror = null; a.onplaying = null;
  rec.busy = true;
  rec.lastUsed = Date.now();
  a.src = url;
  a.volume = volume;
  return a;
}

/**
 * Play a clip URL from getVoClipUrl*. Returns { stop(fireEnd = true) }.
 * onStart fires when audio actually starts; onEnd fires exactly once (finished, errored, or stop(true)).
 * A failed load/play never throws and never stalls the caller: it ends the line like a finished one.
 */
export function playVoClip(url, { volume = 1, onStart, onEnd } = {}) {
  const audio = acquireVoiceAudio(url, volume) || new Audio(url);
  let done = false;
  const finish = (fire) => {
    if (done) return;
    done = true;
    audio.onended = null; audio.onerror = null; audio.onplaying = null;
    if (fire) onEnd?.();
  };
  audio.onplaying = () => { if (!done) onStart?.(); audio.onplaying = null; };
  audio.onended = () => finish(true);
  audio.onerror = () => finish(true);
  audio.play().catch((err) => {
    if (err?.name === 'AbortError') return; // interrupted by stop(); the caller already decided
    vlog('clip blocked or failed', { url, reason: err?.name || String(err) }); // iPad: NotAllowedError = not unlocked
    finish(true);
  });
  return {
    stop(fireEnd = true) { try { audio.pause(); } catch { /* already gone */ } finish(fireEnd); },
  };
}

// ── Web Speech policy ────────────────────────────────────────────────────────
// Web Speech mispronounces Sanskrit, so a line containing a shloka/Sanskrit word is NEVER read by TTS:
// with no recording it runs silently (on-screen text + SFX, callback on schedule - same as muted).
// Plain English lines keep TTS until their zone's clips have landed; then add the zone prefix here
// ('hut' | 'mountain' | 'river') and every line of that zone without a clip goes silent too.
export const VO_TTS_DISABLED_ZONES = [];

const SANSKRIT_LINE = /\b(vakra\s*tunda|maha\s*kaa?y\w*|surya\s*koti|sama\s*prabha|nir\s*vighnam|kuru\s*me\s*deva|sarva\s*-?\s*kaa?ryeshu|sarvada)\b/i;

/** True when TTS must not read this line (call only AFTER checking getVoClipUrl). */
export function shouldSilenceTts(text) {
  if (!text) return false;
  if (SANSKRIT_LINE.test(text)) return true;
  const zone = (VO_CLIP_BY_TEXT[normalizeVoText(text)] || '').split('-')[0];
  return Boolean(zone) && VO_TTS_DISABLED_ZONES.includes(zone);
}
