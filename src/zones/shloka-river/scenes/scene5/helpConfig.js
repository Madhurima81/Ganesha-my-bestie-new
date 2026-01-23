// zones/shloka-river/scenes/Scene5/helpConfig.js
// Help menu configuration for Shloka River Finale (Final Challenge)

// Import animal images
import vakratundaElephant from './assets/images/Vakratunda-elephant.png';
import mahakayaElephant from './assets/images/mahakaya-elephant.png';
import samaprabhaKitten from './assets/images/samaprabha-kitten.png';
import suryakotiFairy from './assets/images/suryakoti-fairy.png';
import nirvighnamSnail from './assets/images/nirvighnam-snail.png';
import kurumedevaPeacock from './assets/images/kurumedeva-peacock.png';
import sarvakaryeshuDuck from './assets/images/sarvakaryeshu-duck.png';
import sarvadaFawn from './assets/images/sarvada-fawn.png';
import raftImage from './assets/images/raft.png';

// Phase constants (should match your scene)
const PHASES = {
  INITIAL: 'initial',
  BOARDING_FIRST_GROUP: 'boarding_first_group',
  MID_CELEBRATION: 'mid_celebration',
  BOARDING_SECOND_GROUP: 'boarding_second_group',
  FINAL_CELEBRATION: 'final_celebration',
  ZONE_COMPLETE: 'zone_complete'
};

export const shlokaRiverFinaleHelpConfig = {
  sceneId: 'shloka-river-finale',
  sceneName: 'River Journey Finale',
  zoneId: 'shloka-river',
  
  // Dynamic hints based on current phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INITIAL / WELCOME ====================
    if (sceneState.phase === PHASES.INITIAL) {
      hints.push({
        image: raftImage,
        name: 'Final Challenge: Board the Raft!',
        description: 'Help all 8 animals board the raft in the CORRECT ORDER they were learned!',
        priority: 1
      });
      
      hints.push({
        image: vakratundaElephant,
        name: 'Remember the Order',
        description: 'Tap animals in the order you learned them: Vakratunda first, Sarvada last!',
        priority: 2
      });
    }
    
    // ==================== BOARDING FIRST GROUP (1-4) ====================
    if (sceneState.phase === PHASES.BOARDING_FIRST_GROUP) {
      const onRaft = sceneState.animalsOnRaft?.length || 0;
      
      hints.push({
        image: vakratundaElephant,
        name: 'Group 1: First 4 Words',
        description: 'Tap in order: Vakratunda → Mahakaya → Suryakoti → Samaprabha',
        priority: 1
      });
      
      if (onRaft > 0) {
        hints.push({
          image: mahakayaElephant,
          name: `Progress: ${onRaft}/4 animals`,
          description: `Great! ${4 - onRaft} more animal${4 - onRaft > 1 ? 's' : ''} need to board in Group 1!`,
          priority: 2
        });
      }
      
      // Show which animal is next
      if (onRaft === 0) {
        hints.push({
          image: vakratundaElephant,
          name: 'Next: Vakratunda',
          description: 'Tap the Vakratunda Elephant first - it was the very first word you learned!',
          priority: 3
        });
      } else if (onRaft === 1) {
        hints.push({
          image: mahakayaElephant,
          name: 'Next: Mahakaya',
          description: 'Tap the Mahakaya Elephant - the second word you learned!',
          priority: 3
        });
      } else if (onRaft === 2) {
        hints.push({
          image: suryakotiFairy,
          name: 'Next: Suryakoti',
          description: 'Tap the Suryakoti Fairy - word number three!',
          priority: 3
        });
      } else if (onRaft === 3) {
        hints.push({
          image: samaprabhaKitten,
          name: 'Next: Samaprabha',
          description: 'Tap the Samaprabha Kitten - the fourth word!',
          priority: 3
        });
      }
    }
    
    // ==================== MID CELEBRATION ====================
    if (sceneState.phase === PHASES.MID_CELEBRATION) {
      hints.push({
        image: samaprabhaKitten,
        name: 'Halfway There!',
        description: 'Amazing! First 4 animals are on the raft. Get ready for Group 2!',
        priority: 1
      });
    }
    
    // ==================== BOARDING SECOND GROUP (5-8) ====================
    if (sceneState.phase === PHASES.BOARDING_SECOND_GROUP) {
      const onRaft = sceneState.animalsOnRaft?.length || 0;
      const group2Progress = onRaft - 4;
      
      hints.push({
        image: nirvighnamSnail,
        name: 'Group 2: Last 4 Words',
        description: 'Tap in order: Nirvighnam → Kurumedeva → Sarvakaryeshu → Sarvada',
        priority: 1
      });
      
      if (group2Progress > 0) {
        hints.push({
          image: kurumedevaPeacock,
          name: `Progress: ${group2Progress}/4 animals`,
          description: `Excellent! ${4 - group2Progress} more animal${4 - group2Progress > 1 ? 's' : ''} to complete the journey!`,
          priority: 2
        });
      }
      
      // Show which animal is next
      if (onRaft === 4) {
        hints.push({
          image: nirvighnamSnail,
          name: 'Next: Nirvighnam',
          description: 'Tap the Nirvighnam Snail - word number five!',
          priority: 3
        });
      } else if (onRaft === 5) {
        hints.push({
          image: kurumedevaPeacock,
          name: 'Next: Kurumedeva',
          description: 'Tap the Kurumedeva Peacock - word number six!',
          priority: 3
        });
      } else if (onRaft === 6) {
        hints.push({
          image: sarvakaryeshuDuck,
          name: 'Next: Sarvakaryeshu',
          description: 'Tap the Sarvakaryeshu Duck - word number seven!',
          priority: 3
        });
      } else if (onRaft === 7) {
        hints.push({
          image: sarvadaFawn,
          name: 'Next: Sarvada',
          description: 'Tap the Sarvada Fawn - the final word!',
          priority: 3
        });
      }
    }
    
    // ==================== FINAL CELEBRATION ====================
    if (sceneState.phase === PHASES.FINAL_CELEBRATION || sceneState.phase === PHASES.ZONE_COMPLETE) {
      hints.push({
        image: raftImage,
        name: 'Journey Complete!',
        description: 'All 8 animals are on the raft! You mastered all Sanskrit words in Shloka River!',
        priority: 1
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Tap animals in the order you learned the words!',
    'Each animal says their Sanskrit word when boarding!',
    'Wrong animal? Try to remember the learning order!',
    'First 4 animals board, then celebrate, then last 4!',
    'This is your final test - can you remember all 8 words in order?'
  ]
};