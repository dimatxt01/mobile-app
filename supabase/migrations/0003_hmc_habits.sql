-- ============================================================
-- HMC — Habits, outcome metrics, and penalty items
-- Generated: 2026-04-30
--
-- Run order:
--   1. ENUM
--   2. Tables (habits, outcome_metrics, penalty_items)
--   3. Indexes
--   4. RLS policies
--   5. Updated_at triggers
-- ============================================================


-- 1. ENUM
-- ============================================================

create type public.habit_type as enum ('identity', 'execution');


-- 2. TABLES
-- ============================================================

-- User's configured identity + execution habits
create table public.habits (
  id          uuid        not null default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  type        habit_type  not null,
  label       text        not null,
  points      int         not null default 5 check (points between 1 and 50),
  enabled     boolean     not null default true,
  sort_order  int         not null default 0,
  is_default  boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Outcome metrics — scored 0–5 each night
create table public.outcome_metrics (
  id          uuid        not null default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  label       text        not null,
  sort_order  int         not null default 0,
  is_default  boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Penalty items — scored 0–5, subtracted from total
create table public.penalty_items (
  id          uuid        not null default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  label       text        not null,
  sort_order  int         not null default 0,
  is_default  boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- 3. INDEXES
-- ============================================================

create index habits_user_type_idx        on public.habits(user_id, type, sort_order);
create index outcome_metrics_user_idx    on public.outcome_metrics(user_id, sort_order);
create index penalty_items_user_idx      on public.penalty_items(user_id, sort_order);


-- 4. RLS
-- ============================================================

alter table public.habits          enable row level security;
alter table public.outcome_metrics enable row level security;
alter table public.penalty_items   enable row level security;

create policy "habits_select"   on public.habits          for select using (auth.uid() = user_id);
create policy "habits_insert"   on public.habits          for insert with check (auth.uid() = user_id);
create policy "habits_update"   on public.habits          for update using (auth.uid() = user_id);
create policy "habits_delete"   on public.habits          for delete using (auth.uid() = user_id);

create policy "outcomes_select" on public.outcome_metrics for select using (auth.uid() = user_id);
create policy "outcomes_insert" on public.outcome_metrics for insert with check (auth.uid() = user_id);
create policy "outcomes_update" on public.outcome_metrics for update using (auth.uid() = user_id);
create policy "outcomes_delete" on public.outcome_metrics for delete using (auth.uid() = user_id);

create policy "penalties_select" on public.penalty_items  for select using (auth.uid() = user_id);
create policy "penalties_insert" on public.penalty_items  for insert with check (auth.uid() = user_id);
create policy "penalties_update" on public.penalty_items  for update using (auth.uid() = user_id);
create policy "penalties_delete" on public.penalty_items  for delete using (auth.uid() = user_id);


-- 5. UPDATED_AT TRIGGERS
-- ============================================================

create trigger update_habits_updated_at
  before update on public.habits
  for each row execute function public.update_updated_at_column();

create trigger update_outcome_metrics_updated_at
  before update on public.outcome_metrics
  for each row execute function public.update_updated_at_column();

create trigger update_penalty_items_updated_at
  before update on public.penalty_items
  for each row execute function public.update_updated_at_column();
