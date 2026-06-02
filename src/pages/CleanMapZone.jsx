// CleanMapZone.jsx - Clean map with zone states (locked/active/in-progress/completed)
import React, { useState, useEffect, useRef } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
import { GANESHA_POSE_ASSETS } from '../lib/config/ganeshaUsageSystem';
// import ZonePreviewModal from './components/ZonePreviewModal'; // commented out — no preview modal

const ZONES_DATA = [
  {
    id: 'symbol-mountain',
    name: 'Modak\nMountain',
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
    name: 'Wonder Caves',
    sequence: 1,
    unlockRequires: 'shloka-river',
    unlockNote: 'Complete Shloka River',
    comingSoon: true, // Demo build: full content not yet wired
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
    name: 'Lotus\nSquare',
    sequence: 1,
    unlockRequires: 'cave-of-secrets',
    unlockNote: 'Complete Cave of Secrets',
    comingSoon: true, // Demo build: full content not yet wired
    scenes: [
      { id: 'game1', name: 'Game 1' },
      { id: 'game2', name: 'Game 2' },
      { id: 'game3', name: 'Game 3' },
      { id: 'game4', name: 'Game 4' }
    ]
  },
  {
    id: 'story-treehouse',
    name: 'Tusk\nTreehouse',
    sequence: 1,
    unlockRequires: 'festival-square',
    unlockNote: 'Coming soon',
    comingSoon: true,
    scenes: []
  },
  {
    id: 'about-me-hut',
    name: "Mooshika's Hut",
    sequence: 1,
    unlockRequires: 'symbol-mountain',
    unlockNote: 'Complete 2 Symbol Mountain scenes',
    scenes: [
      { id: 'family-tree', name: 'Family Tree' },
      { id: 'favorite-food', name: 'Favorite Food' },
      { id: 'dreams-wishes', name: 'Dreams & Wishes' },
      { id: 'my-indian-story', name: 'My Indian Story' }
    ]
  }
];

const ZONE_IDS = {
  SYMBOL: 'symbol-mountain',
  RIVER: 'shloka-river',
  HUT: 'about-me-hut',
  FESTIVAL: 'festival-square',
  TREEHOUSE: 'story-treehouse',
  CAVE: 'cave-of-secrets',
};

const MAP_ZONE_UNLOCK_VO = {
  [ZONE_IDS.SYMBOL]: "Tap Symbol Mountain — that's where we start!",
  [ZONE_IDS.RIVER]: 'Look! The Shloka River is flowing!',
  [ZONE_IDS.HUT]: 'Come inside! The About Me Hut is open!',
  [ZONE_IDS.CAVE]: 'The cave doors are opening!',
  [ZONE_IDS.FESTIVAL]: 'The festival has begun!',
};

const MAP_ZONE_COMPLETION_VO = {
  [ZONE_IDS.SYMBOL]: 'Wonderful! You discovered all the symbols of Symbol Mountain.',
  [ZONE_IDS.RIVER]: 'Beautiful chanting! You completed the Shloka River.',
  [ZONE_IDS.CAVE]: 'Amazing! You uncovered all the secrets of the cave.',
  [ZONE_IDS.FESTIVAL]: 'What a celebration! You finished everything in Festival Square.',
  [ZONE_IDS.HUT]: 'I loved learning about you! You completed the About Me Hut.',
};

// Temporary debug switches for QA checks.
// Set both back to false after verification.
const DEBUG_UNLOCK_ALL_ZONES = false;
const DEBUG_ALWAYS_OPEN_ZONE_WELCOME = false;

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
  // Demo build unlock rhythm — keeps the child engaged across limited content:
  if (zoneId === ZONE_IDS.RIVER) return getCompletedScenes(allProgress, ZONE_IDS.SYMBOL) >= 1;
  if (zoneId === ZONE_IDS.HUT) return getCompletedScenes(allProgress, ZONE_IDS.SYMBOL) >= 2;
  if (zoneId === ZONE_IDS.CAVE) return isZoneComplete(allProgress, ZONE_IDS.RIVER);
  if (zoneId === ZONE_IDS.FESTIVAL) return isZoneComplete(allProgress, ZONE_IDS.CAVE);
  if (zoneId === ZONE_IDS.TREEHOUSE) return false;
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

const playZoneClickSfx = (zoneState = 'active', muted = false) => {
  try {
    if (typeof window === 'undefined') return;
    if (muted) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioCtx = new AudioContextCtor();
    const now = audioCtx.currentTime;
    const outputGain = audioCtx.createGain();
    outputGain.gain.setValueAtTime(0.0001, now);
    outputGain.connect(audioCtx.destination);

    if (zoneState === 'locked' || zoneState === 'coming-soon') {
      // Locked/coming-soon: gentle low thud (no punitive buzzer)
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.linearRampToValueAtTime(0.025, now + 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(oscGain);
      oscGain.connect(outputGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (zoneState === 'active' || zoneState === 'in-progress' || zoneState === 'completed') {
      // Unlocked/completed: soft invitation whoosh/chime
      const notes = [
        { freq: 392, start: 0.00, dur: 0.12, gain: 0.022 },
        { freq: 523.25, start: 0.07, dur: 0.13, gain: 0.02 },
      ];
      notes.forEach((note) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.start);
        oscGain.gain.setValueAtTime(0.0001, now + note.start);
        oscGain.gain.linearRampToValueAtTime(note.gain, now + note.start + 0.02);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.dur);
        osc.connect(oscGain);
        oscGain.connect(outputGain);
        osc.start(now + note.start);
        osc.stop(now + note.start + note.dur + 0.02);
      });
    }

    setTimeout(() => {
      audioCtx.close().catch(() => {});
    }, 320);
  } catch (error) {
    // SFX best-effort only
  }
};

// Mushika pop position — where Mushika appears when each zone is tapped.
// Values are CSS fixed-position coordinates (% of viewport).
const ZONE_MUSHIKA_POS = {
  'symbol-mountain': { left: '21%',  top:    '36%'  },
  'cave-of-secrets': { right: '10%', bottom: '18%'  },
  'shloka-river':    { right: '19%', top:    '38%'  },
  'festival-square': { right: '17%', bottom: '30%'  },
  'about-me-hut':    { left: '14%',  bottom: '32%'  },
  'story-treehouse': { left: '40%',  bottom: '40%'  },
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
  'story-treehouse': {
    wrapperClass: 'zone-wrapper treehouse-wrapper',
    zoneClass:    'zone tusk-treehouse',
    labelClass:   'label treehouse-label',
  },
};

const MAP_ZONE_ORDER = [
  'symbol-mountain',
  'shloka-river',
  'cave-of-secrets',
  'festival-square',
  'about-me-hut',
  'story-treehouse',
];

const MAP_GANESHA_ZONE_POS = {
  'symbol-mountain': { left: '31%', top: '50%' },
  'cave-of-secrets': { left: '48%', top: '42%' },
  'shloka-river': { left: '66%', top: '44%' },
  'festival-square': { left: '69%', top: '67%' },
  'about-me-hut': { left: '28%', top: '70%' },
  'story-treehouse': { left: '43%', top: '58%' },
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

const toTitleCase = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

// Derive state for a zone given its progress and unlock requirements
const getZoneState = (zoneId, allProgress) => {
  // Coming-soon zones override all other states — content not yet wired
  const zoneDef = ZONES_DATA.find(z => z.id === zoneId);
  if (zoneDef?.comingSoon) return 'coming-soon';

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

const getMainMapGaneshaAsset = (pose, isWalking) => {
  if (isWalking) return GANESHA_POSE_ASSETS.standPoint;
  if (pose === 'celebration') return GANESHA_POSE_ASSETS.celebrate;
  return GANESHA_POSE_ASSETS.standPoint;
};

const getMushikaSeenKey = (zoneId) => {
  const profileId = localStorage.getItem('activeProfileId') || 'default';
  return `mushika_zone_seen_${profileId}_${zoneId}`;
};

const getZoneUnlockVoSeenKey = (zoneId) => {
  const profileId = localStorage.getItem('activeProfileId') || 'default';
  return `map_zone_unlock_vo_seen_${profileId}_${zoneId}`;
};

const hasSeenZoneUnlockVo = (zoneId) => {
  try {
    return localStorage.getItem(getZoneUnlockVoSeenKey(zoneId)) === '1';
  } catch {
    return false;
  }
};

const markZoneUnlockVoSeen = (zoneId) => {
  try {
    localStorage.setItem(getZoneUnlockVoSeenKey(zoneId), '1');
  } catch {
    // best effort only
  }
};

const getZoneCompletionVoSeenKey = (zoneId) => {
  const profileId = localStorage.getItem('activeProfileId') || 'default';
  return `map_zone_completion_vo_seen_${profileId}_${zoneId}`;
};

const getFirstLoadIntroSessionKey = () => {
  const profileId = localStorage.getItem('activeProfileId') || 'default';
  return `map_first_load_intro_spoken_${profileId}`;
};

const hasSeenZoneCompletionVo = (zoneId) => {
  try {
    return localStorage.getItem(getZoneCompletionVoSeenKey(zoneId)) === '1';
  } catch {
    return false;
  }
};

const markZoneCompletionVoSeen = (zoneId) => {
  try {
    localStorage.setItem(getZoneCompletionVoSeenKey(zoneId), '1');
  } catch {
    // best effort only
  }
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
  'about-me-hut':     ['family-tree', 'favorite-food', 'dreams-wishes', 'my-indian-story'],
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome, onGoToProfiles, onTWGOpen, onParentCorner }) => {
  const [zoneProgress, setZoneProgress] = useState({});
  const [isFirstTimeLoad, setIsFirstTimeLoad] = useState(false);
  // const [selectedZone, setSelectedZone] = useState(null);  // removed — no preview modal
  // const [showZoneModal, setShowZoneModal] = useState(false); // removed — no preview modal
  const [activeProfile, setActiveProfile] = useState(null);
  const [unlockingZones, setUnlockingZones] = useState({});
  const [mushikaPop, setMushikaPop] = useState(null); // { zone, state } | null
  const [isMuted, setIsMuted] = useState(false);
  const [isGaneshaWalking, setIsGaneshaWalking] = useState(false);
  const [shakingZoneId, setShakingZoneId] = useState(null);
  const [pulsingLabelZoneId, setPulsingLabelZoneId] = useState(null);
  const unlockTimersRef = useRef({});
  const unlockStartTimersRef = useRef({});
  const voiceTimersRef = useRef([]);
  const mushikaTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const labelPulseTimerRef = useRef(null);
  const ambientRef = useRef(null);
  const fadingRef = useRef(null);
  const prevZoneStatesRef = useRef(null);
  const isFirstTimeLoadRef = useRef(false);
  const idleNudgeTimerRef = useRef(null);
  const hasTappedRef = useRef(false);
  const prevGaneshaPosRef = useRef(null);
  const walkTimerRef = useRef(null);
  const parentHoldTimerRef = useRef(null);

  const speakMapVoEvents = (events = []) => {
    if (!Array.isArray(events) || events.length === 0) {
      console.log('[VO] No events to speak');
      return;
    }
    if (typeof window === 'undefined') {
      console.log('[VO] Window undefined');
      return;
    }
    if (isMuted) {
      console.log('[VO] Muted, skipping VO');
      return;
    }
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') {
      console.log('[VO] Speech synthesis not supported');
      return;
    }

    console.log('[VO] Speaking events:', events);
    // Clear any queued lines from previous transition bursts.
    voiceTimersRef.current.forEach(clearTimeout);
    voiceTimersRef.current = [];
    window.speechSynthesis.cancel();

    events.forEach(({ text, delay = 0 }) => {
      if (!text) return;
      const timerId = setTimeout(() => {
        try {
          console.log(`[VO] Speaking (delay ${delay}ms): "${text}"`);
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.rate = 1.02;
          utterance.pitch = 1;
          utterance.volume = 0.55;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('[VO] Error speaking:', e);
        }
      }, delay);
      voiceTimersRef.current.push(timerId);
    });
  };

  useEffect(() => {
    const profile = GameStateManager.getActiveProfile();
    setActiveProfile(profile);
  }, []);

  useEffect(() => {
    setMushikaPop(null);
    setShakingZoneId(null);
    if (mushikaTimerRef.current) clearTimeout(mushikaTimerRef.current);
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
      Object.values(unlockStartTimersRef.current).forEach(clearTimeout);
      voiceTimersRef.current.forEach(clearTimeout);
      if (idleNudgeTimerRef.current) clearTimeout(idleNudgeTimerRef.current);
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (mushikaTimerRef.current) clearTimeout(mushikaTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      if (parentHoldTimerRef.current) clearTimeout(parentHoldTimerRef.current);
    };
  }, []);

  const triggerParentCorner = (e) => {
    e?.stopPropagation?.();
    onParentCorner?.();
  };

  const startParentHold = (e) => {
    e.stopPropagation();
    if (parentHoldTimerRef.current) clearTimeout(parentHoldTimerRef.current);
    parentHoldTimerRef.current = setTimeout(() => {
      onParentCorner?.();
      parentHoldTimerRef.current = null;
    }, 900);
  };

  const endParentHold = (e) => {
    e?.stopPropagation?.();
    if (parentHoldTimerRef.current) {
      clearTimeout(parentHoldTimerRef.current);
      parentHoldTimerRef.current = null;
    }
  };

  // ── Ambient sound: fade in on mount, pause on tab-hide, resume on show ──────
  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const TARGET_VOL = 0.06;

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
        const next = Math.min(audio.volume + 0.015, 0.06);
        audio.volume = next;
        if (next >= 0.06) clearInterval(fadingRef.current);
      }, 80);
      setIsMuted(false);
    } else {
      audio.dataset.muted = '1';
      clearInterval(fadingRef.current);
      audio.pause();
      voiceTimersRef.current.forEach(clearTimeout);
      voiceTimersRef.current = [];
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsMuted(true);
    }
  };

  useEffect(() => {
    const nextStates = {};
    const newlyUnlockedZoneIds = [];
    const newlyCompletedZoneIds = [];

    ZONES_DATA.forEach(zone => {
      nextStates[zone.id] = getZoneState(zone.id, zoneProgress);
    });

    if (!prevZoneStatesRef.current) {
      prevZoneStatesRef.current = nextStates;

      const isBrandNewJourney = (zoneProgress[ZONE_IDS.SYMBOL]?.completedScenes || 0) === 0
        && Object.entries(zoneProgress).every(
          ([zoneId, p]) => zoneId === ZONE_IDS.SYMBOL || (p?.completedScenes || 0) === 0
        );

      console.log('[Map] First load detected. Brand new journey:', isBrandNewJourney);
      isFirstTimeLoadRef.current = isBrandNewJourney;
      setIsFirstTimeLoad(isBrandNewJourney);

      if (isBrandNewJourney) {
        const introSessionKey = getFirstLoadIntroSessionKey();
        const spokenThisSession = sessionStorage.getItem(introSessionKey) === '1';
        const hasSeenUnlockVo = hasSeenZoneUnlockVo(ZONE_IDS.SYMBOL);
        console.log('[Map] First-time VO gate:', { spokenThisSession, hasSeenUnlockVo });

        // Play once per browser session on brand-new journey, even if stale localStorage flag exists.
        if (!spokenThisSession) {
          const firstLine = MAP_ZONE_UNLOCK_VO[ZONE_IDS.SYMBOL];
          speakMapVoEvents([{ text: firstLine, delay: 300 }]);
          sessionStorage.setItem(introSessionKey, '1');
          markZoneUnlockVoSeen(ZONE_IDS.SYMBOL);
        }

        // Idle nudge: if no tap after 7s, gently re-prompt
        idleNudgeTimerRef.current = setTimeout(() => {
          if (!hasTappedRef.current) {
            speakMapVoEvents([{
              text: 'Tap Symbol Mountain whenever you are ready!',
              delay: 0
            }]);
          }
        }, 7000);
      }
      return;
    }

    ZONES_DATA.forEach(zone => {
      const zoneId = zone.id;
      const prevState = prevZoneStatesRef.current[zoneId];
      const nextState = nextStates[zoneId];

      if (prevState === 'locked' && nextState === 'active') {
        newlyUnlockedZoneIds.push(zoneId);
        const unlockIntensity = zoneId === ZONE_IDS.CAVE ? 'master' : 'normal';

        if (unlockTimersRef.current[zoneId]) {
          clearTimeout(unlockTimersRef.current[zoneId]);
        }
        if (unlockStartTimersRef.current[zoneId]) {
          clearTimeout(unlockStartTimersRef.current[zoneId]);
        }

        // Sequenced unlock moment:
        // 0ms: chime
        // 800ms: pulse/walk begins
        // 5000ms: pulse fades
        playUnlockChime(unlockIntensity);

        unlockStartTimersRef.current[zoneId] = setTimeout(() => {
          setUnlockingZones(prev => ({ ...prev, [zoneId]: unlockIntensity }));
          delete unlockStartTimersRef.current[zoneId];
        }, 800);

        unlockTimersRef.current[zoneId] = setTimeout(() => {
          setUnlockingZones(prev => {
            const updated = { ...prev };
            delete updated[zoneId];
            return updated;
          });
          delete unlockTimersRef.current[zoneId];
        }, 5000);
      }

      if (prevState !== 'completed' && nextState === 'completed') {
        newlyCompletedZoneIds.push(zoneId);
      }
    });

    const unlockLines = newlyUnlockedZoneIds
      .filter((zoneId) => !hasSeenZoneUnlockVo(zoneId))
      .map((zoneId) => {
        markZoneUnlockVoSeen(zoneId);
        return { text: MAP_ZONE_UNLOCK_VO[zoneId], delay: 2000 };
      })
      .filter((entry) => !!entry?.text);
    const completionLines = newlyCompletedZoneIds
      .filter((zoneId) => !hasSeenZoneCompletionVo(zoneId))
      .map((zoneId) => {
        markZoneCompletionVoSeen(zoneId);
        return MAP_ZONE_COMPLETION_VO[zoneId];
      })
      .filter(Boolean);

    const voEvents = [];
    unlockLines.forEach((line, index) => {
      // Unlock VO starts after walk transition completes.
      voEvents.push({ text: line.text, delay: line.delay + (index * 2200) });
    });
    const completionStartDelay = unlockLines.length > 0 ? (2000 + unlockLines.length * 2200) : 0;
    completionLines.forEach((line, index) => {
      voEvents.push({ text: line, delay: completionStartDelay + (index * 2200) });
    });

    speakMapVoEvents(voEvents);

    prevZoneStatesRef.current = nextStates;
  }, [zoneProgress, isMuted]);

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
      'shloka-river':     smCompleted >= 2,
      'about-me-hut':     isZoneComplete(zoneProgress, ZONE_IDS.SYMBOL),
      'cave-of-secrets':  isZoneComplete(zoneProgress, ZONE_IDS.RIVER),
      'festival-square':  isZoneComplete(zoneProgress, ZONE_IDS.CAVE),
    };
  };

  const dotsVisible = getDotsVisible();
  const mapGaneshaState = getMapGaneshaState(zoneProgress, unlockingZones);

  useEffect(() => {
    const newPos = JSON.stringify(mapGaneshaState.position);
    if (prevGaneshaPosRef.current && prevGaneshaPosRef.current !== newPos) {
      setIsGaneshaWalking(true);
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
      walkTimerRef.current = setTimeout(() => {
        setIsGaneshaWalking(false);
      }, 1200);
    }
    prevGaneshaPosRef.current = newPos;

    return () => {
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    };
  }, [mapGaneshaState.position]);

  useEffect(() => {
    return () => {
      if (labelPulseTimerRef.current) clearTimeout(labelPulseTimerRef.current);
    };
  }, []);

  // Navigate after the Mushika pop finishes
  const navigateToZone = (zone, state) => {
    if (DEBUG_ALWAYS_OPEN_ZONE_WELCOME) {
      if (onZoneSelect) onZoneSelect(zone.id);
      return;
    }
    // Symbol Mountain: skip welcome, go straight to first scene (modak)
    if (state === 'active' && zone.id === ZONE_IDS.SYMBOL) {
      const firstScene = ZONE_FIRST_SCENES[zone.id];
      if (onZoneSelect) onZoneSelect(zone.id, firstScene);
      return;
    }
    // All other zones: open zone welcome screen
    if (onZoneSelect) onZoneSelect(zone.id);
  };

  const handleZoneClick = (zone, state) => {
    setPulsingLabelZoneId(zone.id);
    if (labelPulseTimerRef.current) clearTimeout(labelPulseTimerRef.current);
    labelPulseTimerRef.current = setTimeout(() => setPulsingLabelZoneId(null), 220);

    // Clear idle nudge on any tap
    hasTappedRef.current = true;
    if (idleNudgeTimerRef.current) {
      clearTimeout(idleNudgeTimerRef.current);
      idleNudgeTimerRef.current = null;
    }

    // Play zone click SFX (locked = buzz, active = bright tone)
    playZoneClickSfx(state, isMuted);

    // Coming-soon: friendly Mushika pop + VO, no navigation
    if (state === 'coming-soon') {
      setShakingZoneId(zone.id);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => setShakingZoneId(null), 360);
      if (mushikaPop) return;
      setMushikaPop({ zone, state, headshake: true });
      speakMapVoEvents([{
        text: `${zone.name.replace('\n', ' ')} is coming soon! We'll explore it together.`,
        delay: 200
      }]);
      mushikaTimerRef.current = setTimeout(() => {
        setMushikaPop(null);
      }, 1800);
      return;
    }

    // Locked: friendly Mushika headshake + redirect VO
    if (state === 'locked') {
      setShakingZoneId(zone.id);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => setShakingZoneId(null), 360);
      if (mushikaPop) return;
      setMushikaPop({ zone, state, headshake: true });
      speakMapVoEvents([{
        text: "Not yet! Let's start with Symbol Mountain.",
        delay: 200
      }]);
      mushikaTimerRef.current = setTimeout(() => {
        setMushikaPop(null);
      }, 1800);
      return;
    }

    if (state === 'unlocking') return;

    // First-ever Symbol Mountain tap: go straight to modak
    const isFirstSymbolTap =
      zone.id === ZONE_IDS.SYMBOL &&
      isFirstTimeLoad &&
      !hasSeenMushikaPop(zone.id);

    if (isFirstSymbolTap) {
      markMushikaPopSeen(zone.id);
      navigateToZone(zone, state);
      return;
    }

    // All unlocked zones: navigate immediately, no Mushika pop
    markMushikaPopSeen(zone.id);
    navigateToZone(zone, state);
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

      <button
        type="button"
        className={`map-sound-toggle ${isMuted ? 'muted' : ''}`}
        onClick={toggleMute}
        aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
        title={isMuted ? 'Sound off (tap to turn on)' : 'Sound on (tap to turn off)'}
      >
        <span className="map-sound-toggle__icon" aria-hidden="true">
          {isMuted ? '🔇' : '🔊'}
        </span>
      </button>

      {/* Background image */}
      <img
        src="/images/map/newmapbg.png"
        alt="Map"
        className="map-bg-img"
      />
      <img
        src="/images/map/modakmtn.png"
        alt=""
        className="map-zone-art map-zone-art-symbol"
        aria-hidden="true"
      />
      <img
        src="/images/map/river6.png"
        alt=""
        className="map-zone-art map-zone-art-river"
        aria-hidden="true"
      />
      <img
        src="/images/map/cavelight.png"
        alt=""
        className="map-zone-art map-zone-art-cave"
        aria-hidden="true"
      />
      <img
        src="/images/map/abtmehut2.png"
        alt=""
        className="map-zone-art map-zone-art-hut"
        aria-hidden="true"
      />
      <img
        src="/images/map/festivalsq1.png"
        alt=""
        className="map-zone-art map-zone-art-festival"
        aria-hidden="true"
      />
      <img
        src="/images/map/treehouse1.png"
        alt=""
        className="map-zone-art map-zone-art-treehouse"
        aria-hidden="true"
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
        const isFirstTimeSymbol =
          isFirstTimeLoad &&
          zone.id === ZONE_IDS.SYMBOL &&
          baseState === 'active';

        return (
          <div key={zone.id} className={`zone-group ${state === 'completed' ? 'zone-complete' : ''}`}>
            {/* Tap area */}
            <div
              className={`${layout.zoneClass} zone-state-${state} ${unlockClass} ${isSymbolMountainZone ? 'symbol-mountain-door' : ''} ${isFirstTimeSymbol ? 'zone-state-first-time' : ''} ${shakingZoneId === zone.id ? 'zone-tap-shake' : ''}`.trim()}
              onClick={() => handleZoneClick(zone, state)}
              aria-disabled={isDisabled}
            >
            </div>

            {/* Label */}
            <div
              className={`${layout.labelClass} label-state-${labelState} ${isSymbolMountainZone ? 'zone-title' : ''} ${pulsingLabelZoneId === zone.id ? 'label-tap-pulse' : ''}`.trim()}
              onClick={() => handleZoneClick(zone, state)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleZoneClick(zone, state);
                }
              }}
              aria-label={`Open ${zone.name.replace('\n', ' ')}`}
            >
              {state === 'completed' && (
                <span className="zone-check-badge zone-check-badge--label" aria-hidden="true">✓</span>
              )}
              {zone.name.replace(/\n/g, ' ')}
              {isFirstTimeSymbol && (
                <div className="first-time-hint">Tap to start</div>
              )}
              {state === 'coming-soon' && (
                <div className="coming-soon-pill">
                  {zone.id === 'cave-of-secrets' || zone.id === 'festival-square' ? 'Opening Soon' : 'Coming Soon'}
                </div>
              )}
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
      {false && mapGaneshaState && (
        <div
          className={`map-ganesha-guide map-ganesha-wrapper ${isGaneshaWalking ? 'is-walking' : ''}`}
          style={(() => {
            const { transform, ...rest } = mapGaneshaState.position;
            return isGaneshaWalking ? rest : mapGaneshaState.position;
          })()}
          aria-hidden="true"
        >
          <div className="map-ganesha-guide__float">
            <img
              src={getMainMapGaneshaAsset(mapGaneshaState.pose, isGaneshaWalking)}
              alt=""
              style={{
                width: mapGaneshaState.size,
                height: mapGaneshaState.size,
                objectFit: 'contain',
              }}
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
                  src={`/images/new-explorer-${animalId}.webp`}
                  alt={activeProfile.name}
                  className="map-profile-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                activeProfile.avatar || '🧒'
              )}
            </span>
            <span className="profile-pill-name">{toTitleCase(activeProfile.name || '')}</span>
            <span
              className="parent-icon"
              title="Parent Corner (hold)"
              aria-label="Open Parent Corner (hold)"
              role="button"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={startParentHold}
              onPointerUp={endParentHold}
              onPointerLeave={endParentHold}
              onPointerCancel={endParentHold}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') triggerParentCorner(e);
              }}
            >
              <img src="/images/icons/parent-icon.png" alt="" className="parent-icon-img" />
            </span>
          </button>
        );
      })()}

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
      {false && (
        <button
          className="map-twg-btn time-ganesha-btn"
          onClick={() => (onTWGOpen ? onTWGOpen() : onZoneSelect?.('twg'))}
          aria-label="Time with Ganesha"
        >
          Time with Ganesha
        </button>
      )}

    </div>
  );
};

export default CleanMapZone;
