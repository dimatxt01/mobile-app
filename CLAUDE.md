# HMC Habit-Scoring App — Developer Guide

## Setup

### Prerequisites

- Node.js 20+, Bun, Expo CLI (`npm install -g expo-cli`)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in both values:

```
EXPO_PUBLIC_SUPABASE_URL=<your-project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Install Dependencies

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is required due to peer dependency conflicts between expo SDK 54 and some transitive packages.

### Apply Database Migrations

```bash
supabase db push
```

This applies all 7 migrations in `supabase/migrations/` in order:

| File | Contents |
|------|----------|
| `0001_init.sql` | Auth + base schema |
| `0002_hmc_profile.sql` | User profiles |
| `0003_hmc_habits.sql` | Habits table |
| `0004_hmc_checkins.sql` | Daily check-ins |
| `0005_hmc_mirror.sql` | Mirror photos |
| `0006_hmc_reviews.sql` | Weekly/monthly reviews |
| `0007_hmc_functions.sql` | `lock_checkin` and `get_history` RPCs |

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run Jest test suite |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Architecture

### Routing

Expo Router (file-based). Key route groups:

- `app/(auth)/` — sign-in, sign-up, forgot-password
- `app/(onboarding)/` — 5-step onboarding wizard
- `app/(app)/(tabs)/` — main tab screens (Today, Mirror, History, Trends, Settings)
- `app/(app)/modal/` — modal screens (edit config, capture photo, reviews)
- `app/index.tsx` — root router; redirects based on auth/onboarding state

### State

- **Auth**: Zustand store (`src/features/auth/store/auth-store.ts`) populated by Supabase `onAuthStateChange`
- **Profile**: Zustand store (`src/store/profile-store.ts`) fetched in `app/index.tsx`
- **Server state**: TanStack Query v5 throughout; query key convention: `[resource, userId, ...params]`

### Data Layer

- Supabase client at `src/lib/supabase.ts`
- Feature hooks in `src/features/*/` (e.g. `use-config.ts`, `use-checkin.ts`)
- Mutations use `useMutation` from TanStack Query; `mutationFn` throws on error (React Query standard)

### Scoring Engine

Pure function at `src/lib/score.ts`. Takes habits, outcomes, penalties, and check-in state; returns `ScoreResult`. Fully unit-tested in `__tests__/score.test.ts`.

## Known SDK Deviations

**`expo-file-system` SDK 54 — `EncodingType` not re-exported**

In `src/features/mirror/upload-photo.ts`, `encoding: 'base64'` is passed as a string literal instead of `FileSystem.EncodingType.Base64`. The enum is not re-exported from the SDK 54 main module; using the import path causes a runtime error.

## Out of Scope (Planned, Not Implemented)

- Paywall / subscription gating
- Whoop OAuth integration (stub: `whoop_score_adj` field exists in check-ins)
