/**
 * speechCue — fire a callback at the moment a specific WORD of a spoken line begins.
 *
 * Used to sync a gesture demo (the teaching hand) to the action word of an instruction
 * ("Rub the glow…" → hand appears as "Rub" is spoken) instead of guessing a fixed delay.
 *
 * cue = { word: 'Rub', onCue: () => …, cueMs?: number }
 *
 * - Web Speech (TTS): uses the utterance's `boundary` events, so it fires exactly when the
 *   word starts. Where a browser/voice doesn't emit word boundaries, a per-character
 *   estimate (≈80ms/char before the word, from when speech starts) fires it instead.
 * - Recorded MP3: pass `cueMs` (the word's start time, measured from the recording) — see
 *   `startCueTimer` — the same estimate is used when it isn't known yet.
 * - Muted / no speech: `startCueTimer` fires it on the same estimate so the hand still shows.
 *
 * The cue fires at most once per call.
 */

const MS_PER_CHAR = 80;

export const cueCharIndex = (text, word) => {
  if (!text || !word) return -1;
  return text.toLowerCase().indexOf(String(word).toLowerCase());
};

export const estimateCueMs = (text, cue) => {
  const idx = cueCharIndex(text, cue?.word);
  if (typeof cue?.cueMs === 'number') return cue.cueMs;
  return idx < 0 ? 0 : idx * MS_PER_CHAR;
};

// Fires the cue after an estimated delay (muted lines, MP3s, or as the fallback below).
// Returns a cancel function.
export const startCueTimer = (text, cue) => {
  if (!cue?.onCue) return () => {};
  const id = window.setTimeout(() => cue.onCue(), estimateCueMs(text, cue));
  return () => window.clearTimeout(id);
};

// Wires a cue onto a SpeechSynthesisUtterance. Returns a cancel function.
export const attachSpeechCue = (utterance, text, cue) => {
  if (!utterance || !cue?.onCue) return () => {};
  const idx = cueCharIndex(text, cue.word);
  let fired = false;
  let fallbackId = null;
  const fire = () => {
    if (fired) return;
    fired = true;
    window.clearTimeout(fallbackId);
    cue.onCue();
  };
  const previousStart = utterance.onstart;
  utterance.onstart = (...args) => {
    previousStart?.(...args);
    // Fallback only: give real boundary events a head start over the estimate.
    fallbackId = window.setTimeout(fire, (typeof cue.cueMs === 'number' ? cue.cueMs : estimateCueMs(text, cue)) + 350);
  };
  utterance.onboundary = (event) => {
    if (idx >= 0 && event.name === 'word' && event.charIndex >= idx) fire();
  };
  return () => { fired = true; window.clearTimeout(fallbackId); };
};

// ── Dev helper: measure a recorded line's cueMs ─────────────────────────────────────────────
// In the console (dev only):  markCue('/audio/voiceover/INSTRUCTIONS/your-line.mp3')
// Press Space the instant the action word starts; it logs the cueMs to paste into
// lib/config/content/voiceCues.js. Press Escape to stop.
export const markCue = (src) => {
  const audio = new Audio(src);
  const onKey = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      // eslint-disable-next-line no-console
      console.log(`cueMs: ${Math.round(audio.currentTime * 1000)}   (${src})`);
    } else if (e.code === 'Escape') {
      audio.pause();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);
  audio.addEventListener('ended', () => window.removeEventListener('keydown', onKey));
  audio.play();
  // eslint-disable-next-line no-console
  console.log('Playing — press Space at the action word, Escape to stop.');
};
if (typeof window !== 'undefined' && import.meta.env?.DEV) window.markCue = markCue;
