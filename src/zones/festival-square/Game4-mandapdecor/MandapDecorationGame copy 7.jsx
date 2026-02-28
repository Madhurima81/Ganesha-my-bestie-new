import React, { useState, useEffect, useRef } from 'react';
import './MandapDecorationGame.css';
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT

import FreeDraggableItem from '../../../lib/components/interactive/FreeDraggableItem';
import FestivalSquareCompletion from '../components/FestivalSquareCompletion';
import GamePauseMenu from '../components/GamePauseMenu'; // 👈 ADD THIS
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';

// Mission Completion Overlay Component
const MissionCompletionOverlay = ({ 
  show, 
  missionName, 
  starsEarned, 
  totalTime,
  onPlayAgain, 
  onTryAnother 
}) => {
  if (!show) return null;

  return (
    <div className="mission-completion-overlay">
      <div className="completion-sparkles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="completion-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ⭐
          </div>
        ))}
      </div>
      
  <div className="decor-completion-card">
  <div 
    className="completion-ganesha"
    style={{ backgroundImage: `url(${ganeshaImage})` }}
  />
  
  <div className="completion-message">
    <h1 className="completion-title">Mission Complete!</h1>
    <p className="completion-subtitle">{missionName}</p>
    
    <div className="completion-stars">
      {Array.from({ length: starsEarned }).map((_, i) => (
        <span key={i} className="star-earned">⭐</span>
      ))}
    </div>
    
    <p className="completion-blessing">
      "Well done, little decorator! Your devotion shines bright!"
    </p>
    
    {totalTime && (
      <p className="completion-time">⏱️ Time: {totalTime}s</p>
    )}
  </div>
  
  <div className="completion-buttons">
    {/* NEW CLASS NAMES HERE */}
    <button className="decor-btn-green" onClick={onTryAnother}>
      <span className="btn-icon">🔄</span>
      <span className="btn-text">Try Another!</span>
    </button>
    
    <button className="decor-btn-orange" onClick={onPlayAgain}>
      <span className="btn-icon">🎯</span>
      <span className="btn-text">Play Again!</span>
    </button>
  </div>
</div>
    </div>
  );
};


// Opening Modal Component for Mandap
const OpeningModal = ({ show, onStart }) => {
  if (!show) return null;

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        {/* Character - Left Side */}
        <div className="game-modal-character">
          <img 
            src={ganeshaImage}
            alt="Ganesha"
          />
        </div>

        {/* Card - Right Side */}
        <div className="game-modal-card">
          <h1 className="game-modal-title">Mandap Time! 🏛️</h1>
          <p className="game-modal-subtitle">
            Let's create a beautiful wedding canopy together!
          </p>

          {/* Icons Grid */}
          <div className="game-modal-icons">
            <div className="game-modal-icon-item">
              <img src="/assets/festival-square/icons/mandap-learn-icon.png" alt="Learn" />
              <span className="game-modal-icon-label">Learn</span>
            </div>
            <div className="game-modal-icon-item">
              <img src="/assets/festival-square/icons/mandap-build-icon.png" alt="Build" />
              <span className="game-modal-icon-label">Build</span>
            </div>
            <div className="game-modal-icon-item">
              <img src="/assets/festival-square/icons/mandap-decorate-icon.png" alt="Decorate" />
              <span className="game-modal-icon-label">Decorate</span>
            </div>
          </div>

          {/* Let's Play Button */}
          <button className="game-modal-button" onClick={onStart}>
            Let's Build!
          </button>
        </div>
      </div>
    </div>
  );
};
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

// Helper function to get mission-specific data
export function getMissionData(selectedMission, currentStep, progressCount = 0) {
  if (!selectedMission) return null;

  // Fix Mandap Mission
  if (selectedMission.type === 'fix') {
    return {
      type: 'fix',
      currentProgress: progressCount,
      totalSteps: selectedMission.wrongPlacements?.length || 5,
      instruction: 'Tap RED decorations, then GREEN spots!'
    };
  }

  // Eco Mandap Mission
  if (selectedMission.type === 'eco') {
    return {
      type: 'eco',
      currentProgress: progressCount,
      totalSteps: selectedMission.targetEcoCount || 5,
      instruction: 'Choose only eco-friendly decorations!'
    };
  }

  // Light Challenge Mission
  if (selectedMission.type === 'light') {
    return {
      type: 'light',
      currentProgress: progressCount,
      totalSteps: selectedMission.items?.length || 5,
      instruction: 'Quick! Place lights before time runs out!'
    };
  }

  // Puja Prep Mission
// Puja Prep Mission
const currentStepData = selectedMission.steps?.[currentStep - 1];
return {
  type: 'steps',
  currentStepData,
  currentProgress: progressCount,  // ✅ Use progressCount parameter
  totalSteps: selectedMission.steps?.length || 5,
  instruction: currentStepData?.instruction || ''
};
}

// Game modes
const GAME_MODES = {
  INTRO: 'intro',
  SELECTION: 'selection',
  FREE_PLAY: 'freePlay',
  CHALLENGE: 'challenge'
};


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
      zone: 'altar-left-flowers',  // ✅ NEW ZONE
      instruction: "Place flowers on the left altar",
      successMessage: '"So pretty! Ganesha loves these flowers!"' ,
      culturalNote: "Marigolds are sacred flowers in Hindu pujas",
      emoji: '🌸'
    },
    {
      step: 2,
      item: 'coconut',
      category: 'OFFERINGS',
      zone: 'altar-left-coconut',  // ✅ NEW ZONE (below flowers)
      instruction: "Add coconut to the left altar",
      successMessage: '"Yay! The coconut is ready for puja!"' ,
      culturalNote: "Breaking coconut removes obstacles",
      emoji: '🥥'
    },
    {
      step: 3,
        item: 'golden_ornate',
      category: 'LIGHTS',
      zone: 'altar-center-diya',  // ✅ NEW ZONE (next to Ganesha)
      instruction: "Light the diya next to Ganesha",
      successMessage: '"Lovely! The diya is shining bright!"' ,
      culturalNote: "Diyas guide the gods to our prayers",
      emoji: '🪔'
    },
    {
      step: 4,
      item: 'sweets_modak',
      category: 'OFFERINGS',
      zone: 'altar-center-modak',  // ✅ NEW ZONE (next to diya)
      instruction: "Place modaks in the center",
      successMessage: "Yummy! Ganesha loves modaks!",
      culturalNote: "Modak is Ganesha's favorite food",
      emoji: '🍬'
    },
    {
      step: 5,
      item: 'rangoli_base',
      category: 'SPECIAL',
      zone: 'base-floor',  // ✅ Floor zone
      instruction: "Create rangoli on the floor",
      successMessage: "Amazing! Everything is ready for Ganesha!",
      culturalNote: "Rangoli welcomes guests with colors",
      emoji: '🌈'
    }
  ]
},
  // Keep your other missions the same
{
  id: 'fix-mandap',
  name: 'Fix the Mandap',
  icon: '🔧',
  description: 'Wind blew decorations everywhere!',
  difficulty: 2,
    unlocked: true,  // ✅ CHANGE FROM false TO true
  type: 'fix',
  wrongPlacements: [
    { id: 'string_festival', wrongZone: 'base-floor', correctZone: 'pillar-left' },
    { id: 'painted_decorative', wrongZone: 'roof-center', correctZone: 'altar-center-diya' },
    { id: 'fruits_plate', wrongZone: 'pillar-right', correctZone: 'altar-left-coconut' },
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
  type: 'light',  // ✅ ADD THIS!
  timeLimit: 60,  // ✅ ADD THIS!
  items: [        // ✅ ADD THIS!
    { id: 'clay_traditional', zone: 'altar-left' },
    { id: 'painted_decorative', zone: 'altar-center' },
    { id: 'golden_ornate', zone: 'altar-right' },
    { id: 'string_festival', zone: 'roof-center' },
    { id: 'paper_lanterns', zone: 'pillar-right' }
  ]
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
        name: 'Marigold Flowers',
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
        name: 'Lotus Flower',
        image: 'flower_lotus_single.png',
        culturalNote: 'Lotus represents purity and enlightenment!',
        childFriendly: 'Magic water flower!',
        validZones: ['altar-center', 'altar-left', 'altar-right']
      },
      {
        id: 'flower_petals',
        name: 'Colorful Petals',
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
        name: 'Flower & Leaf Garland',
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
        name: 'Festive Toran',
        image: 'toran_fabric_flowers.png',
        culturalNote: 'Colorful decorations mark joyous celebrations!',
        childFriendly: 'Party streamers!',
        validZones: ['entrance-arch', 'roof-center']
      },
      {
        id: 'mixed_chain',
        name: 'Rainbow Flower Garland',
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
        name: 'Clay Diya',
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
        name: 'String Lights',
        image: 'lights_string_festival.png',
        culturalNote: 'Modern lights spread joy throughout celebrations!',
        childFriendly: 'Twinkle lights!',
        validZones: ['roof-left', 'roof-center', 'roof-right', 'pillar-left', 'pillar-right'],
        hasLightEffect: true
      },
      {
        id: 'paper_lanterns',
        name: 'Paper Lanterns',
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
    name: 'Puja Items',
    icon: '🥥',
    items: [
      {
        id: 'coconut',
        name: 'Coconut',
        image: 'offering_coconut.png',
        culturalNote: 'Coconut represents purity and prosperity!',
        childFriendly: 'Special treasure nut!',
        validZones: ['altar-left', 'altar-center', 'altar-right']
      },
      {
        id: 'fruits_plate',
        name: 'Fruits Plate',
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
        name: 'Incense Sticks',
        image: 'offering_incense_sticks.png',
        culturalNote: 'Incense carries our prayers to heaven!',
        childFriendly: 'Magic smoke sticks!',
        validZones: ['altar-left', 'altar-center', 'altar-right']
      }
    ]
  },

  FUN_CELEBRATION: {
    id: 'fun_celebration',
    name: 'Fun Party Decor',
    icon: '🎉',
    items: [
      {
        id: 'bunting_colorful',
        name: 'Party Flags',
        image: 'fun_bunting_colorful.png',
        culturalNote: 'Bright decorations spread joy everywhere!',
        childFriendly: 'Party flags!',
        validZones: ['roof-left', 'roof-right', 'entrance-arch', 'pillar-left', 'pillar-right']
      },
      {
        id: 'balloons_cluster',
        name: 'Balloons',
        image: 'fun_balloons_cluster.png',
        culturalNote: 'Balloons lift our spirits to celebrate!',
        childFriendly: 'Happy balloons!',
        validZones: ['pillar-left', 'pillar-right', 'roof-left', 'roof-right']
      },
      {
        id: 'streamers_flowing',
        name: 'Party Streamers',
        image: 'fun_streamers_flowing.png',
        culturalNote: 'Flowing decorations dance with joy!',
        childFriendly: 'Dancing ribbons!',
        validZones: ['roof-center', 'entrance-arch', 'pillar-left', 'pillar-right']
      },
      {
        id: 'confetti_scatter',
        name: 'Confetti',
        image: 'fun_confetti_scatter.png',
        culturalNote: 'Confetti celebrates special moments!',
        childFriendly: 'Party sparkles!',
        validZones: ['base-floor', 'altar-left', 'altar-right']
      }
    ]
  },

  SPECIAL: {
    id: 'special',
    name: 'Special Decor',
    icon: '🎨',
    items: [
      {
        id: 'fabric_draping',
        name: 'Decorative Cloth',
        image: 'special_fabric_draping.png',
        culturalNote: 'Beautiful cloth shows respect for our divine guest!',
        childFriendly: 'Princess curtains!',
        validZones: ['pillar-left', 'pillar-right', 'roof-center']
      },
      {
        id: 'peacock_feathers',
        name: 'Peacock Feathers',
        image: 'special_peacock_feathers.png',
        culturalNote: 'Peacock feathers represent divine beauty and grace!',
        childFriendly: 'Royal bird feathers!',
        validZones: ['altar-center', 'roof-center']
      },
      {
        id: 'kalash_pot',
        name: 'Kalash Pot',
        image: 'special_kalash_pot.png',
        culturalNote: 'Kalash represents abundance and prosperity!',
        childFriendly: 'Treasure pot!',
        validZones: ['altar-left', 'altar-right']
      },
      {
        id: 'rangoli_base',
        name: 'Rangoli Design',
        image: 'special_rangoli_base.png',
        culturalNote: 'Rangoli patterns welcome good fortune!',
        childFriendly: 'Magic floor drawing!',
        validZones: ['base-floor']
      }
    ]
  }
};

// Fixed positions for Puja Prep items
const PUJA_PREP_POSITIONS = {
  'marigold_bunch': { left: '38%', top: '72%' },      // Left side near pillar
  'coconut': { left: '58%', top: '72%' },             // Center altar left
  'golden_ornate': { left: '42%', top: '69%' },    // Center altar middle
  'sweets_modak': { left: '62%', top: '63%' },        // Center altar right
  'rangoli_base': { left: '50%', top: '78%' }         // Floor center
};

const MANDAP_ZONES = {
  'roof-left': { x: 15, y: 8, width: 15, height: 12 },
  'roof-center': { x: 35, y: 8, width: 30, height: 12 },
  'roof-right': { x: 70, y: 8, width: 15, height: 12 },
  
  'entrance-arch': { x: 30, y: 18, width: 40, height: 8 },
  
  'pillar-left': { x: 20, y: 25, width: 12, height: 35 },
  'pillar-right': { x: 68, y: 25, width: 12, height: 35 },
  
  // Glow positions match item placement positions
  'altar-left-flowers': { x: 40, y: 72, width: 10, height: 10 },      // Left pillar
  'altar-left-coconut': { x: 62, y: 72, width: 10, height: 10 },      // Center left
  'altar-center-diya': { x: 47, y: 58, width: 10, height: 10 },       // Center middle
  'altar-center-modak': { x: 57, y: 58, width: 10, height: 10 },      // Center right
  'altar-right': { x: 66, y: 50, width: 14, height: 15 },
  'base-floor': { x: 45, y: 73, width: 10, height: 10 }               // Floor
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

// Mission step-tracking states
const [currentStep, setCurrentStep] = useState(1);
const [completedSteps, setCompletedSteps] = useState([]);
const [showMissionIntro, setShowMissionIntro] = useState(false);
const [guidanceMessage, setGuidanceMessage] = useState('');
const [showStepSuccess, setShowStepSuccess] = useState(false);


const [missionStartTime, setMissionStartTime] = useState(null);
const [timeElapsed, setTimeElapsed] = useState(0);

const [lastCompletedStep, setLastCompletedStep] = useState(null);

// Fix mission states
const [wrongItemsMap, setWrongItemsMap] = useState(new Map());
const [selectedWrongItem, setSelectedWrongItem] = useState(null);
const [fixedCount, setFixedCount] = useState(0);

const [ecoCount, setEcoCount] = useState(0);
const [nonEcoCount, setNonEcoCount] = useState(0);
const [placedEcoItems, setPlacedEcoItems] = useState([]);

// ADD LIGHT CHALLENGE STATE
const [lightsPlaced, setLightsPlaced] = useState(0);
const [timeRemaining, setTimeRemaining] = useState(60);
const [timerActive, setTimerActive] = useState(false);

const [showMissionComplete, setShowMissionComplete] = useState(false);
const [completedMissionData, setCompletedMissionData] = useState(null);

const [isTrayCollapsed, setIsTrayCollapsed] = useState(false);
const [showStartSpot, setShowStartSpot] = useState(true);
const [headerTip, setHeaderTip] = useState(null); // stores temporary message

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
    
return sizes[imageName] ? `${parseInt(sizes[imageName]) + 25}px` : '85px';  };

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

  // Timer effect for missions
useEffect(() => {
  if (!missionStartTime || !selectedMission) return;
  
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - missionStartTime) / 1000);
    setTimeElapsed(elapsed);
  }, 1000);
  
  return () => clearInterval(interval);
}, [missionStartTime, selectedMission]);

useEffect(() => {
  if (selectedMission?.type === 'eco') {
    setEcoCount(0);
    setNonEcoCount(0);
    setPlacedEcoItems([]);
    setGuidanceMessage('Choose only eco-friendly decorations! 🌿');
  }
}, [selectedMission]);

  // Auto-save game state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Initialize Fix Mandap mission - place items in wrong zones
useEffect(() => {
  if (selectedMission?.type === 'fix' && !showMissionIntro) {
    console.log('🔧 Initializing Fix Mandap mission');
    
    // Create map of wrong placements
    const wrongMap = new Map();
    const placements = new Map();
    
    selectedMission.wrongPlacements.forEach((item, index) => {
      // Get decoration data
      const decorationData = Object.values(DECORATION_CATEGORIES)
        .flatMap(cat => cat.items)
        .find(i => i.id === item.id);
      
      if (decorationData) {
        const wrongItem = {
          ...decorationData,
          wrongZone: item.wrongZone,
          correctZone: item.correctZone,
          isWrong: true,
          fixId: `fix-${index}`
        };
        
        wrongMap.set(`fix-${index}`, wrongItem);
        
        // Place in wrong zone
        const zoneItems = placements.get(item.wrongZone) || [];
        zoneItems.push(wrongItem);
        placements.set(item.wrongZone, zoneItems);
      }
    });
    
    setWrongItemsMap(wrongMap);
    setGameState(prev => ({
      ...prev,
      placedDecorations: placements
    }));
    setFixedCount(0);
    setGuidanceMessage('Tap the RED glowing decorations to fix them!');
  }
}, [selectedMission, showMissionIntro]);

// Light Challenge Timer
useEffect(() => {
  if (selectedMission?.type === 'light' && timerActive) {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up!
          setTimerActive(false);
          setGuidanceMessage('⏰ Time\'s up! Try again!');
          
          safeSetTimeout(() => {
            resetMissionState();
            setSelectedMission(null);
            setCurrentMode(GAME_MODES.SELECTION);
          }, 3000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }
}, [selectedMission, timerActive]);

// Initialize Light Challenge
useEffect(() => {
  if (selectedMission?.type === 'light') {
    setLightsPlaced(0);
    setTimeRemaining(60);
    setTimerActive(true);
    setGuidanceMessage('Quick! Place all the lights before time runs out! 💡');
        setGameState(prev => ({ ...prev, selectedCategory: 'lights' }));
  }
}, [selectedMission]);

const resetMissionState = () => {
  setGameState({
    selectedCategory: null,
    selectedDecoration: null,
    placedDecorations: new Map(),
    decorationPositions: new Map(),
    phase: PHASES.CHOOSING
  });
  
  setCurrentStep(1);
  setCompletedSteps([]);
  setEcoCount(0);
  setNonEcoCount(0);
  setPlacedEcoItems([]);
  setFixedCount(0);
  setWrongItemsMap(new Map());
  setLightsPlaced(0);        // ✅ ADD
  setTimeRemaining(60);      // ✅ ADD
  setTimerActive(false);     // ✅ ADD
  setSelectedWrongItem(null);
  setHighlightedZones(new Set());
  setGuidanceMessage('');
  setShowStepSuccess(false);
  setLastCompletedStep(null);
  setShowSparkle(null);
};

// Auto-expand tray when entering a new category
  useEffect(() => {
    if (gameState.selectedCategory) {
      setIsTrayCollapsed(false);
    }
  }, [gameState.selectedCategory]);


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

  // Handle clicking wrong decoration in Fix mode
const handleWrongItemClick = (decoration) => {
  console.log('🔧 Clicked wrong item:', decoration.id);
  setSelectedWrongItem(decoration);
  setGuidanceMessage(`Good! Now tap the GREEN glowing spot to fix it!`);
  
  // Highlight correct zone
  setHighlightedZones(new Set([decoration.correctZone]));
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

const handleDecorationSelect = (decoration) => {
  if (gameState.phase === PHASES.COMPLETE) return;

  setGameState(prev => ({
    ...prev,
    selectedDecoration: decoration
  }));

// For Light Challenge, highlight all valid zones for the selected decoration
if (selectedMission?.type === 'light') {
  const validZones = new Set(decoration.validZones);
  setHighlightedZones(validZones);
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

  // Eco Mission Helper Functions
const isEcoItem = (itemId) => {
  if (!selectedMission || selectedMission.type !== 'eco') return false;
  return selectedMission.ecoItems?.includes(itemId) || false;
};

const isNonEcoItem = (itemId) => {
  if (!selectedMission || selectedMission.type !== 'eco') return false;
  return selectedMission.nonEcoItems?.includes(itemId) || false;
};


const handleZoneClick = (zoneId, event) => {
    // ===== FIX MODE HANDLING =====
  if (selectedMission?.type === 'fix' && selectedWrongItem) {
    if (zoneId !== selectedWrongItem.correctZone) {
      setGuidanceMessage(`Not there! Tap the GREEN glowing spot!`);
      return;
    }

    // ✅ CORRECT ZONE - Fix the item
    console.log('🔧 Fixing item:', selectedWrongItem.id, 'to zone:', zoneId);
    
    const newPlacements = new Map(gameState.placedDecorations);
    const wrongZoneItems = newPlacements.get(selectedWrongItem.wrongZone) || [];
    const filteredWrong = wrongZoneItems.filter(d => d.fixId !== selectedWrongItem.fixId);
    
    if (filteredWrong.length > 0) {
      newPlacements.set(selectedWrongItem.wrongZone, filteredWrong);
    } else {
      newPlacements.delete(selectedWrongItem.wrongZone);
    }
    
    const correctZoneItems = newPlacements.get(zoneId) || [];
    correctZoneItems.push({ 
      ...selectedWrongItem, 
      isFixed: true, 
      isWrong: false 
    });
    newPlacements.set(zoneId, correctZoneItems);
    
    setGameState(prev => ({
      ...prev,
      placedDecorations: newPlacements
    }));
    
    const newFixedCount = fixedCount + 1;
    setFixedCount(newFixedCount);

    // After line 1011, add:
const updatedWrongMap = new Map(wrongItemsMap);
const itemToUpdate = updatedWrongMap.get(selectedWrongItem.fixId);
if (itemToUpdate) {
  updatedWrongMap.set(selectedWrongItem.fixId, {
    ...itemToUpdate,
    isFixed: true
  });
  setWrongItemsMap(updatedWrongMap);
}
    
    setShowStepSuccess(true);
    setLastCompletedStep({
      emoji: '🔧',
      successMessage: `Perfect! ${newFixedCount}/5 decorations fixed!`
    });
    
    setShowSparkle(zoneId);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowStepSuccess(false);
    }, 2000);
    
    setSelectedWrongItem(null);
    clearHighlights();
    
if (newFixedCount >= 5) {
  safeSetTimeout(() => {
    const starsEarned = 5;
    setMissionStars(prev => prev + starsEarned);
    setCompletedMissions(prev => ({ ...prev, [selectedMission.id]: true }));
    
    setCompletedMissionData({
      name: selectedMission.name,
      starsEarned: starsEarned
    });
    setShowMissionComplete(true);
  }, 2000);

    } else {
      safeSetTimeout(() => {
        setGuidanceMessage(`Great! ${5 - newFixedCount} more to fix. Tap the next RED decoration!`);
      }, 2000);
    }
    return;
  }
  
  // ===== REGULAR PLACEMENT MODE =====
// ===== REGULAR PLACEMENT MODE =====
if (!gameState.selectedDecoration) return;

// In missions, check if zone is valid
if (currentMode === GAME_MODES.CHALLENGE && selectedMission && !highlightedZones.has(zoneId)) {
  return;
}  
  const decoration = gameState.selectedDecoration;
  
  // ===== PUJA PREP VALIDATION =====
  if (selectedMission?.id === 'puja-prep' && selectedMission.steps) {
    const currentStepData = selectedMission.steps[currentStep - 1];
    
    if (decoration.id !== currentStepData.item) {
      setGuidanceMessage("That's beautiful, but let's follow the steps! " + currentStepData.instruction);
      setGameState(prev => ({
        ...prev,
        selectedDecoration: null,
        selectedCategory: null
      }));
      clearHighlights();
      safeSetTimeout(() => {
        setGuidanceMessage(currentStepData.instruction);
      }, 3000);
      return;
    }
    
    if (zoneId !== currentStepData.zone) {
      setGuidanceMessage(`Not there! ${currentStepData.instruction}`);
      safeSetTimeout(() => {
        setGuidanceMessage(currentStepData.instruction);
      }, 2000);
      return;
    }
    
    // Valid - continue to placement
  }

  // ===== ECO MANDAP VALIDATION =====
  if (selectedMission?.type === 'eco') {
    const isEco = selectedMission.ecoItems?.includes(decoration.id);
    const isNonEco = selectedMission.nonEcoItems?.includes(decoration.id);
    
    if (isNonEco) {
      setGuidanceMessage('❌ Not eco-friendly! Choose green items! 🌿');
      setGameState(prev => ({
        ...prev,
        selectedDecoration: null,
        selectedCategory: null
      }));
      clearHighlights();
      return;
    }
    
    if (isEco && !placedEcoItems.includes(decoration.id)) {
      const newEcoCount = ecoCount + 1;
      const newPlacedEcoItems = [...placedEcoItems, decoration.id];
      setEcoCount(newEcoCount);
      setPlacedEcoItems(newPlacedEcoItems);
      
      setShowStepSuccess(true);
      setLastCompletedStep({
        emoji: '🌿',
        successMessage: `Perfect! ${newEcoCount}/${selectedMission.targetEcoCount || 5} eco items!`
      });
      
      safeSetTimeout(() => setShowStepSuccess(false), 2000);
      
if (newEcoCount >= (selectedMission.targetEcoCount || 5)) {
  safeSetTimeout(() => {
    const starsEarned = 5;
    setMissionStars(prev => prev + starsEarned);
    setCompletedMissions(prev => ({ 
      ...prev, 
      [selectedMission.id]: true 
    }));
    
    setCompletedMissionData({
      name: selectedMission.name,
      starsEarned: starsEarned
    });
    setShowMissionComplete(true);
  }, 2000);

      } else {
        safeSetTimeout(() => {
          setGuidanceMessage(`Great! ${(selectedMission.targetEcoCount || 5) - newEcoCount} more eco items! 🌿`);
        }, 2000);
      }
    }
    // Continue to placement
  }

  // ===== LIGHT CHALLENGE VALIDATION =====
if (selectedMission?.type === 'light') {
  // Check if it's a light item
  const isLight = decoration.hasLightEffect || 
                  decoration.id.includes('diya') || 
                  decoration.id.includes('light') ||
                  decoration.id.includes('lantern');
  
  if (isLight) {
    const newLightsPlaced = lightsPlaced + 1;
    setLightsPlaced(newLightsPlaced);
    
    setShowStepSuccess(true);
    setLastCompletedStep({
      emoji: '💡',
      successMessage: `Great! ${newLightsPlaced}/${selectedMission.items?.length || 5} lights placed!`
    });
    
    safeSetTimeout(() => setShowStepSuccess(false), 1500);
    
    // Check if mission complete
if (newLightsPlaced >= (selectedMission.items?.length || 5)) {
  setTimerActive(false);
  
  safeSetTimeout(() => {
    const timeBonus = Math.floor(timeRemaining / 10);
    const totalStars = 5 + timeBonus;
    const elapsedTime = 60 - timeRemaining;
    
    setMissionStars(prev => prev + totalStars);
    setCompletedMissions(prev => ({ 
      ...prev, 
      [selectedMission.id]: true 
    }));
    
    setCompletedMissionData({
      name: selectedMission.name,
      starsEarned: totalStars,
      totalTime: elapsedTime
    });
    setShowMissionComplete(true);
  }, 2000);

    } else {
      safeSetTimeout(() => {
        setGuidanceMessage(`Hurry! ${(selectedMission.items?.length || 5) - newLightsPlaced} more lights! ⏰`);
      }, 1500);
    }
  }
  // Continue to placement
}
  
  // ===== PLACE DECORATION =====
// ===== PLACE DECORATION =====
// ===== PLACE DECORATION =====
const newPlacements = new Map(gameState.placedDecorations);
const existingInZone = newPlacements.get(zoneId) || [];

// PUJA PREP - Use fixed positions
if (selectedMission?.id === 'puja-prep' && decoration.id) {
  const fixedPosition = PUJA_PREP_POSITIONS[decoration.id];
  const decorationWithPosition = {
    ...decoration,
    customPosition: fixedPosition || { left: '50%', top: '50%' }
  };
  existingInZone.push(decorationWithPosition);
}
// FREE PLAY - Place at click position
else if (currentMode === GAME_MODES.FREE_PLAY && event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const clickX = ((event.clientX - rect.left) / rect.width) * 100;
  const clickY = ((event.clientY - rect.top) / rect.height) * 100;
  
  const decorationWithPosition = {
    ...decoration,
    customPosition: { left: `${clickX}%`, top: `${clickY}%` }
  };
  existingInZone.push(decorationWithPosition);
} 
// Other missions - Use zone center
else {
  existingInZone.push(decoration);
}

newPlacements.set(zoneId, existingInZone);
  
  setGameState(prev => ({
    ...prev,
    placedDecorations: newPlacements,
    selectedDecoration: null
    // Keep selectedCategory so tray stays open in item view
  }));

  // 🔴 1. INSERT THIS BLOCK HERE (For the Smart Header Tip) 🔴
  if (currentMode === GAME_MODES.FREE_PLAY) {
    setHeaderTip("✨ Drag items to move them! ✨");
    setTimeout(() => {
      setHeaderTip(null);
    }, 2500); // Disappear after 2.5 seconds
  }

  // ===== PUJA PREP - UPDATE PROGRESS =====
  if (selectedMission?.id === 'puja-prep' && selectedMission.steps) {
    const currentStepData = selectedMission.steps[currentStep - 1];
    setLastCompletedStep(currentStepData);
    
    setShowStepSuccess(true);
    setShowSparkle(zoneId);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setShowStepSuccess(false);
    }, 4000);
    
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);
    
    if (currentStep < selectedMission.steps.length) {
      safeSetTimeout(() => {
        setCurrentStep(currentStep + 1);
        const nextStepData = selectedMission.steps[currentStep];
        setGuidanceMessage(nextStepData.instruction);
      }, 4500);
} else {
  // Mission complete!
  safeSetTimeout(() => {
    const starsEarned = 5;
    setMissionStars(prev => prev + starsEarned);
    setCompletedMissions(prev => ({ ...prev, [selectedMission.id]: true }));
    
    // Show completion overlay
    setCompletedMissionData({
      name: selectedMission.name,
      starsEarned: starsEarned
    });
    setShowMissionComplete(true);
  }, 2000);
}
  } else {
    // Free play or other missions - just show sparkle
    setShowSparkle(zoneId);
    safeSetTimeout(() => setShowSparkle(null), 1000);
  }
  
  clearHighlights();
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

  // --- DYNAMIC HEADER LOGIC ---
// --- SMART HEADER LOGIC ---
// --- SMART HEADER LOGIC ---
// --- SMART HEADER LOGIC ---
  const getHeaderContent = () => {
    
    // --- 1. FIX THE MANDAP MISSION ---
    if (selectedMission?.type === 'fix') {
      if (selectedWrongItem) {
        return (
          <div className="header-content-row">
            <span>Tap the </span>
            <span style={{color: '#FFA000', fontWeight: 'bold', margin: '0 5px'}}>glowing spot</span>
            <span>! ✨</span>
          </div>
        );
      }
      return (
        <div className="header-content-row">
          <span>Tap the </span>
          <span style={{color: '#FF5252', fontWeight: 'bold', margin: '0 5px'}}>red items</span>
          <span> to fix them! 🔧</span>
        </div>
      );
    }

    // --- 2. PUJA PREP MISSION (UPDATED WITH IMAGE & COLOR) ---
    if (selectedMission?.id === 'puja-prep' && selectedMission.steps) {
      const currentStepData = selectedMission.steps[currentStep - 1];
      
      // Step A: Item is selected (in hand) -> Guide to Mandap
      if (gameState.selectedDecoration) {
        return (
          <div className="header-content-row">
            <span>Tap the glowing spot! ⭐</span>
          </div>
        );
      }
      
      // Step B: Item NOT selected -> Guide to Menu (Color + Image)
      
      // 1. Find the item details to get the image
      const allItems = Object.values(DECORATION_CATEGORIES).flatMap(cat => cat.items);
      const targetItem = allItems.find(i => i.id === currentStepData.item);
const itemName = targetItem ? targetItem.name : 'item'; // Use full name

      // 2. Define colors for visual linking
      const ITEM_COLORS = {
        'marigold_bunch': '#EF6C00',   // Bright Orange
        'coconut': '#558B2F',          // Natural Green
        'clay_traditional': '#FFD700', // Gold
        'sweets_modak': '#D84315',     // Deep Orange
        'rangoli_base': '#9C27B0'      // Purple
      };
      
      const targetColor = ITEM_COLORS[currentStepData.item] || '#D84315'; // Default fallback

      return (
        <div className="header-content-row">
          <span>Tap the </span>
          
          {/* COLOR-CODED TEXT WITH PULSE */}
          <span className="header-target-word" style={{ color: targetColor }}>
            {itemName}
          </span>
          
          {/* ACTUAL ITEM IMAGE */}
          {targetItem && (
            <img 
              src={DECORATION_IMAGES[targetItem.image]} 
              alt="icon" 
              className="header-mini-icon"
            />
          )}

        </div>
      );
    }

    // --- 3. FREE PLAY MODE ---
    if (isDragging) {
      return (
        <div className="header-content-row">
          <span>Drag to decorate! ✨</span>
        </div>
      );
    }

    if (gameState.selectedDecoration) {
      return (
        <div className="header-content-row">
          <span>Tap to place</span>
          <span style={{color: '#D84315', fontWeight: 'bold', marginLeft: '6px'}}>
            {gameState.selectedDecoration.name.split(' ')[0]}
          </span>
          <img 
            src={DECORATION_IMAGES[gameState.selectedDecoration.image]} 
            alt="icon" 
            className="header-mini-icon"
          />
        </div>
      );
    }

    if (gameState.selectedCategory) {
      const catName = DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.name;
      return (
        <div className="header-content-row">
          <span>Choose your {catName} 🎨</span>
        </div>
      );
    }

    // Default
    return (
      <div className="header-content-row">
        <span>Let's decorate the Mandap! 🌸</span>
      </div>
    );
  };

  // Show intro screen first with OpeningModal
if (currentMode === GAME_MODES.INTRO) {
  return (
    <>
      <OpeningModal 
        show={true}
        onStart={() => setCurrentMode(GAME_MODES.SELECTION)}
      />
      <TocaBocaNav 
        onHome={() => onNavigate?.('home')} 
        onZonesClick={() => onNavigate?.('zones')} 
      />
    </>
  );
}
// Show mode selection screen
// Show mode selection screen
if (currentMode === GAME_MODES.SELECTION) {
  return (
    <div className="mandap-game-container">
      
      {/* New Container for the specific Mandap Look */}
      <div className="mandap-selection-popup">
        
        {/* Title with decorative flowers */}
        <h1 className="mandap-popup-title">
          <span className="title-deco">✿</span> Decorate the Mandap! <span className="title-deco">✿</span>
        </h1>
        
        <div className="mandap-mode-options">
          {/* Free Play Card - Purple Theme */}
          <div 
            className="mandap-option-card card-free" 
            onClick={() => {
              resetMissionState(); 
              setCurrentMode(GAME_MODES.FREE_PLAY);
            }}
          >
            <div className="option-icon-circle">
              <span className="option-icon">🎨</span>
            </div>
            <h2>Free Play</h2>
            <p>Decorate however you like</p>
            <button className="mandap-action-btn btn-free">Decorate Freely</button>
          </div>
          
          {/* Challenge Mode Card - Green Theme */}
          <div 
            className="mandap-option-card card-challenge" 
            onClick={() => setCurrentMode(GAME_MODES.CHALLENGE)}
          >
             <div className="option-icon-circle">
              <span className="option-icon">🎯</span>
            </div>
            <h2>Challenge Mode</h2>
            <p>Complete festival missions</p>
            <button className="mandap-action-btn btn-challenge">Start Challenge</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Show mission selection when in Challenge mode
// Show mission selection when in Challenge mode
// Show mission selection when in Challenge mode
if (currentMode === GAME_MODES.CHALLENGE && !selectedMission) {
  return (
    <div className="mandap-game-container">
      {/* 1. Dark Overlay */}
      <div className="mandap-popup-overlay" />

      {/* 2. Central Popup Card */}
      <div className="mandap-selection-popup mission-popup-size">
        
        {/* Header: Back Button + Title */}
        <div className="mission-popup-header">
          <button 
            className="popup-back-pill" 
            onClick={() => setCurrentMode(GAME_MODES.SELECTION)}
          >
            ← Back
          </button>
          
          <div className="mission-header-text">
            <h1 className="mission-popup-title">
              <span className="icon-bounce">🎯</span> Decoration Missions ✿
            </h1>
            <p className="mission-popup-subtitle">Complete fun challenges to earn stars!</p>
          </div>
          
          {/* Invisible spacer to balance the header (keeps title centered) */}
          <div style={{width: '80px'}}></div> 
        </div>

        {/* 3. The 2x2 Grid */}
        <div className="mission-grid-refined">
          {MISSIONS.map((mission) => {
            const isCompleted = completedMissions[mission.id];
            
            // Assign colors based on Mission ID
            let colorClass = "theme-pink"; 
            if (mission.id === 'fix-mandap') colorClass = "theme-yellow";
            if (mission.id === 'eco-mandap') colorClass = "theme-green";
            if (mission.id === 'light-challenge') colorClass = "theme-orange";

            return (
              <div
                key={mission.id}
                className={`mission-refined-card ${colorClass} ${isCompleted ? 'completed-glow' : ''}`}
                onClick={() => {
                  resetMissionState();
                  setSelectedMission(mission);
                  setShowMissionIntro(true);
                }}
              >
                {/* Checkmark Badge if done */}
                {isCompleted && <div className="mission-check-badge">✓</div>}

                <div className="mission-card-icon">{mission.icon}</div>
                <h3 className="mission-card-title">{mission.name}</h3>
                <p className="mission-card-desc">{mission.description}</p>
                
                {/* Star Rating */}
                <div className="mission-card-stars">
                   {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={`star-icon ${i < mission.difficulty ? 'filled' : 'empty'}`}>⭐</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// Show Mission Intro Overlay
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
    ? "Oh! Something feels messy…Can you help me fix it?"
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
    
    // Set guidance message based on mission type
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

// Show the actual game (FREE_PLAY or CHALLENGE with selected mission)
if (currentMode === GAME_MODES.FREE_PLAY || (currentMode === GAME_MODES.CHALLENGE && selectedMission && !showMissionIntro)) {
const isInMission = currentMode === GAME_MODES.CHALLENGE && selectedMission;
const currentStepData = (isInMission && selectedMission.type !== 'fix' && selectedMission.steps) 
  ? selectedMission.steps[currentStep - 1] 
  : null;
  
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

{/* --- DYNAMIC HEADER PILL --- */}
      {/* Show in Free Play OR Puja Prep OR Fix Mode */}
      {(currentMode === GAME_MODES.FREE_PLAY || selectedMission?.id === 'puja-prep' || selectedMission?.type === 'fix') && (
        <div className="game-header-container">
          <div className="dynamic-header-pill header-bounce">
            
            <div className="header-text">
              {headerTip ? (
                 <div className="header-content-row" style={{ color: '#E65100' }}>
                   {headerTip}
                 </div>
              ) : (
                 getHeaderContent()
              )}
            </div>
            
            <div className="header-decoration">
              ✿ ✿ ✿
            </div>
          </div>
        </div>
      )}

      {/* ADD PAUSE BUTTON HERE */}
<button 
  className="game-pause-button"
  onClick={() => setShowPauseMenu(true)}
  aria-label="Pause Game"
>
  ⏸️
</button>



{/* Minimal Mission Header */}
{/* Simple Mission Progress 
{isInMission && selectedMission && selectedMission.id === 'puja-prep' && (  <div className="simple-mission-panel">
    <div className="mission-icon">{selectedMission.icon}</div>
    <div className="mission-info">
      <div className="mission-name">{selectedMission.name}</div>
      <div className="mission-progress">
        {completedSteps.length}/{selectedMission.steps?.length || 5}
      </div>
    </div>
  </div>
)}


{/* Bottom Instruction Bar 
{isInMission && guidanceMessage && (
  <div className="mission-bottom-bar">
    <div className="mission-instruction-text">{guidanceMessage}</div>
    {currentStepData && (
      <div 
        className={`mission-item-button ${gameState.selectedDecoration?.id === currentStepData.item ? 'selected' : ''}`}
        onClick={() => {
          const decorationData = Object.values(DECORATION_CATEGORIES)
            .flatMap(cat => cat.items)
            .find(item => item.id === currentStepData.item);
          if (decorationData) {
            handleDecorationSelect(decorationData);
          }
        }}
      >
        <span className="mission-item-emoji">{currentStepData.emoji}</span>
        <span className="mission-item-name">Tap to Select</span>
      </div>
    )}
  </div>
)}*/}

{showStepSuccess && lastCompletedStep && (
    <div className="step-success-overlay" onClick={() => setShowStepSuccess(false)}>
      
      {/* 1. CONFETTI LAYER (New) */}
      <div className="confetti-container">
        {/* Create 30 pieces of confetti */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 2. SUCCESS CARD */}
      <div className="step-success-message">
        {/* Success Icon/Image */}
        {lastCompletedStep.item ? (
           <img 
             src={DECORATION_IMAGES[
               Object.values(DECORATION_CATEGORIES)
                 .flatMap(cat => cat.items)
                 .find(i => i.id === lastCompletedStep.item)?.image
             ]} 
             alt="Success"
             className="success-popup-img"
           />
        ) : (
           <div style={{fontSize: '60px'}}>✨</div>
        )}

        <h2>Perfect!</h2>
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
{/* Clickable zones */}
{/* Clickable zones */}
{Object.entries(MANDAP_ZONES).map(([zoneId, zone]) => {
  const isInMission = currentMode === GAME_MODES.CHALLENGE && selectedMission;
  
  // FREE PLAY MODE - One giant clickable area
  if (currentMode === GAME_MODES.FREE_PLAY) {
    if (zoneId !== 'roof-left') return null;
    zone = { x: 0, y: 0, width: 100, height: 100 };
  }
  
  // Mode Checks
  const isFixMode = selectedMission?.type === 'fix';
  
  // LOGIC FIX: Determine which class to apply
  const isFixTarget = isFixMode && selectedWrongItem?.correctZone === zoneId; // <--- RESTORED THIS
  const isHighlighted = highlightedZones.has(zoneId);
  
  // Determine final class name
  let zoneClass = 'mandap-zone';
  if (isFixTarget) {
    zoneClass += ' zone-target'; // Triggers the Golden Glow & Sparkles
  } else if (isHighlighted) {
    zoneClass += ' highlighted';  // Triggers Standard/Puja Pulse
  }
  
  // Only hide zones if we are in a mission and this isn't a relevant zone
  // (But in Fix Mode, we want the target zone to be clickable)
  if (isInMission && !isFixMode && !isHighlighted && selectedMission?.type !== 'light' && selectedMission?.type !== 'eco') {
    return null;
  }
  
  return (
    <div
      key={zoneId}
      className={zoneClass}
      onClick={(event) => handleZoneClick(zoneId, event)}
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        pointerEvents: 'auto'
      }}
    />
  );
})}
        {/* Placed Decorations - WITH DRAGGING */}
     {/* Placed Decorations - WITH DRAGGING */}
        {Array.from(gameState.placedDecorations.entries()).map(([zoneId, decorations]) => {
          const decorationsArray = Array.isArray(decorations) ? decorations : [decorations];
          return decorationsArray.map((decoration, index) => {
            const zone = MANDAP_ZONES[zoneId];
            const decorationKey = `decoration-${zoneId}-${index}`;
            
            // Position Logic
            const currentPosition = decoration.customPosition || 
              gameState.decorationPositions?.get(decorationKey) || {
                top: `${zone.y + zone.height/2 + Math.floor(index / 3) * 3}%`,
                left: `${zone.x + zone.width/2 + (index % 3) * 3}%`
              };

            // FIX MODE STATE LOGIC
            const isFixMode = selectedMission?.type === 'fix';
            const isWrong = isFixMode && decoration.isWrong && !decoration.isFixed;
            const isSelected = isFixMode && selectedWrongItem?.fixId === decoration.fixId;
            const isFixed = isFixMode && decoration.isFixed;

            // ANIMATION CONFLICT FIX:
            // Only apply 'glowing' if the item is NOT wrong. 
            // If it is wrong, we want the 'wiggle' animation to win.
            let className = 'decoration-image';
            if (decoration.hasLightEffect && !isWrong) className += ' glowing';
            if (isWrong) className += ' decoration-wrong';
            if (isSelected) className += ' decoration-selected';
            if (isFixed) className += ' decoration-fixed';
            
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
                  className={className}
                  style={{ 
                    width: getDecorationSize(decoration.image), 
                    height: getDecorationSize(decoration.image), 
                    pointerEvents: isFixMode ? 'auto' : 'none'
                  }}
                  onClick={(e) => {
                    if (isWrong) {
                      e.stopPropagation();
                      handleWrongItemClick(decoration);
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

{/* Mission Steps Panel OR Category Buttons */}
{isInMission && (selectedMission?.id === 'puja-prep' || selectedMission?.type === 'fix') ? (() => {
  const missionData = getMissionData(selectedMission, currentStep, fixedCount);
  
  if (missionData.type === 'fix') {
    // FIX MODE SIDEBAR (Matching Puja Style)
    return (
      <div className="inventory-tray items-mode">
        
        {/* Title */}
        <div className="items-title" style={{marginBottom: '15px'}}>
          Fix Items 🔧
        </div>

        {/* Vertical Steps List */}
        <div className="puja-steps-list">
          {selectedMission.wrongPlacements.map((item, index) => {
            const fixId = `fix-${index}`;
            const wrongItem = wrongItemsMap.get(fixId);
            const isFixed = wrongItem?.isFixed || false;
            const isSelected = selectedWrongItem?.fixId === fixId;
            
            const decorationData = Object.values(DECORATION_CATEGORIES)
              .flatMap(cat => cat.items)
              .find(i => i.id === item.id);
            
            return (
              <div
                key={fixId}
                className={`puja-item-pill ${isFixed ? 'completed' : ''} ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  // Only allow clicking if not fixed yet
                  if (!isFixed && wrongItem) {
                    handleWrongItemClick(wrongItem);
                  }
                }}
              >
                {/* 1. Icon Circle (Left) */}
                <div className="puja-icon-circle">
                  {decorationData && (
                    <img 
                      src={DECORATION_IMAGES[decorationData.image]} 
                      alt={decorationData.name}
                      className="puja-icon-img"
                    />
                  )}
                  
                  {/* Status Badge: Green Check or Red Cross */}
                  {isFixed ? (
                    <div className="mini-check-badge">✓</div>
                  ) : (
                    <div className="mini-cross-badge">✖</div>
                  )}
                </div>

                {/* 2. Text (Right) */}
                <div className="puja-text-col">
                  <span className="puja-item-name">
{decorationData ? decorationData.name : 'Item'}
                  </span>
                  <span className="puja-item-sub">
                    {isFixed ? 'Fixed!' : isSelected ? 'Tap green spot!' : 'Needs fixing'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  
} else if (selectedMission?.id === 'puja-prep' && selectedMission.steps) {
    // PUJA PREP SIDEBAR (Styled like Item List)
    return (
      <div className="inventory-tray items-mode"> 
        
        {/* Title */}
        <div className="items-title" style={{marginBottom: '15px'}}>
          Puja Steps 🌸
        </div>

        {/* Vertical Steps List */}
        <div className="puja-steps-list">
          {selectedMission.steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            const isFuture = !isCompleted && !isCurrent;
            
            const decorationData = Object.values(DECORATION_CATEGORIES)
              .flatMap(cat => cat.items)
              .find(item => item.id === step.item);
            
            return (
              <div
                key={step.step}
                className={`puja-item-pill ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isFuture ? 'locked' : ''}`}
                onClick={() => {
                  if (isCurrent && decorationData) {
                    handleDecorationSelect(decorationData);
                    setHighlightedZones(new Set([step.zone]));
                  }
                }}
              >
                {/* 1. Icon Circle (Left) */}
                <div className="puja-icon-circle">
                  {decorationData && (
                    <img 
                      src={DECORATION_IMAGES[decorationData.image]} 
                      alt={decorationData.name}
                      className="puja-icon-img"
                    />
                  )}
                  {/* Small Checkmark Badge if done */}
                  {isCompleted && <div className="mini-check-badge">✓</div>}
                </div>

                {/* 2. Text (Right) */}
                <div className="puja-text-col">
                  <span className="puja-item-name">
{decorationData ? decorationData.name : 'Item'}
                  </span>
                  <span className="puja-item-sub">
                    {isCompleted ? 'Done!' : isCurrent ? 'Tap to place' : 'Coming Next...'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  return null; // No sidebar for Eco & Light missions
})() : (
  
  /* FREE PLAY MODE - Show Categories */
!isInMission && !gameState.selectedCategory && gameState.phase !== PHASES.COMPLETE && (
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
  )
)}

{/* ECO MISSION TRAY - Categories */}
{isInMission && selectedMission?.type === 'eco' && !gameState.selectedCategory && (
  <div className="inventory-tray">
    <div className="categories-title">Choose Eco Items: 🌿</div>
    <div className="category-buttons">
      {Object.entries(DECORATION_CATEGORIES)
        .filter(([key]) => key !== 'FUN')
        .map(([key, category]) => (
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

{/* ECO MISSION TRAY - Items */}
{isInMission && selectedMission?.type === 'eco' && gameState.selectedCategory && (
  <div className={`inventory-tray ${isDragging ? 'dragging-active' : ''}`}>
<div className="items-header">
      {/* 1. New Circular Back Button with Arrow Icon */}
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
        ←
      </button>

      {/* 2. Title */}
      <div className="items-title">
        {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.name}
      </div>
    
      <div className="items-title">
        {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.name}
      </div>
    </div>
    <div className="item-buttons">
      {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.items.map((item) => {
        const isEco = selectedMission.ecoItems?.includes(item.id);
        const isNonEco = selectedMission.nonEcoItems?.includes(item.id);
     
        
        return (
          <div
            key={item.id}
            className={`item-button 
              ${gameState.selectedDecoration?.id === item.id ? 'selected' : ''} 
              ${isEco ? 'eco-item' : ''} 
              ${isNonEco ? 'non-eco-item disabled' : ''}
                  `}

            onClick={() => {
              if (isNonEco) {
                setGuidanceMessage('❌ Not eco-friendly! Choose green items only! 🌿');
                setTimeout(() => {
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
              {item.name} {/* <--- NOW IT SHOWS FULL NAME */}
              {isEco && ' ✓'}
              {isNonEco && ' ✗'}
            </span>
          </div>
        );
      })}
    </div>
  </div>
)}

{/* LIGHT CHALLENGE TRAY - Categories */}
{isInMission && selectedMission?.type === 'light' && !gameState.selectedCategory && (
      <div className="inventory-tray">
    <div className="categories-title">
      Choose Lights: 💡 ⏰ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
    </div>
    <div className="category-buttons">
      <div
        className="category-button"
onClick={() => handleCategorySelect('lights_diyas')}
      >
        <span className="category-icon">🪔</span>
        <span className="category-name">Lights & Diyas</span>
      </div>
    </div>
  </div>
)}

{/* LIGHT CHALLENGE TRAY - Items */}
{isInMission && selectedMission?.type === 'light' && gameState.selectedCategory && (
  <div className={`inventory-tray ${isDragging ? 'dragging-active' : ''}`}>
<div className="items-header">
  {/* The back button has been removed */}
  <div className="items-title">
    Place the Lights! ⏰ {timeRemaining}s
  </div>
</div>
    <div className="item-buttons">
{DECORATION_CATEGORIES.LIGHTS_DIYAS?.items.map((item) => ( 
  
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
          <span className="item-name">{item.name.split(' ')[0]} 💡</span>
        </div>
      ))}
    </div>
  </div>
)}

{/* Inventory Tray - Items (for Free Play) 
{gameState.selectedCategory && gameState.phase !== PHASES.COMPLETE && !isInMission && (
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
          <span className="item-name">{item.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  </div>
)}*/}

{/* Inventory Tray - Items (for Free Play) */}
{gameState.selectedCategory && gameState.phase !== PHASES.COMPLETE && !isInMission && (
  <div 
    className={`inventory-tray items-mode ${isTrayCollapsed ? 'collapsed' : ''} ${isDragging ? 'dragging-active' : ''}`}
  >
    
    {/* 1. TOGGLE HANDLE (The Tab on the side) */}
    <div 
      className="tray-toggle"
      onClick={() => setIsTrayCollapsed(!isTrayCollapsed)}
    >
      {isTrayCollapsed ? '◀' : '▶'}
    </div>

    {/* 2. HEADER */}
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
          setIsTrayCollapsed(false); // Reset to full width
        }}
      >
←
      </button>

      {/* Title - Fades out when collapsed */}
      <div className={`items-title ${isTrayCollapsed ? 'fade-out' : ''}`}>
        {DECORATION_CATEGORIES[gameState.selectedCategory.toUpperCase()]?.name}
      </div>
    </div>

    {/* 3. ITEM LIST */}
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
          
          {/* Hide text when collapsed */}
          {!isTrayCollapsed && (
            <span className="item-name">
              {item.name} {/* <--- NOW IT SHOWS FULL NAME */}
            </span>
          )}
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

{/* Mission Completion Overlay */}
<MissionCompletionOverlay
  show={showMissionComplete}
  missionName={completedMissionData?.name}
  starsEarned={completedMissionData?.starsEarned}
  totalTime={completedMissionData?.totalTime}
  
  onPlayAgain={() => {
    setShowMissionComplete(false);
    resetMissionState();
    setShowMissionIntro(true); // Restart same mission
  }}
  
  onTryAnother={() => {
    setShowMissionComplete(false);
    resetMissionState();
    setSelectedMission(null);
    setCurrentMode(GAME_MODES.SELECTION);
  }}
/>

{/* ADD GAME PAUSE MENU HERE */}
<GamePauseMenu
  show={showPauseMenu}
  gameName="Mandap Decoration"
  currentStars={gameState.stars}
  hasDesignOption={false}  // 👈 FALSE - no design selection
  
  onResume={() => setShowPauseMenu(false)}
  
onRestart={() => {
  setShowPauseMenu(false);
  
  // If in a mission, restart the mission
  if (selectedMission) {
    resetMissionState(); // This already clears everything!
    
    // Restart the same mission
    setShowMissionIntro(true);
    
    // Set timer for Light Challenge
    if (selectedMission.type === 'light') {
      setTimeRemaining(60);
      setTimerActive(false); // Will start when mission intro closes
    }
    
    // Re-initialize Fix Mandap wrong items
    if (selectedMission.type === 'fix') {
      // The useEffect will handle initialization when showMissionIntro becomes false
    }
  } else {
    // Free play mode - reset everything
    localStorage.removeItem('mandapGame');
    
    setGameState({
      phase: PHASES.CHOOSING,
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
    
    resetMissionState(); // Also clear any residual mission state
    setHighlightedZones(new Set());
    setShowSparkle(null);
    setShowCulturalNote(null);
    setMilestoneSparkle(false);
    setShowSceneCompletion(false);
    setNearDeleteZone(false);
    setGuidanceMessage('Start fresh! Choose decorations to begin! 🎨');
  }
}}

onBackToModes={() => {
  setShowPauseMenu(false);
  resetMissionState(); // Clear all mission data
  setSelectedMission(null); // Clear mission
  setCurrentMode(GAME_MODES.SELECTION); // Go back to mode selection
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