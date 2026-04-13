// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV3.jsx
// 🎵 Complete Musical Mountain Scene - Final Migration V5

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SymbolMountainScene.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure themes are loaded
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

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
import mountainBackground from '../tusk/assets/images/rock-background.jpg';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-colored.png';
import ganeshaEars from '../../shared/images/icons/symbol-ear-colored.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-colored.png';

// Character/Coach images
import eyesCoach from '../tusk/assets/images/mooshika-coach.png';
import ganeshaOutline from '../tusk/assets/images/ganesha-outline.png';
import ganeshaComplete from '../tusk/assets/images/ganesha-complete.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

// Symbol Icons
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.svg';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.svg';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.svg';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-colored.png';
import symbolEarColored from '../../shared/images/icons/symbol-ear-colored.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-colored.png';

// Musical instrument images
import musicalTabla from '../tusk/assets/images/musical-tabla-colored.png';
import musicalFlute from '../tusk/assets/images/musical-flute-colored.png';
import musicalBells from '../tusk/assets/images/musical-bells-colored.png';
import musicalCymbals from '../tusk/assets/images/musical-cymbals-colored.png';

const musicalInstruments = {
  tabla: { image: musicalTabla, name: 'Tabla' },
  flute: { image: musicalFlute, name: 'Flute' },
  bells: { image: musicalBells, name: 'Bells' },
  cymbals: { image: musicalCymbals, name: 'Cymbals' }
};

// Shared countdown duration — must match across useResumeCountdown + usePauseAwareTimeout
const RESUME_DELAY_MS = 3000;

// Mini gesture icons (same pattern as Pond / Modak)
const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MINI_VICTORY_ICON = '/images/hand-victory.svg';
const MINI_OK_ICON = '/images/hand-ok.svg';

const VOICE_LINES = {
  opening: "My symbols are ready. Let's discover them together.",
  eyes: 'My big eyes see everything. Tap my eyes.',
  ears: 'My big ears hear everything. Tap my ears and match the rhythm.',
  tusk: 'My tusk helps me stay brave. Tap the golden notes.',
  idleEyes: 'Look carefully at my eyes.',
  idleEars: 'Listen carefully to my ears.',
  idleTusk: 'Look carefully at the golden notes.',
  complete: 'You found my eyes, ears, and tusk. Now I am shining with you.'
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
  1: { x: 20, y: 50, type: 'tabla' },
  2: { x: 80, y: 45, type: 'flute' },
  3: { x: 30, y: 75, type: 'bells' },
  4: { x: 70, y: 70, type: 'cymbals' }
};

const instrumentPositionsByType = Object.values(instrumentPositions).reduce((acc, item) => {
  if (item?.type) acc[item.type] = { x: item.x, y: item.y };
  return acc;
}, {});

const instrumentSizesByType = {
  tabla: { eyes: { discovered: 290, glow: 150, hidden: 120 }, ears: 290, pattern: 102 },
  flute: { eyes: { discovered: 290, glow: 150, hidden: 120 }, ears: 290, pattern: 102 },
  bells: { eyes: { discovered: 350, glow: 150, hidden: 120 }, ears: 390, pattern: 102 },
  cymbals: { eyes: { discovered: 200, glow: 150, hidden: 120 }, ears: 200, pattern: 102 }
};

// Musical note data
const musicalNoteData = [
  { emoji: '🎵', id: 'note1' },
  { emoji: '🎶', id: 'note2' },
  { emoji: '🎼', id: 'note3' }
];

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
  const [showHintGlow, setShowHintGlow] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

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

  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const lastAnnouncedPromptRef = useRef(null);
  const openingVoPlayedRef = useRef(false);
  const idleVoGateRef = useRef(false);

  // ── Voice guidance (music + SFX enabled) ─────────────────────────────────
  const { startMusic, stopMusic } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: true, musicVolume: 0.1, voiceVolume: 1, sfxVolume: 0.35, idleTimeout: 20 }
  );
  useEffect(() => {
    if (sceneState?.welcomeShown) startMusic();
    return () => stopMusic();
  }, [sceneState?.welcomeShown, startMusic, stopMusic]);

  // ── SFX ──────────────────────────────────────────────────────────────────
  const { playUiTap, playSparkle, playChime, playGlow } = useGameSounds();

  // ── Resume countdown (3-2-1 on tab return) ───────────────────────────────
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  // ── Pause-aware safeSetTimeout — pauses on tab hide, resumes after countdown
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {},
    onShow: () => {
      setHintResetKey(k => k + 1); // restart hint cadence on tab return
      const replayKey = getPromptKeyForPhase();
      if (replayKey) speakScenePrompt(replayKey);
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

  const resetHintCadence = useCallback(() => {
    setShowHintGlow(false);
    setShowIdleGestureHint(false);
    setHintResetKey(k => k + 1);
  }, []);

  const speakScenePrompt = useCallback((key) => {
    if (!isAudioOn || !VOICE_LINES[key]) return;
    speak(VOICE_LINES[key], {
      age: 11,
      style: 'child',
      moment: key === 'complete' ? 'celebration' : 'encouragement'
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

  // ── Premium hint cadence: glow at 12-15s, glow+gesture at 18-22s, repeat every 25-35s
  // Same pattern as NewModakSceneV7. hintResetKey resets this on tab return.
  useEffect(() => {
    if (!idleHintsEnabled) {
      setShowHintGlow(false);
      setShowIdleGestureHint(false);
      return;
    }
    let hint1Timer, hint2Timer, hint2bTimer, hint2HideTimer, repeatInterval;
    const glowPhases = [PHASES.EYES_GAME, PHASES.EARS_GAME, PHASES.TUSK_GAME];
    const active = glowPhases.includes(sceneState?.phase) && sceneState?.welcomeShown
      && !sceneState?.showEyesTelescopeGame && !sceneState?.showEarsRhythmGame;

    if (active) {
      const hint1Delay = 12000 + Math.floor(Math.random() * 3000);
      const hint2Delay = 6000  + Math.floor(Math.random() * 2000);
      const hint3GapMs = 25000 + Math.floor(Math.random() * 10000);
      hint1Timer = setTimeout(() => {
        setShowHintGlow(true);
        hint2Timer = setTimeout(() => {
          setShowHintGlow(false);
          hint2bTimer = setTimeout(() => setShowHintGlow(true), 400);
          setShowIdleGestureHint(true);
          hint2HideTimer = setTimeout(() => setShowIdleGestureHint(false), 3500);
          repeatInterval = setInterval(() => {
            setShowHintGlow(false);
            setTimeout(() => setShowHintGlow(true), 400);
            setShowIdleGestureHint(true);
            setTimeout(() => setShowIdleGestureHint(false), 3500);
          }, hint3GapMs);
        }, hint2Delay);
      }, hint1Delay);
      return () => {
        clearTimeout(hint1Timer);
        clearTimeout(hint2Timer);
        clearTimeout(hint2bTimer);
        clearTimeout(hint2HideTimer);
        clearInterval(repeatInterval);
        setShowHintGlow(false);
        setShowIdleGestureHint(false);
      };
    } else {
      setShowHintGlow(false);
      setShowIdleGestureHint(false);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, sceneState?.showEyesTelescopeGame, sceneState?.showEarsRhythmGame, hintResetKey]);

  useEffect(() => {
    if (!sceneState?.welcomeShown || revealConfig || showSceneCompletion) return;

    let promptKey = null;
    if (sceneState.phase === PHASES.EYES_GAME && !sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes) {
      promptKey = 'eyes';
    } else if (sceneState.phase === PHASES.EARS_GAME && sceneState.earsVisible && !sceneState.showEarsRhythmGame && !sceneState.discoveredSymbols?.ears) {
      promptKey = 'ears';
    } else if (sceneState.phase === PHASES.TUSK_GAME && sceneState.showTuskAssemblyGame && !sceneState.ganeshaComplete) {
      promptKey = 'tusk';
    } else if (sceneState.phase === PHASES.ALL_COMPLETE) {
      promptKey = 'complete';
    }

    if (!promptKey || lastAnnouncedPromptRef.current === promptKey) return;
    lastAnnouncedPromptRef.current = promptKey;

    const timer = setTimeout(() => speakScenePrompt(promptKey), promptKey === 'complete' ? 250 : 500);
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
    revealConfig,
    showSceneCompletion,
    speakScenePrompt
  ]);

  useEffect(() => {
    if (!showIdleGestureHint) {
      idleVoGateRef.current = false;
      return;
    }
    if (idleVoGateRef.current) return;

    let idleKey = null;
    if (sceneState?.phase === PHASES.EYES_GAME) idleKey = 'idleEyes';
    else if (sceneState?.phase === PHASES.EARS_GAME) idleKey = 'idleEars';
    else if (sceneState?.phase === PHASES.TUSK_GAME) idleKey = 'idleTusk';

    if (idleKey) {
      speakScenePrompt(idleKey);
      idleVoGateRef.current = true;
    }
  }, [sceneState?.phase, showIdleGestureHint, speakScenePrompt]);

  // Reload Handling
  useEffect(() => {
    if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) return;

    console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.phase);
    reloadHandledRef.current = true;

    if (sceneState.phase === PHASES.EYES_COMPLETE) {
      setTimeout(() => setRevealConfig({ symbolId: 'eyes', symbolImage: symbolEyesColored, symbolName: 'Eyes', affirmation: 'I notice the good.', sidebarTarget: getSidebarTarget('eyes') }), 500);
      return;
    }
    if (sceneState.phase === PHASES.EARS_COMPLETE) {
      setTimeout(() => setRevealConfig({ symbolId: 'ears', symbolImage: symbolEarColored, symbolName: 'Ears', affirmation: 'I listen with care.', sidebarTarget: getSidebarTarget('ears') }), 500);
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

  }, [isReload, sceneState.phase, sceneState.welcomeShown]);

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
    if (sceneState.eyesGameComplete) return;
    playUiTap();
    triggerMiniGesture('eyes', 1200, MINI_THUMBS_UP_ICON);
    if (!sceneState.welcomeShown) sceneActions.updateState({ welcomeShown: true });

    sceneActions.updateState({
      showEyesTelescopeGame: true,
      eyesGameActive: true,
      activeGame: 'eyes'
    });
  };

  const handleEarsClick = () => {
    resetHintCadence();
    handleSmartDismiss();
    if (!sceneState.earsVisible || sceneState.earsGameComplete) return;
    playUiTap();
    triggerMiniGesture('ears', 1200, MINI_THUMBS_UP_ICON);

    sceneActions.updateState({
      showEarsRhythmGame: true,
      earsGameActive: true,
      musicalNotesVisible: true,
      activeGame: 'ears',
      currentNote: 'note1'
    });
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

  const handleNoteClick = (noteId) => {
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
      safeSetTimeout(() => {
        sceneActions.updateState({ ganeshaComplete: true, ganeshaAssembling: false });
        setShowSparkle('ganesha-complete');
        safeSetTimeout(() => handleTuskGameComplete(), 1000);
      }, 1000);
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
      setRevealConfig({ symbolId: 'eyes', symbolImage: symbolEyesColored, symbolName: 'Eyes', affirmation: 'I notice the good.', sidebarTarget: getSidebarTarget('eyes') });
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
        setRevealConfig({ symbolId: 'ears', symbolImage: symbolEarColored, symbolName: 'Ears', affirmation: 'I listen with care.', sidebarTarget: getSidebarTarget('ears') });
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
    } else if (symbolId === 'ears') {
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
          completed: true,
          stars: 9,
          progress: { percentage: 100, starsEarned: 9, completed: true }
        });
        setShowSparkle('final-fireworks');
      }, 950);
    }
  };

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

              <OpeningModal
                zoneId={zoneId}
                sceneId={sceneId}
                onStart={() => {
                  sceneActions.updateState({ welcomeShown: true });
                  if (!openingVoPlayedRef.current) {
                    speakScenePrompt('opening');
                    openingVoPlayedRef.current = true;
                  }
                }}
                characterImg={ganeshaCharacter}
                showButton={true}
              />

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
              {sceneState.welcomeShown && !sceneState.discoveredSymbols?.eyes && (
                <div
                  className={`eyes-symbol-container ${sceneState.eyesGameComplete ? 'completed' : 'active'} ${showHintGlow && sceneState.phase === PHASES.EYES_GAME ? 'hint-glow' : ''}`}
                  onClick={handleEyesClick}
                >
                  <ClickableElement id="eyes-symbol" onClick={handleEyesClick} completed={sceneState.eyesGameComplete} zone="eyes-zone">
                    <img src={ganeshaEyes} alt="Divine Eyes" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
                </div>
              )}

              {showIdleGestureHint && (() => {
                const idleTarget =
                  sceneState?.phase === PHASES.TUSK_GAME ? 'note' :
                  sceneState?.phase === PHASES.EARS_GAME ? 'ears' :
                  'eyes';
                return (
                  <div className={`symbol-hint-pointer symbol-hint-pointer--${idleTarget}`} aria-hidden="true">
                    <span className="symbol-hint-pointer-emoji">👆</span>
                  </div>
                );
              })()}

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
              {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && (
                <div
                  className={`ears-symbol-container ${sceneState.earsGameComplete ? 'completed' : 'active'} materialized ${showHintGlow && sceneState.earsVisible && !sceneState.earsGameComplete ? 'hint-glow' : ''}`}
                  onClick={handleEarsClick}
                >
                  <ClickableElement id="ears-symbol" onClick={handleEarsClick} completed={sceneState.earsGameComplete} zone="ears-zone">
                    <img src={ganeshaEars} alt="Sacred Ears" style={{ width: '100%', height: '100%', cursor: 'pointer' }} />
                  </ClickableElement>
                  {showSparkle === 'ears-materialize' && <SparkleAnimation type="glitter" count={30} color="gold" size={15} duration={2000} fadeOut={true} area="full" />}
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
                  onSequenceComplete={(noteId) => {
                    const newNoteStates = { ...sceneState.musicalNoteStates, [noteId]: 'golden' };
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
                    unlockNote(noteId);

                    setShowSparkle(`note-${noteId}-golden`);
                    setTimeout(() => setShowSparkle(null), 2000);

                    const goldenNotes = Object.values(newNoteStates).filter(state => state === 'golden');
                    if (goldenNotes.length === 3) handleEarsGameComplete();
                    else {
                      const nextNote = noteId === 'note1' ? 'note2' : 'note3';
                      setTimeout(() => sceneActions.updateState({ currentNote: nextNote }), 500);
                    }
                  }}
                  onGameComplete={() => handleEarsGameComplete()}
                  onClose={() => sceneActions.updateState({ showEarsRhythmGame: false })}
                />
              )}

              {/* MUSICAL NOTES */}
              {sceneState.musicalNotesVisible && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 40 }}>
                  {musicalNoteData.map((note) => {
                    const state = musicalNoteStates[note.id];
                    return (
                      <div
                        key={note.id}
                        style={{
                          position: 'relative', width: '60px', height: '60px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.5s ease',
                          cursor: state === NOTE_STATES.ACTIVE ? 'pointer' : 'default',
                          background: state === NOTE_STATES.LOCKED ? 'rgba(200, 200, 200, 0.5)' :
                            state === NOTE_STATES.APPEARING ? 'rgba(255, 215, 0, 0.3)' :
                              state === NOTE_STATES.ACTIVE ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                'rgba(150, 150, 150, 0.3)',
                          border: state === NOTE_STATES.ACTIVE ? '3px solid #FF8C00' : '2px solid #999',
                          boxShadow: state === NOTE_STATES.ACTIVE ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none',
                          animation: state === NOTE_STATES.APPEARING ? 'noteAppear 1.5s ease-out' :
                            state === NOTE_STATES.ACTIVE ? 'gentlePulse 2s ease-in-out infinite' : 'none'
                        }}
                        onClick={() => {
                          if (state === NOTE_STATES.ACTIVE && sceneState.showTuskAssemblyGame) {
                            handleNoteClick(note.id);
                          }
                        }}
                      >
                        {state === NOTE_STATES.LOCKED && <span style={{ fontSize: '30px', color: '#666' }}>?</span>}
                        {state === NOTE_STATES.APPEARING && (
                          <>
                            <span style={{ fontSize: '35px' }}>✨</span>
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%)', animation: 'sparkleBurst 1.5s ease-out' }} />
                          </>
                        )}
                        {state === NOTE_STATES.ACTIVE && <span style={{ fontSize: '35px' }}>{note.emoji}</span>}
                        {state === NOTE_STATES.USED && <span style={{ fontSize: '30px', color: '#4CAF50' }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TUSK ASSEMBLY AREA */}
              {sceneState.showTuskAssemblyGame && (
                <div className="sacred-tusk-assembly-area" style={{
                  position: 'absolute', top: '45%', left: '50%', width: '200px', height: '220px', transform: 'translate(-50%, -50%)', zIndex: 15, pointerEvents: 'none'
                }}>
                  {(sceneState.showGaneshaOutline || sceneState.ganeshaComplete) && (
                    <div style={{ position: 'absolute', bottom: '20px', right: '60%', width: '260px', height: '290px', transform: 'translateX(-50%)', opacity: 0.8, pointerEvents: 'none' }}>
                      <img src={sceneState.ganeshaComplete ? ganeshaComplete : ganeshaOutline} alt="Ganesha" style={{ width: sceneState.ganeshaComplete ? '80%' : '100%', height: sceneState.ganeshaComplete ? '80%' : '100%', transition: 'all 0.8s ease' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '10px', left: '30%', width: '120px', height: '120px', transform: 'translateX(-30%)', zIndex: 30 }}>
                    <img
                      src={ganeshaTusk} alt="Tusk"
                      style={{
                        width: '60px', height: '60px',
                        filter: sceneState.tuskPower > 0 ? `brightness(${1.2 + (sceneState.tuskPower * 0.2)}) drop-shadow(0 0 ${8 + (sceneState.tuskPower * 4)}px #ffd700)` : 'brightness(1.1)',
                        transition: 'all 0.8s ease'
                      }}
                    />
                  </div>
                </div>
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
            </div>

            {/* 3-2-1 RESUME COUNTDOWN — shows on tab return */}
            <ResumeCountdown value={countdownValue} />

            {/* SIDEBAR */}
            {sceneState.welcomeShown && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true, modak: true, belly: true, lotus: true, trunk: true,
                  ...(sceneState.discoveredSymbols || {}),
                  // Keep sidebar alias in sync with game-logic alias.
                  ear: sceneState?.discoveredSymbols?.ear || sceneState?.discoveredSymbols?.ears || false
                }}
                onSymbolClick={(id) => console.log(`Symbol clicked: ${id}`)}
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
            {revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                sidebarTargetRect={revealConfig.sidebarTarget}
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
            {showSparkle === 'final-fireworks' && (
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

            {showSceneCompletion && (
              <SceneCompletionCelebration
                show={true}
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
