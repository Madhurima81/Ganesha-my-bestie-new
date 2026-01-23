// zones/symbol-mountain/scenes/symbol/helpConfig.js
// Help menu configuration for Symbol Mountain Scene (Eyes + Ears + Tusk games)

// Import images for visual hints
import musicalTabla from './assets/images/musical-tabla-colored.png';
import musicalFlute from './assets/images/musical-flute-colored.png';
import musicalBells from './assets/images/musical-bells-colored.png';
import musicalCymbals from './assets/images/musical-cymbals-colored.png';
import ganeshaEyes from '../../shared/images/icons/symbol-eyes-colored.png';
import ganeshaEars from '../../shared/images/icons/symbol-ear-colored.png';
import ganeshaTusk from '../../shared/images/icons/symbol-tusk-colored.png';

// Phase constants (should match your scene)
const PHASES = {
  EYES_GAME: 'eyes_game',
  EYES_COMPLETE: 'eyes_complete',
  EARS_GAME: 'ears_game',
  EARS_COMPLETE: 'ears_complete',
  TUSK_GAME: 'tusk_game',
  TUSK_COMPLETE: 'tusk_complete',
  ALL_COMPLETE: 'all_complete'
};

export const symbolMountainHelpConfig = {
  sceneId: 'symbol-mountain',
  sceneName: 'Musical Mountain',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== PHASE 1: EYES GAME ====================
    // Finding hidden musical instruments
    if (sceneState.phase === PHASES.EYES_GAME || 
        (sceneState.eyesVisible && !sceneState.eyesGameComplete)) {
      
      hints.push({
        image: ganeshaEyes,
        name: 'Eyes Symbol',
        description: 'Tap the glowing Eyes symbol to start the telescope game!',
        priority: 1
      });
      
      // If telescope game is active
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
    // Playing rhythm patterns
    if ((sceneState.phase === PHASES.EARS_GAME || 
         sceneState.phase === PHASES.EYES_COMPLETE) && 
        sceneState.earsVisible && !sceneState.earsGameComplete) {
      
      hints.push({
        image: ganeshaEars,
        name: 'Ears Symbol',
        description: 'Tap the glowing Ears symbol to start the rhythm game!',
        priority: 1
      });
      
      // If rhythm game is active
      if (sceneState.showEarsRhythmGame) {
        hints.push({
          image: musicalTabla,
          name: 'Match the Pattern',
          description: 'Watch and listen to the pattern, then tap the instruments in the same order!',
          priority: 1
        });
        
        // Show which instruments are discovered
        if (sceneState.discoveredInstruments) {
          const instruments = Object.keys(sceneState.discoveredInstruments);
          if (instruments.includes('tabla')) {
            hints.push({
              image: musicalTabla,
              name: 'Tabla',
              description: 'The drum - makes a deep sound!',
              priority: 2
            });
          }
          if (instruments.includes('flute')) {
            hints.push({
              image: musicalFlute,
              name: 'Flute',
              description: 'The pipe - makes a high, sweet sound!',
              priority: 3
            });
          }
          if (instruments.includes('bells')) {
            hints.push({
              image: musicalBells,
              name: 'Bells',
              description: 'The chimes - make a ringing sound!',
              priority: 4
            });
          }
          if (instruments.includes('cymbals')) {
            hints.push({
              image: musicalCymbals,
              name: 'Cymbals',
              description: 'The plates - make a crashing sound!',
              priority: 5
            });
          }
        }
      }
    }
    
    // ==================== PHASE 3: TUSK GAME ====================
    // Collecting golden musical notes and building tusk
    if ((sceneState.phase === PHASES.TUSK_GAME || 
         sceneState.phase === PHASES.EARS_COMPLETE) && 
        sceneState.showTuskAssemblyGame) {
      
      hints.push({
        image: ganeshaTusk,
        name: 'Golden Musical Notes',
        description: 'Tap the 3 golden musical notes to build the sacred tusk!',
        priority: 1
      });
      
      // Show progress
      const collectedNotes = sceneState.tuskPower || 0;
      if (collectedNotes > 0 && collectedNotes < 3) {
        hints.push({
          image: ganeshaTusk,
          name: 'Keep Going!',
          description: `You've collected ${collectedNotes}/3 notes. Find the remaining golden notes!`,
          priority: 2
        });
      }
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Look at the top for what to do next!',
    'Glowing things can be tapped!',
    'Found a symbol? Tap it on the side to learn more!',
    'Listen carefully to the musical patterns!'
  ]
};