# Plan Context

**Generated**: 2026-05-03 00:00
**Workflow ID**: 39010add7f616b7e2574728b06e53f35
**Plan Source**: `.archon/artifacts/runs/39010add7f616b7e2574728b06e53f35/plan.md`

---

## Branch

| Field      | Value                    |
| ---------- | ------------------------ |
| **Branch** | `archon/thread-946d6da9` |
| **Base**   | `main`                   |

---

## Plan Summary

**Title**: Weekly Check-Up Redesign (Photos, Active Highlighting, Remove Mirror)

**Overview**: Three coordinated changes: (1) add photo upload to the weekly review modal using a new `weekly-review-photos` storage bucket (the `photo_urls text[]` DB column already exists from migration 0006); (2) always show the current week's check-up pinned at the top of the WEEK tab's reviews list, highlighted in `colors.danger` red when today is Sunday; (3) fully delete the Mirror tab and all related screens, hooks, and feature files.

---

## Files to Change

| File                                                 | Action |
| ---------------------------------------------------- | ------ |
| `supabase/migrations/0009_weekly_review_storage.sql` | CREATE |
| `src/features/weekly-review/upload-weekly-photo.ts`  | CREATE |
| `app/(app)/modal/weekly-review.tsx`                  | UPDATE |
| `app/(app)/(tabs)/week.tsx`                          | UPDATE |
| `app/(app)/(tabs)/_layout.tsx`                       | UPDATE |
| `app/(app)/(tabs)/profile.tsx`                       | UPDATE |
| `app/(app)/(tabs)/mirror.tsx`                        | DELETE |
| `app/(app)/modal/mirror-capture.tsx`                 | DELETE |
| `app/(app)/modal/mirror-day/[date].tsx`              | DELETE |
| `src/features/mirror/use-mirror.ts`                  | DELETE |
| `src/features/mirror/upload-photo.ts`                | DELETE |
| `__tests__/upload-photo.test.ts`                     | DELETE |

---

## NOT Building (Scope Limits)

**CRITICAL FOR REVIEWERS**: These items are **intentionally excluded** from scope. Do NOT flag them as bugs or missing features.

- **Dropping `mirror_photos` DB table**: The table exists in production; removing it requires a destructive migration. The UI is removed but the data stays. `MirrorPhoto` type in `database.ts` is also intentionally kept.
- **Removing `MirrorPhoto` from database.ts**: The type references a live DB table; leave it.
- **Camera capture for weekly photos**: Weekly reflection uses camera roll (image picker), not live camera. Camera is mirror-only behavior being deleted.
- **Multi-step photo upload progress**: Show a simple uploading state (boolean), no per-photo progress bars.
- **Monthly review photos**: The `monthly_reviews.cover_photo_url` is a separate field — not touched here.
- **Weekly review locking/completion flag**: No `is_complete` field added; "active" is determined solely by `isSunday` logic in week.tsx.
- **`PrintTabBar.tsx` changes**: The component already has no `mirror` entry in `TAB_LABELS` — removing the `Tabs.Screen` entry in `_layout.tsx` is sufficient.

---

## Validation Commands

```bash
# Level 1: Static analysis
npm run typecheck && npm run lint

# Level 2: Grep cleanup (both should print CLEAN)
grep -r "from '@/features/mirror" app/ src/ && echo "FOUND MIRROR IMPORT" || echo "CLEAN"
grep -r "mirror-capture\|mirror-day\|useMirror\|uploadMirrorPhoto" app/ src/ && echo "FOUND" || echo "CLEAN"

# Level 3: Build check
npx expo export --platform ios 2>&1 | tail -5
```

---

## Acceptance Criteria

- [ ] Weekly review modal loads existing data when `weekStart` param is provided
- [ ] Weekly review modal is read-only when `readOnly=1` param is set
- [ ] Weekly review modal allows selecting and uploading photos; URLs saved to `photo_urls`
- [ ] WEEK tab shows current check-up row as first item in the check-ups section
- [ ] Current check-up row is styled in `colors.danger` when `isSunday === true`
- [ ] Mirror tab is absent from navigation (4 tabs only: TODAY / WEEK / MONTH / YOU)
- [ ] Profile tab has no mirror gallery section
- [ ] Zero TypeScript errors (`npm run typecheck` exits 0)
- [ ] No dangling imports to deleted mirror modules

---

## Patterns to Mirror

| Pattern               | Source File                           | Lines   |
| --------------------- | ------------------------------------- | ------- |
| Upload function shape | `src/features/mirror/upload-photo.ts` | all     |
| Image picker usage    | `app/(app)/modal/mirror-capture.tsx`  | 44–62   |
| TanStack Query hook   | `src/features/mirror/use-mirror.ts`   | 1–22    |
| Danger-red active row | `app/(app)/(tabs)/week.tsx`           | 363–370 |
| Upsert with arrays    | `app/(app)/modal/weekly-review.tsx`   | 30–40   |
| StyleSheet structure  | `app/(app)/modal/weekly-review.tsx`   | 92–147  |

---

## Key Implementation Notes

### Task Order (execute in order — each is atomic)

1. DELETE mirror screen and modal files (`mirror.tsx`, `mirror-capture.tsx`, `mirror-day/`, `use-mirror.ts`, `upload-photo.ts`, `__tests__/upload-photo.test.ts`)
2. UPDATE `_layout.tsx` — remove the `<Tabs.Screen name="mirror" options={{ href: null }} />` line (4 tabs remain)
3. UPDATE `profile.tsx` — remove `useMirror` import, `MIRROR_THUMB` constant, mirror photos query, mirror gallery JSX section, and mirror-related styles
4. CREATE `supabase/migrations/0009_weekly_review_storage.sql` — storage bucket + RLS policies for `weekly-review-photos`
5. CREATE `src/features/weekly-review/upload-weekly-photo.ts` — upload function using `fetch(uri).blob()` pattern
6. UPDATE `app/(app)/modal/weekly-review.tsx` — complete redesign: data loading, readOnly mode, photo strip
7. UPDATE `app/(app)/(tabs)/week.tsx` — unified check-up section (current week pinned, danger red on Sunday)
8. VERIFY no dangling mirror imports (`grep` checks)

### Critical Gotchas

- `weekly_reviews.photo_urls TEXT[]` column **already exists** from migration 0006 — no column migration needed
- `storage.foldername(name)` returns 1-based Postgres array — index `[1]` is the first path segment (the userId folder)
- Storage path format must be `{userId}/{weekStart}-{index}.jpg` for the RLS policy to match
- `useLocalSearchParams()` returns strings; check `readOnly === '1'` (string comparison)
- `weekStart`/`weekEnd` may be `undefined` when opened from Sunday CTA — compute locally in that case
- Delete the entire `mirror-day/` directory, not just `[date].tsx` — empty folders confuse Expo Router
- `expo-image-picker` v55.0.19 is already installed — use `ImagePicker.MediaTypeOptions.Images` or string `'Images'`
- The `isSunday` boolean already exists in `week.tsx` line 32 — reuse it

### Storage Bucket SQL (Task 4)

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('weekly-review-photos', 'weekly-review-photos', true)
ON CONFLICT (id) DO NOTHING;
```

Plus four RLS policies (SELECT/INSERT/UPDATE/DELETE) scoped to `auth.uid()::text = (storage.foldername(name))[1]`.

### New Hook Pattern (for weekly-review.tsx data loading)

```typescript
useQuery({
  queryKey: ['weekly-review', user?.id, weekStart],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user!.id)
      .eq('week_start', weekStart!)
      .maybeSingle();
    if (error) return { data: null, error };
    return { data, error: null };
  },
  enabled: !!user && !!weekStart,
  select: (res) => res.data,
});
```

---

## Next Steps

1. `archon-confirm-plan` - Verify patterns still exist
2. `archon-implement-tasks` - Execute the 8 tasks in order
3. `archon-validate` - Run full validation suite
4. `archon-finalize-pr` - Create PR and mark ready
