/**
 * Standalone game test harness — mounted at /dev/game-test by App.jsx.
 *
 * Mounts a single Shloka River game WITHOUT the welcome → home → zone → scene
 * navigation chain. Game is chosen via `?game=` query param or the toolbar.
 *
 *   /dev/game-test?game=vakratunda
 *
 * Annotation mode: toggle "✎ annotate", then drop pins / draw circles / arrows
 * directly on the running game and type comments. "💾 save" POSTs everything to
 * the dev server (viteAnnotationsPlugin) which writes:
 *   src/dev/annotations/<game>-<timestamp>.json  +  src/dev/annotations/latest.json
 * Claude Code then reads that file instead of a screenshot.
 */

import React, { Suspense, lazy, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { makeMockVoiceGuidance, makeMockCallbacks } from './mockVoiceGuidance';
import useVoiceGuidance from '../lib/hooks/useVoiceGuidance';
import { makeTtsVoiceGuidance } from './webSpeechScripts';
import SparkleAnimation from '../lib/components/animation/SparkleAnimation';

// Real-audio mode: which scene id + Sanskrit word each game maps to, so the
// real useVoiceGuidance hook resolves the right MP3s (/audio/syllables/*,
// /audio/words/*, and registered scene VO lines).
const REAL_SCENE_ID = {
  vakratunda: 'vakratunda-grove', mahakaya: 'vakratunda-grove',
  suryakoti: 'suryakoti-bank', samaprabha: 'suryakoti-bank',
  nirvighnam: 'nirvighnam-chant', kurumedeva: 'nirvighnam-chant',
  sarvakaryeshu: 'sarvakaryeshu-chant', sarvada: 'sarvakaryeshu-chant',
};
const REAL_WORD = {
  vakratunda: 'vakratunda', mahakaya: 'mahakaya',
  suryakoti: 'suryakoti', samaprabha: 'samaprabha',
  nirvighnam: 'nirvighnam', kurumedeva: 'kurumedeva',
  sarvakaryeshu: 'sarvakaryeshu', sarvada: 'sarvada',
};
// Intro guidance line the parent scene normally speaks on entry — several game
// components don't trigger their own, so real-audio mode plays it on mount.
const INTRO_VO = {
  vakratunda: 'scene10_vak_intro', mahakaya: 'scene10_maha_intro',
  suryakoti: 'scene11_surya_intro', samaprabha: 'scene11_sama_intro',
  nirvighnam: 'scene12_nir_intro', kurumedeva: 'scene12_kuru_intro',
  sarvakaryeshu: 'welcome', sarvada: 'scene14_intro',
};

// Scene backgrounds — normally rendered by the parent scene wrapper, not the
// game component. Vakratunda/Mahakaya draw nothing of their own, so without
// this the stage is blank; the others paint their own bg on top anyway.
import riverBg from '../zones/shloka-river/scenes/Scene1/assets/images/riverbg-new.webp';
import banyanTree from '../zones/shloka-river/scenes/Scene1/assets/images/banyan-full-from-download.webp';
import suryakotiBg from '../zones/shloka-river/scenes/Scene2/assets/images/saurakoti-bg.webp';
import nirvighnamBg from '../zones/shloka-river/scenes/Scene3/assets/images/nirvighnam/bg.webp';
import sarvakaryeshuBg from '../zones/shloka-river/scenes/scene4/assets/images/sarvakaryeshu-bg.webp';
import sarvadaBg from '../zones/shloka-river/scenes/scene4/assets/images/sarvada/morning.webp';

const GAMES = {
  vakratunda:    { label: 'Vakratunda Rescue', bg: riverBg, scenery: banyanTree, Comp: lazy(() => import('../zones/shloka-river/scenes/Scene1/VakratundaRescueGame')) },
  mahakaya:      { label: 'Mahakaya Rescue',   bg: riverBg, scenery: banyanTree, Comp: lazy(() => import('../zones/shloka-river/scenes/Scene1/MahakayaRescueGame')) },
  suryakoti:     { label: 'Suryakoti',         bg: suryakotiBg,     Comp: lazy(() => import('../zones/shloka-river/scenes/Scene2/components/SuryakotiGame')) },
  samaprabha:    { label: 'Samaprabha',        bg: suryakotiBg,     Comp: lazy(() => import('../zones/shloka-river/scenes/Scene2/components/SamaprabhaGame')) },
  nirvighnam:    { label: 'Nirvighnam',        bg: nirvighnamBg,    Comp: lazy(() => import('../zones/shloka-river/scenes/Scene3/NirvighnamGame')) },
  kurumedeva:    { label: 'Kurumedeva',        bg: nirvighnamBg,    Comp: lazy(() => import('../zones/shloka-river/scenes/Scene3/KurumedevaGame')) },
  sarvakaryeshu: { label: 'Sarvakaryeshu',     bg: sarvakaryeshuBg, Comp: lazy(() => import('../zones/shloka-river/scenes/scene4/SarvakaryeshuGame')) },
  sarvada:       { label: 'Sarvada',           bg: sarvadaBg,       Comp: lazy(() => import('../zones/shloka-river/scenes/scene4/SarvadaGame')) },
};

// Full scenes — self-contained (they wire their own SceneManager / useVoiceGuidance /
// ProgressManager). Rendered full-bleed; real audio works without the mock.
const SCENES = {
  'sr-finale':   { label: 'Shloka River — Finale',       isScene: true, zoneId: 'shloka-river',    sceneId: 'shloka-river-finale', Comp: lazy(() => import('../zones/shloka-river/scenes/scene5/ShlokaRiverFinale')) },
  'sm-modak':    { label: 'Symbol Mtn 1 — Modak',        isScene: true, zoneId: 'symbol-mountain', sceneId: 'modak',       Comp: lazy(() => import('../zones/symbol-mountain/scenes/modak/NewModakSceneV7')) },
  'sm-pond':     { label: 'Symbol Mtn 2 — Pond',         isScene: true, zoneId: 'symbol-mountain', sceneId: 'pond',        Comp: lazy(() => import('../zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4')) },
  'sm-symbol':   { label: 'Symbol Mtn 3 — Symbol',       isScene: true, zoneId: 'symbol-mountain', sceneId: 'symbol',      Comp: lazy(() => import('../zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3')) },
  'sm-final':    { label: 'Symbol Mtn 4 — Sacred Assembly', isScene: true, zoneId: 'symbol-mountain', sceneId: 'final-scene', Comp: lazy(() => import('../zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8')) },
};

const ALL = { ...GAMES, ...SCENES };

const HEADING = "'Baloo 2', system-ui, sans-serif";
const BODY = "'Nunito', system-ui, sans-serif";
const TOOLBAR_H = 44;

function getInitialGame() {
  if (typeof window === 'undefined') return null;
  const key = new URLSearchParams(window.location.search).get('game');
  return ALL[key] ? key : null;
}

// Describe the DOM element under a point, for code-level context.
function describeElementAt(clientX, clientY, overlayEl) {
  const prev = overlayEl ? overlayEl.style.pointerEvents : null;
  if (overlayEl) overlayEl.style.pointerEvents = 'none';
  const el = document.elementFromPoint(clientX, clientY);
  if (overlayEl) overlayEl.style.pointerEvents = prev;
  if (!el) return null;

  const chain = [];
  let node = el;
  for (let i = 0; i < 4 && node && node !== document.body; i++) {
    const cls = (typeof node.className === 'string' ? node.className : '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    chain.push(node.tagName.toLowerCase() + (node.id ? `#${node.id}` : '') + (cls ? `.${cls}` : ''));
    node = node.parentElement;
  }
  const r = el.getBoundingClientRect();
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    className: (typeof el.className === 'string' ? el.className : null),
    text: (el.textContent || '').trim().slice(0, 80) || null,
    alt: el.getAttribute && el.getAttribute('alt'),
    src: el.getAttribute && el.getAttribute('src'),
    path: chain.join(' < '),
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  };
}

export default function GameTestHarness() {
  const [gameKey, setGameKey] = useState(getInitialGame);
  const [mountId, setMountId] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hideElements, setHideElements] = useState(false);
  const [realAudio, setRealAudio] = useState(false);
  const [banner, setBanner] = useState('');

  // annotation state
  const [annotate, setAnnotate] = useState(false);
  const [tool, setTool] = useState('pin'); // 'pin' | 'circle' | 'arrow'
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(null); // in-progress shape
  const stageRef = useRef(null);
  const svgRef = useRef(null);

  const mockVG = useMemo(() => makeMockVoiceGuidance(), []);
  // Real hook — always called (rules of hooks); only wired in when realAudio is on.
  const realVG = useVoiceGuidance('shloka-river', REAL_SCENE_ID[gameKey] || 'vakratunda-grove', {
    enableMusic: false,
    voiceVolume: 1,
    sfxVolume: 0.7,
    idleTimeout: 999999,
  });
  // useVoiceGuidance returns a fresh object literal each render, but its methods
  // are useCallback-stable. Depend on the methods (not the object) so the wrapper
  // identity stays put — otherwise the game sees a new `voiceGuidance` prop every
  // render and its intro effects loop forever.
  const { playVoice: rPlayVoice, playSfx: rPlaySfx, playWord: rPlayWord, playSyllable: rPlaySyllable, stopVoice: rStopVoice } = realVG;
  const realWord = REAL_WORD[gameKey] || 'vakratunda';
  const realSceneId = REAL_SCENE_ID[gameKey] || 'vakratunda-grove';
  const realWrapped = useMemo(
    () => makeTtsVoiceGuidance({
      sceneId: realSceneId,
      word: realWord,
      realVG: { playVoice: rPlayVoice, playSfx: rPlaySfx, playWord: rPlayWord, playSyllable: rPlaySyllable, stopVoice: rStopVoice },
    }),
    [realSceneId, realWord, rPlayVoice, rPlaySfx, rPlayWord, rPlaySyllable, rStopVoice],
  );
  const voiceGuidance = realAudio ? realWrapped : mockVG;
  const callbacks = useMemo(() => makeMockCallbacks(setBanner), []);

  // --- SPARKLE REWARD MIRROR ------------------------------------------------
  // Dev preview of the wrapper reward ladder (the harness bypasses the
  // wrappers). Dust at the finger on each micro-win; Golden Star centre-stage
  // on word/phase complete. Scene4 games (sarvakaryeshu/sarvada) get a star
  // per correct answer instead of dust. Safe to delete this block + its JSX.
  const lastPtRef = useRef({ x: 50, y: 50 });
  const [tapFx, setTapFx] = useState(null);   // { x, y, key, star }
  const [starFx, setStarFx] = useState(0);    // remount key; 0 = hidden
  const scene4 = gameKey === 'sarvakaryeshu' || gameKey === 'sarvada';
  const recordPt = useCallback((e) => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return;
    lastPtRef.current = {
      x: Math.min(95, Math.max(5, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(95, Math.max(5, ((e.clientY - r.top) / r.height) * 100)),
    };
  }, []);
  const fxCallbacks = useMemo(() => ({
    ...callbacks,
    onMicroWin: (id) => {
      callbacks.onMicroWin?.(id);
      setTapFx({ ...lastPtRef.current, key: Date.now(), star: scene4 });
    },
    onPhaseComplete: (ph) => {
      callbacks.onPhaseComplete?.(ph);
      setStarFx(Date.now());
    },
  }), [callbacks, scene4]);

  // Speak the scene's intro line on mount/remount in real-audio mode — the
  // parent scene normally does this and some game components don't.
  useEffect(() => {
    if (!realAudio || !gameKey) return;
    const key = INTRO_VO[gameKey];
    if (!key) return;
    const t = setTimeout(() => voiceGuidance.playVoice(key), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realAudio, gameKey, mountId]);

  const pick = useCallback((key) => {
    setBanner('');
    setItems([]);
    setTapFx(null); setStarFx(0);
    setMountId((n) => n + 1);
    setGameKey(key);
    const url = new URL(window.location.href);
    url.searchParams.set('game', key);
    window.history.replaceState(null, '', url);
  }, []);

  const remount = useCallback(() => { setBanner(''); setTapFx(null); setStarFx(0); setMountId((n) => n + 1); }, []);

  // --- pointer → normalized stage coords (0..1) ---
  const norm = useCallback((e) => {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }, []);

  const onDown = useCallback((e) => {
    if (!annotate) return;
    e.preventDefault();
    const p = norm(e);
    if (tool === 'pin') {
      const el = describeElementAt(p.clientX, p.clientY, svgRef.current);
      setItems((prev) => [...prev, { type: 'pin', x: p.x, y: p.y, comment: '', el }]);
      return;
    }
    setDraft({ type: tool, x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  }, [annotate, tool, norm]);

  const onMove = useCallback((e) => {
    if (!annotate || !draft) return;
    const p = norm(e);
    setDraft((d) => ({ ...d, x2: p.x, y2: p.y }));
  }, [annotate, draft, norm]);

  const onUp = useCallback((e) => {
    if (!annotate || !draft) return;
    const p = norm(e);
    const shape = { ...draft, x2: p.x, y2: p.y, comment: '' };
    if (shape.type === 'circle') {
      const el = describeElementAt((e.clientX), (e.clientY), svgRef.current);
      shape.el = el;
    }
    setItems((prev) => [...prev, shape]);
    setDraft(null);
  }, [annotate, draft, norm]);

  const updateComment = (i, v) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, comment: v } : it)));
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const undo = () => setItems((prev) => prev.slice(0, -1));

  const save = useCallback(async () => {
    const rect = stageRef.current?.getBoundingClientRect();
    const payload = {
      game: gameKey || 'none',
      url: window.location.href,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      stage: rect ? { w: Math.round(rect.width), h: Math.round(rect.height) } : null,
      toggles: { isActive, isPaused, hideElements },
      note: 'coords are 0..1 fractions of the stage box (top-left origin)',
      items,
    };
    try {
      const res = await fetch('/__annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setBanner(json.ok ? `saved → ${json.file}` : `save failed: ${json.error}`);
    } catch (err) {
      setBanner(`save failed: ${err}`);
    }
  }, [gameKey, items, isActive, isPaused, hideElements]);

  const entry = gameKey ? ALL[gameKey] : null;
  const isScene = !!entry?.isScene;
  const pinItems = items.filter((it) => it.type === 'pin');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#E8F5E9', fontFamily: BODY, overflow: 'hidden' }}>
      {/* toolbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(26,10,46,0.92)', color: '#fff', fontFamily: BODY, fontSize: 13, minHeight: TOOLBAR_H, boxSizing: 'border-box' }}>
        <strong style={{ fontFamily: HEADING, fontSize: 14 }}>game-test</strong>
        <select value={gameKey ?? ''} onChange={(e) => pick(e.target.value)} style={{ fontFamily: BODY, padding: '4px 6px', borderRadius: 6 }}>
          <option value="" disabled>pick…</option>
          <optgroup label="Games">
            {Object.entries(GAMES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </optgroup>
          <optgroup label="Full scenes">
            {Object.entries(SCENES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </optgroup>
        </select>
        <button onClick={remount} style={btn}>⟳ remount</button>
        <label style={lbl}><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> isActive</label>
        <label style={lbl}><input type="checkbox" checked={isPaused} onChange={(e) => setIsPaused(e.target.checked)} /> isPaused</label>
        <label style={lbl}><input type="checkbox" checked={hideElements} onChange={(e) => setHideElements(e.target.checked)} /> hideElements</label>
        <button
          onClick={() => { setRealAudio((v) => !v); setMountId((n) => n + 1); }}
          style={{ ...btn, background: realAudio ? '#03A9F4' : '#6A1B9A', color: realAudio ? '#00121f' : '#fff' }}
          title="Real audio: guidance lines spoken via Web Speech (TTS, like the real scenes); syllables + full words play as prerecorded MP3s."
        >
          {realAudio ? '🔊 real audio (TTS)' : '🔇 mock audio'}
        </button>

        <span style={{ width: 1, height: 20, background: '#ffffff33', margin: '0 4px' }} />
        <button onClick={() => setAnnotate((a) => !a)} style={{ ...btn, background: annotate ? '#03A9F4' : '#6A1B9A', color: annotate ? '#00121f' : '#fff' }}>
          {annotate ? '✎ annotating' : '✎ annotate'}
        </button>
        {annotate && (
          <>
            {['pin', 'circle', 'arrow'].map((t) => (
              <button key={t} onClick={() => setTool(t)} style={{ ...btn, background: tool === t ? '#FFD700' : '#3a2a52', color: tool === t ? '#1A0A2E' : '#fff' }}>{t}</button>
            ))}
            <button onClick={undo} style={btn}>undo</button>
            <button onClick={() => setItems([])} style={btn}>clear</button>
            <button onClick={save} disabled={!items.length} style={{ ...btn, background: items.length ? '#2E7D32' : '#3a2a52' }}>💾 save ({items.length})</button>
          </>
        )}
        {banner && <span style={{ marginLeft: 'auto', fontFamily: HEADING, background: '#FFD700', color: '#1A0A2E', padding: '2px 10px', borderRadius: 999, maxWidth: '40vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner}</span>}
      </div>

      {/* stage + annotation panel */}
      <div style={{ position: 'absolute', inset: 0, paddingTop: TOOLBAR_H, display: 'flex' }}>
        <div ref={stageRef} onPointerDownCapture={recordPt} style={{ position: 'relative', flex: 1, height: '100%', overflow: 'hidden', backgroundColor: '#E8F5E9', backgroundImage: (!isScene && entry?.bg) ? `url(${entry.bg})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {!entry && (
            <div style={{ padding: 32, color: '#1A0A2E' }}>
              <h1 style={{ fontFamily: HEADING }}>Shloka River game test</h1>
              <p>Pick a game from the toolbar, or open with <code>?game=&lt;key&gt;</code>:</p>
              <ul>{Object.entries(GAMES).map(([k, v]) => <li key={k}><a href={`?game=${k}`} onClick={(e) => { e.preventDefault(); pick(k); }}>{v.label}</a> — <code>?game={k}</code></li>)}</ul>
            </div>
          )}
          {entry && !isScene && (
            <Suspense fallback={<div style={{ padding: 24 }}>loading {entry.label}…</div>}>
              <entry.Comp key={`${gameKey}-${mountId}`} isActive={isActive} isPaused={isPaused} hideElements={hideElements} voiceGuidance={voiceGuidance} {...fxCallbacks} />
            </Suspense>
          )}

          {/* SPARKLE REWARD MIRROR overlays */}
          {tapFx && (
            <div
              key={tapFx.key}
              style={{ position: 'absolute', left: `${tapFx.x}%`, top: `${tapFx.y}%`, width: tapFx.star ? '42%' : '32%', height: tapFx.star ? '42%' : '32%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 500 }}
            >
              <SparkleAnimation
                type={tapFx.star ? 'star' : 'dust'}
                count={tapFx.star ? 16 : 22}
                color="#FFD54F"
                size={tapFx.star ? 13 : 5}
                duration={tapFx.star ? 1300 : 1600}
                area="full"
                onComplete={() => setTapFx(null)}
              />
            </div>
          )}
          {starFx > 0 && (
            <div
              key={starFx}
              style={{ position: 'absolute', left: '50%', top: '44%', width: '72%', height: '60%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 500 }}
            >
              <SparkleAnimation type="star" count={20} color="#FFD54F" size={14} duration={1500} area="full" onComplete={() => setStarFx(0)} />
            </div>
          )}

          {entry && isScene && (
            <Suspense fallback={<div style={{ padding: 24 }}>loading {entry.label}…</div>}>
              <entry.Comp
                key={`${gameKey}-${mountId}`}
                zoneId={entry.zoneId}
                sceneId={entry.sceneId}
                onNavigate={(dest) => setBanner(`scene → onNavigate(${dest}) — ignored`)}
                onComplete={() => setBanner('✅ scene onComplete')}
              />
            </Suspense>
          )}

          {/* Parent-scene scenery the game component doesn't render itself
              (e.g. Vakratunda/Mahakaya banyan tree) — mirrors .vakratunda-scene-banyan */}
          {!isScene && entry?.scenery && (
            <img
              src={entry.scenery}
              alt=""
              style={{ position: 'absolute', left: '40%', top: '10%', width: '20%', transform: 'translate(-50%, -50%)', zIndex: 6, pointerEvents: 'none' }}
            />
          )}

          {/* annotation overlay */}
          <svg
            ref={svgRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 90000, pointerEvents: annotate ? 'auto' : 'none', cursor: annotate ? 'crosshair' : 'default' }}
          >
            {items.map((it, i) => <Mark key={i} it={it} n={i + 1} />)}
            {draft && <Mark it={draft} n={items.length + 1} preview />}
          </svg>
        </div>

        {annotate && (
          <div style={{ width: 320, height: '100%', overflowY: 'auto', background: '#fff', borderLeft: '2px solid #6A1B9A', padding: 12, boxSizing: 'border-box' }}>
            <h3 style={{ fontFamily: HEADING, margin: '4px 0 10px' }}>Notes ({items.length})</h3>
            {!items.length && <p style={{ color: '#666' }}>Drop a pin / draw a circle or arrow on the game, then write what's wrong here.</p>}
            {items.map((it, i) => (
              <div key={i} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: HEADING, fontSize: 13 }}>
                  <span>#{i + 1} · {it.type}</span>
                  <button onClick={() => removeItem(i)} style={{ ...btn, padding: '0 6px', background: '#c62828' }}>×</button>
                </div>
                {it.el && <div style={{ fontSize: 11, color: '#555', margin: '4px 0', wordBreak: 'break-word' }}>{it.el.tag}{it.el.className ? `.${String(it.el.className).split(/\s+/)[0]}` : ''}{it.el.text ? ` — "${it.el.text}"` : ''}{it.el.alt ? ` [alt: ${it.el.alt}]` : ''}</div>}
                <textarea value={it.comment} onChange={(e) => updateComment(i, e.target.value)} placeholder="what's wrong here?" rows={3} style={{ width: '100%', fontFamily: BODY, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            ))}
            <button onClick={save} disabled={!items.length} style={{ ...btn, width: '100%', padding: 8, background: items.length ? '#2E7D32' : '#aaa' }}>💾 save to src/dev/annotations/</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Mark({ it, n, preview }) {
  const pct = (v) => `${v * 100}%`;
  const stroke = preview ? '#03A9F4' : '#E91E63';
  if (it.type === 'pin') {
    return (
      <g>
        <circle cx={pct(it.x)} cy={pct(it.y)} r="13" fill={stroke} opacity="0.9" />
        <text x={pct(it.x)} y={pct(it.y)} dy="4.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="'Baloo 2', sans-serif">{n}</text>
      </g>
    );
  }
  if (it.type === 'circle') {
    const cx = (it.x1 + it.x2) / 2, cy = (it.y1 + it.y2) / 2;
    const rx = Math.abs(it.x2 - it.x1) / 2, ry = Math.abs(it.y2 - it.y1) / 2;
    return (
      <g>
        <ellipse cx={pct(cx)} cy={pct(cy)} rx={pct(rx)} ry={pct(ry)} fill="none" stroke={stroke} strokeWidth="3" />
        <text x={pct(cx)} y={pct(Math.max(0, cy - ry))} dy="-4" textAnchor="middle" fontSize="13" fontWeight="700" fill={stroke} fontFamily="'Baloo 2', sans-serif">{n}</text>
      </g>
    );
  }
  // arrow
  return (
    <g>
      <defs><marker id={`ah${n}`} markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={stroke} /></marker></defs>
      <line x1={pct(it.x1)} y1={pct(it.y1)} x2={pct(it.x2)} y2={pct(it.y2)} stroke={stroke} strokeWidth="3" markerEnd={`url(#ah${n})`} />
      <text x={pct(it.x1)} y={pct(it.y1)} dy="-6" textAnchor="middle" fontSize="13" fontWeight="700" fill={stroke} fontFamily="'Baloo 2', sans-serif">{n}</text>
    </g>
  );
}

const btn = { fontFamily: BODY, fontSize: 13, padding: '4px 10px', borderRadius: 6, border: 'none', background: '#6A1B9A', color: '#fff', cursor: 'pointer' };
const lbl = { display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' };
