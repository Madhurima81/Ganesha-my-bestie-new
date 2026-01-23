// zones/cave-of-secrets/scenes/sarvakaryeshu-sarvada/helpConfig.js
// Help menu configuration for Sarvakaryeshu Scene (All Tasks & Always Helper)

// Import images
import doorImage from './assets/images/door-image.png';
import boyPreview from './assets/images/boy-preview.png';
import girlPreview from './assets/images/girl-preview.png';

// Game 1 - A few example scenario symbols
import homeworkSymbolPatience from './assets/images/game 1/symbols/homework_symbol_patience.png';
import sportsSymbolTry from './assets/images/game 1/symbols/sports_symbol_try.png';
import shoelaceSymbolPatient from './assets/images/game 1/symbols/shoelace_symbol_patient.png';

// Game 2 - Helper images
import homeFriendly from './assets/images/game 2/helpers/home_friendlyface.png';
import schoolSmilystar from './assets/images/game 2/helpers/school_smilystar.png';
import parkLeafyfriend from './assets/images/game 2/helpers/park_leafyfriend.png';

// Phase constants (should match your scene)
const SCENE_PHASES = {
  STORY_INTRO: 'story_intro',
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  CHARACTER_SELECT: 'character_select',
  GAME1_INTRO: 'game1_intro',
  SCENARIO_CHOOSING: 'scenario_choosing',
  SCENARIO_SUCCESS: 'scenario_success',
  SARVAKARYESHU_LEARNING: 'sarvakaryeshu_learning',
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  GAME2_INTRO: 'game2_intro',
  HELPER_CHOOSING: 'helper_choosing',
  HELPER_SUCCESS: 'helper_success',
  SARVADA_LEARNING: 'sarvada_learning',
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

export const sarvakaryeshuHelpConfig = {
  sceneId: 'sarvakaryeshu-sarvada',
  sceneName: 'All Tasks Wisdom',
  zoneId: 'cave-of-secrets',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== PART 1: SARVAKARYESHU (All Tasks) ====================
    
    // PHASE: Door 1 Puzzle (Sar-va-kar-ye-shu)
    if (sceneState.phase === SCENE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed) {
      hints.push({
        image: doorImage,
        name: 'Magic Door',
        description: 'Drag the Sanskrit syllables in order to unlock: Sar → va → kar → ye → shu',
        priority: 1
      });
      
      const placedCount = sceneState.door1SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/5`,
          description: `Great! Next syllable: ${sceneState.door1Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Character Selection
    if (sceneState.phase === SCENE_PHASES.CHARACTER_SELECT) {
      hints.push({
        image: boyPreview,
        name: 'Choose Your Character',
        description: 'Tap to choose between boy or girl character for the wisdom challenge!',
        priority: 1
      });
      
      hints.push({
        image: girlPreview,
        name: 'Boy or Girl?',
        description: 'Pick the character you want to help make wise choices!',
        priority: 2
      });
    }
    
    // PHASE: Scenario Game (Making wise choices)
    if (sceneState.phase === SCENE_PHASES.GAME1_INTRO || 
        sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING) {
      
      hints.push({
        image: homeworkSymbolPatience,
        name: 'Make Wise Choices',
        description: 'Help the child make wise choices in different situations! Tap the symbols that show wisdom.',
        priority: 1
      });
      
      hints.push({
        image: sportsSymbolTry,
        name: 'Choose Wisely',
        description: 'Each scenario has 2 wise choices and 2 unwise choices. Pick the wise ones!',
        priority: 2
      });
      
      hints.push({
        image: shoelaceSymbolPatient,
        name: 'Think First',
        description: 'Think about what would really help solve the problem before choosing!',
        priority: 3
      });
    }
    
    // PHASE: Sarvakaryeshu Learning
    if (sceneState.phase === SCENE_PHASES.SARVAKARYESHU_LEARNING) {
      hints.push({
        image: homeworkSymbolPatience,
        name: 'Learning Sarvakaryeshu',
        description: 'Read about the meaning of Sarvakaryeshu (in all tasks) and wisdom in daily life!',
        priority: 1
      });
    }
    
    // ==================== PART 2: SARVADA (Always) ====================
    
    // PHASE: Door 2 Puzzle (Sar-va-da)
    if (sceneState.phase === SCENE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed) {
      hints.push({
        image: doorImage,
        name: 'Second Magic Door',
        description: 'Drag the Sanskrit syllables in order: Sar → va → da',
        priority: 1
      });
      
      const placedCount = sceneState.door2SyllablesPlaced?.length || 0;
      if (placedCount > 0) {
        hints.push({
          image: doorImage,
          name: `Progress: ${placedCount}/3`,
          description: `Great! Next syllable: ${sceneState.door2Syllables?.[placedCount] || ''}`,
          priority: 2
        });
      }
    }
    
    // PHASE: Helper Game (Finding helpers in different places)
    if (sceneState.phase === SCENE_PHASES.GAME2_INTRO || 
        sceneState.phase === SCENE_PHASES.HELPER_CHOOSING) {
      
      hints.push({
        image: homeFriendly,
        name: 'Find the Helpers',
        description: 'Discover friendly helpers in 3 different places - home, school, and park!',
        priority: 1
      });
      
      hints.push({
        image: schoolSmilystar,
        name: 'Match Helpers',
        description: 'Each place has special helpers. Tap the right helper for each location!',
        priority: 2
      });
      
      hints.push({
        image: parkLeafyfriend,
        name: 'Helper Friends',
        description: 'Helpers can be people, objects, or even nature - anything that helps you!',
        priority: 3
      });
    }
    
    // PHASE: Sarvada Learning
    if (sceneState.phase === SCENE_PHASES.SARVADA_LEARNING) {
      hints.push({
        image: homeFriendly,
        name: 'Learning Sarvada',
        description: 'Read about the meaning of Sarvada (always) and finding help everywhere!',
        priority: 1
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Drag syllables in order to unlock magic doors!',
    'Choose wise actions that truly help solve problems!',
    'Helpers can be found everywhere - at home, school, and outside!',
    'Found a symbol? Tap it on the side to learn more!'
  ]
};