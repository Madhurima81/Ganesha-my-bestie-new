// GameStateManager.js - Updated with Zone Progress Accumulation Fix

class GameStateManager {
  constructor() {
    this.currentZone = null;
    this.currentScene = null;
    this.activeProfileId = null;
    this.initializeProfiles();
  }

static ZONES = {
  'symbol-mountain': {
    id: 1,
    name: 'Symbol Mountain',
    icon: '🏔️',
    scenes: ['modak', 'pond', 'symbol', 'final-scene']
  },
  'cave-of-secrets': {
    id: 2,
    name: 'Cave of Secrets',
    icon: '🌈',
    scenes: [
      'vakratunda-mahakaya', 
      'suryakoti-samaprabha', 
      'nirvighnam-kurumedeva',
      'sarvakaryeshu-sarvada',
      'final-meaning-scene'
    ]
  },
  'shloka-river': {
    id: 3,
    name: 'Shloka River',
    icon: '🌊',
    scenes: ['vakratunda-grove', 'suryakoti-bank', 'nirvighnam-chant', 'sarvakaryeshu-chant', 'shloka-river-finale']
  },
  // ✅ ADD: Festival Square - Fun Games Zone
  'festival-square': {
    id: 4,
    name: 'Festival Square',
    icon: '🎉',
    scenes: ['game1', 'game2', 'game3', 'game4']
  },
  'about-me-hut': {
    id: 5,
    name: 'About Me Hut',
    icon: '🏡',
    scenes: ['game1', 'game2', 'game3', 'game4']
  }
  // ✅ REMOVE: All the placeholder zones (ocean-depths, sky-kingdom, etc.)
};

  // Profile colors and avatars for kids
  static PROFILE_AVATARS = ['🦁', '🐧', '🦊', '🐼', '🦝', '🐯', '🐨', '🦉'];
  static PROFILE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#DDA0DD', '#98FB98', '#FFB6C1'];

  // Initialize profile system
  initializeProfiles() {
    const profiles = this.getProfiles();
    if (!profiles || !profiles.profiles) {
      // First time setup
      const initialProfiles = {
        profiles: {},
        lastUpdated: Date.now()
      };
      localStorage.setItem('gameProfiles', JSON.stringify(initialProfiles));
    }

    // Get active profile from localStorage
    this.activeProfileId = localStorage.getItem('activeProfileId');
  }

  // Get all profiles - FIXED to always return valid structure
  getProfiles() {
    const saved = localStorage.getItem('gameProfiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing profiles:', e);
        // Return default structure on parse error
        return {
          profiles: {},
          lastUpdated: Date.now()
        };
      }
    }
    // Return default structure instead of null
    return {
      profiles: {},
      lastUpdated: Date.now()
    };
  }

 

  // 🔧 FIXED: Create a new profile - now accepts direct avatar and color values
  createProfile(name, avatar, color) {
    console.log('🎯 GameStateManager.createProfile called with:', { name, avatar, color });
    
    let profiles = this.getProfiles();
    
    // Ensure profiles has the correct structure
    if (!profiles || !profiles.profiles) {
      profiles = {
        profiles: {},
        lastUpdated: Date.now()
      };
    }
    
    // Check if we already have 4 profiles
    const profileCount = Object.keys(profiles.profiles).length;
    if (profileCount >= 4) {
      console.error('Maximum of 4 profiles allowed');
      return null;
    }

    // Generate unique ID
    const profileId = `profile_${Date.now()}`;
    
    // 🔧 FIXED: Use avatar and color directly instead of array indices
    const newProfile = {
      id: profileId,
      name: name.substring(0, 12), // Limit name length for UI
      avatar: avatar || '🦉', // Use the passed avatar directly (emoji or animal ID)
      color: color || '#8B4513', // Use the passed color directly
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      totalStars: 0,
      completedScenes: 0,
      currentZone: 'symbol-mountain',
      currentScene: 'modak'  // ✅ FIXED: Start with modak (first scene)
    };

    console.log('🎯 Creating new profile:', newProfile);

    // Add to profiles
    profiles.profiles[profileId] = newProfile;
    profiles.lastUpdated = Date.now();
    
    // Save
    localStorage.setItem('gameProfiles', JSON.stringify(profiles));
    console.log('🎯 Profile saved to localStorage');
    
    // Set as active profile
    this.setActiveProfile(profileId);
    
    // Initialize game progress for this profile
    this.initializeProfileProgress(profileId);
    
    console.log('🎯 Profile creation complete, returning:', newProfile);
    return newProfile;
  }

  // Initialize game progress for a new profile
  initializeProfileProgress(profileId) {
    const progress = {
      totalStars: 0,
      completedScenes: 0,
      currentZone: 'symbol-mountain',
      currentScene: 'modak',  // ✅ FIXED: Start with modak
      zones: {}
    };
    
    // Initialize all zones and scenes
    Object.entries(GameStateManager.ZONES).forEach(([zoneId, zone]) => {
      progress.zones[zoneId] = {
        unlocked: zoneId === 'symbol-mountain', // Only first zone unlocked initially
        stars: 0,
        completed: false,
        scenes: {}
      };
      
      zone.scenes.forEach((sceneId, index) => {
        progress.zones[zoneId].scenes[sceneId] = {
          completed: false,
          stars: 0,
          symbols: {},
          lastPlayed: null,
    unlocked: index === 0 || zoneId === 'festival-square'  // ✅ ADD: All Festival Square games unlocked
        };
      });
    });
    
    localStorage.setItem(`${profileId}_gameProgress`, JSON.stringify(progress));
  }

  // ✅ NEW: Disney/PBS Auto-Unlock System
  unlockNextScene(zoneId, completedSceneId) {
    console.log('🔓 DISNEY AUTO-UNLOCK: Unlocking next scene after', completedSceneId);
    
    const progress = this.getGameProgress();
    const zone = GameStateManager.ZONES[zoneId];
    
    if (!zone || !zone.scenes) {
      console.log('❌ Zone not found:', zoneId);
      return null;
    }
    
    const sceneIndex = zone.scenes.indexOf(completedSceneId);
    const nextSceneId = zone.scenes[sceneIndex + 1];
    
    if (nextSceneId) {
      // ✅ DISNEY MAGIC: Auto-unlock next scene
      if (!progress.zones[zoneId].scenes[nextSceneId]) {
        progress.zones[zoneId].scenes[nextSceneId] = {
          completed: false,
          stars: 0,
          symbols: {},
          lastPlayed: null,
          unlocked: false
        };
      }
      
      // Set explicit unlock flag
      progress.zones[zoneId].scenes[nextSceneId].unlocked = true;
      
      // Save updated progress
      localStorage.setItem(`${this.activeProfileId}_gameProgress`, JSON.stringify(progress));
      
      console.log('✅ DISNEY: Next scene unlocked:', nextSceneId);
      return nextSceneId;
    } else {
      console.log('🏁 DISNEY: Last scene in zone completed - no next scene');
      
      // ✅ BONUS: Check if we should unlock next zone
      const allZones = Object.keys(GameStateManager.ZONES);
      const currentZoneIndex = allZones.indexOf(zoneId);
      const nextZoneId = allZones[currentZoneIndex + 1];
      
      if (nextZoneId) {
        // Check if all scenes in current zone are completed
        const currentZoneScenes = zone.scenes;
        const allCompleted = currentZoneScenes.every(sceneId => {
          return progress.zones[zoneId].scenes[sceneId]?.completed;
        });
        
        if (allCompleted) {
          console.log('🎉 DISNEY: Unlocking next zone:', nextZoneId);
          progress.zones[nextZoneId].unlocked = true;
          
          // Unlock first scene in next zone
          const firstSceneInNextZone = GameStateManager.ZONES[nextZoneId].scenes[0];
          if (firstSceneInNextZone) {
            progress.zones[nextZoneId].scenes[firstSceneInNextZone].unlocked = true;
          }
          
          localStorage.setItem(`${this.activeProfileId}_gameProgress`, JSON.stringify(progress));
          return nextZoneId;
        }
      }
      
      return null;
    }
  }

  // ✅ ENHANCED: Better scene unlock checking
  isSceneUnlocked(zoneId, sceneId) {
    const progress = this.getGameProgress();
    if (!progress.zones || !progress.zones[zoneId]) return false;
    
    const zone = progress.zones[zoneId];
    if (!zone || !zone.unlocked) return false;
    
    const zoneScenes = GameStateManager.ZONES[zoneId].scenes;
    
    // First scene is always unlocked
    if (sceneId === zoneScenes[0]) return true;
    
    // Check explicit unlock flag (Disney system)
    const sceneData = zone.scenes && zone.scenes[sceneId];
    if (sceneData && sceneData.unlocked === true) {
      console.log(`🔓 DISNEY: Scene ${sceneId} explicitly unlocked`);
      return true;
    }
    
    // Fallback: Check if previous scene is completed
    const sceneIndex = zoneScenes.indexOf(sceneId);
    if (sceneIndex > 0) {
      const previousScene = zoneScenes[sceneIndex - 1];
      const previousCompleted = zone.scenes && zone.scenes[previousScene] && zone.scenes[previousScene].completed;
      
      console.log(`🔍 DISNEY: Checking ${sceneId} unlock via previous scene ${previousScene}:`, previousCompleted);
      return previousCompleted || false;
    }
    
    return false;
  }

  // Set active profile - FIXED to handle missing profiles
  setActiveProfile(profileId) {
    this.activeProfileId = profileId;
    localStorage.setItem('activeProfileId', profileId);
    
    // Update last played time
    const profiles = this.getProfiles();
    if (profiles && profiles.profiles && profiles.profiles[profileId]) {
      profiles.profiles[profileId].lastPlayed = Date.now();
      localStorage.setItem('gameProfiles', JSON.stringify(profiles));
    }
  }

  // Get current active profile - FIXED null checks
  getCurrentProfile() {
    if (!this.activeProfileId) return null;
    
    const profiles = this.getProfiles();
    if (profiles && profiles.profiles) {
      return profiles.profiles[this.activeProfileId] || null;
    }
    return null;
  }

  // Delete a profile (with all its data) - FIXED null checks
  deleteProfile(profileId) {
    const profiles = this.getProfiles();
    
    if (!profiles || !profiles.profiles || !profiles.profiles[profileId]) {
      console.error('Profile not found');
      return false;
    }
    
    // Delete profile
    delete profiles.profiles[profileId];
    profiles.lastUpdated = Date.now();
    localStorage.setItem('gameProfiles', JSON.stringify(profiles));
    
    // Delete all game data for this profile
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(profileId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
    
    // If this was the active profile, clear it
    if (this.activeProfileId === profileId) {
      this.activeProfileId = null;
      localStorage.removeItem('activeProfileId');
    }
    
    return true;
  }

// 🎮 HYBRID: Clean up replay sessions when starting fresh replay
clearReplaySession(zoneId, sceneId) {
  if (!this.activeProfileId) return;
  
  const replaySessionKey = `replay_session_${this.activeProfileId}_${zoneId}_${sceneId}`;
  localStorage.removeItem(replaySessionKey);
  console.log('🧹 HYBRID: Cleared replay session for fresh start');
}

  // Update profile stats - FIXED null checks
  updateProfileStats(stars, completedScenes) {
    const profile = this.getCurrentProfile();
    if (!profile) return;
    
    const profiles = this.getProfiles();
    if (profiles && profiles.profiles && profiles.profiles[this.activeProfileId]) {
      profiles.profiles[this.activeProfileId].totalStars = stars;
      profiles.profiles[this.activeProfileId].completedScenes = completedScenes;
      profiles.profiles[this.activeProfileId].lastPlayed = Date.now();
      
      localStorage.setItem('gameProfiles', JSON.stringify(profiles));
    }
  }

  saveGameState(zoneId, sceneId, sceneState) {
 // 🔍 ENHANCED DEBUG - Track all calls and detect overwrites
  console.log('🔍 SAVESTATE CALL:', { 
    zoneId, 
    sceneId, 
    sceneState,
    completed: sceneState.completed,
    stars: sceneState.stars,
    caller: new Error().stack.split('\n')[2]?.trim() // Shows WHO called this function
  });
  
  // 🚨 DETECT OVERWRITES - Alert if someone tries to save with 0 stars after completion
  if (sceneState.stars === 0 && sceneState.completed === false) {
    console.warn('🚨 POTENTIAL OVERWRITE DETECTED:', {
      scene: `${zoneId}/${sceneId}`,
      data: sceneState,
      caller: new Error().stack.split('\n')[2]?.trim()
    });
  }

  if (!this.activeProfileId) {
    console.error('No active profile selected');
    return;
  }
  
  console.log('💾 SAVING GAME STATE:', { zoneId, sceneId, sceneState });
  
  const gameProgress = this.getGameProgress();
  // 🚫 OVERWRITE PROTECTION: Check if we're trying to overwrite a completed scene
const existingScene = gameProgress.zones?.[zoneId]?.scenes?.[sceneId];

if (existingScene && existingScene.completed && 
    (!sceneState.completed || sceneState.stars === 0)) {
  console.warn('🚫 BLOCKED OVERWRITE: Preventing overwrite of completed scene:', {
    scene: `${zoneId}/${sceneId}`,
    existing: { completed: existingScene.completed, stars: existingScene.stars },
    attempted: { completed: sceneState.completed, stars: sceneState.stars }
  });
  return; // 🚫 BLOCK THE SAVE!
}
  
  // ✅ 1. Save specific scene state with profile ID
  const sceneKey = `${this.activeProfileId}_${zoneId}_${sceneId}_state`;
  localStorage.setItem(sceneKey, JSON.stringify({
    ...sceneState,
    lastSaved: Date.now()
  }));
  
  // ✅ 2. Initialize zone structure if needed
  if (!gameProgress.zones) gameProgress.zones = {};
  if (!gameProgress.zones[zoneId]) {
    gameProgress.zones[zoneId] = {
      unlocked: true,
      stars: 0,
      completed: false,
      scenes: {}
    };
  }
  if (!gameProgress.zones[zoneId].scenes) {
    gameProgress.zones[zoneId].scenes = {};
  }
  
  // ✅ 3. Update scene data while preserving existing properties
  //const existingScene = gameProgress.zones[zoneId].scenes[sceneId] || {};

gameProgress.zones[zoneId].scenes[sceneId] = {
  // Only preserve the unlocked flag from existing data
  unlocked: existingScene.unlocked || false,
  
  // Use NEW data for everything else
  completed: sceneState.completed || false,
  stars: sceneState.stars || 0,
  symbols: sceneState.symbols || {},
  lastPlayed: Date.now(),
  completedAt: sceneState.completed ? Date.now() : null
};
  
  console.log('💾 CUMULATIVE: Scene data updated:', gameProgress.zones[zoneId].scenes[sceneId]);
  
  // ✅ 4. FIXED: Calculate totals for ALL zones (not just current zone)
  let totalStars = 0;
  let totalCompletedScenes = 0;
  
  // Recalculate each zone's totals first
  Object.entries(gameProgress.zones).forEach(([currentZoneId, zone]) => {
    if (!zone.scenes) return;
    
    let zoneStars = 0;
    let zoneCompletedScenes = 0;
    
    Object.values(zone.scenes).forEach(scene => {
      zoneStars += scene.stars || 0;
      if (scene.completed) {
        zoneCompletedScenes++;
      }
    });
    
    // Update this zone's totals
    zone.stars = zoneStars;
    zone.completed = zoneCompletedScenes === Object.keys(zone.scenes).length;
    
    // Add to overall totals
    totalStars += zoneStars;
    totalCompletedScenes += zoneCompletedScenes;
    
    console.log(`📊 CUMULATIVE: Zone ${currentZoneId} totals:`, {
      stars: zoneStars,
      completedScenes: zoneCompletedScenes,
      totalScenes: Object.keys(zone.scenes).length
    });
  });
  
  // ✅ 5. Update overall totals
  gameProgress.totalStars = totalStars;
  gameProgress.completedScenes = totalCompletedScenes;
  
  console.log('✅ CUMULATIVE SAVE SUCCESS:', {
    scene: `${zoneId}/${sceneId}`,
    sceneStars: sceneState.stars || 0,
    zoneTotalStars: gameProgress.zones[zoneId].stars,
    profileTotalStars: totalStars,
    profileTotalCompleted: totalCompletedScenes
  });
  
  // ✅ 6. Auto-unlock next scene if this scene was completed
  if (sceneState.completed) {
    console.log('🔓 Scene completed, checking auto-unlock...');
    this.unlockNextScene(zoneId, sceneId);
  }
  
  // ✅ 7. Update current location
  gameProgress.currentZone = zoneId;
  gameProgress.currentScene = sceneId;
  
  // ✅ 8. Save updated progress
  localStorage.setItem(`${this.activeProfileId}_gameProgress`, JSON.stringify(gameProgress));
  
  // ✅ 9. Update profile summary stats
  this.updateProfileStats(gameProgress.totalStars, gameProgress.completedScenes);

  // 🚫 TEMPORARILY DISABLE OUR BULLETPROOF SYSTEMS
  this.backupProgress();

// ✅ BULLETPROOF: Validate after every save
 const validation = this.validateProgress();
if (!validation.valid) {
 console.error('🚨 PROGRESS CORRUPTION DETECTED after save:', validation.issues);
  const recovered = this.autoRecovery(validation);
}

if (sceneState.completed && sceneState.stars > 0) {
 this.logCompletion(zoneId, sceneId, sceneState.stars, sceneState.symbols);
}

  
  return gameProgress;
}

// Add this method to GameStateManager.js class, after the saveGameState method:

// ✅ BULLETPROOF: Progress validation for 20+ scenes
validateProgress() {
  console.log('🔍 VALIDATION: Checking progress integrity...');
  
  const progress = this.getGameProgress();
  const issues = [];
  const warnings = [];
  
  // Check overall progress structure
  if (!progress.zones) {
    issues.push('Missing zones structure');
    return { valid: false, issues, warnings };
  }
  
  let totalCalculatedStars = 0;
  let totalCalculatedScenes = 0;
  
  // Validate each zone
  Object.entries(progress.zones).forEach(([zoneId, zone]) => {
    if (!zone.scenes) {
      warnings.push(`Zone ${zoneId}: Missing scenes structure`);
      return;
    }
    
    let zoneCalculatedStars = 0;
    let zoneCalculatedCompleted = 0;
    
    // Validate each scene in zone
    Object.entries(zone.scenes).forEach(([sceneId, scene]) => {
      // Critical validations
      if (scene.completed && (scene.stars === 0 || !scene.stars)) {
        issues.push(`${zoneId}/${sceneId}: Completed but has 0 stars`);
      }
      
      if (scene.stars > 0 && !scene.completed) {
        warnings.push(`${zoneId}/${sceneId}: Has stars but not marked completed`);
      }
      
      if (scene.completed && !scene.completedAt) {
        warnings.push(`${zoneId}/${sceneId}: Completed but missing timestamp`);
      }
      
      // Add to calculations
      zoneCalculatedStars += scene.stars || 0;
      if (scene.completed) {
        zoneCalculatedCompleted++;
        totalCalculatedScenes++;
      }
    });
    
    totalCalculatedStars += zoneCalculatedStars;
    
    // Validate zone totals
    if (zone.stars !== zoneCalculatedStars) {
      issues.push(`Zone ${zoneId}: Stored stars (${zone.stars}) != calculated stars (${zoneCalculatedStars})`);
    }
    
    if ((zone.completed || false) !== (zoneCalculatedCompleted === Object.keys(zone.scenes).length && Object.keys(zone.scenes).length > 0)) {
      warnings.push(`Zone ${zoneId}: Zone completion flag may be incorrect`);
    }
  });
  
  // Validate overall totals
  if (progress.totalStars !== totalCalculatedStars) {
    issues.push(`Overall: Stored total stars (${progress.totalStars}) != calculated total stars (${totalCalculatedStars})`);
  }
  
  if (progress.completedScenes !== totalCalculatedScenes) {
    issues.push(`Overall: Stored completed scenes (${progress.completedScenes}) != calculated completed scenes (${totalCalculatedScenes})`);
  }
  
  const isValid = issues.length === 0;
  
  console.log(`🔍 VALIDATION RESULT:`, {
    valid: isValid,
    issues: issues.length,
    warnings: warnings.length,
    totalStars: totalCalculatedStars,
    totalCompleted: totalCalculatedScenes
  });
  
  if (issues.length > 0) {
    console.error('🚨 VALIDATION FAILED:', issues);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ VALIDATION WARNINGS:', warnings);
  }
  
  return {
    valid: isValid,
    issues,
    warnings,
    calculatedTotals: {
      stars: totalCalculatedStars,
      completed: totalCalculatedScenes
    }
  };
}

// ✅ BULLETPROOF: Automatic backup system for 20+ scenes
backupProgress() {
  try {
    const progress = this.getGameProgress();
    const backup = {
      data: progress,
      timestamp: Date.now(),
      profile: this.activeProfileId,
      version: '1.0'
    };
    
    localStorage.setItem(`${this.activeProfileId}_backup`, JSON.stringify(backup));
    console.log('💾 BACKUP: Progress backed up successfully');
    return true;
  } catch (error) {
    console.error('🚨 BACKUP ERROR:', error);
    return false;
  }
}

// ✅ BULLETPROOF: Restore from backup if corruption detected
restoreFromBackup() {
  try {
    const backupData = localStorage.getItem(`${this.activeProfileId}_backup`);
    if (!backupData) {
      console.warn('⚠️ RESTORE: No backup found');
      return null;
    }
    
    const backup = JSON.parse(backupData);
    if (!backup.data || !backup.timestamp) {
      console.warn('⚠️ RESTORE: Invalid backup format');
      return null;
    }
    
    // Restore the backup
    localStorage.setItem(`${this.activeProfileId}_gameProgress`, JSON.stringify(backup.data));
    
    console.log('🔄 RESTORE: Progress restored from backup:', {
      timestamp: new Date(backup.timestamp).toLocaleString(),
      stars: backup.data.totalStars,
      completed: backup.data.completedScenes
    });
    
    return backup.data;
  } catch (error) {
    console.error('🚨 RESTORE ERROR:', error);
    return null;
  }
}

// ✅ BULLETPROOF: Auto-recovery system
autoRecovery(validationResult) {
  console.log('🔧 AUTO-RECOVERY: Attempting to fix corruption...');
  
  // Try to restore from backup first
  const backupRestored = this.restoreFromBackup();
  if (backupRestored) {
    // Validate the restored backup
    const revalidation = this.validateProgress();
    if (revalidation.valid) {
      console.log('✅ AUTO-RECOVERY: Successfully restored from backup');
      return true;
    }
  }
  
  // If backup fails, try to recalculate totals
  console.log('🔧 AUTO-RECOVERY: Attempting to recalculate totals...');
  const progress = this.getGameProgress();
  this.recalculateTotals(progress);
  localStorage.setItem(`${this.activeProfileId}_gameProgress`, JSON.stringify(progress));
  
  // Validate again
  const finalValidation = this.validateProgress();
  if (finalValidation.valid) {
    console.log('✅ AUTO-RECOVERY: Successfully recalculated totals');
    return true;
  }
  
  console.error('🚨 AUTO-RECOVERY: Failed to fix corruption automatically');
  return false;
}

// Add this method to GameStateManager.js class (after the backup methods):

// ✅ BULLETPROOF: Completion audit trail for 20+ scenes
logCompletion(zoneId, sceneId, stars, symbols = {}) {
  try {
    const log = JSON.parse(localStorage.getItem('completionLog') || '[]');
    
    const entry = {
      zone: zoneId,
      scene: sceneId,
      stars,
      symbols: Object.keys(symbols),
      timestamp: Date.now(),
      dateString: new Date().toLocaleString(),
      profile: this.activeProfileId,
      sessionId: Date.now() // Simple session tracking
    };
    
    log.push(entry);
    
    // Keep last 100 completions to avoid localStorage bloat
    if (log.length > 100) {
      log.splice(0, log.length - 100);
    }
    
    localStorage.setItem('completionLog', JSON.stringify(log));
    
    console.log('📊 COMPLETION LOGGED:', {
      scene: `${zoneId}/${sceneId}`,
      stars,
      totalCompletions: log.length,
      profile: this.activeProfileId
    });
    
    return true;
  } catch (error) {
    console.error('🚨 COMPLETION LOG ERROR:', error);
    return false;
  }
}

// ✅ BULLETPROOF: Get completion history for debugging
getCompletionHistory(profileId = null) {
  try {
    const log = JSON.parse(localStorage.getItem('completionLog') || '[]');
    
    if (profileId) {
      return log.filter(entry => entry.profile === profileId);
    }
    
    return log;
  } catch (error) {
    console.error('🚨 COMPLETION HISTORY ERROR:', error);
    return [];
  }
}

  // ✅ NEW: Recalculate zone totals properly
  recalculateZoneTotals(gameProgress, zoneId) {
    const zone = gameProgress.zones[zoneId];
    if (!zone || !zone.scenes) return;
    
    let zoneStars = 0;
    let zoneCompletedScenes = 0;
    const totalScenesInZone = Object.keys(zone.scenes).length;
    
    Object.values(zone.scenes).forEach(scene => {
      zoneStars += scene.stars || 0;
      if (scene.completed) {
        zoneCompletedScenes++;
      }
    });
    
    zone.stars = zoneStars;
    zone.completed = zoneCompletedScenes === totalScenesInZone && totalScenesInZone > 0;
    
    console.log(`📊 Zone ${zoneId} totals recalculated:`, {
      stars: zoneStars,
      completedScenes: zoneCompletedScenes,
      totalScenes: totalScenesInZone,
      isComplete: zone.completed
    });
  }

  // Updated get progress method with profile support
  getGameProgress() {
    if (!this.activeProfileId) {
      console.warn('No active profile, returning empty progress');
      return this.initializeEmptyProgress();
    }
    
    const saved = localStorage.getItem(`${this.activeProfileId}_gameProgress`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing game progress:', e);
        return this.initializeEmptyProgress();
      }
    }
    
    // Initialize new game progress for this profile
    this.initializeProfileProgress(this.activeProfileId);
    const newProgress = localStorage.getItem(`${this.activeProfileId}_gameProgress`);
    return newProgress ? JSON.parse(newProgress) : this.initializeEmptyProgress();
  }

  // Check if current profile has saved progress
  hasSavedProgress() {
    if (!this.activeProfileId) return false;
    
    const progress = this.getGameProgress();
    return progress && (progress.completedScenes > 0 || progress.totalStars > 0);
  }

  // Updated get scene state with profile support
  getSceneState(zoneId, sceneId) {
    if (!this.activeProfileId) return null;
    
    const sceneKey = `${this.activeProfileId}_${zoneId}_${sceneId}_state`;
    const saved = localStorage.getItem(sceneKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing scene state:', e);
        return null;
      }
    }
    return null;
  }

// Clear current scene tracking for map navigation
  clearCurrentScene() {
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      const locationKey = `${activeProfileId}_lastLocation`;
      localStorage.removeItem(locationKey);
      console.log('🧹 Cleared current scene tracking for map navigation');
    }
  }

  // Updated reset methods with profile support
  resetScene(zoneId, sceneId) {
    if (!this.activeProfileId) return;
    
    const sceneKey = `${this.activeProfileId}_${zoneId}_${sceneId}_state`;
    localStorage.removeItem(sceneKey);
    
    // Update overall progress
    const progress = this.getGameProgress();
    if (progress.zones && progress.zones[zoneId] && progress.zones[zoneId].scenes && progress.zones[zoneId].scenes[sceneId]) {
      progress.zones[zoneId].scenes[sceneId] = {
        completed: false,
        stars: 0,
        symbols: {},
        lastPlayed: null,
        unlocked: progress.zones[zoneId].scenes[sceneId].unlocked // Preserve unlock status
      };

      // Recalculate totals
      this.recalculateTotals(progress);
      localStorage.setItem(`${this.activeProfileId}_gameProgress`, JSON.stringify(progress));
    }
  }

/**
 * Clear scene state for fresh start (used when "Continue Adventure" from completion screen)
 * This only clears the mid-game state, NOT the completion progress
 */
clearSceneState(zoneId, sceneId) {
  if (!this.activeProfileId) return;
  
  // Clear ALL possible storage keys for this scene
  const profileId = this.activeProfileId;
  
  // 1. Regular scene state
  const sceneKey = `${profileId}_${zoneId}_${sceneId}_state`;
  localStorage.removeItem(sceneKey);
  
  // 2. Temp keys
  const tempKey = `${profileId}_${zoneId}_${sceneId}_temp`;
  localStorage.removeItem(tempKey);
  
  // 3. ✅ NEW: SceneManager's temp_session keys (THIS IS THE KEY ONE!)
  const tempSessionKey = `temp_session_${profileId}_${zoneId}_${sceneId}`;
  localStorage.removeItem(tempSessionKey);
  
  // 4. ✅ NEW: SceneManager's replay_session keys
  const replaySessionKey = `replay_session_${profileId}_${zoneId}_${sceneId}`;
  localStorage.removeItem(replaySessionKey);
  
  // 5. Clear from sessionStorage too
  sessionStorage.removeItem(sceneKey);
  sessionStorage.removeItem(tempKey);
  sessionStorage.removeItem(tempSessionKey);
  sessionStorage.removeItem(replaySessionKey);
  
  console.log(`🔄 Cleared ALL scene states for fresh start: ${zoneId}/${sceneId}`);
  console.log(`   - Cleared: ${sceneKey}`);
  console.log(`   - Cleared: ${tempKey}`);
  console.log(`   - Cleared: ${tempSessionKey}`);
  console.log(`   - Cleared: ${replaySessionKey}`);
  
  // NOTE: This does NOT clear completion status from gameProgress
  // Scene will still show as completed in zone map, but will start fresh when opened
}

  // Reset current profile's game
  resetGame() {
    if (!this.activeProfileId) return;
    
    // Clear all game data for current profile
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.activeProfileId) && key !== `${this.activeProfileId}_profileData`) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Initialize fresh game state for this profile
    this.initializeProfileProgress(this.activeProfileId);
    
    // Update profile stats
    this.updateProfileStats(0, 0);
  }

  // Get last played location for current profile
  getLastPlayedLocation() {
    const progress = this.getGameProgress();
    return {
      zone: progress.currentZone || 'symbol-mountain',
      scene: progress.currentScene || 'modak'  // ✅ FIXED: Default to modak
    };
  }

  // Helper method to get empty progress
  initializeEmptyProgress() {
    const progress = {
      totalStars: 0,
      completedScenes: 0,
      currentZone: 'symbol-mountain',
      currentScene: 'modak',  // ✅ FIXED: Default to modak
      zones: {}
    };
    
    // Initialize zone structure
    Object.entries(GameStateManager.ZONES).forEach(([zoneId, zone]) => {
      progress.zones[zoneId] = {
        unlocked: zoneId === 'symbol-mountain',
        stars: 0,
        completed: false,
        scenes: {}
      };
      
      zone.scenes.forEach((sceneId, index) => {
        progress.zones[zoneId].scenes[sceneId] = {
          completed: false,
          stars: 0,
          symbols: {},
          lastPlayed: null,
    unlocked: index === 0 || zoneId === 'festival-square'  // ✅ ADD: All Festival Square games unlocked
        };
      });
    });
    
    return progress;
  }

  // ✅ ENHANCED: Better recalculation with detailed logging
  recalculateTotals(progress) {
    let totalStars = 0;
    let completedScenes = 0;
    
    console.log('🧮 Recalculating totals for all zones...');
    
    if (progress.zones) {
      Object.entries(progress.zones).forEach(([zoneId, zone]) => {
        let zoneStars = 0;
        let zoneCompleted = 0;
        
        if (zone.scenes) {
          Object.values(zone.scenes).forEach(scene => {
            const sceneStars = scene.stars || 0;
            totalStars += sceneStars;
            zoneStars += sceneStars;
            
            if (scene.completed) {
              completedScenes++;
              zoneCompleted++;
            }
          });
        }
        
        // Update zone totals
        zone.stars = zoneStars;
        zone.completed = zoneCompleted === Object.keys(zone.scenes || {}).length && Object.keys(zone.scenes || {}).length > 0;
        
        console.log(`📊 Zone ${zoneId}:`, {
          stars: zoneStars,
          completed: zoneCompleted,
          total: Object.keys(zone.scenes || {}).length
        });
      });
    }
    
    progress.totalStars = totalStars;
    progress.completedScenes = completedScenes;
    
    console.log('✅ Final totals:', {
      totalStars,
      completedScenes,
      zones: Object.keys(progress.zones || {}).length
    });
  }

  // Navigation helpers remain the same
  getNextScene(currentZone, currentScene) {
    const zone = GameStateManager.ZONES[currentZone];
    if (!zone) return null;
    
    const currentIndex = zone.scenes.indexOf(currentScene);
    if (currentIndex === -1 || currentIndex === zone.scenes.length - 1) {
      return null;
    }
    
    return {
      zone: currentZone,
      scene: zone.scenes[currentIndex + 1]
    };
  }

  // 🔧 FIXED: Helper method to get scene progress
  getSceneProgress(zoneId, sceneId) {
    const progress = this.getGameProgress();
    if (!progress.zones || !progress.zones[zoneId] || !progress.zones[zoneId].scenes) {
      return null;
    }
    return progress.zones[zoneId].scenes[sceneId] || null;
  }

  // Add this method to GameStateManager
  clearLastLocation() {
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) {
      const locationKey = `${activeProfileId}_lastLocation`;
      localStorage.removeItem(locationKey);
      console.log('🧹 Cleared last location for reload');
    }
  }

  // ✅ NEW: Debug method for troubleshooting zone progress
  debugZoneProgress(profileId, zoneId) {
    console.log('🔍 DEBUG ZONE PROGRESS:', { profileId, zoneId });
    
    const progressKey = `${profileId}_gameProgress`;
    const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
    
    console.log('📊 Raw progress data:', progressData);
    console.log('📊 Zone data:', progressData.zones?.[zoneId]);
    console.log('📊 Scene data:', progressData.zones?.[zoneId]?.scenes);
    
    // Check individual scene states
    if (progressData.zones?.[zoneId]?.scenes) {
      Object.entries(progressData.zones[zoneId].scenes).forEach(([sceneId, sceneData]) => {
        const sceneStateKey = `${profileId}_${zoneId}_${sceneId}_state`;
        const sceneState = JSON.parse(localStorage.getItem(sceneStateKey) || '{}');
        
        console.log(`🎬 Scene ${sceneId}:`, {
          progressData: sceneData,
          sceneState: sceneState
        });
      });
    }
    
    return progressData;
  }

  // ✅ NEW: Quick method to get zone summary
  getZoneSummary(zoneId) {
    const progress = this.getGameProgress();
    const zone = progress.zones?.[zoneId];
    
    if (!zone) return { stars: 0, completedScenes: 0, totalScenes: 0 };
    
    const completedScenes = Object.values(zone.scenes || {}).filter(s => s.completed).length;
    const totalScenes = Object.keys(zone.scenes || {}).length;
    
    return {
      stars: zone.stars || 0,
      completedScenes,
      totalScenes,
      completed: zone.completed || false
    };
  }
   getActiveProfile() {
  try {
    const activeProfileId = this.activeProfileId || localStorage.getItem('activeProfileId');
    
    if (!activeProfileId) {
      console.log('No active profile ID found');
      return null;
    }
    
    // ✅ FIXED: Use the correct structure - get the profiles object, not array
    const gameProfiles = this.getProfiles(); // Uses existing working method
    
    if (!gameProfiles || !gameProfiles.profiles) {
      console.log('No profiles data found');
      return null;
    }
    
    // ✅ FIXED: Access profile directly from object (not array.find)
    const activeProfile = gameProfiles.profiles[activeProfileId];
    
    if (!activeProfile) {
      console.log(`Profile with ID ${activeProfileId} not found`);
      return null;
    }
    
    return activeProfile;
  } catch (error) {
    console.error('Error getting active profile:', error);
    return null;
  }
}
  
   getActiveProfileName() {
    const profile = this.getActiveProfile();
    return profile?.name || 'little explorer';
  }


}

// Create singleton instance
const gameStateManager = new GameStateManager();

export default gameStateManager;