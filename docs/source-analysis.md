# Source Analysis: 1prompt-os Web App

Analysed: 2026-04-26  
Source path (read-only): `/Users/dzmitrypiskun/Documents/1prompt-os/frontend`

---

## 1. Supabase Configuration

**Client location:** `src/integrations/supabase/client.ts`

```typescript
createClient(url, anonKey, {
  auth: {
    storage: localStorage, // ← replaced with SecureStore in mobile
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

**Auth providers enabled:** Email/password only. Google OAuth is referenced in comments/email-inbox UI but **not implemented** — no `signInWithOAuth` call exists.

**Email confirmation mode:** OTP (6-digit code), not magic-link. Handled in `VerifyEmail.tsx` via `supabase.auth.verifyOtp({ type: 'signup', email, token })`.

---

## 2. Database Schema

### `public.profiles`

```sql
CREATE TABLE public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                TEXT,
  full_name            TEXT,
  logo_url             TEXT,
  agency_id            UUID,                                          -- no explicit FK
  client_id            UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### `public.user_roles`

```sql
CREATE TYPE public.app_role AS ENUM ('agency', 'client');

CREATE TABLE public.user_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role    app_role NOT NULL DEFAULT 'agency',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### `public.agencies`

```sql
CREATE TABLE public.agencies (
  id         UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
```

### `public.clients` (abridged — large table, business entity)

Key auth-related columns: `id uuid pk`, `agency_id uuid`, `subscription_status text`.  
Full DDL not replicated in the mobile migration since clients are a business concern beyond Phase 1 auth.

---

## 3. RLS Policies (verbatim)

```sql
-- profiles
CREATE POLICY "Users can view their own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Agencies can manage all roles"  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'agency'))
  WITH CHECK (public.has_role(auth.uid(), 'agency'));
```

---

## 4. Triggers

### `on_auth_user_created` (on `auth.users` INSERT)

Creates a `profiles` row and assigns `user_roles.role = 'agency'` for every new signup.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, agency_id)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), gen_random_uuid());

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'agency');

  RETURN NEW;
END;
$$;
```

### `update_updated_at_column` (generic, applied to all mutable tables)

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN  NEW.updated_at = now(); RETURN NEW; END;
$$;
```

---

## 5. RPC Functions

| Function                        | Returns            | Purpose                                                                                                    |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `ensure_user_dashboard_setup()` | `uuid` (agency_id) | Idempotent: creates profile + role + default client if missing. Called after sign-in as a repair function. |
| `has_role(uuid, app_role)`      | `boolean`          | Used in RLS policies                                                                                       |
| `get_user_role(uuid)`           | `text`             | Returns role string for a given user                                                                       |

---

## 6. Auth Flow Inventory

### Sign-up

File: `src/pages/Register.tsx`

1. Collect: firstName, lastName, email, password, confirmPassword
2. `supabase.auth.signUp({ email, password, options: { emailRedirectTo: origin + '/', data: { full_name } } })`
3. Trigger fires → creates profile + role
4. Redirect to `/verify` page (OTP entry)

### Sign-in (email/password)

File: `src/pages/Auth.tsx` + `src/providers/AuthProvider.tsx`

1. `supabase.auth.signInWithPassword({ email, password })`
2. `onAuthStateChange` fires `SIGNED_IN` → fetch role + profile
3. Call `ensure_user_dashboard_setup()` to ensure profile exists
4. Redirect based on role (client → `/client/:id/...`, agency → `/`)

### Google OAuth

**NOT IMPLEMENTED** in the web app. Only stub references exist. Mobile app builds it fresh.

### Sign-out

```typescript
localStorage.removeItem('sb-<projectRef>-auth-token'); // browser-specific, NOT portable
await supabase.auth.signOut({ scope: 'global' });
```

Mobile: omit localStorage call — SecureStore cleanup is handled by the Supabase client.

### Password reset

1. ForgotPassword: calls `check-reset-eligibility` Edge Function (rate-limiting), then `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`
2. ResetPassword: listens for `PASSWORD_RECOVERY` auth event, then `supabase.auth.updateUser({ password })`
3. Link valid for 1 hour
4. After reset: sign out globally, redirect to `/auth` after 3s

### Email confirmation

OTP-based (6-digit code). `supabase.auth.verifyOtp({ email, token, type: 'signup' })`. Resend: `supabase.auth.resend({ type: 'signup', email })`.

### Session refresh

Automatic via `autoRefreshToken: true`. `TOKEN_REFRESHED` event triggers role re-fetch in `AuthProvider`.

### Profile creation/update

Auto-created by trigger. Update: `supabase.from('profiles').update({...}).eq('id', userId)`.

---

## 7. Portable vs. Non-Portable Code

### Portable (usable in RN with minor changes)

- Auth logic in `AuthProvider.tsx` (remove `window.*` refs)
- `useAuth` hook
- Supabase types in `src/integrations/supabase/types.ts`
- All RPC/database-facing calls

### NOT portable (browser/Next.js-specific)

| Pattern                             | Location                   | Mobile alternative                       |
| ----------------------------------- | -------------------------- | ---------------------------------------- |
| `localStorage` for token            | `signOut`, `client.ts`     | SecureStore (via Supabase client config) |
| `window.location.origin`            | `signUp`, `ForgotPassword` | Hardcoded deep-link scheme               |
| `window.location.hash`              | `ResetPassword`            | `expo-linking` / URL params              |
| `sessionStorage`                    | `App.tsx` chunk reload     | N/A                                      |
| `react-router-dom`                  | All pages                  | `expo-router`                            |
| `useToast()` / shadcn               | UI feedback                | Inline text errors                       |
| HTML5 form validation               | All pages                  | Zod + inline errors                      |
| Next.js server actions / middleware | None (this is Vite)        | N/A                                      |

---

## 8. Environment Variables

| Var                      | Scope  | Description              |
| ------------------------ | ------ | ------------------------ |
| `VITE_SUPABASE_URL`      | Public | Supabase project URL     |
| `VITE_SUPABASE_ANON_KEY` | Public | Supabase anon/public key |

No server-only vars. All auth is client-side.

Mobile equivalent names: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

---

## 9. Prettier / ESLint

**Prettier:** No `.prettierrc` found. Mobile app uses its own defaults (see `.prettierrc`).

**ESLint:** `eslint.config.js` uses ESLint v9 flat config format with TypeScript + React Hooks + React Refresh plugins. NOT portable to React Native as-is (React Refresh is web-only). Mobile app uses its own `.eslintrc.js` extending `eslint-config-expo`.

---

## Open Questions

1. The `check-reset-eligibility` Edge Function is called before sending a password reset email. It likely implements rate-limiting. **Not ported to mobile** — Supabase's own rate limiting applies. If you need the same rate-limit logic, deploy the edge function to the new project.
2. `clients` table has many columns with API keys and webhook URLs. These are not part of the auth phase but the `profiles.client_id` FK references them. The mobile migration omits `clients` — add it in a future migration when implementing the dashboard.
3. Email confirmation is OTP-based in the web app. The mobile `sign-up.tsx` shows a "check your email" screen but does not implement OTP entry. Add a `verify-email.tsx` screen in a future sprint if you want in-app OTP confirmation.
