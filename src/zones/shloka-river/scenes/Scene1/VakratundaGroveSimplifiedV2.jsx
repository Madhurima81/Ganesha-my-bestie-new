// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx
// Clean implementation following Pond scene pattern

import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGroveSimplified.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';

// Memory game component (reuse existing)
import SimplifiedMemoryGame from './components/SimplifiedMemoryGame';
import AppSidebar from '../../shared/AppSidebar';
import SanskritWordMission from '../../shared/SanskritWordMission';
//import AppPracticeModal from '../../shared/AppPracticeModal';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';

// Character images
import boyNamaste from './assets/images/boy-namaste.png';
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.png';
// Images
import riverBackground from './assets/images/elephant-grove-bg.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';

// Mission images
import vakratundaBefore from './assets/images/vakratunda-before.png';
import vakratundaAfter from './assets/images/vakratunda-after.png';
import mahakayaBefore from './assets/images/mahakaya-before.png'; 
import mahakayaAfter from './assets/images/mahakaya-after.png';

// Elephant images for memory game
import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantBabyKra from './assets/images/vakratunda/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/vakratunda/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/vakratunda/elephant-baby-da.png';
import elephantHa from './assets/images/mahakaya/elephant-ha.png';
import elephantKa from './assets/images/mahakaya/elephant-ka.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';
import elephantYa from './assets/images/mahakaya/elephant-ya.png';

// Singers & Rewards
import budVa from './assets/images/vakratunda/va-bud.png';
import budKra from './assets/images/vakratunda/kra-bud.png';
import budTun from './assets/images/vakratunda/tun-bud.png';
import budDa from './assets/images/vakratunda/da-bud.png';
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import lotusKra from './assets/images/vakratunda/kra-lotus.png';
import lotusTun from './assets/images/vakratunda/tun-lotus.png';
import lotusDa from './assets/images/vakratunda/da-lotus.png';
import seedImage from './assets/images/mahakaya/seed.png';
import flowerMa from './assets/images/mahakaya/ma-flower.png';
import flowerHa from './assets/images/mahakaya/ha-flower.png';
import flowerKa from './assets/images/mahakaya/ka-flower.png';
import flowerYa from './assets/images/mahakaya/ya-flower.png';

const PHASES = {
  INITIAL: 'initial',
  VAKRATUNDA_GAME: 'vakratunda_game',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  VAKRATUNDA_POWER: 'vakratunda_power',
  MAHAKAYA_STORY: 'mahakaya_story',
  MAHAKAYA_GAME: 'mahakaya_game',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  MAHAKAYA_POWER: 'mahakaya_power',
  COMPLETE: 'complete'
};

const powerConfig = {
  vakratunda: { 
    name: 'Flexibility Power', 
    image: appVakratunda,
    color: '#4ECDC4' 
  },
  mahakaya: { 
    name: 'Inner Strength', 
    image: appMahakaya,
    color: '#FF6B35' 
  }
};

const missionImages = {
  vakratunda: { before: vakratundaBefore, after: vakratundaAfter },
  mahakaya: { before: mahakayaBefore, after: mahakayaAfter }
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
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary:", error, errorInfo);
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
          learnedSyllables: {
            va: false, kra: false, tun: false, da: false,
            ma: false, ha: false, ka: false, ya: false
          },
          unlockedApps: {},
          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: { percentage: 0, starsEarned: 0, completed: false }
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

  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();
  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCenteredWord, setShowCenteredWord] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);

  const [isAudioOn, setIsAudioOn] = useState(true);
const [showGaneshaCelebration, setShowGaneshaCelebration] = useState(false);

  const [showInitialHeader, setShowInitialHeader] = useState(true);
const [headerMessage, setHeaderMessage] = useState('');

const [showFinalGanesha, setShowFinalGanesha] = useState(false);


const [practiceWord, setPracticeWord] = useState(null);
const [showRecorder, setShowRecorder] = useState(false);
const [savedRecordings, setSavedRecordings] = useState({}); // { vakratunda: [...], mahakaya: [...] }

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
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

  // Expose audio functions globally for SanskritWordMission
useEffect(() => {
  window.playSanskritAudio = playSyllable;
  window.playSanskritWord = playWord;
  
  return () => {
    delete window.playSanskritAudio;
    delete window.playSanskritWord;
  };
}, [isAudioOn]); // Re-attach if audio setting changes

// Safety: Show completion screen if scene is marked complete but modal not showing
useEffect(() => {
  if (sceneState.phase === PHASES.COMPLETE && 
      sceneState.completed && 
      !showSceneCompletion && 
      !showSparkle) {
    const timer = safeSetTimeout(() => {
      setShowFinalGanesha(false);
      setShowSceneCompletion(true);
    }, 7000); // 7 seconds max wait
    
    return () => clearTimeout(timer);
  }
}, [sceneState.phase, sceneState.completed, showSceneCompletion, showSparkle]);

  // Audio functions
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

  // Handle saving a new recording
const handleSaveRecording = (recordingData) => {
  setSavedRecordings(prev => {
    const wordRecordings = prev[recordingData.word] || [];
    return {
      ...prev,
      [recordingData.word]: [...wordRecordings, recordingData]
    };
  });
};



  const playSyllable = (syllable) => {
    const map = {
      'va': 'vakratunda-va', 'kra': 'vakratunda-kra',
      'tun': 'vakratunda-tun', 'da': 'vakratunda-da',
      'ma': 'mahakaya-ma', 'ha': 'mahakaya-ha',
      'ka': 'mahakaya-ka', 'ya': 'mahakaya-ya'
    };
    playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
  };

  const playWord = (word) => {
    playAudio(`/audio/words/${word}.mp3`);
  };

  // Memory game completion
  const handlePhaseComplete = (word) => {
    console.log(`${word} learned!`);
    
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      learnedSyllables: {
        ...sceneState.learnedSyllables,
        ...(word === 'vakratunda' 
          ? { va: true, kra: true, tun: true, da: true }
          : { ma: true, ha: true, ka: true, ya: true })
      },
      phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_COMPLETE : PHASES.MAHAKAYA_COMPLETE
    });

    // Show 5-second celebration
    setShowCenteredWord(word);
    setShowSparkle(`${word}-celebration`);

      playWord(word);
    
safeSetTimeout(() => {
  setShowCenteredWord(null);
  setShowSparkle(`${word}-to-sidebar`);
  
  // Unlock app in sidebar
  sceneActions.updateState({
    unlockedApps: { ...sceneState.unlockedApps, [word]: true }
  });
  
  safeSetTimeout(() => {
    setShowSparkle(null);
    
    // Show sparkles before Ganesha appears
    setShowSparkle('ganesha-incoming');
    
 safeSetTimeout(() => {
    // Show Ganesha AS sparkles continue
    setShowGaneshaCelebration(word);
    
    safeSetTimeout(() => {
      setShowSparkle(null); // Sparkles fade out
    }, 500);
      
      safeSetTimeout(() => {
        setShowGaneshaCelebration(false);
        setCurrentWord(word);
        setShowPowerModal(true);
        sceneActions.updateState({
          phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER
        });
      }, 4000); // 4 seconds Ganesha celebrates with boy
    }, 800); // 1 second sparkles
  }, 2000);
}, 5000);
  };

  // Power modal handlers
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setShowMission(true);

  };

const handleContinueLearning = () => {
  setShowPowerModal(false);
  
  if (currentWord === 'vakratunda') {
    // Show Mahakaya story
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_STORY });
    }, 500);
  } else {
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true }
    });
    
    // Show Ganesha AND fireworks together
    setShowFinalGanesha(true);
    setShowSparkle('final-fireworks');
  }
};

const handleMissionComplete = () => {
  console.log('âœ… Mission complete for:', currentWord);
  setShowMission(false);
  
  if (currentWord === 'vakratunda') {
    safeSetTimeout(() => {
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_STORY });
    }, 500);
  } else {
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true
    });
    safeSetTimeout(() => setShowSparkle('final-fireworks'), 500);
  }
};

  // Image helpers
  const getBabyElephantImage = (i) => [elephantBabyVa, elephantBabyKra, elephantBabyTun, elephantBabyDa][i];
  const getAdultElephantImage = (i) => [elephantMa, elephantHa, elephantKa, elephantYa][i];
  const getBudImage = (i) => [budVa, budKra, budTun, budDa][i];
  const getLotusImage = (i) => [lotusVa, lotusKra, lotusTun, lotusDa][i];
  const getSeedImage = () => seedImage;
  const getFlowerImage = (i) => [flowerMa, flowerHa, flowerKa, flowerYa][i];

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-simplified-container">
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>

{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
  <div className="mission-modal-overlay">
    <div className="mission-modal">
      <div className="modal-character">
        <img src={ganeshaHeadphones} alt="Ganesha" className="character-img" />
        <div className="character-speech-bubble">
          Let's save the forest! ðŸŒ³
        </div>
      </div>
      
      <h2 className="mission-title">Help Ganesha Save the Forest!</h2>
      <div className="mission-subtitle">2 magical words have special powers!</div>
      <p className="mission-description">
        First, learn to chant <strong>VAKRATUNDA</strong> to unlock flexibility power and rescue trapped animals!
      </p>
      <button 
        className="mission-start-btn"
        onClick={() => {
          sceneActions.updateState({ 
            welcomeShown: true,
            phase: PHASES.VAKRATUNDA_GAME
          });
        }}
      >
        Start Learning!
      </button>
    </div>
  </div>
)}


            {/* MEMORY GAME */}
            <SimplifiedMemoryGame
              isActive={sceneState.phase === PHASES.VAKRATUNDA_GAME || sceneState.phase === PHASES.MAHAKAYA_GAME}
              hideElements={showCenteredWord || showPowerModal || showMission || sceneState.phase === PHASES.MAHAKAYA_STORY}
              onPhaseComplete={handlePhaseComplete}
              onGameComplete={() => {}}
              profileName={profileName}
              getBabyElephantImage={getBabyElephantImage}
              getAdultElephantImage={getAdultElephantImage}
              getBudImage={getBudImage}
              getLotusImage={getLotusImage}
              getSeedImage={getSeedImage}
              getFlowerImage={getFlowerImage}
              isAudioOn={isAudioOn}
              playAudio={playAudio}
              powerGained={sceneState.learnedWords?.vakratunda}
            />

{/* PERSISTENT BOY CHARACTER - Always visible once game starts */}
{sceneState.welcomeShown && 
 !showSceneCompletion && (
  <div className="companion-boy">
    <img src={boyNamaste} alt="Learning with you" className="boy-companion" />
  </div>
)}

{/* STATIC LEARNING HEADER 
{sceneState.phase === PHASES.VAKRATUNDA_GAME && !showCenteredWord && !showPowerModal && !showMission && (
  <div className="game-phase-header">
    ðŸŽµ Let's Learn to Chant VAKRATUNDA!
  </div>
)}

{sceneState.phase === PHASES.MAHAKAYA_GAME && !showCenteredWord && !showPowerModal && !showMission && (
  <div className="game-phase-header">
    ðŸŽµ Let's Learn to Chant MAHAKAYA!
  </div>
)}*/}

       {sceneState.phase === PHASES.MAHAKAYA_STORY && (
  <div className="mission-modal-overlay">
    <div className="mission-modal">
      <div className="modal-character">
        <img src={ganeshaHeadphones} alt="Ganesha" className="character-img" />
        <div className="character-speech-bubble">
          One more to learn! ðŸ’ª
        </div>
      </div>
      
      <h2 className="mission-title">Great Work!</h2>
      <div className="mission-subtitle">Now unlock the second power!</div>
      <p className="mission-description">
        Learn to chant <strong>MAHAKAYA</strong> to unlock inner strength and save more animals!
      </p>
      <button
        className="story-continue-btn"
        onClick={() => {
          sceneActions.updateState({ phase: PHASES.MAHAKAYA_GAME });
          safeSetTimeout(() => {
            if (window.simplifiedMemoryGame?.startMahakayaPhase) {
              window.simplifiedMemoryGame.startMahakayaPhase();
            }
          }, 200);
        }}
      >
        Start Learning!
      </button>
    </div>
  </div>
)}

            {/* 5-SECOND WORD CELEBRATION */}
            {showCenteredWord && (
              <>
                <div className="celebration-overlay" />
                <div className="centered-word-celebration">
                  <img 
                    src={powerConfig[showCenteredWord]?.image}
                    alt={showCenteredWord}
                    className="celebration-app-icon"
                  />
                  <div className="celebration-word-text">
                    {showCenteredWord.toUpperCase()}
                  </div>
                  <div className="celebration-sparkles">
                    <SparkleAnimation
                      type="glitter"
                      count={30}
                      color={powerConfig[showCenteredWord]?.color}
                      size={12}
                      duration={5000}
                      fadeOut={true}
                      area="full"
                    />
                  </div>
                </div>
              </>
            )}

{/* SPARKLES BEFORE GANESHA APPEARS */}
{showSparkle === 'ganesha-incoming' && (
  <div className="ganesha-sparkle-position">
    <SparkleAnimation
      type="burst"
      count={20}
      color="#FFD700"
      size={15}
      duration={1500}
      fadeOut={true}
    />
  </div>
)}

{/* GANESHA CELEBRATION - Fades in next to persistent boy */}
{showGaneshaCelebration && (
  <div className="ganesha-celebration-enter">
    <img src={ganeshaHeadphones} alt="Ganesha" className="ganesha-slides-in" />
    <div className="ganesha-celebration-bubble">
      {showGaneshaCelebration === 'vakratunda' ? 'Great job! ðŸŽ‰' : 'Amazing! â­'}
    </div>
  </div>
)}
          {/* POWER MODAL - POND STYLE */}
{showPowerModal && (
  <div className="power-modal-overlay">
    <div className="power-modal">
      <h2 className="power-modal-title">
        {powerConfig[currentWord]?.name} Unlocked!
      </h2>
      
      <div className="power-modal-content">
        <div className="power-modal-left">
          <p className="power-modal-text">
            You can now use this power to help animals in need!
          </p>
          <p className="power-modal-subtext">Choose your next action:</p>
        </div>
        
        <div className="power-modal-right">
          <img 
            src={powerConfig[currentWord]?.image}
            alt={currentWord}
            className="power-modal-icon"
          />
          
          <button className="power-modal-btn save-btn" onClick={handleSaveAnimal}>
            ðŸ¾ Save an Animal
          </button>
          
          <button className="power-modal-btn continue-btn" onClick={handleContinueLearning}>
            {currentWord === 'vakratunda' ? 'ðŸŽµ Discover Mahakaya' : 'âœ¨ End Scene'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* SAVE ANIMAL MISSION - REUSABLE COMPONENT */}
<SanskritWordMission
  show={showMission}
  word={currentWord}
  beforeImage={missionImages[currentWord]?.before}
  afterImage={missionImages[currentWord]?.after}
  powerConfig={powerConfig[currentWord]}
  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowMission(false);
    setShowPowerModal(true);
  }}
/>

<AppSidebar 
  unlockedApps={sceneState.unlockedApps || {}}
  onAppClick={(app) => {
    setPracticeWord(app.id);
    setShowRecorder(true); // Direct to recorder
  }}
  isReload={isReload}
  onSaveAppState={(appState) => {
    sceneActions.updateState({ unlockedApps: appState });
  }}
/>


<SanskritVoiceRecorder
  chantResult={null}
  show={showRecorder}
  word={practiceWord || ''}
  savedRecordings={savedRecordings}
  onSaveRecording={handleSaveRecording}
  onComplete={() => {
    setShowRecorder(false);
    setPracticeWord(null);
  }}
  onSkip={() => {
    setShowRecorder(false);
    setPracticeWord(null);
  }}
  title={practiceWord ? powerConfig[practiceWord]?.name : 'Practice Chanting'}
  appIcon={powerConfig[practiceWord]?.image} // ADD THIS
  appColor={powerConfig[practiceWord]?.color} // ADD THIS
  allowSkip={true}
/>

{showSparkle === 'final-fireworks' && (
  <Fireworks
    show={true}
    duration={6000}
    count={20}
    colors={['#FFD700', '#FF8C00', '#FFA500']}
    onComplete={() => {
      setShowSparkle(null);
      setShowFinalGanesha(false);
      
      // Save and show completion immediately
      const profileId = localStorage.getItem('activeProfileId');
      if (profileId) {
        try {
          GameStateManager.saveGameState(zoneId, sceneId, {
            completed: true,
            stars: 5,
            learnedWords: sceneState.learnedWords || {},
            learnedSyllables: sceneState.learnedSyllables || {},
            unlockedApps: sceneState.unlockedApps || {},
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

            {/* TEMPORARY TEST - Remove after debugging 
<button 
  onClick={() => {
    console.log('Forcing modal show');
    sceneActions.updateState({ phase: PHASES.INITIAL, welcomeShown: false });
  }}
  style={{
    position: 'fixed',
    top: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 99999,
    background: 'red',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }}
>
  FORCE SHOW MODAL
</button>

{/* FINAL CELEBRATION - Ganesha appears BEFORE completion screen */}
{showFinalGanesha && !showSceneCompletion && (
  <div className="final-ganesha-appears">
    <img src={ganeshaHeadphones} alt="Ganesha" className="ganesha-final-enters" />
    <div className="ganesha-final-bubble">
      You're a hero! ðŸŒŸ
    </div>
  </div>
)}
            {/* SCENE COMPLETION */}
            {showSceneCompletion && (
              <SceneCompletionCelebration
                show={true}
                sceneName="Vakratunda Grove"
                sceneNumber={1}
                totalScenes={5}
                starsEarned={5}
                totalStars={5}
                discoveredSymbols={['vakratunda', 'mahakaya']}
                nextSceneName="Suryakoti Bank"
                sceneId={sceneId}
                completionData={{
                  stars: 5,
                  words: sceneState.learnedWords,
                  completed: true
                }}
                onComplete={onComplete}
                onReplay={() => {
                  setShowSceneCompletion(false);
                  resetScene();
                }}
                onContinue={() => {
                  if (clearManualCloseTracking) clearManualCloseTracking();
                  if (hideCoach) hideCoach();
                  setTimeout(() => onNavigate?.('scene-complete-continue'), 100);
                }}
              />
            )}

            {/* NAVIGATION */}
            <TocaBocaNav
              onHome={() => {
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onZonesClick={() => {
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              onStartFresh={() => resetScene()}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.completed ? 1 : 0,
                total: 1
              }}
            />

            <BackToMapButton 
              onNavigate={onNavigate}
              hideCoach={hideCoach}
              clearManualCloseTracking={clearManualCloseTracking}
            />

            <ProgressiveHintSystem
              ref={progressiveHintRef}
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
