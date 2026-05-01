-- ============================================================
-- HMC — Daily check-ins
-- Generated: 2026-04-30
--
-- One row per user per calendar day. Raw inputs stored as JSONB
-- maps (habit_id → value); computed scores denormalized for
-- fast querying without re-joining all habit tables.
--
-- Key rules:
--   • UNIQUE (user_id, date) — one check-in per day
--   • is_locked = true → record is immutable except for Whoop
--     backfill columns (whoop_*)
--   • is_late_checkin = true → −10 pts applied by lock_checkin()
-- ============================================================


-- TABLE
-- ============================================================

create table public.daily_checkins (
  id                  uuid        not null default gen_random_uuid() primary key,
  user_id             uuid        not null references auth.users(id) on delete cascade,
  date                date        not null,

  -- Raw inputs — keys are UUIDs matching habits/outcome_metrics/penalty_items
  identity_checks     jsonb       not null default '{}'::jsonb,
  execution_checks    jsonb       not null default '{}'::jsonb,
  perf_9to5           int         not null default 0 check (perf_9to5 between 0 and 10),
  outcome_scores      jsonb       not null default '{}'::jsonb,
  penalty_scores      jsonb       not null default '{}'::jsonb,

  -- Computed bracket totals (written on lock)
  identity_score      int         not null default 0,
  execution_score     int         not null default 0,
  outcome_score       int         not null default 0,
  penalty_score       int         not null default 0,
  total_score         int         not null default 0,

  -- Whoop data — filled retroactively once device syncs
  whoop_strain        numeric(4,1),
  whoop_recovery_pct  int         check (whoop_recovery_pct between 0 and 100),
  whoop_sleep_pct     int         check (whoop_sleep_pct between 0 and 100),
  whoop_score_adj     int         not null default 0,

  -- Reflection fields
  reflection_win      text,
  reflection_broke    text,
  reflection_tomorrow text,

  -- State
  is_locked           boolean     not null default false,
  locked_at           timestamptz,
  is_late_checkin     boolean     not null default false,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (user_id, date)
);


-- INDEXES
-- ============================================================

create index checkins_user_date_idx  on public.daily_checkins(user_id, date desc);
create index checkins_user_locked_idx on public.daily_checkins(user_id, is_locked);


-- RLS
-- ============================================================

alter table public.daily_checkins enable row level security;

create policy "checkins_select" on public.daily_checkins for select using (auth.uid() = user_id);
create policy "checkins_insert" on public.daily_checkins for insert with check (auth.uid() = user_id);
create policy "checkins_update" on public.daily_checkins for update using (auth.uid() = user_id);
create policy "checkins_delete" on public.daily_checkins for delete using (auth.uid() = user_id);


-- UPDATED_AT TRIGGER
-- ============================================================

create trigger update_checkins_updated_at
  before update on public.daily_checkins
  for each row execute function public.update_updated_at_column();
