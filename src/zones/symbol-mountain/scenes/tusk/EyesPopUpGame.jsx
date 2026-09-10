// zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx
// Eyes investigation game: a single story-led search — Monkey is hungry,
// Peacock is missing a feather. Find both camouflaged things at once.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import './EyesPopUpGame.css';

import bgImg from './assets/images/eyes-game/symbol_mountain_3_bg.png';
import monkeyWorriedImg from './assets/images/eyes-game-v2/monkey_hungry_worried.png';
import peacockWorriedImg from './assets/images/eyes-game-v2/peacock_worried_missing_feather.png';
import monkeyHappyImg from './assets/images/eyes-game/monkey_04_smiles_holds_close.png';
import peacockHappyImg from './assets/images/eyes-game/peacock_04_feather_highlight.png';
import newFeatherBushImg from './assets/images/eyes-game-v2/new_feather_bush.png';
import newMangoBushImg from './assets/images/eyes-game-v2/new_mango_bush.png';
import featherFoundImg from './assets/images/eyes-game-v2/peacock_feather_single.png';
import mangoFoundImg from './assets/images/eyes-game/mango.png';
import yellowFlowerClusterImg from './assets/images/eyes-game-v2/yellow_flower_cluster.png';
import { ANIMAL_POSITIONS } from './animalPositions';

const FLOW = {
  SEARCH: 'search',
  COMPLETE: 'complete'
};

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugEyes'));
const LAYOUT_STORAGE_KEY = 'symbol_mountain_eyes_layout_v2';
const LAYOUT_PRESET_VERSION = '2026-09-10-eyes-visual-flow-editor-layout-5';

const DEFAULT_LAYOUT = {
  prompt: { x: 50, y: 5.6, w: 52, z: 40 },
  feedback: { x: 50, y: 84, w: 40, z: 44 },
  tray: { x: 50, y: 93, w: 22, z: 42 },
  // Positions below (monkey/peacock/feather/mango/yellow-flowers) ported from
  // Madhurima's Visual Flow Editor layout (Beat 1 — "Search begins"). Both the
  // editor and this game center-anchor sprites (translate(-50%,-50%)), so the
  // editor's x/y/effective-width copy over directly — no top-left conversion
  // needed. The hidden-state (bush) sizes use the editor's "New feather/mango
  // bush" item widths, NOT the tiny "found" item widths — that mismatch is
  // what made the bushes render too small the first time. Butterfly and
  // cream-flowers were dropped from the authored layout entirely, so they're
  // removed below rather than kept in their old spots.
  monkeyCharacter: { x: 17.58, y: 38.74, w: 12, z: 15 },
  peacockCharacter: { x: 67.78, y: 43.58, w: 20.16, z: 15 },
  // The bushes are permanent scenery — they never disappear. Only the
  // feather/mango icon itself (rendered separately, invisible until tapped)
  // flies out to the peacock/monkey. targetFeather/targetMango below are
  // just the invisible tap hit-areas, sized to cover their bush.
  targetFeatherBush1: { x: 62.08, y: 66.76, w: 24, z: 12 },
  targetFeatherBush2: { x: 71.32, y: 66.9, w: 21.6, z: 13 },
  targetMangoBush: { x: 45.48, y: 45.81, w: 24, z: 12 },
  targetFeather: { x: 62.08, y: 66.76, w: 24, z: 14 },
  targetFeatherFound: { x: 62.08, y: 66.76, w: 9.84, z: 14 },
  targetMango: { x: 45.48, y: 45.81, w: 24, z: 14 },
  targetMangoFound: { x: 45.48, y: 45.81, w: 6, z: 14 },
  distractorYellowFlowers: { x: 46.07, y: 48.95, w: 11.28, z: 11 }
};

const DEBUG_KEYS = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'tray', label: 'Found tray' },
  { key: 'monkeyCharacter', label: 'Monkey (worried)' },
  { key: 'peacockCharacter', label: 'Peacock (worried)' },
  { key: 'targetFeatherBush1', label: 'Feather bush (permanent)' },
  { key: 'targetFeatherBush2', label: 'Feather bush 2 (permanent)' },
  { key: 'targetFeather', label: 'Target - feather tap area (invisible)' },
  { key: 'targetFeatherFound', label: 'Target - feather found (small)' },
  { key: 'targetMangoBush', label: 'Mango bush (permanent)' },
  { key: 'targetMango', label: 'Target - mango tap area (invisible)' },
  { key: 'targetMangoFound', label: 'Target - mango found (small)' },
  { key: 'distractorYellowFlowers', label: 'Distractor - yellow flowers' }
];

const loadSavedLayout = () => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    if (saved.version !== LAYOUT_PRESET_VERSION || !saved.layout) return DEFAULT_LAYOUT;
    return Object.fromEntries(
      Object.entries(DEFAULT_LAYOUT).map(([key, fallback]) => [
        key,
        { ...fallback, ...(saved.layout[key] || {}) }
      ])
    );
  } catch {
    return DEFAULT_LAYOUT;
  }
};

const styleFromLayout = (layoutItem) => ({
  left: `${layoutItem.x}%`,
  top: `${layoutItem.y}%`,
  bottom: 'auto',
  width: `${layoutItem.w}%`,
  zIndex: layoutItem.z
});

const SEARCH_TARGETS = [
  {
    id: 'feather',
    label: 'Feather',
    // No hiddenImg — the bush is permanent scenery rendered separately.
    // The tap target itself is invisible until found.
    hiddenImg: null,
    foundImg: featherFoundImg,
    layoutKey: 'targetFeather',
    foundLayoutKey: 'targetFeatherFound',
    carryLayoutKey: 'peacockCharacter',
    prompt: 'Feather found! Peacock will be so happy.'
  },
  {
    id: 'mango',
    label: 'Mango',
    // No hiddenImg — the bush is permanent scenery rendered separately.
    hiddenImg: null,
    foundImg: mangoFoundImg,
    layoutKey: 'targetMango',
    foundLayoutKey: 'targetMangoFound',
    carryLayoutKey: 'monkeyCharacter',
    prompt: 'Mango found! Monkey is hungry no more.'
  }
];

// Only the yellow-flowers distractor is part of the authored Beat 1 layout —
// butterfly and cream-flowers were dropped from that design, not just moved.
const DISTRACTORS = [
  { id: 'yellow-flowers', label: 'Flowers', img: yellowFlowerClusterImg, layoutKey: 'distractorYellowFlowers' }
];

const VO_TEXTS = {
  intro: 'Monkey is hungry, and Peacock has lost a special feather. Look carefully. Can you find what they need?',
  complete: 'You looked closely and found them both!',
  neutral: 'That is interesting, but it is not what they are looking for.',
  feather: 'Feather found! Peacock will be so happy.',
  mango: 'Mango found! Monkey is hungry no more.'
};

const IDLE_HINT_MS = 9000;

const speakFallback = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis is optional.
  }
};

const EyesPopUpGame = ({
  isActive = true,
  isAudioOn = true,
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const [flow, setFlow] = useState(FLOW.SEARCH);
  const [foundTargets, setFoundTargets] = useState([]);
  const [carriedTargets, setCarriedTargets] = useState([]);
  const [goneTargets, setGoneTargets] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [softPulse, setSoftPulse] = useState(null);
  const [hintId, setHintId] = useState(null);
  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('targetFeather');
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const idleTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const carryTimersRef = useRef([]);
  const lastTapTimeRef = useRef(Date.now());
  const completedRef = useRef(false);
  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  const foundIds = useMemo(() => new Set(foundTargets), [foundTargets]);
  const carriedIds = useMemo(() => new Set(carriedTargets), [carriedTargets]);
  const goneIds = useMemo(() => new Set(goneTargets), [goneTargets]);
  const selectedDebugLayout = layout[selectedDebugKey] || DEFAULT_LAYOUT[selectedDebugKey];

  const stopTimers = useCallback(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    carryTimersRef.current.forEach((timer) => clearTimeout(timer));
    carryTimersRef.current = [];
    idleTimerRef.current = null;
    feedbackTimerRef.current = null;
    completionTimerRef.current = null;
  }, []);

  const schedule = useCallback((fn, delay) => {
    const timer = setTimeout(() => {
      carryTimersRef.current = carryTimersRef.current.filter((item) => item !== timer);
      fn();
    }, delay);
    carryTimersRef.current.push(timer);
    return timer;
  }, []);

  const speak = useCallback((text) => {
    if (!isAudioOn) return;
    speakFallback(text);
  }, [isAudioOn]);

  const showFeedback = useCallback((message, pulseId = null) => {
    setFeedback(message);
    setSoftPulse(pulseId);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('');
      setSoftPulse(null);
    }, 1500);
  }, []);

  const resetIdle = useCallback(() => {
    lastTapTimeRef.current = Date.now();
    setHintId(null);
  }, []);

  const saveLayout = useCallback((nextLayout) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({
        version: LAYOUT_PRESET_VERSION,
        layout: nextLayout
      }));
    } catch {
      // Local storage is optional in the dev harness.
    }
  }, []);

  const updateLayout = useCallback((key, patch) => {
    setLayout((current) => {
      const next = {
        ...current,
        [key]: {
          ...(current[key] || DEFAULT_LAYOUT[key]),
          ...patch
        }
      };
      saveLayout(next);
      return next;
    });
  }, [saveLayout]);

  const updateLayoutField = useCallback((key, field, value) => {
    const max = field === 'z' ? 80 : 100;
    const numeric = Math.max(0, Math.min(max, Number(value)));
    updateLayout(key, { [field]: numeric });
  }, [updateLayout]);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
      } catch {
        // no-op
      }
    }
  }, []);

  const copyLayoutJson = useCallback(async () => {
    const payload = JSON.stringify({ version: LAYOUT_PRESET_VERSION, layout }, null, 2);
    try {
      await navigator.clipboard?.writeText(payload);
      setLayoutCopyStatus('Copied');
    } catch {
      window.prompt?.('Copy Eyes layout JSON', payload);
      setLayoutCopyStatus('Shown');
    }
    console.log('Eyes layout JSON:', payload);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setLayoutCopyStatus(''), 1500);
  }, [layout]);

  const getPointerPercent = useCallback((event) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return null;
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    };
  }, []);

  const startDebugDrag = useCallback((event, key) => {
    if (!debugMode) return;
    const point = getPointerPercent(event);
    const item = layout[key] || DEFAULT_LAYOUT[key];
    if (!point || !item) return;
    event.stopPropagation();
    debugDragRef.current = {
      key,
      offsetX: point.x - item.x,
      offsetY: point.y - item.y
    };
    setSelectedDebugKey(key);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [debugMode, getPointerPercent, layout]);

  const handleDebugPointerMove = useCallback((event) => {
    const drag = debugDragRef.current;
    if (!drag) return;
    const point = getPointerPercent(event);
    if (!point) return;
    event.stopPropagation();
    updateLayout(drag.key, {
      x: Number(Math.max(0, Math.min(100, point.x - drag.offsetX)).toFixed(2)),
      y: Number(Math.max(0, Math.min(100, point.y - drag.offsetY)).toFixed(2))
    });
  }, [getPointerPercent, updateLayout]);

  const stopDebugDrag = useCallback(() => {
    debugDragRef.current = null;
  }, []);

  const startDebugPanelDrag = useCallback((event) => {
    debugPanelDragRef.current = {
      offsetX: event.clientX - debugPanelPosition.x,
      offsetY: event.clientY - debugPanelPosition.y
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [debugPanelPosition.x, debugPanelPosition.y]);

  const moveDebugPanelDrag = useCallback((event) => {
    const drag = debugPanelDragRef.current;
    if (!drag) return;
    const panelWidth = Math.min(352, window.innerWidth - 24);
    const panelHeight = debugMode ? Math.min(window.innerHeight * 0.78, 560) : 48;
    setDebugPanelPosition({
      x: Math.max(8, Math.min(window.innerWidth - panelWidth - 8, event.clientX - drag.offsetX)),
      y: Math.max(8, Math.min(window.innerHeight - panelHeight - 8, event.clientY - drag.offsetY))
    });
  }, [debugMode]);

  const stopDebugPanelDrag = useCallback(() => {
    debugPanelDragRef.current = null;
  }, []);

  useEffect(() => {
    if (!isActive) return;
    stopTimers();
    completedRef.current = false;
    setFlow(FLOW.SEARCH);
    setFoundTargets([]);
    setCarriedTargets([]);
    setGoneTargets([]);
    setFeedback('');
    setSoftPulse(null);
    setHintId(null);
    lastTapTimeRef.current = Date.now();
    speak(VO_TEXTS.intro);
  }, [isActive, speak, stopTimers]);

  useEffect(() => {
    if (!isActive || flow === FLOW.COMPLETE) return;

    idleTimerRef.current = setInterval(() => {
      const idleMs = Date.now() - lastTapTimeRef.current;
      if (idleMs < IDLE_HINT_MS) return;
      const nextHint = SEARCH_TARGETS.find((target) => !foundIds.has(target.id));
      setHintId(nextHint?.id || null);
    }, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    };
  }, [foundIds, flow, isActive]);

  useAppVisibility(null, useCallback(() => {
    resetIdle();
  }, [resetIdle]));

  useEffect(() => () => {
    stopTimers();
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel();
    }
  }, [stopTimers]);

  useEffect(() => {
    if (foundTargets.length !== SEARCH_TARGETS.length || completedRef.current) return;
    completedRef.current = true;
    setFlow(FLOW.COMPLETE);
    setFeedback(VO_TEXTS.complete);
    speak(VO_TEXTS.complete);

    completionTimerRef.current = setTimeout(() => {
      const assignedSpots = {
        monkey: ANIMAL_POSITIONS.monkey,
        peacock: ANIMAL_POSITIONS.peacock
      };

      onGameComplete?.({
        discoveredClues: foundTargets,
        discoveredAnimals: foundTargets,
        totalDiscovered: foundTargets.length,
        assignedSpots
      });
    }, 1500);

    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, [foundTargets, onGameComplete, speak]);

  const handleSceneTap = useCallback((e) => {
    if (debugMode || flow === FLOW.COMPLETE) return;
    resetIdle();

    const rect = e.currentTarget.getBoundingClientRect();
    const shimmer = document.createElement('div');
    shimmer.className = 'eyes-popup-shimmer';
    shimmer.style.left = `${e.clientX - rect.left}px`;
    shimmer.style.top = `${e.clientY - rect.top}px`;
    e.currentTarget.appendChild(shimmer);
    setTimeout(() => shimmer.remove(), 650);
  }, [debugMode, flow, resetIdle]);

  const handleDistractorTap = useCallback((target, e) => {
    e.stopPropagation();
    if (debugMode || flow === FLOW.COMPLETE) return;
    resetIdle();
    showFeedback(VO_TEXTS.neutral, target.id);
    speak(VO_TEXTS.neutral);
  }, [debugMode, flow, resetIdle, showFeedback, speak]);

  const handleTargetTap = useCallback((target, e) => {
    e.stopPropagation();
    if (debugMode || flow === FLOW.COMPLETE || foundIds.has(target.id)) return;
    resetIdle();
    setFoundTargets((prev) => [...prev, target.id]);
    showFeedback(target.prompt, target.id);
    speak(VO_TEXTS[target.id] || target.label);

    // Let the child see it found in place briefly, then carry it to the
    // animal, then remove it so only the resolved animal state remains.
    schedule(() => setCarriedTargets((prev) => [...prev, target.id]), 550);
    schedule(() => setGoneTargets((prev) => [...prev, target.id]), 1150);
  }, [debugMode, flow, foundIds, resetIdle, schedule, showFeedback, speak]);

  if (hideElements || !isActive) return null;

  const monkeyImg = foundIds.has('mango') ? monkeyHappyImg : monkeyWorriedImg;
  const peacockImg = foundIds.has('feather') ? peacockHappyImg : peacockWorriedImg;

  return (
    <div
      ref={stageRef}
      className={`eyes-popup-game ${className} ${debugMode ? 'is-debugging' : ''}`}
      onClick={handleSceneTap}
      onPointerMove={handleDebugPointerMove}
      onPointerUp={stopDebugDrag}
      onPointerLeave={stopDebugDrag}
    >
      <img className="eyes-game-bg" src={bgImg} alt="" draggable={false} />

      <img
        className={`eyes-story-character ${debugMode && selectedDebugKey === 'monkeyCharacter' ? 'is-debug-selected' : ''}`}
        src={monkeyImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.monkeyCharacter)}
        onPointerDown={(e) => startDebugDrag(e, 'monkeyCharacter')}
      />
      <img
        className={`eyes-story-character ${debugMode && selectedDebugKey === 'peacockCharacter' ? 'is-debug-selected' : ''}`}
        src={peacockImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.peacockCharacter)}
        onPointerDown={(e) => startDebugDrag(e, 'peacockCharacter')}
      />

      {/* Permanent scenery — the bushes never disappear. Only the feather/
          mango icon itself flies out to the peacock/monkey once tapped. */}
      <img
        className={`eyes-hiding-prop ${debugMode && selectedDebugKey === 'targetFeatherBush1' ? 'is-debug-selected' : ''}`}
        src={newFeatherBushImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.targetFeatherBush1)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'targetFeatherBush1')}
      />
      <img
        className={`eyes-hiding-prop ${debugMode && selectedDebugKey === 'targetFeatherBush2' ? 'is-debug-selected' : ''}`}
        src={newFeatherBushImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.targetFeatherBush2)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'targetFeatherBush2')}
      />
      <img
        className={`eyes-hiding-prop ${debugMode && selectedDebugKey === 'targetMangoBush' ? 'is-debug-selected' : ''}`}
        src={newMangoBushImg}
        alt=""
        draggable={false}
        style={styleFromLayout(layout.targetMangoBush)}
        onPointerDown={(e) => debugMode && startDebugDrag(e, 'targetMangoBush')}
      />

      {SEARCH_TARGETS.map((target) => {
        const isFound = foundIds.has(target.id);
        const isCarried = carriedIds.has(target.id);
        const isGone = goneIds.has(target.id);
        if (isGone) return null;

        const activeLayoutKey = isCarried
          ? target.carryLayoutKey
          : isFound
            ? target.foundLayoutKey
            : target.layoutKey;

        return (
          <button
            key={target.id}
            type="button"
            className={`eyes-hidden-target clue-target ${isFound ? 'found' : ''} ${isCarried ? 'carried' : ''} ${hintId === target.id ? 'hinting' : ''} ${softPulse === target.id ? 'soft-pulse' : ''} ${debugMode && selectedDebugKey === activeLayoutKey ? 'is-debug-selected' : ''}`}
            style={{ ...styleFromLayout(layout[activeLayoutKey]), aspectRatio: '1 / 1' }}
            onClick={(e) => handleTargetTap(target, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, activeLayoutKey)}
            aria-label={`Find ${target.label}`}
            disabled={!debugMode && isFound}
          >
            {(isFound ? target.foundImg : target.hiddenImg) && (
              <img src={isFound ? target.foundImg : target.hiddenImg} alt="" draggable={false} />
            )}
          </button>
        );
      })}

      {DISTRACTORS.map((target) => (
        <button
          key={target.id}
          type="button"
          className={`eyes-hidden-target distractor-target ${softPulse === target.id ? 'soft-pulse' : ''} ${debugMode && selectedDebugKey === target.layoutKey ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout[target.layoutKey])}
          onClick={(e) => handleDistractorTap(target, e)}
          onPointerDown={(e) => debugMode && startDebugDrag(e, target.layoutKey)}
          aria-label={target.label}
        >
          <img src={target.img} alt="" draggable={false} />
        </button>
      ))}


      {(feedback || debugMode) && (
        <div
          className={`eyes-soft-feedback ${debugMode && selectedDebugKey === 'feedback' ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout.feedback)}
          onPointerDown={(e) => startDebugDrag(e, 'feedback')}
        >
          {feedback || 'Feedback'}
        </div>
      )}

      {DEBUG_UI_ENABLED && (
        <div
          className={`eyes-debug-panel ${debugMode ? 'is-open' : ''}`}
          style={{ left: debugPanelPosition.x, top: debugPanelPosition.y }}
          onPointerMove={moveDebugPanelDrag}
          onPointerUp={stopDebugPanelDrag}
          onPointerLeave={stopDebugPanelDrag}
        >
          <button
            type="button"
            className="eyes-debug-toggle"
            onClick={() => setDebugMode((value) => !value)}
          >
            {debugMode ? 'Hide Layout Debug' : 'Layout Debug'}
          </button>

          {debugMode && (
            <div className="eyes-debug-body">
              <button
                type="button"
                className="eyes-debug-drag-handle"
                onPointerDown={startDebugPanelDrag}
              >
                Drag panel
              </button>
              <div className="eyes-debug-section-title">Scene Objects</div>
              <p className="eyes-debug-note">Drag any object in the scene, or tune exact values here.</p>

              <label className="eyes-debug-row">
                <span>Element</span>
                <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
                  {DEBUG_KEYS.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>

              {['x', 'y', 'w', 'z'].map((field) => (
                <label key={field} className="eyes-debug-row">
                  <span>{field.toUpperCase()}</span>
                  <input
                    type="range"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={selectedDebugLayout?.[field] ?? (field === 'z' ? 20 : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    max={field === 'z' ? 80 : 100}
                    step={field === 'z' ? 1 : 0.25}
                    value={selectedDebugLayout?.[field] ?? (field === 'z' ? 20 : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                </label>
              ))}

              <div className="eyes-debug-actions">
                <button type="button" onClick={copyLayoutJson}>
                  {layoutCopyStatus || 'Copy JSON'}
                </button>
                <button type="button" onClick={resetLayout}>Reset</button>
              </div>

              <pre className="eyes-debug-readout">{JSON.stringify({ [selectedDebugKey]: selectedDebugLayout }, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EyesPopUpGame;
