// Completion Modal Content
// Organized by zone -> scene

export const COMPLETION_MODALS = {
  'symbol-mountain': {
    modak: {
      title: 'Mooshika Made It!',
      subtitle: 'Small steps brought him to Ganesha.'
    },
    pond: {
      title: 'The Lotus Bloomed!',
      subtitle: 'You helped the water reach the lotus.'
    },
    symbol: {
      title: 'The Forest Friends Are Happy!',
      subtitle: 'You found what could help.'
    },
    'final-scene': {
      title: 'You Know Ganesha’s Symbols!',
      subtitle: 'Use his symbols to help you every day.'
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
    title: 'Everyone Made It Across!',
    subtitle: 'You found a way for everyone.'
  },
  'suryakoti-bank': {
    title: 'You Brought Back the Light!',
    subtitle: 'A closer look showed what was really there.'
  },
  'nirvighnam-chant': {
    title: 'The Way Is Clear!',
    subtitle: 'You solved what you could and asked for help.'
  },
  'sarvakaryeshu-chant': {
    title: 'Ganesha Was With You All Day!',
    subtitle: 'In every moment, from morning to night.'
  },
  'shloka-river-finale': {
    title: 'The Shloka River Is Complete!',
    subtitle: 'All eight words now flow together.'
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
    subtitle: 'Families can connect to India in many different ways.'
  },
  'family-tree': {
    title: 'Our Families Are Special!',
    subtitle: 'Every family has its own story.'
  },
  'favorite-food': {
    title: 'We Know Each Other!',
    subtitle: 'We learned a little more about each other.'
  },
  'dreams-wishes': {
    title: 'Your Dream Shines!',
    subtitle: "Your dream is special because it's yours."
  }
}
};

export const getCompletionModal = (zoneId, sceneId) => {
  return COMPLETION_MODALS[zoneId]?.[sceneId] || null;
};

export const hasCompletionModal = (zoneId, sceneId) => {
  return !!COMPLETION_MODALS[zoneId]?.[sceneId];
};
