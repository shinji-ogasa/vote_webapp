create extension if not exists pgcrypto;

create table if not exists public.face_votes (
  id uuid primary key default gen_random_uuid(),
  target_slug text not null default 'me' check (target_slug ~ '^[a-z0-9-]{1,64}$'),
  choice text not null check (choice in ('good', 'bad')),
  visitor_key_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint face_votes_target_visitor_unique unique (target_slug, visitor_key_hash)
);

create index if not exists face_votes_target_choice_idx
  on public.face_votes (target_slug, choice);

alter table public.face_votes enable row level security;

-- The Next.js route is the only public entrypoint. It uses the server-only
-- service role key, so anonymous clients never receive raw vote rows.
revoke all on table public.face_votes from public, anon, authenticated;
grant all on table public.face_votes to service_role;
