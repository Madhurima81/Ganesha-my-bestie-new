// ambience.js — the ONE shared ambience/background-music player.
//
//   import { ambience } from '../audio/ambience';
//   useEffect(() => ambience.play('map'), []);   // play() returns release(); effect cleanup calls it
//
// Why one element: welcome, home, map and scenes each used to own an <audio> plus a copy of the
// same fade / visibility / autoplay code, at different volumes. Now a single element means beds can
// never stack, a screen change cross-fades (or just re-levels when the file is the same), and the
// rules below live in one place:
//   1. Parent Settings > Ambience (isAmbientOn) is honoured live, no scene threads it in.
//   2. Ducks while a voice-over speaks (setVoiceActive) so the teacher is always clearest.
//   3. Pauses when the tab is hidden, resumes when visible.
//   4. If the browser blocks autoplay, the first tap starts it.
//   5. release() only stops the bed if the caller still owns it, so a map unmounting AFTER a scene
//      has started its music can't kill the scene's sound (and React StrictMode double-mounts are safe).

import { isAmbientOn, subscribeSoundPrefs } from '../utils/soundPrefs';

const MAP_SRC = '/audio/ambient/map%20ambient%20sound.mp3';
const CALM_SRC = '/audio/music/bg-ambient.mp3';

// Levels carried over from the old per-screen copies so nothing jumps in loudness on day one.
export const BEDS = {
  welcome: { src: CALM_SRC, vol: 0.22 },
  home:    { src: MAP_SRC,  vol: 0.16 },
  map:     { src: MAP_SRC,  vol: 0.06 },
  scene:   { src: CALM_SRC, vol: 0.10 },   // scenes pass their own musicVolume (0.06-0.10)
};

const VO_DUCK_FACTOR = 0.5;       // half level while a voice-over speaks
const FADE_IN_MS = 1800;
const FADE_OUT_MS = 500;
const FADE_STEP_MS = 50;
// iOS Safari ignores audio.volume, so fades are impossible there: play/pause at full bed level.
const CAN_FADE = typeof navigator === 'undefined' || !/iPhone|iPad|iPod/i.test(navigator.userAgent || '');

let _el = null;
let _wanted = null;               // { src, vol } the current owner asked for
let _owner = 0;                   // token of the current owner
let _seq = 0;
let _voiceActive = false;
let _hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
let _fadeTimer = null;
let _wired = false;
let _unlockWired = false;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const target = () => (_wanted ? clamp01(_wanted.vol * (_voiceActive ? VO_DUCK_FACTOR : 1)) : 0);

function element() {
  if (!_el) {
    _el = new Audio();
    _el.loop = true;
    _el.preload = 'auto';
    _el.volume = 0;
  }
  return _el;
}

function fadeTo(level, ms, onDone) {
  const el = element();
  clearInterval(_fadeTimer);
  _fadeTimer = null;
  if (!CAN_FADE || ms <= 0) {
    el.volume = CAN_FADE ? clamp01(level) : 1;
    onDone?.();
    return;
  }
  const steps = Math.max(1, Math.round(ms / FADE_STEP_MS));
  const delta = (level - el.volume) / steps;
  let n = 0;
  _fadeTimer = setInterval(() => {
    n += 1;
    el.volume = clamp01(n >= steps ? level : el.volume + delta);
    if (n >= steps) {
      clearInterval(_fadeTimer);
      _fadeTimer = null;
      onDone?.();
    }
  }, FADE_STEP_MS);
}

function startPlayback(fadeMs) {
  const el = element();
  const p = el.play();
  if (p && p.catch) p.catch(() => armUnlock());   // autoplay blocked -> retry on first tap
  fadeTo(target(), fadeMs);
}

function armUnlock() {
  if (_unlockWired || typeof document === 'undefined') return;
  _unlockWired = true;
  const retry = () => {
    _unlockWired = false;
    document.removeEventListener('pointerdown', retry);
    apply();
  };
  document.addEventListener('pointerdown', retry);
}

// Reconcile the element with the desired state. Safe to call any time.
function apply() {
  const el = element();
  const shouldPlay = !!_wanted && isAmbientOn() && !_hidden;

  if (!shouldPlay) {
    if (!el.paused) fadeTo(0, FADE_OUT_MS, () => { if (!(_wanted && isAmbientOn() && !_hidden)) el.pause(); });
    return;
  }

  const sameFile = el.dataset.bed === _wanted.src;
  if (sameFile && !el.paused) {
    fadeTo(target(), FADE_OUT_MS);                 // same file: just glide to the new level
    return;
  }
  if (sameFile) {                                  // paused (tab returned / setting turned on)
    startPlayback(FADE_IN_MS);
    return;
  }
  const swap = () => {                             // different file: out, swap, in
    if (!_wanted) return;
    el.dataset.bed = _wanted.src;
    el.src = _wanted.src;
    el.currentTime = 0;
    startPlayback(FADE_IN_MS);
  };
  if (el.paused) swap();
  else fadeTo(0, FADE_OUT_MS, swap);
}

function wireOnce() {
  if (_wired || typeof document === 'undefined') return;
  _wired = true;
  subscribeSoundPrefs((kind) => { if (kind === 'ambience') apply(); });
  document.addEventListener('visibilitychange', () => {
    _hidden = document.visibilityState === 'hidden';
    if (_hidden) {                                 // hard stop: nothing should fade while hidden
      clearInterval(_fadeTimer);
      element().pause();
    } else {
      apply();
    }
  });
}

// bed: key of BEDS. opts.volume overrides the bed level; opts.src overrides the file.
// Returns release(): stops the bed only if this caller still owns it.
function play(bed = 'scene', opts = {}) {
  wireOnce();
  const def = BEDS[bed] || BEDS.scene;
  _wanted = { src: opts.src || def.src, vol: opts.volume ?? def.vol };
  const token = ++_seq;
  _owner = token;
  apply();
  return () => stop(token);
}

function stop(token) {
  if (token !== undefined && token !== _owner) return;   // someone else owns the bed now
  _wanted = null;
  apply();
}

function setVolume(v) {
  if (!_wanted) return;
  _wanted = { ..._wanted, vol: v };
  apply();
}

function setVoiceActive(on) {
  const next = !!on;
  if (next === _voiceActive) return;
  _voiceActive = next;
  if (_wanted && _el && !_el.paused) fadeTo(target(), next ? 250 : 600);
}

// Dev inspection (Sound Lab): what is actually playing right now.
function debug() {
  return {
    src: _el?.dataset.bed || null,
    paused: _el ? _el.paused : true,
    volume: _el ? Number(_el.volume.toFixed(3)) : 0,
    wantedVol: _wanted ? _wanted.vol : null,
    voiceActive: _voiceActive,
    hidden: _hidden,
    owner: _owner,
  };
}

export const ambience = { play, stop, setVolume, setVoiceActive, debug };
export default ambience;
