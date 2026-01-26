// zones/cave-of-secrets/scenes/Scene5/helpConfig.js
// Help menu configuration for Cave Memory Finale (Final Challenge)

// Import symbol images for visual hints
import vakratundaSymbol from '../../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../../assets/images/symbols/sarvada-symbol.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

export const caveMemoryFinaleHelpConfig = {
  sceneId: 'cave-scene5-memory-finale',
  sceneName: 'Memory Challenge',
  zoneId: 'cave-of-secrets',
  
  // Dynamic hints based on game state
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== GAME NOT STARTED ====================
    if (!sceneState.gameStarted) {
      hints.push({
        image: ganeshaCharacter,
        name: 'Final Memory Challenge',
        description: 'Match all 8 Sanskrit words with their meanings in this final test of memory!',
        priority: 1
      });
      
      hints.push({
        image: vakratundaSymbol,
        name: 'How to Play',
        description: 'Tap two cards to flip them. Match each symbol with its meaning to win!',
        priority: 2
      });
      
      return hints;
    }
    
    // ==================== ROUND 1: First 4 Words ====================
    if (sceneState.currentRound === 1 && !sceneState.round1Complete) {
      const matchedCount = (sceneState.matchedPairs || []).length / 2;
      
      hints.push({
        image: vakratundaSymbol,
        name: 'Round 1: First 4 Words',
        description: 'Match these 4 Sanskrit words with their meanings: Vakratunda, Mahakaya, Suryakoti, Samaprabha',
        priority: 1
      });
      
      if (matchedCount > 0 && matchedCount < 4) {
        hints.push({
          image: mahakayaSymbol,
          name: `Matched: ${matchedCount}/4`,
          description: `Great! ${4 - matchedCount} more pair${4 - matchedCount > 1 ? 's' : ''} to match in this round!`,
          priority: 2
        });
      }
      
      // Show what words are in this round
      hints.push({
        image: suryakotiSymbol,
        name: 'Words in Round 1',
        description: 'Vakratunda (Curved Trunk), Mahakaya (Big Body), Suryakoti (Million Suns), Samaprabha (Equal Brilliance)',
        priority: 3
      });
    }
    
    // ==================== ROUND 2: Last 4 Words ====================
    if (sceneState.currentRound === 2 && !sceneState.round2Complete) {
      const matchedCount = (sceneState.matchedPairs || []).length / 2;
      
      hints.push({
        image: nirvighnamSymbol,
        name: 'Round 2: Last 4 Words',
        description: 'Match these 4 Sanskrit words with their meanings: Nirvighnam, Kurumedeva, Sarvakaryeshu, Sarvada',
        priority: 1
      });
      
      if (matchedCount > 0 && matchedCount < 4) {
        hints.push({
          image: kurumedevaSymbol,
          name: `Matched: ${matchedCount}/4`,
          description: `Excellent! ${4 - matchedCount} more pair${4 - matchedCount > 1 ? 's' : ''} to complete the challenge!`,
          priority: 2
        });
      }
      
      // Show what words are in this round
      hints.push({
        image: sarvakaryeshuSymbol,
        name: 'Words in Round 2',
        description: 'Nirvighnam (Without Obstacles), Kurumedeva (Divine Help), Sarvakaryeshu (In All Tasks), Sarvada (Always)',
        priority: 3
      });
    }
    
    // ==================== GENERAL MEMORY TIPS ====================
    // Always show these helpful tips
    hints.push({
      image: ganeshaCharacter,
      name: 'Ganesha\'s Hint Power',
      description: 'Use the 👁️ Ganesha Help button to peek at all cards for 1.5 seconds! You have 3 hints.',
      priority: 10
    });
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Tap two cards to flip them and find matching pairs!',
    'Match each Sanskrit word symbol with its meaning!',
    'Use Ganesha\'s hint (👁️) to peek at all cards briefly!',
    'Complete Round 1 before moving to Round 2!',
    'Try to remember where each card is located!'
  ]
};