# HMC Implementation Progress Log

Project: `/Users/dzmitrypiskun/Documents/mobile-app/test-app`
Started: 2026-05-01
See `CLAUDE.md` for full architecture reference.

---

## Phase Status Overview

<<<<<<< HEAD
| Phase | Name | Status | Completed |
|-------|------|--------|-----------|
| 1 | Foundation (tokens, fonts, primitives, score.ts, tab scaffold) | ⬜ NOT STARTED | — |
| 2 | Data layer (DB types, profile store, checkin/habits/history hooks) | ⬜ NOT STARTED | — |
| 3 | Routing & Onboarding (guards, 13-step wizard) | ⬜ NOT STARTED | — |
| 4 | TODAY tab (full scoring UI + lock + score-breakdown modal) | ⬜ NOT STARTED | — |
| 5 | WEEK + TRENDS tabs (View-based charts) | ⬜ NOT STARTED | — |
| 6 | MIRROR tab (camera, upload, gallery) | ⬜ NOT STARTED | — |
| 7 | YOU tab + edit modals | ⬜ NOT STARTED | — |
| 8 | Post-lock triggers + local notifications | ⬜ NOT STARTED | — |
| 9 | Stub modals (paywall, subscription, privacy, whoop) | ⬜ NOT STARTED | — |
=======
| Phase | Name                                                               | Status         | Completed |
| ----- | ------------------------------------------------------------------ | -------------- | --------- |
| 1     | Foundation (tokens, fonts, primitives, score.ts, tab scaffold)     | ⬜ NOT STARTED | —         |
| 2     | Data layer (DB types, profile store, checkin/habits/history hooks) | ⬜ NOT STARTED | —         |
| 3     | Routing & Onboarding (guards, 13-step wizard)                      | ⬜ NOT STARTED | —         |
| 4     | TODAY tab (full scoring UI + lock + score-breakdown modal)         | ⬜ NOT STARTED | —         |
| 5     | WEEK + TRENDS tabs (View-based charts)                             | ⬜ NOT STARTED | —         |
| 6     | MIRROR tab (camera, upload, gallery)                               | ⬜ NOT STARTED | —         |
| 7     | YOU tab + edit modals                                              | ⬜ NOT STARTED | —         |
| 8     | Post-lock triggers + local notifications                           | ⬜ NOT STARTED | —         |
| 9     | Stub modals (paywall, subscription, privacy, whoop)                | ⬜ NOT STARTED | —         |
>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555

---

## Phase 1 — Foundation

**Goal**: Everything that doesn't touch data or routing. After this phase the app runs in Expo Go with 5 placeholder tabs, correct fonts, correct colors, and all primitive components renderable.

### Tasks

- [ ] Install packages: `expo-font @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono`
- [ ] Create `src/lib/hmc-colors.ts` — all color + typography constants
- [ ] Update `app/_layout.tsx` — load Inter + JetBrains Mono via `useFonts()`
- [ ] Create `src/components/hmc/Rule.tsx` — hairline separator
- [ ] Create `src/components/hmc/Eyebrow.tsx` — mono uppercase label
- [ ] Create `src/components/hmc/BigNum.tsx` — 104px tabular numeral display
- [ ] Create `src/components/hmc/HabitRow.tsx` — checkbox row with pts label
- [ ] Create `src/components/hmc/Step05.tsx` — 0–5 stepper (–/+)
- [ ] Create `src/components/hmc/Slider10.tsx` — 0–10 slider for 9-to-5
- [ ] Create `src/components/hmc/BracketBlock.tsx` — section wrapper
- [ ] Create `src/components/hmc/PrintBar.tsx` — top bar HMC. / DAY X
- [ ] Create `src/components/hmc/PrintTabBar.tsx` — custom 5-tab bar
- [ ] Create `src/components/hmc/BottomBar.tsx` — fixed bottom CTA area
- [ ] Create `src/components/hmc/POCta.tsx` — onboarding CTA button
- [ ] Create `src/components/hmc/POBar.tsx` — onboarding step counter bar
- [ ] Create `src/lib/score.ts` — `computeScore()` pure function
- [ ] Replace `app/(app)/(tabs)/_layout.tsx` — 5-tab PrintTabBar
- [ ] Create `app/(app)/(tabs)/week.tsx` — placeholder
- [ ] Create `app/(app)/(tabs)/trends.tsx` — placeholder
- [ ] Create `app/(app)/(tabs)/mirror.tsx` — placeholder
- [ ] Create `app/(app)/(tabs)/you.tsx` — placeholder (keep profile.tsx for now)
- [ ] Create `app/(app)/modal/_layout.tsx` — modal stack (presentation: modal)
- [ ] Verify: Expo Go loads, 5 tabs visible with correct fonts + colors

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 2 — Data Layer

**Goal**: All server state hooks wired up. No UI yet, but data can be fetched and mutations can fire.

### Tasks

- [ ] Extend `src/types/database.ts` — full HMC types (profiles extended, habits, outcome_metrics, penalty_items, daily_checkins, mirror_photos, weekly_reviews, monthly_reviews)
- [ ] Create `src/store/profile-store.ts` — Zustand store: profile row (identity_sentence, vision, reminder_time, streak, day_count, lifetime_avg, onboarding_completed, whoop_connected)
- [ ] Create `src/features/habits/use-config.ts` — fetch habits + outcomes + penalties, TanStack Query
- [ ] Create `src/features/checkin/use-checkin.ts` — today's daily_checkins row (upsert on first access)
- [ ] Create `src/features/checkin/save-checkin.ts` — debounced upsert mutation (800ms debounce)
- [ ] Create `src/features/checkin/lock-checkin.ts` — calls `lock_checkin()` RPC with 4 bracket scores
- [ ] Create `src/features/history/use-history.ts` — calls `get_history(days)` RPC

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 3 — Routing & Onboarding

**Goal**: New users flow through onboarding wizard before reaching the app. Auth guard checks onboarding_completed.

### Tasks

- [ ] Update `app/index.tsx` — add 3rd routing branch: session + !onboarding_completed → `/(onboarding)`
- [ ] Update `app/(app)/_layout.tsx` — add profile check: !onboarding_completed → `/(onboarding)`
- [ ] Create `app/(onboarding)/_layout.tsx` — layout wrapper (no header, dark bg)
- [ ] Create `app/(onboarding)/index.tsx` — 13-step wizard

  Steps (useState step counter, 1–13):
  1. Welcome — HMC logo, tagline, "Begin" CTA
  2. Name — text input (pre-filled from auth.user full_name)
  3. Vision — multi-line text input
  4. Identity sentence — single line, stored in profile
  5. Identity habits — editable list (add/remove/reorder, default 4 seeded)
  6. Execution habits — editable list (add/remove/reorder, default 7 seeded)
  7. 9-to-5 explainer — static info screen
  8. Outcomes setup — add up to 4 outcome metrics
  9. Penalties setup — add up to 3 penalty items
  10. Whoop offer — skip / connect (stub: always skip for now)
  11. Reminder time — time picker (default 21:00)
  12. Day Zero receipt — summary of config + "Lock In" CTA
  13. (completion) — writes profile (name, vision, identity_sentence, reminder_time), calls `seed_default_habits()`, sets `onboarding_completed=true`, navigates to `/(app)/(tabs)`

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 4 — TODAY Tab

**Goal**: Core product. User can score all 4 brackets, see their live total, and lock the checkin.

### Tasks

- [ ] Implement `app/(app)/(tabs)/index.tsx` — PrintToday full UI
  - PrintBar (HMC. / DAY X where X = day_count+1)
  - Identity sentence block (if set)
  - BracketBlock IDENTITY — HabitRow per identity habit (checkbox, +N pts)
  - BracketBlock EXECUTION — HabitRow per execution habit + Slider10 inline (9-to-5)
  - BracketBlock OUTCOMES — Step05 per outcome metric (0–5)
  - BracketBlock PENALTY — Step05 per penalty item (0–5, danger color)
  - TOTAL SCORE block — BigNum (amber when >0), delta vs yesterday, breakdown hint
  - BottomBar — "Lock in · X pts" CTA
  - State: pre-unlock (before reminder_time → countdown), open, locked (read-only)
  - Late checkin: banner -10 pts warning
- [ ] Wire TODAY tab to `useCheckin`, `useConfig`, `saveCheckin` (auto-save on every change)
- [ ] Lock flow: tap CTA → call `lockCheckin()` → optimistic update → post-lock triggers check
- [ ] Create `app/(app)/modal/score-breakdown.tsx` — bracket subtotals breakdown sheet

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 5 — WEEK + TRENDS Tabs

**Goal**: Historical data visible. Charts as pure View components (no react-native-svg).

### Tasks

- [ ] Implement `app/(app)/(tabs)/week.tsx`
  - Week avg BigNum, date range label, ±delta vs last week
  - 7-bar chart — View components, proportional height, best day amber
  - By-bracket table (identity/execution/outcomes/penalty avg this week vs last)
  - Day-by-day list (date + score rows) → tap opens week-day modal
- [ ] Implement `app/(app)/(tabs)/trends.tsx`
  - Range picker: 30D / 90D / 1Y
  - Sparkline — View-based mini bar chart row
  - Calendar heatmap — grid of View cells colored by score intensity
  - Habit consistency bars — per-habit fill bar
  - Empty state if < 7 days of data
- [ ] Create `app/(app)/modal/week-day/[date].tsx` — single day detail (scores by bracket + reflection)

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 6 — MIRROR Tab

**Goal**: Daily photo capture and gallery.

### Tasks

- [ ] Install packages: `expo-camera expo-image-picker expo-file-system`
- [ ] Create `src/features/mirror/use-mirror.ts` — fetch mirror_photos list for current user
- [ ] Create `src/features/mirror/upload-photo.ts` — upload to Supabase Storage bucket `mirror-photos`, insert mirror_photos row
- [ ] Implement `app/(app)/(tabs)/mirror.tsx`
  - "CAPTURE +" button → opens mirror-capture modal
  - Grid/list of past photos (4:5 portrait thumbnails, date + score label)
  - Tap → opens mirror-day/[date] modal
- [ ] Create `app/(app)/modal/mirror-capture.tsx` — camera UI (front-facing, capture, confirm, upload)
- [ ] Create `app/(app)/modal/mirror-day/[date].tsx` — fullscreen photo + score card overlay

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 7 — YOU Tab + Edit Modals

**Goal**: Profile management and all edit flows.

### Tasks

- [ ] Implement `app/(app)/(tabs)/you.tsx`
  - Name + identity sentence + stats row (streak / day count / lifetime avg)
  - YOUR IDENTITY section: identity sentence (tap → edit-identity-sentence modal)
  - HABITS & SCORING: links → edit-habits (identity), edit-habits (execution), edit-outcomes, edit-penalties
  - INTEGRATIONS: Whoop connected/disconnected toggle (stub)
  - ACCOUNT: subscription (→ paywall), notifications (→ notification-settings), privacy (→ privacy-data), sign out (→ signout-confirm)
- [ ] Create `app/(app)/modal/edit-identity-sentence.tsx`
- [ ] Create `app/(app)/modal/edit-habits.tsx` — `?type=identity|execution` param, add/remove/reorder habits
- [ ] Create `app/(app)/modal/edit-outcomes.tsx` — add/remove/reorder outcome metrics
- [ ] Create `app/(app)/modal/edit-penalties.tsx` — add/remove/reorder penalty items
- [ ] Create `app/(app)/modal/signout-confirm.tsx`
- [ ] Create `app/(app)/modal/notification-settings.tsx`

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 8 — Post-lock Triggers + Notifications

**Goal**: Smart flows after lock, and local notification scheduling.

### Tasks

- [ ] Install package: `expo-notifications`
- [ ] Create `src/features/notifications/schedule-reminder.ts` — `scheduleReminder(time: string)` using expo-notifications
- [ ] Call `scheduleReminder` at end of onboarding (Phase 3 step 13) and from notification-settings modal
- [ ] Add post-lock trigger logic to TODAY tab (after lockCheckin resolves):
  - Is today Sunday? → `router.push('/(app)/modal/weekly-review')`
  - Is today last day of month? → `router.push('/(app)/modal/monthly-review')`
- [ ] Create `app/(app)/modal/weekly-review.tsx` — win / challenge / next week fields + photo option
- [ ] Create `app/(app)/modal/monthly-review.tsx` — reflection + verdict fields
- [ ] Add returning-user check to TODAY tab (before checkin opens):
  - Last locked checkin > 2 days ago → `router.push('/(app)/modal/returning-user')` first
- [ ] Create `app/(app)/modal/returning-user.tsx` — "Welcome back" prompt

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Phase 9 — Stub Modals

**Goal**: All nav destinations resolve (no broken links), stubs clearly marked "coming soon."

### Tasks

- [ ] Create `app/(app)/modal/paywall.tsx` — "Coming soon" screen
- [ ] Create `app/(app)/modal/manage-subscription.tsx` — stub
- [ ] Create `app/(app)/modal/privacy-data.tsx` — stub (data export / delete account links as text only)
- [ ] Create `app/(app)/modal/whoop-connect.tsx` — stub ("Whoop integration coming soon")

### Notes
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
_Add notes during implementation here_

---

## Decisions Log

<<<<<<< HEAD
| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-01 | StyleSheet for HMC components, not NativeWind | Simpler to debug for first-time Expo dev |
| 2026-05-01 | Skip react-native-svg — use View-based charts | Not bundled in Expo Go SDK 54 |
| 2026-05-01 | Skip react-native-purchases — paywall stub | Native module, not needed for MVP |
| 2026-05-01 | expo-font + Google Fonts for Inter + JetBrains Mono | Standard Expo approach, works in Expo Go |
| 2026-05-01 | perf_9to5 folded into execution_score for lock_checkin RPC | RPC signature takes 4 bracket scores; perf_9to5 stored separately via upsert |
| 2026-05-01 | Profile state in Zustand store (profile-store.ts) | Needs onboarding_completed for routing; avoids extra query on every nav guard |
=======
| Date       | Decision                                                   | Reason                                                                        |
| ---------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 2026-05-01 | StyleSheet for HMC components, not NativeWind              | Simpler to debug for first-time Expo dev                                      |
| 2026-05-01 | Skip react-native-svg — use View-based charts              | Not bundled in Expo Go SDK 54                                                 |
| 2026-05-01 | Skip react-native-purchases — paywall stub                 | Native module, not needed for MVP                                             |
| 2026-05-01 | expo-font + Google Fonts for Inter + JetBrains Mono        | Standard Expo approach, works in Expo Go                                      |
| 2026-05-01 | perf_9to5 folded into execution_score for lock_checkin RPC | RPC signature takes 4 bracket scores; perf_9to5 stored separately via upsert  |
| 2026-05-01 | Profile state in Zustand store (profile-store.ts)          | Needs onboarding_completed for routing; avoids extra query on every nav guard |
>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555

---

## Agent Handoff Notes

When picking up this project:
<<<<<<< HEAD
=======

>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
1. Read `CLAUDE.md` first — full architecture reference
2. Check Phase Status table above for current state
3. Check the Notes section under each in-progress phase for context
4. Run `expo start` in `/Users/dzmitrypiskun/Documents/mobile-app/test-app` to verify current state
5. Run `npx tsc --noEmit` to check TypeScript errors before proceeding
