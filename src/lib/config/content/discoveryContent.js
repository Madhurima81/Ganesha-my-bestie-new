// Discovery Overlay Content - Symbol reveals and affirmations
// Learning zones only (Meaning Cave, Symbol Mountain, Shloka River)

export const DISCOVERY_CONTENT = {

  'meaning-cave': {

    'vakratunda-mahakaya': {
      vakratunda: {
        title: "Vakratunda",
        affirmation: "I adapt.",
        icon: 'vakratunda-symbol'
      },

      mahakaya: {
        title: "Mahakaya",
        affirmation: "I am strong inside.",
        icon: 'mahakaya-symbol'
      }
    },

    'suryakoti-samaprabha': {
      suryakoti: {
        title: "Suryakoti",
        affirmation: "I shine brightly.",
        icon: 'suryakoti-symbol'
      },

      samaprabha: {
        title: "Samaprabha",
        affirmation: "My light is steady.",
        icon: 'samaprabha-symbol'
      }
    },

    'nirvighnam-kurumedeva': {
      nirvighnam: {
        title: "Nirvighnam",
        affirmation: "I move past obstacles.",
        icon: 'nirvighnam-symbol'
      },

      kurumedeva: {
        title: "Kurumedeva",
        affirmation: "I try my best.",
        icon: 'kurumedeva-symbol'
      }
    },

    'sarvakaryeshu-sarvada': {
      sarvakaryeshu: {
        title: "Sarvakaryeshu",
        affirmation: "I do my work with care.",
        icon: 'sarvakaryeshu-symbol'
      },

      sarvada: {
        title: "Sarvada",
        affirmation: "I keep going.",
        icon: 'sarvada-symbol'
      }
    }
  },

  'symbol-mountain': {

    'modak': {
      mooshika: {
        title: "Mooshika",
        affirmation: "I can keep going, one small step at a time.",
        icon: 'mooshika-happy'
      },

      modak: {
        title: "Modak",
        affirmation: "I can learn, keep trying, and find joy.",
        icon: 'modak-basket'
      },

      belly: {
        title: "Big Belly",
        affirmation: "I can have lots of feelings and keep going.",
        icon: 'belly-full'
      }
    },

    'pond': {
      lotus: {
        title: "Lotus",
        affirmation: "I can keep growing when things are hard.",
        icon: 'golden-lotus'
      },

      trunk: {
        title: "Trunk",
        affirmation: "I can be strong and gentle.",
        icon: 'water-elephant'
      }
    },

    'tusk': {
      eyes: {
        title: "Eyes",
        affirmation: "I notice the good around me.",
        icon: 'ganesha-eyes'
      },

      ears: {
        title: "Ears",
        affirmation: "I can listen for what helps me.",
        icon: 'ganesha-ears'
      },

      tusk: {
        title: "Tusk",
        affirmation: "I can use what I have for something important.",
        icon: 'ganesha-tusk'
      }
    }
  },

  'shloka-river': {

    'vakratunda-grove': {
      vakratunda: {
        title: "Vakratunda",
        affirmation: "I can change my plan and try another way.",
        icon: 'vakratunda-complete'
      },

      mahakaya: {
        title: "Mahakaay",
        affirmation: "I can make space in my heart for others.",
        icon: 'mahakaya-complete'
      }
    },

    'suryakoti-bank': {
      suryakoti: {
        title: "Suryakoti",
        affirmation: "I can find hope inside me.",
        icon: 'suryakoti-complete'
      },

      samaprabha: {
        title: "Samaprabha",
        affirmation: "I can see what is really there.",
        icon: 'samaprabha-complete'
      }
    },

    'nirvighnam-chant': {
      nirvighnam: {
        title: "Nirvighnam",
        affirmation: "I can solve one thing at a time.",
        icon: 'nirvighnam-complete'
      },

      kurumedeva: {
        title: "Kuru Me Deva",
        affirmation: "I can ask for help when I need it.",
        icon: 'kurumedeva-complete'
      }
    },

    'sarvakaryeshu-chant': {
      sarvakaryeshu: {
        title: "Sarva Karyeshu",
        affirmation: "I can remember Ganesha in everything I do.",
        icon: 'sarvakaryeshu-complete'
      },

      sarvada: {
        title: "Sarvada",
        affirmation: "Ganesha is always with me.",
        icon: 'sarvada-complete'
      }
    }
  }
};

// Helper function to get discovery content by zone, scene, and symbol
export const getDiscoveryContent = (zoneId, sceneId, symbolKey) => {
  return DISCOVERY_CONTENT[zoneId]?.[sceneId]?.[symbolKey] || null;
};

// Helper to get celebration stage content
export const getCelebrationContent = (zoneId, sceneId, symbolKey) => {
  return DISCOVERY_CONTENT[zoneId]?.[sceneId]?.[symbolKey] || null;
};

// Helper to get power stage content
export const getPowerContent = (zoneId, sceneId, symbolKey) => {
  return DISCOVERY_CONTENT[zoneId]?.[sceneId]?.[symbolKey] || null;
};

// Check if a zone uses discovery overlays (learning zones only)
export const hasDiscoveryOverlay = (zoneId) => {
  const learningZones = ['meaning-cave', 'symbol-mountain', 'shloka-river'];
  return learningZones.includes(zoneId);
};
