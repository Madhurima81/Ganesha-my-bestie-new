// zones/symbol-mountain/scenes/tusk/EyesPopUpGame.jsx
// Eyes investigation game: find clues first, then find who they belong to.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import './EyesPopUpGame.css';

import bgImg from './assets/images/eyes-game/symbol_mountain_3_bg.png';
import featherImg from './assets/images/eyes-game/peacock_feather.png';
import mangoImg from './assets/images/eyes-game/mango.png';
import butterflyImg from './assets/images/eyes-game/butterfly.png';
import leavesImg from './assets/images/eyes-game/drifting_leaf_cluster.png';
import bushImg from './assets/images/eyes-game/modular_tall_bush.png';
import rockImg from './assets/images/eyes-game/modular_rock_cluster.png';
import peacockRestingImg from './assets/images/eyes-game/peacock_01_resting_fanned_tail.png';
import peacockAdmiringImg from './assets/images/eyes-game/peacock_02_admiring_tail.png';
import peacockSparkleImg from './assets/images/eyes-game/peacock_03_tail_sparkle.png';
import peacockHighlightImg from './assets/images/eyes-game/peacock_04_feather_highlight.png';
import monkeyRestingImg from './assets/images/eyes-game/monkey_01_resting.png';
import monkeyLookingImg from './assets/images/eyes-game/monkey_02_looks_toward_fruit.png';
import monkeyPicksImg from './assets/images/eyes-game/monkey_03_picks_fruit_up.png';
import monkeySmilesImg from './assets/images/eyes-game/monkey_04_smiles_holds_close.png';
import monkeyHoldingImg from './assets/images/eyes-game/monkey_05_idle_holding_fruit.png';
import { ANIMAL_POSITIONS } from './animalPositions';

const FLOW = {
  CLUES: 'clues',
  ANIMALS: 'animals',
  COMPLETE: 'complete'
};

const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugEyes'));
const LAYOUT_STORAGE_KEY = 'symbol_mountain_eyes_layout_v1';
const LAYOUT_PRESET_VERSION = '2026-09-07-eyes-investigation-layout-1';

const DEFAULT_LAYOUT = {
  prompt: { x: 50, y: 5.6, w: 52, z: 40 },
  feedback: { x: 50, y: 84, w: 40, z: 44 },
  tray: { x: 50, y: 93, w: 26, z: 42 },
  clueFeather: { x: 28, y: 58, w: 10, z: 12 },
  clueMango: { x: 44, y: 70, w: 9, z: 12 },
  clueButterfly: { x: 77, y: 58, w: 11, z: 11 },
  clueLeaves: { x: 73, y: 82, w: 14, z: 11 },
  peacockHidden: { x: 28, y: 56, w: 26, z: 13 },
  monkeyHidden: { x: 45, y: 64, w: 15, z: 13 },
  peacockReveal: { x: 69.21, y: 68.92, w: 26, z: 32 },
  monkeyReveal: { x: 10.07, y: 18.11, w: 15, z: 32 },
  animalBird: { x: 77, y: 47, w: 8, z: 11 },
  animalLeaves: { x: 73, y: 78, w: 13, z: 11 },
  propBushLeft: { x: 28, y: 61, w: 22, z: 18 },
  propRockLeft: { x: 43, y: 76, w: 20, z: 20 },
  propBushRight: { x: 78, y: 63, w: 19, z: 18 }
};

const DEBUG_KEYS = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'tray', label: 'Found tray' },
  { key: 'clueFeather', label: 'Clue - feather' },
  { key: 'clueMango', label: 'Clue - mango' },
  { key: 'clueButterfly', label: 'Clue decoy - butterfly' },
  { key: 'clueLeaves', label: 'Clue decoy - leaves' },
  { key: 'peacockHidden', label: 'Peacock hidden' },
  { key: 'monkeyHidden', label: 'Monkey hidden' },
  { key: 'peacockReveal', label: 'Peacock reveal' },
  { key: 'monkeyReveal', label: 'Monkey reveal' },
  { key: 'animalBird', label: 'Animal decoy - bird' },
  { key: 'animalLeaves', label: 'Animal decoy - leaves' },
  { key: 'propBushLeft', label: 'Prop - left bush' },
  { key: 'propRockLeft', label: 'Prop - rock' },
  { key: 'propBushRight', label: 'Prop - right bush' }
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

const CLUE_TARGETS = [
  {
    id: 'feather',
    label: 'Feather',
    img: featherImg,
    layoutKey: 'clueFeather',
    prompt: 'Feather found.'
  },
  {
    id: 'mango',
    label: 'Mango',
    img: mangoImg,
    layoutKey: 'clueMango',
    prompt: 'Mango found.'
  }
];

const CLUE_DISTRACTORS = [
  { id: 'butterfly', label: 'Butterfly', img: butterflyImg, layoutKey: 'clueButterfly' },
  { id: 'leaves', label: 'Leaves', img: leavesImg, layoutKey: 'clueLeaves' }
];

const ANIMAL_TARGETS = [
  {
    id: 'peacock',
    label: 'Peacock',
    frames: [peacockRestingImg, peacockAdmiringImg, peacockSparkleImg, peacockHighlightImg],
    hiddenLayoutKey: 'peacockHidden',
    revealLayoutKey: 'peacockReveal',
    prompt: 'Peacock found.'
  },
  {
    id: 'monkey',
    label: 'Monkey',
    frames: [monkeyRestingImg, monkeyLookingImg, monkeyPicksImg, monkeySmilesImg, monkeyHoldingImg],
    hiddenLayoutKey: 'monkeyHidden',
    revealLayoutKey: 'monkeyReveal',
    prompt: 'Monkey found.'
  }
];

const ANIMAL_DISTRACTORS = [
  { id: 'bird-shadow', label: 'Bird', img: butterflyImg, layoutKey: 'animalBird' },
  { id: 'leaf-rustle', label: 'Leaves', img: leavesImg, layoutKey: 'animalLeaves' }
];

const HIDING_PROPS = [
  { id: 'bush-left', img: bushImg, layoutKey: 'propBushLeft' },
  { id: 'rock-left', img: rockImg, layoutKey: 'propRockLeft' },
  { id: 'bush-right', img: bushImg, layoutKey: 'propBushRight' }
];
const VO_TEXTS = {
  intro: 'Look closely. Find the clues that matter.',
  clueFlowDone: 'Now find who they belong to.',
  complete: 'You looked carefully and connected what you found.',
  neutral: 'That is interesting, but it is not the clue we need.',
  feather: 'Feather',
  mango: 'Mango',
  peacock: 'Peacock',
  monkey: 'Monkey'
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
  const [flow, setFlow] = useState(FLOW.CLUES);
  const [foundClues, setFoundClues] = useState([]);
  const [foundAnimals, setFoundAnimals] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [softPulse, setSoftPulse] = useState(null);
  const [hintId, setHintId] = useState(null);
  const [revealingAnimal, setRevealingAnimal] = useState(null);
  const [frameIndexByAnimal, setFrameIndexByAnimal] = useState({});
  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('clueFeather');
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const idleTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const frameTimerRef = useRef(null);
  const lastTapTimeRef = useRef(Date.now());
  const completedRef = useRef(false);
  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  const foundClueIds = useMemo(() => new Set(foundClues), [foundClues]);
  const foundAnimalIds = useMemo(() => new Set(foundAnimals), [foundAnimals]);
  const activeTargets = flow === FLOW.CLUES ? CLUE_TARGETS : ANIMAL_TARGETS;
  const activeFoundIds = flow === FLOW.CLUES ? foundClueIds : foundAnimalIds;
  const progressFound = activeTargets.filter((target) => activeFoundIds.has(target.id)).length;
  const selectedDebugLayout = layout[selectedDebugKey] || DEFAULT_LAYOUT[selectedDebugKey];

  const stopTimers = useCallback(() => {
    if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    idleTimerRef.current = null;
    feedbackTimerRef.current = null;
    completionTimerRef.current = null;
    frameTimerRef.current = null;
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
    setFlow(FLOW.CLUES);
    setFoundClues([]);
    setFoundAnimals([]);
    setFeedback('');
    setSoftPulse(null);
    setHintId(null);
    setRevealingAnimal(null);
    setFrameIndexByAnimal({});
    lastTapTimeRef.current = Date.now();
    speak(VO_TEXTS.intro);
  }, [isActive, speak, stopTimers]);

  useEffect(() => {
    if (!isActive || flow === FLOW.COMPLETE) return;

    idleTimerRef.current = setInterval(() => {
      const idleMs = Date.now() - lastTapTimeRef.current;
      if (idleMs < IDLE_HINT_MS) return;
      const nextHint = activeTargets.find((target) => !activeFoundIds.has(target.id));
      setHintId(nextHint?.id || null);
    }, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    };
  }, [activeFoundIds, activeTargets, flow, isActive]);

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
    if (foundClues.length !== CLUE_TARGETS.length || flow !== FLOW.CLUES) return;
    completionTimerRef.current = setTimeout(() => {
      setFlow(FLOW.ANIMALS);
      setFeedback(VO_TEXTS.clueFlowDone);
      setHintId(null);
      lastTapTimeRef.current = Date.now();
      speak(VO_TEXTS.clueFlowDone);
    }, 900);
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, [flow, foundClues.length, speak]);

  useEffect(() => {
    if (foundAnimals.length !== ANIMAL_TARGETS.length || completedRef.current) return;
    completedRef.current = true;
    setFlow(FLOW.COMPLETE);
    setFeedback(VO_TEXTS.complete);
    speak(VO_TEXTS.complete);

    completionTimerRef.current = setTimeout(() => {
      const assignedSpots = ANIMAL_TARGETS.reduce((acc, animal) => {
        const revealLayout = layout[animal.revealLayoutKey] || DEFAULT_LAYOUT[animal.revealLayoutKey];
        const fixedPos = ANIMAL_POSITIONS[animal.id] || { x: revealLayout.x, y: revealLayout.y };
        acc[animal.id] = {
          x: fixedPos.x ?? revealLayout.x,
          y: fixedPos.y ?? revealLayout.y,
          depth: fixedPos.depth || 'between-middle-front'
        };
        return acc;
      }, {});

      onGameComplete?.({
        discoveredClues: foundClues,
        discoveredAnimals: foundAnimals,
        totalDiscovered: foundAnimals.length,
        assignedSpots
      });
    }, 1500);

    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, [foundAnimals, foundClues, layout, onGameComplete, speak]);

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

  const startAnimalReveal = useCallback((animalId) => {
    const animal = ANIMAL_TARGETS.find((target) => target.id === animalId);
    if (!animal) return;

    setRevealingAnimal(animalId);
    setFrameIndexByAnimal((prev) => ({ ...prev, [animalId]: 0 }));
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);

    let nextFrame = 0;
    frameTimerRef.current = setInterval(() => {
      nextFrame += 1;
      setFrameIndexByAnimal((prev) => ({
        ...prev,
        [animalId]: Math.min(nextFrame, animal.frames.length - 1)
      }));
      if (nextFrame >= animal.frames.length - 1) {
        clearInterval(frameTimerRef.current);
        frameTimerRef.current = null;
        setTimeout(() => setRevealingAnimal(null), 600);
      }
    }, 360);
  }, []);

  const handleClueTap = useCallback((target, e) => {
    e.stopPropagation();
    if (debugMode || flow !== FLOW.CLUES || foundClueIds.has(target.id)) return;
    resetIdle();
    setFoundClues((prev) => [...prev, target.id]);
    showFeedback(target.prompt, target.id);
    speak(VO_TEXTS[target.id] || target.label);
  }, [debugMode, flow, foundClueIds, resetIdle, showFeedback, speak]);

  const handleAnimalTap = useCallback((target, e) => {
    e.stopPropagation();
    if (debugMode || flow !== FLOW.ANIMALS || foundAnimalIds.has(target.id)) return;
    resetIdle();
    setFoundAnimals((prev) => [...prev, target.id]);
    showFeedback(target.prompt, target.id);
    speak(VO_TEXTS[target.id] || target.label);
    startAnimalReveal(target.id);
  }, [debugMode, flow, foundAnimalIds, resetIdle, showFeedback, speak, startAnimalReveal]);

  if (hideElements || !isActive) return null;

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

      <div
        className={`eyes-game-prompt ${debugMode && selectedDebugKey === 'prompt' ? 'is-debug-selected' : ''}`}
        style={styleFromLayout(layout.prompt)}
        onPointerDown={(e) => startDebugDrag(e, 'prompt')}
      >
        <span>
          {flow === FLOW.CLUES
            ? 'Find the clues that matter'
            : flow === FLOW.ANIMALS
              ? 'Find who they belong to'
              : 'You connected the clues'}
        </span>
        <strong>{progressFound}/{activeTargets.length}</strong>
      </div>

      {CLUE_TARGETS.map((target) => {
        const isFound = foundClueIds.has(target.id);
        const isVisible = flow === FLOW.CLUES || isFound;
        return (
          <button
            key={target.id}
            type="button"
            className={`eyes-hidden-target clue-target ${isFound ? 'found' : ''} ${hintId === target.id ? 'hinting' : ''} ${softPulse === target.id ? 'soft-pulse' : ''} ${debugMode && selectedDebugKey === target.layoutKey ? 'is-debug-selected' : ''}`}
            style={styleFromLayout(layout[target.layoutKey])}
            onClick={(e) => handleClueTap(target, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, target.layoutKey)}
            aria-label={`Find ${target.label}`}
            disabled={!debugMode && (!isVisible || isFound)}
          >
            <img src={target.img} alt="" draggable={false} />
          </button>
        );
      })}

      {(flow === FLOW.CLUES || debugMode) && CLUE_DISTRACTORS.map((target) => (
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

      {(flow !== FLOW.CLUES || debugMode) && ANIMAL_TARGETS.map((target) => {
        const isFound = foundAnimalIds.has(target.id);
        const frameIndex = frameIndexByAnimal[target.id] || 0;
        const frame = isFound
          ? target.frames[frameIndex] || target.frames[target.frames.length - 1]
          : target.frames[0];
        const layoutKey = isFound ? target.revealLayoutKey : target.hiddenLayoutKey;
        return (
          <button
            key={target.id}
            type="button"
            className={`eyes-hidden-target animal-target ${isFound ? 'found' : ''} ${revealingAnimal === target.id ? 'revealing' : ''} ${hintId === target.id ? 'hinting' : ''} ${debugMode && selectedDebugKey === layoutKey ? 'is-debug-selected' : ''}`}
            style={styleFromLayout(layout[layoutKey])}
            onClick={(e) => handleAnimalTap(target, e)}
            onPointerDown={(e) => debugMode && startDebugDrag(e, layoutKey)}
            aria-label={`Find ${target.label}`}
            disabled={!debugMode && isFound}
          >
            <img src={frame} alt="" draggable={false} />
            {isFound && <span className="eyes-popup-sparkle" />}
          </button>
        );
      })}

      {(flow === FLOW.ANIMALS || debugMode) && ANIMAL_DISTRACTORS.map((target) => (
        <button
          key={target.id}
          type="button"
          className={`eyes-hidden-target distractor-target animal-distractor ${softPulse === target.id ? 'soft-pulse' : ''} ${debugMode && selectedDebugKey === target.layoutKey ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout[target.layoutKey])}
          onClick={(e) => handleDistractorTap(target, e)}
          onPointerDown={(e) => debugMode && startDebugDrag(e, target.layoutKey)}
          aria-label={target.label}
        >
          <img src={target.img} alt="" draggable={false} />
        </button>
      ))}

      {debugMode && ANIMAL_TARGETS.filter((target) => !foundAnimalIds.has(target.id)).map((target) => (
        <button
          key={`debug-reveal-${target.id}`}
          type="button"
          className={`eyes-hidden-target animal-target debug-preview ${selectedDebugKey === target.revealLayoutKey ? 'is-debug-selected' : ''}`}
          style={styleFromLayout(layout[target.revealLayoutKey])}
          onPointerDown={(e) => startDebugDrag(e, target.revealLayoutKey)}
          aria-label={`Move ${target.label} reveal`}
        >
          <img src={target.frames[target.frames.length - 1]} alt="" draggable={false} />
        </button>
      ))}

      {HIDING_PROPS.map((prop) => (
        <img
          key={prop.id}
          className={`eyes-hiding-prop ${debugMode && selectedDebugKey === prop.layoutKey ? 'is-debug-selected' : ''}`}
          src={prop.img}
          alt=""
          draggable={false}
          style={styleFromLayout(layout[prop.layoutKey])}
          onPointerDown={(e) => startDebugDrag(e, prop.layoutKey)}
        />
      ))}

      <div
        className={`eyes-clue-tray ${debugMode && selectedDebugKey === 'tray' ? 'is-debug-selected' : ''}`}
        style={styleFromLayout(layout.tray)}
        aria-hidden="true"
        onPointerDown={(e) => startDebugDrag(e, 'tray')}
      >
        {CLUE_TARGETS.map((target) => (
          <div key={target.id} className={`eyes-clue-slot ${foundClueIds.has(target.id) ? 'filled' : ''}`}>
            {foundClueIds.has(target.id) ? <img src={target.img} alt="" /> : <span />}
          </div>
        ))}
        {ANIMAL_TARGETS.map((target) => (
          <div key={target.id} className={`eyes-clue-slot animal-slot ${foundAnimalIds.has(target.id) ? 'filled' : ''}`}>
            {foundAnimalIds.has(target.id) ? <img src={target.frames[target.frames.length - 1]} alt="" /> : <span />}
          </div>
        ))}
      </div>

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
