// zones/symbol-mountain/scenes/symbol/EyesPopUpGame.jsx
// ðŸŽ¯ Eyes Pop-Up Game â€” discover 4 animals as they fade in/out from hidden spots
// Replaces EyesTelescopeGame (magnifier mechanic)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EyesPopUpGame.css';

// Animals
import peacockImg from './assets/images/peacock-new.png';
import monkeyImg from './assets/images/monkey-new.png';
import elephantImg from './assets/images/elephant-new1.png';
import cowImg from './assets/images/cow-new.png';
import bgBackImg from './assets/images/trail-bg.png';
import backRocksImg from './assets/images/trail-back.png';
import middleRocksImg from './assets/images/trail-mid.png';
import frontRocksImg from './assets/images/trail-front.png';
import { ANIMAL_SIZES } from './animalConfig';
import { ANIMAL_POSITIONS } from './animalPositions';

// VO — recorded files do not exist yet. Paths are null so the Web Speech
// fallback fires immediately (the old '/src/...' URLs 404'd in production
// builds; when real files land, import them via Vite so they get bundled).
const VO_PATHS = {
  peacock: null,
  monkey: null,
  elephant: null,
  cow: null,
  intro: null
};
const VO_TEXTS = {
  intro: 'Look closely. Tap the animals when you see them.',
  peacock: 'Peacock',
  monkey: 'Monkey',
  elephant: 'Elephant',
  cow: 'Cow'
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CONFIG
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ANIMALS = [
  { id: 'peacock', name: 'Peacock', img: peacockImg, vo: VO_PATHS.peacock },
  { id: 'monkey', name: 'Monkey', img: monkeyImg, vo: VO_PATHS.monkey },
  { id: 'elephant', name: 'Elephant', img: elephantImg, vo: VO_PATHS.elephant },
  { id: 'cow', name: 'Cow', img: cowImg, vo: VO_PATHS.cow }
];

// Each animal gets its own small pool of hide options.
// This keeps placements natural and lets us randomize one option per animal at runtime.
const ANIMAL_HIDE_OPTIONS = {
  peacock: [
    { id: 'peacock-1', x: 28.39, y: 42.28, zone: 'left-bushes', depth: 'behind-middle', revealOffsetX: 0, revealOffsetY: 0, scale: 2 },
    { id: 'peacock-2', x: 73.96, y: 66.8, zone: 'right-rocks', depth: 'between-middle-front', revealOffsetX: 0, revealOffsetY: 0, scale: 2 }
  ],
  monkey: [
    { id: 'monkey-1', x: 27.54, y: 48.37, zone: 'left-bushes', depth: 'behind-middle', revealOffsetX: 0, revealOffsetY: 0, scale: 1.7 },
    { id: 'monkey-2', x: 77.07, y: 32.79, zone: 'mid-trail', depth: 'behind-middle', revealOffsetX: 0, revealOffsetY: 0, scale: 1.7 }
  ],
  elephant: [
    { id: 'elephant-1', x: 21.89, y: 55.42, zone: 'left-rocks', depth: 'behind-middle', revealOffsetX: 0, revealOffsetY: 0, scale: 2.8 },
    { id: 'elephant-2', x: 68.79, y: 64.5, zone: 'mid-trail', depth: 'between-middle-front', revealOffsetX: 0, revealOffsetY: 0, scale: 2.8 }
  ],
  cow: [
    { id: 'cow-1', x: 23.96, y: 72.09, zone: 'left-rocks', depth: 'between-middle-front', revealOffsetX: 0, revealOffsetY: 0, scale: 2.4 },
    { id: 'cow-2', x: 88.65, y: 54.34, zone: 'right-rocks', depth: 'between-middle-front', revealOffsetX: 0, revealOffsetY: 0, scale: 2.4 }
  ]
};
const ZONES = {
  'left-rocks': { x: 13, y: 70, w: 18, h: 26 },
  'left-bushes': { x: 28, y: 69, w: 22, h: 22 },
  'mid-trail': { x: 51, y: 58, w: 24, h: 18 },
  'right-rocks': { x: 72, y: 64, w: 18, h: 22 },
  'right-bushes': { x: 87, y: 68, w: 18, h: 26 }
};
const FADE_IN_OPACITY = 0.35;    // hidden-state opacity â€” visible silhouette, partial hiding behind rocks does the rest
const POP_OPACITY = 1.0;          // pre-click pop opacity
const SHOW_OPACITY = 1.0;         // after discovery
const POP_VISIBLE_MS = 2600;       // calmer window â€” noticing, not panic
const POP_HIDDEN_MS = 900;         // gentle cooldown
const IDLE_HINT_MS = 8000;         // glow an undiscovered animal after 8s
const IDLE_ZONE_HINT_MS = 16000;   // glow hint zone after longer idle
const IDLE_FULL_REVEAL_MS = 24000; // full reveal after long idle
// Debug spot editor — only with ?debug in the URL, never for children in prod.
const SHOW_SPOT_DEBUG =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('debug');
const SPOT_STORAGE_KEY = 'symbol_mountain_eyes_hide_options_v5';
const ANIMAL_POSITION_STORAGE_KEY = 'symbol_mountain_eyes_animal_positions_v3';
const DEBUG_MODE_STORAGE_KEY = 'symbol_mountain_eyes_debug_mode_v2';
const DEBUG_DEPTHS = ['behind-middle', 'behind-front', 'between-middle-front'];
const DEBUG_ASSIGNMENT_COLORS = {
  peacock: '#22d3ee',
  monkey: '#fb923c',
  elephant: '#9ca3af',
  cow: '#f8fafc'
};
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const randomItem = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)] || null;
};

const getZoneBucket = (spot) => {
  if (!spot) return 'unknown';
  if (spot.x < 35) return spot.y >= 58 ? 'left-front' : 'left-back';
  if (spot.x <= 68) return spot.y >= 58 ? 'middle-front' : 'middle-back';
  return spot.y >= 58 ? 'right-front' : 'right-back';
};

const distanceBetweenSpots = (a, b) => {
  if (!a || !b) return Infinity;
  return Math.hypot((a.x ?? 0) - (b.x ?? 0), (a.y ?? 0) - (b.y ?? 0));
};

const getSpotScale = (animalId, spot) => {
  return spot?.scale ?? ANIMAL_SIZES[animalId] ?? 1;
};

const getRequiredSeparation = (animalA, spotA, animalB, spotB) => {
  const scaleA = getSpotScale(animalA.id, spotA);
  const scaleB = getSpotScale(animalB.id, spotB);
  const avgScale = (scaleA + scaleB) / 2;
  const sameBucketBonus = getZoneBucket(spotA) === getZoneBucket(spotB) ? 6 : 0;
  return 8 + (avgScale * 4) + sameBucketBonus;
};

const scoreAssignmentSet = (assignmentSet) => {
  let penalty = 0;

  for (let i = 0; i < assignmentSet.length; i += 1) {
    for (let j = i + 1; j < assignmentSet.length; j += 1) {
      const first = assignmentSet[i];
      const second = assignmentSet[j];
      const distance = distanceBetweenSpots(first.spot, second.spot);
      const required = getRequiredSeparation(first.animal, first.spot, second.animal, second.spot);

      if (distance < required) {
        penalty += (required - distance) * 10;
      }

      if (getZoneBucket(first.spot) === getZoneBucket(second.spot)) {
        penalty += 3;
      }
    }
  }

  return penalty;
};

const cloneHideOptions = (hideOptionsByAnimal) => Object.fromEntries(
  Object.entries(hideOptionsByAnimal || {}).map(([animalId, options]) => {
    const defaultOptions = ANIMAL_HIDE_OPTIONS[animalId] || [];
    const safeOptions = Array.isArray(options) ? options : defaultOptions;

    return [
      animalId,
      safeOptions.map((option, index) => {
        const fallback = defaultOptions[index] || defaultOptions[0] || {};
        const source = option && typeof option === 'object' ? option : fallback;

        return {
          ...source,
          id: source.id || `${animalId}-${index + 1}`,
          zone: source.zone || fallback.zone || 'mid-trail',
          depth: source.depth || fallback.depth || 'behind-middle',
          revealOffsetX: source.revealOffsetX ?? fallback.revealOffsetX ?? 0,
          revealOffsetY: source.revealOffsetY ?? fallback.revealOffsetY ?? 0,
          scale: source.scale ?? fallback.scale ?? ANIMAL_SIZES[animalId] ?? 1
        };
      }).filter(Boolean)
    ];
  })
);

const PENALTY_TOLERANCE = 15; // combos within this of the best are all acceptable

const assignAnimalsToSpots = (hideOptionsByAnimal) => {
  const poolsByAnimal = ANIMALS.map((animal) => ({
    animal,
    pool: shuffle((hideOptionsByAnimal?.[animal.id]?.length ? hideOptionsByAnimal[animal.id] : ANIMAL_HIDE_OPTIONS[animal.id]) || [])
  }));

  const candidates = []; // { assignments, penalty }

  const search = (index, chosen) => {
    if (index >= poolsByAnimal.length) {
      candidates.push({ assignments: chosen, penalty: scoreAssignmentSet(chosen) });
      return;
    }
    const { animal, pool } = poolsByAnimal[index];
    for (const spot of pool) {
      search(index + 1, [...chosen, { animal, spot }]);
    }
  };

  search(0, []);
  if (!candidates.length) return [];

  const best = Math.min(...candidates.map((c) => c.penalty));
  const acceptable = candidates.filter((c) => c.penalty <= best + PENALTY_TOLERANCE);
  return randomItem(acceptable).assignments;
};

const syncAssignmentsWithOptions = (currentAssignments, hideOptionsByAnimal) => {
  return ANIMALS.map((animal) => {
    const options = hideOptionsByAnimal?.[animal.id] || [];
    const pool = options.length ? options : ANIMAL_HIDE_OPTIONS[animal.id] || [];
    const existing = (currentAssignments || []).find((item) => item?.animal?.id === animal.id);
    const matchedSpot = pool.find((option) => option?.id === existing?.spot?.id);
    const nextSpot = matchedSpot || existing?.spot || pool[0] || null;
    return nextSpot ? { animal, spot: nextSpot } : null;
  }).filter(Boolean);
};

const speakFallback = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
};

const playAudio = (src, fallbackText = '') => {
  if (!src) {
    speakFallback(fallbackText);
    return;
  }
  try {
    const audio = new Audio(src);
    audio.volume = 0.9;
    audio.onerror = () => speakFallback(fallbackText);
    audio.play().catch(() => speakFallback(fallbackText));
  } catch (e) {}
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// COMPONENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EyesPopUpGame = ({
  isActive = true,
  isAudioOn = true,
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const [debugMode, setDebugMode] = useState(() => {
    if (!SHOW_SPOT_DEBUG) return false; // never resurrect debug mode from storage in play builds
    try {
      return localStorage.getItem(DEBUG_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [editableHideOptions, setEditableHideOptions] = useState(() => {
    try {
      const raw = localStorage.getItem(SPOT_STORAGE_KEY);
      if (!raw) return cloneHideOptions(ANIMAL_HIDE_OPTIONS);
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object'
        ? cloneHideOptions({ ...ANIMAL_HIDE_OPTIONS, ...parsed })
        : cloneHideOptions(ANIMAL_HIDE_OPTIONS);
    } catch {
      return cloneHideOptions(ANIMAL_HIDE_OPTIONS);
    }
  });
  const [editableAnimalPositions, setEditableAnimalPositions] = useState(() => {
    try {
      const raw = localStorage.getItem(ANIMAL_POSITION_STORAGE_KEY);
      if (!raw) return ANIMAL_POSITIONS;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? { ...ANIMAL_POSITIONS, ...parsed } : ANIMAL_POSITIONS;
    } catch {
      return ANIMAL_POSITIONS;
    }
  });
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [selectedAnimalId, setSelectedAnimalId] = useState(() => ANIMALS[0]?.id || null);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [assignments, setAssignments] = useState(() => assignAnimalsToSpots(ANIMAL_HIDE_OPTIONS));
  const [discovered, setDiscovered] = useState(new Set());
  const [visibleAnimal, setVisibleAnimal] = useState(null); // id of animal currently popping up
  const [showIdleHint, setShowIdleHint] = useState(null);   // id to glow
  const [showZoneHint, setShowZoneHint] = useState(null);   // zone key to glow
  const [showFullReveal, setShowFullReveal] = useState(null); // id to fully reveal
  const [introShown, setIntroShown] = useState(false);

  const cycleTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastTapTimeRef = useRef(Date.now());
  const hintedTargetRef = useRef(null);
  const dragTargetRef = useRef(null);
  const activeAudioRef = useRef(null);
  const shimmerTimerRef = useRef(null);
  const activeHideOptions = editableHideOptions[selectedAnimalId] || [];
  const selectedHideOption = activeHideOptions[selectedOptionIndex] || null;
  const exportPayload = JSON.stringify({
    hideOptions: editableHideOptions,
    animalPositions: editableAnimalPositions
  }, null, 2);

  const stopGameAudio = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {}
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const playGameAudio = useCallback((src, fallbackText = '') => {
    if (!isAudioOn) return null;
    stopGameAudio();
    const nextAudio = playAudio(src, fallbackText) || null;
    activeAudioRef.current = nextAudio;
    return nextAudio;
  }, [isAudioOn, stopGameAudio]);

  // Intro VO once on mount
  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playGameAudio(VO_PATHS.intro, VO_TEXTS.intro);
  }, [isActive, introShown, playGameAudio]);

  // Each active session should get a fresh randomized assignment set.
  useEffect(() => {
    if (!isActive) return;
    setAssignments(assignAnimalsToSpots(editableHideOptions));
    setDiscovered(new Set());
    setVisibleAnimal(null);
    setShowIdleHint(null);
    setShowZoneHint(null);
    setShowFullReveal(null);
    hintedTargetRef.current = null;
    lastTapTimeRef.current = Date.now();
  }, [isActive, editableHideOptions]);

  // Pop cycle: pick an undiscovered animal, show it, hide it, repeat
  useEffect(() => {
    if (!isActive) return;
    if (discovered.size >= 4) return;

    let stopped = false;

    const cycle = () => {
      if (stopped) return;
      const undiscovered = assignments.filter(a => !discovered.has(a.animal.id));
      if (undiscovered.length === 0) return;

      const next = undiscovered[Math.floor(Math.random() * undiscovered.length)];
      setVisibleAnimal(next.animal.id);

      cycleTimerRef.current = setTimeout(() => {
        if (stopped) return;
        setVisibleAnimal(null);
        cycleTimerRef.current = setTimeout(cycle, POP_HIDDEN_MS);
      }, POP_VISIBLE_MS);
    };

    cycleTimerRef.current = setTimeout(cycle, 800); // small initial delay

    return () => {
      stopped = true;
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [isActive, assignments, discovered]);

  // Idle hint: if no tap for 8s, glow one undiscovered animal
  useEffect(() => {
    if (!isActive || discovered.size >= 4) return;

    const checkIdle = () => {
      const idleMs = Date.now() - lastTapTimeRef.current;
      const undiscovered = assignments.filter(a => !discovered.has(a.animal.id));
      if (undiscovered.length > 0) {
        if (!hintedTargetRef.current || discovered.has(hintedTargetRef.current.animal.id)) {
          hintedTargetRef.current = randomItem(undiscovered) || undiscovered[0];
        }
        const hintedTarget = hintedTargetRef.current;
        if (idleMs >= IDLE_FULL_REVEAL_MS) {
          setShowFullReveal(hintedTarget?.animal?.id || null);
          setShowZoneHint(null);
          setShowIdleHint(null);
        } else if (idleMs >= IDLE_ZONE_HINT_MS) {
          setShowZoneHint(hintedTarget?.spot?.zone || null);
          setShowFullReveal(null);
          setShowIdleHint(null);
        } else if (idleMs >= IDLE_HINT_MS) {
          setShowIdleHint(hintedTarget?.animal?.id || null);
          setShowZoneHint(null);
          setShowFullReveal(null);
        }
      }
    };
    idleTimerRef.current = setInterval(checkIdle, 1000);

    return () => {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [isActive, assignments, discovered]);

  // Reset idle hint when game state changes
  useEffect(() => {
    setShowIdleHint(null);
    setShowZoneHint(null);
    setShowFullReveal(null);
    hintedTargetRef.current = null;
  }, [visibleAnimal, discovered]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      lastTapTimeRef.current = Date.now();
      hintedTargetRef.current = null;
      setShowIdleHint(null);
      setShowZoneHint(null);
      setShowFullReveal(null);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Win condition
  useEffect(() => {
    if (discovered.size === 4 && onGameComplete) {
      const completionTimer = setTimeout(() => {
        // Report the fixed resting spot each animal snapped to on discovery
        // (see the render below) — not the random hide spot it came from —
        // so downstream scenes (Ears) that read this via sceneState.animalSpots
        // show the same hand-placed positions instead of wherever it happened
        // to be hiding this session.
        const assignedSpots = assignments.reduce((acc, item) => {
          const fixedPos = editableAnimalPositions[item.animal.id] || ANIMAL_POSITIONS[item.animal.id];
          acc[item.animal.id] = {
            x: fixedPos.x,
            y: fixedPos.y,
            depth: fixedPos.depth || 'between-middle-front'
          };
          return acc;
        }, {});
        onGameComplete({
          discoveredAnimals: Array.from(discovered),
          totalDiscovered: 4,
          assignedSpots
        });
      }, 1200);
      return () => clearTimeout(completionTimer);
    }
  }, [discovered, onGameComplete, assignments, editableAnimalPositions]);

  const handleAnimalTap = useCallback((animalId, e) => {
    e?.stopPropagation();
    if (discovered.has(animalId)) return;
    // ðŸŽ¯ NEW FLOW: any animal is tappable anytime â€” no gating on visibility
    // Pop cycle remains as a gentle "peekaboo" hint, not a gate

    lastTapTimeRef.current = Date.now();
    setShowIdleHint(null);
    setShowZoneHint(null);
    setShowFullReveal(null);

    // play that animal's name VO
    const found = assignments.find(a => a.animal.id === animalId);
    if (found) playGameAudio(found.animal.vo, VO_TEXTS[found.animal.id]);

    setDiscovered(prev => new Set([...prev, animalId]));
  }, [assignments, discovered, playGameAudio]);

  const handleSceneTap = useCallback((e) => {
    // wrong-tap shimmer where they tapped
    lastTapTimeRef.current = Date.now();
    setShowIdleHint(null);
    setShowZoneHint(null);
    setShowFullReveal(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shimmer = document.createElement('div');
    shimmer.className = 'eyes-popup-shimmer';
    shimmer.style.left = `${x}px`;
    shimmer.style.top = `${y}px`;
    e.currentTarget.appendChild(shimmer);
    if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
    shimmerTimerRef.current = setTimeout(() => {
      shimmer.remove();
      shimmerTimerRef.current = null;
    }, 600);
  }, []);

  useEffect(() => {
    if (!SHOW_SPOT_DEBUG) return;
    try {
      localStorage.setItem(DEBUG_MODE_STORAGE_KEY, String(debugMode));
      localStorage.setItem(SPOT_STORAGE_KEY, JSON.stringify(editableHideOptions));
      localStorage.setItem(ANIMAL_POSITION_STORAGE_KEY, JSON.stringify(editableAnimalPositions));
    } catch {
      // no-op
    }
  }, [debugMode, editableHideOptions, editableAnimalPositions]);

  useEffect(() => {
    if (!isActive) return;

    if (debugMode) {
      setAssignments((prev) => syncAssignmentsWithOptions(prev, editableHideOptions));
      return;
    }

    setAssignments(assignAnimalsToSpots(editableHideOptions));
    setDiscovered(new Set());
    setVisibleAnimal(null);
    setShowIdleHint(null);
    setShowZoneHint(null);
    setShowFullReveal(null);
    hintedTargetRef.current = null;
    lastTapTimeRef.current = Date.now();
  }, [isActive, editableHideOptions, debugMode]);

  useEffect(() => {
    const optionCount = activeHideOptions.length;
    if (optionCount === 0) {
      setSelectedOptionIndex(0);
      return;
    }
    if (selectedOptionIndex >= optionCount) {
      setSelectedOptionIndex(optionCount - 1);
    }
  }, [activeHideOptions, selectedOptionIndex]);

  useEffect(() => {
    if (!debugMode || !selectedAnimalId || !selectedHideOption) return;

    setAssignments((prev) => prev.map((item) => {
      if (item?.animal?.id !== selectedAnimalId) return item;
      return {
        ...item,
        spot: selectedHideOption
      };
    }));
  }, [debugMode, selectedAnimalId, selectedHideOption]);

  useEffect(() => () => {
    stopGameAudio();
    if (shimmerTimerRef.current) clearTimeout(shimmerTimerRef.current);
  }, [stopGameAudio]);

  if (hideElements || !isActive) return null;

  return (
    <div
      className={`eyes-popup-game ${className}`}
      onClick={handleSceneTap}
      onPointerMove={(e) => {
        const dragTarget = dragTargetRef.current;
        if (!dragTarget) return;
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.min(99.5, Math.max(0.5, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.min(99.5, Math.max(0.5, ((e.clientY - rect.top) / rect.height) * 100));
        if (dragTarget.type === 'spot' && dragTarget.animalId) {
          setEditableHideOptions((prev) => ({
            ...prev,
            [dragTarget.animalId]: (prev[dragTarget.animalId] || []).map((spot, index) =>
              index === dragTarget.optionIndex
                ? { ...spot, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
                : spot
            )
          }));
        } else if (dragTarget.type === 'assigned-spot' && dragTarget.animalId && dragTarget.spotId) {
          const nextX = Number(x.toFixed(2));
          const nextY = Number(y.toFixed(2));

          setAssignments((prev) => prev.map((item) => {
            if (item?.animal?.id !== dragTarget.animalId || item?.spot?.id !== dragTarget.spotId) {
              return item;
            }
            return {
              ...item,
              spot: {
                ...item.spot,
                x: nextX,
                y: nextY
              }
            };
          }));

          setEditableHideOptions((prev) => ({
            ...prev,
            [dragTarget.animalId]: (prev[dragTarget.animalId] || []).map((spot) =>
              spot?.id === dragTarget.spotId
                ? { ...spot, x: nextX, y: nextY }
                : spot
            )
          }));
        } else if (dragTarget.type === 'animal' && dragTarget.id) {
          setEditableAnimalPositions((prev) => ({
            ...prev,
            [dragTarget.id]: {
              x: Number(x.toFixed(2)),
              y: Number(y.toFixed(2))
            }
          }));
        }
      }}
      onPointerUp={() => {
        dragTargetRef.current = null;
      }}
      onPointerLeave={() => {
        dragTargetRef.current = null;
      }}
    >
      <img className="eyes-popup-layer eyes-popup-layer-back" src={bgBackImg} alt="" />
      <img className="eyes-popup-layer eyes-popup-layer-back-rocks" src={backRocksImg} alt="" />
      <img className="eyes-popup-layer eyes-popup-layer-middle" src={middleRocksImg} alt="" />
      {showZoneHint && ZONES[showZoneHint] && (
        <div
          className="eyes-popup-zone-hint"
          style={{
            left: `${ZONES[showZoneHint].x}%`,
            top: `${ZONES[showZoneHint].y}%`,
            width: `${ZONES[showZoneHint].w}%`,
            height: `${ZONES[showZoneHint].h}%`
          }}
        />
      )}

      {SHOW_SPOT_DEBUG && (
        <div className="eyes-edit-bar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`eyes-edit-toggle ${debugMode ? 'on' : ''}`}
            onClick={() => setDebugMode((prev) => !prev)}
          >
            {debugMode ? 'Editing' : 'Play'}
          </button>
          {debugMode && (
            <>
              {ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  className={`eyes-edit-animal-btn ${selectedAnimalId === animal.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAnimalId(animal.id);
                    setSelectedOptionIndex(0);
                  }}
                >
                  {animal.name}
                </button>
              ))}
              {activeHideOptions.map((spot, index) => (
                <button
                  key={`eyes-option-${spot.id}`}
                  type="button"
                  className={`eyes-edit-option-btn ${selectedOptionIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedOptionIndex(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                className="eyes-edit-export-btn"
                onClick={() => setShowExportPanel((prev) => !prev)}
              >
                {showExportPanel ? 'Hide Data' : 'Export'}
              </button>
              <button
                type="button"
                className="eyes-edit-save-btn"
                onClick={() => {
                  try {
                    localStorage.setItem(DEBUG_MODE_STORAGE_KEY, String(debugMode));
                    localStorage.setItem(SPOT_STORAGE_KEY, JSON.stringify(editableHideOptions));
                    localStorage.setItem(ANIMAL_POSITION_STORAGE_KEY, JSON.stringify(editableAnimalPositions));
                  } catch {
                    // no-op
                  }
                }}
              >
                Save
              </button>
            </>
          )}
        </div>
      )}

      {SHOW_SPOT_DEBUG && debugMode && showExportPanel && (
        <div className="eyes-export-panel" onClick={(e) => e.stopPropagation()}>
          <div className="eyes-export-header">
            <strong>Saved Eyes Data</strong>
            <button
              type="button"
              className="eyes-export-copy-btn"
              onClick={() => {
                navigator.clipboard?.writeText(exportPayload).catch(() => {});
              }}
            >
              Copy
            </button>
          </div>
          <pre>{exportPayload}</pre>
        </div>
      )}

      {SHOW_SPOT_DEBUG && debugMode && activeHideOptions.map((spot, index) => (
        <div
          key={spot.id}
          className="eyes-popup-debug-spot"
          style={{
            position: 'absolute',
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div
            className={`eyes-popup-debug-dot ${selectedOptionIndex === index ? 'is-selected' : ''}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedOptionIndex(index);
              dragTargetRef.current = {
                type: 'spot',
                animalId: selectedAnimalId,
                optionIndex: index
              };
              if (typeof e.currentTarget.setPointerCapture === 'function') {
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              dragTargetRef.current = null;
            }}
            onPointerCancel={() => {
              dragTargetRef.current = null;
            }}
          >
            {index + 1}
          </div>
          <button
            type="button"
            className={`eyes-popup-debug-depth ${selectedOptionIndex === index ? 'is-selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setEditableHideOptions((prev) => ({
                ...prev,
                [selectedAnimalId]: (prev[selectedAnimalId] || []).map((spotItem, optionIndex) => {
                  if (optionIndex !== index) return spotItem;
                  const currentIndex = DEBUG_DEPTHS.indexOf(spotItem.depth || 'behind-middle');
                  const nextDepth = DEBUG_DEPTHS[(currentIndex + 1) % DEBUG_DEPTHS.length];
                  return { ...spotItem, depth: nextDepth };
                })
              }));
            }}
          >
            {(spot.depth || 'behind-middle').replaceAll('-', ' ')}
          </button>
        </div>
      ))}

      {SHOW_SPOT_DEBUG && debugMode && (() => {
        const animal = ANIMALS.find((item) => item.id === selectedAnimalId);
        if (!animal) return null;
        const pos = editableAnimalPositions[animal.id] || ANIMAL_POSITIONS[animal.id];
        const scale = ANIMAL_SIZES[animal.id] || 1;
        return (
          <div
            className="eyes-popup-debug-animal is-selected"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              '--animal-scale': scale
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              dragTargetRef.current = { type: 'animal', id: animal.id };
              if (typeof e.currentTarget.setPointerCapture === 'function') {
                e.currentTarget.setPointerCapture(e.pointerId);
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              dragTargetRef.current = null;
            }}
            onPointerCancel={() => {
              dragTargetRef.current = null;
            }}
          >
            <img src={animal.img} alt={animal.name} draggable={false} />
            <span>{animal.name} ({Math.round(pos.x)}, {Math.round(pos.y)})</span>
          </div>
        );
      })()}

      {SHOW_SPOT_DEBUG && debugMode && assignments.map(({ animal, spot }) => (
        <div
          key={`assigned-spot-${animal.id}`}
          className="eyes-popup-assignment-dot"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            '--assignment-color': DEBUG_ASSIGNMENT_COLORS[animal.id] || '#ffffff'
          }}
          title={`${animal.name} (${Math.round(spot.x)}, ${Math.round(spot.y)})`}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragTargetRef.current = {
              type: 'assigned-spot',
              animalId: animal.id,
              spotId: spot.id
            };
            if (typeof e.currentTarget.setPointerCapture === 'function') {
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            dragTargetRef.current = null;
          }}
          onPointerCancel={() => {
            dragTargetRef.current = null;
          }}
        >
          <span>{animal.name} ({Math.round(spot.x)}, {Math.round(spot.y)})</span>
        </div>
      ))}

      {/* Hidden animals */}
      {assignments.map(({ animal, spot }) => {
        const isDiscovered = discovered.has(animal.id);
        const isVisible = visibleAnimal === animal.id;
        const isHinting = showIdleHint === animal.id;
        // Hide spots are randomized per session, but once found the animal snaps
        // to its fixed, hand-placed resting spot (shared with animalPositions.js)
        // instead of staying wherever it happened to be hiding — a random hide
        // spot can put it on top of a bush/rock that looks wrong once revealed.
        const fixedPos = editableAnimalPositions[animal.id] || ANIMAL_POSITIONS[animal.id];
        const finalX = isDiscovered ? fixedPos.x : spot.x;
        const finalY = isDiscovered ? fixedPos.y : spot.y;
        const scale = isDiscovered ? (ANIMAL_SIZES[animal.id] || 1) : (spot.scale || ANIMAL_SIZES[animal.id] || 1);

        const opacity = (isDiscovered || showFullReveal === animal.id || showIdleHint === animal.id)
          ? SHOW_OPACITY
          : isVisible
            ? POP_OPACITY
            : FADE_IN_OPACITY;

        return (
          <div
            key={animal.id}
            className={`eyes-popup-animal depth-${isDiscovered ? 'front-show' : (spot.depth || 'between-middle-front')} ${isDiscovered ? 'discovered' : ''} ${isVisible ? 'popped' : ''} ${isHinting ? 'hinting' : ''}`}
            style={{
              left: `${finalX}%`,
              top: `${finalY}%`,
              opacity,
              '--animal-scale': scale
            }}
            onClick={(e) => handleAnimalTap(animal.id, e)}
          >
            <img
              src={animal.img}
              alt={animal.name}
              draggable={false}
            />
            {isDiscovered && <div className="eyes-popup-sparkle" />}
          </div>
        );
      })}

      <img className="eyes-popup-layer eyes-popup-layer-front" src={frontRocksImg} alt="" />

      {/* Progress tray and counter intentionally removed per new flow */}
    </div>
  );
};

export default EyesPopUpGame;
