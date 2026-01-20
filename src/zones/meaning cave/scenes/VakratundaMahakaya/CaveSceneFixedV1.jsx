// zones/cave-of-secrets/scenes/vakratunda-mahakaya/CaveSceneFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import './CaveSceneFixed.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
//import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach'; // Coach removed
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CurvedPathTracer from './CurvedPathTracer';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import RescueModal from '../../components/RescueModal';
import { RESCUE_CONFIGS } from '../../config/RescueConfigs';
import SymbolSidebar from '../../components/SymbolSidebar';

import ClickDotsPathGame from './ClickDotsPathGame';
import mooshikaTracing from './assets/images/mooshika-tracing.png';

// Cave-specific components
import SanskritSidebar from '../../../../lib/components/feedback/SanskritSidebar';
import doorImage from './assets/images/door-image.png';

import DoorUnlockedModal from '../../components/DoorUnlockedModal';

import DoorComponent from '../../components/DoorComponent';
import ganeshaComplete from './assets/images/ganesha-complete.png';

// Cave images
import caveBackground from './assets/images/cave-background.png';
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import stoneHead from './assets/images/stone-head.png';
import stoneTrunk from './assets/images/stone-trunk.png';
import stoneBody from './assets/images/stone-body.png';
import stoneLegs from './assets/images/stone-legs.png';
import ganeshaCharacterCave from './assets/images/ganesha-character-cave.png'; // Added character image

// Journal container image
import meaningJournal from '../../assets/images/meaning-journal.png';

// All 8 app images
import appVakratunda from '../../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../../assets/images/apps/app-mahakaya.png';

// Add these imports with your other image imports

import vakratundaSymbol from '../../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../../assets/images/symbols/mahakaya-symbol.png';

// ✅ FIX: Preload Mooshika image to prevent delay
const preloadedMooshikaImage = new Image();
preloadedMooshikaImage.src = mooshikaTracing;

const CAVE_PHASES = {
  // Part 1: Vakratunda Learning
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  TRACE_INTRO: 'trace_intro',
  TRACE_ACTIVE: 'trace_active',
  TRACE_COMPLETE: 'trace_complete',
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  
  // Part 2: Mahakaya Learning  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  GROW_INTRO: 'grow_intro',
  GROW_ACTIVE: 'grow_active',
  GROW_COMPLETE: 'grow_complete',
  MAHAKAYA_LEARNING: 'mahakaya_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

const powerConfig = {
  vakratunda: { 
    name: 'Curved Trunk Power', 
    image: vakratundaSymbol,
    color: '#FFD700' 
  },
  mahakaya: { 
    name: 'Mighty Form Power', 
    image: mahakayaSymbol,
    color: '#FF8C42' 
  }
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Cave Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Cave.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Cave Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const CaveSceneFixed = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'vakratunda-mahakaya'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Door 1 state (Va-kra-tun-da)
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          door1CurrentStep: 0,
          door1Syllables: ['Va', 'kra', 'tun', 'da'],

          // Door 2 state (Ma-ha-ka-ya)  
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          door2CurrentStep: 0,
          door2Syllables: ['Ma', 'ha', 'ka', 'ya'],

          // Game 1: Tracing state
          tracingStarted: false,
          tracedPoints: [],
          traceProgress: 0,
          traceQuality: 'good',
          tracingCompleted: false,
          trunkPosition: { x: 50, y: 100 },
          canResumeTracing: false,

          // Sequential path validation
          currentPathSegment: 0,
          segmentsCompleted: [],
          mustFollowSequence: true,

          // Mini Ganesha
          ganeshaVisible: false,
          ganeshaAnimation: 'breathing',
          ganeshaSize: 0.8,
          ganeshaGlow: 0.2,

          // Game 2: Growing Ganesha state
          growingStarted: false,
          stonesClicked: 0,
          floatingStones: [
            { id: 1, clicked: false, x: 20, y: 30 },
            { id: 2, clicked: false, x: 70, y: 20 },
            { id: 3, clicked: false, x: 30, y: 60 },
            { id: 4, clicked: false, x: 80, y: 50 }
          ],
          growingCompleted: false,
          
          // Sanskrit learning
          learnedWords: {
            vakratunda: { learned: false, scene: 1 },
            mahakaya: { learned: false, scene: 1 }
          },
          
          // Scene progression  
          phase: CAVE_PHASES.DOOR1_ACTIVE, // Start at Door 1
          currentFocus: 'door1',
          
          // Discovery and popup states
          discoveredSymbols: {},
          currentPopup: null,
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // Welcome state
          welcomeShown: false,
          
          // Progress tracking
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          },
          
          // UI states
          showingCompletionScreen: false,
          fireworksCompleted: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <CaveSceneContent
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

const CaveSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality
  const hideCoach = () => {};
  const clearManualCloseTracking = () => {};

  const { resetScene } = useSceneReset(
    sceneActions, 
    'cave-of-secrets', 
    'vakratunda-mahakaya', 
    getSceneResetConfig('vakratunda-mahakaya')
  );

  // State management
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [isManualReset, setIsManualReset] = useState(false);

  const [showRescueModal, setShowRescueModal] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState(null);

  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerMission, setShowPowerMission] = useState(false); // Can be used if needed
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);


  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const lastClickTime = useRef(0);
  const activeTouches = useRef(0);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Preload images
  useEffect(() => {
    const img = new Image();
    img.src = mooshikaTracing;
  }, []);

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const playAudio = (audioPath, volume = 1.0) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('Audio failed:', error);
    }
  };

  const playSyllable = (syllable) => {
    const map = {
      'va': 'vakratunda-va',
      'kra': 'vakratunda-kra',
      'tun': 'vakratunda-tun',
      'da': 'vakratunda-da',
      'ma': 'mahakaya-ma',
      'ha': 'mahakaya-ha',
      'ka': 'mahakaya-ka',
      'ya': 'mahakaya-ya'
    };
    playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
  };

  const stoneImages = [stoneHead, stoneTrunk, stoneBody, stoneLegs];

  const getGaneshaAnimationClass = () => {
    if (!sceneState.ganeshaVisible) return '';
    if (sceneState.ganeshaAnimation === 'happy') return 'happy';
    if (sceneState.ganeshaAnimation === 'growing') return 'growing';
    if (sceneState.ganeshaAnimation === 'mighty') return 'mighty breathing';
    return 'breathing';
  };

  // Helper functions
  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      vakratunda: "You chanted 'Vakratunda'!\nIt means 'Curved Trunk' - the power to handle any challenge!",
      mahakaya: "You chanted 'Mahakaya'!\nIt means 'Great Body' - the power of infinite strength!"
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      vakratunda: '🗣️ Learn Mahakaya',
      mahakaya: '✨ Complete Scene'
    };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  const renderTracingPath = () => {
    if (sceneState.phase !== CAVE_PHASES.TRACE_ACTIVE && 
        sceneState.phase !== CAVE_PHASES.TRACE_INTRO && 
        sceneState.phase !== CAVE_PHASES.TRACE_COMPLETE) {
      return null;
    }

    return (
      <div className="tracing-area" id="tracing-area">
        <ClickDotsPathGame
          mooshikaImage={mooshikaTracing}
          ganeshaImage={ganeshaComplete}
          onComplete={() => {
            console.log('🎉 Dots completed!');
            completeTracing();
          }}
          onProgress={(progressPercent, currentDot) => {
            sceneActions.updateState({
              traceProgress: progressPercent,
              currentPathSegment: currentDot
            });
          }}
          disabled={false}
          showDebug={true}
          initialDot={sceneState.currentPathSegment || 0}
          initialProgress={sceneState.traceProgress || 0}
          isResuming={isReload && sceneState.tracingStarted && !sceneState.tracingCompleted}
        />
      </div>
    );
  };

  const renderGrowingGame = () => {
    if (!sceneState.growingStarted) return null;
    if (showCenteredSymbol || showPowerModal || showRescueModal) return null;
    
    return (
      <div className="growing-area" id="grow-area">
       <div 
          className="floating-stones"
          onTouchStart={(e) => {
            activeTouches.current = e.touches.length;
            if (e.touches.length > 1) {
              e.preventDefault();
            }
          }}
          onTouchEnd={() => {
            activeTouches.current = 0;
          }}
        >
          {sceneState.floatingStones.map((stone, index) => (
            <div
              key={stone.id}
              className={`floating-stone ${stone.clicked ? 'clicked' : ''}`}
              style={{ 
                left: `${stone.x}%`, 
                top: `${stone.y}%`,
                display: stone.clicked ? 'none' : 'block'
              }}
              onClick={() => handleStoneClick(stone.id)}
            >
              <img src={stoneImages[index]} alt={`Stone ${stone.id}`} />
              {showSparkle === `stone-${stone.id}-clicked` && (
                <SparkleAnimation
                  type="magic"
                  count={10}
                  color="#ffd700"
                  size={8}
                  duration={1000}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  const getHintConfigs = () => [
    {
      id: 'door1-hint',
      message: 'Try arranging the Sanskrit syllables in order!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed &&
               !showPowerModal;
      }
    },
    {
      id: 'trace-hint', 
      message: 'Trace the curved path like Ganesha\'s trunk!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return (sceneState?.phase === CAVE_PHASES.TRACE_ACTIVE) &&
               !sceneState?.tracingCompleted &&
               !showPowerModal;
      }
    },
    {
      id: 'door2-hint',
      message: 'Arrange the Sanskrit syllables for Mahakaya!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE && 
               !sceneState?.door2Completed &&
               !showPowerModal;
      }
    },
    {
      id: 'grow-hint',
      message: 'Click the floating stones to make Ganesha grow!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.GROW_ACTIVE &&
               sceneState?.stonesClicked < 4 &&
               !showPowerModal;
      }
    }
  ];

  // Reload Logic
  useEffect(() => {
    if (!isReload || !sceneState) return;
    if (isManualReset) return;
   
    // Check for mid-game reload
    const hasMidGameProgress = (
      sceneState.tracingStarted && 
      !sceneState.completed &&
      sceneState.currentPathSegment > 0
    );

    if (hasMidGameProgress) {
      sceneActions.updateState({ 
        isReloadingGameCoach: false,
        phase: CAVE_PHASES.TRACE_ACTIVE
      });
      return;
    }

    if (sceneState.door2Completed && !sceneState.growingStarted) {
      sceneActions.updateState({
        phase: CAVE_PHASES.GROW_ACTIVE,
        growingStarted: true,
        ganeshaVisible: true,
        ganeshaAnimation: 'breathing',
      });
      return;
    }
    
    // Normal reload state clearing
    sceneActions.updateState({ isReloadingGameCoach: false });
  }, [isReload]);


const handleDoor1SyllablePlaced = (syllable) => {
  const now = Date.now();
  if (now - lastClickTime.current < 300) return;
  if (sceneState.phase !== CAVE_PHASES.DOOR1_ACTIVE) return;
  if (sceneState.door1Completed) return;
  if (showPowerModal || showRescueModal || showCenteredSymbol) return; // ✅ No showDoor1Modal here
  
  lastClickTime.current = now;
  
  const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Va';
  const isCorrect = syllable === expectedSyllable;
  
  if (isCorrect) {
    const newStep = (sceneState.door1CurrentStep || 0) + 1;
    const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
    
    sceneActions.updateState({
      door1SyllablesPlaced: newSyllablesPlaced,
      door1CurrentStep: newStep
    });
    
    // ✅ NO modal trigger - DoorComponent handles everything!
  }
};

const handleDoor1Complete = () => {
  console.log('🚪 Door 1 complete - starting tracing game!');
  
  // Start game
  sceneActions.updateState({
    door1Completed: true,
    phase: CAVE_PHASES.TRACE_ACTIVE,
    tracingStarted: true,
    currentPathSegment: 0,
    ganeshaVisible: true,
    ganeshaAnimation: 'breathing'
  });
  
  setShowSparkle('door1-completing');
  setTimeout(() => setShowSparkle(null), 3000);
};

  const handleDoor2SyllablePlaced = (syllable) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    if (sceneState.phase !== CAVE_PHASES.DOOR2_ACTIVE) return;
    if (sceneState.door2Completed) return;
    if (showPowerModal || showRescueModal || showCenteredSymbol) return;
    
    lastClickTime.current = now;
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ma';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({
        door2SyllablesPlaced: newSyllablesPlaced,
        door2CurrentStep: newStep
      });
    }
  };

  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed!');
    
    setShowSparkle('door2-completing');
    
    const doorElement = document.querySelector('.mahakaya-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.GROW_ACTIVE,
      growingStarted: true
    });

    setTimeout(() => {
      setShowSparkle(null);
    }, 3000);
  };

  const completeTracing = () => {
    console.log('🌟 Tracing completed!');
    
    sceneActions.updateState({
      tracingCompleted: true,
      phase: CAVE_PHASES.TRACE_COMPLETE
    });

    safeSetTimeout(() => {
      completeSymbolLearning('vakratunda');
    }, 500);
  };

  const handleStoneClick = (stoneId) => {
    const stone = sceneState.floatingStones.find(s => s.id === stoneId);
    if (!stone || stone.clicked) return;
    
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    
    const updatedStones = sceneState.floatingStones.map(s => 
      s.id === stoneId ? { ...s, clicked: true } : s
    );
    
    const newStonesClicked = sceneState.stonesClicked + 1;
    const scalingSizes = [1.1, 1.5, 2.0, 3.2];
    const glowSizes = [0.3, 0.6, 1.0, 1.5];
    
    sceneActions.updateState({
      floatingStones: updatedStones,
      stonesClicked: newStonesClicked,
      ganeshaSize: scalingSizes[newStonesClicked - 1] || 0.8,
      ganeshaGlow: glowSizes[newStonesClicked - 1] || 0.2,
      ganeshaAnimation: 'growing',
    });
    
    setShowSparkle(`stone-${stoneId}-clicked`);
    
    setTimeout(() => {
      setShowSparkle(null);
    }, 800);
    
    if (newStonesClicked >= 4) {
      setTimeout(() => {
        completeGrowing();
      }, 1500);
    }
  };

  const completeGrowing = () => {
    console.log('🗿 Growing completed!');
    
    sceneActions.updateState({
      growingCompleted: true,
      phase: CAVE_PHASES.GROW_COMPLETE
    });

    safeSetTimeout(() => {
      completeSymbolLearning('mahakaya');
    }, 500);
  };

  // Symbol Learning Flow
  const completeSymbolLearning = (symbolKey) => {
    console.log(`${symbolKey} symbol learned`);
    
    setShowCenteredSymbol(symbolKey);
    
    setTimeout(() => {
      setShowCenteredSymbol(null);
      setShowSparkle(`${symbolKey}-to-sidebar`);
      
      sceneActions.updateState({
        learnedWords: {
          ...sceneState.learnedWords,
          [symbolKey]: { learned: true, scene: 1 }
        }
      });
      
      setTimeout(() => {
        setShowSparkle(null);
        setCurrentMissionSymbol(symbolKey);
        setShowPowerModal(true);
      }, 2000);
    }, 5000);
  };

  // Power Modal Handlers
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setCurrentRescueWord(currentMissionSymbol);
    setShowRescueModal(true);
  };

  const handleContinueLearning = () => {
    setShowPowerModal(false);
    
    if (currentMissionSymbol === 'vakratunda') {
      // Direct transition to Door 2
      sceneActions.updateState({
        phase: CAVE_PHASES.DOOR2_ACTIVE
      });
    } else if (currentMissionSymbol === 'mahakaya') {
      // Finish scene
      setTimeout(() => showFinalCelebration(), 500);
    }
  };

  const handleRescueComplete = (success) => {
    if (!success) return;
    
    setShowRescueModal(false);
    
    if (currentRescueWord === 'vakratunda') {
      setTimeout(() => {
        sceneActions.updateState({
          phase: CAVE_PHASES.DOOR2_ACTIVE
        });
      }, 500);
    } else if (currentRescueWord === 'mahakaya') {
      setTimeout(() => {
        showFinalCelebration();
      }, 500);
    }
    
    setCurrentRescueWord(null);
  };

  const showFinalCelebration = () => {
    console.log('🎊 Final celebration');
    
    setShowSparkle('final-fireworks');
    
    sceneActions.updateState({
      showingCompletionScreen: true,
      currentPopup: 'final_fireworks',
      phase: CAVE_PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
  };

  // Hide active hints
  const hideActiveHints = () => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
  };

  if (!sceneState) {
    return <div className="loading">Loading cave scene...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="pond-scene-container" data-phase={sceneState.phase}>
          <div className="pond-background" style={{ backgroundImage: `url(${caveBackground})` }}>

            {/* OPENING INSTRUCTION SCREEN */}
            {sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.welcomeShown && (
              <div className="cave-instructions-overlay">
                {/* Sparkles */}
                <div className="cave-sparkles">
                  <div className="cave-sparkle"></div>
                  <div className="cave-sparkle"></div>
                  <div className="cave-sparkle"></div>
                  <div className="cave-sparkle"></div>
                </div>

                <div className="cave-instructions-content">
                  {/* Character - Left Side */}
                  <div className="cave-instructions-ganesha">
                    <img 
                      src={ganeshaCharacterCave} 
                      alt="Ganesha Character"
                      style={{maxWidth: '450px'}}
                    />
                  </div>
                  
                  {/* Instruction Card - Right Side */}
                  <div className="cave-instructions-card">
                    <h1 className="cave-instructions-title">
                      Unlock the Cave of Secrets!
                    </h1>
                    
                    <p className="cave-instructions-subtitle">
                      2 sacred Sanskrit chants are hidden here!
                    </p>
                    
                    {/* Icons showing what to find */}
                    <div className="cave-instructions-icons">
                      <div className="cave-instruction-icon-item">
                        <img src={vakratundaSymbol} alt="Vakratunda" />
                        <span className="cave-instruction-icon-label">Curved Trunk</span>
                      </div>
                      <div className="cave-instruction-icon-item">
                        <img src={mahakayaSymbol} alt="Mahakaya" />
                        <span className="cave-instruction-icon-label">Great Body</span>
                      </div>
                    </div>
                    
                    <button
                      className="cave-instructions-button"
                      onClick={() => {
                        sceneActions.updateState({ welcomeShown: true });
                      }}
                    >
                      Enter the Cave
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Headers - Always Visible */}
            {!showPowerModal && !showRescueModal && !showCenteredSymbol && sceneState.welcomeShown && (
              <>
                {sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed && (
                  <div className="phase-header">
                    🔱 SPELL VAKRATUNDA! Drag the syllables in order!
                  </div>
                )}
                
                {sceneState.phase === CAVE_PHASES.TRACE_ACTIVE && !sceneState.tracingCompleted && (
                  <div className="phase-header">
                    🐭 TRACE THE CURVED TRUNK! Follow the path!
                  </div>
                )}
                
                {sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed && (
                  <div className="phase-header">
                    🔱 SPELL MAHAKAYA! Arrange the syllables!
                  </div>
                )}
                
                {sceneState.phase === CAVE_PHASES.GROW_ACTIVE && sceneState.stonesClicked < 4 && (
                  <div className="phase-header">
                    💎 CLICK THE SACRED STONES! Make Ganesha mighty!
                  </div>
                )}
              </>
            )}

            {/* Vakratunda to Sidebar Effect */}
            {showSparkle === 'vakratunda-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '30%',
                left: '30%',
                width: '300px',
                height: '200px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="stream"
                  count={20}
                  color="#FFD700"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Mahakaya to Sidebar Effect */}
            {showSparkle === 'mahakaya-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '30%',
                right: '30%',
                width: '300px',
                height: '200px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="stream"
                  count={20}
                  color="#FF8C42"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Centered Symbol Celebration 
            {showCenteredSymbol && (
              <>
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(26, 18, 8, 0.7)',
                  backdropFilter: 'blur(3px)',
                  zIndex: 199,
                  animation: 'fadeIn 0.3s ease-out'
                }} />
                
                <div style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 200,
                  textAlign: 'center',
                  animation: 'symbolAppear 0.5s ease-out'
                }}>
                  <img 
                    src={powerConfig[showCenteredSymbol]?.image}
                    alt={showCenteredSymbol}
                    style={{
                      width: '180px',
                      height: '180px',
                      filter: `drop-shadow(0 0 40px ${powerConfig[showCenteredSymbol]?.color})`,
                      animation: 'symbolGlow 2s ease-in-out infinite alternate',
                      marginBottom: '25px'
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    pointerEvents: 'none'
                  }}>
                    <SparkleAnimation
                      type="glitter"
                      count={30}
                      color={powerConfig[showCenteredSymbol]?.color}
                      size={12}
                      duration={3000}
                      fadeOut={true}
                      area="full"
                    />
                  </div>
                  
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: `3px 3px 6px ${powerConfig[showCenteredSymbol]?.color}`,
                    animation: 'textPulse 1.5s ease-in-out infinite',
                    letterSpacing: '2px'
                  }}>
                    {powerConfig[showCenteredSymbol]?.name}
                  </div>
                </div>
              </>
            )}

            {/* Power Modal (Cave Theme) 
            {showPowerModal && (
              <div className="cave-power-overlay">
                <div className="cave-power-card">
                  <h1 className="cave-power-title">
                    {powerConfig[currentMissionSymbol]?.name} Unlocked!
                  </h1>

                  <img 
                    src={powerConfig[currentMissionSymbol]?.image}
                    alt="power symbol"
                    className="cave-power-icon"
                  />

                  <p className="cave-power-description">
                    {getPowerDescription(currentMissionSymbol)}
                  </p>

                  <button 
                    className="cave-power-primary-button"
                    onClick={() => {
                      setShowPowerModal(false);
                      handleSaveAnimal();
                    }}
                  >
                    Save an Animal
                  </button>

                  <div className="cave-power-secondary-buttons">
                    <button 
                      className="cave-power-secondary-button"
                      onClick={() => {
                        console.log(`🔄 Play Again: Restarting ${currentMissionSymbol}`);
                        setShowPowerModal(false);
                        
                        if (currentMissionSymbol === 'vakratunda') {
                          sceneActions.updateState({ 
                            phase: CAVE_PHASES.DOOR1_ACTIVE,
                            door1Completed: false,
                            door1CurrentStep: 0,
                            door1SyllablesPlaced: [],
                            tracingCompleted: false,
                            tracingStarted: false
                          });
                        } else if (currentMissionSymbol === 'mahakaya') {
                          sceneActions.updateState({ 
                            phase: CAVE_PHASES.DOOR2_ACTIVE,
                            door2Completed: false,
                            door2CurrentStep: 0,
                            door2SyllablesPlaced: [],
                            growingCompleted: false,
                            growingStarted: false,
                            stonesClicked: 0
                          });
                        }
                      }}
                    >
                      Play Again
                    </button>
                    
                    <button 
                      className="cave-power-secondary-button"
                      onClick={() => {
                        setShowPowerModal(false);
                        handleContinueLearning();
                      }}
                    >
                      {getNextDiscoveryText(currentMissionSymbol)}
                    </button>
                  </div>
                </div>
              </div>
            )}





            {/* Back Button */}
            {sceneState.welcomeShown && (
              <BackToMapButton onNavigate={onNavigate} hideCoach={hideCoach} clearManualCloseTracking={clearManualCloseTracking} />
            )}

            {/* Start Fresh Button */}
            <div 
              style={{
                position: 'fixed',
                top: '70px',
                left: '40px',
                zIndex: 10000,
                background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                color: 'white',
                padding: '14px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 6px 20px rgba(46,204,113,0.4)',
                border: '3px solid white',
                transition: 'all 0.3s ease',
                userSelect: 'none',
                textAlign: 'center',
                minWidth: '140px'
              }}
              onClick={() => {
                if (window.confirm('🔄 Start Fresh?\n\nReset this Cave scene to the very beginning?')) {
                  setIsManualReset(true);
                  
                  // Clear all UI
                  setShowSceneCompletion(false);
                  setShowSparkle(null);
                  
                  // Reset state
                  setTimeout(() => {
                    sceneActions.updateState({
                      phase: CAVE_PHASES.DOOR1_ACTIVE,
                      door1State: 'waiting',
                      door1SyllablesPlaced: [],
                      door1Completed: false,
                      door1CurrentStep: 0,
                      door2State: 'waiting',
                      door2SyllablesPlaced: [],
                      door2Completed: false,
                      door2CurrentStep: 0,
                      tracingStarted: false,
                      tracingCompleted: false,
                      growingStarted: false,
                      growingCompleted: false,
                      welcomeShown: false,
                      stars: 0,
                      completed: false
                    });
                    
                    setTimeout(() => {
                      setIsManualReset(false);
                    }, 500);
                  }, 100);
                }
              }}
            >
              🔄 START FRESH
            </div>

            {/* Door 1 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
<DoorComponent 
  key={`door1-${sceneState.door1CurrentStep}-${sceneState.door1Completed}`}
  syllables={['Va', 'kra', 'tun', 'da']}
  completedWord="Vakratunda"
  onDoorComplete={handleDoor1Complete}  // ❌ NOT called by DoorComponent

  onSyllablePlaced={handleDoor1SyllablePlaced}
  onSyllableAudio={playSyllable}
  sceneTheme="cave-of-secrets"
  doorImage={doorImage}
  className="vakratunda-door"
  educationalMode={true}
  showTargetWord={true}
  currentStep={sceneState.door1CurrentStep || 0}
  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
  targetWordTitle="VAKRATUNDA "
  primaryColor="#FFD700"
  secondaryColor="#FF8C42"
  errorColor="#FF4444"
  isCompleted={sceneState.door1Completed}
  placedSyllables={sceneState.door1SyllablesPlaced || []}
  isResuming={isReload}
modalOpen={showPowerModal || showRescueModal || showCenteredSymbol}
showModal={true}
modalTitle="Door Unlocked!"
modalSymbolImage={vakratundaSymbol}
modalDescription="You chanted VAKRATUNDA! Now trace the curved trunk to discover its power."
modalButtonText="Start Tracing"
modalTitleColor="#FF6B35"
modalButtonColor="#FFA500"
modalButtonTextColor="#FFFFFF"
modalCardBorderColor="#FFA500"
/>        </div>
            )}

            {/* Door 1 Sparkles */}
            {showSparkle === 'door1-completing' && (
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '500px',
                zIndex: 21,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="magic"
                  count={25}
                  color="#ffd700"
                  size={12}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Door 2 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  key={`door2-${sceneState.door2CurrentStep}-${sceneState.door2Completed}`}
                  syllables={['Ma', 'ha', 'ka', 'ya']}
                  completedWord="Mahakaya"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  onSyllableAudio={playSyllable}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="mahakaya-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle=" MAHAKAYA "
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                  isResuming={isReload}
                    modalOpen={showPowerModal || showRescueModal || showCenteredSymbol}

                     // ✅ Door 2 modal props
  showModal={true}
  modalTitle="Door Unlocked!"
  modalSymbolImage={mahakayaSymbol}
  modalDescription="You chanted MAHAKAYA! Click the sacred stones to make Ganesha grow mighty."
  modalButtonText="Start Growing"
  modalTitleColor="#FF8C00"
  modalButtonColor="#FFD700"
  modalButtonTextColor="#5A4A3A"
  modalCardBorderColor="#FFD700"

                />
              </div>
            )}

            {/* Door 2 Sparkles */}
            {showSparkle === 'door2-completing' && sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && (
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '500px',
                zIndex: 21,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="magic"
                  count={25}
                  color="#ff8c42"
                  size={12}
                  duration={2500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Tracing Game */}
            {(sceneState.phase === CAVE_PHASES.TRACE_INTRO || 
              sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || 
              sceneState.phase === CAVE_PHASES.TRACE_COMPLETE) && 
              !showCenteredSymbol && 
              !showPowerModal && 
              !showRescueModal && 
              !showSceneCompletion && (
                renderTracingPath()
            )}

            {/* Growing Game */}
            {!showCenteredSymbol && 
             !showPowerModal && 
             !showRescueModal && 
             !showSceneCompletion && 
             renderGrowingGame()}

            {/* Ganesha Animation */}
            {(sceneState.phase === CAVE_PHASES.TRACE_INTRO || 
              sceneState.phase === CAVE_PHASES.TRACE_ACTIVE || 
              sceneState.phase === CAVE_PHASES.TRACE_COMPLETE ||
              sceneState.phase === CAVE_PHASES.VAKRATUNDA_LEARNING ||
              sceneState.phase === CAVE_PHASES.GROW_ACTIVE ||
              sceneState.phase === CAVE_PHASES.GROW_COMPLETE ||
              sceneState.phase === CAVE_PHASES.MAHAKAYA_LEARNING ||
              sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
              sceneState.phase === CAVE_PHASES.COMPLETE ||
              sceneState.showingCompletionScreen ||
              showSparkle === 'final-fireworks') && (
              <div 
                className={`mini-ganesha-container ${getGaneshaAnimationClass()}`}
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '55%',
                  transform: `translate(-50%, -50%) scale(${sceneState.ganeshaSize || 0.8})`,
                  zIndex: 8,
                  filter: `brightness(${1 + (sceneState.ganeshaGlow || 0.2)})`
                }}
              >
                <img 
                  src={ganeshaComplete}
                  alt="Mini Ganesha" 
                  style={{ 
                    width: '100px', 
                    height: '100px',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    animation: sceneState.ganeshaAnimation === 'breathing' ? 'ganeshaBreathing 3s ease-in-out infinite' :
                              sceneState.ganeshaAnimation === 'growing' ? 'ganeshaBreathing 3s ease-in-out infinite' :
                              sceneState.ganeshaAnimation === 'happy' ? 'ganeshaBreathing 3s ease-in-out infinite' :
                              sceneState.ganeshaAnimation === 'mighty' ? 'ganeshaMighty 5s ease-out' : 'none'
                  }}
                />
              </div>
            )}

            {/* Rescue Modal */}
            <RescueModal
              key={currentRescueWord}
              show={showRescueModal}
              wordData={currentRescueWord ? RESCUE_CONFIGS[currentRescueWord] : null}
              onComplete={handleRescueComplete}
              profileName={profileName}
            />

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'vakratunda-mahakaya', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { vakratunda: true, mahakaya: true },
                      learnedWords: sceneState.learnedWords || {},
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`);
                    SimpleSceneManager.clearCurrentScene();
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Cave of Secrets - Scene 1"
              sceneNumber={1}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['vakratunda', 'mahakaya']}
              containerType="journal"
              containerImage={meaningJournal}
              meaningCards={{
                vakratunda: { sanskrit: "वक्रतुण्ड", meaning: "Curved Trunk" },
                mahakaya: { sanskrit: "महाकाय", meaning: "Great Body" }
              }}
              appImages={{
                vakratunda: appVakratunda,
                mahakaya: appMahakaya
              }}
              nextSceneName="Million Suns Chamber"
              sceneId="vakratunda-mahakaya"
              completionData={{
                stars: 8,
                symbols: {},
                sanskritWords: { vakratunda: true, mahakaya: true },
                learnedWords: sceneState.learnedWords || {},
                chants: { vakratunda: true, mahakaya: true },
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}
              onReplay={() => {
                setShowSceneCompletion(false);
                resetScene();
              }}
              onContinue={() => {
          
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'vakratunda-mahakaya', {
                    completed: true,
                    stars: 8,
                    symbols: {},
                    sanskritWords: { vakratunda: true, mahakaya: true },
                    learnedWords: sceneState.learnedWords || {},
                    chants: { vakratunda: true, mahakaya: true }
                  });
                }

                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('cave-of-secrets', 'suryakoti-samaprabha', false, false);
                  onNavigate?.('scene-complete-continue');
                }, 100);
              }}
            />

            {/* Progressive Hints */}
            {sceneState.welcomeShown && (
              <ProgressiveHintSystem
                ref={progressiveHintRef}
                sceneId={sceneId}
                sceneState={sceneState}
                hintConfigs={getHintConfigs()}
                characterImage={mooshikaCoach}
                initialDelay={20000}        
                hintDisplayTime={10000}    
                position="bottom-right"
                iconSize={60}
                zIndex={2000}
                onHintShown={() => setHintUsed(true)}
                enabled={!showPowerModal && !showRescueModal}
              />
            )}

            {/* Symbol Sidebar */}
            <div style={{ filter: 'none' }}>
              <SymbolSidebar
                unlockedSymbols={{
                  vakratunda: sceneState.learnedWords?.vakratunda?.learned || false,
                  mahakaya: sceneState.learnedWords?.mahakaya?.learned || false,
                  suryakoti: false,
                  samaprabha: false,
                  nirvighnam: false,
                  kurumedeva: false,
                  sarvakaryeshu: false,
                  sarvada: false
                }}
                onSymbolClick={(symbolId) => {
                  console.log(`Symbol clicked: ${symbolId}`);
                }}
              />
            </div>

            {/* Navigation */}
            <div style={{ position: 'relative', zIndex: 10000 }}>
              <TocaBocaNav
                onHome={() => onNavigate?.('home')}
                onProgress={() => setShowCulturalCelebration(true)}
                onHelp={() => console.log('Show help')}
                onParentMenu={() => console.log('Parent menu')}
                isAudioOn={true}
                onAudioToggle={() => console.log('Toggle audio')}
                onZonesClick={() => onNavigate?.('zones')}
                onStartFresh={() => resetScene()}
                currentProgress={{
                  stars: sceneState.stars || 0,
                  completed: sceneState.completed ? 1 : 0,
                  total: 1
                }}
              />
            </div>

            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default CaveSceneFixed;