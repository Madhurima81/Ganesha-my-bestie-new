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

  return Array.from(unlocked.values()).sort((a, b) => b.completedAt - a.completedAt);
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
