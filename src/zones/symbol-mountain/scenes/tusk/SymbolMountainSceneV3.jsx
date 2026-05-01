// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV3.jsx
// 🎵 Complete Musical Mountain Scene - Final Migration V5

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SymbolMountainScene.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure themes are loaded
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';
import { KidsDraggable, KidsDropZone } from '../../../../lib/components/interactive/KidsDraggable';

// --- NEW MASTER LAYOUT & CONFIG ---
// import GameLayout from '../../../../lib/components/layout/GameLayout';  // commented out — pause menu removed
// import { symbolHelpConfig } from './helpConfig';                         // commented out — help config removed
// ----------------------------------

// Unified Components
// import UnifiedHeaderV2 from '../../../../lib/components/ui/Header/UnifiedHeaderV2'; // commented out — header removed
import OpeningModal from '../../../shared/components/OpeningModal';

// Pause-aware timeout, resume countdown, SFX
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
// import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue'; // commented out — inline gesture used
// import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';               // commented out — inline implementation
// import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';  // commented out — nav removed
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Import game components
import EyesTelescopeGame from './EyesTelescopeGame';
import EarsRhythmGame from './EarsRhythmGame';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
// import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem'; // removed — replaced by inline hint cadence
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
// import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay'; // superseded by SymbolAutoReveal
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Images
import mountainBackground from '../tusk/assets/images/symbolmtn_background.jpg';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-new.png';
import ganeshaEars from '../../shared/images/icons/symbol-ears-new.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-new.png';

// Character/Coach images
import eyesCoach from '../tusk/assets/images/mooshika-coach.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

// Ganesha for tusk assembly (same as ModakV7)
const GANESHA_SIT_FEED_IMAGE = '/images/ganesha-sit.svg';

// Symbol Icons
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.png';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-new.png';
import symbolEarColored from '../../shared/images/icons/symbol-ears-new.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-new.png';

// Musical instrument images
import musicalTabla from '../tusk/assets/images/tabla-new.png';
import musicalDholak from '../tusk/assets/images/dholak-new.png';
import musicalHarmonium from '../tusk/assets/images/harmonium-new.png';
import musicalTanpura from '../tusk/assets/images/tanpura-new.png';
import noteNewIcon from '../tusk/assets/images/note-new.png';

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla' },
  dholak: { image: musicalDholak, name: 'Dholak' },
  harmonium: { image: musicalHarmonium, name: 'Harmonium' },
  tanpura: { image: musicalTanpura, name: 'Tanpura' }
};

// Shared countdown duration — must match across useResumeCountdown + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;

// Mini gesture icons (same pattern as Pond / Modak)
const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MINI_VICTORY_ICON = '/images/hand-victory.svg';
const MINI_OK_ICON = '/images/hand-ok.svg';

const VOICE_LINES = {
  opening: "Let's explore... look and listen.",
  eyes: "Tap my eyes... let's see what's hidden.",
  ears: "Tap my ears... let's listen.",
  startRound1: 'Listen carefully.',
  round1TapNow: 'Now you try.',
  startRound2: 'Listen again... then tap.',
  startRound3: 'Round three.',
  gameIntro: 'Listen to the rhythm, then tap the instruments in the same order.',
  tusk: 'You found them all... now drag them to me.',
  successRound1: 'One note.',
  successRound2: 'Two notes.',
  successRound3: 'All three... you did it.',
  wrongFirstTime: 'Almost! Try again.',
  wrongSecondTime: "Let's listen together.",
  replayHint: 'Tap replay to hear again.',
  idleEyes: 'Drag the magnifying glass... look closely.',
  idleEars: 'Listen carefully to my ears.',
  idleTusk: 'Drag the notes to the tusk.',
  complete: 'You saw clearly. You listened well. You finished strong. All yours.'
};

// Game phases
const PHASES = {
  EYES_GAME: 'eyes_game',
  EYES_COMPLETE: 'eyes_complete',
  EARS_GAME: 'ears_game',
  EARS_COMPLETE: 'ears_complete',
  TUSK_GAME: 'tusk_game',
  TUSK_COMPLETE: 'tusk_complete',
  ALL_COMPLETE: 'all_complete'
};

const NOTE_STATES = {
  LOCKED: 'locked',
  APPEARING: 'appearing',
  ACTIVE: 'active',
  USED: 'used'
};

// Musical instrument positions
const instrumentPositions = {
  1: { x: 39, y: 44, type: 'tabla' },
  2: { x: 64, y: 72, type: 'dholak' },
  3: { x: 23, y: 71, type: 'harmonium' },
  4: { x: 86, y: 47, type: 'tanpura' }
};

const instrumentPositionsByType = Object.values(instrumentPositions).reduce((acc, item) => {
  if (item?.type) acc[item.type] = { x: item.x, y: item.y };
  return acc;
}, {});

const instrumentSizesByType = {
  tabla: { eyes: { discovered: 290, glow: 150, hidden: 120 }, ears: 290, pattern: 102 },
  dholak: { eyes: { discovered: 290, glow: 150, hidden: 120 }, ears: 290, pattern: 102 },
  harmonium: { eyes: { discovered: 350, glow: 150, hidden: 120 }, ears: 390, pattern: 102 },
  tanpura: { eyes: { discovered: 290, glow: 170, hidden: 135 }, ears: 310, pattern: 122 }
};

// Musical note data
const musicalNoteData = [
  { id: 'note1' },
  { id: 'note2' },
  { id: 'note3' }
];

// Ganesha fade-in based on notes fed to tusk
const getGaneshaTuskOpacity = (tuskPower) => {
  const opacitySteps = [0.35, 0.6, 0.85, 1.0];
  return opacitySteps[Math.min(tuskPower, 3)];
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <button onClick={() => window.location.reload()}>Reload Scene</button>;
    return this.props.children;
  }
}

const SymbolMountainSceneV3 = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'symbol'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: PHASES.EYES_GAME,
          activeGame: 'eyes',
          completedGames: [],
          currentFocus: 'eyes',

          eyesGameComplete: false,
          showEyesTelescopeGame: false,
          foundInstruments: [],
          discoveredInstruments: {},
          instrumentsFound: 0,

          earsVisible: false,
          earsGameComplete: false,
          showEarsRhythmGame: false,
          musicalNotesVisible: false,
          currentNote: 'note1',
          musicalNoteStates: { note1: 'gray', note2: 'gray', note3: 'gray' },
          earsGamePhase: 'waiting',
          earsPlayerInput: [],
          earsCurrentSequence: [],
          earsSequenceItemsShown: 0,
          earsSequenceJustCompleted: false,
          earsReadyForNextNote: false,
          earsLastCompletedNote: null,

          showTuskAssemblyGame: false,
          tuskGameActive: false,
          tuskPower: 0,
          tuskFullyPowered: false,
          ganeshaComplete: false,
          showGaneshaOutline: false,

          discoveredSymbols: {
            mooshika: true, modak: true, belly: true, lotus: true, trunk: true
          },

          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <SymbolMountainSceneContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            zoneId={zoneId}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

const SymbolMountainSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState || !sceneActions) return <div className="loading">Loading...</div>;

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.EYES_GAME });

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'));
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  // Local UI states
  const [showSparkle, setShowSparkle] = useState(null);
  const [hideEyesSymbol, setHideEyesSymbol] = useState(false);
  const [showEyesSparkleBurst, setShowEyesSparkleBurst] = useState(false);
  const [hideEarsSymbol, setHideEarsSymbol] = useState(false);
  const [showEarsSparkleBurst, setShowEarsSparkleBurst] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);

  // Discovery & Resume States
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // Eyes — superseded by SymbolAutoReveal
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // Ears — superseded by SymbolAutoReveal
  const [showDiscoveryFlip3, setShowDiscoveryFlip3] = useState(false); // Tusk — superseded by SymbolAutoReveal
  // ── SymbolAutoReveal state ─────────────────────────────────────────────────
  const [revealConfig, setRevealConfig] = useState(null);

  // ── Inline mini-gesture (same pattern as NewModakSceneV7) ─────────────────
  const miniGestureTimerRef = useRef(null);
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    target: 'center',
    durationMs: 1500,
    key: 0,
    icon: MINI_THUMBS_UP_ICON
  });
  const triggerMiniGesture = useCallback((target = 'center', durationMs = 1500, icon = MINI_THUMBS_UP_ICON) => {
    if (miniGestureTimerRef.current) {
      clearTimeout(miniGestureTimerRef.current);
      miniGestureTimerRef.current = null;
    }
    setMiniGesture(prev => ({ show: true, target, durationMs, key: prev.key + 1, icon }));
    miniGestureTimerRef.current = setTimeout(() => {
      setMiniGesture(prev => ({ ...prev, show: false }));
      miniGestureTimerRef.current = null;
    }, durationMs);
  }, []);

  // ── Inline hint cadence state (same pattern as NewModakSceneV7) ────────────
  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const idleHintsEnabled = true;
  // Incremented each time child returns from a tab switch — resets hint timer
  const [hintResetKey, setHintResetKey] = useState(0);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;

  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const lastAnnouncedPromptRef = useRef(null);
  const openingVoPlayedRef = useRef(false);
  const idleVoGateRef = useRef(false);

  // ── Voice guidance (music + SFX enabled) ─────────────────────────────────
  const { startMusic, stopMusic, playTap, playCorrect, playPowerUnlock } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: true, musicVolume: 0.1, voiceVolume: 1, sfxVolume: 0.35, idleTimeout: 20 }
  );
  useEffect(() => {
    if (sceneState?.welcomeShown) startMusic();
    return () => stopMusic();
  }, [sceneState?.welcomeShown, startMusic, stopMusic]);

  // ── SFX ──────────────────────────────────────────────────────────────────
  const { playSparkle } = useGameSounds();
  const playUiTap = playTap;
  const playChime = playCorrect;
  const playGlow = playPowerUnlock;

  // ── Resume countdown (3-2-1 on tab return) ───────────────────────────────
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  // ── Pause-aware safeSetTimeout — pauses on tab hide, resumes after countdown
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {},
    onShow: () => {
      setHintResetKey(k => k + 1); // restart hint cadence on tab return
      setIdleHintLevel(0);
      setShowIdleGestureHint(false);
      idleVoGateRef.current = false;
      lastIdleInteractionAtRef.current = Date.now();
      if (sceneState?.welcomeShown) {
        const replayKey = getPromptKeyForPhase();
        if (replayKey) {
          resetIdleBaseline();
          speakScenePrompt(replayKey);
        }
      }
    },
    resumeDelay: RESUME_DELAY_MS,
  });

  const resumePopupTimeoutRef = useRef(null);
  const reloadHandledRef = useRef(false);
  // const progressiveHintRef = useRef(null); // removed — ProgressiveHintSystem removed

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const [musicalNoteStates, setMusicalNoteStates] = useState({
    note1: NOTE_STATES.LOCKED,
    note2: NOTE_STATES.LOCKED,
    note3: NOTE_STATES.LOCKED
  });

  // Tusk → Ganesha reveal sequence
  const [tuskTransforming, setTuskTransforming] = useState(false);
  const [showGoldenAura, setShowGoldenAura] = useState(false);
  const [ganeshaRevealing, setGaneshaRevealing] = useState(false);

  const resetHintCadence = useCallback(() => {
    setIdleHintLevel(0);
    setShowIdleGestureHint(false);
    idleVoGateRef.current = false;
    lastIdleInteractionAtRef.current = Date.now();
    setHintResetKey(k => k + 1);
  }, []);
  const resetIdleBaseline = useCallback(() => {
    setIdleHintLevel(0);
    setShowIdleGestureHint(false);
    idleVoGateRef.current = false;
    lastIdleInteractionAtRef.current = Date.now();
  }, []);

  const hintClassName = idleHintLevel === 1
    ? 'hint'
    : idleHintLevel === 2
      ? 'hint-strong'
      : idleHintLevel >= 3
        ? 'hint-final'
        : '';

  const speakScenePrompt = useCallback((key, options = {}) => {
    if (!isAudioOn || !VOICE_LINES[key]) return;
    speak(VOICE_LINES[key], {
      age: 11,
      style: 'child',
      moment: key === 'complete' ? 'celebration' : 'encouragement',
      onEnd: options?.onEnd
    });
  }, [isAudioOn, speak]);

  const getPromptKeyForPhase = useCallback(() => {
    if (!sceneState?.welcomeShown) return 'opening';
    if (sceneState.phase === PHASES.EYES_GAME && !sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes) return 'eyes';
    if (sceneState.phase === PHASES.EARS_GAME && sceneState.earsVisible && !sceneState.showEarsRhythmGame && !sceneState.discoveredSymbols?.ears) return 'ears';
    if (sceneState.phase === PHASES.TUSK_GAME && sceneState.showTuskAssemblyGame && !sceneState.ganeshaComplete) return 'tusk';
    if (sceneState.phase === PHASES.ALL_COMPLETE) return 'complete';
    return null;
  }, [
    sceneState?.discoveredSymbols?.ears,
    sceneState?.discoveredSymbols?.eyes,
    sceneState?.earsVisible,
    sceneState?.ganeshaComplete,
    sceneState?.phase,
    sceneState?.showEarsRhythmGame,
    sceneState?.showEyesTelescopeGame,
    sceneState?.showTuskAssemblyGame,
    sceneState?.welcomeShown
  ]);

  // Sync Local State
  useEffect(() => {
    if (sceneState.musicalNoteStates) {
      const syncedState = { ...musicalNoteStates };
      Object.keys(sceneState.musicalNoteStates).forEach(key => {
        if (sceneState.musicalNoteStates[key] === 'golden') {
          syncedState[key] = NOTE_STATES.ACTIVE;
        } else if (sceneState.musicalNoteStates[key] === 'used') {
          syncedState[key] = NOTE_STATES.USED;
        }
      });
      setMusicalNoteStates(syncedState);
    }
  }, [sceneState.musicalNoteStates]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      if (miniGestureTimerRef.current) {
        clearTimeout(miniGestureTimerRef.current);
        miniGestureTimerRef.current = null;
      }
      stopSpokenVoice();
      stopMusic();
      reloadHandledRef.current = false;
    };
  }, [clearAllTimeouts, stopMusic, stopSpokenVoice]);

  useEffect(() => {
    if (isAudioOn) return;
    stopSpokenVoice();
  }, [isAudioOn, stopSpokenVoice]);

  // Opening modal VO: play when modal is visible, not on Start tap.
  useEffect(() => {
    if (sceneState?.welcomeShown) return;
    if (openingVoPlayedRef.current) return;
    const timer = setTimeout(() => {
      openingVoPlayedRef.current = true;
      speakScenePrompt('opening');
    }, 700);
    return () => clearTimeout(timer);
  }, [sceneState?.welcomeShown, speakScenePrompt]);

  // Deterministic idle hint ladder:
  // L1 @ 10s (hint), L2 @ 18s (hint-strong), L3 @ 26s (hint-final + pointer).
  useEffect(() => {
    const hintPhases = [PHASES.EYES_GAME, PHASES.EARS_GAME, PHASES.TUSK_GAME];
    const isHintPhase = idleHintsEnabled
      && hintPhases.includes(sceneState?.phase)
      && sceneState?.welcomeShown
      && !sceneState?.showEyesTelescopeGame
      && !sceneState?.showEarsRhythmGame
      && !isSymbolPopupOpen
      && !revealConfig
      && !showSceneCompletion;

    if (!isHintPhase) {
      setIdleHintLevel(0);
      setShowIdleGestureHint(false);
      return;
    }

    const tick = setInterval(() => {
      const idleFor = Date.now() - lastIdleInteractionAtRef.current;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L3_MS) nextLevel = 3;
      else if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;
      setIdleHintLevel(prev => (prev === nextLevel ? prev : nextLevel));
    }, 250);

    return () => clearInterval(tick);
  }, [
    hintResetKey,
    idleHintsEnabled,
    isSymbolPopupOpen,
    revealConfig,
    sceneState?.phase,
    sceneState?.showEarsRhythmGame,
    sceneState?.showEyesTelescopeGame,
    sceneState?.welcomeShown,
    showSceneCompletion
  ]);

  useEffect(() => {
    setShowIdleGestureHint(idleHintLevel >= 3);
  }, [idleHintLevel]);

  useEffect(() => {
    if (!sceneState?.welcomeShown || revealConfig || showSceneCompletion || isSymbolPopupOpen) return;

    let promptKey = null;
    if (sceneState.phase === PHASES.EYES_GAME && !sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes) {
      promptKey = 'eyes';
    } else if (
      sceneState.phase === PHASES.EARS_GAME &&
      sceneState.earsVisible &&
      !sceneState.showEarsRhythmGame &&
      !sceneState.discoveredSymbols?.ears &&
      !hideEarsSymbol
    ) {
      promptKey = 'ears';
    } else if (sceneState.phase === PHASES.TUSK_GAME && sceneState.showTuskAssemblyGame && !sceneState.ganeshaComplete) {
      promptKey = 'tusk';
    } else if (sceneState.phase === PHASES.ALL_COMPLETE) {
      promptKey = 'complete';
    }

    if (!promptKey || lastAnnouncedPromptRef.current === promptKey) return;
    lastAnnouncedPromptRef.current = promptKey;

    const timer = setTimeout(() => {
      resetIdleBaseline();
      speakScenePrompt(promptKey);
    }, promptKey === 'complete' ? 250 : 500);
    return () => clearTimeout(timer);
  }, [
    sceneState?.welcomeShown,
    sceneState?.phase,
    sceneState?.showEyesTelescopeGame,
    sceneState?.showEarsRhythmGame,
    sceneState?.earsVisible,
    sceneState?.showTuskAssemblyGame,
    sceneState?.ganeshaComplete,
    sceneState?.discoveredSymbols?.eyes,
    sceneState?.discoveredSymbols?.ears,
    hideEarsSymbol,
    isSymbolPopupOpen,
    revealConfig,
    showSceneCompletion,
    resetIdleBaseline,
    speakScenePrompt
  ]);

  useEffect(() => {
    // Prevent scene-level idle prompts from interrupting active mini-games.
    if (sceneState?.showEarsRhythmGame || sceneState?.showEyesTelescopeGame) return;

    if (idleHintLevel < 2) {
      idleVoGateRef.current = false;
      return;
    }
    if (idleVoGateRef.current) return;

    let idleKey = null;
    if (sceneState?.phase === PHASES.EYES_GAME) idleKey = 'idleEyes';
    else if (sceneState?.phase === PHASES.EARS_GAME && !hideEarsSymbol) idleKey = 'idleEars';
    else if (sceneState?.phase === PHASES.TUSK_GAME) idleKey = 'idleTusk';

    if (idleKey) {
      speakScenePrompt(idleKey);
      idleVoGateRef.current = true;
    }
  }, [sceneState?.phase, sceneState?.showEarsRhythmGame, sceneState?.showEyesTelescopeGame, idleHintLevel, hideEarsSymbol, speakScenePrompt]);

  // Reload Handling
  useEffect(() => {
    if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) return;

    console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.phase);
    reloadHandledRef.current = true;

    // If a game is actively running, restart it
    if (sceneState.showEyesTelescopeGame && sceneState.phase === PHASES.EYES_GAME) {
      console.log('🔄 Restarting EyesTelescopeGame');
      sceneActions.updateState({
        showEyesTelescopeGame: false,
        eyesGameComplete: false,
        foundInstruments: [],
        discoveredInstruments: {},
        instrumentsFound: 0
      });
      return;
    }

    if (sceneState.showEarsRhythmGame && sceneState.phase === PHASES.EARS_GAME) {
      console.log('🔄 Restarting EarsRhythmGame');
      sceneActions.updateState({
        showEarsRhythmGame: false,
        earsGamePhase: 'waiting',
        earsPlayerInput: [],
        earsCurrentSequence: [],
        earsSequenceItemsShown: 0,
        earsSequenceJustCompleted: false,
        earsReadyForNextNote: false,
        earsLastCompletedNote: null,
        currentNote: 'note1'
      });
      return;
    }

    if (sceneState.showTuskAssemblyGame && sceneState.phase === PHASES.TUSK_GAME) {
      console.log('🔄 Restarting Tusk Game');
      sceneActions.updateState({
        tuskPower: 0,
        tuskFullyPowered: false,
        tuskTransforming: false,
        ganeshaComplete: false,
        musicalNoteStates: { note1: 'locked', note2: 'locked', note3: 'locked' }
      });
      return;
    }

    if (sceneState.phase === PHASES.EYES_COMPLETE) {
      setTimeout(() => setRevealConfig({ symbolId: 'eyes', symbolImage: symbolEyesColored, symbolName: 'Eyes', affirmation: 'I see clearly.', sidebarTarget: getSidebarTarget('eyes') }), 500);
      return;
    }
    if (sceneState.phase === PHASES.EARS_COMPLETE) {
      setTimeout(() => setRevealConfig({ symbolId: 'ear', symbolImage: symbolEarColored, symbolName: 'Ears', affirmation: 'I listen with care.', sidebarTarget: getSidebarTarget('ear') }), 500);
      return;
    }
    if (sceneState.phase === PHASES.TUSK_COMPLETE) {
      setTimeout(() => setRevealConfig({ symbolId: 'tusk', symbolImage: symbolTuskColored, symbolName: 'Tusk', affirmation: 'I finish what I start.', sidebarTarget: getSidebarTarget('tusk') }), 500);
      return;
    }

    let message = "";
    if (sceneState.phase === PHASES.EYES_GAME) {
      message = "Tap the Eyes to find hidden instruments!";
    } else if (sceneState.phase === PHASES.EARS_GAME) {
      message = "Tap the Ears to master the rhythm!";
    } else if (sceneState.phase === PHASES.TUSK_GAME) {
      message = "Find Golden Notes to feed the Tusk!";
    } else if (sceneState.phase === PHASES.ALL_COMPLETE) {
      setShowSceneCompletion(true);
      return;
    }

    if (message) {
      setResumeMessage(message);
      setShowResumePopup(true);
      resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
    }

  }, [isReload, sceneState.phase, sceneState.welcomeShown, sceneState.showEyesTelescopeGame, sceneState.showEarsRhythmGame, sceneState.showTuskAssemblyGame]);

  // ==================== INTERACTION HANDLERS ====================

  const handleSmartDismiss = () => {
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
    }
  };

  const handleEyesClick = () => {
    resetHintCadence();
    handleSmartDismiss();
    if (sceneState.eyesGameComplete || sceneState.showEyesTelescopeGame || hideEyesSymbol) return;
    playUiTap();
    triggerMiniGesture('eyes', 1200, MINI_THUMBS_UP_ICON);
    setHideEyesSymbol(true);
    setShowEyesSparkleBurst(true);
    setTimeout(() => setShowEyesSparkleBurst(false), 500);
    if (!sceneState.welcomeShown) sceneActions.updateState({ welcomeShown: true });

    setTimeout(() => {
      sceneActions.updateState({
        showEyesTelescopeGame: true,
        eyesGameActive: true,
        activeGame: 'eyes'
      });
    }, 200);
  };

  const handleEarsClick = () => {
    resetHintCadence();
    handleSmartDismiss();
    if (!sceneState.earsVisible || sceneState.earsGameComplete || sceneState.showEarsRhythmGame || hideEarsSymbol) return;
    playUiTap();
    triggerMiniGesture('ears', 1200, MINI_THUMBS_UP_ICON);
    setHideEarsSymbol(true);
    setShowEarsSparkleBurst(true);
    setTimeout(() => setShowEarsSparkleBurst(false), 500);

    setTimeout(() => {
      sceneActions.updateState({
        showEarsRhythmGame: true,
        earsGameActive: true,
        musicalNotesVisible: true,
        activeGame: 'ears',
        currentNote: 'note1'
      });
    }, 200);
  };

  const unlockNote = (noteId) => {
    setMusicalNoteStates(prev => ({
      ...prev,
      [noteId]: NOTE_STATES.APPEARING
    }));
    setTimeout(() => {
      setMusicalNoteStates(prev => ({
        ...prev,
        [noteId]: NOTE_STATES.ACTIVE
      }));
    }, 1500);
  };

  const handleNoteDrop = ({ id, data }) => {
    if (!data || data.type !== 'tusk-note' || sceneState.tuskFullyPowered) return;

    const noteId = data.noteId;
    resetHintCadence();
    playUiTap();
    setMusicalNoteStates(prev => ({
      ...prev,
      [noteId]: NOTE_STATES.USED
    }));

    const newTuskPower = sceneState.tuskPower + 1;
    sceneActions.updateState({
      tuskPower: newTuskPower,
      tuskFullyPowered: newTuskPower === 3
    });

    playSparkle();
    setShowSparkle('tusk-feeding');
    setTimeout(() => setShowSparkle(null), 1500);
    triggerMiniGesture('note', 1200, MINI_THUMBS_UP_ICON);

    if (newTuskPower >= 3) {
      // T+0ms — tusk starts golden-fade in place
      setTuskTransforming(true);
      playGlow?.();

      // T+600ms — golden aura blooms
      safeSetTimeout(() => {
        setShowGoldenAura(true);
      }, 600);

      // T+1200ms — Ganesha begins emerging through the aura
      safeSetTimeout(() => {
        setGaneshaRevealing(true);
        sceneActions.updateState({ ganeshaComplete: true });
      }, 1200);

      // T+2400ms — aura fades, tusk is now hidden
      safeSetTimeout(() => {
        setShowGoldenAura(false);
        setTuskTransforming(false);
      }, 2400);

      // T+3000ms — trigger next step / game complete
      safeSetTimeout(() => {
        handleTuskGameComplete();
      }, 3000);
    }
  };

  const handleEyesGameComplete = () => {
    playChime();
    sceneActions.updateState({
      eyesGameComplete: true,
      showEyesTelescopeGame: false,
      phase: PHASES.EYES_COMPLETE
    });
    setShowSparkle('eyes-complete');
    triggerMiniGesture('center', 2000, MINI_VICTORY_ICON);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setRevealConfig({ symbolId: 'eyes', symbolImage: symbolEyesColored, symbolName: 'Eyes', affirmation: 'I see clearly.', sidebarTarget: getSidebarTarget('eyes') });
    }, 800);
  };

  const handleEarsGameComplete = () => {
    const completedNote = sceneState.currentNote;
    const isLastRound = completedNote === 'note3';

    sceneActions.updateState({
      showEarsRhythmGame: false,
      earsGamePhase: 'waiting',
      earsPlayerInput: [],
      earsCurrentSequence: [],
      earsSequenceItemsShown: 0
    });

    if (isLastRound) {
      playChime();
      setShowSparkle('ears-complete-final');
      triggerMiniGesture('center', 2000, MINI_VICTORY_ICON);
    } else {
      playSparkle();
      setShowSparkle('ears-round-complete');
      triggerMiniGesture('note', 1200, MINI_THUMBS_UP_ICON);
    }

    unlockNote(completedNote);

    const allNotesUnlocked = ['note1', 'note2', 'note3'].every(
      note => note <= completedNote || musicalNoteStates[note] === NOTE_STATES.ACTIVE
    );

    if (allNotesUnlocked) {
      setTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({
          earsGameComplete: true,
          musicalNotesVisible: true,
          showTuskAssemblyGame: true,
          tuskVisible: true,
          phase: PHASES.EARS_COMPLETE
        });
        setRevealConfig({ symbolId: 'ear', symbolImage: symbolEarColored, symbolName: 'Ears', affirmation: 'I listen with care.', sidebarTarget: getSidebarTarget('ear') });
      }, 3000);
    } else {
      setTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({
          showEarsRhythmGame: true,
          currentNote: completedNote === 'note1' ? 'note2' : 'note3'
        });
      }, 2000);
    }
  };

  const handleTuskGameComplete = () => {
    playChime();
    sceneActions.updateState({
      ganeshaComplete: true,
      showTuskAssemblyGame: true,
      phase: PHASES.TUSK_COMPLETE
    });
    setShowSparkle('tusk-complete');
    triggerMiniGesture('center', 2200, MINI_VICTORY_ICON);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setRevealConfig({ symbolId: 'tusk', symbolImage: symbolTuskColored, symbolName: 'Tusk', affirmation: 'I finish what I start.', sidebarTarget: getSidebarTarget('tusk') });
    }, 1000);
  };

  // shouldEnableHints / getHintConfigs removed — replaced by inline hint cadence (see useEffect above)

  // ── SymbolAutoReveal helpers ───────────────────────────────────────────────
  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2)
    };
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    if (symbolId === 'eyes') {
      safeSetTimeout(() => {
        playGlow();
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, eyes: true },
          earsVisible: true,
          phase: PHASES.EARS_GAME,
          activeGame: 'ears',
          currentFocus: 'ears'
        });
        triggerMiniGesture('ears', 1400, MINI_OK_ICON);
        setTimeout(() => setShowSparkle('ears-materialize'), 0);
        setTimeout(() => setShowSparkle(null), 2000);
      }, 950);
    } else if (symbolId === 'ear' || symbolId === 'ears') {
      safeSetTimeout(() => {
        playGlow();
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, ears: true, ear: true },
          showTuskAssemblyGame: true,
          tuskGameActive: true,
          showGaneshaOutline: true,
          phase: PHASES.TUSK_GAME,
          activeGame: 'tusk',
          currentFocus: 'tusk',
          musicalNoteStates: { note1: 'golden', note2: 'golden', note3: 'golden' }
        });
        triggerMiniGesture('note', 1400, MINI_OK_ICON);
        setTimeout(() => setShowSparkle('tusk-activate'), 0);
        setTimeout(() => setShowSparkle(null), 2000);
      }, 950);
    } else if (symbolId === 'tusk') {
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, tusk: true },
          phase: PHASES.ALL_COMPLETE,
          completed: false,
          stars: 9,
          progress: { percentage: 100, starsEarned: 9, completed: false }
        });
        setShowSparkle('final-fireworks');
      }, 950);
    }
  };

  // Keep completion UI sticky across tab switch/remount.
  useEffect(() => {
    if (sceneState?.showingCompletionScreen && !showSceneCompletion) {
      setShowSceneCompletion(true);
      setShowSparkle(null);
    }
  }, [sceneState?.showingCompletionScreen, showSceneCompletion]);

  const isCompletionView = showSceneCompletion || sceneState?.showingCompletionScreen;
  const showPhaseTestButtons = true;

  // GameLayout replaced with plain div — pause menu removed
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="symbol-mountain-scene-v2-container">
            <HomeButton onNavigate={onNavigate} />
            <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => onNavigate?.('zone-welcome')} />
            <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
            <div className="mountain-background" style={{ backgroundImage: `url(${mountainBackground})` }}>
              {!isCompletionView && (
                <>
                  {showPhaseTestButtons && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '70px',
                        left: '20px',
                        zIndex: 120,
                        display: 'flex',
                        gap: '10px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          reloadHandledRef.current = true;
                          stopSpokenVoice();
                          sceneActions.updateState({
                            phase: PHASES.EARS_GAME,
                            activeGame: 'ears',
                            currentFocus: 'ears',
                            welcomeShown: true,
                            discoveredSymbols: {
                              ...(sceneState.discoveredSymbols || {}),
                              eyes: true
                            },
                            eyesGameComplete: true,
                            earsVisible: true,
                            earsGameComplete: false,
                            showEarsRhythmGame: true,
                            currentNote: 'note1',
                            musicalNotesVisible: false,
                            showTuskAssemblyGame: false,
                            tuskGameActive: false,
                            showGaneshaOutline: false,
                            tuskPower: 0,
                            tuskFullyPowered: false,
                            tuskTransforming: false,
                            ganeshaComplete: false
                          });
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.6)',
                          background: 'rgba(74, 47, 110, 0.8)',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Test Phase 2
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          reloadHandledRef.current = true;
                          stopSpokenVoice();
                          sceneActions.updateState({
                            phase: PHASES.TUSK_GAME,
                            activeGame: 'tusk',
                            currentFocus: 'tusk',
                            welcomeShown: true,
                            discoveredSymbols: {
                              ...(sceneState.discoveredSymbols || {}),
                              eyes: true,
                              ears: true,
                              ear: true
                            },
                            eyesGameComplete: true,
                            earsVisible: true,
                            earsGameComplete: true,
                            showEarsRhythmGame: false,
                            musicalNotesVisible: true,
                            musicalNoteStates: {
                              note1: 'golden',
                              note2: 'golden',
                              note3: 'golden'
                            },
                            showTuskAssemblyGame: true,
                            tuskGameActive: true,
                            showGaneshaOutline: true,
                            tuskPower: 0,
                            tuskFullyPowered: false,
                            tuskTransforming: false,
                            ganeshaComplete: false
                          });
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.6)',
                          background: 'rgba(74, 47, 110, 0.8)',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Test Phase 3
                      </button>
                    </div>
                  )}

              {!sceneState?.welcomeShown && (
                <OpeningModal
                  zoneId={zoneId}
                  sceneId={sceneId}
                  onStart={() => {
                    sceneActions.updateState({ welcomeShown: true });
                  }}
                  characterImg={ganeshaCharacter}
                  showButton={true}
                />
              )}

              {/* UNIFIED HEADERS FOR PHASES — commented out */}
              {/* {!revealConfig && sceneState?.welcomeShown && (
                <>
                  {sceneState.phase === PHASES.EYES_GAME && !sceneState.eyesGameComplete && !sceneState.showEyesTelescopeGame && (
                    <UnifiedHeaderV2 zone="symbol-mountain" title="DISCOVER DIVINE VISION! Click the sacred eyes!" currentRound={0} totalRounds={1} />
                  )}
                  {sceneState.earsVisible && !sceneState.earsGameComplete && !sceneState.showEarsRhythmGame && (
                    <UnifiedHeaderV2 zone="symbol-mountain" title="MASTER SACRED RHYTHMS! Click the divine ears!" currentRound={0} totalRounds={1} />
                  )}
                  {sceneState.showTuskAssemblyGame && !sceneState.ganeshaComplete && (
                    <UnifiedHeaderV2 zone="symbol-mountain" title="ASSEMBLE GANESHA! Click golden notes!" currentRound={2} totalRounds={3} />
                  )}
                </>
              )} */}

              {/* EYES SYMBOL */}
              {sceneState.welcomeShown && !sceneState.discoveredSymbols?.eyes && !sceneState.showEyesTelescopeGame && !hideEyesSymbol && (
                <div
                  className={`eyes eyes-symbol-container ${sceneState.eyesGameComplete ? 'completed' : 'active'} ${sceneState.phase === PHASES.EYES_GAME ? hintClassName : ''} ${hideEyesSymbol ? 'hide' : ''}`}
                  onClick={handleEyesClick}
                >
                  <ClickableElement id="eyes-symbol" onClick={handleEyesClick} completed={sceneState.eyesGameComplete} zone="eyes-zone">
                    <img src={ganeshaEyes} alt="Divine Eyes" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
                  {showEyesSparkleBurst && <div className="sparkle-burst" aria-hidden="true" />}
                  {showSparkle === 'eyes-complete' && (
                    <SparkleAnimation
                      type="magic"
                      count={24}
                      color="#64b5f6"
                      size={12}
                      duration={1400}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* GANESHA MICRO-REWARD GESTURE CUE */}
              {miniGesture.show && (
                <div
                  key={miniGesture.key}
                  className={`ganesha-gesture-cue modak-mini-ganesha-cue modak-mini-ganesha-cue--${miniGesture.target}`}
                  style={{ '--mini-cue-duration': `${miniGesture.durationMs}ms` }}
                  aria-hidden="true"
                >
                  <img className="modak-mini-gesture-icon" src={miniGesture.icon} alt="" />
                </div>
              )}

              {/* EYES GAME */}
              {sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes && (
                <EyesTelescopeGame
                  isActive={sceneState.showEyesTelescopeGame}
                  instrumentPositions={instrumentPositions}
                  instrumentSizes={instrumentSizesByType}
                  discoveryRadius={15}
                  profileName={profileName}
                  initialDiscoveredInstruments={sceneState.discoveredInstruments || {}}
                  initialFoundInstruments={sceneState.foundInstruments || []}
                  isReload={isReload && sceneState.showEyesTelescopeGame}
                  onInstrumentFound={(instrumentType, allFound, discovered) => {
                    resetHintCadence();
                    playSparkle();
                    triggerMiniGesture('eyes', 1100, MINI_THUMBS_UP_ICON);
                    sceneActions.updateState({ foundInstruments: allFound, discoveredInstruments: discovered, instrumentsFound: allFound.length });
                  }}
                  onAllInstrumentsFound={(allFound, discovered) => {
                    sceneActions.updateState({
                      foundInstruments: allFound,
                      discoveredInstruments: discovered,
                      instrumentsFound: 4,
                      eyesGameComplete: true,
                      showEyesTelescopeGame: false,
                      phase: PHASES.EYES_COMPLETE
                    });
                    setTimeout(() => handleEyesGameComplete(), 1000);
                  }}
                  onClose={() => sceneActions.updateState({ showEyesTelescopeGame: false })}
                />
              )}

              {/* EARS SYMBOL */}
              {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && !sceneState.showEarsRhythmGame && !hideEarsSymbol && (
                <div
                  className={`symbol-trigger ears-symbol-container ${sceneState.earsGameComplete ? 'completed' : 'active'} materialized ${sceneState.phase === PHASES.EARS_GAME && sceneState.earsVisible && !sceneState.earsGameComplete ? hintClassName : ''} ${hideEarsSymbol ? 'hide' : ''}`}
                  onClick={handleEarsClick}
                >
                  <ClickableElement id="ears-symbol" onClick={handleEarsClick} completed={sceneState.earsGameComplete} zone="ears-zone">
                    <img src={ganeshaEars} alt="Sacred Ears" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
                  {showEarsSparkleBurst && <div className="sparkle-burst" aria-hidden="true" />}
                  {(showSparkle === 'ears-materialize' || showSparkle === 'ears-round-complete' || showSparkle === 'ears-complete-final') && (
                    <SparkleAnimation
                      type={showSparkle === 'ears-complete-final' ? 'magic' : 'glitter'}
                      count={showSparkle === 'ears-complete-final' ? 28 : 16}
                      color={showSparkle === 'ears-complete-final' ? '#ffd54f' : 'gold'}
                      size={15}
                      duration={2000}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* EARS GAME */}
              {sceneState.showEarsRhythmGame && (
                <EarsRhythmGame
                  isActive={sceneState.showEarsRhythmGame}
                  currentNote={sceneState.currentNote || 'note1'}
                  discoveredInstruments={sceneState.discoveredInstruments}
                  instrumentPositions={instrumentPositionsByType}
                  instrumentSizes={instrumentSizesByType}
                  profileName={profileName}
                  isReload={isReload && sceneState.showEarsRhythmGame}
                  initialGamePhase={sceneState.earsGamePhase || 'waiting'}
                  initialPlayerInput={sceneState.earsPlayerInput || []}
                  initialCurrentSequence={sceneState.earsCurrentSequence || []}
                  initialSequenceItemsShown={sceneState.earsSequenceItemsShown || 0}
                  sequenceJustCompleted={sceneState.earsSequenceJustCompleted || false}
                  readyForNextNote={sceneState.earsReadyForNextNote || false}
                  lastCompletedNote={sceneState.earsLastCompletedNote || null}
                  onGuidanceEvent={(eventKey, payload) => speakScenePrompt(eventKey, payload)}
                  onSequenceComplete={(noteId) => {
                    const newNoteStates = { ...sceneState.musicalNoteStates, [noteId]: 'golden' };
                    const roundNum = noteId === 'note1' ? 1 : noteId === 'note2' ? 2 : 3;
                    sceneActions.updateState({
                      musicalNoteStates: newNoteStates,
                      earsGamePhase: 'waiting',
                      earsPlayerInput: [],
                      earsCurrentSequence: [],
                      earsSequenceItemsShown: 0,
                      earsSequenceJustCompleted: false,
                      earsReadyForNextNote: false,
                      earsLastCompletedNote: null
                    });
                    // Stage celebration: brief pause, then note lights up with sparkle.
                    setTimeout(() => {
                      unlockNote(noteId);
                      playChime();
                      setShowSparkle(`note-${noteId}-golden`);
                      setTimeout(() => setShowSparkle(null), 2200);
                    }, 800);
                    setTimeout(() => {
                      speakScenePrompt(`successRound${roundNum}`);
                    }, 1200);

                    const goldenNotes = Object.values(newNoteStates).filter(state => state === 'golden');
                    if (goldenNotes.length === 3) handleEarsGameComplete();
                    else {
                      const nextNote = noteId === 'note1' ? 'note2' : 'note3';
                      setTimeout(() => sceneActions.updateState({ currentNote: nextNote }), 3000);
                    }
                  }}
                  onGameComplete={() => handleEarsGameComplete()}
                  onClose={() => sceneActions.updateState({ showEarsRhythmGame: false })}
                />
              )}

              {/* MUSICAL NOTES */}
              {sceneState.musicalNotesVisible && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '16px',
                    zIndex: 40
                  }}
                >
                  {musicalNoteData.map((note) => {
                    const state = musicalNoteStates[note.id];
                    const isLocked = state === NOTE_STATES.LOCKED;
                    const isAppearing = state === NOTE_STATES.APPEARING;
                    const isActive = state === NOTE_STATES.ACTIVE;
                    const isUsed = state === NOTE_STATES.USED;
                    const noteBoxSize = isLocked ? 58 : 78;
                    const noteIconSize = isLocked ? 52 : 72;
                    const canDrag = isActive && !isUsed && sceneState.showTuskAssemblyGame;

                    return (
                      <KidsDraggable
                        key={note.id}
                        id={`tusk-note-${note.id}`}
                        data={{ type: 'tusk-note', noteId: note.id }}
                        dragScale={1}
                        dragFilter="none"
                        dragBorderRadius="0"
                        draggable={canDrag}
                        style={{
                          position: 'relative',
                          width: `${noteBoxSize}px`,
                          height: `${noteBoxSize}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.5s ease',
                          cursor: canDrag ? 'grab' : 'default',
                          background: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          opacity: isUsed ? 0 : 1,
                          pointerEvents: isUsed ? 'none' : 'auto',
                          animation: isAppearing ? 'noteAppear 1.5s ease-out' :
                            isActive && !isUsed ? 'gentlePulse 2s ease-in-out infinite' : 'none'
                        }}
                        className={`tusk-note ${isActive && sceneState.phase === PHASES.TUSK_GAME ? hintClassName : ''}`}
                      >
                        <img
                          src={noteNewIcon}
                          alt="Music note"
                          style={{
                            width: `${noteIconSize}px`,
                            height: `${noteIconSize}px`,
                            objectFit: 'contain',
                            opacity: isLocked ? 0.32 : 1,
                            filter: isLocked
                              ? 'grayscale(1) saturate(0.3) brightness(0.92)'
                              : isActive || isUsed
                                ? 'grayscale(0) saturate(1.2) drop-shadow(0 0 10px rgba(255, 208, 76, 0.75))'
                                : 'grayscale(0) saturate(1.05)',
                            transform: isLocked ? 'scale(1)' : 'scale(1.06)',
                            transition: 'all 0.35s ease'
                          }}
                        />
                        {isAppearing && (
                          <div
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              background: 'radial-gradient(circle, rgba(255,215,0,0.75) 0%, transparent 70%)',
                              animation: 'sparkleBurst 1.2s ease-out'
                            }}
                          />
                        )}
                      </KidsDraggable>
                    );
                  })}
                </div>
              )}

              {/* TUSK ASSEMBLY AREA */}
              {sceneState.showTuskAssemblyGame && (
                <KidsDropZone
                  id="tusk-drop-zone"
                  accepts="tusk-note"
                  onDrop={handleNoteDrop}
                  disabled={sceneState.tuskFullyPowered}
                  style={{
                    position: 'absolute', top: '45%', left: '50%', width: '200px', height: '220px', transform: 'translate(-50%, -50%)', zIndex: 15, pointerEvents: 'auto'
                  }}
                >
                  <div className="sacred-tusk-assembly-area" style={{
                    position: 'relative', width: '100%', height: '100%', pointerEvents: 'none'
                  }}>
                    {/* TUSK — applies golden fade animation when transforming */}
                    {sceneState.tuskPower < 3 && (
                      <div style={{ position: 'absolute', left: '35%', top: '50%', width: '300px', height: '300px', transform: 'translate(-50%, -50%)', zIndex: 30, pointerEvents: 'none' }}>
                        <img
                          src={ganeshaTusk}
                          alt="Tusk"
                          className={tuskTransforming ? 'tusk-final-transform' : ''}
                          style={{
                            width: '100%',
                            height: '100%',
                            filter: !tuskTransforming ? (sceneState.tuskPower > 0 ? `brightness(${1.2 + (sceneState.tuskPower * 0.2)}) drop-shadow(0 0 ${12 + (sceneState.tuskPower * 8)}px #ffd700)` : 'brightness(1.1)') : 'inherit',
                            transition: 'all 0.8s ease',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}

                    {/* GOLDEN AURA — only visible during transition */}
                    {showGoldenAura && (
                      <div
                        className="golden-burst"
                        style={{
                          left: '35%',
                          top: '50%',
                          zIndex: 5
                        }}
                      />
                    )}

                    {/* GANESHA — reveal animation on first appearance, then steady pulse */}
                    {sceneState.ganeshaComplete && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '35%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '640px',
                          height: '700px',
                          pointerEvents: 'none',
                          zIndex: 10,
                        }}
                        className={`
                          ${ganeshaRevealing ? 'ganesha-reveal' : ''}
                          ${sceneState.ganeshaComplete && !ganeshaRevealing ? 'ganesha-glow' : ''}
                        `}
                        onAnimationEnd={() => {
                          if (ganeshaRevealing) setGaneshaRevealing(false);
                        }}
                      >
                        <img src={GANESHA_SIT_FEED_IMAGE} alt="Ganesha" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}

                    {/* OPTIONAL — golden dust particles after reveal */}
                    {sceneState.ganeshaComplete && !ganeshaRevealing && (
                      <div className="golden-dust" style={{ position: 'absolute', width: '640px', height: '700px', left: '35%', top: '50%', transform: 'translate(-50%, -50%)' }} />
                    )}
                    {(showSparkle === 'tusk-feeding' || showSparkle === 'tusk-activate' || showSparkle === 'tusk-complete' || showSparkle === 'ganesha-complete') && (
                      <SparkleAnimation
                        type={showSparkle === 'tusk-complete' || showSparkle === 'ganesha-complete' ? 'magic' : 'star'}
                        count={showSparkle === 'tusk-feeding' ? 12 : 24}
                        color={showSparkle === 'tusk-feeding' ? '#fff176' : '#ffd54f'}
                        size={12}
                        duration={1500}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                </KidsDropZone>
              )}

              {/* PROGRESSIVE HINTS — commented out, replaced by inline hint cadence */}
              {/* {sceneState.welcomeShown && (
                <ProgressiveHintSystem
                  ref={progressiveHintRef}
                  sceneId={sceneId}
                  sceneState={sceneState}
                  hintConfigs={getHintConfigs()}
                  characterImage={eyesCoach}
                  initialDelay={12000}
                  hintDisplayTime={10000}
                  position="bottom-right"
                  iconSize={60}
                  zIndex={2000}
                  enabled={shouldEnableHints()}
                  disabledMessage="Great job!"
                />
              )} */}

              {/* REMOVED MANUAL NAV & BACK BUTTON (Handled by GameLayout) */}

              <CulturalCelebrationModal show={showCulturalCelebration} onClose={() => setShowCulturalCelebration(false)} {...CulturalProgressExtractor.getCulturalProgressData()} />
                </>
              )}
            </div>

            {/* 3-2-1 RESUME COUNTDOWN — shows on tab return */}
            <ResumeCountdown value={countdownValue} />

            {/* SIDEBAR */}
            {!isCompletionView && sceneState.welcomeShown && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true, modak: true, belly: true, lotus: true, trunk: true,
                  ...(sceneState.discoveredSymbols || {}),
                  // Keep sidebar alias in sync with game-logic alias.
                  ear: sceneState?.discoveredSymbols?.ear || sceneState?.discoveredSymbols?.ears || false
                }}
                onSymbolClick={(id) => console.log(`Symbol clicked: ${id}`)}
                onPopupOpen={() => {
                  setIsSymbolPopupOpen(true);
                  stopSpokenVoice();
                  resetIdleBaseline();
                }}
                onPopupClose={() => {
                  setIsSymbolPopupOpen(false);
                  resetHintCadence();
                  const replayKey = getPromptKeyForPhase();
                  if (replayKey) speakScenePrompt(replayKey);
                }}
              />
            )}

            {/* RESUME POPUP (commented out) */}
            {/*
            {showResumePopup && (
              <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                padding: '30px 50px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                zIndex: 9999, fontFamily: 'Baloo 2, cursive', fontSize: '28px', fontWeight: 'bold',
                color: '#5D2E0F', textAlign: 'center', maxWidth: '80%', border: '4px solid #FF8C00'
              }}>
                {resumeMessage}
              </div>
            )}
            */}

            {/* ── SYMBOL AUTO-REVEAL (replaces SimpleDiscoveryOverlay) ───────────────
                Flip card: symbol image → affirmation → user taps → flies to sidebar */}
            {!isCompletionView && revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                sidebarTargetRect={revealConfig.sidebarTarget}
                enableVoicePrompts={true}
                enableTapHintPrompt={!sceneState?.discoveredSymbols?.eyes}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* ── SimpleDiscoveryOverlay — COMMENTED OUT (superseded by SymbolAutoReveal) ──
            {showDiscoveryFlip1 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found Ganesha's Eye Magic!"
                ...
              />
            )}
            {showDiscoveryFlip2 && ( <SimpleDiscoveryOverlay ... /> )}
            {showDiscoveryFlip3 && ( <SimpleDiscoveryOverlay ... /> )}
            ── End SimpleDiscoveryOverlay ── */}

            {/* FIREWORKS & COMPLETION */}
            {!isCompletionView && showSparkle === 'final-fireworks' && (
              <>
                <FireworksCompletion
                  show={showSparkle === 'final-fireworks'}
                  showCard={false}
                />
                <CalmGoldenFireworks
                  show={showSparkle === 'final-fireworks'}
                  particles={14}
                  duration={3500}
                  onComplete={() => {
                    setShowSparkle(null);
                    const profileId = localStorage.getItem('activeProfileId');
                    if (profileId) {
                      GameStateManager.saveGameState('symbol-mountain', 'symbol', {
                        completed: true, stars: 9, symbols: { eyes: true, ears: true, tusk: true },
                        phase: 'complete', unlocked: true, timestamp: Date.now()
                      });
                      localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_symbol`);
                      SimpleSceneManager.clearCurrentScene();
                    }
                    setShowSceneCompletion(true);
                  }}
                />
              </>
            )}

            {isCompletionView && (
              <SceneCompletionCelebration
                show={isCompletionView}
                sceneName="Musical Mountain Adventure"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                sceneNumber={3}
                totalScenes={4}
                starsEarned={9}
                totalStars={9}
                discoveredSymbols={['eyes', 'ears', 'tusk']}
                symbolImages={{
                  eyes: symbolEyesColored,
                  ears: symbolEarColored,
                  tusk: symbolTuskColored
                }}
                symbolData={{
                  eyes: {
                    title: "Eyes — Ganesha's Wise Vision!",
                    description: "Ganesha's eyes see everything clearly — the big picture and the tiny details. They remind us to look carefully before we act!"
                  },
                  ears: {
                    title: "Ears — Ganesha's Super Listeners!",
                    description: "Ganesha's big ears hear every word. They remind us to listen with our whole heart and learn from everything around us."
                  },
                  tusk: {
                    title: "Tusk — Ganesha's Writing Tool!",
                    description: "Ganesha broke his own tusk to write a great story! It shows us that we can turn any challenge into something amazing."
                  }
                }}
                nextSceneName="Final Assembly"
                sceneId="symbol"
                completionData={{ stars: 9, symbols: { eyes: true, ears: true, tusk: true }, completed: true, totalStars: 9 }}
                onComplete={onComplete}
                onReplay={() => { setShowSceneCompletion(false); resetScene(); }}
                onContinue={() => {
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'symbol', {
                      completed: true, stars: 9, symbols: { eyes: true, ears: true, tusk: true }
                    });
                  }
                  setTimeout(() => {
                    SimpleSceneManager.setCurrentScene('symbol-mountain', 'final-scene', false, false);
                    onNavigate?.('scene-complete-continue');
                  }, 100);
                }}
              />
            )}
          </div>
        </MessageManager>
      </InteractionManager>
    </div>
  );
};

export default SymbolMountainSceneV3;
