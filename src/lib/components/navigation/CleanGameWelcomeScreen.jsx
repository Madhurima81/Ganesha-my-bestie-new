// CleanGameWelcomeScreen.jsx - FINAL CLEAN VERSION
import React, { useState, useEffect, useRef } from 'react';
import GameStateManager from '../../services/GameStateManager';
import CleanProfileSelector from './CleanProfileSelector';
import PrimaryBtn from '../shared/PrimaryBtn';
import ScreenHeader from '../shared/ScreenHeader';
import './CleanGameWelcomeScreen.css';
import SimpleSceneManager from '../../services/SimpleSceneManager';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import ProgressPopup from './ProgressPopup';
import InnerMandala from '../celebration/InnerMandala';
import { symbolCardContent } from '../../../zones/symbol-mountain/shared/components/symbolCardContent';
import { playUiTap } from '../../services/AudioService';
import CloseButton from '../../../components/CloseButton';

const ZONE_SCENES = [
  { zone: 'symbol-mountain', scenes: ['pond', 'modak', 'symbol', 'final-scene'] },
  { zone: 'cave-of-secrets', scenes: ['vakratunda-mahakaya', 'suryakoti-samaprabha', 'nirvighnam-kurumedeva', 'sarvakaryeshu-sarvada', 'mantra-assembly'] },
  { zone: 'shloka-river', scenes: ['vakratunda-grove', 'suryakoti-bank', 'nirvighnam-chant', 'sarvakaryeshu-chant', 'shloka-river-finale'] },
  { zone: 'festival-square', scenes: ['game1', 'game2', 'game3', 'game4'] },
  { zone: 'about-me-hut', scenes: ['family-tree', 'favorite-food', 'dreams-wishes', 'my-indian-story'] },
];

const CleanGameWelcomeScreen = ({
  onContinue,
  onNewGame,
  onParentCorner,
  onClose,
  displayMode = 'fullscreen',
}) => {
  const [profiles, setProfiles] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const ambientRef = useRef(null);
  const fadeRef = useRef(null);
  const [audioOn, setAudioOn] = useState(() => {
    const v = localStorage.getItem('ganesha_audio_enabled');
    return v === null ? true : v === 'true';
  });

  const toggleAudio = () => {
    const next = !audioOn;
    localStorage.setItem('ganesha_audio_enabled', String(next));
    setAudioOn(next);
    if (next) playUiTap(0.22);
  };

  // Clean initialization
  useEffect(() => {
    initializeClean();
  }, []);

  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    // BLOCKER FIX: never autoplay ambient inside a modal — the sound toggle is
    // hidden in modal mode, so a layered ambient track had no way to be muted
    // and would stack on top of the underlying scene/map audio.
    const isModalMode = displayMode === 'modal';
    if (isModalMode || !audioOn) {
      clearInterval(fadeRef.current);
      audio.pause();
      audio.currentTime = 0;
      return;
    }

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
      document.removeEventListener('pointerdown', onFirstInteraction);
    };
    document.addEventListener('pointerdown', onFirstInteraction);

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
      document.removeEventListener('pointerdown', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [currentProfile, showProfileSelector, audioOn]);
  
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
      const tempKeys = ZONE_SCENES.flatMap(({ zone, scenes }) =>
        scenes.map((scene) => `temp_session_${profileId}_${zone}_${scene}`)
      );

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

  const isFirstTimeVisit = () => !hasProgress;

  const getWelcomeMessage = () => {
    const isFirstTime = isFirstTimeVisit();
    
    if (isFirstTime) {
      return {
        title: `Welcome to the Adventure, ${currentProfile.name}!`,
        subtitle: "Are you excited? Let's begin your magical journey!",
        progressTitle: "Ready for Adventure",
        buttonText: { main: "Start Adventure", sub: "Begin your magical journey" }
      };
    } else {
      return {
        title: `Welcome Back, ${currentProfile.name}!`,
        subtitle: "Ready to continue your magical journey?",
        progressTitle: "Your Journey So Far",
        buttonText: { main: "Continue Adventure", sub: "Resume from where you left off" }
      };
    }
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

  // Returns { zone, scene, destination? } for the most recently played location.
  // scene is null if that session was completed → caller goes to zone-welcome.
  // scene is set if session was mid-game → caller resumes that scene.
  const getLastPlayedLocation = (profileId) => {
    if (!profileId) return null;

    // 1. Scan temp sessions — most recently touched wins
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
            // Special-case: Symbol Mountain final-scene fireworks should RESUME,
            // not be treated as completed.
            const finalSceneFireworksActive =
              zone === 'symbol-mountain' &&
              scene === 'final-scene' &&
              (
                data.currentPopup === 'final_fireworks' ||
                data.showSparkle === 'final-fireworks' ||
                data.celebrationActive === true ||
                data.isOrbsRunning === true
              );

            // Treat as completed if completion signals are present,
            // except while final-scene fireworks are actively running.
            latestCompleted = !finalSceneFireworksActive && !!(
              data.completed === true ||
              data.phase === 'complete' ||
              data.phase === 'all_complete' ||
              data.phase === 'zone-complete' ||
              data.showingCompletionScreen === true ||
              data.showingZoneCompletion === true
            );
          }
        } catch {
          // BLOCKER FIX: malformed JSON must never be treated as a valid session —
          // previously this assigned latestZone/latestScene from garbage data,
          // which could hijack "Continue" into resuming the wrong scene.
          continue;
        }
      }
    }

    if (latestZone) {
      // Zone-complete in Symbol Mountain final-scene should land on MAP from Continue Journey.
      if (latestZone === 'symbol-mountain' && latestScene === 'final-scene' && latestCompleted) {
        return { zone: latestZone, scene: null, destination: 'map' };
      }
      return { zone: latestZone, scene: latestCompleted ? null : latestScene };
    }

    // 2. Permanent progress fallback — last zone with any completed scene → zone-welcome
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
      // Explicit destination override (used for zone-complete final-scene flow).
      if (location.destination === 'map') {
        onNewGame();
        return;
      }
      // scene set   → mid-game → resume that scene
      // scene null  → completed → go to zone welcome
      onContinue(location.zone, location.scene);
      return;
    }

    // Nothing found → map
    onNewGame();
  };

  const handleNewGame = () => {
    playUiTap(0.22);
    onNewGame();
  };

  const handleStartAdventure = () => {
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
  const handleProgressBoxClick = (type, options = {}) => {
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
        id: s.id, name: s.displayName, image: s.image, description: s.description
      }));

      const directSymbolId = options?.directSymbolId;
      
      setPopupData({
        title: 'Sacred Symbols',
        items: items,
        completedItems: completedSymbolKeys,
        type: 'symbols',
        directItemId: directSymbolId || null
      });
    }
    else if (type === 'meanings') {
      const allMeanings = [
        { 
          id: 'vakratunda', displayName: "Vakratunda", subtitle: "Curved Trunk!", 
          image: '/images/meanings-caveofsecrets/vakratunda-symbol.webp',
          description: "A curvy trunk that lifts anything — tiny or huge! Powerful yet gentle — just like Ganesha. ✨",
          audio: '/audio/meanings/vakratunda.mp3'
        },
        { 
          id: 'mahakaya', displayName: "Mahakaya", subtitle: "Mighty Form!", 
          image: '/images/meanings-caveofsecrets/mahakaya-symbol.png',
          description: "Ganesha's body is big, strong and steady like a mountain! A powerful protector with a warm, loving heart. ❤️",
          audio: '/audio/meanings/mahakaya.mp3'
        },
        { 
          id: 'suryakoti', displayName: "Suryakoti", subtitle: "Brighter Than Suns!", 
          image: '/images/meanings-caveofsecrets/suryakoti-symbol.png',
          description: "Ganesha shines brighter than millions of suns! His light removes fear and fills us with joy. ☀️",
          audio: '/audio/meanings/suryakoti.mp3'
        },
        { 
          id: 'samaprabha', displayName: "Samaprabha", subtitle: "Radiant Glow!", 
          image: '/images/meanings-caveofsecrets/samaprabha-symbol.png',
          description: "A divine glow that brightens everything around him! Where Ganesha is, light and happiness follow. ✨",
          audio: '/audio/meanings/samaprabha.mp3'
        },
        { 
          id: 'nirvighnam', displayName: "Sarva-Vighnam", subtitle: "Remove All Obstacles!", 
          image: '/images/meanings-caveofsecrets/nirvighnam-symbol.png',
          description: "Ganesha clears the path when things get tough. Try bravely — he helps us move forward. 🚧➡️✨",
          audio: '/audio/meanings/nirvighnam.mp3'
        },
        { 
          id: 'kurumedeva', displayName: "Kurumedeva", subtitle: "O Lord, Guide Me!", 
          image: '/images/meanings-caveofsecrets/kurumedeva-symbol.png',
          description: "We ask Ganesha to help us learn and move ahead. With effort + blessings, great things happen. 🧡",
          audio: '/audio/meanings/kurumedeva.mp3'
        },
        { 
          id: 'sarvakaryeshu', displayName: "Sarva-Karyeshu", subtitle: "In All Tasks!", 
          image: '/images/meanings-caveofsecrets/sarvakaryeshu-symbol.png',
          description: "For every work — big or small — he is with us. We try with focus, he supports with grace. 🌿",
          audio: '/audio/meanings/sarvakaryeshu.mp3'
        },
        { 
          id: 'sarvada', displayName: "Sarvada", subtitle: "Always!", 
          image: '/images/meanings-caveofsecrets/sarvada-symbol.png',
          description: "Ganesha's love and blessings stay always with us. Forever guiding, forever protecting. 💛",
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
        { id: 'vakratunda-chant', displayName: 'Vakratunda', image: '/images/apps-shlokariver/app-Vakratunda.webp', audio: '/audio/chants/vakratunda_full.mp3' },
        { id: 'mahakaya-chant', displayName: 'Mahakaya', image: '/images/apps-shlokariver/app-mahakaya.webp', audio: '/audio/chants/mahakaya_full.mp3' },
        { id: 'suryakoti-chant', displayName: 'Surya Koti', image: '/images/apps-shlokariver/app-suryakoti.webp', audio: '/audio/chants/suryakoti_full.mp3' },
        { id: 'samaprabha-chant', displayName: 'Samaprabha', image: '/images/apps-shlokariver/app-samaprabha.webp', audio: '/audio/chants/samaprabha_full.mp3' },
        { id: 'nirvighnam-chant', displayName: 'Nirvighnam', image: '/images/apps-shlokariver/app-nirvighnam.webp', audio: '/audio/chants/nirvighnam_full.mp3' },
        { id: 'kurumedeva-chant', displayName: 'Kurume Deva', image: '/images/apps-shlokariver/app-kurumedeva.webp', audio: '/audio/chants/kurumedeva_full.mp3' },
        { id: 'sarvakaryeshu-chant', displayName: 'Sarvakaryeshu', image: '/images/apps-shlokariver/app-sarvakaryeshu.webp', audio: '/audio/chants/sarvakaryeshu_full.mp3' },
        { id: 'sarvada-chant', displayName: 'Sarvada', image: '/images/apps-shlokariver/app-sarvada.webp', audio: '/audio/chants/sarvada_full.mp3' }
      ];
      
      const items = allChants.map(c => ({
        id: c.id, name: c.displayName, image: c.image, description: "Tap to listen to the sacred chant 🎵", audio: c.audio
      }));

      const directChantId = options?.directChantId;
      
      setPopupData({
        title: 'Sanskrit Chants',
        items: items,
        completedItems: (culturalProgress.chantedShlokas || []).map(c => c.chantId), 
        type: 'chants',
        directItemId: directChantId || null
      });
    }
    
    setShowPopup(true);
  };

  const getCulturalProgress = () => {
    if (!currentProfile) return { symbols: 0, meanings: 0, chants: 0, level: 1, levelName: "Wisdom Seeker", discoveredSymbols: [] };
    
    try {
      const culturalData = CulturalProgressExtractor.getCulturalProgressData();
      return {
        symbols: culturalData.symbolsCount || 0,
        meanings: culturalData.meaningsCount || 0,
        chants: culturalData.chantsCount || 0,
        discoveredSymbols: culturalData.discoveredSymbols || [],
        level: culturalData.level || 1,
        levelName: culturalData.levelName || "Wisdom Seeker"
      };
    } catch (error) {
      return { symbols: 0, meanings: 0, chants: 0, level: 1, levelName: "Wisdom Seeker", discoveredSymbols: [] };
    }
  };
  
  const culturalProgress = getCulturalProgress();

  const normalizeSymbolKey = (value) => {
    const raw = (value || '').toString().toLowerCase().trim();
    if (raw.includes('mooshika')) return 'mooshika';
    if (raw.includes('modak')) return 'modak';
    if (raw.includes('belly')) return 'belly';
    if (raw.includes('lotus')) return 'lotus';
    if (raw.includes('trunk')) return 'trunk';
    if (raw.includes('ear')) return 'ear';
    if (raw.includes('eye')) return 'eyes';
    if (raw.includes('tusk')) return 'tusk';
    return null;
  };

  const collectCompletedSymbolKeys = () => {
    const keys = new Set();

    (culturalProgress.discoveredSymbols || []).forEach((entry) => {
      const normalized = normalizeSymbolKey(entry?.id || entry?.name || entry?.displayName || entry);
      if (normalized) keys.add(normalized);
    });

    try {
      const gameProgress = GameStateManager.getGameProgress();
      const symbolScenes = gameProgress?.zones?.['symbol-mountain']?.scenes || {};
      Object.values(symbolScenes).forEach((scene) => {
        const sceneSymbols = scene?.symbols || {};
        Object.entries(sceneSymbols).forEach(([symbolKey, discovered]) => {
          if (!discovered) return;
          const normalized = normalizeSymbolKey(symbolKey);
          if (normalized) keys.add(normalized);
        });
      });
    } catch (error) {
      // no-op
    }

    try {
      const activeProfileId = localStorage.getItem('activeProfileId');
      if (activeProfileId) {
        Object.keys(localStorage).forEach((storageKey) => {
          if (!storageKey.includes(`temp_session_${activeProfileId}_symbol-mountain_`)) return;
          try {
            const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const fromSymbols = state?.symbols || {};
            Object.entries(fromSymbols).forEach(([symbolKey, discovered]) => {
              if (!discovered) return;
              const normalized = normalizeSymbolKey(symbolKey);
              if (normalized) keys.add(normalized);
            });
            const fromDiscovered = state?.discoveredSymbols || {};
            Object.entries(fromDiscovered).forEach(([symbolKey, discovered]) => {
              if (!discovered) return;
              const normalized = normalizeSymbolKey(symbolKey);
              if (normalized) keys.add(normalized);
            });
          } catch (e) {
            // ignore malformed session state
          }
        });
      }
    } catch (error) {
      // no-op
    }

    return Array.from(keys);
  };

  const completedSymbolKeys = collectCompletedSymbolKeys();
  const getAnimalId = (avatarData) => {
    if (typeof avatarData === 'string' && ['monkey', 'peacock', 'squirrel', 'tiger'].includes(avatarData)) return avatarData;
    const emojiToAnimal = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
    return emojiToAnimal[avatarData] || 'monkey';
  };
  const animalId = getAnimalId(currentProfile?.avatar);

  const buildPetalStates = (count, activeValue = 'awakened') => {
    const states = {};
    for (let i = 1; i <= 8; i += 1) {
      states[i] = i <= Math.max(0, Math.min(8, count)) ? activeValue : 'dormant';
    }
    return states;
  };

  const getMiddlePetalStatesFromKeys = (symbolKeys) => {
    const states = { 1: 'dormant', 2: 'dormant', 3: 'dormant', 4: 'dormant', 5: 'dormant', 6: 'dormant', 7: 'dormant', 8: 'dormant' };
    const map = { mooshika: 1, modak: 2, belly: 3, lotus: 4, trunk: 5, ear: 6, eyes: 7, tusk: 8 };
    (symbolKeys || []).forEach((key) => {
      const id = map[key];
      if (id) states[id] = 'awakened';
    });
    // HIGH FIX: a brand-new profile with zero discovered symbols must show every
    // petal dormant. Math.max(1, ...) previously forced petal 1 to falsely appear
    // awakened even when culturalProgress.symbols was 0.
    if (Object.values(states).every((v) => v === 'dormant') && (culturalProgress.symbols || 0) > 0) {
      const safeCount = Math.min(8, culturalProgress.symbols);
      for (let i = 1; i <= safeCount; i += 1) states[i] = 'awakened';
    }
    return states;
  };

  const petalToSymbol = {
    1: 'mooshika',
    2: 'modak',
    3: 'belly',
    4: 'lotus',
    5: 'trunk',
    6: 'ear',
    7: 'eyes',
    8: 'tusk',
  };

  const petalToChant = {
    1: 'vakratunda-chant',
    2: 'mahakaya-chant',
    3: 'suryakoti-chant',
    4: 'samaprabha-chant',
    5: 'nirvighnam-chant',
    6: 'kurumedeva-chant',
    7: 'sarvakaryeshu-chant',
    8: 'sarvada-chant',
  };

  const handleMandalaPetalTap = (ring, petalId) => {
    if (ring === 'outer') {
      const chantId = petalToChant[petalId];
      if (chantId) {
        handleProgressBoxClick('chants', { directChantId: chantId });
      } else {
        handleProgressBoxClick('chants');
      }
    }
    else if (ring === 'middle') {
      const symbolId = petalToSymbol[petalId];
      if (symbolId) {
        handleProgressBoxClick('symbols', { directSymbolId: symbolId });
      } else {
        handleProgressBoxClick('symbols');
      }
    }
  };

  const welcomeMsg = currentProfile ? getWelcomeMessage() : null;
  const isModal = displayMode === 'modal';
  const modalTitle = 'Your Journey';
  
  // Show profile selector
  if (showProfileSelector) {
    return (
      <CleanProfileSelector
        onProfileSelect={handleProfileCreated}
        profiles={profiles}
      />
    );
  }
  
  if (!currentProfile) {
    return (
      <div className={`clean-welcome-overlay page-transition ${isModal ? 'clean-welcome-overlay--modal' : 'clean-welcome-overlay--fullscreen'}`}>
        <div className="clean-welcome-content clean-welcome-card loading-welcome-card">
          <ScreenHeader title="Loading Profile..." glowColor="purple" />
          <PrimaryBtn
            label="Select Profile"
            onClick={() => { playUiTap(0.22); setShowProfileSelector(true); }}
            size="md"
            fullWidth
            className="continue-journey-btn welcome-action-btn"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`clean-welcome-overlay page-transition ${isModal ? 'clean-welcome-overlay--modal' : 'clean-welcome-overlay--fullscreen'}`}>
      {!isModal && (
        <button
          className="welcome-sound-toggle"
          onClick={toggleAudio}
          aria-label={audioOn ? 'Turn sound off' : 'Turn sound on'}
        >
          {audioOn ? '🔊' : '🔇'}
        </button>
      )}
      {isModal && (
        <CloseButton
          className="welcome-close-btn"
          onClose={() => {
            playUiTap(0.22);
            onClose?.();
          }}
          label="Close welcome popup"
        />
      )}
      <div className={`clean-welcome-content clean-welcome-card ${isModal ? 'clean-welcome-content--modal compact' : ''}`}>
        <span className="welcome-card-lotus" aria-hidden="true" />
        <ScreenHeader
          title={isModal ? modalTitle : welcomeMsg.title}
          glowColor="purple"
        />
       
        <div className="profile-mandala-wrapper">
          <div className="profile-mandala">
            <InnerMandala
              childName={currentProfile.name}
              showAsOverlay={false}
              allowTapToSkip={false}
              message=""
              shlokaPetalStates={buildPetalStates(culturalProgress.chants, 'awakened')}
              symbolPetalStates={getMiddlePetalStatesFromKeys(completedSymbolKeys)}
              onPetalClick={handleMandalaPetalTap}
              avatar={
                <img
                  className={animalId === 'squirrel' ? 'squirrel-avatar' : ''}
                  src={`/images/new-explorer-${animalId}.webp`}
                  alt=""
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              }
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {isModal ? (
          <button className="bottom-switch-explorer switch-explorer-link popup-switch-link" onClick={handleBackToProfiles}>
            Not {currentProfile.name}? Switch Explorer
          </button>
        ) : (
          <>
            <div className="welcome-actions welcome-buttons-row profile-actions">
              {hasProgress ? (
                <>
                  <PrimaryBtn
                    label={welcomeMsg.buttonText.main}
                    onClick={handleContinue}
                    size="md"
                    fullWidth
                    className="continue-journey-btn welcome-action-btn"
                  />
                  <button className="secondary-btn explore-map-btn welcome-action-btn" onClick={handleNewGame}>
                    Home
                  </button>
                </>
              ) : (
                <>
                  <PrimaryBtn
                    label="Start Adventure"
                    onClick={handleStartAdventure}
                    size="md"
                    fullWidth
                    className="continue-journey-btn welcome-action-btn"
                  />
                </>
              )}
            </div>
            <button className="bottom-switch-explorer switch-explorer-link" onClick={handleBackToProfiles}>
              Not {currentProfile.name}? Switch Explorer
            </button>
            {hasProgress && (
              <button
                className="bottom-switch-explorer switch-explorer-link start-over-link"
                onClick={() => { playUiTap(0.22); setShowNewGameConfirm(true); }}
              >
                Start Over
              </button>
            )}
          </>
        )}
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
        directItemId={popupData?.directItemId}
      />
      <audio
        ref={ambientRef}
        src="/audio/ambient/map%20ambient%20sound.mp3"
        loop
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default CleanGameWelcomeScreen;
