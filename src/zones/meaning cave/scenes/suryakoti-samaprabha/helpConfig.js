// zones/cave-of-secrets/scenes/suryakoti-samaprabha/helpConfig.js
// Help menu configuration for Suryakoti Scene (Million Suns Chamber)

// Import images
import doorImage from './assets/images/door-image.png';
import sunImage from './assets/images/sun.png';
import orbEmpty from './assets/images/orb-empty.png';
import orbGanesha from './assets/images/orb-ganesha.png';
import scaredFace1 from './assets/images/scared-face-1.png';
import happyFace1 from './assets/images/happy-face-1.png';
import suryakotiCard from './assets/images/suryakoti-card.png';
import samaprabhaCard from './assets/images/samaprabha-card.png';
import caveBackgroundDark from './assets/images/cave-background-dark.png';
import caveBackgroundBright from './assets/images/cave-background-bright.png';

// Phase constants (should match your scene)
const CAVE_PHASES = {
  STORY_INTRO: 'story_intro',
  
  // Part 1: Suryakoti
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  SUN_COLLECTION_INTRO: 'sun_collection_intro',
  SUN_COLLECTION_ACTIVE: 'sun_collection_active',
  SUN_COLLECTION_COMPLETE: 'sun_collection_complete',
  SURYAKOTI_LEARNING: 'suryakoti_learning',
  
  // Part 2: Samaprabha
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  HEALING_INTRO: 'healing_intro',
  HEALING_ACTIVE: 'healing_active',
  HEALING_COMPLETE: 'healing_complete',
  SAMAPRABHA_LEARNING: 'samaprabha_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

export const suryakotiHelpConfig = {
  sceneId: 'suryakoti-samaprabha',
  sceneName: 'Million Suns Chamber',
  zoneId: 'cave-of-secrets', // Cave of Secrets zone
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== PART 1: SURYAKOTI (Million Suns) ====================
    
    // PHASE: Door 1 Puzzle (Su-rya-ko-ti)
    if (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed) {
      hints.push({
        image: doorImage,
        name: 'Magic Door',
        description: 'Drag the Sanskrit syllables in order to unlock: Su → rya → ko → ti',
        priority: 1
      });
      
      const placedCount = sceneState.door1SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/4`,
          description: `Great! Keep going. Next syllable: ${sceneState.door1Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Sun Collection Game (Collect 3 suns into orb)
    if (sceneState.phase === CAVE_PHASES.SUN_COLLECTION_INTRO || 
        sceneState.phase === CAVE_PHASES.SUN_COLLECTION_ACTIVE) {
      
      const collected = sceneState.collectedSuns || 0;
      
      hints.push({
        image: sunImage,
        name: 'Collect Golden Suns',
        description: 'Drag the 3 golden suns floating around into the orb to fill it with radiant power!',
        priority: 1
      });
      
      if (collected > 0 && collected < 3) {
        hints.push({
          image: orbGanesha,
          name: `Suns Collected: ${collected}/3`,
          description: `Great! ${3 - collected} more sun${3 - collected > 1 ? 's' : ''} to collect. Drag them into the orb!`,
          priority: 2
        });
      }
      
      hints.push({
        image: caveBackgroundBright,
        name: 'Cave Brightening',
        description: 'Watch the cave light up as you collect each sun! The power of million suns!',
        priority: 3
      });
    }
    
    // PHASE: Suryakoti Learning Card
    if (sceneState.phase === CAVE_PHASES.SURYAKOTI_LEARNING) {
      hints.push({
        image: suryakotiCard,
        name: 'Learning Suryakoti',
        description: 'Read about the meaning of Suryakoti (million suns) and its radiant power!',
        priority: 1
      });
    }
    
    // ==================== PART 2: SAMAPRABHA (Equal Radiance) ====================
    
    // PHASE: Door 2 Puzzle (Sa-ma-pra-bha)
    if (sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed) {
      hints.push({
        image: doorImage,
        name: 'Second Magic Door',
        description: 'Drag the Sanskrit syllables in order to unlock: Sa → ma → pra → bha',
        priority: 1
      });
      
      const placedCount = sceneState.door2SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/4`,
          description: `Great! Next syllable: ${sceneState.door2Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Healing Game (Drag suns to scared children)
    if (sceneState.phase === CAVE_PHASES.HEALING_INTRO || 
        sceneState.phase === CAVE_PHASES.HEALING_ACTIVE) {
      
      const healedCount = sceneState.healedChildren?.length || 0;
      const totalChildren = sceneState.childStates?.length || 3;
      
      hints.push({
        image: scaredFace1,
        name: 'Heal Scared Children',
        description: `Drag the golden suns to the ${totalChildren} scared children to heal them with equal radiance!`,
        priority: 1
      });
      
      if (healedCount > 0 && healedCount < totalChildren) {
        hints.push({
          image: happyFace1,
          name: `Children Healed: ${healedCount}/${totalChildren}`,
          description: `Wonderful! ${totalChildren - healedCount} more child${totalChildren - healedCount > 1 ? 'ren' : ''} need healing. Drag suns to them!`,
          priority: 2
        });
      }
      
      hints.push({
        image: sunImage,
        name: 'Golden Healing Suns',
        description: 'Each sun carries equal radiance to bring happiness and healing!',
        priority: 3
      });
    }
    
    // PHASE: Samaprabha Learning Card
    if (sceneState.phase === CAVE_PHASES.SAMAPRABHA_LEARNING) {
      hints.push({
        image: samaprabhaCard,
        name: 'Learning Samaprabha',
        description: 'Read about the meaning of Samaprabha (equal radiance) and balanced light!',
        priority: 1
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Drag syllables in order to unlock magic doors!',
    'Golden suns can be dragged to collect or heal!',
    'Watch the cave brighten with each sun collected!',
    'Found a symbol? Tap it on the side to learn more!'
  ]
};