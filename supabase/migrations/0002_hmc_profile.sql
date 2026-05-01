-- ============================================================
-- HMC — Extend profiles with Half Milly Club user fields
-- Generated: 2026-04-30
-- ============================================================

alter table public.profiles
  add column if not exists identity_sentence    text,
  add column if not exists vision               text,
  add column if not exists reminder_time        time    not null default '21:00',
  add column if not exists streak               int     not null default 0,
  add column if not exists last_checkin_date    date,
  add column if not exists day_count            int     not null default 0,
  add column if not exists lifetime_avg         numeric(5,2) not null default 0,
  add column if not exists whoop_connected      boolean not null default false,
  add column if not exists whoop_access_token   text,
  add column if not exists whoop_refresh_token  text,
  add column if not exists subscription_status  text    not null default 'trial'
    check (subscription_status in ('trial','active','expired','cancelled')),
  add column if not exists trial_ends_at        timestamptz;
