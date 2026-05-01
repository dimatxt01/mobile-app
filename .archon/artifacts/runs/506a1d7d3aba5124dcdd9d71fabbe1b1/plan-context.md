# Plan Context

**Generated**: 2026-05-01 00:45
**Workflow ID**: 506a1d7d3aba5124dcdd9d71fabbe1b1
**Plan Source**: .archon/plans/hmc-app.plan.md

---

## Branch

| Field      | Value                    |
| ---------- | ------------------------ |
| **Branch** | `archon/thread-e29abf9f` |
| **Base**   | `main`                   |

_Note: Running in worktree — branch used as-is per isolation system._

---

## Plan Summary

**Title**: Half Milly Club (HMC) Habit-Scoring App

**Overview**: Implement the complete HMC daily scoring app on top of the existing Expo Router + Supabase + NativeWind + Zustand skeleton, replacing placeholder tabs with a production-grade dark receipt-aesthetic app. All 9 phases build sequentially; each phase must pass `npx tsc --noEmit` before the next begins.

---

## Files to Change

### PHASE 0 — Port existing base code to worktree

| File                                         | Action                      |
| -------------------------------------------- | --------------------------- |
| `global.css`                                 | PORT as-is                  |
| `nativewind-env.d.ts`                        | PORT as-is                  |
| `expo-env.d.ts`                              | PORT as-is                  |
| `babel.config.js`                            | PORT as-is                  |
| `metro.config.js`                            | PORT as-is                  |
| `tailwind.config.js`                         | PORT as-is                  |
| `.eslintrc.js`                               | PORT as-is                  |
| `eslint.config.js`                           | PORT as-is                  |
| `.prettierrc`                                | PORT as-is                  |
| `jest.config.js`                             | PORT as-is                  |
| `src/lib/supabase.ts`                        | PORT as-is                  |
| `src/lib/query-client.ts`                    | PORT as-is                  |
| `src/components/ui/Button.tsx`               | PORT as-is                  |
| `src/components/ui/Input.tsx`                | PORT as-is                  |
| `src/components/ui/Screen.tsx`               | PORT as-is                  |
| `src/features/auth/api/oauth-google.ts`      | PORT as-is                  |
| `src/features/auth/api/reset-password.ts`    | PORT as-is                  |
| `src/features/auth/api/sign-in.ts`           | PORT as-is                  |
| `src/features/auth/api/sign-out.ts`          | PORT as-is                  |
| `src/features/auth/api/sign-up.ts`           | PORT as-is                  |
| `src/features/auth/api/update-password.ts`   | PORT as-is                  |
| `src/features/auth/hooks/use-auth.ts`        | PORT as-is                  |
| `src/features/auth/schemas/auth-schemas.ts`  | PORT as-is                  |
| `src/features/auth/store/auth-store.ts`      | PORT as-is                  |
| `app/(auth)/_layout.tsx`                     | PORT as-is                  |
| `app/(auth)/forgot-password.tsx`             | PORT as-is                  |
| `app/(auth)/reset-password.tsx`              | PORT as-is                  |
| `app/(auth)/sign-in.tsx`                     | PORT as-is                  |
| `app/(auth)/sign-up.tsx`                     | PORT as-is                  |
| `.env.example`                               | PORT as-is                  |
| `supabase/migrations/0001_init.sql`          | PORT as-is                  |
| `supabase/migrations/0002_hmc_profile.sql`   | PORT as-is                  |
| `supabase/migrations/0003_hmc_habits.sql`    | PORT as-is                  |
| `supabase/migrations/0004_hmc_checkins.sql`  | PORT as-is                  |
| `supabase/migrations/0005_hmc_mirror.sql`    | PORT as-is                  |
| `supabase/migrations/0006_hmc_reviews.sql`   | PORT as-is                  |
| `supabase/migrations/0007_hmc_functions.sql` | PORT as-is                  |
| `app/_layout.tsx`                            | PORT then UPDATE (Phase 1)  |
| `app/index.tsx`                              | PORT then UPDATE (Phase 3)  |
| `app/(app)/_layout.tsx`                      | PORT then UPDATE (Phase 3)  |
| `app/(app)/(tabs)/_layout.tsx`               | PORT then REPLACE (Phase 1) |
| `app/(app)/(tabs)/index.tsx`                 | PORT then REPLACE (Phase 4) |
| `src/types/database.ts`                      | PORT then EXTEND (Phase 2)  |
| `__tests__/auth-schemas.test.ts`             | PORT as-is                  |
| `__tests__/auth-store.test.ts`               | PORT as-is                  |
| `__tests__/smoke.test.ts`                    | PORT as-is                  |

### PHASE 1 — Foundation

| File                                  | Action                |
| ------------------------------------- | --------------------- |
| `src/lib/hmc-colors.ts`               | CREATE                |
| `app/_layout.tsx`                     | UPDATE (font loading) |
| `src/components/hmc/Rule.tsx`         | CREATE                |
| `src/components/hmc/Eyebrow.tsx`      | CREATE                |
| `src/components/hmc/BigNum.tsx`       | CREATE                |
| `src/components/hmc/HabitRow.tsx`     | CREATE                |
| `src/components/hmc/Step05.tsx`       | CREATE                |
| `src/components/hmc/Slider10.tsx`     | CREATE                |
| `src/components/hmc/BracketBlock.tsx` | CREATE                |
| `src/components/hmc/PrintBar.tsx`     | CREATE                |
| `src/components/hmc/PrintTabBar.tsx`  | CREATE                |
| `src/components/hmc/BottomBar.tsx`    | CREATE                |
| `src/components/hmc/POCta.tsx`        | CREATE                |
| `src/components/hmc/POBar.tsx`        | CREATE                |
| `src/lib/score.ts`                    | CREATE                |
| `app/(app)/(tabs)/_layout.tsx`        | REPLACE (5-tab)       |
| `app/(app)/(tabs)/week.tsx`           | CREATE placeholder    |
| `app/(app)/(tabs)/trends.tsx`         | CREATE placeholder    |
| `app/(app)/(tabs)/mirror.tsx`         | CREATE placeholder    |
| `app/(app)/(tabs)/you.tsx`            | CREATE placeholder    |
| `app/(app)/(tabs)/index.tsx`          | REPLACE placeholder   |
| `app/(app)/(tabs)/profile.tsx`        | DELETE                |
| `app/(app)/modal/_layout.tsx`         | CREATE                |

### PHASE 2 — Data Layer

| File                                   | Action                   |
| -------------------------------------- | ------------------------ |
| `src/types/database.ts`                | UPDATE (full HMC schema) |
| `src/store/profile-store.ts`           | CREATE                   |
| `src/features/habits/use-config.ts`    | CREATE                   |
| `src/features/checkin/use-checkin.ts`  | CREATE                   |
| `src/features/checkin/save-checkin.ts` | CREATE                   |
| `src/features/checkin/lock-checkin.ts` | CREATE                   |
| `src/features/history/use-history.ts`  | CREATE                   |

### PHASE 3 — Routing & Onboarding

| File                           | Action                       |
| ------------------------------ | ---------------------------- |
| `app/index.tsx`                | UPDATE (3-way routing guard) |
| `app/(app)/_layout.tsx`        | UPDATE (onboarding guard)    |
| `app/(onboarding)/_layout.tsx` | CREATE                       |
| `app/(onboarding)/index.tsx`   | CREATE (13-step wizard)      |

### PHASE 4 — TODAY Tab

| File                                  | Action               |
| ------------------------------------- | -------------------- |
| `app/(app)/(tabs)/index.tsx`          | REPLACE (PrintToday) |
| `app/(app)/modal/score-breakdown.tsx` | CREATE               |

### PHASE 5 — WEEK + TRENDS Tabs

| File                                  | Action              |
| ------------------------------------- | ------------------- |
| `app/(app)/(tabs)/week.tsx`           | REPLACE (full impl) |
| `app/(app)/(tabs)/trends.tsx`         | REPLACE (full impl) |
| `app/(app)/modal/week-day/[date].tsx` | CREATE              |

### PHASE 6 — MIRROR Tab

| File                                    | Action              |
| --------------------------------------- | ------------------- |
| `src/features/mirror/use-mirror.ts`     | CREATE              |
| `src/features/mirror/upload-photo.ts`   | CREATE              |
| `app/(app)/(tabs)/mirror.tsx`           | REPLACE (full impl) |
| `app/(app)/modal/mirror-capture.tsx`    | CREATE              |
| `app/(app)/modal/mirror-day/[date].tsx` | CREATE              |

### PHASE 7 — YOU Tab + Edit Modals

| File                                         | Action              |
| -------------------------------------------- | ------------------- |
| `app/(app)/(tabs)/you.tsx`                   | REPLACE (full impl) |
| `app/(app)/modal/edit-identity-sentence.tsx` | CREATE              |
| `app/(app)/modal/edit-habits.tsx`            | CREATE              |
| `app/(app)/modal/edit-outcomes.tsx`          | CREATE              |
| `app/(app)/modal/edit-penalties.tsx`         | CREATE              |
| `app/(app)/modal/signout-confirm.tsx`        | CREATE              |
| `app/(app)/modal/notification-settings.tsx`  | CREATE              |

### PHASE 8 — Notifications + Post-lock Triggers

| File                                              | Action |
| ------------------------------------------------- | ------ |
| `src/features/notifications/schedule-reminder.ts` | CREATE |
| `app/(app)/modal/weekly-review.tsx`               | CREATE |
| `app/(app)/modal/monthly-review.tsx`              | CREATE |
| `app/(app)/modal/returning-user.tsx`              | CREATE |

### PHASE 9 — Stub Modals

| File                                      | Action |
| ----------------------------------------- | ------ |
| `app/(app)/modal/paywall.tsx`             | CREATE |
| `app/(app)/modal/manage-subscription.tsx` | CREATE |
| `app/(app)/modal/privacy-data.tsx`        | CREATE |
| `app/(app)/modal/whoop-connect.tsx`       | CREATE |

### Testing

| File                      | Action |
| ------------------------- | ------ |
| `__tests__/score.test.ts` | CREATE |

---

## NOT Building (Scope Limits)

**CRITICAL FOR REVIEWERS**: These items are **intentionally excluded** from scope. Do NOT flag them as bugs or missing features.

- **RevenueCat / react-native-purchases** — Paywall is a "coming soon" stub only; no real paywall implementation
- **react-native-svg** — Not bundled in Expo Go SDK 54; all charts use View-based bars and sparklines (proportional `View` rectangles)
- **Whoop OAuth integration** — Stub screen only (`whoop-connect.tsx`); no actual OAuth flow
- **Google OAuth changes** — Existing implementation kept as-is; do not modify auth screens
- **Supabase migrations (0001–0007)** — Already written and applied; do not modify migration files

---

## Validation Commands

```bash
npx tsc --noEmit
npx jest
npx expo-doctor
npx expo start
```

Each phase must pass `npx tsc --noEmit` before starting the next phase.

---

## Acceptance Criteria

- [ ] Expo Go opens the app without a red screen on both iOS and Android simulators
- [ ] New user completes onboarding wizard (13 steps) and lands on TODAY tab
- [ ] TODAY tab shows all 4 brackets, live score updates, and CTA locks the checkin
- [ ] WEEK and TRENDS tabs show historical data (empty state < 7 days)
- [ ] MIRROR tab captures a photo and shows gallery
- [ ] YOU tab shows profile stats and all edit modals open
- [ ] All modal routes are reachable (no broken navigation)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx expo-doctor` shows no critical warnings

---

## Patterns to Mirror

| Pattern                                    | Source File                                                |
| ------------------------------------------ | ---------------------------------------------------------- |
| Zustand store pattern                      | `src/features/auth/store/auth-store.ts`                    |
| API function pattern (discriminated union) | `src/features/auth/api/sign-in.ts`                         |
| Supabase RPC call pattern                  | `src/features/auth/api/sign-in.ts`                         |
| StyleSheet component pattern               | All HMC components (import colors from `@/lib/hmc-colors`) |
| TanStack Query hook pattern                | `src/features/habits/use-config.ts`                        |
| TanStack mutation pattern                  | `src/features/checkin/save-checkin.ts`                     |

### Architecture Rules

- StyleSheet for all HMC components — not NativeWind (NativeWind stays on auth screens only)
- No try/catch at call sites — errors returned as discriminated unions `{ data, error }`
- No default exports on hooks/utils — only screen components get default exports
- `@/` alias maps to `src/` (verified in tsconfig.json paths)
- Debounce 800ms on saveCheckin
- perf_9to5 folded into execution_score before calling `lock_checkin()` RPC
- View-based charts — no react-native-svg
- Onboarding wizard is a single screen with step state via useState (NOT multiple routes)
- Modal stack at `app/(app)/modal/` with `_layout.tsx` using `presentation: 'modal'`

### Source of Truth for Porting

Main project: `/Users/dzmitrypiskun/Documents/mobile-app/test-app`
Worktree target: `/Users/dzmitrypiskun/.archon/workspaces/mobile-app/test-app/worktrees/archon/thread-e29abf9f`

---

## Next Steps

1. `archon-confirm-plan` - Verify patterns still exist
2. `archon-implement-tasks` - Execute the plan (Phase 0 → Phase 9)
3. `archon-validate` - Run full validation
4. `archon-finalize-pr` - Create PR and mark ready
