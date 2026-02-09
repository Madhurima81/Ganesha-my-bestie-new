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
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay'; // ✅ Modak Style Overlay
import { PauseButton, PauseMenu } from '../../../../lib/components/ui/PauseMenu'; // ✅ Shared Pause Components

import AppSidebar from '../../shared/AppSidebar';
// REMOVED: import SanskritWordMission (No longer needed)
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';

// Zone Theme
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';

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

  // Controls the Power Unlock Overlay
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [showPowerButton, setShowPowerButton] = useState(false);
  const [showPracticeAgainButton, setShowPracticeAgainButton] = useState(false);

  const [currentWord, setCurrentWord] = useState(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showGaneshaCelebration, setShowGaneshaCelebration] = useState(false);
  const [showFinalGanesha, setShowFinalGanesha] = useState(false);

  // Pause Menu State
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Opening Modal State
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);

  const [savedRecordings, setSavedRecordings] = useState({});
  const timeoutsRef = useRef([]);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';

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
    setCurrentPhase
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: false,
    voiceVolume: 1,
    sfxVolume: 0.7
  });

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

    const goToPowerOverlay = () => {
      setShowCenteredWord(null);
      setShowSparkle(`${word}-to-sidebar`);

      sceneActions.updateState({
        unlockedApps: { ...sceneState.unlockedApps, [word]: true }
      });

      safeSetTimeout(() => {
        setShowSparkle(null);
        setCurrentWord(word);

        // Show the Overlay and play power VO
        setShowPowerOverlay(true);
        setShowPowerButton(false);
        setShowPracticeAgainButton(false);
        if (isAudioOn) {
          const powerVOKey = word === 'vakratunda' ? 'vakratundaPower' : 'mahakayaPower';
          playVO(powerVOKey, () => {
            playSfx('chime');
            setShowPowerButton(true);
            setShowPracticeAgainButton(true);
          });
        } else {
          setShowPowerButton(true);
          setShowPracticeAgainButton(true);
        }

        sceneActions.updateState({
          phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
        });
      }, 2000);
    };

    // Word reveal VO -> then transition to Power Unlock Overlay
    if (isAudioOn) {
      safeSetTimeout(() => {
        playVO(wordRevealKey, () => {
          goToPowerOverlay();
        });
      }, 2000);
    } else {
      // Audio off fallback - use timed transitions
      safeSetTimeout(() => {
        goToPowerOverlay();
      }, 5000);
    }
  };

  // ✅ FIXED: Direct transitions, no "Save Animal" mission
  const handlePowerUnlockComplete = () => {
    setShowPowerOverlay(false);
    stopVoice(); // Stop any playing VO

    if (currentWord === 'vakratunda') {
      console.log('🔄 Moving to Mahakaya Phase');
      // Go straight to Mahakaya Game
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_GAME });
    } else {
      console.log('🎉 Triggering Final Celebration');

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
    }
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
              visible={sceneState.welcomeShown && !showSceneCompletion}
              onClick={() => setShowPauseMenu(true)}
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

            {/* 2. PAUSE MENU - Using shared component */}
            <PauseMenu
              show={showPauseMenu}
              onResume={() => setShowPauseMenu(false)}
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
              return (
                <div
                  className="game-modal-overlay"
                  style={{
                    '--modal-card-bg': '#F0F8F7',           // Light aqua from theme
                    '--modal-card-border': `4px solid ${theme.accentColor}`,
                    '--modal-text-primary': theme.textPrimary,
                    '--modal-text-secondary': theme.textSecondary,
                    '--modal-btn-bg': 'linear-gradient(135deg, #2E7D6B 0%, #1B5E4B 100%)',
                    '--modal-btn-shadow': 'rgba(30, 94, 75, 0.4)'
                  }}
                >
                   <div className="modak-game-sparkles">
                      <div className="modak-game-sparkle"></div>
                      <div className="modak-game-sparkle"></div>
                    </div>

                  <div className="game-modal-content">
                    <div className="game-modal-character">
                      <img src={ganeshaHeadphones} alt="Ganesha" />
                    </div>

                    <div className="game-modal-card" style={{
                      background: '#F0F8F7',
                      border: `4px solid ${theme.accentColor}`
                    }}>
                      <h1 className="game-modal-title" style={{ color: theme.textPrimary }}>
                        Elephant River
                      </h1>
                      <p className="game-modal-subtitle" style={{ color: theme.textSecondary }}>
                        Say the magic sounds and make flowers bloom
                      </p>

                      <div className="game-modal-icons">
                         <div className="game-modal-icon-item">
                            <img src={appVakratunda} alt="Flexibility" />
                            <span style={{ color: theme.textPrimary }}>Flexibility</span>
                         </div>
                         <div className="game-modal-icon-item">
                            <img src={appMahakaya} alt="Strength" />
                            <span style={{ color: theme.textPrimary }}>Strength</span>
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
                        style={{
                          background: 'linear-gradient(135deg, #2E7D6B 0%, #1B5E4B 100%)',
                          boxShadow: '0 10px 30px rgba(30, 94, 75, 0.4)'
                        }}
                      >
                        Start Learning!
                      </VOGatedButton>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VAKRATUNDA MEMORY GAME */}
            <VakratundaGame
              isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME}
              hideElements={showCenteredWord || showPowerOverlay}
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
            />

            {/* MAHAKAYA MEMORY GAME */}
            <MahakayaGame
              isActive={sceneState.phase === PHASES.MAHAKAYA_GAME}
              hideElements={showCenteredWord || showPowerOverlay}
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

            {/* 4. UPDATED POWER OVERLAY (with Play Again for shloka-river) */}
            {showPowerOverlay && currentWord && (
              <PowerUnlockOverlay
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
                buttonText={currentWord === 'vakratunda' ? "Discover Mahakaya" : "Celebrate!"}
                showButton={showPowerButton}
                showPlayAgain={showPracticeAgainButton}
                playAgainText="Practice Again"
                onPlayAgain={handlePlayAgain}
                onComplete={handlePowerUnlockComplete}
              />
            )}

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
                    {showCenteredWord.toUpperCase()}
                  </div>
                </div>
              </>
            )}

            <AppSidebar
              unlockedApps={sceneState.unlockedApps || {}}
              savedRecordings={savedRecordings}
              isReload={isReload}
            />

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
              sceneName="Vakratunda Grove"
              sceneNumber={1}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['vakratunda', 'mahakaya']}
              containerType="smartwatch"
              containerScreenImage={smartwatchScreen}
              appImages={{
                vakratunda: appVakratunda,
                mahakaya: appMahakaya,
              }}
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
