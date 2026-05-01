-- ============================================================
-- HMC — Mirror photos
-- Generated: 2026-04-30
--
-- One front-facing photo per user per calendar day.
-- Photos are uploaded to Supabase Storage bucket "mirror-photos"
-- at path {user_id}/{YYYY-MM-DD}.jpg; photo_url stores that path.
-- ============================================================


-- TABLE
-- ============================================================

create table public.mirror_photos (
  id          uuid        not null default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  checkin_id  uuid        references public.daily_checkins(id) on delete set null,
  date        date        not null,
  day_number  int         not null check (day_number >= 1),
  photo_url   text        not null,
  created_at  timestamptz not null default now(),

  unique (user_id, date)
);


-- INDEXES
-- ============================================================

create index mirror_photos_user_date_idx on public.mirror_photos(user_id, date desc);


-- RLS
-- ============================================================

alter table public.mirror_photos enable row level security;

create policy "mirror_select" on public.mirror_photos for select using (auth.uid() = user_id);
create policy "mirror_insert" on public.mirror_photos for insert with check (auth.uid() = user_id);
create policy "mirror_update" on public.mirror_photos for update using (auth.uid() = user_id);
create policy "mirror_delete" on public.mirror_photos for delete using (auth.uid() = user_id);
