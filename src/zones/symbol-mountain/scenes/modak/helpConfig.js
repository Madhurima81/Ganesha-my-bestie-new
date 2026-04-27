// zones/symbol-mountain/scenes/modak/helpConfig.js
// Help menu configuration for Modak Mission scene

import mudMound from './assets/images/mud-mound.png';
import modak1 from './assets/images/modak-1.png';
import basket from './assets/images/basket.png';
import belly from './assets/images/belly.png';
import mooshika from '../../shared/images/icons/symbol-mooshika-new.png';

const PHASES = {
  MOOSHIKA_SEARCH: 'mooshika_search',
  MODAKS_UNLOCKED: 'modaks_unlocked',
  SOME_COLLECTED: 'some_collected',
  ROCK_VISIBLE: 'rock_visible',
  ROCK_FEEDING: 'rock_feeding',
  COMPLETE: 'complete'
};

export const modakHelpConfig = {
  sceneId: 'modak-mission',
  sceneName: 'Modak Mission',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // Phase 1: Searching for Mooshika
    if (sceneState.phase === PHASES.MOOSHIKA_SEARCH) {
      hints.push({
        image: mudMound,
        name: 'Mounds',
        description: 'Tap these brown mounds to see who is hiding inside!',
        priority: 1
      });
    }
    
    // Phase 2: Collecting modaks
    if (
      sceneState.phase === PHASES.MODAKS_UNLOCKED || 
      sceneState.phase === PHASES.SOME_COLLECTED
    ) {
      if (!sceneState.basketFull) {
        hints.push({
          image: modak1,
          name: 'Modaks',
          description: 'Tap the sweet modaks to collect them.',
          priority: 1
        });
        
        hints.push({
          image: basket,
          name: 'Basket',
          description: 'Your basket holds the modaks. Collect 3 to move ahead!',
          priority: 2
        });
      }
    }
    
    // Phase 3: Feeding Ganesha
    if (
      (sceneState.phase === PHASES.ROCK_VISIBLE || 
       sceneState.phase === PHASES.ROCK_FEEDING) && 
      !sceneState.rockTransformed
    ) {
      hints.push({
        image: belly,
        name: 'Ganesha Stone',
        description: 'This stone is Ganesha. Feed him modaks from your basket!',
        priority: 1
      });
      
      hints.push({
        image: basket,
        name: 'Basket',
        description: 'Tap a modak in the basket, then tap Ganesha.',
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
    'Mooshika is here to help you!'
  ]
};

