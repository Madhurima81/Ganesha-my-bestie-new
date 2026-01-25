// zones/symbol-mountain/scenes/symbol/helpConfig.js
// Help menu configuration for Symbol Mountain Scene (Eyes + Ears + Tusk games)

// Import images for visual hints
// NOTE: Make sure these relative paths are correct based on where this file lives
import musicalTabla from './assets/images/musical-tabla-colored.png';
import musicalFlute from './assets/images/musical-flute-colored.png';
import musicalBells from './assets/images/musical-bells-colored.png';
import musicalCymbals from './assets/images/musical-cymbals-colored.png';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-colored.png';
import ganeshaEars from '../../shared/images/icons/symbol-ear-colored.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-colored.png';

// Phase constants (matching your scene)
const PHASES = {
  EYES_GAME: 'eyes_game',
  EYES_COMPLETE: 'eyes_complete',
  EARS_GAME: 'ears_game',
  EARS_COMPLETE: 'ears_complete',
  TUSK_GAME: 'tusk_game',
  TUSK_COMPLETE: 'tusk_complete',
  ALL_COMPLETE: 'all_complete'
};

// ✅ EXPORT NAME CHANGED TO MATCH IMPORT
export const symbolHelpConfig = {
  sceneId: 'symbol-mountain',
  sceneName: 'Musical Mountain',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== PHASE 1: EYES GAME ====================
    if (sceneState.phase === PHASES.EYES_GAME || 
        (sceneState.eyesVisible && !sceneState.eyesGameComplete)) {
      
      hints.push({
        image: ganeshaEyes,
        name: 'Eyes Symbol',
        description: 'Tap the glowing Eyes symbol to start the telescope game!',
        priority: 1
      });
      
      if (sceneState.showEyesTelescopeGame) {
        const foundCount = sceneState.instrumentsFound || 0;
        hints.push({
          image: musicalTabla,
          name: 'Hidden Instruments',
          description: `Find all 4 musical instruments hidden in the mountain! You've found ${foundCount}/4.`,
          priority: 1
        });
      }
    }
    
    // ==================== PHASE 2: EARS GAME ====================
    if ((sceneState.phase === PHASES.EARS_GAME || 
         sceneState.phase === PHASES.EYES_COMPLETE) && 
        sceneState.earsVisible && !sceneState.earsGameComplete) {
      
      hints.push({
        image: ganeshaEars,
        name: 'Ears Symbol',
        description: 'Tap the glowing Ears symbol to start the rhythm game!',
        priority: 1
      });
      
      if (sceneState.showEarsRhythmGame) {
        hints.push({
          image: musicalTabla,
          name: 'Match the Pattern',
          description: 'Watch and listen to the pattern, then tap the instruments in the same order!',
          priority: 1
        });
      }
    }
    
    // ==================== PHASE 3: TUSK GAME ====================
    if ((sceneState.phase === PHASES.TUSK_GAME || 
         sceneState.phase === PHASES.EARS_COMPLETE) && 
        sceneState.showTuskAssemblyGame) {
      
      hints.push({
        image: ganeshaTusk,
        name: 'Golden Musical Notes',
        description: 'Tap the 3 golden musical notes to build the sacred tusk!',
        priority: 1
      });
    }
    
    return hints;
  },
  
  generalTips: [
    'Look at the top for what to do next!',
    'Glowing things can be tapped!',
    'Found a symbol? Tap it on the side to learn more!',
    'Listen carefully to the musical patterns!'
  ]
};