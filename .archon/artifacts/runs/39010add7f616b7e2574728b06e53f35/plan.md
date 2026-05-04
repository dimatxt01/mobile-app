# Feature: Weekly Check-up Redesign (Photos, Active Highlighting, Remove Mirror)

## Summary

Three coordinated changes to the HMC app: (1) add photo upload to the weekly review modal (the DB schema column `photo_urls text[]` already exists, so we only need a new storage bucket migration + UI); (2) always show the current week's check-up as the first item in the WEEK tab's review list, highlighted in `colors.danger` red when today is Sunday (the check-up window is open); (3) fully delete the Mirror tab and all related screens, hooks, and feature files.

## User Story

As a HMC user
I want to attach photos to my weekly check-up and immediately see when my check-up is available
So that I can enrich my weekly reflection with visual context and never miss the Sunday window

## Problem Statement

The weekly review modal is a plain text form that doesn't support photos, ignores existing data when opened with params, and ignores the `readOnly` param. The WEEK tab hides the check-up CTA below the fold when it's Sunday and buries it in the countdown view on other days. The Mirror tab was built but is now out of scope.

## Solution Statement

Complete redesign of `weekly-review.tsx` to load existing data, support read-only viewing, and allow photo selection via `expo-image-picker`; update `week.tsx` to unify the check-up CTA with the past reviews list (current week pinned first, danger-red when Sunday); delete all mirror files in a single sweep.

## Metadata

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Type             | ENHANCEMENT + REFACTOR                                                  |
| Complexity       | HIGH                                                                    |
| Systems Affected | weekly-review modal, week tab, profile tab, tabs layout, mirror feature |
| Dependencies     | expo-image-picker (already installed v55.0.19), Supabase Storage        |
| Estimated Tasks  | 8                                                                       |

---

## UX Design

### Before State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              BEFORE — WEEK TAB                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌──────────────────────────────────────────────────────┐                   ║
║   │  [Week average / chart / brackets / day-by-day]      │                   ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   IF today === Sunday:                                                        ║
║   ┌──────────────────────────────────────────────────────┐                   ║
║   │  [ WEEKLY CHECK-UP → ]  ← amber-bordered CTA        │                   ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   ELSE:                                                                       ║
║   ┌──────────────────────────────────────────────────────┐                   ║
║   │  NEXT WEEKLY CHECK-UP IN / N DAYS (countdown)        │                   ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   PAST WEEKLY REVIEWS section (only if reviews exist):                        ║
║   ┌──────────────────────────────────────────────────────┐                   ║
║   │  WK OF MAY 3 · [win text preview]        [avg score]│                   ║
║   │  WK OF APR 27 · ...                      [avg score]│                   ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   PAIN_POINT: CTA is out of context; reviews and CTA are separate; no photos  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════╗
║                         BEFORE — WEEKLY REVIEW MODAL                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   WEEKLY REVIEW (always blank; ignores weekStart/weekEnd params)              ║
║   ┌──────────────────────────────────────────────────────┐                   ║
║   │  Big win this week   [ text input ]                  │                   ║
║   │  Biggest challenge   [ text input ]                  │                   ║
║   │  Intention for next week [ text input ]              │                   ║
║   └──────────────────────────────────────────────────────┘                   ║
║   [ SAVE ]   [ SKIP ]                                                         ║
║                                                                               ║
║   PAIN_POINT: no data loading, no read-only mode, no photo support            ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              AFTER — WEEK TAB                                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   [Week average / chart / brackets / day-by-day — unchanged]                 ║
║                                                                               ║
║   WEEKLY CHECK-UPS section (always rendered):                                 ║
║                                                                               ║
║   IF today === Sunday (check-up window open):                                 ║
║   ┌──────────────────────────────────────────────────────┐  ←─ PINNED FIRST  ║
║   │ ▐█ CURRENT WEEK · WK OF MAY 3          [OPEN →]     │  danger red border ║
║   │    "Check-up available now"                          │  + danger text     ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   IF today !== Sunday (countdown):                                            ║
║   ┌──────────────────────────────────────────────────────┐  ←─ PINNED FIRST  ║
║   │  NEXT CHECK-UP IN  N DAYS               [countdown] │  normal styling    ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   Past reviews (below current-week row):                                      ║
║   │  WK OF APR 27 · [win preview]           [avg score]│                    ║
║   │  WK OF APR 20 · ...                     [avg score]│                    ║
║                                                                               ║
║   VALUE_ADD: active check-up is always visible at the top, red = urgent       ║
╚═══════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════╗
║                         AFTER — WEEKLY REVIEW MODAL                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   WEEKLY REVIEW (loads existing data; read-only if readOnly=1 param)          ║
║   ┌──────────────────────────────────────────────────────┐                   ║
║   │  Big win this week   [ pre-filled / read-only ]      │                   ║
║   │  Biggest challenge   [ pre-filled / read-only ]      │                   ║
║   │  Intention for next week [ pre-filled / read-only ]  │                   ║
║   └──────────────────────────────────────────────────────┘                   ║
║                                                                               ║
║   PICTURES OF THE WEEK                                                        ║
║   ┌────┐ ┌────┐ ┌──────────────┐                                             ║
║   │img1│ │img2│ │  + Add Photo │  ← horizontal scroll of thumbnails          ║
║   └────┘ └────┘ └──────────────┘                                             ║
║                                                                               ║
║   [ SAVE ]   [ SKIP ]   (hidden in read-only mode)                            ║
║                                                                               ║
║   DATA_FLOW: params → load existing row → edit → upload photos → upsert      ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes

| Location                            | Before                            | After                                            | User Impact                               |
| ----------------------------------- | --------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| `app/(app)/(tabs)/week.tsx`         | CTA shown separately from reviews | Current week always pinned first in reviews list | Check-up never buried below the fold      |
| `app/(app)/(tabs)/week.tsx`         | Amber CTA on Sundays only         | Danger-red row on Sundays (active state)         | Visual urgency when window is open        |
| `app/(app)/modal/weekly-review.tsx` | Always blank text inputs          | Pre-populated from existing DB row               | Can edit or re-read past check-ups        |
| `app/(app)/modal/weekly-review.tsx` | `readOnly` param ignored          | `readOnly=1` shows content without inputs/save   | Past check-ups are viewable, not editable |
| `app/(app)/modal/weekly-review.tsx` | No photos                         | Horizontal photo strip + Add Photo picker        | Visual memories attached to each week     |
| `app/(app)/(tabs)/_layout.tsx`      | 5 tabs (mirror hidden)            | 4 tabs (mirror route removed entirely)           | Cleaner tab structure, no dead route      |
| `app/(app)/(tabs)/profile.tsx`      | Mirror gallery section present    | Mirror gallery section removed                   | Profile tab no longer shows mirror UI     |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these files before starting any task:**

| Priority | File                                       | Lines   | Why Read This                                       |
| -------- | ------------------------------------------ | ------- | --------------------------------------------------- |
| P0       | `app/(app)/modal/weekly-review.tsx`        | 1–147   | Current state to completely replace                 |
| P0       | `app/(app)/(tabs)/week.tsx`                | 214–273 | CTA + reviews section to restructure                |
| P0       | `app/(app)/(tabs)/_layout.tsx`             | all     | Remove mirror Tabs.Screen                           |
| P0       | `app/(app)/(tabs)/profile.tsx`             | all     | Remove entire mirror gallery section                |
| P1       | `src/features/mirror/upload-photo.ts`      | all     | Pattern to MIRROR for upload-weekly-photo.ts        |
| P1       | `src/lib/hmc-colors.ts`                    | all     | Token names for danger, amber, surface02            |
| P1       | `src/lib/hmc-tokens.ts`                    | all     | radius, scale constants                             |
| P1       | `supabase/migrations/0006_hmc_reviews.sql` | 18–33   | Confirm photo_urls column already exists            |
| P2       | `src/features/checkin/use-checkin.ts`      | all     | TanStack Query hook pattern to follow               |
| P2       | `app/(app)/modal/mirror-capture.tsx`       | 44–62   | expo-image-picker / expo-camera pattern for uploads |

---

## Patterns to Mirror

**NAMING_CONVENTION:**

```typescript
// SOURCE: src/features/mirror/use-mirror.ts:1-22
// COPY THIS PATTERN for any new hooks:
export function useWeeklyReview(weekStart?: string) {
  const { user } = useAuth();
  return useQuery({
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
}
```

**ERROR_HANDLING:**

```typescript
// SOURCE: src/features/mirror/upload-photo.ts:1-48
// COPY THIS PATTERN — discriminated union, no try/catch at call sites:
export async function uploadWeeklyPhoto(
  userId: string,
  localUri: string,
  weekStart: string,
  index: number,
): Promise<{ data: string | null; error: Error | null }> {
  const storagePath = `${userId}/${weekStart}-${index}.jpg`;
  let blob: Blob;
  try {
    const response = await fetch(localUri);
    blob = await response.blob();
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error('Failed to read image') };
  }
  const { error: uploadError } = await supabase.storage
    .from('weekly-review-photos')
    .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) return { data: null, error: uploadError };
  const {
    data: { publicUrl },
  } = supabase.storage.from('weekly-review-photos').getPublicUrl(storagePath);
  return { data: publicUrl, error: null };
}
```

**STYLING_PATTERN:**

```typescript
// SOURCE: app/(app)/(tabs)/week.tsx:363-370 (ctaBtn / ctaText)
// For active check-up row in DANGER state, follow this structure:
activeRow: {
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: colors.danger,
  borderRadius: radius.md,
  paddingHorizontal: 14,
  marginHorizontal: spacing.pagePad,
},
activeLabel: { fontFamily: fonts.monoBold, fontSize: 11, letterSpacing: 1.5, color: colors.danger },
```

**IMAGE_PICKER_PATTERN:**

```typescript
// SOURCE: app/(app)/modal/mirror-capture.tsx (expo-image-picker alternative)
// Use launchImageLibraryAsync for weekly reviews (camera roll, not camera):
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
  allowsMultipleSelection: true,
  selectionLimit: 5,
});
if (!result.canceled) {
  setLocalUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
}
```

**UPSERT_WITH_ARRAYS:**

```typescript
// SOURCE: app/(app)/modal/weekly-review.tsx:30-40 (existing upsert pattern)
// Extend to include photo_urls array:
await supabase.from('weekly_reviews').upsert(
  {
    user_id: user.id,
    week_start: weekStart,
    week_end: weekEnd,
    win,
    challenge,
    next_week: nextWeek,
    photo_urls: uploadedUrls, // string[] of public URLs
  },
  { onConflict: 'user_id,week_start' },
);
```

---

## Files to Change

| File                                                 | Action | Justification                                                 |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `supabase/migrations/0009_weekly_review_storage.sql` | CREATE | Storage bucket + RLS policies for weekly-review-photos        |
| `src/features/weekly-review/upload-weekly-photo.ts`  | CREATE | Upload function mirroring upload-photo.ts pattern             |
| `app/(app)/modal/weekly-review.tsx`                  | UPDATE | Complete redesign: load existing data, readOnly, photo strip  |
| `app/(app)/(tabs)/week.tsx`                          | UPDATE | Unify CTA + reviews into single list, danger state on Sunday  |
| `app/(app)/(tabs)/_layout.tsx`                       | UPDATE | Remove `<Tabs.Screen name="mirror" .../>` line                |
| `app/(app)/(tabs)/profile.tsx`                       | UPDATE | Remove useMirror import, MIRROR_THUMB, mirror gallery section |
| `app/(app)/(tabs)/mirror.tsx`                        | DELETE | Mirror tab removed entirely                                   |
| `app/(app)/modal/mirror-capture.tsx`                 | DELETE | Mirror capture modal removed                                  |
| `app/(app)/modal/mirror-day/[date].tsx`              | DELETE | Mirror day modal removed                                      |
| `src/features/mirror/use-mirror.ts`                  | DELETE | Mirror hook removed                                           |
| `src/features/mirror/upload-photo.ts`                | DELETE | Mirror upload function removed                                |
| `__tests__/upload-photo.test.ts`                     | DELETE | Mirror upload test removed                                    |

---

## NOT Building (Scope Limits)

- **Dropping `mirror_photos` DB table**: The table exists in production; removing it requires a destructive migration. The UI is removed but the data stays.
- **Removing `MirrorPhoto` from database.ts**: The type references a live DB table; leave it.
- **Camera capture for weekly photos**: Weekly reflection uses camera roll (image picker), not live camera. Camera is mirror-only behavior being deleted.
- **Multi-step photo upload progress**: Show a simple uploading state (boolean), no per-photo progress bars.
- **Monthly review photos**: The `monthly_reviews.cover_photo_url` is a separate field — not touched here.
- **Weekly review locking/completion flag**: No `is_complete` field added; "active" is determined solely by `isSunday` logic in week.tsx.

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

---

### Task 1: DELETE mirror screen and modal files

- **ACTION**: DELETE the following files completely (remove the file, do not leave stubs):
  - `app/(app)/(tabs)/mirror.tsx`
  - `app/(app)/modal/mirror-capture.tsx`
  - `app/(app)/modal/mirror-day/[date].tsx` (delete the whole `mirror-day/` directory)
  - `src/features/mirror/use-mirror.ts`
  - `src/features/mirror/upload-photo.ts`
  - `__tests__/upload-photo.test.ts`
- **GOTCHA**: Delete `mirror-day/` directory entirely, not just `[date].tsx`, to avoid Expo Router picking up an empty folder.
- **VALIDATE**: `ls app/(app)/(tabs)/mirror.tsx` should return "No such file". `ls app/(app)/modal/mirror-day/` should return "No such file".

---

### Task 2: UPDATE `app/(app)/(tabs)/_layout.tsx`

- **ACTION**: UPDATE existing file
- **IMPLEMENT**: Remove the `<Tabs.Screen name="mirror" options={{ href: null }} />` line. The file should contain exactly 4 `Tabs.Screen` entries: `index`, `week`, `month`, `profile`.
- **MIRROR**: `app/(app)/(tabs)/_layout.tsx:1-15` — keep the same structure, just remove the mirror line
- **RESULT**:
  ```tsx
  export default function TabsLayout() {
    return (
      <Tabs tabBar={(props) => <PrintTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Today' }} />
        <Tabs.Screen name="week" options={{ title: 'Week' }} />
        <Tabs.Screen name="month" options={{ title: 'Month' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    );
  }
  ```
- **VALIDATE**: `npm run typecheck` — no missing module errors

---

### Task 3: UPDATE `app/(app)/(tabs)/profile.tsx` — remove mirror section

- **ACTION**: UPDATE existing file
- **IMPLEMENT**: Remove all mirror-related code:
  1. Remove `import { useMirror } from '@/features/mirror/use-mirror';` (line 16)
  2. Remove `const MIRROR_THUMB = 88;` constant (line 26)
  3. Remove `const { data: photos } = useMirror();` call (line 114)
  4. Remove the entire `{/* ── Mirror Gallery */}` JSX section (approximately lines 219–254 in the original): includes the `<Eyebrow label="MIRROR" />` block, the horizontal FlatList/ScrollView of photos, and the empty state text
  5. Remove all mirror-related styles: `mirrorScroll`, `mirrorThumb`, `mirrorDay` (approximately lines 417–425)
- **GOTCHA**: The mirror section is inside a larger ScrollView — only remove the mirror block, preserve surrounding `<Rule />` separators and other sections.
- **VALIDATE**: `npm run typecheck` — no unresolved imports. Confirm "MIRROR" label no longer appears in the component.

---

### Task 4: CREATE `supabase/migrations/0009_weekly_review_storage.sql`

- **ACTION**: CREATE new file
- **IMPLEMENT**:

  ```sql
  -- ============================================================
  -- HMC — Weekly review photo storage bucket
  -- Created: [date]
  --
  -- Adds a Supabase Storage bucket for weekly check-up photos.
  -- weekly_reviews.photo_urls (text[] column) already exists
  -- from migration 0006.
  -- ============================================================

  INSERT INTO storage.buckets (id, name, public)
  VALUES ('weekly-review-photos', 'weekly-review-photos', true)
  ON CONFLICT (id) DO NOTHING;

  CREATE POLICY "weekly_review_photos_select"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'weekly-review-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "weekly_review_photos_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'weekly-review-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "weekly_review_photos_update"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'weekly-review-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "weekly_review_photos_delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'weekly-review-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  ```

- **GOTCHA**: `storage.foldername(name)` returns an array where index [1] is the first path segment (1-based in Postgres). Storage path must be `{user_id}/{weekStart}-{index}.jpg` for this RLS to work.
- **GOTCHA**: `CREATE POLICY` on `storage.objects` requires the `storage` extension to be enabled — it is, since `mirror-photos` bucket already works.
- **VALIDATE**: `supabase db push` — applies without error. Check Supabase dashboard → Storage → Buckets to confirm `weekly-review-photos` exists.

---

### Task 5: CREATE `src/features/weekly-review/upload-weekly-photo.ts`

- **ACTION**: CREATE new file (create `src/features/weekly-review/` directory too)
- **IMPLEMENT**: Mirror the pattern from `src/features/mirror/upload-photo.ts` exactly:

  ```typescript
  import { supabase } from '@/lib/supabase';

  export async function uploadWeeklyPhoto(
    userId: string,
    localUri: string,
    weekStart: string,
    index: number,
  ): Promise<{ data: string | null; error: Error | null }> {
    const storagePath = `${userId}/${weekStart}-${index}.jpg`;

    let blob: Blob;
    try {
      const response = await fetch(localUri);
      blob = await response.blob();
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error('Failed to read image file') };
    }

    const { error: uploadError } = await supabase.storage
      .from('weekly-review-photos')
      .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) return { data: null, error: uploadError };

    const {
      data: { publicUrl },
    } = supabase.storage.from('weekly-review-photos').getPublicUrl(storagePath);

    return { data: publicUrl, error: null };
  }
  ```

- **IMPORTS**: `import { supabase } from '@/lib/supabase';`
- **GOTCHA**: `encoding: 'base64'` is NOT used here — the `fetch(localUri)` → `.blob()` pattern works in React Native and is the established approach in this codebase (see `upload-photo.ts:14-19`). Do not import `FileSystem` from expo-file-system.
- **VALIDATE**: `npm run typecheck` — no errors in the new file.

---

### Task 6: UPDATE `app/(app)/modal/weekly-review.tsx` — complete redesign

- **ACTION**: UPDATE existing file (complete replacement)
- **IMPLEMENT**: Full redesign of the screen with these capabilities:
  1. **Params**: Read `weekStart`, `weekEnd`, `readOnly` from `useLocalSearchParams()` (Expo Router)
  2. **Data loading**: When `weekStart` is present, query the DB for the existing row and pre-populate state. Use `useQuery` with `queryKey: ['weekly-review', user?.id, weekStart]`.
  3. **Local state**: `win`, `challenge`, `nextWeek` (text), `existingPhotoUrls` (string[] from DB row), `newLocalUris` (string[] of newly selected local URIs), `saving` (boolean)
  4. **Read-only mode**: When `readOnly === '1'`, render `<Text>` elements instead of `<TextInput>`, hide save/skip buttons, show a "CLOSE" button
  5. **Photo section** ("PICTURES OF THE WEEK"):
     - Horizontal `ScrollView` showing existing photos (from `existingPhotoUrls`) as `<Image>` thumbnails (80×80 dp with `borderRadius: 6`)
     - An "Add Photo" `<TouchableOpacity>` tile at the end (only visible when NOT read-only)
     - Tapping "Add Photo" calls `ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images', quality: 0.8, allowsMultipleSelection: true, selectionLimit: 5 })` then appends URIs to `newLocalUris`
     - Thumbnails for `newLocalUris` show with a `✕` overlay to remove before saving
  6. **Save flow** (`handleSave`):
     - Upload each URI in `newLocalUris` via `uploadWeeklyPhoto(userId, uri, weekStart, existingPhotoUrls.length + index)`
     - Collect successful public URLs
     - Upsert to `weekly_reviews` with `photo_urls: [...existingPhotoUrls, ...newPublicUrls]`
     - On error show `Alert.alert('Upload Failed', error.message)`
     - On success: `qc.invalidateQueries({ queryKey: ['weekly-reviews', user?.id] })` then `router.back()`
  7. **Week calculation**: When `weekStart`/`weekEnd` are NOT provided (opened from Sunday CTA), compute them as today (current week calculation from existing code lines 23-28 of original file)
- **IMPORTS**:
  ```typescript
  import { useLocalSearchParams } from 'expo-router';
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import * as ImagePicker from 'expo-image-picker';
  import { Image, Alert, ScrollView } from 'react-native';
  import { uploadWeeklyPhoto } from '@/features/weekly-review/upload-weekly-photo';
  ```
- **MIRROR**: `src/features/mirror/upload-photo.ts` for the upload pattern; `app/(app)/modal/weekly-review.tsx:92-147` for the StyleSheet structure to extend
- **GOTCHA**: `useLocalSearchParams()` returns all values as strings or string[]. Cast `readOnly` check as `params.readOnly === '1'`. `weekStart`/`weekEnd` may be `undefined` when opening fresh — compute them locally in that case.
- **GOTCHA**: `expo-image-picker` v55 uses `ImagePicker.MediaTypeOptions.Images` OR the string `'Images'` — prefer the enum if available, fall back to string literal.
- **GOTCHA**: Do NOT use `allowsMultipleSelection` on iOS < 14. Since target is Expo Go SDK 54 (iOS 14+), it is safe.
- **VALIDATE**: `npm run typecheck` — no errors. Manual test: open modal fresh (blank), open with weekStart param (pre-filled), open with readOnly=1 (no inputs).

---

### Task 7: UPDATE `app/(app)/(tabs)/week.tsx` — active check-up highlighting

- **ACTION**: UPDATE existing file
- **IMPLEMENT**: Restructure the weekly check-up + reviews section (lines 213–273 in the original):
  1. **Compute current week info** (add near line 30, after `isSunday`):
     ```typescript
     const now = new Date();
     const weekStartDate = new Date(now);
     weekStartDate.setDate(now.getDate() - now.getDay());
     const currentWeekStart = weekStartDate.toISOString().slice(0, 10);
     ```
  2. **Update weekly reviews query** (lines 35–53): include `photo_urls` in the select and add `currentWeekStart` type to the returned shape. Also update the TypeScript inline type to include `photo_urls: string[]`.
  3. **Replace the existing weekly check-up + past reviews JSX** (lines 213–273) with a unified "WEEKLY CHECK-UPS" section:

     ```tsx
     <Rule strong />
     <View style={styles.section}>
       <Eyebrow label="WEEKLY CHECK-UPS" />

       {/* Current week row — always first */}
       {isSunday ? (
         <TouchableOpacity
           style={styles.activeRow}
           onPress={() => router.push('/(app)/modal/weekly-review')}
           activeOpacity={0.8}
         >
           <Text style={styles.activeLabel}>THIS WEEK · CHECK-UP OPEN →</Text>
           <Text style={styles.activeHint}>Tap to complete your weekly reflection</Text>
         </TouchableOpacity>
       ) : (
         <View style={styles.countdownBlock}>
           <Eyebrow label="NEXT WEEKLY CHECK-UP IN" />
           <View style={styles.countdownRow}>
             <Text style={styles.countdownNum}>{daysUntilSunday}</Text>
             <Text style={styles.countdownUnit}>DAYS</Text>
           </View>
         </View>
       )}

       {/* Past reviews list */}
       {weeklyReviews && weeklyReviews.length > 0 && (
         <View style={styles.reviewsList}>
           {weeklyReviews.map((r) => {
             const endDate = new Date(r.week_end + 'T00:00:00');
             const label = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
             return (
               <TouchableOpacity
                 key={r.id}
                 style={styles.reviewRow}
                 onPress={() =>
                   router.push({
                     pathname: '/(app)/modal/weekly-review',
                     params: { readOnly: '1', weekStart: r.week_start, weekEnd: r.week_end },
                   })
                 }
                 activeOpacity={0.7}
               >
                 <View style={styles.reviewLeft}>
                   <Text style={styles.reviewLabel}>WK OF {label}</Text>
                   {r.win ? <Text style={styles.reviewWin} numberOfLines={1}>{r.win}</Text> : null}
                 </View>
                 {r.weekly_avg != null && (
                   <Text style={styles.reviewScore}>{Math.round(r.weekly_avg)}</Text>
                 )}
               </TouchableOpacity>
             );
           })}
         </View>
       )}
     </View>
     ```

  4. **Add new styles** to `StyleSheet.create()`:
     ```typescript
     activeRow: {
       paddingVertical: 16,
       paddingHorizontal: 14,
       borderWidth: 1,
       borderColor: colors.danger,
       borderRadius: radius.md,
       marginTop: 12,
       gap: 4,
     },
     activeLabel: {
       fontFamily: fonts.monoBold,
       fontSize: 13,
       letterSpacing: 1.5,
       color: colors.danger,
     },
     activeHint: {
       fontFamily: fonts.display,
       fontSize: 12,
       color: colors.textTertiary,
     },
     reviewsList: {
       marginTop: 16,
     },
     ```
  5. **Remove old styles** that are no longer used: `ctaBtn`, `ctaText` (replaced by `activeRow`/`activeLabel`)

- **GOTCHA**: `currentWeekStart` is computed but not actually used in the JSX above (the active state is determined by `isSunday`). Include it in the implementation in case you need to check if the current week already has a review in the past list — if `weeklyReviews.some(r => r.week_start === currentWeekStart)` is true and it's Sunday, optionally change the CTA to say "EDIT THIS WEEK'S CHECK-UP →".
- **VALIDATE**: `npm run typecheck` — no errors. Confirm old `ctaBtn`/`ctaText` styles are gone.

---

### Task 8: Verify no dangling mirror imports remain

- **ACTION**: Search and confirm no remaining imports from deleted modules
- **IMPLEMENT**: Run these checks:
  ```bash
  grep -r "from '@/features/mirror" app/ src/
  grep -r "mirror-capture" app/ src/
  grep -r "mirror-day" app/ src/
  grep -r "useMirror" app/ src/
  grep -r "uploadMirrorPhoto" app/ src/
  ```
  Each should return zero results. If any appear, fix the importing file.
- **VALIDATE**: All grep commands return empty. Then run `npm run typecheck` — clean exit.

---

## Testing Strategy

### Manual Tests to Run

| Scenario                                      | Expected Result                                              |
| --------------------------------------------- | ------------------------------------------------------------ |
| Open WEEK tab on a non-Sunday                 | Countdown row shown first, past reviews below                |
| Open WEEK tab on a Sunday (mock date or wait) | Red "THIS WEEK · CHECK-UP OPEN →" row shown first            |
| Tap the active check-up row                   | `weekly-review` modal opens, blank (no existing data)        |
| Tap a past review row                         | `weekly-review` modal opens, pre-populated, read-only        |
| In weekly-review modal, tap Add Photo         | System photo picker opens                                    |
| Select photos and tap SAVE                    | Photos upload to `weekly-review-photos` bucket, modal closes |
| Open a past review that has photos            | Photos shown as thumbnails in the photo strip                |
| Tap any tab in the tab bar                    | Mirror tab is gone; only TODAY / WEEK / MONTH / YOU visible  |
| Open profile tab                              | No mirror gallery section; no "CAPTURE +" button             |

### Edge Cases Checklist

- [ ] No past weekly reviews (query returns empty array) — reviews list hidden, only current-week row shown
- [ ] Image picker cancelled — no URIs added, state unchanged
- [ ] Photo upload network failure — `Alert.alert('Upload Failed', ...)` shown, modal stays open
- [ ] `weekStart`/`weekEnd` params present but no DB row exists yet — state stays blank (no crash on null data)
- [ ] Read-only mode with photos — photo strip shows existing photos but "Add Photo" tile is hidden
- [ ] Storage bucket doesn't exist (migration not applied) — upload returns error surfaced via Alert

---

## Validation Commands

### Level 1: STATIC_ANALYSIS

```bash
npm run typecheck && npm run lint
```

**EXPECT**: Exit 0, zero TypeScript errors, zero lint warnings

### Level 2: GREP_CLEANUP

```bash
grep -r "from '@/features/mirror" app/ src/ && echo "FOUND MIRROR IMPORT" || echo "CLEAN"
grep -r "mirror-capture\|mirror-day\|useMirror\|uploadMirrorPhoto" app/ src/ && echo "FOUND" || echo "CLEAN"
```

**EXPECT**: Both print "CLEAN"

### Level 3: BUILD_CHECK

```bash
npx expo export --platform ios 2>&1 | tail -5
```

**EXPECT**: Build completes without "Module not found" errors for deleted mirror files

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

## Completion Checklist

- [ ] Task 1: Mirror files deleted
- [ ] Task 2: `_layout.tsx` mirror route removed
- [ ] Task 3: `profile.tsx` mirror section removed
- [ ] Task 4: Storage migration created and applied
- [ ] Task 5: `upload-weekly-photo.ts` created
- [ ] Task 6: `weekly-review.tsx` redesigned (data loading + readOnly + photos)
- [ ] Task 7: `week.tsx` restructured (unified list + danger styling)
- [ ] Task 8: Dangling import check passed

---

## Risks and Mitigations

| Risk                                                                        | Likelihood | Impact | Mitigation                                                                             |
| --------------------------------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------- |
| Expo Router caches deleted `mirror` route and throws 404                    | MED        | LOW    | Hard reload dev server after deleting files (`r` in terminal or restart)               |
| `storage.foldername()` RLS function unavailable in local Supabase           | LOW        | MED    | Test `supabase db push` on local instance first; fall back to simpler policy if needed |
| `expo-image-picker` `allowsMultipleSelection` silently ignored on older iOS | LOW        | LOW    | Gracefully handle single-selection (check `result.assets` length; works either way)    |
| Removing mirror section from `profile.tsx` breaks surrounding layout        | MED        | LOW    | Read the full profile.tsx before editing; adjust adjacent `<Rule />` separators        |
| `weekly_reviews` query in week.tsx doesn't include `photo_urls` in type     | LOW        | LOW    | Update inline TypeScript type to include `photo_urls: string[]`                        |

---

## Notes

- The `weekly_reviews.photo_urls TEXT[]` column already exists from migration 0006. No column migration is needed — only the storage bucket migration (Task 4).
- The `mirror_photos` DB table and `MirrorPhoto` type in `database.ts` are intentionally kept. Dropping a production table requires a separate decision and is out of scope.
- The `PrintTabBar` component (src/components/hmc/PrintTabBar.tsx:7-12) already has no `mirror` entry in `TAB_LABELS` — it uses the `href: null` filter. Removing the `Tabs.Screen` entry in `_layout.tsx` is sufficient; `PrintTabBar.tsx` needs no changes.
- On the active check-up: the `isSunday` boolean already exists in week.tsx (line 32). Reuse it — no new derived state needed.
- The weekly-review modal is currently opened in two ways from week.tsx: (a) from the Sunday CTA with no params, (b) from past review rows with `readOnly`, `weekStart`, `weekEnd` params. The redesign must handle both entry points correctly.
