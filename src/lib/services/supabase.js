import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is optional — app works fully offline if keys aren't set
export const supabase = (url && anonKey && !url.startsWith('your_'))
  ? createClient(url, anonKey)
  : null;

export const isSupabaseEnabled = () => !!supabase;

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
