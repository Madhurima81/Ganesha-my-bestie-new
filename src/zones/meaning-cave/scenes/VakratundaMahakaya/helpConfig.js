// zones/cave-of-secrets/scenes/vakratunda-mahakaya/helpConfig.js
// Help menu configuration for Cave of Secrets Scene (Vakratunda + Mahakaya)

// Import images
import doorImage from './assets/images/door-image.png';
import mooshikaTracing from './assets/images/mooshika-tracing.png';
import stoneHead from './assets/images/stone-head.png';
import stoneTrunk from './assets/images/stone-trunk.png';
import stoneBody from './assets/images/stone-body.png';
import stoneLegs from './assets/images/stone-legs.png';
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';

// Phase constants (should match your scene)
const CAVE_PHASES = {
  // Part 1: Vakratunda
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  TRACE_INTRO: 'trace_intro',
  TRACE_ACTIVE: 'trace_active',
  TRACE_COMPLETE: 'trace_complete',
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  
  // Part 2: Mahakaya
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  GROW_INTRO: 'grow_intro',
  GROW_ACTIVE: 'grow_active',
  GROW_COMPLETE: 'grow_complete',
  MAHAKAYA_LEARNING: 'mahakaya_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

export const caveHelpConfig = {
  sceneId: 'vakratunda-mahakaya',
  sceneName: 'Vakratunda & Mahakaya',
  zoneId: 'cave-of-secrets', // Cave of Secrets zone (not Symbol Mountain!)
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== PART 1: VAKRATUNDA ====================
    
    // PHASE: Door 1 Puzzle (Va-kra-tun-da)
    if (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed) {
      hints.push({
        image: doorImage,
        name: 'Magic Door',
        description: 'Tap the Sanskrit syllables in order to unlock the door: Va → kra → tun → da',
        priority: 1
      });
      
      const placedCount = sceneState.door1SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/4`,
          description: `Great! Keep going. Next syllable to tap: ${sceneState.door1Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Tracing Game (Follow the curved path)
    if (sceneState.phase === CAVE_PHASES.TRACE_INTRO || 
        sceneState.phase === CAVE_PHASES.TRACE_ACTIVE) {
      
      hints.push({
        image: mooshikaTracing,
        name: 'Trace the Path',
        description: 'Help Mooshika trace the curved trunk path! Tap the dots in order from START to finish.',
        priority: 1
      });
      
      if (sceneState.tracedPoints?.length > 0) {
        hints.push({
          image: mooshikaTracing,
          name: 'Keep Tracing!',
          description: `You've tapped ${sceneState.tracedPoints.length} dots. Keep going to complete the curved path!`,
          priority: 2
        });
      }
    }
    
    // PHASE: Vakratunda Learning Card
    if (sceneState.phase === CAVE_PHASES.VAKRATUNDA_LEARNING) {
      hints.push({
        image: vakratundaCard,
        name: 'Learning Vakratunda',
        description: 'Read about the meaning of Vakratunda (curved trunk) and tap to continue!',
        priority: 1
      });
    }
    
    // ==================== PART 2: MAHAKAYA ====================
    
    // PHASE: Door 2 Puzzle (Ma-ha-ka-ya)
    if (sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed) {
      hints.push({
        image: doorImage,
        name: 'Second Magic Door',
        description: 'Tap the Sanskrit syllables in order to unlock: Ma → ha → ka → ya',
        priority: 1
      });
      
      const placedCount = sceneState.door2SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/4`,
          description: `Great! Keep going. Next syllable to tap: ${sceneState.door2Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Growing Ganesha Game (Click stone body parts)
    if (sceneState.phase === CAVE_PHASES.GROW_INTRO || 
        sceneState.phase === CAVE_PHASES.GROW_ACTIVE) {
      
      const stonesClicked = sceneState.stonesClicked || 0;
      
      hints.push({
        image: stoneHead,
        name: 'Build Mighty Ganesha',
        description: 'Tap the 4 glowing stone body parts to build the mighty form of Ganesha!',
        priority: 1
      });
      
      // Show which parts are still needed
      if (stonesClicked < 4) {
        const parts = [
          { image: stoneHead, name: 'Head Stone' },
          { image: stoneTrunk, name: 'Trunk Stone' },
          { image: stoneBody, name: 'Body Stone' },
          { image: stoneLegs, name: 'Legs Stone' }
        ];
        
        hints.push({
          image: parts[stonesClicked]?.image || stoneHead,
          name: `${stonesClicked}/4 Parts Collected`,
          description: `Tap the glowing stones to continue building! ${4 - stonesClicked} more to go.`,
          priority: 2
        });
      }
    }
    
    // PHASE: Mahakaya Learning Card
    if (sceneState.phase === CAVE_PHASES.MAHAKAYA_LEARNING) {
      hints.push({
        image: mahakayaCard,
        name: 'Learning Mahakaya',
        description: 'Read about the meaning of Mahakaya (mighty form) and tap to continue!',
        priority: 1
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Look at the top for what to do next!',
    'Glowing things can be tapped!',
    'Found a symbol? Tap it on the side to learn more!',
    'Follow the Sanskrit syllables in order!'
  ]
};