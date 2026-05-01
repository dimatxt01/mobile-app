-- ============================================================
-- HMC — Database functions and RPCs
-- Generated: 2026-04-30
--
-- Functions:
--   seed_default_habits(user_id)   — called once at onboarding completion
--   lock_checkin(checkin_id)       — computes final score, updates streak
--   get_user_stats(user_id)        — returns streak, day_count, lifetime_avg
--   get_history(user_id, days)     — last N days of locked checkins
-- ============================================================


-- seed_default_habits
-- Inserts the HMC default habit set for a new user.
-- Idempotent — skips if the user already has is_default rows.
-- Called by the mobile app at the end of onboarding after the user
-- may have modified or deleted individual defaults during setup.
-- The app passes the final list of habits/outcomes/penalties from the
-- onboarding wizard; this function only runs if no rows yet exist.
-- ============================================================

create or replace function public.seed_default_habits(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Guard: only seed if the user has zero habits already
  if exists (select 1 from public.habits where user_id = p_user_id limit 1) then
    return;
  end if;

  insert into public.habits (user_id, type, label, points, sort_order, is_default) values
    (p_user_id, 'identity',  'Wake On Time',      5,  0, true),
    (p_user_id, 'identity',  'Visualization',     5,  1, true),
    (p_user_id, 'identity',  'No BS Discipline',  5,  2, true),
    (p_user_id, 'identity',  'Kept My Word',      5,  3, true),
    (p_user_id, 'execution', 'Deep Work AM',      15, 0, true),
    (p_user_id, 'execution', 'Evening Work',      10, 1, true),
    (p_user_id, 'execution', 'Gym',               10, 2, true),
    (p_user_id, 'execution', 'Learning',           5, 3, true),
    (p_user_id, 'execution', 'Sales / Outreach',   5, 4, true),
    (p_user_id, 'execution', 'Content / Brand',    5, 5, true),
    (p_user_id, 'execution', 'Public Speaking',    5, 6, true);

  insert into public.outcome_metrics (user_id, label, sort_order, is_default) values
    (p_user_id, 'Revenue / Deals',     0, true),
    (p_user_id, 'Authority / Content', 1, true),
    (p_user_id, 'Relationships',        2, true),
    (p_user_id, 'Mission Progress',     3, true);

  insert into public.penalty_items (user_id, label, sort_order, is_default) values
    (p_user_id, 'Alcohol',     0, true),
    (p_user_id, 'Nicotine',    1, true),
    (p_user_id, 'Wasted Time', 2, true);
end;
$$;


-- lock_checkin
-- Persists the final computed score and updates the user's streak.
-- The mobile app sends bracket totals (already computed client-side)
-- so this function just writes them, adds the Whoop adjustment if
-- present, applies the late-checkin penalty, and updates the profile.
-- Returns the final total_score.
-- ============================================================

create or replace function public.lock_checkin(
  p_checkin_id     uuid,
  p_identity_score int,
  p_execution_score int,
  p_outcome_score  int,
  p_penalty_score  int
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid            uuid := auth.uid();
  v_date           date;
  v_late           boolean;
  v_whoop_adj      int;
  v_total          int;
  v_last_date      date;
  v_new_streak     int;
begin
  -- Validate ownership
  select date, is_late_checkin, whoop_score_adj
  into v_date, v_late, v_whoop_adj
  from public.daily_checkins
  where id = p_checkin_id and user_id = v_uid and is_locked = false;

  if not found then
    raise exception 'Checkin % not found or already locked', p_checkin_id;
  end if;

  -- Compute total (-10 for late submission)
  v_total := p_identity_score
           + p_execution_score
           + p_outcome_score
           - p_penalty_score
           + coalesce(v_whoop_adj, 0)
           - case when v_late then 10 else 0 end;

  -- Write scores + lock
  update public.daily_checkins
  set identity_score  = p_identity_score,
      execution_score = p_execution_score,
      outcome_score   = p_outcome_score,
      penalty_score   = p_penalty_score,
      total_score     = greatest(v_total, 0),
      is_locked       = true,
      locked_at       = now()
  where id = p_checkin_id;

  -- Update streak on profiles
  select last_checkin_date into v_last_date
  from public.profiles
  where id = v_uid;

  v_new_streak := case
    when v_last_date = v_date - interval '1 day' then
      (select streak from public.profiles where id = v_uid) + 1
    when v_last_date = v_date then
      (select streak from public.profiles where id = v_uid) -- same day re-lock, no change
    else
      1  -- gap → reset
  end;

  update public.profiles
  set day_count          = day_count + 1,
      last_checkin_date  = v_date,
      streak             = v_new_streak,
      lifetime_avg       = (
        select round(avg(total_score)::numeric, 2)
        from public.daily_checkins
        where user_id = v_uid and is_locked = true
      )
  where id = v_uid;

  return greatest(v_total, 0);
end;
$$;


-- get_user_stats
-- Quick read for the Profile tab header row.
-- ============================================================

create or replace function public.get_user_stats()
returns table (
  streak         int,
  day_count      int,
  lifetime_avg   numeric,
  best_score     int,
  best_date      date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.streak,
    p.day_count,
    p.lifetime_avg,
    c.total_score as best_score,
    c.date        as best_date
  from public.profiles p
  left join lateral (
    select total_score, date
    from public.daily_checkins
    where user_id = auth.uid() and is_locked = true
    order by total_score desc
    limit 1
  ) c on true
  where p.id = auth.uid();
$$;


-- get_history
-- Returns the last `p_days` locked check-ins for charts and the
-- weekly review. Sorted newest-first.
-- ============================================================

create or replace function public.get_history(p_days int default 30)
returns table (
  id              uuid,
  date            date,
  total_score     int,
  identity_score  int,
  execution_score int,
  outcome_score   int,
  penalty_score   int,
  whoop_score_adj int,
  reflection_win  text,
  reflection_broke text,
  is_late_checkin boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id, date, total_score,
    identity_score, execution_score, outcome_score, penalty_score,
    whoop_score_adj,
    reflection_win, reflection_broke,
    is_late_checkin
  from public.daily_checkins
  where user_id = auth.uid()
    and is_locked = true
    and date >= current_date - (p_days || ' days')::interval
  order by date desc;
$$;


-- GRANTS
-- ============================================================

grant execute on function public.seed_default_habits(uuid)               to authenticated;
grant execute on function public.lock_checkin(uuid, int, int, int, int)  to authenticated;
grant execute on function public.get_user_stats()                        to authenticated;
grant execute on function public.get_history(int)                        to authenticated;
