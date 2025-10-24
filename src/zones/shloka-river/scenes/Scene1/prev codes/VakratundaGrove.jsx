// zones/shloka-river/scenes/Scene1/VakratundaGrove.jsx
import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGrove.css';

// Import scene management components
import SceneManager from "../../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../../lib/components/interactive/ProgressiveHintSystem';
import SceneCompletionCelebration from '../../../../../lib/components/celebration/SceneCompletionCelebration';


// Images - River scene assets
import riverBackground from './assets/images/elephant-grove-bg.png';
import lotusVa from './assets/images/lotus-va.png';
import lotusKra from './assets/images/lotus-kra.png';
import lotusTun from './assets/images/lotus-tun.png';
import lotusDa from './assets/images/lotus-da.png';
import stoneMa from './assets/images/stone-ma.png';
import stoneHa from './assets/images/stone-ha.png';
import stoneKa from './assets/images/stone-ka.png';
import stoneYa from './assets/images/stone-ya.png';
import elephantBabyVa from './assets/images/elephant-baby-va.png';
import elephantBabyKra from './assets/images/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/elephant-baby-da.png';
import elephantHa from './assets/images/elephant-ha.png';
import elephantKa from './assets/images/elephant-ka.png';
import elephantMa from './assets/images/elephant-ma.png';
import elephantYa from './assets/images/elephant-ya.png';
import ganeshaCoach from "./assets/images/ganesha-coach.png";

const PHASES = {
  INITIAL: 'initial',
  LEARNING_VAKRATUNDA: 'learning_vakratunda',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  LEARNING_MAHAKAYA: 'learning_mahakaya',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  SCENE_COMPLETE: 'scene_complete'
};

// Simple Error Boundary Component
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

const VakratundaGrove = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'vakratunda-grove'
}) => {
  console.log('VakratundaGrove props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Vakratunda section (4 lotus + 4 baby elephants)
          lotusStates: [0, 0, 0, 0], // Va, Kra, Tun, Da - 0: inactive, 1: activated, 2: completed
          babyElephantStates: [0, 0, 0, 0], // Corresponding baby elephants
          
          // Mahakaya section (4 stones + 4 adult elephants)  
          stoneStates: [0, 0, 0, 0], // Ma, Ha, Ka, Ya
          adultElephantStates: [0, 0, 0, 0], // Corresponding adult elephants
          
          // Learning progression
          vakratundaComplete: false,
          mahakayaComplete: false,
          currentSection: 'vakratunda', // 'vakratunda' | 'mahakaya' | 'complete'
          
          // Sanskrit learning progress
          learnedSyllables: {
            va: false, kra: false, tun: false, da: false,
            ma: false, ha: false, ka: false, ya: false
          },
          learnedWords: {
            vakratunda: false,
            mahakaya: false
          },
          
          // Two-step interaction tracking
          activeElement: null, // 'lotus-0', 'stone-2', etc.
          waitingForElephant: false,
          
          // Water drops and animations
          waterDrops: [],
          celebrationStars: 0,
          phase: PHASES.INITIAL,
          
          // Message flags
          welcomeShown: false,
          vakratundaWisdomShown: false,
          mahakayaWisdomShown: false,
          masteryShown: false,
          
          // Reload system
          currentPopup: null,
          showingCompletionScreen: false,
          
          // GameCoach state
          gameCoachState: null,
          isReloadingGameCoach: false,
          lastGameCoachTime: 0,
          
          // Progress tracking
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
  console.log('VakratundaGroveContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  
  // Timeouts ref for cleanup
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);

  // Water drop management
  const activeDropsRef = useRef(new Set());
  const MAX_WATER_DROPS = 20;

  // Random positioning data for all elements
  const elementPositions = {
    // Scene 1A: Vakratunda (random positions)
    lotuses: [
      { left: '15%', top: '25%' },  // Va
      { left: '35%', top: '45%' },  // Kra  
      { left: '25%', top: '65%' },  // Tun
      { left: '45%', top: '35%' }   // Da
    ],
    babyElephants: [
      { left: '60%', top: '30%' },  // Va
      { left: '75%', top: '50%' },  // Kra
      { left: '65%', top: '70%' },  // Tun
      { left: '80%', top: '25%' }   // Da
    ],
    
    // Scene 1B: Mahakaya (random positions)
    stones: [
      { left: '20%', top: '30%' },  // Ma
      { left: '30%', top: '50%' },  // Ha
      { left: '40%', top: '70%' },  // Ka
      { left: '15%', top: '55%' }   // Ya
    ],
    adultElephants: [
      { left: '65%', top: '35%' },  // Ma
      { left: '75%', top: '60%' },  // Ha
      { left: '70%', top: '25%' },  // Ka
      { left: '85%', top: '45%' }   // Ya
    ]
  };

  // Syllable labels
  const syllableLabels = {
    vakratunda: ['Va', 'Kra', 'Tun', 'Da'],
    mahakaya: ['Ma', 'Ha', 'Ka', 'Ya']
  };

  // Get profile name for messages
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Audio test function for Web Speech API
  const testAudio = () => {
    console.log('Testing Web Speech API...');
    playSyllableAudio('va');
  };

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      activeDropsRef.current.clear();
    };
  }, []);

  // Clean GameCoach on scene entry
  useEffect(() => {
    console.log('Cleaning GameCoach on scene entry');
    if (hideCoach) hideCoach();
    if (clearManualCloseTracking) clearManualCloseTracking();
  }, []);

  // Web Speech API for syllable pronunciation
  const playSyllableAudio = (syllable) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';
      
      console.log(`Playing syllable: ${syllable}`);
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  // Play complete word pronunciation
  const playCompleteWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.6;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // DISNEY-STYLE GAMECOACH MESSAGES
  const gameCoachStoryMessages = [
    {
      id: 'welcome',
      message: `Welcome to the sacred river, ${profileName}! Tap the lotus flowers and listen to the baby elephants!`,
      timing: 500,
      condition: () => sceneState?.phase === PHASES.INITIAL && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'vakratunda_wisdom',
      message: `Beautiful, ${profileName}! You learned "Vakratunda" - Ganesha's curved trunk brings flexibility!`,
      timing: 1000,
      condition: () => sceneState?.vakratundaComplete && !sceneState?.vakratundaWisdomShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'mahakaya_wisdom',
      message: `Amazing work, ${profileName}! "Mahakaya" means Ganesha's mighty form gives us strength!`,
      timing: 1000,
      condition: () => sceneState?.mahakayaComplete && !sceneState?.mahakayaWisdomShown && !sceneState?.isReloadingGameCoach
    }
  ];

  // Hint configurations
  const getHintConfigs = () => [
    {
      id: 'lotus-hint',
      message: 'Try tapping the lotus flowers on the left!',
      explicitMessage: 'Tap the lotus flowers, then tap the baby elephants!',
      position: { bottom: '60%', left: '25%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        const lotusStates = sceneState.lotusStates || [0, 0, 0, 0];
        return !lotusStates.every(state => state === 2) && sceneState.currentSection === 'vakratunda';
      }
    },
    {
      id: 'stone-hint',
      message: 'Now try the stones with the adult elephants!',
      explicitMessage: 'Tap the stones, then tap the adult elephants!',
      position: { bottom: '60%', right: '25%', transform: 'translateX(50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        const stoneStates = sceneState.stoneStates || [0, 0, 0, 0];
        return sceneState.currentSection === 'mahakaya' && !stoneStates.every(state => state === 2);
      }
    }
  ];

  // Water Drop Creation
  const createWaterDrop = (elephantIndex, section, sprayPower = 1.0) => {
    if (!sceneActions || !sceneState) return;
    
    if (activeDropsRef.current.size >= MAX_WATER_DROPS) return;
    
    const id = Date.now() + Math.random();
    activeDropsRef.current.add(id);
    
    const size = Math.floor(Math.random() * 4) + 2;
    const speedFactor = Math.random() * 0.4 + 0.8;
    
    // Calculate positions based on elephant location
    const isAdult = section === 'mahakaya';
    const baseRight = isAdult ? 75 : 25; // Adult elephants on right, babies on left
    const baseBottom = 45 + (elephantIndex * 8); // Stagger vertically
    
    const spreadX = Math.random() * 10 - 5;
    const spreadY = Math.random() * 8 - 4;
    const arcHeight = (Math.random() * 15 + 10) * sprayPower;
    
    const newDrop = {
      id,
      size: size * sprayPower,
      speedFactor,
      startRight: baseRight + spreadX,
      startBottom: baseBottom + spreadY,
      deltaX: (40 + Math.random() * 20) * (isAdult ? -1 : 1), // Spray direction
      deltaY: -20 + Math.random() * 10,
      arcHeight: arcHeight,
      duration: speedFactor * 2,
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

  // Elephant water spray animation
  const triggerElephantSpray = (elephantIndex, section) => {
    const isAdult = section === 'mahakaya';
    const dropCount = isAdult ? 25 : 15;
    const sprayPower = isAdult ? 1.5 : 1.0;
    
    for (let i = 0; i < dropCount; i++) {
      safeSetTimeout(() => {
        createWaterDrop(elephantIndex, section, sprayPower);
      }, i * 80);
    }
  };

  // STEP 1: Lotus/Stone Click Handler
  const handleElementClick = (index, section) => {
    if (!sceneState || !sceneActions) return;
    
    console.log(`${section} element ${index} clicked`);
    hideCoach();
    
    if (!sceneState.welcomeShown) {
      sceneActions.updateState({ welcomeShown: true });
    }
    
    if (section === 'vakratunda') {
      const lotusStates = [...(sceneState.lotusStates || [0, 0, 0, 0])];
      if (lotusStates[index] === 0) {
        lotusStates[index] = 1; // Activated
        setShowSparkle(`lotus-${index}`);
        
        sceneActions.updateState({
          lotusStates,
          activeElement: `lotus-${index}`,
          waitingForElephant: true
        });
        
        safeSetTimeout(() => setShowSparkle(null), 1500);
      }
    } else if (section === 'mahakaya') {
      const stoneStates = [...(sceneState.stoneStates || [0, 0, 0, 0])];
      if (stoneStates[index] === 0) {
        stoneStates[index] = 1; // Activated
        setShowSparkle(`stone-${index}`);
        
        sceneActions.updateState({
          stoneStates,
          activeElement: `stone-${index}`,
          waitingForElephant: true
        });
        
        safeSetTimeout(() => setShowSparkle(null), 1500);
      }
    }
  };

  // STEP 2: Elephant Click Handler
  const handleElephantClick = (index, section) => {
    if (!sceneState || !sceneActions) return;
    
    const expectedElement = section === 'vakratunda' ? `lotus-${index}` : `stone-${index}`;
    
    // Check if corresponding element is activated
    if (sceneState.activeElement !== expectedElement) {
      console.log('Elephant clicked but corresponding element not activated');
      return;
    }
    
    const syllables = section === 'vakratunda' 
      ? ['va', 'kra', 'tun', 'da']
      : ['ma', 'ha', 'ka', 'ya'];
    
    const syllable = syllables[index];
    
    console.log(`${section} elephant ${index} clicked - syllable: ${syllable}`);
    
    // Play syllable audio
    playSyllableAudio(syllable);
    
    // Trigger water spray
    triggerElephantSpray(index, section);
    
    // Mark syllable as learned and complete interaction
    const newLearnedSyllables = {
      ...sceneState.learnedSyllables,
      [syllable]: true
    };
    
    if (section === 'vakratunda') {
      const lotusStates = [...sceneState.lotusStates];
      lotusStates[index] = 2; // Completed
      sceneActions.updateState({
        lotusStates,
        learnedSyllables: newLearnedSyllables,
        activeElement: null,
        waitingForElephant: false
      });
    } else {
      const stoneStates = [...sceneState.stoneStates];
      stoneStates[index] = 2; // Completed
      sceneActions.updateState({
        stoneStates,
        learnedSyllables: newLearnedSyllables,
        activeElement: null,
        waitingForElephant: false
      });
    }
    
    setShowSparkle(`${section}-elephant-${index}`);
    safeSetTimeout(() => setShowSparkle(null), 2000);
  };

  // Check for section completion
  useEffect(() => {
    if (!sceneState) return;
    
    // Check Vakratunda completion
    const vakratundaSyllables = ['va', 'kra', 'tun', 'da'];
    const vakratundaLearned = vakratundaSyllables.every(
      syl => sceneState.learnedSyllables[syl]
    );
    
    if (vakratundaLearned && !sceneState.vakratundaComplete) {
      console.log('Vakratunda section complete!');
      playCompleteWord('vakratunda');
      
      sceneActions.updateState({
        vakratundaComplete: true,
        currentSection: 'mahakaya',
        learnedWords: {
          ...sceneState.learnedWords,
          vakratunda: true
        },
        progress: {
          ...sceneState.progress,
          percentage: 50,
          starsEarned: 2
        }
      });
      
      setShowSparkle('vakratunda-complete');
      safeSetTimeout(() => setShowSparkle(null), 3000);
    }
    
    // Check Mahakaya completion
    const mahakayaSyllables = ['ma', 'ha', 'ka', 'ya'];
    const mahakayaLearned = mahakayaSyllables.every(
      syl => sceneState.learnedSyllables[syl]
    );
    
    if (mahakayaLearned && !sceneState.mahakayaComplete) {
      console.log('Mahakaya section complete!');
      playCompleteWord('mahakaya');
      
      sceneActions.updateState({
        mahakayaComplete: true,
        currentSection: 'complete',
        learnedWords: {
          ...sceneState.learnedWords,
          mahakaya: true
        },
        phase: PHASES.SCENE_COMPLETE,
        stars: 5,
        completed: true,
        progress: {
          percentage: 100,
          starsEarned: 5,
          completed: true
        }
      });
      
      setShowSparkle('scene-complete');
      safeSetTimeout(() => {
        setShowSparkle('final-fireworks');
      }, 2000);
    }
  }, [sceneState?.learnedSyllables]);

  // GameCoach messages
  useEffect(() => {
    if (!sceneState || !showMessage || sceneState.isReloadingGameCoach) return;
    
    const matchingMessage = gameCoachStoryMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
    
    if (matchingMessage) {
      const messageAlreadyShown =
        (matchingMessage.id === 'welcome' && sceneState.welcomeShown) ||
        (matchingMessage.id === 'vakratunda_wisdom' && sceneState.vakratundaWisdomShown) ||
        (matchingMessage.id === 'mahakaya_wisdom' && sceneState.mahakayaWisdomShown);
      
      if (messageAlreadyShown) return;
      
      const timer = setTimeout(() => {
        showMessage(matchingMessage.message, {
          duration: 6000,
          animation: 'bounce',
          position: 'top-right',
          source: 'scene'
        });
        
        // Mark message as shown
        switch (matchingMessage.id) {
          case 'welcome':
            sceneActions.updateState({ welcomeShown: true });
            break;
          case 'vakratunda_wisdom':
            sceneActions.updateState({ vakratundaWisdomShown: true });
            break;
          case 'mahakaya_wisdom':
            sceneActions.updateState({ mahakayaWisdomShown: true });
            break;
        }
      }, matchingMessage.timing);
      
      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.vakratundaComplete,
    sceneState?.mahakayaComplete,
    sceneState?.welcomeShown,
    sceneState?.vakratundaWisdomShown,
    sceneState?.mahakayaWisdomShown,
    showMessage
  ]);

  // Render progress counter
  const renderProgressCounter = () => {
    const totalSyllables = 8;
    const learnedCount = Object.values(sceneState?.learnedSyllables || {}).filter(Boolean).length;
    
    return (
      <div className="syllable-counter">
        <div className="counter-icon">
          🌸
        </div>
        <div className="counter-progress">
          <div
            className="counter-progress-fill"
            style={{width: `${(learnedCount / totalSyllables) * 100}%`}}
          />
        </div>
        <div className="counter-display">{learnedCount}/{totalSyllables}</div>
      </div>
    );
  };

  // Get element images
  const getLotusImage = (index) => {
    const images = [lotusVa, lotusKra, lotusTun, lotusDa];
    return images[index];
  };

  const getStoneImage = (index) => {
    const images = [stoneMa, stoneHa, stoneKa, stoneYa];
    return images[index];
  };

  const getBabyElephantImage = (index) => {
    const images = [elephantBabyVa, elephantBabyKra, elephantBabyTun, elephantBabyDa];
    return images[index];
  };

  const getAdultElephantImage = (index) => {
    const images = [elephantMa, elephantHa, elephantKa, elephantYa];
    return images[index];
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="vakratunda-grove-container">
          <div 
            className="river-background" 
            style={{ backgroundImage: `url(${riverBackground})` }}
          >
            {renderProgressCounter()}
            
            {/* Audio Test Button */}
            <button 
              onClick={testAudio}
              style={{
                position: 'absolute',
                top: '70px',
                right: '20px',
                zIndex: 100,
                padding: '8px 16px',
                background: '#4ECDC4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎵 Test Audio
            </button>
            
            {/* SCENE 1A: Vakratunda Section (Random Layout) */}
            {sceneState.currentSection === 'vakratunda' && (
              <div className="scene-1a-container">
                {/* Lotus Flowers - Random Positions */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`lotus-${index}`} 
                    className={`lotus lotus-${index} ${sceneState.lotusStates?.[index] === 1 ? 'activated' : ''} ${sceneState.lotusStates?.[index] === 2 ? 'completed' : ''}`}
                    style={{
                      position: 'absolute',
                      left: elementPositions.lotuses[index].left,
                      top: elementPositions.lotuses[index].top
                    }}
                  >
                    <ClickableElement
                      id={`lotus-${index}`}
                      onClick={() => handleElementClick(index, 'vakratunda')}
                      completed={sceneState.lotusStates?.[index] === 2}
                      zone="vakratunda-zone"
                    >
                      <img
                        src={getLotusImage(index)}
                        alt={`Lotus ${syllableLabels.vakratunda[index]}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    <div className="syllable-label">{syllableLabels.vakratunda[index]}</div>
                    {showSparkle === `lotus-${index}` && (
                      <SparkleAnimation
                        type="star"
                        count={12}
                        color="#ff9ebd"
                        size={8}
                        duration={1500}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                ))}
                
                {/* Baby Elephants - Random Positions */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`baby-elephant-${index}`}
                    className={`baby-elephant baby-elephant-${index} ${sceneState.activeElement === `lotus-${index}` ? 'ready' : ''}`}
                    style={{
                      position: 'absolute',
                      left: elementPositions.babyElephants[index].left,
                      top: elementPositions.babyElephants[index].top
                    }}
                  >
                    <ClickableElement
                      id={`baby-elephant-${index}`}
                      onClick={() => handleElephantClick(index, 'vakratunda')}
                      completed={sceneState.lotusStates?.[index] === 2}
                      zone="baby-elephant-zone"
                    >
                      <img
                        src={getBabyElephantImage(index)}
                        alt={`Baby Elephant ${syllableLabels.vakratunda[index]}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    <div className="elephant-label">{syllableLabels.vakratunda[index]}</div>
                    {showSparkle === `vakratunda-elephant-${index}` && (
                      <SparkleAnimation
                        type="firefly"
                        count={15}
                        color="lightblue"
                        size={10}
                        duration={2000}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* SCENE 1B: Mahakaya Section (Random Layout) */}
            {sceneState.currentSection === 'mahakaya' && (
              <div className="scene-1b-container">
                {/* Stones - Random Positions */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`stone-${index}`}
                    className={`stone stone-${index} ${sceneState.stoneStates?.[index] === 1 ? 'activated' : ''} ${sceneState.stoneStates?.[index] === 2 ? 'completed' : ''}`}
                    style={{
                      position: 'absolute',
                      left: elementPositions.stones[index].left,
                      top: elementPositions.stones[index].top
                    }}
                  >
                    <ClickableElement
                      id={`stone-${index}`}
                      onClick={() => handleElementClick(index, 'mahakaya')}
                      completed={sceneState.stoneStates?.[index] === 2}
                      zone="mahakaya-zone"
                    >
                      <img
                        src={getStoneImage(index)}
                        alt={`Stone ${syllableLabels.mahakaya[index]}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    <div className="syllable-label">{syllableLabels.mahakaya[index]}</div>
                    {showSparkle === `stone-${index}` && (
                      <SparkleAnimation
                        type="magic"
                        count={10}
                        color="orange"
                        size={8}
                        duration={1500}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                ))}
                
                {/* Adult Elephants - Random Positions */}
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={`adult-elephant-${index}`}
                    className={`adult-elephant adult-elephant-${index} ${sceneState.activeElement === `stone-${index}` ? 'ready' : ''}`}
                    style={{
                      position: 'absolute',
                      left: elementPositions.adultElephants[index].left,
                      top: elementPositions.adultElephants[index].top
                    }}
                  >
                    <ClickableElement
                      id={`adult-elephant-${index}`}
                      onClick={() => handleElephantClick(index, 'mahakaya')}
                      completed={sceneState.stoneStates?.[index] === 2}
                      zone="adult-elephant-zone"
                    >
                      <img
                        src={getAdultElephantImage(index)}
                        alt={`Adult Elephant ${syllableLabels.mahakaya[index]}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </ClickableElement>
                    <div className="elephant-label">{syllableLabels.mahakaya[index]}</div>
                    {showSparkle === `mahakaya-elephant-${index}` && (
                      <SparkleAnimation
                        type="firefly"
                        count={20}
                        color="gold"
                        size={12}
                        duration={2000}
                        fadeOut={true}
                        area="full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Water Drops */}
            {(sceneState.waterDrops || []).map(drop => (
              <div
                key={drop.id}
                className="water-drop enhanced-arc"
                style={{
                  fontSize: `${drop.size * 1.5 + 2}vh`,
                  right: `${drop.startRight}%`,
                  bottom: `${drop.startBottom}%`,
                  transform: `rotate(${drop.rotation}deg)`,
                  opacity: drop.opacity,
                  '--delta-x': `${drop.deltaX}vw`,
                  '--delta-y': `${drop.deltaY}vh`,
                  '--arc-height': `${drop.arcHeight}vh`,
                  '--duration': `${drop.duration}s`,
                  animation: `riverWaterArc var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                  animationFillMode: 'forwards'
                }}
              >
                💧
              </div>
            ))}
            
            {/* Section completion sparkles */}
            {showSparkle === 'vakratunda-complete' && (
              <div className="vakratunda-completion">
                <SparkleAnimation
                  type="glitter"
                  count={30}
                  color="#4ECDC4"
                  size={15}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}
            
            {showSparkle === 'scene-complete' && (
              <div className="scene-completion">
                <SparkleAnimation
                  type="magic"
                  count={50}
                  color="gold"
                  size={20}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}
          </div>
          
          {/* Progressive Hint System */}
          <ProgressiveHintSystem
            ref={progressiveHintRef}
            sceneId={sceneId}
            sceneState={sceneState}
            hintConfigs={getHintConfigs()}
            characterImage={ganeshaCoach}
            initialDelay={15000}
            hintDisplayTime={8000}
            position="bottom-center"
            iconSize={60}
            zIndex={2000}
            enabled={true}
          />
          
          {/* Final Fireworks */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              count={20}
              colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
              onComplete={() => {
                setShowSparkle(null);
                
                // Save completion
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('shloka-river', 'vakratunda-grove', {
                    completed: true,
                    stars: 5,
                    syllables: sceneState.learnedSyllables,
                    words: sceneState.learnedWords,
                    phase: 'complete',
                    timestamp: Date.now()
                  });
                  
                  localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                  SimpleSceneManager.clearCurrentScene();
                  console.log('Vakratunda Grove: Completion saved');
                }
                
                setShowSceneCompletion(true);
              }}
            />
          )}
          
          {/* Scene Completion */}
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Vakratunda Grove"
            sceneNumber={1}
            totalScenes={5}
            starsEarned={sceneState.progress?.starsEarned || 5}
            totalStars={5}
            discoveredSymbols={Object.keys(sceneState.learnedSyllables || {}).filter(syl =>
              sceneState.learnedSyllables?.[syl]
            )}
            nextSceneName="Firefly Garden"
            sceneId="vakratunda-grove"
            completionData={{
              stars: 5,
              syllables: sceneState.learnedSyllables,
              words: sceneState.learnedWords,
              completed: true,
              totalStars: 5
            }}
            onComplete={onComplete}
            onReplay={() => {
              console.log('Replaying Vakratunda Grove');
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                localStorage.removeItem(`temp_session_${profileId}_shloka-river_vakratunda-grove`);
                SimpleSceneManager.setCurrentScene('shloka-river', 'vakratunda-grove', false, false);
              }
              setTimeout(() => window.location.reload(), 100);
            }}
            onContinue={() => {
              console.log('Continuing to next scene');
              if (clearManualCloseTracking) clearManualCloseTracking();
              if (hideCoach) hideCoach();
              
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'shloka-river', 'vakratunda-grove', {
                  completed: true,
                  stars: 5,
                  syllables: sceneState.learnedSyllables,
                  words: sceneState.learnedWords
                });
              }
              
              setTimeout(() => {
                SimpleSceneManager.setCurrentScene('shloka-river', 'firefly-garden', false, false);
                onNavigate?.('scene-complete-continue');
              }, 100);
            }}
          />
          
          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`Great progress learning Sanskrit, ${profileName}!`);
              if (hideCoach) hideCoach();
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />
          

        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default VakratundaGrove;