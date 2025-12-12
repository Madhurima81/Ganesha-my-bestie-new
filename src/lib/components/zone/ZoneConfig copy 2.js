// ZoneConfig.js - Updated to ensure temple unlocks after pond
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
        name: 'Modak Forest',
        emoji: '🍯',
        description: 'Help Mooshika collect sweet modaks',
        unlocked: true,
        order: 1,  // ✅ FIRST SCENE
        position: { top: 25, left: 25 }
      },
      {
        id: 'pond',
        name: 'Sacred Pond',
        emoji: '🪷',
        description: 'Find lotus flowers and meet the elephant',
        unlocked: false,  // Will be unlocked after modak
        order: 2,  // ✅ SECOND SCENE
        position: { top: 25, left: 75 }
      },
      
      {
  id: 'symbol',
  name: 'Sacred Tusk',
  emoji: '🐘',
  description: 'Master the musical tusk assembly',
  unlocked: false,
  order: 3,
  position: { top: 25, left: 50 }
},
    {
  id: 'final-scene',
  name: 'Sacred Assembly',
  emoji: '🕉️', 
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
  totalStars: 40,  // 5 scenes × 8 stars each
  requiredStars: 12, // Unlock after completing Symbol Mountain
  sequence: 4,
  scenes: [
    {
      id: 'vakratunda-mahakaya',
      name: 'Vakratunda Mahakaya',
      emoji: '🐘',
      description: 'Learn about Ganesha\'s curved trunk and mighty form',
      unlocked: false,
      order: 1,
      position: { top: 25, left: 20 }
    },
    {
      id: 'suryakoti-samaprabha', 
      name: 'Surya Koti Samaprabha',
      emoji: '☀️',
      description: 'Awaken a million suns and discover divine brilliance',
      unlocked: false,
      order: 2,
      position: { top: 35, left: 45 }
    },
    {
      id: 'nirvighnam-kurumedeva',
      name: 'Nirvighnam Kurume Deva',
      emoji: '🛤️', 
      description: 'Clear obstacles with divine power and build bridges',
      unlocked: false,
      order: 3,
      position: { top: 60, left: 25 }
    },
    {
      id: 'sarvakaryeshu-sarvada',
      name: 'Sarvakaryeshu Sarvada',
      emoji: '🌟',
      description: 'Experience divine presence in all daily activities',
      unlocked: false,
      order: 4,
      position: { top: 70, left: 55 }
    },
    {
      id: 'final-meaning-scene',
      name: 'Memory Match Finale',
      emoji: '🎴',
      description: 'Match symbols with meanings in the final challenge',
      unlocked: false,
      order: 5,
      position: { top: 80, left: 35 }
    }
  ]
},

  /*'obstacle-forest': {
    id: 'obstacle-forest',
    name: 'Obstacle Forest',
    icon: '🌊',
    background: '/images/obstacle-forest.png',
    description: 'Navigate through challenges with courage and wit.',
    unlocked: false,
    totalStars: 12,
    requiredStars: 25,
    sequence: 5,
    scenes: [
      {
        id: 'fallen-logs',
        name: 'Fallen Logs',
        emoji: '🪵',
        description: 'Cross the river using fallen logs',
        unlocked: false,
        order: 1,
        position: { top: 50, left: 25 }
      },
      {
        id: 'thorny-maze',
        name: 'Thorny Maze',
        emoji: '🌿',
        description: 'Find your way through the thorny maze',
        unlocked: false,
        order: 2,
        position: { top: 35, left: 65 }
      },
      {
        id: 'muddy-path',
        name: 'Muddy Path',
        emoji: '🥾',
        description: 'Navigate the slippery muddy trail',
        unlocked: false,
        order: 3,
        position: { top: 70, left: 45 }
      },
      {
        id: 'rope-bridge',
        name: 'Rope Bridge',
        emoji: '🌉',
        description: 'Cross the dangerous rope bridge',
        unlocked: false,
        order: 4,
        position: { top: 25, left: 40 }
      }
    ]
  },*/

  // Add this to your ZoneConfig.js
'shloka-river': {
  id: 'shloka-river',
  name: 'Shloka River',
  icon: '🌊',
  emoji: '🌊', 
  background: 'images/shloka-river-bg.png', // Your background image
  description: 'Learn sacred Sanskrit shlokas by the flowing river of wisdom',
  theme: 'water-wisdom',
  difficulty: 'intermediate',
  learningFocus: 'Sanskrit shloka recitation',
  
  // ✅ Your 5 scenes in order
  scenes: [
    {
      id: 'vakratunda-grove',
      name: 'Vakratunda Grove',
      emoji: '🌳',
      order: 1,
      description: 'Learn the opening verse in the sacred grove'
    },
    {
      id: 'suryakoti-bank', 
      name: 'Suryakoti Bank',
      emoji: '☀️',
      order: 2,
      description: 'Discover the radiance verse by the river bank'
    },
    {
      id: 'nirvighnam-chant',
      name: 'Nirvighnam Chant', 
      emoji: '🎵',
      order: 3,
      description: 'Master the obstacle-removing chant'
    },
    {
      id: 'sarvakaryeshu-chant',
      name: 'Sarvakaryeshu Chant',
      emoji: '🕉️', 
      order: 4,
      description: 'Learn the all-accomplishing verse'
    },
    {
      id: 'shloka-river-finale',
      name: 'Shloka River Finale',
      emoji: '🎊',
      order: 5, 
      description: 'Complete the full shloka by the sacred waters'
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
    totalStars: 11, // 4+2+3+2 = 11 stars total
    requiredStars: 0,
    sequence: 5,
    scenes: [
      {
        id: 'game1', // ✅ Matches App.jsx
        name: 'Family Tree',
        emoji: '👨‍👩‍👦',
        description: 'Help Ganesha complete his family tree',
        unlocked: true,
        order: 1,
        totalStars: 4,
        position: { top: 30, left: 25 }
      },
      {
        id: 'game2', // ✅ Matches App.jsx
        name: 'My Favorite Things',
        emoji: '🍬',
        description: 'Find Ganesha\'s favorite food and best friend',
        unlocked: true,
        order: 2,
        totalStars: 2,
        position: { top: 50, left: 60 }
      },
      {
        id: 'game3', // ✅ Matches App.jsx
        name: 'Obstacle Remover',
        emoji: '🪔',
        description: 'Clear obstacles with joy, peace, and love',
        unlocked: true,
        order: 3,
        totalStars: 3,
        position: { top: 70, left: 35 }
      },
      {
        id: 'game4', // ✅ Matches App.jsx
        name: 'Name & Birthday',
        emoji: '🎈',
        description: 'Spell GANESHA and find his birthday festival',
        unlocked: true,
        order: 4,
        totalStars: 2,
        position: { top: 40, left: 70 }
      }
    ]
  },

 /* 'story-treehouse': {
    id: 'story-treehouse',
    name: 'Story Treehouse',
    icon: '🏜️',
    background: '/images/story-treehouse.png',
    description: 'Listen to magical tales from ancient times.',
    unlocked: true,
    totalStars: 21,
    requiredStars: 0,
    sequence: 2,
    scenes: [
      {
        id: 'magic-tree',
        name: 'Magic Tree',
        emoji: '🌳',
        description: 'Climb the ancient storytelling tree',
        unlocked: true,
        order: 1,
        position: { top: 55, left: 30 }
      },
      {
        id: 'book-nook',
        name: 'Book Nook',
        emoji: '📚',
        description: 'Read magical stories in the cozy nook',
        unlocked: false,
        order: 2,
        position: { top: 35, left: 65 }
      },
      {
        id: 'story-stage',
        name: 'Story Stage',
        emoji: '🎭',
        description: 'Perform your own stories on the stage',
        unlocked: false,
        order: 3,
        position: { top: 70, left: 55 }
      }
    ]
  },*/

 'festival-square': {
  id: 'festival-square',
  name: 'Festival Square',
  icon: '🎉',
  background: '/images/festivalsquare-bg.png',
  description: 'Celebrate with music, art, cooking, and decoration games!',
  unlocked: true,
  totalStars: 24, // 4 games × 6 stars each
  requiredStars: 40,
  sequence: 6,
  scenes: [
    {
      id: 'game1', // ✅ Match App.jsx scene IDs
      name: 'Festival Piano',
      emoji: '🎹',
      description: 'Play beautiful melodies on the festival piano',
      unlocked: true, // ✅ All games unlocked from start
      order: 1,
      position: { top: 35, left: 25 }
    },
    {
      id: 'game2', // ✅ Match App.jsx scene IDs  
      name: 'Rangoli Art Booth',
      emoji: '🎨',
      description: 'Create colorful rangoli patterns',
      unlocked: true, // ✅ All games unlocked from start
      order: 2,
      position: { top: 50, left: 60 }
    },
    {
      id: 'game3', // ✅ Match App.jsx scene IDs
      name: 'Modak Cooking',
      emoji: '🍯',
      description: 'Cook delicious modaks for the festival',
      unlocked: true, // ✅ All games unlocked from start
      order: 3,
      position: { top: 70, left: 40 }
    },
    {
      id: 'game4', // ✅ Match App.jsx scene IDs
      name: 'Mandap Decoration',
      emoji: '🏛️',
      description: 'Decorate the beautiful festival mandap',
      unlocked: true, // ✅ All games unlocked from start
      order: 4,
      position: { top: 25, left: 55 }
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
    if (scene.order === 1) return true; // First scene always unlocked
    
    // Check if previous scene is completed
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