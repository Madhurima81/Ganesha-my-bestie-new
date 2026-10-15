// ZoneWelcome.jsx - Updated with Disney/PBS Unlock Detection System
// Path: lib/components/zone/ZoneWelcome.jsx

import React, { useState, useEffect, useRef } from 'react';
import { isDevUnlockAll } from '../../utils/devUnlock';
import './ZoneWelcome.css';
import '../../styles/zone-themes.css';
import { getZoneTheme, getProfilePillBtnStyle } from '../../config/ZoneThemes';
import ScreenHeader from '../shared/ScreenHeader';
import GameStateManager from '../../services/GameStateManager';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import HomeButton from '../ui/HomeButton';
import ProfileChip from '../navigation/ProfileChip';
import ProfilePillBtn from '../shared/ProfilePillBtn';
import { GANESHA_POSE_ASSETS } from '../../config/ganeshaUsageSystem';
import { playUiTap } from '../../services/AudioService';
import { createSpeechStartWatcher } from '../../utils/speechStartWatch';
import {
  setActiveScene,
  getActiveScene,
  clearActiveScene,
  readZoneReturnFocus,
  clearZoneReturnFocus,
} from '../../utils/zoneNavigationState';


//import ProgressManager from '../../services/ProgressManager';
// In ZoneWelcome.jsx

// ✅ ZONE CONTENT CONFIGURATION
const ZONE_CONTENT_TYPES = {
  'symbol-mountain': ['symbols'],
  'shloka-river': ['chants'],
  'story-treehouse': ['stories'], 
  'festival-square': [], // ✅ CHANGE: Empty array since it's pure fun games
  'about-me-hut': [],
  'cave-of-secrets': ['meanings'], // ✅ FIXED: Cave teaches Sanskrit word meanings
  'obstacle-forest': ['symbols']
};

const ZONE_LIFE_CONFIG = {
  'symbol-mountain': {
    creature: {
      kind: 'butterfly',
      src: '/images/map/butterflyyellow.webp',
      alt: 'Yellow butterfly',
      className: 'zone-card-creature--butterfly zone-card-creature--yellow',
    },
    cloud: { left: '64%', top: '14%', scale: 1.08, duration: '36s' },
    ambient: [
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '14%', top: '22%', size: '11px', duration: '28s', delay: '0s' },
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '78%', top: '34%', size: '9px', duration: '31s', delay: '7s' },
    ],
  },
  'shloka-river': {
    creature: {
      kind: 'butterfly',
      src: '/images/map/butterflyblue.webp',
      alt: 'Blue butterfly',
      className: 'zone-card-creature--butterfly zone-card-creature--blue',
    },
    cloud: { left: '20%', top: '12%', scale: 1.02, duration: '34s' },
    ambient: [
      { kind: 'drop', className: 'zone-ambient-item--drop', left: '18%', top: '24%', size: '11px', duration: '26s', delay: '0s' },
      { kind: 'drop', className: 'zone-ambient-item--drop', left: '76%', top: '18%', size: '9px', duration: '29s', delay: '8s' },
    ],
  },
  'cave-of-secrets': {
    creature: {
      kind: 'firefly',
      alt: 'Firefly',
      className: 'zone-card-creature--firefly',
    },
    cloud: { left: '68%', top: '13%', scale: 0.98, duration: '38s' },
    ambient: [
      { kind: 'firefly', className: 'zone-ambient-item--firefly', left: '20%', top: '18%', size: '8px', duration: '24s', delay: '0s' },
      { kind: 'firefly', className: 'zone-ambient-item--firefly', left: '74%', top: '30%', size: '7px', duration: '27s', delay: '6s' },
    ],
  },
  'about-me-hut': {
    creature: {
      kind: 'bird',
      src: '/images/critters/bird-flying-orange.svg',
      alt: 'Orange bird',
      className: 'zone-card-creature--bird zone-card-creature--orange',
    },
    cloud: { left: '18%', top: '13%', scale: 1.04, duration: '35s' },
    ambient: [
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '16%', top: '26%', size: '12px', duration: '30s', delay: '0s' },
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '76%', top: '18%', size: '10px', duration: '33s', delay: '9s' },
    ],
  },
  'festival-square': {
    creature: {
      kind: 'butterfly',
      src: '/images/critters/butterfly-pink.svg',
      alt: 'Pink butterfly',
      className: 'zone-card-creature--butterfly zone-card-creature--pink',
    },
    cloud: { left: '70%', top: '14%', scale: 1.06, duration: '37s' },
    ambient: [
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '18%', top: '18%', size: '10px', duration: '29s', delay: '0s' },
      { kind: 'petal', className: 'zone-ambient-item--petal', left: '76%', top: '26%', size: '9px', duration: '32s', delay: '8s' },
    ],
  },
  'story-treehouse': {
    creature: {
      kind: 'bird',
      src: '/images/map/birdnew.webp',
      alt: 'Yellow bird',
      className: 'zone-card-creature--bird zone-card-creature--yellow',
    },
    cloud: { left: '22%', top: '12%', scale: 1.03, duration: '35s' },
    ambient: [
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '18%', top: '20%', size: '12px', duration: '31s', delay: '0s' },
      { kind: 'leaf', className: 'zone-ambient-item--leaf', left: '72%', top: '29%', size: '10px', duration: '34s', delay: '7s' },
    ],
  },
};

// ✅ ENHANCED: More specific color mapping


const ZoneWelcome = ({ 
  zoneData,           // Zone configuration object
  onSceneSelect,      // Function to navigate to specific scene
  onNavigate          // General navigation function
}) => {
  const getZoneMapGaneshaAsset = (pose) =>
    pose === 'celebration' ? GANESHA_POSE_ASSETS.celebrate : GANESHA_POSE_ASSETS.standPoint;
  const [sceneProgress, setSceneProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isHomeExiting, setIsHomeExiting] = useState(false);
  const [profileChipPulse, setProfileChipPulse] = useState(false);
  const [confetti, setConfetti] = useState([]);
  // Return focus: set by App when the child goes straight from a completion modal
  // to Zone Welcome. Seeds the TEMPORARY featured card only — never makes it Active.
  const [selectedFeaturedSceneId, setSelectedFeaturedSceneId] = useState(
    () => readZoneReturnFocus(zoneData?.id)?.sceneId ?? null
  );
  const initialZoneIdRef = React.useRef(zoneData?.id);
  // HIGH FIX: tracked in a ref so the confetti cleanup timer survives effect
  // re-runs. Previously the setTimeout lived only in the effect's own closure —
  // if sceneProgress kept updating within the 1500ms window, each re-run's
  // cleanup cancelled the pending setConfetti([]) and started a fresh timer,
  // so cleanup could be deferred indefinitely and confetti DOM nodes leaked.
  const confettiTimeoutRef = React.useRef(null);

  const isPhoneLandscape =
    typeof window !== 'undefined' &&
    window.matchMedia('(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)').matches;
  const isTabletLandscape =
    typeof window !== 'undefined' &&
    window.matchMedia('(orientation: landscape) and (min-height: 501px) and (min-width: 769px)').matches;
  const usesFocusJourneyLayout = isTabletLandscape || isPhoneLandscape;

  // Skip the first zone so the return-focus seed above survives (incl. StrictMode's
  // double effect run); only a genuine zone change re-seeds.
  useEffect(() => {
    if (initialZoneIdRef.current === zoneData?.id) return;

    initialZoneIdRef.current = zoneData?.id;
    setSelectedFeaturedSceneId(readZoneReturnFocus(zoneData?.id)?.sceneId ?? null);
  }, [zoneData?.id]);

  // One visit only: next time Zone Welcome opens normally, real progression takes over.
  useEffect(() => {
    if (zoneData?.id) clearZoneReturnFocus(zoneData.id);
  }, [zoneData?.id]);

  const dlog = import.meta.env.DEV ? console.log : () => {};

  // Add this near the top of ZoneWelcome component:
  const [highlightedScene, setHighlightedScene] = useState(null);

  /* ==========================================================
     ACTIVE SCENE
     Persists the scene the child actually entered.

     This is intentionally separate from:
     - completion/progression
     - featured/browsed journey node
     ========================================================== */

  // Storage helpers live in lib/utils/zoneNavigationState.js (shared with App.jsx).

// ✅ ADD THIS: Track zone entry time for quick navigation detection
  useEffect(() => {
    if (zoneData?.id) {
      const entryTime = Date.now();
      sessionStorage.setItem(`zone_entry_${zoneData.id}`, entryTime.toString());
      dlog(`📍 Zone entry tracked: ${zoneData.id} at ${entryTime}`);
    }
  }, [zoneData?.id]);

  // Add this useEffect to detect context:
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const context = urlParams.get('context');
    const fromScene = urlParams.get('fromScene');
    
    if (context === 'replay' && fromScene) {
      setHighlightedScene(fromScene);
      return;
    }

    if (context === 'continue') {
      if (Object.keys(sceneProgress).length > 0) {
        setHighlightedScene(getNextUnlockedScene());
      }
      return;
    }

    setHighlightedScene(null);
  }, [sceneProgress, zoneData?.id]);

  // Load scene progress for this zone
  useEffect(() => {
    if (!zoneData) return;
    
    loadSceneProgress();
    setIsLoading(false);
  }, [zoneData]);

  useEffect(() => {
    const shouldPulse = sessionStorage.getItem('zone_welcome_profile_chip_pulse') === '1';
    if (!shouldPulse) return;

    sessionStorage.removeItem('zone_welcome_profile_chip_pulse');
    setProfileChipPulse(true);
    const timer = setTimeout(() => setProfileChipPulse(false), 850);
    return () => clearTimeout(timer);
  }, []);

// ── VO persistence — once-per-profile-per-zone ──
const _voKey = (kind) => {
  const pid = localStorage.getItem('activeProfileId') || 'default';
  return `gzw_vo_${pid}_${zoneData?.id}_${kind}`;
};
const hasHeardZoneVo = (kind) => {
  try { return localStorage.getItem(_voKey(kind)) === '1'; } catch { return false; }
};
const markZoneVoHeard = (kind) => {
  try { localStorage.setItem(_voKey(kind), '1'); } catch {}
};

const stopZoneEntryVoAudio = () => {
  if (typeof document !== 'undefined') {
    document.querySelectorAll('audio').forEach((audioEl) => {
      if (audioEl.loop) return;
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
      } catch {}
    });
  }
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel?.();
};

// Zone Welcome can mount immediately after a scene unmounts; stop the scene's
// reveal narration before this screen's once-per-profile line is considered.
useEffect(() => {
  stopZoneEntryVoAudio();
}, []);

const zoneSpeechWatcherRef = useRef(null);
useEffect(() => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
  zoneSpeechWatcherRef.current = createSpeechStartWatcher({ speechSynthesis: window.speechSynthesis });
  return () => {
    zoneSpeechWatcherRef.current?.cancelPending();
    zoneSpeechWatcherRef.current = null;
  };
}, []);

const speakZoneLine = (text) => {
  if (!text) return;
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;
  const audioPreference = localStorage.getItem('ganesha_audio_enabled');
  const isAudioEnabled = audioPreference === null ? true : audioPreference === 'true';
  if (!isAudioEnabled) return;
  zoneSpeechWatcherRef.current?.cancelPending();
  zoneSpeechWatcherRef.current?.speak({
    buildUtterance: () => {
      const u = new window.SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.pitch = 1;
      u.volume = 0.9;
      const voices = window.speechSynthesis.getVoices?.() || [];
      const indianVoice = voices.find(v => v.lang === 'en-IN');
      if (indianVoice) u.voice = indianVoice;
      return u;
    },
  });
};

// 🎉 Zone completion confetti effect
  const MVP_FIRST_SCENE_ONLY = false;

  function checkSceneUnlocked(scene) {
    if (!zoneData || !zoneData.scenes) return false;

    // Dev builds only (?unlockall=1): every scene open for testing. Always false in production.
    if (isDevUnlockAll()) return true;

    if (MVP_FIRST_SCENE_ONLY && scene.order !== 1) {
      dlog(`MVP: Scene ${scene.id} locked (only scene 1 available)`);
      return false;
    }

    if (scene.unlocked === true) {
      dlog(`ZONE CONFIG: Scene ${scene.id} explicitly unlocked in ZoneConfig`);
      return true;
    }

    if (scene.order === 1) {
      dlog(`DISNEY: Scene ${scene.id} unlocked (first scene)`);
      return true;
    }

    const gameProgress = GameStateManager.getGameProgress();
    const explicitUnlock = gameProgress.zones?.[zoneData.id]?.scenes?.[scene.id]?.unlocked;

    if (explicitUnlock === true) {
      dlog(`DISNEY: Scene ${scene.id} explicitly unlocked by auto-unlock system`);
      return true;
    }

    const previousScene = zoneData.scenes.find(s => s.order === scene.order - 1);
    if (!previousScene) {
      dlog(`DISNEY: Scene ${scene.id} locked (no previous scene found)`);
      return false;
    }

    const previousProgress = sceneProgress[previousScene.id];
    const previousCompleted = previousProgress && previousProgress.completed;
    const isUnlocked = explicitUnlock === true || previousCompleted;

    dlog(`DISNEY: Comprehensive unlock check for ${scene.id}:`, {
      'Scene Order': scene.order,
      'Previous Scene': previousScene.id,
      'Previous Completed': previousCompleted,
      'Explicit Unlock Flag': explicitUnlock,
      'Auto-Unlock Path': explicitUnlock === true ? 'UNLOCKED' : 'Not set',
      'Previous Completion Path': previousCompleted ? 'UNLOCKED' : 'Not completed',
      'Final Decision': isUnlocked ? 'UNLOCKED' : 'LOCKED'
    });

    if (isUnlocked) {
      dlog(`DISNEY: Scene ${scene.id} unlocked via ${explicitUnlock ? 'auto-unlock system' : 'previous completion'}`);
    } else {
      dlog(`DISNEY: Scene ${scene.id} locked - waiting for previous scene completion or auto-unlock`);
    }

    return isUnlocked;
  }

useEffect(() => {
  const completedCount = (zoneData?.scenes || []).filter(
    (scene) => sceneStatuses[scene.id].status === 'completed' || sceneStatuses[scene.id].completedBefore
  ).length;
  const isZoneComplete = completedCount >= (zoneData?.scenes?.length || 0) && (zoneData?.scenes?.length || 0) > 0;

  // Celebrate zone completion only once per profile per zone
  if (isZoneComplete && confetti.length === 0 && !hasHeardZoneVo('confetti')) {
    markZoneVoHeard('confetti');
    // Generate 15-20 confetti pieces
    const confettiCount = Math.floor(Math.random() * 6) + 15;
    const newConfetti = Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2
    }));
    setConfetti(newConfetti);

    // Always clear any prior pending cleanup before scheduling a fresh one —
    // the timeout lives in a ref, so a re-render/re-run of this effect from an
    // unrelated sceneProgress update can never orphan it.
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    confettiTimeoutRef.current = setTimeout(() => {
      setConfetti([]);
      confettiTimeoutRef.current = null;
    }, 1500);
  }
}, [sceneProgress, zoneData?.scenes, confetti.length]);

// Belt-and-braces: clear the confetti timeout on unmount.
useEffect(() => {
  return () => {
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
  };
}, []);

// ✅ FIXED: Check BOTH permanent AND temporary storage
const loadSceneProgress = () => {
  if (!zoneData || !zoneData.scenes) return;
  
  try {
    const activeProfileId = localStorage.getItem('activeProfileId');
    dlog('🔍 COMBINED: Loading progress for profile:', activeProfileId);
    
    // ✅ Get permanent completion data from GameStateManager
    const gameProgress = GameStateManager.getGameProgress();
    const zoneProgress = gameProgress.zones?.[zoneData.id] || { scenes: {} };
    
    dlog('📊 PERMANENT: Zone progress loaded:', zoneProgress);
    
    const progressData = {};
    let completedScenes = 0;
    let totalStars = 0;
    
    zoneData.scenes.forEach(scene => {
      const sceneData = zoneProgress.scenes?.[scene.id] || {};
      const isCompleted = sceneData.completed || false;
      const stars = sceneData.stars || 0;
      
      // ✅ NEW: Check SceneManager's temporary storage for in-progress
      const tempKey = `temp_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
      const replayKey = `replay_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
      const tempData = localStorage.getItem(tempKey) || localStorage.getItem(replayKey);
      let hasInProgressData = false;
      let progressPercentage = 0;
      let tempStars = 0;
      
      if (tempData && !isCompleted) {
        try {
          const tempState = JSON.parse(tempData);

          // Check if scene has meaningful progress
          hasInProgressData = (
            tempState.stars > 0 || 
            tempState.mooshikaFound || 
            tempState.collectedModaks?.length > 0 ||
            tempState.lotusStates?.some(state => state === 1) ||
            tempState.placedGaneshaMembers?.length > 0 ||
            tempState.childFamily?.length > 0 ||
            (tempState.phase === 'mooshika_search' && tempState.welcomeShown === true) ||
            (tempState.phase && tempState.phase !== 'mooshika_search' && tempState.phase !== 'initial') ||
            (tempState.gamePhase && !['intro', 'initial'].includes(tempState.gamePhase))
          );
          progressPercentage = tempState.progress?.percentage || 0;
          tempStars = tempState.stars || 0;
          dlog(`🔍 TEMP CHECK: ${scene.id} has progress:`, hasInProgressData, 'percentage:', progressPercentage, 'tempStars:', tempStars);
        } catch (e) {
          console.error('Error parsing temp data:', e);
        }
      }
      
      if (isCompleted) completedScenes++;
      totalStars += stars;
      
      progressData[scene.id] = {
        completed: isCompleted,
        stars: isCompleted ? stars : tempStars, // Use temp stars if not completed
        unlocked: sceneData.unlocked || scene.order === 1,
        // ✅ NEW: Add progress structure that getSceneStatus expects
        progress: {
          percentage: isCompleted ? 100 : progressPercentage,
          hasInProgress: hasInProgressData
        }
      };
    });
    
    setSceneProgress(progressData);
    dlog('🔍 COMBINED PROGRESS DATA:', progressData);

    // ✅ ENHANCED DEBUG with combined data
    dlog('📊 COMBINED: Final progress totals:', {
      'Completed Scenes': completedScenes,
      'Total Scenes': zoneData.scenes.length,
      'Total Stars': totalStars,
      'Progress Data': progressData
    });
    
  } catch (error) {
    dlog('Error loading scene progress:', error);
    // Initialize with empty progress
    const emptyProgress = {};
    zoneData.scenes.forEach(scene => {
      emptyProgress[scene.id] = { 
        completed: false, 
        stars: 0, 
        unlocked: scene.order === 1,
        progress: { percentage: 0, hasInProgress: false }
      };
    });
    setSceneProgress(emptyProgress);
  }
};

const getZoneStats = () => {
  if (!sceneProgress || !zoneData?.scenes) {
    return { symbols: 0, stories: 0, chants: 0, completed: 0, total: zoneData?.scenes?.length || 4 };
  }

  let completed = 0;

  zoneData.scenes.forEach(scene => {
    const progress = sceneProgress[scene.id];
    if (progress?.completed) {
      completed++;
    }
  });

  // ✅ NEW: Get actual cultural data for this zone
  const culturalData = CulturalProgressExtractor.getCulturalProgressData();
  
  // For Symbol Mountain, show actual symbols collected
  const zoneId = zoneData?.id || 'symbol-mountain';
  let symbols = 0;
  let stories = 0;
  let chants = 0;
  let meanings = 0; // ✅ ADD: For Cave of Secrets

  if (zoneId === 'symbol-mountain') {
    symbols = culturalData?.symbolsCount || 0;
  } else if (zoneId === 'story-treehouse') {
    stories = culturalData?.storiesCount || 0;
  } else if (zoneId === 'shloka-river') {
    chants = culturalData?.chantsCount || 0;
  } else if (zoneId === 'cave-of-secrets') {
    meanings = culturalData?.meaningsCount || 0; // ✅ FIXED: Cave shows meanings
  }

  return { symbols, stories, chants, meanings, completed, total: zoneData.scenes.length };
};

const getSceneStatus = (scene) => {
  const progress = sceneProgress[scene.id];
  const isUnlocked = checkSceneUnlocked(scene);

  if (!isUnlocked) {
    return { status: 'locked', stars: 0 };
  }

  if (!progress) return { status: 'available', stars: 0 };

  const activeProfileId = localStorage.getItem('activeProfileId');
  const tempKey = `temp_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
  const replayKey = `replay_session_${activeProfileId}_${zoneData.id}_${scene.id}`;
  const replaySessionRaw = localStorage.getItem(replayKey);
  // Prefer replay session when it exists; temp_session can be stale from old runs.
  const tempData = replaySessionRaw || localStorage.getItem(tempKey);
  let hasReplaySession = !!replaySessionRaw;
  let replayIsOpeningState = false;

  if (replaySessionRaw) {
    try {
      const replayState = JSON.parse(replaySessionRaw);
      const phase = replayState?.phase;
      const isOpeningPhase = !phase || phase === 'initial' || phase === 'mooshika_search';
      const hasMeaningfulProgress = (
        replayState?.stars > 0 ||
        (replayState?.welcomeShown === true && !['initial', 'mooshika_search'].includes(phase || 'initial')) ||
        replayState?.mooshikaFound === true ||
        replayState?.moundStates?.some(state => state === 1) ||
        replayState?.collectedModaks?.length > 0 ||
        replayState?.lotusStates?.some(state => state === 1) ||
        replayState?.placedSymbols && Object.keys(replayState.placedSymbols).length > 0 ||
        (phase && !['initial', 'mooshika_search'].includes(phase)) ||
        (replayState?.gamePhase && !['intro', 'initial'].includes(replayState.gamePhase))
      );

      replayIsOpeningState = isOpeningPhase && !hasMeaningfulProgress;
      if (replayIsOpeningState) {
        hasReplaySession = false; // Opening modal reload should still show "Replay"
      }
    } catch (e) {
      console.error('Error parsing replay session state:', e);
    }
  }
  

  
 // ✅ ADD THIS NEW CHECK at the top of temp data parsing:
if (tempData) {
  try {
    const tempState = JSON.parse(tempData);
    
    // Completion celebration was showing — treat as completed, show Replay only
    if (tempState.showingCompletionScreen === true) {
      dlog(`🎬 COMPLETION SCREEN: ${scene.id} → treating as completed, show Replay only`);
      return { status: 'completed', stars: tempState.stars || progress?.stars || 0, hasReplaySession };
    }
      
      // ✅ SCENE-SPECIFIC COMPLETION DETECTION
      let isCompleteInTemp = false;
      
      if (scene.id === 'modak') {
        // Modak is complete only when explicitly completed/completion phase/screen.
        // rock_transformed is a pre-completion stage (belly card reveal), so keep Continue.
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'pond') {
        // Pond is complete only when explicitly completed/completion phase/screen.
        // elephantTransformed+goldenLotusBloom is a pre-completion stage (trunk card reveal).
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'symbol') {
        // Symbol is complete only when explicitly completed/completion phase/screen.
        // all_complete is reached before the final completion modal appears.
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'final-scene' || scene.id === 'sacred-assembly') {
  // ✅ Sacred Assembly completion detection
  isCompleteInTemp = (
    tempState.completed === true ||
    tempState.phase === 'complete' ||
    tempState.phase === 'zone-complete' ||
    tempState.showingZoneCompletion === true ||
    (tempState.placedSymbols && Object.keys(tempState.placedSymbols).length === 8) ||
    tempState.stars === 8
  );
      } else if (scene.id === 'vakratunda-grove') {
        // Vakratunda is complete only when explicitly completed/completion phase/screen.
        // mahakaya_power is a pre-completion stage (final symbol reveal), so keep Continue —
        // matches modak/pond/symbol pattern.
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete' ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'family-tree') {
        // Complete only when explicitly completed or the completion screen is showing. The side-by-side
        // comparison screen is a leave point (Continue), not a completed scene (Madhurima, 2026-10-13).
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true
        );
      } else if (scene.id === 'my-indian-story') {
        // Complete if: completion screen showing or completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true ||
          tempState.phase === 'complete'
        );
      } else if (scene.id === 'favorite-food') {
        // Complete if: completion screen showing or completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true ||
          tempState.phase === 'complete'
        );
      } else if (scene.id === 'dreams-wishes') {
        // Complete if: completion screen showing or completed flag
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.showingCompletionScreen === true ||
          tempState.phase === 'complete'
        );
      } else {
        // Generic completion check
        isCompleteInTemp = (
          tempState.completed === true ||
          tempState.phase === 'complete'
        );
      }
      
      if (isCompleteInTemp) {
        dlog(`🎯 TEMP COMPLETED: ${scene.id} temp session shows completion`);
        return { status: 'completed', stars: tempState.stars || progress.stars || 0, hasReplaySession };
      }
      
      // ✅ NOW check for partial progress (more restrictive)
      const hasMeaningfulDiscoveredSymbols = (() => {
        const symbols = tempState.discoveredSymbols || {};
        if (!symbols || Object.keys(symbols).length === 0) return false;

        // Scene-specific symbol progress checks:
        // Pond preloads earlier symbols (mooshika/modak/belly), so only lotus/trunk
        // should count as in-progress for Pond.
        if (scene.id === 'pond') {
          return !!(symbols.lotus || symbols.trunk);
        }
        return Object.keys(symbols).length > 0;
      })();

      const hasPartialProgress = (
  tempState.stars > 0 ||
  (tempState.phase === 'mooshika_search' && tempState.welcomeShown === true) ||
  tempState.phase && !['initial', 'mooshika_search'].includes(tempState.phase) ||
  (tempState.gamePhase && !['intro', 'initial'].includes(tempState.gamePhase)) ||
  hasMeaningfulDiscoveredSymbols ||
  tempState.placedSymbols && Object.keys(tempState.placedSymbols).length > 0 ||
  tempState.mooshikaFound ||
  tempState.moundStates?.some(state => state === 1) ||   // ✅ any mound tapped = in-progress
  tempState.collectedModaks?.length > 0 ||
  tempState.placedGaneshaMembers?.length > 0 ||
  tempState.childFamily?.length > 0 ||
  tempState.rockFeedCount > 0 ||
  tempState.rockTransformed ||  // ✅ INCLUDE rock transformed as progress
  tempState.lotusStates?.some(state => state === 1) ||
  tempState.elephantVisible ||
  tempState.basketFull
);
      
      // Mid-game is mid-game, first play or replay: show Continue + Replay.
      // The scene still counts as completed (zone progress, ✓ badge) via
      // completedBefore. The mid-game save can live in temp_session OR
      // replay_session (SceneManager picks by mode), so accept either.
      if (hasPartialProgress && progress.completed === true) {
        dlog(`🎯 COMPLETED + MID-GAME SESSION: ${scene.id} → Continue/Replay`);
        return { status: 'in-progress', completedBefore: true, stars: progress.stars || tempState.stars || 0, hasReplaySession };
      }

      if (hasPartialProgress) {
        dlog(`🎮 TEMP PROGRESS: ${scene.id} has partial progress`);
        return { status: 'in-progress', stars: tempState.stars || 0, hasReplaySession };
      }
      
      dlog(`🔄 TEMP EMPTY: ${scene.id} has empty temp session`);
      
    } catch (e) {
      console.error('Error parsing temp data:', e);
    }
  }
  
  // ✅ Fall back to permanent data
  if (progress.completed === true) {
    dlog(`💾 PERMANENT: ${scene.id} is permanently completed`);
    return { status: 'completed', stars: progress.stars || 0, hasReplaySession };
  }
  
  if (progress.stars > 0) {
    return { status: 'in-progress', stars: progress.stars || 0 };
  }

  // Fallback: if Symbol Mountain has progress in later scenes, Modak should not show "Start".
  // This handles inconsistent saved completion flags for the first scene.
  if (zoneData?.id === 'symbol-mountain' && scene.id === 'modak') {
    const laterSceneIds = ['pond', 'symbol', 'final-scene'];
    const hasLaterProgress = laterSceneIds.some((id) => {
      const p = sceneProgress[id];
      if (p?.completed || (p?.stars || 0) > 0 || (p?.progress?.percentage || 0) > 0) return true;

      const profileId = localStorage.getItem('activeProfileId');
      const key = `temp_session_${profileId}_${zoneData.id}_${id}`;
      const raw = localStorage.getItem(key);
      if (!raw) return false;

      try {
        const temp = JSON.parse(raw);
        return (
          temp?.completed === true ||
          temp?.showingCompletionScreen === true ||
          temp?.phase === 'complete' ||
          temp?.phase === 'all_complete' ||
          temp?.phase === 'zone-complete' ||
          temp?.stars > 0 ||
          (temp?.progress?.percentage || 0) > 0
        );
      } catch {
        return false;
      }
    });

    if (hasLaterProgress) {
      return { status: 'completed', stars: progress?.stars || 0, hasReplaySession };
    }
  }
  
  return { status: 'available', stars: 0, hasReplaySession };
};

const sceneStatuses = React.useMemo(
  () => Object.fromEntries((zoneData?.scenes || []).map(s => [s.id, getSceneStatus(s)])),
  [sceneProgress, zoneData?.id]
);

// ⭐ PROGRESS DOTS — reads ONLY from permanent storage (GameStateManager).
// Completely separate from getSceneStatus so replay sessions never affect dot count.
// Same pattern as CulturalProgressExtractor for symbol count.
const getPermanentCompletedCount = () => {
  try {
    const gameProgress = GameStateManager.getGameProgress();
    const zoneScenes = gameProgress.zones?.[zoneData?.id]?.scenes || {};
    return (zoneData?.scenes || []).filter(
      scene => zoneScenes[scene.id]?.completed === true
    ).length;
  } catch (e) {
    return 0;
  }
};

  const getCardAccentColor = () => {
    const theme = getZoneTheme(zoneData?.id);
    return theme?.accentColor || '#9b7be8';
  };

  const getZoneWelcomeGaneshaState = () => {
    if (!zoneData?.scenes?.length) return null;

    const statusEntries = zoneData.scenes.map((scene) => ({
      scene,
      status: sceneStatuses[scene.id].status
    }));

    const completedCount = statusEntries.filter(
      (entry) => entry.status === 'completed' || sceneStatuses[entry.scene.id].completedBefore
    ).length;
    const allDone = completedCount === zoneData.scenes.length;

    if (allDone) {
      const lastScene = zoneData.scenes.reduce((latest, scene) => {
        if (!latest || (scene.order || 0) > (latest.order || 0)) return scene;
        return latest;
      }, null);
      return { pose: 'celebration', activeSceneId: lastScene?.id, size: 66 };
    }

    const nextActive = statusEntries.find(
      (entry) =>
        entry.status === 'available' ||
        (entry.status === 'in-progress' && !sceneStatuses[entry.scene.id].completedBefore)
    );

    // Ganesha badge is a persistent visual guide — always points at the next scene.
    // (The whisper audio system handles its own timing separately.)
    if (!nextActive?.scene?.id) {
      return null;
    }

    return {
      pose: 'pointing',
      activeSceneId: nextActive.scene.id,
      size: 88
    };
  };

  // ✅ MVP: Only scene 1 is playable in each zone — scenes 2+ are "Coming Soon"
  const getNextUnlockedScene = () => {
    if (!zoneData || !zoneData.scenes) return null;
    
    // Find first uncompleted but unlocked scene
    for (const scene of zoneData.scenes) {
      const progress = sceneProgress[scene.id];
      const isUnlocked = checkSceneUnlocked(scene);
      
      if (isUnlocked && (!progress || !progress.completed)) {
        return scene.id;
      }
    }
    
    return null;
  };

// Only actual scene launches write progression; browsing the welcome screen does not.
const launchScene = (scene, mode) => {
  if (!zoneData?.id || !scene?.id || !onSceneSelect) return;

  try {
    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      localStorage.setItem(`gmb_zone_started_${profileId}_${zoneData.id}`, 'true');
    }
  } catch { /* Scene entry must still work when storage is unavailable. */ }

  setActiveScene(zoneData.id, scene.id, mode);
  dlog('🎯 Opening active scene:', scene.id, mode);
  onSceneSelect(scene.id, { mode });
};

const handleSceneClick = (scene, action = 'default') => {
  const status = sceneStatuses[scene.id];

  if (!status || status.status === 'locked') {
    dlog('🔒 Scene locked:', scene.name);
    return;
  }

  let mode = 'start';

  if (action === 'continue') {
    mode = 'continue';
  } else if (action === 'replay') {
    mode = 'replay';
  } else if (action === 'start') {
    mode = 'start';
  } else if (status.status === 'in-progress') {
    mode = 'continue';
  } else if (status.status === 'completed') {
    mode = status.hasReplaySession ? 'continue' : 'replay';
  }

  launchScene(scene, mode);
};

const handleReplayIntroStory = () => {
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    localStorage.removeItem(`ganeshaStoryShown_${profileId}`);
  }
  if (onSceneSelect) {
    onSceneSelect('__replay_intro_story__', { mode: 'start' });
  }
};

  const renderStars = (count) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`scene-star ${i < count ? 'earned' : 'empty'}`}>
        {i < count ? '⭐' : '☆'}
      </span>
    ));
  };

  // VO effect — welcome + completion VO, once-per-profile
  useEffect(() => {
    if (!zoneData?.id || isLoading || !sceneProgress) return;

    const timer = setTimeout(() => {
      // Calculate zone completion inside effect to avoid temporal dead zone
      const zoneCompletedCount = (zoneData?.scenes || []).filter(
        (scene) => sceneStatuses[scene.id].status === 'completed' || sceneStatuses[scene.id].completedBefore
      ).length;
      const isZoneComplete = zoneCompletedCount >= (zoneData?.scenes?.length || 0) && (zoneData?.scenes?.length || 0) > 0;

      if (isZoneComplete && !hasHeardZoneVo('complete')) {
        speakZoneLine(`You finished ${zoneData.name.replaceAll('\n', ' ')}!`);
        markZoneVoHeard('complete');
        return;
      }

      if (!hasHeardZoneVo('welcome')) {
        speakZoneLine(`Welcome to ${zoneData.name.replaceAll('\n', ' ')}!`);
        markZoneVoHeard('welcome');
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [zoneData?.id, isLoading, sceneProgress]);

  const zoneScenes = zoneData?.scenes || [];

  /* 1. PERSISTED ACTIVE SCENE */
  const activeSceneRecord = getActiveScene(zoneData?.id);

  const activeSceneCandidate = activeSceneRecord?.sceneId
    ? zoneScenes.find((scene) => scene.id === activeSceneRecord.sceneId) || null
    : null;

  const activeCandidateStatus = activeSceneCandidate
    ? sceneStatuses[activeSceneCandidate.id]
    : null;

  // Active means UNFINISHED. getSceneStatus already holds every scene's real
  // completion rule (placedSymbols, gamePhase, flags…), and reports a mid-replay
  // of a completed scene as 'in-progress', so 'completed' here means truly done.
  const persistedActiveScene =
    activeSceneCandidate && activeCandidateStatus?.status !== 'completed'
      ? activeSceneCandidate
      : null;

  // The active scene has finished (e.g. child left via the zone badge on its
  // completion screen). Show it once with Play Again, then clear the record so
  // normal progression takes over on the next visit.
  useEffect(() => {
    if (!activeSceneCandidate || persistedActiveScene) return;

    setSelectedFeaturedSceneId((current) => current ?? activeSceneCandidate.id);
    clearActiveScene(zoneData?.id);
  }, [
    zoneData?.id,
    activeSceneCandidate?.id,
    persistedActiveScene?.id,
    activeCandidateStatus?.status,
  ]);

  if (isLoading || !zoneData) {
    return (
      <div className="zone-welcome-loading">
        <div className="loading-spinner">🌟 Loading {zoneData?.name || 'zone'}...</div>
      </div>
    );
  }

  const zoneWelcomeGaneshaState = getZoneWelcomeGaneshaState();
  const zoneLifeConfig = ZONE_LIFE_CONFIG[zoneData.id] || null;
  const zoneCompletedCount = (zoneData?.scenes || []).filter(
    (scene) => sceneStatuses[scene.id].status === 'completed' || sceneStatuses[scene.id].completedBefore
  ).length;
  const isZoneComplete = zoneCompletedCount >= (zoneData?.scenes?.length || 0) && (zoneData?.scenes?.length || 0) > 0;
  const recommendedScene = zoneData?.scenes?.find((scene) => sceneStatuses[scene.id].status === 'available') || null;

  // Tablet focus + journey model. The actual current scene stays stable even
  // when a child browses an older completed scene.
  // 2. Normal progression fallback — used only when there is no explicit active scene.
  const progressionCurrentScene =
    zoneScenes.find((scene) => sceneStatuses[scene.id].status === 'in-progress' && !sceneStatuses[scene.id].completedBefore) ||
    zoneScenes.find((scene) => sceneStatuses[scene.id].status === 'available') ||
    null;

  // The child's TRUE current place — drives the journey "In progress" marker.
  const actualCurrentScene = persistedActiveScene || progressionCurrentScene;

  // 3. Temporary browsing selection (journey-node taps).
  const selectedFeaturedScene =
    zoneScenes.find((scene) => scene.id === selectedFeaturedSceneId && sceneStatuses[scene.id].status !== 'locked') ||
    null;

  // 4. What is shown large.
  const featuredScene =
    selectedFeaturedScene ||
    persistedActiveScene ||
    progressionCurrentScene ||
    zoneScenes[zoneScenes.length - 1] ||
    null;

  // Featured-card CTA: Continue + Replay together for the active/in-progress scene.
  const renderFeaturedAction = (scene, status) => {
    const isPersistedActiveScene = persistedActiveScene?.id === scene.id;
    const shouldShowContinueReplay =
      isPersistedActiveScene || status.status === 'in-progress';

    return (
      <div className="scene-action-integrated featured-action-area">
        {status.status === 'locked' ? null : shouldShowContinueReplay ? (
          <div className="action-split-container">
            <ProfilePillBtn
              className="zone-welcome-cta zone-welcome-continue-btn btn-continue"
              onClick={(e) => {
                e.stopPropagation();
                handleSceneClick(scene, 'continue');
              }}
              label="Continue"
              size="sm"
              fullWidth={true}
              style={getProfilePillBtnStyle(zoneData.id)}
            />
            <ProfilePillBtn
              className="zone-welcome-cta zone-welcome-replay-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleSceneClick(scene, 'replay');
              }}
              label="↻"
              ariaLabel="Play Again"
              size="sm"
              fullWidth={false}
              style={getProfilePillBtnStyle(zoneData.id)}
            />
          </div>
        ) : status.status === 'completed' ? (
          <ProfilePillBtn
            className="zone-welcome-cta featured-zone-cta completed"
            onClick={(e) => {
              e.stopPropagation();
              handleSceneClick(scene, 'replay');
            }}
            label="Play Again"
            size="sm"
            fullWidth={true}
            style={getProfilePillBtnStyle(zoneData.id)}
          />
        ) : status.status === 'available' ? (
          <ProfilePillBtn
            className="zone-welcome-cta featured-zone-cta available"
            onClick={(e) => {
              e.stopPropagation();
              handleSceneClick(scene, 'start');
            }}
            label="Start"
            size="sm"
            fullWidth={true}
            style={getProfilePillBtnStyle(zoneData.id)}
          />
        ) : null}
      </div>
    );
  };
  const getJourneyProgressSegments = (scene) => {
    const status = sceneStatuses[scene.id];

    if (status.status !== 'in-progress') {
      return 0;
    }

    const percentage = sceneProgress[scene.id]?.progress?.percentage || 0;

    if (percentage >= 67) return 3;
    if (percentage >= 34) return 2;

    return 1;
  };

  return (
    <div
      className={`zone-welcome-container screen ${zoneData.id} ${isHomeExiting ? 'zone-welcome-exiting' : ''} ${isZoneComplete ? 'zone-complete' : ''}`}
      data-zone={zoneData.id}
      style={{
        '--zone-bg': `url('${zoneData.background}')`,
        '--zone-text-primary': getZoneTheme(zoneData.id)?.textPrimary || '#6B5416'
      }}
    >
      {/* Confetti container */}
      {confetti.length > 0 && (
        <div className="zone-confetti">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              style={{
                left: `${piece.left}%`,
                top: '-20px',
                animationDelay: `${piece.delay}s`
              }}
            />
          ))}
        </div>
      )}

      <HomeButton
        onNavigate={onNavigate}
        onPrepareNavigate={() => setIsHomeExiting(true)}
        transitionMs={130}
      />
      <ProfileChip onNavigate={onNavigate} pulseOnce={profileChipPulse} />
      <div className="bg-layer"></div>

      <div className="zone-title-top zone-title">
        <ScreenHeader title={zoneData.name} glowColor="gold" />
        {isZoneComplete && (
          <div className="zone-mastered-badge" aria-label="Zone mastered">
            <span className="mastered-line" aria-hidden="true" />
            <span className="mastered-text">Mastered</span>
            <span className="mastered-line" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Zone Welcome Whisper removed per request */}

      {/* Scene Icons Grid */}
      <div className="zone-scenes-container" data-zone={zoneData.id}>
        <div className="cards-wrapper">
          {zoneLifeConfig && (
            <div className="zone-ambient-layer" aria-hidden="true">
              {zoneLifeConfig.cloud && (
                <div
                  className="zone-cloud"
                  style={{
                    left: zoneLifeConfig.cloud.left,
                    top: zoneLifeConfig.cloud.top,
                    '--cloud-scale': zoneLifeConfig.cloud.scale || 1,
                    animationDuration: zoneLifeConfig.cloud.duration,
                  }}
                />
              )}
              {zoneLifeConfig.ambient.map((item, index) => (
                <div
                  key={`${zoneData.id}-ambient-${index}`}
                  className={`zone-ambient-item ${item.className}`}
                  style={{
                    left: item.left,
                    top: item.top,
                    width: item.size,
                    height: item.size,
                    animationDuration: item.duration,
                    animationDelay: item.delay,
                  }}
                />
              ))}
            </div>
          )}
<div
            className={[
              'scenes-horizontal-container',
              `scene-count-${zoneData.scenes.length}`,
              'focus-journey-layout',
              isTabletLandscape ? 'focus-journey-layout--tablet' : '',
              isPhoneLandscape ? 'focus-journey-layout--phone' : '',
            ].filter(Boolean).join(' ')}
          >
            {usesFocusJourneyLayout ? (
              <>
                {featuredScene && (() => {
                  const scene = featuredScene;
                  const status = sceneStatuses[scene.id];

                  return (
                    <div
                      className={`zone-scene-card scene-card zone-card zone-featured-card ${status.status} ${isPhoneLandscape ? 'zone-featured-card--phone' : ''}`.trim()}
                      style={{
                        '--zone-color': getCardAccentColor(),
                      }}
                    >
                      <div className="scene-order-indicator">
                        {scene.order}
                      </div>

                      {(status.status === 'completed' || sceneProgress[scene.id]?.completed === true) && (
                        <div className="scene-complete-badge scene-complete-icon">
                          ✓
                        </div>
                      )}

                      <div className="zone-inner">
                        <div className="scene-icon-area">
                          <div className="icon-circle">
                            {scene.iconImage ? (
                              <img
                                src={scene.iconImage}
                                alt=""
                                className="scene-icon-img"
                              />
                            ) : (
                              <div className="scene-emoji">
                                {scene.emoji}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="scene-name-area">
                          <div className="scene-name">
                            {scene.name}
                          </div>
                        </div>

                        {renderFeaturedAction(scene, status)}
                      </div>
                    </div>
                  );
                })()}

                <div
                  className={`zone-journey-strip zone-journey-strip--${zoneData.scenes.length}`}
                  aria-label={`${zoneData.name} journey`}
                >
                  {zoneData.scenes.map((scene) => {
                    const status = sceneStatuses[scene.id];
                    const isActualCurrent = actualCurrentScene?.id === scene.id;
                    const isSelected = featuredScene?.id === scene.id;
                    const progressSegments = getJourneyProgressSegments(scene);
                    const isCompleted =
                      status.status === 'completed' ||
                      sceneProgress[scene.id]?.completed === true;
                    const isLocked = status.status === 'locked';

                    return (
                      <button
                        key={scene.id}
                        type="button"
                        className={[
                          'zone-journey-node',
                          isCompleted ? 'is-completed' : '',
                          isLocked ? 'is-locked' : '',
                          isActualCurrent ? 'is-current' : '',
                          isSelected ? 'is-selected' : '',
                        ].join(' ')}
                        aria-label={`${scene.order}. ${scene.name}`}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;

                          playUiTap(0.18);
                          setSelectedFeaturedSceneId(scene.id);
                        }}
                      >
                        <div className="zone-journey-icon-wrap">
                          {scene.iconImage ? (
                            <img
                              src={scene.iconImage}
                              alt=""
                              className="zone-journey-icon"
                            />
                          ) : (
                            <span className="zone-journey-emoji">
                              {scene.emoji}
                            </span>
                          )}

                          {isCompleted && (
                            <span className="zone-journey-check" aria-hidden="true">
                              ✓
                            </span>
                          )}

                          {isLocked && (
                            <span className="zone-journey-lock" aria-hidden="true">
                              <img src="/images/map/lock.webp" alt="" />
                            </span>
                          )}
                        </div>

                        <span className="zone-journey-number">
                          {scene.order}
                        </span>

                        {isActualCurrent && status.status === 'in-progress' && (
                          <div className="zone-journey-current">
                            <div className="zone-journey-progress" aria-hidden="true">
                              {[0, 1, 2].map((segmentIndex) => (
                                <span
                                  key={segmentIndex}
                                  className={segmentIndex < progressSegments ? 'filled' : ''}
                                />
                              ))}
                            </div>

                            <span>In progress</span>
                          </div>
                        )}

                        {isActualCurrent && status.status === 'available' && (
                          <span className="zone-journey-up-next">
                            Up next
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
            {zoneData.scenes.map((scene, index) => {
            const status = sceneStatuses[scene.id];
            const isNextScene = recommendedScene && recommendedScene.id === scene.id;
            const isFeatured = featuredScene?.id === scene.id;
            const isActualCurrent = actualCurrentScene?.id === scene.id;
            const journeyProgressSegments = getJourneyProgressSegments(scene);
            const creature = zoneLifeConfig?.creature;
            // Ganesha: any available (unlocked, never played) card — zones unlock sequentially so only one exists at a time
            const showGaneshaGuide = status.status === 'available';
            // Butterfly: completed + in-progress cards (played at least once)
            const showButterfly =
              zoneLifeConfig &&
              creature &&
              (status.status === 'completed' || status.status === 'in-progress' || sceneProgress[scene.id]?.completed === true);
            
            return (
              <div
                key={scene.id}
                className={`zone-scene-card scene-card zone-card zone-${scene.order} ${status.status} ${
                  highlightedScene === scene.id ? 'highlighted' : ''
                } ${status.status === 'locked' ? 'locked-scene' : 'unlocked-scene'} ${
                  isNextScene ? 'next-scene' : ''
                } ${isFeatured ? 'is-featured-scene' : 'is-journey-tile'} ${
                  isActualCurrent ? 'is-actual-current' : ''
                }`}
                style={{
                  cursor: status.status === 'locked' ? 'not-allowed' : 'pointer',
                  '--zone-color': getCardAccentColor()
                }}
                onClick={() => {
                  if (usesFocusJourneyLayout) {
                    if (status.status === 'locked') {
                      return;
                    }

                    if (!isFeatured) {
                      playUiTap(0.18);
                      setSelectedFeaturedSceneId(scene.id);
                    }

                    return;
                  }

                  handleSceneClick(scene, status.status === 'completed' ? 'replay' : 'default');
                }}
              >
                {showButterfly && creature && (
                  <div
                    className={`zone-card-creature ${creature.className || ''} ${
                      isNextScene ? 'zone-card-creature--recommended' : ''
                    } ${status.status === 'in-progress' ? 'zone-card-creature--in-progress' : ''}`}
                    aria-hidden="true"
                  >
                    {creature.kind === 'firefly' ? (
                      <span className="zone-card-firefly" />
                    ) : (
                      <img src={creature.src} alt="" className="zone-card-creature-image" />
                    )}
                  </div>
                )}

                {/* Order indicator */}
                <div className="scene-order-indicator">
                  {scene.order}
                </div>
                
                {/* Stars display */}
                {status.stars > 0 && (
                  <div className="scene-stars-display">
                    {status.stars}⭐
                  </div>
                )}

                {(status.status === 'completed' || sceneProgress[scene.id]?.completed === true) && (
                  <div className="scene-complete-badge scene-complete-icon">✓</div>
                )}

                <div className="zone-inner">
                  {/* ✨ NEW: Scene Icon Area (Top) */}
                  <div className="scene-icon-area">
                    <div className="icon-circle">
                      {scene.iconImage ? (
                        <img 
                          src={scene.iconImage}
                          alt={scene.name}
                          className="scene-icon-img"
                          style={{
                            filter: status.status === 'locked' ? 'grayscale(100%) opacity(0.5)' : 'none'
                          }}
                          onError={(e) => {
                            console.warn(`Failed to load image for ${scene.id}, falling back to emoji`);
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      
                      <div 
                        className="scene-emoji"
                        style={{
                          filter: status.status === 'locked' ? 'grayscale(100%)' : 'none',
                          display: scene.iconImage ? 'none' : 'block'
                        }}
                      >
                        {scene.emoji}
                      </div>
                    </div>
                    
                    {/* Moon overlay for MVP locked scenes */}
                    {status.status === 'locked' && (
                      <div className="scene-lock-overlay" aria-hidden="true">
                        <img src="/images/map/lock.webp" alt="" className="scene-lock-icon" />
                      </div>
                    )}
                  </div>

                  {/* ✨ NEW: Scene Name Area (Middle) */}
                  <div className="scene-name-area">
                    <div className="scene-name">
                      {scene.name}
                    </div>
                    {/* Scene Invite Whisper — appears only the FIRST TIME a scene
                        unlocks. Tapping plays Ganesha's invite. Heard/dismissed
                        = marked done in localStorage, Ganesha gone from this card. */}
                    {/* Scene invite whisper removed per request */}
                  </div>

                  {/* ✨ NEW: Integrated Action Area (Bottom) */}
                  {usesFocusJourneyLayout ? (
                    isFeatured ? (
                      renderFeaturedAction(scene, status)
                    ) : (
                      <div className="journey-tile-status">
                        {isActualCurrent && status.status === 'in-progress' && (
                          <>
                            <div className="journey-tile-progress" aria-hidden="true">
                              {[0, 1, 2].map((segmentIndex) => (
                                <span
                                  key={segmentIndex}
                                  className={`journey-progress-segment ${
                                    segmentIndex < journeyProgressSegments ? 'filled' : ''
                                  }`}
                                />
                              ))}
                            </div>

                            <span className="journey-tile-label">In progress</span>
                          </>
                        )}

                        {isActualCurrent && status.status === 'available' && (
                          <span className="journey-tile-label journey-tile-label--next">
                            Up next
                          </span>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="scene-action-integrated">
                      {status.status === 'in-progress' ? (
                        <div className="action-split-container">
                          <ProfilePillBtn
                            className="zone-welcome-cta zone-welcome-continue-btn btn-continue"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSceneClick(scene, 'continue');
                            }}
                            label="Continue"
                            size="sm"
                            fullWidth={true}
                            style={getProfilePillBtnStyle(zoneData.id)}
                          />
                          <ProfilePillBtn
                            className="zone-welcome-cta zone-welcome-replay-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSceneClick(scene, 'replay');
                            }}
                            label="↻"
                            ariaLabel="Replay"
                            size="sm"
                            fullWidth={false}
                            style={getProfilePillBtnStyle(zoneData.id)}
                          />
                        </div>
                      ) : (
                        <ProfilePillBtn
                          className={`zone-welcome-cta ${status.status}`.trim()}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Replay always restarts the scene fresh
                            handleSceneClick(scene, status.status === 'completed' ? 'replay' : 'default');
                          }}
                          label={status.status === 'available' ? 'Start' : status.status === 'completed' ? '↻ Replay' : 'Locked'}
                          size="sm"
                          fullWidth={true}
                          style={getProfilePillBtnStyle(zoneData.id)}
                        />
                      )}
                    </div>
                  )}
                  {showGaneshaGuide && (
                    <div
                      className={`zone-card-ganesha-guide zone-card-ganesha-guide--pointing`}
                      aria-hidden="true"
                    >
                      <img
                        src={getZoneMapGaneshaAsset('pointing')}
                        alt=""
                        className="zone-card-ganesha-guide-image"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
            })}

            {/* "Meet Ganesha Again" replay-story card removed from the scene grid —
                it collided with the zone-5 fallback position and overlapped the
                Family Tree card. To be re-added elsewhere on this scene later.
            {zoneData.id === 'about-me-hut' && (
              <div
                key="about-me-replay-story"
                className="zone-scene-card scene-card zone-card zone-5 available unlocked-scene"
                style={{
                  cursor: 'pointer',
                  '--zone-color': getCardAccentColor()
                }}
                onClick={handleReplayIntroStory}
              >
                <div className="scene-order-indicator">★</div>
                <div className="zone-inner">
                  <div className="scene-icon-area">
                    <div className="icon-circle">
                      <img
                        src="/intro-story/story1-img4.webp"
                        alt="Meet Ganesha Again"
                        className="scene-icon-img"
                      />
                    </div>
                  </div>
                  <div className="scene-name-area">
                    <div className="scene-name">Meet Ganesha Again</div>
                  </div>
                  <div className="scene-action-integrated">
                    <ProfilePillBtn
                      className="zone-welcome-cta available"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplayIntroStory();
                      }}
                      label="Replay Story"
                      size="sm"
                      fullWidth={true}
                      style={getProfilePillBtnStyle(zoneData.id)}
                    />
                  </div>
                </div>
              </div>
            )}
            */}
              </>
            )}
          </div>
</div>
      </div>

{/* JOURNEY PANEL — progress pill at bottom.
    Focus journey screens use the permanent strip instead, so this duplicate is hidden there. */}
{!usesFocusJourneyLayout && (
<div className="stats-bottom-bar">
  {Object.keys(sceneProgress).length > 0 ? (() => {
    const zoneStats = getZoneStats();
    const totalScenes = zoneStats.total;
    // ⭐ Use permanent-only count — never affected by replay/temp sessions
    // Same pattern as symbol count (CulturalProgressExtractor). Keeps dots stable.
    const completedCount = getPermanentCompletedCount();
    const displayCount = Math.min(completedCount, totalScenes);
    const progressDotsCount = completedCount;
    const allScenesCompleted = completedCount >= totalScenes && totalScenes > 0;

    const statIcon = '/images/icons/symbols-icon.webp';
    const statLabel = 'Scenes';

    return (
      <div className="journey-panel zone-progress">
        {statIcon && (
          <div className="journey-left">
            <img src={statIcon} alt={statLabel} className="journey-stat-icon" />
            <div className="journey-left-text">
              <span className="journey-left-main zone-progress-label">
                {displayCount}/{totalScenes} {statLabel}
              </span>
            </div>
          </div>
        )}
        <div className="journey-steps">
          {Array.from({ length: totalScenes }, (_, i) => (
            <span key={i} className={`step progress-dot ${i < progressDotsCount ? 'done' : ''}`} />
          ))}
        </div>
      </div>
    );
  })() : (
    <div className="stats-loading">🎒 Loading...</div>
  )}
</div>
)}

      {/* ✅ DISNEY: Add CSS for unlock animations */}
      {/* ✅ FIXED: Regular CSS styles instead of jsx */}

    </div>
  );
};



export default ZoneWelcome;
