// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SacredAssemblyScene.css';

// Import scene management components (same as pond scene)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components (reuse from pond)
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// NEW: Sacred Assembly Components
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.png';

// Images - Ganesha Forms (from earlier images you showed)
import ganeshaStone from './assets/images/ganesha-stone.png';
//import ganeshaAwakening from './assets/images/ganesha-awakening.png'; // Optional middle state
import ganeshaDivine from './assets/images/ganesha-divine.png';

// Images - Symbol Icons (your existing shared symbols)
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-colored.svg';
import symbolModakColored from '../../shared/images/icons/symbol-modak-colored.svg';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-colored.svg';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-colored.png';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-colored.png';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-colored.png';
import symbolEarsColored from '../../shared/images/icons/symbol-ear-colored.png';
import symbolTuskColored from '../../shared/images/icons/symbol-tusk-colored.png';

// Coach image (reuse from pond)
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
    position: { top: '15%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '60px' },
    hint: 'Divine Sight'
  },
  {
    id: 'ears', 
    acceptTypes: ['ears'],
    position: { top: '12%', left: '15%', width: '80px', height: '80px' },
    hint: 'Deep Listening'
  },
  {
    id: 'trunk',
    acceptTypes: ['trunk'], 
    position: { top: '25%', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '120px' },
    hint: 'Removing Obstacles'
  },
  {
    id: 'tusk',
    acceptTypes: ['tusk'],
    position: { top: '20%', right: '20%', width: '60px', height: '80px' },
    hint: 'Breaking Barriers'
  },
  {
    id: 'left-hand',
    acceptTypes: ['modak'],
    position: { top: '35%', left: '10%', width: '80px', height: '80px' },
    hint: 'Sweet Blessings'
  },
  {
    id: 'right-hand', 
    acceptTypes: ['lotus'],
    position: { top: '35%', right: '10%', width: '80px', height: '80px' },
    hint: 'Pure Wisdom'
  },
  {
    id: 'belly',
    acceptTypes: ['belly'],
    position: { top: '50%', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '120px' },
    hint: 'Universe Within'
  },
  {
    id: 'base',
    acceptTypes: ['mooshika'], 
    position: { bottom: '5%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '80px' },
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

// Symbol starting positions (floating around the scene)
const SYMBOL_POSITIONS = [
  { top: '10%', left: '10%' },
  { top: '15%', right: '15%' },
  { top: '50%', left: '5%' },
  { top: '40%', right: '8%' },
  { bottom: '40%', left: '8%' },
  { bottom: '35%', right: '10%' },
  { bottom: '15%', left: '15%' },
  { bottom: '20%', right: '20%' }
];

const SacredAssemblyScene = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'final-scene'
}) => {
  console.log('SacredAssemblyScene props:', { onComplete, onNavigate, zoneId, sceneId });

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
        
        // Existing pattern (from pond scene)
        phase: 'initial',
        currentFocus: 'assembly',
        discoveredSymbols: {
          // Start with all symbols from previous scenes
          mooshika: true,
          modak: true, 
          belly: true,
          lotus: true,
          trunk: true,
          eyes: true,
          ear: true,
          tusk: true
        },
        
        // Message flags
        welcomeShown: false,
        assemblyWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        
        // Reload system (same as pond)
        currentPopup: null,
        gameCoachState: null,
        isReloadingGameCoach: false,
        symbolDiscoveryState: null,
        sidebarHighlightState: null,
        showingCompletionScreen: false,
        playAgainRequested: false,
        
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
  console.log('SacredAssemblyContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: 'initial' });

  // GameCoach functionality (same as pond)
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();
  
  // State management (similar to pond)
  const [showSparkle, setShowSparkle] = useState(null);
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  
  // Refs (same as pond)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const previousVisibilityRef = useRef(false);

  // Get profile name (same as pond)
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe timeout function (same as pond)
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount (same as pond)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry (same as pond)
  useEffect(() => {
    console.log('🧹 ASSEMBLY: Cleaning GameCoach on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
  }, []);

  // GameCoach messages (following pond pattern)
  const gameCoachStoryMessages = [
    {
      id: 'welcome',
      message: `Welcome to the Sacred Summit, ${profileName}! You've collected all of Ganesha's sacred symbols. Now assemble them to awaken his divine form!`,
      timing: 500,
      condition: () => sceneState?.phase === 'initial' && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'assembly_wisdom',
      message: `Magnificent, ${profileName}! You're bringing Ganesha to life! Each symbol you place awakens his divine power!`,
      timing: 1000,
      condition: () => {
        const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
        return placedCount >= 3 && !sceneState?.assemblyWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach;
      }
    },
    {
      id: 'mastery_wisdom',
      message: `Divine Child! You have awakened Ganesha completely! You are now a true keeper of ancient wisdom! The entire realm celebrates your achievement!`,
      timing: 1000,
      condition: () => {
        const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
        return placedCount === 8 && !sceneState?.masteryShown && !sceneState?.isReloadingGameCoach;
      }
    }
  ];

  // GameCoach effect (same pattern as pond)
  useEffect(() => {
    if (!sceneState || !showMessage) return;
    
    if (sceneState.isReloadingGameCoach) {
      console.log('🚫 GameCoach blocked: Reload in progress');
      return;
    }

    const matchingMessage = gameCoachStoryMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );

    if (matchingMessage) {
      const messageAlreadyShown =
        (matchingMessage.id === 'assembly_wisdom' && sceneState.assemblyWisdomShown) ||
        (matchingMessage.id === 'mastery_wisdom' && sceneState.masteryShown) ||
        (matchingMessage.id === 'welcome' && sceneState.welcomeShown);

      if (messageAlreadyShown) {
        console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
        return;
      }

      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing divine light first, then ${matchingMessage.id} message`);
        
        setShowSparkle('divine-light');
        
        setTimeout(() => {
          setShowSparkle(null);
          
          showMessage(matchingMessage.message, {
            duration: 8000,
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: getMessageType(matchingMessage.id)
          });
        }, 2000);
      }, matchingMessage.timing);

      // Mark message as shown
      switch (matchingMessage.id) {
        case 'welcome':
          sceneActions.updateState({ welcomeShown: true });
          break;
        case 'assembly_wisdom':
          sceneActions.updateState({
            assemblyWisdomShown: true,
            readyForWisdom: false,
            gameCoachState: 'assembly_wisdom',
            lastGameCoachTime: Date.now()
          });
          break;
        case 'mastery_wisdom':
          sceneActions.updateState({
            masteryShown: true,
            gameCoachState: 'mastery_wisdom', 
            lastGameCoachTime: Date.now()
          });
          // Start final celebration sequence
          safeSetTimeout(() => {
            showFinalCelebration();
          }, 3000);
          break;
      }

      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.phase,
    sceneState?.placedSymbols,
    sceneState?.welcomeShown,
    sceneState?.assemblyWisdomShown,
    sceneState?.masteryShown,
    sceneState?.readyForWisdom,
    sceneState?.isReloadingGameCoach,
    showMessage
  ]);

  // Helper function for message colors
  const getMessageType = (messageId) => {
    switch(messageId) {
      case 'welcome': return 'welcome';
      case 'assembly_wisdom': return 'wisdom1';
      case 'mastery_wisdom': return 'wisdom3';
      default: return 'welcome';
    }
  };

  // Get Ganesha image based on state
  const getGaneshaImage = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    
    if (placedCount === 8) return ganeshaDivine;
    if (placedCount >= 3) return ganeshaAwakening || ganeshaStone; // Use awakening if available
    return ganeshaStone;
  };

  // Handle symbol placement - CORE GAME LOGIC
  const handleSymbolPlacement = ({ id, data }) => {
    if (!sceneState || !sceneActions) return;
    
    console.log(`🎯 Symbol ${id} placed correctly!`);
    
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

    // Show blessing text
    showBlessing(symbolInfo.blessing);
    
    // Create sparkle effects
    setShowSparkle(`symbol-placed-${id}`);
    safeSetTimeout(() => setShowSparkle(null), 2000);
    
    // Check for special milestones
    if (placedCount === 3) {
      // First awakening
      safeSetTimeout(() => {
        sceneActions.updateState({ 
          readyForWisdom: true,
          gameCoachState: 'assembly_wisdom'
        });
      }, 2000);
    } else if (placedCount === 8) {
      // Complete assembly
      safeSetTimeout(() => {
        sceneActions.updateState({
          phase: 'complete',
          completed: true,
          readyForWisdom: true,
          gameCoachState: 'mastery_wisdom'
        });
      }, 2000);
    }
  };

  // Show blessing text
  const showBlessing = (blessingText) => {
    // Create a blessing display element (you can implement this as a modal or overlay)
    console.log(`🙏 Blessing: ${blessingText}`);
    
    // Simple implementation - you can enhance this
    const blessingElement = document.createElement('div');
    blessingElement.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: #FFD700;
      padding: 20px 30px;
      border-radius: 20px;
      font-size: 1.2rem;
      text-align: center;
      z-index: 1500;
      max-width: 80%;
      animation: fadeInOut 4s ease forwards;
    `;
    
    // Add animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    
    blessingElement.textContent = blessingText;
    document.body.appendChild(blessingElement);
    
    // Remove after animation
    safeSetTimeout(() => {
      blessingElement.remove();
      style.remove();
    }, 4000);
  };

  // Final celebration
  const showFinalCelebration = () => {
    console.log('🎆 Starting final celebration sequence');
    
    sceneActions.updateState({
      currentPopup: 'final_fireworks',
      phase: 'complete',
      stars: 8,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
    
    setShowSparkle('final-fireworks');
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
        return placedCount < 3 && !showMagicalCard && !isVisible;
      }
    }
  ];

  // Render methods
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
          {/* Sacred Mountain Background */}
          <div 
            className="sacred-background" 
            style={{ backgroundImage: `url(${sacredBackground})` }}
          >
            {/* Progress Display */}
            <div className="assembly-progress">
              <div className="progress-text">
                Sacred Assembly: {Object.keys(sceneState.placedSymbols || {}).length}/8 symbols placed
              </div>
            </div>

            {/* Ganesha Sacred Form Container */}
            <div className="ganesha-assembly-container">
              {/* Ganesha Image */}
              <img 
                src={getGaneshaImage()}
                alt="Ganesha Sacred Form"
                className={`ganesha-form ${sceneState.ganeshaState}`}
              />

              {/* Drop Zones for Body Parts */}
              {BODY_PART_ZONES.map(zone => (
                <DropZone
                  key={zone.id}
                  id={zone.id}
                  acceptTypes={zone.acceptTypes}
                  onDrop={handleSymbolPlacement}
                  className={`body-part-zone ${zone.id}-zone`}
                  style={{
                    position: 'absolute',
                    ...zone.position,
                    border: sceneState.activeMagneticZone === zone.id ? 
                      '3px solid #FFD700' : '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center',
                    background: sceneState.activeMagneticZone === zone.id ?
                      'rgba(255, 215, 0, 0.2)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="zone-hint">{zone.hint}</div>
                </DropZone>
              ))}

              {/* Placed Symbols (show in their final positions) */}
              {Object.keys(sceneState.placedSymbols || {}).map(symbolId => {
                const symbol = SACRED_SYMBOLS.find(s => s.id === symbolId);
                const zone = BODY_PART_ZONES.find(z => z.acceptTypes.includes(symbolId));
                
                return (
                  <div
                    key={`placed-${symbolId}`}
                    className="placed-symbol"
                    style={{
                      position: 'absolute',
                      ...zone.position,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      pointerEvents: 'none',
                      animation: 'symbolAwaken 1s ease forwards'
                    }}
                  >
                    {symbol.emoji}
                  </div>
                );
              })}
            </div>

            {/* Floating Symbols (Draggable) */}
            {SACRED_SYMBOLS.map((symbol, index) => {
              // Don't show if already placed
              if (sceneState.placedSymbols?.[symbol.id]) return null;
              
              return (
                <div
                  key={symbol.id}
                  className="floating-symbol-container"
                  style={{
                    position: 'absolute',
                    ...SYMBOL_POSITIONS[index],
                    zIndex: sceneState.currentDragSymbol === symbol.id ? 1000 : 10
                  }}
                >
                  <DraggableItem
                    id={symbol.id}
                    data={{ type: symbol.id, name: symbol.name }}
                    onDragStart={(id) => {
                      sceneActions.updateState({ currentDragSymbol: id });
                      console.log(`Started dragging ${id}`);
                    }}
                    onDragEnd={() => {
                      sceneActions.updateState({ 
                        currentDragSymbol: null,
                        activeMagneticZone: null 
                      });
                    }}
                  >
                    <div className="floating-symbol">
                      <img 
                        src={symbol.image} 
                        alt={symbol.name}
                        style={{ width: '60px', height: '60px' }}
                      />
                      <div className="symbol-name">{symbol.name}</div>
                    </div>
                  </DraggableItem>
                </div>
              );
            })}

            {/* Divine light effect for GameCoach entrance */}
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
                  color="#FFD700"
                  size={3}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

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

            {/* Final fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={5000}
                count={20}
                colors={['#FFD700', '#FF1493', '#00CED1', '#98FB98', '#FF6347', '#9370DB']}
                onComplete={() => {
                  console.log('🎯 Final fireworks complete');
                  setShowSparkle(null);
                  
                  // Save completion
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('symbol-mountain', 'final-scene', {
                      completed: true,
                      stars: 8,
                      symbols: { all: true },
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    // Mark entire zone as complete
                    ProgressManager.updateZoneCompletion(profileId, 'symbol-mountain', {
                      completed: true,
                      totalStars: 8
                    });
                    
                    console.log('✅ ASSEMBLY: Zone completion saved');
                  }
                  
                  // Show completion screen
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Debug buttons (same as pond) */}
            <div style={{
              position: 'fixed',
              top: '170px',
              left: '200px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              console.log('🧪 ASSEMBLY COMPLETION TEST CLICKED');
              
              // Mark all symbols as placed
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
                progress: {
                  percentage: 100,
                  starsEarned: 8,
                  completed: true
                },
                welcomeShown: true,
                assemblyWisdomShown: true,
                masteryShown: false, // Will trigger final message
                currentPopup: null,
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              // Clear UI states
              setShowSparkle(null);
              setShowMagicalCard(false);
              setShowSceneCompletion(false);
              
              // Trigger final celebration
              setTimeout(() => {
                showFinalCelebration();
              }, 1000);
            }}>
              COMPLETE
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
                console.log('🔄 ASSEMBLY EMERGENCY RESTART');
                
                // Clear all UI states
                setShowSparkle(null);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                
                // Reset scene state
                setTimeout(() => {
                  sceneActions.updateState({
                    placedSymbols: {},
                    ganeshaState: GANESHA_STATES.STONE,
                    currentDragSymbol: null,
                    activeMagneticZone: null,
                    phase: 'initial',
                    currentFocus: 'assembly',
                    
                    // Clear message flags
                    welcomeShown: false,
                    assemblyWisdomShown: false,
                    masteryShown: false,
                    readyForWisdom: false,
                    
                    // Clear popup states
                    currentPopup: null,
                    gameCoachState: null,
                    isReloadingGameCoach: false,
                    lastGameCoachTime: 0,
                    
                    // Reset progress
                    stars: 0,
                    completed: false,
                    progress: {
                      percentage: 0,
                      starsEarned: 0,
                      completed: false
                    }
                  });
                }, 100);
                
                if (hideCoach) {
                  hideCoach();
                }
              }
            }}>
              🔄 Start Fresh
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
              console.log(`Assembly hint level ${level} shown`);
              setHintUsed(true);
            }}
            enabled={true}
          />

          {/* Navigation */}
          <TocaBocaNav
            onHome={() => {
              console.log('🧹 HOME: Cleaning GameCoach before navigation');
              if (hideCoach) hideCoach();
              if (clearManualCloseTracking) clearManualCloseTracking();
              setTimeout(() => onNavigate?.('home'), 100);
            }}
            onProgress={() => {
              console.log(`Great progress, ${profileName}!`);
              if (hideCoach) hideCoach();
              setShowCulturalCelebration(true);
            }}
            onHelp={() => console.log('Show help')}
            onParentMenu={() => console.log('Parent menu')}
            isAudioOn={true}
            onAudioToggle={() => console.log('Toggle audio')}
            onZonesClick={() => {
              console.log('🧹 ZONES: Cleaning GameCoach before navigation');
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

          {/* Symbol Sidebar */}
          <SymbolSidebar
            discoveredSymbols={sceneState.discoveredSymbols || {}}
            onSymbolClick={(symbolId) => {
              console.log(`Sidebar symbol clicked: ${symbolId}`);
            }}
          />

          {/* Scene Completion - For zone completion */}
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Sacred Assembly"
            sceneNumber={4}
            totalScenes={4}
            starsEarned={sceneState.progress?.starsEarned || 8}
            totalStars={8}
            discoveredSymbols={Object.keys(sceneState.discoveredSymbols || {})}
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
            nextSceneName="Next Adventure"
            sceneId="final-scene"
            completionData={{
              stars: 8,
              symbols: { all: true },
              completed: true,
              totalStars: 8
            }}
            onComplete={onComplete}
            
            onReplay={() => {
              console.log('🔧 ASSEMBLY PLAY AGAIN');
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
            
            onContinue={() => {
              console.log('🔧 ASSEMBLY CONTINUE: Zone completed!');
              
              if (clearManualCloseTracking) {
                clearManualCloseTracking();
              }
              if (hideCoach) {
                hideCoach();
              }
              
              // This is zone completion, not just scene completion
              setTimeout(() => {
                onNavigate?.('zone-complete');
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
