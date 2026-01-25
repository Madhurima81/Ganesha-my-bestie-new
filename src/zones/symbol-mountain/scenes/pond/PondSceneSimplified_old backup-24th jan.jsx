// zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV3.jsx
// Complete feature implementation matching Modak scene

import React, { useState, useEffect, useRef } from 'react';
import './PondScene.css';
import '../../../shared/components/OpeningModal.css';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';

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
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import SymbolPowerMission from '../../shared/components/SymbolPowerMission';

// Images
import pondBackground from './assets/images/pond-background.png';
import lotusClosed from './assets/images/lotus-closed.png';
import lotusBloomed from './assets/images/lotus-bloomed.png';
import goldenLotusClosed from './assets/images/golden-lotus-closed.png';
import goldenLotusBloomed from './assets/images/golden-lotus-bloomed.png';
import elephantFull from './assets/images/elephant-full.png';
import waterElephant from './assets/images/water-elephant.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.png';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.png';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.png';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';

// Mission images
import lotusBefore from './assets/images/lotus-before.png';
import lotusAfter from './assets/images/lotus-after.png';
import trunkBefore from './assets/images/trunk-before.png';
import trunkAfter from './assets/images/trunk-after.png';
import ganeshaCharacter from './assets/images/ganesha-character.png'; // Added import

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

  const [showSparkle, setShowSparkle] = useState(null);
  const [showHintGlow, setShowHintGlow] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerMission, setShowPowerMission] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);

  // Discovery overlay states
const [discoveryStep, setDiscoveryStep] = useState('hidden');
const [isDiscoveryFading, setIsDiscoveryFading] = useState(false);
const [discoveryItem, setDiscoveryItem] = useState(null);

// Resume popup states
const [showResumePopup, setShowResumePopup] = useState(false);
const [resumeMessage, setResumeMessage] = useState('');

// Discovery overlay states
const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false);
const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false);

// Resume popup timeout ref
const resumePopupTimeoutRef = useRef(null);

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const reloadHandledRef = useRef(false);
  const activeDropsRef = useRef(new Set());
  const MAX_WATER_DROPS = 15;

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
    activeDropsRef.current.clear();
    reloadHandledRef.current = false;
  };
}, []);

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

  // Reload continuation - prevents freezing
/*useEffect(() => {
  if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) {
    return;
  }

  console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.phase);
  reloadHandledRef.current = true;

  const shouldShowLotusModal = 
    sceneState.phase === PHASES.ALL_BLOOMED;

  const shouldShowTrunkModal = 
    sceneState.phase === PHASES.ELEPHANT_TRANSFORMED;

  if (shouldShowLotusModal) {
    setTimeout(() => {
      setCurrentMissionSymbol('lotus');
      setShowPowerModal(true);
    }, 500);
  } 
  else if (shouldShowTrunkModal) {
    setTimeout(() => {
      setCurrentMissionSymbol('trunk');
      setShowPowerModal(true);
    }, 500);
  }
  else if (sceneState.phase === PHASES.INITIAL || sceneState.phase === PHASES.SOME_BLOOMED) {
    const bloomed = sceneState.lotusStates?.filter(s => s === 1).length || 0;
    setResumeMessage(`Continue blooming lotuses! You have ${bloomed}/3 bloomed!`);
    setShowResumePopup(true);
    setTimeout(() => setShowResumePopup(false), 5000);
  }
  else if (sceneState.phase === PHASES.ELEPHANT_VISIBLE) {
    setResumeMessage("Click the elephant's trunk to spray water!");
    setShowResumePopup(true);
    setTimeout(() => setShowResumePopup(false), 5000);
  }
  else if (sceneState.phase === PHASES.COMPLETE) {
    if (!sceneState.showingCompletionScreen) {
      setTimeout(() => {
        setShowSceneCompletion(true);
      }, 500);
    }
  }

}, [isReload, sceneState.phase, sceneState.welcomeShown]);*/

// ==================== RELOAD HANDLING ====================
useEffect(() => {
  if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) {
    return;
  }

  console.log('🔄 RELOAD DETECTED - Resuming from phase:', sceneState.phase);
  reloadHandledRef.current = true;

  // ============================================
  // DISCOVERY PHASES - SHOW OVERLAYS AGAIN
  // ============================================
  
  // Discovery 1: Golden Lotus Found
  if (sceneState.phase === PHASES.ALL_BLOOMED) {
    console.log('📌 Reload during Discovery 1 - Showing overlay again');
    
    // Update sidebar
    sceneActions.updateState({
      discoveredSymbols: {
        ...sceneState.discoveredSymbols,
        lotus: true
      }
    });
    
    // Show Discovery Overlay 1 again
    setTimeout(() => {
      setShowDiscoveryFlip1(true);
    }, 500);
    
    return;
  }
  
  // Discovery 2: Elephant Trunk Magic
  if (sceneState.phase === PHASES.ELEPHANT_TRANSFORMED) {
    console.log('📌 Reload during Discovery 2 - Showing overlay again');
    
    // Update sidebar - both symbols
    sceneActions.updateState({
      discoveredSymbols: {
        lotus: true,
        trunk: true
      }
    });
    
    // Show Discovery Overlay 2 again
    setTimeout(() => {
      setShowDiscoveryFlip2(true);
    }, 500);
    
    return;
  }
  
  // ============================================
  // GAMEPLAY PHASES - SHOW RESUME POPUPS
  // ============================================
  
  // Lotus Blooming Phase
  if (sceneState.phase === PHASES.INITIAL || sceneState.phase === PHASES.SOME_BLOOMED) {
    console.log('📌 Reload during lotus blooming - Showing resume popup');
    
    const bloomed = sceneState.lotusStates?.filter(s => s === 1).length || 0;
    
    setResumeMessage(`Continue blooming lotuses! You have ${bloomed}/3 bloomed!`);
    setShowResumePopup(true);
    
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
    resumePopupTimeoutRef.current = setTimeout(() => {
      setShowResumePopup(false);
    }, 5000);
    
    return;
  }
  
  // Golden Lotus / Elephant Phase
  if (sceneState.phase === PHASES.GOLDEN_VISIBLE || 
      sceneState.phase === PHASES.ELEPHANT_VISIBLE) {
    console.log('📌 Reload during elephant phase - Showing resume popup');
    
    // Update sidebar
    sceneActions.updateState({
      discoveredSymbols: {
        ...sceneState.discoveredSymbols,
        lotus: true
      }
    });
    
    setResumeMessage("Click the elephant's trunk to spray water!");
    setShowResumePopup(true);
    
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
    resumePopupTimeoutRef.current = setTimeout(() => {
      setShowResumePopup(false);
    }, 5000);
    
    return;
  }
  
  // ============================================
  // COMPLETION PHASE
  // ============================================
  
  if (sceneState.phase === PHASES.COMPLETE) {
    console.log('📌 Reload at completion - Showing completion screen');
    
    // Update sidebar - all symbols
    sceneActions.updateState({
      discoveredSymbols: {
        lotus: true,
        trunk: true
      }
    });
    
    if (!sceneState.showingCompletionScreen) {
      setTimeout(() => {
        setShowSceneCompletion(true);
      }, 500);
    }
    
    return;
  }

}, [isReload, sceneState.phase, sceneState.welcomeShown]);

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

// ❌ DELETE THIS ENTIRE FUNCTION
/*
const triggerDiscoverySequence = (symbolKey, delay = 0) => {
  setTimeout(() => {
    // Show centered symbol first
    setShowCenteredSymbol(symbolKey);
    setDiscoveryStep('entering');
    
    // Then fade and show power modal
    setTimeout(() => {
      setDiscoveryStep('fading');
      setIsDiscoveryFading(true);
      
      setTimeout(() => {
        setShowCenteredSymbol(null);
        setDiscoveryStep('hidden');
        setIsDiscoveryFading(false);
        setCurrentMissionSymbol(symbolKey);
        setShowPowerModal(true);
      }, 800);
    }, 3000);
  }, delay);
};
*/

  // Symbol Learning Flow
// ❌ DELETE THIS ENTIRE FUNCTION
/*
const completeSymbolLearning = (symbolKey, symbolData) => {
  console.log(`${symbolKey} symbol learned`);
  
  sceneActions.updateState({
    discoveredSymbols: {
      ...sceneState.discoveredSymbols,
      [symbolKey]: true
    }
  });
  
  setShowSparkle(`${symbolKey}-to-sidebar`);
  
  setTimeout(() => {
    setShowSparkle(null);
    setCurrentMissionSymbol(symbolKey);
    setShowPowerModal(true);
  }, 800);
};
*/

  // Helper functions
  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      lotus: '🐘 Discover Trunk',
      trunk: '✨ End Scene'
    };
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
      setTimeout(() => {
        setShowSparkle('all-lotuses');
      }, 500);
      
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
            progress: {
              percentage: 100,
              starsEarned: 5,
              completed: true
            }
          });
          setTimeout(() => setShowSparkle('final-fireworks'), 500);
        }, 800);
      }, 500);
    }
  };

  const handleMissionComplete = (symbolKey) => {
    setShowPowerMission(false);
    
    if (symbolKey === 'lotus') {
      setTimeout(() => {
        setShowSparkle('all-lotuses');
      }, 500);
      
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
            progress: {
              percentage: 100,
              starsEarned: 5,
              completed: true
            }
          });
          setTimeout(() => setShowSparkle('final-fireworks'), 500);
        }, 800);
      }, 500);
    }
  };

  // Lotus Click Handler
  const handleLotusClick = (index) => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    // Smart resume dismiss
  if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }
    if (!sceneState || !sceneActions) return;
    

    if (!sceneState.welcomeShown) {
      sceneActions.updateState({ welcomeShown: true });
    }
    
    const lotusStates = [...(sceneState.lotusStates || [0, 0, 0])];
    
    if (lotusStates[index] === 1) {
      setShowSparkle(`lotus-${index}`);
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }
    
    lotusStates[index] = 1;
    
    setShowSparkle(`lotus-${index}`);
    setTimeout(() => setShowSparkle(null), 1500);
    
    const bloomedCount = lotusStates.filter(s => s === 1).length;
    
if (bloomedCount === 3) {
  // Show 3/3 in header first
  sceneActions.updateState({ 
    lotusStates,
    phase: PHASES.SOME_BLOOMED,
    progress: { percentage: 50, starsEarned: 4 }
  });
  
  // Then mark all bloomed
  setTimeout(() => {
    sceneActions.updateState({
      allLotusBloom: true,
      phase: PHASES.ALL_BLOOMED
    });
    
    // ✅ NEW: Trigger Discovery 1
    setTimeout(() => {
      setShowDiscoveryFlip1(true);
    }, 1500);
    
  }, 1000);
 // ⬅️ Give 1 second to see 3/3

    } else {
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.SOME_BLOOMED,
        progress: {
          ...sceneState.progress,
          percentage: 10 * bloomedCount
        }
      });
    }
  };

  // Golden Lotus Click Handler
  const handleGoldenLotusClick = () => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    if (!sceneState || !sceneActions) return;
    
    if (sceneState.goldenLotusBloom) {
      setShowSparkle('golden-lotus-bloom');
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }
    
    if (sceneState.elephantVisible) {
      setShowSparkle('golden-lotus-clicked');
      setTimeout(() => setShowSparkle(null), 1500);
      return;
    }
    
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

  // Elephant Click Handler
  const handleElephantClick = () => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    // Smart resume dismiss
  if (showResumePopup) {
    setShowResumePopup(false);
    if (resumePopupTimeoutRef.current) {
      clearTimeout(resumePopupTimeoutRef.current);
    }
  }
    if (!sceneState || !sceneActions || sceneState.elephantTransformed) return;
    
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
        
        createWaterDrop();
        dropCount++;
        
        const waterInterval = setInterval(() => {
          if (dropCount >= maxDrops) {
            clearInterval(waterInterval);
            
            safeSetTimeout(() => {
              sceneActions.updateState({ trunkActive: false });
              setShowSparkle(null);
// ❌ COMMENT OUT OLD
// triggerDiscoverySequence('trunk', 2000);

// ✅ ADD NEW - Trigger Discovery 2
setTimeout(() => {
  setShowDiscoveryFlip2(true);
}, 2000);

}, 1000);
            return;
          }
          
          createWaterDrop();
          dropCount++;
        }, 150);
        
        timeoutsRef.current.push(waterInterval);
      }, 1000);
    }
  };

  // Check if hints should be enabled
  const shouldEnableHints = () => {
    const disabledPhases = [
      PHASES.COMPLETE,
      PHASES.GOLDEN_BLOOM
    ];
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'lotus-hint',
      message: 'Click the lotus flowers!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => {
        if (!sceneState) return false;
        if (sceneState.phase !== PHASES.INITIAL && 
            sceneState.phase !== PHASES.SOME_BLOOMED) return false;
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
          <div
            className="counter-progress-fill"
            style={{width: `${(bloomCount / 3) * 100}%`}}
          />
        </div>
        <div className="counter-display">{bloomCount}/3</div>
      </div>
    );
  };

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="pond-scene-container">
          <div className="pond-background" style={{ backgroundImage: `url(${pondBackground})` }}>
            {renderCounter()}

      {/* Phase Headers */}
{!showPowerModal && !showPowerMission && sceneState.welcomeShown && (
  <>
    {/* Lotus Blooming Header */}
    {(sceneState.phase === PHASES.INITIAL || sceneState.phase === PHASES.SOME_BLOOMED) && (
      <div className="pond-game-phase-header">
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>
          BLOOM THE LOTUSES! Click to open them!
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '200px',
            height: '20px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '10px',
            border: '2px solid #8B4513',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((sceneState.lotusStates?.filter(s => s === 1).length || 0) / 3) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4ECDC4, #FFD700)',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            {sceneState.lotusStates?.filter(s => s === 1).length || 0}/3
          </div>
        </div>
      </div>
    )}

              {sceneState.goldenLotusVisible && !sceneState.elephantVisible && (
                  <div className="pond-game-phase-header">
                    CLICK THE GOLDEN LOTUS!
                  </div>
                )}

    {/* Elephant Spraying Header */}
    {sceneState.phase === PHASES.ELEPHANT_VISIBLE && (
      <div className="pond-game-phase-header">
        HELP THE ELEPHANT! Click trunk to spray water!
      </div>
    )}
  </>
)}

            {/* OPENING INSTRUCTION SCREEN (Updated) */}
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
              <div className="pond-instructions-overlay">
                {/* Sparkles */}
                <div className="pond-sparkles">
                  <div className="pond-sparkle"></div>
                  <div className="pond-sparkle"></div>
                  <div className="pond-sparkle"></div>
                  <div className="pond-sparkle"></div>
                </div>

                <div className="pond-instructions-content">
                  {/* Character - Left Side */}
                  <div className="pond-instructions-ganesha">
                    <img 
                      src={ganeshaCharacter} 
                      alt="Character"
                      style={{maxWidth: '450px'}}
                    />
                  </div>
                  
                  {/* Instruction Card - Right Side */}
                  <div className="pond-instructions-card">
                    <h1 className="pond-instructions-title">
                      Explore the Sacred Pond!
                    </h1>
                    
                    <p className="pond-instructions-subtitle">
                      2 magical symbols are hidden here!
                    </p>
                    
                    {/* Icons showing what to find */}
                    <div className="pond-instructions-icons">
                      <div className="pond-instruction-icon-item">
                        <img src={symbolLotusColored} alt="Lotus" />
                        <span className="pond-instruction-icon-label">Lotus</span>
                      </div>
                      <div className="pond-instruction-icon-item">
                        <img src={symbolTrunkColored} alt="Trunk" />
                        <span className="pond-instruction-icon-label">Trunk</span>
                      </div>
                    </div>
                    
                    <button
                      className="pond-instructions-button"
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

            {/* Lotus flowers */}
            {[0, 1, 2].map((index) => (
              <div 
                key={index} 
                className={`lotus lotus-${index + 1} 
                  ${showHintGlow && sceneState.lotusStates?.[index] === 0 ? 'hint-glow' : ''}`}
              >
                <ClickableElement
                  id={`lotus-${index}`}
                  onClick={() => handleLotusClick(index)}
                  completed={(sceneState.lotusStates || [])[index] === 1}
                  zone="pond-zone"
                  data-element={`lotus-${index + 1}`}
                >
                  <img
                    src={getLotusImage(index)}
                    alt={`Lotus ${index + 1}`}
                    style={{ width: '100%', height: '100%' }}
                  />
                </ClickableElement>
                {showSparkle === `lotus-${index}` && (
                  <SparkleAnimation
                    type="star"
                    count={15}
                    color="#ff9ebd"
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            ))}

            {/* All lotuses sparkle */}
            {showSparkle === 'all-lotuses' && (
              <div className="all-lotuses-sparkle">
                <SparkleAnimation
                  type="magic"
                  count={20}
                  color="lightblue"
                  size={10}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Golden lotus */}
            {sceneState.goldenLotusVisible && (
              <div className={`golden-lotus-container 
                ${sceneState.goldenLotusBloom ? 'blooming' : ''} 
                ${showHintGlow && !sceneState.goldenLotusBloom && !sceneState.elephantVisible ? 'hint-glow' : ''}`}
              >
                <ClickableElement
                  id="golden-lotus"
                  onClick={handleGoldenLotusClick}
                  completed={sceneState.goldenLotusBloom}
                  zone="golden-zone"
                >
                  <img
                    src={sceneState.goldenLotusBloom ? goldenLotusBloomed : goldenLotusClosed}
                    alt="Golden Lotus"
                    style={{ width: '100%', height: '100%' }}
                  />
                </ClickableElement>
                {(showSparkle === 'golden-lotus' ||
                  showSparkle === 'golden-lotus-clicked' ||
                  showSparkle === 'golden-lotus-bloom') && (
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
                className={`elephant-partial 
                  ${sceneState.elephantTransformed ? 'elephant-position-locked' : ''}
                  ${showHintGlow && !sceneState.elephantTransformed ? 'hint-glow' : ''}`}
                id="elephant-container"
              >
                <ClickableElement
                  id="elephant"
                  onClick={handleElephantClick}
                  completed={sceneState.elephantTransformed}
                  zone="elephant-zone"
                >
                  <img
                    src={sceneState.elephantTransformed ? waterElephant : elephantFull}
                    alt="Elephant"
                    style={{ width: '100%', height: '100%' }}
                  />
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
                  animation: `fixedWaterArc var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                  animationFillMode: 'forwards'
                }}
              >
                💧
              </div>
            ))}

            {/* Symbol Learning Sparkles */}
            {showSparkle === 'lotus-to-sidebar' && (
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
                  color="#4ECDC4"
                  size={10}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {showSparkle === 'trunk-to-sidebar' && (
              <div style={{
                position: 'absolute',
                top: '60%',
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


            {/* PROGRESSIVE HINT SYSTEM with disabled state */}
            {sceneState.welcomeShown && (
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
                onHintShown={() => setShowHintGlow(true)}
                onHintHidden={() => setShowHintGlow(false)}
              />
            )}
          </div>

          {/* Centered Symbol Celebration 
          {showCenteredSymbol && (
            <>
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(86, 84, 79, 0.7)',
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

          {/* Discovery Overlay 
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
            ? 'pond-game-powerPulse 2s infinite' 
            : 'pond-game-heroFloat 3s infinite ease-in-out',
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

          {/* Power Modal (Updated to match Modak style) 
          {showPowerModal && (
            <div className="pond-power-overlay">
              <div className="pond-power-card">
                <h1 className="pond-power-title">
                  {powerConfig[currentMissionSymbol]?.name} Power Unlocked!
                </h1>

                <img 
                  src={powerConfig[currentMissionSymbol]?.image}
                  alt="power symbol"
                  className="pond-power-icon"
                />

                <p className="pond-power-description">
                  {getPowerDescription(currentMissionSymbol)}
                </p>

                {/* Primary Action - Save an Animal 
                <button 
                  className="pond-power-primary-button"
                  onClick={() => {
                    setShowPowerModal(false);
                    handleSaveAnimal();
                  }}
                >
                  Save an Animal
                </button>

                {/* Secondary Actions 
                <div className="pond-power-secondary-buttons">
                  <button 
                    className="pond-power-secondary-button"
                    onClick={() => {
                      console.log(`🔄 Play Again: Restarting ${currentMissionSymbol} discovery`);
                      setShowPowerModal(false);
                      
                      // Reset to the appropriate phase for the current symbol
                      if (currentMissionSymbol === 'lotus') {
                        sceneActions.updateState({ 
                          phase: PHASES.INITIAL,
                          lotusStates: [0, 0, 0],
                          goldenLotusVisible: false,
                          goldenLotusBloom: false
                        });
                      } else if (currentMissionSymbol === 'trunk') {
                        sceneActions.updateState({ 
                          phase: PHASES.GOLDEN_VISIBLE,
                          lotusStates: [1, 1, 1],
                          goldenLotusVisible: true,
                          goldenLotusBloom: false,
                          elephantVisible: false,
                          elephantTransformed: false,
                          trunkActive: false,
                          waterDrops: [],
                          currentFocus: 'lotus'
                        });
                      }
                    }}
                  >
                    Play Again
                  </button>
                  
                  <button 
                    className="pond-power-secondary-button"
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

          {/* Fireworks */}
          {showSparkle === 'final-fireworks' && (
            <Fireworks
              show={true}
              duration={4000}
              count={15}
              colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
              onComplete={() => {
                setShowSparkle(null);
                
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
              }}
            />
          )}

          {/* ==================== DISCOVERY 1: GOLDEN LOTUS (Positivity Power) ==================== */}
{showDiscoveryFlip1 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery Moment
    celebrationTitle="You Found the Golden Lotus!"
    celebrationText="It has something magical to share!"
    celebrationImage={goldenLotusClosed}
    
    // STAGE 2: Positivity Power Reveal
    powerTitle="Positivity Power Unlocked!"
    powerText="Just like a lotus stays clean in muddy water… you can stay bright and happy even on messy days!"
    powerIcon={symbolLotusColored}
    
    buttonText="Ready to Bloom!"
    onComplete={() => {
      console.log("Discovery 1: Golden Lotus discovered!");
      setShowDiscoveryFlip1(false);
      
      // Update sidebar + make golden lotus visible
      sceneActions.updateState({ 
        phase: PHASES.GOLDEN_VISIBLE,
        goldenLotusVisible: true,
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          lotus: true
        }
      });
    }}
    
    showSparkles={true}
  />
)}

{/* ==================== DISCOVERY 2: ELEPHANT TRUNK (Power Switch) ==================== */}
{showDiscoveryFlip2 && (
  <SimpleDiscoveryOverlay
    // STAGE 1: Discovery Moment
    celebrationTitle="You Found the Elephant's Trunk Magic!"
    celebrationText="It wants to share its secret with you!"
    celebrationImage={waterElephant}
    
    // STAGE 2: Power Switch Reveal
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
  
  // ✅ Trigger fireworks FIRST
  setShowSparkle('final-fireworks');
  
  // Completion screen shows AFTER fireworks onComplete
  // (Don't set it here - let Fireworks component handle it)
}}
    
    showSparkles={true}
  />
)}

          {/* Scene Completion */}
          {showSceneCompletion && (
            <SceneCompletionCelebration
              show={true}
              sceneName="Pond Adventure"
              sceneNumber={2}
              totalScenes={4}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['mooshika', 'modak', 'belly', 'lotus', 'trunk'].filter(symbol =>
                sceneState.discoveredSymbols?.[symbol]
              )}
              symbolImages={{
                mooshika: symbolMooshikaColored,
                modak: symbolModakColored,
                belly: symbolBellyColored,
                lotus: symbolLotusColored,
                trunk: symbolTrunkColored
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

          
     {sceneState.welcomeShown && !showSceneCompletion && (
  <BackToMapButton onNavigate={onNavigate} />
)}

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
              completed: sceneState.phase === PHASES.COMPLETE ? 1 : 0,
              total: 1
            }}
          />

          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
          />

           {sceneState.welcomeShown && (
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
  );
};

export default PondSceneSimplifiedV3;