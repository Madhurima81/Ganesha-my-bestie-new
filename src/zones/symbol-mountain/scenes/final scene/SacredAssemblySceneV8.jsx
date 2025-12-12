// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - V8 DIVINE VERSION
import React, { useState, useEffect, useRef } from 'react';
import './SacredAssemblyScene.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
// import SimpleGameCoach, { SimpleGameCoachConfigs } from '../../../../lib/components/coach/SimpleGameCoach'; // COMMENTED OUT
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.png';

// Images - Ganesha Forms
import ganeshaStone from './assets/images/ganesha-stone.png';
import ganeshaDivine from './assets/images/ganesha-divine.png';

// Images - Symbol Icons
import symbolMooshikaColored from './assets/images/symbol-mooshika-colored.png';
import symbolModakColored from './assets/images/symbol-modak-colored.png';
import symbolBellyColored from './assets/images/symbol-belly-colored.png';
import symbolLotusColored from './assets/images/symbol-lotus-colored.png';
import symbolTrunkColored from './assets/images/symbol-trunk-colored.png';
import symbolEyesColored from './assets/images/symbol-eyes-colored.png';
import symbolEarsColored from './assets/images/symbol-ear-colored.png';
import symbolTuskColored from './assets/images/symbol-tusk-colored.png';

// Coach image (for hints only)
import mooshikaCoach from "../pond/assets/images/mooshika-coach.png";

// Sacred Assembly Game Configuration
const SACRED_SYMBOLS = [
  { 
    id: 'mooshika', 
    name: 'Mooshika', 
    emoji: '🐭', 
    image: symbolMooshikaColored,
    blessing: "Mooshika, Ganesha's divine vehicle awakens! May wisdom guide your every journey, dear child.",
    bodyPart: 'base'
  },
  { 
    id: 'modak', 
    name: 'Modak', 
    emoji: '🍯', 
    image: symbolModakColored,
    blessing: "Ganesha's blessing hand awakens! May sweetness and abundance fill your life.",
    bodyPart: 'left-hand'
  },
  { 
    id: 'belly', 
    name: 'Belly', 
    emoji: '🫄', 
    image: symbolBellyColored,
    blessing: "Ganesha's sacred belly awakens! May you hold the universe's love within you.",
    bodyPart: 'belly'
  },
  { 
    id: 'lotus', 
    name: 'Lotus', 
    emoji: '🪷', 
    image: symbolLotusColored,
    blessing: "Ganesha's wisdom hand comes alive! May purity and enlightenment guide you.",
    bodyPart: 'right-hand'
  },
  { 
    id: 'trunk', 
    name: 'Trunk', 
    emoji: '🐘', 
    image: symbolTrunkColored,
    blessing: "Ganesha's mighty trunk awakens! May all obstacles be removed from your path.",
    bodyPart: 'trunk'
  },
  { 
    id: 'eyes', 
    name: 'Eyes', 
    emoji: '👁️', 
    image: symbolEyesColored,
    blessing: "Ganesha's divine eyes awaken! May you see truth in all things.",
    bodyPart: 'eyes'
  },
  { 
    id: 'ears', 
    name: 'Ears', 
    emoji: '👂', 
    image: symbolEarsColored,
    blessing: "Ganesha's sacred ears come alive! May you listen with wisdom and compassion.",
    bodyPart: 'ears'
  },
  { 
    id: 'tusk', 
    name: 'Tusk', 
    emoji: '🦷', 
    image: symbolTuskColored,
    blessing: "Ganesha's powerful tusk glows! May you break through any challenge with determination.",
    bodyPart: 'tusk'
  }
];

// Individual styling for placed symbols
const PLACED_SYMBOL_CONFIGS = {
  mooshika: { width: 'auto', height: '50px', transform: 'translate(8px, -48px) rotate(0deg) scaleX(-1)', borderRadius: '50%' },
  modak: { width: '50px', height: 'auto', transform: 'translate(18px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '40%' },
  belly: { width: '70px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '50%' },
  lotus: { width: '58px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '45%' },
  trunk: { width: '245px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg)', borderRadius: '30%' },
  eyes: { width: '65px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '60%' },
  ears: { width: '125px', height: 'auto', transform: 'translate(-8px, 18px) rotate(0deg)', borderRadius: '40%' },
  tusk: { width: '35px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '25%' }
};

// DIVINE: Sacred Color Palette
const SACRED_COLOR_PALETTE = {
  primary: '#8A2BE2',           
  secondary: '#FF6B35',         
  accent: '#4ECDC4',            
  divine: '#E6E6FA',            
  glow: 'rgba(138, 43, 226, 0.6)', 
  selection: '#9932CC',         
  highlight: 'rgba(138, 43, 226, 0.3)', 
  aura: 'rgba(230, 230, 250, 0.4)'      
};

// Body part drop zone configurations
const BODY_PART_ZONES = [
  { id: 'eyes', acceptTypes: ['eyes'], position: { top: '30%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '60px' }, hint: 'Divine Sight' },
  { id: 'ears', acceptTypes: ['ears'], position: { top: '25%', left: '65%', width: '80px', height: '80px' }, hint: 'Deep Listening' },
  { id: 'trunk', acceptTypes: ['trunk'], position: { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '120px' }, hint: 'Removing Obstacles' },
  { id: 'tusk', acceptTypes: ['tusk'], position: { top: '40%', right: '40%', width: '60px', height: '80px' }, hint: 'Breaking Barriers' },
  { id: 'left-hand', acceptTypes: ['modak'], position: { top: '35%', left: '20%', width: '80px', height: '80px' }, hint: 'Sweet Blessings' },
  { id: 'right-hand', acceptTypes: ['lotus'], position: { top: '38%', right: '12%', width: '80px', height: '80px' }, hint: 'Pure Wisdom' },
  { id: 'belly', acceptTypes: ['belly'], position: { top: '50%', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '120px' }, hint: 'Universe Within' },
  { id: 'base', acceptTypes: ['mooshika'], position: { bottom: '25%', left: '60%', transform: 'translateX(-50%)', width: '120px', height: '80px' }, hint: 'Divine Vehicle' }
];

// Ganesha transformation states
const GANESHA_STATES = {
  STONE: 'stone',
  AWAKENING: 'awakening', 
  DIVINE: 'divine',
  BLESSED: 'blessed'
};

const SYMBOL_POSITIONS = [
  { top: '38%', left: '25%' },      
  { top: '12%', left: '75%' },     
  { top: '35%', left: '8%' },      
  { top: '20%', left: '86%' },     
  { top: '60%', left: '15%' },     
  { top: '55%', left: '85%' },     
  { bottom: '15%', left: '30%' },  
  { bottom: '20%', left: '70%' }   
];

const SacredAssemblyScene = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'final-scene'
}) => {
  return (
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        placedSymbols: {},           
        ganeshaState: GANESHA_STATES.STONE,
        selectedSymbol: null,        
        highlightedZone: null,       
        placementAnimation: null,    
        currentBlessing: null,
        blessingsHeard: [],
        finalBlessingShown: false,
        phase: 'initial',
        currentFocus: 'assembly',
        discoveredSymbols: {
          mooshika: true, modak: true, belly: true, lotus: true,
          trunk: true, eyes: true, ear: true, tusk: true
        },
        welcomeShown: false,
        assemblyWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        gameCoachState: null,
        lastGameCoachTime: 0,
        isReloadingGameCoach: false,
        currentPopup: null,
        showingCompletionScreen: false,
        showingZoneCompletion: false,
        celebrationActive: false,    
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
        <SacredAssemblyContent
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
  );
};

const SacredAssemblyContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  const [showSparkle, setShowSparkle] = useState(null);
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showZoneCompletion, setShowZoneCompletion] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [isOrbsRunning, setIsOrbsRunning] = useState(false);

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'final-scene', getSceneResetConfig('final-scene'));

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const isGameCoachVisible = sceneState?.gameCoachState || sceneState?.isReloadingGameCoach;

  const selectedSymbol = sceneState?.selectedSymbol ? 
    SACRED_SYMBOLS.find(s => s.id === sceneState.selectedSymbol) : null;
  const highlightedZone = sceneState?.highlightedZone ? 
    BODY_PART_ZONES.find(z => z.id === sceneState.highlightedZone) : null;

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  const handleSymbolClick = (symbol) => {
    if (!sceneState || !sceneActions) return;
    
    if (sceneState.placedSymbols?.[symbol.id]) {
      setShowSparkle(`symbol-placed-${symbol.id}`);
      safeSetTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    const currentSelected = sceneState.selectedSymbol;
    
    if (currentSelected === symbol.id) {
      sceneActions.updateState({
        selectedSymbol: null,
        highlightedZone: null
      });
    } else {
      const matchingZone = BODY_PART_ZONES.find(zone => 
        zone.acceptTypes.includes(symbol.id)
      );
      
      sceneActions.updateState({
        selectedSymbol: symbol.id,
        highlightedZone: matchingZone?.id || null
      });
    }
  };

  const handleDropZoneClick = (zone) => {
    if (!sceneState || !sceneActions) return;
    
    const selectedSymbolId = sceneState.selectedSymbol;
    if (!selectedSymbolId) return;

    if (!zone.acceptTypes.includes(selectedSymbolId)) return;

    handleSymbolPlacement({ 
      id: selectedSymbolId, 
      zone: zone.id,
      data: SACRED_SYMBOLS.find(s => s.id === selectedSymbolId)
    });
  };

  // COMMENTED OUT: Auto-welcome trigger
  /*
  useEffect(() => {
    if (sceneState?.phase === 'initial' && 
        !sceneState?.welcomeShown && 
        !sceneState?.isReloadingGameCoach) {
      
      safeSetTimeout(() => {
        setShowSparkle('divine-light');
        
        safeSetTimeout(() => {
          setShowSparkle(null);
          sceneActions.updateState({ 
            welcomeShown: true,
            phase: 'initial'
          });
        }, 1800);
      }, 500);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);
  */

  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    if (sceneState.showingZoneCompletion || sceneState.celebrationActive) {
      setIsOrbsRunning(true);
      setShowSparkle('final-fireworks');
      setTimeout(() => {
        setShowZoneCompletion(true);
      }, 500);
    }
    else {
      sceneActions.updateState({ isReloadingGameCoach: false });
    }
  }, [isReload]);

  const getGaneshaOpacity = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    if (placedCount === 0) return 0;
    if (placedCount <= 2) return 0.15;
    if (placedCount <= 4) return 0.35;
    if (placedCount <= 6) return 0.6;
    if (placedCount === 7) return 0.85;
    return 1;
  };

  const getGaneshaAwakeningClass = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    if (placedCount === 0) return 'sleeping';
    if (placedCount <= 2) return 'stirring';
    if (placedCount <= 4) return 'awakening';
    if (placedCount <= 6) return 'rising';
    if (placedCount === 7) return 'manifesting';
    return 'divine-radiance';
  };

  const triggerFinalCelebration = () => {
    clearAllTimeouts();

    const profileId = localStorage.getItem('activeProfileId');
    
    sceneActions.updateState({
      currentPopup: 'final_fireworks',
      showingCompletionScreen: true,
      showingZoneCompletion: true,
      celebrationActive: true,
      phase: 'complete',
      stars: 8,
      completed: true,
      selectedSymbol: null,
      highlightedZone: null,
      placementAnimation: null,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
    
    setIsOrbsRunning(true);
    setShowSparkle('final-fireworks');
  };

  const handleSymbolPlacement = ({ id, zone, data }) => {
    if (!sceneState || !sceneActions) return;
    
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    clearAllTimeouts();

    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [id]: true
    };
    
    const placedCount = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((placedCount / 8) * 100);
    
    let newGaneshaState = GANESHA_STATES.STONE;
    if (placedCount >= 6) newGaneshaState = GANESHA_STATES.DIVINE;
    else if (placedCount >= 3) newGaneshaState = GANESHA_STATES.AWAKENING;
    
    sceneActions.updateState({
      placedSymbols: newPlacedSymbols,
      ganeshaState: newGaneshaState,
      selectedSymbol: null,
      highlightedZone: null,
      placementAnimation: null,
      stars: placedCount,
      progress: {
        percentage: percentage,
        starsEarned: placedCount,
        completed: placedCount === 8
      }
    });

    setShowSparkle(`symbol-placed-${id}`);
    safeSetTimeout(() => setShowSparkle(null), 2000);

    if (placedCount === 3) {
      setShowSparkle('divine-light');
      safeSetTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({ 
          readyForWisdom: true,
          phase: 'awakening'
        });
      }, 1800);

    } else if (placedCount === 8) {
      setShowSparkle('divine-light');
      safeSetTimeout(() => {
        setShowSparkle(null);
        triggerFinalCelebration(); // Trigger celebration directly instead of waiting for coach
      }, 1800);
    }
  };

  const getHintConfigs = () => [
    {
      id: 'assembly-hint',
      message: 'Tap a symbol, then tap where it belongs on Ganesha!',
      explicitMessage: 'Select a symbol by tapping it, then tap the glowing area on Ganesha to place it!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        const placedCount = Object.keys(sceneState.placedSymbols || {}).length;
        return placedCount < 8 && !showMagicalCard && !isOrbsRunning && !isGameCoachVisible;
      }
    }
  ];

  if (!sceneState) {
    return <div className="loading">Loading sacred assembly...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="sacred-assembly-container">
          
          {/* OPENING INSTRUCTION SCREEN (Scene 4) */}
          {sceneState.phase === 'initial' && !sceneState.welcomeShown && (
            <div className="assembly-instructions-overlay">
              {/* Sparkles */}
              <div className="assembly-sparkles">
                <div className="assembly-sparkle"></div>
                <div className="assembly-sparkle"></div>
                <div className="assembly-sparkle"></div>
                <div className="assembly-sparkle"></div>
              </div>

              <div className="assembly-instructions-content">
                {/* Character - Left Side */}
                <div className="assembly-instructions-ganesha">
                  <img 
                    src={ganeshaDivine} 
                    alt="Divine Ganesha"
                    style={{maxWidth: '450px'}}
                  />
                </div>
                
                {/* Instruction Card - Right Side */}
                <div className="assembly-instructions-card">
                  <h1 className="assembly-instructions-title">
                    Awaken the Divine Ganesha!
                  </h1>
                  
                  <p className="assembly-instructions-subtitle">
                    You have collected all 8 sacred symbols. Place them correctly to bring Ganesha to life!
                  </p>
                  
                  {/* Icons showing what to find */}
                  <div className="assembly-instructions-icons">
                    <div className="assembly-instruction-icon-item">
                      <img src={symbolEyesColored} alt="Wisdom" />
                      <span className="assembly-instruction-icon-label">Wisdom</span>
                    </div>
                    <div className="assembly-instruction-icon-item">
                      <img src={symbolTrunkColored} alt="Strength" />
                      <span className="assembly-instruction-icon-label">Strength</span>
                    </div>
                    <div className="assembly-instruction-icon-item">
                      <img src={symbolLotusColored} alt="Blessing" />
                      <span className="assembly-instruction-icon-label">Blessing</span>
                    </div>
                  </div>
                  
                  <button
                    className="assembly-instructions-button"
                    onClick={() => {
                      sceneActions.updateState({ welcomeShown: true });
                    }}
                  >
                    Begin Assembly!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SimpleGameCoach COMMENTED OUT 
          <SimpleGameCoach
            config={{...}}
            sceneState={sceneState}
            sceneActions={sceneActions}
            profileName={profileName}
          />
          */}

          {/* Sacred Mountain Background */}
          <div 
            className="sacred-background" 
            style={{ backgroundImage: `url(${sacredBackground})` }}
          >
            {/* Progress Display */}
            <div className="assembly-progress">
              <div className="progress-text">
                <span style={{ fontSize: '16px' }}>🏔️</span>
                {Object.keys(sceneState.placedSymbols || {}).length}/8 symbols
              </div>
              <div 
                className="assembly-progress-fill"
                style={{
                  width: `${(Object.keys(sceneState.placedSymbols || {}).length / 8) * 100}%`
                }}
              />
            </div>

            {/* Ganesha Sacred Form Container */}
            <div className="ganesha-assembly-container" style={{ pointerEvents: 'none' }}>
              {/* Ganesha Progressive Awakening */}
              <div className="ganesha-awakening-container">
                <img 
                  src={ganeshaStone}
                  alt="Ganesha Outline"
                  className="ganesha-outline"
                  style={{
                    opacity: 0.2,
                    filter: 'brightness(1.5) contrast(0.8)'
                  }}
                />
                
                <img 
                  src={ganeshaDivine}
                  alt="Ganesha Divine Form"
                  className={`ganesha-divine ${getGaneshaAwakeningClass()}`}
                  style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    height: '90%',
                    opacity: getGaneshaOpacity(),
                    transition: 'all 1s ease'
                  }}
                />
              </div>

              {/* CLICK-BASED DROP ZONES */}
              {BODY_PART_ZONES.map(zone => {
                const isHighlighted = sceneState.highlightedZone === zone.id;
                const hasSymbol = Object.keys(sceneState.placedSymbols || {}).find(symbolId => {
                  return zone.acceptTypes.includes(symbolId);
                });

                return (
                  <div
                    key={zone.id}
                    data-zone-id={zone.id}
                    className={`click-drop-zone ${isHighlighted ? 'highlighted' : ''} ${hasSymbol ? 'filled' : ''}`}
                    style={{
                      position: 'absolute',
                      ...zone.position,
                      cursor: isHighlighted ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      zIndex: isHighlighted ? 999 : 40,
                      borderRadius: '8px',
                      pointerEvents: 'auto',
                      backgroundColor: isHighlighted ? SACRED_COLOR_PALETTE.highlight : 'transparent',
                      border: isHighlighted ? `3px solid ${SACRED_COLOR_PALETTE.primary}` : '1px solid transparent',
                      minWidth: '60px',
                      minHeight: '60px'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isHighlighted) {
                        handleDropZoneClick(zone);
                      }
                    }}
                  >
                    {isHighlighted && (
                      <div className="zone-highlight-v8">
                        <div className="glow-border-v8"></div>
                        <div className="hint-text-v8">{zone.hint}</div>
                        <div className="tap-here-v8">Tap here!</div>
                      </div>
                    )}
                    
                    {hasSymbol && !sceneState?.masteryShown && (
                      <div className={`placed-symbol-v8 ${sceneState?.masteryShown ? 'fading-out' : ''}`}>
                        <div 
                          className="symbol-aura-v8"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100px',
                            height: '100px',
                            background: `radial-gradient(circle, ${SACRED_COLOR_PALETTE.aura} 0%, transparent 70%)`,
                            borderRadius: '50%',
                            animation: 'divineGlowV8 3s ease-in-out infinite',
                            zIndex: 0,
                            pointerEvents: 'none'
                          }}
                        />
                        <img 
                          src={SACRED_SYMBOLS.find(s => s.id === hasSymbol)?.image}
                          alt="Placed symbol"
                          className={`placed-symbol-img placed-symbol-${hasSymbol}`}
                          data-symbol={hasSymbol}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Placed Symbol Sparkles */}
              {Object.keys(sceneState.placedSymbols || {}).map(symbolId => {
                const zone = BODY_PART_ZONES.find(z => z.acceptTypes.includes(symbolId));
                if (sceneState?.masteryShown) return null;
                
                return (
                  <div
                    key={`sparkle-${symbolId}`}
                    className="placed-symbol-sparkle"
                    style={{
                      position: 'absolute',
                      ...zone.position,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      zIndex: 60
                    }}
                  >
                    <SparkleAnimation
                      type="star"
                      count={8}
                      color={SACRED_COLOR_PALETTE.primary}
                      size={4}
                      duration={3000}
                      fadeOut={false}
                      area="contained"
                      key={`sparkle-${symbolId}-${Date.now()}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* CLICK-BASED FLOATING SYMBOLS */}
            {SACRED_SYMBOLS.map((symbol, index) => {
              const isPlaced = sceneState.placedSymbols?.[symbol.id];
              const isSelected = sceneState.selectedSymbol === symbol.id;
              const isAnimating = sceneState.placementAnimation?.symbolId === symbol.id;
              
              if (isPlaced || isAnimating) return null;

              return (
                <div
                  key={symbol.id}
                  data-symbol-id={symbol.id}
                  className={`click-floating-symbol ${isSelected ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    ...SYMBOL_POSITIONS[index],
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: isSelected ? 100 : 50,
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSymbolClick(symbol);
                  }}
                >
                  <div className={`symbol-container-v8 ${isSelected ? 'pulse-glow-v8' : ''}`}>
                    <img 
                      src={symbol.image} 
                      alt={symbol.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: isSelected ? `3px solid ${SACRED_COLOR_PALETTE.primary}` : '2px solid rgba(255,255,255,0.3)',
                        boxShadow: isSelected 
                          ? `0 0 20px ${SACRED_COLOR_PALETTE.glow}, 0 0 40px ${SACRED_COLOR_PALETTE.glow}` 
                          : '0 4px 8px rgba(0,0,0,0.2)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    {isSelected && (
                      <div className="selection-indicator-v8">
                        <div className="pulse-ring-v8"></div>
                        <div className="tap-instruction-v8">Now tap where it belongs!</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Symbol placement sparkles */}
            {showSparkle?.startsWith('symbol-placed-') && (
              <div className="symbol-placement-sparkles">
                <SparkleAnimation
                  type="star"
                  count={20}
                  color={SACRED_COLOR_PALETTE.primary}
                  size={8}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Divine firefly light */}
            {showSparkle === 'divine-light' && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '200px',
                zIndex: 199,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="glitter"
                  count={80}
                  color={SACRED_COLOR_PALETTE.divine}
                  size={3}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Sacred Orbs Effect */}
            {showSparkle === 'final-fireworks' && (
              <RotatingOrbsEffect
                show={true}
                duration={9000}
                symbolImages={{
                  mooshika: symbolMooshikaColored,
                  modak: symbolModakColored,
                  belly: symbolBellyColored,
                  lotus: symbolLotusColored,
                  trunk: symbolTrunkColored,
                  eyes: symbolEyesColored,
                  ears: symbolEarsColored,
                  tusk: symbolTuskColored
                }}
                ganeshaImage={ganeshaDivine}
                playerName={profileName}
                onComplete={() => {
                  setShowSparkle(null);
                  setIsOrbsRunning(false);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('symbol-mountain', 'final-scene', {
                      completed: true,
                      stars: 8,
                      symbols: { all: true },
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'final-scene', {
                      completed: true,
                      stars: 8,
                      symbols: { all: true }
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_final-scene`);
                    SimpleSceneManager.clearCurrentScene();
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Test buttons */}
            <div style={{
              position: 'fixed',
              top: '40px',
              right: '40px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              clearAllTimeouts();
              setShowSparkle(null);
              setShowMagicalCard(false);
              setShowSceneCompletion(false);
              setIsOrbsRunning(false);
              
              const allPlaced = {};
              SACRED_SYMBOLS.forEach(symbol => {
                allPlaced[symbol.id] = true;
              });
              
              sceneActions.updateState({
                placedSymbols: allPlaced,
                ganeshaState: GANESHA_STATES.DIVINE,
                phase: 'complete',
                completed: true,
                stars: 8,
                selectedSymbol: null,
                highlightedZone: null,
                placementAnimation: null,
                progress: {
                  percentage: 100,
                  starsEarned: 8,
                  completed: true
                },
                welcomeShown: true,
                assemblyWisdomShown: true,
                masteryShown: false,
                readyForWisdom: false,
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              triggerFinalCelebration();
            }}>
              COMPLETE V8
            </div>

            {/* Start Fresh button */}
            <div style={{
              position: 'fixed',
              bottom: '20px',
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
              if (confirm('Start this scene from the beginning? You will lose current progress.')) {
                clearAllTimeouts();
                setShowSparkle(null);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                setShowZoneCompletion(false);
                setIsOrbsRunning(false);
                
                setTimeout(() => {
                  sceneActions.updateState({
                    placedSymbols: {},
                    ganeshaState: GANESHA_STATES.STONE,
                    selectedSymbol: null,
                    highlightedZone: null,
                    placementAnimation: null,
                    phase: 'initial',
                    currentFocus: 'assembly',
                    currentPopup: null,
                    showingCompletionScreen: false,
                    showingZoneCompletion: false,
                    celebrationActive: false,
                    welcomeShown: false,
                    assemblyWisdomShown: false,
                    masteryShown: false,
                    readyForWisdom: false,
                    gameCoachState: null,
                    lastGameCoachTime: 0,
                    isReloadingGameCoach: false,
                    stars: 0,
                    completed: false,
                    progress: {
                      percentage: 0,
                      starsEarned: 0,
                      completed: false
                    }
                  });
                }, 100);
              }
            }}>
              🔄 Start Fresh
            </div>
          </div>

          <BackToMapButton 
            onNavigate={onNavigate}
            position="bottom-left"
          />

          {/* Progressive Hint System */}
          <ProgressiveHintSystem
            ref={progressiveHintRef}
            sceneId={sceneId}
            sceneState={sceneState}
            hintConfigs={getHintConfigs()}
            characterImage={mooshikaCoach}
            initialDelay={10000}
            hintDisplayTime={10000}
            position="bottom-right"
            iconSize={60}
            zIndex={2000}
            onHintShown={(level) => {
              setHintUsed(true);
            }}
            enabled={!isOrbsRunning && !isGameCoachVisible}
          />

          {/* Navigation */}
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
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />

          {/* Scene Completion */}
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Symbol Mountain"
            sceneNumber={4}
            totalScenes={4}
            starsEarned={8}
            totalStars={8}
            discoveredSymbols={Object.keys(sceneState.discoveredSymbols || {})}
            symbolImages={{
              mooshika: symbolMooshikaColored,
              modak: symbolModakColored,
              belly: symbolBellyColored,
              lotus: symbolLotusColored,
              trunk: symbolTrunkColored,
              eyes: symbolEyesColored,
              ear: symbolEarsColored,
              tusk: symbolTuskColored
            }}
            sceneId="final-scene"
            completionData={{
              stars: 8,
              symbols: { 
                mooshika: true, lotus: true, trunk: true, eyes: true,
                ears: true, tusk: true, modak: true, belly: true 
              },
              completed: true,
              totalStars: 8
            }}
            onComplete={onComplete}
            childName={profileName}
            isFinalScene={true}
            hideGanesha={true}
            
            onExploreZones={() => {
              setShowSceneCompletion(false);
              onNavigate?.('zones');
            }}
            onHome={() => {
              setShowSceneCompletion(false);
              onNavigate?.('zone-welcome');
            }}
            onReplay={() => {
              setShowSceneCompletion(false);
              resetScene();
            }}
          />

          {/* Cultural Celebration Modal */}
          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SacredAssemblyScene;