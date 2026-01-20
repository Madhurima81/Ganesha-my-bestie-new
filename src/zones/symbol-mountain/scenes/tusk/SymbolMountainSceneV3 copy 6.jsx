// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV3.jsx
// 🎵 Complete Musical Mountain Scene with Streamlined Symbol Discovery

import React, { useState, useEffect, useRef } from 'react';
import './SymbolMountainScene.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
//import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Import game components
import EyesTelescopeGame from './EyesTelescopeGame';
import EarsRhythmGame from './EarsRhythmGame';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';

// Images - Background and Symbols
import mountainBackground from '../tusk/assets/images/rock-background.png';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-colored.png';
import ganeshaEars from '../../shared/images/icons/symbol-ear-colored.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-colored.png';

// Popup/Mission images
import eyesCoach from '../tusk/assets/images/mooshika-coach.png';
import ganeshaOutline from '../tusk/assets/images/ganesha-outline.png';
import ganeshaComplete from '../tusk/assets/images/ganesha-complete.png';
import ganeshaCharacter from './assets/images/ganesha-character.png'; // Added import

// Mission before/after images
import eyeBefore from '../tusk/assets/images/eye-before.png';
import eyeAfter from '../tusk/assets/images/eye-after.png';
import earBefore from '../tusk/assets/images/ear-before.png';
import earAfter from '../tusk/assets/images/ear-after.png';
import tuskBefore from '../tusk/assets/images/tusk-before.png';
import tuskAfter from '../tusk/assets/images/tusk-after.png';

// Shared symbol images - ALL 8 SYMBOLS
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';
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

// Game phases
const PHASES = {
  EYES_GAME: 'eyes_game',
  EYES_COMPLETE: 'eyes_complete',
  EARS_GAME: 'ears_game',
  EARS_COMPLETE: 'ears_complete',
  TUSK_GAME: 'tusk_game',
    TUSK_COMPLETE: 'tusk_complete',  // ✅ ADD THIS
  ALL_COMPLETE: 'all_complete'
};

// Power configuration
const powerConfig = {
  eyes: { 
    name: 'All-Seeing Musical Wisdom', 
    image: symbolEyesColored,
    color: '#87CEEB' 
  },
  ears: { 
    name: 'Divine Musical Listening', 
    image: symbolEarColored,
    color: '#4ECDC4' 
  },
  tusk: { 
    name: 'Sacred Musical Assembly', 
    image: symbolTuskColored,
    color: '#FFD700' 
  }
};

// Mission images mapping
const missionImages = {
  eyes: { before: eyeBefore, after: eyeAfter },
  ears: { before: earBefore, after: earAfter },
  tusk: { before: tuskBefore, after: tuskAfter }
};

const discoveryConfig = {
  eyes: {
    foundTitle: "You Completed the Eyes Game!",
    foundSubtitle: "Ganesha's all-seeing wisdom awakens...",
    powerName: "All-Seeing Musical Wisdom",
    image: symbolEyesColored
  },
  ears: {
    foundTitle: "You Mastered the Ears Game!",
    foundSubtitle: "Divine listening reveals itself...",
    powerName: "Divine Musical Listening",
    image: symbolEarColored
  },
  tusk: {
    foundTitle: "You Assembled the Sacred Tusk!",
    foundSubtitle: "Musical perfection achieved...",
    powerName: "Sacred Musical Assembly",
    image: symbolTuskColored
  }
};

// Musical instrument positions
const instrumentPositions = {
  1: { x: 20, y: 30, type: 'tabla' },
  2: { x: 80, y: 35, type: 'flute' },
  3: { x: 30, y: 65, type: 'bells' },
  4: { x: 70, y: 70, type: 'cymbals' }
};

// Musical note data
const musicalNoteData = [
  { emoji: '🎵', id: 'note1' },
  { emoji: '🎶', id: 'note2' },
  { emoji: '🎼', id: 'note3' }
];

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

const SymbolMountainSceneV2 = ({ 
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
          musicalNoteStates: {
            note1: 'gray',
            note2: 'gray',
            note3: 'gray'
          },
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
            mooshika: true,
            modak: true,
            belly: true,
            lotus: true,
            trunk: true
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
  if (!sceneState || !sceneActions) {
    return <div className="loading">Loading Musical Mountain scene...</div>;
  }

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.EYES_GAME });

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'));

  // Local UI states
  const [showSparkle, setShowSparkle] = useState(null);
  const [showHintGlow, setShowHintGlow] = useState(false);
  //const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerMission, setShowPowerMission] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Discovery overlay states
const [discoveryStep, setDiscoveryStep] = useState('hidden');
const [isDiscoveryFading, setIsDiscoveryFading] = useState(false);
const [discoveryItem, setDiscoveryItem] = useState(null);

// Resume popup states
const [showResumePopup, setShowResumePopup] = useState(false);
const [resumeMessage, setResumeMessage] = useState('');

// Reload tracking
const reloadHandledRef = useRef(false);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
          reloadHandledRef.current = false;
    };
  }, []);

  // Auto-glow effect
  useEffect(() => {
    const glowPhases = [PHASES.EYES_GAME, PHASES.EARS_GAME, PHASES.TUSK_GAME];
    
    const isActiveGameplay = 
      glowPhases.includes(sceneState?.phase) && 
      sceneState?.welcomeShown && 
      !showPowerModal && 
      !showPowerMission &&
      !sceneState?.showEyesTelescopeGame &&
      !sceneState?.showEarsRhythmGame;
    
    if (isActiveGameplay) {
      const timer = setTimeout(() => {
        setShowHintGlow(true);
      }, 20000);
      
      return () => clearTimeout(timer);
    } else {
      setShowHintGlow(false);
    }
  }, [
    sceneState?.phase, 
    sceneState?.welcomeShown, 
    showPowerModal, 
    showPowerMission,
    sceneState?.showEyesTelescopeGame,
    sceneState?.showEarsRhythmGame
  ]);

  // Reload continuation - prevents freezing
useEffect(() => {
  if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) {
    return;
  }

  console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.phase);
  reloadHandledRef.current = true;

  const shouldShowEyesModal = 
    sceneState.phase === PHASES.EYES_COMPLETE;

  const shouldShowEarsModal = 
    sceneState.phase === PHASES.EARS_COMPLETE;

  const shouldShowTuskModal = 
    sceneState.phase === PHASES.ALL_COMPLETE;

  if (shouldShowEyesModal) {
    setTimeout(() => {
      setCurrentMissionSymbol('eyes');
      setShowPowerModal(true);
    }, 500);
  } 
else if (shouldShowEarsModal) {
  setTimeout(() => {
    setCurrentMissionSymbol('ears');
    setShowPowerModal(true);
  }, 500);
}
// ✅ ADD THIS NEW BLOCK
else if (sceneState.phase === PHASES.TUSK_COMPLETE) {
  setTimeout(() => {
    setCurrentMissionSymbol('tusk');
    setShowPowerModal(true);
  }, 500);
}
else if (shouldShowTuskModal) {  // This is for actual completion
  setTimeout(() => {
    setCurrentMissionSymbol('tusk');
    setShowPowerModal(true);
  }, 500);
}
  else if (sceneState.phase === PHASES.EYES_GAME) {
    setResumeMessage("Continue the Eyes Telescope game! Find the hidden symbols!");
    setShowResumePopup(true);
    setTimeout(() => setShowResumePopup(false), 5000);
  }
  else if (sceneState.phase === PHASES.EARS_GAME) {
    setResumeMessage("Continue the Ears Rhythm game! Match the musical patterns!");
    setShowResumePopup(true);
    setTimeout(() => setShowResumePopup(false), 5000);
  }
  else if (sceneState.phase === PHASES.TUSK_GAME) {
    setResumeMessage("Continue the Tusk Assembly game! Complete the musical tusk!");
    setShowResumePopup(true);
    setTimeout(() => setShowResumePopup(false), 5000);
  }

}, [isReload, sceneState.phase, sceneState.welcomeShown]);

// Completion message
/*useEffect(() => {
  if (!sceneState) return;
  
  if (sceneState.phase === PHASES.ALL_COMPLETE && !sceneState.masteryShown) {
    const timer = setTimeout(() => {
      setResumeMessage(`Amazing work, ${profileName}! You've mastered all three musical symbols!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 8000);
      
      sceneActions.updateState({ masteryShown: true });
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [sceneState?.phase, sceneState?.masteryShown, profileName]);*/

  // Helper function for next action text
  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      eyes: '👂 Discover Ears',
      ears: '😏 Discover Tusk',
      tusk: '✨ End Scene'
    };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  // Helper function for power descriptions
  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      eyes: 'Ganesha\'s Eyes represent Wisdom.\nSee the truth in everything!',
      ears: 'Ganesha\'s Ears represent Listening.\nHear the prayers of the world!',
      tusk: 'Ganesha\'s Tusk represents Sacrifice.\nKeep the good and let go of the bad!'
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

  const triggerDiscoverySequence = (itemKey, delay = 500) => {
  setDiscoveryItem(itemKey);
  
  setTimeout(() => {
    setDiscoveryStep('found'); 
  }, delay);

  setTimeout(() => {
    setDiscoveryStep('symbol'); 
    setShowSparkle('symbol-reveal');
  }, delay + 3000);

  setTimeout(() => {
    setIsDiscoveryFading(true);
    
    setTimeout(() => {
      setDiscoveryStep('hidden');
      setIsDiscoveryFading(false);
      completeSymbolLearning(itemKey, { name: discoveryConfig[itemKey].powerName });
    }, 500); 
  }, delay + 6000);
};

const completeSymbolLearning = (symbolKey, symbolData) => {
  console.log(`${symbolKey} symbol learned`);
  
  // 1. Immediately update state (Add to inventory)
  sceneActions.updateState({
    discoveredSymbols: {
      ...sceneState.discoveredSymbols,
      [symbolKey]: true
    }
  });

  // 2. Trigger Sidebar Sparkles (Visual feedback for "Collection")
  setShowSparkle(`${symbolKey}-to-sidebar`);
  
  // 3. Open the Power Modal almost immediately 
  // (Just enough delay for the Overlay to finish fading out)
  setTimeout(() => {
    setShowSparkle(null);
    setCurrentMissionSymbol(symbolKey);
    setShowPowerModal(true);
  }, 800);
};

  // Handler functions
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setShowPowerMission(true);
  };

  const handleContinueLearning = () => {
    setShowPowerModal(false);
    const symbolKey = currentMissionSymbol;
    
    if (symbolKey === 'eyes') {
      setTimeout(() => {
        setShowSparkle('ears-materialize');
      }, 500);
      
      setTimeout(() => {
        sceneActions.updateState({
          earsVisible: true,
          phase: PHASES.EARS_GAME,
          activeGame: 'ears',
          currentFocus: 'ears'
        });
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
      
    } else if (symbolKey === 'ears') {
      setTimeout(() => {
        setShowSparkle('tusk-activate');
      }, 500);
      
      setTimeout(() => {
        sceneActions.updateState({
          showTuskAssemblyGame: true,
          tuskGameActive: true,
          showGaneshaOutline: true,
          musicalNoteStates: {
            note1: 'golden',
            note2: 'golden',
            note3: 'golden'
          },
          phase: PHASES.TUSK_GAME,
          activeGame: 'tusk',
          currentFocus: 'tusk'
        });
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
      
    } else if (symbolKey === 'tusk') {
      setShowSparkle('final-fireworks');
      sceneActions.updateState({
        phase: PHASES.ALL_COMPLETE,
        completed: true,
        stars: 9,
        showingCompletionScreen: true,
        currentPopup: 'final_fireworks',
        progress: {
          percentage: 100,
          starsEarned: 9,
          completed: true
        }
      });
    }
  };

  const handleMissionComplete = (symbolKey) => {
    setShowPowerMission(false);
    
    if (symbolKey === 'eyes') {
      setTimeout(() => {
        setShowSparkle('ears-materialize');
      }, 500);
      
      setTimeout(() => {
        sceneActions.updateState({
          earsVisible: true,
          phase: PHASES.EARS_GAME,
          activeGame: 'ears',
          currentFocus: 'ears'
        });
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
      
    } else if (symbolKey === 'ears') {
      setTimeout(() => {
        setShowSparkle('tusk-activate');
      }, 500);
      
      setTimeout(() => {
        sceneActions.updateState({
          showTuskAssemblyGame: true,
          tuskGameActive: true,
          showGaneshaOutline: true,
          musicalNoteStates: {
            note1: 'golden',
            note2: 'golden',
            note3: 'golden'
          },
          phase: PHASES.TUSK_GAME,
          activeGame: 'tusk',
          currentFocus: 'tusk'
        });
        setTimeout(() => setShowSparkle(null), 2000);
      }, 1500);
      
    } else if (symbolKey === 'tusk') {
      setShowSparkle('final-fireworks');
sceneActions.updateState({
  phase: PHASES.TUSK_COMPLETE  // ✅ Just the phase, nothing else

      });
    }
  };

  // Click handlers
  const handleEyesClick = () => {
    if (sceneState.eyesGameComplete) return;
    
    if (!sceneState.welcomeShown) {
      sceneActions.updateState({ welcomeShown: true });
    }
    
    sceneActions.updateState({ 
      showEyesTelescopeGame: true,
      eyesGameActive: true,
      activeGame: 'eyes'
    });
  };

  const handleEarsClick = () => {
    if (!sceneState.earsVisible || sceneState.earsGameComplete) return;
    
    
    sceneActions.updateState({ 
      showEarsRhythmGame: true,
      earsGameActive: true,
      musicalNotesVisible: true,
      activeGame: 'ears',
      currentNote: 'note1'
    });
  };

  const handleNoteClick = (noteId) => {
    if (!sceneState.showTuskAssemblyGame) return;
    
    const noteState = sceneState.musicalNoteStates[noteId];
    if (noteState !== 'golden') return;
    
    
    const newNoteStates = {
      ...sceneState.musicalNoteStates,
      [noteId]: 'used'
    };
    
    const newTuskPower = sceneState.tuskPower + 1;
    
    sceneActions.updateState({
      musicalNoteStates: newNoteStates,
      tuskPower: newTuskPower,
      tuskFullyPowered: newTuskPower === 3
    });
    
    setShowSparkle('tusk-feeding');
    setTimeout(() => setShowSparkle(null), 1500);
    
    if (newTuskPower >= 3) {
      safeSetTimeout(() => {
        sceneActions.updateState({
          ganeshaComplete: true,
          ganeshaAssembling: false
        });
        
        setShowSparkle('ganesha-complete');
        
        safeSetTimeout(() => {
          handleTuskGameComplete();
        }, 1000);
      }, 1000);
    }
  };

  // Game completion handlers
  const handleEyesGameComplete = () => {
    sceneActions.updateState({
      eyesGameComplete: true,
      showEyesTelescopeGame: false,
      phase: PHASES.EYES_COMPLETE
    });
    
    setShowSparkle('eyes-complete');
    
    safeSetTimeout(() => {
      setShowSparkle(null);
triggerDiscoverySequence('eyes', 1000);
    }, 800);
  };

  const handleEarsGameComplete = () => {
    sceneActions.updateState({
      earsGameComplete: true,
      showEarsRhythmGame: false,
      phase: PHASES.EARS_COMPLETE
    });
    
    setShowSparkle('ears-complete');
    
    safeSetTimeout(() => {
      setShowSparkle(null);
triggerDiscoverySequence('ears', 1000);
    }, 2000);
  };

  const handleTuskGameComplete = () => {
    sceneActions.updateState({
      ganeshaComplete: true,
      showTuskAssemblyGame: true,
phase: PHASES.TUSK_COMPLETE  // ✅ Correct - tusk found, modal pending
    });
    
    setShowSparkle('tusk-complete');
    
    safeSetTimeout(() => {
      setShowSparkle(null);
triggerDiscoverySequence('tusk', 1000);
    }, 1000);
  };

  // Hint system
  const shouldEnableHints = () => {
    const disabledPhases = [PHASES.ALL_COMPLETE, PHASES.EYES_COMPLETE, PHASES.EARS_COMPLETE];
    if (sceneState?.showEyesTelescopeGame || sceneState?.showEarsRhythmGame) return false;
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'eyes-hint',
      message: 'Click the divine eyes!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState.phase === PHASES.EYES_GAME && 
               !sceneState.showEyesTelescopeGame &&
               !sceneState.eyesGameComplete;
      }
    },
    {
      id: 'ears-hint',
      message: 'Click the sacred ears!',
      position: { bottom: '60%', right: '70%', transform: 'translateX(50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        return sceneState.earsVisible &&
               !sceneState.showEarsRhythmGame &&
               !sceneState.earsGameComplete;
      }
    },
    {
      id: 'tusk-hint',
      message: 'Click notes to tusk!',
      position: { bottom: '40%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        const hasGoldenNotes = Object.values(sceneState.musicalNoteStates || {}).some(state => state === 'golden');
        return sceneState.showTuskAssemblyGame &&
               hasGoldenNotes &&
               !sceneState.ganeshaComplete;
      }
    }
  ];

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="symbol-mountain-scene-v2-container">
          <div className="mountain-background" style={{ backgroundImage: `url(${mountainBackground})` }}>

            {/* OPENING INSTRUCTION SCREEN (Musical Mountain) */}
            {sceneState.phase === PHASES.EYES_GAME && !sceneState.welcomeShown && (
              <div className="mountain-instructions-overlay">
                {/* Sparkles */}
                <div className="mountain-sparkles">
                  <div className="mountain-sparkle"></div>
                  <div className="mountain-sparkle"></div>
                  <div className="mountain-sparkle"></div>
                  <div className="mountain-sparkle"></div>
                </div>

                <div className="mountain-instructions-content">
                  {/* Character - Left Side */}
                  <div className="mountain-instructions-ganesha">
                    <img 
                      src={ganeshaCharacter} 
                      alt="Character"
                      style={{maxWidth: '450px'}}
                    />
                  </div>
                  
                  {/* Instruction Card - Right Side */}
                  <div className="mountain-instructions-card">
                    <h1 className="mountain-instructions-title">
                      Master the Musical Mountain!
                    </h1>
                    
                    <p className="mountain-instructions-subtitle">
                      3 sacred sounds are hidden here!
                    </p>
                    
                    {/* Icons showing what to find */}
                    <div className="mountain-instructions-icons">
                      <div className="mountain-instruction-icon-item">
                        <img src={symbolEyesColored} alt="Eyes" />
                        <span className="mountain-instruction-icon-label">Eyes</span>
                      </div>
                      <div className="mountain-instruction-icon-item">
                        <img src={symbolEarColored} alt="Ears" />
                        <span className="mountain-instruction-icon-label">Ears</span>
                      </div>
                      <div className="mountain-instruction-icon-item">
                        <img src={symbolTuskColored} alt="Tusk" />
                        <span className="mountain-instruction-icon-label">Tusk</span>
                      </div>
                    </div>
                    
                    <button
                      className="mountain-instructions-button"
                      onClick={() => {
                        sceneActions.updateState({ welcomeShown: true });
                      }}
                    >
                      Begin Adventure!
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Headers */}
            {!showPowerModal && !showPowerMission && sceneState?.welcomeShown && (
              <>
                {sceneState.phase === PHASES.EYES_GAME && 
                 !sceneState.eyesGameComplete && 
                 !sceneState.showEyesTelescopeGame && (
                  <div className="phase-header">
                    👁️ DISCOVER DIVINE VISION! Click the sacred eyes!
                  </div>
                )}
                
                {sceneState.earsVisible && 
                 !sceneState.earsGameComplete && 
                 !sceneState.showEarsRhythmGame && (
                  <div className="phase-header">
                    👂 MASTER SACRED RHYTHMS! Click the divine ears!
                  </div>
                )}
                
                {sceneState.showTuskAssemblyGame && 
                 !sceneState.ganeshaComplete && (
                  <div className="phase-header">
                    🎵 ASSEMBLE GANESHA! Click golden notes to feed the tusk!
                  </div>
                )}
              </>
            )}

            {/* Eyes Symbol */}
            {sceneState.welcomeShown && !sceneState.discoveredSymbols?.eyes && ( 
              <div 
                className={`eyes-symbol-container ${
                  sceneState.eyesGameComplete ? 'completed' : 'active'
                } ${
                  showHintGlow && sceneState.phase === PHASES.EYES_GAME ? 'hint-glow' : ''
                }`}
                onClick={handleEyesClick}
              >
                <ClickableElement
                  id="eyes-symbol"
                  onClick={handleEyesClick}
                  completed={sceneState.eyesGameComplete}
                  zone="eyes-zone"
                >
                  <img 
                    src={ganeshaEyes}
                    alt="Divine Eyes Symbol"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  />
                </ClickableElement>
              </div>
            )}

            {/* Eyes Telescope Game */}
            {sceneState.showEyesTelescopeGame && !sceneState.discoveredSymbols?.eyes && (
              <EyesTelescopeGame
                isActive={sceneState.showEyesTelescopeGame}
                instrumentPositions={instrumentPositions}
                discoveryRadius={15}
                profileName={profileName}
                initialDiscoveredInstruments={sceneState.discoveredInstruments || {}}
                initialFoundInstruments={sceneState.foundInstruments || []}
                isReload={isReload && sceneState.showEyesTelescopeGame}
                onInstrumentFound={(instrumentType, allFound, discovered) => {
                  sceneActions.updateState({
                    foundInstruments: allFound,
                    discoveredInstruments: discovered,
                    instrumentsFound: allFound.length
                  });
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
                  
                  setTimeout(() => {
                    handleEyesGameComplete();
                  }, 1000);
                }}
                onClose={() => {
                  sceneActions.updateState({ 
                    showEyesTelescopeGame: false 
                  });
                }}
              />
            )}

            {/* Ears Symbol */}
            {sceneState.earsVisible && !sceneState.discoveredSymbols?.ears && (
              <div 
                className={`ears-symbol-container ${
                  sceneState.earsGameComplete ? 'completed' : 'active'
                } materialized ${
                  showHintGlow && sceneState.earsVisible && !sceneState.earsGameComplete ? 'hint-glow' : ''
                }`}
                onClick={handleEarsClick}
              >
                <ClickableElement
                  id="ears-symbol"
                  onClick={handleEarsClick}
                  completed={sceneState.earsGameComplete}
                  zone="ears-zone"
                >
                  <img 
                    src={ganeshaEars}
                    alt="Sacred Ears Symbol"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  />
                </ClickableElement>
                
                {showSparkle === 'ears-materialize' && (
                  <SparkleAnimation
                    type="glitter"
                    count={30}
                    color="gold"
                    size={15}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* Ears Rhythm Game */}
            {sceneState.showEarsRhythmGame && (
              <EarsRhythmGame
                isActive={sceneState.showEarsRhythmGame}
                currentNote={sceneState.currentNote || 'note1'}
                discoveredInstruments={sceneState.discoveredInstruments}
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
                  const newNoteStates = {
                    ...sceneState.musicalNoteStates,
                    [noteId]: 'golden'
                  };
                  
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
                  
                  setShowSparkle(`note-${noteId}-golden`);
                  setTimeout(() => setShowSparkle(null), 2000);
                  
                  const goldenNotes = Object.values(newNoteStates).filter(state => state === 'golden');
                  if (goldenNotes.length === 3) {
                    handleEarsGameComplete();
                  } else {
                    const nextNote = noteId === 'note1' ? 'note2' : 'note3';
                    setTimeout(() => {
                      sceneActions.updateState({ currentNote: nextNote });
                    }, 500);
                  }
                }}
                onGameComplete={() => {
                  handleEarsGameComplete();
                }}
                onClose={() => {
                  sceneActions.updateState({ 
                    showEarsRhythmGame: false 
                  });
                }}
              />
            )}

            {/* Musical Notes */}
            {sceneState.musicalNotesVisible && (
              <>
                {musicalNoteData.map((noteData) => {
                  const noteState = sceneState.musicalNoteStates[noteData.id];
                  const isGolden = noteState === 'golden';
                  const isUsed = noteState === 'used';
                  
                  if (isUsed) return null;
                  
                  const positions = {
                    'note1': { top: '17%', left: '27%' },
                    'note2': { top: '22%', left: '47%' },
                    'note3': { top: '19%', left: '67%' }
                  };
                  
                  const position = positions[noteData.id];
                  
                  return (
                    <div 
                      key={noteData.id}
                      className={`musical-note ${
                        showHintGlow && isGolden && sceneState.showTuskAssemblyGame ? 'hint-glow' : ''
                      }`}
                      onClick={() => {
                        if (isGolden && sceneState.showTuskAssemblyGame) {
                          handleNoteClick(noteData.id);
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: '60px',
                        height: '60px',
                        zIndex: 45,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isGolden ? 1 : 0.6,
                        cursor: isGolden && sceneState.showTuskAssemblyGame ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        textShadow: isGolden 
                          ? '0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.4)' 
                          : 'none',
                        fontSize: '40px',
                        animation: isGolden ? 'noteGolden 2s infinite' : 'none'
                      }}
                    >
                      {noteData.emoji}
                    </div>
                  );
                })}
              </>
            )}

            {/* Tusk Assembly Area */}
            {sceneState.showTuskAssemblyGame && (
              <div className="sacred-tusk-assembly-area" style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                width: '200px',
                height: '220px',
                transform: 'translate(-50%, -50%)',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                {(sceneState.showGaneshaOutline || sceneState.ganeshaComplete) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '60%',
                    width: '260px',
                    height: '290px',
                    transform: 'translateX(-50%)',
                    opacity: 0.8,
                    pointerEvents: 'none'
                  }}>
                    <img 
                      src={sceneState.ganeshaComplete ? ganeshaComplete : ganeshaOutline}
                      alt={sceneState.ganeshaComplete ? "Complete Ganesha" : "Ganesha Outline"}
                      style={{
                        width: sceneState.ganeshaComplete ? '80%' : '100%',
                        height: sceneState.ganeshaComplete ? '80%' : '100%',
                        opacity: 1,
                        transition: 'all 0.8s ease'
                      }}
                    />
                  </div>
                )}
                
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '30%',
                  width: '120px',
                  height: '120px',
                  transform: 'translateX(-30%)',
                  zIndex: 30
                }}>
                  <img 
                    src={ganeshaTusk}
                    alt="Sacred Tusk"
                    style={{
                      width: '60px',
                      height: '60px',
                      filter: sceneState.tuskPower > 0 ? 
                        `brightness(${1.2 + (sceneState.tuskPower * 0.2)}) drop-shadow(0 0 ${8 + (sceneState.tuskPower * 4)}px #ffd700)` 
                        : 'brightness(1.1)',    
                      transition: 'all 0.8s ease'
                    }}
                  />
                </div>
              </div>
            )}


            {/* PROGRESSIVE HINT SYSTEM with disabled state */}
            {sceneState.welcomeShown && ( 

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
            /> )}



            <TocaBocaNav
              onHome={() => {
            
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onProgress={() => {
              
                setShowCulturalCelebration(true);
              }}
              onHelp={() => console.log('Show help')}
              onParentMenu={() => console.log('Parent menu')}
              isAudioOn={true}
              onAudioToggle={() => console.log('Toggle audio')}
              onZonesClick={() => {
        
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              onStartFresh={() => resetScene()}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.phase === PHASES.ALL_COMPLETE ? 1 : 0,
                total: 1
              }}
            />

      

            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
              {...CulturalProgressExtractor.getCulturalProgressData()}
            />

          </div>

          {/* ⚠️ CRITICAL: Sidebar MUST come before modals in DOM order */}
          {sceneState.welcomeShown && (

          <SymbolSidebar 
            discoveredSymbols={{
              mooshika: true,
              modak: true,
              belly: true,
              lotus: true,
              trunk: true,
              ...(sceneState.discoveredSymbols || {})
            }}
            onSymbolClick={(symbolId) => {
              console.log(`Sidebar symbol clicked: ${symbolId}`);
            }}
          />)}

          {/* ⚠️ MODALS MUST COME LAST - This ensures they render on top */}
          
          {/* Centered Symbol Celebration 
          {showCenteredSymbol && (
            <>
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(3px)',
                zIndex: 599,
                animation: 'fadeIn 0.3s ease-out'
              }} />
              
              <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 600,
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

          {/* Discovery Overlay */}
{discoveryStep !== 'hidden' && discoveryItem && (
  <div className={`discovery-overlay ${isDiscoveryFading ? 'fading-out' : ''}`}>
    <h1 className="discovery-title" style={{
      textShadow: discoveryStep === 'symbol' 
        ? '0 0 30px #FFD700, 0 4px 0 #fff' 
        : '0 4px 0 #fff, 0 0 20px rgba(255, 255, 255, 0.8)'
    }}>
      {discoveryStep === 'found' 
        ? discoveryConfig[discoveryItem].foundTitle 
        : `${discoveryConfig[discoveryItem].powerName} Power!`}
    </h1>

    {discoveryStep === 'found' && (
      <p className="discovery-subtitle">
        {discoveryConfig[discoveryItem].foundSubtitle}
      </p>
    )}

    <div className="discovery-hero">
      <img
        src={discoveryConfig[discoveryItem].image}
        alt={discoveryItem}
        className="discovery-hero-img"
        style={{
          animation: discoveryStep === 'symbol' 
            ? 'powerPulse 2s infinite' 
            : 'heroFloat 3s infinite ease-in-out',
          filter: discoveryStep === 'symbol'
            ? 'drop-shadow(0 0 50px gold)'
            : 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))'
        }}
      />
    </div>
  </div>
)}

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

          {/* Power Modal (Scene 3 - Musical Mountain) */}
          {showPowerModal && (
            <div className="mountain-power-overlay">
              <div className="mountain-power-card">
                <h1 className="mountain-power-title">
                  {powerConfig[currentMissionSymbol]?.name} Power Unlocked!
                </h1>

                <img 
                  src={powerConfig[currentMissionSymbol]?.image}
                  alt="power symbol"
                  className="mountain-power-icon"
                />

                <p className="mountain-power-description">
                  {getPowerDescription(currentMissionSymbol)}
                </p>

                {/* Primary Action - Save an Animal */}
                <button 
                  className="mountain-power-primary-button"
                  onClick={() => {
                    setShowPowerModal(false);
                    handleSaveAnimal();
                  }}
                >
                  Save an Animal
                </button>

                {/* Secondary Actions */}
                <div className="mountain-power-secondary-buttons">
                  <button 
                    className="mountain-power-secondary-button"
                    onClick={() => {
                      console.log(`🔄 Play Again: Restarting ${currentMissionSymbol} game`);
                      setShowPowerModal(false);
                      setShowSparkle(null);
                      //setShowCenteredSymbol(null);
                      
                      // Reset to the appropriate phase and game state for the current symbol
                      if (currentMissionSymbol === 'eyes') {
                        // Reset Eyes Telescope Game
                        sceneActions.updateState({ 
                          phase: PHASES.EYES_GAME,
                          activeGame: 'eyes',
                          showEyesTelescopeGame: true,
                          eyesGameActive: true,
                          eyesGameComplete: false,
                          foundInstruments: [],
                          discoveredInstruments: {},
                          instrumentsFound: 0,
                          currentFocus: 'eyes',
                          discoveredSymbols: {  
                            ...sceneState.discoveredSymbols,
                            eyes: false  // Temporarily mark as undiscovered to show game
                          }
                        });
                        
                      } else if (currentMissionSymbol === 'ears') {
                        // Reset Ears Rhythm Game
                        sceneActions.updateState({ 
                          phase: PHASES.EARS_GAME,
                          activeGame: 'ears',
                          showEarsRhythmGame: true,
                          earsGameActive: true,
                          earsGameComplete: false,
                          musicalNotesVisible: true,
                          currentNote: 'note1',
                          musicalNoteStates: {
                            note1: 'gray',
                            note2: 'gray',
                            note3: 'gray'
                          },
                          earsGamePhase: 'waiting',
                          earsPlayerInput: [],
                          earsCurrentSequence: [],
                          earsSequenceItemsShown: 0,
                          earsSequenceJustCompleted: false,
                          earsReadyForNextNote: false,
                          earsLastCompletedNote: null,
                          currentFocus: 'ears',
                          discoveredSymbols: {  
                            ...sceneState.discoveredSymbols,
                            ears: false
                          }
                        });
                        
                      } else if (currentMissionSymbol === 'tusk') {
                        // Reset Tusk Assembly Game
                        sceneActions.updateState({ 
                          phase: PHASES.TUSK_GAME,
                          activeGame: 'tusk',
                          showTuskAssemblyGame: true,
                          tuskGameActive: true,
                          tuskPower: 0,
                          tuskFullyPowered: false,
                          ganeshaComplete: false,
                          musicalNotesVisible: true,
                          musicalNoteStates: {
                            note1: 'golden',
                            note2: 'golden',
                            note3: 'golden'
                          },
                          currentFocus: 'tusk',
                          discoveredSymbols: {  
                            ...sceneState.discoveredSymbols,
                            tusk: false
                          }
                        });
                      }
                    }}
                  >
                    Play Again
                  </button>
                  
                  <button 
                    className="mountain-power-secondary-button"
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

                                        {sceneState.welcomeShown && (
          <BackToMapButton 
  onNavigate={onNavigate}

/>
            )}

          {/* Fireworks */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={8000}
              count={15}
              colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
              onComplete={() => {
                setShowSparkle(null);
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('symbol-mountain', 'symbol', {
                    completed: true,
                    stars: 9,
                    symbols: { eyes: true, ears: true, tusk: true },
                    phase: 'complete',
                    unlocked: true,
                    timestamp: Date.now()
                  });
                  
                  localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_symbol`);
                  SimpleSceneManager.clearCurrentScene();
                }
                
                setShowSceneCompletion(true);
              }}
            />
          )}

          {/* Scene Completion */}
          {showSceneCompletion && (
            <SceneCompletionCelebration
              show={true}
              sceneName="Musical Mountain Adventure"
              sceneNumber={3}
              totalScenes={4}
              starsEarned={9}
              totalStars={9}
              discoveredSymbols={[
                'mooshika', 'modak', 'belly',
                'lotus', 'trunk',
                'eyes', 'ears', 'tusk'
              ].filter(symbol => sceneState.discoveredSymbols?.[symbol])}
              symbolImages={{
                mooshika: symbolMooshikaColored,
                modak: symbolModakColored,
                belly: symbolBellyColored,
                lotus: symbolLotusColored,
                trunk: symbolTrunkColored,
                eyes: symbolEyesColored,
                ears: symbolEarColored,
                tusk: symbolTuskColored
              }}
              nextSceneName="Final Assembly"
              sceneId="symbol"
              completionData={{
                stars: 9,
                symbols: { 
                  mooshika: true, modak: true, belly: true,
                  lotus: true, trunk: true,
                  eyes: true, ears: true, tusk: true 
                },
                completed: true,
                totalStars: 9
              }}
              onComplete={onComplete}
              onReplay={() => {
                setShowSceneCompletion(false);
                resetScene();
              }}
              onContinue={() => {
              
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'symbol', {
                    completed: true,
                    stars: 9,
                    symbols: { eyes: true, ears: true, tusk: true }
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
  );
};

export default SymbolMountainSceneV2;