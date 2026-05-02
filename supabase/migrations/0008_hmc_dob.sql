-- ============================================================
-- HMC — Add date_of_birth to profiles
-- Generated: 2026-05-01
-- ============================================================

alter table public.profiles
  add column if not exists date_of_birth date;
