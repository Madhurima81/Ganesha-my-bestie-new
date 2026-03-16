// CloudSync.js
// Async cloud persistence layer on top of localStorage.
// All methods are fire-and-forget — they never block the game.
// If Supabase is not configured or offline, everything silently falls back to localStorage.

import { supabase, isSupabaseEnabled } from './supabase';

class CloudSync {
  constructor() {
    this._userId = null;
    this._ready = false;
    this._saveTimers = {}; // debounce timers per profileId
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async init() {
    if (!isSupabaseEnabled()) return;

    try {
      // Reuse existing session or sign in anonymously
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        this._userId = session.user.id;
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        this._userId = data.user.id;
      }

      this._ready = true;

      // On first load pull cloud data into localStorage (won't overwrite newer local data)
      await this._pullAll();
    } catch (err) {
      console.warn('[CloudSync] init failed, offline mode:', err.message);
    }
  }

  // ── Pull (cloud → localStorage on app start) ──────────────────────────────

  async _pullAll() {
    if (!this._ready) return;

    try {
      // Pull profiles
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id, data, updated_at')
        .eq('user_id', this._userId);

      if (profileRows?.length) {
        const local = this._getLocal('gameProfiles') || { profiles: {}, lastUpdated: 0 };

        profileRows.forEach(row => {
          const cloudTs = new Date(row.updated_at).getTime();
          const localProfile = local.profiles[row.id];
          // Only overwrite if cloud is newer
          if (!localProfile || cloudTs > (localProfile.lastPlayed || 0)) {
            local.profiles[row.id] = row.data;
          }
        });

        this._setLocal('gameProfiles', local);
      }

      // Pull progress for each profile
      const { data: progressRows } = await supabase
        .from('progress')
        .select('profile_id, data, updated_at')
        .eq('user_id', this._userId);

      if (progressRows?.length) {
        progressRows.forEach(row => {
          const key = `${row.profile_id}_gameProgress`;
          const localData = this._getLocal(key);
          const cloudTs = new Date(row.updated_at).getTime();
          const localTs = localData?.lastSaved || 0;

          if (!localData || cloudTs > localTs) {
            this._setLocal(key, row.data);
          }
        });
      }
    } catch (err) {
      console.warn('[CloudSync] pull failed:', err.message);
    }
  }

  // ── Push profiles ─────────────────────────────────────────────────────────

  async pushProfiles() {
    if (!this._ready) return;

    try {
      const store = this._getLocal('gameProfiles');
      if (!store?.profiles) return;

      const rows = Object.entries(store.profiles).map(([id, data]) => ({
        id,
        user_id: this._userId,
        data,
        updated_at: new Date().toISOString()
      }));

      await supabase.from('profiles').upsert(rows, { onConflict: 'id' });
    } catch (err) {
      console.warn('[CloudSync] pushProfiles failed:', err.message);
    }
  }

  // ── Push progress (debounced per profile, 3 s) ───────────────────────────

  pushProgress(profileId) {
    if (!this._ready) return;

    clearTimeout(this._saveTimers[profileId]);
    this._saveTimers[profileId] = setTimeout(() => {
      this._doPushProgress(profileId);
    }, 3000);
  }

  async _doPushProgress(profileId) {
    try {
      const key = `${profileId}_gameProgress`;
      const data = this._getLocal(key);
      if (!data) return;

      // Stamp a save time so pull can compare
      data.lastSaved = Date.now();
      this._setLocal(key, data);

      await supabase.from('progress').upsert([{
        profile_id: profileId,
        user_id: this._userId,
        data,
        updated_at: new Date().toISOString()
      }], { onConflict: 'profile_id' });
    } catch (err) {
      console.warn('[CloudSync] pushProgress failed:', err.message);
    }
  }

  // ── Delete profile from cloud ─────────────────────────────────────────────

  async deleteProfile(profileId) {
    if (!this._ready) return;

    try {
      await Promise.all([
        supabase.from('profiles').delete().eq('id', profileId).eq('user_id', this._userId),
        supabase.from('progress').delete().eq('profile_id', profileId).eq('user_id', this._userId)
      ]);
    } catch (err) {
      console.warn('[CloudSync] deleteProfile failed:', err.message);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _getLocal(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  _setLocal(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
}

export const cloudSync = new CloudSync();
