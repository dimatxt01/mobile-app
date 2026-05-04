# Plan Context

**Generated**: 2026-05-03 00:00
**Workflow ID**: ba233d4d5045889914f928f692af888a
**Plan Source**: `.archon/artifacts/runs/ba233d4d5045889914f928f692af888a/plan.md`

---

## Branch

| Field      | Value                          |
| ---------- | ------------------------------ |
| **Branch** | `archon/thread-20506dcf`       |
| **Base**   | `main`                         |
| **Repo**   | `dimatxt01/mobile-app`         |

---

## Plan Summary

**Title**: Feature: Weekly Check-Up Redesign + Mirror Tab Cleanup

**Overview**: Redesign the weekly check-up flow to support photo uploads and active-state highlighting, while removing the dedicated mirror tab from navigation and consolidating mirror photo access into the profile tab via a new modal. The `weekly_reviews.photo_urls text[]` column and TypeScript type already exist; only a new storage bucket, upload function, and UI wiring are needed.

---

## Files to Change

| File                                                   | Action |
| ------------------------------------------------------ | ------ |
| `supabase/migrations/0009_hmc_weekly_photos.sql`       | CREATE |
| `src/features/reviews/upload-weekly-photo.ts`          | CREATE |
| `app/(app)/modal/mirror-gallery.tsx`                   | CREATE |
| `app/(app)/modal/weekly-review.tsx`                    | UPDATE |
| `app/(app)/(tabs)/_layout.tsx`                         | UPDATE |
| `app/(app)/(tabs)/mirror.tsx`                          | DELETE |
| `app/(app)/(tabs)/profile.tsx`                         | UPDATE |
| `app/(app)/(tabs)/week.tsx`                            | UPDATE |

---

## NOT Building (Scope Limits)

**CRITICAL FOR REVIEWERS**: These items are **intentionally excluded** from scope. Do NOT flag them as bugs or missing features.

- **Monthly review photo support** — `monthly_reviews.cover_photo_url` is out of scope
- **Editing past weekly reviews** — read-only view only; no retroactive editing
- **Mirror photo deletion** — not in requirements
- **Mirror capture from daily submission CTA** — currently works via day-complete modal → not touched
- **Weekly avg auto-calculation** — `weekly_avg` column exists but not auto-computed; leave null
- **Photo reordering** — photos added in order; no drag-to-reorder

---

## Validation Commands

```bash
# Level 1: Static analysis
npm run typecheck && npm run lint

# Level 2: No leftover tab/mirror references
grep -r "/(tabs)/mirror" app/

# Level 3: File checks
ls app/(app)/(tabs)/mirror.tsx 2>&1 | grep "No such file"
ls app/(app)/modal/mirror-gallery.tsx
ls src/features/reviews/upload-weekly-photo.ts
ls supabase/migrations/0009_hmc_weekly_photos.sql
```

**EXPECT**: Level 1 exits 0. Level 2 zero matches. Level 3 all files present (except deleted mirror.tsx).

---

## Acceptance Criteria

- [ ] Weekly check-up modal shows "PHOTOS OF THE WEEK" section with ImagePicker
- [ ] Saving a weekly review with photos persists URLs to `weekly_reviews.photo_urls`
- [ ] Past weekly reviews open in read-only mode (params respected)
- [ ] Active (incomplete) weekly check-up shows as red row pinned to top of WEEK tab review list
- [ ] Mirror tab (`app/(app)/(tabs)/mirror.tsx`) is deleted; no entry in `_layout.tsx`
- [ ] Profile "VIEW ALL →" navigates to `mirror-gallery` modal (not a tab route)
- [ ] Mirror capture flow from day-complete or profile tab is unaffected
- [ ] Mirror photos still visible in profile horizontal scroll
- [ ] `npm run typecheck` exits 0
- [ ] Tab bar shows exactly 4 tabs: TODAY | WEEK | MONTH | YOU

---

## Patterns to Mirror

| Pattern              | Source File                                    | Notes                                           |
| -------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Upload function      | `src/features/mirror/upload-photo.ts`          | Discriminated union return; blob fetch + upload  |
| Storage migration    | `supabase/migrations/0005_hmc_mirror.sql`      | Bucket creation + RLS policies pattern           |
| Active row style     | `app/(app)/(tabs)/week.tsx:381–397`            | `reviewRow` — extend with danger variant         |
| Modal param reading  | `app/(app)/modal/mirror-day/[date].tsx`        | `useLocalSearchParams` pattern                   |
| TanStack Query load  | `app/(app)/(tabs)/week.tsx:35–54`              | `useQuery` for loading specific week's review    |
| Mirror gallery UI    | `app/(app)/(tabs)/mirror.tsx`                  | Copy almost verbatim for mirror-gallery modal    |

---

## Task Order (Sequential)

1. **Task 1**: Install `expo-image-picker` — `npx expo install expo-image-picker`
2. **Task 2**: CREATE `supabase/migrations/0009_hmc_weekly_photos.sql` — storage bucket + RLS
3. **Task 3**: CREATE `src/features/reviews/upload-weekly-photo.ts` — upload function
4. **Task 4**: CREATE `app/(app)/modal/mirror-gallery.tsx` — gallery modal
5. **Task 5A**: UPDATE `app/(app)/(tabs)/_layout.tsx` — remove mirror Tabs.Screen entry
6. **Task 5B**: DELETE `app/(app)/(tabs)/mirror.tsx` — AFTER _layout.tsx updated
7. **Task 6**: UPDATE `app/(app)/(tabs)/profile.tsx` — fix VIEW ALL → link to modal route
8. **Task 7**: UPDATE `app/(app)/modal/weekly-review.tsx` — add photos + read/write modes
9. **Task 8**: UPDATE `app/(app)/(tabs)/week.tsx` — active check-up highlighting

**Critical ordering note**: Task 5A (_layout.tsx update) MUST happen before Task 5B (file deletion) to avoid Expo Router errors.

---

## Key Technical Notes

- `weekly_reviews.photo_urls text[]` **already exists** in migration 0006 and TypeScript type — no schema column change needed.
- The `readOnly` param was already being passed from `week.tsx:250` to `weekly-review.tsx` but silently ignored — Task 7 wires it up.
- Mirror tab was already hidden (`href: null`) but still existed as a route — this plan fully removes it.
- Use `npx expo install` (not `npm install`) for `expo-image-picker` to get the SDK 54-compatible version.
- `ImagePicker.MediaTypeOptions` may be deprecated in newer SDKs — use whichever TypeScript surfaces as correct.
- Photo upload uses `upsert: false` since each photo has a unique timestamp path.
- Storage path for weekly photos: `{userId}/{weekStart}/{timestamp}.jpg`
- Photo thumb size: 80×100 (portrait, matching mirror style)
- Max photos per weekly review: 5

---

## Next Steps

1. `archon-confirm-plan` — Verify patterns still exist in referenced files
2. `archon-implement-tasks` — Execute the 8 tasks in order
3. `archon-validate` — Run full validation suite
4. `archon-finalize-pr` — Create PR and mark ready
