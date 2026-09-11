import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './TuskPathGame.css';

import bgImg from './assets/images/tusk-giving/symbol_mountain_3_bg.webp';

import bunnyTired from './assets/images/tusk-giving/bunny_01_tired.webp';
import bunnyHungry from './assets/images/tusk-giving/bunny_02_hungry.webp';
import bunnyDrink from './assets/images/tusk-giving/bunny_03_drinks_water.webp';
import bunnyGrass from './assets/images/tusk-giving/bunny_04_resting_on_grass.webp';
import bunnyFeather from './assets/images/tusk-giving/bunny_05_comforted_with_feather.webp';
import bunnyHappy from './assets/images/tusk-giving/bunny_06_happy_recovered.webp';

import monkeyHold from './assets/images/tusk-giving/tusk_monkey_holding_mango.webp';
import monkeyOffer from './assets/images/tusk-giving/tusk_monkey_offering_mango.webp';
import elephantWater from './assets/images/tusk-giving/tusk_elephant_with_water_in_trunk.webp';
import elephantPour from './assets/images/tusk-giving/tusk_elephant_pouring_water_into_bowl.webp';
import elephantIdleShared from './assets/images/elephant-new1.webp';
import cowGrass from './assets/images/tusk-giving/tusk_cow_idle_with_grass.webp';
import cowIdleShared from './assets/images/cow-new.webp';
import peacockIdle from './assets/images/tusk-giving/tusk_peacock_idle.webp';
import peacockHighlight from './assets/images/tusk-giving/tusk_peacock_highlighted_feather.webp';
import peacockOffer from './assets/images/tusk-giving/tusk_peacock_offering_feather.webp';

import mango from './assets/images/tusk-giving/mango_standalone.webp';
import mangoBitten from './assets/images/tusk-giving/mango_bitten.webp';
import grassBundle from './assets/images/tusk-giving/grass_bundle.webp';
import grassBed from './assets/images/tusk-giving/grass_bed_spread.webp';
import bowlEmpty from './assets/images/tusk-giving/bowl_empty.webp';
import bowlFilled from './assets/images/tusk-giving/bowl_filled.webp';
import waterPour from './assets/images/tusk-giving/water_pour_splash.webp';
import feather from './assets/images/tusk-giving/peacock_feather_standalone.webp';
import featherPlaced from './assets/images/tusk-giving/feather_placed_state.webp';

import needBubbleMangoImg from './assets/images/tusk-giving/need_bubble_hungry_mango.png';
import needBubbleWaterImg from './assets/images/tusk-giving/need_bubble_thirsty_water.png';
import needBubbleGrassImg from './assets/images/tusk-giving/need_bubble_soft_rest_grass.png';
import needBubbleFeatherImg from './assets/images/tusk-giving/need_bubble_comfort_feather.png';

const PHASES = {
  INTRO: 'intro',
  MANGO: 'mango',
  WATER: 'water',
  GRASS: 'grass',
  FEATHER: 'feather',
  COMPLETE: 'complete',
};

const VO = {
  intro: 'Someone on the mountain needs help.',
  mango: 'Monkey has something he really likes. Can he share it?',
  mangoHint: 'Bring the mango to the bunny.',
  mangoDone: 'That helped!',

  water: 'Elephant can help too. Drag water from his trunk to the bowl.',
  waterHint: 'Drag from the elephant to the bowl.',
  waterDone: 'Now the bunny is not thirsty.',

  grass: 'Cow has soft grass. Can it make a comfortable place to rest?',
  grassHint: 'Bring the grass to the resting spot.',
  grassDone: 'That feels much better.',

  feather: 'Peacock has a special feather. Can he give it for comfort?',
  featherHint: 'Bring the feather to the bunny.',
  featherDone: 'Everyone gave something they valued to help.',

  reveal: "Ganesha's tusk reminds us that sometimes we give something up for what matters.",
};

const PHASE_ORDER = [
  PHASES.INTRO,
  PHASES.MANGO,
  PHASES.WATER,
  PHASES.GRASS,
  PHASES.FEATHER,
  PHASES.COMPLETE,
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// Need bubbles are the one part of this scene positioned via the same
// x/y/w DEFAULT_LAYOUT + debug-panel pattern used in Eyes/Ears/Kurume Deva —
// everything else here still uses TuskPathGame.css fixed classes. Only one
// bubble shows at a time, per the asset pack's own rule.
const DEBUG_UI_ENABLED =
  typeof window !== 'undefined' &&
  (window.location.pathname.includes('game-test') ||
    new URLSearchParams(window.location.search).has('debugTusk'));
const LAYOUT_STORAGE_KEY = 'symbol_mountain_tusk_need_bubble_layout_v1';
const LAYOUT_PRESET_VERSION = '2026-09-10-tusk-need-bubbles-1';

const DEFAULT_LAYOUT = {
  needBubbleMango: { x: 31, y: 42, w: 12, z: 30 },
  needBubbleWater: { x: 84, y: 40, w: 12, z: 30 },
  needBubbleGrass: { x: 69, y: 42, w: 12, z: 30 },
  needBubbleFeather: { x: 16, y: 42, w: 12, z: 30 }
};

const DEBUG_KEYS = [
  { key: 'needBubbleMango', label: 'Need bubble - hungry/mango' },
  { key: 'needBubbleWater', label: 'Need bubble - thirsty/water' },
  { key: 'needBubbleGrass', label: 'Need bubble - soft rest/grass' },
  { key: 'needBubbleFeather', label: 'Need bubble - comfort/feather' }
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
  width: `${layoutItem.w}%`,
  zIndex: layoutItem.z
});

const speak = (text, enabled = true) => {
  if (!enabled || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.94;
    u.pitch = 1.02;
    window.speechSynthesis.speak(u);
  } catch {
    // Speech synthesis is optional.
  }
};

function TuskPathGame({
  isActive = true,
  isAudioOn = true,
  hideElements = false,
  showObstacleOnly = false,
  onGameComplete,
  className = '',
}) {
  const sceneRef = useRef(null);
  const hintTimer1 = useRef(null);
  const hintTimer2 = useRef(null);
  const hintTimer3 = useRef(null);
  const advanceTimer = useRef(null);

  const [phase, setPhase] = useState(PHASES.INTRO);
  const [hintLevel, setHintLevel] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [drag, setDrag] = useState(null);
  const [actionState, setActionState] = useState('idle');
  const [bunnyState, setBunnyState] = useState('tired');
  const [completed, setCompleted] = useState({
    mango: false,
    water: false,
    grass: false,
    feather: false,
  });

  const [layout, setLayout] = useState(loadSavedLayout);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('needBubbleMango');
  const debugDragRef = useRef(null);
  const selectedDebugLayout = layout[selectedDebugKey] || DEFAULT_LAYOUT[selectedDebugKey];

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
        [key]: { ...(current[key] || DEFAULT_LAYOUT[key]), ...patch }
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

  const getPointerPercent = useCallback((event) => {
    const rect = sceneRef.current?.getBoundingClientRect();
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
    debugDragRef.current = { key, offsetX: point.x - item.x, offsetY: point.y - item.y };
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

  const clearTimers = useCallback(() => {
    [hintTimer1.current, hintTimer2.current, hintTimer3.current, advanceTimer.current].forEach((t) => {
      if (t) clearTimeout(t);
    });
  }, []);

  const phaseVoice = useMemo(() => ({
    [PHASES.INTRO]: VO.intro,
    [PHASES.MANGO]: VO.mango,
    [PHASES.WATER]: VO.water,
    [PHASES.GRASS]: VO.grass,
    [PHASES.FEATHER]: VO.feather,
    [PHASES.COMPLETE]: VO.reveal,
  }), []);

  const hintVoice = useMemo(() => ({
    [PHASES.MANGO]: VO.mangoHint,
    [PHASES.WATER]: VO.waterHint,
    [PHASES.GRASS]: VO.grassHint,
    [PHASES.FEATHER]: VO.featherHint,
  }), []);

  const scheduleHints = useCallback((p) => {
    setHintLevel(0);
    clearTimers();

    if ([PHASES.INTRO, PHASES.COMPLETE].includes(p)) return;

    hintTimer1.current = setTimeout(() => setHintLevel(1), 10000);
    hintTimer2.current = setTimeout(() => {
      setHintLevel(2);
      speak(hintVoice[p], isAudioOn);
    }, 18000);
    hintTimer3.current = setTimeout(() => setHintLevel(3), 26000);
  }, [clearTimers, hintVoice, isAudioOn]);

  useEffect(() => {
    if (!isActive) return;
    speak(phaseVoice[phase], isAudioOn);
    scheduleHints(phase);

    if (phase === PHASES.INTRO) {
      advanceTimer.current = setTimeout(() => setPhase(PHASES.MANGO), 1700);
    }

    return clearTimers;
  }, [phase, isActive, isAudioOn, phaseVoice, scheduleHints, clearTimers]);

  useEffect(() => {
    if (!isActive && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isActive]);

  const nextPhase = useCallback((delay = 1000) => {
    const idx = PHASE_ORDER.indexOf(phase);
    const next = PHASE_ORDER[idx + 1];
    advanceTimer.current = setTimeout(() => {
      setActionState('idle');
      setSelectedItem(null);
      setDrag(null);
      setPhase(next);
    }, delay);
  }, [phase]);

  const completeMango = useCallback(() => {
    if (completed.mango || phase !== PHASES.MANGO) return;
    setActionState('success');
    setCompleted((s) => ({ ...s, mango: true }));
    setBunnyState('hungry');
    speak(VO.mangoDone, isAudioOn);

    advanceTimer.current = setTimeout(() => {
      setBunnyState('tired');
      nextPhase(250);
    }, 850);
  }, [completed.mango, phase, isAudioOn, nextPhase]);

  const completeWater = useCallback(() => {
    if (completed.water || phase !== PHASES.WATER) return;
    setActionState('pouring');

    advanceTimer.current = setTimeout(() => {
      setCompleted((s) => ({ ...s, water: true }));
      setBunnyState('drink');
      setActionState('success');
      speak(VO.waterDone, isAudioOn);

      advanceTimer.current = setTimeout(() => {
        setBunnyState('tired');
        nextPhase(250);
      }, 1100);
    }, 800);
  }, [completed.water, phase, isAudioOn, nextPhase]);

  const completeGrass = useCallback(() => {
    if (completed.grass || phase !== PHASES.GRASS) return;
    setCompleted((s) => ({ ...s, grass: true }));
    setActionState('success');
    setBunnyState('grass');
    speak(VO.grassDone, isAudioOn);

    advanceTimer.current = setTimeout(() => {
      nextPhase(250);
    }, 1200);
  }, [completed.grass, phase, isAudioOn, nextPhase]);

  const completeFeather = useCallback(() => {
    if (completed.feather || phase !== PHASES.FEATHER) return;
    setCompleted((s) => ({ ...s, feather: true }));
    setActionState('success');
    setBunnyState('feather');
    speak(VO.featherDone, isAudioOn);

    advanceTimer.current = setTimeout(() => {
      setBunnyState('happy');
      setPhase(PHASES.COMPLETE);
      onGameComplete?.();
    }, 1400);
  }, [completed.feather, phase, isAudioOn, onGameComplete]);

  const phaseTarget = {
    [PHASES.MANGO]: 'bunny',
    [PHASES.WATER]: 'bowl',
    [PHASES.GRASS]: 'grass-bed',
    [PHASES.FEATHER]: 'bunny',
  }[phase];

  const hitTest = useCallback((clientX, clientY, targetId) => {
    if (!sceneRef.current) return false;
    const el = sceneRef.current.querySelector(`[data-drop-target="${targetId}"]`);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }, []);

  const finishDrag = useCallback((clientX, clientY) => {
    if (!drag || !phaseTarget) return;
    const ok = hitTest(clientX, clientY, phaseTarget);
    setDrag(null);

    if (!ok) {
      setActionState('wrong');
      setTimeout(() => setActionState('idle'), 420);
      return;
    }

    if (phase === PHASES.MANGO) completeMango();
    if (phase === PHASES.WATER) completeWater();
    if (phase === PHASES.GRASS) completeGrass();
    if (phase === PHASES.FEATHER) completeFeather();
  }, [drag, phaseTarget, hitTest, phase, completeMango, completeWater, completeGrass, completeFeather]);

  const onPointerDown = (e, id) => {
    if (![PHASES.MANGO, PHASES.WATER, PHASES.GRASS, PHASES.FEATHER].includes(phase)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedItem(id);
    setDrag({
      id,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const onPointerMove = (e) => {
    if (!drag || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    setDrag((d) => d ? ({
      ...d,
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    }) : null);
  };

  const onPointerUp = (e) => {
    if (!drag) return;
    finishDrag(e.clientX, e.clientY);
  };

  const onTapTarget = (targetId) => {
    if (!selectedItem || targetId !== phaseTarget) return;
    if (phase === PHASES.MANGO) completeMango();
    if (phase === PHASES.WATER) completeWater();
    if (phase === PHASES.GRASS) completeGrass();
    if (phase === PHASES.FEATHER) completeFeather();
  };

  const bunnyImg = {
    tired: bunnyTired,
    hungry: bunnyHungry,
    drink: bunnyDrink,
    grass: bunnyGrass,
    feather: bunnyFeather,
    happy: bunnyHappy,
  }[bunnyState];

  const activeAnimal = {
    [PHASES.MANGO]: 'monkey',
    [PHASES.WATER]: 'elephant',
    [PHASES.GRASS]: 'cow',
    [PHASES.FEATHER]: 'peacock',
  }[phase];

  const hintClass = hintLevel > 0 ? `hint-${hintLevel}` : '';

  if (hideElements || (!isActive && !showObstacleOnly)) return null;

  return (
    <div
      ref={sceneRef}
      className={`tusk-giving-game ${hintClass} ${className}`}
      onPointerMove={(e) => { onPointerMove(e); handleDebugPointerMove(e); }}
      onPointerUp={(e) => { onPointerUp(e); stopDebugDrag(); }}
      onPointerCancel={() => { setDrag(null); stopDebugDrag(); }}
    >
      <img className="tusk-bg" src={bgImg} alt="" />

      {!hideElements && phase !== PHASES.COMPLETE && (
        <div className="tusk-instruction" aria-live="polite">
          {phase === PHASES.MANGO && 'Help Monkey share his mango.'}
          {phase === PHASES.WATER && 'Help Elephant give water.'}
          {phase === PHASES.GRASS && 'Help Cow make a soft resting place.'}
          {phase === PHASES.FEATHER && 'Help Peacock give his special feather.'}
        </div>
      )}

      {/* Only one need bubble at a time, per the asset pack's rule — shows
          for the current phase, disappears the moment that need is met
          (not waiting for the phase transition delay). */}
      {(() => {
        const needBubble = {
          [PHASES.MANGO]: { key: 'needBubbleMango', img: needBubbleMangoImg, met: completed.mango },
          [PHASES.WATER]: { key: 'needBubbleWater', img: needBubbleWaterImg, met: completed.water },
          [PHASES.GRASS]: { key: 'needBubbleGrass', img: needBubbleGrassImg, met: completed.grass },
          [PHASES.FEATHER]: { key: 'needBubbleFeather', img: needBubbleFeatherImg, met: completed.feather }
        }[phase];
        if (!needBubble || needBubble.met || actionState === 'success') return null;
        return (
          <img
            className={`tusk-need-bubble ${debugMode && selectedDebugKey === needBubble.key ? 'is-debug-selected' : ''}`}
            src={needBubble.img}
            alt=""
            draggable={false}
            style={{ position: 'absolute', transform: 'translate(-50%, -50%)', pointerEvents: debugMode ? 'auto' : 'none', ...styleFromLayout(layout[needBubble.key]) }}
            onPointerDown={(e) => startDebugDrag(e, needBubble.key)}
          />
        );
      })()}

      <div className={`animal peacock ${activeAnimal === 'peacock' ? 'active' : 'dimmed'}`}>
        <img
          src={
            phase === PHASES.FEATHER
              ? (actionState === 'success' ? peacockOffer : peacockHighlight)
              : peacockIdle
          }
          alt="Peacock"
        />
      </div>

      <div className={`animal monkey ${activeAnimal === 'monkey' ? 'active' : 'dimmed'}`}>
        <img
          src={phase === PHASES.MANGO && actionState === 'success' ? monkeyOffer : monkeyHold}
          alt="Monkey"
        />
      </div>

      <div className={`animal elephant ${activeAnimal === 'elephant' ? 'active' : 'dimmed'}`}>
        <img
          src={
            phase === PHASES.WATER && actionState === 'pouring'
              ? elephantPour
              : completed.water ? elephantIdleShared : elephantWater
          }
          alt="Elephant"
        />
      </div>

      {(phase === PHASES.WATER && !completed.water) && (
        <button
          type="button"
          className={`draggable-item water-item ${selectedItem === 'water' ? 'selected' : ''}`}
          onPointerDown={(e) => onPointerDown(e, 'water')}
          onClick={() => setSelectedItem('water')}
          aria-label="Water from the elephant's trunk. Drag it to the bowl, or tap it then tap the bowl."
        >
          <img src={waterPour} alt="" />
        </button>
      )}

      <div className={`animal cow ${activeAnimal === 'cow' ? 'active' : 'dimmed'}`}>
        <img
          src={completed.grass ? cowIdleShared : cowGrass}
          alt="Cow"
        />
      </div>

      <button
        type="button"
        data-drop-target="bunny"
        className={`bunny-zone ${phaseTarget === 'bunny' ? 'is-target' : ''}`}
        onClick={() => onTapTarget('bunny')}
        aria-label="Bunny traveller"
      >
        <img className="bunny" src={bunnyImg} alt="Bunny traveller" />
      </button>

      {(phase === PHASES.WATER || completed.water) && (
        <button
          type="button"
          data-drop-target="bowl"
          className={`water-zone ${phase === PHASES.WATER ? 'is-target' : ''}`}
          onClick={() => onTapTarget('bowl')}
          aria-label="Bowl"
        >
          <img
            className="bowl"
            src={completed.water || actionState === 'success' ? bowlFilled : bowlEmpty}
            alt=""
          />
          {actionState === 'pouring' && (
            <img className="water-pour" src={waterPour} alt="" />
          )}
        </button>
      )}

      {(phase === PHASES.GRASS || completed.grass) && (
        <button
          type="button"
          data-drop-target="grass-bed"
          className={`grass-bed-zone ${phase === PHASES.GRASS ? 'is-target' : ''}`}
          onClick={() => onTapTarget('grass-bed')}
          aria-label="Resting spot"
        >
          {completed.grass ? <img src={grassBed} alt="" /> : <span />}
        </button>
      )}

      {(phase === PHASES.MANGO && !completed.mango) && (
        <button
          type="button"
          className={`draggable-item mango-item ${selectedItem === 'mango' ? 'selected' : ''}`}
          onPointerDown={(e) => onPointerDown(e, 'mango')}
          onClick={() => setSelectedItem('mango')}
          aria-label="Mango. Drag it to the bunny, or tap it then tap the bunny."
        >
          <img src={mango} alt="" />
        </button>
      )}

      {completed.mango && phase === PHASES.MANGO && (
        <img className="result-prop mango-result" src={mangoBitten} alt="" />
      )}

      {(phase === PHASES.GRASS && !completed.grass) && (
        <button
          type="button"
          className={`draggable-item grass-item ${selectedItem === 'grass' ? 'selected' : ''}`}
          onPointerDown={(e) => onPointerDown(e, 'grass')}
          onClick={() => setSelectedItem('grass')}
          aria-label="Grass bundle. Drag it to the resting spot, or tap it then tap the spot."
        >
          <img src={grassBundle} alt="" />
        </button>
      )}

      {(phase === PHASES.FEATHER && !completed.feather) && (
        <button
          type="button"
          className={`draggable-item feather-item ${selectedItem === 'feather' ? 'selected' : ''}`}
          onPointerDown={(e) => onPointerDown(e, 'feather')}
          onClick={() => setSelectedItem('feather')}
          aria-label="Peacock feather. Drag it to the bunny, or tap it then tap the bunny."
        >
          <img src={feather} alt="" />
        </button>
      )}

      {completed.feather && (
        <img className="result-prop feather-result" src={featherPlaced} alt="" />
      )}

      {drag && (
        <div
          className="drag-ghost"
          style={{ left: `${drag.x}%`, top: `${drag.y}%` }}
          aria-hidden="true"
        >
          <img
            src={
              drag.id === 'mango'
                ? mango
                : drag.id === 'water'
                  ? waterPour
                  : drag.id === 'grass'
                    ? grassBundle
                    : feather
            }
            alt=""
          />
        </div>
      )}

      {hintLevel >= 3 && phase !== PHASES.COMPLETE && (
        <div className={`gesture-path gesture-${phase}`} aria-hidden="true">
          <span className="gesture-dot" />
        </div>
      )}

      {phase === PHASES.COMPLETE && (
        <div className="tusk-complete" role="status" aria-live="polite">
          <div className="complete-card">
            <div className="complete-kicker">Ganesha&apos;s Tusk</div>
            <div className="complete-title">Give something up for what matters.</div>
            <div className="complete-sub">I can give something up for what matters.</div>
          </div>
        </div>
      )}

      {DEBUG_UI_ENABLED && (
        <div className="tusk-debug-panel" style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 999, background: '#2d173b', color: '#fff', borderRadius: 10, padding: 8, fontSize: 12, maxWidth: 280 }}>
          <button type="button" onClick={() => setDebugMode((v) => !v)} style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: 0, background: '#6d42a8', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            {debugMode ? 'Hide Need-Bubble Debug' : 'Need-Bubble Layout Debug'}
          </button>
          {debugMode && (
            <div style={{ marginTop: 8 }}>
              <p style={{ margin: '0 0 6px', opacity: 0.85 }}>Drag a bubble on the scene, or tune it here.</p>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <span>Bubble</span>
                <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)} style={{ flex: 1 }}>
                  {DEBUG_KEYS.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </label>
              {['x', 'y', 'w'].map((field) => (
                <label key={field} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ width: 14 }}>{field.toUpperCase()}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.25"
                    value={selectedDebugLayout?.[field] ?? 0}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    value={selectedDebugLayout?.[field] ?? 0}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                    style={{ width: 48 }}
                  />
                </label>
              ))}
              <pre style={{ margin: '6px 0 0', fontSize: 10, whiteSpace: 'pre-wrap' }}>{JSON.stringify({ [selectedDebugKey]: selectedDebugLayout }, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TuskPathGame;
