// zones/shloka-river/configs/gameConfigs.js
// Configuration for all 8 Sanskrit memory games

export const GAME_CONFIGS = {
  
  // Game 1: Vakratunda
  vakratunda: {
    id: 'vakratunda',
    displayName: 'Vakratunda',
    theme: {
      primaryColor: '#4CAF50',
      accentColor: '#81C784',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    
    syllables: {
      1: ['va', 'kra'],
      2: ['va', 'kra', 'tun'],
      3: ['va', 'kra', 'tun', 'da']
    },
    
    elements: {
      singer: {
        type: 'lotus',
        count: 4,
        ids: ['lotus-va', 'lotus-kra', 'lotus-tun', 'lotus-da'],
        positions: [
          { left: '25%', top: '45%' },
          { left: '35%', top: '55%' },
          { left: '45%', top: '60%' },
          { left: '75%', top: '50%' }
        ],
        // ✅ BUG 6 & 8 FIX: Separate getters for initial (bud) vs reward (lotus) states
        assetGetterInitial: 'getBudImage',  // Shows when syllable NOT learned
        assetGetterReward: 'getLotusImage'   // Shows when syllable IS learned
      },
      clicker: {
        type: 'baby-elephant',
        count: 4,
        ids: ['baby-elephant-va', 'baby-elephant-kra', 'baby-elephant-tun', 'baby-elephant-da'],
        positions: [
          { left: '18%', top: '65%' },
          { left: '38%', top: '35%' },
          { left: '58%', top: '30%' },
          { left: '68%', top: '28%' }
        ],
        assetGetter: 'getBabyElephantImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'va': 'vakratunda-va',
        'kra': 'vakratunda-kra',
        'tun': 'vakratunda-tun',
        'da': 'vakratunda-da'
      },
      completeWordFile: '/audio/words/Vakratunda.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 15,
      duration: 1500,
      color: '#64B5F6'
    },
    
    celebration: {
      emoji: '🪷',
      message: 'Lotus bloomed! Beautiful!'
    }
  },

  // Game 2: Mahakaya
  mahakaya: {
    id: 'mahakaya',
    displayName: 'Mahakaya',
    theme: {
      primaryColor: '#FF9800',
      accentColor: '#FFB74D',
      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    
    syllables: {
      1: ['ma', 'ha'],
      2: ['ma', 'ha', 'ka'],
      3: ['ma', 'ha', 'ka', 'ya']
    },
    
    elements: {
      singer: {
        type: 'stone',
        count: 4,
        ids: ['stone-ma', 'stone-ha', 'stone-ka', 'stone-ya'],
        positions: [
          { left: '20%', top: '60%' },
          { left: '40%', top: '65%' },
          { left: '60%', top: '58%' },
          { left: '80%', top: '62%' }
        ],
        // ✅ BUG 6 & 8 FIX: Separate getters for initial (seed) vs reward (flower) states
        assetGetterInitial: 'getSeedImage',   // Shows when syllable NOT learned
        assetGetterReward: 'getFlowerImage'    // Shows when syllable IS learned
      },
      clicker: {
        type: 'adult-elephant',
        count: 4,
        ids: ['adult-elephant-ma', 'adult-elephant-ha', 'adult-elephant-ka', 'adult-elephant-ya'],
        positions: [
          { left: '12%', top: '70%' },
          { left: '32%', top: '75%' },
          { left: '52%', top: '72%' },
          { left: '72%', top: '78%' }
        ],
        assetGetter: 'getAdultElephantImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'ma': 'mahakaya-ma',
        'ha': 'mahakaya-ha',
        'ka': 'mahakaya-ka',
        'ya': 'mahakaya-ya'
      },
      completeWordFile: '/audio/words/Mahakaya.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 20,
      duration: 1500,
      color: '#FF9800'
    },
    
    celebration: {
      emoji: '🗿',
      message: 'Stone glows with power!'
    }
  },

  // Game 3: Ekadanta (example structure for your other games)
  ekadanta: {
    id: 'ekadanta',
    displayName: 'Ekadanta',
    theme: {
      primaryColor: '#9C27B0',
      accentColor: '#BA68C8',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    
    syllables: {
      1: ['e', 'ka'],
      2: ['e', 'ka', 'dan'],
      3: ['e', 'ka', 'dan', 'ta']
    },
    
    elements: {
      singer: {
        type: 'crystal',
        count: 4,
        ids: ['crystal-e', 'crystal-ka', 'crystal-dan', 'crystal-ta'],
        positions: [
          { left: '22%', top: '48%' },
          { left: '38%', top: '52%' },
          { left: '48%', top: '58%' },
          { left: '78%', top: '48%' }
        ],
        assetGetter: 'getCrystalImage'
      },
      clicker: {
        type: 'mouse',
        count: 4,
        ids: ['mouse-e', 'mouse-ka', 'mouse-dan', 'mouse-ta'],
        positions: [
          { left: '15%', top: '68%' },
          { left: '35%', top: '38%' },
          { left: '55%', top: '33%' },
          { left: '65%', top: '31%' }
        ],
        assetGetter: 'getMouseImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'e': 'ekadanta-e',
        'ka': 'ekadanta-ka',
        'dan': 'ekadanta-dan',
        'ta': 'ekadanta-ta'
      },
      completeWordFile: '/audio/words/Ekadanta.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 18,
      duration: 1500,
      color: '#BA68C8'
    },
    
    celebration: {
      emoji: '💎',
      message: 'Crystal radiates brilliance!'
    }
  },

  // Template for remaining 5 games
  // Just copy this structure and modify:
  // - syllables
  // - element types and positions
  // - audio file mappings
  // - theme colors
  // - celebration messages

  game4: {
    id: 'game4',
    displayName: 'Game 4 Name',
    // ... same structure as above
  },

  game5: {
    id: 'game5',
    displayName: 'Game 5 Name',
    // ... same structure as above
  },

  game6: {
    id: 'game6',
    displayName: 'Game 6 Name',
    // ... same structure as above
  },

  game7: {
    id: 'game7',
    displayName: 'Game 7 Name',
    // ... same structure as above
  },

  game8: {
    id: 'game8',
    displayName: 'Game 8 Name',
    // ... same structure as above
  }
};

// Helper function to get game config
export const getGameConfig = (gameId) => {
  return GAME_CONFIGS[gameId];
};

// Get all game IDs
export const getAllGameIds = () => {
  return Object.keys(GAME_CONFIGS);
};

// Validation helper
export const validateGameConfig = (config) => {
  const required = ['id', 'syllables', 'elements', 'audio'];
  return required.every(field => config && config[field]);
};