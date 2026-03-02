// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx
// FIXED: Removed SanskritWordMission, connected PowerUnlockOverlay directly to next phase

import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGroveSimplified.css';
import '../../../shared/components/OpeningModal.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";

// Voice Guidance Hook
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay'; // ← superseded by SymbolAutoReveal
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
// import { PauseButton, PauseMenu } from '../../../../lib/components/ui/PauseMenu'; // ← removed: replaced by home icon

import AppSidebar from '../../shared/AppSidebar';
// REMOVED: import SanskritWordMission (No longer needed)
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';

// Zone Theme
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content';

// Game Components
import VakratundaGame from './VakratundaGame';
import MahakayaGame from './MahakayaGame';

// Character images
import boyNamaste from './assets/images/boy-namaste.png';
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';

// Images
import riverBackground from './assets/images/elephant-grove-bg.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';

// Elephant images for memory game
import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';

// Singers & Rewards
import budVa from './assets/images/vakratunda/va-bud.png';
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import seedImage from './assets/images/mahakaya/seed.png';
import flowerMa from './assets/images/mahakaya/ma-flower.png';

// ========================================
// 1. LOCAL UI COMPONENTS
// ========================================

const VOGatedButton = ({ visible, onClick, children, className = '', style = {} }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        ...style,
        animation: 'buttonFadeIn 0.35s ease-out',
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      {children}
      <style>{`
        @keyframes buttonFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </button>
  );
};

// ========================================

const PHASES = {
  INITIAL: 'initial',
  VAKRATUNDA_GAME: 'vakratunda_game',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  VAKRATUNDA_POWER: 'vakratunda_power',
  MAHAKAYA_GAME: 'mahakaya_game',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  MAHAKAYA_POWER: 'mahakaya_power',
  COMPLETE: 'complete'
};

const powerConfig = {
  vakratunda: { 
    name: 'Flexibility Power', 
    image: appVakratunda,
    color: '#4ECDC4',
    affirmation: 'My trunk bends to find a new way.',
    story: 'When you feel stuck, try a new way.'
  },
  mahakaya: { 
    name: 'Inner Strength', 
    image: appMahakaya,
    color: '#FF6B35',
    affirmation: 'I am big and strong — and you have strength inside too.',
    story: 'Stand tall. Be brave.'
  }
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VakratundaGroveSimplified = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'vakratunda-grove'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: PHASES.INITIAL,
          learnedWords: { vakratunda: false, mahakaya: false },
          chantedVerses: {}, 
          learnedSyllables: {},
          unlockedApps: {},
          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false },
          vakratundaGameState: null,
          mahakayaGameState: null,
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <VakratundaGroveContent
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

const VakratundaGroveContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCenteredWord, setShowCenteredWord] = useState(null);

  // Controls the Power Unlock Overlay (superseded by SymbolAutoReveal)
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [showPowerButton, setShowPowerButton] = useState(false);
  const [showPracticeAgainButton, setShowPracticeAgainButton] = useState(false);

  // ── SymbolAutoReveal state ──────────────────────────────────────────────
  // null = not showing; object = reveal active
  const [revealConfig, setRevealConfig] = useState(null);

  const [currentWord, setCurrentWord] = useState(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showGaneshaCelebration, setShowGaneshaCelebration] = useState(false);
  const [showFinalGanesha, setShowFinalGanesha] = useState(false);

  // Pause Menu State
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Opening Modal State
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);

  const [savedRecordings, setSavedRecordings] = useState({});
  const [showAppDiscovery, setShowAppDiscovery] = useState(false);
  const timeoutsRef = useRef([]);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';
  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' ||
    showFinalGanesha ||
    showSceneCompletion ||
    showAppDiscovery ||
    sceneState.phase === PHASES.COMPLETE;

  const isCelebrationOrOverlayActive =
    isFinalCelebrationActive ||
    !!revealConfig ||          // Block while SymbolAutoReveal is showing
    showPowerOverlay ||
    showCenteredWord;

  useEffect(() => {
    if (isFinalCelebrationActive && showPauseMenu) {
      setShowPauseMenu(false);
    }
  }, [isFinalCelebrationActive, showPauseMenu]);

  // Voice Guidance Hook
  const {
    playVoice: playVO,
    stopVoice,
    playSyllable,
    playWord: playWordAudio,
    playSfx,
    playCorrect,
    playWrong,
    isPlaying: isVOPlaying,
    setCurrentPhase,
    startIdleTimer,
    stopIdleTimer
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: false,
    voiceVolume: 1,
    sfxVolume: 0.7,
    idleTimeout: 20
  });

  // Track whether recorder popup is open — pause game voice when it is
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  // ========================================
  // ESC KEY TO TOGGLE PAUSE (Desktop UX)
  // ========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sceneState.welcomeShown && !isCelebrationOrOverlayActive && !showSceneCompletion) {
        e.preventDefault();
        if (!showPauseMenu) {
          // Open pause menu
          stopVoice();
          stopIdleTimer();
          setShowPauseMenu(true);
        } else {
          // Close pause menu (resume)
          setShowPauseMenu(false);
          const activeGamePhases = [PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME];
          const celebrationPhases = [PHASES.VAKRATUNDA_COMPLETE, PHASES.VAKRATUNDA_POWER, PHASES.MAHAKAYA_COMPLETE, PHASES.MAHAKAYA_POWER];
          if (activeGamePhases.includes(sceneState.phase) &&
              !celebrationPhases.includes(sceneState.phase) &&
              !showPowerOverlay &&
              !revealConfig &&
              !showCenteredWord) {
            startIdleTimer();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPauseMenu, sceneState.welcomeShown, isCelebrationOrOverlayActive, showSceneCompletion, sceneState.phase, showPowerOverlay, showCenteredWord, revealConfig]);

  // ========================================
  // AUTO-PAUSE ON APP BLUR (Mobile/Tab Switch)
  // ========================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't auto-pause during power overlay, reveal card, word reveal, or other non-interactive overlays
      const shouldNotPause = showPowerOverlay || !!revealConfig || showCenteredWord || isFinalCelebrationActive || showSceneCompletion || showPauseMenu;

      if (document.hidden && sceneState.welcomeShown && !shouldNotPause) {
        // Auto-pause when user switches tabs/apps
        stopVoice();
        stopIdleTimer();
        setShowPauseMenu(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sceneState.welcomeShown, isFinalCelebrationActive, showSceneCompletion, showPauseMenu, showPowerOverlay, showCenteredWord]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // ── SymbolAutoReveal helpers ──────────────────────────────────────────────

  // Compute delta from card center (viewport center) to sidebar icon center
  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 }; // fallback: right edge of screen
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width  / 2) - (window.innerWidth  / 2),
      y: (r.top  + r.height / 2) - (window.innerHeight / 2)
    };
  };

  // Run game-phase advancement after user taps card and it finishes flying
  // Rule: never update unlockedApps before ~950ms after onComplete —
  // updating it causes AppSidebar to re-render which strips the bloom
  // class mid-animation.
  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'vakratunda') {
      // 950ms: bloom fully done → advance to Mahakaya game
      safeSetTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...sceneState.unlockedApps, vakratunda: true },
          phase: PHASES.MAHAKAYA_GAME,
          mahakayaGameState: null // Ensure Mahakaya always starts from first syllable
        });
      }, 950);

    } else if (symbolId === 'mahakaya') {
      // 950ms: bloom fully done → mark app unlocked
      safeSetTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...sceneState.unlockedApps, mahakaya: true }
        });
      }, 950);
      // Show App Discovery screen after bloom settles
      safeSetTimeout(() => {
        setShowAppDiscovery(true);
      }, 1500);
    }
  };

  // ========================================
  // VOICE: Play welcome on OPENING MODAL (before game starts)
  // Button appears only after VO finishes
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is INITIAL and not yet started)
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      // Small delay before starting welcome VO
      const timer = setTimeout(() => {
        playVO('welcome', () => {
          // VO finished - show the button with fade-in
          playSfx('chime'); // Ready cue sound
          setOpeningButtonVisible(true);
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.phase, sceneState.welcomeShown]);

  const playAudio = (audioPath, volume = 1.0) => {
    if (!isAudioOn) return Promise.resolve();
    try {
      const audio = new Audio(audioPath);
      audio.volume = volume;
      return audio.play().catch(() => Promise.resolve());
    } catch {
      return Promise.resolve();
    }
  };

  // Use hook's playWord for word audio
  const playWord = (word) => {
    if (isAudioOn) {
      playWordAudio(word);
    }
  };

  // Set current phase for idle hints (game start VO is now handled by AutoPlayMode)
  useEffect(() => {
    if (sceneState.phase === PHASES.VAKRATUNDA_GAME && sceneState.welcomeShown) {
      setCurrentPhase('vakratundaGame');
    }
  }, [sceneState.phase, sceneState.welcomeShown, setCurrentPhase]);

  useEffect(() => {
    if (sceneState.phase === PHASES.MAHAKAYA_GAME) {
      setCurrentPhase('mahakayaGame');
    }
  }, [sceneState.phase, setCurrentPhase]);

  // Memory game completion
  const handlePhaseComplete = (word) => {
    console.log(`${word} learned!`);

    // Stop idle timer — game is done, no more hints
    stopIdleTimer();
    setCurrentPhase(null);

    // Play celebration VO
    if (isAudioOn) {
      playVO('chantWordReveal');
    }

    // Word-reveal VO key (matches voiceGuidance.js)
    const wordRevealKey = word === 'vakratunda' ? 'vakratunda-word-reveal' : 'mahakaya-word-reveal';

    // Update State
    const chantKey = word === 'vakratunda' ? 'vakratunda-chant' : 'mahakaya-chant';
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [chantKey]: true },
      phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_COMPLETE : PHASES.MAHAKAYA_COMPLETE
    });

    // Visuals
    setShowCenteredWord(word);
    setShowSparkle(`${word}-celebration`);
    playWord(word);

    // ── Transition: word celebration → SymbolAutoReveal ──────────────────────
    const triggerReveal = () => {
      setShowCenteredWord(null);
      setShowSparkle(null);

      // Show SymbolAutoReveal flip card
      setRevealConfig({
        symbolId:    word,
        symbolImage: powerConfig[word].image,
        symbolName:  powerConfig[word].name,
        affirmation: powerConfig[word].affirmation,
        sidebarTarget: getSidebarTarget(word)
      });

      sceneActions.updateState({
        phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
      });
    };

    // Word reveal VO -> then transition to SymbolAutoReveal
    if (isAudioOn) {
      safeSetTimeout(() => {
        playVO(wordRevealKey, () => {
          triggerReveal();
        });
      }, 2000);
    } else {
      // Audio off fallback - use timed transitions
      safeSetTimeout(() => {
        triggerReveal();
      }, 5000);
    }

    // ── Old goToPowerOverlay (superseded by SymbolAutoReveal) ──
    // const goToPowerOverlay = () => {
    //   setShowCenteredWord(null);
    //   setShowSparkle(`${word}-to-sidebar`);
    //   sceneActions.updateState({ unlockedApps: { ...sceneState.unlockedApps, [word]: true } });
    //   safeSetTimeout(() => {
    //     setShowSparkle(null);
    //     setCurrentWord(word);
    //     setShowPowerOverlay(true);
    //     setShowPowerButton(false);
    //     setShowPracticeAgainButton(false);
    //     if (isAudioOn) {
    //       const powerVOKey = word === 'vakratunda' ? 'vakratundaPower' : 'mahakayaPower';
    //       playVO(powerVOKey, () => { playSfx('chime'); setShowPowerButton(true); setShowPracticeAgainButton(true); });
    //     } else { setShowPowerButton(true); setShowPracticeAgainButton(true); }
    //     sceneActions.updateState({ phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER });
    //   }, 2000);
    // };
  };

  // ✅ FIXED: Direct transitions, no "Save Animal" mission
  const handlePowerUnlockComplete = () => {
    setShowPowerOverlay(false);
    stopVoice(); // Stop any playing VO

    if (currentWord === 'vakratunda') {
      console.log('🔄 Moving to Mahakaya Phase');
      // Go straight to Mahakaya Game
      sceneActions.updateState({
        phase: PHASES.MAHAKAYA_GAME,
        mahakayaGameState: null // Ensure Mahakaya always starts from first syllable
      });
    } else {
      console.log('📱 Showing App Discovery screen');
      // Show App Discovery screen before final celebration
      setShowAppDiscovery(true);
    }
  };

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    console.log('🎉 Triggering Final Celebration from App Discovery');

    // Play scene complete VO
    if (isAudioOn) {
      playVO('sceneComplete');
    }

    // Complete Scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });

    // Trigger Finale
    setShowFinalGanesha(true);
    setShowSparkle('final-fireworks');
  };

  // 🔄 Play Again - Replay the current word's game
  const handlePlayAgain = () => {
    setShowPowerOverlay(false);

    if (currentWord === 'vakratunda') {
      console.log('🔄 Replaying Vakratunda Game');
      // Reset vakratunda game state and go back to game phase
      sceneActions.updateState({
        phase: PHASES.VAKRATUNDA_GAME,
        vakratundaGameState: null, // Clear saved state to start fresh
        learnedWords: { ...sceneState.learnedWords, vakratunda: false }
      });
    } else if (currentWord === 'mahakaya') {
      console.log('🔄 Replaying Mahakaya Game');
      // Reset mahakaya game state and go back to game phase
      sceneActions.updateState({
        phase: PHASES.MAHAKAYA_GAME,
        mahakayaGameState: null, // Clear saved state to start fresh
        learnedWords: { ...sceneState.learnedWords, mahakaya: false }
      });
    }

    setCurrentWord(null);
  };

  // Unified State Saver
  const handleSaveComponentState = (componentType, componentState) => {
    const updatedState = {
      ...(componentType === 'vakratundaGame' && { vakratundaGameState: componentState }),
      ...(componentType === 'mahakayaGame' && { mahakayaGameState: componentState })
    };
    sceneActions.updateState(updatedState);
  };

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-simplified-container">
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>

            {/* 1. PAUSE BUTTON - Using shared component */}
            <PauseButton
              visible={sceneState.welcomeShown && !showSceneCompletion && !isFinalCelebrationActive}
              onClick={() => {
                if (isFinalCelebrationActive) return;
                stopVoice();      // Stop any playing VO
                stopIdleTimer();  // Stop idle hints
                setShowPauseMenu(true);
              }}
            />

            {/* DEV TEST BUTTONS - Skip to word overlay */}
            { sceneState.welcomeShown && !showPowerOverlay && !showCenteredWord && (
              <div style={{
                position: 'fixed', top: 10, right: 10, zIndex: 99999,
                display: 'flex', gap: '6px', flexDirection: 'column'
              }}>
                <button
                  onClick={() => handlePhaseComplete('vakratunda')}
                  style={{
                    padding: '6px 12px', fontSize: '11px', fontWeight: 'bold',
                    background: '#4ECDC4', color: '#fff', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', opacity: 0.85
                  }}
                >
                  ⚡ Test Vakratunda Reveal
                </button>
                <button
                  onClick={() => handlePhaseComplete('mahakaya')}
                  style={{
                    padding: '6px 12px', fontSize: '11px', fontWeight: 'bold',
                    background: '#FF6B35', color: '#fff', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', opacity: 0.85
                  }}
                >
                  ⚡ Test Mahakaya Reveal
                </button>
              </div>
            )}

            {/* 2. VISUAL PAUSE OVERLAY - Dims/blurs background when paused */}
            {showPauseMenu && !isFinalCelebrationActive && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)', // Safari support
                zIndex: 999,
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease-out',
                opacity: 1
              }} />
            )}

            {/* 3. PAUSE MENU - Using shared component */}
            <PauseMenu
              show={showPauseMenu && !isFinalCelebrationActive}
              onResume={() => {
                setShowPauseMenu(false);

                // SPECIAL CASE: If paused during word reveal celebration, skip to SymbolAutoReveal
                if ((sceneState.phase === PHASES.VAKRATUNDA_COMPLETE || sceneState.phase === PHASES.MAHAKAYA_COMPLETE) && showCenteredWord) {
                  console.log('🔄 Resuming from word reveal celebration, triggering SymbolAutoReveal...');
                  const word = sceneState.phase === PHASES.VAKRATUNDA_COMPLETE ? 'vakratunda' : 'mahakaya';

                  safeSetTimeout(() => {
                    setShowCenteredWord(null);
                    setShowSparkle(null);

                    setRevealConfig({
                      symbolId:    word,
                      symbolImage: powerConfig[word].image,
                      symbolName:  powerConfig[word].name,
                      affirmation: powerConfig[word].affirmation,
                      sidebarTarget: getSidebarTarget(word)
                    });

                    sceneActions.updateState({
                      phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
                    });
                  }, 500);

                  return; // Don't restart idle timer
                }

                // Restart idle timer ONLY for active game phases (not celebration/complete/power phases)
                const activeGamePhases = [PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME];
                const celebrationPhases = [PHASES.VAKRATUNDA_COMPLETE, PHASES.VAKRATUNDA_POWER, PHASES.MAHAKAYA_COMPLETE, PHASES.MAHAKAYA_POWER];

                // Don't restart idle timer if we're in celebration/transition OR if overlay/centered word is showing
                if (activeGamePhases.includes(sceneState.phase) &&
                    !celebrationPhases.includes(sceneState.phase) &&
                    !showPowerOverlay &&
                    !revealConfig &&
                    !showCenteredWord) {
                  startIdleTimer();
                }
              }}
              onBackToMap={() => {
                setShowPauseMenu(false);
                onNavigate?.('zones');
              }}
              isSoundOn={isAudioOn}
              onSoundToggle={() => {
                if (isAudioOn) stopVoice(); // Stop VO when muting
                setIsAudioOn(!isAudioOn);
              }}
              zoneName="Shloka River"
            />

            {/* 3. OPENING MODAL (Using Zone Theme Colors) */}
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (() => {
              const theme = getZoneTheme(zoneId);
              const modal = getOpeningModal(zoneId, sceneId);
              return (
                <div
                  className="game-modal-overlay"
                  style={{
                    '--modal-card-bg': theme.parentBg,
                    '--modal-text-primary': theme.textPrimary,
                    '--modal-btn-bg': theme.buttonActiveBg,
                    '--modal-btn-shadow': theme.glowColor
                  }}
                >
                    <div className="game-modal-content">
                      <div className="game-modal-character">
                        <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-modal-ganesha" />
                      </div>

                      <div className="game-modal-card">
                        <h1 className="game-modal-title">
                          {modal?.title || 'Bloom and Grow'}
                        </h1>

                        <div className="game-modal-icons">
                          <div className="game-modal-icon-item">
                            <img src={appVakratunda} alt="Flexibility" />
                            <span className="game-modal-icon-label">Flexibility</span>
                          </div>
                          <div className="game-modal-icon-item">
                            <img src={appMahakaya} alt="Strength" />
                            <span className="game-modal-icon-label">Strength</span>
                          </div>
                        </div>

                        <VOGatedButton
                          visible={openingButtonVisible}
                          onClick={() => {
                            sceneActions.updateState({
                              welcomeShown: true,
                              phase: PHASES.VAKRATUNDA_GAME
                            });
                          }}
                          className="game-modal-button"
                        >
                          {modal?.buttonText || "Let's Explore"}
                        </VOGatedButton>
                      </div>
                    </div>
                </div>
              );
            })()}

            {/* VAKRATUNDA MEMORY GAME */}
            <VakratundaGame
              isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME}
              hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
              onPhaseComplete={() => handlePhaseComplete('vakratunda')}
              onGameComplete={() => {}}
              profileName={profileName}
              getBudImage={() => budVa}
              getLotusImage={() => lotusVa}
              getBabyElephantImage={() => elephantBabyVa}
              selectedMode="auto"
              skipModeSelection={true}
              isReload={isReload}
              savedGameState={sceneState.vakratundaGameState}
              onSaveGameState={(state) => handleSaveComponentState('vakratundaGame', state)}
              voiceGuidance={{ playVoice: playVO, playSfx, stopVoice }}
              isPaused={isRecorderOpen || showPauseMenu}
            />

            {/* MAHAKAYA MEMORY GAME */}
            <MahakayaGame
              isActive={sceneState.phase === PHASES.MAHAKAYA_GAME}
              hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
              powerGained={sceneState.learnedWords?.vakratunda}
              onPhaseComplete={() => handlePhaseComplete('mahakaya')}
              onGameComplete={() => {}}
              profileName={profileName}
              getSeedImage={() => seedImage}
              getFlowerImage={() => flowerMa}
              getAdultElephantImage={() => elephantMa}
              selectedMode="auto"
              skipModeSelection={true}
              isReload={isReload}
              savedGameState={sceneState.mahakayaGameState}
              onSaveGameState={(state) => handleSaveComponentState('mahakayaGame', state)}
              voiceGuidance={{ playVoice: playVO, playSfx, stopVoice }}
              isPaused={isRecorderOpen || showPauseMenu}
            />

            {/* PERSISTENT BOY CHARACTER (Commented out per user request) */}
            {/* {sceneState.welcomeShown && !showSceneCompletion && (
              <div className="vakratunda-companion-boy">
                <img src={boyNamaste} alt="Learning with you" className="vakratunda-boy-companion" />
              </div>
            )} */}

            {/* GANESHA CELEBRATION */}
            {showGaneshaCelebration && (
              <div className="vakratunda-ganesha-celebration-enter">
                <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-slides-in" />
              </div>
            )}

            {/* ── SYMBOL AUTO-REVEAL (replaces PowerUnlockOverlay) ───────────────
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

            {/* ── PowerUnlockOverlay — COMMENTED OUT (superseded by SymbolAutoReveal) ──
            {showPowerOverlay && currentWord && (
              <PowerUnlockOverlay
                zoneId={zoneId}
                title={`${powerConfig[currentWord].name} Unlocked!`}
                description={{
                  main: [
                    powerConfig[currentWord].affirmation,
                    powerConfig[currentWord].story
                  ],
                  emphasis: currentWord === 'vakratunda'
                    ? 'I can try again.'
                    : currentWord === 'mahakaya'
                      ? 'I am strong inside.'
                      : 'You have mastered both powers!'
                }}
                icon={powerConfig[currentWord].image}
                iconColor={powerConfig[currentWord].color}
                buttonText={currentWord === 'vakratunda' ? "Discover Mahakaya" : "Discover Words!"}
                showButton={showPowerButton}
                showPlayAgain={showPracticeAgainButton}
                playAgainText="Practice Again"
                onPlayAgain={handlePlayAgain}
                onComplete={handlePowerUnlockComplete}
              />
            )}
            ── End PowerUnlockOverlay ── */}

            {/* 5-SECOND WORD CELEBRATION */}
            {showCenteredWord && (
              <>
                <div className="vakratunda-celebration-overlay" />
                <div className="vakratunda-centered-word-celebration">
                  <img 
                    src={powerConfig[showCenteredWord]?.image}
                    alt={showCenteredWord}
                    className="vakratunda-celebration-app-icon"
                  />
                  <div className="vakratunda-celebration-word-text">
                    {showCenteredWord.charAt(0).toUpperCase() + showCenteredWord.slice(1).toLowerCase()}
                  </div>
                </div>
              </>
            )}

            {/* App Discovery Screen (centerMode) — shown after Mahakaya Power Overlay */}
            {showAppDiscovery && (
              <AppSidebar
                centerMode={true}
                unlockedApps={sceneState.unlockedApps || {}}
                savedRecordings={savedRecordings}
                highlightApps={['vakratunda', 'mahakaya']}
                onCelebrate={handleAppDiscoveryCelebrate}
                onPopupOpen={() => {
                  stopVoice();
                  stopIdleTimer();
                }}
                onPopupClose={() => {
                  // stay on discovery screen, no timer restart
                }}
              />
            )}

            {/* Side rail AppSidebar — hidden during App Discovery and final celebration */}
            {!showAppDiscovery &&
             !isFinalCelebrationActive &&
             !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
            <AppSidebar
              unlockedApps={sceneState.unlockedApps || {}}
              savedRecordings={savedRecordings}
              isReload={isReload}
              onPopupOpen={() => {
                console.log("🎤 Recorder Opening - Pausing Game");
                stopVoice();
                stopIdleTimer();
                setIsRecorderOpen(true);
              }}
              onPopupClose={() => {
                console.log("🎤 Recorder Closing - Resuming Game");
                setIsRecorderOpen(false);
                // Only restart idle timer if we're in an active game phase (not celebration/overlay/complete)
                const activeGamePhases = [PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME];
                if (activeGamePhases.includes(sceneState.phase) && !showPowerOverlay && !showCenteredWord) {
                  startIdleTimer();
                }
              }}
            />
            )}

            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={6000}
                onComplete={() => {
                  setShowSparkle(null);
                  setShowFinalGanesha(false);
                  
                  // Save completion data
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    try {
                      GameStateManager.saveGameState(zoneId, sceneId, {
                        completed: true,
                        stars: 5,
                        phase: PHASES.COMPLETE,
                        words: sceneState.learnedWords || {},
                        syllables: sceneState.learnedSyllables || {},
                        apps: sceneState.unlockedApps || {},
                        timestamp: Date.now()
                      });
                      localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
                      SimpleSceneManager.clearCurrentScene();
                    } catch (error) {
                      console.error('Error saving game state:', error);
                    }
                  }
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* FINAL CELEBRATION */}
            {showFinalGanesha && !showSceneCompletion && (
              <div className="vakratunda-final-ganesha-appears">
                <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-final-enters" />
              </div>
            )}

            <SceneCompletionCelebration
              show={showSceneCompletion}
              zoneId={zoneId}
              sceneName="Vakratunda Grove"
              sceneNumber={1}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['vakratunda', 'mahakaya']}
              containerType="apps"
              appImages={{
                vakratunda: appVakratunda,
                mahakaya: appMahakaya,
              }}
              appData={{
                vakratunda: {
                  title: "Vakratunda - Curved Trunk",
                  description: "The remover of obstacles with his curved trunk! Practice the sacred sounds: VA-KRA-TUN-DA",
                  syllables: ['VA', 'KRA', 'TUN', 'DA'],
                  color: '#4ECDC4'
                },
                mahakaya: {
                  title: "Mahakaya - Great Body",
                  description: "The great cosmic form that contains the entire universe within! Practice: MA-HA-KA-YA",
                  syllables: ['MA', 'HA', 'KA', 'YA'],
                  color: '#FF6B35'
                }
              }}
              savedRecordings={savedRecordings}
              nextSceneName="Suryakoti Bank"
              sceneId="vakratunda-grove"
              completionData={{
                stars: 5,
                syllables: sceneState.learnedSyllables,
                words: sceneState.learnedWords,
                completed: true
              }}
              onComplete={onComplete}
              onReplay={() => {
                setShowSceneCompletion(false);
                setRevealConfig(null);
                resetScene();
              }}
              onContinue={() => {
                onNavigate?.('scene-complete-continue');
              }}
            />    

            <ProgressiveHintSystem
              ref={useRef(null)}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={[]}
              characterImage={mooshikaCoach}
              enabled={false}
            />
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaGroveSimplified;
