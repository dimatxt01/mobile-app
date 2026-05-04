# Feature: Weekly Check-Up Redesign + Mirror Tab Cleanup

## Summary

Redesign the weekly check-up flow to support photo uploads and active-state highlighting, while removing the dedicated mirror tab from navigation and consolidating mirror photo access into the profile tab. The DB column (`photo_urls text[]`) and TypeScript type already exist in `weekly_reviews`; only a new storage bucket and UI wiring are needed.

## User Story

As a daily HMC user
I want to add photos to my weekly check-up, always see when my check-up is incomplete, and access mirror photos from my profile without a dedicated tab
So that my weekly reflection is richer and the navigation is cleaner

## Problem Statement

1. The weekly check-up modal is bare — no photo support despite the `photo_urls` column existing in the DB.
2. No visual indicator in the WEEK tab when the current week's check-up is overdue/incomplete.
3. The mirror tab is listed in navigation (as a hidden route) but never shown — dead code that confuses routing. The profile "VIEW ALL →" button points to the hidden tab route.
4. The weekly-review modal accepts `readOnly`, `weekStart`, `weekEnd` params from `week.tsx:248–254` but silently ignores them — past reviews open in write mode.

## Solution Statement

1. Install `expo-image-picker`, create storage bucket `weekly-review-photos` (migration 0009), add upload function, wire photo picking + display into the weekly-review modal.
2. Compute current week's status in `week.tsx` and pin an active "IN PROGRESS" row at the top of the reviews list with red styling when incomplete.
3. Delete `app/(app)/(tabs)/mirror.tsx`, remove it from `_layout.tsx`, create `app/(app)/modal/mirror-gallery.tsx`, update `profile.tsx` to link there.
4. Fix weekly-review modal to read route params and load/display existing data in read-only or pre-populated write mode.

## Metadata

| Field            | Value                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Type             | ENHANCEMENT                                                                |
| Complexity       | MEDIUM                                                                     |
| Systems Affected | week tab, weekly-review modal, mirror tab/modal, profile tab, supabase storage |
| Dependencies     | expo-image-picker (needs install), expo-image-picker SDK 54                |
| Estimated Tasks  | 8                                                                          |

---

## UX Design

### Before State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              BEFORE STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  WEEK TAB                                                                     ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  ... bar charts, bracket comparison, day-by-day ...           │            ║
║  │                                                               │            ║
║  │  [WEEKLY CHECK-UP →]  (Sunday only)                          │            ║
║  │  or  "NEXT CHECK-UP IN N DAYS" countdown                      │            ║
║  │                                                               │            ║
║  │  PAST WEEKLY REVIEWS (only if reviews exist)                  │            ║
║  │  ┌──────────────────────────────────────┐                    │            ║
║  │  │ WK OF MAY 4   "big win text"    avg  │  ← opens write mode│            ║
║  │  │ WK OF APR 27  "big win text"    avg  │    (params ignored) │            ║
║  │  └──────────────────────────────────────┘                    │            ║
║  │  No indication if CURRENT week is incomplete                  │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  WEEKLY CHECK-UP MODAL                                                        ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  WEEKLY REVIEW                                                │            ║
║  │  [Big win this week ____________]                             │            ║
║  │  [Biggest challenge ____________]                             │            ║
║  │  [Intention for next week _______]                            │            ║
║  │  No photo upload support                                      │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  PROFILE TAB                                                                  ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  MIRROR section                                               │            ║
║  │  [VIEW ALL →]  → routes to hidden tab /(app)/(tabs)/mirror    │            ║
║  │  [CAPTURE +]   → mirror-capture modal                         │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  TAB BAR: TODAY | WEEK | MONTH | YOU  (mirror hidden but still a route)       ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                               AFTER STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  WEEK TAB                                                                     ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  ... bar charts, bracket comparison, day-by-day ...           │            ║
║  │                                                               │            ║
║  │  [WEEKLY CHECK-UP →]  (Sunday + not yet completed)           │            ║
║  │  or countdown (other days)                                    │            ║
║  │                                                               ║            ║
║  │  WEEKLY REVIEWS (always shown if active or past reviews exist)│            ║
║  │  ┌──────────────────────────────────────┐                    │            ║
║  │  │ ██ THIS WEEK · IN PROGRESS  →  ████  │ ← RED, pinned top  │            ║
║  │  │    (dangerMuted bg, danger border)    │   (if incomplete)  │            ║
║  │  ├──────────────────────────────────────┤                    │            ║
║  │  │ WK OF MAY 4   "big win"       avg    │ ← read-only view   │            ║
║  │  │ WK OF APR 27  "big win"       avg    │   (params respected)│            ║
║  │  └──────────────────────────────────────┘                    │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  WEEKLY CHECK-UP MODAL (write mode)                                           ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  WEEKLY CHECK-UP                                              │            ║
║  │  [Big win this week ____________]                             │            ║
║  │  [Biggest challenge ____________]                             │            ║
║  │  [Intention for next week _______]                            │            ║
║  │                                                               │            ║
║  │  PHOTOS OF THE WEEK                                           │            ║
║  │  [photo] [photo] [+ADD]   (up to 5, horizontal scroll)       │            ║
║  │                                                               │            ║
║  │  [SAVE]  [SKIP]                                               │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  WEEKLY CHECK-UP MODAL (read-only mode — past review)                         ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  WK OF MAY 4–10                                               │            ║
║  │  Big win: {text}                                              │            ║
║  │  Challenge: {text}                                            │            ║
║  │  Intention: {text}                                            │            ║
║  │  [photo] [photo] (horizontal scroll, no editing)              │            ║
║  │  [CLOSE]                                                      │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  PROFILE TAB                                                                  ║
║  ┌───────────────────────────────────────────────────────────────┐            ║
║  │  MIRROR section                                               │            ║
║  │  [VIEW ALL →]  → routes to modal/mirror-gallery               │            ║
║  │  [CAPTURE +]   → mirror-capture modal (unchanged)             │            ║
║  └───────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  TAB BAR: TODAY | WEEK | MONTH | YOU  (mirror route fully removed)            ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes

| Location                                     | Before                                       | After                                                     | User Impact                                 |
| -------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `week.tsx` — reviews section                 | Hidden when no reviews; no active indicator  | Always shows section; active week pinned in red at top    | Always know if check-up is pending          |
| `week.tsx:247–254` — past review tap         | Opens weekly-review in write mode (params ignored) | Opens weekly-review in read-only mode                | Past reviews actually read-only             |
| `weekly-review.tsx` — form                   | 3 text fields only                           | 3 text fields + photo picker + photos display             | Can attach up to 5 photos to weekly review  |
| `profile.tsx:224` — VIEW ALL →               | Routes to hidden tab `/(app)/(tabs)/mirror`  | Routes to `/(app)/modal/mirror-gallery`                   | No broken/hidden routes                     |
| `_layout.tsx`                                | Mirror tab entry with `href: null`           | Mirror tab entry removed entirely                         | Cleaner navigation graph                    |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these files before starting any task:**

| Priority | File                                                          | Lines    | Why Read This                                 |
| -------- | ------------------------------------------------------------- | -------- | --------------------------------------------- |
| P0       | `src/features/mirror/upload-photo.ts`                         | all      | Pattern to MIRROR exactly for new upload fn   |
| P0       | `app/(app)/modal/weekly-review.tsx`                           | all      | File being modified — understand current state |
| P0       | `app/(app)/(tabs)/week.tsx`                                   | 234–275  | Past reviews section to be extended           |
| P0       | `app/(app)/(tabs)/mirror.tsx`                                 | all      | Content to be moved to mirror-gallery modal   |
| P1       | `src/types/database.ts`                                       | 284–326  | WeeklyReview type — photo_urls already exists  |
| P1       | `src/lib/hmc-colors.ts`                                       | all      | danger, dangerMuted, colors for red highlight  |
| P1       | `app/(app)/(tabs)/profile.tsx`                                | 219–255  | Mirror section with VIEW ALL → link to update |
| P1       | `app/(app)/(tabs)/_layout.tsx`                                | all      | Tab layout — mirror entry to remove           |
| P2       | `supabase/migrations/0005_hmc_mirror.sql`                     | all      | Pattern for storage bucket + RLS policies     |
| P2       | `supabase/migrations/0006_hmc_reviews.sql`                    | all      | Confirms photo_urls column already exists     |
| P2       | `app/(app)/modal/mirror-capture.tsx`                          | all      | Shows how expo-camera was used — note pattern |

---

## Patterns to Mirror

**UPLOAD_FUNCTION:**

```typescript
// SOURCE: src/features/mirror/upload-photo.ts:1-47
// COPY THIS PATTERN — discriminated union return, bucket + upsert:
export async function uploadMirrorPhoto(
  userId: string,
  localUri: string,
  date: string,
  dayNumber: number,
  checkinId?: string,
): Promise<{ data: MirrorPhoto | null; error: Error | null }> {
  const storagePath = `${userId}/${date}.jpg`;
  let blob: Blob;
  try {
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Failed to read image file') };
  }
  const { error: uploadError } = await supabase.storage
    .from('mirror-photos')
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) return { data: null, error: uploadError };
  // ...getPublicUrl + upsert to DB table...
}
```

**STORAGE_MIGRATION:**

```sql
-- SOURCE: supabase/migrations/0005_hmc_mirror.sql
-- COPY THIS PATTERN for new bucket:
insert into storage.buckets (id, name, public) values ('mirror-photos', 'mirror-photos', true)
  on conflict do nothing;
create policy "mirror_storage_select" on storage.objects
  for select using (bucket_id = 'mirror-photos' and auth.uid()::text = (storage.foldername(name))[1]);
```

**REVIEW_ROW_STYLE (for active highlighting):**

```typescript
// SOURCE: week.tsx:381–397 — reviewRow pattern
// EXTEND with danger variant:
reviewRowActive: {
  ...reviewRow styles...,
  backgroundColor: colors.dangerMuted,
  borderColor: colors.danger,
  borderWidth: StyleSheet.hairlineWidth,
  borderRadius: radius.sm,
},
```

**MODAL_PARAM_READING:**

```typescript
// SOURCE: app/(app)/modal/mirror-day/[date].tsx (pattern)
// Read params at component top:
import { useLocalSearchParams } from 'expo-router';
const { readOnly, weekStart, weekEnd } = useLocalSearchParams<{
  readOnly?: string;
  weekStart?: string;
  weekEnd?: string;
}>();
const isReadOnly = readOnly === '1';
```

**TANSTACK_QUERY (for loading existing review):**

```typescript
// SOURCE: app/(app)/(tabs)/week.tsx:35–54
// COPY THIS PATTERN for loading a specific week's review:
const { data: existingReview } = useQuery({
  queryKey: ['weekly-review', user?.id, weekStart],
  queryFn: async () => {
    const { data } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user!.id)
      .eq('week_start', weekStart)
      .maybeSingle();
    return data as WeeklyReview | null;
  },
  enabled: !!user && !!weekStart,
});
```

---

## Files to Change

| File                                                              | Action  | Justification                                                    |
| ----------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `supabase/migrations/0009_hmc_weekly_photos.sql`                  | CREATE  | Storage bucket + RLS for weekly-review-photos                    |
| `src/features/reviews/upload-weekly-photo.ts`                     | CREATE  | Upload fn for weekly review photos (mirrors upload-photo.ts)     |
| `app/(app)/modal/mirror-gallery.tsx`                              | CREATE  | Full-screen mirror gallery as modal (replaces tab screen)        |
| `app/(app)/modal/weekly-review.tsx`                               | UPDATE  | Add photo section + read/write mode via route params             |
| `app/(app)/(tabs)/_layout.tsx`                                    | UPDATE  | Remove mirror tab Tabs.Screen entry                              |
| `app/(app)/(tabs)/mirror.tsx`                                     | DELETE  | Content moved to mirror-gallery modal                            |
| `app/(app)/(tabs)/profile.tsx`                                    | UPDATE  | VIEW ALL → link from tab route to modal route                    |
| `app/(app)/(tabs)/week.tsx`                                       | UPDATE  | Active check-up row (pinned, red) + fix read-only nav params     |

---

## NOT Building (Scope Limits)

- **Monthly review photo support** — monthly_reviews.cover_photo_url is out of scope
- **Editing past weekly reviews** — read-only view only; no retroactive editing
- **Mirror photo deletion** — not in requirements
- **Mirror capture from daily submission CTA** — currently works via day-complete modal → not touched
- **Weekly avg auto-calculation** — `weekly_avg` column exists but not auto-computed; leave null
- **Photo reordering** — photos added in order; no drag-to-reorder

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

---

### Task 1: Install expo-image-picker

- **ACTION**: Run install command
- **IMPLEMENT**: `npx expo install expo-image-picker`
- **GOTCHA**: Must use `npx expo install` (not `npm install`) to get the SDK 54-compatible version
- **VALIDATE**: Check that `expo-image-picker` appears in `package.json` dependencies after install

---

### Task 2: CREATE `supabase/migrations/0009_hmc_weekly_photos.sql`

- **ACTION**: CREATE new migration file
- **IMPLEMENT**: Create the `weekly-review-photos` storage bucket with RLS policies
- **MIRROR**: `supabase/migrations/0005_hmc_mirror.sql` — follow exact same bucket + policy pattern
- **NOTE**: The `weekly_reviews.photo_urls text[]` column already exists in migration 0006; this migration is ONLY for the storage bucket
- **CONTENT**:

```sql
-- ============================================================
-- HMC — Storage bucket for weekly check-up photos
-- Generated: 2026-05-03
-- NOTE: weekly_reviews.photo_urls column already exists (0006)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('weekly-review-photos', 'weekly-review-photos', true)
on conflict do nothing;

create policy "weekly_review_photos_select" on storage.objects
  for select using (
    bucket_id = 'weekly-review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "weekly_review_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'weekly-review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "weekly_review_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'weekly-review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

- **VALIDATE**: File exists at `supabase/migrations/0009_hmc_weekly_photos.sql`

---

### Task 3: CREATE `src/features/reviews/upload-weekly-photo.ts`

- **ACTION**: CREATE new file (create `src/features/reviews/` directory if needed)
- **IMPLEMENT**: Upload a single photo to `weekly-review-photos` bucket and return the public URL
- **MIRROR**: `src/features/mirror/upload-photo.ts` — same pattern exactly
- **IMPORTS**: `supabase` from `@/lib/supabase`
- **RETURNS**: `Promise<{ data: string | null; error: Error | null }>` — returns public URL string (not a DB row, because photo_urls is updated in a batch upsert from the modal, not per-photo)
- **STORAGE PATH**: `{userId}/{weekStart}/{timestamp}.jpg` — allows multiple photos per week
- **CONTENT**:

```typescript
import { supabase } from '@/lib/supabase';

export async function uploadWeeklyPhoto(
  userId: string,
  localUri: string,
  weekStart: string,
): Promise<{ data: string | null; error: Error | null }> {
  const timestamp = Date.now();
  const storagePath = `${userId}/${weekStart}/${timestamp}.jpg`;

  let blob: Blob;
  try {
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Failed to read image file') };
  }

  const { error: uploadError } = await supabase.storage
    .from('weekly-review-photos')
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: false });
  if (uploadError) return { data: null, error: uploadError };

  const {
    data: { publicUrl },
  } = supabase.storage.from('weekly-review-photos').getPublicUrl(storagePath);

  return { data: publicUrl, error: null };
}
```

- **VALIDATE**: TypeScript compiles — `npm run typecheck` passes

---

### Task 4: CREATE `app/(app)/modal/mirror-gallery.tsx`

- **ACTION**: CREATE new file
- **IMPLEMENT**: Full-screen mirror photo gallery as a modal (near-identical to `mirror.tsx` but with close button + modal-appropriate padding)
- **MIRROR**: `app/(app)/(tabs)/mirror.tsx` — copy almost verbatim
- **KEY DIFFERENCES from mirror.tsx**:
  - Add `useSafeAreaInsets` for top padding (no tab bar offset needed)
  - Add a close/back button ("← BACK" or "✕" in top-right) that calls `router.back()`
  - Remove `export default function MirrorScreen()` → rename to `export default function MirrorGalleryModal()`
- **IMPORTS**: Same as mirror.tsx + `router` from `expo-router`
- **VALIDATE**: File exists; no TypeScript errors

---

### Task 5: UPDATE `app/(app)/(tabs)/_layout.tsx` + DELETE `app/(app)/(tabs)/mirror.tsx`

**Part A — Remove mirror tab from `_layout.tsx`:**
- **ACTION**: UPDATE existing file
- **IMPLEMENT**: Remove the `<Tabs.Screen name="mirror" options={{ href: null }} />` line entirely
- **FILE**: `app/(app)/(tabs)/_layout.tsx`
- **CHANGE** (line 12 — the hidden mirror route):

```typescript
// REMOVE this line:
<Tabs.Screen name="mirror" options={{ href: null }} />
```

**Part B — Delete `app/(app)/(tabs)/mirror.tsx`:**
- **ACTION**: DELETE file
- **IMPLEMENT**: `rm app/(app)/(tabs)/mirror.tsx`
- **GOTCHA**: The file must be deleted AFTER Part A; Expo Router will throw an error if a registered tab route's file is missing
- **VALIDATE**: `app/(app)/(tabs)/mirror.tsx` no longer exists; `_layout.tsx` has 4 `Tabs.Screen` entries only (index, week, month, profile)

---

### Task 6: UPDATE `app/(app)/(tabs)/profile.tsx` — Fix VIEW ALL → link

- **ACTION**: UPDATE existing file
- **IMPLEMENT**: Change the mirror gallery navigation from the hidden tab route to the new modal
- **FILE**: `app/(app)/(tabs)/profile.tsx`, line 224
- **CHANGE**:

```typescript
// BEFORE:
<TouchableOpacity onPress={() => router.push('/(app)/(tabs)/mirror')} activeOpacity={0.7}>

// AFTER:
<TouchableOpacity onPress={() => router.push('/(app)/modal/mirror-gallery')} activeOpacity={0.7}>
```

- **VALIDATE**: `npm run typecheck` passes; no references to `/(app)/(tabs)/mirror` remain in codebase (run `grep -r "/(tabs)/mirror" app/`)

---

### Task 7: UPDATE `app/(app)/modal/weekly-review.tsx` — Add photos + read/write modes

- **ACTION**: UPDATE existing file (complete rewrite of this modal)
- **IMPLEMENT**:

**A. Read route params:**
```typescript
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
const { readOnly, weekStart: paramWeekStart, weekEnd: paramWeekEnd } = useLocalSearchParams<{
  readOnly?: string; weekStart?: string; weekEnd?: string;
}>();
const isReadOnly = readOnly === '1';
```

**B. Calculate week boundaries (reuse existing logic, but use params when provided):**
```typescript
const now = new Date();
const dayOfWeek = now.getDay();
const computedWeekStart = new Date(now);
computedWeekStart.setDate(now.getDate() - dayOfWeek);
const weekStart = paramWeekStart ?? computedWeekStart.toISOString().slice(0, 10);
const computedWeekEnd = new Date(computedWeekStart);
computedWeekEnd.setDate(computedWeekStart.getDate() + 6);
const weekEnd = paramWeekEnd ?? computedWeekEnd.toISOString().slice(0, 10);
```

**C. Load existing review data (for pre-population and read-only view):**
```typescript
const { data: existingReview } = useQuery({
  queryKey: ['weekly-review', user?.id, weekStart],
  queryFn: async () => {
    const { data } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user!.id)
      .eq('week_start', weekStart)
      .maybeSingle();
    return data as WeeklyReview | null;
  },
  enabled: !!user && !!weekStart,
});
```

**D. Pre-populate state when existingReview loads:**
```typescript
useEffect(() => {
  if (!existingReview) return;
  setWin(existingReview.win ?? '');
  setChallenge(existingReview.challenge ?? '');
  setNextWeek(existingReview.next_week ?? '');
  setSavedPhotoUrls(existingReview.photo_urls ?? []);
}, [existingReview]);
```

**E. Photo state:**
```typescript
const [localPhotoUris, setLocalPhotoUris] = useState<string[]>([]);
const [savedPhotoUrls, setSavedPhotoUrls] = useState<string[]>([]);
const MAX_PHOTOS = 5;
```

**F. Photo picker (write mode only):**
```typescript
import * as ImagePicker from 'expo-image-picker';

const handleAddPhoto = async () => {
  if (localPhotoUris.length + savedPhotoUrls.length >= MAX_PHOTOS) return;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsMultipleSelection: false,
  });
  if (!result.canceled && result.assets[0]) {
    setLocalPhotoUris(prev => [...prev, result.assets[0]!.uri]);
  }
};
```

**G. Updated save handler — upload new photos first, then upsert:**
```typescript
const handleSave = async () => {
  if (!user) return;
  setSaving(true);

  const uploadedUrls: string[] = [];
  for (const uri of localPhotoUris) {
    const { data: url, error } = await uploadWeeklyPhoto(user.id, uri, weekStart);
    if (error) { setSaving(false); Alert.alert('Upload Failed', error.message); return; }
    uploadedUrls.push(url!);
  }

  await supabase.from('weekly_reviews').upsert(
    {
      user_id: user.id,
      week_start: weekStart,
      week_end: weekEnd,
      win,
      challenge,
      next_week: nextWeek,
      photo_urls: [...savedPhotoUrls, ...uploadedUrls],
    },
    { onConflict: 'user_id,week_start' },
  );

  qc.invalidateQueries({ queryKey: ['weekly-reviews'] });
  qc.invalidateQueries({ queryKey: ['weekly-review', user.id, weekStart] });
  setSaving(false);
  router.back();
};
```

**H. Read-only view — show static text and photos:**
- When `isReadOnly`, replace TextInput fields with `<Text>` displaying existing values
- Replace "SAVE" button with "CLOSE" button (`router.back()`)
- Show all photos (savedPhotoUrls) in horizontal scroll without ADD button
- Eyebrow label: `WK OF {weekStart date formatted}` (read mode) or `WEEKLY CHECK-UP` (write mode)

**I. Photos UI section (write mode):**
```tsx
{/* PHOTOS OF THE WEEK */}
<Eyebrow label="PHOTOS OF THE WEEK" />
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}
  contentContainerStyle={{ gap: 8 }}>
  {[...savedPhotoUrls, ...localPhotoUris].map((uri, i) => (
    <Image key={i} source={{ uri }} style={styles.photoThumb} />
  ))}
  {localPhotoUris.length + savedPhotoUrls.length < MAX_PHOTOS && (
    <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
      <Text style={styles.addPhotoText}>+ ADD</Text>
    </TouchableOpacity>
  )}
</ScrollView>
```

- **IMPORTS**: Add `Image`, `Alert` from `react-native`; `useQuery`, `useQueryClient` from `@tanstack/react-query`; `* as ImagePicker` from `expo-image-picker`; `uploadWeeklyPhoto` from `@/features/reviews/upload-weekly-photo`; `WeeklyReview` type from `@/types/database`; `useEffect` from `react`
- **PHOTO THUMB SIZE**: 80×100 (portrait aspect ratio matching mirror style)
- **ADD BUTTON SIZE**: Same 80×100 with dashed border in `colors.borderMuted`, centered "+" and "ADD" text in `colors.textTertiary`
- **VALIDATE**: `npm run typecheck` passes; modal opens from week.tsx in both modes

---

### Task 8: UPDATE `app/(app)/(tabs)/week.tsx` — Active check-up highlighting

- **ACTION**: UPDATE existing file
- **IMPLEMENT**:

**A. Calculate active check-up state:**
```typescript
const currentWeekStartDate = new Date(now);
currentWeekStartDate.setDate(now.getDate() - dayOfWeek); // last/current Sunday
const currentWeekStartStr = currentWeekStartDate.toISOString().slice(0, 10);
const hasCurrentWeekReview = (weeklyReviews ?? []).some(
  r => r.week_start === currentWeekStartStr
);
const isActiveCheckup = !hasCurrentWeekReview;
```

**B. Update the PAST WEEKLY REVIEWS section to show active row (lines 234–273):**
- Change section visibility: show the section if `isActiveCheckup || (weeklyReviews && weeklyReviews.length > 0)` (previously only when reviews exist)
- Pin active row at top when `isActiveCheckup`:

```tsx
{(isActiveCheckup || (weeklyReviews && weeklyReviews.length > 0)) && (
  <>
    <Rule />
    <View style={styles.section}>
      <Eyebrow label="WEEKLY REVIEWS" />

      {isActiveCheckup && (
        <TouchableOpacity
          style={[styles.reviewRow, styles.reviewRowActive]}
          onPress={() => router.push('/(app)/modal/weekly-review')}
          activeOpacity={0.7}
        >
          <View style={styles.reviewLeft}>
            <Text style={[styles.reviewLabel, styles.reviewLabelActive]}>THIS WEEK</Text>
            <Text style={styles.reviewStatusText}>IN PROGRESS →</Text>
          </View>
        </TouchableOpacity>
      )}

      {weeklyReviews?.map((r) => (
        // ... existing review row render — no changes needed ...
      ))}
    </View>
  </>
)}
```

**C. Fix past review navigation to pass readOnly param (line 248–254):**
```typescript
// BEFORE:
router.push({
  pathname: '/(app)/modal/weekly-review',
  params: { readOnly: '1', weekStart: r.week_start, weekEnd: r.week_end },
})
// This already passes readOnly=1 — it was being IGNORED by the modal.
// Now the modal handles it (Task 7), so no change needed here.
```

**D. Add new styles:**
```typescript
reviewRowActive: {
  backgroundColor: colors.dangerMuted,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.danger,
  borderRadius: radius.sm,
  marginHorizontal: -4,
  paddingHorizontal: 12,
},
reviewLabelActive: { color: colors.danger },
reviewStatusText: {
  fontFamily: fonts.mono,
  fontSize: 10,
  letterSpacing: 1.5,
  color: colors.danger,
  marginTop: 2,
},
```

- **IMPORTS**: `radius` from `@/lib/hmc-tokens` (if not already imported — it is, line 9)
- **VALIDATE**: `npm run typecheck` passes; red active row visible when no review for current week

---

## Testing Strategy

### Manual Test Matrix

| Scenario | Expected Result |
|----------|----------------|
| Open weekly-review with no params | Write mode, empty fields, photo picker available |
| Open weekly-review with `readOnly=1, weekStart, weekEnd` params | Read-only mode, existing data displayed |
| Add 5 photos to weekly review | "+ADD" button disappears after 5th |
| Save weekly review with photos | `photo_urls` stored in DB; query invalidated |
| Week tab, no review for current week | Active "THIS WEEK / IN PROGRESS" row shows at top in red |
| Week tab, review for current week exists | No active row; normal list |
| Profile "VIEW ALL →" tap | Opens mirror-gallery modal (not a tab screen) |
| Mirror gallery modal | Shows 2-column grid, CAPTURE + button, close button |
| Profile "CAPTURE +" tap | Opens mirror-capture modal (unchanged) |
| Day-complete → mirror-capture flow | Still functional (no changes made) |
| Tab bar | 4 tabs: TODAY, WEEK, MONTH, YOU — no mirror |

### Edge Cases Checklist

- [ ] User has 0 past reviews + no active check-up (not Sunday): section hidden
- [ ] User has 0 past reviews + active check-up: section shows with just active row
- [ ] Weekly review loaded with `existingReview` has `photo_urls: []`: no photos shown
- [ ] All 5 photo slots filled: ADD button hidden, can't add more
- [ ] Photo upload fails: Alert shown, save aborted, `saving` reset to false
- [ ] Read-only mode with no photos in existing review: photo section not rendered

---

## Validation Commands

### Level 1: STATIC_ANALYSIS

```bash
npm run typecheck && npm run lint
```

**EXPECT**: Exit 0, no errors or warnings

### Level 2: GREP_CHECK (no leftover tab/mirror references)

```bash
grep -r "/(tabs)/mirror" /Users/dzmitrypiskun/.archon/workspaces/mobile-app/test-app/worktrees/archon/thread-20506dcf/app
```

**EXPECT**: Zero matches — all references to the old tab route removed

### Level 3: FILE_CHECK

```bash
# mirror.tsx must not exist:
ls app/(app)/(tabs)/mirror.tsx 2>&1 | grep "No such file"
# New modal must exist:
ls app/(app)/modal/mirror-gallery.tsx
# New upload function must exist:
ls src/features/reviews/upload-weekly-photo.ts
# Migration must exist:
ls supabase/migrations/0009_hmc_weekly_photos.sql
```

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

## Completion Checklist

- [ ] Task 1: expo-image-picker installed
- [ ] Task 2: Migration 0009 created
- [ ] Task 3: `upload-weekly-photo.ts` created and typechecks
- [ ] Task 4: `mirror-gallery.tsx` modal created
- [ ] Task 5: Mirror tab removed from `_layout.tsx`; `mirror.tsx` deleted
- [ ] Task 6: Profile VIEW ALL → link updated
- [ ] Task 7: `weekly-review.tsx` updated with photos + read/write modes
- [ ] Task 8: `week.tsx` updated with active check-up highlighting
- [ ] All validation commands pass

---

## Risks and Mitigations

| Risk                                                              | Likelihood | Impact | Mitigation                                                                                         |
| ----------------------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------- |
| Expo Go doesn't support expo-image-picker without rebuild         | LOW        | MED    | expo-image-picker works in Expo Go SDK 54; it's in the allowed list in CLAUDE.md                  |
| Deleting mirror.tsx breaks navigation before profile.tsx updated  | MED        | HIGH   | Always update `_layout.tsx` + `profile.tsx` BEFORE deleting the file (Tasks 5→6 are sequenced)    |
| `storage.foldername` not available in Supabase project version    | LOW        | MED    | If unavailable, use `(string_to_array(name, '/'))[1]` as alternative in RLS policy                |
| `useEffect` pre-population race condition (existingReview loads late) | LOW   | LOW    | `useEffect` dependency on `existingReview` handles this correctly                                  |
| Multiple photo uploads slow the save flow                         | MED        | LOW    | Sequential upload (for loop) is intentional — simpler than Promise.all, sufficient for ≤5 photos  |

---

## Notes

- `weekly_reviews.photo_urls text[]` **already exists** in migration 0006 and TypeScript type. No schema change needed beyond the storage bucket.
- The `readOnly` param in `week.tsx:250` was already being passed to `weekly-review.tsx` but silently ignored — Task 7 finally wires it up.
- The mirror tab was already hidden from the tab bar (`href: null`), but it still existed as a navigable route. This plan fully removes it and creates a proper modal replacement.
- `expo-image-picker` `MediaTypeOptions` may be deprecated in newer SDK versions in favor of `ImagePicker.MediaType.Images` — use whichever matches the installed version's types (TypeScript will surface the correct API).
- Photo upload uses `upsert: false` (not `true`) since each photo has a unique timestamp path; no overwrite needed.
