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
      1: ['va', 'kra'],           // Round 1: VAKRA (2 syllables)
      2: ['tun', 'da'],            // Round 2: TUNDA (2 syllables) - NEW!
      3: ['va', 'kra', 'tun', 'da'] // Round 3: VAKRATUNDA (4 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round)
      centralSynthesis: {
        enabled: true,
        positions: [
          { left: '50%', top: '45%' },  // Round 1: Lotus 1 (VAKRA)
          { left: '50%', top: '65%' },  // Round 2: Lotus 2 (TUNDA)
          { left: '50%', top: '55%' }   // Round 3: Lotus 3 (VAKRATUNDA - center)
        ],
        assetGetterInitial: 'getBudImage',
        assetGetterReward: 'getLotusImage'
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
      1: ['ma', 'ha'],           // Round 1: MAHA (2 syllables)
      2: ['ka', 'ya'],            // Round 2: KAYA (2 syllables) - NEW!
      3: ['ma', 'ha', 'ka', 'ya'] // Round 3: MAHAKAYA (4 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round)
      centralSynthesis: {
        enabled: true,
        positions: [
          { left: '50%', top: '55%' },  // Round 1
          { left: '50%', top: '70%' },  // Round 2
          { left: '50%', top: '62%' }   // Round 3 (center)
        ],
        assetGetterInitial: 'getSeedImage',
        assetGetterReward: 'getFlowerImage'
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
      1: ['sur', 'ya'],           // Round 1: SURYA (2 syllables)
      2: ['ko', 'ti'],             // Round 2: KOTI (2 syllables) - NEW!
      3: ['sur', 'ya', 'ko', 'ti']  // Round 3: SURYAKOTI (4 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round)
      centralSynthesis: {
        enabled: true,
        positions: [
          { left: '50%', top: '50%' },  // Round 1
          { left: '50%', top: '62%' },  // Round 2
          { left: '50%', top: '56%' }   // Round 3 (center)
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
      1: ['sa', 'ma'],            // Round 1: SAMA (2 syllables)
      2: ['pra', 'bha'],           // Round 2: PRABHA (2 syllables) - NEW!
      3: ['sa', 'ma', 'pra', 'bha'] // Round 3: SAMAPRABHA (4 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round)
      centralSynthesis: {
        enabled: true,
        positions: [
          { left: '50%', top: '45%' },  // Round 1
          { left: '50%', top: '65%' },  // Round 2
          { left: '50%', top: '55%' }   // Round 3 (center)
        ],
       assetGetterInitial: 'getSadAnimalImage',    // ← CHANGED
  assetGetterReward: 'getHappyAnimalImage'    // ← CHANGED
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
      1: ['nir', 'vigh'],         // Round 1: NIRVIGH (2 syllables)
      2: ['nam'],                  // Round 2: NAM (1 syllable) - NEW!
      3: ['nir', 'vigh', 'nam']    // Round 3: NIRVIGHNAM (3 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round) - will need special handling
centralSynthesis: {
  enabled: true,
  positions: [
    { left: '40%', top: '60%' },  // Round 1: Stone 1 (left)
    { left: '60%', top: '60%' },  // Round 2: Stone 2 (right)
    { left: '50%', top: '55%' }   // Round 3: Stone 3 (center top)
  ],
  showPreviousRounds: true,
 assetGetterInitial: 'getStoneInitialImage',
assetGetterReward: 'getStoneRewardImage'
},
      // NO singer element for nirvighnam - clicker doubles as singer
clicker: {
  type: 'animal',
  count: 3,
  ids: ['frog-nir', 'snail-vigh', 'turtle-nam'],
  positions: [
    { left: '25%', top: '70%' },  // frog
    { left: '50%', top: '70%' },  // snail
    { left: '75%', top: '70%' }   // turtle
  ],
  assetGetter: 'getNirvighnamAnimalImage'


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
      1: ['kuru', 'me'],          // Round 1: KURUME (2 syllables)
      2: ['de', 'va'],             // Round 2: DEVA (2 syllables) - NEW!
      3: ['kuru', 'me', 'de', 'va'] // Round 3: KURUMEDEVA (4 syllables)
    },
    

     elements: {
  centralSynthesis: {
    enabled: true,
    positions: [
      { left: '35%', top: '55%' },  // Round 1: Decor1 (garland)
      { left: '50%', top: '48%' },  // Round 2: Decor2 (diya)
      { left: '65%', top: '55%' }   // Round 3: Decor4 (bell)
    ],
    showPreviousRounds: true,
   
    assetGetterInitial: 'getDecorInitialImage',  // Decoration starts faded
assetGetterReward: 'getDecorRewardImage',    // Decoration fully visible
  },
 clicker: {
  type: 'animal',
  count: 4,
  ids: ['animal-kuru', 'animal-me', 'animal-de', 'animal-va'],
  positions: [
    { left: '18%', top: '65%' },
    { left: '38%', top: '35%' },
    { left: '58%', top: '30%' },
    { left: '68%', top: '28%' }
  ],
  assetGetter: 'getKurumedevaAnimalImage'
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
      1: ['sar', 'va'],            // Round 1: SARVA (2 syllables)
      2: ['kar', 'yeshu'],          // Round 2: KARYESHU (2 syllables) - NEW!
      3: ['sar', 'va', 'kar', 'yeshu'] // Round 3: SARVAKARYESHU (4 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round)
      centralSynthesis: {
        enabled: true,
        positions: [
          { left: '50%', top: '58%' },  // Round 1
          { left: '50%', top: '72%' },  // Round 2
          { left: '50%', top: '65%' }   // Round 3 (center)
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
      1: ['sar', 'va'],           // Round 1: SARVA (2 syllables)
      2: ['da'],                   // Round 2: DA (1 syllable) - NEW!
      3: ['sar', 'va', 'da']       // Round 3: SARVADA (3 syllables)
    },
    
    elements: {
      // ⭐ NEW: Central synthesis reward (one per round)
      centralSynthesis: {
        enabled: true,
        positions: [
          { left: '50%', top: '42%' },  // Round 1
          { left: '50%', top: '58%' },  // Round 2
          { left: '50%', top: '50%' }   // Round 3 (center)
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