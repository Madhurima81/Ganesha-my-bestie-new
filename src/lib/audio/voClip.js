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

/**
 * Play a clip URL from getVoClipUrl*. Returns { stop(fireEnd = true) }.
 * onStart fires when audio actually starts; onEnd fires exactly once (finished, errored, or stop(true)).
 * A failed load/play never throws and never stalls the caller: it ends the line like a finished one.
 */
export function playVoClip(url, { volume = 1, onStart, onEnd } = {}) {
  const audio = new Audio(url);
  audio.volume = volume;
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
    finish(true);
  });
  return {
    stop(fireEnd = true) { try { audio.pause(); } catch { /* already gone */ } finish(fireEnd); },
  };
}
