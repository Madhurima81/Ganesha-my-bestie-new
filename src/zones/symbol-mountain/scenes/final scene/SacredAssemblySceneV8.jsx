// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - V8 DIVINE VERSION
import React, { useState, useEffect, useRef } from 'react';
import './SacredAssemblyScene.css';
import '../../../shared/components/OpeningModal.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
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
import OpeningModal from '../../shared/components/OpeningModal';

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

// Body Part Overlays - ADD THESE
import ganeshaFaded from './assets/images/ganesha-faded.png';
import ganeshaEyes from './assets/images/ganesha-eyes-colored.png';
import ganeshaEars from './assets/images/ganesha-ears-colored.png';
import ganeshaTrunk from './assets/images/ganesha-trunk-colored.png';
import ganeshaTusk from './assets/images/ganesha-tusk-colored.png';
import ganeshaLeftHand from './assets/images/ganesha-left-hand-colored.png';
import ganeshaRightHand from './assets/images/ganesha-right-hand-colored.png';
import ganeshaBelly from './assets/images/ganesha-belly-colored.png';
import ganeshaBase from './assets/images/ganesha-mouse-colored.png';

// Association Icons (create placeholder icons for now, or use emojis)
// We'll use simple colored circles as placeholders - you can replace with actual icons later

// Coach image (for hints only)
import mooshikaCoach from "../pond/assets/images/mooshika-coach.png";

// Temporary Icon Placeholders (replace with actual images later)
const createIconDataURL = (emoji, color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(60, 60, 50, 0, Math.PI * 2);
  ctx.fill();

  // Emoji
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 60, 60);

  return canvas.toDataURL();
};

// Icon placeholders (you can replace these with actual icon imports later)
const iconTarget = '🎯';
const iconHeadphones = '🎧';
const iconRoadblock = '🚧';
const iconHammer = '🔨';
const iconHoney = '🍯';
const iconLightbulb = '💡';
const iconUniverse = '🌌';
const iconPath = '🛤️';

// Sacred Assembly Game Configuration
const SACRED_SYMBOLS = [
  {
    id: 'eyes',
    name: 'Eyes',
    emoji: '👁️',
    image: symbolEyesColored,
    associationIcon: iconTarget,
    associationText: "Ganesha's eyes see the truth in all things!",
    bodyPartImage: ganeshaEyes,
    blessing: "Ganesha's divine eyes awaken! May you see truth in all things.",
    bodyPart: 'eyes',
    correctZone: 'eyes',
    wrongZones: ['belly', 'base', 'left-hand', 'trunk']
  },
  {
    id: 'ears',
    name: 'Ears',
    emoji: '👂',
    image: symbolEarsColored,
    associationIcon: iconHeadphones,
    associationText: "Ganesha's sacred ears hear every prayer with compassion!",
    bodyPartImage: ganeshaEars,
    blessing: "Ganesha's sacred ears come alive! May you listen with wisdom and compassion.",
    bodyPart: 'ears',
    correctZone: 'ears',
    wrongZones: ['trunk', 'right-hand', 'base', 'tusk']
  },
  {
    id: 'trunk',
    name: 'Trunk',
    emoji: '🐘',
    image: symbolTrunkColored,
    associationIcon: iconRoadblock,
    associationText: "Ganesha's mighty trunk clears all obstacles from your path!",
    bodyPartImage: ganeshaTrunk,
    blessing: "Ganesha's mighty trunk awakens! May all obstacles be removed from your path.",
    bodyPart: 'trunk',
    correctZone: 'trunk',
    wrongZones: ['eyes', 'belly', 'right-hand', 'base']
  },
  {
    id: 'tusk',
    name: 'Tusk',
    emoji: '🦷',
    image: symbolTuskColored,
    associationIcon: iconHammer,
    associationText: "Ganesha's powerful tusk breaks through any challenge!",
    bodyPartImage: ganeshaTusk,
    blessing: "Ganesha's powerful tusk glows! May you break through any challenge with determination.",
    bodyPart: 'tusk',
    correctZone: 'tusk',
    wrongZones: ['ears', 'left-hand', 'belly', 'trunk']
  },
  {
    id: 'modak',
    name: 'Modak',
    emoji: '🍯',
    image: symbolModakColored,
    associationIcon: iconHoney,
    associationText: "Ganesha's blessing hand brings sweetness and abundance!",
    bodyPartImage: ganeshaLeftHand,
    blessing: "Ganesha's blessing hand awakens! May sweetness and abundance fill your life.",
    bodyPart: 'left-hand',
    correctZone: 'left-hand',
    wrongZones: ['right-hand', 'ears', 'base', 'belly']
  },
  {
    id: 'lotus',
    name: 'Lotus',
    emoji: '🪷',
    image: symbolLotusColored,
    associationIcon: iconLightbulb,
    associationText: "Ganesha's wisdom hand holds purity and enlightenment!",
    bodyPartImage: ganeshaRightHand,
    blessing: "Ganesha's wisdom hand comes alive! May purity and enlightenment guide you.",
    bodyPart: 'right-hand',
    correctZone: 'right-hand',
    wrongZones: ['left-hand', 'trunk', 'tusk', 'eyes']
  },
  {
    id: 'belly',
    name: 'Belly',
    emoji: '🫄',
    image: symbolBellyColored,
    associationIcon: iconUniverse,
    associationText: "Ganesha's sacred belly holds the entire universe's love!",
    bodyPartImage: ganeshaBelly,
    blessing: "Ganesha's sacred belly awakens! May you hold the universe's love within you.",
    bodyPart: 'belly',
    correctZone: 'belly',
    wrongZones: ['trunk', 'eyes', 'left-hand', 'right-hand']
  },
  {
    id: 'mooshika',
    name: 'Mooshika',
    emoji: '🐭',
    image: symbolMooshikaColored,
    associationIcon: iconPath,
    associationText: "Mooshika, Ganesha's divine vehicle, guides every journey with wisdom!",
    bodyPartImage: ganeshaBase,
    blessing: "Mooshika, Ganesha's divine vehicle awakens! May wisdom guide your every journey, dear child.",
    bodyPart: 'base',
    correctZone: 'base',
    wrongZones: ['belly', 'trunk', 'ears', 'eyes']
  }
];


// DEBUG: Verify SACRED_SYMBOLS is correct
console.log('🔍 SACRED_SYMBOLS check:', {
  count: SACRED_SYMBOLS.length,
  ids: SACRED_SYMBOLS.map(s => s.id),
  hasDuplicates: SACRED_SYMBOLS.map(s => s.id).length !== new Set(SACRED_SYMBOLS.map(s => s.id)).size
});

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

        // NEW: Association Challenge State
        currentRound: 0,
        currentAssociationSymbol: null,
        glowingZones: [],
        wrongAttempts: 0,
        showingAssociationCard: false,
        symbolQueue: [],

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
  const completionModalContent = getCompletionModal(zoneId, sceneId);

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

  const [flyingSymbol, setFlyingSymbol] = useState(null); // Stores data for the flying animation
  const [ganeshaReaction, setGaneshaReaction] = useState(''); // 'happy'

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

  const playSound = (type) => {
    // Simple sound effects (you can replace URLs later)
    const sounds = {
      pop: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-click-1112.mp3',
      success: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-193.mp3',
      wrong: 'https://assets.mixkit.co/sfx/preview/mixkit-cartoon-negative-sound-2273.mp3'
    };
    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked", e));
    } catch (e) { console.log("Audio error"); }
  };

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

  // NEW: Initialize random symbol queue when game starts
  // REPLACE LINES 409-430 in SacredAssemblySceneV8.jsx with this:

  // NEW: Initialize random symbol queue when game starts
  // NEW: Initialize random symbol queue when game starts
  useEffect(() => {
    if (sceneState?.phase === 'initial' &&
      sceneState?.welcomeShown &&
      (!sceneState?.symbolQueue || sceneState.symbolQueue.length === 0)) {

      console.log('🎮 Initializing symbol queue...'); // DEBUG

      // Create array of all symbol IDs (should be exactly 8)
      const allSymbolIds = SACRED_SYMBOLS.map(s => s.id);
      console.log('📋 All symbol IDs:', allSymbolIds, 'Count:', allSymbolIds.length); // DEBUG

      // Fisher-Yates shuffle for better randomization
      const shuffledSymbols = [...allSymbolIds];
      for (let i = shuffledSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSymbols[i], shuffledSymbols[j]] = [shuffledSymbols[j], shuffledSymbols[i]];
      }

      console.log('🎲 Symbol queue created:', shuffledSymbols); // DEBUG
      console.log('✅ Queue length:', shuffledSymbols.length, 'Should be 8'); // DEBUG

      // Verify no duplicates
      const uniqueSymbols = [...new Set(shuffledSymbols)];
      if (uniqueSymbols.length !== 8) {
        console.error('❌ DUPLICATE SYMBOLS IN QUEUE!', shuffledSymbols); // DEBUG
      }

      sceneActions.updateState({
        symbolQueue: shuffledSymbols,
        currentRound: 0
      });
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, sceneState?.symbolQueue]);

  // NEW: Separate useEffect to start first round AFTER symbolQueue is set
  // NEW: Separate useEffect to start first round AFTER symbolQueue is set
  useEffect(() => {
    // Check if any symbols are already placed
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;

    if (sceneState?.symbolQueue &&
      sceneState.symbolQueue.length > 0 &&
      sceneState.currentRound === 0 &&
      placedCount === 0 && // <--- ADD THIS LINE
      !sceneState.currentAssociationSymbol &&
      !sceneState.showingAssociationCard) {

      console.log('🚀 Starting first round with queue:', sceneState.symbolQueue); // DEBUG

      // Start first round after brief delay
      safeSetTimeout(() => {
        startNextRound(0);
      }, 500);
    }
  }, [
    sceneState?.symbolQueue,
    sceneState?.currentRound,
    sceneState?.currentAssociationSymbol,
    sceneState?.placedSymbols // <--- ADD THIS to the dependency array
  ]);

  // ADD THIS NEW useEffect AFTER the other useEffects (around line 470)
  // This will help us see when state changes:

  // DEBUG: Monitor association card state
  useEffect(() => {
    console.log('🔍 Association Card State Changed:', {
      showingAssociationCard: sceneState?.showingAssociationCard,
      currentAssociationSymbol: sceneState?.currentAssociationSymbol,
      glowingZones: sceneState?.glowingZones,
      currentRound: sceneState?.currentRound,
      symbolQueue: sceneState?.symbolQueue
    });
  }, [
    sceneState?.showingAssociationCard,
    sceneState?.currentAssociationSymbol,
    sceneState?.glowingZones,
    sceneState?.currentRound,
    sceneState?.symbolQueue
  ]);

  // NEW: Start next round function
  // UPDATE the startNextRound function (lines 432-471)
  // Add console.log statements for debugging:

  // NEW: Start next round function
  const startNextRound = (roundNumber = null) => {
    if (!sceneState || !sceneActions) {
      console.log('❌ No sceneState or sceneActions'); // DEBUG
      return;
    }

    // Use provided round number or fall back to state
    const currentRound = roundNumber !== null ? roundNumber : (sceneState.currentRound || 0);
    const symbolQueue = sceneState.symbolQueue || [];

    console.log('📍 startNextRound called - Round:', currentRound, 'Queue:', symbolQueue); // DEBUG

    // Check if all symbols placed
    if (currentRound >= 8) {
      console.log('✅ All symbols placed! Triggering celebration'); // DEBUG
      triggerFinalCelebration();
      return;
    }

    // Get current symbol to quiz
    // Get current symbol to quiz
    const currentSymbolId = symbolQueue[currentRound];
    console.log('🎲 Round:', currentRound, '| Queue index:', currentRound, '| Symbol ID from queue:', currentSymbolId); // DEBUG
    console.log('📜 Full queue:', symbolQueue); // DEBUG

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === currentSymbolId);

    if (!currentSymbol) {
      console.log('❌ No symbol found for ID:', currentSymbolId); // DEBUG
      return;
    }

    console.log('🎯 Current symbol:', currentSymbol.name, '(' + currentSymbol.id + ')'); // DEBUG

    // Pick 2 random wrong zones from the symbol's wrongZones array
    const wrongZoneOptions = [...currentSymbol.wrongZones];
    const shuffledWrong = wrongZoneOptions.sort(() => Math.random() - 0.5);
    const selectedWrongZones = shuffledWrong.slice(0, 2);

    // Combine correct zone + 2 wrong zones and shuffle
    const allGlowingZones = [
      currentSymbol.correctZone,
      ...selectedWrongZones
    ].sort(() => Math.random() - 0.5);

    console.log('💡 Glowing zones:', allGlowingZones); // DEBUG
    console.log('📝 Setting showingAssociationCard to TRUE'); // DEBUG

    // Update state to show association card and glow zones
    sceneActions.updateState({
      currentAssociationSymbol: currentSymbolId,
      glowingZones: allGlowingZones,
      showingAssociationCard: true,
      wrongAttempts: 0,
      selectedSymbol: null,
      highlightedZone: null
    });

    console.log('✨ State updated - card should show!'); // DEBUG
  };

  // NEW: Handle zone click
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;

    const currentSymbolId = sceneState.currentAssociationSymbol;
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === currentSymbolId);

    if (!currentSymbol) return;

    // Check if clicked zone is correct
    const isCorrect = zoneId === currentSymbol.correctZone;

    if (isCorrect) {
      handleCorrectPlacement(currentSymbol);
    } else {
      handleWrongPlacement(zoneId);
    }
  };

  // NEW: Handle correct placement with MAGIC & FUN
  // NEW: Handle correct placement with MAGIC & FUN
  /*const handleCorrectPlacement = (symbol) => {
    if (!sceneState || !sceneActions) return;
    
    clearAllTimeouts();
  
    // 1. Play Success Sound
    playSound('success');
  
    // 2. Trigger Flying Animation
    // --- FIX: CALCULATE COORDINATES CORRECTLY ---
    const targetZone = BODY_PART_ZONES.find(z => z.id === symbol.correctZone);
    
    // Default to 50% if not found
    let tTop = targetZone?.position?.top || '50%';
    let tLeft = targetZone?.position?.left;
  
    // Fix: If zone uses 'right' instead of 'left', calculate the left position
    if (!tLeft && targetZone?.position?.right) {
       tLeft = `calc(100% - ${targetZone.position.right})`; 
    }
    // Fallback
    if (!tLeft) tLeft = '50%'; 
  
    console.log(`✈️ Flying to: Top ${tTop}, Left ${tLeft}`); // Debug log
  
    setFlyingSymbol({
      image: symbol.image,
      targetTop: tTop,
      targetLeft: tLeft
    });
    // --------------------------------------------
  
    // 3. Wait for flight to finish (0.9s), THEN update game state
    safeSetTimeout(() => {
      // A. Trigger Ganesha Wiggle Reaction
      setGaneshaReaction('happy');
      safeSetTimeout(() => setGaneshaReaction(''), 800);
  
      // B. Clear Flying Symbol
      setFlyingSymbol(null);
  
      // C. ACTUAL LOGIC
      const newPlacedSymbols = {
        ...sceneState.placedSymbols,
        [symbol.id]: true
      };
      
      const placedCount = Object.keys(newPlacedSymbols).length;
      const percentage = Math.round((placedCount / 8) * 100);
      
      // Update state
      sceneActions.updateState({
        placedSymbols: newPlacedSymbols,
        showingAssociationCard: false,
        glowingZones: [],
        currentAssociationSymbol: null,
        stars: placedCount,
        progress: {
          percentage: percentage,
          starsEarned: placedCount,
          completed: placedCount === 8
        }
      });
      
      // Show sparkle celebration
      setShowSparkle(`symbol-placed-${symbol.id}`);
      safeSetTimeout(() => setShowSparkle(null), 2000);
      
      // Check completion
      if (placedCount === 8) {
        safeSetTimeout(() => triggerFinalCelebration(), 1500);
      } else {
        // Move to next round
        const nextRound = (sceneState.currentRound || 0) + 1;
        safeSetTimeout(() => {
          sceneActions.updateState({ currentRound: nextRound });
          safeSetTimeout(() => {
            playSound('pop'); 
            startNextRound(nextRound);
          }, 300);
        }, 1000); 
      }
    }, 900); // 0.9s delay matches the flight animation time
  };*/

  // NEW: Handle correct placement
  // NEW: Handle correct placement
  const handleCorrectPlacement = (symbol) => {
    if (!sceneState || !sceneActions) return;

    clearAllTimeouts();

    console.log('🎊 STARTING CELEBRATION FOR:', symbol.name); // DEBUG

    // Show big celebration effects
    setShowSparkle(`celebration-${symbol.id}`);

    // DO NOT clear sparkle immediately - let it show for 2 seconds
    safeSetTimeout(() => {
      console.log('🎊 CLEARING CELEBRATION'); // DEBUG
      setShowSparkle(null);
    }, 2000);

    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [symbol.id]: true
    };

    const placedCount = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((placedCount / 8) * 100);

    console.log('✅ Symbol placed:', symbol.name, '| Total placed:', placedCount);

    // Add exit animation to card (wait a bit so celebration is visible)
    safeSetTimeout(() => {
      const cardElement = document.querySelector('.association-card');
      if (cardElement) {
        cardElement.style.animation = 'cardSlideOutLeft 0.5s ease-in forwards';
      }
    }, 500);

    // Update state after a brief delay
    safeSetTimeout(() => {
      sceneActions.updateState({
        placedSymbols: newPlacedSymbols,
        showingAssociationCard: false,
        glowingZones: [],
        currentAssociationSymbol: null,
        stars: placedCount,
        progress: {
          percentage: percentage,
          starsEarned: placedCount,
          completed: placedCount === 8
        }
      });
    }, 600);

    // Check if game is complete
    if (placedCount === 8) {
      console.log('🎉 All 8 symbols placed! Starting celebration!');
      safeSetTimeout(() => {
        triggerFinalCelebration();
      }, 2500);
    } else {
      console.log('➡️ Moving to next round...');
      const nextRound = (sceneState.currentRound || 0) + 1;
      safeSetTimeout(() => {
        sceneActions.updateState({
          currentRound: nextRound
        });

        safeSetTimeout(() => {
          startNextRound(nextRound);
        }, 100);
      }, 2500);
    }
  };

  // NEW: Handle wrong placement
  const handleWrongPlacement = (clickedZoneId) => {
    if (!sceneState || !sceneActions) return;

    const newWrongAttempts = (sceneState.wrongAttempts || 0) + 1;

    // Show shake animation on wrong zone
    setShowSparkle(`wrong-zone-${clickedZoneId}`);
    safeSetTimeout(() => setShowSparkle(null), 800);

    // Update wrong attempts count
    sceneActions.updateState({
      wrongAttempts: newWrongAttempts
    });

    // After 2 wrong attempts, show hint
    if (newWrongAttempts >= 2 && progressiveHintRef.current?.showHint) {
      const currentSymbol = SACRED_SYMBOLS.find(
        s => s.id === sceneState.currentAssociationSymbol
      );

      if (currentSymbol) {
        progressiveHintRef.current.showHint({
          message: `Think about it: ${currentSymbol.associationText}`,
          explicitMessage: `The correct answer is the ${currentSymbol.name} area!`
        });
      }
    }
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

          <OpeningModal
            zoneId={zoneId}
            sceneId={sceneId}
            onStart={() => sceneActions.updateState({ welcomeShown: true })}
            characterImg={ganeshaDivine}
            showButton={true}
          />

          {/* HEARTS PROGRESS BAR */}
          {sceneState.welcomeShown && (
            <div className="hearts-progress-container">
              <div className="hearts-row">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                  const isCompleted = Object.keys(sceneState.placedSymbols || {}).length > index;
                  const isJustCompleted = Object.keys(sceneState.placedSymbols || {}).length - 1 === index;

                  return (
                    <div
                      key={`heart-${index}`}
                      className={`progress-heart ${isCompleted ? 'filled' : 'empty'} ${isJustCompleted ? 'just-completed' : ''}`}
                    >
                      💜
                      {isJustCompleted && (
                        <div className="heart-sparkle-burst">
                          <SparkleAnimation
                            type="star"
                            count={8}
                            color="#8A2BE2"
                            size={4}
                            duration={1000}
                            fadeOut={true}
                            area="contained"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="progress-text">
                {Object.keys(sceneState.placedSymbols || {}).length}/8 Symbols Awakened
              </div>
            </div>
          )}

          {/* ASSOCIATION CHALLENGE CARD */}
          {sceneState.showingAssociationCard && sceneState.currentAssociationSymbol && (
            <div className="association-card-overlay">
              <div className="association-card">
                {/* Icon Display */}
                <div className="association-icon-container">
                  <div className="association-icon-emoji">
                    {SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol)?.associationIcon}
                  </div>
                </div>

                {/* Association Text */}
                <p className="association-text">
                  {SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol)?.associationText}
                </p>

                {/* Round Counter */}
                <div className="round-counter">
                  Round {(sceneState.currentRound || 0) + 1} of 8
                </div>

                {/* Sparkle Decoration */}
                <SparkleAnimation
                  type="star"
                  count={6}
                  color={SACRED_COLOR_PALETTE.primary}
                  size={4}
                  duration={3000}
                  fadeOut={false}
                  area="contained"
                />
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

            {/* Ganesha Progressive Fill Container */}
            {/* UPDATE THIS LINE */}
            <div className={`ganesha-assembly-container ${ganeshaReaction}`} style={{ pointerEvents: 'none' }}>  {/* Base Faded Ganesha (Always Visible) */}
              <div className="ganesha-base-layer">
                <img
                  src={ganeshaFaded}
                  alt="Ganesha Outline"
                  className="ganesha-faded"
                  style={{
                    width: '100%',
                    height: '100%',
                    opacity: 1,
                    position: 'relative'
                  }}
                />
              </div>

              {/* Colored Body Part Overlays (Reveal as Placed) */}
              <div className="ganesha-colored-layers">
                {SACRED_SYMBOLS.map(symbol => {
                  const isPlaced = sceneState.placedSymbols?.[symbol.id];

                  if (!isPlaced) return null;

                  return (
                    <img
                      key={`colored-${symbol.id}`}
                      src={symbol.bodyPartImage}
                      alt={`${symbol.name} colored`}
                      className={`ganesha-part-colored ganesha-part-${symbol.id}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 1,
                        animation: 'fadeInColorPart 1s ease-in-out',
                        pointerEvents: 'none'
                      }}
                    />
                  );
                })}
              </div>

              {/* CLICKABLE GLOWING ZONES */}
              {sceneState.glowingZones && sceneState.glowingZones.length > 0 && (
                BODY_PART_ZONES.map(zone => {
                  const isGlowing = sceneState.glowingZones.includes(zone.id);

                  if (!isGlowing) return null;

                  return (
                    <div
                      key={`glow-zone-${zone.id}`}
                      data-zone-id={zone.id}
                      className="glowing-clickable-zone"
                      style={{
                        position: 'absolute',
                        ...zone.position,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        zIndex: 100,
                        borderRadius: '50%',
                        pointerEvents: 'auto',
                        backgroundColor: SACRED_COLOR_PALETTE.highlight,
                        border: `4px solid ${SACRED_COLOR_PALETTE.primary}`,
                        boxShadow: `
              0 0 20px ${SACRED_COLOR_PALETTE.glow},
              0 0 40px ${SACRED_COLOR_PALETTE.glow},
              inset 0 0 20px ${SACRED_COLOR_PALETTE.highlight}
            `,
                        animation: 'pulseGlow 1.5s ease-in-out infinite'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleZoneClick(zone.id);
                      }}
                    >
                      {/* Glow Ring Animation */}
                      <div className="zone-glow-ring"></div>

                      {/* Hint Text (show after 1 wrong attempt) */}
                      {sceneState.wrongAttempts >= 1 && (
                        <div className="zone-hint-text">{zone.hint}</div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Wrong Click Feedback */}
              {showSparkle?.startsWith('wrong-zone-') && (
                <div className="wrong-zone-feedback">
                  <div className="shake-animation">❌</div>
                  <p className="try-again-text">Try again, little explorer!</p>
                </div>
              )}

              {/* CORRECT ANSWER CELEBRATION */}
              {showSparkle?.startsWith('celebration-') && (
                <div className="celebration-container">
                  {/* Giant Sparkle Burst */}
                  <div className="mega-sparkle-explosion">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={`sparkle-${i}`}
                        className="mega-sparkle"
                        style={{
                          transform: `rotate(${i * 30}deg)`,
                          animationDelay: `${i * 0.08}s`
                        }}
                      >
                        ✨
                      </div>
                    ))}
                  </div>

                  {/* Radiating Impact Rings */}
                  <div className="impact-rings">
                    <div className="impact-ring ring-1"></div>
                    <div className="impact-ring ring-2"></div>
                    <div className="impact-ring ring-3"></div>
                  </div>

                  {/* Confetti Burst */}
                  <div className="confetti-burst">
                    {[...Array(30)].map((_, i) => {
                      const randomX = Math.random();
                      const randomY = Math.random() * 0.5 + 0.5;

                      return (
                        <div
                          key={`confetti-${i}`}
                          className="confetti-piece"
                          style={{
                            left: '50%',
                            top: '50%',
                            backgroundColor: ['#8A2BE2', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3'][i % 5],
                            animationDelay: `${i * 0.05}s`,
                            '--random-x': randomX,
                            '--random-y': randomY
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Success Text Float */}
                  <div className="success-text-float">
                    <div className="success-icon">🎉</div>
                    <div className="success-message">Perfect!</div>
                    <div className="plus-one">+1</div>
                  </div>
                </div>
              )}

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

            {/* Test buttons *
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
            completionTitle={completionModalContent?.title}
            completionSubtitle={completionModalContent?.subtitle}
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
