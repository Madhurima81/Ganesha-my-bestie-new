// LearningProgress — derives which of the 16 shared learnings (8 Symbol
// Mountain symbols + 8 Shloka River words) a child has unlocked, reading the
// SAME `${profileId}_gameProgress` localStorage structure ProgressManager
// already writes. No new storage, no new backend.
//
// Prefers real per-learning data (`symbols: { key: true }`) where
// ProgressManager actually has it; falls back to SCENE_LEARNING_MAP where it
// doesn't. See sceneLearningMap.js for exactly which scenes need the
// fallback and why.

import { LEARNING_CATALOG, getLearningById } from '../config/learningCatalog';
import { SCENE_LEARNING_MAP, progressKeyToCatalogId } from '../config/sceneLearningMap';

const RELEVANT_ZONES = ['symbol-mountain', 'shloka-river'];

function readProgressData(profileId) {
  try {
    return JSON.parse(localStorage.getItem(`${profileId}_gameProgress`) || '{}');
  } catch (_) {
    return {};
  }
}

function isValidCatalogId(id) {
  return Object.prototype.hasOwnProperty.call(LEARNING_CATALOG, id);
}

/**
 * Returns every learning the child has unlocked across Symbol Mountain and
 * Shloka River — deduplicated, each entry carrying the source scene and the
 * latest known completedAt timestamp for that learning.
 *
 * Sort order: newest -> oldest (most recently unlocked first). Daily Dare's
 * recency-weighted selection (favour the most recent 1-3 learnings) expects
 * this order — do not resort without updating that caller.
 *
 * @param {string} profileId
 * @returns {Array<{ learningId: string, sourceSceneId: string, completedAt: number }>}
 */
export function getUnlockedLearnings(profileId) {
  if (!profileId) return [];

  const progressData = readProgressData(profileId);
  const zones = progressData.zones || {};
  const unlocked = new Map(); // learningId -> { learningId, sourceSceneId, completedAt }

  RELEVANT_ZONES.forEach((zoneId) => {
    const zoneScenes = zones[zoneId]?.scenes || {};
    const sceneFallbackMap = SCENE_LEARNING_MAP[zoneId] || {};

    Object.entries(zoneScenes).forEach(([sceneId, sceneData]) => {
      if (!sceneData || sceneData.completed !== true) return;
      const completedAt = sceneData.completedAt || sceneData.lastPlayed || 0;

      const rawSymbols = sceneData.symbols;
      const hasPerLearningData =
        rawSymbols &&
        typeof rawSymbols === 'object' &&
        !rawSymbols.all &&
        Object.keys(rawSymbols).length > 0;

      const learningIds = hasPerLearningData
        ? Object.keys(rawSymbols)
            .filter((key) => rawSymbols[key])
            .map(progressKeyToCatalogId)
        : sceneFallbackMap[sceneId] || [];

      learningIds.forEach((learningId) => {
        if (!isValidCatalogId(learningId)) return; // never surface an ID the catalog doesn't recognise
        const existing = unlocked.get(learningId);
        if (!existing || completedAt > existing.completedAt) {
          unlocked.set(learningId, { learningId, sourceSceneId: sceneId, completedAt });
        }
      });
    });
  });

  // Symbols found mid-scene count too, the same way the Symbol Sidebar lights them up: SceneManager keeps the
  // live scene state (including `discoveredSymbols`) in `temp_session_<profile>_<zone>_<scene>` until the scene
  // completes, so a child who has met Mooshika but not finished the scene already has it unlocked here.
  // Replay sessions are ignored (they do not change real progress).
  // This is the same live data the Inner Mandala on the welcome screen and CulturalProgressExtractor read:
  // Symbol Mountain keeps `discoveredSymbols` (and sometimes `symbols`), Shloka River keeps `chantedVerses`
  // (ids like `vakratunda-chant`).
  const addLive = (learningId, sceneId, seenAt) => {
    if (!isValidCatalogId(learningId)) return;
    const existing = unlocked.get(learningId);
    if (!existing || seenAt > existing.completedAt) {
      unlocked.set(learningId, { learningId, sourceSceneId: sceneId, completedAt: seenAt });
    }
  };
  const trueKeys = (o) => (!o || typeof o !== 'object' ? [] : Array.isArray(o) ? o : Object.keys(o).filter((k) => o[k]));
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      const zoneId = RELEVANT_ZONES.find((z) => key.startsWith(`temp_session_${profileId}_${z}_`));
      if (!zoneId) continue;
      let live = null;
      try { live = JSON.parse(localStorage.getItem(key)); } catch (_) { continue; }
      if (!live || typeof live !== 'object') continue;
      const sceneId = key.slice(`temp_session_${profileId}_${zoneId}_`.length);
      const seenAt = live.lastSaved || 0;
      if (zoneId === 'symbol-mountain') {
        [...trueKeys(live.discoveredSymbols), ...trueKeys(live.symbols)].forEach((symbolKey) => {
          addLive(progressKeyToCatalogId(symbolKey === 'ear' ? 'ears' : symbolKey), sceneId, seenAt);
        });
      } else {
        trueKeys(live.chantedVerses).forEach((verseId) => {
          addLive(progressKeyToCatalogId(String(verseId).replace(/-chant$/, '')), sceneId, seenAt);
        });
      }
    }
  } catch (_) { /* storage unavailable: completed scenes only */ }

  // Once unlocked, always unlocked: remember every learning seen, so Play Again (which wipes a scene's live state)
  // or a scene that is never finished cannot take it away. Cleared with the child's progress (Reset progress,
  // delete explorer, delete all data) via unlockedKey().
  const storeKey = unlockedKey(profileId);
  let remembered = {};
  try { remembered = JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch (_) { remembered = {}; }
  let changed = false;
  Object.keys(remembered).forEach((learningId) => {
    if (!isValidCatalogId(learningId) || unlocked.has(learningId)) return;
    unlocked.set(learningId, { learningId, ...remembered[learningId] });
  });
  unlocked.forEach((entry, learningId) => {
    const prev = remembered[learningId];
    if (!prev || prev.sourceSceneId !== entry.sourceSceneId || prev.completedAt !== entry.completedAt) {
      remembered[learningId] = { sourceSceneId: entry.sourceSceneId, completedAt: entry.completedAt };
      changed = true;
    }
  });
  if (changed) {
    try { localStorage.setItem(storeKey, JSON.stringify(remembered)); } catch (_) { /* ignore */ }
  }

  return Array.from(unlocked.values()).sort((a, b) => b.completedAt - a.completedAt);
}

// Starts with the profile id so deleting an explorer removes it with the rest of their data.
export function unlockedKey(profileId) {
  return `${profileId}_learningsUnlocked`;
}

/**
 * The most recently unlocked learning, resolved against the catalog.
 * Returns null if nothing is unlocked yet.
 */
export function getLatestLearning(profileId) {
  const [latest] = getUnlockedLearnings(profileId);
  if (!latest) return null;

  const catalogEntry = getLearningById(latest.learningId);
  if (!catalogEntry) return null;

  return {
    ...catalogEntry,
    sourceSceneId: latest.sourceSceneId,
    completedAt: latest.completedAt,
  };
}

export { getLearningById };
