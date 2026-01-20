// CulturalProgressExtractor.js - Extract learning progress for celebration modal
import GameStateManager from './GameStateManager';

class CulturalProgressExtractor {
  
  // ✅ FIXED: Main function using GameStateManager (same as stars)
  static getCulturalProgressData() {
    try {
      const gameProgress = GameStateManager.getGameProgress();
      const currentProfile = GameStateManager.getCurrentProfile();
      
      if (!gameProgress || !currentProfile) {
        return this.getEmptyProgressData();
      }

      // ✅ EXTRACT symbols from GameStateManager (same as stars)
      const symbolsDiscovered = this.extractDiscoveredSymbolsFromScenes();
      const storiesLearned = this.extractLearnedStories(gameProgress);
      const shlokasChanted = this.extractChantedShlokas(gameProgress);
      const totalLearnings = symbolsDiscovered.length + storiesLearned.length + shlokasChanted.length;

      // Calculate cultural level
      const culturalLevelInfo = this.calculateCulturalLevel(totalLearnings, gameProgress.totalStars || 0);

      return {
        // Basic info
        childName: currentProfile.name || "Cultural Explorer",
        
        // Learning achievements (old format for compatibility)
        discoveredSymbols: symbolsDiscovered,
        learnedShlokas: shlokasChanted,
        heardStories: storiesLearned,
        
        // Cultural level (old format)
        culturalLevel: culturalLevelInfo.level,
        culturalTitle: culturalLevelInfo.title,
        
        // ✅ NEW: Properties for GameWelcomeScreen
        level: culturalLevelInfo.level,
        levelName: culturalLevelInfo.title,
        symbolsCount: symbolsDiscovered.length,
        storiesCount: storiesLearned.length,
        chantsCount: shlokasChanted.length,
        totalLearnings: totalLearnings,
        
        // Overall progress
        totalStars: gameProgress.totalStars || 0,
        completedScenes: gameProgress.completedScenes || 0,
        totalScenes: this.getTotalAvailableScenes()
      };

    } catch (error) {
      console.error('Error extracting cultural progress:', error);
      return this.getEmptyProgressData();
    }
  }

  // ✅ DISNEY HYBRID: Read from BOTH temp (progressive) AND permanent (persistent)
static extractDiscoveredSymbolsFromScenes() {
  const symbols = [];
  
  try {
    const gameProgress = GameStateManager.getGameProgress();
    const currentProfile = GameStateManager.getCurrentProfile();
    
    if (!gameProgress || !currentProfile) {
      console.log('❌ No game progress or profile found');
      return symbols;
    }

    console.log('🔍 HYBRID EXTRACTION: Using both temp + permanent data');

   const realSymbols = {
  'lotus': { name: 'Sacred Lotus', category: 'nature' },
  'trunk': { name: 'Divine Trunk', category: 'divine' },
  'mooshika': { name: 'Mooshika Guide', category: 'companion' },
  'modak': { name: 'Sacred Modak', category: 'offering' },
  'belly': { name: 'Cosmic Belly', category: 'divine' },
  'eyes': { name: 'Divine Eyes', category: 'divine' },        // ✅ NEW
  'ears': { name: 'Sacred Ears', category: 'divine' },        // ✅ NEW  
  'tusk': { name: 'Mighty Tusk', category: 'divine' }         // ✅ NEW
};

    // ✅ PRIORITY 1: Read from CURRENT TEMP SESSION (progressive display)
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(activeProfileId) && key.includes('temp_session')) {
          try {
            const sceneState = JSON.parse(localStorage.getItem(key) || '{}');
            if (sceneState.discoveredSymbols) {
              Object.entries(sceneState.discoveredSymbols).forEach(([symbolName, discovered]) => {
                if (discovered && realSymbols[symbolName] && !symbols.find(s => s.name === symbolName)) {
                  symbols.push({
                    name: symbolName,
                    displayName: realSymbols[symbolName].name,
                    category: realSymbols[symbolName].category,
                    discoveredAt: Date.now(),
                    source: 'current-session'
                  });
                  console.log(`✅ CURRENT SESSION: ${symbolName} from temp session`);
                }
              });
            }
          } catch (e) {
            // Skip invalid data
          }
        }
      });
    }

    // ✅ PRIORITY 2: Add from PERMANENT COMPLETED SCENES (persistence)
    if (gameProgress.zones) {
      Object.entries(gameProgress.zones).forEach(([zoneId, zone]) => {
        if (zone.scenes) {
          Object.entries(zone.scenes).forEach(([sceneId, scene]) => {
            if (scene.completed && scene.symbols) {
              Object.entries(scene.symbols).forEach(([symbolName, discovered]) => {
                if (discovered && realSymbols[symbolName] && !symbols.find(s => s.name === symbolName)) {
                  symbols.push({
                    name: symbolName,
                    displayName: realSymbols[symbolName].name,
                    category: realSymbols[symbolName].category,
                    discoveredAt: scene.completedAt || Date.now(),
                    source: `${zoneId}-${sceneId}-completed`
                  });
                  console.log(`✅ COMPLETED SCENE: ${symbolName} from ${zoneId}/${sceneId}`);
                }
              });
            }
          });
        }
      });
    }

    console.log(`🎯 HYBRID TOTAL: ${symbols.length} symbols`, symbols.map(s => `${s.name} (${s.source})`));
    return symbols;

  } catch (error) {
    console.error('❌ Error in hybrid extraction:', error);
    return symbols;
  }
}

  // ✅ UPDATED: Extract learned stories from GameStateManager
  static extractLearnedStories(gameProgress) {
    const stories = [];
    
    // Define which scenes teach stories
    const storyScenes = {
      'modak': 'Mooshika and the Sacred Modaks',
      'pond': 'The Sacred Lotus Pond',
      'temple': 'The Ancient Temple Mysteries',
      'garden': 'Ganesha\'s Garden of Wisdom'
    };

    if (gameProgress.zones) {
      Object.entries(gameProgress.zones).forEach(([zoneId, zone]) => {
        if (zone.scenes) {
          Object.entries(zone.scenes).forEach(([sceneId, scene]) => {
            if (scene.completed && storyScenes[sceneId]) {
              stories.push({
                name: storyScenes[sceneId],
                scene: sceneId,
                learnedAt: scene.completedAt || Date.now()
              });
            }
          });
        }
      });
    }

    return stories;
  }

// ✅ REPLACE: extractChantedShlokas method with Cave Sanskrit support

static extractChantedShlokas(gameProgress) {
  const chants = [];

  try {
    const gameProgress = GameStateManager.getGameProgress();
    const currentProfile = GameStateManager.getCurrentProfile();
    
    if (!gameProgress || !currentProfile) {
      console.log('❌ No game progress or profile found');
      return symbols;
    }

        console.log('🔍 HYBRID EXTRACTION: Using both temp + permanent data');

  
    // ✅ DEFINE: Sanskrit words taught in each Cave scene (8 total)
    const sanskritWords = {
      // Scene 1: Vakratunda Mahakaya
      'vakratunda': { name: 'Vakratunda', meaning: 'Curved trunk', scene: 'vakratunda-mahakaya' },
      'mahakaya': { name: 'Mahakaya', meaning: 'Mighty form', scene: 'vakratunda-mahakaya' },
      
      // Scene 2: Surya Koti Samaprabha  
      'suryakoti': { name: 'Suryakoti', meaning: 'Million suns', scene: 'suryakoti-samaprabha' },
      'samaprabha': { name: 'Samaprabha', meaning: 'Equal brilliance', scene: 'suryakoti-samaprabha' },
      
      // Scene 3: Nirvighnam Kurume Deva
      'nirvighnam': { name: 'Nirvighnam', meaning: 'Without obstacles', scene: 'nirvighnam-kurumedeva' },
      'kurumedeva': { name: 'Kurume Deva', meaning: 'Divine help', scene: 'nirvighnam-kurumedeva' },
      
      // Scene 4: Sarvakaryeshu Sarvada
      'sarvakaryeshu': { name: 'Sarvakaryeshu', meaning: 'In all tasks', scene: 'sarvakaryeshu-sarvada' },
      'sarvada': { name: 'Sarvada', meaning: 'Always', scene: 'sarvakaryeshu-sarvada' }
    };

    console.log('🎵 CHANTS EXTRACTION: Starting Sanskrit word extraction');

    // ✅ PRIORITY 1: Read from CURRENT TEMP SESSION (progressive display)
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(activeProfileId) && 
            key.includes('temp_session') && 
            key.includes('cave-of-secrets')) {
          try {
            const sceneState = JSON.parse(localStorage.getItem(key) || '{}');
            if (sceneState.learnedWords) {
              Object.entries(sceneState.learnedWords).forEach(([wordName, wordData]) => {
                if (wordData && wordData.learned && sanskritWords[wordName] && 
                    !chants.find(c => c.name === wordName)) {
                  chants.push({
                    name: wordName,
                    displayName: sanskritWords[wordName].name,
                    meaning: sanskritWords[wordName].meaning,
                    scene: sanskritWords[wordName].scene,
                    learnedAt: Date.now(),
                    source: 'current-session'
                  });
                  console.log(`✅ CURRENT SESSION: ${wordName} from temp session`);
                }
              });
            }
          } catch (e) {
            // Skip invalid data
          }
        }
      });
    }

    // ✅ PRIORITY 2: Add from PERMANENT COMPLETED CAVE SCENES (persistence)
    if (gameProgress.zones && gameProgress.zones['cave-of-secrets']) {
      const caveZone = gameProgress.zones['cave-of-secrets'];
      if (caveZone.scenes) {
        Object.entries(caveZone.scenes).forEach(([sceneId, scene]) => {
          if (scene.completed && scene.sanskritWords) {
            Object.entries(scene.sanskritWords).forEach(([wordName, learned]) => {
              if (learned && sanskritWords[wordName] && 
                  !chants.find(c => c.name === wordName)) {
                chants.push({
                  name: wordName,
                  displayName: sanskritWords[wordName].name,
                  meaning: sanskritWords[wordName].meaning,
                  scene: sanskritWords[wordName].scene,
                  learnedAt: scene.completedAt || Date.now(),
                  source: `cave-of-secrets-${sceneId}-completed`
                });
                console.log(`✅ COMPLETED CAVE: ${wordName} from ${sceneId}`);
              }
            });
          }
        });
      }
    }

    console.log(`🎵 CHANTS TOTAL: ${chants.length} Sanskrit words learned`, 
                chants.map(c => `${c.name} (${c.source})`));
    
    return chants;

  } catch (error) {
    console.error('❌ Error extracting Sanskrit chants:', error);
    return chants;
  }
}
  // Calculate cultural level based on total learnings
  static calculateCulturalLevel(totalLearnings, totalStars) {
    if (totalLearnings >= 20 || totalStars >= 50) {
      return { level: 5, title: "Cultural Ambassador", emoji: "🌟" };
    } else if (totalLearnings >= 15 || totalStars >= 35) {
      return { level: 4, title: "Heritage Guardian", emoji: "🛡️" };
    } else if (totalLearnings >= 10 || totalStars >= 25) {
      return { level: 3, title: "Wisdom Keeper", emoji: "🕉️" };
    } else if (totalLearnings >= 5 || totalStars >= 15) {
      return { level: 2, title: "Symbol Scholar", emoji: "📚" };
    } else {
      return { level: 1, title: "Wisdom Seeker", emoji: "🔍" };
    }
  }

  // Get total available scenes across all zones
  static getTotalAvailableScenes() {
    return 28; // Total planned scenes across all zones
  }

  // Empty progress data fallback
  static getEmptyProgressData() {
    return {
      childName: "Cultural Explorer",
      discoveredSymbols: [],
      learnedShlokas: [],
      heardStories: [],
      culturalLevel: 1,
      culturalTitle: "Wisdom Seeker",
      level: 1,
      levelName: "Wisdom Seeker",
      symbolsCount: 0,
      storiesCount: 0,
      chantsCount: 0,
      totalLearnings: 0,
      completedScenes: 0,
      totalScenes: 28
    };
  }

  // Quick method to get just the celebration stats  
  static getCelebrationStats() {
    const data = this.getCulturalProgressData();
    
    return {
      symbolsCount: data.symbolsCount || 0,
      storiesCount: data.storiesCount || 0,
      chantsCount: data.chantsCount || 0,
      level: data.level || 1,
      levelName: data.levelName || "Wisdom Seeker",
      totalStars: data.totalStars || 0
    };
  }
}

export default CulturalProgressExtractor;