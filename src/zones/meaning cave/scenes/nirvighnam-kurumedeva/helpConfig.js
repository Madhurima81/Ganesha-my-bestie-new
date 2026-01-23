// zones/cave-of-secrets/scenes/nirvighnam-kurumedeva/helpConfig.js
// Help menu configuration for Nirvighnam Scene (Obstacle Remover Chamber)

// Import images
import doorImage from './assets/images/door-image.png';
import crystalAnger from './assets/images/crystal-anger.png';
import crystalFear from './assets/images/crystal-fear.png';
import crystalSad from './assets/images/crystal-sad.png';
import fogAnger from './assets/images/fog-anger.png';
import rockAnger from './assets/images/rock-anger.png';
import rockFear from './assets/images/rock-fear.png';
import rockSad from './assets/images/rock-sad.png';
import caveBackgroundDark from './assets/images/caveriver-background.png';

// Phase constants (should match your scene)
const CAVE_PHASES = {
  STORY_INTRO: 'story_intro',
  
  // Part 1: Nirvighnam
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  CRYSTAL_FOG_INTRO: 'crystal_fog_intro',
  CRYSTAL_FOG_ACTIVE: 'crystal_fog_active',
  CRYSTAL_FOG_COMPLETE: 'crystal_fog_complete',
  NIRVIGHNAM_LEARNING: 'nirvighnam_learning',
  
  // Part 2: Kurumedeva
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  BRIDGE_BUILDING_INTRO: 'bridge_building_intro',
  BRIDGE_BUILDING_ACTIVE: 'bridge_building_active',
  BRIDGE_BUILDING_COMPLETE: 'bridge_building_complete',
  KURUME_DEVA_LEARNING: 'kurume_deva_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

export const nirvighnamHelpConfig = {
  sceneId: 'nirvighnam-kurumedeva',
  sceneName: 'Obstacle Remover',
  zoneId: 'cave-of-secrets',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== PART 1: NIRVIGHNAM (Remove Obstacles) ====================
    
    // PHASE: Door 1 Puzzle (Ni-rvi-ghnam)
    if (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed) {
      hints.push({
        image: doorImage,
        name: 'Magic Door',
        description: 'Drag the Sanskrit syllables in order to unlock: Ni → rvi → ghnam',
        priority: 1
      });
      
      const placedCount = sceneState.door1SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/3`,
          description: `Great! Next syllable: ${sceneState.door1Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Crystal Fog Game (Clear emotional fog by clicking)
    if (sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_INTRO || 
        sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE) {
      
      hints.push({
        image: crystalAnger,
        name: 'Clear the Emotional Fog',
        description: 'Tap each emotional fog area 3 times to clear it and reveal the crystal underneath!',
        priority: 1
      });
      
      // Show fog areas that need clearing
      const fogProgress = sceneState.fogProgress || {};
      const emotions = ['anger', 'fear', 'sad'];
      const clearedCount = emotions.filter(e => (fogProgress[e] || 0) >= 3).length;
      
      if (clearedCount > 0 && clearedCount < 3) {
        hints.push({
          image: fogAnger,
          name: `Fog Cleared: ${clearedCount}/3`,
          description: `Great! ${3 - clearedCount} more fog area${3 - clearedCount > 1 ? 's' : ''} to clear. Keep tapping!`,
          priority: 2
        });
      }
      
      // Show specific emotions still foggy
      emotions.forEach((emotion, index) => {
        const progress = fogProgress[emotion] || 0;
        if (progress < 3) {
          const images = { anger: crystalAnger, fear: crystalFear, sad: crystalSad };
          hints.push({
            image: images[emotion],
            name: `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} Fog`,
            description: `Tap the ${emotion} fog ${3 - progress} more time${3 - progress > 1 ? 's' : ''} to clear it!`,
            priority: 3 + index
          });
        }
      });
    }
    
    // PHASE: Nirvighnam Learning
    if (sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING) {
      hints.push({
        image: crystalAnger,
        name: 'Learning Nirvighnam',
        description: 'Read about the meaning of Nirvighnam (obstacle remover) and its power!',
        priority: 1
      });
    }
    
    // ==================== PART 2: KURUMEDEVA (Divine Blessing) ====================
    
    // PHASE: Door 2 Puzzle (Ku-ru-me-de-va)
    if (sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed) {
      hints.push({
        image: doorImage,
        name: 'Second Magic Door',
        description: 'Drag the Sanskrit syllables in order: Ku → ru → me → de → va',
        priority: 1
      });
      
      const placedCount = sceneState.door2SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/5`,
          description: `Great! Next syllable: ${sceneState.door2Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Bridge Building Game (Place rocks to build bridge)
    if (sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_INTRO || 
        sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE) {
      
      const placedRocks = sceneState.bridgeRocks?.filter(r => r.placed).length || 0;
      
      hints.push({
        image: rockAnger,
        name: 'Build the Bridge',
        description: 'Tap the 3 emotional rocks in order to place them and build a bridge across the river!',
        priority: 1
      });
      
      if (placedRocks > 0 && placedRocks < 3) {
        hints.push({
          image: rockFear,
          name: `Rocks Placed: ${placedRocks}/3`,
          description: `Great! ${3 - placedRocks} more rock${3 - placedRocks > 1 ? 's' : ''} to place. Tap the glowing rocks in order!`,
          priority: 2
        });
      }
      
      // Show which rocks are available
      hints.push({
        image: rockSad,
        name: 'Emotional Rocks',
        description: 'Each rock represents an emotion you cleared - anger, fear, and sadness!',
        priority: 3
      });
    }
    
    // PHASE: Kurumedeva Learning
    if (sceneState.phase === CAVE_PHASES.KURUME_DEVA_LEARNING) {
      hints.push({
        image: rockAnger,
        name: 'Learning Kurumedeva',
        description: 'Read about the meaning of Kurumedeva (divine blessing) and its power!',
        priority: 1
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Drag syllables in order to unlock magic doors!',
    'Tap foggy areas 3 times to clear them!',
    'Place rocks in order to build the bridge!',
    'Found a symbol? Tap it on the side to learn more!'
  ]
};