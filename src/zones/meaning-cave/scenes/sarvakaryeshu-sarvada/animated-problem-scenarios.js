// 🎭 Animated Problem Scenarios - Living Stories Implementation
// Transforms boring static missions into emotional, engaging experiences

// ===== MISSION STORY CONFIGURATIONS =====
// 🎭 Animated Problem Scenarios - Living Stories Implementation
// Transforms boring static missions into emotional, engaging experiences

// ===== MISSION STORY CONFIGURATIONS =====

const MISSION_STORIES = {
  grandparents: {
    id: 'grandparents',
    name: 'Grandparents & Technology',
    
    // PROBLEM SEQUENCE (10 seconds)
    problemSequence: [
      {
        duration: 2000,
        action: 'confused-pointing',
        dialogue: "I don't understand this screen...",
        animation: 'confusion-point',
        emotion: 'confused'
      },
      {
        duration: 2000,
        action: 'frustrated-sighing',
        dialogue: "The letters are so tiny!",
        animation: 'squinting-lean',
        emotion: 'frustrated'
      },
      {
        duration: 2000,
        action: 'looking-helpless',
        dialogue: "Maybe we're too old for this...",
        animation: 'shoulders-slump',
        emotion: 'sad'
      },
      {
        duration: 2000,
        action: 'mutual-concern',
        dialogue: "We just want to video call our grandchildren...",
        animation: 'gentle-comfort',
        emotion: 'longing'
      },
      {
        duration: 2000,
        action: 'hopeful-looking',
        dialogue: "If only someone could help us understand...",
        animation: 'hopeful-glance',
        emotion: 'hopeful'
      }
    ],
    
    // HELPER ARRIVAL & SOLVING (varies by helper)
    solvingSequences: {
      clearolens: [
        {
          duration: 1500,
          action: 'lens-arrival',
          effect: 'sparkly-landing',
          description: 'Clearo Lens lands on tablet screen'
        },
        {
          duration: 2000,
          action: 'screen-clarifying',
          effect: 'brightness-increase',
          description: 'Screen becomes crystal clear'
        },
        {
          duration: 1500,
          action: 'text-enlarging',
          effect: 'text-zoom',
          description: 'Text becomes readable size'
        },
        {
          duration: 2000,
          action: 'grandparents-notice',
          dialogue: "Oh! Now I can see everything clearly!",
          animation: 'delighted-surprise'
        },
        {
          duration: 3000,
          action: 'successful-interaction',
          dialogue: "Look! I can read all the buttons now!",
          animation: 'confident-tapping'
        }
      ],
      
      memoleaf: [
        {
          duration: 1500,
          action: 'leaf-arrival',
          effect: 'gentle-flutter',
          description: 'Memo Leaf floats down to tablet'
        },
        {
          duration: 2000,
          action: 'memory-notes-appear',
          effect: 'helpful-labels',
          description: 'Helpful reminder labels appear on screen'
        },
        {
          duration: 2000,
          action: 'step-by-step-guide',
          effect: 'gentle-highlighting',
          description: 'Each step highlighted in sequence'
        },
        {
          duration: 2000,
          action: 'grandparents-remember',
          dialogue: "Oh yes! I remember now - this button first!",
          animation: 'aha-moment'
        },
        {
          duration: 3000,
          action: 'following-steps',
          dialogue: "These little reminders are so helpful!",
          animation: 'careful-following'
        }
      ],
      
      snuggyshawl: [
        {
          duration: 1500,
          action: 'shawl-wrapping',
          effect: 'warm-glow',
          description: 'Snuggy Shawl creates cozy atmosphere'
        },
        {
          duration: 2000,
          action: 'relaxation-spreading',
          effect: 'stress-melting',
          description: 'Tension and stress melt away'
        },
        {
          duration: 2000,
          action: 'confidence-building',
          effect: 'posture-improvement',
          description: 'Grandparents sit up straighter, more confident'
        },
        {
          duration: 2000,
          action: 'calm-approach',
          dialogue: "Let's take this slowly, together...",
          animation: 'peaceful-breathing'
        },
        {
          duration: 3000,
          action: 'patient-learning',
          dialogue: "We have all the time in the world!",
          animation: 'unhurried-exploration'
        }
      ],
      
      timmytime: [
        {
          duration: 1500,
          action: 'hourglass-arrival',
          effect: 'time-sparkles',
          description: 'Timmy Time brings patience'
        },
        {
          duration: 2000,
          action: 'slow-down-effect',
          effect: 'calming-aura',
          description: 'Everything slows to a comfortable pace'
        },
        {
          duration: 2000,
          action: 'patience-spreading',
          effect: 'serene-glow',
          description: 'Patience and calm fill the air'
        },
        {
          duration: 2000,
          action: 'relaxed-learning',
          dialogue: "No rush, we can take our time to learn!",
          animation: 'peaceful-exploration'
        },
        {
          duration: 3000,
          action: 'unhurried-success',
          dialogue: "Going slowly helps us understand better!",
          animation: 'confident-mastery'
        }
      ]
    },
    
    // GRATITUDE & TRANSFORMATION (5 seconds)
    gratitudeSequence: [
      {
        duration: 2000,
        action: 'joyful-realization',
        dialogue: "We did it! We're video calling our granddaughter!",
        animation: 'celebration-hug',
        emotion: 'joy'
      },
      {
        duration: 3000,
        action: 'heartfelt-thanks',
        dialogue: "Thank you, mysterious helper! Technology isn't so scary anymore!",
        animation: 'grateful-looking-up',
        emotion: 'grateful'
      }
    ]
  },

  dog: {
    id: 'dog',
    name: 'Scared Dog',
    
    problemSequence: [
      {
        duration: 2000,
        action: 'cowering-corner',
        soundEffect: 'whimpering',
        animation: 'trembling-huddle',
        emotion: 'terrified'
      },
      {
        duration: 2000,
        action: 'startled-by-sounds',
        soundEffect: 'scared-yelp',
        animation: 'flinching-shake',
        emotion: 'jumpy'
      },
      {
        duration: 2000,
        action: 'looking-around-nervously',
        soundEffect: 'anxious-panting',
        animation: 'darting-eyes',
        emotion: 'anxious'
      },
      {
        duration: 2000,
        action: 'tail-tucked-low',
        soundEffect: 'sad-whine',
        animation: 'dejected-posture',
        emotion: 'dejected'
      },
      {
        duration: 2000,
        action: 'seeking-comfort',
        soundEffect: 'hopeful-whimper',
        animation: 'tentative-reach',
        emotion: 'hopeful'
      }
    ],
    
    solvingSequences: {
      snuggyblanket: [
        {
          duration: 1500,
          action: 'blanket-floating',
          effect: 'soft-landing',
          description: 'Snuggy Blanket gently covers dog'
        },
        {
          duration: 2000,
          action: 'warmth-spreading',
          effect: 'cozy-glow',
          description: 'Warm, safe feeling spreads through dog'
        },
        {
          duration: 1500,
          action: 'tension-releasing',
          effect: 'muscle-relaxation',
          description: 'Dog body relaxes under blanket'
        },
        {
          duration: 2000,
          action: 'feeling-safe',
          soundEffect: 'contented-sigh',
          animation: 'peaceful-settling'
        },
        {
          duration: 3000,
          action: 'gaining-confidence',
          soundEffect: 'curious-sniff',
          animation: 'brave-peeking'
        }
      ],
      
      brighttorch: [
        {
          duration: 1500,
          action: 'torch-illuminating',
          effect: 'darkness-banishing',
          description: 'Bright Torch lights up dark corners'
        },
        {
          duration: 2000,
          action: 'shadows-disappearing',
          effect: 'fear-melting',
          description: 'Scary shadows fade away'
        },
        {
          duration: 1500,
          action: 'safe-space-revealing',
          effect: 'comfort-highlighting',
          description: 'Safe, comfortable spaces become visible'
        },
        {
          duration: 2000,
          action: 'curiosity-returning',
          soundEffect: 'interested-sniff',
          animation: 'head-lifting'
        },
        {
          duration: 3000,
          action: 'exploring-safely',
          soundEffect: 'happy-panting',
          animation: 'confident-steps'
        }
      ],
      
      aquabuddy: [
        {
          duration: 1500,
          action: 'water-offering',
          effect: 'refreshing-stream',
          description: 'Aqua Buddy offers cool, refreshing water'
        },
        {
          duration: 2000,
          action: 'thirst-quenching',
          effect: 'revitalizing-flow',
          description: 'Cool water soothes and refreshes'
        },
        {
          duration: 1500,
          action: 'energy-returning',
          effect: 'vitality-boost',
          description: 'Energy and courage return'
        },
        {
          duration: 2000,
          action: 'feeling-refreshed',
          soundEffect: 'happy-drinking',
          animation: 'energetic-lapping'
        },
        {
          duration: 3000,
          action: 'playful-mood',
          soundEffect: 'excited-barking',
          animation: 'bouncy-play'
        }
      ],
      
      happytail: [
        {
          duration: 1500,
          action: 'tail-wagging',
          effect: 'joy-spreading',
          description: 'Happy Tail spreads infectious joy'
        },
        {
          duration: 2000,
          action: 'happiness-contagion',
          effect: 'mood-lifting',
          description: 'Happiness spreads throughout the area'
        },
        {
          duration: 1500,
          action: 'fear-melting',
          effect: 'anxiety-dissolving',
          description: 'Fear dissolves into playfulness'
        },
        {
          duration: 2000,
          action: 'joining-in',
          soundEffect: 'playful-barking',
          animation: 'tail-wagging-together'
        },
        {
          duration: 3000,
          action: 'joyful-playing',
          soundEffect: 'happy-playing',
          animation: 'carefree-running'
        }
      ]
    },
    
    gratitudeSequence: [
      {
        duration: 2000,
        action: 'playful-bouncing',
        soundEffect: 'joyful-barking',
        animation: 'happy-jumping',
        emotion: 'joy'
      },
      {
        duration: 3000,
        action: 'grateful-nuzzling',
        soundEffect: 'thankful-whining',
        animation: 'affectionate-rubbing',
        emotion: 'grateful'
      }
    ]
  },

  construction: {
    id: 'construction',
    name: 'Tired Construction Worker',
    
    problemSequence: [
      {
        duration: 2000,
        action: 'exhausted-slumping',
        dialogue: "I'm so tired... can barely lift my tools...",
        animation: 'weary-slump',
        emotion: 'exhausted'
      },
      {
        duration: 2000,
        action: 'wiping-sweat',
        dialogue: "This work is draining all my energy...",
        animation: 'fatigue-gesture',
        emotion: 'drained'
      },
      {
        duration: 2000,
        action: 'looking-at-unfinished-work',
        dialogue: "Still so much to do, but I feel empty...",
        animation: 'overwhelmed-stare',
        emotion: 'overwhelmed'
      },
      {
        duration: 2000,
        action: 'struggling-motivation',
        dialogue: "Where will I find the strength to continue?",
        animation: 'deflated-shoulders',
        emotion: 'discouraged'
      },
      {
        duration: 2000,
        action: 'hoping-for-energy',
        dialogue: "I just need something to boost my spirit...",
        animation: 'hopeful-pause',
        emotion: 'hopeful'
      }
    ],
    
    solvingSequences: {
      sunnyspark: [
        {
          duration: 1500,
          action: 'sunshine-arrival',
          effect: 'radiant-beaming',
          description: 'Sunny Spark radiates energizing sunshine'
        },
        {
          duration: 2000,
          action: 'energy-infusion',
          effect: 'vitality-flowing',
          description: 'Warm energy flows into worker'
        },
        {
          duration: 1500,
          action: 'strength-returning',
          effect: 'muscle-energizing',
          description: 'Physical strength and vigor return'
        },
        {
          duration: 2000,
          action: 'feeling-revitalized',
          dialogue: "Wow! I feel like I can conquer the world!",
          animation: 'energetic-stretch'
        },
        {
          duration: 3000,
          action: 'enthusiastic-working',
          dialogue: "This sunshine energy is amazing!",
          animation: 'vigorous-building'
        }
      ],
      
      melodymug: [
        {
          duration: 1500,
          action: 'music-brewing',
          effect: 'melodic-steam',
          description: 'Melody Mug brews musical energy'
        },
        {
          duration: 2000,
          action: 'rhythm-spreading',
          effect: 'musical-notes',
          description: 'Uplifting music fills the air'
        },
        {
          duration: 1500,
          action: 'spirit-lifting',
          effect: 'mood-brightening',
          description: 'Worker mood lifts with the melody'
        },
        {
          duration: 2000,
          action: 'singing-while-working',
          dialogue: "This tune makes work feel like dancing!",
          animation: 'rhythmic-building'
        },
        {
          duration: 3000,
          action: 'joyful-productivity',
          dialogue: "Music makes everything better!",
          animation: 'happy-construction'
        }
      ], // ✅ FIXED: Added missing comma
      
      rhythmoradio: [
        {
          duration: 1500,
          action: 'radio-tuning',
          effect: 'frequency-finding',
          description: 'Rhythmo Radio tunes to the perfect frequency'
        },
        {
          duration: 2000,
          action: 'beat-spreading',
          effect: 'rhythmic-pulse',
          description: 'Energizing beats fill the construction site'
        },
        {
          duration: 1500,
          action: 'movement-syncing',
          effect: 'body-grooving',
          description: 'Worker moves in sync with the rhythm'
        },
        {
          duration: 2000,
          action: 'energized-working',
          dialogue: "This beat gives me so much energy!",
          animation: 'rhythmic-hammering'
        },
        {
          duration: 3000,
          action: 'groove-building',
          dialogue: "I could work like this all day!",
          animation: 'dancing-construction'
        }
      ],
      
      hammerhero: [
        {
          duration: 1500,
          action: 'heroic-arrival',
          effect: 'strength-aura',
          description: 'Hammer Hero brings heroic strength'
        },
        {
          duration: 2000,
          action: 'power-transfer',
          effect: 'might-flowing',
          description: 'Heroic strength flows into worker'
        },
        {
          duration: 1500,
          action: 'confidence-building',
          effect: 'hero-transformation',
          description: 'Worker feels like a construction hero'
        },
        {
          duration: 2000,
          action: 'powerful-working',
          dialogue: "I feel so strong and capable!",
          animation: 'heroic-building'
        },
        {
          duration: 3000,
          action: 'unstoppable-progress',
          dialogue: "Nothing can stop me now!",
          animation: 'superhero-construction'
        }
      ]
    },
    
    gratitudeSequence: [
      {
        duration: 2000,
        action: 'proud-standing',
        dialogue: "Look at all this progress! I feel unstoppable!",
        animation: 'triumphant-pose',
        emotion: 'proud'
      },
      {
        duration: 3000,
        action: 'grateful-appreciation',
        dialogue: "Thank you for giving me the energy to keep building!",
        animation: 'heartfelt-thanks',
        emotion: 'grateful'
      }
    ]
  },

  mom: {
    id: 'mom',
    name: 'Tired Mom in Kitchen',
    
    problemSequence: [
      {
        duration: 2000,
        action: 'frazzled-cooking',
        dialogue: "Dinner, homework, laundry... it's too much...",
        animation: 'overwhelmed-multitask',
        emotion: 'overwhelmed'
      },
      {
        duration: 2000,
        action: 'stressed-sighing',
        dialogue: "I feel like I'm failing at everything...",
        animation: 'exhausted-lean',
        emotion: 'stressed'
      },
      {
        duration: 2000,
        action: 'looking-at-mess',
        dialogue: "This kitchen chaos reflects how I feel inside...",
        animation: 'defeated-survey',
        emotion: 'defeated'
      },
      {
        duration: 2000,
        action: 'wanting-to-cry',
        dialogue: "I used to love cooking, now it just feels impossible...",
        animation: 'emotional-struggle',
        emotion: 'sad'
      },
      {
        duration: 2000,
        action: 'hoping-for-help',
        dialogue: "I wish I could find joy in this again...",
        animation: 'wistful-pause',
        emotion: 'hopeful'
      }
    ],
    
    solvingSequences: {
      chefchintu: [
        {
          duration: 1500,
          action: 'pot-organizing',
          effect: 'magical-tidying',
          description: 'Chef Chintu organizes the cooking chaos'
        },
        {
          duration: 2000,
          action: 'cooking-rhythm',
          effect: 'harmonious-flow',
          description: 'Cooking becomes rhythmic and flowing'
        },
        {
          duration: 1500,
          action: 'stress-melting',
          effect: 'tension-release',
          description: 'Kitchen stress transforms into creative energy'
        },
        {
          duration: 2000,
          action: 'rediscovering-joy',
          dialogue: "Oh! Cooking can be fun again!",
          animation: 'delighted-stirring'
        },
        {
          duration: 3000,
          action: 'creative-cooking',
          dialogue: "I remember why I love making meals for my family!",
          animation: 'joyful-preparation'
        }
      ],
      
      bubblybottle: [
        {
          duration: 1500,
          action: 'energy-pouring',
          effect: 'refreshing-stream',
          description: 'Bubbly Bottle pours refreshing energy'
        },
        {
          duration: 2000,
          action: 'vitality-restoration',
          effect: 'strength-returning',
          description: 'Physical and emotional energy restored'
        },
        {
          duration: 1500,
          action: 'clarity-returning',
          effect: 'mind-clearing',
          description: 'Mental fog lifts, clarity returns'
        },
        {
          duration: 2000,
          action: 'feeling-refreshed',
          dialogue: "I feel like myself again! Energized and capable!",
          animation: 'renewed-vigor'
        },
        {
          duration: 3000,
          action: 'efficient-multitasking',
          dialogue: "Now I can handle everything with a smile!",
          animation: 'graceful-coordination'
        }
      ],
      
      gigglesspoon: [
        {
          duration: 1500,
          action: 'spoon-giggling',
          effect: 'laughter-bubbles',
          description: 'Giggles Spoon fills kitchen with laughter'
        },
        {
          duration: 2000,
          action: 'joy-spreading',
          effect: 'happiness-contagion',
          description: 'Infectious joy spreads through cooking'
        },
        {
          duration: 1500,
          action: 'fun-discovering',
          effect: 'playful-cooking',
          description: 'Cooking becomes playful and fun'
        },
        {
          duration: 2000,
          action: 'laughing-cooking',
          dialogue: "Cooking with giggles makes everything better!",
          animation: 'joyful-stirring'
        },
        {
          duration: 3000,
          action: 'happy-kitchen',
          dialogue: "My kitchen is full of laughter again!",
          animation: 'cheerful-preparation'
        }
      ],
      
      peacemittens: [
        {
          duration: 1500,
          action: 'mittens-embracing',
          effect: 'calming-touch',
          description: 'Peace Mittens bring gentle calm'
        },
        {
          duration: 2000,
          action: 'stress-releasing',
          effect: 'tension-melting',
          description: 'Stress and tension melt away'
        },
        {
          duration: 1500,
          action: 'peace-spreading',
          effect: 'serenity-flowing',
          description: 'Peaceful energy flows through mom'
        },
        {
          duration: 2000,
          action: 'calm-cooking',
          dialogue: "I feel so peaceful and centered now!",
          animation: 'serene-preparation'
        },
        {
          duration: 3000,
          action: 'mindful-cooking',
          dialogue: "Cooking with peace makes every moment special!",
          animation: 'mindful-stirring'
        }
      ]
    },
    
    gratitudeSequence: [
      {
        duration: 2000,
        action: 'peaceful-satisfaction',
        dialogue: "My kitchen feels like a sanctuary again!",
        animation: 'contented-survey',
        emotion: 'peaceful'
      },
      {
        duration: 3000,
        action: 'grateful-relief',
        dialogue: "Thank you for helping me remember the joy in caring for my family!",
        animation: 'heartfelt-appreciation',
        emotion: 'grateful'
      }
    ]
  },

  siblings: {
    id: 'siblings',
    name: 'Fighting Siblings',
    
    problemSequence: [
      {
        duration: 2000,
        action: 'angry-arguing',
        dialogue: "That's MY toy! No, it's MINE!",
        animation: 'heated-dispute',
        emotion: 'angry'
      },
      {
        duration: 2000,
        action: 'escalating-conflict',
        dialogue: "You never share! You always take everything!",
        animation: 'aggressive-gesturing',
        emotion: 'frustrated'
      },
      {
        duration: 2000,
        action: 'hurt-feelings',
        dialogue: "I hate you! You're mean!",
        animation: 'emotional-outburst',
        emotion: 'hurt'
      },
      {
        duration: 2000,
        action: 'stubborn-standoff',
        dialogue: "I'm not talking to you! Fine!",
        animation: 'arms-crossed-turning-away',
        emotion: 'stubborn'
      },
      {
        duration: 2000,
        action: 'secret-sadness',
        dialogue: "I wish we could just play together...",
        animation: 'hidden-longing',
        emotion: 'lonely'
      }
    ],
    
    solvingSequences: {
      gigglebox: [
        {
          duration: 1500,
          action: 'box-opening',
          effect: 'fun-explosion',
          description: 'Giggle Box releases contagious fun'
        },
        {
          duration: 2000,
          action: 'laughter-spreading',
          effect: 'giggle-bubbles',
          description: 'Irresistible giggles fill the air'
        },
        {
          duration: 1500,
          action: 'anger-melting',
          effect: 'tension-dissolving',
          description: 'Anger dissolves into uncontrollable laughter'
        },
        {
          duration: 2000,
          action: 'laughing-together',
          dialogue: "Why were we fighting? This is so silly!",
          animation: 'shared-laughter'
        },
        {
          duration: 3000,
          action: 'playful-interaction',
          dialogue: "Want to build something together?",
          animation: 'cooperative-play'
        }
      ],
      
      sharebear: [
        {
          duration: 1500,
          action: 'bear-hugging',
          effect: 'love-radiating',
          description: 'Share Bear spreads unconditional love'
        },
        {
          duration: 2000,
          action: 'hearts-opening',
          effect: 'empathy-flowing',
          description: 'Hearts open to understanding each other'
        },
        {
          duration: 1500,
          action: 'compassion-growing',
          effect: 'kindness-blooming',
          description: 'Compassion and kindness bloom'
        },
        {
          duration: 2000,
          action: 'understanding-dawning',
          dialogue: "I'm sorry... I know you want to play too.",
          animation: 'apologetic-reaching'
        },
        {
          duration: 3000,
          action: 'loving-sharing',
          dialogue: "Let's share everything and play together!",
          animation: 'generous-offering'
        }
      ],
      
      peaceballoon: [
        {
          duration: 1500,
          action: 'balloon-floating',
          effect: 'peaceful-rising',
          description: 'Peace Balloon floats up, carrying anger away'
        },
        {
          duration: 2000,
          action: 'anger-lifting',
          effect: 'negativity-floating',
          description: 'All angry feelings float up and away'
        },
        {
          duration: 1500,
          action: 'peace-descending',
          effect: 'calm-settling',
          description: 'Peaceful feelings settle in their place'
        },
        {
          duration: 2000,
          action: 'feeling-lighter',
          dialogue: "I feel so much lighter without all that anger!",
          animation: 'peaceful-breathing'
        },
        {
          duration: 3000,
          action: 'peaceful-playing',
          dialogue: "Let's play together peacefully!",
          animation: 'harmonious-interaction'
        }
      ],
      
      huggypillow: [
        {
          duration: 1500,
          action: 'pillow-embracing',
          effect: 'comfort-spreading',
          description: 'Huggy Pillow brings ultimate comfort'
        },
        {
          duration: 2000,
          action: 'anger-softening',
          effect: 'emotion-cushioning',
          description: 'Hard feelings become soft and manageable'
        },
        {
          duration: 1500,
          action: 'comfort-sharing',
          effect: 'mutual-soothing',
          description: 'Comfort spreads between siblings'
        },
        {
          duration: 2000,
          action: 'gentle-reconciliation',
          dialogue: "Come here, let's hug it out!",
          animation: 'tender-embrace'
        },
        {
          duration: 3000,
          action: 'cozy-togetherness',
          dialogue: "Hugging makes everything better!",
          animation: 'snuggling-siblings'
        }
      ]
    },
    
    gratitudeSequence: [
      {
        duration: 2000,
        action: 'happy-playing',
        dialogue: "Playing together is so much more fun!",
        animation: 'joyful-cooperation',
        emotion: 'joy'
      },
      {
        duration: 3000,
        action: 'sibling-appreciation',
        dialogue: "Thank you for helping us remember we love each other!",
        animation: 'grateful-hug',
        emotion: 'grateful'
      }
    ]
  },

  park: {
    id: 'park',
    name: 'Littered Park',
    
    problemSequence: [
      {
        duration: 2000,
        action: 'surveying-mess',
        description: 'Trash scattered everywhere, flowers wilting',
        animation: 'environmental-sadness',
        emotion: 'dismayed'
      },
      {
        duration: 2000,
        action: 'nature-struggling',
        description: 'Trees looking sick, grass yellowing',
        animation: 'ecological-decline',
        emotion: 'concerned'
      },
      {
        duration: 2000,
        action: 'animals-avoiding',
        description: 'Birds and squirrels staying away',
        animation: 'wildlife-absence',
        emotion: 'lonely'
      },
      {
        duration: 2000,
        action: 'children-disappointed',
        description: 'Kids walk by sadly, unable to play',
        animation: 'lost-joy',
        emotion: 'sad'
      },
      {
        duration: 2000,
        action: 'hope-for-restoration',
        description: 'One small flower trying to bloom through the litter',
        animation: 'resilient-hope',
        emotion: 'hopeful'
      }
    ],
    
    solvingSequences: {
      cleaniebucket: [
        {
          duration: 1500,
          action: 'bucket-sprinkling',
          effect: 'cleaning-sparkles',
          description: 'Cleanie Bucket sprinkles magical cleaning power'
        },
        {
          duration: 2000,
          action: 'trash-disappearing',
          effect: 'litter-vanishing',
          description: 'Litter transforms into sparkles and disappears'
        },
        {
          duration: 1500,
          action: 'surfaces-gleaming',
          effect: 'pristine-restoration',
          description: 'Park surfaces become pristine and gleaming'
        },
        {
          duration: 2000,
          action: 'cleanliness-spreading',
          description: 'Clean, fresh environment emerges',
          animation: 'purification-wave'
        },
        {
          duration: 3000,
          action: 'pristine-beauty',
          description: 'Park becomes a sparkling clean sanctuary',
          animation: 'environmental-renewal'
        }
      ],
      
      bloomyflower: [
        {
          duration: 1500,
          action: 'flower-blooming',
          effect: 'life-bursting',
          description: 'Bloomy Flower spreads vibrant life energy'
        },
        {
          duration: 2000,
          action: 'nature-awakening',
          effect: 'ecological-revival',
          description: 'Plants and trees burst into healthy growth'
        },
        {
          duration: 1500,
          action: 'beauty-multiplying',
          effect: 'floral-explosion',
          description: 'Flowers bloom everywhere in beautiful colors'
        },
        {
          duration: 2000,
          action: 'ecosystem-thriving',
          description: 'Birds return, butterflies dance among flowers',
          animation: 'wildlife-celebration'
        },
        {
          duration: 3000,
          action: 'natural-paradise',
          description: 'Park becomes a thriving natural paradise',
          animation: 'ecological-harmony'
        }
      ],
      
      leafyfriend: [
        {
          duration: 1500,
          action: 'leaf-dancing',
          effect: 'nature-celebrating',
          description: 'Leafy Friend dances with joy for nature'
        },
        {
          duration: 2000,
          action: 'green-spreading',
          effect: 'vegetation-growing',
          description: 'Healthy green spreads throughout the park'
        },
        {
          duration: 1500,
          action: 'ecosystem-healing',
          effect: 'nature-restoring',
          description: 'Natural ecosystem heals and thrives'
        },
        {
          duration: 2000,
          action: 'nature-celebrating',
          description: 'All plants and trees celebrate together',
          animation: 'forest-dancing'
        },
        {
          duration: 3000,
          action: 'green-paradise',
          description: 'Park becomes a lush green paradise',
          animation: 'nature-harmony'
        }
      ],
      
      sparklestar: [
        {
          duration: 1500,
          action: 'star-twinkling',
          effect: 'magic-sprinkling',
          description: 'Sparkle Star sprinkles magical restoration'
        },
        {
          duration: 2000,
          action: 'transformation-magic',
          effect: 'complete-renewal',
          description: 'Magic transforms every corner of the park'
        },
        {
          duration: 1500,
          action: 'beauty-radiating',
          effect: 'wonder-spreading',
          description: 'Amazing beauty radiates from every surface'
        },
        {
          duration: 2000,
          action: 'magical-result',
          description: 'Park becomes more beautiful than ever before',
          animation: 'enchanted-transformation'
        },
        {
          duration: 3000,
          action: 'starlit-paradise',
          description: 'Park sparkles like a starlit wonderland',
          animation: 'celestial-beauty'
        }
      ]
    },
    
    gratitudeSequence: [
      {
        duration: 2000,
        action: 'nature-celebrating',
        description: 'Birds singing, flowers dancing in the breeze',
        animation: 'environmental-joy',
        emotion: 'harmonious'
      },
      {
        duration: 3000,
        action: 'ecosystem-gratitude',
        description: 'All of nature seems to whisper thank you',
        animation: 'natural-appreciation',
        emotion: 'grateful'
      }
    ]
  }
};

// Rest of the file remains the same...

// ===== ANIMATION IMPLEMENTATION =====

class AnimatedStoryPlayer {
  constructor(containerId, missionId) {
    this.container = document.getElementById(containerId);
    this.mission = MISSION_STORIES[missionId];
    this.currentSequence = null;
    this.isPlaying = false;
  }

  async playProblemSequence() {
    console.log(`🎭 Playing problem sequence for ${this.mission.name}`);
    this.isPlaying = true;
    
    for (const step of this.mission.problemSequence) {
      if (!this.isPlaying) break;
      
      await this.playStep(step);
    }
  }

  async playSolvingSequence(helperId) {
    console.log(`✨ Playing solving sequence for ${helperId}`);
    
    const sequence = this.mission.solvingSequences[helperId];
    if (!sequence) {
      console.error(`No solving sequence found for ${helperId}`);
      return;
    }

    for (const step of sequence) {
      if (!this.isPlaying) break;
      
      await this.playStep(step);
    }
  }

  async playGratitudeSequence() {
    console.log(`🙏 Playing gratitude sequence`);
    
    for (const step of this.mission.gratitudeSequence) {
      if (!this.isPlaying) break;
      
      await this.playStep(step);
    }
  }

  async playStep(step) {
    return new Promise((resolve) => {
      // Apply animation class
      if (step.animation) {
        this.container.classList.add(step.animation);
      }

      // Show dialogue if present
      if (step.dialogue) {
        this.showDialogue(step.dialogue, step.emotion);
      }

      // Apply visual effects
      if (step.effect) {
        this.applyEffect(step.effect);
      }

      // Play sound effects
      if (step.soundEffect) {
        this.playSoundEffect(step.soundEffect);
      }

      // Wait for step duration
      setTimeout(() => {
        // Clean up
        if (step.animation) {
          this.container.classList.remove(step.animation);
        }
        resolve();
      }, step.duration);
    });
  }

  showDialogue(text, emotion) {
    // Remove existing dialogue
    const existingDialogue = this.container.querySelector('.story-dialogue');
    if (existingDialogue) {
      existingDialogue.remove();
    }

    // Create new dialogue bubble
    const dialogue = document.createElement('div');
    dialogue.className = `story-dialogue ${emotion || ''}`;
    dialogue.textContent = text;
    
    this.container.appendChild(dialogue);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (dialogue.parentNode) {
        dialogue.parentNode.removeChild(dialogue);
      }
    }, 3000);
  }

  applyEffect(effectName) {
    const effectElement = document.createElement('div');
    effectElement.className = `story-effect ${effectName}`;
    this.container.appendChild(effectElement);

    // Remove effect after animation
    setTimeout(() => {
      if (effectElement.parentNode) {
        effectElement.parentNode.removeChild(effectElement);
      }
    }, 2000);
  }

  playSoundEffect(soundName) {
    // Implementation would depend on your audio system
    console.log(`🔊 Playing sound: ${soundName}`);
  }

  stop() {
    this.isPlaying = false;
  }
}

// ===== CSS ANIMATIONS FOR ALL MISSIONS =====

const storyAnimationsCSS = `
/* ===== CONTAINER STYLES ===== */
.mission-story-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.story-dialogue {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 25px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  max-width: 80%;
  animation: dialogue-appear 0.5s ease;
  z-index: 10;
}

.story-dialogue.confused { border-left: 5px solid #FFA500; }
.story-dialogue.frustrated { border-left: 5px solid #FF6B6B; }
.story-dialogue.sad { border-left: 5px solid #4169E1; }
.story-dialogue.hopeful { border-left: 5px solid #32CD32; }
.story-dialogue.joy { border-left: 5px solid #FFD700; }
.story-dialogue.grateful { border-left: 5px solid #FF69B4; }

@keyframes dialogue-appear {
  0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ===== GRANDPARENTS ANIMATIONS ===== */
.confusion-point {
  animation: confusion-pointing 2s ease-in-out;
}

@keyframes confusion-pointing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02) translateX(5px); }
}

.squinting-lean {
  animation: squinting-forward 2s ease-in-out;
}

@keyframes squinting-forward {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01) translateY(3px); }
}

.shoulders-slump {
  animation: defeated-slump 2s ease-in-out;
}

@keyframes defeated-slump {
  0% { transform: scale(1); }
  100% { transform: scale(0.98) translateY(5px); filter: brightness(0.9); }
}

.gentle-comfort {
  animation: mutual-support 2s ease-in-out;
}

@keyframes mutual-support {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01); filter: brightness(1.05); }
}

.hopeful-glance {
  animation: looking-up-hopefully 2s ease-in-out;
}

@keyframes looking-up-hopefully {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02) translateY(-2px); filter: brightness(1.1); }
}

/* ===== DOG ANIMATIONS ===== */
.trembling-huddle {
  animation: scared-trembling 2s ease-in-out infinite;
}

@keyframes scared-trembling {
  0%, 100% { transform: scale(1) translateX(0); }
  25% { transform: scale(0.98) translateX(-1px); }
  75% { transform: scale(0.98) translateX(1px); }
}

.flinching-shake {
  animation: startled-flinch 2s ease-in-out;
}

@keyframes startled-flinch {
  0%, 100% { transform: scale(1); }
  20% { transform: scale(0.95) translateY(2px); }
  40% { transform: scale(1.02) translateY(-1px); }
}

.darting-eyes {
  animation: nervous-looking 2s ease-in-out infinite;
}

@keyframes nervous-looking {
  0%, 100% { transform: scale(1); }
  33% { transform: scale(1.01) translateX(2px); }
  66% { transform: scale(1.01) translateX(-2px); }
}

/* ===== CONSTRUCTION WORKER ANIMATIONS ===== */
.weary-slump {
  animation: exhausted-drooping 2s ease-in-out;
}

@keyframes exhausted-drooping {
  0% { transform: scale(1); }
  100% { transform: scale(0.96) translateY(8px); filter: brightness(0.8); }
}

.fatigue-gesture {
  animation: tired-wiping 2s ease-in-out;
}

@keyframes tired-wiping {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.01) translateX(3px); }
}

.overwhelmed-stare {
  animation: daunting-survey 2s ease-in-out;
}

@keyframes daunting-survey {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02) translateY(2px); filter: brightness(0.9); }
}

/* ===== SOLVING SEQUENCE ANIMATIONS ===== */
.sparkly-landing {
  animation: magical-arrival 1.5s ease-out;
}

@keyframes magical-arrival {
  0% { opacity: 0; transform: scale(0.5) translateY(-50px); }
  50% { opacity: 1; transform: scale(1.2) translateY(-10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.brightness-increase {
  animation: screen-clarifying 2s ease-out;
}

@keyframes screen-clarifying {
  0% { filter: brightness(0.7) blur(2px); }
  100% { filter: brightness(1.2) blur(0px); }
}

.text-zoom {
  animation: text-enlarging 1.5s ease-out;
}

@keyframes text-enlarging {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.1); opacity: 1; }
}

.delighted-surprise {
  animation: joyful-realization 2s ease-out;
}

@keyframes joyful-realization {
  0% { transform: scale(1); }
  50% { transform: scale(1.05) translateY(-5px); filter: brightness(1.2); }
  100% { transform: scale(1.02); filter: brightness(1.1); }
}

/* ===== HELPER EFFECT ANIMATIONS ===== */
.story-effect {
  position: absolute;
  pointer-events: none;
  z-index: 5;
}

.story-effect.sparkly-landing {
  top: 30%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,215,0,0.8), transparent);
  border-radius: 50%;
  animation: sparkle-burst 1.5s ease-out;
}

@keyframes sparkle-burst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
}

.story-effect.warm-glow {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,182,193,0.3), transparent);
  animation: warmth-spreading 2s ease-out;
}

@keyframes warmth-spreading {
  0% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

.story-effect.energy-stream {
  top: 20%;
  left: 40%;
  width: 200px;
  height: 400px;
  background: linear-gradient(180deg, rgba(0,255,127,0.6), transparent);
  animation: energy-flowing 2s ease-out;
}

@keyframes energy-flowing {
  0% { opacity: 0; transform: translateY(-100px); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0.3; transform: translateY(50px); }
}

/* ===== GRATITUDE ANIMATIONS ===== */
.celebration-hug {
  animation: joyful-celebration 2s ease-out;
}

@keyframes joyful-celebration {
  0% { transform: scale(1); }
  25% { transform: scale(1.05) translateY(-3px); }
  50% { transform: scale(1.08) rotate(1deg); filter: brightness(1.2); }
  75% { transform: scale(1.08) rotate(-1deg); filter: brightness(1.2); }
  100% { transform: scale(1.03); filter: brightness(1.1); }
}

.grateful-looking-up {
  animation: thankful-gazing 3s ease-out;
}

@keyframes thankful-gazing {
  0% { transform: scale(1); }
  50% { transform: scale(1.02) translateY(-2px); filter: brightness(1.15); }
  100% { transform: scale(1.01); filter: brightness(1.1); }
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .story-dialogue {
    font-size: 14px;
    padding: 12px 20px;
    max-width: 90%;
  }
  
  .story-effect {
    transform: scale(0.8);
  }
}
`;

// ===== INTEGRATION WITH MAIN GAME =====

class MissionStoryManager {
  constructor() {
    this.currentStoryPlayer = null;
    this.injectAnimationStyles();
  }

  injectAnimationStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = storyAnimationsCSS;
    document.head.appendChild(styleSheet);
  }

  async startMissionStory(missionId, containerId) {
    console.log(`🎬 Starting mission story: ${missionId}`);
    
    this.currentStoryPlayer = new AnimatedStoryPlayer(containerId, missionId);
    
    // Play problem sequence first
    await this.currentStoryPlayer.playProblemSequence();
    
    return this.currentStoryPlayer;
  }

  async playHelperSolution(helperId) {
    if (!this.currentStoryPlayer) {
      console.error('No active story player');
      return;
    }

    await this.currentStoryPlayer.playSolvingSequence(helperId);
    await this.currentStoryPlayer.playGratitudeSequence();
  }

  stopCurrentStory() {
    if (this.currentStoryPlayer) {
      this.currentStoryPlayer.stop();
      this.currentStoryPlayer = null;
    }
  }
}

// ===== USAGE EXAMPLE =====

const storyManager = new MissionStoryManager();

// In your Game 2 mission intro phase
async function startMissionWithStory(missionId) {
  const storyPlayer = await storyManager.startMissionStory(missionId, 'mission-container');
  
  // After problem sequence completes, show helper selection
  showHelperSelection();
}

// When helper is selected and activated
async function onHelperActivated(helperId) {
  await storyManager.playHelperSolution(helperId);
  
  // Mission complete - continue to next mission
  completeMission();
}

export { MissionStoryManager, MISSION_STORIES, AnimatedStoryPlayer };