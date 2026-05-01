# CoolifyAI Mobile App

Expo SDK 54 · React Native · TypeScript · Supabase · NativeWind

---

## Quick Start

```bash
# 1. Create .env.local (see below)
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Run on iOS simulator
npm run ios

# 4. Run on Android emulator
npm run android
```

### Environment setup

Edit `.env.local` with your Supabase project credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Get these from: Supabase Dashboard → Settings → API.

---

## Apply the SQL Migration

In the Supabase Dashboard of your **new** project:

1. Go to **SQL Editor**
2. Paste the contents of `supabase/migrations/0001_init.sql`
3. Click **Run**

### Verify the migration ran correctly

- [ ] `profiles` table appears in Table Editor
- [ ] Lock icon visible next to `profiles` (RLS enabled)
- [ ] `user_roles` table appears with RLS enabled
- [ ] Database → Triggers shows `on_auth_user_created`
- [ ] Sign up a test user → verify a row appears in `profiles`

---

## Supabase Dashboard Configuration

After creating your project and running the migration, configure these manually:

### Authentication → URL Configuration → Redirect URLs

Add both:

```
coolify-ai://reset-password
coolify-ai://auth/callback
```

> During development in Expo Go, also add the Expo proxy redirect URL.
> Run `npx expo start` and note the URL shown in the terminal (format: `https://auth.expo.io/@<your-expo-username>/coolify-ai`).

### Authentication → Providers → Google

1. Enable the Google provider
2. Paste your **Google OAuth Web Client ID** and **Web Client Secret**
3. Supabase will show you a callback URL — add it to your Google Cloud Console app

---

## Google Cloud Console — OAuth Setup

You need three OAuth client IDs:

| Platform           | Type            | Notes                                            |
| ------------------ | --------------- | ------------------------------------------------ |
| iOS                | iOS client      | Bundle ID: your final bundle identifier          |
| Android            | Android client  | Package name + SHA-1 fingerprint                 |
| Web (for Supabase) | Web application | Add Supabase callback URL as authorized redirect |

Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client IDs for each platform above
3. Paste the Web client ID + secret into Supabase (see above)
4. For iOS/Android clients: these are used by `expo-auth-session` internally

> ⚠️ The current `ios.bundleIdentifier` and `android.package` in `app.json` are placeholders (`com.placeholder.coolifyai`). Update them to your final values **before** generating OAuth credentials — they are permanent after first store submission.

---

## Running Tests

```bash
npm test              # run all tests
npm run typecheck     # TypeScript strict check
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run doctor        # Expo doctor
```

---

## Project Structure

```
app/                    # Expo Router routes
  _layout.tsx           # Root layout (providers, AppState listener)
  index.tsx             # Redirect based on session
  (auth)/               # Public routes (sign-in, sign-up, etc.)
  (app)/                # Protected routes (tabs)
src/
  components/ui/        # Button, Input, Screen primitives
  features/auth/        # Zustand store, hooks, API, Zod schemas
  lib/                  # Supabase client, TanStack Query client
  types/                # Database types placeholder
supabase/migrations/    # SQL migration to run in new project
docs/                   # source-analysis.md, decisions.md
__tests__/              # Unit and integration tests
```

---

## What Is NOT Done

| Item                              | Notes                                                                                                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sentry initialization**         | Package installed. Add `Sentry.init({ dsn })` in `app/_layout.tsx` where `// TODO(sentry)` comment is. Also add Sentry plugin to `app.json` and run `npx expo install @sentry/react-native`. |
| **EAS Build**                     | No `eas.json`. Set up when ready for TestFlight/Play testing.                                                                                                                                |
| **App Store / Play Console**      | No submission config. Set final bundle ID / package name first.                                                                                                                              |
| **Push notifications**            | Not implemented.                                                                                                                                                                             |
| **RevenueCat / IAP**              | Not implemented.                                                                                                                                                                             |
| **Email OTP verification screen** | Sign-up shows "check email" state. Add `verify-email.tsx` with OTP input if needed.                                                                                                          |
| **Supabase TypeScript types**     | `src/types/database.ts` is hand-written. Generate the full file: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`                                               |
| **`clients` table migration**     | The `clients` business table is not in the migration. Add in a future migration when implementing the dashboard features.                                                                    |

## Future ideas

- Teams
