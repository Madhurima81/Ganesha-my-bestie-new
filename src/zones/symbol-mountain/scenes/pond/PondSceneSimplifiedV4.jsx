// zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV3.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PondScene.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure theme vars are loaded
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// Shared Components
import OpeningModal from '../../../shared/components/OpeningModal';

// --- NEW MASTER LAYOUT & CONFIG ---
import GameLayout from '../../../../lib/components/layout/GameLayout';
import { pondHelpConfig } from './helpConfig';
// ----------------------------------

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';

// UI Components
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import WaterSprayArc from '../../../shloka-river/scenes/Scene1/components/WaterSprayArc';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Images
import pondBackground from './assets/images/pond-background.png';
import lotusClosed from './assets/images/lotus-closed.png';
import lotusBloomed from './assets/images/lotus-bloomed.png';
import goldenLotusClosed from './assets/images/golden-lotus-closed.png';
import goldenLotusBloomed from './assets/images/golden-lotus-bloomed.png';
import elephantFull from './assets/images/elephant-full.png';
import waterElephant from './assets/images/water-elephant.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.svg';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.svg';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.svg';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';

// Mission images
import lotusBefore from './assets/images/lotus-before.png';
import lotusAfter from './assets/images/lotus-after.png';
import trunkBefore from './assets/images/trunk-before.png';
import trunkAfter from './assets/images/trunk-after.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

const RESUME_DELAY_MS = 3000;

const MINI_THUMBS_UP_ICON = '/images/hand-thumbsup.svg';
const MINI_VICTORY_ICON   = '/images/hand-victory.svg';
const MINI_OK_ICON        = '/images/hand-ok.svg';

const PHASES = {
  INITIAL: 'initial',
  SOME_BLOOMED: 'some_bloomed',
  ALL_BLOOMED: 'all_bloomed',
  GOLDEN_VISIBLE: 'golden_visible',
  ELEPHANT_VISIBLE: 'elephant_visible',
  ELEPHANT_TRANSFORMED: 'elephant_transformed',
  GOLDEN_BLOOM: 'golden_bloom',
  COMPLETE: 'complete'
};

const VOICE_LINES = {
  opening: "My pond is ready. Let's bloom it together.",
  lotusRound: 'My lotus helps me stay calm. Tap the lotuses.',
  goldenLotus: 'Beautiful. Now tap my golden lotus.',
  elephant: 'Tap me. My trunk is ready to awaken.',
  trunkRound: 'My trunk is strong and helps me. Tap to reveal it.',
  idleLotus: 'Look carefully at the lotuses.',
  idleGolden: 'Look for the golden lotus.',
  idleElephant: 'Tap me to continue.',
  complete: 'You found my lotus and my trunk. Now I am shining with you.'
};

const powerConfig = {
  lotus: {
    name: 'Sacred Purity',
    image: symbolLotusColored,
    color: '#4ECDC4'
  },
  trunk: {
    name: 'Divine Blessing',
    image: symbolTrunkColored,
    color: '#FFD700'
  }
};

const missionImages = {
  lotus: { before: lotusBefore, after: lotusAfter },
  trunk: { before: trunkBefore, after: trunkAfter }
};

const discoveryConfig = {
  lotus: {
    foundTitle: "You Bloomed All Lotuses!",
    foundSubtitle: "Something magical appears...",
    powerName: "Sacred Purity",
    image: symbolLotusColored
  },
  trunk: {
    foundTitle: "The Pond is Full!",
    foundSubtitle: "Ganesha's trunk reveals its power...",
    powerName: "Divine Blessing",
    image: symbolTrunkColored
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PondSceneSimplifiedV3 = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'pond'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          lotusStates: [0, 0, 0],
          goldenLotusVisible: false,
          goldenLotusBloom: false,
          elephantVisible: false,
          elephantTransformed: false,
          trunkActive: false,
          waterDrops: [],
          phase: 'initial',
          currentFocus: 'lotus',
          discoveredSymbols: {
            mooshika: true,
            modak: true,
            belly: true,
          },
          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <PondSceneContent
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

const PondSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState?.phase) sceneActions.updateState({ phase: 'initial' });

  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();
  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'pond', getSceneResetConfig('pond'));
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  const [showSparkle, setShowSparkle] = useState(null);
  const [showHintGlow, setShowHintGlow] = useState(false);
  const [showIdleGestureHint, setShowIdleGestureHint] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerMission, setShowPowerMission] = useState(false);
  const [activeWaterSpray, setActiveWaterSpray] = useState(null);
  const [fireworksFinished, setFireworksFinished] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);

  // Discovery overlay states
  const [discoveryStep, setDiscoveryStep] = useState('hidden');
  const [isDiscoveryFading, setIsDiscoveryFading] = useState(false);
  const [discoveryItem, setDiscoveryItem] = useState(null);

  // Resume popup states
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');

  // Discovery overlay states (kept to avoid undeclared-var errors; never set to true — SymbolAutoReveal handles discovery now)
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // eslint-disable-line no-unused-vars
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // eslint-disable-line no-unused-vars
  const [revealConfig, setRevealConfig] = useState(null);

  // Mini gesture cue
  const [miniGesture, setMiniGesture] = useState({ show: false, target: 'center', durationMs: 1500, key: 0, icon: MINI_THUMBS_UP_ICON });
  const triggerMiniGesture = useCallback((target = 'center', durationMs = 1500, icon = MINI_THUMBS_UP_ICON) => {
    setMiniGesture(prev => ({ show: true, target, durationMs, key: prev.key + 1, icon }));
    setTimeout(() => setMiniGesture(prev => ({ ...prev, show: false })), durationMs);
  }, []);

  // Audio
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const { playUiTap, playBloom, playChime, playGlow, playTwinkle, setGlobalVolume } = useGameSounds();
  const { startMusic, stopMusic, setVoiceVolume } = useVoiceGuidance(
    zoneId, sceneId, {
      enableMusic: true,
      musicVolume: 0.06,
      sfxVolume: 0.35,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,
    }
  );
  useEffect(() => { setVoiceVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setVoiceVolume]);
  useEffect(() => { if (sceneState?.welcomeShown) startMusic(); }, [sceneState?.welcomeShown]);
  useEffect(() => {
    setGlobalVolume(0.5);
    return () => { stopMusic(); setGlobalVolume(1.0); };
  }, []);

  // Resume popup timeout ref
  const resumePopupTimeoutRef = useRef(null);

  const progressiveHintRef = useRef(null);
  const reloadHandledRef = useRef(false);
  const activeDropsRef = useRef(new Set());
  const MAX_WATER_DROPS = 15;

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';
  const lastAnnouncedPromptRef = useRef(null);
  const openingVoPlayedRef = useRef(false);
  const idleVoGateRef = useRef(false);

  const speakPondPrompt = useCallback((key) => {
    if (!isAudioOn || !VOICE_LINES[key]) return;
    speak(VOICE_LINES[key], {
      age: 11,
      style: 'child',
      moment: key === 'complete' ? 'celebration' : 'encouragement'
    });
  }, [isAudioOn, speak]);

  const getPromptKeyForPhase = useCallback(() => {
    if (!sceneState?.welcomeShown) return 'opening';
    if (sceneState?.phase === PHASES.COMPLETE) return 'complete';
    if (sceneState?.phase === PHASES.ELEPHANT_TRANSFORMED && !sceneState?.completed) return 'trunkRound';
    if (sceneState?.phase === PHASES.ELEPHANT_VISIBLE && !sceneState?.elephantTransformed) return 'elephant';
    if (sceneState?.phase === PHASES.GOLDEN_VISIBLE && !sceneState?.elephantVisible) return 'goldenLotus';
    if (sceneState?.phase === PHASES.INITIAL || sceneState?.phase === PHASES.SOME_BLOOMED) return 'lotusRound';
    return null;
  }, [
    sceneState?.completed,
    sceneState?.elephantTransformed,
    sceneState?.elephantVisible,
    sceneState?.phase,
    sceneState?.welcomeShown
  ]);

  const onPauseHide = useCallback(() => {
    stopSpokenVoice();
  }, [stopSpokenVoice]);
  const onPauseShow = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) speakPondPrompt(replayKey);
  }, [getPromptKeyForPhase, speakPondPrompt]);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });

  const triggerWaterSpray = useCallback(() => {
    const sourcePosition = { left: '72%', top: '48%' };
    const targetPosition = { left: '45%', top: '45%' }; // golden lotus area
    const key = Date.now() + Math.random();
    setActiveWaterSpray({ key, sourcePosition, targetPosition, phase: 'vakratunda' });
    safeSetTimeout(() => {
      setActiveWaterSpray(null);
    }, 1500);
  }, [safeSetTimeout]);

  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopSpokenVoice();
      activeDropsRef.current.clear();
      reloadHandledRef.current = false;
    };
  }, [clearAllTimeouts, stopSpokenVoice]);

  // Auto-glow effect
  useEffect(() => {
    const glowPhases = [
      PHASES.INITIAL,
      PHASES.SOME_BLOOMED,
      PHASES.GOLDEN_VISIBLE,
      PHASES.ELEPHANT_VISIBLE
    ];

    if (glowPhases.includes(sceneState?.phase) &&
      sceneState?.welcomeShown &&
      !showPowerModal &&
      !showPowerMission) {
      const timer = setTimeout(() => {
        setShowHintGlow(true);
      }, 20000);

      return () => clearTimeout(timer);
    } else {
      setShowHintGlow(false);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, showPowerModal, showPowerMission]);

  useEffect(() => {
    const promptKey = getPromptKeyForPhase();
    if (!promptKey || revealConfig || showSceneCompletion) return;
    if (lastAnnouncedPromptRef.current === promptKey) return;

    lastAnnouncedPromptRef.current = promptKey;
    const timer = setTimeout(() => speakPondPrompt(promptKey), promptKey === 'complete' ? 250 : 500);
    return () => clearTimeout(timer);
  }, [getPromptKeyForPhase, revealConfig, showSceneCompletion, speakPondPrompt]);

  // Hint 2: show pointing emoji shortly after glow appears
  useEffect(() => {
    if (!showHintGlow) {
      setShowIdleGestureHint(false);
      idleVoGateRef.current = false;
      return;
    }
    const showTimer = setTimeout(() => setShowIdleGestureHint(true), 2000);
    const hideTimer = setTimeout(() => setShowIdleGestureHint(false), 5500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [showHintGlow]);

  useEffect(() => {
    if (!showIdleGestureHint) return;
    if (idleVoGateRef.current) return;

    let idleKey = 'idleLotus';
    if (sceneState?.phase === PHASES.GOLDEN_VISIBLE) idleKey = 'idleGolden';
    if (sceneState?.phase === PHASES.ELEPHANT_VISIBLE) idleKey = 'idleElephant';
    speakPondPrompt(idleKey);
    idleVoGateRef.current = true;
  }, [sceneState?.phase, showIdleGestureHint, speakPondPrompt]);

  // ==================== RELOAD / RESUME LOGIC ====================
  // Runs once on mount — same pattern as Modak (empty deps, no isReload check).
  useEffect(() => {
    if (!sceneState?.welcomeShown) return;

    // 1. RESET PARTIAL LOTUS BLOOMING
    // 1 or 2 lotuses bloomed but not all 3 → reset to start of lotus phase.
    // Matches Modak's "reset partial mound search / partial modak collection" pattern.
    if (sceneState.phase === PHASES.SOME_BLOOMED) {
      const bloomed = sceneState.lotusStates?.filter(s => s === 1).length || 0;
      if (bloomed > 0 && bloomed < 3) {
        sceneActions.updateState({
          lotusStates: [0, 0, 0],
          phase: PHASES.INITIAL,
          progress: { percentage: 0, starsEarned: 0, completed: false }
        });
        return;
      }
      // All 3 bloomed but phase hasn't advanced to ALL_BLOOMED yet (rare mid-transition reload):
      if (bloomed === 3) {
        setTimeout(() => {
          playChime();
          setRevealConfig({
            symbolId: 'lotus',
            symbolName: 'Lotus',
            affirmation: 'I bloom in the mud!',
            symbolImage: symbolLotusColored
          });
        }, 1200);
        return;
      }
    }

    // 2. RESTORE LOTUS CARD FLIP
    // All 3 bloomed (ALL_BLOOMED phase) but card not yet shown / dismissed.
    if (sceneState.phase === PHASES.ALL_BLOOMED) {
      setTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I bloom in the mud!',
          symbolImage: symbolLotusColored
        });
      }, 1200);
      return;
    }

    // 3. RESTORE TRUNK CARD FLIP
    // Elephant done (ELEPHANT_TRANSFORMED phase) but card not yet shown / dismissed.
    if (sceneState.phase === PHASES.ELEPHANT_TRANSFORMED && !sceneState.completed) {
      setTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'trunk',
          symbolName: 'Trunk',
          affirmation: 'Strong and gentle!',
          symbolImage: symbolTrunkColored
        });
      }, 1200);
      return;
    }

    // 4. RESTORE COMPLETION SCREEN
    if (sceneState.phase === PHASES.COMPLETE && !sceneState.showingCompletionScreen) {
      setTimeout(() => setShowSceneCompletion(true), 500);
      return;
    }

  }, []); // Empty array — runs once on mount, same as Modak

  // Completion message
  useEffect(() => {
    if (!sceneState) return;
    if (sceneState.phase === PHASES.COMPLETE && !sceneState.masteryShown) {
      const timer = setTimeout(() => {
        setResumeMessage(`Amazing work, ${profileName}! You've discovered the Sacred Lotus and Divine Trunk!`);
        setShowResumePopup(true);
        setTimeout(() => setShowResumePopup(false), 4000);
        sceneActions.updateState({ masteryShown: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sceneState?.phase, sceneState?.masteryShown, profileName]);

  // Water Drop Creation
  const createWaterDrop = () => {
    if (!sceneActions || !sceneState) return;
    if (activeDropsRef.current.size >= MAX_WATER_DROPS) return;

    const id = Date.now() + Math.random();
    activeDropsRef.current.add(id);

    const size = Math.floor(Math.random() * 4) + 2;
    const speedFactor = Math.random() * 0.4 + 0.8;
    const trunkRight = 25;
    const trunkBottom = 52;
    const deltaX = (trunkRight + 35);
    const deltaY = (trunkBottom - 55);
    const spreadX = Math.random() * 8 - 4;
    const spreadY = Math.random() * 6 - 3;
    const arcHeight = Math.random() * 12 + 8;

    const newDrop = {
      id,
      size,
      speedFactor,
      startRight: trunkRight + spreadX,
      startBottom: trunkBottom + spreadY,
      deltaX: deltaX + spreadX,
      deltaY: deltaY + spreadY,
      arcHeight: arcHeight,
      duration: speedFactor * 1.5,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.3 + 0.7
    };

    const currentDrops = [...(sceneState.waterDrops || [])];
    sceneActions.updateState({ waterDrops: [...currentDrops, newDrop] });

    safeSetTimeout(() => {
      activeDropsRef.current.delete(id);
      sceneActions.updateState({
        waterDrops: (sceneState.waterDrops || []).filter(drop => drop.id !== id)
      });
    }, newDrop.duration * 1000 + 500);
  };

  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = { lotus: '🐘 Discover Trunk', trunk: '✨ End Scene' };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      lotus: 'The Sacred Lotus represents purity.\nIt blooms beautifully even in muddy water!',
      trunk: 'The Curved Trunk represents adaptability.\nGanesha uses it to remove obstacles!'
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

  // Handler functions
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setShowPowerMission(true);
  };

  const handleContinueLearning = () => {
    setShowPowerModal(false);
    const symbolKey = currentMissionSymbol;

    if (symbolKey === 'lotus') {
      setTimeout(() => setShowSparkle('all-lotuses'), 500);
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          phase: PHASES.GOLDEN_VISIBLE,
          currentFocus: 'golden'
        });
        setShowSparkle('golden-lotus');
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);

    } else if (symbolKey === 'trunk') {
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusBloom: true,
          phase: PHASES.GOLDEN_BLOOM
        });
        setShowSparkle(null);
        setTimeout(() => {
          sceneActions.updateState({
            phase: PHASES.COMPLETE,
            stars: 5,
            completed: true,
            currentPopup: 'final_fireworks',
            progress: { percentage: 100, starsEarned: 5, completed: true }
          });
          setTimeout(() => setShowSparkle('final-fireworks'), 500);
        }, 800);
      }, 500);
    }
  };

  const handleMissionComplete = (symbolKey) => {
    setShowPowerMission(false);
    if (symbolKey === 'lotus') {
      setTimeout(() => setShowSparkle('all-lotuses'), 500);
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          phase: PHASES.GOLDEN_VISIBLE,
          currentFocus: 'golden'
        });
        setShowSparkle('golden-lotus');
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
    } else if (symbolKey === 'trunk') {
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => {
        sceneActions.updateState({
          goldenLotusBloom: true,
          phase: PHASES.GOLDEN_BLOOM
        });
        setShowSparkle(null);
        setTimeout(() => {
          sceneActions.updateState({
            phase: PHASES.COMPLETE,
            stars: 5,
            completed: true,
            currentPopup: 'final_fireworks',
            progress: { percentage: 100, starsEarned: 5, completed: true }
          });
          setTimeout(() => setShowSparkle('final-fireworks'), 500);
        }, 800);
      }, 500);
    }
  };

  // -- SymbolAutoReveal helpers -----------------------------------------------

  const getSidebarTarget = useCallback((symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2),
    };
  }, []);

  const triggerFireworks = () => {
    setShowSparkle('final-fireworks');
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'lotus') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.GOLDEN_VISIBLE });
      // discoveredSymbols + goldenLotusVisible delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({
          goldenLotusVisible: true,
          discoveredSymbols: { ...sceneState.discoveredSymbols, lotus: true }
        });
      }, 950);

    } else if (symbolId === 'trunk') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.COMPLETE, completed: true });
      // discoveredSymbols delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({ discoveredSymbols: { lotus: true, trunk: true } });
      }, 950);
      safeSetTimeout(() => triggerFireworks(), 2450);
    }
  };

  // -------------------------------------------------------------------------

  const handleLotusClick = (index) => {
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (showResumePopup) {
      setShowResumePopup(false);
      clearTimeout(resumePopupTimeoutRef.current);
    }
    if (!sceneState || !sceneActions) return;
    if (!sceneState.welcomeShown) sceneActions.updateState({ welcomeShown: true });

    const lotusStates = [...(sceneState.lotusStates || [0, 0, 0])];

    if (lotusStates[index] === 1) {
      playUiTap();
      setShowSparkle(`lotus-${index}`);
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    playBloom();
    lotusStates[index] = 1;
    setShowSparkle(`lotus-${index}`);
    setTimeout(() => setShowSparkle(null), 1500);

    const bloomedCount = lotusStates.filter(s => s === 1).length;

    if (bloomedCount === 3) {
      playChime();
      triggerMiniGesture('center', 2500, MINI_VICTORY_ICON);
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.SOME_BLOOMED,
        progress: { percentage: 50, starsEarned: 4 }
      });

      safeSetTimeout(() => {
        sceneActions.updateState({
          allLotusBloom: true,
          phase: PHASES.ALL_BLOOMED
        });
        safeSetTimeout(() => setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I bloom in the mud!',
          symbolImage: symbolLotusColored
        }), 1500);
      }, 1000);

    } else {
      triggerMiniGesture('lotus', 1200, MINI_THUMBS_UP_ICON);
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.SOME_BLOOMED,
        progress: { ...sceneState.progress, percentage: 10 * bloomedCount }
      });
    }
  };

  const handleGoldenLotusClick = () => {
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions) return;

    if (sceneState.goldenLotusBloom) {
      playUiTap();
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    if (sceneState.elephantVisible) {
      playUiTap();
      setShowSparkle('golden-lotus-clicked');
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    playBloom();
    triggerMiniGesture('center', 1500, MINI_OK_ICON);
    setShowSparkle('golden-lotus-clicked');

    safeSetTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        elephantVisible: true,
        phase: PHASES.ELEPHANT_VISIBLE,
        currentFocus: 'elephant'
      });
      setShowSparkle('elephant-appear');
      safeSetTimeout(() => setShowSparkle(null), 1500);
    }, 500);
  };

  const handleElephantClick = () => {
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (showResumePopup) {
      setShowResumePopup(false);
      clearTimeout(resumePopupTimeoutRef.current);
    }
    if (!sceneState || !sceneActions || sceneState.elephantTransformed) return;

    playUiTap();
    setShowSparkle('elephant');

    const elephant = document.getElementById('elephant-container');
    if (elephant) {
      elephant.classList.add('elephant-slide-in');

      safeSetTimeout(() => {
        elephant.style.right = '4%';
        elephant.classList.add('elephant-position-locked');

        sceneActions.updateState({
          elephantTransformed: true,
          trunkActive: true,
          phase: PHASES.ELEPHANT_TRANSFORMED
        });

        let dropCount = 0;
        const maxDrops = 15;

        triggerWaterSpray();
        dropCount++;

        const waterInterval = setInterval(() => {
          if (dropCount >= maxDrops) {
            clearInterval(waterInterval);
            safeSetTimeout(() => {
              sceneActions.updateState({ trunkActive: false });
              setShowSparkle(null);
              playGlow();
              setTimeout(() => playTwinkle(), 600);
              triggerMiniGesture('center', 2500, MINI_VICTORY_ICON);
              safeSetTimeout(() => setRevealConfig({
                symbolId: 'trunk',
                symbolName: 'Trunk',
                affirmation: 'Strong and gentle!',
                symbolImage: symbolTrunkColored
              }), 2000);
            }, 1000);
            return;
          }
          triggerWaterSpray();
          dropCount++;
        }, 150);

        timeoutsRef.current.push(waterInterval);
      }, 1000);
    }
  };

  const shouldEnableHints = () => {
    const disabledPhases = [PHASES.COMPLETE, PHASES.GOLDEN_BLOOM];
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'lotus-hint',
      message: 'Click the lotus flowers!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        if (sceneState.phase !== PHASES.INITIAL && sceneState.phase !== PHASES.SOME_BLOOMED) return false;
        const lotusStates = sceneState.lotusStates || [0, 0, 0];
        return !lotusStates.every(state => state === 1);
      }
    },
    {
      id: 'elephant-hint',
      message: 'Click the elephant!',
      position: { bottom: '60%', right: '20%', transform: 'translateX(50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState.elephantVisible && !sceneState.elephantTransformed;
      }
    },
    {
      id: 'golden-hint',
      message: 'Click the golden lotus!',
      position: { bottom: '60%', left: '45%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        if (sceneState.elephantVisible && !sceneState.elephantTransformed) return false;
        return sceneState.goldenLotusVisible && !sceneState.goldenLotusBloom;
      }
    }
  ];

  const getLotusImage = (index) => {
    const lotusStates = sceneState?.lotusStates || [0, 0, 0];
    return lotusStates[index] === 0 ? lotusClosed : lotusBloomed;
  };

  const renderCounter = () => {
    const lotusStates = sceneState?.lotusStates || [0, 0, 0];
    const bloomCount = lotusStates.filter(state => state === 1).length;

    return (
      <div className="lotus-counter">
        <div className="counter-icon">
          <img src={bloomCount > 0 ? lotusBloomed : lotusClosed} alt="Lotus" />
        </div>
        <div className="counter-progress">
          <div className="counter-progress-fill" style={{ width: `${(bloomCount / 3) * 100}%` }} />
        </div>
        <div className="counter-display">{bloomCount}/3</div>
      </div>
    );
  };

  const isFinalCelebrationActive = showSparkle === 'final-fireworks' || showSceneCompletion;

  // Fireworks completion handler (matches Modak-style fireworks swap)
  useEffect(() => {
    if (showSparkle !== 'final-fireworks') return;
    setFireworksFinished(false);
    const timer = setTimeout(() => {
      setShowSparkle(null);
      setFireworksFinished(true);

      const profileId = localStorage.getItem('activeProfileId');
      if (profileId) {
        GameStateManager.saveGameState('symbol-mountain', 'pond', {
          completed: true,
          stars: 5,
          symbols: { lotus: true, trunk: true },
          phase: 'complete',
          timestamp: Date.now()
        });

        localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_pond`);
        SimpleSceneManager.clearCurrentScene();
      }

      setShowSceneCompletion(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showSparkle]);

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  // 1. WRAP IN GAMELAYOUT
  return (
    <GameLayout
      zoneId="symbol-mountain"
      helpConfig={pondHelpConfig}
      sceneState={sceneState}
      onHome={() => onNavigate?.('home')}
      onReplay={resetScene}
      isAudioOn={isAudioOn}
      onAudioToggle={toggleAudio}
      showMenu={false}
    >
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="pond-scene-container">
            <HomeButton onNavigate={onNavigate} />
            <div className="pond-background" style={{ backgroundImage: `url(${pondBackground})` }}>

              {/* REMOVE OLD MANUAL RENDERCOUNTER, UNIFIED HEADER IS HANDLED BELOW */}

              {/* UnifiedHeaderV2 disabled per request */}

              <OpeningModal
                zoneId={zoneId}
                sceneId={sceneId}
                isOpen={!sceneState.welcomeShown}
                onStart={() => {
                  sceneActions.updateState({ welcomeShown: true });
                  if (!openingVoPlayedRef.current) {
                    speakPondPrompt('opening');
                    openingVoPlayedRef.current = true;
                  }
                }}
                characterImg={ganeshaCharacter}
                showButton={true}
              />

              {/* Lotus flowers */}
              {[0, 1, 2].map((index) => (
                <div key={index} className={`lotus lotus-${index + 1} ${showHintGlow && sceneState.lotusStates?.[index] === 0 ? 'hint-glow' : ''}`}>
                  <ClickableElement
                    id={`lotus-${index}`}
                    onClick={() => handleLotusClick(index)}
                    completed={(sceneState.lotusStates || [])[index] === 1}
                    zone="pond-zone"
                    data-element={`lotus-${index + 1}`}
                  >
                    <img src={getLotusImage(index)} alt={`Lotus ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                  </ClickableElement>
                  {showSparkle === `lotus-${index}` && (
                    <SparkleAnimation type="star" count={15} color="#ff9ebd" size={10} duration={1500} fadeOut={true} area="full" />
                  )}
                </div>
              ))}

              {/* Hint 2 pointer (idle gesture) */}
              {showIdleGestureHint && (() => {
                const idleTarget =
                  sceneState?.phase === PHASES.ELEPHANT_VISIBLE ? 'elephant' :
                  sceneState?.phase === PHASES.GOLDEN_VISIBLE ? 'golden-lotus' :
                  'lotus';
                return (
                  <div className={`pond-hint-pointer pond-hint-pointer--${idleTarget}`} aria-hidden="true">
                    👆
                  </div>
                );
              })()}

              {/* All lotuses sparkle */}
              {showSparkle === 'all-lotuses' && (
                <div className="all-lotuses-sparkle">
                  <SparkleAnimation type="magic" count={20} color="lightblue" size={10} duration={1500} fadeOut={true} area="full" />
                </div>
              )}

              {/* Golden lotus */}
              {sceneState.goldenLotusVisible && (
                <div className={`golden-lotus-container ${sceneState.goldenLotusBloom ? 'blooming' : ''} ${showHintGlow && !sceneState.goldenLotusBloom && !sceneState.elephantVisible ? 'hint-glow' : ''}`}>
                  <ClickableElement
                    id="golden-lotus"
                    onClick={handleGoldenLotusClick}
                    completed={sceneState.goldenLotusBloom}
                    zone="golden-zone"
                  >
                    <img src={sceneState.goldenLotusBloom ? goldenLotusBloomed : goldenLotusClosed} alt="Golden Lotus" style={{ width: '100%', height: '100%' }} />
                  </ClickableElement>
                  {(showSparkle === 'golden-lotus' || showSparkle === 'golden-lotus-clicked' || showSparkle === 'golden-lotus-bloom') && (
                    <SparkleAnimation
                      type={showSparkle === 'golden-lotus-bloom' ? 'glitter' : 'magic'}
                      count={20}
                      color={showSparkle === 'golden-lotus-bloom' ? 'gold' : 'orange'}
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* Elephant */}
              {sceneState.elephantVisible && (
                <div
                  className={`elephant-partial ${sceneState.elephantTransformed ? 'elephant-position-locked' : ''} ${showHintGlow && !sceneState.elephantTransformed ? 'hint-glow' : ''}`}
                  id="elephant-container"
                >
                  <ClickableElement
                    id="elephant"
                    onClick={handleElephantClick}
                    completed={sceneState.elephantTransformed}
                    zone="elephant-zone"
                  >
                    <img src={sceneState.elephantTransformed ? waterElephant : elephantFull} alt="Elephant" style={{ width: '100%', height: '100%' }} />
                  </ClickableElement>
                  {(showSparkle === 'elephant' || showSparkle === 'elephant-appear') && (
                    <SparkleAnimation
                      type={showSparkle === 'elephant' ? 'firefly' : 'star'}
                      count={20}
                      color={showSparkle === 'elephant' ? 'lightblue' : '#aaaaaa'}
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              )}

              {/* Water Spray Arc (Vakratunda Grove style) */}
              {activeWaterSpray && (
                <WaterSprayArc
                  key={activeWaterSpray.key}
                  sourcePosition={activeWaterSpray.sourcePosition}
                  targetPosition={activeWaterSpray.targetPosition}
                  isActive={true}
                  dropCount={22}
                  duration={1700}
                  phase={activeWaterSpray.phase}
                />
              )}

              {/* Symbol Learning Sparkles */}
              {showSparkle === 'lotus-to-sidebar' && (
                <div style={{ position: 'absolute', top: '25%', left: '30%', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#4ECDC4" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

              {showSparkle === 'trunk-to-sidebar' && (
                <div style={{ position: 'absolute', top: '60%', right: '25%', width: '300px', height: '200px', zIndex: 15, pointerEvents: 'none' }}>
                  <SparkleAnimation type="stream" count={20} color="#FFD700" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

              {/* ProgressiveHintSystem disabled per request */}

              {/* MINI GESTURE CUE — thumbs up / victory / ok */}
              {miniGesture.show && (
                <div
                  key={`mini-gesture-${miniGesture.key}`}
                  className={`ganesha-gesture-cue modak-mini-ganesha-cue modak-mini-ganesha-cue--${miniGesture.target}`}
                  style={{ '--mini-cue-duration': `${miniGesture.durationMs}ms` }}
                  aria-hidden="true"
                >
                  <img className="modak-mini-gesture-icon" src={miniGesture.icon} alt="" />
                </div>
              )}
            </div>

            {/* Resume Popup */}
            {showResumePopup && (
              <div style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                padding: '30px 50px',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                zIndex: 9999,
                fontFamily: 'Baloo 2, cursive',
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#5D2E0F',
                textAlign: 'center',
                maxWidth: '80%',
                border: '4px solid #FF8C00'
              }}>
                {resumeMessage}
              </div>
            )}

            {/* New Overlay Block for SymbolPowerMission */}
            {showPowerMission && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(3px)',
                zIndex: 499,
                animation: 'fadeIn 0.3s ease-out'
              }} />
            )}

            {/* Symbol Power Mission */}
            <SymbolPowerMission
              show={showPowerMission}
              symbolKey={currentMissionSymbol}
              beforeImage={missionImages[currentMissionSymbol]?.before}
              afterImage={missionImages[currentMissionSymbol]?.after}
              powerConfig={powerConfig[currentMissionSymbol]}
              onComplete={handleMissionComplete}
              onCancel={() => {
                setShowPowerMission(false);
                setShowPowerModal(true);
              }}
            />

            {/* Fireworks (Modak-style) */}
            <FireworksCompletion
              show={showSparkle === 'final-fireworks'}
              showCard={false}
            />
            <CalmGoldenFireworks
              show={showSparkle === 'final-fireworks'}
              particles={14}
              duration={3500}
            />

            {/* DISCOVERY 1: GOLDEN LOTUS — disabled; SymbolAutoReveal handles this now */}
            {false && showDiscoveryFlip1 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found the Golden Lotus!"
                celebrationText="It has something magical to share!"
                celebrationImage={goldenLotusClosed}
                powerTitle="Positivity Power Unlocked!"
                powerText="Just like a lotus stays clean in muddy water… you can stay bright and happy even on messy days!"
                powerIcon={symbolLotusColored}
                buttonText="Ready to Bloom!"
                onComplete={() => {
                  console.log("Discovery 1: Golden Lotus discovered!");
                  setShowDiscoveryFlip1(false);
                  sceneActions.updateState({
                    phase: PHASES.GOLDEN_VISIBLE,
                    goldenLotusVisible: true,
                    discoveredSymbols: { ...sceneState.discoveredSymbols, lotus: true }
                  });
                }}
                showSparkles={true}
              />
            )}

            {/* DISCOVERY 2: ELEPHANT TRUNK — disabled; SymbolAutoReveal handles this now */}
            {false && showDiscoveryFlip2 && (
              <SimpleDiscoveryOverlay
                celebrationTitle="You Found the Elephant's Trunk Magic!"
                celebrationText="It wants to share its secret with you!"
                celebrationImage={waterElephant}
                powerTitle="Power Switch Unlocked!"
                powerText="Your trunk can be strong or gentle. And just like that… you can choose how to act!"
                powerIcon={symbolTrunkColored}
                buttonText="Mission Complete!"
                onComplete={() => {
                  console.log("Discovery 2: Mission complete! 🎆");
                  setShowDiscoveryFlip2(false);
                  sceneActions.updateState({
                    phase: PHASES.COMPLETE,
                    completed: true,
                    discoveredSymbols: { lotus: true, trunk: true }
                  });
                  setShowSparkle('final-fireworks');
                }}
                showSparkles={true}
              />
            )}

            {/* SYMBOL AUTO REVEAL */}
            {revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                symbolImage={revealConfig.symbolImage}
                sidebarTargetRect={getSidebarTarget(revealConfig.symbolId)}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* Scene Completion */}
            {showSceneCompletion && (
              <SceneCompletionCelebration
                show={true}
                sceneName="Pond Adventure"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                sceneNumber={2}
                totalScenes={4}
                starsEarned={5}
                totalStars={5}
                discoveredSymbols={['lotus', 'trunk']}
                symbolImages={{
                  lotus: symbolLotusColored,
                  trunk: symbolTrunkColored
                }}
                symbolData={{
                  lotus: {
                    title: "Lotus — Ganesha's Pure Flower!",
                    description: "The lotus grows in muddy water but blooms beautifully clean. It reminds us to stay pure and bright no matter what!"
                  },
                  trunk: {
                    title: "Trunk — Ganesha's Super Tool!",
                    description: "Ganesha's trunk can pick up tiny flowers or move giant rocks! It shows us that being gentle AND strong is a superpower."
                  }
                }}
                nextSceneName="Temple Discovery"
                sceneId="pond"
                completionData={{
                  stars: 5,
                  symbols: { lotus: true, trunk: true },
                  completed: true,
                  totalStars: 5
                }}
                onComplete={onComplete}
                onReplay={() => {
                  setShowSceneCompletion(false);
                  resetScene();
                }}
                onContinue={() => {
                  if (clearManualCloseTracking) clearManualCloseTracking();
                  if (hideCoach) hideCoach();

                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'pond', {
                      completed: true,
                      stars: 5,
                      symbols: { lotus: true, trunk: true }
                    });
                  }

                  setTimeout(() => {
                    SimpleSceneManager.setCurrentScene('symbol-mountain', 'temple', false, false);
                    onNavigate?.('scene-complete-continue');
                  }, 100);
                }}
              />
            )}

            {/* DELETE MANUAL TOCABOCA NAV - GameLayout HANDLES THIS NOW */}

            {/* BackToMapButton disabled per request */}

            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

            {sceneState.welcomeShown && !isFinalCelebrationActive && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true,
                  modak: true,
                  belly: true,
                  ...(sceneState.discoveredSymbols || {})
                }}
                onSymbolClick={(symbolId) => {
                  console.log(`Sidebar symbol clicked: ${symbolId}`);
                }}
              />
            )}

          </div>
        </MessageManager>
      </InteractionManager>

      <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      {/* 3-2-1 resume countdown — renders on top of everything when child returns to tab */}
      <ResumeCountdown value={countdownValue} />
    </GameLayout>
  );
};

export default PondSceneSimplifiedV3;

