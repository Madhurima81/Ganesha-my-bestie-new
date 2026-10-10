/* =========================================================
   ZONE NAVIGATION STATE

   activeScene:
   persists the unfinished scene the child actually entered.

   returnFocus:
   one-visit focus used only when going directly from a
   completion modal back to Zone Welcome. Does NOT make the
   scene Active again.
   ========================================================= */

const getProfileId = () => {
  if (typeof window === 'undefined') return 'default';

  try {
    return localStorage.getItem('activeProfileId') || 'default';
  } catch {
    return 'default';
  }
};

/* -------------------------
   ACTIVE SCENE (localStorage)
------------------------- */

const activeSceneKey = (zoneId, profileId = getProfileId()) =>
  `gmb_active_scene_${profileId}_${zoneId}`;

export const setActiveScene = (
  zoneId,
  sceneId,
  mode = 'continue',
  profileId = getProfileId()
) => {
  if (typeof window === 'undefined' || !zoneId || !sceneId) return;

  try {
    localStorage.setItem(
      activeSceneKey(zoneId, profileId),
      JSON.stringify({ sceneId, mode, updatedAt: Date.now() })
    );
  } catch {
    // best effort
  }
};

export const getActiveScene = (zoneId, profileId = getProfileId()) => {
  if (typeof window === 'undefined' || !zoneId) return null;

  try {
    const raw = localStorage.getItem(activeSceneKey(zoneId, profileId));
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.sceneId) {
        return parsed;
      }
      return null;
    } catch {
      // backward-safe: an older version stored a plain sceneId
      return { sceneId: raw, mode: null };
    }
  } catch {
    return null;
  }
};

export const clearActiveScene = (zoneId, profileId = getProfileId()) => {
  if (typeof window === 'undefined' || !zoneId) return;

  try {
    localStorage.removeItem(activeSceneKey(zoneId, profileId));
  } catch {
    // best effort
  }
};

/* -------------------------
   RETURN FOCUS (sessionStorage)

   sessionStorage deliberately:
   - survives navigation/remount
   - does not become long-term progress
------------------------- */

const returnFocusKey = (zoneId, profileId = getProfileId()) =>
  `gmb_zone_return_focus_${profileId}_${zoneId}`;

export const setZoneReturnFocus = (
  zoneId,
  sceneId,
  profileId = getProfileId()
) => {
  if (typeof window === 'undefined' || !zoneId || !sceneId) return;

  try {
    sessionStorage.setItem(
      returnFocusKey(zoneId, profileId),
      JSON.stringify({ sceneId, createdAt: Date.now() })
    );
  } catch {
    // best effort
  }
};

export const readZoneReturnFocus = (zoneId, profileId = getProfileId()) => {
  if (typeof window === 'undefined' || !zoneId) return null;

  try {
    const raw = sessionStorage.getItem(returnFocusKey(zoneId, profileId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearZoneReturnFocus = (zoneId, profileId = getProfileId()) => {
  if (typeof window === 'undefined' || !zoneId) return;

  try {
    sessionStorage.removeItem(returnFocusKey(zoneId, profileId));
  } catch {
    // best effort
  }
};
