// zones/symbol-mountain/scenes/pond/helpConfig.js
// Help menu configuration for Pond Scene (Lotus Blooming)

import lotusClosed from './assets/images/lotus-closed.png';
import lotusBloomed from './assets/images/lotus-bloomed.png';
import goldenLotusClosed from './assets/images/golden-lotus-closed.png';
import elephantFull from './assets/images/elephant-full.png';
import waterElephant from './assets/images/water-elephant.png';

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
    if (
      sceneState.phase === PHASES.INITIAL || 
      sceneState.phase === PHASES.SOME_BLOOMED
    ) {
      hints.push({
        image: lotusClosed,
        name: 'Closed Lotus',
        description: 'Tap these closed lotuses to help them bloom.',
        priority: 1
      });
      
      hints.push({
        image: lotusBloomed,
        name: 'Bloomed Lotus',
        description: 'Bloomed lotuses show your progress. Keep going!',
        priority: 2
      });
    }
    
    // Phase 2: Golden lotus appears
    if (
      sceneState.phase === PHASES.ALL_BLOOMED || 
      sceneState.phase === PHASES.GOLDEN_VISIBLE
    ) {
      hints.push({
        image: goldenLotusClosed,
        name: 'Golden Lotus',
        description: 'A special lotus appeared. Tap it to see what happens next.',
        priority: 1
      });
    }
    
    // Phase 3: Elephant trunk watering
    if (
      sceneState.phase === PHASES.ELEPHANT_VISIBLE || 
      sceneState.phase === PHASES.ELEPHANT_TRANSFORMED
    ) {
      hints.push({
        image: elephantFull,
        name: "Ganesha’s Trunk",
        description: "Tap Ganesha’s trunk to spray water.",
        priority: 1
      });
      
      hints.push({
        image: goldenLotusClosed,
        name: 'Golden Lotus',
        description: 'The golden lotus needs water to bloom.',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Check the top to see what to do next.',
    'Glowing things can be tapped.',
    'Found a symbol? Open the side bar to learn its meaning.',
  ]
};
