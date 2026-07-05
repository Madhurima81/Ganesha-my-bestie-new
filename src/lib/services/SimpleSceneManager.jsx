import { safeSetItem } from '../utils/safeStorage';
// lib/services/SimpleSceneManager.js
// 🎯 DEAD SIMPLE: Remember last scene, resume ONLY if not completed
class SimpleSceneManager {
  // ✅ SIMPLE: Save current scene location (only if not completed)
  static setCurrentScene(zoneId, sceneId, isCompleted = false) {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;
    
    // 🚫 DON'T SAVE if scene is completed
    if (isCompleted) {
      console.log('🎉 SIMPLE: Scene completed - NOT saving location (will restart fresh)');
      this.clearCurrentScene();
      return;
    }
    
    const location = {
      zone: zoneId,
      scene: sceneId,
      timestamp: Date.now(),
      profileId: profileId
    };
    
    safeSetItem('currentSceneLocation', JSON.stringify(location));
    safeSetItem('lastSceneLocation', JSON.stringify(location)); // Backup
    console.log('📍 SIMPLE: Saved current scene:', location);
  }

  // ✅ SIMPLE: Get current scene location
  static getCurrentScene() {
    try {
      const location = localStorage.getItem('currentSceneLocation');
      if (!location) return null;
      
      const parsed = JSON.parse(location);
      const currentProfileId = localStorage.getItem('activeProfileId');
      
      // Only return if same profile
      if (parsed.profileId === currentProfileId) {
        console.log('📍 SIMPLE: Found current scene:', parsed);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error getting current scene:', error);
      return null;
    }
  }

  // ✅ SIMPLE: Clear scene location (when user goes to menu or completes scene)
  static clearCurrentScene() {
    localStorage.removeItem('currentSceneLocation');
    console.log('📍 SIMPLE: Cleared current scene');
  }

  // ✅ SIMPLE: Check if user should resume a scene
  static shouldResumeScene() {
    const location = this.getCurrentScene();
    if (!location) {
      console.log('📍 SIMPLE: No scene to resume');
      return null;
    }

    // Check if location is recent (within last hour)
    const hourAgo = Date.now() - (60 * 60 * 1000);
    if (location.timestamp < hourAgo) {
      console.log('📍 SIMPLE: Scene too old, not resuming');
      this.clearCurrentScene();
      return null;
    }

    console.log('📍 SIMPLE: Should resume scene:', location);
    return location;
  }

  // 🎯 NEW: Check if scene should start fresh (completed scenes always restart)
  static shouldStartFresh(zoneId, sceneId) {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return true;

    try {
      // Check if this scene is marked as completed in profile progress
      const profiles = JSON.parse(localStorage.getItem('gameProfiles') || '[]');
      const currentProfile = profiles.find(p => p.id === profileId);
      
      if (!currentProfile || !currentProfile.progress) return true;

      // Check zone progress
      const zoneProgress = currentProfile.progress[zoneId];
      if (!zoneProgress || !zoneProgress.scenes) return true;

      // Check scene completion
      const sceneProgress = zoneProgress.scenes[sceneId];
      const isCompleted = sceneProgress && sceneProgress.completed;

      if (isCompleted) {
        console.log('🎮 SIMPLE: Scene is completed - starting fresh for replay');
        return true;
      } else {
        console.log('🎮 SIMPLE: Scene not completed - can resume if location saved');
        return false;
      }
    } catch (error) {
      console.error('Error checking scene completion:', error);
      return true; // Default to fresh start if error
    }
  }

  // 🎯 ENHANCED: Get scene start mode (fresh vs resume)
  static getSceneStartMode(zoneId, sceneId) {
    // First check if scene should always start fresh (completed scenes)
    if (this.shouldStartFresh(zoneId, sceneId)) {
      return { mode: 'fresh', reason: 'Scene completed or first time' };
    }

    // Then check if there's a saved location to resume
    const location = this.shouldResumeScene();
    if (location && location.zone === zoneId && location.scene === sceneId) {
      return { mode: 'resume', reason: 'Saved progress found', location };
    }

    // Default to fresh start
    return { mode: 'fresh', reason: 'No saved progress or different scene' };
  }
}

export default SimpleSceneManager;