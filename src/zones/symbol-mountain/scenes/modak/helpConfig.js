// zones/symbol-mountain/scenes/modak/helpConfig.js
// Help menu configuration for Modak Mission scene

// Import images for visual hints
import mudMound from './assets/images/mud-mound.png';
import modak1 from './assets/images/modak-1.png';
import basket from './assets/images/basket.png';
import belly from './assets/images/belly.png';
import mooshika from '../../shared/images/icons/symbol-mooshika-colored.png';

// Phase constants (should match your scene)
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
        description: 'These are brown hills. Tap them to search for Mooshika hiding inside!',
        priority: 1
      });
    }
    
    // Phase 2: Collecting modaks
    if (sceneState.phase === PHASES.MODAKS_UNLOCKED || 
        sceneState.phase === PHASES.SOME_COLLECTED) {
      
      if (!sceneState.basketFull) {
        hints.push({
          image: modak1,
          name: 'Modaks',
          description: 'Sweet treats that Ganesha loves! Tap them to collect.',
          priority: 1
        });
        
        hints.push({
          image: basket,
          name: 'Basket',
          description: 'Holds the modaks you collect. Fill it up with 3 modaks!',
          priority: 2
        });
      }
    }
    
    // Phase 3: Feeding Ganesha
    if ((sceneState.phase === PHASES.ROCK_VISIBLE || 
         sceneState.phase === PHASES.ROCK_FEEDING) && 
        !sceneState.rockTransformed) {
      
      hints.push({
        image: belly,
        name: 'Ganesha Stone',
        description: 'This magical stone is Ganesha! Tap modaks from the basket to feed him.',
        priority: 1
      });
      
      hints.push({
        image: basket,
        name: 'Basket',
        description: 'Tap a modak from the basket, then tap the stone to feed Ganesha!',
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