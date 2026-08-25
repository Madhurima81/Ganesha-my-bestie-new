// Completion Modal Content
// Organized by zone -> scene

export const COMPLETION_MODALS = {
  'symbol-mountain': {
    modak: {
      title: 'Mooshika Found His Calm!',
      subtitle: 'You gathered the offerings and made room for every feeling.'
    },
    pond: {
      title: 'The Lotus Has Bloomed!',
      subtitle: 'You found another way and helped it bloom.'
    },
    symbol: {
      title: 'You Looked and Listened Carefully!',
      subtitle: 'Then you stayed focused and chose what each obstacle needed.'
    },
    'final-scene': {
      title: 'All Eight Symbols Together!',
      subtitle: 'Every symbol has found its place.'
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
    title: 'You found another way!',
    subtitle: 'There is room for everyone.'
  },
  'suryakoti-bank': {
    title: 'The light showed the way!',
    subtitle: 'Both shine equally now!'
  },
  'nirvighnam-chant': {
    title: 'The Way Is Clear!',
    subtitle: 'You asked for help! The bridge is ready!'
  },
  'sarvakaryeshu-chant': {
    title: 'In Everything You Do',
    subtitle: 'You can use Ganesha’s lessons in many different moments.'
  },
  'shloka-river-finale': {
    title: 'The Shloka River Is Complete!',
    subtitle: 'You put the whole shloka together.'
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
    subtitle: "Your family's story is part of India's many stories."
  },
  'family-tree': {
    title: 'Our Families Are Special!',
    subtitle: 'Every family is different, and full of love.'
  },
  'favorite-food': {
    title: 'We Know Each Other!',
    subtitle: 'Now we know what we both love.'
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
