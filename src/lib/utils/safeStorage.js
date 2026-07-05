// safeStorage.js — localStorage writes that never throw.
// A full quota (QuotaExceededError) or private-mode restriction otherwise
// crashes mid-gameplay. On quota failure we try clearing expendable temp
// session keys once, then retry; if it still fails, we log and move on —
// losing one save beats crashing a child's game.

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    try {
      // Free space: temp session keys are recoverable (scenes restart fresh)
      const expendable = Object.keys(localStorage).filter(
        (k) => k.startsWith('temp_session_') || k.startsWith('replay_session_')
      );
      // Don't delete the key we're trying to write
      expendable.filter((k) => k !== key).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(key, value);
      return true;
    } catch (e2) {
      console.error('safeSetItem: storage write failed for', key, e2);
      return false;
    }
  }
}

export function safeGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('safeGetJSON: corrupted value for', key, e);
    return fallback;
  }
}
