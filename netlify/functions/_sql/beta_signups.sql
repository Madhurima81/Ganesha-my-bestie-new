-- Run once in Supabase → SQL Editor.
-- Backs the beta feedback-email automation (send-continuation.js writes here,
-- send-feedback-emails.js reads + updates here).

create table if not exists beta_signups (
  id                     uuid primary key default gen_random_uuid(),
  parent_email           text not null unique,
  signed_up_at           timestamptz not null default now(),
  feedback_email_sent_at timestamptz
);

create index if not exists beta_signups_pending_feedback_idx
  on beta_signups (signed_up_at)
  where feedback_email_sent_at is null;

-- Server-side only: both functions use the service-role key and bypass RLS.
-- Enable RLS with no policies so the anon/public key can never read parent emails.
alter table beta_signups enable row level security;
