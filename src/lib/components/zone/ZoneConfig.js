// ZoneConfig.js - Updated with scene icon image paths
// Path: lib/components/zone/ZoneConfig.js

export const ZONE_CONFIGS = {
  'symbol-mountain': {
    id: 'symbol-mountain',
    name: 'Symbol Mountain',
    icon: '🏔️',
    background: '/images/symbol-mountain-bg.png',
    description: 'Learn about Ganesha\'s sacred symbols in this mystical mountain.',
    unlocked: true,
    totalStars: 12,
    requiredStars: 0,
    sequence: 3,
    scenes: [
      {
        id: 'modak',
        name: 'Share the Modaks',
        emoji: '🍯',
        iconImage: '/images/zones/symbol-mountain/modak-icon.png',
        description: 'Help Mooshika collect sweet modaks',
        unlocked: true,
        order: 1,
        position: { top: 25, left: 25 }
      },
      {
        id: 'pond',
        name: 'Wake the Lotus',
        emoji: '🪷',
        iconImage: '/images/zones/symbol-mountain/pond-icon.png',
        description: 'Find lotus flowers and meet the elephant',
        unlocked: false,
        order: 2,
        position: { top: 25, left: 75 }
      },
      {
        id: 'symbol',
        name: 'Play the Notes',
        emoji: '😀',
        iconImage: '/images/zones/symbol-mountain/tusk-icon.png',
        description: 'Master the musical tusk assembly',
        unlocked: false,
        order: 3,
        position: { top: 25, left: 50 }
      },
      {
        id: 'final-scene',
        name: 'Shine Together',
        emoji: '🕉️',
        iconImage: '/images/zones/symbol-mountain/assembly-icon.png',
        description: 'Assemble all sacred symbols to awaken Ganesha',
        unlocked: false,
        order: 4,
        position: { top: 75, left: 30 }
      }
    ]
  },

  'cave-of-secrets': {
    id: 'cave-of-secrets',
    name: 'Cave of Secrets',
    icon: '🕳️',
    background: '/images/cave-of-secrets-background.png',
    description: 'Discover the complete Vakratunda Mahakaya mantra through mystical cave adventures.',
    unlocked: false,
    totalStars: 40,
    requiredStars: 12,
    sequence: 4,
    scenes: [
      {
        id: 'vakratunda-mahakaya',
        name: 'Build the Strength',
        emoji: '😀',
        iconImage: '/images/zones/cave-of-secrets/vakratunda-icon.png',
        description: 'Learn about Ganesha\'s curved trunk and mighty form',
        unlocked: false,
        order: 1,
        position: { top: 25, left: 20 }
      },
      {
        id: 'suryakoti-samaprabha', 
        name: 'Spread the Light',
        emoji: '☀️',
        iconImage: '/images/zones/cave-of-secrets/suryakoti-icon.png',
        description: 'Awaken a million suns and discover divine brilliance',
        unlocked: false,
        order: 2,
        position: { top: 35, left: 45 }
      },
      {
        id: 'nirvighnam-kurumedeva',
        name: 'Cross the Bridge',
        emoji: '🛤️',
        iconImage: '/images/zones/cave-of-secrets/nirvighnam-icon.png',
        description: 'Clear obstacles with divine power and build bridges',
        unlocked: false,
        order: 3,
        position: { top: 60, left: 25 }
      },
      {
        id: 'sarvakaryeshu-sarvada',
        name: 'Choose with Ganesha',
        emoji: '🌟',
        iconImage: '/images/zones/cave-of-secrets/sarvakaryeshu-icon.png',
        description: 'Experience divine presence in all daily activities',
        unlocked: false,
        order: 4,
        position: { top: 70, left: 55 }
      },
      {
        id: 'final-meaning-scene',
        name: 'You Did It',
        emoji: '🎴',
        iconImage: '/images/zones/cave-of-secrets/finale-icon.png',
        description: 'Match symbols with meanings in the final challenge',
        unlocked: false,
        order: 5,
        position: { top: 80, left: 35 }
      }
    ]
  },

  'shloka-river': {
    id: 'shloka-river',
    name: 'Shloka River',
    icon: '🌊',
    emoji: '🌊', 
    background: 'images/shloka-river-bg.png',
    description: 'Learn sacred Sanskrit shlokas by the flowing river of wisdom',
    theme: 'water-wisdom',
    difficulty: 'intermediate',
    learningFocus: 'Sanskrit shloka recitation',
    scenes: [
      {
        id: 'vakratunda-grove',
        name: 'Bloom and Grow',
        emoji: '🌳',
        iconImage: '/images/zones/shloka-river/vakratunda-grove-icon.png',
        order: 1,
        description: 'Learn the opening verse in the sacred grove'
      },
      {
        id: 'suryakoti-bank', 
        name: 'Sun and Smiles',
        emoji: '☀️',
        iconImage: '/images/zones/shloka-river/suryakoti-bank-icon.png',
        order: 2,
        description: 'Discover the radiance verse by the river bank'
      },
      {
        id: 'nirvighnam-chant',
        name: 'Clear the Path',
        emoji: '🎵',
        iconImage: '/images/zones/shloka-river/nirvighnam-chant-icon.png',
        order: 3,
        description: 'Master the obstacle-removing chant'
      },
      {
        id: 'sarvakaryeshu-chant',
        name: 'Care and Share',
        emoji: '🕉️',
        iconImage: '/images/zones/shloka-river/sarvakaryeshu-chant-icon.png',
        order: 4,
        description: 'Learn the all-accomplishing verse'
      },
      {
        id: 'shloka-river-finale',
        name: 'Chant and Celebrate',
        emoji: '🎊',
        iconImage: '/images/zones/shloka-river/finale-icon.png',
        order: 5, 
        description: 'Complete the full shloka by the sacred waters'
      }
    ]
  },

  'festival-square': {
    id: 'festival-square',
    name: 'Festival Square',
    icon: '🎉',
    background: '/images/festivalsquare-bg.png',
    description: 'Celebrate with music, art, cooking, and decoration games!',
    unlocked: true,
    totalStars: 24,
    requiredStars: 40,
    sequence: 6,
    scenes: [
      {
        id: 'game1',
        name: 'Festival Beats',
        emoji: '🎹',
        iconImage: '/images/zones/festival-square/piano-icon.png',
        description: 'Play beautiful melodies on the festival piano',
        unlocked: true,
        order: 1,
        position: { top: 35, left: 25 }
      },
      {
        id: 'game2',
        name: 'Sparkly Rangoli',
        emoji: '🎨',
        iconImage: '/images/zones/festival-square/rangoli-icon.png',
        description: 'Create colorful rangoli patterns',
        unlocked: true,
        order: 2,
        position: { top: 50, left: 60 }
      },
      {
        id: 'game3',
        name: 'Modak Party',
        emoji: '🍯',
        iconImage: '/images/zones/festival-square/modak-cooking-icon.png',
        description: 'Cook delicious modaks for the festival',
        unlocked: true,
        order: 3,
        position: { top: 70, left: 40 }
      },
      {
        id: 'game4',
        name: 'Mandap Magic',
        emoji: '🛕',
        iconImage: '/images/zones/festival-square/mandap-icon.png',
        description: 'Decorate the beautiful festival mandap',
        unlocked: true,
        order: 4,
        position: { top: 25, left: 55 }
      }
    ]
  },

  'about-me-hut': {
    id: 'about-me-hut',
    name: 'About Me Hut',
    icon: '🏡',
    emoji: '🏡',
    background: '/images/about-me-hut-bg.png',
    description: 'Get to know baby Ganesha through fun interactive games!',
    theme: 'personal-discovery',
    difficulty: 'beginner',
    learningFocus: 'Self-introduction and family relationships',
    unlocked: true,
    totalStars: 12,
    requiredStars: 0,
    sequence: 5,
    scenes: [
      {
    id: 'family-tree',
    name: "Our families",
        emoji: '👨‍👩‍👦',
        iconImage: '/images/zones/about-me-hut/family-tree-icon.png',
        description: 'Help Ganesha complete his family tree',
        unlocked: true,
        order: 1,
        totalStars: 4,
        position: { top: 30, left: 25 }
      },
      {
        id: 'my-indian-story',
        name: 'My Indian Story',
        emoji: '🌏',
        iconImage: '/images/zones/about-me-hut/my-indian-story-icon.png',
        description: 'Discover where you and Ganesha come from in India',
        unlocked: false,
        order: 4,
        totalStars: 3,
        position: { top: 40, left: 70 }
      },
      {
        id: 'favorite-food',
        name: 'Our Favorite Things',
        emoji: '🍕',
        iconImage: '/images/zones/about-me-hut/favorite-things-icon.png',
        description: 'Find Ganesha\'s favorite food and best friend',
        unlocked: false,
        order: 2,
        totalStars: 2,
        position: { top: 50, left: 60 }
      },
      {
        id: 'dreams-wishes',
        name: 'Dream Big Together',
        emoji: '🪔',
        iconImage: '/images/zones/about-me-hut/obstacle-remover-icon.png',
        description: 'Clear obstacles with joy, peace, and love',
        unlocked: false,
        order: 3,
        totalStars: 3,
        position: { top: 70, left: 35 }
      }
    ]
  }
};

// Helper functions for zone management
export const getZoneConfig = (zoneId) => {
  return ZONE_CONFIGS[zoneId] || null;
};

export const getAllZones = () => {
  return Object.values(ZONE_CONFIGS);
};

export const getZoneScenes = (zoneId) => {
  const zone = getZoneConfig(zoneId);
  return zone ? zone.scenes : [];
};

export const getSceneById = (zoneId, sceneId) => {
  const scenes = getZoneScenes(zoneId);
  return scenes.find(scene => scene.id === sceneId) || null;
};

export const getUnlockedScenes = (zoneId, progressData = {}) => {
  const scenes = getZoneScenes(zoneId);
  return scenes.filter(scene => {
    if (scene.order === 1) return true;
    
    const previousScene = scenes.find(s => s.order === scene.order - 1);
    if (!previousScene) return false;
    
    const previousProgress = progressData[previousScene.id];
    return previousProgress && previousProgress.completed;
  });
};

export const calculateZoneProgress = (zoneId, progressData = {}) => {
  const scenes = getZoneScenes(zoneId);
  const totalScenes = scenes.length;
  const completedScenes = scenes.filter(scene => {
    const progress = progressData[scene.id];
    return progress && progress.completed;
  }).length;
  
  const totalStars = scenes.reduce((sum, scene) => {
    const progress = progressData[scene.id];
    return sum + (progress ? progress.stars || 0 : 0);
  }, 0);
  
  return {
    completed: completedScenes,
    total: totalScenes,
    percentage: Math.round((completedScenes / totalScenes) * 100),
    stars: totalStars
  };
};
