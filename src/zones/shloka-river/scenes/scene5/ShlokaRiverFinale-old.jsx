// zones/shloka-river/scenes/Scene5/ShlokaRiverFinale.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ShlokaRiverFinale.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from "../../../../lib/services/ProgressManager";
import SimpleSceneManager from "../../../../lib/services/SimpleSceneManager";
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
//import ZoneCompletionCelebration from '../../../../lib/components/celebration/ZoneCompletionCelebration';
import SimpleZoneCompletionCelebration from '../../../../lib/components/celebration/SimpleZoneCompletionCelebration';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';


// Scene assets
import bgImage from './assets/images/bg.png';
import raftImage from './assets/images/raft.png';

// Animal assets
import vakratundaElephant from './assets/images/Vakratunda-elephant.png';
import mahakayaElephant from './assets/images/mahakaya-elephant.png';
import samaprabhaKitten from './assets/images/samaprabha-kitten.png';
import suryakotiFairy from './assets/images/suryakoti-fairy.png';
import nirvighnamSnail from './assets/images/nirvighnam-snail.png';
import kurumedevaPeacock from './assets/images/kurumedeva-peacock.png';
import sarvakaryeshuDuck from './assets/images/sarvakaryeshu-duck.png';
import sarvadaFawn from './assets/images/sarvada-fawn.png';

// Add these imports at the top with your other images:
import ganeshaWithHeadphones from '../assets/images/ganesha_with_headphones.png';
//import smartwatchBase from '../assets/images/smartwatch-base.png';
import smartwatchScreen from '../assets/images/smartwatch-screen.png';
// With all 8 apps:
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';
import appSuryakoti from '../assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../assets/images/apps/app-samaprabha.png';
import appNirvighnam from '../assets/images/apps/app-nirvighnam.png';
import appKurumedeva from '../assets/images/apps/app-kurumedeva.png';
import appSarvakaryeshu from '../assets/images/apps/app-sarvakaryeshu.png';
import appSarvada from '../assets/images/apps/app-sarvada.png';

const PHASES = {
  INITIAL: 'initial',
  BOARDING_FIRST_GROUP: 'boarding_first_group',
  MID_CELEBRATION: 'mid_celebration', 
  BOARDING_SECOND_GROUP: 'boarding_second_group',
  FINAL_CELEBRATION: 'final_celebration',
  ZONE_COMPLETE: 'zone_complete'
};

// Animal configuration with their learning order
const ANIMALS = [
  { id: 'vakratunda', name: 'Vakratunda Elephant', image: vakratundaElephant, audio: '/audio/words/vakratunda.mp3', group: 1, position: 1 },
  { id: 'mahakaya', name: 'Mahakaya Elephant', image: mahakayaElephant, audio: '/audio/words/mahakaya.mp3', group: 1, position: 2 },
    { id: 'suryakoti', name: 'Suryakoti Fairy', image: suryakotiFairy, audio: '/audio/words/suryakoti.mp3', group: 1, position: 3 },
  { id: 'samaprabha', name: 'Samaprabha Kitten', image: samaprabhaKitten, audio: '/audio/words/samaprabha.mp3', group: 1, position: 4 },
  { id: 'nirvighnam', name: 'Nirvighnam Snail', image: nirvighnamSnail, audio: '/audio/words/nirvighnam.mp3', group: 2, position: 5 },
  { id: 'kurumedeva', name: 'Kurumedeva Peacock', image: kurumedevaPeacock, audio: '/audio/words/kurumedeva.mp3', group: 2, position: 6 },
  { id: 'sarvakaryeshu', name: 'Sarvakaryeshu Duck', image: sarvakaryeshuDuck, audio: '/audio/words/sarvakaryeshu.mp3', group: 2, position: 7 },
  { id: 'sarvada', name: 'Sarvada Fawn', image: sarvadaFawn, audio: '/audio/words/sarvada.mp3', group: 2, position: 8 }
];

const ANIMAL_PHRASES = {
  vakratunda: "वक्रतुण्ड!",
  mahakaya: "महाकाय!", 
  samaprabha: "समप्रभा!",
  suryakoti: "सूर्यकोटि!",
  nirvighnam: "निर्विघ्नम्!",
  kurumedeva: "कुरुमेदेव!",
  sarvakaryeshu: "सर्वकार्येषु!",
  sarvada: "सर्वदा!"
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in ShlokaRiverFinale:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the river finale.</h2>
          <button onClick={() => window.location.reload()}>Restart Scene</button>
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
  sceneId = 'shloka-river-finale'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: PHASES.INITIAL,
          animalsOnRaft: [],
          availableAnimals: [...ANIMALS],
          currentGroup: 1,
          showMidCelebration: false,
          showFinalCelebration: false,
          showZoneCompletion: false,
          completed: false,
          welcomeShown: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <ShlokaRiverFinaleContent
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

const ShlokaRiverFinaleContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  const { hideCoach, clearManualCloseTracking } = useGameCoach();
  const [showSparkles, setShowSparkles] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const timeoutsRef = useRef([]);
  const [showRiverCompletion, setShowRiverCompletion] = useState(false);

     const [forceMemoryGameReset, setForceMemoryGameReset] = useState(false); // ADD THIS LINE
  const [rescuePhase, setRescuePhase] = useState('problem');

const [wrongClickFeedback, setWrongClickFeedback] = useState(null);
const [correctClickSparkles, setCorrectClickSparkles] = useState(null);
const [speechBubble, setSpeechBubble] = useState(null);
const [waterRipples, setWaterRipples] = useState([]);
const [twinkleStars] = useState(() => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 40,
    delay: Math.random() * 3
  }));
});

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Audio playback function
  const playAudio = async (audioPath) => {
    if (!isAudioOn) return Promise.resolve();
    
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      return audio.play().catch(e => {
        console.log(`Audio not found: ${audioPath}`);
        return Promise.resolve();
      });
    } catch (error) {
      console.log(`Audio error: ${error.message}`);
      return Promise.resolve();
    }
  };

  // Add this reusable resetScene function inside your ShlokaRiverFinaleContent component
const resetScene = (showConfirm = true) => {
  if (showConfirm && !confirm('Start this scene from the beginning? You will lose current progress.')) {
    return;
  }

  console.log('🔥 Shloka River Finale reset: User chose to start fresh');
  
  // STEP 1: Clear all timeouts first to prevent conflicts
  timeoutsRef.current.forEach(id => clearTimeout(id));
  timeoutsRef.current = [];
  
  // STEP 2: Clear ALL local React state variables immediately
  setShowSparkles(false);
  setShowFireworks(false);
  setShowRiverCompletion(false);
  
  // Clear game interaction states
  setWrongClickFeedback(null);
  setCorrectClickSparkles(null);
  setSpeechBubble(null);
  setWaterRipples([]);
  
  // STEP 3: Hide GameCoach immediately
  if (hideCoach) hideCoach();
  if (clearManualCloseTracking) clearManualCloseTracking();
  
  // STEP 4: Reset scene state to initial conditions
  setTimeout(() => {
    sceneActions.updateState({
      // Reset to initial phase
      phase: PHASES.INITIAL,
      
      // Reset animal positions - all back to riverbank
      animalsOnRaft: [],
      availableAnimals: [...ANIMALS], // All 8 animals back on riverbank
      
      // Reset group progression
      currentGroup: 1,
      
      // Clear celebration states
      showMidCelebration: false,
      showFinalCelebration: false,
      showZoneCompletion: false,
      
      // Reset completion status
      completed: false,
      welcomeShown: false
    });
    
    console.log('✅ Shloka River Finale scene state reset complete');
  }, 100);
};

  const addWaterRipple = () => {
  const newRipple = {
    id: Date.now(),
    x: Math.random() * 60 + 20,
    y: Math.random() * 20 + 60
  };
  
  setWaterRipples(prev => [...prev, newRipple]);
  
  safeSetTimeout(() => {
    setWaterRipples(prev => prev.filter(r => r.id !== newRipple.id));
  }, 2000);
};

const handleAnimalClick = async (animal) => {
  if (sceneState.animalsOnRaft.find(a => a.id === animal.id)) {
    return;
  }

  const expectedPosition = sceneState.animalsOnRaft.length + 1;
  
  if (animal.position !== expectedPosition) {
    setWrongClickFeedback(animal.id);
    safeSetTimeout(() => setWrongClickFeedback(null), 1500);
    return;
  }

  // Show speech bubble
  setSpeechBubble({
    animalId: animal.id,
    text: ANIMAL_PHRASES[animal.id] || animal.name,
    position: animal.position
  });

  safeSetTimeout(() => setSpeechBubble(null), 2000);

  // Show success sparkles
  setCorrectClickSparkles(animal.id);
  safeSetTimeout(() => setCorrectClickSparkles(null), 1000);

  // Add water ripple
  addWaterRipple();

  // Play the animal's chant
  await playAudio(animal.audio);
  
  // Rest of your existing code...
  const newAnimalsOnRaft = [...sceneState.animalsOnRaft, animal];
  const newAvailableAnimals = sceneState.availableAnimals.filter(a => a.id !== animal.id);
  
  sceneActions.updateState({
    animalsOnRaft: newAnimalsOnRaft,
    availableAnimals: newAvailableAnimals
  });

  // Your existing celebration logic...
  const group1Complete = newAnimalsOnRaft.filter(a => a.group === 1).length === 4;
  const group2Complete = newAnimalsOnRaft.filter(a => a.group === 2).length === 4;
  const allComplete = newAnimalsOnRaft.length === 8;

  if (group1Complete && sceneState.currentGroup === 1 && !allComplete) {
    safeSetTimeout(() => {
      setShowSparkles(true);
      sceneActions.updateState({ 
        phase: PHASES.MID_CELEBRATION,
        currentGroup: 2,
        showMidCelebration: true 
      });
      
      safeSetTimeout(() => {
        setShowSparkles(false);
        sceneActions.updateState({ 
          phase: PHASES.BOARDING_SECOND_GROUP,
          showMidCelebration: false 
        });
      }, 3000);
    }, 1000);
    
  } else if (allComplete) {
    safeSetTimeout(() => {
      sceneActions.updateState({ 
        phase: PHASES.FINAL_CELEBRATION,
        showFinalCelebration: true 
      });
      
      safeSetTimeout(() => {
        setShowFireworks(true);
      }, 2000);
    }, 1000);
  }
};


// Add this function in your ShlokaRiverFinaleContent component
const handleRestart = () => {
  // Clear local storage

  
  // Reset scene to beginning
  sceneActions.updateState({
    phase: PHASES.INITIAL,
    animalsOnRaft: [],
    availableAnimals: [...ANIMALS],
    currentGroup: 1,
    showMidCelebration: false,
    showFinalCelebration: false,
    showZoneCompletion: false,
    completed: false,
    welcomeShown: false
  });
  
  // Reset component state
  setShowSparkles(false);
  setShowFireworks(false);
  setWrongClickFeedback(null);
  setCorrectClickSparkles(null);
};

const handleFireworksComplete = () => {
  setShowFireworks(false);
  
  try {
    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      // Save game state
      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true,
        stars: 8,
        timestamp: Date.now(),
        phase: 'complete',
        animalsOnRaft: sceneState.animalsOnRaft || [],
        availableAnimals: sceneState.availableAnimals || []
      });
      
      // Update progress manager
      ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
        completed: true,
        stars: 8
      });
      
      // 🎯 ADD THIS LINE - Clear temp session storage
      localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
      
      // 🎯 ADD THIS LINE - Clear current scene (marks as complete)
      SimpleSceneManager.clearCurrentScene();
    }
  } catch (error) {
    console.error('Error saving game state:', error);
  }
  
  // Continue with scene completion
  sceneActions.updateState({
    phase: PHASES.ZONE_COMPLETE,
    completed: true,
    showZoneCompletion: true
  });
  
  // Show the SceneCompletionCelebration modal
  setShowRiverCompletion(true);
};
  // Initialize welcome message
  /*useEffect(() => {
    if (sceneState?.phase === PHASES.INITIAL && !sceneState?.welcomeShown) {
      safeSetTimeout(() => {
        sceneActions.updateState({ 
          welcomeShown: true,
          phase: PHASES.BOARDING_FIRST_GROUP 
        });
      }, 1000);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);*/

  if (!sceneState) {
    return <div className="loading">Loading finale...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="shloka-river-finale">
          
          {/* Background */}
          <div 
            className="finale-background"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            
            {/* Raft with Ganga */}
            <div className="raft-container">
              <img src={raftImage} alt="Ganga's Raft" className="raft-image" />
              
 {/* Animals on raft */}
{sceneState.animalsOnRaft.map((animal, index) => {
  // Find the matching riverbank animal size
  const riverbankAnimal = document.querySelector(`.animal-${animal.id}`);
  const animalSize = riverbankAnimal ? {
    width: getComputedStyle(riverbankAnimal).width,
    height: getComputedStyle(riverbankAnimal).height
  } : { width: '60px', height: '60px' }; // fallback
  
  return (
    <div
      key={animal.id}
      className={`animal-on-raft position-${animal.position}`}
      style={{
        animationDelay: `${index * 0.2}s`,
        width: animalSize.width,   // Same as riverbank
        height: animalSize.height  // Same as riverbank
      }}
    >
      <img 
        src={animal.image} 
        alt={animal.name}
        className="raft-animal-image"
      />
    </div>
  );
})}
            </div>

{sceneState.availableAnimals.map((animal, index) => {
  const currentStep = sceneState.animalsOnRaft.length + 1;
  const isNextAnimal = animal.position === currentStep;
  const isWrongClick = wrongClickFeedback === animal.id;
  const hasSparkles = correctClickSparkles === animal.id;
  
  return (
    <div
      key={animal.id}
      className={`riverbank-animal animal-${animal.id}`}
      onClick={() => handleAnimalClick(animal)}
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      <img 
        src={animal.image} 
        alt={animal.name}
        className="riverbank-animal-image"
      />
      
      {isNextAnimal && (
        <div className="golden-ring-indicator"></div>
      )}
      
      <div className="animal-glow"></div>
      
      {isWrongClick && (
        <div className="wrong-click-feedback">
          Follow the golden glow!
        </div>
      )}
      
      {hasSparkles && (
        <div className="correct-click-sparkles">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="sparkle"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                '--angle': `${i * 60}deg`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
    </div>
  );
})}

{/* Gentle background stars */}
{twinkleStars.map(star => (
  <div
    key={star.id}
    style={{
      position: 'absolute',
      left: `${star.left}%`,
      top: `${star.top}%`,
      fontSize: '12px',
      animation: `twinkle 3s ease-in-out infinite`,
      animationDelay: `${star.delay}s`,
      zIndex: 1
    }}
  >
    ✨
  </div>
))}

{/* Speech Bubble */}
{speechBubble && (
  <div className="speech-bubble">
    {speechBubble.text}
    <div style={{
      position: 'absolute',
      bottom: '-8px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderTop: '10px solid #FFD700'
    }} />
  </div>
)}

{/* Water ripples */}
{waterRipples.map(ripple => (
  <div
    key={ripple.id}
    className="water-ripple"
    style={{
      left: `${ripple.x}%`,
      top: `${ripple.y}%`
    }}
  />
))}


            {/* Welcome Message 
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
              <div className="welcome-message">
                <div className="welcome-content">
                  <h2>Sacred River Journey Complete!</h2>
                  <p>Help all your animal friends board Ganga's raft</p>
                  <p>Click any animal to hear their sacred chant</p>
                </div>
              </div>
            )}*/}

            {/* ==================== SCENE 5 INTRO: RIVER CELEBRATION ==================== */}
{sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
  <div className="river-finale-overlay">
    {/* Gentle Water Ripple Animation */}
    <div className="ripple-bg"></div>
    <div className="ripple-bg"></div>
    <div className="ripple-bg"></div>

    <div className="river-finale-card">
      <h1 className="river-finale-title">The Sacred River Celebration</h1>
      
      <div className="river-story-text">
        <p>The river is calm.</p>
        <p>The raft is ready.</p>
        <p>Now it’s time to journey together.</p>
        <br />
        <p>Each friend will step onto the raft,</p>
        <p>chanting their sound—</p>
        <p>one by one, as one whole shloka.</p>
      </div>

      <div className="river-instruction-text">
        Tap the animals to help them board the raft.
      </div>

      <button
        className="river-finale-btn"
        onClick={() => {
          // Triggers the scene start
          sceneActions.updateState({ 
            welcomeShown: true,
            phase: PHASES.BOARDING_FIRST_GROUP 
          });
        }}
      >
        🪵 Let’s Begin the Journey
      </button>
    </div>
  </div>
)}

            {/* Mid-celebration message */}
            {sceneState.showMidCelebration && (
              <div className="mid-celebration">
                <div className="celebration-content">
                  <h3>Wonderful Progress!</h3>
                  <p>Four sacred friends are aboard. Continue the journey!</p>
                </div>
              </div>
            )}

            {/* Final celebration message */}
            {sceneState.showFinalCelebration && !showFireworks && (
              <div className="final-celebration">
                <div className="celebration-content">
                  <h2>All Sacred Friends United!</h2>
                  <p>The divine raft carries all the wisdom of your journey!</p>
                </div>
              </div>
            )}

            {/* Progress counter */}
            <div className="progress-counter">
              <div className="counter-content">
                <span className="counter-icon">🚤</span>
                <span className="counter-text">
                  {sceneState.animalsOnRaft.length}/8 Friends Aboard
                </span>
              </div>
            </div>

            {/* Sparkle effects */}
            {showSparkles && (
              <SparkleAnimation
                type="celebration"
                count={30}
                color="#DAA520"
                size={20}
                duration={3000}
                area="full"
              />
            )}

            {/* Fireworks */}
     {/* RotatingOrbsEffect with App Icons */}
{showFireworks && (
  <RotatingOrbsEffect
    show={true}
    duration={9000}
    symbolImages={{
      vakratunda: appVakratunda,
      mahakaya: appMahakaya,
      samaprabha: appSamaprabha,
      suryakoti: appSuryakoti,
      nirvighnam: appNirvighnam,
      kurumedeva: appKurumedeva,
      sarvakaryeshu: appSarvakaryeshu,
      sarvada: appSarvada
    }}
    ganeshaImage={ganeshaWithHeadphones}
    playerName={profileName}
    onComplete={handleFireworksComplete}
  />
)}

{/* Simple Zone Completion 
<SimpleZoneCompletionCelebration
  show={sceneState.showZoneCompletion}
  zoneId="shloka-river"
  playerName={profileName}
  starsEarned={8}
  totalStars={8}
  
  // Show ALL 8 apps from 4 scenes
  collectedApps={[
    {
      id: 'vakratunda',
      name: 'Vakratunda',
      image: appVakratunda,
      power: { name: 'Obstacle Remover', icon: '🐘' }
    },
    {
      id: 'mahakaya',
      name: 'Mahakaya', 
      image: appMahakaya,
      power: { name: 'Great Strength', icon: '💪' }
    },
    {
      id: 'samaprabha',
      name: 'Samaprabha',
      image: appSamaprabha,
      power: { name: 'Equal Light', icon: '🌟' }
    },
    {
      id: 'suryakoti',
      name: 'Suryakoti',
      image: appSuryakoti,
      power: { name: 'Solar Power', icon: '☀️' }
    },
    {
      id: 'nirvighnam',
      name: 'Nirvighnam',
      image: appNirvighnam,
      power: { name: 'Unobstructed', icon: '🛡️' }
    },
    {
      id: 'kurumedeva',
      name: 'Kurumedeva',
      image: appKurumedeva,
      power: { name: 'Divine Action', icon: '⚡' }
    },
    {
      id: 'sarvakaryeshu',
      name: 'Sarvakaryeshu',
      image: appSarvakaryeshu,
      power: { name: 'All Tasks', icon: '🎯' }
    },
    {
      id: 'sarvada',
      name: 'Sarvada',
      image: appSarvada,
      power: { name: 'Always', icon: '♾️' }
    }
  ]}
  
  // Pass the same Ganesha from your scenes  
  ganeshaImage={ganeshaWithHeadphones}
  smartwatchScreen={smartwatchScreen}
  // Remove smartwatchBase prop
  
  onComplete={() => {
    if (hideCoach) hideCoach();
    if (clearManualCloseTracking) clearManualCloseTracking();
    onComplete?.();
  }}
  onContinueExploring={() => {
    if (hideCoach) hideCoach();
    if (clearManualCloseTracking) clearManualCloseTracking();
    onNavigate?.('zones');
  }}
/>*/}

          <BackToMapButton onNavigate={onNavigate} hideCoach={hideCoach} clearManualCloseTracking={clearManualCloseTracking} />

<SceneCompletionCelebration
  show={showRiverCompletion}
  sceneName="Shloka River"
  sceneNumber={5}
  totalScenes={5}
  starsEarned={8}
  totalStars={8}
  discoveredSymbols={['vakratunda', 'mahakaya', 'samaprabha', 'suryakoti', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada']}
  
  // 🎯 ADD THESE LINES - Use smartwatch container
  containerType="smartwatch"
  containerScreenImage={smartwatchScreen}
  appImages={{
    vakratunda: appVakratunda,
    mahakaya: appMahakaya,
    samaprabha: appSamaprabha,
    suryakoti: appSuryakoti,
    nirvighnam: appNirvighnam,
    kurumedeva: appKurumedeva,
    sarvakaryeshu: appSarvakaryeshu,
    sarvada: appSarvada
  }}
  
  // Keep existing symbolImages for fallback
  symbolImages={{
    vakratunda: appVakratunda,
    mahakaya: appMahakaya,
    samaprabha: appSamaprabha,
    suryakoti: appSuryakoti,
    nirvighnam: appNirvighnam,
    kurumedeva: appKurumedeva,
    sarvakaryeshu: appSarvakaryeshu,
    sarvada: appSarvada
  }}
  
  sceneId="shloka-river-finale"
  completionData={{
    stars: 8,
    apps: { all: true },
    completed: true,
    totalStars: 8
  }}
  onComplete={onComplete}
  childName={profileName}
  isFinalScene={true}
  
  onExploreZones={() => {
    setShowRiverCompletion(false);
    onNavigate?.('zones');
  }}
  onHome={() => {
    setShowRiverCompletion(false);
    onNavigate?.('home');
  }}
onReplay={() => {
  console.log('🔀 INSTANT REPLAY: Garden Adventure restart');
  resetScene(false);  // No confirm dialog for replay
}}
     
/>

            {/* Navigation */}
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
                            onStartFresh={() => resetScene(true)}  // Add this if TocaBoca has reset option

              currentProgress={{
                stars: sceneState.animalsOnRaft.length,
                completed: sceneState.completed ? 1 : 0,
                total: 1
              }}
              isAudioOn={isAudioOn}
              onAudioToggle={() => setIsAudioOn(!isAudioOn)}
            />

            <button onClick={handleRestart} style={{
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: '#f44336',
  color: 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  zIndex: 200
}}>
  Restart
</button>

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default ShlokaRiverFinale;