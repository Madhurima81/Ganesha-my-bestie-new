// zones/shloka-river/configs/gameConfigs.js
// Configuration for all 8 Sanskrit memory games

export const GAME_CONFIGS = {
  
  // Game 1: Vakratunda
  vakratunda: {
    id: 'vakratunda',
    displayName: 'Vakratunda',
    cssClassName: 'vakratunda-game-phase-header',
    theme: {
      primaryColor: '#4CAF50',
      accentColor: '#81C784',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    
    syllables: {
      1: ['va', 'kra'],           // Round 1: VAKRA (2 syllables)
      2: ['tun', 'da'],            // Round 2: TUNDA (2 syllables)
      3: ['vakra', 'tunda']        // Round 3: VAKRATUNDA (2 known chunks, no auto-play)
    },
    
    elements: {
        centralSynthesis: {
            enabled: true,
            positions: [
                { left: '40%', top: '55%', size: 'clamp(200px, 40vw, 510px)' }, // Round 1 (Vakra)
                { left: '40%', top: '55%', size: 'clamp(120px, 18vw, 510px)' }, // Round 2 (Tunda)
                { left: '40%', top: '55%', size: 'clamp(120px, 18vw, 510px)' }  // Round 3 (Center)
            ],
            // ✅ Round-Based Rewards (Bud -> Lotus)
            assetGettersByRound: {
                1: { initial: 'getBudVaImage',    reward: 'getLotusVaImage' },
                2: { initial: 'getBudTunImage',   reward: 'getLotusTunImage' },
                3: { initial: 'getBudKraImage',   reward: 'getLotusKraImage' } // Using Kra/Da or Va for round 3
            }
        },

        clicker: {
            type: 'baby-elephant',
            count: 4,
            // ✅ Short IDs matching the map keys
            ids: ['va', 'kra', 'tun', 'da'],
            // positions per round, per syllable index within that round
            positionsByRound: {
                1: [                                                                              // Round 1: va, kra
                    { left: '16%', top: '56%', size: 'clamp(200px, 38vw, 480px)', flip: false }, // index 0 → va
                    { left: '62%', top: '66%', size: 'clamp(200px, 38vw, 480px)', flip: true  }, // index 1 → kra
                ],
                2: [                                                                              // Round 2: tun, da
                    { left: '16%', top: '56%', size: 'clamp(140px, 26vw, 480px)', flip: true }, // index 0 → tun
                    { left: '62%', top: '66%', size: 'clamp(140px, 26vw, 480px)', flip: false }, // index 1 → da
                ],
                3: [                                                                              // Round 3: vakra, tunda
                    { left: '16%', top: '56%', size: 'clamp(140px, 26vw, 480px)', flip: false }, // index 0 → vakra
                    { left: '62%', top: '66%', size: 'clamp(140px, 26vw, 480px)', flip: false  }, // index 1 → tunda
                ],
            },
            // fallback flat positions (used if positionsByRound not found)
            positions: [
                { left: '34%', top: '66%' },
                { left: '66%', top: '66%' },
                { left: '58%', top: '30%' },
                { left: '68%', top: '28%' }
            ],
            // ✅ Map Keys -> Function Names
            assetGetters: {
                'va':  'getElephantVaImage',
                'kra': 'getElephantKraImage',
                'tun': 'getElephantTunImage',
                'da':  'getElephantDaImage',
                'vakra': 'getElephantVaImage',   // Round 3 chunk - reuse va elephant
                'tunda': 'getElephantTunImage'    // Round 3 chunk - reuse tun elephant
            }
        }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'va': 'vakratunda-va',
        'kra': 'vakratunda-kra',
        'tun': 'vakratunda-tun',
        'da': 'vakratunda-da',
        'vakra': 'vakratunda - vakra',        // Round 3 chunk
        'tunda': 'tunda-vakratunda'           // Round 3 chunk
      },
      completeWordByRound: {
        1: '/audio/syllables/vakratunda - vakra.mp3',   // Round 1: vakra
        2: '/audio/syllables/tunda-vakratunda.mp3',     // Round 2: tunda
        3: '/audio/words/vakratunda.mp3'                // Round 3: vakratunda
      }
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 15,
      duration: 1500,
      color: '#64B5F6'
    },

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the baby elephants!',
    finalInstruction: 'Click the lotus to finish!'
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
    cssClassName: 'mahakaya-game-phase-header',
    theme: {
      primaryColor: '#FF9800',
      accentColor: '#FFB74D',
      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },

    syllables: {
      1: ['ma', 'ha'],           // Round 1: MAHA (2 syllables)
      2: ['ka', 'ya'],            // Round 2: KAYA (2 syllables)
      3: ['maha', 'kaya']         // Round 3: MAHAKAYA (2 known chunks, no auto-play)
    },

   elements: {
        centralSynthesis: {
            enabled: true,
            positions: [
                { left: '45%', top: '45%', size: '450px' }, // Round 1
                { left: '45%', top: '45%', size: '450px' }, // Round 2
                { left: '45%', top: '45%', size: '450px' }  // Round 3
            ],
            // ✅ Round-Based Rewards (Seed -> Flower)
            assetGettersByRound: {
                1: { initial: 'getSeedImage', reward: 'getFlowerMaImage' },
                2: { initial: 'getSeedImage', reward: 'getFlowerKaImage' },
                3: { initial: 'getSeedImage', reward: 'getFlowerHaImage' }
            }
        },

        clicker: {
            type: 'adult-elephant',
            count: 4,
            ids: ['ma', 'ha', 'ka', 'ya'],
            // ✅ Per-round positions with size and flip per element
            positionsByRound: {
                1: [                                                          // Round 1: ma, ha
                    { left: '20%', top: '60%', size: '480px', flip: false }, // index 0 → ma
                    { left: '65%', top: '62%', size: '480px', flip: true  }, // index 1 → ha
                ],
                2: [                                                          // Round 2: ka, ya
                    { left: '20%', top: '60%', size: '480px', flip: true }, // index 0 → ka
                    { left: '65%', top: '62%', size: '480px', flip: true  }, // index 1 → ya
                ],
                3: [                                                          // Round 3: maha, kaya
                    { left: '20%', top: '60%', size: '480px', flip: false }, // index 0 → maha
                    { left: '65%', top: '62%', size: '480px', flip: false }, // index 1 → kaya
                ],
            },
            // fallback flat positions
            positions: [
                { left: '12%', top: '70%' },
                { left: '32%', top: '75%' },
                { left: '52%', top: '72%' },
                { left: '72%', top: '78%' }
            ],
            assetGetters: {
                'ma': 'getElephantMaImage',
                'ha': 'getElephantHaImage',
                'ka': 'getElephantKaImage',
                'ya': 'getElephantYaImage',
                'maha': 'getElephantMaImage',    // Round 3 chunk - reuse ma elephant
                'kaya': 'getElephantKaImage'     // Round 3 chunk - reuse ka elephant
            }
        }
    },
    
    audio: {
      syllableFolder: '/audio/syllables/',
      syllableFileMap: {
        'ma': 'mahakaya-ma',
        'ha': 'mahakaya-ha',
        'ka': 'mahakaya-ka',
        'ya': 'mahakaya-ya',
        'maha': 'maha-mahakaya',             // Round 3 chunk
        'kaya': 'kaya-mahakaya'              // Round 3 chunk
      },
      completeWordByRound: {
        1: '/audio/syllables/maha-mahakaya.mp3',    // Round 1: maha
        2: '/audio/syllables/kaya-mahakaya.mp3',    // Round 2: kaya
        3: '/audio/words/mahakaya.mp3'              // Round 3: mahakaya
      }
    },
    
    waterSpray: {
      enabled: true,
      dropCount: 20,
      duration: 1500,
      color: '#FF9800'
    },

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the elephants!',
    finalInstruction: 'Click the lily to finish!'
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
    cssClassName: 'suryakoti-game-phase-header',
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
        centralSynthesis: {
            enabled: true,
            positions: [
                { left: '50%', top: '50%', size: '260px' }, // Round 1
                { left: '50%', top: '62%', size: '260px' }, // Round 2
                { left: '50%', top: '56%', size: '260px' }  // Round 3
            ],
            // ✅ Round-Based Rewards (Closed -> Open)
            assetGettersByRound: {
                1: { initial: 'getSunflowerClose', reward: 'getSunflowerOpen' },
                2: { initial: 'getDaisyClose',     reward: 'getDaisyOpen' },
                3: { initial: 'getRoseClose',      reward: 'getRoseOpen' }
                // (Tulip available if you ever add a 4th round)
            }
        },

        clicker: {
            type: 'sun-orb',
            count: 4,
            ids: ['sur', 'ya', 'ko', 'ti'],
            // ✅ Per-round positions with size and flip per element
            positionsByRound: {
                1: [                                                          // Round 1: sur, ya
                    { left: '25%', top: '35%', size: '280px', flip: false }, // index 0 → sur
                    { left: '70%', top: '38%', size: '280px', flip: false }, // index 1 → ya
                ],
                2: [                                                          // Round 2: ko, ti
                    { left: '25%', top: '35%', size: '280px', flip: false }, // index 0 → ko
                    { left: '70%', top: '38%', size: '280px', flip: false }, // index 1 → ti
                ],
                3: [                                                          // Round 3: sur, ya, ko, ti
                    { left: '12%', top: '35%', size: '240px', flip: false }, // index 0 → sur
                    { left: '38%', top: '38%', size: '240px', flip: false }, // index 1 → ya
                    { left: '62%', top: '35%', size: '240px', flip: false }, // index 2 → ko
                    { left: '85%', top: '38%', size: '240px', flip: false }, // index 3 → ti
                ],
            },
            // fallback flat positions
            positions: [
                { left: '10%', top: '35%' },
                { left: '30%', top: '40%' },
                { left: '50%', top: '45%' },
                { left: '70%', top: '40%' }
            ],
            // Map keys (Using same sun orb for all since only one was imported)
            assetGetters: {
                'sur': 'getSunOrbImage',
                'ya':  'getSunOrbImage',
                'ko':  'getSunOrbImage',
                'ti':  'getSunOrbImage'
            }
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

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the suns!',
    finalInstruction: 'Click the flower to finish!'
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
    cssClassName: 'samaprabha-game-phase-header',
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
       { left: '50%', top: '45%', size: '260px' }, // Round 1 Position
       { left: '50%', top: '65%', size: '260px' }, // Round 2 Position
       { left: '50%', top: '55%', size: '260px' }  // Round 3 Position
    ],

    assetGettersByRound: {
        1: { initial: 'getSadAnimal1Image', reward: 'getHappyAnimal1Image' },
        2: { initial: 'getSadAnimal2Image', reward: 'getHappyAnimal2Image' },
        3: { initial: 'getSadAnimal3Image', reward: 'getHappyAnimal3Image' },
        4: { initial: 'getSadAnimal4Image', reward: 'getHappyAnimal4Image' }
    }
},

clicker: {
    type: 'rainbow',
    count: 4,
    ids: ['sa', 'ma', 'pra', 'bha'],
    // ✅ Per-round positions with size and flip per element
    positionsByRound: {
        1: [                                                          // Round 1: sa, ma
            { left: '22%', top: '25%', size: '280px', flip: false }, // index 0 → sa
            { left: '68%', top: '28%', size: '280px', flip: true  }, // index 1 → ma
        ],
        2: [                                                          // Round 2: pra, bha
            { left: '22%', top: '25%', size: '280px', flip: false }, // index 0 → pra
            { left: '68%', top: '28%', size: '280px', flip: true  }, // index 1 → bha
        ],
        3: [                                                          // Round 3: sa, ma, pra, bha
            { left: '12%', top: '25%', size: '240px', flip: false }, // index 0 → sa
            { left: '37%', top: '28%', size: '240px', flip: false }, // index 1 → ma
            { left: '62%', top: '25%', size: '240px', flip: false }, // index 2 → pra
            { left: '85%', top: '28%', size: '240px', flip: true  }, // index 3 → bha
        ],
    },
    // fallback flat positions
    positions: [
        { left: '18%', top: '25%' },
        { left: '38%', top: '30%' },
        { left: '58%', top: '25%' },
        { left: '78%', top: '30%' }
    ],

    assetGetters: {
        'sa': 'getRainbowSaImage',
        'ma': 'getRainbowMaImage',
        'pra': 'getRainbowPraImage',
        'bha': 'getRainbowBhaImage'
    }
},
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

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the rainbows!',
    finalInstruction: 'Click the animal to finish!'
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
    cssClassName: 'nirvighnam-game-phase-header',
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
        centralSynthesis: {
            enabled: true,
            positions: [
                { left: '50%', top: '45%', size: '260px' }, // Round 1
                { left: '50%', top: '65%', size: '260px' }, // Round 2
                { left: '50%', top: '55%', size: '260px' }  // Round 3
            ],
              showPreviousRounds: true,

            // ✅ Round-Based Rewards (Stone B&W -> Stone Color)
            assetGettersByRound: {
                1: { initial: 'getStone1NirImage',    reward: 'getStone1NirColImage' },
                2: { initial: 'getStone2VighImage',   reward: 'getStone2VighColImage' },
                3: { initial: 'getStone3NamImage',    reward: 'getStone3NamColImage' }
            }
        },

        clicker: {
            type: 'animal',
            count: 3,
            ids: ['nir', 'vigh', 'nam'],
            // ✅ Per-round positions with size and flip per element
            positionsByRound: {
                1: [                                                          // Round 1: nir, vigh
                    { left: '25%', top: '68%', size: '280px', flip: false }, // index 0 → nir
                    { left: '68%', top: '68%', size: '280px', flip: true  }, // index 1 → vigh
                ],
                2: [                                                          // Round 2: nam
                    { left: '45%', top: '68%', size: '280px', flip: false }, // index 0 → nam
                ],
                3: [                                                          // Round 3: nir, vigh, nam
                    { left: '18%', top: '68%', size: '260px', flip: false }, // index 0 → nir
                    { left: '50%', top: '68%', size: '260px', flip: false }, // index 1 → vigh
                    { left: '78%', top: '68%', size: '260px', flip: true  }, // index 2 → nam
                ],
            },
            // fallback flat positions
            positions: [
                { left: '25%', top: '70%' },
                { left: '50%', top: '70%' },
                { left: '75%', top: '70%' }
            ],
            assetGetters: {
                'nir':  'getFrogNirImage',
                'vigh': 'getSnailVighImage',
                'nam':  'getTurtleNamImage'
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

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the animals!',
    finalInstruction: 'Click the stone to finish!'
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
    cssClassName: 'kurumedeva-game-phase-header',
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
                { left: '50%', top: '45%', size: '260px' }, // Round 1
                { left: '50%', top: '65%', size: '260px' }, // Round 2
                { left: '50%', top: '55%', size: '260px' }, // Round 3
                { left: '50%', top: '50%', size: '260px' }  // Round 4 (if used)
            ],
              showPreviousRounds: true,

            // ✅ Single Image Strategy: Use the same getter for both
            assetGettersByRound: {
                1: { initial: 'getDecorKuImage', reward: 'getDecorKuImage' },
                2: { initial: 'getDecorRuImage', reward: 'getDecorRuImage' },
                3: { initial: 'getDecorMeImage', reward: 'getDecorMeImage' },
                4: { initial: 'getDecorDeImage', reward: 'getDecorDeImage' }
            }
        },

        clicker: {
            type: 'animal',
            count: 4,
            ids: ['ku', 'ru', 'me', 'de', 'va'],
            // ✅ Per-round positions with size and flip per element
            positionsByRound: {
                1: [                                                          // Round 1: kuru, me
                    { left: '22%', top: '60%', size: '280px', flip: false }, // index 0 → kuru
                    { left: '68%', top: '60%', size: '280px', flip: true  }, // index 1 → me
                ],
                2: [                                                          // Round 2: de, va
                    { left: '22%', top: '60%', size: '280px', flip: false }, // index 0 → de
                    { left: '68%', top: '60%', size: '280px', flip: true  }, // index 1 → va
                ],
                3: [                                                          // Round 3: kuru, me, de, va
                    { left: '10%', top: '62%', size: '240px', flip: false }, // index 0 → kuru
                    { left: '37%', top: '60%', size: '240px', flip: false }, // index 1 → me
                    { left: '62%', top: '62%', size: '240px', flip: false }, // index 2 → de
                    { left: '85%', top: '60%', size: '240px', flip: true  }, // index 3 → va
                ],
            },
            // fallback flat positions
            positions: [
                { left: '10%', top: '65%' },
                { left: '30%', top: '35%' },
                { left: '50%', top: '30%' },
                { left: '70%', top: '35%' },
                { left: '90%', top: '65%' }
            ],
            // ✅ Map Keys -> Function Names
            assetGetters: {
                'ku':   'getAnimalKuImage',
                'ru':   'getAnimalRuImage',
                'me':   'getAnimalMeImage',
                'de':   'getAnimalDeImage',
                'va':   'getAnimalVaImage',
                'kuru': 'getAnimalKuImage'
            }
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

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the animals!',
    finalInstruction: 'Click the decoration to finish!'
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
    cssClassName: 'sarvakaryeshu-game-phase-header',
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
        centralSynthesis: {
            enabled: true,
            positions: [
                { left: '50%', top: '58%', size: '260px' }, // Round 1
                { left: '50%', top: '72%', size: '260px' }, // Round 2
                { left: '50%', top: '65%', size: '260px' }  // Round 3
            ],
            // ✅ Rewards (Sad -> Happy)
            assetGettersByRound: {
                1: { initial: 'getSquirrelSad', reward: 'getSquirrelHappy' },
                2: { initial: 'getBirdSad',     reward: 'getBirdHappy' },
                3: { initial: 'getDuckSad',     reward: 'getDuckHappy' }
            }
        },

        clicker: {
            type: 'helper-animal',
            count: 4,
            ids: ['sar', 'va', 'kar', 'yeshu'],
            // ✅ Per-round positions with size and flip per element
            positionsByRound: {
                1: [                                                          // Round 1: sar, va
                    { left: '22%', top: '38%', size: '280px', flip: false }, // index 0 → sar
                    { left: '68%', top: '40%', size: '280px', flip: true  }, // index 1 → va
                ],
                2: [                                                          // Round 2: kar, yeshu
                    { left: '22%', top: '38%', size: '280px', flip: false }, // index 0 → kar
                    { left: '68%', top: '40%', size: '280px', flip: true  }, // index 1 → yeshu
                ],
                3: [                                                          // Round 3: sar, va, kar, yeshu
                    { left: '10%', top: '38%', size: '240px', flip: false }, // index 0 → sar
                    { left: '36%', top: '40%', size: '240px', flip: false }, // index 1 → va
                    { left: '62%', top: '38%', size: '240px', flip: false }, // index 2 → kar
                    { left: '85%', top: '40%', size: '240px', flip: true  }, // index 3 → yeshu
                ],
            },
            // fallback flat positions
            positions: [
                { left: '15%', top: '40%' },
                { left: '35%', top: '35%' },
                { left: '55%', top: '35%' },
                { left: '75%', top: '40%' }
            ],
            assetGetters: {
                'sar':   'getSquirrelHelper',
                'va':    'getBirdHelper',
                'kar':   'getDuckHelper',
                'yeshu': 'getRabbitHelper'
            }
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

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the helpers!',
    finalInstruction: 'Click the animal to finish!'
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
    cssClassName: 'sarvada-game-phase-header',
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
        centralSynthesis: {
            enabled: true,
            positions: [
                { left: '50%', top: '42%', size: '260px' }, // Round 1
                { left: '50%', top: '58%', size: '260px' }, // Round 2
                { left: '50%', top: '50%', size: '260px' }  // Round 3
            ],
            // ✅ Rewards (Sad -> Happy)
            assetGettersByRound: {
                1: { initial: 'getButterflySad', reward: 'getButterflyHappy' },
                2: { initial: 'getFawnSad',      reward: 'getFawnHappy' },
                3: { initial: 'getHedgehogSad',  reward: 'getHedgehogHappy' }
            }
        },

        clicker: {
            type: 'helper-animal',
            count: 3,
            ids: ['sar', 'va', 'da'],
            // ✅ Per-round positions with size and flip per element
            positionsByRound: {
                1: [                                                          // Round 1: sar, va
                    { left: '22%', top: '22%', size: '280px', flip: false }, // index 0 → sar
                    { left: '68%', top: '25%', size: '280px', flip: true  }, // index 1 → va
                ],
                2: [                                                          // Round 2: da
                    { left: '45%', top: '22%', size: '280px', flip: false }, // index 0 → da
                ],
                3: [                                                          // Round 3: sar, va, da
                    { left: '18%', top: '22%', size: '260px', flip: false }, // index 0 → sar
                    { left: '48%', top: '22%', size: '260px', flip: false }, // index 1 → va
                    { left: '75%', top: '22%', size: '260px', flip: true  }, // index 2 → da
                ],
            },
            // fallback flat positions
            positions: [
                { left: '20%', top: '25%' },
                { left: '45%', top: '20%' },
                { left: '70%', top: '25%' }
            ],
            assetGetters: {
                'sar': 'getButterflyHelper',
                'va':  'getFawnHelper',
                'da':  'getHedgehogHelper'
            }
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

    uiText: {  // ← ADD THIS BEFORE celebration
    clickInstruction: 'Click the helpers!',
    finalInstruction: 'Click the animal to finish!'
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
