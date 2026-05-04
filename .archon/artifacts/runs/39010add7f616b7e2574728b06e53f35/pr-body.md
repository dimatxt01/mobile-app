## Summary

Three coordinated changes to the weekly review and navigation:

- **Remove Mirror tab** — deletes Mirror tab and all related screens, hooks, and feature files; navigation is now 4 tabs (TODAY / WEEK / MONTH / YOU)
- **Weekly review photo upload** — weekly review modal now loads existing data, supports read-only mode, and allows selecting/uploading photos saved to `photo_urls`
- **Active check-up highlighting** — WEEK tab pins the current week's check-up at the top of the list, highlighted in `danger` red when today is Sunday

## Changes

| File | Action | Description |
|------|--------|-------------|
| `app/(app)/(tabs)/mirror.tsx` | DELETE | Mirror tab screen removed |
| `app/(app)/modal/mirror-capture.tsx` | DELETE | Mirror capture modal removed |
| `app/(app)/modal/mirror-day/[date].tsx` | DELETE | Mirror day view removed |
| `src/features/mirror/use-mirror.ts` | DELETE | Mirror photos query hook removed |
| `src/features/mirror/upload-photo.ts` | DELETE | Mirror photo upload removed |
| `__tests__/upload-photo.test.ts` | DELETE | Mirror upload tests removed |
| `app/(app)/(tabs)/_layout.tsx` | UPDATE | Remove `mirror` Tabs.Screen entry (4 tabs remain) |
| `app/(app)/(tabs)/profile.tsx` | UPDATE | Remove mirror gallery section, unused imports |
| `app/(app)/(tabs)/week.tsx` | UPDATE | Pin current check-up first; danger-red on Sunday |
| `app/(app)/modal/weekly-review.tsx` | UPDATE | Complete rewrite: data loading, readOnly mode, photo strip |
| `supabase/migrations/0009_weekly_review_storage.sql` | CREATE | `weekly-review-photos` storage bucket + RLS policies |
| `src/features/weekly-review/upload-weekly-photo.ts` | CREATE | Photo upload function (fetch blob → Supabase Storage) |
| `__tests__/upload-weekly-photo.test.ts` | CREATE | 4 tests covering upload success, errors, path format |

## Tests

| Test File | Test Cases |
|-----------|------------|
| `__tests__/upload-weekly-photo.test.ts` | uploads blob and returns public URL on success; returns error when fetch fails; returns error when storage upload fails; constructs correct storage path with index |

**43 tests pass across 7 suites** — no regressions.

## Validation

- [x] Type check passes (`npm run typecheck` — 0 errors)
- [x] Lint passes (`npm run lint` — 0 errors, 10 pre-existing warnings)
- [x] Format passes (`npx prettier --check .`)
- [x] All tests pass (43 passed, 0 failed)
- [x] Build succeeds (`npx expo export --platform ios` — 5.3MB iOS bundle)
- [x] No dangling mirror imports (`grep` checks — CLEAN)

## Implementation Notes

### Intentionally Excluded (Not Bugs)

- `mirror_photos` DB table: UI removed but data and `MirrorPhoto` type in `database.ts` retained — destructive migration deferred
- Camera capture for weekly photos: uses image picker (camera roll), not live camera
- Monthly review photos: `monthly_reviews.cover_photo_url` is a separate field — not touched

### Deviations from Plan

1. **profile.tsx cleanup** — also removed `Image`, `Dimensions` imports and `SCREEN_WIDTH` constant that became unused after mirror gallery removal (avoids TS/lint errors)
2. **Countdown eyebrow removed** — the redundant "NEXT WEEKLY CHECK-UP IN" eyebrow was dropped since the parent section already carries "WEEKLY CHECK-UPS"; contextually clear without it

---

**Plan**: `.archon/artifacts/runs/39010add7f616b7e2574728b06e53f35/plan.md`
**Workflow ID**: `39010add7f616b7e2574728b06e53f35`
