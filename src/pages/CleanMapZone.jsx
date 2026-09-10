// CleanMapZone.jsx - Clean map with zone states (locked/active/in-progress/completed)
import React, { useState, useEffect, useRef } from 'react';
import './CleanMapZone.css';
import GameStateManager from '../lib/services/GameStateManager';
import { GANESHA_POSE_ASSETS } from '../lib/config/ganeshaUsageSystem';
import AudioToggle from '../lib/components/ui/AudioToggle/AudioToggle';
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

// Temporarily keep Wonder Caves out of the visible map without removing its data/config.
const HIDDEN_MAP_ZONE_IDS = new Set([ZONE_IDS.CAVE]);

const MAP_ZONE_UNLOCK_VO = {
  [ZONE_IDS.RIVER]: 'The Shloka River is ready to explore.',
  [ZONE_IDS.HUT]: 'Lambodara Lodge is ready to explore.',
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
const DEBUG_UNLOCK_ALL_ZONES = false;
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
  { id: 'tree2-6', type: 'tree2', src: '/images/map/tree2.webp', left: 57, top: 76.9, w: 4, flip: false },
  { id: 'tree1-9', type: 'tree1', src: '/images/map/tree1.webp', left: 89.8, top: 65.3, w: 6, flip: false },
  { id: 'flower1-25', type: 'flower1', src: '/images/map/flower1.webp', left: 9.1, top: 45.2, w: 3, flip: false },
  { id: 'flower2-26', type: 'flower2', src: '/images/map/flower2.webp', left: 50.4, top: 47.8, w: 3, flip: false },
  { id: 'flower2-31', type: 'flower2', src: '/images/map/flower2.webp', left: 72.8, top: 59.9, w: 3, flip: false },
  { id: 'flower1-32', type: 'flower1', src: '/images/map/flower1.webp', left: 44.4, top: 69, w: 3, flip: true },
  { id: 'flower1-34', type: 'flower1', src: '/images/map/flower1.webp', left: 81.8, top: 87.1, w: 3, flip: false },
  { id: 'flower1-35', type: 'flower1', src: '/images/map/flower1.webp', left: 67.8, top: 90.4, w: 3, flip: false },
  { id: 'flower1-36', type: 'flower1', src: '/images/map/flower1.webp', left: 45.1, top: 85.3, w: 4, flip: false },
  { id: 'grass-39', type: 'grass', src: '/images/map/grass.webp', left: 55, top: 40, w: 3, flip: true },
  { id: 'grass-40', type: 'grass', src: '/images/map/grass.webp', left: 55.5, top: 85.2, w: 3, flip: false },
  { id: 'grass-41', type: 'grass', src: '/images/map/grass.webp', left: 5.3, top: 41.5, w: 3, flip: false },
  { id: 'grass-45', type: 'grass', src: '/images/map/grass.webp', left: 40.2, top: 80.3, w: 3, flip: false },
  { id: 'grass-46', type: 'grass', src: '/images/map/grass.webp', left: 93.8, top: 39.2, w: 3, flip: false },
  { id: 'grass-48', type: 'grass', src: '/images/map/grass.webp', left: 92.6, top: 40.8, w: 3, flip: false },
  { id: 'grass-49', type: 'grass', src: '/images/map/grass.webp', left: 57, top: 84.3, w: 3, flip: false },
  { id: 'grass-51', type: 'grass', src: '/images/map/grass.webp', left: 93, top: 78.8, w: 3, flip: false },
  { id: 'grass-52', type: 'grass', src: '/images/map/grass.webp', left: 81.8, top: 81.1, w: 3, flip: false },
  { id: 'tree1-54', type: 'tree1', src: '/images/map/tree1.webp', left: 1.9, top: 51.9, w: 6, flip: false },
  { id: 'tree1-55', type: 'tree1', src: '/images/map/tree1.webp', left: 43.1, top: 47.3, w: 4, flip: false },
  { id: 'tree2-56', type: 'tree2', src: '/images/map/tree2.webp', left: 41.1, top: 45.5, w: 3, flip: false },
  { id: 'flower1-57', type: 'flower1', src: '/images/map/flower1.webp', left: 31.3, top: 45.3, w: 4, flip: false },
  { id: 'grass-58', type: 'grass', src: '/images/map/grass.webp', left: 63.4, top: 48, w: 4, flip: false },
  { id: 'grass-59', type: 'grass', src: '/images/map/grass.webp', left: 32.9, top: 36.3, w: 4, flip: false },
  { id: 'bush1-62', type: 'bush1', src: '/images/map/bush1.webp', left: 14.4, top: 45.6, w: 5, flip: false },
  { id: 'bush1-64', type: 'bush1', src: '/images/map/bush1.webp', left: 25.3, top: 45.7, w: 5, flip: false },
  { id: 'bush2-65', type: 'bush2', src: '/images/map/bush2.webp', left: 23.4, top: 46.8, w: 4, flip: false },
  { id: 'flower1-66', type: 'flower1', src: '/images/map/flower1.webp', left: 45, top: 48, w: 5, flip: false },
  { id: 'flower2-67', type: 'flower2', src: '/images/map/flower2.webp', left: 45, top: 48, w: 5, flip: false },
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
    left: 18,
    top: 15,
    w: 24,
    h: 5,
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
    left: 9,
    top: 59,
    w: 22,
    h: 5,
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
    left: 9,
    top: 22,
    w: 21,
    h: 22,
    centered: false,
    flip: false,
    rotate: 0,
    opacity: 1
  },
  river: {
    id: 'river',
    label: 'River',
    src: '/images/map/shlokariver-falls.webp',
    left: 44.3,
    top: 51.8,
    w: 125,
    h: 125,
    centered: true,
    flip: false,
    rotate: 0,
    opacity: 1
  },
  bridge1: {
    id: 'bridge1',
    label: 'Bridge 1',
    src: '/images/map/bridge-new.webp',
    left: 58.8,
    top: 48.9,
    w: 18,
    h: 18,
    centered: true,
    flip: false,
    rotate: 8,
    rotateY: 0,
    opacity: 1
  },
  bridge2: {
    id: 'bridge2',
    label: 'Bridge 2',
    src: '/images/map/bridge-new.webp',
    left: 52.5,
    top: 76.5,
    w: 19,
    h: 19,
    centered: true,
    flip: false,
    rotate: -4,
    rotateY: 180,
    opacity: 1
  },
  cave: {
    id: 'cave',
    label: 'Wonder Caves',
    src: '/images/map/cavelight.webp',
    left: 73,
    top: 41,
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
    left: 22.6,
    top: 54.1,
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
    left: 70.7,
    top: 44.1,
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
    left: 65,
    top: 70,
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

const getMapGaneshaState = (allProgress, unlockingZones, overlayItems = {}) => {
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

  const allZonesCompleted = zoneIds.every((zoneId) => isZoneDone(allProgress, zoneId));
  if (allZonesCompleted) {
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
  const [mapDebugMode, setMapDebugMode] = useState(false);
  const [propItems, setPropItems] = useState(loadSavedProps);
  const [overlayItems, setOverlayItems] = useState(loadSavedOverlays);
  const [zoneArtItems, setZoneArtItems] = useState(loadSavedZoneArt);
  // const [selectedZone, setSelectedZone] = useState(null);  // removed — no preview modal
  // const [showZoneModal, setShowZoneModal] = useState(false); // removed — no preview modal
  const [activeProfile, setActiveProfile] = useState(null);
  const [unlockingZones, setUnlockingZones] = useState({});
  const [mushikaPop, setMushikaPop] = useState(null); // { zone, state } | null
  const [isGaneshaWalking, setIsGaneshaWalking] = useState(false);
  const [pulsingLabelZoneId, setPulsingLabelZoneId] = useState(null);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const unlockTimersRef = useRef({});
  const voiceTimersRef = useRef([]);
  const mushikaTimerRef = useRef(null);
  const labelPulseTimerRef = useRef(null);
  const ambientRef = useRef(null);
  const fadingRef = useRef(null);
  const prevZoneStatesRef = useRef(null);
  const prevGaneshaPosRef = useRef(null);
  const walkTimerRef = useRef(null);
  const parentHoldTimerRef = useRef(null);
  const parentHoldTriggeredRef = useRef(false);
  const editorTouchedRef = useRef(false);
  const isMuted = !isAudioOn;

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

  const getZoneArtStyle = (id, extra = {}) => {
    const art = zoneArtItems[id];
    const transforms = [];

    if (art?.centered) transforms.push('translate(-50%, -50%)');
    if (art?.flip) transforms.push('scaleX(-1)');
    if (art?.rotateY) transforms.push(`rotateY(${art.rotateY}deg)`);
    if (art?.rotate) transforms.push(`rotate(${art.rotate}deg)`);

    return {
      left: `${art.left}%`,
      top: `${art.top}%`,
      width: `${art.w}%`,
      height: `${art.h}%`,
      transform: transforms.length ? transforms.join(' ') : 'none',
      opacity: art.opacity ?? 1,
      ...extra
    };
  };

  const getOverlayStyle = (id, extra = {}) => {
    const item = overlayItems[id];
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

  // ── Ambient sound: fade in on mount, pause on tab-hide, resume on show ──────
  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio) return;

    const TARGET_VOL = 0.06;

    const fadeIn = () => {
      clearInterval(fadingRef.current);
      audio.volume = 0;
      audio.play().catch(() => {});
      fadingRef.current = setInterval(() => {
        const next = Math.min(audio.volume + 0.025, TARGET_VOL);
        audio.volume = next;
        if (next >= TARGET_VOL) clearInterval(fadingRef.current);
      }, 80);
    };

    if (!isMuted) fadeIn();

    const onFirstInteraction = () => {
      if (audio.paused && !isMuted) fadeIn();
      document.removeEventListener('pointerdown', onFirstInteraction);
    };
    document.addEventListener('pointerdown', onFirstInteraction);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearInterval(fadingRef.current);
        audio.pause();
      } else if (!isMuted) {
        fadeIn();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(fadingRef.current);
      audio.pause();
      document.removeEventListener('pointerdown', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isMuted]);

  useEffect(() => {
    const audio = ambientRef.current;
    if (!audio || !isMuted) return;
    clearInterval(fadingRef.current);
    audio.pause();
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

    // First map load: just remember current states.
    // Do not run an "unlock" animation.
    if (!prevZoneStatesRef.current) {
      prevZoneStatesRef.current = nextStates;

      // One simple opening invitation for a brand-new journey
      const symbolProgress = zoneProgress[ZONE_IDS.SYMBOL]?.completedScenes || 0;

      if (symbolProgress === 0) {
        speakMapVoEvents([
          {
            text: "Come — let's start at Modak Mountain.",
            delay: 300
          }
        ]);
      }

      return;
    }

    ZONES_DATA.forEach(zone => {
      const zoneId = zone.id;
      const prevState = prevZoneStatesRef.current[zoneId];
      const nextState = nextStates[zoneId];

      // Only celebrate a genuinely newly available zone
      if (prevState === 'locked' && nextState === 'active') {
        setUnlockingZones(prev => ({
          ...prev,
          [zoneId]: 'normal'
        }));

        playUnlockChime('normal', isMuted);

        const line = MAP_ZONE_UNLOCK_VO[zoneId];

        if (line) {
          speakMapVoEvents([
            {
              text: line,
              delay: 500
            }
          ]);
        }

        if (unlockTimersRef.current[zoneId]) {
          clearTimeout(unlockTimersRef.current[zoneId]);
        }

        unlockTimersRef.current[zoneId] = setTimeout(() => {
          setUnlockingZones(prev => {
            const updated = { ...prev };
            delete updated[zoneId];
            return updated;
          });

          delete unlockTimersRef.current[zoneId];
        }, 1400);
      }
    });

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

  const mapGaneshaState = getMapGaneshaState(zoneProgress, unlockingZones, overlayItems);

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

    // Play zone click SFX (locked = buzz, active = bright tone)
    playZoneClickSfx(state, isMuted);

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

      {/* Ambient sound — hidden, controlled via ambientRef */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={ambientRef}
        src="/audio/ambient/map%20ambient%20sound.mp3"
        loop
        preload="metadata"
      />

      <AudioToggle
        isAudioOn={!isMuted}
        onToggle={toggleAudio}
        position="bottom-left"
      />

      {/* Background image */}
      <img
        src="/images/map/mapbg-meadow.webp"
        alt="Map"
        className="map-bg-img"
      />
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
        style={getZoneArtStyle('symbol', { cursor: 'pointer', pointerEvents: 'auto' })}
      />
      <img
        src="/images/map/shlokariver-falls.webp"
        alt=""
        className="map-zone-art map-zone-art-river"
        aria-hidden="true"
        style={getZoneArtStyle('river')}
      />
      {/* Bridges are hidden — the new shlokariver-falls.png art has bridges baked in.
          Restore these if the river art is swapped back to a bridge-less asset. */}
      {/*
      <img
        src="/images/map/bridge-new.webp"
        alt=""
        className="map-zone-art map-zone-art-bridge map-zone-art-bridge-1"
        aria-hidden="true"
        style={getZoneArtStyle('bridge1')}
      />
      <img
        src="/images/map/bridge-new.webp"
        alt=""
        className="map-zone-art map-zone-art-bridge map-zone-art-bridge-2"
        aria-hidden="true"
        style={getZoneArtStyle('bridge2')}
      />
      */}
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
        style={getZoneArtStyle('cave', { cursor: 'pointer', pointerEvents: 'auto' })}
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
        style={getZoneArtStyle('hut', { cursor: 'pointer', pointerEvents: 'auto' })}
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
        style={getZoneArtStyle('festival', { cursor: 'pointer', pointerEvents: 'auto' })}
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
        style={getZoneArtStyle('treehouse', { cursor: 'pointer', pointerEvents: 'auto' })}
      />

      {/* Drifting clouds — CSS shapes, no image needed */}

      {/* River shimmer — light-on-water effect over Shloka River */}

      {/* Decorative props — trees, bushes, flowers, grass */}
      {propItems.map(p => (
        <img
          key={p.id}
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

        return (
          <div key={zone.id} className={`zone-group ${state === 'completed' ? 'zone-complete' : ''}`}>
            {/* Tap area */}
            <div
              className={`${layout.zoneClass} zone-state-${state} ${unlockClass} ${isSymbolMountainZone ? 'symbol-mountain-door' : ''}`.trim()}
              onClick={() => handleZoneClick(zone, state)}
              aria-disabled={isDisabled}
            />

            {/* Label */}
            <div
              className={`${layout.labelClass} label-state-${labelState} ${isSymbolMountainZone ? 'zone-title' : ''} ${pulsingLabelZoneId === zone.id ? 'label-tap-pulse' : ''} ${state === 'coming-soon' ? 'label-coming-soon' : ''}`.trim()}
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
                <span className="zone-check-badge zone-check-badge--label" aria-hidden="true">✓</span>
              )}
              {zone.name.replace(/\n/g, ' ')}
            </div>
          </div>
        );
      })}


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
          style={getOverlayStyle(ZONE_MUSHIKA_OVERLAY_IDS[mushikaPop.zone.id], ZONE_MUSHIKA_POS[mushikaPop.zone.id])}
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
