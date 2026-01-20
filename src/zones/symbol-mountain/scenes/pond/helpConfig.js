// zones/symbol-mountain/scenes/pond/helpConfig.js
// Help menu configuration for Pond Scene (Lotus Blooming)

// Import images for visual hints
import lotusClosed from './assets/images/lotus-closed.png';
import lotusBloomed from './assets/images/lotus-bloomed.png';
import goldenLotusClosed from './assets/images/golden-lotus-closed.png';
import elephantFull from './assets/images/elephant-full.png';
import waterElephant from './assets/images/water-elephant.png';

// Phase constants (should match your scene)
const PHASES = {
  INITIAL: 'initial',
  SOME_BLOOMED: 'some_bloomed',
  ALL_BLOOMED: 'all_bloomed',
  GOLDEN_VISIBLE: 'golden_visible',
  ELEPHANT_VISIBLE: 'elephant_visible',
  ELEPHANT_TRANSFORMED: 'elephant_transformed',
  GOLDEN_BLOOM: 'golden_bloom',
  COMPLETE: 'complete'
};

export const pondHelpConfig = {
  sceneId: 'pond-scene',
  sceneName: 'Lotus Pond',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // Phase 1: Blooming regular lotuses
    if (sceneState.phase === PHASES.INITIAL || 
        sceneState.phase === PHASES.SOME_BLOOMED) {
      
      hints.push({
        image: lotusClosed,
        name: 'Closed Lotus',
        description: 'These pink buds are waiting to bloom. Tap them to make them flower!',
        priority: 1
      });
      
      hints.push({
        image: lotusBloomed,
        name: 'Bloomed Lotus',
        description: 'A beautiful bloomed lotus! Keep tapping closed ones until all 3 bloom.',
        priority: 2
      });
    }
    
    // Phase 2: Golden lotus appears
    if (sceneState.phase === PHASES.ALL_BLOOMED || 
        sceneState.phase === PHASES.GOLDEN_VISIBLE) {
      
      hints.push({
        image: goldenLotusClosed,
        name: 'Golden Lotus',
        description: 'A special golden lotus appeared! Tap it to see what happens.',
        priority: 1
      });
    }
    
    // Phase 3: Elephant trunk watering
    if (sceneState.phase === PHASES.ELEPHANT_VISIBLE || 
        sceneState.phase === PHASES.ELEPHANT_TRANSFORMED) {
      
      hints.push({
        image: elephantFull,
        name: "Elephant's Trunk",
        description: "Tap Ganesha's trunk to spray water and make the golden lotus bloom!",
        priority: 1
      });
      
      hints.push({
        image: goldenLotusClosed,
        name: 'Golden Lotus',
        description: 'The golden lotus needs water from the trunk to bloom.',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Look at the top for what to do next!',
    'Glowing things can be tapped!',
    'Found a symbol? Tap it on the side to learn more!',
    'Mooshika the mouse is your helper!'
  ]
};