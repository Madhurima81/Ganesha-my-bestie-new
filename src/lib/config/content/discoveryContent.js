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
        affirmation: "I can guide my busy thoughts.",
        icon: 'mooshika-happy'
      },

      modak: {
        title: "Modak",
        affirmation: "I have joy inside me.",
        icon: 'modak-basket'
      },

      belly: {
        title: "Big Belly",
        affirmation: "I have room for all my feelings.",
        icon: 'belly-full'
      }
    },

    'pond': {
      lotus: {
        title: "Lotus",
        affirmation: "I can stay calm when things get messy.",
        icon: 'golden-lotus'
      },

      trunk: {
        title: "Trunk",
        affirmation: "I find my way.",
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
        affirmation: "I listen with care.",
        icon: 'ganesha-ears'
      },

      tusk: {
        title: "Tusk",
        affirmation: "I stay focused on what is true.",
        icon: 'ganesha-tusk'
      }
    }
  },

  'shloka-river': {

    'vakratunda-grove': {
      vakratunda: {
        title: "Vakratunda",
        affirmation: "I find a new way.",
        icon: 'vakratunda-complete'
      },

      mahakaya: {
        title: "Mahakaya",
        affirmation: "I can make room.",
        icon: 'mahakaya-complete'
      }
    },

    'suryakoti-bank': {
      suryakoti: {
        title: "Suryakoti",
        affirmation: "I can see the way.",
        icon: 'suryakoti-complete'
      },

      samaprabha: {
        title: "Samaprabha",
        affirmation: "I can make the light even.",
        icon: 'samaprabha-complete'
      }
    },

    'nirvighnam-chant': {
      nirvighnam: {
        title: "Nirvighnam",
        affirmation: "I clear the way.",
        icon: 'nirvighnam-complete'
      },

      kurumedeva: {
        title: "Kuru Me Deva",
        affirmation: "I ask for help.",
        icon: 'kurumedeva-complete'
      }
    },

    'sarvakaryeshu-chant': {
      sarvakaryeshu: {
        title: "Sarva Karyeshu",
        affirmation: "I do every task with care.",
        icon: 'sarvakaryeshu-complete'
      },

      sarvada: {
        title: "Sarvada",
        affirmation: "What I learn stays with me.",
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
