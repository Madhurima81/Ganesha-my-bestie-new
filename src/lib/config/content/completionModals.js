// Completion Modal Content
// Organized by zone -> scene

export const COMPLETION_MODALS = {
  'symbol-mountain': {
    modak: {
      title: 'You Shared the Modaks!',
      subtitle: 'You helped Mooshika find the sweetness.'
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
  strength: {
    title: 'Your Strength Is Rising!',
    subtitle: 'You placed each stone with care.'
  },
  light: {
    title: 'The Cave Is Filled with Light!',
    subtitle: 'The hidden suns are shining now.'
  },
  bridge: {
    title: 'The Bridge Stands Clear!',
    subtitle: 'The path forward is open.'
  },
  choice: {
    title: 'Your Choice Was Wise!',
    subtitle: 'You listened closely before you chose.'
  },
  'final-scene': {
    title: 'The Meanings Now Shine Together!',
    subtitle: 'All the secrets now glow as one.'
  }
},

'shloka-river': {
  bloom: {
    title: 'The Flowers Have Bloomed!',
    subtitle: 'Your voice helped them grow.'
  },
  sun: {
    title: 'The Sun Is Shining Bright!',
    subtitle: 'Your words brought the light forward.'
  },
  path: {
    title: 'The Path Is Clear!',
    subtitle: 'Your chant made the way appear.'
  },
  kindness: {
    title: 'Kindness Is Flowing!',
    subtitle: 'Your words spread gently outward.'
  },
  'final-scene': {
    title: 'The Shloka Flows as One!',
    subtitle: 'Every word now moves together.'
  }
},

'festival-square': {
  beats: {
    title: 'The Festival Drums Are Alive!',
    subtitle: 'The rhythm rises through the square.'
  },
  rangoli: {
    title: 'The Rangoli Shines Bright!',
    subtitle: 'Your colors light up the ground.'
  },
  modak: {
    title: 'The Modaks Are Ready!',
    subtitle: 'Sweetness fills the celebration.'
  },
  mandap: {
    title: 'The Mandap Stands Beautiful!',
    subtitle: 'The space now glows with care.'
  }
},

'about-me-hut': {
  friends: {
    title: 'We Are Friends Now!',
    subtitle: 'You shared a little about yourself.'
  },
  world: {
    title: 'Your World Shines Bright!',
    subtitle: 'It is filled with things that matter to you.'
  },
  favorites: {
    title: 'Your Favorites Tell a Story!',
    subtitle: 'They show what makes you smile.'
  },
  dreams: {
    title: 'Your Dreams Are Taking Shape!',
    subtitle: 'They are growing with you.'
  }
}
};

export const getCompletionModal = (zoneId, sceneId) => {
  return COMPLETION_MODALS[zoneId]?.[sceneId] || null;
};

export const hasCompletionModal = (zoneId, sceneId) => {
  return !!COMPLETION_MODALS[zoneId]?.[sceneId];
};
