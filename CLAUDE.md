
# Half Milly Club (HMC) — Project Reference

## What This App Is

A dark-only, print/receipt-aesthetic daily self-scoring app. Users score themselves each night across 4 brackets (Identity, Execution, Outcomes, Penalty), lock in a number, and optionally photograph themselves.

## Tech Stack

- **Expo SDK 54** + **Expo Router 6** (file-based routing)
- **React Native 0.81.5** with New Architecture enabled
- **Supabase** — auth + Postgres + Storage
- **TanStack Query 5** — server state, caching, mutations
- **Zustand 5** — client state (auth session, profile)
- **NativeWind 4** — used only for legacy auth screens; HMC components use `StyleSheet`
- **expo-font** + `@expo-google-fonts/inter` + `@expo-google-fonts/jetbrains-mono` — custom fonts
- **TypeScript 5.9**

## Directory Layout

```
app/
  _layout.tsx              # Root layout — font loading, providers
  index.tsx                # Auth+onboarding redirect guard
  (auth)/                  # Sign-in, sign-up, forgot/reset password — DO NOT TOUCH
  (onboarding)/            # 13-step wizard (single screen, step state machine)
  (app)/
    _layout.tsx            # Session + onboarding_completed guard
    (tabs)/
      _layout.tsx          # 5-tab PrintTabBar (TODAY/WEEK/TRENDS/MIRROR/YOU)
      index.tsx            # TODAY tab
      week.tsx             # WEEK tab
      trends.tsx           # TRENDS tab
      mirror.tsx           # MIRROR tab
      you.tsx              # YOU tab (profile)
    modal/
      _layout.tsx          # Modal stack
      score-breakdown.tsx
      mirror-capture.tsx
      mirror-day/[date].tsx
      week-day/[date].tsx
      edit-habits.tsx      # ?type=identity|execution
      edit-outcomes.tsx
      edit-penalties.tsx
      edit-identity-sentence.tsx
      weekly-review.tsx
      monthly-review.tsx
      returning-user.tsx
      paywall.tsx          # "Coming soon" stub
      manage-subscription.tsx
      privacy-data.tsx
      signout-confirm.tsx
      whoop-connect.tsx
      notification-settings.tsx

src/
  components/
    ui/                    # Existing: Button, Input, Screen — DO NOT CHANGE
    hmc/                   # HMC primitives (StyleSheet only)
      Rule.tsx             # Hairline separator
      Eyebrow.tsx          # Mono uppercase label
      BigNum.tsx           # 104px tabular numeral
      HabitRow.tsx         # Checkbox row with +N pts
      Step05.tsx           # 0–5 stepper (tap +/-)
      Slider10.tsx         # 0–10 slider (9-to-5 performance)
      BracketBlock.tsx     # Section wrapper (Eyebrow + rows + subtotal)
      PrintBar.tsx         # Top bar: HMC. left / DAY X right
      PrintTabBar.tsx      # Custom tab bar (text labels, amber underline)
      BottomBar.tsx        # Fixed bottom CTA area
      POCta.tsx            # Onboarding CTA button
      POBar.tsx            # Onboarding progress bar (step N of 13)
  features/
    auth/                  # DO NOT TOUCH
    checkin/
      use-checkin.ts       # TanStack Query — today's checkin row
      save-checkin.ts      # Debounced upsert mutation
      lock-checkin.ts      # Calls lock_checkin() RPC
    habits/
      use-config.ts        # Habits + outcomes + penalties for current user
    history/
      use-history.ts       # get_history() RPC wrapper
    mirror/
      use-mirror.ts        # Mirror photos list
      upload-photo.ts      # Upload to Supabase Storage 'mirror-photos'
    notifications/
      schedule-reminder.ts # expo-notifications local scheduling
  lib/
    supabase.ts            # DO NOT TOUCH
    query-client.ts        # DO NOT TOUCH
    hmc-colors.ts          # All design token constants
    score.ts               # computeScore() pure function
    score-density.ts       # ScoreDensity type + useScoreDensity hook (AsyncStorage-backed)
  store/
    profile-store.ts       # Zustand: profile fields + onboarding_completed
  types/
    database.ts            # Full Supabase type definitions (manual)
```

## Design System

**All HMC components use StyleSheet, not NativeWind class names.**
Import colors from `src/lib/hmc-colors.ts`.

```
Colors:
  base:       #0A0A0B   (page background)
  elevated:   #111113   (inner sections)
  high:       #1A1A1D   (hover / active bg)
  textPrimary:   #F5F5F7
  textSecondary: #A1A1A6
  textTertiary:  #6B6B70
  lineRegular: rgba(255,255,255,0.08)
  lineStrong:  rgba(255,255,255,0.14)
  amber:       #FFB020   ← ONLY on active states, totals, active tab
  danger:      #FF453A
  bgHigher:    #222226                   (elevated surface, pill active bg)
  textQuiet:   #48484C                   (deemphasized / footer text)
  accentMuted: rgba(255,176,32,0.16)     (active pill background)
  accentDim:   rgba(255,176,32,0.5)      (active pill border)
  accentGlow:  rgba(255,176,32,0.28)     (BottomBar button shadow)
  dangerMuted: rgba(255,69,58,0.12)      (danger surface / bg)

Fonts:
  display:  Inter_400Regular, Inter_500Medium, Inter_700Bold
  mono:     JetBrainsMono_400Regular, JetBrainsMono_700Bold
```

**Typography rules:**

- Numbers: JetBrains Mono, tabular figures (`fontVariant: ['tabular-nums']`)
- Labels/eyebrows: JetBrains Mono uppercase, letterSpacing 1.5
- Body: Inter
- Amber ONLY on: active tab underline, locked total, active CTA, amber accent text

**Spacing:**

- Horizontal padding: 20px
- Section gap: 24px
- Hairline: `height: StyleSheet.hairlineWidth`

## Score Formula

```
total = identity_score + execution_score + outcome_score - penalty_score + whoop_score_adj
late checkin: -10 pts   (is_late_checkin flag on daily_checkins)
no minimum cap (server clamps to 0 with greatest(..., 0))
```

`perf_9to5` (0–10, from Slider10) is stored on `daily_checkins.perf_9to5` and added to `execution_score` before calling `lock_checkin()`. The RPC receives the combined execution_score; perf_9to5 is saved via the upsert separately.

## Navigation Guards

```
app/index.tsx:
  isInitialized=false → spinner
  no session          → /(auth)/sign-in
  session + no onboarding_completed → /(onboarding)
  session + onboarding_completed → /(app)/(tabs)

app/(app)/_layout.tsx:
  no session → /(auth)/sign-in
  no onboarding_completed → /(onboarding)
  ok → render children
```

## Database RPCs

| RPC                                                       | Args             | Returns                                                  | When called       |
| --------------------------------------------------------- | ---------------- | -------------------------------------------------------- | ----------------- |
| `seed_default_habits(user_id)`                            | uuid             | void                                                     | End of onboarding |
| `lock_checkin(id, identity, execution, outcome, penalty)` | uuid + 4 ints    | int (final total)                                        | Lock CTA tap      |
| `get_user_stats()`                                        | —                | {streak, day_count, lifetime_avg, best_score, best_date} | YOU tab header    |
| `get_history(days)`                                       | int (default 30) | rows                                                     | WEEK/TRENDS data  |

## Coding Conventions

- **Error handling**: discriminated union `{ data, error: null } | { data: null, error }` — matches Supabase SDK shape
- **No try/catch** at call sites — errors surface via `.error` field
- **No comments** unless the WHY is non-obvious
- **No default exports** for hooks/utilities; default export only for screen components (Expo Router requirement)
- **Mutations**: TanStack `useMutation`, not raw async functions in components
- **Debounce**: 800ms on `saveCheckin` upsert
- **StyleSheet.create()** for all HMC styles (no inline style objects)
- **No NativeWind classes** on HMC components — keep concerns separated

## Packages — Status

| Package                           | Status         | Notes                 |
| --------------------------------- | -------------- | --------------------- |
| expo-font                         | installed      | font loading          |
| @expo-google-fonts/inter          | installed      | Inter display font    |
| @expo-google-fonts/jetbrains-mono | installed      | JetBrains Mono        |
| @react-native-async-storage/async-storage | installed | score-density display preference |
| expo-camera                       | needs install  | MIRROR tab            |
| expo-image-picker                 | needs install  | MIRROR tab alt        |
| expo-notifications                | needs install  | local reminders       |
| expo-file-system                  | needs install  | photo handling        |
| react-native-svg                  | SKIP (Expo Go) | use View-based charts |
| react-native-purchases            | SKIP (stub)    | paywall "coming soon" |

All packages except react-native-svg and react-native-purchases work in Expo Go SDK 54.

## What Is Complete (Do Not Change)

- `app/(auth)/` — sign-in, sign-up, forgot/reset password, Google OAuth
- `src/features/auth/` — all hooks, API, store, schemas
- `src/lib/supabase.ts` — Supabase client with SecureStore adapter
- `src/lib/query-client.ts` — TanStack Query config
- `src/components/ui/Button.tsx`, `Input.tsx`, `Screen.tsx`
- `supabase/migrations/0001–0007` — complete schema + RPCs

## Implementation Phases

See `.archon/logs/progress.md` for current status of each phase.

- **Phase 1** — Foundation: design tokens, fonts, primitives, score.ts, 5-tab scaffold
- **Phase 2** — Data layer: DB types, profile store, hooks (checkin/habits/history)
- **Phase 3** — Routing & Onboarding: guards, 13-step wizard
- **Phase 4** — TODAY tab: full scoring UI + lock + score-breakdown modal
- **Phase 5** — WEEK + TRENDS tabs: View-based charts, history data
- **Phase 6** — MIRROR tab: camera, upload, gallery
- **Phase 7** — YOU tab + edit modals
- **Phase 8** — Post-lock triggers + notifications
- **Phase 9** — Stub modals: paywall, subscription, privacy, whoop

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

| File                     | Contents                              |
| ------------------------ | ------------------------------------- |
| `0001_init.sql`          | Auth + base schema                    |
| `0002_hmc_profile.sql`   | User profiles                         |
| `0003_hmc_habits.sql`    | Habits table                          |
| `0004_hmc_checkins.sql`  | Daily check-ins                       |
| `0005_hmc_mirror.sql`    | Mirror photos                         |
| `0006_hmc_reviews.sql`   | Weekly/monthly reviews                |
| `0007_hmc_functions.sql` | `lock_checkin` and `get_history` RPCs |

## Commands

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm start`         | Start Expo dev server           |
| `npm run ios`       | Run on iOS simulator            |
| `npm run android`   | Run on Android emulator         |
| `npm test`          | Run Jest test suite             |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run lint`      | ESLint                          |
| `npm run format`    | Prettier                        |

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
- **Display preferences**: AsyncStorage via `useScoreDensity()` in `src/lib/score-density.ts` — survives auth sign-out (unlike profile state in Zustand)

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
