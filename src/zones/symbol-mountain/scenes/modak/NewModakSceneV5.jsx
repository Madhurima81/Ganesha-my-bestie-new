// zones/symbol-mountain/scenes/modak/NewModakSceneV5.jsx
// ProgressiveHintSystem with visual disabled state

import React, { useState, useEffect, useRef } from 'react';
import './ModakScene.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import FreeDraggableItem from '../../../../lib/components/interactive/FreeDraggableItem';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';


// Images
import forestBackground from './assets/images/forest-background.png';
import modak1 from './assets/images/modak-1.png';
import modak2 from './assets/images/modak-2.png';
import modak3 from './assets/images/modak-3.png';
import basket from './assets/images/basket.png';
import mooshika from './assets/images/mooshika.png';
import mudMound from './assets/images/mud-mound.png';
import rock from './assets/images/rock.png';
import belly from './assets/images/belly.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';

// Add these imports near your other image imports
import mooshikaBefore from './assets/images/mooshika-before.png';
import mooshikaAfter from './assets/images/mooshika-after.png';
import modakBefore from './assets/images/modak-before.png';
import modakAfter from './assets/images/modak-after.png';
import bellyBefore from './assets/images/belly-before.png';
import bellyAfter from './assets/images/belly-after.png';

const PHASES = {
  MOOSHIKA_SEARCH: 'mooshika_search',
  MOOSHIKA_FOUND: 'mooshika_found',
  MODAKS_UNLOCKED: 'modaks_unlocked',
  SOME_COLLECTED: 'some_collected',
  ALL_COLLECTED: 'all_collected',
  BASKET_READY: 'basket_ready',
  ROCK_VISIBLE: 'rock_visible',
  ROCK_FEEDING: 'rock_feeding',
  ROCK_TRANSFORMED: 'rock_transformed',
  COMPLETE: 'complete'
};

const powerConfig = {
  mooshika: { 
    name: 'Divine Guidance', 
    image: symbolMooshikaColored,
    color: '#FF69B4' 
  },
  modak: { 
    name: 'Sweet Blessing', 
    image: symbolModakColored,
    color: '#FFD700' 
  },
  belly: { 
    name: 'Cosmic Container', 
    image: symbolBellyColored,
    color: '#FF8C42' 
  }
};

const missionImages = {
  mooshika: { before: mooshikaBefore, after: mooshikaAfter },
  modak: { before: modakBefore, after: modakAfter },
  belly: { before: bellyBefore, after: bellyAfter }
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

const NewModakScene = ({ 
  onComplete, 
  onNavigate, 
  zoneId = 'symbol-mountain', 
  sceneId = 'modak' 
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          moundStates: [0, 0, 0, 0, 0],
          correctMound: Math.floor(Math.random() * 5) + 1,
          mooshikaVisible: false,
          mooshikaFound: false,
          mooshikaPosition: { top: '45%', left: '25%' },
          moundsVanished: false,
          moundsVanishing: false,

          modakStates: [0, 0, 0],
          modaksUnlocked: false,
          basketVisible: false,
          basketFull: false,
          basketReady: false,
          collectedModaks: [],
          
          rockVisible: false,
          rockFeedCount: 0,
          rockTransformed: false,
          rockBellySize: 0,
          
          phase: PHASES.MOOSHIKA_SEARCH,
          currentFocus: 'mooshika',
          discoveredSymbols: {},
          
          welcomeShown: false,
          showMooshikaText: false,
          showModakText: false,
          showBellyText: false,
          
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
          <NewModakSceneContent 
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

const NewModakSceneContent = ({ 
  sceneState, 
  sceneActions, 
  isReload, 
  onComplete, 
  onNavigate,
  zoneId,
  sceneId
}) => {
  if (!sceneState || !sceneActions) {
    return <div>Loading scene...</div>;
  }

  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.MOOSHIKA_SEARCH });

  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();
  const [showHintGlow, setShowHintGlow] = useState(false);


  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showMooshikaSpeech, setShowMooshikaSpeech] = useState(false);
  const [mooshikaSpeechMessage, setMooshikaSpeechMessage] = useState('');
  const [showGaneshaSpeech, setShowGaneshaSpeech] = useState(false);
const [ganeshaSpeechMessage, setGaneshaSpeechMessage] = useState('');

const [showPowerMission, setShowPowerMission] = useState(false);
const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
const [showChoiceButtons, setShowChoiceButtons] = useState(false);

const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
const [showPowerModal, setShowPowerModal] = useState(false);

  
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

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

  // Completion message
  useEffect(() => {
    if (!sceneState || !showMessage) return;
    
    if (sceneState.phase === PHASES.COMPLETE && !sceneState.masteryShown) {
      const timer = setTimeout(() => {
        showMessage(`Amazing work, ${profileName}! You've discovered Mooshika, Modaks, and Ganesha's cosmic belly!`, {
          duration: 8000,
          animation: 'bounce',
          position: 'top-right',
          source: 'scene',
          messageType: 'celebration'
        });
        sceneActions.updateState({ masteryShown: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sceneState?.phase, sceneState?.masteryShown, showMessage]);

  // Auto-glow effect - triggers 20 seconds after phase starts
// Auto-glow effect - triggers 20 seconds after phase starts AND welcomeShown is true
useEffect(() => {
  const glowPhases = [
    PHASES.MOOSHIKA_SEARCH,
    PHASES.MODAKS_UNLOCKED,
    PHASES.ROCK_VISIBLE
  ];
  
  // CRITICAL: Only start timer if welcome modal has been dismissed
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

  // MOOSHIKA SPEECH TRIGGERS
  /*useEffect(() => {
    if (!sceneState) return;
    
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED && sceneState.mooshikaVisible && !showMooshikaSpeech) {
      setMooshikaSpeechMessage("Yay! Collect those golden modaks!");
      setShowMooshikaSpeech(true);
      
      const timer = setTimeout(() => setShowMooshikaSpeech(false), 4000);
      timeoutsRef.current.push(timer);
    }
    
    if (sceneState.phase === PHASES.ROCK_VISIBLE && !showMooshikaSpeech) {
      setMooshikaSpeechMessage("Ganesha looks hungry...");
      setShowMooshikaSpeech(true);
      
      const timer = setTimeout(() => setShowMooshikaSpeech(false), 4000);
      timeoutsRef.current.push(timer);
    }
  }, [sceneState?.phase]);*/

  // CLICK HANDLERS

const handleMoundClick = (moundIndex) => {
  if (progressiveHintRef.current?.hideHint) {
    progressiveHintRef.current.hideHint(); // Closes hint + removes glow
  }    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.MOOSHIKA_SEARCH) return;
    
    hideCoach();
    
    const moundStates = [...(sceneState.moundStates || [0, 0, 0, 0, 0])];
    moundStates[moundIndex - 1] = 1;
    
    if (moundIndex === sceneState.correctMound) {
      console.log('Mooshika found!');
      setShowSparkle('mooshika-found');
      
      const moundPositions = {
        1: { top: '45%', left: '25%' },
        2: { top: '55%', left: '75%' },
        3: { top: '60%', left: '30%' },
        4: { top: '60%', left: '50%' },
        5: { top: '60%', left: '60%' }
      };
      
      const position = moundPositions[moundIndex] || { top: '45%', left: '25%' };
      
      sceneActions.updateState({ 
        mooshikaVisible: true,
        mooshikaFound: true,
        mooshikaPosition: position,
        moundStates,
        phase: PHASES.MOOSHIKA_FOUND,
        moundsVanishing: true,
        progress: { percentage: 20, starsEarned: 2 }
      });
      
      setTimeout(() => {
        setMooshikaSpeechMessage("You found me! I'm Ganesha's vahana!");
        setShowMooshikaSpeech(true);
        
        const hideTimer = setTimeout(() => setShowMooshikaSpeech(false), 4000);
        timeoutsRef.current.push(hideTimer);
      }, 1000);

      safeSetTimeout(() => {
        sceneActions.updateState({ moundsVanished: true });
        
        safeSetTimeout(() => {
          setShowSparkle(null);
          completeSymbolLearning('mooshika', { name: 'Divine Vehicle' });
        }, 1000);
      }, 2000);
    } else {
      setShowSparkle(`mound-${moundIndex}`);
      sceneActions.updateState({ moundStates });
      setTimeout(() => setShowSparkle(null), 1000);
    }
  };

const handleModakClick = (modakIndex) => {
  if (progressiveHintRef.current?.hideHint) {
    progressiveHintRef.current.hideHint();
  }    if (!sceneState.modaksUnlocked) return;
    if (sceneState.modakStates[modakIndex] === 1) return;
    
    hideCoach();
    
    const modakStates = [...sceneState.modakStates];
    modakStates[modakIndex] = 1;
    
    const collectedModaks = [...(sceneState.collectedModaks || [])];
    collectedModaks.push(modakIndex);
    
    setShowSparkle(`modak-${modakIndex}`);
    setTimeout(() => setShowSparkle(null), 1000);
    
    const collectedCount = collectedModaks.length;
    
if (collectedCount === 3) {
  sceneActions.updateState({ 
    modakStates,
    collectedModaks,
    basketFull: true,
    phase: PHASES.ALL_COLLECTED,
    progress: { percentage: 50, starsEarned: 4 }
  });
  
  // Step 1: Trigger symbol learning FIRST (2000ms)
  setTimeout(() => {
    completeSymbolLearning('modak', { name: 'Sacred Sweet' });
  }, 500);
  
  // Step 2: AFTER symbol text appears, show speech (3500ms total)
  {/*setTimeout(() => {
    setMooshikaSpeechMessage("All modaks collected!");
    setShowMooshikaSpeech(true);
    
    const hideTimer = setTimeout(() => {
      setShowMooshikaSpeech(false);
    }, 3000);
    timeoutsRef.current.push(hideTimer);
  }, 3500);*/} // Wait for symbol learning to finish
  
} else {
  sceneActions.updateState({ 
    modakStates,
    collectedModaks,
    phase: PHASES.SOME_COLLECTED,
    progress: { percentage: 30 + (10 * collectedCount) }
  });
}
  };

const handleModakInBasketClick = (modakIndex) => {
  if (progressiveHintRef.current?.hideHint) {
    progressiveHintRef.current.hideHint();
  }    if (!sceneState.rockVisible) return;
    if (sceneState.rockFeedCount >= 3) return;
    
    hideCoach();
    
    const newCollectedModaks = sceneState.collectedModaks.filter(i => i !== modakIndex);
    const newFeedCount = sceneState.rockFeedCount + 1;
    const newBellySize = newFeedCount * 33.33;
    
    setShowSparkle('rock-feeding');
    
    sceneActions.updateState({
      collectedModaks: newCollectedModaks,
      rockFeedCount: newFeedCount,
      rockBellySize: newBellySize,
      phase: PHASES.ROCK_FEEDING,
      progress: { percentage: 60 + (10 * newFeedCount) }
    });
    
    if (newFeedCount >= 3) {
      setTimeout(() => {
        setShowSparkle('belly-transform');
        
        sceneActions.updateState({ 
          rockTransformed: true,
          phase: PHASES.ROCK_TRANSFORMED
        });
        
        setTimeout(() => {
          setShowSparkle(null);
          completeSymbolLearning('belly', { name: 'Cosmic Container' });
        }, 2000);
      }, 1500);
    } else {
      setTimeout(() => setShowSparkle(null), 1500);
    }
  };

  const getNextDiscoveryText = (currentSymbol) => {
  const nextActions = {
    mooshika: '🍬 Discover Modak',
    modak: '🌟 Discover Belly',
    belly: '✨ End Scene'
  };
  return nextActions[currentSymbol] || '➡️ Continue';
};

const completeSymbolLearning = (symbolKey, symbolData) => {
  console.log(`${symbolKey} symbol learned`);
  
  // Step 1: Show big centered symbol + text (3 seconds)
  setShowCenteredSymbol(symbolKey);
  
  setTimeout(() => {
    // Step 2: Hide centered, start fly animation to sidebar
    setShowCenteredSymbol(null);
    setShowSparkle(`${symbolKey}-to-sidebar`);
    
    sceneActions.updateState({
      discoveredSymbols: {
        ...sceneState.discoveredSymbols,
        [symbolKey]: true
      }
    });
    
    setTimeout(() => {
      // Step 3: Symbol in sidebar, clear sparkles
// Step 3: Symbol in sidebar, immediately show power modal
setShowSparkle(null);
setCurrentMissionSymbol(symbolKey);
setShowPowerModal(true);

      // Step 4: Mooshika explains (shortened, 2 lines)
      /*const powerExplanations = {
        mooshika: "You learned about me!\nDivine Guidance unlocked!",
        modak: "You discovered modaks!\nSweet Blessing unlocked!",
        belly: "You found cosmic belly!\nContainer power unlocked!"
      };
      
      setMooshikaSpeechMessage(powerExplanations[symbolKey]);
      setShowMooshikaSpeech(true);
      
      setTimeout(() => {
        // Step 5: Hide speech, show power modal
        setShowMooshikaSpeech(false);
        setCurrentMissionSymbol(symbolKey);
        setShowPowerModal(true);
      }, 4000);*/
      
    }, 2000);
  }, 5000);
};

// HANDLER FUNCTIONS
const handleSaveAnimal = () => {
  setShowChoiceButtons(false);
  setShowPowerMission(true);
};

const handleContinueLearning = () => {
  setShowChoiceButtons(false);
  const symbolKey = currentMissionSymbol;
  
  if (symbolKey === 'mooshika') {
    // Show modaks with sparkles
    setTimeout(() => {
      setShowSparkle('modaks-appearing');
    }, 500);
    
    setTimeout(() => {
      sceneActions.updateState({
        modaksUnlocked: true,
        basketVisible: true,
        phase: PHASES.MODAKS_UNLOCKED
      });
      setTimeout(() => setShowSparkle(null), 2000);
    }, 1500);
    
  } else if (symbolKey === 'modak') {
    sceneActions.updateState({
      rockVisible: true,
      phase: PHASES.ROCK_VISIBLE
    });
    
  } else if (symbolKey === 'belly') {
     showMessage(`Amazing work, ${profileName}! You've discovered Mooshika, Modaks, and Ganesha's cosmic belly!`, {
    duration: 6000,
    animation: 'bounce',
    position: 'top-right',
    source: 'scene',
    messageType: 'celebration'
  });
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: { percentage: 100, starsEarned: 8, completed: true }
    });
    setTimeout(() => setShowSparkle('final-fireworks'), 500);
  }
};

const handleMissionComplete = (symbolKey) => {
  console.log('Mission complete for:', symbolKey);
  setShowPowerMission(false);
  
  // Auto-continue to next phase after mission (same logic as Continue Learning button)
  if (symbolKey === 'mooshika') {
    // Show modaks with sparkles
    setTimeout(() => {
      setShowSparkle('modaks-appearing');
    }, 500);
    
    setTimeout(() => {
      sceneActions.updateState({
        modaksUnlocked: true,
        basketVisible: true,
        phase: PHASES.MODAKS_UNLOCKED
      });
      setTimeout(() => setShowSparkle(null), 2000);
    }, 1500);
    
  } else if (symbolKey === 'modak') {
    sceneActions.updateState({
      rockVisible: true,
      phase: PHASES.ROCK_VISIBLE
    });
    
  } else if (symbolKey === 'belly') {
    // Complete scene
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: { percentage: 100, starsEarned: 8, completed: true }
    });
    setTimeout(() => setShowSparkle('final-fireworks'), 500);
  }
};


const resetScene = () => {
  // Reset to initial state manually
  sceneActions.updateState({
    moundStates: [0, 0, 0, 0, 0],
    correctMound: Math.floor(Math.random() * 5) + 1,
    mooshikaVisible: false,
    mooshikaFound: false,
    mooshikaPosition: { top: '45%', left: '25%' },
    moundsVanished: false,
    moundsVanishing: false,
    
    modakStates: [0, 0, 0],
    modaksUnlocked: false,
    basketVisible: false,
    basketFull: false,
    basketReady: false,
    collectedModaks: [],
    
    rockVisible: false,
    rockFeedCount: 0,
    rockTransformed: false,
    rockBellySize: 0,
    
    phase: PHASES.MOOSHIKA_SEARCH,
    currentFocus: 'mooshika',
    discoveredSymbols: {},
    
    welcomeShown: false,
    showMooshikaText: false,
    showModakText: false,
    showBellyText: false,
    
    currentPopup: null,
    showingCompletionScreen: false,
    
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    }
  });
  
  setShowSparkle(null);
  setShowMooshikaSpeech(false);
  setShowGaneshaSpeech(false);
  setShowHintGlow(false);
  
  // Reset hint system
  if (progressiveHintRef.current?.resetHintSystem) {
    progressiveHintRef.current.resetHintSystem();
  }
};

  // Check if hints should be enabled for current phase
  const shouldEnableHints = () => {
    const disabledPhases = [
      PHASES.COMPLETE,
      PHASES.MOOSHIKA_FOUND,
      PHASES.ALL_COLLECTED,
      PHASES.ROCK_TRANSFORMED
    ];
    return !disabledPhases.includes(sceneState?.phase);
  };

const getHintConfigs = () => [
  {
    id: 'mooshika-hint',
    message: 'Click the mounds!', // Was: 'Look for Mooshika hiding behind...'
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState) => sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.mooshikaFound
  },
  {
    id: 'modak-hint',
    message: 'Click the modaks!', // Was: 'Click the golden modaks to collect them!'
    position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
    condition: (sceneState) => sceneState.modaksUnlocked && sceneState.modakStates?.some(state => state === 0)
  },
  {
    id: 'rock-hint',
    message: 'Click the modaks to feed!', // Was: 'Click the modaks to feed...'
    position: { bottom: '60%', left: '65%', transform: 'translateX(-50%)' },
    condition: (sceneState) => sceneState.rockVisible && !sceneState.rockTransformed && sceneState.rockFeedCount < 3
  }
];

  const getModakImage = (index) => {
    const modakImages = [modak1, modak2, modak3];
    return modakImages[index] || modak1;
  };

  const renderCounter = () => {
    if (!sceneState.modaksUnlocked) return null;
    
    const collectedCount = sceneState?.collectedModaks?.length || 0;
    
    return (
      <div className="modak-counter">
        <div className="counter-icon">
          <img src={modak1} alt="Modak" />
        </div>
        <div className="counter-progress">
          <div 
            className="counter-progress-fill"
            style={{width: `${(collectedCount / 3) * 100}%`}}
          />
        </div>
        <div className="counter-display">{collectedCount}/3</div>
      </div>
    );
  };

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="modak-scene-container">
          <div className="forest-background" style={{ backgroundImage: `url(${forestBackground})` }}>
            {renderCounter()}

            {/* Phase Headers - Always Visible */}
{!showChoiceButtons && !showPowerMission && (
  <>
    {sceneState.phase === PHASES.MOOSHIKA_SEARCH && (
      <div className="phase-header">
        WHERE IS MOOSHIKA? Click the mounds!
      </div>
    )}
    
    {sceneState.phase === PHASES.MODAKS_UNLOCKED && !sceneState.basketFull && (
      <div className="phase-header">
        HELP MOOSHIKA! Click modaks to collect!
      </div>
    )}
    
    {sceneState.phase === PHASES.ROCK_VISIBLE && !sceneState.rockTransformed && (
      <div className="phase-header">
        FEED GANESHA! Click modaks from basket!
      </div>
    )}
  </>
)}

   {/* STORY INTRODUCTION */}
{sceneState.phase === PHASES.MOOSHIKA_SEARCH && !sceneState.welcomeShown && (
  <>
    <div style={{
      position: 'absolute',
      left: '20%',
      top: '50%',
      animation: 'gentle-glow 3s ease-in-out infinite',
      zIndex: 5
    }}>
      <img src={mudMound} alt="Mysterious Mound" style={{width: '70px', opacity: 0.8}} />
    </div>
    
    <div style={{
      position: 'absolute',
      right: '25%',
      top: '45%',
      animation: 'gentle-breathe 4s ease-in-out infinite',
      zIndex: 5
    }}>
      <img src={modak1} alt="Golden Modak" style={{width: '50px', opacity: 0.9}} />
    </div>

    <div style={{
      position: 'absolute',
      top: '35%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '30px 40px',
      borderRadius: '20px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 100,
      maxWidth: '480px'
    }}>
      <div style={{
        fontSize: '26px',
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: '12px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
      }}>
        Help Ganesha Save the Forest!
      </div>
      
      <div style={{
        fontSize: '16px',
        color: '#FF6B6B',
        marginBottom: '15px',
        fontWeight: '600'
      }}>
        3 magical symbols have special powers!
      </div>
      
      <div style={{
        fontSize: '14px',
        color: '#666',
        marginBottom: '25px',
        lineHeight: '1.5'
      }}>
        Discover <strong>Mooshika, Modak & Belly</strong> to unlock their magic and rescue trapped animals
      </div>
      
      <button
        onClick={() => {
          sceneActions.updateState({ welcomeShown: true });
        }}
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
          border: 'none',
          color: 'white',
          padding: '14px 30px',
          fontSize: '18px',
          fontWeight: 'bold',
          borderRadius: '25px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease',
          boxShadow: '0 4px 15px rgba(139, 69, 19, 0.3)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        Start Mission!
      </button>
    </div>
  </>
)}
            
            {/* MUD MOUNDS */}
       {!sceneState.moundsVanished && [1, 2, 3, 4, 5].map((index) => (
  <div 
    className={`mud-mound mound-${index} 
      ${sceneState.moundsVanishing ? 'fade-out' : ''} 
      ${showHintGlow && sceneState.phase === PHASES.MOOSHIKA_SEARCH ? 'hint-glow' : ''}`}
  >

                <ClickableElement
                  id={`mound-${index}`}
                  onClick={() => handleMoundClick(index)}
                  completed={(sceneState.moundStates || [])[index - 1] === 1}
                  zone="mound-zone"
                >
                  <img 
                    src={mudMound}
                    alt={`Mud Mound ${index}`}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      opacity: (sceneState.moundStates || [])[index - 1] === 1 ? 0.7 : 1
                    }}
                  />
                </ClickableElement>
                {showSparkle === `mound-${index}` && (
                  <SparkleAnimation
                    type="firefly"
                    count={10}
                    color="#8B4513"
                    size={8}
                    duration={1000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            ))}

            {/* MOOSHIKA - FREE DRAGGABLE */}
            {sceneState.mooshikaVisible && (
              <FreeDraggableItem
                id="mooshika-companion"
                position={sceneState.mooshikaPosition || { top: '45%', left: '25%' }}
                onPositionChange={(newPosition) => {
                  sceneActions.updateState({
                    mooshikaPosition: newPosition
                  });
                }}
                onDragStart={() => {
                  setShowMooshikaSpeech(false);
                }}
                onDragEnd={() => {
                  setTimeout(() => {
                    setMooshikaSpeechMessage("Wheee! I love exploring!");
                    setShowMooshikaSpeech(true);
                    
                    const hideTimer = setTimeout(() => {
                      setShowMooshikaSpeech(false);
                    }, 3000);
                    timeoutsRef.current.push(hideTimer);
                  }, 500);
                }}
  disabled={showPowerModal || showPowerMission} // ADD THIS LINE
                className="mooshika-container breathing"
                style={{
                  width: '60px',
                  height: '60px'
                }}
                bounds={{ top: 5, left: 5, right: 90, bottom: 90 }}
              >
                <img 
                  src={mooshika}
                  alt="Mooshika - Drag me around!"
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                />
                
                {showSparkle === 'mooshika-found' && (
                  <SparkleAnimation
                    type="magic"
                    count={20}
                    color="#ff69b4"
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}

                {showMooshikaSpeech && (
                  <div className="mooshika-speech-bubble">
                    <div className="speech-content">
                      {mooshikaSpeechMessage}
                    </div>
                    <div className="speech-arrow"></div>
                  </div>
                )}
              </FreeDraggableItem>
            )}

            {/* MODAKS APPEARING SPARKLES */}
{showSparkle === 'modaks-appearing' && (
  <>
    <div style={{ position: 'absolute', top: '45%', left: '70%', width: '80px', height: '80px', zIndex: 11 }}>
      <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
    </div>
    <div style={{ position: 'absolute', top: '45%', left: '30%', width: '80px', height: '80px', zIndex: 11 }}>
      <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
    </div>
    <div style={{ position: 'absolute', top: '55%', left: '75%', width: '80px', height: '80px', zIndex: 11 }}>
      <SparkleAnimation type="magic" count={15} color="#ffd700" size={10} duration={2000} fadeOut={true} area="full" />
    </div>
  </>
)}

            {/* MODAKS */}
           {sceneState.modaksUnlocked && [0, 1, 2].map((index) => {
  if (sceneState.modakStates[index] === 1) return null;
  
  return (
    <div 
      className={`modak modak-${index + 1} 
        ${showHintGlow && sceneState.modaksUnlocked ? 'hint-glow' : ''}`}
    >
                  <ClickableElement
                    id={`modak-${index}`}
                    onClick={() => handleModakClick(index)}
                    completed={false}
                    zone="modak-zone"
                  >
                    <img 
                      src={getModakImage(index)}
                      alt={`Modak ${index + 1}`}
                      style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </ClickableElement>
                  
                  {showSparkle === `modak-${index}` && (
                    <SparkleAnimation
                      type="star"
                      count={15}
                      color="#ffd700"
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              );
            })}

            {/* BASKET */}
            {sceneState.basketVisible && (
              <div className="basket-collection-container">
                <div className="basket-main">
                  <img 
                    src={basket}
                    alt="Collection Basket"
                    style={{ width: '100%', height: '100%' }}
                  />
                  
                  <div className="basket-counter">
                    {sceneState.collectedModaks?.length || 0}/3
                  </div>
                </div>
              </div>
            )}

    {sceneState.collectedModaks?.map((modakIndex, displayIndex) => (
  <div 
    key={`collected-${modakIndex}-${displayIndex}`}
    className={`modak modak-collected-${displayIndex + 1} 
      ${showHintGlow && sceneState.rockVisible ? 'hint-glow' : ''}`}
    style={{
      position: 'absolute',
      width: '64px',
      height: '64px',
      top: `${42 + displayIndex * 3}%`,
      left: `${14 + displayIndex * 2}%`,
      zIndex: 15,
      cursor: sceneState.rockVisible ? 'pointer' : 'default',
      animation: 'modakToBasket 0.8s ease-out'  // ADD THIS
    }}
    onClick={() => {
      if (sceneState.rockVisible && sceneState.rockFeedCount < 3) {
        handleModakInBasketClick(modakIndex);
      }
    }}
  >
    <img 
      src={getModakImage(modakIndex)} 
      alt={`Collected Modak ${modakIndex + 1}`}
      style={{ 
        width: '100%', 
        height: '100%',
        filter: 'brightness(1.1) saturate(1.2)'
      }}
    />
    
    {/* ADD SPARKLES FOR EACH COLLECTED MODAK */}
    <SparkleAnimation
      type="star"
      count={8}
      color="#ffd700"
      size={6}
      duration={1500}
      fadeOut={true}
      area="full"
    />
  </div>
))}

            {/* ROCK/BELLY */}
            {sceneState.rockVisible && (
              <div className="rock-container breathing">
                <ClickableElement
                  id="feeding-rock"
                  onClick={() => {}}
                  completed={sceneState.rockTransformed}
                  zone="rock-zone"
                >
                  <img 
                    src={sceneState.rockTransformed ? belly : rock}
                    alt={sceneState.rockTransformed ? "Ganesha's Belly" : "Sacred Rock"}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      cursor: 'default',
                      transform: `scale(${1 + (sceneState.rockBellySize / 100) * 0.3})`,
                      transition: 'transform 0.8s ease-out'
                    }}
                  />

             <div className="rock-feed-count">
  {sceneState.rockFeedCount || 0}/3
</div>
</ClickableElement>

{/* ADD THIS BLOCK: 
{showGaneshaSpeech && (
  <div className="ganesha-speech-bubble">
    <div className="speech-content ganesha-speech">
      {ganeshaSpeechMessage}
    </div>
    <div className="speech-arrow ganesha-arrow"></div>
  </div>
)}*/}
                
                {(showSparkle === 'rock-feeding' || showSparkle === 'belly-transform') && (
                  <SparkleAnimation
                    type={showSparkle === 'belly-transform' ? 'glitter' : 'magic'}
                    count={25}
                    color={showSparkle === 'belly-transform' ? 'gold' : '#ff6347'}
                    size={12}
                    duration={2000}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* SYMBOL LEARNING SPARKLES */}
            {showSparkle === 'mooshika-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '30%',
                width: '300px',
                height: '200px',
                zIndex: 15,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="stream"
                  count={20}
                  color="#FF69B4"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {showSparkle === 'modak-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '40%',
                right: '25%',
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

            {showSparkle === 'belly-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translateX(-50%)',
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

            {/* ANIMATED SYMBOL TEXT 
            {sceneState.showMooshikaText && (
              <div className="mooshika-text">
                Divine Vehicle
              </div>
            )}

            {sceneState.showModakText && (
              <div className="modak-text">
                Sacred Sweet
              </div>
            )}

            {sceneState.showBellyText && (
              <div className="belly-text">
                Cosmic Container
              </div>
            )}*/}

            <BackToMapButton onNavigate={onNavigate} hideCoach={hideCoach} clearManualCloseTracking={clearManualCloseTracking} />

            {/* COMPLETION TEST BUTTON */}
            <div style={{
              position: 'fixed',
              top: '170px',
              right: '10px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              sceneActions.updateState({
                discoveredSymbols: { mooshika: true, modak: true, belly: true },
                phase: PHASES.COMPLETE,
                completed: true,
                stars: 8,
                progress: { percentage: 100, starsEarned: 8, completed: true }
              });
              setTimeout(() => setShowSparkle('final-fireworks'), 1000);
            }}>
              COMPLETE
            </div>

            {/* START FRESH BUTTON */}
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#FF4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
              border: '2px solid white'
            }} onClick={() => {
              if (confirm('Start this scene from the beginning?')) {
                resetScene();
              }
            }}>
              Start Fresh
            </div>

            {/* PROGRESSIVE HINT SYSTEM with disabled state */}

<ProgressiveHintSystem
  ref={progressiveHintRef}
  sceneId={sceneId}
  sceneState={sceneState}
  hintConfigs={getHintConfigs()}
  characterImage={mooshikaCoach}
  initialDelay={12000}
  hintDisplayTime={10000}
  position="bottom-right"
  iconSize={60}
  zIndex={2000}
  enabled={shouldEnableHints()}
  disabledMessage="Great job!"
  onHintShown={() => setShowHintGlow(true)}  // NEW
  onHintHidden={() => setShowHintGlow(false)} // NEW
/>
          </div>

          {/* FIREWORKS */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              onComplete={() => {
                setShowSparkle(null);
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  GameStateManager.saveGameState('symbol-mountain', 'modak', {
                    completed: true,
                    stars: 8,
                    symbols: { mooshika: true, modak: true, belly: true },
                    phase: 'complete',
                    timestamp: Date.now()
                  });
                  
                  localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_modak`);
                  SimpleSceneManager.clearCurrentScene();
                }
                
                setShowSceneCompletion(true);
              }}
            />
          )}

          {/* SCENE COMPLETION */}
          {showSceneCompletion && (
            <SceneCompletionCelebration
              show={true}
              sceneName="Garden Adventure"
              sceneNumber={1}
              totalScenes={4}
              starsEarned={8}
              totalStars={8}
              discoveredSymbols={['mooshika', 'modak', 'belly']}
              symbolImages={{
                mooshika: symbolMooshikaColored,
                modak: symbolModakColored,
                belly: symbolBellyColored
              }}
              nextSceneName="Pond Discovery"
              sceneId="modak"
              completionData={{
                stars: 8,
                symbols: { mooshika: true, modak: true, belly: true },
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
                
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'modak', {
                    completed: true,
                    stars: 8,
                    symbols: { mooshika: true, modak: true, belly: true }
                  });
                }

                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('symbol-mountain', 'pond', false, false);
                  onNavigate?.('scene-complete-continue');
                }, 100);
              }}
            />
          )}

{/* Centered Symbol Celebration - Faded BG + Symbol + Label + SPARKLES */}
{showCenteredSymbol && (
  <>
    {/* Dark background overlay */}
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(86, 84, 79, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 199,
      animation: 'fadeIn 0.3s ease-out'
    }} />
    
    {/* Symbol + Text + Sparkles */}
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 200,
      textAlign: 'center',
      animation: 'symbolAppear 0.5s ease-out'
    }}>
      {/* Symbol Image */}
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
      
      {/* ADD SPARKLES */}
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
      
      {/* Text Label */}
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

{/* Power Modal - Separate Overlay */}
{showPowerModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 500
  }}>
    <div style={{
      background: 'linear-gradient(135deg, #FFE5B4 0%, #FFCCCB 100%)',
      borderRadius: '25px',
      padding: '40px',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>
      {/* Close button 
      <button 
        onClick={() => setShowPowerModal(false)}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: '35px',
          height: '35px',
          fontSize: '18px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = 'white'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.8)'}
      >
        ✕
      </button>*/}

      <div style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#8B4513', 
        marginBottom: '25px' 
      }}>
        {powerConfig[currentMissionSymbol]?.name} Power Unlocked!
      </div>

      {/* Layout: Text left, Symbol+Buttons right */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px'
      }}>
        {/* Left: Description */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ 
            fontSize: '16px', 
            color: '#666', 
            marginBottom: '15px',
            lineHeight: '1.6'
          }}>
            You can now use this power to help animals in need!
          </div>
          <div style={{
            fontSize: '14px',
            color: '#888',
            fontStyle: 'italic'
          }}>
            Choose your next action:
          </div>
        </div>

        {/* Right: Symbol + Buttons */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px', 
          alignItems: 'center' 
        }}>
          <img 
            src={powerConfig[currentMissionSymbol]?.image}
            alt="power symbol"
            style={{
              width: '100px',
              height: '100px',
              filter: `drop-shadow(0 0 20px ${powerConfig[currentMissionSymbol]?.color})`,
              animation: 'powerPulse 2s ease-in-out infinite',
              marginBottom: '10px'
            }}
          />
          
          <button 
            onClick={() => {
              setShowPowerModal(false);
              handleSaveAnimal();
            }}
            style={{
              background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
              width: '100%',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🐾 Save an Animal
          </button>
          
          <button 
            onClick={() => {
              setShowPowerModal(false);
              handleContinueLearning();
            }}
            style={{
              background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(78,205,196,0.4)',
              width: '100%',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {getNextDiscoveryText(currentMissionSymbol)}
          </button>
        </div>
      </div>
    </div>
  </div>
)}

          {/* Choice Buttons 
{showChoiceButtons && (
  <div style={{
    position: 'fixed',
    bottom: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '20px',
    zIndex: 1000
  }}>
    <button 
      onClick={handleSaveAnimal}
      style={{
        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '30px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(255,107,107,0.4)',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      🐾 Save an Animal
    </button>
    
    <button 
      onClick={handleContinueLearning}
      style={{
        background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '30px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(78,205,196,0.4)',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
  {currentMissionSymbol === 'belly' ? '✨ End Scene' : '➡️ Continue Learning'}
    </button>
  </div>
)}*/}

<SymbolPowerMission
  show={showPowerMission}
  symbolKey={currentMissionSymbol}
  beforeImage={missionImages[currentMissionSymbol]?.before}
  afterImage={missionImages[currentMissionSymbol]?.after}
  powerConfig={powerConfig[currentMissionSymbol]}
  onComplete={handleMissionComplete}
  onCancel={() => {
    setShowPowerMission(false);
    setShowPowerModal(true); // Return to modal after cancel
  }}
/>

          {/* NAVIGATION */}
          <TocaBocaNav
            onHome={() => {
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              if (hideCoach) hideCoach();
              setShowCulturalCelebration(true);
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
            onStartFresh={() => resetScene()}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
              total: 1
            }}
          />

          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
            {...CulturalProgressExtractor.getCulturalProgressData()}
          />

          <SymbolSidebar 
            discoveredSymbols={sceneState.discoveredSymbols || {}}
            onSymbolClick={(symbolId) => {
              console.log(`Sidebar symbol clicked: ${symbolId}`);
            }}
          />
        </div>       
      </MessageManager>
    </InteractionManager>
  );
};

export default NewModakScene;