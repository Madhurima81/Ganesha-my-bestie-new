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

const CLUE_TARGETS = [
  {
    id: 'feather',
    label: 'Feather',
    img: featherImg,
    x: 28,
    y: 58,
    w: 10,
    prompt: 'Feather found.'
  },
  {
    id: 'mango',
    label: 'Mango',
    img: mangoImg,
    x: 44,
    y: 70,
    w: 9,
    prompt: 'Mango found.'
  }
];

const CLUE_DISTRACTORS = [
  { id: 'butterfly', label: 'Butterfly', img: butterflyImg, x: 77, y: 58, w: 11 },
  { id: 'leaves', label: 'Leaves', img: leavesImg, x: 73, y: 82, w: 14 }
];

const ANIMAL_TARGETS = [
  {
    id: 'peacock',
    label: 'Peacock',
    frames: [peacockRestingImg, peacockAdmiringImg, peacockSparkleImg, peacockHighlightImg],
    x: 28,
    y: 56,
    finalX: 69.21,
    finalY: 68.92,
    w: 26,
    prompt: 'Peacock found.'
  },
  {
    id: 'monkey',
    label: 'Monkey',
    frames: [monkeyRestingImg, monkeyLookingImg, monkeyPicksImg, monkeySmilesImg, monkeyHoldingImg],
    x: 45,
    y: 64,
    finalX: 10.07,
    finalY: 18.11,
    w: 15,
    prompt: 'Monkey found.'
  }
];

const ANIMAL_DISTRACTORS = [
  { id: 'bird-shadow', label: 'Bird', img: butterflyImg, x: 77, y: 47, w: 8 },
  { id: 'leaf-rustle', label: 'Leaves', img: leavesImg, x: 73, y: 78, w: 13 }
];

const HIDING_PROPS = [
  { id: 'bush-left', img: bushImg, x: 28, y: 61, w: 22, z: 18 },
  { id: 'rock-left', img: rockImg, x: 43, y: 76, w: 20, z: 20 },
  { id: 'bush-right', img: bushImg, x: 78, y: 63, w: 19, z: 18 }
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

  const idleTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const completionTimerRef = useRef(null);
  const frameTimerRef = useRef(null);
  const lastTapTimeRef = useRef(Date.now());
  const completedRef = useRef(false);

  const foundClueIds = useMemo(() => new Set(foundClues), [foundClues]);
  const foundAnimalIds = useMemo(() => new Set(foundAnimals), [foundAnimals]);
  const activeTargets = flow === FLOW.CLUES ? CLUE_TARGETS : ANIMAL_TARGETS;
  const activeFoundIds = flow === FLOW.CLUES ? foundClueIds : foundAnimalIds;
  const progressFound = activeTargets.filter((target) => activeFoundIds.has(target.id)).length;

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
        const fixedPos = ANIMAL_POSITIONS[animal.id] || { x: animal.finalX, y: animal.finalY };
        acc[animal.id] = {
          x: fixedPos.x ?? animal.finalX,
          y: fixedPos.y ?? animal.finalY,
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
  }, [foundAnimals, foundClues, onGameComplete, speak]);

  const handleSceneTap = useCallback((e) => {
    if (flow === FLOW.COMPLETE) return;
    resetIdle();

    const rect = e.currentTarget.getBoundingClientRect();
    const shimmer = document.createElement('div');
    shimmer.className = 'eyes-popup-shimmer';
    shimmer.style.left = `${e.clientX - rect.left}px`;
    shimmer.style.top = `${e.clientY - rect.top}px`;
    e.currentTarget.appendChild(shimmer);
    setTimeout(() => shimmer.remove(), 650);
  }, [flow, resetIdle]);

  const handleDistractorTap = useCallback((target, e) => {
    e.stopPropagation();
    if (flow === FLOW.COMPLETE) return;
    resetIdle();
    showFeedback(VO_TEXTS.neutral, target.id);
    speak(VO_TEXTS.neutral);
  }, [flow, resetIdle, showFeedback, speak]);

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
    if (flow !== FLOW.CLUES || foundClueIds.has(target.id)) return;
    resetIdle();
    setFoundClues((prev) => [...prev, target.id]);
    showFeedback(target.prompt, target.id);
    speak(VO_TEXTS[target.id] || target.label);
  }, [flow, foundClueIds, resetIdle, showFeedback, speak]);

  const handleAnimalTap = useCallback((target, e) => {
    e.stopPropagation();
    if (flow !== FLOW.ANIMALS || foundAnimalIds.has(target.id)) return;
    resetIdle();
    setFoundAnimals((prev) => [...prev, target.id]);
    showFeedback(target.prompt, target.id);
    speak(VO_TEXTS[target.id] || target.label);
    startAnimalReveal(target.id);
  }, [flow, foundAnimalIds, resetIdle, showFeedback, speak, startAnimalReveal]);

  if (hideElements || !isActive) return null;

  return (
    <div className={`eyes-popup-game ${className}`} onClick={handleSceneTap}>
      <img className="eyes-game-bg" src={bgImg} alt="" draggable={false} />

      <div className="eyes-game-prompt">
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
            className={`eyes-hidden-target clue-target ${isFound ? 'found' : ''} ${hintId === target.id ? 'hinting' : ''} ${softPulse === target.id ? 'soft-pulse' : ''}`}
            style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${target.w}%` }}
            onClick={(e) => handleClueTap(target, e)}
            aria-label={`Find ${target.label}`}
            disabled={!isVisible || isFound}
          >
            <img src={target.img} alt="" draggable={false} />
          </button>
        );
      })}

      {flow === FLOW.CLUES && CLUE_DISTRACTORS.map((target) => (
        <button
          key={target.id}
          type="button"
          className={`eyes-hidden-target distractor-target ${softPulse === target.id ? 'soft-pulse' : ''}`}
          style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${target.w}%` }}
          onClick={(e) => handleDistractorTap(target, e)}
          aria-label={target.label}
        >
          <img src={target.img} alt="" draggable={false} />
        </button>
      ))}

      {flow !== FLOW.CLUES && ANIMAL_TARGETS.map((target) => {
        const isFound = foundAnimalIds.has(target.id);
        const frameIndex = frameIndexByAnimal[target.id] || 0;
        const frame = isFound
          ? target.frames[frameIndex] || target.frames[target.frames.length - 1]
          : target.frames[0];
        return (
          <button
            key={target.id}
            type="button"
            className={`eyes-hidden-target animal-target ${isFound ? 'found' : ''} ${revealingAnimal === target.id ? 'revealing' : ''} ${hintId === target.id ? 'hinting' : ''}`}
            style={{
              left: `${isFound ? target.finalX : target.x}%`,
              top: `${isFound ? target.finalY : target.y}%`,
              width: `${target.w}%`
            }}
            onClick={(e) => handleAnimalTap(target, e)}
            aria-label={`Find ${target.label}`}
            disabled={isFound}
          >
            <img src={frame} alt="" draggable={false} />
            {isFound && <span className="eyes-popup-sparkle" />}
          </button>
        );
      })}

      {flow === FLOW.ANIMALS && ANIMAL_DISTRACTORS.map((target) => (
        <button
          key={target.id}
          type="button"
          className={`eyes-hidden-target distractor-target animal-distractor ${softPulse === target.id ? 'soft-pulse' : ''}`}
          style={{ left: `${target.x}%`, top: `${target.y}%`, width: `${target.w}%` }}
          onClick={(e) => handleDistractorTap(target, e)}
          aria-label={target.label}
        >
          <img src={target.img} alt="" draggable={false} />
        </button>
      ))}

      {HIDING_PROPS.map((prop) => (
        <img
          key={prop.id}
          className="eyes-hiding-prop"
          src={prop.img}
          alt=""
          draggable={false}
          style={{ left: `${prop.x}%`, top: `${prop.y}%`, width: `${prop.w}%`, zIndex: prop.z }}
        />
      ))}

      <div className="eyes-clue-tray" aria-hidden="true">
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

      {feedback && <div className="eyes-soft-feedback">{feedback}</div>}
    </div>
  );
};

export default EyesPopUpGame;
