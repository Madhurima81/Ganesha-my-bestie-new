const url  = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = () => !!(url && anonKey && !url.startsWith('your_'));

// @supabase/supabase-js (~137KB gzip, pulling in auth-js/postgrest-js/
// realtime-js/storage-js) is dynamic-imported here instead of at module top.
// Only .auth and .from() are actually used anywhere in this app (verified —
// storage-js and realtime-js are dead weight even eager) — CloudSync's own
// `_ready` gate already ensures nothing touches the client before init()
// resolves it, so this is a drop-in replacement for the old synchronous
// `supabase` export.
let _clientPromise = null;
export function getSupabaseClient() {
  if (!isSupabaseEnabled()) return Promise.resolve(null);
  if (!_clientPromise) {
    _clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(url, anonKey));
  }
  return _clientPromise;
}

/*
 * ── SQL to run once in Supabase SQL Editor ──────────────────────────────────
 *
 * create table if not exists profiles (
 *   id          text primary key,
 *   user_id     uuid references auth.users not null,
 *   data        jsonb not null,
 *   updated_at  timestamptz default now()
 * );
 *
 * create table if not exists progress (
 *   profile_id  text primary key,
 *   user_id     uuid references auth.users not null,
 *   data        jsonb not null,
 *   updated_at  timestamptz default now()
 * );
 *
 * alter table profiles enable row level security;
 * alter table progress enable row level security;
 *
 * create policy "own profiles" on profiles
 *   for all using (auth.uid() = user_id);
 *
 * create policy "own progress" on progress
 *   for all using (auth.uid() = user_id);
 * ────────────────────────────────────────────────────────────────────────────
 */
