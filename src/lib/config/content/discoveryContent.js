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
        affirmation: "I can focus.",
        icon: 'mooshika-happy'
      },

      modak: {
        title: "Modak",
        affirmation: "I am full of joy.",
        icon: 'modak-basket'
      },

      belly: {
        title: "Big Belly",
        affirmation: "I feel safe inside.",
        icon: 'belly-full'
      }
    },

    'pond': {
      lotus: {
        title: "Lotus",
        affirmation: "I stay calm.",
        icon: 'golden-lotus'
      },

      trunk: {
        title: "Trunk",
        affirmation: "I choose how I act.",
        icon: 'water-elephant'
      }
    },

    'tusk': {
      eyes: {
        title: "Eyes",
        affirmation: "I see clearly.",
        icon: 'ganesha-eyes'
      },

      ears: {
        title: "Ears",
        affirmation: "I listen with care.",
        icon: 'ganesha-ears'
      },

      tusk: {
        title: "Tusk",
        affirmation: "I finish what I start.",
        icon: 'ganesha-tusk'
      }
    }
  },

  'shloka-river': {

    'vakratunda-grove': {
      vakratunda: {
        title: "Vakratunda",
        affirmation: "I find a new way",
        icon: 'vakratunda-complete'
      },

      mahakaya: {
        title: "Mahakaya",
        affirmation: "I am strong inside",
        icon: 'mahakaya-complete'
      }
    },

    'suryakoti-bank': {
      suryakoti: {
        title: "Suryakoti",
        affirmation: "I shine.",
        icon: 'suryakoti-complete'
      },

      samaprabha: {
        title: "Samaprabha",
        affirmation: "My light is steady.",
        icon: 'samaprabha-complete'
      }
    },

    'nirvighnam-chant': {
      nirvighnam: {
        title: "Nirvighnam",
        affirmation: "I move forward.",
        icon: 'nirvighnam-complete'
      },

      kurumedeva: {
        title: "Kurumedeva",
        affirmation: "I do my best.",
        icon: 'kurumedeva-complete'
      }
    },

    'sarvakaryeshu-chant': {
      sarvakaryeshu: {
        title: "Sarvakaryeshu",
        affirmation: "I work with care.",
        icon: 'sarvakaryeshu-complete'
      },

      sarvada: {
        title: "Sarvada",
        affirmation: "I keep trying.",
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
