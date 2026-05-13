// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - CLEAN VERSION (No GameCoach)
import React, { useState, useEffect, useRef } from 'react';
import './SacredAssemblyScene.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
// import ProgressManager from '../../../../lib/services/ProgressManager';
// import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';

// Smart Assembly Components
import SmartDropZone from '../../../../lib/components/interactive/SmartDropZone';
import SmartDraggableSymbol from '../../../../lib/components/interactive/SmartDraggableSymbol';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.png';

// Images - Ganesha Forms
import ganeshaStone from './assets/images/ganesha-stone.png';
import ganeshaDivine from './assets/images/ganesha-divine.png';

// Images - Symbol Icons
import symbolMooshikaColored from './assets/images/symbol-mooshika-new.png';
import symbolModakColored from './assets/images/symbol-modak-new.png';
import symbolBellyColored from './assets/images/symbol-belly-new.png';
import symbolLotusColored from './assets/images/symbol-lotus-new.png';
import symbolTrunkColored from './assets/images/symbol-trunk-new.png';
import symbolEyesColored from './assets/images/symbol-eyes-new.png';
import symbolEarsColored from './assets/images/symbol-ears-new.png';
import symbolTuskColored from './assets/images/broken-tusk-symbol.png';

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

// Body part drop zone configurations
const BODY_PART_ZONES = [
  {
    id: 'eyes',
    acceptTypes: ['eyes'],
    position: { top: '30%', left: '40%', transform: 'translateX(-50%)', width: '120px', height: '60px' },
    hint: 'Divine Sight'
  },
  {
    id: 'ears', 
    acceptTypes: ['ears'],
    position: { top: '25%', left: '25%', width: '80px', height: '80px' },
    hint: 'Deep Listening'
  },
  {
    id: 'trunk',
    acceptTypes: ['trunk'], 
    position: { top: '35%', left: '40%', transform: 'translateX(-50%)', width: '100px', height: '120px' },
    hint: 'Removing Obstacles'
  },
  {
    id: 'tusk',
    acceptTypes: ['tusk'],
    position: { top: '40%', right: '40%', width: '60px', height: '80px' },
    hint: 'Breaking Barriers'
  },
  {
    id: 'left-hand',
    acceptTypes: ['modak'],
    position: { top: '35%', left: '20%', width: '80px', height: '80px' },
    hint: 'Sweet Blessings'
  },
  {
    id: 'right-hand', 
    acceptTypes: ['lotus'],
    position: { top: '45%', right: '20%', width: '80px', height: '80px' },
    hint: 'Pure Wisdom'
  },
  {
    id: 'belly',
    acceptTypes: ['belly'],
    position: { top: '50%', left: '40%', transform: 'translateX(-50%)', width: '160px', height: '120px' },
    hint: 'Universe Within'
  },
  {
    id: 'base',
    acceptTypes: ['mooshika'], 
    position: { bottom: '25%', left: '60%', transform: 'translateX(-50%)', width: '120px', height: '80px' },
    hint: 'Divine Vehicle'
  }
];

// Ganesha transformation states
const GANESHA_STATES = {
  STONE: 'stone',
  AWAKENING: 'awakening', 
  DIVINE: 'divine',
  BLESSED: 'blessed'
};

const SYMBOL_POSITIONS = [
  { top: '38%', left: '25%' },      // mooshika
  { top: '12%', left: '75%' },     // modak
  { top: '35%', left: '8%' },      // belly
  { top: '20%', left: '86%' },     // lotus
  { top: '60%', left: '15%' },     // trunk
  { top: '55%', left: '85%' },     // eyes
  { bottom: '15%', left: '30%' },  // ears
  { bottom: '20%', left: '70%' }   // tusk
];

const SacredAssemblyScene = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'final-scene'
}) => {
  console.log('🧹 CLEAN SacredAssemblyScene props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        // Assembly game state
        placedSymbols: {},           // {eyes: true, trunk: true, ...}
        ganeshaState: GANESHA_STATES.STONE,
        currentDragSymbol: null,
        activeMagneticZone: null,
        symbolPositions: {},         // Track floating symbol positions
        
        // Audio/blessing state
        currentBlessing: null,
        blessingsHeard: [],
        finalBlessingShown: false,
        
        // Core game state
        phase: 'initial',
        currentFocus: 'assembly',
        discoveredSymbols: {
          // Start with all symbols from previous scenes
          mooshika: true, modak: true, belly: true, lotus: true,
          trunk: true, eyes: true, ear: true, tusk: true
        },
        
        // Simple reload system
        currentPopup: null,
        showingCompletionScreen: false,
        showingZoneCompletion: false,
        
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
  console.log('🧹 CLEAN SacredAssemblyContent render', { sceneState, isReload });

  // State management
  const [showSparkle, setShowSparkle] = useState(null);
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showZoneCompletion, setShowZoneCompletion] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);

  // DEBUG: Track showSparkle changes
  const setShowSparkleDebug = (value) => {
    console.log(`✨ SPARKLE DEBUG: Changing from "${showSparkle}" to "${value}"`);
    if (value === null && showSparkle === 'final-fireworks') {
      console.error('🚨 SPARKLE DEBUG: Someone is clearing final-fireworks! Stack trace:');
      console.trace();
    }
    setShowSparkle(value);
  };
  
  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Simple reload handling
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 CLEAN ASSEMBLY RELOAD:', {
      currentPopup: sceneState.currentPopup,
      showingZoneCompletion: sceneState.showingZoneCompletion,
      completed: sceneState.completed,
      placedSymbols: Object.keys(sceneState.placedSymbols || {}).length
    });

    // IMPORTANT: Don't clear sparkle state on reload if orbs are running
    console.log('🔄 RELOAD: Current showSparkle state:', showSparkle);
    if (showSparkle === 'final-fireworks') {
      console.log('🔄 RELOAD: Orbs are running - NOT interfering with reload');
      return; // Don't do anything if orbs are running
    }

    // Handle zone completion reload
    if (sceneState.showingZoneCompletion || 
        (sceneState.completed && Object.keys(sceneState.placedSymbols || {}).length === 8)) {
      console.log('🏆 RELOAD: Resuming zone completion');
      setTimeout(() => {
        setShowZoneCompletion(true);
      }, 500);
    }
  }, [isReload, showSparkle]); // Add showSparkle dependency

  // Progressive Ganesha awakening functions
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

  // Handle symbol placement - CORE GAME LOGIC
  const handleSymbolPlacement = ({ id, data }) => {
    if (!sceneState || !sceneActions) return;
    
    console.log(`🎯 CLEAN: Symbol ${id} placed correctly!`);
    
    // Hide active hints
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }

    // Mark symbol as placed
    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [id]: true
    };
    
    // Get symbol info for blessing
    const symbolInfo = SACRED_SYMBOLS.find(s => s.id === id);
    
    // Calculate progress
    const placedCount = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((placedCount / 8) * 100);
    
    console.log(`📊 CLEAN: Progress - ${placedCount}/8 symbols (${percentage}%)`);
    
    // Update Ganesha state based on placed count
    let newGaneshaState = GANESHA_STATES.STONE;
    if (placedCount >= 6) newGaneshaState = GANESHA_STATES.DIVINE;
    else if (placedCount >= 3) newGaneshaState = GANESHA_STATES.AWAKENING;
    
    // Update scene state
    sceneActions.updateState({
      placedSymbols: newPlacedSymbols,
      ganeshaState: newGaneshaState,
      currentDragSymbol: null,
      activeMagneticZone: null,
      stars: placedCount,
      progress: {
        percentage: percentage,
        starsEarned: placedCount,
        completed: placedCount === 8
      }
    });

    // Create dramatic placement sparkles
    setShowSparkleDebug(`symbol-placed-${id}`);
    safeSetTimeout(() => setShowSparkleDebug(null), 3000);

    // Check for completion - ENHANCED DEBUG
    if (placedCount === 8) {
      console.log('🎆 DEBUG: 8th symbol placed!');
      console.log('🎆 DEBUG: placedCount =', placedCount);
      console.log('🎆 DEBUG: newPlacedSymbols =', newPlacedSymbols);
      console.log('🎆 DEBUG: About to set timeout...');
      
      safeSetTimeout(() => {
        console.log('🎆 DEBUG: Inside timeout - setting completion state');
        
        sceneActions.updateState({
          phase: 'complete',
          completed: true
        });
        
        console.log('🎆 DEBUG: State updated, about to call showFinalCelebration');
        
        // DIRECT celebration - NO GameStateManager
        console.log('🌟 DEBUG: Starting sparkle effect directly');
        
        // CHANGE: Call showFinalCelebration() like COMPLETE V2 does
        console.log('🎯 DEBUG: Calling showFinalCelebration() like COMPLETE V2 button');
        showFinalCelebration();
        
      }, 500); // Shorter delay for testing
    }
  };

  // Show final celebration - SIMPLIFIED
  const showFinalCelebration = () => {
    console.log('🎆 CLEAN: showFinalCelebration called');

    // Save completion data - DISABLED TO FIX ERROR
    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      console.log('💾 CLEAN: Skipping save to avoid GameStateManager error');
      // GameStateManager.saveGameState('symbol-mountain', 'final-scene', {
      //   completed: true,
      //   stars: 8,
      //   symbols: { all: true },
      //   phase: 'complete',
      //   timestamp: Date.now()
      // });
      console.log('✅ CLEAN: Would save here without error');
    }
    
    // Set completion state
    sceneActions.updateState({
      currentPopup: 'final_fireworks',
      showingCompletionScreen: true,
      showingZoneCompletion: true,
      phase: 'complete',
      stars: 8,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
    
    // Start orbs effect
    console.log('🌟 CLEAN: Starting RotatingOrbsEffect - FROM showFinalCelebration()');
    setShowSparkleDebug('final-fireworks');
  };

  // Hint system configuration
  const getHintConfigs = () => [
    {
      id: 'assembly-hint',
      message: 'Drag the symbols to the correct parts of Ganesha!',
      explicitMessage: 'Each symbol belongs to a specific part of Ganesha. Try dragging them to see where they fit!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        const placedCount = Object.keys(sceneState.placedSymbols || {}).length;
        return placedCount < 3 && !showMagicalCard && showSparkle !== 'final-fireworks';
      }
    }
  ];

  // Render
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
          
          {/* CLEAN FLOW DEBUG */}
          {console.log('🧹 CLEAN FLOW DEBUG:', {
            placedSymbols: Object.keys(sceneState?.placedSymbols || {}).length,
            phase: sceneState?.phase,
            completed: sceneState?.completed,
            showingZoneCompletion: sceneState?.showingZoneCompletion,
            currentPopup: sceneState?.currentPopup
          })}

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
            <div className="ganesha-assembly-container">
              {/* Ganesha Progressive Awakening */}
              <div className="ganesha-awakening-container">
                {/* Base faint outline */}
                <img 
                  src={ganeshaStone}
                  alt="Ganesha Outline"
                  className="ganesha-outline"
                  style={{
                    opacity: 0.2,
                    filter: 'brightness(1.5) contrast(0.8)'
                  }}
                />
                
                {/* Progressive divine form */}
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

              {/* SMART DROP ZONES */}
              {BODY_PART_ZONES.map(zone => (
                <SmartDropZone
                  key={zone.id}
                  id={zone.id}
                  acceptTypes={zone.acceptTypes}
                  currentDragSymbol={sceneState?.currentDragSymbol}
                  onDrop={handleSymbolPlacement}
                  position={zone.position}
                  hint={zone.hint}
                  className={`${zone.id}-zone`}
                />
              ))}

              {/* Placed Symbol Sparkles */}
              {Object.keys(sceneState.placedSymbols || {}).map(symbolId => {
                const zone = BODY_PART_ZONES.find(z => z.acceptTypes.includes(symbolId));
                
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
                      color="#FFD700"
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

            {/* SMART FLOATING SYMBOLS */}
            {SACRED_SYMBOLS.map((symbol, index) => (
              <SmartDraggableSymbol
                key={symbol.id}
                symbol={symbol}
                position={SYMBOL_POSITIONS[index]}
                isPlaced={sceneState.placedSymbols?.[symbol.id]}
                currentDragSymbol={sceneState?.currentDragSymbol}
                onDragStart={(id) => {
                  console.log(`🚀 CLEAN DRAG START: ${id}`);
                  sceneActions.updateState({ currentDragSymbol: id });
                }}
                onDragEnd={() => {
                  console.log(`🏁 CLEAN DRAG END`);
                  setTimeout(() => {
                    sceneActions.updateState({ 
                      currentDragSymbol: null,
                      activeMagneticZone: null 
                    });
                  }, 150);
                }}
              />
            ))}

            {/* Symbol placement sparkles */}
            {showSparkle?.startsWith('symbol-placed-') && (
              <div className="symbol-placement-sparkles">
                <SparkleAnimation
                  type="star"
                  count={20}
                  color="#FFD700"
                  size={8}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Sacred Orbs Effect - RESTORED */}
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
                  console.log('🎯 CLEAN: Orb effect complete - FROM MANUAL FLOW');
                  setShowSparkleDebug(null);
                  
                  // Save completion data - DISABLED TO FIX ERROR
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    console.log('💾 CLEAN: Skipping ProgressManager save to avoid errors');
                    console.log('✅ CLEAN: Would save here without error');
                  }
                  
                  // Show scene completion
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* COMPARISON: Show state differences between manual and button flows */}
            {console.log('🔍 FLOW COMPARISON DEBUG:', {
              manualFlow: {
                showSparkle: showSparkle,
                phase: sceneState?.phase,
                completed: sceneState?.completed,
                placedSymbolsCount: Object.keys(sceneState?.placedSymbols || {}).length,
                currentPopup: sceneState?.currentPopup
              }
            })}

            {/* COMPLETE V2 button for testing */}
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
              console.log('🧪 COMPLETE V2 BUTTON CLICKED - COMPARE WITH MANUAL FLOW');
              
              // IMPORTANT: Clear all existing timeouts to prevent interference
              console.log('🧹 COMPLETE V2: Clearing all timeouts to prevent sparkle interference');
              timeoutsRef.current.forEach(id => clearTimeout(id));
              timeoutsRef.current = [];
              
              // Mark all symbols as placed
              const allPlaced = {};
              SACRED_SYMBOLS.forEach(symbol => {
                allPlaced[symbol.id] = true;
              });
              
              console.log('🧪 COMPLETE V2: Setting state with allPlaced:', allPlaced);
              
              // Set completion state
              sceneActions.updateState({
                placedSymbols: allPlaced,
                ganeshaState: GANESHA_STATES.DIVINE,
                phase: 'complete',
                completed: true,
                stars: 8,
                progress: {
                  percentage: 100,
                  starsEarned: 8,
                  completed: true
                }
              });
              
              // Clear UI states
              setShowSparkleDebug(null);
              setShowMagicalCard(false);
              setShowSceneCompletion(false);
              
              // Trigger celebration
              setTimeout(() => {
                console.log('🌟 COMPLETE V2: Calling showFinalCelebration()');
                console.log('🔍 COMPLETE V2 STATE BEFORE CELEBRATION:', {
                  placedSymbolsCount: Object.keys(allPlaced).length,
                  phase: 'complete',
                  completed: true,
                  stars: 8
                });
                showFinalCelebration();
              }, 1000);
            }}>
              COMPLETE V2
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
                console.log('🔄 CLEAN EMERGENCY RESTART');
                
                // Clear all UI states
                setShowSparkleDebug(null);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                setShowZoneCompletion(false);
                
                // Reset scene state
                setTimeout(() => {
                  sceneActions.updateState({
                    placedSymbols: {},
                    ganeshaState: GANESHA_STATES.STONE,
                    currentDragSymbol: null,
                    activeMagneticZone: null,
                    phase: 'initial',
                    currentFocus: 'assembly',
                    currentPopup: null,
                    showingCompletionScreen: false,
                    showingZoneCompletion: false,
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

            {/* DEBUG: Clear LocalStorage */}
            <div style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              zIndex: 9999,
              background: '#DC143C',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(220, 20, 60, 0.3)',
              border: '1px solid white',
              opacity: 0.8
            }} onClick={() => {
              console.log('🗑️ DEBUG: Clearing localStorage');
              localStorage.clear();
              sessionStorage.clear();
              console.log('✅ DEBUG: Storage cleared');
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }}>
              🗑️ DEBUG
            </div>
          </div>

          {/* Progressive Hint System */}
          <ProgressiveHintSystem
            ref={progressiveHintRef}
            sceneId={sceneId}
            sceneState={sceneState}
            hintConfigs={getHintConfigs()}
            characterImage={mooshikaCoach}
            initialDelay={30000}
            hintDisplayTime={10000}
            position="bottom-right"
            iconSize={60}
            zIndex={2000}
            onHintShown={(level) => {
              console.log(`CLEAN hint level ${level} shown`);
              setHintUsed(true);
            }}
            enabled={true}
          />

          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              console.log('🏠 CLEAN: Home navigation');
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`📊 CLEAN: Great progress, ${profileName}!`);
              setShowCulturalCelebration(true);
            }}
            onHelp={() => console.log('❓ CLEAN: Show help')}
            onParentMenu={() => console.log('👨‍👩‍👧‍👦 CLEAN: Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('🔊 CLEAN: Toggle audio')}
            onZonesClick={() => {
              console.log('🗺️ CLEAN: Zones navigation');
              setTimeout(() => onNavigate?.('zones'), 100);
            }}
            currentProgress={{
              stars: sceneState.stars || 0,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
          />

          {/* Enhanced Scene Completion */}
          {console.log('🎊 SCENE COMPLETION DEBUG:', {
            showSceneCompletion: showSceneCompletion,
            showSparkle: showSparkle,
            completed: sceneState?.completed
          })}
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
            
            // Final scene button handlers
            onExploreZones={() => {
              console.log('🗺️ CLEAN: Explore other zones');
              setShowSceneCompletion(false);
              onNavigate?.('zones');
            }}
            onHome={() => {
              console.log('🏠 CLEAN: Home from completion');
              setShowSceneCompletion(false);
              onNavigate?.('zone-welcome');
            }}
            onReplay={() => {
              console.log('🔄 CLEAN: Final scene replay');
              setShowSceneCompletion(false);
              const profileId = localStorage.getItem('activeProfileId');
              if (profileId) {
                localStorage.setItem(`play_again_${profileId}_${zoneId}_${sceneId}`, 'true');
              }
              setTimeout(() => {
                window.location.reload();
              }, 100);
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

