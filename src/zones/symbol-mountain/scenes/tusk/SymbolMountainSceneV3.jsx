// zones/symbol-mountain/scenes/symbol/SymbolMountainSceneV2.jsx
// 🎵 Complete Musical Mountain Scene with Streamlined Symbol Discovery

import React, { useState, useEffect, useRef } from 'react';
import './SymbolMountainSceneV2.css';

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

  const { showMessage, hideCoach, clearManualCloseTracking } = useGameCoach();
  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'));

  // Local UI states
  const [showSparkle, setShowSparkle] = useState(null);
  const [showHintGlow, setShowHintGlow] = useState(false);
  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [showPowerMission, setShowPowerMission] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

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

  // Auto-glow effect - triggers 20 seconds after welcomeShown
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

  // Helper function for next action text
  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = {
      eyes: '👂 Discover Ears',
      ears: '😏 Discover Tusk',
      tusk: '✨ End Scene'
    };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  // Symbol Learning Flow
  const completeSymbolLearning = (symbolKey, symbolData) => {
    console.log(`${symbolKey} symbol learned - STREAMLINED FLOW`);
    
    setShowCenteredSymbol(symbolKey);
    
    setTimeout(() => {
      setShowCenteredSymbol(null);
      setShowSparkle(`${symbolKey}-to-sidebar`);
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          [symbolKey]: true
        }
      });
      
      setTimeout(() => {
        setShowSparkle(null);
        setCurrentMissionSymbol(symbolKey);
        setShowPowerModal(true);
      }, 2000);
    }, 5000);
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

  // Click handlers
  const handleEyesClick = () => {
    if (sceneState.eyesGameComplete) return;
    
    hideCoach();
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
    
    hideCoach();
    
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
    
    hideCoach();
    
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
      completeSymbolLearning('eyes', { name: 'All-Seeing Musical Wisdom' });
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
      completeSymbolLearning('ears', { name: 'Divine Musical Listening' });
    }, 2000);
  };

  const handleTuskGameComplete = () => {
    sceneActions.updateState({
      ganeshaComplete: true,
      showTuskAssemblyGame: true,
      phase: PHASES.ALL_COMPLETE
    });
    
    setShowSparkle('tusk-complete');
    
    safeSetTimeout(() => {
      setShowSparkle(null);
      completeSymbolLearning('tusk', { name: 'Sacred Musical Assembly' });
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

            {/* STORY INTRODUCTION */}
            {sceneState.phase === PHASES.EYES_GAME && !sceneState.welcomeShown && (
              <>
                    {/* NEW: Dark overlay for the welcome screen */}
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)', // Dark semi-transparent background
      zIndex: 2, // High Z-index to cover the scene
      animation: 'fadeIn 0.3s ease-out'
    }} />

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
                    color: '#8e24aa',
                    marginBottom: '12px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    🎵 Musical Mountain Adventure
                  </div>
                  
                  <div style={{
                    fontSize: '16px',
                    color: '#ff8c00',
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
                    Discover <strong>Eyes, Ears & Tusk</strong> through sacred music to unlock their magic and rescue trapped animals
                  </div>
                  
                  <button
                    onClick={() => {
                      sceneActions.updateState({ welcomeShown: true });
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #8e24aa 0%, #ba68c8 100%)',
                      border: 'none',
                      color: 'white',
                      padding: '14px 30px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      boxShadow: '0 4px 15px rgba(142, 36, 170, 0.3)'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Start Mission! 🎶
                  </button>
                </div>
              </>
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
            {sceneState.welcomeShown && !sceneState.discoveredSymbols?.eyes && ( // <--- ADD sceneState.welcomeShown
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

    {sceneState.welcomeShown && (
              <BackToMapButton onNavigate={onNavigate} hideCoach={hideCoach} clearManualCloseTracking={clearManualCloseTracking} />
            )}

                 {/* PROGRESSIVE HINT SYSTEM with disabled state */}
            {sceneState.welcomeShown && ( // <--- WRAP ENTIRE BLOCK

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
          
          {/* Centered Symbol Celebration */}
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

          {/* Power Modal */}
          {showPowerModal && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 600
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

                    {/* START OF NEW OVERLAY BLOCK for SymbolPowerMission */}
{showPowerMission && (
  // Dark background overlay for SymbolPowerMission
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(3px)',
    zIndex: 499, // Lower than the Power Modal (500) but higher than the scene (e.g. 200)
    animation: 'fadeIn 0.3s ease-out'
  }} />
)}
{/* END OF NEW OVERLAY BLOCK */}


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
                if (clearManualCloseTracking) clearManualCloseTracking();
                if (hideCoach) hideCoach();
                
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