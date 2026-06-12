// Completion Modal Content
// Organized by zone -> scene

export const COMPLETION_MODALS = {
  'symbol-mountain': {
    modak: {
      title: 'You Shared the Modaks!',
      subtitle: 'You found Mooshika and shared the sweet modaks. Wonderful work, little friend.'
    },
    pond: {
      title: 'The Lotus Has Bloomed',
      subtitle: 'You helped it bloom. It opened for you.'
    },
    symbol: {
      title: 'Ganesha Shines',
      subtitle: 'You saw, you listened, and finished it.'
    },
    'final-scene': {
      title: 'Ganesha Shines',
      subtitle: 'All the symbols are together. Ganesha shines.'
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
    title: 'The Grove Has Bloomed',
    subtitle: 'Your voice made them bloom.'
  },
  'suryakoti-bank': {
    title: 'The Sun Is Shining Bright!',
    subtitle: 'Your words brought the light forward.'
  },
  'nirvighnam-chant': {
    title: 'Two new powers unlocked!',
    subtitle: 'Nirvighnam and Kurumedeva are yours.'
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
    title: 'Your Story Is Special!',
    subtitle: 'You are part of India’s story.'
  },
  'family-tree': {
    title: 'Our Families Are Special!',
    subtitle: 'Every family is full of love.'
  },
  'favorite-food': {
    title: 'We Know Each Other!',
    subtitle: 'Now we know what we both love.'
  },
  'dreams-wishes': {
    title: 'Your Dream Shines!',
    subtitle: 'Your dream makes the world brighter.'
  }
}
};

export const getCompletionModal = (zoneId, sceneId) => {
  return COMPLETION_MODALS[zoneId]?.[sceneId] || null;
};

export const hasCompletionModal = (zoneId, sceneId) => {
  return !!COMPLETION_MODALS[zoneId]?.[sceneId];
};
