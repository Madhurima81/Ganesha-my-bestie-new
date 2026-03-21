// lib/services/ProgressManager.jsx
// 🎯 Centralized Progress System for Ganesha Educational App
// Ensures consistency across Personal Dashboard, Zone Welcome, and Scene Completion

class ProgressManager {
  
  // 🏗️ ZONE CONFIGURATION - Define all zones and scenes
  static ZONE_CONFIG = {
    'symbol-mountain': {
      name: 'Symbol Mountain',
      scenes: ['modak', 'pond', 'symbol', 'final-scene'],
      totalScenes: 4,
      order: 1
    },
    'cave-of-secrets': {
      name: 'Cave of Secrets',
      scenes: [
      'vakratunda-mahakaya', 
      'suryakoti-samaprabha', 
      'nirvighnam-kurumedeva',
      'sarvakaryeshu-sarvada',
      'final-meaning-scene'
    ],    
      totalScenes: 5,
      order: 2
    },
      'shloka-river': {
    name: 'Shloka River',
    scenes: ['vakratunda-grove', 'suryakoti-bank', 'nirvighnam-chant', 'sarvakaryeshu-chant', 'shloka-river-finale'],
    totalScenes: 5,
    order: 3
  },
   'festival-square': {
  name: 'Festival Square',
  scenes: ['festival-piano', 'festival-rangoli', 'festival-cooking', 'festival-mandap'],
  totalScenes: 4,
  order: 4
},
    'about-me-hut': {
      name: 'About Me Hut',
      scenes: ['game1', 'game2', 'game3', 'game4'],
      totalScenes: 4,
      order: 5
    }
  };

static SCENE_METADATA = {
  'modak': { name: 'Modak Forest Adventure', maxStars: 8, order: 1 },
  'pond': { name: 'Sacred Pond Discovery', maxStars: 5, order: 2 },
  'symbol': { name: 'Ancient Temple Mystery', maxStars: 6, order: 3 },
  'final-scene': { name: 'Magical Garden Quest', maxStars: 7, order: 4 },
  
  // ✅ ADD: Cave of Secrets scenes (MISSING!)
  'vakratunda-mahakaya': { name: 'Vakratunda Mahakaya', maxStars: 8, order: 1 },
  'suryakoti-samaprabha': { name: 'Surya Koti Samaprabha', maxStars: 8, order: 2 },
  'nirvighnam-kurumedeva': { name: 'Nirvighnam Kurume Deva', maxStars: 8, order: 3 },
  'sarvakaryeshu-sarvada': { name: 'Sarvakaryeshu Sarvada', maxStars: 8, order: 4 },
  'final-meaning-scene': { name: 'Memory Match Finale', maxStars: 8, order: 5 },
  
  // About Me Hut scenes
  'game1': { name: 'Family Tree', maxStars: 4, order: 1 },
  'game2': { name: 'My Favorite Things', maxStars: 2, order: 2 },
  'game3': { name: 'Obstacle Remover', maxStars: 3, order: 3 },
  'game4': { name: 'Name & Birthday', maxStars: 2, order: 4 },
  
  'crystal-cave': { name: 'Crystal Cave Exploration', maxStars: 5, order: 1 },
  'treasure-chamber': { name: 'Treasure Chamber Adventure', maxStars: 6, order: 2 },
  
  // Shloka River scenes (already present)
  'vakratunda-grove': { name: 'Vakratunda Grove', maxStars: 5, order: 1 },
  'suryakoti-bank': { name: 'Suryakoti Bank', maxStars: 5, order: 2 },
  'nirvighnam-chant': { name: 'Nirvighnam Chant', maxStars: 5, order: 3 },
  'sarvakaryeshu-chant': { name: 'Sarvakaryeshu Chant', maxStars: 5, order: 4 },
  'shloka-river-finale': { name: 'Shloka River Finale', maxStars: 6, order: 5 },
  
  // Festival Square scenes
  'festival-piano': { name: 'Festival Piano', maxStars: 6, order: 1 },
  'festival-rangoli': { name: 'Rangoli Art Booth', maxStars: 6, order: 2 },
  'festival-cooking': { name: 'Modak Cooking', maxStars: 6, order: 3 },
  'festival-mandap': { name: 'Mandap Decoration', maxStars: 6, order: 4 }
};

  // 📊 GET ZONE PROGRESS - Primary function for Zone Welcome screens
  static calculateZoneProgress(profileId, zoneId) {
    console.log(`📊 ProgressManager: Calculating zone progress for ${profileId}/${zoneId}`);
    
    
    try {
      const zoneConfig = this.ZONE_CONFIG[zoneId];
      if (!zoneConfig) {
        console.error(`❌ Unknown zone: ${zoneId}`);
        return { completedScenes: 0, totalScenes: 4, totalStars: 0, sceneProgress: [] };
      }

      const progressKey = `${profileId}_gameProgress`;
      const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      const zoneData = progressData.zones?.[zoneId] || {};
      const scenes = zoneData.scenes || {};
      
      let completedScenes = 0;
      let totalStars = 0;
      const sceneProgress = [];
      
      // Calculate progress for each scene in order
      zoneConfig.scenes.forEach((sceneId, index) => {
        const sceneData = scenes[sceneId] || {};
        const sceneMetadata = this.SCENE_METADATA[sceneId] || { name: sceneId, maxStars: 5, order: index + 1 };
        
        const isCompleted = sceneData.completed === true;
        const stars = sceneData.stars || 0;
        
        if (isCompleted) {
          completedScenes++;
        }
        
        totalStars += stars;
        
        sceneProgress.push({
          sceneId,
          name: sceneMetadata.name,
          order: sceneMetadata.order,
          completed: isCompleted,
          stars: stars,
          maxStars: sceneMetadata.maxStars,
          unlocked: sceneData.unlocked || isCompleted || index === 0, // First scene always unlocked
          lastPlayed: sceneData.lastPlayed || null
        });
      });
      
      const result = {
        zoneId,
        zoneName: zoneConfig.name,
        completedScenes,
        totalScenes: zoneConfig.totalScenes,
        totalStars,
        maxStarsInZone: zoneConfig.scenes.reduce((sum, sceneId) => {
          return sum + (this.SCENE_METADATA[sceneId]?.maxStars || 5);
        }, 0),
        sceneProgress,
        completionPercentage: Math.round((completedScenes / zoneConfig.totalScenes) * 100)
      };
      
      console.log(`✅ Zone progress calculated:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Error calculating zone progress:`, error);
      return { completedScenes: 0, totalScenes: 4, totalStars: 0, sceneProgress: [] };
    }
  }

  

  // 👤 GET PROFILE STATS - Primary function for Personal Dashboard
  static getProfileStats(profileId) {
    console.log(`👤 ProgressManager: Calculating profile stats for ${profileId}`);
    
    try {
      // Get profile basic info
      const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
      const profile = gameProfiles.profiles[profileId];
      
      if (!profile) {
        console.error(`❌ Profile not found: ${profileId}`);
        return { totalStars: 0, completedScenes: 0, zonesUnlocked: 1, achievements: [] };
      }
      
      // Calculate comprehensive stats across all zones
      const progressKey = `${profileId}_gameProgress`;
      const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      let totalStars = 0;
      let totalCompletedScenes = 0;
      let zonesUnlocked = 1; // Symbol Mountain always unlocked
      const zoneStats = {};
      const achievements = [];
      
      // Calculate stats for each zone
      Object.keys(this.ZONE_CONFIG).forEach(zoneId => {
        const zoneProgress = this.calculateZoneProgress(profileId, zoneId);
        
        zoneStats[zoneId] = {
          name: zoneProgress.zoneName,
          completedScenes: zoneProgress.completedScenes,
          totalScenes: zoneProgress.totalScenes,
          stars: zoneProgress.totalStars,
          completionPercentage: zoneProgress.completionPercentage
        };
        
        totalStars += zoneProgress.totalStars;
        totalCompletedScenes += zoneProgress.completedScenes;
        
        // Zone unlock logic (complete previous zone to unlock next)
        if (zoneProgress.completedScenes === zoneProgress.totalScenes && zoneId !== 'festival-square') {
          zonesUnlocked = Math.max(zonesUnlocked, this.ZONE_CONFIG[zoneId].order + 1);
        }
        
        // Generate achievements
        if (zoneProgress.completedScenes > 0) {
          achievements.push(`${zoneProgress.zoneName} Explorer`);
        }
        if (zoneProgress.completedScenes === zoneProgress.totalScenes) {
          achievements.push(`${zoneProgress.zoneName} Master`);
        }
      });
      
      // Special achievements
      if (totalStars >= 10) achievements.push('Star Collector');
      if (totalStars >= 25) achievements.push('Stellar Explorer');
      if (totalStars >= 50) achievements.push('Cosmic Master');
      if (totalCompletedScenes >= 5) achievements.push('Scene Specialist');
      if (zonesUnlocked >= 3) achievements.push('Zone Walker');
      
      const result = {
        profileId,
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        totalStars,
        completedScenes: totalCompletedScenes,
        zonesUnlocked,
        zoneStats,
        achievements: [...new Set(achievements)], // Remove duplicates
        lastPlayed: profile.lastPlayed,
        createdAt: profile.createdAt,
        
        // Quick stats for display
        displayStats: {
          primaryStat: `${totalStars} stars collected`,
          secondaryStat: `${totalCompletedScenes} scenes completed`,
          achievements: achievements.slice(0, 3) // Top 3 for display
        }
      };
      
      console.log(`✅ Profile stats calculated:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Error calculating profile stats:`, error);
      return { totalStars: 0, completedScenes: 0, zonesUnlocked: 1, achievements: [] };
    }
  }

  // 💾 UPDATE SCENE COMPLETION - Unified save function
  static updateSceneCompletion(profileId, zoneId, sceneId, completionData) {
    console.log(`💾 ProgressManager: Updating scene completion`, {
      profileId, zoneId, sceneId, completionData
    });
    
    try {
      const timestamp = Date.now();
      
      // 1. Update game progress data
      const progressKey = `${profileId}_gameProgress`;
      const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      // Initialize structure if needed
      if (!progressData.zones) progressData.zones = {};
      if (!progressData.zones[zoneId]) progressData.zones[zoneId] = { scenes: {} };
      if (!progressData.zones[zoneId].scenes) progressData.zones[zoneId].scenes = {};
      
      // Update scene data
      progressData.zones[zoneId].scenes[sceneId] = {
        ...progressData.zones[zoneId].scenes[sceneId], // Preserve existing data
        completed: completionData.completed || true,
        stars: completionData.stars || 0,
        symbols: completionData.symbols || {},

  // ✅ ADD THESE LINES - Save chant data for all zones
  chants: completionData.chants || {},           // Generic chants
  mantras: completionData.mantras || {},         // Symbol Mountain mantras
  sanskritWords: completionData.sanskritWords || {}, // Cave Sanskrit words
  learnedChants: completionData.learnedChants || {}, // Alternative format

    // ✅ ADD THESE MISSING LINES - Shloka River specific data
  syllables: completionData.syllables || {},     // 🎯 MISSING - Shloka River syllables
  words: completionData.words || {},             // 🎯 MISSING - Shloka River words
  chantedVerses: completionData.chantedVerses || {},  // 🎯 Shloka River chanted verses

        completedAt: timestamp,
        lastPlayed: timestamp
      };
      
      // Auto-unlock next scene in same zone
      const zoneConfig = this.ZONE_CONFIG[zoneId];
      if (zoneConfig) {
        const sceneIndex = zoneConfig.scenes.indexOf(sceneId);
        const nextSceneId = zoneConfig.scenes[sceneIndex + 1];
        
        if (nextSceneId && !progressData.zones[zoneId].scenes[nextSceneId]) {
          progressData.zones[zoneId].scenes[nextSceneId] = { unlocked: true };
          console.log(`🔓 Auto-unlocked next scene: ${nextSceneId}`);
        }
      }
      
      // Recalculate zone totals
      const zoneProgress = this.calculateZoneProgress(profileId, zoneId);
      progressData.zones[zoneId].totalStars = zoneProgress.totalStars;
      progressData.zones[zoneId].completedScenes = zoneProgress.completedScenes;

      let totalStarsAllZones = 0;
let totalCompletedScenesAllZones = 0;

Object.keys(this.ZONE_CONFIG).forEach(zId => {
  const zProgress = this.calculateZoneProgress(profileId, zId);
  totalStarsAllZones += zProgress.totalStars;
  totalCompletedScenesAllZones += zProgress.completedScenes;
});

progressData.totalStars = totalStarsAllZones;
progressData.completedScenes = totalCompletedScenesAllZones;
// ✅ END OF NEW LINES

      
      // Save updated progress
      localStorage.setItem(progressKey, JSON.stringify(progressData));
      
      // 2. Update profile summary stats
      const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
      if (gameProfiles.profiles[profileId]) {
        const profileStats = this.getProfileStats(profileId);
        
        gameProfiles.profiles[profileId].totalStars = profileStats.totalStars;
        gameProfiles.profiles[profileId].completedScenes = profileStats.completedScenes;
        gameProfiles.profiles[profileId].lastPlayed = timestamp;
        
        localStorage.setItem('gameProfiles', JSON.stringify(gameProfiles));
      }
      
      // 3. Update scene state (for reload/resume) AND for SceneManager compatibility
const sceneStateKey = `${zoneId}_${sceneId}_state`;
const sceneState = JSON.parse(localStorage.getItem(sceneStateKey) || '{}');
sceneState.completed = true;
sceneState.stars = completionData.stars || 0;
sceneState.progress = {
  percentage: 100,
  starsEarned: completionData.stars || 0,
  completed: true
};
localStorage.setItem(sceneStateKey, JSON.stringify(sceneState));

// ✅ CRITICAL FIX: Also save to the profile-specific progress structure that calculateZoneProgress expects
const profileProgressKey = `${profileId}_gameProgress`;
let profileProgress = JSON.parse(localStorage.getItem(profileProgressKey) || '{}');

// Initialize structure if needed
if (!profileProgress.zones) profileProgress.zones = {};
if (!profileProgress.zones[zoneId]) profileProgress.zones[zoneId] = { scenes: {} };
if (!profileProgress.zones[zoneId].scenes) profileProgress.zones[zoneId].scenes = {};

// Add this line BEFORE line 352
console.log('🔥 PROGRESS MANAGER RECEIVED:', {
  zoneId,
  sceneId,
  chantedVerses: completionData.chantedVerses
});

// Update the scene data that calculateZoneProgress will read
profileProgress.zones[zoneId].scenes[sceneId] = {
  ...profileProgress.zones[zoneId].scenes[sceneId], // Preserve existing data
  completed: completionData.completed || true,
  stars: completionData.stars || 0,
  symbols: completionData.symbols || {},

    // ✅ ADD THESE LINES - Dual save for chant data
  chants: completionData.chants || {},
  mantras: completionData.mantras || {},
  sanskritWords: completionData.sanskritWords || {},
  learnedChants: completionData.learnedChants || {},

    // ✅ ADD THESE MISSING LINES - Shloka River specific data
  syllables: completionData.syllables || {},     // 🎯 MISSING - Shloka River syllables
  words: completionData.words || {},             // 🎯 MISSING - Shloka River words
  chantedVerses: completionData.chantedVerses || {},  // ← ADD THIS
  completedAt: Date.now(),
  lastPlayed: Date.now(),
  unlocked: true
};

// Save the updated profile progress
localStorage.setItem(profileProgressKey, JSON.stringify(profileProgress));
console.log(`✅ DUAL SAVE: Scene completion saved to both ${sceneStateKey} AND ${profileProgressKey}`);
      
      console.log(`✅ Scene completion saved successfully`);
      
      // Return updated zone progress for immediate UI updates
      return this.calculateZoneProgress(profileId, zoneId);
      
    } catch (error) {
      console.error(`❌ Error updating scene completion:`, error);
      throw error;
    }
  }

  // 🔓 CHECK SCENE UNLOCK STATUS
  static isSceneUnlocked(profileId, zoneId, sceneId) {
    try {
      const zoneProgress = this.calculateZoneProgress(profileId, zoneId);
      const sceneProgress = zoneProgress.sceneProgress.find(s => s.sceneId === sceneId);
      return sceneProgress?.unlocked || false;
    } catch (error) {
      console.error(`❌ Error checking scene unlock:`, error);
      return false;
    }
  }

  // 🔄 SYNC PROFILE DATA - Fix any inconsistencies
  static syncProfileData(profileId) {
    console.log(`🔄 ProgressManager: Syncing profile data for ${profileId}`);
    
    try {
      // Recalculate all stats and ensure consistency
      const profileStats = this.getProfileStats(profileId);
      
      // Update profile summary with calculated stats
      const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
      if (gameProfiles.profiles[profileId]) {
        gameProfiles.profiles[profileId].totalStars = profileStats.totalStars;
        gameProfiles.profiles[profileId].completedScenes = profileStats.completedScenes;
        localStorage.setItem('gameProfiles', JSON.stringify(gameProfiles));
      }
      
      console.log(`✅ Profile data synced successfully`);
      return profileStats;
      
    } catch (error) {
      console.error(`❌ Error syncing profile data:`, error);
      throw error;
    }
  }

  // 🏆 GET ACHIEVEMENTS - For display in celebrations
  static getAchievements(profileId) {
    const profileStats = this.getProfileStats(profileId);
    return profileStats.achievements || [];
  }

  // 📈 GET PROGRESS SUMMARY - Quick stats for any component
  static getProgressSummary(profileId, zoneId = null) {
    if (zoneId) {
      // Zone-specific summary
      const zoneProgress = this.calculateZoneProgress(profileId, zoneId);
      return {
        type: 'zone',
        primary: `${zoneProgress.completedScenes}/${zoneProgress.totalScenes} scenes`,
        secondary: `${zoneProgress.totalStars} stars`,
        percentage: zoneProgress.completionPercentage
      };
    } else {
      // Overall profile summary
      const profileStats = this.getProfileStats(profileId);
      return {
        type: 'profile',
        primary: `${profileStats.totalStars} stars`,
        secondary: `${profileStats.completedScenes} scenes`,
        achievements: profileStats.displayStats.achievements
      };
    }
  }

  // 🧹 UTILITY: Clear all progress (for testing)
  static clearAllProgress(profileId) {
    console.warn(`🧹 Clearing all progress for ${profileId}`);
    
    const progressKey = `${profileId}_gameProgress`;
    localStorage.removeItem(progressKey);
    
    // Clear individual scene states
    Object.keys(this.ZONE_CONFIG).forEach(zoneId => {
      this.ZONE_CONFIG[zoneId].scenes.forEach(sceneId => {
        const sceneStateKey = `${zoneId}_${sceneId}_state`;
        localStorage.removeItem(sceneStateKey);
      });
    });
    
    // Reset profile stats
    const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
    if (gameProfiles.profiles[profileId]) {
      gameProfiles.profiles[profileId].totalStars = 0;
      gameProfiles.profiles[profileId].completedScenes = 0;
      localStorage.setItem('gameProfiles', JSON.stringify(gameProfiles));
    }
  }

  // 🔍 DEBUG: Get all raw data for debugging
  static getDebugData(profileId) {
    const progressKey = `${profileId}_gameProgress`;
    const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
    const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
    
    return {
      profileData: gameProfiles.profiles[profileId],
      progressData: progressData,
      calculatedStats: this.getProfileStats(profileId),
      zoneProgress: Object.keys(this.ZONE_CONFIG).reduce((acc, zoneId) => {
        acc[zoneId] = this.calculateZoneProgress(profileId, zoneId);
        return acc;
      }, {})
    };
  }
}

export default ProgressManager;