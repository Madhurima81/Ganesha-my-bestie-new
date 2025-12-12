import React, { useState, useEffect, useCallback } from 'react';
import './MandapDecorationGame.css';

// Import components
import MissionHeader from './components/MissionHeader';
import MissionSidebar from './components/MissionSidebar';

// Import missions
import PujaPrepMission from './missions/PujaPrepMission';
import FixMandapMission from './missions/FixMandapMission';
import EcoMandapMission from './missions/EcoMandapMission';
import LightChallengeMission from './missions/LightChallengeMission';

// Import utilities
import { getMissionData, GAME_MODES, PHASES } from './utils/missionHelpers';

// Import images
import mandapBgImage from './assets/images/mandap-bg.png';
import mandapImage from './assets/images/mandap.png';
import ganeshaImage from './assets/images/ganesha_happy_sitting.png';
//import ganeshaStandingImage from './assets/images/ganesha-standing.png';

// Import all decoration images - CORRECTED 24 ASSETS
import flowerMarigoldBunch from './assets/images/flower_marigold_bunch.png';
import flowerRosePetals from './assets/images/flower_rose_petals.png';
import flowerLotusSingle from './assets/images/flower_lotus_single.png';
import flowerPetals from './assets/images/flower_petals.png';

import garlandFlowerLeafMix from './assets/images/garland_flower_leaf_mix.png';
import garlandJasmine from './assets/images/garland_jasmine.png';
import toranFabricFlowers from './assets/images/toran_fabric_flowers.png';
import garlandMixedChain from './assets/images/garland_mixed_chain.png';

import diyaClayTraditional from './assets/images/diya_clay_traditional.png';
import diyaPaintedDecorative from './assets/images/diya_painted_decorative.png';
import diyaGoldenOrnate from './assets/images/diya_golden_ornate.png';
import lightsStringFestival from './assets/images/lights_string_festival.png';
import lightsPaperLanterns from './assets/images/lights_paper_lanterns.png';

import offeringCoconut from './assets/images/offering_coconut.png';
import offeringFruitsPlate from './assets/images/offering_fruits_plate.png';
import offeringSweetsModak from './assets/images/offering_sweets_modak.png';
import offeringIncenseSticks from './assets/images/offering_incense_sticks.png';

import funBuntingColorful from './assets/images/fun_bunting_colorful.png';
import funBalloonsCluster from './assets/images/fun_balloons_cluster.png';
import funStreamersFlowing from './assets/images/fun_streamers_flowing.png';
import funConfettiScatter from './assets/images/fun_confetti_scatter.png';

import specialFabricDraping from './assets/images/special_fabric_draping.png';
import specialPeacockFeathers from './assets/images/special_peacock_feathers.png';
import specialKalashPot from './assets/images/special_kalash_pot.png';
import specialRangoliBase from './assets/images/special_rangoli_base.png';


// Decoration image mapping - CORRECTED
const DECORATION_IMAGES = {
  // Flowers
  'flower_marigold_bunch.png': flowerMarigoldBunch,
  'flower_lotus_single.png': flowerLotusSingle,
  'flower_rose_petals.png': flowerRosePetals,
  'flower_petals.png': flowerPetals,
  
  // Garlands & Torans
  'garland_flower_leaf_mix.png': garlandFlowerLeafMix,
  'garland_jasmine.png': garlandJasmine,
  'garland_mixed_chain.png': garlandMixedChain,
  'toran_fabric_flowers.png': toranFabricFlowers,
  
  // Lights & Diyas
  'diya_clay_traditional.png': diyaClayTraditional,
  'diya_painted_decorative.png': diyaPaintedDecorative,
  'diya_golden_ornate.png': diyaGoldenOrnate,
  'lights_string_festival.png': lightsStringFestival,
  'lights_paper_lanterns.png': lightsPaperLanterns,
  
  // Offerings
  'offering_coconut.png': offeringCoconut,
  'offering_fruits_plate.png': offeringFruitsPlate,
  'offering_sweets_modak.png': offeringSweetsModak,
  'offering_incense_sticks.png': offeringIncenseSticks,
  
  // Special
  'special_rangoli_base.png': specialRangoliBase,
  'special_kalash_pot.png': specialKalashPot,
  'special_peacock_feathers.png': specialPeacockFeathers,
  'special_fabric_draping.png': specialFabricDraping,
  
  // Fun
  'fun_balloons_cluster.png': funBalloonsCluster,
  'fun_streamers_flowing.png': funStreamersFlowing,
  'fun_bunting_colorful.png': funBuntingColorful,
  'fun_confetti_scatter.png': funConfettiScatter
};

// Mandap zones configuration
const MANDAP_ZONES = {
  'roof-left': { x: 15, y: 8, width: 15, height: 12 },
  'roof-center': { x: 35, y: 8, width: 30, height: 12 },
  'roof-right': { x: 70, y: 8, width: 15, height: 12 },
  'entrance-arch': { x: 30, y: 18, width: 40, height: 8 },
  'pillar-left': { x: 20, y: 25, width: 12, height: 35 },
  'pillar-right': { x: 68, y: 25, width: 12, height: 35 },
  'altar-left-flowers': { x: 20, y: 48, width: 14, height: 10 },
  'altar-left-coconut': { x: 20, y: 60, width: 14, height: 10 },
  'altar-center-diya': { x: 37, y: 54, width: 12, height: 10 },
  'altar-center-modak': { x: 51, y: 54, width: 12, height: 10 },
  'altar-right': { x: 66, y: 50, width: 14, height: 15 },
  'base-floor': { x: 30, y: 72, width: 40, height: 15 }
};

// Decoration categories
const DECORATION_CATEGORIES = {
  FLOWERS: {
    name: 'Flowers',
    icon: '🌸',
    items: [
      {
        id: 'marigold_bunch',
        name: 'Marigold Bunch',
        image: 'flower_marigold_bunch.png',
        culturalNote: 'Sacred festival flowers!',
        childFriendly: 'Bright orange flowers!',
        validZones: ['altar-left-flowers', 'altar-right', 'pillar-left', 'pillar-right', 'entrance-arch']
      },
      {
        id: 'lotus_single',
        name: 'Lotus Flower',
        image: 'flower_lotus_single.png',
        culturalNote: 'Symbol of purity',
        childFriendly: 'Beautiful pink flower!',
        validZones: ['altar-left-flowers', 'altar-right', 'base-floor']
      },
      {
        id: 'rose_petals',
        name: 'Rose Petals',
        image: 'flower_rose_petals.png',
        culturalNote: 'Offerings of devotion',
        childFriendly: 'Soft flower petals!',
        validZones: ['altar-left-flowers', 'altar-right', 'base-floor']
      },
      {
        id: 'jasmine_garland',
        name: 'Jasmine Garland',
        image: 'flower_jasmine_garland.png',
        culturalNote: 'Fragrant temple decoration',
        childFriendly: 'Sweet-smelling white flowers!',
        validZones: ['entrance-arch', 'pillar-left', 'pillar-right']
      },
      {
        id: 'flower_petals',
        name: 'Mixed Petals',
        image: 'flower_petals.png',
        culturalNote: 'Colorful blessings',
        validZones: ['base-floor', 'altar-left-flowers', 'altar-right']
      },
      {
        id: 'flower_leaf_mix',
        name: 'Flower & Leaf Mix',
        image: 'flower_leaf_mix.png',
        culturalNote: 'Natural decoration',
        validZones: ['base-floor', 'entrance-arch']
      }
    ]
  },
  GARLANDS: {
    name: 'Garlands & Torans',
    icon: '🌿',
    items: [
      {
        id: 'jasmine_garland_long',
        name: 'Jasmine Garland',
        image: 'garland_jasmine.png',
        culturalNote: 'Welcome garland',
        validZones: ['entrance-arch', 'roof-center']
      },
      {
        id: 'toran_mango',
        name: 'Mango Leaf Toran',
        image: 'toran_mango.png',
        culturalNote: 'Prosperity symbol',
        childFriendly: 'Lucky mango leaves!',
        validZones: ['entrance-arch', 'roof-center']
      },
      {
        id: 'toran_fabric_flowers',
        name: 'Fabric Flower Toran',
        image: 'toran_fabric_flowers.png',
        culturalNote: 'Decorative welcome',
        validZones: ['entrance-arch', 'roof-left', 'roof-right']
      }
    ]
  },
  LIGHTS: {
    name: 'Lights & Diyas',
    icon: '🪔',
    items: [
      {
        id: 'clay_traditional',
        name: 'Traditional Clay Diya',
        image: 'diya_clay_traditional.png',
        culturalNote: 'Ancient tradition of light defeating darkness!',
        childFriendly: 'Magic lamp!',
        validZones: ['altar-left-flowers', 'altar-center-diya', 'altar-right', 'base-floor'],
        hasLightEffect: true
      },
      {
        id: 'painted_decorative',
        name: 'Painted Diya',
        image: 'diya_painted_decorative.png',
        culturalNote: 'Decorated for festivals',
        validZones: ['altar-left-flowers', 'altar-center-diya', 'altar-right'],
        hasLightEffect: true
      },
      {
        id: 'golden_ornate',
        name: 'Golden Diya',
        image: 'diya_golden_ornate.png',
        culturalNote: 'Special occasion light',
        childFriendly: 'Shiny golden lamp!',
        validZones: ['altar-center-diya', 'altar-right'],
        hasLightEffect: true
      },
      {
        id: 'string_festival',
        name: 'Festival String Lights',
        image: 'lights_string_festival.png',
        culturalNote: 'Modern celebration lights',
        validZones: ['roof-left', 'roof-center', 'roof-right'],
        hasLightEffect: true
      },
      {
        id: 'paper_lanterns',
        name: 'Paper Lanterns',
        image: 'lights_paper_lanterns.png',
        culturalNote: 'Colorful hanging lights',
        validZones: ['roof-left', 'roof-center', 'roof-right'],
        hasLightEffect: true
      }
    ]
  },
  OFFERINGS: {
    name: 'Offerings',
    icon: '🥥',
    items: [
      {
        id: 'coconut',
        name: 'Coconut',
        image: 'offering_coconut.png',
        culturalNote: 'Breaking coconut removes obstacles',
        childFriendly: 'Special brown fruit!',
        validZones: ['altar-left-coconut', 'altar-right', 'base-floor']
      },
      {
        id: 'fruits_plate',
        name: 'Fruit Plate',
        image: 'offering_fruits_plate.png',
        culturalNote: 'Sweet offerings',
        validZones: ['altar-left-coconut', 'altar-right']
      },
      {
        id: 'sweets_modak',
        name: 'Modak Sweets',
        image: 'offering_sweets_modak.png',
        culturalNote: "Ganesha's favorite sweet!",
        childFriendly: 'Yummy treats!',
        validZones: ['altar-center-modak', 'altar-right']
      },
      {
        id: 'incense_sticks',
        name: 'Incense Sticks',
        image: 'offering_incense_sticks.png',
        culturalNote: 'Fragrant prayers',
        validZones: ['altar-left-coconut', 'altar-center-diya', 'altar-right']
      }
    ]
  },
  SPECIAL: {
    name: 'Special',
    icon: '✨',
    items: [
      {
        id: 'rangoli_base',
        name: 'Rangoli Design',
        image: 'special_rangoli_base.png',
        culturalNote: 'Welcome art on the floor',
        childFriendly: 'Colorful floor art!',
        validZones: ['base-floor']
      },
      {
        id: 'kalash_pot',
        name: 'Kalash Pot',
        image: 'special_kalash_pot.png',
        culturalNote: 'Sacred water vessel',
        childFriendly: 'Special decorated pot!',
        validZones: ['altar-left-coconut', 'altar-right', 'base-floor']
      },
      {
        id: 'peacock_feathers',
        name: 'Peacock Feathers',
        image: 'special_peacock_feathers.png',
        culturalNote: 'Symbol of beauty and grace',
        childFriendly: 'Pretty bird feathers!',
        validZones: ['pillar-left', 'pillar-right', 'roof-center']
      }
    ]
  },
  FUN: {
    name: 'Fun Celebration',
    icon: '🎉',
    items: [
      {
        id: 'balloons_cluster',
        name: 'Balloon Cluster',
        image: 'fun_balloons_cluster.png',
        culturalNote: 'Party decoration',
        validZones: ['roof-left', 'roof-right', 'pillar-left', 'pillar-right']
      },
      {
        id: 'streamers_flowing',
        name: 'Flowing Streamers',
        image: 'fun_streamers_flowing.png',
        culturalNote: 'Colorful celebration',
        validZones: ['roof-left', 'roof-center', 'roof-right']
      },
      {
        id: 'bunting_colorful',
        name: 'Colorful Bunting',
        image: 'fun_bunting_colorful.png',
        culturalNote: 'Festive flags',
        validZones: ['entrance-arch', 'roof-center']
      }
    ]
  }
};

// Missions configuration
const MISSIONS = [
  {
    id: 'puja-prep',
    name: 'Puja Prep',
    icon: '🙏',
    description: 'Get ready for Ganesha\'s blessing ceremony!',
    difficulty: 1,
    unlocked: true,
    steps: [
      {
        step: 1,
        item: 'marigold_bunch',
        category: 'FLOWERS',
        zone: 'altar-left-flowers',
        instruction: "Place flowers on the left altar",
        successMessage: "Beautiful! Flowers make Ganesha happy!",
        culturalNote: "Marigolds are sacred flowers in Hindu pujas",
        emoji: '🌸'
      },
      {
        step: 2,
        item: 'coconut',
        category: 'OFFERINGS',
        zone: 'altar-left-coconut',
        instruction: "Add coconut to the left altar",
        successMessage: "Perfect! Coconuts represent purity!",
        culturalNote: "Breaking coconut removes obstacles",
        emoji: '🥥'
      },
      {
        step: 3,
        item: 'clay_traditional',
        category: 'LIGHTS',
        zone: 'altar-center-diya',
        instruction: "Light the diya next to Ganesha",
        successMessage: "Wonderful! The diya represents wisdom!",
        culturalNote: "Diyas guide the gods to our prayers",
        emoji: '🪔'
      },
      {
        step: 4,
        item: 'sweets_modak',
        category: 'OFFERINGS',
        zone: 'altar-center-modak',
        instruction: "Place modaks in the center",
        successMessage: "Yummy! Ganesha LOVES modaks!",
        culturalNote: "Modak is Ganesha's favorite food",
        emoji: '🍬'
      },
      {
        step: 5,
        item: 'rangoli_base',
        category: 'SPECIAL',
        zone: 'base-floor',
        instruction: "Create rangoli on the floor",
        successMessage: "Amazing! The puja space is ready!",
        culturalNote: "Rangoli welcomes guests with colors",
        emoji: '🌈'
      }
    ]
  },
  {
    id: 'fix-mandap',
    name: 'Fix the Mandap',
    icon: '🔧',
    description: 'Wind blew decorations everywhere!',
    difficulty: 2,
    unlocked: true,
    type: 'fix',
    wrongPlacements: [
      { id: 'marigold_bunch', wrongZone: 'base-floor', correctZone: 'pillar-left' },
      { id: 'clay_traditional', wrongZone: 'roof-center', correctZone: 'altar-center-diya' },
      { id: 'coconut', wrongZone: 'pillar-right', correctZone: 'altar-left-coconut' },
      { id: 'jasmine_garland', wrongZone: 'altar-right', correctZone: 'entrance-arch' },
      { id: 'rose_petals', wrongZone: 'roof-left', correctZone: 'pillar-right' }
    ]
  },
{
  id: 'eco-mandap',
  name: 'Eco Mandap',
  icon: '🌿',
  description: "Let's make a nature-friendly mandap!",
  difficulty: 2,
  unlocked: true,
  type: 'eco',
  ecoItems: [
    // Flowers - ALL ECO
    'marigold_bunch', 
    'rose_petals', 
    'lotus_single', 
    'flower_petals',
    
    // Garlands - Natural ones are ECO
    'jasmine_garland_long',
    'flower_leaf_mix',
    
    // Lights - Only CLAY diyas are ECO
    'clay_traditional',
    'painted_decorative',
    'golden_ornate',
    
    // Offerings - ALL ECO (natural food items)
    'coconut', 
    'fruits_plate', 
    'sweets_modak',
    'incense_sticks',
    
    // Special - Natural items are ECO
    'kalash_pot', 
    'peacock_feathers', 
    'rangoli_base'
  ],
  nonEcoItems: [
    // Garlands - Fabric/synthetic are NON-ECO
    'toran_fabric_flowers',
    'toran_mango',  // If using plastic mango leaves
    'garland_mixed_chain',  // If synthetic
    
    // Lights - Electric/battery/paper are NON-ECO
    'string_festival',
    'paper_lanterns',
    
    // Fun - ALL NON-ECO (plastic/paper)
    'balloons_cluster', 
    'streamers_flowing', 
    'bunting_colorful',
    'confetti_scatter',
    
    // Special - Synthetic items
    'fabric_draping'
  ],
  targetEcoCount: 5,
  maxNonEcoAllowed: 2
},
  {
    id: 'light-challenge',
    name: 'Light Challenge',
    icon: '💡',
    description: 'Illuminate the sacred space',
    difficulty: 3,
    unlocked: true,
    type: 'light',
    timeLimit: 60,
    items: [
      { id: 'clay_traditional', zone: 'altar-left-flowers' },
      { id: 'painted_decorative', zone: 'altar-center-diya' },
      { id: 'golden_ornate', zone: 'altar-right' },
      { id: 'string_festival', zone: 'roof-center' },
      { id: 'paper_lanterns', zone: 'pillar-right' }
    ]
  }
];

// Draggable component
function FreeDraggableItem({ children, initialPosition, isOutsideMandapArea, onPositionChange, onDragStart, onDragEnd }) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const handleDragStart = (clientX, clientY) => {
    const left = parseFloat(position.left);
    const top = parseFloat(position.top);
    setDragOffset({
      x: clientX - (left * window.innerWidth) / 100,
      y: clientY - (top * window.innerHeight) / 100
    });
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };

  const handleDragMove = (clientX, clientY) => {
    if (!isDragging) return;
    const newLeft = ((clientX - dragOffset.x) / window.innerWidth) * 100;
    const newTop = ((clientY - dragOffset.y) / window.innerHeight) * 100;
    const newPosition = { left: `${newLeft}%`, top: `${newTop}%` };
    setPosition(newPosition);
    if (onPositionChange) onPositionChange(newPosition);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
    if (isOutsideMandapArea && isOutsideMandapArea(position)) {
      // Handle deletion or return to original position
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 5,
        transition: isDragging ? 'none' : 'all 0.3s ease',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
}

// Main component
function MandapDecorationGame() {
  // Game state
  const [currentMode, setCurrentMode] = useState(GAME_MODES.INTRO);
  const [gameState, setGameState] = useState({
    selectedCategory: null,
    selectedDecoration: null,
    placedDecorations: new Map(),
    phase: PHASES.CHOOSING,
    decorationPositions: new Map()
  });

  // Mission state
  const [selectedMission, setSelectedMission] = useState(null);
  const [showMissionIntro, setShowMissionIntro] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [completedMissions, setCompletedMissions] = useState({});
  const [missionStars, setMissionStars] = useState(0);

  // UI state
  const [highlightedZones, setHighlightedZones] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [showStepSuccess, setShowStepSuccess] = useState(false);
  const [lastCompletedStep, setLastCompletedStep] = useState(null);
  const [showSparkle, setShowSparkle] = useState(null);
  const [guidanceMessage, setGuidanceMessage] = useState('');
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [nearDeleteZone, setNearDeleteZone] = useState(false);

  // Timeout management
  const timeouts = React.useRef([]);
  const safeSetTimeout = useCallback((callback, delay) => {
    const id = setTimeout(callback, delay);
    timeouts.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

// ALWAYS call mission hooks (they handle their own conditionals internally)
const pujaPrepMission = PujaPrepMission({
  selectedMission,
  currentStep,
  setCurrentStep,
  completedSteps,
  setCompletedSteps,
  setGuidanceMessage,
  setHighlightedZones,
  setShowStepSuccess,
  setLastCompletedStep,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  onComplete: () => {
    setCurrentMode(GAME_MODES.SELECTION);
  }
});

const fixMandapMission = FixMandapMission({
  selectedMission,
  gameState,
  setGameState,
  setGuidanceMessage,
  setHighlightedZones,
  setShowStepSuccess,
  setLastCompletedStep,
  setShowSparkle,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  DECORATION_CATEGORIES,
  onComplete: () => {
    setCurrentMode(GAME_MODES.SELECTION);
  },
  safeSetTimeout
});

const ecoMandapMission = EcoMandapMission({
  selectedMission,
  gameState,
  setGameState,
  setGuidanceMessage,
  setShowStepSuccess,
  setLastCompletedStep,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  onComplete: () => {
    setCurrentMode(GAME_MODES.SELECTION);
  },
  safeSetTimeout
});

const lightChallengeMission = LightChallengeMission({
  selectedMission,
  gameState,
  setGameState,
  setGuidanceMessage,
  setHighlightedZones,
  setShowStepSuccess,
  setLastCompletedStep,
  setMissionStars,
  setCompletedMissions,
  setSelectedMission,
  DECORATION_CATEGORIES,
  onComplete: () => {
    setCurrentMode(GAME_MODES.SELECTION);
  },
  safeSetTimeout
});

  // Helper functions
  const clearHighlights = () => {
    setHighlightedZones(new Set());
  };

  const getDecorationSize = (imageName) => {
    if (imageName.includes('toran') || imageName.includes('garland')) return '80px';
    if (imageName.includes('lights')) return '60px';
    if (imageName.includes('rangoli')) return '100px';
    return '50px';
  };

  // Handlers
  const handleCategorySelect = (categoryId) => {
    if (gameState.phase === PHASES.COMPLETE) return;

    const category = DECORATION_CATEGORIES[categoryId.toUpperCase()];
    if (!category) return;

    setGameState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      selectedDecoration: null,
      phase: PHASES.DECORATION
    }));

    clearHighlights();
  };

const handleDecorationSelect = (decoration) => {
  if (gameState.phase === PHASES.COMPLETE) return;

  setGameState(prev => ({
    ...prev,
    selectedDecoration: decoration
  }));

  // For Light Challenge, only highlight the next required zone
  if (selectedMission?.type === 'light' && lightChallengeMission) {
    const nextItem = lightChallengeMission.getNextRequiredItem();
    if (nextItem && decoration.id === nextItem.id) {
      setHighlightedZones(new Set([nextItem.zone]));
    } else if (nextItem) {
      // Wrong item selected, show guidance
      setGuidanceMessage(`Select ${getDecorationName(nextItem.id)} next!`);
      setHighlightedZones(new Set());
    }
  } 
  // For Eco Mandap, highlight valid zones
  else if (selectedMission?.type === 'eco') {
    const validZones = new Set(decoration.validZones);
    setHighlightedZones(validZones);
  }
  // Normal highlighting for other modes
  else {
    const validZones = new Set(decoration.validZones);
    setHighlightedZones(validZones);
  }
};

// Helper function to get decoration name
const getDecorationName = (itemId) => {
  const allItems = Object.values(DECORATION_CATEGORIES)
    .flatMap(cat => cat.items);
  const item = allItems.find(i => i.id === itemId);
  return item?.name || itemId;
};

  const handleZoneClick = (zoneId) => {
  // Fix mode handling
  if (selectedMission?.type === 'fix' && fixMandapMission) {
    const handled = fixMandapMission.handleFix(zoneId);
    if (handled !== false) return;
  }

  // Check if decoration selected and zone is valid
  if (!gameState.selectedDecoration || !highlightedZones.has(zoneId)) return;

  const decoration = gameState.selectedDecoration;
  
  // Puja Prep validation
  if (selectedMission?.id === 'puja-prep' && pujaPrepMission) {
    const isValid = pujaPrepMission.validatePlacement(decoration.id, zoneId);
    if (!isValid) {
      setGameState(prev => ({
        ...prev,
        selectedDecoration: null,
        selectedCategory: null
      }));
      clearHighlights();
      return;
    }
  }

  // Eco Mandap validation
  if (selectedMission?.type === 'eco' && ecoMandapMission) {
    const isValid = ecoMandapMission.validatePlacement(decoration.id, zoneId);
    if (!isValid) {
      // Don't place non-eco items
      setGameState(prev => ({
        ...prev,
        selectedDecoration: null,
        selectedCategory: null
      }));
      clearHighlights();
      return;
    }
    // If valid, continue to placement below
  }

  // Light Challenge validation
  if (selectedMission?.type === 'light' && lightChallengeMission) {
    const isValid = lightChallengeMission.validatePlacement(decoration.id, zoneId);
    if (!isValid) {
      setGameState(prev => ({
        ...prev,
        selectedDecoration: null,
        selectedCategory: null
      }));
      clearHighlights();
      return;
    }
    // If valid, continue to placement below
  }
  
  // ✅ PLACE DECORATION (for ALL modes after validation)
  const newPlacements = new Map(gameState.placedDecorations);
  const existing = newPlacements.get(zoneId);
  let updatedDecorations;
  
  if (Array.isArray(existing)) {
    updatedDecorations = [...existing, decoration];
  } else if (existing) {
    updatedDecorations = [existing, decoration];
  } else {
    updatedDecorations = [decoration];
  }
  
  newPlacements.set(zoneId, updatedDecorations);
  
  setGameState(prev => ({
    ...prev,
    placedDecorations: newPlacements,
    selectedDecoration: null,
    selectedCategory: null
  }));
  
  setShowSparkle(zoneId);
  safeSetTimeout(() => setShowSparkle(null), 1000);
  clearHighlights();
};

  const updateDecorationPosition = (decorationKey, newPosition) => {
    setGameState(prev => {
      const newPositions = new Map(prev.decorationPositions);
      newPositions.set(decorationKey, newPosition);
      return { ...prev, decorationPositions: newPositions };
    });
    const left = parseFloat(newPosition.left);
    setNearDeleteZone(left > 75);
  };

  const isInMission = currentMode === GAME_MODES.CHALLENGE && selectedMission;

  // Render intro screen
  if (currentMode === GAME_MODES.INTRO) {
    return (
      <div className="mandap-game-container">
        <div className="intro-screen">
          <div 
            className="intro-ganesha" 
            style={{ backgroundImage: `url(${ganeshaImage})` }}
          />
          <h1 className="intro-title">🪔 Mandap Decoration 🪔</h1>
          <p className="intro-subtitle">Help decorate the sacred space!</p>
          <button 
            className="intro-start-button"
            onClick={() => setCurrentMode(GAME_MODES.SELECTION)}
          >
            ✨ Let's Begin! ✨
          </button>
        </div>
      </div>
    );
  }

  // Render mode selection
  if (currentMode === GAME_MODES.SELECTION) {
    return (
      <div className="mandap-game-container">
        <div className="mode-selection-screen">
          <div 
            className="mode-ganesha" 
            style={{ backgroundImage: `url(${ganeshaImage})` }}
          />
          <h2 className="mode-title">🎯 Choose Your Adventure!</h2>
          
          <div className="mode-options">
            <div 
              className="mode-card"
              onClick={() => setCurrentMode(GAME_MODES.FREE_PLAY)}
            >
              <div className="mode-icon">🎨</div>
              <h3>Free Play</h3>
              <p>Decorate however you like!</p>
            </div>
            
            <div 
              className="mode-card"
              onClick={() => setCurrentMode(GAME_MODES.CHALLENGE)}
            >
              <div className="mode-icon">🎯</div>
              <h3>Decoration Missions</h3>
              <p>Complete fun challenges!</p>
              <div className="mode-stars">⭐ {missionStars} Stars</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render mission selection
  if (currentMode === GAME_MODES.CHALLENGE && !selectedMission) {
    return (
      <div className="mandap-game-container">
        <div className="mission-selection-screen">
          <div className="mission-header">
            <button
              className="mission-back"
              onClick={() => setCurrentMode(GAME_MODES.SELECTION)}
            >
              ← Back
            </button>
            <h1 className="mission-title">🎯 Decoration Missions</h1>
            <div className="mission-stars">⭐ {missionStars}</div>
          </div>
          
          <div className="missions-grid">
            {MISSIONS.map(mission => {
              const isCompleted = completedMissions[mission.id];
              
              return (
                <div 
                  key={mission.id}
                  className={`mission-card ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    setSelectedMission(mission);
                    setCurrentStep(1);
                    setCompletedSteps([]);
                    setShowMissionIntro(true);
                  }}
                >
                  <div className="mission-icon">{mission.icon}</div>
                  <h3 className="mission-name">{mission.name}</h3>
                  <p className="mission-description">{mission.description}</p>
                  <div className="mission-difficulty">
                    {Array.from({ length: mission.difficulty }).map((_, i) => (
                      <span key={i} className="star-filled">★</span>
                    ))}
                  </div>
                  {isCompleted && <div className="mission-completed-badge">✓</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render mission intro
  if (showMissionIntro && selectedMission) {
    return (
      <div className="mandap-game-container">
        <div className="mission-intro-overlay">
          <div className="mission-intro-content">
            <div 
              className="mission-intro-ganesha" 
              style={{ backgroundImage: `url(${ganeshaImage})` }}
            />
 <div className="mission-intro-speech">
  {selectedMission.type === 'fix' 
    ? "Oh no! The wind blew decorations to wrong spots! Can you fix them? Tap the RED items, then tap the GREEN spots!"
    : selectedMission.type === 'eco'
    ? "Let's protect Mother Earth! Choose only natural, eco-friendly decorations. Avoid plastic and artificial items! 🌿"
    : selectedMission.type === 'light'
    ? "Time to light up the mandap! Place all the diyas and lights quickly before time runs out! Ready, set, GO! 💡⏰"
    : "Let's prepare for my puja together! Follow my steps carefully!"}
</div>
            <button 
              className="mission-start-button"
              onClick={() => {
                setShowMissionIntro(false);
                if (selectedMission.type === 'fix') {
                  setGuidanceMessage('Tap the RED glowing decorations to fix them!');
                } else {
                  const firstStep = selectedMission.steps?.[0];
                  setGuidanceMessage(firstStep?.instruction || 'Let\'s begin!');
                }
              }}
            >
              🌸 Let's Begin!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game render
  if (currentMode === GAME_MODES.FREE_PLAY || (currentMode === GAME_MODES.CHALLENGE && selectedMission && !showMissionIntro)) {
    return (
      <div className={`mandap-decoration-container ${isDragging ? 'dragging-active' : ''}`}>
        {/* Background */}
        <div 
          className="mandap-background" 
          style={{
            backgroundImage: `url(${mandapBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />

        {/* Pause Button */}
        <button 
          className="game-pause-button"
          onClick={() => setShowPauseMenu(true)}
          aria-label="Pause Game"
        >
          ⏸️
        </button>

        {/* Mission Header */}
        {isInMission && (
      <MissionHeader
  selectedMission={selectedMission}
  currentStep={currentStep}
  completedSteps={completedSteps}
  fixedCount={fixMandapMission?.fixedCount || 0}
  selectedWrongItem={fixMandapMission?.selectedWrongItem}
  timeRemaining={lightChallengeMission?.timeRemaining || 0}
/>
        )}

        {/* Step Success Overlay */}
        {showStepSuccess && lastCompletedStep && (
          <div className="step-success-overlay" onClick={() => setShowStepSuccess(false)}>
            <div className="step-success-message">
              <h2>✨ {lastCompletedStep.emoji} Perfect!</h2>
              <p>{lastCompletedStep.successMessage}</p>
            </div>
          </div>
        )}
      
        {/* Main Mandap Structure */}
        <div className="mandap-structure">
          <img 
            src={mandapImage} 
            alt="Mandap Structure" 
            className="mandap-base-image"
          />
          
 {/* Clickable zones */}
{Object.entries(MANDAP_ZONES).map(([zoneId, zone]) => {
  const isFixMode = selectedMission?.type === 'fix';
  const isEcoMode = selectedMission?.type === 'eco';
  const isLightMode = selectedMission?.type === 'light';
  const missionData = getMissionData(selectedMission, currentStep, fixMandapMission?.fixedCount || 0);
  const isCorrectZone = !isFixMode && zoneId === missionData?.currentStepData?.zone;
  const hasDecorations = gameState.placedDecorations.has(zoneId);
  const isHighlighted = highlightedZones.has(zoneId);
  
  // Only hide zones for Puja Prep (step-based missions)
  if (isInMission && !isFixMode && !isEcoMode && !isLightMode && !isCorrectZone) {
    return null;
  }
            
            return (
              <div
                key={zoneId}
                className={`mandap-zone 
                  ${isHighlighted ? 'highlighted' : ''}
                  ${fixMandapMission?.selectedWrongItem?.correctZone === zoneId ? 'zone-target' : ''}`}
                onClick={() => handleZoneClick(zoneId)}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  pointerEvents: hasDecorations && !isHighlighted ? 'none' : 'auto'
                }}
              />
            );
          })}

          {/* Placed Decorations */}
          {Array.from(gameState.placedDecorations.entries()).map(([zoneId, decorations]) => {
            const decorationsArray = Array.isArray(decorations) ? decorations : [decorations];
            return decorationsArray.map((decoration, index) => {
              const zone = MANDAP_ZONES[zoneId];
              if (!zone) return null;

              const decorationKey = `${zoneId}-${decoration.id}-${index}`;
              const position = gameState.decorationPositions.get(decorationKey) || {
                left: `${zone.x + (zone.width / 2) - 5}%`,
                top: `${zone.y + (zone.height / 2) - 5}%`
              };

              const isFixMode = selectedMission?.type === 'fix';
              const isWrongItem = decoration.isWrong;
              const isSelected = fixMandapMission?.selectedWrongItem?.fixId === decoration.fixId;
              const isFixed = decoration.isFixed;

              return (
                <FreeDraggableItem
                  key={decorationKey}
                  initialPosition={position}
                  onPositionChange={(newPosition) => updateDecorationPosition(decorationKey, newPosition)}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                >
                  <img 
                    src={DECORATION_IMAGES[decoration.image]}
                    alt={decoration.name}
                    className={`decoration-image 
                      ${decoration.hasLightEffect ? 'glowing' : ''} 
                      ${isFixMode && isWrongItem && !isFixed ? 'decoration-wrong' : ''} 
                      ${isFixMode && isSelected ? 'decoration-selected' : ''}
                      ${isFixMode && isFixed ? 'decoration-fixed' : ''}`}
                    style={{ 
                      width: getDecorationSize(decoration.image), 
                      height: getDecorationSize(decoration.image), 
                      pointerEvents: isFixMode ? 'auto' : 'none'
                    }}
                    onClick={(e) => {
                      if (isFixMode && isWrongItem && !isFixed && fixMandapMission) {
                        e.stopPropagation();
                        fixMandapMission.handleWrongItemClick(decoration);
                      }
                    }}
                  />
                </FreeDraggableItem>
              );
            });
          })}

          {/* Sparkle Effects */}
          {showSparkle && (
            <div className="sparkle-effects">
              {MANDAP_ZONES[showSparkle] && (
                <div
                  className="zone-sparkles"
                  style={{
                    left: `${MANDAP_ZONES[showSparkle].x + MANDAP_ZONES[showSparkle].width/2}%`,
                    top: `${MANDAP_ZONES[showSparkle].y + MANDAP_ZONES[showSparkle].height/2}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="sparkle"
                      style={{
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

      {/* Ganesha Guidance Bubble - Only show in Puja Prep, not Fix mode 
{isInMission && guidanceMessage && !showStepSuccess && selectedMission?.type !== 'fix' && (
  <div className="ganesha-guidance">
    {guidanceMessage}
  </div>
)}*/}
        </div>

{/* Mission Sidebar - For Puja Prep, Fix Mandap, and Light Challenge */}
{/* Mission Sidebar - For Puja Prep and Fix Mandap ONLY */}
{isInMission && (selectedMission?.id === 'puja-prep' || selectedMission?.type === 'fix') && (
    <MissionSidebar
    selectedMission={selectedMission}
    currentStep={currentStep}
    completedSteps={completedSteps}
    fixedCount={fixMandapMission?.fixedCount || 0}
    wrongItemsMap={fixMandapMission?.wrongItemsMap || new Map()}
    selectedWrongItem={fixMandapMission?.selectedWrongItem}
    lightsPlaced={lightChallengeMission?.lightsPlaced || 0}
    onStepClick={(decorationData, zone) => {
      handleDecorationSelect(decorationData);
      setHighlightedZones(new Set([zone]));
    }}
    DECORATION_CATEGORIES={DECORATION_CATEGORIES}
    DECORATION_IMAGES={DECORATION_IMAGES}
  />
)}

{/* Free Play Style Sidebar - For Eco Mandap ONLY */}
{/* Free Play Style Sidebar - For Eco Mandap & Light Challenge */}
{isInMission && (selectedMission?.type === 'eco' || selectedMission?.type === 'light') && (  <>
{/* Free Play Inventory Tray */}
{!isInMission && (
  <>
    {/* Category Selection */}
    {!gameState.selectedCategory && (
      <div className="inventory-tray">
        <div className="categories-title">Choose Category:</div>
        <div className="category-buttons">
          {Object.entries(DECORATION_CATEGORIES).map(([key, category]) => (
            <div
              key={key}
              className="category-button"
              onClick={() => handleCategorySelect(key.toLowerCase())}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Item Selection */}
    {gameState.selectedCategory && (
      <div className={`inventory-tray ${isDragging ? 'dragging-active' : ''}`}>
        <div className="items-header">
          <button 
            className="back-button"
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                selectedCategory: null,
                selectedDecoration: null
              }));
              clearHighlights();
            }}
          >
            ← Back
          </button>
          <div className="items-title">
            {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.name}
          </div>
        </div>
        <div className="item-buttons">
          {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.items.map((item) => (
            <div
              key={item.id}
              className={`item-button ${gameState.selectedDecoration?.id === item.id ? 'selected' : ''}`}
              onClick={() => handleDecorationSelect(item)}
            >
              <img 
                src={DECORATION_IMAGES[item.image]} 
                alt={item.name}
                className="item-image"
              />
              <span className="item-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
)}
    {/* Category Selection */}
    {!gameState.selectedCategory && (
      <div className="inventory-tray">
        <div className="categories-title">
          {selectedMission.type === 'eco' ? 'Choose Eco Items:' : 'Choose Lights:'}
        </div>
        <div className="category-buttons">
          {selectedMission.type === 'eco' ? (
            // Show all categories for Eco
            Object.entries(DECORATION_CATEGORIES).map(([key, category]) => (
              <div
                key={key}
                className="category-button"
                onClick={() => handleCategorySelect(key.toLowerCase())}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </div>
            ))
          ) : (
            // Show only LIGHTS category for Light Challenge
            <div
              className="category-button"
              onClick={() => handleCategorySelect('lights')}
            >
              <span className="category-icon">🪔</span>
              <span className="category-name">Lights & Diyas</span>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Item Selection */}
    {gameState.selectedCategory && (
      <div className={`inventory-tray ${isDragging ? 'dragging-active' : ''}`}>
        <div className="items-header">
          <button 
            className="back-button"
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                selectedCategory: null,
                selectedDecoration: null
              }));
              clearHighlights();
            }}
          >
            ← Back
          </button>
          <div className="items-title">
            {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.name}
          </div>
        </div>
      <div className="item-buttons">
  {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.items.map((item) => {
    // For Light Challenge, highlight the next required item
    const isNextLight = selectedMission?.type === 'light' && 
                       lightChallengeMission.getNextRequiredItem()?.id === item.id;
            // Show eco/non-eco indicators for Eco mission
            const isEco = selectedMission.type === 'eco' && ecoMandapMission.isEcoItem(item.id);
            const isNonEco = selectedMission.type === 'eco' && ecoMandapMission.isNonEcoItem(item.id);
            
            return (
   <div
  key={item.id}
  className={`item-button 
    ${gameState.selectedDecoration?.id === item.id ? 'selected' : ''} 
    ${isEco ? 'eco-item' : ''} 
    ${isNonEco ? 'non-eco-item disabled' : ''}
    ${isNextLight ? 'next-light-item' : ''}`}
  onClick={() => {
    // Don't allow clicking non-eco items in Eco mission
    if (selectedMission?.type === 'eco' && isNonEco) {
      setGuidanceMessage('❌ Not eco-friendly! Choose green items only! 🌿');
      safeSetTimeout(() => {
        setGuidanceMessage('Choose only natural, eco-friendly items! 🌿');
      }, 2000);
      return;
    }
    handleDecorationSelect(item);
  }}
>
                <img 
                  src={DECORATION_IMAGES[item.image]} 
                  alt={item.name}
                  className="item-image"
                />
                <span className="item-name">
                  {item.name.split(' ')[0]}
                  {isEco && ' 🌿'}
                  {isNonEco && ' ❌'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </>
)}

        {/* Progress Display (Free Play) */}
        {!isInMission && (
          <div className="progress-display">
            <div className="progress-item">
              <span className="progress-icon">🛕</span>
              <span className="progress-value">{gameState.placedDecorations.size}</span>
            </div>
          </div>
        )}

        {/* Pause Menu */}
        {showPauseMenu && (
          <div className="pause-overlay">
            <div className="pause-menu">
              <h2>Game Paused</h2>
              <button onClick={() => setShowPauseMenu(false)}>Resume</button>
              <button onClick={() => {
                setShowPauseMenu(false);
                setCurrentMode(GAME_MODES.SELECTION);
                setGameState({
                  selectedCategory: null,
                  selectedDecoration: null,
                  placedDecorations: new Map(),
                  phase: PHASES.CHOOSING,
                  decorationPositions: new Map()
                });
                setSelectedMission(null);
                clearHighlights();
              }}>
                Exit to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default MandapDecorationGame;