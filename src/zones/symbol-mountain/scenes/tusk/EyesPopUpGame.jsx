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
import bgBackImg from './assets/images/symbolmtn_bg-back.png';
import backRocksImg from './assets/images/symbolmtn_back-rocks.png';
import middleRocksImg from './assets/images/symbolmtn_middle-rocks.png';
import frontRocksImg from './assets/images/symbolmtn_front-rocks.png';
import { ANIMAL_SIZES } from './animalConfig';

// VO (add files as you get them â€” game will silently skip missing audio)
const VO_PATHS = {
  peacock: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-peacock.webm',
  monkey: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-monkey.webm',
  elephant: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-elephant.webm',
  cow: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-cow.webm',
  intro: '/src/zones/symbol-mountain/scenes/tusk/assets/audio/vo-eyes-intro.webm'
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

// 8 hide-spots on the scene (x%, y% from top-left of game container)
// y-position determines which animals can hide here:
//   low spots (y > 55%) = ground animals (cow, monkey, elephant)
//   high spots (y < 60%) = flying / bird (peacock OK anywhere)
//   peacock works in any spot
const HIDE_SPOTS = [
  // LEFT mountain â€” behind front rock
  { id: 'spot1', x: 14, y: 50, zone: 'left-mountain', depth: 'behind-middle', revealOffsetX: 8, revealOffsetY: 5, allowed: ['peacock', 'monkey'] },
  { id: 'spot2', x: 8,  y: 72, zone: 'left-mountain', depth: 'behind-front', revealOffsetX: 10, revealOffsetY: 0, allowed: ['peacock', 'monkey', 'elephant', 'cow'] },

  // LEFT bush cluster (middle-left)
  { id: 'spot3', x: 30, y: 70, zone: 'left-bushes', depth: 'between-middle-front', revealOffsetX: 4, revealOffsetY: 4, allowed: ['peacock', 'monkey', 'cow'] },
  { id: 'spot4', x: 35, y: 78, zone: 'left-bushes', depth: 'between-middle-front', revealOffsetX: 5, revealOffsetY: 2, allowed: ['peacock', 'monkey', 'elephant', 'cow'] },

  // RIGHT bush cluster (middle-right)
  { id: 'spot5', x: 65, y: 70, zone: 'right-bushes', depth: 'between-middle-front', revealOffsetX: -4, revealOffsetY: 4, allowed: ['peacock', 'monkey', 'cow'] },
  { id: 'spot6', x: 70, y: 78, zone: 'right-bushes', depth: 'between-middle-front', revealOffsetX: -5, revealOffsetY: 2, allowed: ['peacock', 'monkey', 'elephant', 'cow'] },

  // RIGHT mountain â€” behind front rock
  { id: 'spot7', x: 90, y: 72, zone: 'right-mountain', depth: 'behind-front', revealOffsetX: -10, revealOffsetY: 0, allowed: ['peacock', 'monkey', 'elephant', 'cow'] },
  { id: 'spot8', x: 84, y: 50, zone: 'right-mountain', depth: 'behind-front', revealOffsetX: -8, revealOffsetY: 5, allowed: ['peacock', 'monkey'] }
];
const ZONES = {
  'left-mountain': { x: 12, y: 60, w: 18, h: 30 },
  'left-bushes': { x: 32, y: 75, w: 15, h: 20 },
  'right-bushes': { x: 68, y: 75, w: 15, h: 20 },
  'right-mountain': { x: 88, y: 60, w: 18, h: 30 }
};
const FADE_IN_OPACITY = 0.35;    // hidden-state opacity â€” visible silhouette, partial hiding behind rocks does the rest
const POP_OPACITY = 1.0;          // pre-click pop opacity
const SHOW_OPACITY = 1.0;         // after discovery
const POP_VISIBLE_MS = 2600;       // calmer window â€” noticing, not panic
const POP_HIDDEN_MS = 900;         // gentle cooldown
const IDLE_HINT_MS = 8000;         // glow an undiscovered animal after 8s
const IDLE_ZONE_HINT_MS = 16000;   // glow hint zone after longer idle
const IDLE_FULL_REVEAL_MS = 24000; // full reveal after long idle
const SHOW_SPOT_DEBUG = false;     // set true only when tuning spot coordinates
const SPOT_STORAGE_KEY = 'symbol_mountain_eyes_hide_spots_v1';
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

// Randomly assign 4 animals to 4 of 8 spots (respecting allowed list)
const getEffectiveSpots = (spotsSource) => {
  // Force cow + elephant to ground spots: bottom 4 by y-value (largest y).
  const bottom4Ids = [...spotsSource]
    .sort((a, b) => b.y - a.y)
    .slice(0, 4)
    .map((s) => s.id);

  return spotsSource.map((spot) => {
    // Depth override for gameplay:
    // - spot2 and spot4 should sit between middle and front
    // - all other spots stay between back and middle
    const normalizedDepth = (spot.id === 'spot2' || spot.id === 'spot4')
      ? 'between-middle-front'
      : 'behind-middle';
    const baseAllowed = spot.allowed || [];
    const nextAllowed = baseAllowed.filter((id) => {
      if (id === 'cow' || id === 'elephant') return bottom4Ids.includes(spot.id);
      // Keep monkey out of overly hidden mountain-edge spots.
      if (id === 'monkey') return ['spot2', 'spot4', 'spot6', 'spot7'].includes(spot.id);
      return true;
    });
    return { ...spot, depth: normalizedDepth, allowed: nextAllowed };
  });
};

const assignAnimalsToSpots = (spotsSource) => {
  const animals = shuffle(ANIMALS);
  const spots = shuffle(getEffectiveSpots(spotsSource));
  const assignments = [];
  const usedSpots = new Set();

  for (const animal of animals) {
    const spot = spots.find(s => !usedSpots.has(s.id) && s.allowed.includes(animal.id));
    if (spot) {
      assignments.push({ animal, spot });
      usedSpots.add(spot.id);
    }
  }
  return assignments;
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
  onGameComplete,
  hideElements = false,
  className = ''
}) => {
  const [editableSpots, setEditableSpots] = useState(() => {
    try {
      const raw = localStorage.getItem(SPOT_STORAGE_KEY);
      if (!raw) return HIDE_SPOTS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : HIDE_SPOTS;
    } catch {
      return HIDE_SPOTS;
    }
  });
  const [assignments, setAssignments] = useState(() => assignAnimalsToSpots(HIDE_SPOTS));
  const [discovered, setDiscovered] = useState(new Set());
  const [visibleAnimal, setVisibleAnimal] = useState(null); // id of animal currently popping up
  const [showIdleHint, setShowIdleHint] = useState(null);   // id to glow
  const [showZoneHint, setShowZoneHint] = useState(null);   // zone key to glow
  const [showFullReveal, setShowFullReveal] = useState(null); // id to fully reveal
  const [introShown, setIntroShown] = useState(false);

  const cycleTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastTapTimeRef = useRef(Date.now());
  const dragSpotIdRef = useRef(null);

  // Intro VO once on mount
  useEffect(() => {
    if (!isActive || introShown) return;
    setIntroShown(true);
    playAudio(VO_PATHS.intro, VO_TEXTS.intro);
  }, [isActive, introShown]);

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
        if (idleMs >= IDLE_FULL_REVEAL_MS) {
          setShowFullReveal(undiscovered[0].animal.id);
          setShowZoneHint(null);
          setShowIdleHint(null);
        } else if (idleMs >= IDLE_ZONE_HINT_MS) {
          setShowZoneHint(undiscovered[0].spot.zone || null);
          setShowFullReveal(null);
          setShowIdleHint(null);
        } else if (idleMs >= IDLE_HINT_MS) {
          setShowIdleHint(undiscovered[0].animal.id);
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
  }, [visibleAnimal, discovered]);

  // Win condition
  useEffect(() => {
    if (discovered.size === 4 && onGameComplete) {
      const completionTimer = setTimeout(() => {
        const assignedSpots = assignments.reduce((acc, item) => {
          const revealOffsetX = item.spot.revealOffsetX || 0;
          const revealOffsetY = item.spot.revealOffsetY || 0;
          acc[item.animal.id] = {
            x: item.spot.x + revealOffsetX,
            y: item.spot.y + revealOffsetY,
            depth: item.spot.depth || 'between-middle-front'
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
  }, [discovered, onGameComplete, assignments]);

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
    if (found) playAudio(found.animal.vo, VO_TEXTS[found.animal.id]);

    setDiscovered(prev => new Set([...prev, animalId]));
  }, [discovered, visibleAnimal, assignments, showFullReveal]);

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
    setTimeout(() => shimmer.remove(), 600);
  }, []);

  useEffect(() => {
    if (!SHOW_SPOT_DEBUG) return;
    try {
      localStorage.setItem(SPOT_STORAGE_KEY, JSON.stringify(editableSpots));
    } catch {
      // no-op
    }
  }, [editableSpots]);

  useEffect(() => {
    if (!isActive) return;
    setAssignments(assignAnimalsToSpots(editableSpots));
    setDiscovered(new Set());
    setVisibleAnimal(null);
    setShowIdleHint(null);
    setShowZoneHint(null);
    setShowFullReveal(null);
    lastTapTimeRef.current = Date.now();
  }, [isActive, editableSpots]);

  if (hideElements || !isActive) return null;

  return (
    <div
      className={`eyes-popup-game ${className}`}
      onClick={handleSceneTap}
      onPointerMove={(e) => {
        if (!dragSpotIdRef.current) return;
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.min(99.5, Math.max(0.5, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.min(99.5, Math.max(0.5, ((e.clientY - rect.top) / rect.height) * 100));
        setEditableSpots((prev) =>
          prev.map((spot) =>
            spot.id === dragSpotIdRef.current
              ? { ...spot, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) }
              : spot
          )
        );
      }}
      onPointerUp={() => {
        dragSpotIdRef.current = null;
      }}
      onPointerLeave={() => {
        dragSpotIdRef.current = null;
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
        <div className="eyes-popup-debug-panel" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              const json = JSON.stringify(editableSpots, null, 2);
              navigator.clipboard?.writeText(json).catch(() => {});
            }}
          >
            Copy JSON
          </button>
          <button type="button" onClick={() => setEditableSpots(HIDE_SPOTS)}>
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(SPOT_STORAGE_KEY, JSON.stringify(editableSpots));
              } catch {
                // no-op
              }
            }}
          >
            Save
          </button>
        </div>
      )}

      {SHOW_SPOT_DEBUG && editableSpots.map((s, i) => (
        <div
          key={s.id}
          className="eyes-popup-debug-dot"
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,0,0,0.5)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99,
            fontWeight: 700
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragSpotIdRef.current = s.id;
            if (typeof e.currentTarget.setPointerCapture === 'function') {
              e.currentTarget.setPointerCapture(e.pointerId);
            }
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            dragSpotIdRef.current = null;
          }}
          onPointerCancel={() => {
            dragSpotIdRef.current = null;
          }}
        >
          {i + 1}
        </div>
      ))}

      {/* Hidden animals */}
      {assignments.map(({ animal, spot }) => {
        const isDiscovered = discovered.has(animal.id);
        const isVisible = visibleAnimal === animal.id;
        const isHinting = showIdleHint === animal.id;
        const finalX = isDiscovered ? (spot.x + (spot.revealOffsetX || 0)) : spot.x;
        const finalY = isDiscovered ? (spot.y + (spot.revealOffsetY || 0)) : spot.y;

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
              '--animal-scale': ANIMAL_SIZES[animal.id] || 1
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



