// zones/shloka-river/scenes/Scene3/helpConfig.js
// Help menu configuration for Nirvighnam Chant (Shloka River Scene 3)

// Import images
import frogNir from './assets/images/nirvighnam/nir-frog.png';
import snailVigh from './assets/images/nirvighnam/nir-snail.png';
import turtleNam from './assets/images/nirvighnam/nir-turtle.png';
import leafNir from './assets/images/nirvighnam/nir-leaf.png';
import drumVigh from './assets/images/nirvighnam/nir-drum.png';
import featherNam from './assets/images/nirvighnam/nir-feather.png';
import stone1Nir from './assets/images/nirvighnam/stone1.png';
import stone2Vigh from './assets/images/nirvighnam/stone2.png';
import stone3Nam from './assets/images/nirvighnam/stone3.png';
import stone1NirCol from './assets/images/nirvighnam/stone1-col.png';
import stone2VighCol from './assets/images/nirvighnam/stone2-col.png';
import stone3NamCol from './assets/images/nirvighnam/stone3-col.png';
import animal1Ku from './assets/images/Kurumedeva/animal1-ku.png';
import animal2Ru from './assets/images/Kurumedeva/animal2-ru.png';
import animal3Me from './assets/images/Kurumedeva/animal3-me.png';
import animal4De from './assets/images/Kurumedeva/animal4-de.png';
import decor1Ku from './assets/images/Kurumedeva/decor1-ku.png';
import decor2Ru from './assets/images/Kurumedeva/decor2-ru.png';
import decor3Me from './assets/images/Kurumedeva/decor3-me.png';
import decor4De from './assets/images/Kurumedeva/decor4-de.png';
import appNirvighnam from '../assets/images/apps/app-nirvighnam.png';
import appKurumedeva from '../assets/images/apps/app-kurumedeva.png';

// Phase constants (should match your scene)
const PHASES = {
  INITIAL: 'initial',
  NIRVIGHNAM_GAME_ACTIVE: 'nirvighnam_game_active',
  NIRVIGHNAM_LEARNING: 'nirvighnam_learning',
  KURUMEDEVA_GAME_ACTIVE: 'kurumedeva_game_active',
  KURUMEDEVA_LEARNING: 'kurumedeva_learning',
  COMPLETE: 'complete'
};

export const nirvighnamChantHelpConfig = {
  sceneId: 'nirvighnam-chant',
  sceneName: 'Nirvighnam Chant',
  zoneId: 'shloka-river',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INITIAL / WELCOME ====================
    if (sceneState.phase === PHASES.INITIAL) {
      hints.push({
        image: appNirvighnam,
        name: 'Welcome to Nirvighnam Chant!',
        description: 'Learn the final 2 Sanskrit words through animal and decoration games!',
        priority: 1
      });
      
      hints.push({
        image: frogNir,
        name: 'Memory Games',
        description: 'Watch animals and objects, then tap them in the correct order!',
        priority: 2
      });
    }
    
    // ==================== NIRVIGHNAM GAME ====================
    if (sceneState.phase === PHASES.NIRVIGHNAM_GAME_ACTIVE) {
      hints.push({
        image: frogNir,
        name: 'Nirvighnam Memory Game',
        description: 'Watch the sequence of animals and objects, then tap them in order: Nir → Vigh → Nam',
        priority: 1
      });
      
      hints.push({
        image: stone1Nir,
        name: 'Stone Rewards',
        description: 'Each correct sequence transforms a gray stone into a colorful decorated stone!',
        priority: 2
      });
      
      hints.push({
        image: leafNir,
        name: 'Animals & Objects',
        description: 'Watch for frogs, snails, turtles, leaves, drums, and feathers in the sequence!',
        priority: 3
      });
      
      // Show mode info if selected
      if (sceneState.nirvighnamMode === 'auto') {
        hints.push({
          image: frogNir,
          name: 'Auto Mode',
          description: 'Animals and objects will automatically appear - watch carefully!',
          priority: 4
        });
      } else if (sceneState.nirvighnamMode === 'manual') {
        hints.push({
          image: frogNir,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to see the sequence before repeating it!',
          priority: 4
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['nir', 'vigh', 'nam'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: stone1NirCol,
          name: `Progress: ${learnedSyllables.length}/3`,
          description: `Great! ${3 - learnedSyllables.length} more syllable${3 - learnedSyllables.length > 1 ? 's' : ''} to learn in Nirvighnam!`,
          priority: 5
        });
      }
    }
    
    // ==================== NIRVIGHNAM LEARNING ====================
    if (sceneState.phase === PHASES.NIRVIGHNAM_LEARNING) {
      hints.push({
        image: appNirvighnam,
        name: 'Learning Nirvighnam',
        description: 'Practice saying "Nirvighnam" (without obstacles) and learn its power!',
        priority: 1
      });
      
      hints.push({
        image: frogNir,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    // ==================== KURUMEDEVA GAME ====================
    if (sceneState.phase === PHASES.KURUMEDEVA_GAME_ACTIVE) {
      hints.push({
        image: animal1Ku,
        name: 'Kurumedeva Memory Game',
        description: 'Watch the sequence of animals and items, then tap them in order: Ku → Ru → Me → De',
        priority: 1
      });
      
      hints.push({
        image: decor1Ku,
        name: 'Decoration Rewards',
        description: 'Each correct sequence reveals beautiful decorations for the scene!',
        priority: 2
      });
      
      hints.push({
        image: animal2Ru,
        name: 'Animals & Items',
        description: 'Watch for different animals and special items in the sequence!',
        priority: 3
      });
      
      // Show mode info if selected
      if (sceneState.kurumedevaMode === 'auto') {
        hints.push({
          image: animal3Me,
          name: 'Auto Mode',
          description: 'Items will automatically appear - watch carefully!',
          priority: 4
        });
      } else if (sceneState.kurumedevaMode === 'manual') {
        hints.push({
          image: animal3Me,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to see the sequence before repeating it!',
          priority: 4
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['ku', 'ru', 'me', 'de'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: decor2Ru,
          name: `Progress: ${learnedSyllables.length}/4`,
          description: `Excellent! ${4 - learnedSyllables.length} more syllable${4 - learnedSyllables.length > 1 ? 's' : ''} to learn in Kurumedeva!`,
          priority: 5
        });
      }
    }
    
    // ==================== KURUMEDEVA LEARNING ====================
    if (sceneState.phase === PHASES.KURUMEDEVA_LEARNING) {
      hints.push({
        image: appKurumedeva,
        name: 'Learning Kurumedeva',
        description: 'Practice saying "Kurumedeva" (divine help) and learn about blessings!',
        priority: 1
      });
      
      hints.push({
        image: animal1Ku,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Watch the animal and object sequences carefully!',
    'Each correct sequence teaches you a Sanskrit syllable!',
    'Tap syllables to hear how they sound!',
    'Stones transform and decorations appear as you progress!',
    'Found a word in your smartwatch? Tap it to learn more!'
  ]
};