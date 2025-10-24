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

  // Game 3: Suryakoti (Restored)
  suryakoti: {
    id: 'suryakoti',
    displayName: 'Suryakoti',
    theme: {
      primaryColor: '#FFD700', // Gold/Solar Color
      accentColor: '#FFA500',  // Orange/Sun Color
      backgroundColor: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    },
    
    syllables: {
      1: ['sur', 'ya'],
      2: ['sur', 'ya', 'ko'],
      3: ['sur', 'ya', 'ko', 'ti']
    },
    
    elements: {
      singer: {
        type: 'flower',
        count: 4,
        ids: ['flower-sur', 'flower-ya', 'flower-ko', 'flower-ti'],
        positions: [
          { left: '20%', top: '55%' },
          { left: '40%', top: '50%' },
          { left: '60%', top: '55%' },
          { left: '80%', top: '50%' }
        ],
        assetGetterInitial: 'getClosedFlowerImage',
        assetGetterReward: 'getOpenFlowerImage'
      },
      clicker: {
        type: 'sun-orb',
        count: 4,
        ids: ['orb-sur', 'orb-ya', 'orb-ko', 'orb-ti'],
        positions: [
          { left: '10%', top: '35%' },
          { left: '30%', top: '40%' },
          { left: '50%', top: '45%' },
          { left: '70%', top: '40%' }
        ],
        assetGetter: 'getSunOrbImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'sur': 'suryakoti-sur',
        'ya': 'suryakoti-ya',
        'ko': 'suryakoti-ko',
        'ti': 'suryakoti-ti'
      },
      completeWordFile: '/audio/words/Suryakoti.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 20,
      duration: 1500,
      color: '#FF9800'
    },
    
    celebration: {
      emoji: '🌻',
      message: 'Solar power unlocked! The flower blooms.'
    }
  },

  // Game 4: Samaprabha (Restored)
  samaprabha: {
    id: 'samaprabha',
    displayName: 'Samaprabha',
    theme: {
      primaryColor: '#9400D3', // Dark Violet/Radiant Light Color
      accentColor: '#BA68C8',  // Light Purple
      backgroundColor: 'linear-gradient(135deg, #9400D3 0%, #BA68C8 100%)'
    },
    
    syllables: {
      1: ['sa', 'ma'],
      2: ['sa', 'ma', 'pra'],
      3: ['sa', 'ma', 'pra', 'bha']
    },
    
    elements: {
      singer: {
        type: 'animal',
        count: 4,
        ids: ['animal-sa', 'animal-ma', 'animal-pra', 'animal-bha'],
        positions: [
          { left: '15%', top: '68%' },
          { left: '35%', top: '72%' },
          { left: '55%', top: '68%' },
          { left: '75%', top: '72%' }
        ],
        assetGetterInitial: 'getSadAnimalImage',
        assetGetterReward: 'getHappyAnimalImage'
      },
      clicker: {
        type: 'rainbow',
        count: 4,
        ids: ['rainbow-sa', 'rainbow-ma', 'rainbow-pra', 'rainbow-bha'],
        positions: [
          { left: '18%', top: '25%' },
          { left: '38%', top: '30%' },
          { left: '58%', top: '25%' },
          { left: '78%', top: '30%' }
        ],
        assetGetter: 'getRainbowImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'sa': 'samaprabha-sa',
        'ma': 'samaprabha-ma',
        'pra': 'samaprabha-pra',
        'bha': 'samaprabha-bha'
      },
      completeWordFile: '/audio/words/Samaprabha.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 18,
      duration: 1500,
      color: '#BA68C8'
    },
    
    celebration: {
      emoji: '🌈',
      message: 'Radiant light achieved! The animal is happy.'
    }
  },

  // Game 5: Nirvighnam
  nirvighnam: {
    id: 'nirvighnam',
    displayName: 'Nirvighnam',
    theme: {
      primaryColor: '#DAA520', // Sacred Wisdom Gold
      accentColor: '#8B4513',  // Earthy Brown
      backgroundColor: 'linear-gradient(135deg, #DAA520 0%, #8B4513 100%)'
    },
    
syllables: {
  1: ['nir', 'vigh'],
  2: ['nir', 'vigh', 'nam']
},
    
    elements: {
      singer: {
        type: 'stone',
        count: 3,
        ids: ['stone-nir', 'stone-vigh', 'stone-nam'],
        positions: [
          { left: '20%', top: '55%' },
          { left: '50%', top: '60%' },
          { left: '80%', top: '55%' }
        ],
        assetGettersInitial: {
          'nir': 'getStone1NirImage',
          'vigh': 'getStone2VighImage',
          'nam': 'getStone3NamImage'
        },
        assetGettersReward: {
          'nir': 'getStone1NirColImage',
          'vigh': 'getStone2VighColImage',
          'nam': 'getStone3NamColImage'
        }
      },
      clicker: {
        type: 'animal',
        count: 3,
        ids: ['animal-nir', 'animal-vigh', 'animal-nam'],
        positions: [
          { left: '15%', top: '75%' },
          { left: '45%', top: '70%' },
          { left: '75%', top: '75%' }
        ],
        assetGetters: {
          'nir': 'getFrogNirImage',
          'vigh': 'getSnailVighImage',
          'nam': 'getTurtleNamImage'
        }
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'nir': 'nirvighnam-nir',
        'vigh': 'nirvighnam-vigh',
        'nam': 'nirvighnam-nam'
      },
      completeWordFile: '/audio/words/Nirvighnam.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 15,
      duration: 1500,
      color: '#DAA520'
    },
    
    celebration: {
      emoji: '🪨',
      message: 'Sacred stone path is cleared!'
    }
  },

  // Game 6: Kurumedeva
  kurumedeva: {
    id: 'kurumedeva',
    displayName: 'Kurumedeva',
    theme: {
      primaryColor: '#9370DB', // Divine Grace Purple
      accentColor: '#BA68C8',  // Light Purple
      backgroundColor: 'linear-gradient(135deg, #9370DB 0%, #BA68C8 100%)'
    },
    
    syllables: {
      1: ['ku', 'ru'],
      2: ['ku', 'ru', 'me'],
      3: ['ku', 'ru', 'me', 'va'] 
    },
    
    elements: {
      singer: {
        type: 'decoration',
        count: 4, 
        ids: ['decor-ku', 'decor-ru', 'decor-me', 'decor-va'],
        positions: [
          { left: '20%', top: '50%' },
          { left: '40%', top: '55%' },
          { left: '60%', top: '55%' },
          { left: '80%', top: '50%' }
        ],
        assetGetterInitial: 'getKurumedevaPlainDecorImage', 
        assetGetterReward: 'getKurumedevaColoredDecorImage'
      },
      clicker: {
        type: 'item',
        count: 4, 
        ids: ['item-ku', 'item-ru', 'item-me', 'item-va'],
        positions: [
          { left: '15%', top: '70%' },
          { left: '35%', top: '65%' },
          { left: '55%', top: '65%' },
          { left: '75%', top: '70%' }
        ],
        assetGetter: 'getKurumedevaItemImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'ku': 'kurumedeva-ku',
        'ru': 'kurumedeva-ru',
        'me': 'kurumedeva-me',
        'va': 'kurumedeva-va' 
      },
      completeWordFile: '/audio/words/Kurumedeva.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 18, 
      color: '#9370DB'
    },
    
    celebration: {
      emoji: '🔮',
      message: 'Divine decoration complete!'
    }
  },
  
  // Game 7: Sarvakaryeshu (Restored and Corrected to 4 Syllables)
  sarvakaryeshu: {
    id: 'sarvakaryeshu',
    displayName: 'Sarvakaryeshu',
    theme: {
      primaryColor: '#008080', // Teal/Pond Color
      accentColor: '#40E0D0',  // Turquoise
      backgroundColor: 'linear-gradient(135deg, #008080 0%, #40E0D0 100%)'
    },
    
    syllables: {
      1: ['sar', 'va'],
      2: ['sar', 'va', 'kar'],
      3: ['sar', 'va', 'kar', 'yeshu'] // 4 syllables
    },
    
    elements: {
      singer: {
        type: 'animal',
        count: 4, 
        ids: ['animal-sar', 'animal-va', 'animal-kar', 'animal-yeshu'],
        positions: [
          { left: '20%', top: '60%' },
          { left: '40%', top: '65%' },
          { left: '60%', top: '65%' },
          { left: '80%', top: '60%' }
        ],
        assetGetterInitial: 'getSarvakaryeshuSadAnimalImage', 
        assetGetterReward: 'getSarvakaryeshuHappyAnimalImage'
      },
      clicker: {
        type: 'helper-animal',
        count: 4, 
        ids: ['helper-sar', 'helper-va', 'helper-kar', 'helper-yeshu'],
        positions: [
          { left: '15%', top: '40%' },
          { left: '35%', top: '35%' },
          { left: '55%', top: '35%' },
          { left: '75%', top: '40%' }
        ],
        assetGetter: 'getSarvakaryeshuHelperImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'sar': 'sarvakaryeshu-sar',
        'va': 'sarvakaryeshu-va',
        'kar': 'sarvakaryeshu-kar',
        'yeshu': 'sarvakaryeshu-yeshu'
      },
      completeWordFile: '/audio/words/Sarvakaryeshu.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 20,
      duration: 1500,
      color: '#40E0D0'
    },
    
    celebration: {
      emoji: '🦚',
      message: 'Divine action unlocked! The path is blessed.'
    }
  },

  // Game 8: Sarvada (Restored)
  sarvada: {
    id: 'sarvada',
    displayName: 'Sarvada',
    theme: {
      primaryColor: '#7B68EE', // MediumSlateBlue/Final Power Color
      accentColor: '#9370DB',  // MediumPurple
      backgroundColor: 'linear-gradient(135deg, #7B68EE 0%, #9370DB 100%)'
    },
    
    syllables: {
      1: ['sar', 'va'],
      2: ['sar', 'va', 'da'] // 3 Syllables
    },
    
    elements: {
      singer: {
        type: 'animal',
        count: 3,
        ids: ['animal-sar', 'animal-va', 'animal-da'],
        positions: [
          { left: '25%', top: '40%' },
          { left: '50%', top: '50%' },
          { left: '75%', top: '40%' }
        ],
        assetGetterInitial: 'getSarvadaSadAnimalImage',
        assetGetterReward: 'getSarvadaHappyAnimalImage'
      },
      clicker: {
        type: 'helper-animal',
        count: 3,
        ids: ['helper-sar', 'helper-va', 'helper-da'],
        positions: [
          { left: '20%', top: '25%' },
          { left: '45%', top: '20%' },
          { left: '70%', top: '25%' }
        ],
        assetGetter: 'getSarvadaHelperImage'
      }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'sar': 'sarvada-sar',
        'va': 'sarvada-va',
        'da': 'sarvada-da'
      },
      completeWordFile: '/audio/words/Sarvada.mp3'
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 15,
      duration: 1500,
      color: '#9370DB'
    },
    
    celebration: {
      emoji: '✨',
      message: 'The final star shines brightly!'
    }
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