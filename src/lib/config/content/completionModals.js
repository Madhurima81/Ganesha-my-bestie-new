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
  }
};

export const getCompletionModal = (zoneId, sceneId) => {
  return COMPLETION_MODALS[zoneId]?.[sceneId] || null;
};

export const hasCompletionModal = (zoneId, sceneId) => {
  return !!COMPLETION_MODALS[zoneId]?.[sceneId];
};
