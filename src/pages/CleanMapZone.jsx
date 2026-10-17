// CleanMapZone.jsx - Clean map with zone states (locked/active/in-progress/completed)
import React, { useState, useEffect, useRef } from 'react';
import './CleanMapZone.css';
import GestureDemo from '../lib/components/feedback/GestureDemo';
import GameStateManager from '../lib/services/GameStateManager';
import { GANESHA_POSE_ASSETS } from '../lib/config/ganeshaUsageSystem';
import { isSfxOn } from '../lib/utils/soundPrefs';
import { ambience } from '../lib/audio/ambience';
import HoldMuteButton from '../lib/components/ui/HoldMuteButton/HoldMuteButton';
// import ZonePreviewModal from './components/ZonePreviewModal'; // commented out — no preview modal
import useAudioPreference from '../lib/hooks/useAudioPreference';

const MapEditorFull = import.meta.env.DEV
  ? React.lazy(() => import('./MapEditorFull'))
  : null;

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
    unlockNote: null,
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
    name: "Lambodara Lodge",
    sequence: 1,
    unlockRequires: 'shloka-river',
    unlockNote: null,
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

// Child journey order for map hierarchy (current / next / distant). Cave, Festival, Treehouse are future content.
const PLAYABLE_JOURNEY_ZONE_IDS = [ZONE_IDS.SYMBOL, ZONE_IDS.RIVER, ZONE_IDS.HUT];
const PRIMARY_MAP_JOURNEY = PLAYABLE_JOURNEY_ZONE_IDS;
const UNLOCKABLE_JOURNEY_ZONE_IDS = [ZONE_IDS.RIVER, ZONE_IDS.HUT];

const readMapFlag = (key) => {
  try { return localStorage.getItem(key) === 'true'; } catch { return false; }
};
const writeMapFlag = (key) => {
  try { localStorage.setItem(key, 'true'); } catch { /* Persistence is best effort. */ }
};
const getZoneStartedKey = (profileId, zoneId) => `gmb_zone_started_${profileId}_${zoneId}`;
const getMapUnlockSeenKey = (profileId, zoneId) => `gmb_map_unlock_seen_${profileId}_${zoneId}`;

const ZONE_ART_TO_ZONE_ID = {
  symbol: ZONE_IDS.SYMBOL,
  river: ZONE_IDS.RIVER,
  hut: ZONE_IDS.HUT,
  festival: ZONE_IDS.FESTIVAL,
  treehouse: ZONE_IDS.TREEHOUSE,
  cave: ZONE_IDS.CAVE,
};

// Temporarily keep Wonder Caves out of the visible map without removing its data/config.
const HIDDEN_MAP_ZONE_IDS = new Set([ZONE_IDS.CAVE]);

const MAP_ZONE_UNLOCK_VO = {
  [ZONE_IDS.RIVER]: 'The Shloka River is waiting for you.',
  [ZONE_IDS.HUT]: 'Lambodara Lodge is waiting for you.',
};

const MAP_ZONE_COMPLETION_VO = {
  [ZONE_IDS.SYMBOL]: 'Wonderful! You discovered all the symbols of Symbol Mountain.',
  [ZONE_IDS.RIVER]: 'Beautiful chanting! You completed the Shloka River.',
  [ZONE_IDS.CAVE]: 'Amazing! You uncovered all the secrets of the cave.',
  [ZONE_IDS.FESTIVAL]: 'What a celebration! You finished everything in Festival Square.',
  [ZONE_IDS.HUT]: 'I loved learning about you! You completed Lambodara Lodge.',
};

// Temporary debug switches for QA checks.
// Set both back to false after verification.
import { isDevUnlockAll } from '../lib/utils/devUnlock';
// Dev builds only: ?unlockall=1 opens every zone (see lib/utils/devUnlock.js). Always false in production.
const DEBUG_UNLOCK_ALL_ZONES = isDevUnlockAll();
const DEBUG_ALWAYS_OPEN_ZONE_WELCOME = false;

const getZoneDefinition = (zoneId) => ZONES_DATA.find((zone) => zone.id === zoneId);

const getZoneSceneIds = (zoneId) => getZoneDefinition(zoneId)?.scenes?.map((scene) => scene.id) || [];

const getCompletedScenes = (allProgress, zoneId) => allProgress[zoneId]?.completedScenes || 0;

const getTotalScenes = (zoneId) => {
  return getZoneSceneIds(zoneId).length;
};

const isZoneComplete = (allProgress, zoneId) => {
  const totalScenes = getTotalScenes(zoneId);
  return totalScenes > 0 && getCompletedScenes(allProgress, zoneId) >= totalScenes;
};

const isZoneUnlocked = (zoneId, allProgress) => {
  if (DEBUG_UNLOCK_ALL_ZONES) return true;

  // Journey starts here
  if (zoneId === ZONE_IDS.SYMBOL) return true;

  // Finish Modak Mountain before River opens
  if (zoneId === ZONE_IDS.RIVER) {
    return isZoneComplete(allProgress, ZONE_IDS.SYMBOL);
  }

  // Finish River before Lodge opens
  if (zoneId === ZONE_IDS.HUT) {
    return isZoneComplete(allProgress, ZONE_IDS.RIVER);
  }

  // Future content
  if (zoneId === ZONE_IDS.CAVE) return false;
  if (zoneId === ZONE_IDS.FESTIVAL) return false;
  if (zoneId === ZONE_IDS.TREEHOUSE) return false;

  return false;
};

const playUnlockChime = (intensity = 'normal', muted = false) => {
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

// ── Phone landscape composition ─────────────────────────────────────────
// Same map pieces, recomposed for the wide + shallow phone canvas.
// Tablet/desktop keep using the editor-controlled defaults.
const PHONE_LANDSCAPE_QUERY =
  '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';

const PHONE_MAP_ZONE_ART = {
  symbol:    { left: 18, top: 18, w: 24, h: 32 },

  hut:       { left: 27, top: 56, w: 21, h: 26 },
  festival:  { left: 79, top: 48, w: 15, h: 19 },
  treehouse: { left: 72, top: 69, w: 13, h: 17 },
};

const PHONE_MAP_OVERLAYS = {
  symbolLabel:      { left: 21, top: 12 },
  riverLabel:       { left: 70, top: 12 },
  hutLabel:         { left: 14, top: 57 },
  festivalLabel:    { left: 76, top: 45 },
  treehouseLabel:   { left: 70, top: 70 },
  ganeshaSymbol:    { left: 39, top: 49 },
  ganeshaRiver:     { left: 70, top: 43 },
  ganeshaHut:       { left: 32, top: 67 },
  ganeshaFestival:  { left: 75, top: 58 },
  ganeshaTreehouse: { left: 68, top: 68 },
  ganeshaAllDone:   { left: 50, top: 78 },
  creatureSymbol:   { left: 36, top: 29 },
  creatureRiver:    { left: 76, top: 22 },
  creatureHut:      { left: 28, top: 58 },
};

const PHONE_ZONE_MUSHIKA_POS = {
  'symbol-mountain': { left: '27%',  top:    '33%' },
  'shloka-river':    { right: '19%', top:    '32%' },
  'festival-square': { right: '15%', bottom: '25%' },
  'about-me-hut':    { left: '14%',  bottom: '22%' },
  'story-treehouse': { left: '57%',  bottom: '20%' },
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

// Creature assigned to each active zone (butterfly / bird).
// coming-soon zones get no creature — they have the building sign instead.
const ZONE_CREATURES = {
  'symbol-mountain': { src: '/images/map/butterflyyellow.webp', cls: 'zone-butterfly modak-butterfly'   },
  'shloka-river':    { src: '/images/map/butterflyblue.webp',   cls: 'zone-butterfly shloka-butterfly'  },
  'about-me-hut':    { src: '/images/map/birdnew.webp',         cls: 'zone-bird     mooshika-bird'      },
};

// Permanent decorative props placed via the Map Prop Editor.
// To adjust: open the editor (🌿 Edit Props button), tweak, Copy JSON, paste here.
const MAP_PROPS = [
  { id: 'tree2-6', type: 'tree2', src: '/images/map/tree2.webp', left: 75.6, top: 77, w: 4, flip: false },
  { id: 'tree1-9', type: 'tree1', src: '/images/map/tree1.webp', left: 89.8, top: 65.3, w: 6, flip: false },
  { id: 'flower1-25', type: 'flower1', src: '/images/map/flower1.webp', left: 34, top: 36.1, w: 3, flip: false },
  { id: 'flower2-31', type: 'flower2', src: '/images/map/flower2.webp', left: 66.1, top: 56, w: 3, flip: false },
  { id: 'flower1-32', type: 'flower1', src: '/images/map/flower1.webp', left: 67.6, top: 58.5, w: 3, flip: true },
  { id: 'flower1-34', type: 'flower1', src: '/images/map/flower1.webp', left: 81.8, top: 87.1, w: 3, flip: false },
  { id: 'flower1-35', type: 'flower1', src: '/images/map/flower1.webp', left: 76.6, top: 72.7, w: 3, flip: false },
  { id: 'flower1-36', type: 'flower1', src: '/images/map/flower1.webp', left: 72.3, top: 43.3, w: 4, flip: false },
  { id: 'grass-39', type: 'grass', src: '/images/map/grass.webp', left: 55, top: 40, w: 3, flip: true },
  { id: 'tree1-55', type: 'tree1', src: '/images/map/tree1.webp', left: 49.4, top: 39.9, w: 4, flip: false },
  { id: 'flower1-66', type: 'flower1', src: '/images/map/flower1.webp', left: 45, top: 48, w: 5, flip: false },
  { id: 'flower2-67', type: 'flower2', src: '/images/map/flower2.webp', left: 48.2, top: 52.6, w: 5, flip: false },
];

const MAP_PROPS_STORAGE_KEY = 'gmb_map_props';
const loadSavedProps = () => {
  try {
    const raw = localStorage.getItem(MAP_PROPS_STORAGE_KEY);
    if (!raw) return MAP_PROPS;
    const saved = JSON.parse(raw);
    const savedById = Object.fromEntries(saved.map(p => [p.id, p]));
    return MAP_PROPS.map(p => savedById[p.id] ? { ...p, ...savedById[p.id] } : p);
  } catch {
    return MAP_PROPS;
  }
};

const MAP_OVERLAY_STORAGE_KEY = 'gmb_map_overlays';
const MAP_OVERLAY_DEFAULTS = {
  symbolLabel: {
    id: 'symbolLabel',
    label: 'Modak Title',
    kind: 'label',
    text: 'Modak Mountain',
    left: 25.1,
    top: 5.7,
    w: 22,
    h: 3,
  },
  riverLabel: {
    id: 'riverLabel',
    label: 'River Title',
    kind: 'label',
    text: 'Shloka River',
    left: 69,
    top: 16,
    w: 22,
    h: 5,
  },
  festivalLabel: {
    id: 'festivalLabel',
    label: 'Lotus Title',
    kind: 'label',
    text: 'Lotus Square',
    left: 75,
    top: 45,
    w: 18,
    h: 5,
  },
  festivalBuilding: {
    id: 'festivalBuilding',
    label: 'Lotus Sign',
    kind: 'sign',
    src: '/images/map/building.webp',
    left: 82,
    top: 67,
    w: 12,
    h: 10,
  },
  hutLabel: {
    id: 'hutLabel',
    label: 'Hut Title',
    kind: 'label',
    text: "Lambodara Lodge",
    left: 10.2,
    top: 47.6,
    w: 12,
    h: 4.5,
  },
  treehouseLabel: {
    id: 'treehouseLabel',
    label: 'Treehouse Title',
    kind: 'label',
    text: 'Tusk Treehouse',
    left: 65,
    top: 72,
    w: 22,
    h: 5,
  },
  treehouseBuilding: {
    id: 'treehouseBuilding',
    label: 'Treehouse Sign',
    kind: 'sign',
    src: '/images/map/building.webp',
    left: 76,
    top: 98,
    w: 12,
    h: 10,
  },
  ganeshaSymbol: {
    id: 'ganeshaSymbol',
    label: 'Ganesha Modak',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.standPoint,
    left: 31,
    top: 50,
    w: 8,
    h: 10,
  },
  ganeshaCave: {
    id: 'ganeshaCave',
    label: 'Ganesha Cave',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.standPoint,
    left: 48,
    top: 42,
    w: 8,
    h: 10,
  },
  ganeshaRiver: {
    id: 'ganeshaRiver',
    label: 'Ganesha River',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.standPoint,
    left: 66,
    top: 44,
    w: 8,
    h: 10,
  },
  ganeshaFestival: {
    id: 'ganeshaFestival',
    label: 'Ganesha Lotus',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.standPoint,
    left: 69,
    top: 67,
    w: 8,
    h: 10,
  },
  ganeshaHut: {
    id: 'ganeshaHut',
    label: 'Ganesha Hut',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.standPoint,
    left: 28,
    top: 70,
    w: 8,
    h: 10,
  },
  ganeshaTreehouse: {
    id: 'ganeshaTreehouse',
    label: 'Ganesha Treehouse',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.standPoint,
    left: 43,
    top: 58,
    w: 8,
    h: 10,
  },
  ganeshaAllDone: {
    id: 'ganeshaAllDone',
    label: 'Ganesha Final',
    kind: 'image',
    src: GANESHA_POSE_ASSETS.celebrate,
    left: 50,
    top: 83,
    w: 10,
    h: 12,
  },
  mushikaSymbol: {
    id: 'mushikaSymbol',
    label: 'Mushika Modak',
    kind: 'image',
    src: '/images/welcome-mooshika1.webp',
    left: 21,
    top: 36,
    w: 8,
    h: 10,
  },
  mushikaCave: {
    id: 'mushikaCave',
    label: 'Mushika Cave',
    kind: 'image',
    src: '/images/welcome-mooshika1.webp',
    left: 80,
    top: 74,
    w: 8,
    h: 10,
  },
  mushikaRiver: {
    id: 'mushikaRiver',
    label: 'Mushika River',
    kind: 'image',
    src: '/images/welcome-mooshika1.webp',
    left: 71,
    top: 38,
    w: 8,
    h: 10,
  },
  mushikaFestival: {
    id: 'mushikaFestival',
    label: 'Mushika Lotus',
    kind: 'image',
    src: '/images/welcome-mooshika1.webp',
    left: 73,
    top: 70,
    w: 8,
    h: 10,
  },
  mushikaHut: {
    id: 'mushikaHut',
    label: 'Mushika Hut',
    kind: 'image',
    src: '/images/welcome-mooshika1.webp',
    left: 14,
    top: 68,
    w: 8,
    h: 10,
  },
  mushikaTreehouse: {
    id: 'mushikaTreehouse',
    label: 'Mushika Treehouse',
    kind: 'image',
    src: '/images/welcome-mooshika1.webp',
    left: 40,
    top: 60,
    w: 8,
    h: 10,
  },
  creatureSymbol: {
    id: 'creatureSymbol',
    label: 'Butterfly Modak',
    kind: 'image',
    src: '/images/map/butterflyyellow.webp',
    left: 32,
    top: 28,
    w: 4,
    h: 5,
  },
  creatureRiver: {
    id: 'creatureRiver',
    label: 'Butterfly River',
    kind: 'image',
    src: '/images/map/butterflyblue.webp',
    left: 74,
    top: 18,
    w: 4,
    h: 5,
  },
  creatureHut: {
    id: 'creatureHut',
    label: 'Bird Hut',
    kind: 'image',
    src: '/images/map/birdnew.webp',
    left: 26,
    top: 55,
    w: 4,
    h: 5,
  },
};

const ZONE_LABEL_OVERLAY_IDS = {
  [ZONE_IDS.SYMBOL]: 'symbolLabel',
  [ZONE_IDS.RIVER]: 'riverLabel',
  [ZONE_IDS.FESTIVAL]: 'festivalLabel',
  [ZONE_IDS.HUT]: 'hutLabel',
  [ZONE_IDS.TREEHOUSE]: 'treehouseLabel',
};

const ZONE_GANESHA_OVERLAY_IDS = {
  [ZONE_IDS.SYMBOL]: 'ganeshaSymbol',
  [ZONE_IDS.CAVE]: 'ganeshaCave',
  [ZONE_IDS.RIVER]: 'ganeshaRiver',
  [ZONE_IDS.FESTIVAL]: 'ganeshaFestival',
  [ZONE_IDS.HUT]: 'ganeshaHut',
  [ZONE_IDS.TREEHOUSE]: 'ganeshaTreehouse',
};

const ZONE_MUSHIKA_OVERLAY_IDS = {
  [ZONE_IDS.SYMBOL]: 'mushikaSymbol',
  [ZONE_IDS.CAVE]: 'mushikaCave',
  [ZONE_IDS.RIVER]: 'mushikaRiver',
  [ZONE_IDS.FESTIVAL]: 'mushikaFestival',
  [ZONE_IDS.HUT]: 'mushikaHut',
  [ZONE_IDS.TREEHOUSE]: 'mushikaTreehouse',
};

const ZONE_CREATURE_OVERLAY_IDS = {
  [ZONE_IDS.SYMBOL]: 'creatureSymbol',
  [ZONE_IDS.RIVER]: 'creatureRiver',
  [ZONE_IDS.HUT]: 'creatureHut',
};

const loadSavedOverlays = () => {
  try {
    const raw = localStorage.getItem(MAP_OVERLAY_STORAGE_KEY);
    if (!raw) return MAP_OVERLAY_DEFAULTS;
    const parsed = JSON.parse(raw);
    const merged = {};
    Object.entries(MAP_OVERLAY_DEFAULTS).forEach(([key, value]) => {
      merged[key] = { ...value, ...(parsed[key] || {}) };
    });
    return merged;
  } catch {
    return MAP_OVERLAY_DEFAULTS;
  }
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

const MAP_ZONE_ART_STORAGE_KEY = 'gmb_map_zone_art';
const MAP_ZONE_ART_DEFAULTS = {
  symbol: {
    id: 'symbol',
    label: 'Modak Mountain',
    src: '/images/map/modakmtn-shell.webp',
    left: 13,
    top: 16.3,
    w: 24,
    h: 25,
    centered: false,
    flip: false,
    rotate: 0,
    opacity: 1
  },
  shlokaStream: {
    id: 'shlokaStream', label: 'Shloka River — River',
    src: '/images/map/shloka-stream-opt.webp',
    left: 52.2, top: 64.6, w: 25, h: 79,
    centered: true, flip: false, rotate: 10, opacity: 1
  },
  shlokaWaterfall: {
    id: 'shlokaWaterfall', label: 'Shloka River — Waterfall',
    src: '/images/map/shloka-waterfall-opt.webp',
    left: 63.6, top: 23.4, w: 19, h: 24,
    centered: true, flip: false, rotate: 0, opacity: 1
  },
  shlokaBridge: {
    id: 'shlokaBridge', label: 'Shloka River — Bridge',
    src: '/images/map/shloka-bridge-opt.webp',
    left: 59.7, top: 51.1, w: 13, h: 15,
    centered: true, flip: false, rotate: 2, opacity: 1
  },
  cave: {
    id: 'cave',
    label: 'Wonder Caves',
    src: '/images/map/cavelight.webp',
    left: 72.3,
    top: 40.1,
    w: 28,
    h: 26,
    centered: false,
    flip: false,
    rotate: 0,
    opacity: 0.5
  },
  hut: {
    id: 'hut',
    label: "Lambodara Lodge",
    src: '/images/map/abtmehut2.webp',
    left: 11.7,
    top: 48.7,
    w: 27,
    h: 31,
    centered: false,
    flip: false,
    rotate: 0,
    opacity: 1
  },
  festival: {
    id: 'festival',
    label: 'Lotus Square',
    src: '/images/map/festivalsq1.webp',
    left: 66.4,
    top: 26.9,
    w: 30,
    h: 30,
    centered: false,
    flip: false,
    rotate: 0,
    opacity: 0.5
  },
  treehouse: {
    id: 'treehouse',
    label: 'Tusk Treehouse',
    src: '/images/map/treehouse1.webp',
    left: 73.2,
    top: 57.8,
    w: 22,
    h: 26,
    centered: false,
    flip: true,
    rotate: 0,
    opacity: 0.5
  }
};

const loadSavedZoneArt = () => {
  try {
    const raw = localStorage.getItem(MAP_ZONE_ART_STORAGE_KEY);
    if (!raw) return MAP_ZONE_ART_DEFAULTS;
    const parsed = JSON.parse(raw);
    const merged = {};
    Object.entries(MAP_ZONE_ART_DEFAULTS).forEach(([key, value]) => {
      // Merge only current pieces so retired combined river art is not restored.
      merged[key] = { ...value, ...(parsed[key] || {}) };
    });
    return merged;
  } catch {
    return MAP_ZONE_ART_DEFAULTS;
  }
};

// Resolve avatar string/emoji → animal id for image path
const getAnimalId = (avatar) => {
  if (!avatar) return null;
  if (typeof avatar === 'object' && avatar.id) return avatar.id;
  const emojiMap = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  if (emojiMap[avatar]) return emojiMap[avatar];
  if (typeof avatar === 'string') {
    // Expanded avatar library (fish, elephant, lion, rabbit, owl, ...)
    const id = avatar.trim().toLowerCase();
    if (/^[a-z0-9-]+$/.test(id)) return id;
  }
  return null;
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

  const { completedScenes, totalScenes, hasStarted } = p;
  if (completedScenes >= totalScenes && totalScenes > 0) return 'completed';
  if (hasStarted || completedScenes > 0) return 'in-progress';
  return 'active';
};

const isZoneDone = (allProgress, zoneId) => {
  const zone = allProgress[zoneId];
  return !!zone && zone.totalScenes > 0 && zone.completedScenes >= zone.totalScenes;
};

const getMapGaneshaState = (allProgress, unlockingZones, overlayItems = {}, showJourneyCelebration = false) => {
  const getGaneshaPosition = (zoneId) => {
    const overlayId = ZONE_GANESHA_OVERLAY_IDS[zoneId];
    const overlay = overlayId ? overlayItems[overlayId] : null;
    if (overlay) {
      return { left: `${overlay.left}%`, top: `${overlay.top}%` };
    }
    return MAP_GANESHA_ZONE_POS[zoneId];
  };

  const getFinalGaneshaPosition = () => {
    const overlay = overlayItems.ganeshaAllDone;
    if (overlay) {
      return { left: `${overlay.left}%`, top: `${overlay.top}%` };
    }
    return MAP_GANESHA_ALL_DONE_POS;
  };

  const zoneIds = MAP_ZONE_ORDER.filter((zoneId) => allProgress[zoneId]);
  if (zoneIds.length === 0) {
    return {
      pose: 'pointing',
      size: 88,
      position: {
        ...getGaneshaPosition('symbol-mountain'),
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  if (showJourneyCelebration) {
    return {
      pose: 'celebration',
      size: 112,
      position: {
        ...getFinalGaneshaPosition(),
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const unlockingZoneId = Object.keys(unlockingZones || {})[0];
  if (unlockingZoneId && getGaneshaPosition(unlockingZoneId)) {
    return {
      pose: 'thumbs_up',
      size: 92,
      position: {
        ...getGaneshaPosition(unlockingZoneId),
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const unlockedPendingZones = PRIMARY_MAP_JOURNEY.filter((zoneId) => {
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
        ...getGaneshaPosition(zoneId),
        transform: 'translate(-50%, -50%)',
      },
    };
  }

  const recommendedZone = unlockedPendingZones[0] || 'symbol-mountain';
  return {
    pose: 'thumbs_up',
    size: 92,
    position: {
      ...(getGaneshaPosition(recommendedZone) || getGaneshaPosition('symbol-mountain')),
      transform: 'translate(-50%, -50%)',
    },
  };
};

const getMainMapGaneshaAsset = (pose, isWalking) => {
  if (isWalking) return GANESHA_POSE_ASSETS.standPoint;
  if (pose === 'celebration') return GANESHA_POSE_ASSETS.celebrate;
  return GANESHA_POSE_ASSETS.standPoint;
};

// First scene for each zone — used for direct entry on first visit
const ZONE_FIRST_SCENES = {
  'symbol-mountain':  'modak',
  'cave-of-secrets':  'vakratunda-mahakaya',
  'shloka-river':     'vakratunda-grove',
  'festival-square':  'game1',
  'about-me-hut':     'family-tree',
};

const CleanMapZone = ({ onZoneSelect, onBackToWelcome, onGoToProfiles, onTWGOpen, onParentCorner }) => {
  const [zoneProgress, setZoneProgress] = useState({});
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [showJourneyCelebration, setShowJourneyCelebration] = useState(false);
  const journeyCelebrationStartedRef = useRef(false);
  const [mapDebugMode, setMapDebugMode] = useState(false);
  const [propItems, setPropItems] = useState(loadSavedProps);
  const [overlayItems, setOverlayItems] = useState(loadSavedOverlays);
  const [zoneArtItems, setZoneArtItems] = useState(loadSavedZoneArt);
  // const [selectedZone, setSelectedZone] = useState(null);  // removed — no preview modal
  // const [showZoneModal, setShowZoneModal] = useState(false); // removed — no preview modal
  const [activeProfile, setActiveProfile] = useState(null);
  const [unlockingZones, setUnlockingZones] = useState({});
  const [firstMapTapDone, setFirstMapTapDone] = useState(() => {
    try {
      const profileId = localStorage.getItem('activeProfileId');
      return localStorage.getItem(`gmb_map_first_tap_${profileId}`) === 'done';
    } catch {
      return false;
    }
  });
  const [mushikaPop, setMushikaPop] = useState(null); // { zone, state } | null
  const [isGaneshaWalking, setIsGaneshaWalking] = useState(false);
  const [pulsingLabelZoneId, setPulsingLabelZoneId] = useState(null);
  const [isPhoneLandscape, setIsPhoneLandscape] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(PHONE_LANDSCAPE_QUERY).matches
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia(PHONE_LANDSCAPE_QUERY);
    const sync = () => setIsPhoneLandscape(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);
  const { isAudioOn } = useAudioPreference();
  const unlockTimersRef = useRef({});
  const voiceTimersRef = useRef([]);
  const mushikaTimerRef = useRef(null);
  const labelPulseTimerRef = useRef(null);
  const prevZoneStatesRef = useRef(null);
  const prevGaneshaPosRef = useRef(null);
  const walkTimerRef = useRef(null);
  const parentHoldTimerRef = useRef(null);
  const parentHoldTriggeredRef = useRef(false);
  const editorTouchedRef = useRef(false);
  // Voice mute only (Home hold-to-mute / Settings > Voice). Ambient loop and SFX keep playing.
  const isMuted = !isAudioOn;
  // Parent Settings > Ambience: follows the switch live (Settings can change while the map is open).

  // Freemium extension point: Day-3-or-later return is the other paywall-trigger
  // moment (alongside Zone 1 completion in GameStateManager.unlockNextScene). No
  // paywall UI is built yet — see PaywallManager.js — this just wires the call site.
  // Runs once per map mount, not part of the onboarding sequence.
  useEffect(() => {
    const profile = GameStateManager.getCurrentProfile?.();
    if (!profile) return;
    import('../lib/services/PaywallManager').then(({ checkPaywallTrigger, isDayThreeOrLaterReturn }) => {
      if (isDayThreeOrLaterReturn(profile)) {
        checkPaywallTrigger({ reason: 'day3-return', profile });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editorTouchedRef.current) return;
    try {
      localStorage.setItem(MAP_PROPS_STORAGE_KEY, JSON.stringify(propItems));
    } catch {
      // best effort only
    }
  }, [propItems]);

  useEffect(() => {
    if (!editorTouchedRef.current) return;
    try {
      localStorage.setItem(MAP_OVERLAY_STORAGE_KEY, JSON.stringify(overlayItems));
    } catch {
      // best effort only
    }
  }, [overlayItems]);

  useEffect(() => {
    if (!editorTouchedRef.current) return;
    try {
      localStorage.setItem(MAP_ZONE_ART_STORAGE_KEY, JSON.stringify(zoneArtItems));
    } catch {
      // best effort only
    }
  }, [zoneArtItems]);

  const currentMapZoneId =
    PRIMARY_MAP_JOURNEY.find(
      (zoneId) => isZoneUnlocked(zoneId, zoneProgress) && !isZoneDone(zoneProgress, zoneId)
    ) ||
    [...PRIMARY_MAP_JOURNEY].reverse().find((zoneId) => isZoneDone(zoneProgress, zoneId)) ||
    ZONE_IDS.SYMBOL;
  const currentJourneyIndex = PRIMARY_MAP_JOURNEY.indexOf(currentMapZoneId);
  const nextMapZoneId =
    currentJourneyIndex >= 0 && currentJourneyIndex < PRIMARY_MAP_JOURNEY.length - 1
      ? PRIMARY_MAP_JOURNEY[currentJourneyIndex + 1]
      : null;

  const getZoneArtStyle = (id, extra = {}) => {
    const baseArt = zoneArtItems[id];
    const phoneOverride = isPhoneLandscape ? PHONE_MAP_ZONE_ART[id] : null;
    const art = phoneOverride ? { ...baseArt, ...phoneOverride } : baseArt;
    const transforms = [];

    if (art?.centered) transforms.push('translate(-50%, -50%)');
    if (art?.flip) transforms.push('scaleX(-1)');
    if (art?.rotateY) transforms.push(`rotateY(${art.rotateY}deg)`);
    if (art?.rotate) transforms.push(`rotate(${art.rotate}deg)`);

    // Map hierarchy: current / next / later / WIP (all devices)
    const hierarchyZoneId = ZONE_ART_TO_ZONE_ID[id];
    let artLeft = art.left;
    let artTop = art.top;
    let hierarchyScale = 1;
    let hierarchyOpacity = art?.opacity ?? 1;
    let hierarchyFilter = 'none';

    if (hierarchyZoneId) {
      const hierarchyState = getZoneState(hierarchyZoneId, zoneProgress);
      if (hierarchyZoneId === currentMapZoneId) {
        hierarchyScale = 1.10;
        hierarchyOpacity = 1;
        hierarchyFilter = 'saturate(1)';
      } else if (hierarchyZoneId === nextMapZoneId) {
        // River artwork is intrinsically much larger, so shrink it more while "next"
        hierarchyScale = hierarchyZoneId === ZONE_IDS.RIVER ? 0.84 : 0.92;
        hierarchyOpacity = 0.92;
        hierarchyFilter = 'saturate(0.92)';
      } else if (hierarchyState === 'completed') {
        hierarchyScale = 0.94;
        hierarchyOpacity = 0.82;
        hierarchyFilter = 'saturate(0.9) brightness(1)';
      } else if (hierarchyZoneId === ZONE_IDS.HUT) {
        // Zone 3 — a real destination, just not reached yet
        hierarchyScale = 0.92;
        hierarchyOpacity = 0.72;
        hierarchyFilter = 'saturate(0.82)';
      } else {
        // Lotus Square / Tusk Treehouse — WIP, atmospheric landmarks only
        hierarchyScale = 0.88;
        hierarchyOpacity = 0.38;
        hierarchyFilter = 'saturate(0.55)';
      }

    }

    if (hierarchyScale !== 1) transforms.push(`scale(${hierarchyScale})`);

    return {
      left: `${artLeft}%`,
      top: `${artTop}%`,
      width: `${art.w}%`,
      height: `${art.h}%`,
      transform: transforms.length ? transforms.join(' ') : 'none',
      opacity: hierarchyOpacity,
      filter: hierarchyFilter,
      transition: 'opacity 320ms ease, filter 320ms ease, transform 320ms ease',
      ...extra
    };
  };

  const responsiveOverlayItems = isPhoneLandscape
    ? Object.fromEntries(
        Object.entries(overlayItems).map(([id, item]) => [
          id,
          PHONE_MAP_OVERLAYS[id] ? { ...item, ...PHONE_MAP_OVERLAYS[id] } : item,
        ])
      )
    : overlayItems;

  const getOverlayStyle = (id, extra = {}) => {
    const item = responsiveOverlayItems[id];
    if (!item) return extra;
    const style = {
      left: `${item.left}%`,
      top: `${item.top}%`,
      ...extra,
    };
    if (item.w != null) style.width = `${item.w}%`;
    if (item.h != null) style.height = `${item.h}%`;
    return style;
  };


  const speakMapVoEvents = (events = []) => {
    if (!Array.isArray(events) || events.length === 0) return;
    if (typeof window === 'undefined') return;
    if (isMuted) return;
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance === 'undefined') return;

    // Clear any queued lines from previous transition bursts.
    voiceTimersRef.current.forEach(clearTimeout);
    voiceTimersRef.current = [];
    window.speechSynthesis.cancel();

    events.forEach(({ text, delay = 0 }) => {
      if (!text) return;
      const timerId = setTimeout(() => {
        try {
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.rate = 1.02;
          utterance.pitch = 1;
          utterance.volume = 0.55;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          // best effort only
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
      voiceTimersRef.current.forEach(clearTimeout);
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (mushikaTimerRef.current) clearTimeout(mushikaTimerRef.current);
      if (parentHoldTimerRef.current) clearTimeout(parentHoldTimerRef.current);
    };
  }, []);

  const triggerParentCorner = (e) => {
    e?.stopPropagation?.();
    if (parentHoldTriggeredRef.current) {
      parentHoldTriggeredRef.current = false;
      return;
    }
    onParentCorner?.();
  };

  const startParentHold = (e) => {
    e.stopPropagation();
    if (!import.meta.env.DEV) return;
    parentHoldTriggeredRef.current = false;
    if (parentHoldTimerRef.current) clearTimeout(parentHoldTimerRef.current);
    parentHoldTimerRef.current = setTimeout(() => {
      parentHoldTriggeredRef.current = true;
      setMapDebugMode((prev) => !prev);
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

  // ── Ambient sound: shared player (fade, Settings, VO duck, tab-hide, autoplay unlock) ──
  useEffect(() => ambience.play('map'), []);

  useEffect(() => {
    if (!isMuted) return;
    voiceTimersRef.current.forEach(clearTimeout);
    voiceTimersRef.current = [];
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isMuted]);

  useEffect(() => {
    if (!progressLoaded) return;

    const nextStates = {};

    ZONES_DATA.forEach(zone => {
      nextStates[zone.id] = getZoneState(zone.id, zoneProgress);
    });

    const profileId = localStorage.getItem('activeProfileId');
    const firstLoad = !prevZoneStatesRef.current;
    const unseenUnlock = UNLOCKABLE_JOURNEY_ZONE_IDS.find((zoneId) => {
      const newlyAvailable = firstLoad || prevZoneStatesRef.current[zoneId] === 'locked';
      return newlyAvailable && nextStates[zoneId] === 'active' &&
        (!profileId || !readMapFlag(getMapUnlockSeenKey(profileId, zoneId)));
    });

    if (unseenUnlock && !DEBUG_UNLOCK_ALL_ZONES) {
      // Persist before scheduling the feedback so later map visits cannot repeat it.
      if (profileId) writeMapFlag(getMapUnlockSeenKey(profileId, unseenUnlock));
      setUnlockingZones(prev => ({ ...prev, [unseenUnlock]: 'normal' }));
      playUnlockChime('normal', !isSfxOn());
      speakMapVoEvents([{ text: MAP_ZONE_UNLOCK_VO[unseenUnlock], delay: 500 }]);
      if (unlockTimersRef.current[unseenUnlock]) clearTimeout(unlockTimersRef.current[unseenUnlock]);
      unlockTimersRef.current[unseenUnlock] = setTimeout(() => {
        setUnlockingZones(prev => {
          const updated = { ...prev };
          delete updated[unseenUnlock];
          return updated;
        });
        delete unlockTimersRef.current[unseenUnlock];
      }, 1400);
    } else if (firstLoad && !zoneProgress[ZONE_IDS.SYMBOL]?.hasStarted) {
      speakMapVoEvents([{ text: "Come — let's start at Modak Mountain.", delay: 300 }]);
    }
    prevZoneStatesRef.current = nextStates;
  }, [zoneProgress, isMuted, progressLoaded]);

  const loadBasicProgress = () => {
    try {
      const profileId = localStorage.getItem('activeProfileId');
      const progressData = {};
      ZONES_DATA.forEach(zone => {
        const sceneIds = getZoneSceneIds(zone.id);
        let completedScenes = 0;
        let totalStars = 0;
        let hasStarted = !!profileId && (
          readMapFlag(getZoneStartedKey(profileId, zone.id)) ||
          !!localStorage.getItem(`gmb_active_scene_${profileId}_${zone.id}`)
        );
        sceneIds.forEach(sceneId => {
          const progress = GameStateManager.getSceneProgress(zone.id, sceneId);
          if (progress?.completed) {
            hasStarted = true;
            completedScenes++;
            totalStars += progress.stars || 0;
            return;
          }
          // Also check temp session — catches scenes completed before permanent save
          if (profileId) {
            const tempKey = `temp_session_${profileId}_${zone.id}_${sceneId}`;
            const tempRaw = localStorage.getItem(tempKey);
            const replayRaw = localStorage.getItem(`replay_session_${profileId}_${zone.id}_${sceneId}`);
            if (tempRaw || replayRaw) hasStarted = true;
            try {
              const tempState = JSON.parse(tempRaw || 'null');
              if (tempState) {
                const isCompleteInTemp = (
                  tempState.completed === true ||
                  tempState.phase === 'complete' ||
                  tempState.showingCompletionScreen === true
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
          hasStarted,
          completedScenes,
          totalScenes: sceneIds.length,
          stars: totalStars,
          percentage: sceneIds.length > 0
            ? Math.round((completedScenes / sceneIds.length) * 100)
            : 0
        };
      });
      setZoneProgress(progressData);
      setProgressLoaded(true);
    } catch (error) {
      console.error('Error loading progress:', error);
      setProgressLoaded(true);
    }
  };

  const journeyComplete = progressLoaded && PLAYABLE_JOURNEY_ZONE_IDS.every((zoneId) => isZoneDone(zoneProgress, zoneId));

  useEffect(() => {
    if (!journeyComplete || journeyCelebrationStartedRef.current) return;
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;
    const seenKey = `gmb_map_journey_celebration_seen_${profileId}`;
    if (readMapFlag(seenKey)) return;
    journeyCelebrationStartedRef.current = true;
    writeMapFlag(seenKey);
    setShowJourneyCelebration(true);
    playUnlockChime('master', !isSfxOn());
    speakMapVoEvents([{
      text: 'What a wonderful journey! You explored Modak Mountain, chanted at Shloka River, and shared your story at Lambodara Lodge. I loved exploring with you!',
      delay: 500,
    }]);
  }, [journeyComplete]);

  useEffect(() => {
    if (!showJourneyCelebration) return;
    const timer = setTimeout(() => setShowJourneyCelebration(false), 12000);
    return () => clearTimeout(timer);
  }, [showJourneyCelebration]);

  const mapGaneshaState = getMapGaneshaState(zoneProgress, unlockingZones, responsiveOverlayItems, showJourneyCelebration);
  const showFirstMapGuide = progressLoaded && !mapDebugMode && !firstMapTapDone &&
    !zoneProgress[ZONE_IDS.SYMBOL]?.hasStarted &&
    (zoneProgress[ZONE_IDS.SYMBOL]?.completedScenes || 0) === 0 &&
    getZoneState(ZONE_IDS.SYMBOL, zoneProgress) === 'active';
  const firstMapArtStyle = getZoneArtStyle('symbol');
  const guideArt = { ...zoneArtItems.symbol, ...(isPhoneLandscape ? PHONE_MAP_ZONE_ART.symbol : {}) };
  const firstMapGuidePoint = {
    x: guideArt.centered ? guideArt.left : guideArt.left + guideArt.w / 2,
    y: guideArt.centered ? guideArt.top : guideArt.top + guideArt.h / 2,
  };

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
      const profileId = localStorage.getItem('activeProfileId');
      if (profileId && firstScene) {
        writeMapFlag(getZoneStartedKey(profileId, zone.id));
        localStorage.removeItem(`temp_session_${profileId}_${zone.id}_${firstScene}`);
        localStorage.removeItem(`replay_session_${profileId}_${zone.id}_${firstScene}`);
      }
      if (onZoneSelect) onZoneSelect(zone.id, firstScene);
      return;
    }
    // All other zones: open zone welcome screen
    if (onZoneSelect) onZoneSelect(zone.id);
  };

  const handleZoneClick = (zone, state) => {
    if (zone.id === ZONE_IDS.SYMBOL) {
      setFirstMapTapDone(true);
      try {
        const profileId = localStorage.getItem('activeProfileId');
        localStorage.setItem(`gmb_map_first_tap_${profileId}`, 'done');
      } catch { /* Keep the cue dismissed for this visit if storage is unavailable. */ }
    }
    setPulsingLabelZoneId(zone.id);
    if (labelPulseTimerRef.current) clearTimeout(labelPulseTimerRef.current);
    labelPulseTimerRef.current = setTimeout(() => setPulsingLabelZoneId(null), 220);

    // Play zone click SFX (locked = buzz, active = bright tone)
    playZoneClickSfx(state, !isSfxOn());

    // Locked or future destinations: not tappable, no feedback.
    if (state === 'locked' || state === 'coming-soon') {
      return;
    }

    if (state === 'unlocking') return;

    navigateToZone(zone, state);
  };

  // const handleStartZone = (zone) => { ... }; // removed — no preview modal

  return (
    <div className="map-container morning">


      <HoldMuteButton position="bottom-left" />

      {/* Background image */}
      <img
        src="/images/map/mapbg-meadow.webp"
        alt="Map"
        className="map-bg-img"
      />
      {showFirstMapGuide && (
        <img
          src="/images/map/modakmtn-shell.webp"
          alt=""
          aria-hidden="true"
          className="map-zone-art"
          style={{ ...firstMapArtStyle, zIndex: 8, opacity: 1,
            filter: 'drop-shadow(0 0 14px #fff6a0) drop-shadow(0 0 28px #ffe66b)' }}
        />
      )}
      <img
        src="/images/map/modakmtn-shell.webp"
        alt=""
        className="map-zone-art map-zone-art-symbol"
        onClick={() => handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'symbol-mountain'), getZoneState('symbol-mountain', zoneProgress))}
        role="button"
        tabIndex={0}
        aria-label="Open Modak Mountain"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'symbol-mountain'), getZoneState('symbol-mountain', zoneProgress));
          }
        }}
        style={getZoneArtStyle('symbol', { pointerEvents: 'none' })}
      />
      {['shlokaStream', 'shlokaWaterfall', 'shlokaBridge'].map((id) => (
        <img
          key={id}
          src={zoneArtItems[id].src}
          alt=""
          className="map-zone-art"
          aria-hidden="true"
          style={getZoneArtStyle(id)}
        />
      ))}
      {/* Wonder Caves is temporarily hidden from the map. Keep this block for quick restore later.
      <img
        src="/images/map/cavelight.webp"
        alt=""
        className="map-zone-art map-zone-art-cave"
        onClick={() => handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'cave-of-secrets'), getZoneState('cave-of-secrets', zoneProgress))}
        role="button"
        tabIndex={0}
        aria-label="Open Wonder Caves"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'cave-of-secrets'), getZoneState('cave-of-secrets', zoneProgress));
          }
        }}
        style={getZoneArtStyle('cave', { pointerEvents: 'none' })}
      />
      */}
      <img
        src="/images/map/abtmehut2.webp"
        alt=""
        className="map-zone-art map-zone-art-hut"
        onClick={() => handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'about-me-hut'), getZoneState('about-me-hut', zoneProgress))}
        role="button"
        tabIndex={0}
        aria-label="Open Lambodara Lodge"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'about-me-hut'), getZoneState('about-me-hut', zoneProgress));
          }
        }}
        style={getZoneArtStyle('hut', { pointerEvents: 'none' })}
      />
      <img
        src="/images/map/festivalsq1.webp"
        alt=""
        className="map-zone-art map-zone-art-festival"
        onClick={() => handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'festival-square'), getZoneState('festival-square', zoneProgress))}
        role="button"
        tabIndex={0}
        aria-label="Open Lotus Square"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'festival-square'), getZoneState('festival-square', zoneProgress));
          }
        }}
        style={getZoneArtStyle('festival', { pointerEvents: 'none' })}
      />
      <img
        src="/images/map/treehouse1.webp"
        alt=""
        className="map-zone-art map-zone-art-treehouse"
        onClick={() => handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'story-treehouse'), getZoneState('story-treehouse', zoneProgress))}
        role="button"
        tabIndex={0}
        aria-label="Open Tusk Treehouse"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick(ZONES_DATA.find((zone) => zone.id === 'story-treehouse'), getZoneState('story-treehouse', zoneProgress));
          }
        }}
        style={getZoneArtStyle('treehouse', { pointerEvents: 'none' })}
      />

      {/* Drifting clouds — CSS shapes, no image needed */}

      {/* River shimmer — light-on-water effect over Shloka River */}

      {/* Decorative props — trees, bushes, flowers, grass */}
      {propItems.map(p => (
        <img
          key={p.id}
          className="map-decor-prop"
          data-prop-type={p.type}
          src={p.src}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.w}%`,
            transform: p.flip ? 'scaleX(-1)' : 'none',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))}

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

      {import.meta.env.DEV && (
        <button
          type="button"
          className="map-editor-open-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMapDebugMode(true);
          }}
        >
          Edit Map
        </button>
      )}

      {/* ── Zone Wrappers (tap area + label grouped by state) ── */}
      {ZONES_DATA.map(zone => {
        if (HIDDEN_MAP_ZONE_IDS.has(zone.id)) return null;
        const layout = ZONE_LAYOUT[zone.id];
        if (!layout) return null;
        const baseState = getZoneState(zone.id, zoneProgress);
        const unlockIntensity = unlockingZones[zone.id];
        const state = unlockIntensity ? 'unlocking' : baseState;
        const isDisabled = state === 'locked' || state === 'unlocking';
        const unlockClass = unlockIntensity === 'master' ? 'zone-unlock-master' : '';
        const labelState = state === 'unlocking' ? 'active' : state;
        const isSymbolMountainZone = zone.id === 'symbol-mountain';
        const isCurrentMapZone = zone.id === currentMapZoneId;
        const isNextMapZone = zone.id === nextMapZoneId;
        const isCompletedMapZone = baseState === 'completed';
        // Label current, next, completed and the later real zone (Lodge); WIP zones stay unlabelled landmarks.
        const isLaterRealZone = zone.id === ZONE_IDS.HUT && !isCurrentMapZone && !isNextMapZone && !isCompletedMapZone;
        const shouldShowZoneLabel = isCurrentMapZone || isNextMapZone || isCompletedMapZone || isLaterRealZone;

        const lockArtId = isLaterRealZone && state === 'locked'
          ? Object.keys(ZONE_ART_TO_ZONE_ID).find((k) => ZONE_ART_TO_ZONE_ID[k] === zone.id)
          : null;
        const lockArt = lockArtId
          ? { ...zoneArtItems[lockArtId], ...(isPhoneLandscape ? PHONE_MAP_ZONE_ART[lockArtId] : {}) }
          : null;
        const lockBadgeStyle = lockArt
          ? {
              left: `${lockArt.centered ? lockArt.left : lockArt.left + lockArt.w / 2}%`,
              top: `${lockArt.centered ? lockArt.top : lockArt.top + lockArt.h / 2}%`,
            }
          : null;

        return (
          <div key={zone.id} className={`zone-group ${state === 'completed' ? 'zone-complete' : ''}`}>
            {/* Tap area */}
            <div
              className={`${layout.zoneClass} zone-state-${state} ${unlockClass} ${isSymbolMountainZone ? 'symbol-mountain-door' : ''}`.trim()}
              onClick={() => handleZoneClick(zone, state)}
              aria-disabled={isDisabled}
            />

            {/* Lock badge on the later real zone only; WIP zones are "coming later", not locked */}
            {lockBadgeStyle && (
              <span className="zone-lock-badge" aria-hidden="true" style={lockBadgeStyle}>🔒</span>
            )}

            {/* Label */}
            {shouldShowZoneLabel && (
              <div
                className={[
                  layout.labelClass,
                  `label-state-${labelState}`,
                  isSymbolMountainZone ? 'zone-title' : '',
                  isCurrentMapZone ? 'map-label-current' : '',
                  isNextMapZone ? 'map-label-next' : '',
                  isLaterRealZone ? 'map-label-later' : '',
                  isCompletedMapZone && !isCurrentMapZone ? 'map-label-completed' : '',
                  pulsingLabelZoneId === zone.id ? 'label-tap-pulse' : '',
                  state === 'coming-soon' ? 'label-coming-soon' : '',
                ].filter(Boolean).join(' ')}
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
                style={ZONE_LABEL_OVERLAY_IDS[zone.id] ? getOverlayStyle(ZONE_LABEL_OVERLAY_IDS[zone.id]) : undefined}
              >
                {state === 'completed' && (
                  <span
                    className={`zone-check-badge zone-check-badge--label${showJourneyCelebration && PLAYABLE_JOURNEY_ZONE_IDS.includes(zone.id) ? ' zone-check-badge--journey-celebration' : ''}`}
                    style={{ '--journey-check-delay': `${PLAYABLE_JOURNEY_ZONE_IDS.indexOf(zone.id) * 0.65}s` }}
                    aria-hidden="true"
                  >✓</span>
                )}
                {zone.name.replace(/\n/g, ' ')}
              </div>
            )}
          </div>
        );
      })}


      <GestureDemo
        type="tap"
        active={showFirstMapGuide}
        from={firstMapGuidePoint}
        to={firstMapGuidePoint}
        idleDelay={500}
        anchor="fingertip"
      />
      {/* Zone creatures — butterfly / bird for active zones */}
      {Object.entries(ZONE_CREATURES).map(([zoneId, creature]) => {
        const zState = getZoneState(zoneId, zoneProgress);
        const isUnlocking = !!unlockingZones[zoneId];
        const show = zState === 'active' || zState === 'in-progress' || isUnlocking;
        if (!show) return null;
        const overlayStyle = getOverlayStyle(ZONE_CREATURE_OVERLAY_IDS[zoneId]);
        return (
          <img
            key={`creature-${zoneId}`}
            src={creature.src}
            alt=""
            aria-hidden="true"
            className={`zone-creature ${creature.cls} ${isUnlocking ? 'zone-creature--appear' : ''}`}
            style={overlayStyle}
          />
        );
      })}

      {/* Map Ganesha presence */}
      {mapGaneshaState && (
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
              title="Open Parent Corner"
              aria-label="Open Parent Corner"
              role="button"
              tabIndex={0}
              onClick={triggerParentCorner}
              onPointerDown={startParentHold}
              onPointerUp={endParentHold}
              onPointerLeave={endParentHold}
              onPointerCancel={endParentHold}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') triggerParentCorner(e);
              }}
            >
              <img src="/images/icons/parent-icon.webp" alt="" className="parent-icon-img" />
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
          style={getOverlayStyle(
            ZONE_MUSHIKA_OVERLAY_IDS[mushikaPop.zone.id],
            isPhoneLandscape
              ? PHONE_ZONE_MUSHIKA_POS[mushikaPop.zone.id]
              : ZONE_MUSHIKA_POS[mushikaPop.zone.id]
          )}
          aria-hidden="true"
        >
          <div className="mushika-pop-bubble">
            {mushikaPop.zone.name.replace('\n', ' ')}
          </div>
          <img
            src="/images/welcome-mooshika1.webp"
            alt=""
            className="mushika-pop-img"
            onError={e => { e.target.src = '/images/mooshika.webp'; }}
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

      {import.meta.env.DEV && mapDebugMode && MapEditorFull && (() => { editorTouchedRef.current = true; return (
        <React.Suspense fallback={null}>
          <MapEditorFull
            onClose={() => setMapDebugMode(false)}
            propItems={propItems}
            onPropItemsChange={setPropItems}
            overlayItems={overlayItems}
            onOverlayItemsChange={setOverlayItems}
            overlayDefaults={MAP_OVERLAY_DEFAULTS}
            zoneArtItems={zoneArtItems}
            onZoneArtItemsChange={setZoneArtItems}
            zoneArtDefaults={MAP_ZONE_ART_DEFAULTS}
          />
        </React.Suspense>
      ); })()}

    </div>
  );
};

export default CleanMapZone;
