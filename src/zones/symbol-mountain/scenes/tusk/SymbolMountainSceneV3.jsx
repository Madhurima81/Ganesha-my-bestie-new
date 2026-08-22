// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV3.jsx
// ?? Complete Musical Mountain Scene - Final Migration V5

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SymbolMountainScene.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure themes are loaded
import { getCompletionModal } from '../../../../lib/config/content';

// --- NEW MASTER LAYOUT & CONFIG ---
// import GameLayout from '../../../../lib/components/layout/GameLayout';  // commented out â€” pause menu removed
// import { symbolHelpConfig } from './helpConfig';                         // commented out â€” help config removed
// ----------------------------------

// Unified Components
// import UnifiedHeaderV2 from '../../../../lib/components/ui/Header/UnifiedHeaderV2'; // commented out â€” header removed
import OpeningModal from '../../../shared/components/OpeningModal';

// Pause-aware timeout, resume countdown, SFX
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import { Analytics } from '../../../../lib/services/analytics';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
// import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue'; // commented out â€” inline gesture used
// import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';               // commented out â€” inline implementation
// import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';  // commented out â€” nav removed
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Import game components
import EyesPopUpGame from './EyesPopUpGame';
import EarsSoundMatchGame from './EarsSoundMatchGame';
import TuskPathGame from './TuskPathGame';

// UI Components
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
// import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem'; // removed â€” replaced by inline hint cadence
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';
// import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay'; // superseded by SymbolAutoReveal
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Images
import mountainBackground from '../tusk/assets/images/trail-bg.webp';
import ganeshaCharacter from './assets/images/ganesha-character.webp';

// Symbol Icons
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-new.webp';
import symbolEarColored from '../../shared/images/icons/symbol-ears-new.webp';
import symbolTuskColored from '../../shared/images/icons/broken-tusk-symbol.webp';
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.webp';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.webp';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.webp';


// Shared countdown duration â€” must match across useResumeCountdown + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;
const GANESHA_REVEAL_IMAGE = '/images/ganesha-sit.svg';

// Mini gesture icons (same pattern as Pond / Modak)
const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MINI_VICTORY_ICON = '/images/hand-victory.svg';
const MINI_OK_ICON = '/images/hand-ok.svg';

const VOICE_LINES = {
  opening: "Let's explore... look and listen.",
  eyes: 'Look closely and spot what is hidden.',
  ears: 'Listen carefully and match the sounds.',
  eyesSetup: 'You looked carefully... and found them all.',
  earsSetup: 'You listened closely... and got it right.',
  tuskSetup: 'You kept going... and cleared the way.',
  tusk: 'My tusk is hidden beyond this blocked path. Let us clear the way together.',
  idleEyes: 'Look closely... you can find them.',
  idleEars: 'Listen carefully... then choose the match.',
  idleTusk: 'Choose the friend who can help, then clear the obstacle.',
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

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
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
          currentNote: 'note1',
          earsGamePhase: 'waiting',
          earsPlayerInput: [],
          earsCurrentSequence: [],
          earsSequenceItemsShown: 0,
          earsSequenceJustCompleted: false,
          earsReadyForNextNote: false,
          earsLastCompletedNote: null,

          showTuskAssemblyGame: false,
          tuskGameActive: false,
          tuskObstaclePosition: null,
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
  const sceneStateRef = useRef(sceneState);
  sceneStateRef.current = sceneState;

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'Friend';

  // Local UI states
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const [tuskTestRunKey, setTuskTestRunKey] = useState(0);
  const [tuskZoomActive, setTuskZoomActive] = useState(false);
  const [tuskFadeOut, setTuskFadeOut] = useState(false);
  const [tuskTransforming, setTuskTransforming] = useState(false);
  const [showGoldenAura, setShowGoldenAura] = useState(false);
  const [ganeshaRevealing, setGaneshaRevealing] = useState(false);

  // SymbolAutoReveal state
  const [revealConfig, setRevealConfig] = useState(null);
  const isEarRevealActive = revealConfig?.symbolId === 'ear' || revealConfig?.symbolId === 'ears';
  const isTuskGameVisible = sceneState?.showTuskAssemblyGame && !isEarRevealActive;
  const getPromptKeyForPhase = useCallback(() => {
    if (!sceneState?.welcomeShown) return 'opening';
    if (sceneState.phase === PHASES.EYES_GAME && !sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes) return 'eyes';
    if (sceneState.phase === PHASES.EARS_GAME && sceneState.earsVisible && !sceneState.showEarsRhythmGame && !sceneState.discoveredSymbols?.ears) return 'ears';
    if (sceneState.phase === PHASES.TUSK_GAME && isTuskGameVisible && !sceneState.ganeshaComplete) return 'tusk';
    if (sceneState.phase === PHASES.ALL_COMPLETE) return 'complete';
    return null;
  }, [
    sceneState?.discoveredSymbols?.ears,
    sceneState?.discoveredSymbols?.eyes,
    sceneState?.earsVisible,
    sceneState?.ganeshaComplete,
    isTuskGameVisible,
    sceneState?.phase,
    sceneState?.showEarsRhythmGame,
    sceneState?.showEyesTelescopeGame,
    sceneState?.showTuskAssemblyGame,
    sceneState?.welcomeShown
  ]);

  // -- Inline mini-gesture (same pattern as NewModakSceneV7) -----------------
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

  // -- Inline hint cadence state (same pattern as NewModakSceneV7) ------------
  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const idleHintsEnabled = true;
  // Incremented each time child returns from a tab switch â€” resets hint timer
  const [hintResetKey, setHintResetKey] = useState(0);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;

  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const lastAnnouncedPromptRef = useRef(null);
  const openingVoPlayedRef = useRef(false);
  const idleVoGateRef = useRef(false);
  const revealVoKeyRef = useRef(null);
  const wasAudioOnRef = useRef(isAudioOn);

  // -- Voice guidance (music + SFX enabled) ---------------------------------
  const { startMusic, stopMusic, playCorrect, playPowerUnlock } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: true, musicVolume: 0.1, voiceVolume: 1, sfxVolume: 0.7, idleTimeout: 20 }
  );
  useEffect(() => {
    if (sceneState?.welcomeShown) startMusic();
    return () => stopMusic();
  }, [sceneState?.welcomeShown, startMusic, stopMusic]);

  // -- SFX ------------------------------------------------------------------
  const playChime = playCorrect;
  const playGlow = playPowerUnlock;

  // -- Resume countdown (3-2-1 on tab return) -------------------------------
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  // -- Pause-aware safeSetTimeout â€” pauses on tab hide, resumes after countdown
  // onShow goes through a live ref (same pattern as NewModakSceneV7) so the
  // callback never captures a stale sceneState/phase from the mount render.
  const onTabReturnImplRef = useRef(null);
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => stopSpokenVoice(),
    onShow: () => onTabReturnImplRef.current?.(),
    resumeDelay: RESUME_DELAY_MS,
  });

  const resumePopupTimeoutRef = useRef(null);
  const reloadHandledRef = useRef(false);

  // Backfill missing phase for older saved state objects (effect, not render).
  useEffect(() => {
    if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.EYES_GAME });
  }, [sceneState?.phase, sceneActions]);
  useEffect(() => {
    Analytics.sceneStarted(zoneId, sceneId);
    return () => {
      if (!sceneStateRef.current?.completed) {
        Analytics.sceneAbandoned(zoneId, sceneId);
      }
    };
  }, [zoneId, sceneId]);
  // const progressiveHintRef = useRef(null); // removed â€” ProgressiveHintSystem removed



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


  const speakScenePrompt = useCallback((key, options = {}) => {
    if (!isAudioOn || !VOICE_LINES[key]) return;
    speak(VOICE_LINES[key], {
      age: 7,
      style: 'child',
      moment: key === 'complete' ? 'celebration' : 'encouragement',
      onEnd: options?.onEnd
    });
  }, [isAudioOn, speak]);
  const replayCurrentVoice = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) speakScenePrompt(replayKey);
  }, [getPromptKeyForPhase, speakScenePrompt]);

  // Reassigned every render so the tab-return handler always sees live state.
  onTabReturnImplRef.current = () => {
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
  };


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

  useEffect(() => {
    const wasAudioOn = wasAudioOnRef.current;
    wasAudioOnRef.current = isAudioOn;

    // Recover VO when user turns sound back on mid-scene.
    if (!wasAudioOn && isAudioOn) {
      idleVoGateRef.current = false;
      lastAnnouncedPromptRef.current = null;

      if (!sceneState?.welcomeShown) {
        openingVoPlayedRef.current = true;
        speakScenePrompt('opening');
        return;
      }

      if (revealConfig?.symbolId === 'eyes') {
        revealVoKeyRef.current = 'eyes';
        speakScenePrompt('eyesSetup');
        return;
      }

      if (revealConfig?.symbolId === 'ear' || revealConfig?.symbolId === 'ears') {
        revealVoKeyRef.current = 'ears';
        speakScenePrompt('earsSetup');
        return;
      }

      const replayKey = getPromptKeyForPhase();
      if (replayKey) speakScenePrompt(replayKey);
    }
  }, [isAudioOn, sceneState?.welcomeShown, revealConfig, getPromptKeyForPhase, speakScenePrompt]);

  // Opening modal VO: play when modal is visible, not on Start tap.
  useEffect(() => {
    if (sceneState?.welcomeShown) return;
    if (openingVoPlayedRef.current) return;
    if (!isAudioOn) return;
    const timer = setTimeout(() => {
      openingVoPlayedRef.current = true;
      speakScenePrompt('opening');
    }, 700);
    return () => clearTimeout(timer);
  }, [sceneState?.welcomeShown, isAudioOn, speakScenePrompt]);

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
      !sceneState.discoveredSymbols?.ears
    ) {
      promptKey = 'ears';
    } else if (sceneState.phase === PHASES.TUSK_GAME && isTuskGameVisible && !sceneState.ganeshaComplete) {
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
    isTuskGameVisible,
    sceneState?.discoveredSymbols?.eyes,
    sceneState?.discoveredSymbols?.ears,
    
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
    else if (sceneState?.phase === PHASES.EARS_GAME) idleKey = 'idleEars';
    else if (sceneState?.phase === PHASES.TUSK_GAME && sceneState?.showTuskAssemblyGame) idleKey = 'idleTusk';

    if (idleKey) {
      speakScenePrompt(idleKey);
      idleVoGateRef.current = true;
    }
  }, [sceneState?.phase, sceneState?.showEarsRhythmGame, sceneState?.showEyesTelescopeGame, sceneState?.showTuskAssemblyGame, idleHintLevel,  speakScenePrompt]);

  // Reload Handling
  useEffect(() => {
    if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) return;

    if (import.meta.env.DEV) console.log('RELOAD DETECTED - Resuming from phase:', sceneState.phase);
    reloadHandledRef.current = true;

    // If a game is actively running, restart it
    if (sceneState.showEyesTelescopeGame && sceneState.phase === PHASES.EYES_GAME) {
      if (import.meta.env.DEV) console.log('Restarting EyesTelescopeGame');
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
      if (import.meta.env.DEV) console.log('Restarting EarsRhythmGame');
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
      if (import.meta.env.DEV) console.log('Restarting Tusk Game');
      sceneActions.updateState({
        ganeshaComplete: false,
        showTuskAssemblyGame: false,
        tuskGameActive: false
      });
      return;
    }

    if (sceneState.phase === PHASES.EYES_COMPLETE) {
      safeSetTimeout(() => setRevealConfig({ symbolId: 'eyes', symbolImage: symbolEyesColored, symbolName: 'Eyes', affirmation: 'I see clearly.', sidebarTarget: getSidebarTarget('eyes'), sayWithMeDelayMs: 3200 }), 500);
      return;
    }
    if (sceneState.phase === PHASES.EARS_COMPLETE) {
      safeSetTimeout(() => setRevealConfig({ symbolId: 'ear', symbolImage: symbolEarColored, symbolName: 'Ears', affirmation: 'I listen with care.', sidebarTarget: getSidebarTarget('ear'), sayWithMeDelayMs: 3200 }), 500);
      return;
    }
    if (sceneState.phase === PHASES.TUSK_COMPLETE) {
      safeSetTimeout(() => setRevealConfig({ symbolId: 'tusk', symbolImage: symbolTuskColored, symbolName: 'Tusk', affirmation: 'I finish what I start.', sidebarTarget: getSidebarTarget('tusk'), sayWithMeDelayMs: 3200 }), 500);
      return;
    }

    if (sceneState.phase === PHASES.ALL_COMPLETE) {
      setShowSceneCompletion(true);
      return;
    }

  }, [isReload, sceneState.phase, sceneState.welcomeShown, sceneState.showEyesTelescopeGame, sceneState.showEarsRhythmGame, sceneState.showTuskAssemblyGame]);

  // Auto-start games by phase (no symbol tap required).
  useEffect(() => {
    if (!sceneState?.welcomeShown) return;
    if (revealConfig) return;

    if (
      sceneState.phase === PHASES.EYES_GAME &&
      !sceneState.showEyesTelescopeGame &&
      !sceneState.eyesGameComplete &&
      !sceneState.discoveredSymbols?.eyes
    ) {
      sceneActions.updateState({ showEyesTelescopeGame: true, earsVisible: false });
      return;
    }

    if (
      sceneState.phase === PHASES.EARS_GAME &&
      !sceneState.showEarsRhythmGame &&
      !sceneState.earsGameComplete &&
      !sceneState.discoveredSymbols?.ears
    ) {
      const t = setTimeout(() => {
        sceneActions.updateState({ showEarsRhythmGame: true, earsVisible: true });
      }, 1200);
      return () => clearTimeout(t);
    }

    if (
      sceneState.phase === PHASES.TUSK_GAME &&
      !sceneState.showTuskAssemblyGame &&
      !sceneState.ganeshaComplete
    ) {
      const t = setTimeout(() => {
        setTuskZoomActive(true);
        setTuskFadeOut(false);
        sceneActions.updateState({ showTuskAssemblyGame: true, tuskGameActive: true });
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [
    sceneState?.welcomeShown,
    sceneState?.phase,
    sceneState?.showEyesTelescopeGame,
    sceneState?.showEarsRhythmGame,
    sceneState?.showTuskAssemblyGame,
    sceneState?.eyesGameComplete,
    sceneState?.earsGameComplete,
    sceneState?.ganeshaComplete,
    revealConfig
  ]);

  // ==================== INTERACTION HANDLERS ====================

  useEffect(() => {
    if (!revealConfig?.symbolId) {
      revealVoKeyRef.current = null;
      return;
    }
    if (!isAudioOn) return;

    const symbolId = revealConfig.symbolId;
    if (symbolId === 'eyes' && revealVoKeyRef.current !== 'eyes') {
      revealVoKeyRef.current = 'eyes';
      speakScenePrompt('eyesSetup');
      return;
    }

    if ((symbolId === 'ear' || symbolId === 'ears') && revealVoKeyRef.current !== 'ears') {
      revealVoKeyRef.current = 'ears';
      speakScenePrompt('earsSetup');
      return;
    }

    if (symbolId === 'tusk' && revealVoKeyRef.current !== 'tusk') {
      revealVoKeyRef.current = 'tusk';
      speakScenePrompt('tuskSetup');
    }
  }, [revealConfig, isAudioOn, speakScenePrompt]);

  const handleEyesGameComplete = () => {
    playChime();
    // Stay in EYES_COMPLETE until the reveal card is accepted —
    // handleRevealComplete('eyes') advances to EARS_GAME and sets earsVisible.
    // Advancing here meant a reload during the reveal skipped the eyes symbol forever.
    sceneActions.updateState({
      eyesGameComplete: true,
      showEyesTelescopeGame: false,
      phase: PHASES.EYES_COMPLETE
    });
    setShowSparkle('eyes-complete-final');
    triggerMiniGesture('center', 2000, MINI_VICTORY_ICON);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setRevealConfig({ symbolId: 'eyes', symbolImage: symbolEyesColored, symbolName: 'Eyes', affirmation: 'I see clearly.', sidebarTarget: getSidebarTarget('eyes'), sayWithMeDelayMs: 3200 });
    }, 1200);
  };

  const handleTuskGameComplete = () => {
    playChime();
    setTuskZoomActive(false);
    setTuskFadeOut(false);
    setTuskTransforming(true);
    sceneActions.updateState({
      ganeshaComplete: true,
      showTuskAssemblyGame: false,
      tuskGameActive: false,
      phase: PHASES.TUSK_COMPLETE
    });
    triggerMiniGesture('center', 2200, MINI_VICTORY_ICON);
    safeSetTimeout(() => {
      setShowGoldenAura(true);
    }, 450);
    safeSetTimeout(() => {
      setGaneshaRevealing(true);
    }, 950);
    safeSetTimeout(() => {
      setShowGoldenAura(false);
      setTuskTransforming(false);
    }, 2500);
    safeSetTimeout(() => {
      setGaneshaRevealing(false);
    }, 3000);
    safeSetTimeout(() => {
      setRevealConfig({ symbolId: 'tusk', symbolImage: symbolTuskColored, symbolName: 'Tusk', affirmation: 'I finish what I start.', sidebarTarget: getSidebarTarget('tusk'), sayWithMeDelayMs: 3200 });
    }, 3200);
  };

  const startTuskZoomTransition = useCallback((statePatch = {}) => {
    setTuskFadeOut(true);
    safeSetTimeout(() => {
      setTuskZoomActive(true);
      sceneActions.updateState({
        ...statePatch,
        showTuskAssemblyGame: true,
        tuskGameActive: true,
        phase: PHASES.TUSK_GAME
      });
      safeSetTimeout(() => {
        setTuskFadeOut(false);
      }, 100);
    }, 500);
  }, [safeSetTimeout, sceneActions]);

  // shouldEnableHints / getHintConfigs removed â€” replaced by inline hint cadence (see useEffect above)

  // -- SymbolAutoReveal helpers -----------------------------------------------
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
        startTuskZoomTransition({
          discoveredSymbols: { ...sceneState.discoveredSymbols, ears: true, ear: true },
          showEarsRhythmGame: false,
          showGaneshaOutline: true,
          activeGame: 'tusk',
          currentFocus: 'tusk'
        });
        triggerMiniGesture('center', 1400, MINI_OK_ICON);
      }, 950);
    } else if (symbolId === 'tusk') {
      safeSetTimeout(() => {
        const profileId = localStorage.getItem('activeProfileId');
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, tusk: true },
          phase: PHASES.ALL_COMPLETE,
          completed: true,
          stars: 9,
          progress: { percentage: 100, starsEarned: 9, completed: true }
        });
        if (profileId) {
          GameStateManager.saveGameState('symbol-mountain', 'symbol', {
            completed: true, stars: 9, symbols: { eyes: true, ears: true, tusk: true },
            phase: 'complete', unlocked: true, timestamp: Date.now()
          });
          localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_symbol`);
          SimpleSceneManager.clearCurrentScene();
        }
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

  const isCompletionView = showSceneCompletion || sceneState?.showingCompletionScreen || showMandala;
  const isFinalFireworksView = showSparkle === 'final-fireworks';
  // GameLayout replaced with plain div â€” pause menu removed
  if (!sceneState || !sceneActions) return <div className="loading">Loading...</div>;
  return (
    <div style={{ position: 'relative', width: '100%', height: 'var(--app-height, 100vh)', overflow: 'hidden' }}>
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="symbol-mountain-scene-v2-container">
            <HomeButton onNavigate={onNavigate} />
            <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => onNavigate?.('zone-welcome')} />
            <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
            <VOReplayButton
              onReplay={replayCurrentVoice}
              disabled={!isAudioOn || !getPromptKeyForPhase()}
            />
            <div className={`mountain-background ${tuskZoomActive ? 'tusk-zoom' : ''} ${tuskFadeOut ? 'tusk-fade-out' : ''}`} style={{ backgroundImage: `url(${mountainBackground})` }}>
              {!isCompletionView && !isFinalFireworksView && (
                <>
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
              {/* EYES GAME - Pop-up discovery */}
              {sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes && (
                <EyesPopUpGame
                  isActive={sceneState.showEyesTelescopeGame}
                  isAudioOn={isAudioOn}
                  onGameComplete={({ assignedSpots } = {}) => {
                    sceneActions.updateState({
                      animalSpots: assignedSpots || sceneState.animalSpots || {},
                      eyesGameComplete: true,
                      showEyesTelescopeGame: false,
                      phase: PHASES.EYES_COMPLETE
                    });
                    // Keep discovered animals visible a bit longer before symbol reveal.
                    safeSetTimeout(() => handleEyesGameComplete(), 1800);
                  }}
                />
              )}

              {/* EARS GAME - Sound match */}
              {sceneState.showEarsRhythmGame && sceneState.phase === PHASES.EARS_GAME && !sceneState.discoveredSymbols?.ears && (
                <EarsSoundMatchGame
                  isActive={sceneState.showEarsRhythmGame}
                  isAudioOn={isAudioOn}
                  animalPositions={sceneState.animalSpots}
                  onAnimalPositionsChange={(positions) => {
                    sceneActions.updateState({
                      animalSpots: {
                        ...(sceneState.animalSpots || {}),
                        ...(positions || {})
                      }
                    });
                  }}
                  onGameComplete={() => {
                    // Keep matched animals visible briefly before transitioning to reveal.
                    safeSetTimeout(() => {
                      sceneActions.updateState({
                        earsGameComplete: true,
                        showEarsRhythmGame: false,
                        phase: PHASES.EARS_COMPLETE
                      });
                      playChime();
                      setShowSparkle('ears-complete-final');
                      triggerMiniGesture('center', 2000, MINI_VICTORY_ICON);
                      safeSetTimeout(() => {
                        setShowSparkle(null);
                        setRevealConfig({
                          symbolId: 'ear',
                          symbolImage: symbolEarColored,
                          symbolName: 'Ears',
                          affirmation: 'I listen with care.',
                          sidebarTarget: getSidebarTarget('ear'),
                          sayWithMeDelayMs: 3200
                        });
                      }, 2000);
                    }, 1800);
                  }}
                />
              )}

              {/* TUSK GAME - Path clearing */}
              {sceneState.showTuskAssemblyGame &&
               !isEarRevealActive &&
               !sceneState.discoveredSymbols?.tusk && (
                <TuskPathGame
                  key={`tusk-${tuskTestRunKey}`}
                  isActive={sceneState.showTuskAssemblyGame}
                  isAudioOn={isAudioOn}
                  animalPositions={sceneState.tuskAnimalPositions}
                  obstaclePosition={sceneState.tuskObstaclePosition}
                  onAnimalPositionsChange={(positions) => {
                    sceneActions.updateState({
                      tuskAnimalPositions: {
                        ...(sceneState.tuskAnimalPositions || {}),
                        ...(positions || {})
                      }
                    });
                  }}
                  onObstaclePositionChange={(position) => {
                    sceneActions.updateState({
                      tuskObstaclePosition: position || sceneState.tuskObstaclePosition || null
                    });
                  }}
                  onGameComplete={handleTuskGameComplete}
                />
              )}

              {sceneState.ganeshaComplete && !sceneState.discoveredSymbols?.tusk && (
                <>
                  <img
                    src={symbolTuskColored}
                    alt=""
                    className={tuskTransforming ? 'tusk-final-transform' : ''}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '53%',
                      transform: 'translate(-50%, -50%)',
                      width: 'clamp(80px, 12vw, 160px)',
                      zIndex: 14,
                      pointerEvents: 'none',
                      opacity: tuskTransforming ? 1 : 0
                    }}
                  />
                  {showGoldenAura && (
                    <div
                      className="golden-burst"
                      style={{
                        left: '50%',
                        top: '50%',
                        zIndex: 13
                      }}
                    />
                  )}
                  <img
                    src={GANESHA_REVEAL_IMAGE}
                    alt="Ganesha"
                    className={`${ganeshaRevealing ? 'ganesha-reveal' : ''} ${sceneState.ganeshaComplete && !ganeshaRevealing ? 'ganesha-glow' : ''}`}
                    onAnimationEnd={() => {
                      if (ganeshaRevealing) setGaneshaRevealing(false);
                    }}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '44%',
                      maxWidth: '460px',
                      zIndex: 15,
                      pointerEvents: 'none',
                      opacity: ganeshaRevealing || (!tuskTransforming && sceneState.ganeshaComplete) ? 1 : 0
                    }}
                  />
                  {sceneState.ganeshaComplete && !sceneState.discoveredSymbols?.tusk && !ganeshaRevealing && !tuskTransforming && (
                    <div className="golden-dust" style={{ zIndex: 12 }} />
                  )}
                </>
              )}

              {(showSparkle === 'eyes-complete-final' || showSparkle === 'ears-complete-final') && (
                <SparkleAnimation
                  type="magic"
                  count={28}
                  color="#ffd54f"
                  size={15}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              )}


              {/* REMOVED MANUAL NAV & BACK BUTTON (Handled by GameLayout) */}

              <CulturalCelebrationModal show={showCulturalCelebration} onClose={() => setShowCulturalCelebration(false)} {...CulturalProgressExtractor.getCulturalProgressData()} />
                </>
              )}
            </div>

            {/* 3-2-1 RESUME COUNTDOWN â€” shows on tab return */}
            <ResumeCountdown value={countdownValue} />

            {/* SIDEBAR */}
            {!isCompletionView && !isFinalFireworksView && sceneState.welcomeShown && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true, modak: true, belly: true, lotus: true, trunk: true,
                  ...(sceneState.discoveredSymbols || {}),
                  // Keep sidebar alias in sync with game-logic alias.
                  ear: sceneState?.discoveredSymbols?.ear || sceneState?.discoveredSymbols?.ears || false
                }}
                onSymbolClick={(id) => { if (import.meta.env.DEV) console.log(`Symbol clicked: ${id}`); }}
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


            {/* -- SYMBOL AUTO-REVEAL (replaces SimpleDiscoveryOverlay) ---------------
                Flip card: symbol image ? affirmation ? user taps ? flies to sidebar */}
            {!isCompletionView && !isFinalFireworksView && revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                sayWithMeDelayMs={revealConfig.sayWithMeDelayMs ?? 450}
                sidebarTargetRect={revealConfig.sidebarTarget}
                enableVoicePrompts={true}
                enableTapHintPrompt={false}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

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
                    setShowMandala(true);
                  }}
                />
              </>
            )}

            {showMandala && (
              <InnerMandala
                childName={profileName}
                symbolPetalStates={{
                  1: 'awakened',
                  2: 'awakened',
                  3: 'awakened',
                  4: 'awakened',
                  5: 'awakened',
                }}
                justEarnedPetals={[
                  { ring: 'middle', id: 6 },
                  { ring: 'middle', id: 7 },
                  { ring: 'middle', id: 8 },
                ]}
                earnedSymbols={[
                  { id: 'eyes', petalId: 6, ring: 'middle', image: symbolEyesColored },
                  { id: 'ears', petalId: 7, ring: 'middle', image: symbolEarColored },
                  { id: 'tusk', petalId: 8, ring: 'middle', image: symbolTuskColored },
                ]}
                autoCloseMs={3000 + (3 * 950) + 2600}
                message="That power is growing inside you"
                onClose={() => {
                  setShowMandala(false);
                  setShowSceneCompletion(true);
                  // Persist so the sticky-completion effect and reload restore work.
                  sceneActions.updateState({ showingCompletionScreen: true, completed: true });
                }}
              />
            )}

            {isCompletionView && !showMandala && (
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
                    title: "Eyes â€” Ganesha's Wise Vision!",
                    description: "Ganesha's eyes see everything clearly â€” the big picture and the tiny details. They remind us to look carefully before we act!"
                  },
                  ears: {
                    title: "Ears â€” Ganesha's Super Listeners!",
                    description: "Ganesha's big ears hear every word. They remind us to listen with our whole heart and learn from everything around us."
                  },
                  tusk: {
                    title: "Tusk â€” Ganesha's Writing Tool!",
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
                  Analytics.sceneCompleted(zoneId, sceneId, 9);
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
