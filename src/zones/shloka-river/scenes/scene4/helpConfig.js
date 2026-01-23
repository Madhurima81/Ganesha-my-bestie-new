// zones/shloka-river/scenes/Scene4/helpConfig.js
// Help menu configuration for Sarvakaryeshu Chant (Shloka River Scene 4)

// Import images
import sarSquirrelHappy from './assets/images/sarvakaryeshu/sar-squirrel-happy.png';
import sarSquirrelHelper from './assets/images/sarvakaryeshu/sar-squirrel-helper.png';
import sarSquirrelSad from './assets/images/sarvakaryeshu/sar-squirrel-sad.png';
import vaBirdHappy from './assets/images/sarvakaryeshu/va-bird-happy.png';
import karDuckHappy from './assets/images/sarvakaryeshu/kar-duck-happy.png';
import yeshuRabbitHappy from './assets/images/sarvakaryeshu/yeshu-rabbit-happy.png';
import savButterflyHappy from './assets/images/sarvada/sav-butterfly-happy.png';
import savButterflyHelper from './assets/images/sarvada/sav-butterfly-helper.png';
import vaFawnHappy from './assets/images/sarvada/va-fawn-happy.png';
import daHedgehogHappy from './assets/images/sarvada/da-hedgehog-happy.png';
import appSarvakaryeshu from '../assets/images/apps/app-sarvakaryeshu.png';
import appSarvada from '../assets/images/apps/app-sarvada.png';

// Phase constants (should match your scene)
const PHASES = {
  INITIAL: 'initial',
  SARVAKARYESHU_GAME_ACTIVE: 'sarvakaryeshu_game_active',
  SARVAKARYESHU_LEARNING: 'sarvakaryeshu_learning',
  SARVADA_GAME_ACTIVE: 'sarvada_game_active',
  SARVADA_LEARNING: 'sarvada_learning',
  COMPLETE: 'complete'
};

export const sarvakaryeshuChantHelpConfig = {
  sceneId: 'sarvakaryeshu-chant',
  sceneName: 'Sarvakaryeshu Chant',
  zoneId: 'shloka-river',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INITIAL / WELCOME ====================
    if (sceneState.phase === PHASES.INITIAL) {
      hints.push({
        image: appSarvakaryeshu,
        name: 'Final Challenge!',
        description: 'Learn the last 2 Sanskrit words with helper animals!',
        priority: 1
      });
      
      hints.push({
        image: sarSquirrelSad,
        name: 'Memory Games',
        description: 'Watch sad animals get help, then tap them in the correct order!',
        priority: 2
      });
    }
    
    // ==================== SARVAKARYESHU GAME ====================
    if (sceneState.phase === PHASES.SARVAKARYESHU_GAME_ACTIVE) {
      hints.push({
        image: sarSquirrelSad,
        name: 'Sarvakaryeshu Memory Game',
        description: 'Watch sad animals get help from helpers, then tap them in order: Sar → Va → Kar → Yeshu',
        priority: 1
      });
      
      hints.push({
        image: sarSquirrelHelper,
        name: 'Helper Animals',
        description: 'Each sad animal gets help from a helper! Watch the transformation carefully.',
        priority: 2
      });
      
      hints.push({
        image: sarSquirrelHappy,
        name: 'Happy Animals',
        description: 'After getting help, sad animals become happy! This teaches Sarvakaryeshu (in all tasks).',
        priority: 3
      });
      
      // Show mode info if selected
      if (sceneState.sarvakaryeshuMode === 'auto') {
        hints.push({
          image: vaBirdHappy,
          name: 'Auto Mode',
          description: 'Animals will automatically appear in sequence - watch carefully!',
          priority: 4
        });
      } else if (sceneState.sarvakaryeshuMode === 'manual') {
        hints.push({
          image: vaBirdHappy,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to see the sequence before repeating it!',
          priority: 4
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['sar', 'va', 'kar', 'yeshu'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: karDuckHappy,
          name: `Progress: ${learnedSyllables.length}/4`,
          description: `Great work! ${4 - learnedSyllables.length} more syllable${4 - learnedSyllables.length > 1 ? 's' : ''} to learn in Sarvakaryeshu!`,
          priority: 5
        });
      }
    }
    
    // ==================== SARVAKARYESHU LEARNING ====================
    if (sceneState.phase === PHASES.SARVAKARYESHU_LEARNING) {
      hints.push({
        image: appSarvakaryeshu,
        name: 'Learning Sarvakaryeshu',
        description: 'Practice saying "Sarvakaryeshu" (in all tasks) - getting help with everything!',
        priority: 1
      });
      
      hints.push({
        image: yeshuRabbitHappy,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    // ==================== SARVADA GAME ====================
    if (sceneState.phase === PHASES.SARVADA_GAME_ACTIVE) {
      hints.push({
        image: savButterflySad,
        name: 'Sarvada Memory Game',
        description: 'Watch sad animals get help, then tap them in order: Sav → Va → Da',
        priority: 1
      });
      
      hints.push({
        image: savButterflyHelper,
        name: 'Helper Animals',
        description: 'Watch as helpers come to support the sad animals - help is always available!',
        priority: 2
      });
      
      hints.push({
        image: savButterflyHappy,
        name: 'Always Happy',
        description: 'Helpers transform sad animals to happy ones! This teaches Sarvada (always).',
        priority: 3
      });
      
      // Show mode info if selected
      if (sceneState.sarvadaMode === 'auto') {
        hints.push({
          image: vaFawnHappy,
          name: 'Auto Mode',
          description: 'Animals will automatically appear - watch carefully!',
          priority: 4
        });
      } else if (sceneState.sarvadaMode === 'manual') {
        hints.push({
          image: vaFawnHappy,
          name: 'Manual Mode',
          description: 'Tap the 🔊 button to see the sequence before repeating it!',
          priority: 4
        });
      }
      
      // Show progress if game started
      const learnedSyllables = ['sav', 'va', 'da'].filter(
        s => sceneState.learnedSyllables?.[s]
      );
      if (learnedSyllables.length > 0) {
        hints.push({
          image: daHedgehogHappy,
          name: `Progress: ${learnedSyllables.length}/3`,
          description: `Wonderful! ${3 - learnedSyllables.length} more syllable${3 - learnedSyllables.length > 1 ? 's' : ''} to learn in Sarvada!`,
          priority: 5
        });
      }
    }
    
    // ==================== SARVADA LEARNING ====================
    if (sceneState.phase === PHASES.SARVADA_LEARNING) {
      hints.push({
        image: appSarvada,
        name: 'Learning Sarvada',
        description: 'Practice saying "Sarvada" (always) - help is always available!',
        priority: 1
      });
      
      hints.push({
        image: vaFawnHappy,
        name: 'Say It Out Loud',
        description: 'Tap the syllables to hear them, then practice saying the whole word!',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Watch sad animals get help from helpers!',
    'Tap animals in the correct order to learn syllables!',
    'Each correct sequence teaches you a Sanskrit syllable!',
    'Helpers show that support is available in all tasks, always!',
    'Found a word in your smartwatch? Tap it to learn more!'
  ]
};