-- ============================================================
-- CoolifyAI — Initial Supabase Migration
-- Generated: 2026-04-26
-- Source: ported from 1prompt-os web app schema
--
-- Run order:
--   1. ENUM types
--   2. update_updated_at_column() helper (no table dependencies)
--   3. Tables
--   4. has_role() / get_user_role() helpers (depend on user_roles table)
--   5. Triggers + handle_new_user() + ensure_user_dashboard_setup()
--   6. RLS policies
--   7. Grants
--
-- NOTE: has_role() and get_user_role() use `language sql`, which PostgreSQL
-- validates at CREATE time. They must come AFTER public.user_roles exists.
-- ============================================================

-- 1. ENUM TYPES
-- ============================================================

create type public.app_role as enum ('agency', 'client');


-- 2. TIMESTAMP HELPER (no table dependencies)
-- ============================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- 3. TABLES
-- ============================================================

-- Agencies (workspace containers; one per sign-up for now)
create table public.agencies (
  id         uuid        not null default gen_random_uuid() primary key,
  name       text        not null,
  email      text        not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agencies enable row level security;

-- Profiles (one per auth.users row, created by trigger)
create table public.profiles (
  id                   uuid        primary key references auth.users(id) on delete cascade,
  email                text,
  full_name            text,
  logo_url             text,
  agency_id            uuid,
  client_id            uuid,
  onboarding_completed boolean     not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id      uuid      not null default gen_random_uuid() primary key,
  user_id uuid      not null references auth.users(id) on delete cascade,
  role    app_role  not null default 'agency',
  unique (user_id, role)
);

alter table public.user_roles enable row level security;


-- 4. ROLE-CHECK HELPERS (must come after public.user_roles exists)
-- ============================================================

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.get_user_role(_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.user_roles where user_id = _user_id limit 1
$$;


-- 5. TRIGGERS
-- ============================================================

-- Auto-update updated_at on profiles
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Auto-update updated_at on agencies
create trigger update_agencies_updated_at
  before update on public.agencies
  for each row execute function public.update_updated_at_column();

-- Auto-create profile + assign agency role on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, agency_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    gen_random_uuid()
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'agency');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Dashboard setup RPC — idempotent, called after sign-in to ensure
-- profile + role + default client exist (repair function).
create or replace function public.ensure_user_dashboard_setup()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_agency_id uuid;
  v_email    text;
  v_full_name text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select p.agency_id into v_agency_id
  from public.profiles p
  where p.id = v_uid
  limit 1;

  if v_agency_id is not null then
    -- Profile exists: ensure role is set
    insert into public.user_roles (user_id, role)
    values (v_uid, 'agency')
    on conflict (user_id, role) do nothing;
    return v_agency_id;
  end if;

  -- Profile missing: create it from auth.users data
  select u.email, coalesce(u.raw_user_meta_data ->> 'full_name', '')
  into v_email, v_full_name
  from auth.users u
  where u.id = v_uid;

  insert into public.profiles (id, email, full_name, agency_id, onboarding_completed)
  values (v_uid, v_email, v_full_name, gen_random_uuid(), false)
  on conflict (id) do nothing;

  select p.agency_id into v_agency_id
  from public.profiles p
  where p.id = v_uid
  limit 1;

  if v_agency_id is null then
    raise exception 'Could not provision profile for user %', v_uid;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_uid, 'agency')
  on conflict (user_id, role) do nothing;

  return v_agency_id;
end;
$$;


-- 6. RLS POLICIES
-- ============================================================

-- profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- user_roles
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Agencies can manage all roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'agency'))
  with check (public.has_role(auth.uid(), 'agency'));

-- agencies (read-only for own agency)
create policy "Users can view their own agency"
  on public.agencies for select
  using (
    id in (
      select agency_id from public.profiles where id = auth.uid()
    )
  );


-- 7. GRANTS
-- ============================================================

grant execute on function public.ensure_user_dashboard_setup() to authenticated;
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.get_user_role(uuid) to authenticated;
