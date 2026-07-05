import { safeSetItem } from '../utils/safeStorage';
// lib/services/GameCoachSessionManager.js
// Smart GameCoach trigger system for Zone Welcome

class GameCoachSessionManager {
  constructor() {
    this.COOLDOWN_TIME = 3 * 60 * 1000; // 3 minutes
    this.STUCK_THRESHOLD = 3; // visits without progress
    this.SESSION_STORAGE_KEY = 'gameCoach_session';
  }

  // Get session data for current profile
  getSessionData(profileId, zoneId) {
    try {
      const key = `${this.SESSION_STORAGE_KEY}_${profileId}_${zoneId}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return this.createFreshSession();
      }
      
      const parsed = JSON.parse(data);
      
      // Reset if it's a new day
      const lastVisit = new Date(parsed.lastVisit);
      const today = new Date();
      
      if (lastVisit.toDateString() !== today.toDateString()) {
        return this.createFreshSession();
      }
      
      return parsed;
    } catch (error) {
      console.error('Error loading GameCoach session:', error);
      return this.createFreshSession();
    }
  }

  // Save session data
  saveSessionData(profileId, zoneId, sessionData) {
    try {
      const key = `${this.SESSION_STORAGE_KEY}_${profileId}_${zoneId}`;
      safeSetItem(key, JSON.stringify({
        ...sessionData,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Error saving GameCoach session:', error);
    }
  }

  // Create fresh session data
  createFreshSession() {
    return {
      firstVisit: true,
      visitCount: 0,
      lastGameCoachTime: 0,
      messagesShown: [],
      lastProgress: {},
      stuckCounter: 0,
      lastVisit: Date.now(),
      sessionStartTime: Date.now()
    };
  }

 shouldShowMessage(profileId, zoneId, sceneProgress, context = {}) {
  const session = this.getSessionData(profileId, zoneId);
  const now = Date.now();
  
  // Update visit tracking
  session.visitCount += 1;
  session.lastVisit = now;

  // 1. ALWAYS SHOW: First time ever in this zone
  if (session.firstVisit) {
    console.log('✅ GameCoach: First visit trigger');
    session.firstVisit = false;
    this.saveSessionData(profileId, zoneId, session);
    return {
      shouldShow: true,
      messageType: 'welcome',
      trigger: 'first_visit'
    };
  }

  // ✅ 2. CELEBRATION CHECK: Bypass cooldown for achievements
  const progressResult = this.checkForNewProgress(session.lastProgress, sceneProgress);
  if (progressResult.hasNewProgress) {
    console.log('🎉 GameCoach: New progress celebration - BYPASSING COOLDOWN!');
    session.lastProgress = { ...sceneProgress };
    session.stuckCounter = 0;
    this.saveSessionData(profileId, zoneId, session);
    return {
      shouldShow: true,
      messageType: 'celebration',
      trigger: 'new_progress',
      progressData: progressResult
    };
  }

  // ✅ 3. COOLDOWN CHECK: Only apply to non-celebration messages
  const timeSinceLastMessage = now - session.lastGameCoachTime;
  if (timeSinceLastMessage < this.COOLDOWN_TIME) {
    console.log('🚫 GameCoach: In cooldown period (no celebration to show)');
    this.saveSessionData(profileId, zoneId, session);
    return { shouldShow: false, reason: 'cooldown' };
  }

  // 4. IMMEDIATE INTENT: Child clicked scene within 3 seconds
  if (context.quickNavigation) {
    console.log('🚫 GameCoach: Quick navigation detected');
    this.saveSessionData(profileId, zoneId, session);
    return { shouldShow: false, reason: 'quick_navigation' };
  }

  // 5. MASTERY ACHIEVEMENT: Zone completed
  const totalScenes = context.totalScenes || 4;
  const completedScenes = Object.values(sceneProgress).filter(p => p.completed).length;
  
  if (completedScenes === totalScenes && !session.messagesShown.includes('zone_mastery')) {
    console.log('✅ GameCoach: Zone mastery celebration');
    this.saveSessionData(profileId, zoneId, session);
    return {
      shouldShow: true,
      messageType: 'mastery',
      trigger: 'zone_complete',
      completionData: { completedScenes, totalScenes }
    };
  }

  // 6. STUCK DETECTION: Multiple visits without progress
  session.stuckCounter += 1;
  if (session.stuckCounter >= this.STUCK_THRESHOLD && 
      !session.messagesShown.includes('encouragement_recent')) {
    console.log('✅ GameCoach: Stuck detection trigger');
    this.saveSessionData(profileId, zoneId, session);
    return {
      shouldShow: true,
      messageType: 'encouragement',
      trigger: 'stuck_detection',
      stuckData: { visits: session.stuckCounter }
    };
  }

  // 7. DEFAULT: Stay silent
  console.log('🚫 GameCoach: No trigger conditions met');
  this.saveSessionData(profileId, zoneId, session);
  return { shouldShow: false, reason: 'no_trigger' };
}

  // Check for new progress since last visit
  checkForNewProgress(lastProgress, currentProgress) {
    const result = {
      hasNewProgress: false,
      newCompletions: [],
      newStars: 0,
      progressType: null
    };

    Object.keys(currentProgress).forEach(sceneId => {
      const current = currentProgress[sceneId];
      const last = lastProgress[sceneId] || { completed: false, stars: 0 };

      // Check for scene completion
      if (current.completed && !last.completed) {
        result.hasNewProgress = true;
        result.newCompletions.push(sceneId);
        result.progressType = 'scene_completion';
      }

      // Check for new stars
      if (current.stars > last.stars) {
        result.hasNewProgress = true;
        result.newStars += (current.stars - last.stars);
        if (!result.progressType) {
          result.progressType = 'star_progress';
        }
      }
    });

    return result;
  }

  // Count total symbols discovered across all scenes
  countTotalSymbols(sceneProgress) {
    let total = 0;
    Object.values(sceneProgress).forEach(scene => {
      if (scene.discoveredSymbols) {
        total += Object.keys(scene.discoveredSymbols).length;
      }
    });
    return total;
  }

  // Mark message as shown
  markMessageShown(profileId, zoneId, messageType) {
    const session = this.getSessionData(profileId, zoneId);
    session.lastGameCoachTime = Date.now();
    session.messagesShown.push(messageType);
    
    // Limit message history to prevent memory bloat
    if (session.messagesShown.length > 10) {
      session.messagesShown = session.messagesShown.slice(-10);
    }
    
    this.saveSessionData(profileId, zoneId, session);
  }

 // Get appropriate message based on trigger
getMessage(messageType, trigger, data = {}, profileName = '') {
  // ✅ ADD: Smart name handling
  const getNamePrefix = (casual = false) => {
    if (!profileName || profileName.trim() === '') {
      return casual ? 'little explorer' : 'brave adventurer';
    }
    return profileName.trim();
  };
  
  const name = getNamePrefix();
  const casualName = getNamePrefix(true);
  
  // ✅ ADD: Scene-specific celebration messages with names
  if (messageType === 'celebration' && data.progressData?.newCompletions && data.progressData.newCompletions.length > 0) {
    const completedScene = data.progressData.newCompletions[0];
    
    console.log(`🎯 Scene-specific message for: ${completedScene}, Child: ${name}`);
    
    // Return scene-specific messages with names
    switch(completedScene) {
      case 'modak':
        return `Amazing work, ${name}! You've mastered the sweet modak adventure! Like Ganesha's favorite treat, you've earned something special!`;
        
      case 'pond':
        return `Incredible job, ${name}! You've discovered the secrets of the sacred pond! Your wisdom flows like the blessed waters!`;
        
      case 'temple':
        return `Magnificent achievement, ${name}! You've unlocked the ancient temple mysteries! The sacred halls echo with your victory!`;
        
      case 'garden':
        return `Beautiful work, ${name}! You've mastered the divine garden! Your spirit blooms like the sacred lotus flowers!`;
      
      case 'ancient':
        return `Wonderful job, ${name}! You've conquered the ancient temple challenge! The old stones remember your dedication!`;
        
      default:
        return `Fantastic work, ${name}! You've mastered the ${completedScene} adventure! Ganesha celebrates your dedication!`;
    }
  }
  
  // ✅ UPDATED: All message templates with names
  const messages = {
    welcome: [
      `Welcome to Symbol Mountain, ${name}! This is where Ganesha's ancient symbols come alive!`,
      `Namaste, ${name}! Symbol Mountain holds sacred secrets waiting for you to discover!`,
      `Welcome to the mystical Symbol Mountain, ${casualName}! Are you ready to discover Ganesha's wisdom?`
    ],
    
    celebration: {
      scene_completion: [
        `Amazing work, ${name}! You've completed another sacred journey!`,
        `Wonderful job, ${casualName}! Your cultural wisdom continues to grow!`,
        `Incredible achievement, ${name}! Another adventure mastered with dedication!`
      ],
      star_progress: [
        `Fantastic progress, ${name}! Your journey through Symbol Mountain continues!`,
        `Excellent work, ${casualName}! Each step brings you closer to ancient knowledge!`
      ]
    },
    
    mastery: [
      `Incredible achievement, ${name}! You've mastered all of Symbol Mountain! You're now a true keeper of Ganesha's wisdom!`,
      `Amazing work, ${casualName}! You've completed every adventure! Ganesha smiles upon your dedication!`,
      `Wonderful job, ${name}! Symbol Mountain has revealed all its secrets to you! Ready for your next spiritual journey?`
    ],
    
    encouragement: [
      `Every great explorer faces challenges, ${casualName}! Even Ganesha had to learn step by step. Try the glowing scene!`,
      `Don't worry, ${name}! Wisdom comes through patience. The next adventure awaits when you're ready!`,
      `Take your time, ${casualName}! Each symbol will reveal itself when you're prepared to learn!`
    ],
    
    cultural: [
      `Wonderful progress, ${name}! You've discovered ${data.symbolData?.totalSymbols} sacred symbols! You're connecting with ancient wisdom!`,
      `Your cultural journey is blossoming, ${casualName}! Each symbol you find strengthens your connection to tradition!`
    ]
  };

  let messageArray;
  
  if (messageType === 'celebration' && data.progressData?.progressType) {
    messageArray = messages.celebration[data.progressData.progressType];
  } else {
    messageArray = messages[messageType];
  }

  if (!messageArray || messageArray.length === 0) {
    return `Continue your amazing journey, ${casualName}!`;
  }

  // Return random message from array
  return messageArray[Math.floor(Math.random() * messageArray.length)];
}

  // Force reset session (for testing or new day)
  resetSession(profileId, zoneId) {
    const key = `${this.SESSION_STORAGE_KEY}_${profileId}_${zoneId}`;
    localStorage.removeItem(key);
    console.log(`🔄 GameCoach session reset for ${profileId}/${zoneId}`);
  }

  // Debug function
  debugSession(profileId, zoneId) {
    const session = this.getSessionData(profileId, zoneId);
    console.log('🎭 GameCoach Session Debug:', {
      profileId,
      zoneId,
      session,
      timeSinceLastMessage: Date.now() - session.lastGameCoachTime,
      cooldownRemaining: Math.max(0, this.COOLDOWN_TIME - (Date.now() - session.lastGameCoachTime))
    });
    return session;
  }
}

export default new GameCoachSessionManager();