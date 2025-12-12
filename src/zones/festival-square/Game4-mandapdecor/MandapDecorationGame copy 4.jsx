import React, { useState, useEffect, useRef } from 'react';
import './MandapDecorationGame.css';
import FreeDraggableItem from '../../../lib/components/interactive/FreeDraggableItem';
import FestivalSquareCompletion from '../components/FestivalSquareCompletion';
import GamePauseMenu from '../components/GamePauseMenu'; // 👈 ADD THIS
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';

import ganeshaImage from './assets/images/ganesha_happy_sitting.png';

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

import mandapImage from './assets/images/mandap.png';
import mandapBgImage from './assets/images/mandap-bg.png';
import decorationBadge from './assets/images/decoration-badge.png';

// Game modes
const GAME_MODES = {
  INTRO: 'intro',
  SELECTION: 'selection',
  FREE_PLAY: 'freePlay',
  CHALLENGE: 'challenge'
};

// Mission definitions
const MISSIONS = [
  {
    id: 'puja-prep',
    name: 'Puja Prep',
    icon: '🙏',
    description: 'Set up for the blessing ceremony',
    difficulty: 1,
    unlocked: true,
    requirements: {
      offering_coconut: 1,
      offering_incense_sticks: 1,
      diya_clay_traditional: 1
    }
  },
  {
    id: 'fix-mandap',
    name: 'Fix the Mandap',
    icon: '🔧',
    description: 'Complete the traditional decoration',
    difficulty: 2,
    unlocked: false,
    requirements: {
      garland_jasmine: 2,
      toran_fabric_flowers: 1,
      diya_painted_decorative: 2
    }
  },
  {
    id: 'eco-mandap',
    name: 'Eco Mandap',
    icon: '🌿',
    description: 'Use only natural decorations',
    difficulty: 2,
    unlocked: false,
    requirements: {
      flower_marigold_bunch: 2,
      flower_lotus_single: 1,
      special_rangoli_base: 1
    }
  },
  {
    id: 'light-challenge',
    name: 'Light Challenge',
    icon: '💡',
    description: 'Illuminate the sacred space',
    difficulty: 3,
    unlocked: false,
    requirements: {
      diya_golden_ornate: 2,
      lights_string_festival: 1,
      lights_paper_lanterns: 1
    }
  }
];

// CORRECTED Image mapping for 24 assets
const DECORATION_IMAGES = {
  'flower_marigold_bunch.png': flowerMarigoldBunch,
  'flower_rose_petals.png': flowerRosePetals,
  'flower_lotus_single.png': flowerLotusSingle,
  'flower_petals.png': flowerPetals,
  'garland_flower_leaf_mix.png': garlandFlowerLeafMix,
  'garland_jasmine.png': garlandJasmine,
  'toran_fabric_flowers.png': toranFabricFlowers,
  'garland_mixed_chain.png': garlandMixedChain,
  'diya_clay_traditional.png': diyaClayTraditional,
  'diya_painted_decorative.png': diyaPaintedDecorative,
  'diya_golden_ornate.png': diyaGoldenOrnate,
  'lights_string_festival.png': lightsStringFestival,
  'lights_paper_lanterns.png': lightsPaperLanterns,
  'offering_coconut.png': offeringCoconut,
  'offering_fruits_plate.png': offeringFruitsPlate,
  'offering_sweets_modak.png': offeringSweetsModak,
  'offering_incense_sticks.png': offeringIncenseSticks,
  'fun_bunting_colorful.png': funBuntingColorful,
  'fun_balloons_cluster.png': funBalloonsCluster,
  'fun_streamers_flowing.png': funStreamersFlowing,
  'fun_confetti_scatter.png': funConfettiScatter,
  'special_fabric_draping.png': specialFabricDraping,
  'special_peacock_feathers.png': specialPeacockFeathers,
  'special_kalash_pot.png': specialKalashPot,
  'special_rangoli_base.png': specialRangoliBase
};

// Save game state to localStorage
const saveGameState = (state) => {
  try {
    const saveData = {
      ...state,
      placedDecorations: Array.from(state.placedDecorations.entries()),
      decorationPositions: Array.from(state.decorationPositions.entries()),
      timestamp: Date.now()
    };
    localStorage.setItem('mandapGame', JSON.stringify(saveData));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
};

// Load game state from localStorage
const loadGameState = () => {
  try {
    const saved = localStorage.getItem('mandapGame');
    if (!saved) return null;
    
    const saveData = JSON.parse(saved);
    return {
      ...saveData,
      placedDecorations: new Map(saveData.placedDecorations || []),
      decorationPositions: new Map(saveData.decorationPositions || [])
    };
  } catch (error) {
    console.warn('Failed to load game state:', error);
    return null;
  }
};

// Game phases
const PHASES = {
  DISCOVERY: 'discovery',
  DECORATION: 'decoration', 
  GANESHA_ARRIVAL: 'ganesha_arrival',
  COMPLETE: 'complete'
};

// CORRECTED 6 Categories with 24 total items
const DECORATION_CATEGORIES = {
  FLOWERS: {
    id: 'flowers',
    name: 'Flowers',
    icon: '🌸',
    items: [
      {
        id: 'marigold_bunch',
        name: 'Marigold Bunch',
        image: 'flower_marigold_bunch.png',
        culturalNote: 'Marigolds bring prosperity and joy!',
        childFriendly: 'Sunshine flowers!',
        validZones: ['pillar-left', 'pillar-right', 'altar-left', 'altar-right', 'roof-left', 'roof-right']
      },
      {
        id: 'rose_petals',
        name: 'Rose Petals',
        image: 'flower_rose_petals.png',
        culturalNote: 'Rose petals show love and devotion!',
        childFriendly: 'Princess petals!',
        validZones: ['altar-left', 'altar-center', 'altar-right', 'base-floor']
      },
      {
        id: 'lotus_single',
        name: 'Sacred Lotus',
        image: 'flower_lotus_single.png',
        culturalNote: 'Lotus represents purity and enlightenment!',
        childFriendly: 'Magic water flower!',
        validZones: ['altar-center', 'altar-left', 'altar-right']
      },
      {
        id: 'flower_petals',
        name: 'Mixed Petals',
        image: 'flower_petals.png',
        culturalNote: 'Beautiful mixed petals create rainbow colors!',
        childFriendly: 'Rainbow petals!',
        validZones: ['base-floor', 'altar-left', 'altar-right']
      }
    ]
  },

  GARLANDS_TORANS: {
    id: 'garlands_torans',
    name: 'Garlands & Torans',
    icon: '🌿',
    items: [
      {
        id: 'flower_leaf_mix',
        name: 'Nature Mix Garland',
        image: 'garland_flower_leaf_mix.png',
        culturalNote: 'Nature\'s beautiful combination of flowers and leaves!',
        childFriendly: 'Garden party chains!',
        validZones: ['pillar-left', 'pillar-right', 'roof-center', 'entrance-arch']
      },
      {
        id: 'jasmine_garland',
        name: 'Jasmine Garland',
        image: 'garland_jasmine.png',
        culturalNote: 'Jasmine represents purity and peace!',
        childFriendly: 'Sweet-smelling necklace!',
        validZones: ['pillar-left', 'pillar-right', 'entrance-arch', 'altar-center']
      },
      {
        id: 'fabric_flowers_toran',
        name: 'Festive Fabric Toran',
        image: 'toran_fabric_flowers.png',
        culturalNote: 'Colorful decorations mark joyous celebrations!',
        childFriendly: 'Party streamers!',
        validZones: ['entrance-arch', 'roof-center']
      },
      {
        id: 'mixed_chain',
        name: 'Rainbow Flower Chain',
        image: 'garland_mixed_chain.png',
        culturalNote: 'Mixed flowers celebrate all of nature!',
        childFriendly: 'Rainbow flowers!',
        validZones: ['entrance-arch', 'roof-center', 'pillar-left', 'pillar-right']
      }
    ]
  },

  LIGHTS_DIYAS: {
    id: 'lights_diyas',
    name: 'Lights & Diyas',
    icon: '🪔',
    items: [
      {
        id: 'clay_traditional',
        name: 'Traditional Clay Diya',
        image: 'diya_clay_traditional.png',
        culturalNote: 'Ancient tradition of light defeating darkness!',
        childFriendly: 'Magic lamp!',
        validZones: ['altar-left', 'altar-center', 'altar-right', 'base-floor'],
        hasLightEffect: true
      },
      {
        id: 'painted_decorative',
        name: 'Painted Diya',
        image: 'diya_painted_decorative.png',
        culturalNote: 'Beautiful art shows our devotion!',
        childFriendly: 'Pretty painted light!',
        validZones: ['altar-left', 'altar-center', 'altar-right'],
        hasLightEffect: true
      },
      {
        id: 'golden_ornate',
        name: 'Golden Diya',
        image: 'diya_golden_ornate.png',
        culturalNote: 'Special golden light for celebrations!',
        childFriendly: 'Treasure lamp!',
        validZones: ['altar-center'],
        hasLightEffect: true
      },
      {
        id: 'string_festival',
        name: 'Festival String Lights',
        image: 'lights_string_festival.png',
        culturalNote: 'Modern lights spread joy throughout celebrations!',
        childFriendly: 'Twinkle lights!',
        validZones: ['roof-left', 'roof-center', 'roof-right', 'pillar-left', 'pillar-right'],
        hasLightEffect: true
      },
      {
        id: 'paper_lanterns',
        name: 'Colorful Paper Lanterns',
        image: 'lights_paper_lanterns.png',
        culturalNote: 'Lanterns create magical festive atmosphere!',
        childFriendly: 'Party balloons that glow!',
        validZones: ['roof-left', 'roof-right', 'entrance-arch'],
        hasLightEffect: true
      }
    ]
  },

  OFFERINGS: {
    id: 'offerings',
    name: 'Offerings',
    icon: '🥥',
    items: [
      {
        id: 'coconut',
        name: 'Sacred Coconut',
        image: 'offering_coconut.png',
        culturalNote: 'Coconut represents purity and prosperity!',
        childFriendly: 'Special treasure nut!',
        validZones: ['altar-left', 'altar-center', 'altar-right']
      },
      {
        id: 'fruits_plate',
        name: 'Fresh Fruits Plate',
        image: 'offering_fruits_plate.png',
        culturalNote: 'Fresh fruits show gratitude to the divine!',
        childFriendly: 'Yummy fruit platter!',
        validZones: ['altar-left', 'altar-center', 'altar-right']
      },
      {
        id: 'sweets_modak',
        name: 'Sweet Modaks',
        image: 'offering_sweets_modak.png',
        culturalNote: 'Modaks are Ganesha\'s favorite sweets!',
        childFriendly: 'Special festival treats!',
        validZones: ['altar-center', 'altar-left', 'altar-right']
      },
      {
        id: 'incense_sticks',
        name: 'Fragrant Incense',
        image: 'offering_incense_sticks.png',
        culturalNote: 'Incense carries our prayers to heaven!',
        childFriendly: 'Magic smoke sticks!',
        validZones: ['altar-left', 'altar-center', 'altar-right']
      }
    ]
  },

  FUN_CELEBRATION: {
    id: 'fun_celebration',
    name: 'Fun Celebration',
    icon: '🎉',
    items: [
      {
        id: 'bunting_colorful',
        name: 'Colorful Bunting',
        image: 'fun_bunting_colorful.png',
        culturalNote: 'Bright decorations spread joy everywhere!',
        childFriendly: 'Party flags!',
        validZones: ['roof-left', 'roof-right', 'entrance-arch', 'pillar-left', 'pillar-right']
      },
      {
        id: 'balloons_cluster',
        name: 'Balloon Cluster',
        image: 'fun_balloons_cluster.png',
        culturalNote: 'Balloons lift our spirits to celebrate!',
        childFriendly: 'Happy balloons!',
        validZones: ['pillar-left', 'pillar-right', 'roof-left', 'roof-right']
      },
      {
        id: 'streamers_flowing',
        name: 'Flowing Streamers',
        image: 'fun_streamers_flowing.png',
        culturalNote: 'Flowing decorations dance with joy!',
        childFriendly: 'Dancing ribbons!',
        validZones: ['roof-center', 'entrance-arch', 'pillar-left', 'pillar-right']
      },
      {
        id: 'confetti_scatter',
        name: 'Confetti Scatter',
        image: 'fun_confetti_scatter.png',
        culturalNote: 'Confetti celebrates special moments!',
        childFriendly: 'Party sparkles!',
        validZones: ['base-floor', 'altar-left', 'altar-right']
      }
    ]
  },

  SPECIAL: {
    id: 'special',
    name: 'Special',
    icon: '🎨',
    items: [
      {
        id: 'fabric_draping',
        name: 'Royal Fabric Draping',
        image: 'special_fabric_draping.png',
        culturalNote: 'Beautiful cloth shows respect for our divine guest!',
        childFriendly: 'Princess curtains!',
        validZones: ['pillar-left', 'pillar-right', 'roof-center']
      },
      {
        id: 'peacock_feathers',
        name: 'Beautiful Peacock Feathers',
        image: 'special_peacock_feathers.png',
        culturalNote: 'Peacock feathers represent divine beauty and grace!',
        childFriendly: 'Royal bird feathers!',
        validZones: ['altar-center', 'roof-center']
      },
      {
        id: 'kalash_pot',
        name: 'Sacred Kalash Pot',
        image: 'special_kalash_pot.png',
        culturalNote: 'Kalash represents abundance and prosperity!',
        childFriendly: 'Treasure pot!',
        validZones: ['altar-left', 'altar-right']
      },
      {
        id: 'rangoli_base',
        name: 'Sacred Floor Rangoli',
        image: 'special_rangoli_base.png',
        culturalNote: 'Rangoli patterns welcome good fortune!',
        childFriendly: 'Magic floor drawing!',
        validZones: ['base-floor']
      }
    ]
  }
};

// Mandap zones for placement
const MANDAP_ZONES = {
  'pillar-left': { name: 'Left Pillar', x: 15, y: 40, width: 12, height: 35 },
  'pillar-right': { name: 'Right Pillar', x: 73, y: 40, width: 12, height: 35 },
  'roof-left': { name: 'Left Roof', x: 20, y: 15, width: 15, height: 8 },
  'roof-center': { name: 'Center Roof', x: 42.5, y: 10, width: 15, height: 8 },
  'roof-right': { name: 'Right Roof', x: 65, y: 15, width: 15, height: 8 },
  'altar-left': { name: 'Left Altar', x: 25, y: 70, width: 15, height: 12 },
  'altar-center': { name: 'Center Altar', x: 42.5, y: 70, width: 15, height: 12 },
  'altar-right': { name: 'Right Altar', x: 60, y: 70, width: 15, height: 12 },
  'entrance-arch': { name: 'Entrance Arch', x: 42.5, y: 25, width: 15, height: 10 },
  'base-floor': { name: 'Base Floor', x: 30, y: 85, width: 40, height: 10 }
};

const MandapDecorationGame = ({ onComplete, onNavigate }) => {
  // Game state
  const [gameState, setGameState] = useState(() => {
    const savedState = loadGameState();
    if (savedState) {
      return savedState;
    }
    
    // Default state if no save exists
    return {
      phase: PHASES.DISCOVERY,
      selectedCategory: null,
      selectedDecoration: null,
      placedDecorations: new Map(),
      decorationPositions: new Map(),
      decorationCount: 0,
      stars: 0,
      gameStartTime: Date.now(),
      completed: false,
      showDoneButton: false
    };
  });

  // UI state
  const [highlightedZones, setHighlightedZones] = useState(new Set());
  const [showSparkle, setShowSparkle] = useState(null);
  const [showCulturalNote, setShowCulturalNote] = useState(null);
  const [milestoneSparkle, setMilestoneSparkle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [nearDeleteZone, setNearDeleteZone] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false); // 👈 ADD THIS

  const [currentMode, setCurrentMode] = useState(GAME_MODES.INTRO);
  const [selectedMission, setSelectedMission] = useState(null);
const [completedMissions, setCompletedMissions] = useState({});
const [unlockedMissions, setUnlockedMissions] = useState({ 'puja-prep': true });
const [missionStars, setMissionStars] = useState(0);


  // Get decoration size function
  const getDecorationSize = (imageName) => {
    const sizes = {
      // Garlands - Make these bigger since they're long
      'garland_jasmine.png': '90px',
      'garland_flower_leaf_mix.png': '100px', 
      'toran_fabric_flowers.png': '85px',
      'garland_mixed_chain.png': '95px',
      
      // Flowers - Keep moderate size
      'flower_marigold_bunch.png': '70px',
      'flower_rose_petals.png': '55px',
      'flower_lotus_single.png': '65px',
      'flower_petals.png': '50px',
      
      // Lights & Diyas - Vary by importance
      'diya_golden_ornate.png': '75px',        // Special diya bigger
      'diya_clay_traditional.png': '60px',
      'diya_painted_decorative.png': '65px',
      'lights_string_festival.png': '100px',
      'lights_paper_lanterns.png': '105px',
      
      // Offerings - Medium sizes
      'offering_coconut.png': '65px',
      'offering_fruits_plate.png': '70px',
      'offering_sweets_modak.png': '68px',
      'offering_incense_sticks.png': '60px',
      
      // Fun items - Playful sizes
      'fun_bunting_colorful.png': '80px',
      'fun_balloons_cluster.png': '85px',
      'fun_streamers_flowing.png': '90px',
      'fun_confetti_scatter.png': '45px',      // Smaller for confetti
      
      // Special items - Make these stand out
      'special_fabric_draping.png': '110px',   // Biggest
      'special_peacock_feathers.png': '105px', // Very big
      'special_kalash_pot.png': '80px',
      'special_rangoli_base.png': '95px'
    };
    
    return sizes[imageName] || '60px'; // Default size if not in list
  };

  // Audio management
  const audioContextRef = useRef(null);
  const timeoutsRef = useRef([]);

  // Initialize
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    };

    initAudio();
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto-save game state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Play placement sound
  const playPlacementSound = (decoration) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    const frequencies = [523, 659, 784]; // Pleasant chime
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start(now + index * 0.1);
      osc.stop(now + 0.5 + index * 0.1);
    });
  };

  // Handle category selection
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

  // Handle decoration selection
  const handleDecorationSelect = (decoration) => {
    if (gameState.phase === PHASES.COMPLETE) return;

    setGameState(prev => ({
      ...prev,
      selectedDecoration: decoration
    }));

    const validZones = new Set(decoration.validZones);
    setHighlightedZones(validZones);
  };

  // Handle zone click for placement
  const handleZoneClick = (zoneId) => {
    if (!gameState.selectedDecoration || !highlightedZones.has(zoneId)) return;

    const decoration = gameState.selectedDecoration;
    
    const newPlacements = new Map(gameState.placedDecorations);
    
    // Handle both old single decorations and new array format
    const existing = newPlacements.get(zoneId);
    let updatedDecorations;
    
    if (!existing) {
      // No decorations in this zone yet
      updatedDecorations = [decoration];
    } else if (Array.isArray(existing)) {
      // Already an array of decorations
      updatedDecorations = [...existing, decoration];
    } else {
      // Single decoration (old format) - convert to array
      updatedDecorations = [existing, decoration];
    }
    
    newPlacements.set(zoneId, updatedDecorations);

    const newCount = gameState.decorationCount + 1;
    const newStars = Math.min(8, Math.floor(newCount * 1.2));

    setGameState(prev => ({
      ...prev,
      placedDecorations: newPlacements,
      decorationCount: newCount,
      stars: newStars,
      selectedDecoration: null,
      selectedCategory: null
    }));

    // Play sound and show effects
    playPlacementSound(decoration);
    setShowSparkle(zoneId);

    // Show cultural note
    setShowCulturalNote({
      message: decoration.culturalNote,
      zone: MANDAP_ZONES[zoneId]
    });

    clearHighlights();

    // MILESTONE SPARKLES - trigger after 3-4 decorations
    if (newCount === 3 || newCount === 4) {
      safeSetTimeout(() => {
        setMilestoneSparkle(true);
        safeSetTimeout(() => {
          setMilestoneSparkle(false);
        }, 3000);
      }, 1500);
    }

    // Clear effects
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowCulturalNote(null);
    }, 3000);

    // Show done button after 6 decorations
    if (newCount >= 6 && !gameState.showDoneButton) {
      safeSetTimeout(() => {
        setGameState(prev => ({ ...prev, showDoneButton: true }));
      }, 2000);
    }
  };

  const isOutsideMandapArea = (position) => {
    const left = parseFloat(position.left);
    return left > 80; // Increase from 75 to 80 for smaller delete area
  };

  const clearHighlights = () => {
    setHighlightedZones(new Set());
  };

  // Position update handler
  const updateDecorationPosition = (decorationKey, newPosition) => {
    setGameState(prev => {
      const newPositions = new Map(prev.decorationPositions);
      newPositions.set(decorationKey, newPosition);
      return {
        ...prev,
        decorationPositions: newPositions
      };
    });
    // Check if near delete zone (right side)
    const left = parseFloat(newPosition.left);
    setNearDeleteZone(left > 75); // Trigger when 75% from left
  };

  // Show intro screen first
if (currentMode === GAME_MODES.INTRO) {
  return (
    <div className="mandap-game-container">
      <div className="intro-screen">
        <div 
          className="intro-ganesha" 
style={{ backgroundImage: `url(${ganeshaImage})` }}        />
        <div className="intro-speech-bubble">
          Welcome to the Mandap Decoration! Let's create a beautiful wedding canopy together!
        </div>
        <button 
          className="intro-begin-button"
          onClick={() => setCurrentMode(GAME_MODES.SELECTION)}
        >
          <span role="img" aria-label="flower">🌸</span>
          Let's Begin!
        </button>
      </div>
    </div>
  );
}

// Show mode selection screen
if (currentMode === GAME_MODES.SELECTION) {
  return (
    <div className="mandap-game-container">
      <div className="mode-selection-screen">
        <h2 className="mode-subtitle">Choose Your Decoration Adventure!</h2>
        <h1 className="mode-title">🏛️ Mandap Decoration 🏛️</h1>
        
        <div className="mode-cards">
          <div className="mode-card" onClick={() => setCurrentMode(GAME_MODES.FREE_PLAY)}>
            <div className="mode-icon">🎨</div>
            <h2>Free Play</h2>
            <p>Decorate the mandap however you like!</p>
            <button className="mode-button free-play-btn">Let's Decorate!</button>
          </div>
          
          <div className="mode-card" onClick={() => setCurrentMode(GAME_MODES.CHALLENGE)}>
            <div className="mode-icon">🎯</div>
            <h2>Challenge Mode</h2>
            <p>Complete special decoration missions!</p>
            <button className="mode-button challenge-btn">Start Challenge!</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Show mission selection when in Challenge mode
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
            const isUnlocked = mission.unlocked || unlockedMissions[mission.id];
            const isCompleted = completedMissions[mission.id];
            
            return (
              <div
                key={mission.id}
                className={`mission-card ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedMission(mission);
                    setCurrentMode(GAME_MODES.CHALLENGE);
                  }
                }}
              >
                <div className="mission-icon">{mission.icon}</div>
                <h3 className="mission-name">{mission.name}</h3>
                <p className="mission-description">{mission.description}</p>
                
                <div className="mission-difficulty">
                  {Array.from({ length: mission.difficulty }).map((_, i) => (
                    <span key={i} className="star-filled">⭐</span>
                  ))}
                </div>
                
                {isCompleted && <div className="mission-completed-badge">✓</div>}
                {!isUnlocked && (
                  <div className="mission-locked-badge">
                    <span className="lock-icon">🔒</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Your existing game return statement stays below this
if (currentMode === GAME_MODES.FREE_PLAY) {
  return (
    <div className={`mandap-decoration-container ${isDragging ? 'dragging-active' : ''}`}>
      {/* Background with mandap-bg image */}
      <div 
        className="mandap-background" 
        style={{
          backgroundImage: `url(${mandapBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* ADD PAUSE BUTTON HERE */}
<button 
  className="game-pause-button"
  onClick={() => setShowPauseMenu(true)}
  aria-label="Pause Game"
>
  ⏸️
</button>
      
      {/* Main Mandap Structure */}
      <div className="mandap-structure">
        <img 
          src={mandapImage} 
          alt="Mandap Structure" 
          className="mandap-base-image"
        />
        
        {/* Clickable zones */}
        {Object.entries(MANDAP_ZONES).map(([zoneId, zone]) => {
          const hasDecorations = gameState.placedDecorations.has(zoneId);
          const isHighlighted = highlightedZones.has(zoneId);
          
          return (
            <div
              key={zoneId}
              className={`mandap-zone ${isHighlighted ? 'highlighted' : ''}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
                pointerEvents: hasDecorations && !isHighlighted ? 'none' : 'auto'
              }}
              onClick={() => handleZoneClick(zoneId)}
            />
          );
        })}

        {/* Placed Decorations - WITH DRAGGING */}
        {Array.from(gameState.placedDecorations.entries()).map(([zoneId, decorations]) => {
          const decorationsArray = Array.isArray(decorations) ? decorations : [decorations];
          return decorationsArray.map((decoration, index) => {
            const zone = MANDAP_ZONES[zoneId];
            const decorationKey = `decoration-${zoneId}-${index}`;
            
            // Get current position (from state or calculate initial)
            const currentPosition = gameState.decorationPositions?.get(decorationKey) || {
              top: `${zone.y + zone.height/2 + Math.floor(index / 3) * 3}%`,
              left: `${zone.x + zone.width/2 + (index % 3) * 3}%`
            };
            
            return (
              <FreeDraggableItem
                key={decorationKey}
                id={decorationKey}
                position={currentPosition}
                dragDelay={150}
                style={{ zIndex: 25 }}
                onPositionChange={(newPosition) => updateDecorationPosition(decorationKey, newPosition)}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
              >
                <img 
                  src={DECORATION_IMAGES[decoration.image]}
                  alt={decoration.name}
                  className={`decoration-image ${decoration.hasLightEffect ? 'glowing' : ''}`}
                  style={{ 
                    width: getDecorationSize(decoration.image), 
                    height: getDecorationSize(decoration.image), 
                    pointerEvents: 'none' 
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

        {/* Milestone Sparkles */}
        {milestoneSparkle && (
          <div className="milestone-sparkle-effects">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="celebration-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Simple Ganesha Character - Peaceful Observer */}
<div className="ganesha-simple">
  <div 
    className="ganesha-simple-image" 
    style={{ backgroundImage: `url(${ganeshaImage})` }}
  />
</div>

      {/* Cultural Note Display */}
      {showCulturalNote && (
        <div 
          className="cultural-note-display"
          style={{
            left: `${showCulturalNote.zone.x + showCulturalNote.zone.width/2}%`,
            top: `${showCulturalNote.zone.y - 5}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {showCulturalNote.message}
        </div>
      )}

      {/* Inventory Tray - Categories */}
      {!gameState.selectedCategory && gameState.phase !== PHASES.COMPLETE && (
        <div className="inventory-tray">
          <div className="categories-title">Choose Decorations:</div>
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

      {/* Inventory Tray - Items */}
      {gameState.selectedCategory && gameState.phase !== PHASES.COMPLETE && (
        <div 
          className={`inventory-tray ${isDragging ? 'dragging-active' : ''}`}
        >
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
                <span className="item-name">{item.childFriendly}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Zone */}
      {isDragging && nearDeleteZone && (
        <div className="delete-zone-boundaries">
          <div className="delete-zone-right">
            <span className="delete-zone-text">Drag here to delete</span>
          </div>
        </div>
      )}

      {/* Progress Display */}
      <div className="progress-display">
        <div className="progress-item">
          <span className="progress-icon">⭐</span>
          <span className="progress-value">{gameState.stars}</span>
        </div>
        <div className="progress-item">
          <span className="progress-icon">🎎</span>
          <span className="progress-value">{gameState.decorationCount}</span>
        </div>
      </div>

      {/* Start Over Button 
      <div className="start-over-button" onClick={() => {
        // Clear saved game
        localStorage.removeItem('mandapGame');
        
        // Reset everything
        setGameState({
          phase: PHASES.DISCOVERY,
          selectedCategory: null,
          selectedDecoration: null,
          placedDecorations: new Map(),
          decorationPositions: new Map(),
          decorationCount: 0,
          stars: 0,
          gameStartTime: Date.now(),
          completed: false,
          showDoneButton: false
        });
        setHighlightedZones(new Set());
        setShowSparkle(null);
        setShowCulturalNote(null);
        setMilestoneSparkle(false);
        setIsDragging(false);
      }}>
        <span>🔄</span>
        <span>Start Over</span>
      </div>

      {/* Done Decorating Button 
      {gameState.showDoneButton && !gameState.completed && (
        <div className="done-decorating-button" onClick={() => {
          setGameState(prev => ({ ...prev, completed: true }));
          
          // Show completion after shorter delay
          safeSetTimeout(() => {
            setShowSceneCompletion(true);
          }, 1500);
        }}>
          <span>🛕</span>
          <span>My Mandap is Ready!</span>
        </div>
      )}

      {/* Done Decorating Button 
{gameState.showDoneButton && !gameState.completed && (
  <div className="done-decorating-button" onClick={() => {
    setGameState(prev => ({ ...prev, completed: true }));
    
    // Show completion after shorter delay
    safeSetTimeout(() => {
      setShowSceneCompletion(true);
    }, 1500);
  }}>
    <span>🛕</span>
    <span>My Mandap is Ready!</span>
  </div>
)}

{/* ADD GAME PAUSE MENU HERE */}
<GamePauseMenu
  show={showPauseMenu}
  gameName="Mandap Decoration"
  currentStars={gameState.stars}
  hasDesignOption={false}  // 👈 FALSE - no design selection
  
  onResume={() => setShowPauseMenu(false)}
  
  onRestart={() => {
    setShowPauseMenu(false);
    // Use your existing reset logic from "Start Over" button
    setGameState({
      phase: 'intro',
      placedDecorations: new Map(),
      decorationPositions: new Map(),
      stars: 0,
      showDoneButton: false,
      completed: false
    });
    setHighlightedZones(new Set());
    setShowSparkle(null);
    setShowCulturalNote(null);
    setMilestoneSparkle(false);
    setShowSceneCompletion(false);
    setNearDeleteZone(false);
    
    localStorage.removeItem('mandapGame');
  }}
  
  onComplete={() => {
    setShowPauseMenu(false);
    // Trigger completion
    setGameState(prev => ({ ...prev, completed: true }));
    safeSetTimeout(() => {
      setShowSceneCompletion(true);
    }, 1500);
  }}
/>



      {/* Festival Square Completion */}
      {showSceneCompletion && (
        <FestivalSquareCompletion
          show={showSceneCompletion}
          sceneName="Mandap Decoration"
          sceneNumber={1}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={8}
          discoveredBadges={['decoration']}
          badgeImages={{
            decoration: decorationBadge
          }}
characterImages={{
  ganeshaMusician: ganeshaImage
}}
       nextSceneName="Modak Cooking"
          childName="little decorator"
         onContinue={() => {
  console.log('🏛️ MANDAP CONTINUE: Completed all Festival games!');
  
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'festival-square', 'game4', {
      completed: true,
      stars: gameState.stars,
      badges: { decoration: true }
    });
    
    GameStateManager.saveGameState('festival-square', 'game4', {
      completed: true,
      stars: gameState.stars,
      badges: { decoration: true }
    });
    
    console.log('✅ MANDAP CONTINUE: Completion data saved');
    console.log('🎉 ALL FESTIVAL SQUARE GAMES COMPLETED!');
  }
  
  // Clear current scene since zone is complete
  setTimeout(() => {
    SimpleSceneManager.clearCurrentScene();
    console.log('✅ MANDAP: Festival Square zone completed');
    
    // Navigate back to zone selection or home
    onNavigate?.('zone-complete');
  }, 100);
}}

onReplay={() => {
  console.log('🎮 MANDAP REPLAY: Play Again');
  
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    // Clear ALL storage
    localStorage.removeItem(`temp_session_${profileId}_festival-square_game4`);
    localStorage.removeItem(`replay_session_${profileId}_festival-square_game4`);
    localStorage.removeItem(`play_again_${profileId}_festival-square_game4`);
    localStorage.removeItem('mandapGame');
    
    SimpleSceneManager.setCurrentScene('festival-square', 'game4', false, false);
    console.log('🗑️ MANDAP: All storage cleared');
  }
  
  // RESET ALL GAME STATE - fresh start
  setGameState({
    phase: 'intro',
    placedDecorations: new Map(),
    decorationPositions: new Map(),
    stars: 0,
    showDoneButton: false,
    completed: false
  });
  setHighlightedZones(new Set());
  setShowSparkle(null);
  setShowCulturalNote(null);
  setMilestoneSparkle(false);
  setShowSceneCompletion(false);
  setNearDeleteZone(false);
  
  console.log('🔄 MANDAP: Game reset complete');
}}

onBackToMap={() => {
  console.log('🗺️ MANDAP MAP: Back to Festival Square');
  
  // Clear current scene tracking
  SimpleSceneManager.clearCurrentScene();
  
  if (onNavigate) {
    onNavigate('zone-welcome'); // Goes to Festival Square zone welcome
  }
}}

onHome={() => {
  if (onNavigate) {
    onNavigate('home');
  }
}}
        />
      )}

      <TocaBocaNav
  onHome={() => {
    if (onNavigate) onNavigate('home');
  }}
  onProgress={() => {
    console.log('Show festival progress');
  }}
  onHelp={() => console.log('Show help')}
  onParentMenu={() => console.log('Parent menu')}
  isAudioOn={true}
  onAudioToggle={() => console.log('Toggle audio')}
  onZonesClick={() => {
    if (onNavigate) onNavigate('zones');
  }}
  onStartFresh={() => {
    // Reset entire decoration game
    localStorage.removeItem('mandapGame');
    
    setGameState({
      phase: 'intro',
      placedDecorations: new Map(),
      decorationPositions: new Map(),
      stars: 0,
      showDoneButton: false,
      completed: false
    });
    setHighlightedZones(new Set());
    setShowSparkle(null);
    setShowCulturalNote(null);
    setMilestoneSparkle(false);
    setShowSceneCompletion(false);
    setNearDeleteZone(false);
  }}
  currentProgress={{
    stars: gameState.stars || 0,
    completed: gameState.completed ? 1 : 0,
    total: 1
  }}
/>
      
    </div>
  );
}

// If somehow no mode matches, show loading
return <div>Loading...</div>;
};

export default MandapDecorationGame;