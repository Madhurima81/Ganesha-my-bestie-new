// zones/shloka-river/scenes/Scene1/helpConfig.js
// Help menu configuration for Vakratunda Grove (Shloka River Scene 1)

// Import images
import elephantBabyVa from './assets/images/vakratunda/elephant-baby-va.png';
import elephantBabyKra from './assets/images/vakratunda/elephant-baby-kra.png';
import elephantBabyTun from './assets/images/vakratunda/elephant-baby-tun.png';
import elephantBabyDa from './assets/images/vakratunda/elephant-baby-da.png';
import elephantHa from './assets/images/mahakaya/elephant-ha.png';
import elephantKa from './assets/images/mahakaya/elephant-ka.png';
import elephantMa from './assets/images/mahakaya/elephant-ma.png';
import elephantYa from './assets/images/mahakaya/elephant-ya.png';
import budVa from './assets/images/vakratunda/va-bud.png';
import lotusVa from './assets/images/vakratunda/va-lotus.png';
import seedImage from './assets/images/mahakaya/seed.png';
import flowerMa from './assets/images/mahakaya/ma-flower.png';
import appVakratunda from '../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../assets/images/apps/app-mahakaya.png';

// Phase constants (should match your scene)
const PHASES = {
  INITIAL: 'initial',
  VAKRATUNDA_GAME: 'vakratunda_game',
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  MAHAKAYA_GAME: 'mahakaya_game',
  MAHAKAYA_LEARNING: 'mahakaya_learning',
  COMPLETE: 'complete'
};

export const vakratundaGroveHelpConfig = {
  sceneId: 'vakratunda-grove',
  sceneName: 'Vakratunda Grove',
  zoneId: 'shloka-river',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INITIAL / WELCOME ====================
    if (sceneState.phase === PHASES.INITIAL) {
      hints.push({
        image: appVakratunda,
        name: 'Welcome to Shloka River!',
        description: 'Learn 2 Sanskrit words through fun memory games with baby elephants!',
        priority: 1
      });
      
      hints.push({
        image: elephantBabyVa,
        name: 'Memory Games',
        description: 'Tap baby elephants in the correct order to learn Sanskrit syllables!',
        priority: 2
      });
    }
    
    // ==================== VAKRATUNDA GAME ====================
    if (sceneState.phase === PHASES.VAKRATUNDA_GAME) {
      hints.push({
        image: elephantBabyVa,
        name: 'Vakratunda Memory Game',
        description: 'Watch the sequence, then tap the baby elephants in the same order: Va → Kra → Tun → Da',
        priority: 1
      });
      
      hints.push({
        image: budVa,
        name: 'Lotus Rewards',
        description: 'Each correct sequence makes a lotus bud bloom into a beautiful flower!',
        priority: 2
      });
      
      // Show mode info if selected
      if (sceneState.vakratundaMode === 'auto') {
        hints.push({
          image: elephantBabyVa,
          name: 'Auto Mode',
          description: 'Elephants will automatically play the sequence - watch carefully!',
          priority: 3
        });
      } else if (sceneState.vakratundaMode === 'manual') {
        hints.push({
          image: elephantBabyVa,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to hear the sequence before repeating it!',
          priority: 3
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['va', 'kra', 'tun', 'da'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: lotusVa,
          name: `Progress: ${learnedSyllables.length}/4`,
          description: `Great! ${4 - learnedSyllables.length} more syllable${4 - learnedSyllables.length > 1 ? 's' : ''} to learn in Vakratunda!`,
          priority: 4
        });
      }
    }
    
    // ==================== VAKRATUNDA LEARNING ====================
    if (sceneState.phase === PHASES.VAKRATUNDA_LEARNING) {
      hints.push({
        image: appVakratunda,
        name: 'Learning Vakratunda',
        description: 'Practice saying "Vakratunda" (curved trunk) and learn its meaning!',
        priority: 1
      });
      
      hints.push({
        image: elephantBabyVa,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    // ==================== MAHAKAYA GAME ====================
    if (sceneState.phase === PHASES.MAHAKAYA_GAME) {
      hints.push({
        image: elephantMa,
        name: 'Mahakaya Memory Game',
        description: 'Watch the sequence, then tap the elephants in order: Ma → Ha → Ka → Ya',
        priority: 1
      });
      
      hints.push({
        image: seedImage,
        name: 'Flower Rewards',
        description: 'Each correct sequence makes a seed grow into a colorful flower!',
        priority: 2
      });
      
      // Show mode info if selected
      if (sceneState.mahakayaMode === 'auto') {
        hints.push({
          image: elephantMa,
          name: 'Auto Mode',
          description: 'Elephants will automatically play the sequence - watch carefully!',
          priority: 3
        });
      } else if (sceneState.mahakayaMode === 'manual') {
        hints.push({
          image: elephantMa,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to hear the sequence before repeating it!',
          priority: 3
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['ma', 'ha', 'ka', 'ya'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: flowerMa,
          name: `Progress: ${learnedSyllables.length}/4`,
          description: `Excellent! ${4 - learnedSyllables.length} more syllable${4 - learnedSyllables.length > 1 ? 's' : ''} to learn in Mahakaya!`,
          priority: 4
        });
      }
    }
    
    // ==================== MAHAKAYA LEARNING ====================
    if (sceneState.phase === PHASES.MAHAKAYA_LEARNING) {
      hints.push({
        image: appMahakaya,
        name: 'Learning Mahakaya',
        description: 'Practice saying "Mahakaya" (big body) and learn its meaning!',
        priority: 1
      });
      
      hints.push({
        image: elephantMa,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Watch the elephant sequence carefully before repeating it!',
    'Each correct sequence teaches you a Sanskrit syllable!',
    'Tap syllables to hear how they sound!',
    'Complete both Vakratunda and Mahakaya to finish!',
    'Found a word in your smartwatch? Tap it to learn more!'
  ]
};