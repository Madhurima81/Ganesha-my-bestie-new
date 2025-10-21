// zones/symbol-mountain/scenes/pond/PondSceneUpgraded.jsx
// Complete feature implementation matching Modak scene

import React, { useState, useEffect, useRef } from 'react';
import './PondScene.css';

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

// Mission images (you need to add these)
import lotusBefore from './assets/images/lotus-before.png';
import lotusAfter from './assets/images/lotus-after.png';
import trunkBefore from './assets/images/trunk-before.png';
import trunkAfter from './assets/images/trunk-after.png';

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

const PondSceneUpgraded = ({
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

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
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
    };
  }, []);

  // Auto-glow effect - triggers 20 seconds after welcomeShown
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

  // Completion message
  /*useEffect(() => {
    if (!sceneState || !showMessage) return;
    
    if (sceneState.phase === PHASES.COMPLETE && !sceneState.masteryShown) {
      const timer = setTimeout(() => {
        showMessage(`Amazing work, ${profileName}! You've discovered the Sacred Lotus and Divine Blessing!`, {
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
  }, [sceneState?.phase, sceneState?.masteryShown, showMessage]);*/

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

  // Symbol Learning Flow - 5 second celebration
  const completeSymbolLearning = (symbolKey, symbolData) => {
    console.log(`${symbolKey} symbol learned - FULL CELEBRATION`);
    
    // Step 1: Show big centered symbol + text (5 seconds)
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
        // Step 3: Symbol in sidebar, show power modal immediately
        setShowSparkle(null);
        setCurrentMissionSymbol(symbolKey);
        setShowPowerModal(true);
      }, 2000);
    }, 5000); // 5 seconds for celebration
  };

  // Get next action text
  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      lotus: '🐘 Discover Trunk',
      trunk: '✨ End Scene'
    };
    return nextActions[currentSymbol] || '➡️ Continue';
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
    // Show golden lotus with sparkles
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
    // Bloom golden lotus
    setShowSparkle('golden-lotus-bloom');
    
    setTimeout(() => {
      sceneActions.updateState({
        goldenLotusBloom: true,
        phase: PHASES.GOLDEN_BLOOM
      });
      setShowSparkle(null);
      
      setTimeout(() => {
        // ✅ STREAMLINED: Go straight to fireworks!
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
      }, 800); // Just 800ms delay - much faster!
    }, 500);
  }
};


  const handleMissionComplete = (symbolKey) => {
  console.log('Mission complete for:', symbolKey);
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
        // ✅ STREAMLINED: Go straight to fireworks!
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
      }, 800); // Just 800ms delay - much faster!
    }, 500);
  }
};

  // Lotus Click Handler
  const handleLotusClick = (index) => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
    if (!sceneState || !sceneActions) return;
    
    hideCoach();

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
      sceneActions.updateState({
        lotusStates,
        phase: PHASES.ALL_BLOOMED,
        currentFocus: 'waiting-for-golden',
        progress: {
          ...sceneState.progress,
          percentage: 30,
          starsEarned: 1
        }
      });
      
      // Trigger symbol learning
      safeSetTimeout(() => {
        completeSymbolLearning('lotus', { name: 'Sacred Purity' });
      }, 1000);
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
              completeSymbolLearning('trunk', { name: 'Divine Blessing' });
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

            {/* Phase Headers - Always Visible */}
            {!showPowerModal && !showPowerMission && sceneState?.welcomeShown && (
              <>
                {(sceneState.phase === PHASES.INITIAL || sceneState.phase === PHASES.SOME_BLOOMED) && 
                 !sceneState.lotusStates?.every(state => state === 1) && (
                  <div className="phase-header">
                    BLOOM THE LOTUSES! Click the flower buds!
                  </div>
                )}
                
                {sceneState.goldenLotusVisible && !sceneState.elephantVisible && (
                  <div className="phase-header">
                    CLICK THE GOLDEN LOTUS!
                  </div>
                )}
                
                {sceneState.elephantVisible && !sceneState.elephantTransformed && (
                  <div className="phase-header">
                    CLICK THE ELEPHANT!
                  </div>
                )}
              </>
            )}

            {/* STORY INTRODUCTION */}
            {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
              <>
                <div style={{
                  position: 'absolute',
                  left: '35%',
                  top: '45%',
                  animation: 'gentle-glow 3s ease-in-out infinite',
                  zIndex: 5
                }}>
                  <img src={lotusClosed} alt="Mysterious Lotus" style={{width: '15%', opacity: 0.8}} />
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
                    color: '#1565C0',
                    marginBottom: '12px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    Ganesha's Sacred Pond
                  </div>
                  
                  <div style={{
                    fontSize: '16px',
                    color: '#4CAF50',
                    marginBottom: '15px',
                    fontWeight: '600'
                  }}>
                    2 magical symbols have special powers!
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '25px',
                    lineHeight: '1.5'
                  }}>
                    Discover <strong>Lotus & Trunk</strong> to unlock their magic and rescue trapped animals
                  </div>
                  
                  <button
                    onClick={() => {
                      sceneActions.updateState({ welcomeShown: true });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '14px 30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 4px 15px rgba(21, 101, 192, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Start Mission!
                  </button>
                </div>
              </>
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

            <BackToMapButton 
              onNavigate={onNavigate}
              hideCoach={hideCoach}
              clearManualCloseTracking={clearManualCloseTracking}
              position="bottom-left"
            />

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
          </div>

          {/* Centered Symbol Celebration */}
          {showCenteredSymbol && (
            <>
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
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

          {/* Power Modal */}
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
                background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                borderRadius: '25px',
                padding: '40px',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                position: 'relative'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#1565C0', 
                  marginBottom: '25px' 
                }}>
                  {powerConfig[currentMissionSymbol]?.name} Power Unlocked!
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '30px'
                }}>
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
                      onClick={handleSaveAnimal}
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
                      onClick={handleContinueLearning}
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
          />

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
        </div>      
      </MessageManager>
    </InteractionManager>
  );
};

export default PondSceneUpgraded;