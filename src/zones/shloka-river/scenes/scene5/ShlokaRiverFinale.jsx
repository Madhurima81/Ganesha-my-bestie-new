import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ShlokaRiverFinale.css';

import SceneManager from '../../../../lib/components/scenes/SceneManager';
import MessageManager from '../../../../lib/components/scenes/MessageManager';
import InteractionManager from '../../../../lib/components/scenes/InteractionManager';
import GameStateManager from '../../../../lib/services/GameStateManager';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';

import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import HomeButton from '../../../../lib/components/ui/HomeButton/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import ZoneCompletionFireworks from '../../../../lib/components/feedback/ZoneCompletionFireworks';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import OpeningModal from '../../../shared/components/OpeningModal';

import { getCompletionModal } from '../../../../lib/config/content';

import riverBg from './assets/images/river-finale-bg.png';
import boatSailImage from './assets/images/boat-sail.png';
import vakratundaRecapBoat from './assets/images/recap-boats/vakratunda.png';
import mahakayaRecapBoat from './assets/images/recap-boats/mahakaya.png';
import suryakotiRecapBoat from './assets/images/recap-boats/suryakoti.png';
import samaprabhaRecapBoat from './assets/images/recap-boats/samaprabha.png';
import nirvighnamRecapBoat from './assets/images/recap-boats/nirvighnam.png';
import kurumedevaRecapBoat from './assets/images/recap-boats/kurumedeva.png';
import sarvakaryeshuRecapBoat from './assets/images/recap-boats/sarvakaryeshu.png';
import sarvadaRecapBoat from './assets/images/recap-boats/sarvada.png';
import revealVakratunda from '../../../symbol-mountain/shared/images/icons/symbol-trunk-new.png';
import revealMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';
import revealSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import revealSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.png';
import revealNirvighnam from '../../../meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import revealKurumedeva from '../../../meaning cave/assets/images/symbols/kurumedeva-symbol.png';
import revealSarvakaryeshu from '../../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png';
import revealSarvada from '../../../meaning cave/assets/images/symbols/sarvada-symbol.png';

const ORB_APP_IMAGES = {
  vakratunda: revealVakratunda,
  mahakaya: revealMahakaya,
  suryakoti: revealSuryakoti,
  samaprabha: revealSamaprabha,
  nirvighnam: revealNirvighnam,
  kurumedeva: revealKurumedeva,
  sarvakaryeshu: revealSarvakaryeshu,
  sarvada: revealSarvada,
};

const OPENING_SCENE_GANESHA = '/images/new-ganesha-sit-modak.webp';

const SHLOKA_WORDS = [
  { id: 'vakratunda', label: 'Vakratunda', icon: ORB_APP_IMAGES.vakratunda, color: '#FF5722', recapBoatImage: vakratundaRecapBoat },
  { id: 'mahakaya', label: 'Mahakaya', icon: ORB_APP_IMAGES.mahakaya, color: '#1565C0', recapBoatImage: mahakayaRecapBoat },
  { id: 'suryakoti', label: 'Suryakoti', icon: ORB_APP_IMAGES.suryakoti, color: '#FF9800', recapBoatImage: suryakotiRecapBoat },
  { id: 'samaprabha', label: 'Samaprabha', icon: ORB_APP_IMAGES.samaprabha, color: '#E91E63', recapBoatImage: samaprabhaRecapBoat },
  { id: 'nirvighnam', label: 'Nirvighnam', icon: ORB_APP_IMAGES.nirvighnam, color: '#009688', recapBoatImage: nirvighnamRecapBoat },
  { id: 'kurumedeva', label: 'Kurumedeva', icon: ORB_APP_IMAGES.kurumedeva, color: '#7B1FA2', recapBoatImage: kurumedevaRecapBoat },
  { id: 'sarvakaryeshu', label: 'Sarvakaryeshu', icon: ORB_APP_IMAGES.sarvakaryeshu, color: '#3F51B5', recapBoatImage: sarvakaryeshuRecapBoat },
  { id: 'sarvada', label: 'Sarvada', icon: ORB_APP_IMAGES.sarvada, color: '#689F38', recapBoatImage: sarvadaRecapBoat },
];

const FULL_SHLOKA_WORD_AUDIO = SHLOKA_WORDS.map((word) => `/audio/words/${word.id}.mp3`);

function BoatSvg({ className = '', style = {} }) {
  return (
    <svg
      className={`boat-svg ${className}`}
      style={style}
      viewBox="0 0 79.375 79.375"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="m 33.186,6.159 c 0,0 2.371,-0.666 3.476,-0.302 1.085,0.357 1.464,1.98 2.569,2.267 1.148,0.298 3.476,-0.756 3.476,-0.756 0,0 -2.594,2.944 -4.383,3.174 -0.965,0.124 -1.748,-1.013 -2.72,-1.058 -1.466,-0.068 -4.232,1.209 -4.232,1.209 z"
      />
      <rect
        fill="#f9bd66"
        width="2.325"
        height="9.588"
        x="33.069"
        y="-8.929"
        ry="1.498"
        transform="matrix(0.93,0.367,-0.262,0.965,0,0)"
      />
      <path
        fill="currentColor"
        d="M 19.735,46.965 30.768,10.693 c 0,0 18.198,7.422 23.728,14.962 4.682,6.385 6.045,22.972 6.045,22.972 l -0.302,-0.302 -24.785,3.023 z"
      />
      <path
        fill="#d28035"
        d="m 4.924,44.093 c 0,0 0.448,11.166 2.872,16.02 1.752,3.508 4.517,6.832 8.01,8.614 6.646,3.391 14.756,2.679 22.216,2.72 7.755,0.043 16.233,0.991 23.123,-2.569 3.836,-1.982 6.877,-5.72 8.614,-9.672 2.017,-4.589 1.511,-14.962 1.511,-14.962 0,0 -21.962,4.555 -33.098,4.534 C 26.981,48.756 4.924,44.093 4.924,44.093 Z"
      />
      <path
        fill="#692f15"
        d="m 5.076,47.685 c 0,0 0.085,2.166 0.386,5.004 1.495,0.282 21.751,4.067 32.19,4.064 11.195,-0.002 33.323,-4.232 33.323,-4.232 0,0 -0.275,5.619 -1.379,9.241 1.736,-4.979 1.827,-14.078 1.827,-14.078 0,0 -22.209,4.7 -33.472,4.686 C 26.883,52.357 5.076,47.685 5.076,47.685 Z"
      />
      <path
        fill="#83431e"
        d="m 5.227,49.08 c 0,0 -0.121,8.148 1.662,11.637 1.848,3.617 5.129,6.655 8.766,8.463 6.711,3.338 14.721,3.43 22.216,3.476 7.787,0.048 16.133,0.107 23.123,-3.325 4.157,-2.041 8.05,-5.46 9.975,-9.672 1.489,-3.258 0.605,-10.73 0.605,-10.73 0,0 -22.38,4.228 -33.702,4.232 -10.966,0.002 -32.644,-4.081 -32.644,-4.081 z"
      />
    </svg>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PHASES = {
  INITIAL: 'initial',
  ARRANGE: 'arrange',
  SUCCESS: 'success',
  RECAP: 'recap',
  FINALE: 'finale',
  COMPLETE: 'complete',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="srf-error">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ShlokaRiverFinale = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'shloka-river-finale',
}) => (
  <ErrorBoundary>
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        phase: PHASES.INITIAL,
        completed: false,
        stars: 0,
        welcomeShown: false,
        currentPopup: null,
        showingCompletionScreen: false,
      }}
    >
      {({ sceneState, sceneActions }) => (
        <ShlokaRiverFinaleContent
          sceneState={sceneState}
          sceneActions={sceneActions}
          onComplete={onComplete}
          onNavigate={onNavigate}
          zoneId={zoneId}
          sceneId={sceneId}
        />
      )}
    </SceneManager>
  </ErrorBoundary>
);

const ShlokaRiverFinaleContent = ({
  sceneState,
  sceneActions,
  onComplete,
  onNavigate,
  zoneId,
  sceneId,
}) => {
  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { stopVoice, playVoice, playSfx, playWord: playWordAudio, setCurrentPhase, setVoiceVolume } = useVoiceGuidance(
    zoneId,
    sceneId,
    { enableMusic: false, idleTimeout: 999999 }
  );
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({});

  const [scrambledWords, setScrambledWords] = useState(() => shuffle(SHLOKA_WORDS));
  const [slots, setSlots] = useState(Array(8).fill(null));
  const [wrongSlots, setWrongSlots] = useState(new Set());
  const [correctSlots, setCorrectSlots] = useState(new Set());
  const [draggingWord, setDraggingWord] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [rippleSlot, setRippleSlot] = useState(null);
  const [recapIndex, setRecapIndex] = useState(-1);
  const [allComplete, setAllComplete] = useState(false);
  const [startSailing, setStartSailing] = useState(false);
  const [showOrbsCelebration, setShowOrbsCelebration] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);

  const stageRef = useRef(null);
  const fullShlokaAudioRef = useRef(null);
  const fullShlokaPlaybackTokenRef = useRef(0);
  const recapSequenceStartedRef = useRef(false);
  const hintTimersRef = useRef([]);

  const phase = sceneState.phase || PHASES.INITIAL;
  const usedWords = new Set(slots.filter(Boolean));
  const correctCount = correctSlots.size;
  const currentTargetWord = SHLOKA_WORDS[activeSlotIndex] || null;
  const trayWords = scrambledWords.length ? scrambledWords : SHLOKA_WORDS;
  const fillCompletedBoard = useCallback(() => {
    setSlots(SHLOKA_WORDS.map((word) => word.id));
    setCorrectSlots(new Set(SHLOKA_WORDS.map((_, index) => index)));
    setWrongSlots(new Set());
    setActiveSlotIndex(SHLOKA_WORDS.length - 1);
    setHintLevel(0);
    setRippleSlot(null);
  }, []);

  const clearHintTimers = useCallback(() => {
    hintTimersRef.current.forEach((cancel) => cancel?.());
    hintTimersRef.current = [];
  }, []);

  useEffect(() => {
    setCurrentPhase?.(phase);
    return () => {
      clearAllTimeouts();
      clearHintTimers();
      fullShlokaPlaybackTokenRef.current += 1;
      fullShlokaAudioRef.current?.pause();
      fullShlokaAudioRef.current = null;
    };
  }, [phase, setCurrentPhase, clearAllTimeouts, clearHintTimers]);

  const stopAllVoice = useCallback(() => {
    fullShlokaPlaybackTokenRef.current += 1;
    stopVoice?.();
    fullShlokaAudioRef.current?.pause();
    fullShlokaAudioRef.current = null;
  }, [stopVoice]);

  const handleAudioToggle = useCallback(() => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn) {
      stopAllVoice();
    }
    toggleAudio();
  }, [isAudioOn, setVoiceVolume, stopAllVoice, toggleAudio]);

  const playFullShloka = useCallback(({ onWordStart, onComplete } = {}) => {
    if (!isAudioOn) {
      onComplete?.();
      return;
    }

    fullShlokaPlaybackTokenRef.current += 1;
    const playbackToken = fullShlokaPlaybackTokenRef.current;
    fullShlokaAudioRef.current?.pause();
    fullShlokaAudioRef.current = null;

    const playWordAtIndex = (index) => {
      if (fullShlokaPlaybackTokenRef.current !== playbackToken) return;
      if (index >= FULL_SHLOKA_WORD_AUDIO.length) {
        fullShlokaAudioRef.current = null;
        onComplete?.();
        return;
      }

      onWordStart?.(index);
      const audio = new Audio(FULL_SHLOKA_WORD_AUDIO[index]);
      audio.volume = 0.95;
      audio.onended = () => playWordAtIndex(index + 1);
      audio.onerror = () => playWordAtIndex(index + 1);
      fullShlokaAudioRef.current = audio;
      audio.play().catch(() => playWordAtIndex(index + 1));
    };

    playWordAtIndex(0);
  }, [isAudioOn]);

  useEffect(() => {
    if (phase !== PHASES.INITIAL) return;
    recapSequenceStartedRef.current = false;
    setOpeningButtonVisible(!isAudioOn);
    setScrambledWords(shuffle(SHLOKA_WORDS));
    setSlots(Array(8).fill(null));
    setWrongSlots(new Set());
    setCorrectSlots(new Set());
    setActiveSlotIndex(0);
    setHintLevel(0);
    setRippleSlot(null);
    setRecapIndex(-1);
    setAllComplete(false);
    setStartSailing(false);
    if (!isAudioOn) {
      return undefined;
    }

    const revealButton = () => setOpeningButtonVisible(true);
    const revealFallback = safeSetTimeout(revealButton, 9000);
    playVoice?.('openingModalPrompt', () => {
      revealFallback?.();
      revealButton();
    }, { replayOnReturn: false });

    return () => revealFallback?.();
  }, [isAudioOn, phase, playVoice, safeSetTimeout]);

  const scheduleHints = useCallback((slotIndex) => {
    clearHintTimers();
    if (phase !== PHASES.ARRANGE || slotIndex >= SHLOKA_WORDS.length) return;

    hintTimersRef.current = [
      safeSetTimeout(() => {
        setHintLevel(1);
        playVoice?.('hintBoatL1', undefined, { replayOnReturn: false });
      }, 10000),
      safeSetTimeout(() => {
        setHintLevel(2);
        playVoice?.('hintBoatL2', undefined, { replayOnReturn: false });
      }, 20000),
      safeSetTimeout(() => {
        setHintLevel(3);
        playVoice?.('hintBoatL3', undefined, { replayOnReturn: false });
      }, 35000),
    ];
  }, [clearHintTimers, phase, playVoice, safeSetTimeout]);

  const markInteraction = useCallback(() => {
    setHintLevel(0);
    if (phase === PHASES.ARRANGE) {
      scheduleHints(activeSlotIndex);
    }
  }, [activeSlotIndex, phase, scheduleHints]);

  useEffect(() => {
    if (phase !== PHASES.ARRANGE) {
      clearHintTimers();
      return;
    }
    scheduleHints(activeSlotIndex);
    return clearHintTimers;
  }, [phase, activeSlotIndex, scheduleHints, clearHintTimers]);

  const handleStartGame = () => {
    sceneActions.updateState({ phase: PHASES.ARRANGE, welcomeShown: true });
    playVoice?.('arrangeStart', undefined, { replayOnReturn: false });
  };

  const triggerSuccessFlow = useCallback(() => {
    setAllComplete(true);
    sceneActions.updateState({ phase: PHASES.SUCCESS });
    let recapStarted = false;
    const startRecap = () => {
      if (recapStarted) return;
      recapStarted = true;
      setStartSailing(true);
      sceneActions.updateState({ phase: PHASES.RECAP });
      setRecapIndex(0);
    };
    // VO callbacks can fail to fire (missing file, iOS dropping events) — don't strand SUCCESS
    safeSetTimeout(startRecap, 12000);
    playVoice?.('sceneComplete', () => {
      safeSetTimeout(() => {
        playVoice?.('recapStart', startRecap, { replayOnReturn: false });
      }, 250);
    }, { replayOnReturn: false });
  }, [playVoice, safeSetTimeout, sceneActions]);

  useEffect(() => {
    if (phase === PHASES.SUCCESS) {
      fillCompletedBoard();
      setAllComplete(true);
      setStartSailing(false);
      setRecapIndex(-1);

      if (correctSlots.size === SHLOKA_WORDS.length) {
        return undefined;
      }

      const resumeRecap = safeSetTimeout(() => {
        setStartSailing(true);
        sceneActions.updateState({ phase: PHASES.RECAP });
        setRecapIndex(0);
      }, 3000);

      return () => resumeRecap?.();
    }

    if (phase === PHASES.RECAP) {
      fillCompletedBoard();
      setAllComplete(true);
      setStartSailing(true);
      setRecapIndex((prev) => (prev < 0 ? 0 : prev));
      return undefined;
    }

    return undefined;
  }, [correctSlots.size, fillCompletedBoard, phase, safeSetTimeout, sceneActions]);

  const placeWord = useCallback((wordData, slotIdx) => {
    const isCorrect = SHLOKA_WORDS[slotIdx].id === wordData.id;
    markInteraction();

    if (!isCorrect) {
      setWrongSlots((prev) => new Set(prev).add(slotIdx));
      playSfx?.('wrong');
      safeSetTimeout(() => {
        setWrongSlots((prev) => {
          const next = new Set(prev);
          next.delete(slotIdx);
          return next;
        });
      }, 600);
      return;
    }

    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = wordData.id;
      return next;
    });

    setCorrectSlots((prev) => {
      const next = new Set(prev);
      next.add(slotIdx);
      return next;
    });
    setRippleSlot(slotIdx);
    playWordAudio?.(wordData.id);
    safeSetTimeout(() => setRippleSlot(null), 650);

    if (slotIdx === SHLOKA_WORDS.length - 1) {
      safeSetTimeout(triggerSuccessFlow, 500);
      return;
    }

    safeSetTimeout(() => {
      setActiveSlotIndex(slotIdx + 1);
      setHintLevel(0);
    }, 420);
  }, [markInteraction, playWordAudio, safeSetTimeout, triggerSuccessFlow]);

  const handleTrayPointerDown = (e, wordData) => {
    if (phase !== PHASES.ARRANGE || usedWords.has(wordData.id)) return;
    e.preventDefault();
    markInteraction();
    setDraggingWord(wordData);
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handlePointerMove = (e) => {
    if (!draggingWord) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handlePointerUp = (e) => {
    if (!draggingWord) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) {
      setDraggingWord(null);
      setDragPos(null);
      return;
    }

    const activeSlotEl = stageRef.current.querySelector(`.srf-slot[data-index="${activeSlotIndex}"]`);
    if (activeSlotEl && !slots[activeSlotIndex]) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const slotRect = activeSlotEl.getBoundingClientRect();
      const sx = ((slotRect.left + slotRect.width / 2 - rect.left) / rect.width) * 100;
      const sy = ((slotRect.top + slotRect.height / 2 - rect.top) / rect.height) * 100;
      if (Math.hypot(x - sx, y - sy) < 16) {
        placeWord(draggingWord, activeSlotIndex);
      }
    }

    setDraggingWord(null);
    setDragPos(null);
  };

  const handleWordChipTap = (wordData) => {
    if (phase !== PHASES.ARRANGE || usedWords.has(wordData.id)) return;
    placeWord(wordData, activeSlotIndex);
  };

  useEffect(() => {
    if (phase !== PHASES.RECAP) {
      recapSequenceStartedRef.current = false;
      return undefined;
    }

    const goToFinale = () => {
      safeSetTimeout(() => {
        sceneActions.updateState({ phase: PHASES.FINALE });
      }, 1200);
    };

    if (isAudioOn && !recapSequenceStartedRef.current) {
      recapSequenceStartedRef.current = true;
      playFullShloka({
        onWordStart: (index) => setRecapIndex(index),
        onComplete: () => {
          setRecapIndex(SHLOKA_WORDS.length);
          goToFinale();
        },
      });
      return undefined;
    }

    if (!isAudioOn && recapIndex >= 0) {
      if (recapIndex >= SHLOKA_WORDS.length) {
        goToFinale();
        return undefined;
      }

      const advanceRecap = safeSetTimeout(() => setRecapIndex((prev) => prev + 1), 2000);
      return () => advanceRecap?.();
    }

    return undefined;
  }, [phase, recapIndex, isAudioOn, playFullShloka, safeSetTimeout, sceneActions]);

  useEffect(() => {
    if (phase === PHASES.FINALE) {
      setShowOrbsCelebration(true);
    }
  }, [phase]);

  const handleOrbsComplete = useCallback(() => {
    setShowOrbsCelebration(false);
    playVoice?.('finalCelebration', undefined, { replayOnReturn: false });

    const profileId = activeProfile?.id || localStorage.getItem('activeProfileId');
    if (profileId) {
      const tempKey = `temp_session_${profileId}_${zoneId}_${sceneId}`;

      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true,
        stars: 8,
        phase: PHASES.COMPLETE,
        timestamp: Date.now(),
      });
      ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
        completed: true,
        stars: 8,
      });

      localStorage.removeItem(tempKey);
      SimpleSceneManager.clearCurrentScene();
    }

    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      completed: true,
      stars: 8,
      showingCompletionScreen: true,
    });

    setShowSceneCompletion(true);
  }, [activeProfile?.id, playVoice, sceneActions, sceneId, zoneId]);

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div
          ref={stageRef}
          className="srf-container"
          style={{ backgroundImage: `url(${riverBg})` }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />

          {phase === PHASES.INITIAL && (
            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              onStart={handleStartGame}
              showButton={openingButtonVisible}
            />
          )}

          {(phase === PHASES.ARRANGE || phase === PHASES.SUCCESS) && (
            <div className="srf-arrange">
              <div className="srf-title-banner">
                <h1 className="srf-title">Complete the Shloka!</h1>
                <p className="srf-subtitle">Tap the first word boat.</p>
              </div>

              <div className="srf-progress-badge">{correctCount} / 8</div>

              <div className="srf-river-area">
                <div className="srf-slot-grid">
                  {Array(8).fill(null).map((_, idx) => {
                    const placedWordId = slots[idx];
                    const wordData = placedWordId
                      ? SHLOKA_WORDS.find((w) => w.id === placedWordId)
                      : null;
                    const isCorrect = correctSlots.has(idx);
                    const isWrong = wrongSlots.has(idx);
                    const isActive = phase === PHASES.ARRANGE && idx === activeSlotIndex && !placedWordId;
                    const isLocked = idx > activeSlotIndex && !placedWordId;
                    return (
                      <div
                        key={idx}
                        className={`srf-slot ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''} ${isActive ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''} ${placedWordId ? 'is-filled' : ''} ${rippleSlot === idx ? 'is-ripple' : ''} ${hintLevel >= 1 && isActive ? 'is-hint-slot' : ''}`}
                        data-index={idx}
                      >
                        <span className="srf-slot-number">{idx + 1}</span>
                        {placedWordId && wordData ? (
                          <div
                            className={`srf-placed-boat ${allComplete ? 'is-all-complete' : ''}`}
                            style={{ color: wordData.color }}
                          >
                            <BoatSvg />
                            <img src={wordData.icon} alt="" className="srf-boat-icon" />
                            <span className="srf-boat-label">{wordData.label}</span>
                          </div>
                        ) : (
                          <div className="srf-ghost-boat">
                            <BoatSvg style={{ opacity: 0.15 }} />
                            <span className="srf-slot-q">?</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {phase === PHASES.ARRANGE && (
                <div className="srf-tray">
                  <p className="srf-tray-label">Tap the next word boat</p>
                  <div className="srf-tray-boats">
                    {trayWords.filter((w) => !usedWords.has(w.id)).map((w) => {
                      const isHintBoat = currentTargetWord?.id === w.id && hintLevel >= 2;
                      return (
                        <div
                          key={w.id}
                          className={`srf-tray-boat ${isHintBoat ? (hintLevel >= 3 ? 'is-hint-wiggle' : 'is-hint-pulse') : ''}`}
                          style={{ color: w.color }}
                          onPointerDown={(e) => handleTrayPointerDown(e, w)}
                          onClick={() => handleWordChipTap(w)}
                        >
                          <BoatSvg />
                          <img src={w.icon} alt="" className="srf-boat-icon" />
                          <span className="srf-boat-label">{w.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {draggingWord && dragPos && (
                <div
                  className="srf-drag-ghost"
                  style={{
                    left: `${dragPos.x}%`,
                    top: `${dragPos.y}%`,
                    color: draggingWord.color,
                  }}
                >
                  <BoatSvg />
                  <img src={draggingWord.icon} alt="" className="srf-boat-icon" />
                  <span className="srf-boat-label">{draggingWord.label}</span>
                </div>
              )}
            </div>
          )}

          {phase === PHASES.SUCCESS && (
            <div className="srf-success-overlay">
              <div className="srf-success-glow" />
              <h2 className="srf-success-text">You completed the Shloka River! ✨</h2>
            </div>
          )}

          {phase === PHASES.RECAP && (
            <div className="srf-recap srf-slow-zoom">
              {recapIndex >= 0 && recapIndex < SHLOKA_WORDS.length && (
                <div
                  key={`recap-boat-${recapIndex}`}
                  className={`srf-recap-boat ${startSailing ? 'is-sailing' : ''}`}
                  style={{ color: SHLOKA_WORDS[recapIndex].color }}
                >
                  {SHLOKA_WORDS[recapIndex].recapBoatImage ? (
                    <>
                      <img
                        src={SHLOKA_WORDS[recapIndex].recapBoatImage}
                        alt={SHLOKA_WORDS[recapIndex].label}
                        className="srf-recap-custom-boat"
                      />
                      <span className="srf-boat-label srf-recap-custom-label">{SHLOKA_WORDS[recapIndex].label}</span>
                    </>
                  ) : (
                    <>
                      <BoatSvg />
                      <img src={SHLOKA_WORDS[recapIndex].icon} alt="" className="srf-boat-icon" />
                      <span className="srf-boat-label">{SHLOKA_WORDS[recapIndex].label}</span>
                    </>
                  )}
                </div>
              )}

              <div className="srf-spectator-boat">
                <img src={boatSailImage} alt="Kids and Mooshika watching" />
              </div>

              <div className="srf-recap-dots">
                {SHLOKA_WORDS.map((w, i) => (
                  <div
                    key={w.id}
                    className={`srf-recap-dot ${i < recapIndex ? 'is-done' : ''} ${i === recapIndex ? 'is-current' : ''}`}
                    style={{ '--dot-color': w.color }}
                  />
                ))}
              </div>
            </div>
          )}

          {showOrbsCelebration && (
            <>
              <ZoneCompletionFireworks
                show={true}
                burstsPerWave={5}
                particles={24}
                radius={140}
                duration={2600}
              />
              <RotatingOrbsEffect
                show={true}
                duration={7000}
                rotationDuration={7000}
                symbolImages={ORB_APP_IMAGES}
                ganeshaImage={OPENING_SCENE_GANESHA}
                playerName={profileName}
                showCentralGanesha={true}
                showBuiltInFireworks={false}
                onComplete={handleOrbsComplete}
              />
            </>
          )}

          <SceneCompletionCelebration
            show={showSceneCompletion}
            zoneId={zoneId}
            sceneName="Shloka River"
            completionTitle="The Shloka River Is Complete!"
            completionSubtitle="Vakratunda Mahakaya Suryakoti Samaprabha · Nirvighnam Kurumedeva Sarvakaryeshu Sarvada"
            sceneNumber={5}
            totalScenes={5}
            starsEarned={8}
            totalStars={8}
            discoveredSymbols={[]}
            containerType="backpack"
            symbolImages={{}}
            sceneId={sceneId}
            completionData={{ stars: 8, completed: true }}
            onComplete={() => {
              onNavigate?.('zone-welcome');
              onComplete?.();
            }}
            childName={profileName}
            isFinalScene={true}
            onExploreZones={() => onNavigate?.('zones')}
            onHome={() => onNavigate?.('home')}
            onReplay={() => {
              setShowSceneCompletion(false);
              setShowOrbsCelebration(false);
              stopAllVoice();
              resetScene();
            }}
            onContinue={() => onNavigate?.('scene-complete-continue')}
          />

          <GestureDemo
            type="tap"
            from={{ x: 15, y: 82 }}
            to={{ x: 15, y: 82 }}
            active={phase === PHASES.ARRANGE && correctCount === 0 && !draggingWord}
            idleDelay={3000}
          />

          <TocaBocaNav
            onHome={() => safeSetTimeout(() => {
              stopAllVoice();
              SimpleSceneManager.clearCurrentScene();
              onNavigate?.('home');
            }, 100)}
            onZonesClick={() => safeSetTimeout(() => {
              stopAllVoice();
              SimpleSceneManager.clearCurrentScene();
              onNavigate?.('zones');
            }, 100)}
            onStartFresh={() => {
              setShowSceneCompletion(false);
              setShowOrbsCelebration(false);
              stopAllVoice();
              resetScene();
            }}
            currentProgress={{ stars: correctCount, completed: sceneState.completed ? 1 : 0, total: 1 }}
            isAudioOn={isAudioOn}
            onAudioToggle={handleAudioToggle}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default ShlokaRiverFinale;
