import storyHomeIcon from '../../../zones/about-me-hut/indian-story/assets/images/house-icon.webp';
import storyLanguageIcon from '../../../zones/about-me-hut/indian-story/assets/images/language-icon.webp';
import storyFestivalIcon from '../../../zones/about-me-hut/indian-story/assets/images/festival-icon.webp';
import familyHomeIcon from '../../../zones/about-me-hut/family-tree/assets/images/house-icon.webp';
import familyHeartIcon from '../../../zones/about-me-hut/family-tree/assets/images/heart-icon.webp';
import familyIcon from '../../../zones/about-me-hut/family-tree/assets/images/family-icon.webp';
import favoriteFoodIcon from '../../../zones/about-me-hut/food/assets/images/food-icon.webp';
import favoriteColorIcon from '../../../zones/about-me-hut/food/assets/images/color-icon.webp';
import favoriteActivityIcon from '../../../zones/about-me-hut/food/assets/images/sports-icon.webp';
import dreamHeartIcon from '../../../zones/about-me-hut/enjoy/assets/images/heart-icon.webp';
import dreamStarIcon from '../../../zones/about-me-hut/enjoy/assets/images/shootingstar-icon.webp';
import dreamWorldIcon from '../../../zones/about-me-hut/enjoy/assets/images/world-icon.webp';

// Opening Modal Content for All 22 Scenes
// Organized by zone â†’ scene

export const OPENING_MODALS = {

  // ========================================
  // SYMBOL MOUNTAIN
  // ========================================
  'symbol-mountain': {
    'modak': {
      title: "Help Mooshika Keep Going",
      description: "One small step at a time.",
      voiceover: "Mooshika has a journey ahead. Let’s help him.",
      icons: ['mooshika', 'modak', 'belly'],
      buttonText: "Let's Explore",
      character: 'ganesha-happy'
    },

    'pond': {
      title: "Help the Lotus Bloom",
      description: "Clear the way for the water.",
      icons: ['lotus', 'trunk'],
      iconLabels: ['Lotus', 'Trunk'],
      buttonText: "Let's Explore",
      character: null
    },

    'symbol': {
      title: "Ganesha's Symbols",
      description: "The forest friends need your help. Let's see what they need.",
      icons: ['eyes', 'ears', 'tusk'],
      iconLabels: ['Eyes', 'Ears', 'Tusk'],
      buttonText: "Let's Explore",
      character: null
    },

    'final-scene': {
      title: "Remember Ganesha’s Symbols",
      description: "Match each symbol and remember what it means.",
      icons: ['eyes', 'trunk', 'lotus'],
      buttonText: "Let's Explore",
      character: 'ganesha-cave'
    }
  },

  // ========================================
  // CAVE OF SECRETS
  // ========================================
  'cave-of-secrets': {
    'vakratunda-mahakaya': {
      title: "Build the Strength",
      description: "Trace the curve slowly and feel the strength grow.",
      icons: ['vakratunda', 'mahakaya'],
      iconLabels: ['Curved Trunk', 'Great Body'],
      buttonText: "Let's Explore",
      character: null
    },

    'suryakoti-samaprabha': {
      title: "Spread the Light",
      description: "Tiny suns glow in the dark. Find them and let the cave shine.",
      icons: ['suryakoti', 'samaprabha'],
      iconLabels: ['Million Suns', 'Equal Radiance'],
      buttonText: "Let's Explore",
      character: null
    },

    'nirvighnam-kurumedeva': {
      title: "Clear the Way",
      description: "A gentle fog lies ahead. Guide the path and move forward with ease.",
      icons: ['nirvighnam', 'kurumedeva'],
      iconLabels: ['No Obstacles', 'Do For Me'],
      buttonText: "Let's Explore",
      character: null
    },

    'sarvakaryeshu-sarvada': {
      title: "Choose with Ganesha",
      description: "Take a quiet moment and choose with Ganesha beside you.",
      icons: ['sarvakaryeshu', 'sarvada'],
      iconLabels: ['All Actions', 'Always'],
      buttonText: "Let's Explore",
      character: null
    },

    'final-meaning-scene': {
      title: "All Meanings Together",
      description: "The shloka is complete. See how every part connects.",
      icons: ['vakratunda', 'meaning'],
      iconLabels: ['Symbols', 'Meanings'],
      buttonText: "Let's Explore",
      character: 'ganesha-cave'
    }
  },

  // ========================================
  // SHLOKA RIVER
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      title: "Make Way for Everyone",
      description: "Find another way so everyone can come along.",
      icons: ['vakratunda', 'mahakaya'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'suryakoti-bank': {
      title: "Bring Back the Light!",
      description: "Light the way and see what's really there.",
      icons: ['suryakoti', 'samaprabha'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'nirvighnam-chant': {
      title: "Clear the Way Together!",
      description: "Can you help our friends through?",
      icons: ['nirvighnam', 'kurumedeva'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'sarvakaryeshu-chant': {
      title: "Ganesha All Day",
      description: "Find Ganesha in your day.",
      icons: ['sarvakaryeshu', 'sarvada'],
      iconLabels: ['Sarvakaryeshu', 'Sarvada'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'shloka-river-finale': {
      title: "Complete the Shloka!",
      description: "Put all eight words in the right order.",
      icons: ['vakratunda', 'nirvighnam', 'sarvada'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    }
  },

  // ========================================
  // FESTIVAL SQUARE
  // ========================================
  'festival-square': {
    'game1': {
      title: "Festival Beats",
      description: "The music is waiting. Play and feel the rhythm come alive.",
      icons: [
        '/images/festival-square/icons/listen-icon.png',
        '/images/festival-square/icons/play-icon.png',
        '/images/festival-square/icons/create-icon.png'
      ],
      iconLabels: ['Listen', 'Play', 'Create'],
      buttonText: "Let's Explore",
      character: 'ganesha-musician'
    },

    'game2': {
      title: "Sparkly Rangoli",
      description: "Colors rest on the floor. Create something bright and beautiful.",
      icons: [
        '/images/festival-square/icons/learn-icon.png',
        '/images/festival-square/icons/draw-icon.png',
        '/images/festival-square/icons/design-icon.png'
      ],
      iconLabels: ['Learn', 'Draw', 'Design'],
      buttonText: "Let's Explore",
      character: 'ganesha-artist'
    },

    'game3': {
      title: "Modak Party",
      description: "Sweet ingredients are ready. Mix and see what you can make.",
      icons: [
        '/images/festival-square/icons/recipe-icon.png',
        '/images/festival-square/icons/cook-icon.png',
        '/images/festival-square/icons/serve-icon.png'
      ],
      iconLabels: ['Recipe', 'Cook', 'Serve'],
      buttonText: "Let's Explore",
      character: 'ganesha-chef'
    },

    'game4': {
      title: "Mandap Magic",
      description: "The space is yours. Decorate it in your own way.",
      icons: [
        '/images/festival-square/icons/mandap-coconut-icon.png',
        '/images/festival-square/icons/mandap-diya-icon.png',
        '/images/festival-square/icons/mandap-flower-icon.png'
      ],
      iconLabels: ['Learn', 'Build', 'Decorate'],
      buttonText: "Let's Explore",
      character: 'ganesha-happy-sitting'
    }
  },

  // ========================================
  // ABOUT ME HUT
  // ========================================
  'about-me-hut': {
    'my-indian-story': {
      title: "My Indian Story",
      description: "Let's explore my India story, then yours!",
      voiceover: "Let’s explore my India story, then yours.",
      icons: [
        storyHomeIcon,
        storyLanguageIcon,
        storyFestivalIcon
      ],
      iconLabels: ['Home', 'Language', 'Festival'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },
    'family-tree': {
      title: "Our families",
      description: "Let's meet my family, then make your family tree!",
      voiceover: "Let’s meet my family, then make your family tree.",
      icons: [
        familyHomeIcon,
        familyHeartIcon,
        familyIcon
      ],
      iconLabels: ['Home', 'Heart', 'Family'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'favorite-food': {
      title: "Our Favorite Things",
      description: "Let's find my favorites, then yours!",
      voiceover: "Let’s find my favorites, then yours.",
      icons: [
        favoriteFoodIcon,
        favoriteColorIcon,
        favoriteActivityIcon
      ],
      iconLabels: ['Food', 'Color', 'Activity'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'dreams-wishes': {
      title: "Our Wishes & Dreams",
      description: "Let's help and dream together!",
      voiceover: "I have a few wishes. Will you help me — then share yours?",
      icons: [
        dreamHeartIcon,
        dreamStarIcon,
        dreamWorldIcon
      ],
      iconLabels: ['Heart', 'Star', 'World'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    }
  }
};

// Helper function to get opening modal content by zone and scene
export const getOpeningModal = (zoneId, sceneId) => {
  return OPENING_MODALS[zoneId]?.[sceneId] || null;
};

// Helper to check if opening modal exists
export const hasOpeningModal = (zoneId, sceneId) => {
  return !!OPENING_MODALS[zoneId]?.[sceneId];
};

