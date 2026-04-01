// CleanMapZone.jsx - Clean map with zone states (locked/active/in-progress/completed)
import React, { useState, useEffect, useRef } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
import GaneshaPresence from '../lib/components/character/GaneshaPresence';
// import ZonePreviewModal from './components/ZonePreviewModal'; // commented out — no preview modal

const ZONES_DATA = [
  {
    id: 'symbol-mountain',
    name: 'Symbol\nMountain',
    sequence: 1,
    unlockRequires: null,
    unlockNote: null, // always unlocked first
    scenes: [
      { id: 'modak', name: 'Modak' },
      { id: 'pond', name: 'Pond' },
      { id: 'symbol', name: 'Symbol' },
      { id: 'final-scene', name: 'Final Scene' }
    ]
  },
  {
    id: 'cave-of-secrets',
    name: 'Cave of Secrets',
    sequence: 1,
    unlockRequires: ['symbol-mountain', 'shloka-river'],
    unlockNote: 'Unlocks after Symbol Mountain + Shloka River',
    scenes: [
      { id: 'vakratunda-mahakaya', name: 'Vakratunda Mahakaya' },
      { id: 'suryakoti-samaprabha', name: 'Suryakoti Samaprabha' },
      { id: 'nirvighnam-kurumedeva', name: 'Nirvighnam Kurumedeva' },
      { id: 'sarvakaryeshu-sarvada', name: 'Sarvakaryeshu Sarvada' },
      { id: 'final-meaning-scene', name: 'Final Meaning Scene' }
    ]
  },
  {
    id: 'shloka-river',
    name: 'Shloka\nRiver',
    sequence: 1,
    unlockRequires: 'symbol-mountain',
    unlockNote: 'Complete 1 Symbol Mountain scene',
    scenes: [
      { id: 'vakratunda-grove', name: 'Vakratunda Grove' },
      { id: 'suryakoti-bank', name: 'Suryakoti Bank' },
      { id: 'nirvighnam-chant', name: 'Nirvighnam Chant' },
      { id: 'sarvakaryeshu-chant', name: 'Sarvakaryeshu Chant' },
      { id: 'shloka-river-finale', name: 'Shloka River Finale' }
    ]
  },
  {
    id: 'festival-square',
    name: 'Festival\nSquare',
    sequence: 1,
    unlockRequires: 'shloka-river',
    unlockNote: 'Complete Shloka River',
    scenes: [
      { id: 'game1', name: 'Game 1' },
      { id: 'game2', name: 'Game 2' },
      { id: 'game3', name: 'Game 3' },
      { id: 'game4', name: 'Game 4' }
    ]
  },
  {
    id: 'about-me-hut',
    name: 'About Me Hut',
    sequence: 1,
    unlockRequires: 'symbol-mountain',
    unlockNote: 'Complete Symbol Mountain',
    scenes: [
      { id: 'family-tree', name: 'Family Tree' },
      { id: 'name-birthday', name: 'Name & Birthday' },
      { id: 'favorite-food', name: 'Favorite Food' },
      { id: 'dreams-wishes', name: 'Dreams & Wishes' }
    ]
  }
];

const ZONE_IDS = {
  SYMBOL: 'symbol-mountain',
  RIVER: 'shloka-river',
  HUT: 'about-me-hut',
  FESTIVAL: 'festival-square',
  CAVE: 'cave-of-secrets',
};

// Temporary debug switches for QA checks.
// Set both back to false after verification.
const DEBUG_UNLOCK_ALL_ZONES = true;
const DEBUG_ALWAYS_OPEN_ZONE_WELCOME = true;

const getCompletedScenes = (allProgress, zoneId) => allProgress[zoneId]?.completedScenes || 0;

const getTotalScenes = (zoneId) => {
  const zone = ZONES_DATA.find(z => z.id === zoneId);
  return zone?.scenes?.length || 0;
};

const isZoneComplete = (allProgress, zoneId) => {
  const totalScenes = getTotalScenes(zoneId);
  return totalScenes > 0 && getCompletedScenes(allProgress, zoneId) >= totalScenes;
};

const isZoneUnlocked = (zoneId, allProgress) => {
  if (DEBUG_UNLOCK_ALL_ZONES) return true;
  if (zoneId === ZONE_IDS.SYMBOL) return true;
  if (zoneId === ZONE_IDS.RIVER) return getCompletedScenes(allProgress, ZONE_IDS.SYMBOL) >= 1;
  if (zoneId === ZONE_IDS.HUT) return isZoneComplete(allProgress, ZONE_IDS.SYMBOL);
  if (zoneId === ZONE_IDS.FESTIVAL) return isZoneComplete(allProgress, ZONE_IDS.RIVER);
  if (zoneId === ZONE_IDS.CAVE) {
    return isZoneComplete(allProgress, ZONE_IDS.SYMBOL) && isZoneComplete(allProgress, ZONE_IDS.RIVER);
  }
  return true;
};

const playUnlockChime = (intensity = 'normal') => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioCtx = new AudioContextCtor();
    const now = audioCtx.currentTime;
    const outputGain = audioCtx.createGain();
    outputGain.gain.setValueAtTime(0.0001, now);
    outputGain.connect(audioCtx.destination);

    const sequence = intensity === 'master'
      ? [
          { freq: 220, start: 0.00, dur: 0.28 },
          { freq: 261.63, start: 0.16, dur: 0.36 },
          { freq: 329.63, start: 0.32, dur: 0.48 },
        ]
      : [
          { freq: 392, start: 0.00, dur: 0.20 },
          { freq: 523.25, start: 0.14, dur: 0.24 },
        ];

    const peak = intensity === 'master' ? 0.08 : 0.05;
    outputGain.gain.linearRampToValueAtTime(peak, now + 0.04);
    outputGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.90);

    sequence.forEach((note) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = intensity === 'master' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.start);
      oscGain.gain.setValueAtTime(0.0001, now + note.start);
      oscGain.gain.linearRampToValueAtTime(0.7, now + note.start + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.dur);
      osc.connect(oscGain);
      oscGain.connect(outputGain);
      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur + 0.03);
    });

    setTimeout(() => {
      audioCtx.close().catch(() => {});
    }, 1200);
  } catch (error) {
    // Audio is best-effort only; unlock visuals should still run.
  }
};

// Mushika pop position — where Mushika appears when each zone is tapped.
// Values are CSS fixed-position coordinates (% of viewport).
const ZONE_MUSHIKA_POS = {
  'symbol-mountain': { left: '21%',  top:    '36%'  },
  'cave-of-secrets': { left: '40%',  top:    '42%'  },
  'shloka-river':    { right: '19%', top:    '38%'  },
  'festival-square': { right: '17%', bottom: '30%'  },
  'about-me-hut':    { left: '14%',  bottom: '32%'  },
};

// Zone layout config: tap area + label position classes
const ZONE_LAYOUT = {
  'symbol-mountain': {
    wrapperClass: 'zone-wrapper shloka-mountain-wrapper',
    zoneClass:    'zone shloka-mountain',
    labelClass:   'label shloka-mountain-label',
  },
  'cave-of-secrets': {
    wrapperClass: 'zone-wrapper cave-secrets-wrapper',
    zoneClass:    'zone cave-secrets',
    labelClass:   'label cave-label',
  },
  'shloka-river': {
    wrapperClass: 'zone-wrapper shloka-river-wrapper',
    zoneClass:    'zone shloka-river',
    labelClass:   'label river-label',
  },
  'festival-square': {
    wrapperClass: 'zone-wrapper festival-square-wrapper',
    zoneClass:    'zone festival-square',
    labelClass:   'label festival-label',
  },
  'about-me-hut': {
    wrapperClass: 'zone-wrapper about-hut-wrapper',
    zoneClass:    'zone about-hut',
    labelClass:   'label hut-label',
  },
};

const MAP_ZONE_ORDER = [
  'symbol-mountain',
  'shloka-river',
  'cave-of-secrets',
  'festival-square',
  'about-me-hut',
];

const MAP_GANESHA_ZONE_POS = {
  'symbol-mountain': { left: '31%', top: '50%' },
  'cave-of-secrets': { left: '48%', top: '42%' },
  'shloka-river': { left: '66%', top: '44%' },
  'festival-square': { left: '69%', top: '67%' },
  'about-me-hut': { left: '28%', top: '70%' },
};

const MAP_GANESHA_ALL_DONE_POS = {
  left: '50%',
  top: '83%',
};

// Resolve avatar string/emoji → animal id for image path
const getAnimalId = (avatar) => {
  if (!avatar) return null;
  const KNOWN = ['monkey', 'peacock', 'squirrel', 'tiger'];
  if (KNOWN.includes(avatar)) return avatar;
  const emojiMap = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  return emojiMap[avatar] || null;
};

// Derive state for a zone given its progress and unlock requirements
const getZoneState = (zoneId, allProgress) => {
  if (!isZoneUnlocked(zoneId, allProgress)) return 'locked';

  const p = allProgress[zoneId];
  if (!p) return 'active'; // no progress data yet → treat as active (unlocked but not started)

  const { completedScenes, totalScenes } = p;
  if (completedScenes >= totalScenes && totalScenes > 0) return 'completed';
  if (completedScenes > 0) return 'in-progress';
  return 'active';
};

const isZoneDone = (allProgress, zoneId) => {
  const zone = allProgress[zoneId];
  return !!zone && zone.totalScenes > 0 && zone.completedScenes >= zone.totalScenes;
};

const getMapGaneshaState = (allProgress, unlockingZones) => {
  const zoneIds = MAP_ZONE_ORDER.filter((zoneId) => allProgress[zoneId]);
  if (zoneIds.length === 0) {
    return {
      pose: 'pointing',
      size: 88,
      position: {
        ...MAP_GANESHA_ZONE_POS['symbol-mountain'],
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const allZonesCompleted = zoneIds.every((zoneId) => isZoneDone(allProgress, zoneId));
  if (allZonesCompleted) {
    return {
      pose: 'celebration',
      size: 112,
      position: {
        ...MAP_GANESHA_ALL_DONE_POS,
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const unlockingZoneId = Object.keys(unlockingZones || {})[0];
  if (unlockingZoneId && MAP_GANESHA_ZONE_POS[unlockingZoneId]) {
    return {
      pose: 'thumbs_up',
      size: 92,
      position: {
        ...MAP_GANESHA_ZONE_POS[unlockingZoneId],
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const unlockedPendingZones = MAP_ZONE_ORDER.filter((zoneId) => {
    if (!allProgress[zoneId]) return false;
    if (!isZoneUnlocked(zoneId, allProgress)) return false;
    return !isZoneDone(allProgress, zoneId);
  });

  if (unlockedPendingZones.length === 1) {
    const zoneId = unlockedPendingZones[0];
    return {
      pose: 'pointing',
      size: 90,
      position: {
        ...MAP_GANESHA_ZONE_POS[zoneId],
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const recommendedZone = unlockedPendingZones[0] || 'symbol-mountain';
  return {
    pose: 'thumbs_up',
    size: 92,
    position: {
      ...(MAP_GANESHA_ZONE_POS[recommendedZone] || MAP_GANESHA_ZONE_POS['symbol-mountain']),
      transform: 'translate(-50%, -50%)',
    },
  };
};

const getMushikaSeenKey = (zoneId) => {
  const profileId = localStorage.getItem('activeProfileId') || 'default';
  return `mushika_zone_seen_${profileId}_${zoneId}`;
};

const hasSeenMushikaPop = (zoneId) => {
  try {
    return localStorage.getItem(getMushikaSeenKey(zoneId)) === '1';
  } catch {
    return false;
  }
};

const markMushikaPopSeen = (zoneId) => {
  try {
    localStorage.setItem(getMushikaSeenKey(zoneId), '1');
  } catch {
    // best effort only
  }
};

// First scene for each zone — used for direct entry on first visit
const ZONE_FIRST_SCENES = {
  'symbol-mountain':  'modak',
  'cave-of-secrets':  'vakratunda-mahakaya',
  'shloka-river':     'vakratunda-grove',
  'festival-square':  'game1',
  'about-me-hut':     'family-tree',
};

// Real scene IDs per zone — ZONES_DATA uses placeholder IDs so we need this separately
const ZONE_SCENES = {
  'symbol-mountain':  ['modak', 'pond', 'symbol', 'final-scene'],
  'cave-of-secrets':  ['vakratunda-mahakaya', 'suryakoti-samaprabha', 'nirvighnam-kurumedeva', 'sarvakaryeshu-sarvada', 'mantra-assembly'],
  'shloka-river':     ['vakratunda-grove', 'suryakoti-bank', 'nirvighnam-chant', 'sarvakaryeshu-chant', 'shloka-river-finale'],
  'festival-square':  ['game1', 'game2', 'game3', 'game4'],
  'about-me-hut':     ['family-tree', 'name-birthday', 'favorite-food', 'dreams-wishes'],
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome, onGoToProfiles, onTWGOpen }) => {
  const [zoneProgress, setZoneProgress] = useState({});
  // const [selectedZone, setSelectedZone] = useState(null);  // removed — no preview modal
  // const [showZoneModal, setShowZoneModal] = useState(false); // removed — no preview modal
  const [activeProfile, setActiveProfile] = useState(null);
  const [unlockingZones, setUnlockingZones] = useState({});
  const [mushikaPop, setMushikaPop] = useState(null); // { zone, state } | null
  const [isMuted, setIsMuted] = useState(false);
  const unlockTimersRef = useRef({});
  const mushikaTimerRef = useRef(null);
  const ambientRef = useRef(null);
  const fadingRef = useRef(null);
  const prevZoneStatesRef = useRef(null);

  useEffect(() => {
    const profile = GameStateManager.getActiveProfile();
    setActiveProfile(profile);
  }, []);

  useEffect(() => {
    loadBasicProgress();
  }, []);

  useEffect(() => {
    const handleFocus = () => loadBasicProgress();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadBasicProgress();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(unlockTimersRef.current).forEach(clearTimeout);
      if (mushikaTimerRef.current) clearTimeout(mushikaTimerRef.current);
    };
  }, []);

  // ── Ambient sound: fade in on mount, pause on tab-hide, resume on show ──────
  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const TARGET_VOL = 0.35;

    const fadeIn = () => {
      clearInterval(fadingRef.current);
      audio.volume = 0;
      audio.play().catch(() => {}); // browser may block; resolved by interaction below
      fadingRef.current = setInterval(() => {
        const next = Math.min(audio.volume + 0.025, TARGET_VOL);
        audio.volume = next;
        if (next >= TARGET_VOL) clearInterval(fadingRef.current);
      }, 80); // ~1.1s fade-in
    };

    // Try auto-play immediately
    fadeIn();

    // Fallback: start on first user interaction if autoplay was blocked
    const onFirstInteraction = () => {
      if (audio.paused && !isMuted) fadeIn();
      document.removeEventListener('click',      onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };
    document.addEventListener('click',      onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);

    // Pause when tab is hidden, resume when visible
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(fadingRef.current);
        audio.pause();
      } else if (!audio.dataset.muted) {
        fadeIn();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(fadingRef.current);
      audio.pause();
      document.removeEventListener('click',            onFirstInteraction);
      document.removeEventListener('touchstart',       onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => {
    const audio = ambientRef.current;
    if (!audio) return;
    if (isMuted) {
      delete audio.dataset.muted;
      audio.volume = 0;
      audio.play().catch(() => {});
      // fade back in
      clearInterval(fadingRef.current);
      fadingRef.current = setInterval(() => {
        const next = Math.min(audio.volume + 0.025, 0.35);
        audio.volume = next;
        if (next >= 0.35) clearInterval(fadingRef.current);
      }, 80);
      setIsMuted(false);
    } else {
      audio.dataset.muted = '1';
      clearInterval(fadingRef.current);
      audio.pause();
      setIsMuted(true);
    }
  };

  useEffect(() => {
    const nextStates = {};
    ZONES_DATA.forEach(zone => {
      nextStates[zone.id] = getZoneState(zone.id, zoneProgress);
    });

    if (!prevZoneStatesRef.current) {
      prevZoneStatesRef.current = nextStates;
      return;
    }

    ZONES_DATA.forEach(zone => {
      const zoneId = zone.id;
      const prevState = prevZoneStatesRef.current[zoneId];
      const nextState = nextStates[zoneId];

      if (prevState === 'locked' && nextState === 'active') {
        const unlockIntensity = zoneId === ZONE_IDS.CAVE ? 'master' : 'normal';

        if (unlockTimersRef.current[zoneId]) {
          clearTimeout(unlockTimersRef.current[zoneId]);
        }

        setUnlockingZones(prev => ({ ...prev, [zoneId]: unlockIntensity }));
        playUnlockChime(unlockIntensity);

        unlockTimersRef.current[zoneId] = setTimeout(() => {
          setUnlockingZones(prev => {
            const updated = { ...prev };
            delete updated[zoneId];
            return updated;
          });
          delete unlockTimersRef.current[zoneId];
        }, 1200);
      }
    });

    prevZoneStatesRef.current = nextStates;
  }, [zoneProgress]);

  const loadBasicProgress = () => {
    try {
      const profileId = localStorage.getItem('activeProfileId');
      const progressData = {};
      ZONES_DATA.forEach(zone => {
        const sceneIds = zone.scenes.map(scene => scene.id);
        let completedScenes = 0;
        let totalStars = 0;
        sceneIds.forEach(sceneId => {
          const progress = GameStateManager.getSceneProgress(zone.id, sceneId);
          if (progress?.completed) {
            completedScenes++;
            totalStars += progress.stars || 0;
            return;
          }
          // Also check temp session — catches scenes completed before permanent save
          if (profileId) {
            const tempKey = `temp_session_${profileId}_${zone.id}_${sceneId}`;
            try {
              const tempState = JSON.parse(localStorage.getItem(tempKey) || 'null');
              if (tempState) {
                const isCompleteInTemp = (
                  tempState.completed === true ||
                  tempState.phase === 'complete' ||
                  tempState.showingCompletionScreen === true ||
                  tempState.phase === 'rock_transformed' ||
                  // modak-specific: all 3 symbols collected
                  (sceneId === 'modak' &&
                    tempState.discoveredSymbols?.mooshika === true &&
                    tempState.discoveredSymbols?.modak === true &&
                    tempState.discoveredSymbols?.belly === true)
                );
                if (isCompleteInTemp) {
                  completedScenes++;
                  totalStars += tempState.stars || 0;
                }
              }
            } catch (e) {}
          }
        });
        progressData[zone.id] = {
          completedScenes,
          totalScenes: sceneIds.length,
          stars: totalStars,
          percentage: sceneIds.length > 0
            ? Math.round((completedScenes / sceneIds.length) * 100)
            : 0
        };
      });
      setZoneProgress(progressData);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Which zones show progress dots
  // First-time: progressive unlock based on Symbol Mountain scenes completed
  // Returning (has played beyond SM): all zones show dots
  const getDotsVisible = () => {
    const smCompleted = zoneProgress['symbol-mountain']?.completedScenes || 0;

    const hasPlayedBeyondSM = Object.entries(zoneProgress).some(
      ([zoneId, p]) => zoneId !== 'symbol-mountain' && (p.completedScenes || 0) > 0
    );

    if (hasPlayedBeyondSM || smCompleted >= ZONE_SCENES['symbol-mountain'].length) {
      // Returning user — all zones visible
      return { 'symbol-mountain': true, 'shloka-river': true, 'cave-of-secrets': true, 'festival-square': true, 'about-me-hut': true };
    }

    // Progressive unlock for first-time users
    return {
      'symbol-mountain':  true,
      'shloka-river':     smCompleted >= 1,
      'cave-of-secrets':  smCompleted >= 2,
      'festival-square':  smCompleted >= 3,
      'about-me-hut':     smCompleted >= 4,
    };
  };

  const dotsVisible = getDotsVisible();
  const mapGaneshaState = getMapGaneshaState(zoneProgress, unlockingZones);

  // Navigate after the Mushika pop finishes
  const navigateToZone = (zone, state) => {
    if (DEBUG_ALWAYS_OPEN_ZONE_WELCOME) {
      if (onZoneSelect) onZoneSelect(zone.id);
      return;
    }
    if (state === 'active') {
      const firstScene = ZONE_FIRST_SCENES[zone.id];
      if (onZoneSelect) onZoneSelect(zone.id, firstScene);
    } else {
      if (onZoneSelect) onZoneSelect(zone.id);
    }
  };

  const handleZoneClick = (zone, state) => {
    if (state === 'locked' || state === 'unlocking') return;
    if (mushikaPop) return; // already mid-animation — block double-tap

    // Show only first time per zone (scoped by active profile).
    if (hasSeenMushikaPop(zone.id)) {
      navigateToZone(zone, state);
      return;
    }

    markMushikaPopSeen(zone.id);

    // Show Mushika pop, then navigate after 1.4s
    setMushikaPop({ zone, state });
    mushikaTimerRef.current = setTimeout(() => {
      setMushikaPop(null);
      navigateToZone(zone, state);
    }, 1400);
  };

  // const handleStartZone = (zone) => { ... }; // removed — no preview modal

  return (
    <div className="map-container morning">

      {/* Ambient sound — hidden, controlled via ambientRef */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={ambientRef}
        src="/audio/ambient/map%20ambient%20sound.wav"
        loop
        preload="auto"
      />

      {/* Background image */}
      <img
        src="/images/map-background.svg"
        alt="Map"
        className="map-bg-img"
      />

      {/* Drifting clouds — CSS shapes, no image needed */}

      {/* River shimmer — light-on-water effect over Shloka River */}

      {/* Mountain mist — soft fog at base of Symbol Mountain */}
      <div className="map-mountain-mist" aria-hidden="true">
        <div className="mist-blob mist-blob-1" />
        <div className="mist-blob mist-blob-2" />
        <div className="mist-blob mist-blob-3" />
      </div>

      {/* Atmospheric overlay */}
      <div className="map-bg-overlay" aria-hidden="true" />
      {/* Cinematic vignette */}
      <div className="map-vignette" aria-hidden="true" />
      {/* Floating dust particles */}
      <div className="map-dust" aria-hidden="true">
        <span/><span/><span/><span/>
      </div>

      {/* ── Zone Wrappers (tap area + label grouped by state) ── */}
      {ZONES_DATA.map(zone => {
        const layout = ZONE_LAYOUT[zone.id];
        if (!layout) return null;
        const baseState = getZoneState(zone.id, zoneProgress);
        const unlockIntensity = unlockingZones[zone.id];
        const state = unlockIntensity ? 'unlocking' : baseState;
        const isDisabled = state === 'locked' || state === 'unlocking';
        const unlockClass = unlockIntensity === 'master' ? 'zone-unlock-master' : '';
        const labelState = state === 'unlocking' ? 'active' : state;
        const isSymbolMountainZone = zone.id === 'symbol-mountain';

        return (
          <div key={zone.id} className={`zone-group ${state === 'completed' ? 'zone-complete' : ''}`}>
            {/* Tap area */}
            <div
              className={`${layout.zoneClass} zone-state-${state} ${unlockClass} ${isSymbolMountainZone ? 'symbol-mountain-door' : ''}`.trim()}
              onClick={() => handleZoneClick(zone, state)}
              aria-disabled={isDisabled}
            >
              {/* Completed check badge only — no permanent rings/borders */}
              {state === 'completed' && (
                <div className={`zone-check-badge ${isSymbolMountainZone ? 'zone-checkmark' : ''}`} aria-hidden="true">✓</div>
              )}
            </div>

            {/* Label */}
            <div className={`${layout.labelClass} label-state-${labelState} ${isSymbolMountainZone ? 'zone-title' : ''}`}>
              {zone.name.split('\n').map((line, i) => (
                <span key={i}>{line}{i < zone.name.split('\n').length - 1 && <br/>}</span>
              ))}
              {state === 'locked' && zone.unlockNote && (
                <div className="unlock-note">{zone.unlockNote}</div>
              )}
              {/* Progress dots — only for unlocked zones */}
              {dotsVisible[zone.id] && (
                <div className="zone-progress">
                  {(ZONE_SCENES[zone.id] || []).map((sceneId, i) => {
                    const completed = i < (zoneProgress[zone.id]?.completedScenes || 0);
                    return <div key={sceneId} className={`zone-progress-dot${completed ? ' completed' : ''}`} />;
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}


      {/* Map Ganesha presence */}
      {mapGaneshaState && (
        <div
          className="map-ganesha-guide"
          style={mapGaneshaState.position}
          aria-hidden="true"
        >
          <div className="map-ganesha-guide__float">
            <GaneshaPresence
              pose={mapGaneshaState.pose}
              size={mapGaneshaState.size}
              breathing={mapGaneshaState.pose === 'celebration' ? 'slow' : 'gentle'}
            />
          </div>
        </div>
      )}

      {/* Profile chip — top right */}
      {activeProfile && (() => {
        const animalId = getAnimalId(activeProfile.avatar);
        return (
          <button className="map-profile-chip" onClick={onGoToProfiles || onBackToWelcome} title="Switch Explorer">
            <span className="map-profile-avatar">
              {animalId ? (
                <img
                  src={`/images/new-explorer-${animalId}.png`}
                  alt={activeProfile.name}
                  className="map-profile-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                activeProfile.avatar || '🧒'
              )}
            </span>
            <span className="map-profile-name">{activeProfile.name}</span>
          </button>
        );
      })()}

      {/* Sound toggle — bottom-left corner */}
      <button
        className={`map-sound-toggle${isMuted ? ' muted' : ''}`}
        onClick={toggleMute}
        title={isMuted ? 'Turn sound on' : 'Turn sound off'}
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
      >
        <img
          src={isMuted ? '/images/icons/icon-sound-off.svg' : '/images/icons/icon-sound-on.svg'}
          alt=""
          className="map-sound-toggle__icon"
        />
      </button>

      {/* Mushika Zone-Click Pop
          Appears when a zone is tapped; speech bubble shows zone name.
          Auto-dismisses when navigation fires after ~1.4s.            */}
      {mushikaPop && (
        <div
          className="mushika-pop-overlay"
          style={ZONE_MUSHIKA_POS[mushikaPop.zone.id]}
          aria-hidden="true"
        >
          <div className="mushika-pop-bubble">
            {mushikaPop.zone.name.replace('\n', ' ')}
          </div>
          <img
            src="/images/welcome-mooshika1.png"
            alt=""
            className="mushika-pop-img"
            onError={e => { e.target.src = '/images/mooshika.png'; }}
          />
        </div>
      )}

      {/* Zone Preview Modal — commented out, no longer used
      {showZoneModal && selectedZone && (
        <ZonePreviewModal
          zone={selectedZone}
          onClose={() => { setShowZoneModal(false); setSelectedZone(null); }}
          onStartZone={handleStartZone}
          progress={zoneProgress[selectedZone.id]}
        />
      )}
      */}

      {/* TWG floating button — bottom-centre, above zone labels */}
      <button
        className="map-twg-btn"
        onClick={() => (onTWGOpen ? onTWGOpen() : onZoneSelect?.('twg'))}
        aria-label="Time with Ganesha"
      >
        Time with Ganesha 🐘
      </button>

    </div>
  );
};

export default CleanMapZone;
