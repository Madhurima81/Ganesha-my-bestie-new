// zones/shloka-river/scenes/Scene2/helpConfig.js
// Help menu configuration for Suryakoti Bank (Shloka River Scene 2)

// Import images
import sunflowerClose from './assets/images/Suryakoti/sunflower-close.png';
import sunflowerOpen from './assets/images/Suryakoti/sunflower-open.png';
import sunOrb from './assets/images/Suryakoti/suryakoti-sun.png';
import rainbowRed from './assets/images/Samaprabha/rainbow-red.png';
import rainbowBlue from './assets/images/Samaprabha/rainbow-blue.png';
import bunnySad from './assets/images/Samaprabha/bunny-sad.png';
import bunnyHappy from './assets/images/Samaprabha/bunny-happy.png';
import mangoBubble from './assets/images/Samaprabha/mango-bubble.png';
import mangoPlate from './assets/images/Samaprabha/mango-plate.png';
import appSuryakoti from '../assets/images/apps/app-suryakoti.png';
import appSamaprabha from '../assets/images/apps/app-samaprabha.png';

// Phase constants (should match your scene)
const PHASES = {
  INITIAL: 'initial',
  SURYAKOTI_GAME_ACTIVE: 'suryakoti_game_active',
  SURYAKOTI_LEARNING: 'suryakoti_learning',
  SAMAPRABHA_GAME_ACTIVE: 'samaprabha_game_active',
  SAMAPRABHA_LEARNING: 'samaprabha_learning',
  COMPLETE: 'complete'
};

export const suryakotiBankHelpConfig = {
  sceneId: 'suryakoti-bank',
  sceneName: 'Suryakoti Bank',
  zoneId: 'shloka-river',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INITIAL / WELCOME ====================
    if (sceneState.phase === PHASES.INITIAL) {
      hints.push({
        image: appSuryakoti,
        name: 'Welcome to Suryakoti Bank!',
        description: 'Learn 2 more Sanskrit words through fun memory games!',
        priority: 1
      });
      
      hints.push({
        image: sunOrb,
        name: 'Memory Games',
        description: 'Watch sun rays and rainbow colors, then tap them in the correct order!',
        priority: 2
      });
    }
    
    // ==================== SURYAKOTI GAME ====================
    if (sceneState.phase === PHASES.SURYAKOTI_GAME_ACTIVE) {
      hints.push({
        image: sunOrb,
        name: 'Suryakoti Memory Game',
        description: 'Watch the sun rays light up, then tap the flowers in the same order: Sur → Ya → Ko → Ti',
        priority: 1
      });
      
      hints.push({
        image: sunflowerClose,
        name: 'Flower Rewards',
        description: 'Each correct sequence makes a closed flower bloom open beautifully!',
        priority: 2
      });
      
      // Show mode info if selected
      if (sceneState.suryakotiMode === 'auto') {
        hints.push({
          image: sunOrb,
          name: 'Auto Mode',
          description: 'Sun rays will automatically light up the sequence - watch carefully!',
          priority: 3
        });
      } else if (sceneState.suryakotiMode === 'manual') {
        hints.push({
          image: sunOrb,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to see the sequence before repeating it!',
          priority: 3
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['sur', 'ya', 'ko', 'ti'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: sunflowerOpen,
          name: `Progress: ${learnedSyllables.length}/4`,
          description: `Brilliant! ${4 - learnedSyllables.length} more syllable${4 - learnedSyllables.length > 1 ? 's' : ''} to learn in Suryakoti!`,
          priority: 4
        });
      }
    }
    
    // ==================== SURYAKOTI LEARNING ====================
    if (sceneState.phase === PHASES.SURYAKOTI_LEARNING) {
      hints.push({
        image: appSuryakoti,
        name: 'Learning Suryakoti',
        description: 'Practice saying "Suryakoti" (million suns) and learn its radiant power!',
        priority: 1
      });
      
      hints.push({
        image: sunOrb,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    // ==================== SAMAPRABHA GAME ====================
    if (sceneState.phase === PHASES.SAMAPRABHA_GAME_ACTIVE) {
      hints.push({
        image: rainbowRed,
        name: 'Samaprabha Memory Game',
        description: 'Watch the rainbow colors light up, then tap the animals in order: Sa → Ma → Pra → Bha',
        priority: 1
      });
      
      hints.push({
        image: bunnyHappy,
        name: 'Animal Rewards',
        description: 'Each correct sequence transforms a sad animal into a happy one!',
        priority: 2
      });
      
      hints.push({
        image: mangoBubble,
        name: 'Mango Sharing',
        description: 'Feed mangoes to the animals to bring them happiness and equal radiance!',
        priority: 3
      });
      
      // Show mode info if selected
      if (sceneState.samaprabhaMode === 'auto') {
        hints.push({
          image: rainbowBlue,
          name: 'Auto Mode',
          description: 'Rainbow colors will automatically light up - watch carefully!',
          priority: 4
        });
      } else if (sceneState.samaprabhaMode === 'manual') {
        hints.push({
          image: rainbowBlue,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to see the sequence before repeating it!',
          priority: 4
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['sa', 'ma', 'pra', 'bha'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: bunnyHappy,
          name: `Progress: ${learnedSyllables.length}/4`,
          description: `Wonderful! ${4 - learnedSyllables.length} more syllable${4 - learnedSyllables.length > 1 ? 's' : ''} to learn in Samaprabha!`,
          priority: 5
        });
      }
    }
    
    // ==================== SAMAPRABHA LEARNING ====================
    if (sceneState.phase === PHASES.SAMAPRABHA_LEARNING) {
      hints.push({
        image: appSamaprabha,
        name: 'Learning Samaprabha',
        description: 'Practice saying "Samaprabha" (equal brilliance) and learn about balanced light!',
        priority: 1
      });
      
      hints.push({
        image: rainbowRed,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Watch the sun rays or rainbow colors carefully before repeating!',
    'Each correct sequence teaches you a Sanskrit syllable!',
    'Tap syllables to hear how they sound!',
    'Complete both Suryakoti and Samaprabha to finish!',
    'Found a word in your smartwatch? Tap it to learn more!'
  ]
};