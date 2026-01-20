// CleanGameWelcomeScreen.jsx - ENHANCED WITH CULTURAL CELEBRATION - Streamlined Flow (No Screen 3)
import React, { useState, useEffect } from 'react';
import GameStateManager from '../../services/GameStateManager';
import CleanProfileSelector from './CleanProfileSelector';
import './CleanGameWelcomeScreen.css';
import SimpleSceneManager from '../../services/SimpleSceneManager';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import ProgressPopup from './ProgressPopup';


const CleanGameWelcomeScreen = ({ onContinue, onNewGame }) => {
  console.log('🌟 Clean GameWelcomeScreen rendering');
  
  const [profiles, setProfiles] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
const [popupData, setPopupData] = useState(null);

  // Clean initialization - no persistent state
  useEffect(() => {
    initializeClean();
    
    // Cleanup function to prevent state leaks
    return () => {
      console.log('🧹 CleanGameWelcomeScreen cleanup');
    };
  }, []);
  
  const initializeClean = () => {
    try {
      const gameProfiles = GameStateManager.getProfiles();
      const profilesObj = gameProfiles?.profiles || {};
      setProfiles(profilesObj);
      
      // Check if there's already an active profile
      const activeProfileId = localStorage.getItem('activeProfileId');
      if (activeProfileId && profilesObj[activeProfileId]) {
        // Profile already selected - go directly to welcome back screen
        console.log('🌟 Active profile found, showing welcome back screen');
        handleProfileSelect(activeProfileId);
      } else {
        // No active profile - show profile selector
        console.log('🌟 No active profile, showing profile selector');
        setShowProfileSelector(true);
      }
    } catch (error) {
      console.error('Clean initialization error:', error);
      setProfiles({});
      setShowProfileSelector(true);
    }
  };
  

  // ✅ REPLACE the checkProgress function in CleanGameWelcomeScreen.jsx
const checkProgress = (profileId) => {
  if (!profileId) return;

  console.log('🔍 PROGRESS CHECK: Starting for profile:', profileId);
  
  try {
    let foundAnyProgress = false;

    // ✅ PRIORITY 1: Check for temp sessions first (most important!)
const tempPondKey = `temp_session_${profileId}_symbol-mountain_pond`;
const tempModakKey = `temp_session_${profileId}_symbol-mountain_modak`;
const tempSymbolKey = `temp_session_${profileId}_symbol-mountain_symbol`;  // ← ADD THIS
const tempFinalKey = `temp_session_${profileId}_symbol-mountain_final-scene`;  // ← ADD THIS NEW LINE

// Zone 2: Cave of Secrets - ALL 5 scenes
const tempCave1Key = `temp_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`;
const tempCave2Key = `temp_session_${profileId}_cave-of-secrets_suryakoti-samaprabha`;
const tempCave3Key = `temp_session_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`;
const tempCave4Key = `temp_session_${profileId}_cave-of-secrets_sarvakaryeshu-sarvada`;     // ✅ Scene 4
const tempCave5Key = `temp_session_${profileId}_cave-of-secrets_mantra-assembly`;    

// Zone 3: Shloka River - ALL 5 scenes
const tempShloka1Key = `temp_session_${profileId}_shloka-river_vakratunda-grove`;
const tempShloka2Key = `temp_session_${profileId}_shloka-river_suryakoti-bank`;
const tempShloka3Key = `temp_session_${profileId}_shloka-river_nirvighnam-chant`;
const tempShloka4Key = `temp_session_${profileId}_shloka-river_sarvakaryeshu-chant`;
const tempShloka5Key = `temp_session_${profileId}_shloka-river_shloka-river-finale`;

// Add after the existing Shloka River keys (around line 60):

// Zone 4: Festival Square - ALL 4 games
const tempFestival1Key = `temp_session_${profileId}_festival-square_game1`;
const tempFestival2Key = `temp_session_${profileId}_festival-square_game2`;
const tempFestival3Key = `temp_session_${profileId}_festival-square_game3`;
const tempFestival4Key = `temp_session_${profileId}_festival-square_game4`;

if (localStorage.getItem(tempModakKey) || 
    localStorage.getItem(tempPondKey) || 
    localStorage.getItem(tempSymbolKey) || 
    localStorage.getItem(tempFinalKey) ||
    localStorage.getItem(tempCave1Key) ||
    localStorage.getItem(tempCave2Key) ||
    localStorage.getItem(tempCave3Key) ||
    localStorage.getItem(tempCave4Key) ||
    localStorage.getItem(tempCave5Key) ||
    localStorage.getItem(tempShloka1Key) ||
    localStorage.getItem(tempShloka2Key) ||
    localStorage.getItem(tempShloka3Key) ||
    localStorage.getItem(tempShloka4Key) ||
    localStorage.getItem(tempShloka5Key) ||    // ✅ Scene 5 detection
      localStorage.getItem(tempFestival1Key) ||
    localStorage.getItem(tempFestival2Key) ||
    localStorage.getItem(tempFestival3Key) ||
    localStorage.getItem(tempFestival4Key)) {
  
  console.log('✅ TEMP SESSION FOUND - setting hasProgress = TRUE');
  setHasProgress(true);
  return; // Early exit - we found progress!
}
    
    // ✅ METHOD 1: Check for IN-PROGRESS scenes (most important for your issue)
    console.log('🔍 PROGRESS CHECK: Looking for in-progress scenes...');
    
    Object.keys(localStorage).forEach(key => {
  // ✅ COMPREHENSIVE DETECTION INCLUDING CAVE'S 5 SCENES
if ((key.includes('sceneState') || 
     // Zone detection
     key.includes('symbol-mountain') || 
     key.includes('cave-of-secrets') ||
     key.includes('shloka-river') ||
     // Symbol Mountain scenes
     key.includes('modak') ||
     key.includes('pond') ||
     key.includes('symbol') ||
     key.includes('final-scene') ||
     // Cave of Secrets - ALL 5 scenes
     key.includes('vakratunda-mahakaya') ||
     key.includes('suryakoti-samaprabha') ||
     key.includes('nirvighnam-kurumedeva') ||
     key.includes('sarvakaryeshu-sarvada') ||
     key.includes('mantra-assembly') ||
     // Shloka River - ALL 5 scenes
     key.includes('vakratunda-grove') ||
     key.includes('suryakoti-bank') ||
     key.includes('nirvighnam-chant') ||
     key.includes('sarvakaryeshu-chant') ||
     key.includes('shloka-river-finale') ||       // ✅ Scene 5
        key.includes('festival-square') ||  // ✅ ADD THIS LINE
     // Scene detection - add festival games
     key.includes('game1') ||            // ✅ ADD THESE
     key.includes('game2') ||            // ✅ ADD THESE  
     key.includes('game3') ||            // ✅ ADD THESE
     key.includes('game4') ||            // ✅ ADD THESE
       // Temp session detection
       key.startsWith(`temp_session_${profileId}`) ||
       // Progress key detection
       key.startsWith(`${profileId}_symbol-mountain`) ||
       key.startsWith(`${profileId}_cave-of-secrets`)) &&
      key.includes(profileId)) {
             try {
          const sceneState = JSON.parse(localStorage.getItem(key) || '{}');
          console.log(`🔍 Scene state ${key}:`, {
            completed: sceneState.completed,
            hasStars: !!(sceneState.stars && sceneState.stars > 0),
            hasProgress: !!(sceneState.progress && sceneState.progress > 0),
            hasPhase: !!(sceneState.phase && sceneState.phase !== 'initial'),
            hasAnyData: Object.keys(sceneState).length > 0
          });

          // Check for fireworks state first
          if (sceneState.currentPopup === 'final_fireworks' || 
              sceneState.currentPopup === 'fireworks') {
            console.log('✅ PROGRESS CHECK: Scene is in final fireworks - treating as completed');
            foundAnyProgress = true;
            return;
          }
          
    if (sceneState.completed || 
    (sceneState.stars && sceneState.stars > 0) ||
    (sceneState.progress && sceneState.progress > 0) ||
    (sceneState.phase && sceneState.phase !== 'initial' && sceneState.phase !== undefined) ||
    (sceneState.discoveredSymbols && Object.keys(sceneState.discoveredSymbols).length > 0) ||
    (sceneState.lotusStates && sceneState.lotusStates.some(state => state > 0)) ||
    (sceneState.mooshikaFound === true) ||
    (sceneState.modaksCollected && sceneState.modaksCollected > 0) ||
    (sceneState.eyesGameComplete === true) ||              // ← Symbol scene progress
    (sceneState.earsGameComplete === true) ||              // ← Symbol scene progress  
    (sceneState.ganeshaComplete === true) ||               // ← Symbol scene progress
    (sceneState.instrumentsFound > 0) ||                   // ← Symbol scene progress
    (sceneState.tuskPower > 0) ||                          // ← Symbol scene progress
    (sceneState.foundInstruments && sceneState.foundInstruments.length > 0)
  (sceneState.placedSymbols && Object.keys(sceneState.placedSymbols).length > 0) ||  // ← Final scene progress
(sceneState.ganeshaState && sceneState.ganeshaState !== 'stone') ||               // ← Final scene progress
(sceneState.currentBlessing !== null)                                        // ← Final scene progress
  ) {  // ← Symbol scene progress
            
            console.log('✅ PROGRESS FOUND in scene state:', key);
            foundAnyProgress = true;
          }
        } catch (e) {
          console.warn('⚠️ Could not parse scene state:', key);
        }
      }
    });
    
    if (foundAnyProgress) {
      console.log('✅ PROGRESS CHECK: Found in-progress scenes, setting hasProgress = TRUE');
      setHasProgress(true);
      return;
    }
    
    // ✅ METHOD 2: Check ProgressManager for completed scenes (backup)
    try {
      const progressKey = `${profileId}_gameProgress`;
      const progressData = JSON.parse(localStorage.getItem(progressKey) || '{}');
      
      if (progressData && progressData.zones) {
        let totalStars = 0;
        let completedScenes = 0;
        
        Object.values(progressData.zones).forEach(zone => {
          if (zone.scenes) {
            Object.values(zone.scenes).forEach(scene => {
              if (scene.completed) {
                completedScenes++;
                totalStars += scene.stars || 0;
              }
            });
          }
        });
        
        if (totalStars > 0 || completedScenes > 0) {
          console.log('✅ PROGRESS CHECK: Found completed scenes in ProgressManager');
          setHasProgress(true);
          return;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not check ProgressManager:', e);
    }
    
    // ✅ METHOD 3: Check profile stats (final backup)
    try {
      const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
      if (gameProfiles.profiles && gameProfiles.profiles[profileId]) {
        const profile = gameProfiles.profiles[profileId];
        if (profile.totalStars > 0 || profile.completedScenes > 0) {
          console.log('✅ PROGRESS CHECK: Found progress in profile stats');
          setHasProgress(true);
          return;
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not check profile stats:', e);
    }
    
    // ✅ No progress found anywhere
    console.log('❌ PROGRESS CHECK: No progress found, setting hasProgress = FALSE');
    setHasProgress(false);
    
  } catch (error) {
    console.error('❌ PROGRESS CHECK: Error:', error);
    setHasProgress(false);
  }
};

  // ✨ DISNEY ENHANCEMENT: Detect recent scene completion
const getRecentAchievement = () => {
  console.log('🧪 TESTING: Forcing achievement banner to appear');
  
  if (!currentProfile) return null;
  
  const activeProfileId = localStorage.getItem('activeProfileId');
  if (!activeProfileId) return null;
  
  // Check for scenes completed in last 5 minutes (300,000ms)
  const recentTimeThreshold = Date.now() - 300000;
  let recentCompletion = null;
  
  try {
    // Check scene states for recent completions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(activeProfileId) && key.includes('_state')) {
        const stateData = JSON.parse(localStorage.getItem(key) || '{}');
        
        // Check if scene was completed recently
        if (stateData.completed && stateData.completedAt && 
            stateData.completedAt > recentTimeThreshold) {
          
          // Extract zone and scene from key: "profile_123_symbol-mountain_modak_state"
          const keyParts = key.split('_');
          if (keyParts.length >= 4) {
            const zoneId = keyParts[2];
            const sceneId = keyParts[3];
            
            recentCompletion = {
              zone: zoneId,
              scene: sceneId,
              stars: stateData.stars || 0,
              completedAt: stateData.completedAt
            };
            break; // Found most recent
          }
        }
      }
    }
  } catch (e) {
    console.error('Error checking recent achievements:', e);
  }
  
  return recentCompletion;
  
};

// Find where GameWelcomeScreen checks for saved progress and add this debug:
useEffect(() => {
  const resumeCheck = SimpleSceneManager.shouldResumeScene();
  const profileId = localStorage.getItem('activeProfileId');
  console.log('🧪 GAME WELCOME: Resume detection:', {
    resumeCheck,
    profileId,
    timestamp: Date.now()
  });
}, []);


  // ✨ ENHANCEMENT: Recent Achievement Banner Component
  const RecentAchievementBanner = ({ achievement }) => {
    if (!achievement) return null;
    
    const zoneName = achievement.zone.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const sceneName = achievement.scene.charAt(0).toUpperCase() + achievement.scene.slice(1);
    
    return (
      <div className="recent-achievement-banner">
        <div className="achievement-sparkles">✨🎉✨</div>
        <div className="achievement-title">Congratulations!</div>
        <div className="achievement-content">
          You just completed <strong>{sceneName}</strong> in {zoneName}
        </div>
        <div className="achievement-stars">
          {'⭐'.repeat(achievement.stars)} {achievement.stars} star{achievement.stars !== 1 ? 's' : ''} earned!
        </div>
      </div>
    );
  };

  // ✨ ENHANCEMENT: Better Continue button text
  const getContinueButtonText = () => {
    const recentAchievement = getRecentAchievement();
    
    if (recentAchievement) {
      // Just completed something - suggest next logical step
      const zoneName = recentAchievement.zone.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        main: "Continue Adventure",
        sub: `See what's unlocked in ${zoneName}!`
      };
    } else {
      // Resume normal play
      return {
        main: hasProgress ? "Continue Journey" : "Start Adventure",
        sub: hasProgress ? "Resume from where you left off" : "Begin your magical journey"
      };
    }
  };


// 🌟 ADD THESE NEW FUNCTIONS HERE:
// ✨ DISNEY ENHANCEMENT: Detect if this is first time vs return visit
const isFirstTimeVisit = () => {
  if (!currentProfile) return true;
  
  // Check if this profile has ANY progress at all
  const activeProfileId = localStorage.getItem('activeProfileId');
  if (!activeProfileId) return true;
  
try {
  // ✅ PRIORITY: Check for temp sessions first!
  const tempPondKey = `temp_session_${activeProfileId}_symbol-mountain_pond`;
  const tempModakKey = `temp_session_${activeProfileId}_symbol-mountain_modak`;
  const tempSymbolKey = `temp_session_${activeProfileId}_symbol-mountain_symbol`;  // ← ADD THIS
const tempFinalKey = `temp_session_${activeProfileId}_symbol-mountain_final-scene`;  // ← ADD THIS NEW LINE

// Zone 2: Cave of Secrets - ALL 5 scenes
  const tempCave1Key = `temp_session_${activeProfileId}_cave-of-secrets_vakratunda-mahakaya`;
  const tempCave2Key = `temp_session_${activeProfileId}_cave-of-secrets_suryakoti-samaprabha`;
  const tempCave3Key = `temp_session_${activeProfileId}_cave-of-secrets_nirvighnam-kurumedeva`;
  const tempCave4Key = `temp_session_${activeProfileId}_cave-of-secrets_sarvakaryeshu-sarvada`;     // ✅ Scene 4
  const tempCave5Key = `temp_session_${activeProfileId}_cave-of-secrets_mantra-assembly`;    
        // ✅ Scene 5

        // Zone 3: Shloka River - ALL 5 scenes
  const tempShloka1Key = `temp_session_${activeProfileId}_shloka-river_vakratunda-grove`;
  const tempShloka2Key = `temp_session_${activeProfileId}_shloka-river_suryakoti-bank`;
  const tempShloka3Key = `temp_session_${activeProfileId}_shloka-river_nirvighnam-chant`;
  const tempShloka4Key = `temp_session_${activeProfileId}_shloka-river_sarvakaryeshu-chant`;
  const tempShloka5Key = `temp_session_${activeProfileId}_shloka-river_shloka-river-finale`;

  // Add after the existing Shloka River keys (around line 60):

  // Zone 4: Festival Square - ALL 4 games
    const tempFestival1Key = `temp_session_${activeProfileId}_festival-square_game1`; // ✅ Use activeProfileId
    const tempFestival2Key = `temp_session_${activeProfileId}_festival-square_game2`; // ✅ Use activeProfileId
    const tempFestival3Key = `temp_session_${activeProfileId}_festival-square_game3`; // ✅ Use activeProfileId
    const tempFestival4Key = `temp_session_${activeProfileId}_festival-square_game4`; // ✅ Use activeProfileId
    
if (localStorage.getItem(tempModakKey) || 
    localStorage.getItem(tempPondKey) || 
    localStorage.getItem(tempSymbolKey) || 
    localStorage.getItem(tempFinalKey) ||
    localStorage.getItem(tempCave1Key) ||
    localStorage.getItem(tempCave2Key) ||
    localStorage.getItem(tempCave3Key) ||
    localStorage.getItem(tempCave4Key) ||
    localStorage.getItem(tempCave5Key) ||
    localStorage.getItem(tempShloka1Key) ||
    localStorage.getItem(tempShloka2Key) ||
    localStorage.getItem(tempShloka3Key) ||
    localStorage.getItem(tempShloka4Key) ||
    localStorage.getItem(tempShloka5Key) ||// ✅ Scene 5 detection
      localStorage.getItem(tempFestival1Key) ||
    localStorage.getItem(tempFestival2Key) ||
    localStorage.getItem(tempFestival3Key) ||
    localStorage.getItem(tempFestival4Key)) {
    
    console.log('🎯 FIRST TIME CHECK: Found temp session - this is NOT first time');
    return false; // Has progress = NOT first time
  }
  
  // Method 1: Check profile stats...    // Method 1: Check profile stats
    const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
    if (gameProfiles.profiles && gameProfiles.profiles[activeProfileId]) {
      const profile = gameProfiles.profiles[activeProfileId];
      if (profile.totalStars > 0 || profile.completedScenes > 0) {
        return false; // Has progress = return visit
      }
    }
    
    // Method 2: Check if profile was just created (within last 30 seconds)
    if (gameProfiles.profiles && gameProfiles.profiles[activeProfileId]) {
      const profile = gameProfiles.profiles[activeProfileId];
      const timeSinceCreation = Date.now() - (profile.createdAt || 0);
      if (timeSinceCreation < 30000) { // 30 seconds
        return true; // Just created = first time
      }
    }
    
    // Method 3: Check for any scene states
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(activeProfileId) && key.includes('_state')) {
        try {
          const stateData = JSON.parse(localStorage.getItem(key) || '{}');
          if (stateData.stars > 0 || stateData.completed) {
            return false; // Has scene progress = return visit
          }
        } catch (e) {
          // Skip invalid data
        }
      }
    }
    
    return true; // No progress found = first time
  } catch (error) {
    console.error('Error checking first time visit:', error);
    return true; // Default to first time on error
  }
};

// ✨ ENHANCEMENT: Get welcome message based on visit type
const getWelcomeMessage = () => {
  const isFirstTime = isFirstTimeVisit();
  const recentAchievement = getRecentAchievement();
  
  if (isFirstTime) {
    return {
      title: `Welcome to the Adventure, ${currentProfile.name}!`,
      subtitle: "Are you excited? Let's begin your magical journey!",
      progressTitle: "Ready for Adventure",
      buttonText: {
        main: "Start Adventure",
        sub: "Begin your magical journey through Symbol Mountain"
      }
    };
  } else {
    const title = recentAchievement 
      ? `Amazing Work, ${currentProfile.name}!`
      : `Welcome Back, ${currentProfile.name}!`;
      
    return {
      title: title,
      subtitle: recentAchievement 
        ? "You're making incredible progress!" 
        : "Ready to continue your magical journey?",
      progressTitle: "Your Journey So Far",
      buttonText: getContinueButtonText()
    };
  }
};
  
  const handleProfileSelect = (profileId) => {
    try {
      console.log('🎯 Profile selected:', profileId);
      
      // Load profiles fresh to get the selected one
      const gameProfiles = GameStateManager.getProfiles();
      const profilesObj = gameProfiles?.profiles || {};
      
      // Set as active profile in GameStateManager
      GameStateManager.setActiveProfile(profileId);
      
      // Load the selected profile
      const selectedProfile = profilesObj[profileId];
      setCurrentProfile(selectedProfile);
      
      // Check progress for selected profile
      console.log('🔍 About to check progress for selected profile...');
      checkProgress(profileId);
      
      // Close profile selector and show welcome screen (Image 2)
      setShowProfileSelector(false);
    } catch (error) {
      console.error('Profile selection error:', error);
    }
  };
  
  const handleProfileCreated = (profileId) => {
    // Reload profiles after creation
    const gameProfiles = GameStateManager.getProfiles();
    const profilesObj = gameProfiles?.profiles || {};
    setProfiles(profilesObj);
    
    // Select the newly created profile
    handleProfileSelect(profileId);
  };
  
  const handleBackToProfiles = () => {
    setCurrentProfile(null);
    setHasProgress(false);
    setShowProfileSelector(true);
  };

// 🔄 REPLACE the handleContinue function in CleanGameWelcomeScreen.jsx:
const handleContinue = () => {
  console.log('🚀 SIMPLE: Continue Journey clicked');
  
  // ✅ DEAD SIMPLE: Check if there's a saved scene location
  const resumeLocation = SimpleSceneManager.getCurrentScene();
  
  if (resumeLocation) {
    console.log('➡️ SIMPLE: Resuming saved scene:', resumeLocation);
    onContinue(resumeLocation.zone, resumeLocation.scene);
  } else {
    console.log('🗺️ SIMPLE: No saved scene, going to map');
    onNewGame();
  }
};

  const handleNewGame = () => {
    console.log('🚀 Choose Scene clicked - clean handoff');
    // Always go to map zone for scene selection (this allows replay)
    onNewGame();
  };
  
  const confirmNewGame = () => {
    console.log('🚀 New game confirmed - clean handoff');
    GameStateManager.resetGame();
    setShowNewGameConfirm(false);
    onNewGame();
  };

// UPDATED handleProgressBoxClick function for CleanGameWelcomeScreen.jsx
// Replace your existing function with this one

// In CleanGameWelcomeScreen.jsx

const handleProgressBoxClick = (type) => {
  const culturalProgress = CulturalProgressExtractor.getCulturalProgressData();
  
  if (type === 'symbols') {
    // ✅ SYMBOLS: /images/symbols-symbolmountain/
    const allSymbols = [
      { 
        id: 'modak', 
        displayName: "Modak — Ganesha’s Sweet Treat!", 
        image: '/images/symbols-symbolmountain/symbol-modak-colored.png', 
        description: "A magical sweet that fills you with happy, joyful energy!", 
        //audio: '/audio/symbols/modak.mp3' 
      },
      { 
        id: 'mooshika', 
        displayName: "Mooshika — Ganesha’s Clever Friend!", 
        image: '/images/symbols-symbolmountain/symbol-mooshika-colored.png', 
        description: "A tiny mouse with a big heart! Mooshika helps Ganesha travel anywhere and reminds us to stay humble & smart.", 
        //audio: '/audio/symbols/mooshika.mp3' 
      },
      { 
        id: 'belly', 
        displayName: "Belly — Big Happy Tummy!", 
        image: '/images/symbols-symbolmountain/symbol-belly-colored.png', 
        description: "Ganesha’s big belly holds all worries and turns them into calm. It reminds us to feel safe, relaxed and happy inside.", 
        //audio: '/audio/symbols/belly.mp3' 
      },
      { 
        id: 'lotus', 
        displayName: "Lotus — Pure & Peaceful Heart", 
        image: '/images/symbols-symbolmountain/symbol-lotus-colored.png', 
        description: "The lotus grows clean even in mud! It teaches us to stay calm, kind, and good inside.", 
        //audio: '/audio/symbols/lotus.mp3' 
      },
      { 
        id: 'trunk', 
        displayName: "Trunk — Strength with Flexibility", 
        image: '/images/symbols-symbolmountain/symbol-trunk-colored.png', 
        description: "Ganesha’s trunk is powerful yet gentle — showing us that real strength is soft, kind & adaptable.", 
        //audio: '/audio/symbols/trunk.mp3' 
      },
      { 
        id: 'eyes', 
        displayName: "Eyes — Divine Vision", 
        image: '/images/symbols-symbolmountain/symbol-eyes-colored.png', 
        description: "Ganesha sees the good in everyone! His eyes remind us to look with love, curiosity & wonder.", 
        //audio: '/audio/symbols/eyes.mp3' 
      },
      { 
        id: 'ears', 
        displayName: "Ears — Listen with Love", 
        // ⚠️ Filename is singular 'ear' in your screenshot
        image: '/images/symbols-symbolmountain/symbol-ear-colored.png', 
        description: "Big ears to hear prayers, stories & feelings! They teach us to listen carefully and understand others.", 
        //audio: '/audio/symbols/ears.mp3' 
      },
      { 
        id: 'tusk', 
        displayName: "Tusks — Perfect Imperfection", 
        image: '/images/symbols-symbolmountain/symbol-tusk-colored.png', 
        description: "One broken, one whole — reminding us that even with flaws, we are powerful, unique & complete!", 
        //audio: '/audio/symbols/tusk.mp3' 
      }
    ];
    
    const items = allSymbols.map(s => ({
      id: s.id,
      name: s.displayName,
      image: s.image,
      description: s.description,
      audio: s.audio
    }));
    
    setPopupData({
      title: 'Sacred Symbols',
      items: items,
      completedItems: (culturalProgress.discoveredSymbols || []).map(s => s.name), 
      type: 'symbols'
    });
  }
  else if (type === 'meanings') {
    // ✅ MEANINGS: /images/meanings-caveofsecrets/
    const allMeanings = [
      { 
        id: 'vakratunda', 
        displayName: "Vakratunda", 
        subtitle: "Curved Trunk!", 
        image: '/images/meanings-caveofsecrets/vakratunda-symbol.png',
        description: "A curvy trunk that lifts anything — tiny or huge! Powerful yet gentle — just like Ganesha. ✨",
        audio: '/audio/meanings/vakratunda.mp3'
      },
      { 
        id: 'mahakaya', 
        displayName: "Mahakaya", 
        subtitle: "Mighty Form!", 
        image: '/images/meanings-caveofsecrets/mahakaya-symbol.png',
        description: "Ganesha’s body is big, strong and steady like a mountain! A powerful protector with a warm, loving heart. ❤️",
        audio: '/audio/meanings/mahakaya.mp3'
      },
      { 
        id: 'suryakoti', 
        displayName: "Suryakoti", 
        subtitle: "Brighter Than Suns!", 
        image: '/images/meanings-caveofsecrets/suryakoti-symbol.png',
        description: "Ganesha shines brighter than millions of suns! His light removes fear and fills us with joy. ☀️",
        audio: '/audio/meanings/suryakoti.mp3'
      },
      { 
        id: 'samaprabha', 
        displayName: "Samaprabha", 
        subtitle: "Radiant Glow!", 
        image: '/images/meanings-caveofsecrets/samaprabha-symbol.png',
        description: "A divine glow that brightens everything around him! Where Ganesha is, light and happiness follow. ✨",
        audio: '/audio/meanings/samaprabha.mp3'
      },
      { 
        id: 'nirvighnam', 
        displayName: "Sarva-Vighnam", 
        subtitle: "Remove All Obstacles!", 
        image: '/images/meanings-caveofsecrets/nirvighnam-symbol.png',
        description: "Ganesha clears the path when things get tough. Try bravely — he helps us move forward. 🚧➡️✨",
        audio: '/audio/meanings/nirvighnam.mp3'
      },
      { 
        id: 'kurumedeva', 
        displayName: "Kurumedeva", 
        subtitle: "O Lord, Guide Me!", 
        image: '/images/meanings-caveofsecrets/kurumedeva-symbol.png',
        description: "We ask Ganesha to help us learn and move ahead. With effort + blessings, great things happen. 🧡",
        audio: '/audio/meanings/kurumedeva.mp3'
      },
      { 
        id: 'sarvakaryeshu', 
        displayName: "Sarva-Karyeshu", 
        subtitle: "In All Tasks!", 
        image: '/images/meanings-caveofsecrets/sarvakaryeshu-symbol.png',
        description: "For every work — big or small — he is with us. We try with focus, he supports with grace. 🌿",
        audio: '/audio/meanings/sarvakaryeshu.mp3'
      },
      { 
        id: 'sarvada', 
        displayName: "Sarvada", 
        subtitle: "Always!", 
        image: '/images/meanings-caveofsecrets/sarvada-symbol.png',
        description: "Ganesha’s love and blessings stay always with us. Forever guiding, forever protecting. 💛",
        audio: '/audio/meanings/sarvada.mp3'
      }
    ];
    
    const items = allMeanings.map(m => ({
      id: m.id,
      name: m.displayName,
      subtitle: m.subtitle,
      image: m.image,
      description: m.description,
      audio: m.audio
    }));
    
    setPopupData({
      title: 'Meanings Learned',
      items: items,
      completedItems: (culturalProgress.learnedMeanings || []).map(m => m.name),
      type: 'meanings'
    });
  }
  else if (type === 'chants') {
    // ✅ CHANTS: /images/apps-shlokariver/
    const allChants = [
      { 
        id: 'vakratunda-chant', 
        displayName: 'Vakratunda', 
        // ⚠️ Matches "app-Vakratunda.png" (Capital V in screenshot)
        image: '/images/apps-shlokariver/app-Vakratunda.png', 
        audio: '/audio/chants/vakratunda_full.mp3' 
      },
      { id: 'mahakaya-chant', displayName: 'Mahakaya', image: '/images/apps-shlokariver/app-mahakaya.png', audio: '/audio/chants/mahakaya_full.mp3' },
      { id: 'suryakoti-chant', displayName: 'Surya Koti', image: '/images/apps-shlokariver/app-suryakoti.png', audio: '/audio/chants/suryakoti_full.mp3' },
      { id: 'samaprabha-chant', displayName: 'Samaprabha', image: '/images/apps-shlokariver/app-samaprabha.png', audio: '/audio/chants/samaprabha_full.mp3' },
      { id: 'nirvighnam-chant', displayName: 'Nirvighnam', image: '/images/apps-shlokariver/app-nirvighnam.png', audio: '/audio/chants/nirvighnam_full.mp3' },
      { id: 'kurumedeva-chant', displayName: 'Kurume Deva', image: '/images/apps-shlokariver/app-kurumedeva.png', audio: '/audio/chants/kurumedeva_full.mp3' },
      { id: 'sarvakaryeshu-chant', displayName: 'Sarvakaryeshu', image: '/images/apps-shlokariver/app-sarvakaryeshu.png', audio: '/audio/chants/sarvakaryeshu_full.mp3' },
      { id: 'sarvada-chant', displayName: 'Sarvada', image: '/images/apps-shlokariver/app-sarvada.png', audio: '/audio/chants/sarvada_full.mp3' }
    ];
    
    const items = allChants.map(c => ({
      id: c.id,
      name: c.displayName,
      image: c.image,
      description: "Tap to listen to the sacred chant 🎵",
      audio: c.audio
    }));
    
    setPopupData({
      title: 'Sanskrit Chants',
      items: items,
      completedItems: (culturalProgress.chantedShlokas || []).map(c => c.chantId), 
      type: 'chants'
    });
  }
  
  setShowPopup(true);
};

const isZoneComplete = (count) => count >= 8;
  
  // 🌟 CULTURAL PROGRESS: Replace getProgress() with cultural data
  const getCulturalProgress = () => {
    if (!currentProfile) return { 
      symbols: 0, 
     meanings: 0,
      chants: 0, 
      level: 1, 
      levelName: "Wisdom Seeker",
      percentage: 0 
    };
    
    try {
      // Get cultural progress using the extractor
      const culturalData = CulturalProgressExtractor.getCulturalProgressData();
      
      return {
        symbols: culturalData.symbolsCount || 0,
 meanings: culturalData.meaningsCount || 0,
         chants: culturalData.chantsCount || 0,
        level: culturalData.level || 1,
        levelName: culturalData.levelName || "Wisdom Seeker",
        percentage: Math.min(100, Math.max(0, (culturalData.totalLearnings || 0) * 8))
      };
    } catch (error) {
      console.error('Cultural progress calculation error:', error);
      return { 
        symbols: 0, 
       meanings: 0,
        chants: 0, 
        level: 1, 
        levelName: "Wisdom Seeker",
        percentage: 0 
      };
    }
  };
  
  const culturalProgress = getCulturalProgress();
  
  // Show profile selector if needed
  if (showProfileSelector) {
    return (
      <CleanProfileSelector
        onProfileSelect={handleProfileCreated}
        onClose={() => setShowProfileSelector(false)}
        profiles={profiles}
      />
    );
  }
  
  // Main menu for selected profile (only shown when profile is selected)
  if (!currentProfile) {
    // This should rarely happen due to initialization logic, but safety fallback
    return (
      <div className="clean-welcome-overlay">
        <div className="clean-welcome-content">
          <h1>Loading Profile...</h1>
          <button onClick={() => setShowProfileSelector(true)}>
            Select Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="clean-welcome-overlay">
      <div className="clean-welcome-content">
{(() => {
  const welcomeMsg = getWelcomeMessage();
  return (
    <>
      <h1 className="welcome-title">{welcomeMsg.title}</h1>
      <p className="welcome-subtitle">{welcomeMsg.subtitle}</p>
    </>
  );
})()}        
       

 {/* ✨ ENHANCED: Better profile layout */}
        <div className="enhanced-profile-section">
          <div className="profile-header">
            <div className="profile-avatar-container">
              {(() => {
                const getAnimalId = (avatarData) => {
                  console.log('🔍 Avatar data in Welcome Screen:', avatarData);
                  
                  // If it's already an animal ID from CleanProfileSelector
                  if (typeof avatarData === 'string' && ['monkey', 'peacock', 'squirrel', 'tiger'].includes(avatarData)) {
                    console.log('✅ Using animal ID directly:', avatarData);
                    return avatarData;
                  }
                  
                  // Convert emoji to animal ID (for backwards compatibility)
                  const emojiToAnimal = {
                    '🐵': 'monkey',
                    '🦚': 'peacock', 
                    '🐿️': 'squirrel',
                    '🐯': 'tiger'
                  };
                  
                  if (emojiToAnimal[avatarData]) {
                    console.log('✅ Converted emoji to animal:', emojiToAnimal[avatarData]);
                    return emojiToAnimal[avatarData];
                  }
                  
                  console.log('⚠️ Fallback to monkey');
                  return 'monkey';
                };

                const animalId = getAnimalId(currentProfile.avatar);
                
                return (
                  <img 
                    className="profile-avatar-large" 
                    src={`/images/new-explorer-${animalId}.png`}
                    alt={currentProfile.name}
                    onError={(e) => {
                      // Fallback to emoji if image doesn't load
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'profile-avatar-fallback';
                      fallback.textContent = currentProfile.avatar;
                      e.target.parentNode.appendChild(fallback);
                    }}
                  />
                );
              })()}
            </div>
            
            <div className="profile-info">
              <h2 className="profile-name-large">{currentProfile.name}</h2>
              {/*<div className="profile-role">
                Explorer of {currentProfile.selectedZone?.name || 'Symbol Mountain'}
              </div>*/}
            </div>
          </div>
          
          {/* ONLY SHOW "Choose Different Explorer" button for RETURNING users */}
          {hasProgress && (
            <button 
              className="change-explorer-btn"
              onClick={handleBackToProfiles}
            >
              <span className="btn-icon">🔄</span>
              Choose Different Explorer
            </button>
          )}
        </div>
        
        {/* ✨ NEW: Recent Achievement Banner */}
        <RecentAchievementBanner achievement={getRecentAchievement()} />
        
        {/* PROGRESS CARD - Brown Box (Only for RETURNING users) */}
        {hasProgress && (
          <div className="overall-progress">
            <h3>{getWelcomeMessage().progressTitle}</h3>
            
            <div className="compact-stats-container">
              <div className="level-green-card">
                <span className="level-header">LEVEL {culturalProgress.level}</span>
                <div className="level-divider"></div>
                <div className="level-icon-center">❂</div>
                <span className="level-role-name">{culturalProgress.levelName}</span>
              </div>

    <div className="stats-list-vertical">
  <div 
    className={`stat-clean-row ${isZoneComplete(culturalProgress.symbols) ? 'completed' : ''}`}
    onClick={() => handleProgressBoxClick('symbols')}
  >
    {isZoneComplete(culturalProgress.symbols) && (
      <div className="completion-badge">
        <span className="star-icon">⭐</span>
      </div>
    )}
    <span className="stat-icon-clean">⭐</span>
    <span className="stat-text-clean">{culturalProgress.symbols} Sacred Symbols</span>
  </div>
  
  <div 
    className={`stat-clean-row ${isZoneComplete(culturalProgress.meanings) ? 'completed' : ''}`}
    onClick={() => handleProgressBoxClick('meanings')}
  >
    {isZoneComplete(culturalProgress.meanings) && (
      <div className="completion-badge">
        <span className="star-icon">⭐</span>
      </div>
    )}
    <span className="stat-icon-clean">📜</span>
    <span className="stat-text-clean">{culturalProgress.meanings} Meanings Learned</span>
  </div>
  
  <div 
    className={`stat-clean-row ${isZoneComplete(culturalProgress.chants) ? 'completed' : ''}`}
    onClick={() => handleProgressBoxClick('chants')}
  >
    {isZoneComplete(culturalProgress.chants) && (
      <div className="completion-badge">
        <span className="star-icon">⭐</span>
      </div>
    )}
    <span className="stat-icon-clean">🎵</span>
    <span className="stat-text-clean">{culturalProgress.chants} Sanskrit Chants</span>
  </div>
</div>
            </div>

            <div className="progress-bar-large">
              <div 
                className="progress-fill-large"
                style={{width: `${culturalProgress.percentage}%`}}
              />
            </div>
          </div>
        )}

        {/* ACTION BUTTONS - Different for NEW vs RETURNING users */}
        <div className="welcome-actions">
          {hasProgress ? (
            // RETURNING USER: Continue Journey + Explore Scenes
            <>
              <button className="primary-btn enhanced-btn" onClick={handleContinue}>
                {getWelcomeMessage().buttonText.main}
                <span className="sub-text">{getWelcomeMessage().buttonText.sub}</span>
              </button>
              
              <button className="secondary-btn" onClick={handleNewGame}>
                Explore Scenes
                <span className="sub-text">Replay any scene</span>
              </button>
            </>
          ) : (
            // NEW USER: Start Adventure + Choose Different Explorer
            <>
              <button className="primary-btn enhanced-btn" onClick={handleContinue}>
                Start Adventure
                {/*<span className="sub-text">Begin your magical journey</span>*/}
              </button>
              
              <button className="secondary-btn" onClick={handleBackToProfiles}>
                Choose Different Explorer
                {/*<span className="sub-text">Pick another character</span>*/}
              </button>
            </>
          )}
        </div>
      </div>
      
      {showNewGameConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">🤔</div>
            <h3>Reset All Progress?</h3>
            <p>
              This will erase {currentProfile.name}'s current progress. 
              You can also just pick any scene to replay without losing progress!
            </p>
            <div className="confirm-progress">
<span>Cultural Learning: {culturalProgress.symbols} symbols, {culturalProgress.meanings} meanings</span>
              <span>Heritage Level: {culturalProgress.levelName}</span>
            </div>
            <div className="confirm-buttons">
              <button 
                className="confirm-yes-btn"
                onClick={confirmNewGame}
              >
                Yes, Reset Everything
              </button>
              <button 
                className="confirm-no-btn"
                onClick={() => setShowNewGameConfirm(false)}
              >
                No, Keep Progress
              </button>
            </div>
          </div>
        </div>
      )}

      <ProgressPopup
  isOpen={showPopup}
  onClose={() => setShowPopup(false)}
  title={popupData?.title}
  items={popupData?.items || []}
  completedItems={popupData?.completedItems || []}
  type={popupData?.type}
/>
    </div>
  );
};

export default CleanGameWelcomeScreen;
