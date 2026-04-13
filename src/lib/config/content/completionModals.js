// Completion Modal Content
// Organized by zone -> scene

export const COMPLETION_MODALS = {
  'symbol-mountain': {
    modak: {
      title: 'You Shared the Modaks!',
      subtitle: 'You found Mooshika and shared the sweet modaks. Wonderful work, little friend.'
    },
    pond: {
      title: 'The Lotus Has Bloomed!',
      subtitle: 'The golden petals opened with your help.'
    },
    symbol: {
      title: 'The Mountain Has Awakened!',
      subtitle: 'The rhythm echoed and the symbols stirred.'
    },
    'final-scene': {
      title: 'The Symbols Shine as One!',
      subtitle: 'The mountain glows brighter because of you.'
    }
  },
  'cave-of-secrets': {
    'vakratunda-mahakaya': {
      title: 'Your Strength Is Rising!',
      subtitle: 'You placed each stone with care.'
    },
    'suryakoti-samaprabha': {
      title: 'The Cave Is Filled with Light!',
      subtitle: 'The hidden suns are shining now.'
    },
    'nirvighnam-kurumedeva': {
      title: 'The Bridge Stands Clear!',
      subtitle: 'The path forward is open.'
    },
    'sarvakaryeshu-sarvada': {
      title: 'Your Choice Was Wise!',
      subtitle: 'You listened closely before you chose.'
    },
    'final-meaning-scene': {
      title: 'The Meanings Now Shine Together!',
      subtitle: 'All the secrets now glow as one.'
    }
  },

'shloka-river': {
  'vakratunda-grove': {
    title: 'The Flowers Have Bloomed!',
    subtitle: 'Your voice helped them grow.'
  },
  'suryakoti-bank': {
    title: 'The Sun Is Shining Bright!',
    subtitle: 'Your words brought the light forward.'
  },
  'nirvighnam-chant': {
    title: 'The Path Is Clear!',
    subtitle: 'Your chant made the way appear.'
  },
  'sarvakaryeshu-chant': {
    title: 'Kindness Is Flowing!',
    subtitle: 'Your words spread gently outward.'
  },
  'shloka-river-finale': {
    title: 'The Shloka Flows as One!',
    subtitle: 'Every word now moves together.'
  }
},

'festival-square': {
  game1: {
    title: 'The Festival Drums Are Alive!',
    subtitle: 'The rhythm rises through the square.'
  },
  game2: {
    title: 'The Rangoli Shines Bright!',
    subtitle: 'Your colors light up the ground.'
  },
  game3: {
    title: 'The Modaks Are Ready!',
    subtitle: 'Sweetness fills the celebration.'
  },
  game4: {
    title: 'The Mandap Stands Beautiful!',
    subtitle: 'The space now glows with care.'
  }
},

'about-me-hut': {
  'my-indian-story': {
    title: 'Our Indian Story Is Complete!',
    subtitle: 'You and Ganesha share the roots of India.'
  },
  'family-tree': {
    title: 'Our Families Are Beautiful!',
    subtitle: 'Every family is special and full of love.'
  },
  'favorite-food': {
    title: 'Our Favorite Things',
    subtitle: 'Now we know the things we each love.'
  },
  'dreams-wishes': {
    title: 'Your Dream Is Taking Shape',
    subtitle: 'You cleared the way for your dream.'
  }
}
};

export const getCompletionModal = (zoneId, sceneId) => {
  return COMPLETION_MODALS[zoneId]?.[sceneId] || null;
};

export const hasCompletionModal = (zoneId, sceneId) => {
  return !!COMPLETION_MODALS[zoneId]?.[sceneId];
};
