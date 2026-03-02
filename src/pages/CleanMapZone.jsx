// CleanMapZone.jsx - Clean map with zone states (locked/active/in-progress/completed)
import React, { useState, useEffect, useRef } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
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
      { id: 'dreams-wishes', name: 'Dreams & Wishes' },
      { id: 'favorite-food', name: 'Favorite Food' },
      { id: 'name-birthday', name: 'Name & Birthday' }
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
  'about-me-hut':     ['family-tree', 'favorite-food', 'dreams-wishes', 'name-birthday'],
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome, onGoToProfiles }) => {
  const [zoneProgress, setZoneProgress] = useState({});
  // const [selectedZone, setSelectedZone] = useState(null);  // removed — no preview modal
  // const [showZoneModal, setShowZoneModal] = useState(false); // removed — no preview modal
  const [activeProfile, setActiveProfile] = useState(null);
  const [unlockingZones, setUnlockingZones] = useState({});
  const unlockTimersRef = useRef({});
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
    };
  }, []);

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

  const handleZoneClick = (zone, state) => {
    if (state === 'locked' || state === 'unlocking') return;

    if (DEBUG_ALWAYS_OPEN_ZONE_WELCOME) {
      if (onZoneSelect) onZoneSelect(zone.id);
      return;
    }

    if (state === 'active') {
      // No progress at all → first time in this zone → go directly to Scene 1
      const firstScene = ZONE_FIRST_SCENES[zone.id];
      if (onZoneSelect) onZoneSelect(zone.id, firstScene);
    } else {
      // in-progress or completed → returning user → go to zone welcome (scene picker)
      if (onZoneSelect) onZoneSelect(zone.id);
    }
  };

  // const handleStartZone = (zone) => { ... }; // removed — no preview modal

  return (
    <div className="map-container morning">

      {/* Background image */}
      <img
        src="/images/map-background.svg"
        alt="Map"
        className="map-bg-img"
      />

      {/* Drifting clouds — CSS shapes, no image needed */}
      <div className="map-cloud map-cloud-1" aria-hidden="true" />
      <div className="map-cloud map-cloud-2" aria-hidden="true" />
      <div className="map-cloud map-cloud-3" aria-hidden="true" />

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

        return (
          <React.Fragment key={zone.id}>
            {/* Tap area */}
            <div
              className={`${layout.zoneClass} zone-state-${state} ${unlockClass}`.trim()}
              onClick={() => handleZoneClick(zone, state)}
              aria-disabled={isDisabled}
            >
              {/* Completed check badge only — no permanent rings/borders */}
              {state === 'completed' && <div className="zone-check-badge" aria-hidden="true">✓</div>}
            </div>

            {/* Label */}
            <div className={`${layout.labelClass} label-state-${labelState}`}>
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
          </React.Fragment>
        );
      })}

      {/* Back Button */}
      <button className="map-back-button" onClick={onBackToWelcome}>
        ← Back
      </button>

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
    </div>
  );
};

export default CleanMapZone;
