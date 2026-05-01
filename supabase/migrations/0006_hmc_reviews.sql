-- ============================================================
-- HMC — Weekly and monthly reviews
-- Generated: 2026-04-30
--
-- weekly_reviews  — Sunday-night reflection, auto-triggered after
--                   locking in the last daily check-in of the week.
--                   Includes user-selected camera roll photos.
--
-- monthly_reviews — Last-day-of-month reflection, auto-triggered
--                   after locking in. Includes a single cover photo
--                   and a shareable summary card.
-- ============================================================


-- TABLES
-- ============================================================

create table public.weekly_reviews (
  id           uuid        not null default gen_random_uuid() primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  week_start   date        not null,
  week_end     date        not null,
  reflection   text,
  win          text,
  challenge    text,
  next_week    text,
  weekly_avg   numeric(5,2),
  photo_urls   text[]      not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (user_id, week_start)
);

create table public.monthly_reviews (
  id              uuid        not null default gen_random_uuid() primary key,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  year            int         not null,
  month           int         not null check (month between 1 and 12),
  reflection      text,
  verdict         text,
  cover_photo_url text,
  monthly_avg     numeric(5,2),
  best_day_date   date,
  best_day_score  int,
  streak_during   int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (user_id, year, month)
);


-- INDEXES
-- ============================================================

create index weekly_reviews_user_idx  on public.weekly_reviews(user_id, week_start desc);
create index monthly_reviews_user_idx on public.monthly_reviews(user_id, year desc, month desc);


-- RLS
-- ============================================================

alter table public.weekly_reviews  enable row level security;
alter table public.monthly_reviews enable row level security;

create policy "weekly_select"  on public.weekly_reviews  for select using (auth.uid() = user_id);
create policy "weekly_insert"  on public.weekly_reviews  for insert with check (auth.uid() = user_id);
create policy "weekly_update"  on public.weekly_reviews  for update using (auth.uid() = user_id);
create policy "weekly_delete"  on public.weekly_reviews  for delete using (auth.uid() = user_id);

create policy "monthly_select" on public.monthly_reviews for select using (auth.uid() = user_id);
create policy "monthly_insert" on public.monthly_reviews for insert with check (auth.uid() = user_id);
create policy "monthly_update" on public.monthly_reviews for update using (auth.uid() = user_id);
create policy "monthly_delete" on public.monthly_reviews for delete using (auth.uid() = user_id);


-- UPDATED_AT TRIGGERS
-- ============================================================

create trigger update_weekly_reviews_updated_at
  before update on public.weekly_reviews
  for each row execute function public.update_updated_at_column();

create trigger update_monthly_reviews_updated_at
  before update on public.monthly_reviews
  for each row execute function public.update_updated_at_column();
