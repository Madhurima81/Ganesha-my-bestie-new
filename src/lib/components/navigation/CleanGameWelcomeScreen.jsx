// CleanGameWelcomeScreen.jsx - FINAL CLEAN VERSION
import React, { useState, useEffect, useRef } from 'react';
import GameStateManager from '../../services/GameStateManager';
import CleanProfileSelector from './CleanProfileSelector';
import PrimaryBtn from '../shared/PrimaryBtn';
import './CleanGameWelcomeScreen.css';
import SimpleSceneManager from '../../services/SimpleSceneManager';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import ProgressPopup from './ProgressPopup';
import { symbolCardContent } from '../../../zones/symbol-mountain/shared/components/symbolCardContent';
import { playUiTap } from '../../services/AudioService';

const CleanGameWelcomeScreen = ({ onContinue, onNewGame, onParentCorner }) => {
  const [profiles, setProfiles] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const ambientRef = useRef(null);
  const fadeRef = useRef(null);

  // Clean initialization
  useEffect(() => {
    initializeClean();
  }, []);

  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const TARGET_VOL = 0.16;
    const fadeIn = () => {
      clearInterval(fadeRef.current);
      audio.volume = 0;
      audio.play().catch(() => {});
      fadeRef.current = setInterval(() => {
        const next = Math.min(audio.volume + 0.02, TARGET_VOL);
        audio.volume = next;
        if (next >= TARGET_VOL) clearInterval(fadeRef.current);
      }, 80);
    };

    fadeIn();

    const onFirstInteraction = () => {
      if (audio.paused) fadeIn();
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(fadeRef.current);
        audio.pause();
      } else {
        fadeIn();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(fadeRef.current);
      audio.pause();
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [currentProfile, showProfileSelector]);
  
  const initializeClean = () => {
    try {
      const gameProfiles = GameStateManager.getProfiles();
      const profilesObj = gameProfiles?.profiles || {};
      setProfiles(profilesObj);
      
      const activeProfileId = localStorage.getItem('activeProfileId');
      if (activeProfileId && profilesObj[activeProfileId]) {
        handleProfileSelect(activeProfileId);
      } else {
        setShowProfileSelector(true);
      }
    } catch (error) {
      console.error('Clean initialization error:', error);
      setProfiles({});
      setShowProfileSelector(true);
    }
  };

  // Check Progress (Logic kept same as before)
  const checkProgress = (profileId) => {
    if (!profileId) return;
    
    try {
      // 1. Check Temp Sessions
      const tempKeys = [
        `temp_session_${profileId}_symbol-mountain_pond`,
        `temp_session_${profileId}_symbol-mountain_modak`,
        `temp_session_${profileId}_symbol-mountain_symbol`,
        `temp_session_${profileId}_symbol-mountain_final-scene`,
        `temp_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`,
        `temp_session_${profileId}_cave-of-secrets_suryakoti-samaprabha`,
        `temp_session_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`,
        `temp_session_${profileId}_cave-of-secrets_sarvakaryeshu-sarvada`,
        `temp_session_${profileId}_cave-of-secrets_mantra-assembly`,
        `temp_session_${profileId}_shloka-river_vakratunda-grove`,
        `temp_session_${profileId}_shloka-river_suryakoti-bank`,
        `temp_session_${profileId}_shloka-river_nirvighnam-chant`,
        `temp_session_${profileId}_shloka-river_sarvakaryeshu-chant`,
        `temp_session_${profileId}_shloka-river_shloka-river-finale`,
        `temp_session_${profileId}_festival-square_game1`,
        `temp_session_${profileId}_festival-square_game2`,
        `temp_session_${profileId}_festival-square_game3`,
        `temp_session_${profileId}_festival-square_game4`
      ];

      if (tempKeys.some(key => localStorage.getItem(key))) {
        setHasProgress(true);
        return;
      }
      
      // 2. Check Permanent Progress
      let foundAnyProgress = false;
      Object.keys(localStorage).forEach(key => {
        if (key.includes(profileId) && (key.includes('sceneState') || key.includes('_state'))) {
          try {
            const state = JSON.parse(localStorage.getItem(key) || '{}');
            if (state.completed || (state.stars && state.stars > 0)) {
              foundAnyProgress = true;
            }
          } catch(e) {}
        }
      });
      
      if (foundAnyProgress) {
        setHasProgress(true);
        return;
      }

      setHasProgress(false);

    } catch (error) {
      console.error('Progress check error:', error);
      setHasProgress(false);
    }
  };

  const getWelcomeMessage = () => {
    return {
      title: `Hi ${currentProfile?.name || ''}, let's go!`,
      buttonText: { main: 'Start Adventure' }
    };
  };
  
  const handleProfileSelect = (profileId) => {
    const gameProfiles = GameStateManager.getProfiles();
    const profilesObj = gameProfiles?.profiles || {};
    GameStateManager.setActiveProfile(profileId);
    const selectedProfile = profilesObj[profileId];
    setCurrentProfile(selectedProfile);
    checkProgress(profileId);
    setShowProfileSelector(false);
  };
  
  const handleProfileCreated = (profileId) => {
    const gameProfiles = GameStateManager.getProfiles();
    setProfiles(gameProfiles?.profiles || {});
    handleProfileSelect(profileId);
  };
  
  const handleBackToProfiles = () => {
    playUiTap(0.22);
    setCurrentProfile(null);
    setHasProgress(false);
    setShowProfileSelector(true);
  };

  // Returns { zone, scene } for the most recently played location.
  // scene is null if that session was completed â†’ caller goes to zone-welcome.
  // scene is set if session was mid-game â†’ caller resumes that scene.
  const getLastPlayedLocation = (profileId) => {
    if (!profileId) return null;

    const ZONE_SCENES = [
      { zone: 'symbol-mountain',  scenes: ['pond', 'modak', 'symbol', 'final-scene'] },
      { zone: 'cave-of-secrets',  scenes: ['vakratunda-mahakaya', 'suryakoti-samaprabha', 'nirvighnam-kurumedeva', 'sarvakaryeshu-sarvada', 'mantra-assembly'] },
      { zone: 'shloka-river',     scenes: ['vakratunda-grove', 'suryakoti-bank', 'nirvighnam-chant', 'sarvakaryeshu-chant', 'shloka-river-finale'] },
      { zone: 'festival-square',  scenes: ['game1', 'game2', 'game3', 'game4'] },
      { zone: 'about-me-hut',     scenes: ['family-tree', 'favorite-food', 'dreams-wishes', 'my-indian-story'] },
    ];

    // 1. Scan temp sessions â€” most recently touched wins
    let latestZone = null;
    let latestScene = null;
    let latestCompleted = false;
    let latestTimestamp = 0;

    for (const { zone, scenes } of ZONE_SCENES) {
      for (const scene of scenes) {
        const raw = localStorage.getItem(`temp_session_${profileId}_${zone}_${scene}`);
        if (!raw) continue;
        try {
          const data = JSON.parse(raw);
          const ts = data?.lastSaved || data?.timestamp || 1;
          if (ts > latestTimestamp) {
            latestTimestamp = ts;
            latestZone = zone;
            latestScene = scene;
            // Treat as completed if any completion signal is present
            latestCompleted = !!(
              data.completed === true ||
              data.phase === 'complete' ||
              data.phase === 'all_complete' ||
              data.phase === 'zone-complete' ||
              data.showingCompletionScreen === true ||
              data.showingZoneCompletion === true
            );
          }
        } catch {
          if (!latestZone) { latestZone = zone; latestScene = scene; latestCompleted = false; }
        }
      }
    }

    if (latestZone) {
      return { zone: latestZone, scene: latestCompleted ? null : latestScene };
    }

    // 2. Permanent progress fallback â€” last zone with any completed scene â†’ zone-welcome
    try {
      const gameProgress = GameStateManager.getGameProgress();
      const zones = gameProgress?.zones || {};
      for (const { zone } of [...ZONE_SCENES].reverse()) {
        const zoneData = zones[zone];
        if (zoneData?.scenes && Object.values(zoneData.scenes).some(s => s.completed)) {
          return { zone, scene: null };
        }
      }
    } catch (e) {}

    return null;
  };

  const handleContinue = () => {
    playUiTap(0.22);
    const profileId = localStorage.getItem('activeProfileId');
    const location = getLastPlayedLocation(profileId);

    if (location) {
      // scene set   â†’ mid-game â†’ resume that scene
      // scene null  â†’ completed â†’ go to zone welcome
      onContinue(location.zone, location.scene);
      return;
    }

    // Nothing found â†’ map
    onNewGame();
  };

  const handleNewGame = () => {
    playUiTap(0.22);
    onNewGame();
  };
  
  const confirmNewGame = () => {
    playUiTap(0.22);
    GameStateManager.resetGame();
    setShowNewGameConfirm(false);
    onNewGame();
  };

  // =========================================================
  // POPUP DATA HANDLER (Updated with Images & Descriptions)
  // =========================================================
  const handleProgressBoxClick = (type) => {
    playUiTap(0.2);
    const culturalProgress = CulturalProgressExtractor.getCulturalProgressData();
    
    if (type === 'symbols') {
      const allSymbols = Object.entries(symbolCardContent).map(([id, data]) => ({
        id,
        displayName: data.label || data.title || id,
        image: data.icon || data.image,
        description: data.description || data.gift || '',
      }));
      
      const items = allSymbols.map(s => ({
        id: s.id, name: s.displayName, image: s.image, description: s.description, audio: s.audio
      }));
      
      setPopupData({
        title: 'Sacred Symbols',
        items: items,
        completedItems: (culturalProgress.discoveredSymbols || []).map(s => s.name), 
        type: 'symbols'
      });
    }
    else if (type === 'meanings') {
      const allMeanings = [
        { 
          id: 'vakratunda', displayName: "Vakratunda", subtitle: "Curved Trunk!", 
          image: '/images/meanings-caveofsecrets/vakratunda-symbol.png',
          description: "A curvy trunk that lifts anything â€” tiny or huge! Powerful yet gentle â€” just like Ganesha. âœ¨",
          audio: '/audio/meanings/vakratunda.mp3'
        },
        { 
          id: 'mahakaya', displayName: "Mahakaya", subtitle: "Mighty Form!", 
          image: '/images/meanings-caveofsecrets/mahakaya-symbol.png',
          description: "Ganesha's body is big, strong and steady like a mountain! A powerful protector with a warm, loving heart. â¤ï¸",
          audio: '/audio/meanings/mahakaya.mp3'
        },
        { 
          id: 'suryakoti', displayName: "Suryakoti", subtitle: "Brighter Than Suns!", 
          image: '/images/meanings-caveofsecrets/suryakoti-symbol.png',
          description: "Ganesha shines brighter than millions of suns! His light removes fear and fills us with joy. â˜€ï¸",
          audio: '/audio/meanings/suryakoti.mp3'
        },
        { 
          id: 'samaprabha', displayName: "Samaprabha", subtitle: "Radiant Glow!", 
          image: '/images/meanings-caveofsecrets/samaprabha-symbol.png',
          description: "A divine glow that brightens everything around him! Where Ganesha is, light and happiness follow. âœ¨",
          audio: '/audio/meanings/samaprabha.mp3'
        },
        { 
          id: 'nirvighnam', displayName: "Sarva-Vighnam", subtitle: "Remove All Obstacles!", 
          image: '/images/meanings-caveofsecrets/nirvighnam-symbol.png',
          description: "Ganesha clears the path when things get tough. Try bravely â€” he helps us move forward. ðŸš§âž¡ï¸âœ¨",
          audio: '/audio/meanings/nirvighnam.mp3'
        },
        { 
          id: 'kurumedeva', displayName: "Kurumedeva", subtitle: "O Lord, Guide Me!", 
          image: '/images/meanings-caveofsecrets/kurumedeva-symbol.png',
          description: "We ask Ganesha to help us learn and move ahead. With effort + blessings, great things happen. ðŸ§¡",
          audio: '/audio/meanings/kurumedeva.mp3'
        },
        { 
          id: 'sarvakaryeshu', displayName: "Sarva-Karyeshu", subtitle: "In All Tasks!", 
          image: '/images/meanings-caveofsecrets/sarvakaryeshu-symbol.png',
          description: "For every work â€” big or small â€” he is with us. We try with focus, he supports with grace. ðŸŒ¿",
          audio: '/audio/meanings/sarvakaryeshu.mp3'
        },
        { 
          id: 'sarvada', displayName: "Sarvada", subtitle: "Always!", 
          image: '/images/meanings-caveofsecrets/sarvada-symbol.png',
          description: "Ganesha's love and blessings stay always with us. Forever guiding, forever protecting. ðŸ’›",
          audio: '/audio/meanings/sarvada.mp3'
        }
      ];
      
      const items = allMeanings.map(m => ({
        id: m.id, name: m.displayName, subtitle: m.subtitle, image: m.image, description: m.description, audio: m.audio
      }));
      
      setPopupData({
        title: 'Meanings Learned',
        items: items,
        completedItems: (culturalProgress.learnedMeanings || []).map(m => m.name),
        type: 'meanings'
      });
    }
    else if (type === 'chants') {
      const allChants = [
        { id: 'vakratunda-chant', displayName: 'Vakratunda', image: '/images/apps-shlokariver/app-Vakratunda.png', audio: '/audio/chants/vakratunda_full.mp3' },
        { id: 'mahakaya-chant', displayName: 'Mahakaya', image: '/images/apps-shlokariver/app-mahakaya.png', audio: '/audio/chants/mahakaya_full.mp3' },
        { id: 'suryakoti-chant', displayName: 'Surya Koti', image: '/images/apps-shlokariver/app-suryakoti.png', audio: '/audio/chants/suryakoti_full.mp3' },
        { id: 'samaprabha-chant', displayName: 'Samaprabha', image: '/images/apps-shlokariver/app-samaprabha.png', audio: '/audio/chants/samaprabha_full.mp3' },
        { id: 'nirvighnam-chant', displayName: 'Nirvighnam', image: '/images/apps-shlokariver/app-nirvighnam.png', audio: '/audio/chants/nirvighnam_full.mp3' },
        { id: 'kurumedeva-chant', displayName: 'Kurume Deva', image: '/images/apps-shlokariver/app-kurumedeva.png', audio: '/audio/chants/kurumedeva_full.mp3' },
        { id: 'sarvakaryeshu-chant', displayName: 'Sarvakaryeshu', image: '/images/apps-shlokariver/app-sarvakaryeshu.png', audio: '/audio/chants/sarvakaryeshu_full.mp3' },
        { id: 'sarvada-chant', displayName: 'Sarvada', image: '/images/apps-shlokariver/app-sarvada.png', audio: '/audio/chants/sarvada_full.mp3' }
      ];
      
      const items = allChants.map(c => ({
        id: c.id, name: c.displayName, image: c.image, description: "Tap to listen to the sacred chant ðŸŽµ", audio: c.audio
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
  
  const getCulturalProgress = () => {
    if (!currentProfile) return { symbols: 0, meanings: 0, chants: 0, level: 1, levelName: "Wisdom Seeker", percentage: 0 };
    
    try {
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
      return { symbols: 0, meanings: 0, chants: 0, level: 1, levelName: "Wisdom Seeker", percentage: 0 };
    }
  };
  
  const culturalProgress = getCulturalProgress();
  
  // Show profile selector
  if (showProfileSelector) {
    return (
      <CleanProfileSelector
        onProfileSelect={handleProfileCreated}
        onClose={() => setShowProfileSelector(false)}
        profiles={profiles}
      />
    );
  }
  
  if (!currentProfile) {
    return (
      <div className="clean-welcome-overlay page-transition">
        <div className="clean-welcome-content">
          <h1>Loading Profile...</h1>
          <button onClick={() => { playUiTap(0.22); setShowProfileSelector(true); }}>Select Profile</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="clean-welcome-overlay page-transition">
      <div className="clean-welcome-content">
                <h1 className="game-welcome-title">{getWelcomeMessage().title}</h1>

        {/* PROFILE SECTION */}
        <div className="enhanced-profile-section">
          <div className="profile-header">
            <div className="profile-avatar-container">
              {(() => {
                const getAnimalId = (avatarData) => {
                  if (typeof avatarData === 'string' && ['monkey', 'peacock', 'squirrel', 'tiger'].includes(avatarData)) return avatarData;
                  const emojiToAnimal = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
                  return emojiToAnimal[avatarData] || 'monkey';
                };
                const animalId = getAnimalId(currentProfile.avatar);
                return (
                  <img
                    className={`profile-avatar-large avatar ${animalId === 'squirrel' ? 'squirrel-avatar' : ''}`}
                    src={`/images/new-explorer-${animalId}.png`}
                    alt={currentProfile.name}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                );
              })()}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="welcome-actions">
          <PrimaryBtn
            label="Start Adventure"
            onClick={handleContinue}
            size="md"
            fullWidth
          />
        </div>
      </div>
      {showNewGameConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Reset All Progress?</h3>
            <p>This will erase {currentProfile.name}'s current progress.</p>
            <div className="confirm-buttons">
              <button className="confirm-yes-btn" onClick={confirmNewGame}>Yes, Reset Everything</button>
              <button className="confirm-no-btn" onClick={() => { playUiTap(0.22); setShowNewGameConfirm(false); }}>No, Keep Progress</button>
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
      <audio
        ref={ambientRef}
        src="/audio/ambient/map%20ambient%20sound.wav"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CleanGameWelcomeScreen;

