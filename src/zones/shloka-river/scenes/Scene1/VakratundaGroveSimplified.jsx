// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx
// FIXED: Removed SanskritWordMission, connected PowerUnlockOverlay directly to next phase

import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGroveSimplified.css';
import '../../../shared/components/OpeningModal.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";
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

import AppSidebar from '../../shared/AppSidebar';
// REMOVED: import SanskritWordMission (No longer needed)
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';

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
// 1. LOCAL UI COMPONENTS (From Modak MVP)
// ========================================

const PauseButton = ({ onClick, visible }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: '3px solid rgba(255, 215, 0, 0.6)',
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3500,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#5D2E0F">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    </button>
  );
};

const PauseMenu = ({ show, onResume, onBackToMap, isSoundOn, onSoundToggle }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', zIndex: 4000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onResume}>
      <div style={{
        background: '#FFF9E6', borderRadius: '32px', padding: '36px',
        border: '4px solid #FFD700', minWidth: '320px', textAlign: 'center'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: '#5D2E0F', margin: '0 0 20px 0' }}>PAUSED</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={onResume} style={menuButtonStyle}>Resume</button>
          <button onClick={onSoundToggle} style={menuButtonStyle}>
            Sound: {isSoundOn ? 'ON 🔊' : 'OFF 🔇'}
          </button>
          <button onClick={onBackToMap} style={menuButtonStyle}>Back to Map 🏠</button>
        </div>
      </div>
    </div>
  );
};

const menuButtonStyle = {
  padding: '16px 24px', borderRadius: '16px', border: '3px solid #FFD700',
  background: '#fff', fontSize: '18px', fontWeight: 'bold', color: '#5D2E0F', cursor: 'pointer'
};

const VOGatedButton = ({ visible, onClick, children }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 32px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white',
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        border: 'none',
        borderRadius: '50px',
        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
        cursor: 'pointer',
        animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        marginTop: '20px'
      }}
    >
      {children}
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
    affirmation: 'I am flexible',
    story: "Just like the elephant's trunk can bend and twist, your mind can be flexible too!"
  },
  mahakaya: { 
    name: 'Inner Strength', 
    image: appMahakaya,
    color: '#FF6B35',
    affirmation: 'I am strong',
    story: "Just like a big strong elephant, you have a giant strength inside your heart."
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

  // Simulating VO for Opening Modal
  useEffect(() => {
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      const timer = setTimeout(() => {
        setOpeningButtonVisible(true);
      }, 1500);
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

  const playWord = (word) => {
    playAudio(`/audio/words/${word}.mp3`);
  };

  // Memory game completion
  const handlePhaseComplete = (word) => {
    console.log(`${word} learned!`);
    
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
    
    // Transition to Power Unlock Overlay
    safeSetTimeout(() => {
      setShowCenteredWord(null);
      setShowSparkle(`${word}-to-sidebar`);
      
      sceneActions.updateState({
        unlockedApps: { ...sceneState.unlockedApps, [word]: true }
      });
      
      safeSetTimeout(() => {
        setShowSparkle(null);
        setCurrentWord(word);
        
        // Show the Overlay
        setShowPowerOverlay(true); 
        
        sceneActions.updateState({
          phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
        });
      }, 2000);
    }, 5000);
  };

  // ✅ FIXED: Direct transitions, no "Save Animal" mission
  const handlePowerUnlockComplete = () => {
    setShowPowerOverlay(false);
    
    if (currentWord === 'vakratunda') {
      console.log('🔄 Moving to Mahakaya Phase');
      // Go straight to Mahakaya Game
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_GAME });
    } else {
      console.log('🎉 Triggering Final Celebration');
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

            {/* 1. PAUSE BUTTON (New UI) */}
            <PauseButton 
              visible={sceneState.welcomeShown && !showSceneCompletion} 
              onClick={() => setShowPauseMenu(true)} 
            />

            {/* 2. PAUSE MENU (New UI) */}
            <PauseMenu 
              show={showPauseMenu}
              onResume={() => setShowPauseMenu(false)}
              onBackToMap={() => {
                setShowPauseMenu(false);
                onNavigate?.('zones');
              }}
              isSoundOn={isAudioOn}
              onSoundToggle={() => setIsAudioOn(!isAudioOn)}
            />

            {/* 3. OPENING MODAL (Modak Style) */}
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
              <div
                className="game-modal-overlay"
                style={{
                  '--modal-card-bg': '#FFF9E6',
                  '--modal-text-primary': '#5D2E0F'
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

                  <div className="game-modal-card">
                    <h1 className="game-modal-title">Help Ganesha Save the Forest!</h1>
                    <p className="game-modal-subtitle">
                      Two magical words have special powers to help the animals.
                    </p>

                    <div className="game-modal-icons">
                       <div className="game-modal-icon-item">
                          <img src={appVakratunda} alt="Flexibility" />
                          <span>Flexibility</span>
                       </div>
                       <div className="game-modal-icon-item">
                          <img src={appMahakaya} alt="Strength" />
                          <span>Strength</span>
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
                    >
                      Start Learning!
                    </VOGatedButton>
                  </div>
                </div>
              </div>
            )}

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
            />

            {/* PERSISTENT BOY CHARACTER */}
            {sceneState.welcomeShown && !showSceneCompletion && (
              <div className="vakratunda-companion-boy">
                <img src={boyNamaste} alt="Learning with you" className="vakratunda-boy-companion" />
              </div>
            )}

            {/* GANESHA CELEBRATION */}
            {showGaneshaCelebration && (
              <div className="vakratunda-ganesha-celebration-enter">
                <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-slides-in" />
              </div>
            )}

            {/* 4. UPDATED POWER OVERLAY */}
            {showPowerOverlay && currentWord && (
              <PowerUnlockOverlay
                title={`${powerConfig[currentWord].name} Unlocked!`}
                description={{
                  main: [
                    powerConfig[currentWord].affirmation,
                    powerConfig[currentWord].story
                  ],
                  emphasis: currentWord === 'vakratunda' 
                    ? "You are ready for the next challenge!" 
                    : "You have mastered both powers!"
                }}
                icon={powerConfig[currentWord].image}
                iconColor={powerConfig[currentWord].color}
                // ✅ BUTTON TEXT UPDATE
                buttonText={currentWord === 'vakratunda' ? "Discover Mahakaya" : "Celebrate!"}
                showButton={true}
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