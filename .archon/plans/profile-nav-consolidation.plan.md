# Feature: Profile & Navigation Consolidation

## Summary

Consolidate the Trends and Mirror tabs fully into the Profile tab, add a calendar heatmap and a "View All" mirror link to the Profile screen, update the tab bar labels, and delete dead screen files.

## Mission

Remove the Trends and Mirror tabs from the navigation entirely, promote their content into the Profile screen, and leave the app with a clean 4-tab bar: TODAY · WEEK · MONTH · YOU.

## Success Criteria

- [ ] Tab bar shows exactly 4 tabs: TODAY, WEEK, MONTH, YOU
- [ ] Profile screen includes the calendar heatmap (CalendarHeatmap, same implementation as in trends.tsx)
- [ ] Profile screen mirror section has a "VIEW ALL →" button that navigates to `/(app)/(tabs)/mirror`
- [ ] `trends.tsx` and `you.tsx` tab files are deleted; their hidden `Tabs.Screen` registrations are removed from `_layout.tsx`
- [ ] `mirror.tsx` remains as a hidden route (so "View All" can navigate to it)
- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes

## Scope

### In Scope

- `PrintTabBar.tsx` — update TAB_LABELS for 4-tab layout
- `profile.tsx` — add CalendarHeatmap + VIEW ALL mirror button
- `_layout.tsx` — remove hidden-route registrations for `trends` and `you`
- Delete `app/(app)/(tabs)/trends.tsx` and `app/(app)/(tabs)/you.tsx`

### Out of Scope

- Any changes to `mirror.tsx` (keep as hidden navigable route)
- Any changes to `week.tsx`, `month.tsx`, or `index.tsx`
- Habit consistency section from trends.tsx (profile.tsx does not show it — not requested)
- Routing guards (`app/index.tsx`, `app/(app)/_layout.tsx`)

## Codebase Context

### Key Files

| File                                 | Role                                                         | Action    |
| ------------------------------------ | ------------------------------------------------------------ | --------- |
| `src/components/hmc/PrintTabBar.tsx` | Bottom tab bar — labels + underline                          | UPDATE    |
| `app/(app)/(tabs)/_layout.tsx`       | Tab registration                                             | UPDATE    |
| `app/(app)/(tabs)/profile.tsx`       | Profile screen (already has trends stats + mirror strip)     | UPDATE    |
| `app/(app)/(tabs)/trends.tsx`        | Trends screen (hidden route, content migrating to profile)   | DELETE    |
| `app/(app)/(tabs)/you.tsx`           | Old profile screen (hidden route, superseded by profile.tsx) | DELETE    |
| `app/(app)/(tabs)/mirror.tsx`        | Mirror gallery (keep as hidden navigable route)              | NO CHANGE |

### Patterns to Follow

**StyleSheet-only — no NativeWind:**

```ts
// All HMC styles use StyleSheet.create, colors from hmc-colors.ts
import { colors, fonts, spacing } from '@/lib/hmc-colors';
const styles = StyleSheet.create({ ... });
```

**CalendarHeatmap (from `trends.tsx:26-76`)** — copy verbatim; it is a pure presentational component. It takes `{ rows: HistoryRow[] }` and is self-contained.

**`colorForScore` helper (from `trends.tsx:18-24`)** — copy verbatim:

```ts
function colorForScore(score: number | null): string {
  if (score === null) return colors.lineRegular;
  if (score >= 80) return colors.amber;
  if (score >= 65) return 'rgba(255,176,32,0.55)';
  if (score >= 50) return 'rgba(255,176,32,0.30)';
  return colors.lineStrong;
}
```

**DAY_ABBR constant (from `trends.tsx:16`):**

```ts
const DAY_ABBR = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
```

**`calStyles` StyleSheet (from `trends.tsx:259-289`)** — copy verbatim.

**Section header with action (already in `profile.tsx:314`):**

```ts
sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
sectionAction: { fontFamily: fonts.monoBold, fontSize: 11, letterSpacing: 1.5, color: colors.amber },
```

## Architecture

- Keep `CalendarHeatmap` as a module-scoped function component inside `profile.tsx` (same pattern as in `trends.tsx` — it's small and purely presentational).
- "VIEW ALL →" in the Mirror section is a second action in the existing `sectionHeader` row. The current header only has `<Eyebrow label="MIRROR" />` + `CAPTURE +`; add `VIEW ALL →` as a third element, or restructure as: left side = eyebrow, right side = two action buttons. Use a nested `<View style={{ flexDirection: 'row', gap: 12 }}>` for the right cluster.
- Navigate to mirror screen via `router.push('/(app)/(tabs)/mirror')` — `href: null` only removes the tab-bar entry, programmatic navigation still works.
- Do NOT import the `Habit Consistency` query or logic from trends.tsx — that section was not requested and keeping profile.tsx lean is preferable.

## Task List

Execute in order. Each task is atomic and independently verifiable.

---

### Task 1: UPDATE `src/components/hmc/PrintTabBar.tsx`

**Action**: UPDATE  
**Details**:  
Replace the `TAB_LABELS` object with entries matching the 4 visible tabs in `_layout.tsx`:

```ts
const TAB_LABELS: Record<string, string> = {
  index: 'TODAY',
  week: 'WEEK',
  month: 'MONTH',
  profile: 'YOU',
};
```

Remove the old `trends`, `mirror`, `you` entries. No other changes.  
**Pattern**: `src/components/hmc/PrintTabBar.tsx:6-12`  
**Validate**: `npm run typecheck` — no errors in this file

---

### Task 2: UPDATE `app/(app)/(tabs)/_layout.tsx`

**Action**: UPDATE  
**Details**:  
Remove the two hidden-route registrations for `trends` and `you` (they will be deleted). Keep the `mirror` hidden route so View All can navigate to it.

Current block to replace:

```tsx
      {/* Hidden routes — content moved into Profile tab */}
      <Tabs.Screen name="you" options={{ href: null }} />
      <Tabs.Screen name="trends" options={{ href: null }} />
      <Tabs.Screen name="mirror" options={{ href: null }} />
```

Replace with:

```tsx
{
  /* Hidden route — full gallery for View All navigation */
}
<Tabs.Screen name="mirror" options={{ href: null }} />;
```

**Validate**: `npm run typecheck`

---

### Task 3: UPDATE `app/(app)/(tabs)/profile.tsx`

**Action**: UPDATE  
**Details** (three sub-changes — apply all in one edit pass):

**3a — Add helpers at the top of the file (after imports, before `ProfileScreen`):**

```ts
const DAY_ABBR = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function colorForScore(score: number | null): string {
  if (score === null) return colors.lineRegular;
  if (score >= 80) return colors.amber;
  if (score >= 65) return 'rgba(255,176,32,0.55)';
  if (score >= 50) return 'rgba(255,176,32,0.30)';
  return colors.lineStrong;
}

function CalendarHeatmap({ rows }: { rows: HistoryRow[] }) {
  const scoreMap = new Map(rows.map((r) => [r.date, r.total_score]));
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - daysFromMonday - 21);
  const cells = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isFuture = dateStr > todayStr;
    const score = isFuture ? null : (scoreMap.get(dateStr) ?? null);
    return { dateStr, score, isFuture };
  });
  return (
    <View>
      <View style={calStyles.headerRow}>
        {DAY_ABBR.map((d, i) => (
          <View key={i} style={calStyles.cell}>
            <Text style={calStyles.dayLabel}>{d}</Text>
          </View>
        ))}
      </View>
      <View style={calStyles.grid}>
        {cells.map((c, i) => (
          <View
            key={i}
            style={[
              calStyles.cell,
              calStyles.scoreCell,
              { backgroundColor: c.isFuture ? 'transparent' : colorForScore(c.score) },
              c.isFuture && calStyles.futureCell,
            ]}
          >
            {c.score !== null && !c.isFuture && (
              <Text style={[calStyles.scoreText, c.score >= 65 && calStyles.scoreTextDark]}>
                {c.score}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
```

Add the `HistoryRow` type to the existing `useHistory` import:

```ts
import { useHistory, type HistoryRow } from '@/features/history/use-history';
```

(profile.tsx currently only imports `useHistory` — add `, type HistoryRow`)

**3b — Add CalendarHeatmap in the Trends section:**

In the `rows.length >= 7` block of the Trends section, add the calendar between the sparkline ScrollView and the bracketRows View.

Find the existing sparkline block ending:

```tsx
            </ScrollView>
            <View style={styles.bracketRows}>
```

Insert between them:

```tsx
            </ScrollView>
            <View style={styles.calendarWrap}>
              <CalendarHeatmap rows={rows} />
            </View>
            <View style={styles.bracketRows}>
```

**3c — Add "VIEW ALL →" button to Mirror section header:**

The Mirror section header currently (lines 157-161):

```tsx
<View style={styles.sectionHeader}>
  <Eyebrow label="MIRROR" />
  <TouchableOpacity onPress={() => router.push('/(app)/modal/mirror-capture')} activeOpacity={0.7}>
    <Text style={styles.sectionAction}>CAPTURE +</Text>
  </TouchableOpacity>
</View>
```

Replace with:

```tsx
<View style={styles.sectionHeader}>
  <Eyebrow label="MIRROR" />
  <View style={styles.sectionActions}>
    <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/mirror')} activeOpacity={0.7}>
      <Text style={styles.sectionAction}>VIEW ALL →</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => router.push('/(app)/modal/mirror-capture')}
      activeOpacity={0.7}
    >
      <Text style={styles.sectionAction}>CAPTURE +</Text>
    </TouchableOpacity>
  </View>
</View>
```

**3d — Add new/updated style entries to `StyleSheet.create`:**

Add `calendarWrap` and `sectionActions` to the `styles` object, and add the `calStyles` object after `styles`:

In `styles`:

```ts
  calendarWrap: { marginTop: 12, marginBottom: 4 },
  sectionActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
```

After the closing `});` of `styles`, add:

```ts
const calStyles = StyleSheet.create({
  headerRow: { flexDirection: 'row', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center' },
  scoreCell: {
    aspectRatio: 1,
    borderRadius: 4,
    justifyContent: 'center',
    marginBottom: 4,
  },
  futureCell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineRegular,
    borderStyle: 'dashed',
  },
  dayLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textQuiet,
    letterSpacing: 1,
    paddingBottom: 4,
  },
  scoreText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textPrimary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  scoreTextDark: { color: '#001A0D' },
});
```

**Pattern**: CalendarHeatmap copied verbatim from `trends.tsx:26-76`; calStyles from `trends.tsx:259-289`  
**Validate**: `npm run typecheck`

---

### Task 4: DELETE `app/(app)/(tabs)/trends.tsx`

**Action**: DELETE  
**Details**: The file is fully superseded. Its content (CalendarHeatmap, stats) has been migrated to `profile.tsx` in Task 3. Its Tabs.Screen registration was removed in Task 2.  
Use `rm` via Bash.  
**Validate**: `npm run typecheck` — no unresolved imports

---

### Task 5: DELETE `app/(app)/(tabs)/you.tsx`

**Action**: DELETE  
**Details**: `you.tsx` is the legacy profile screen, superseded by `profile.tsx`. Its hidden Tabs.Screen registration was removed in Task 2. The file is not imported anywhere else.  
Use `rm` via Bash.  
**Validate**: `npm run typecheck` — no unresolved imports

## Testing Strategy

| Test File                      | Test Cases                                                                          | Validates           |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------- |
| Manual (Expo Go) — Profile tab | CalendarHeatmap renders, range selector works, VIEW ALL navigates to mirror gallery | Visual / functional |
| Manual (Expo Go) — Tab bar     | Shows TODAY · WEEK · MONTH · YOU; active underline works                            | Visual              |
| Manual (Expo Go) — Mirror tab  | Accessible via VIEW ALL →; full grid loads                                          | Navigation          |

No automated test changes required — there are no unit tests for screen components; the pure utility functions (`computeScore`, `computeWeeksLived`, etc.) are unaffected.

## Validation Commands

1. Type check: `npm run typecheck`
2. Lint: `npm run lint`
3. Full: `npm run typecheck && npm run lint`

## Risks

| Risk                                                                                     | Impact | Mitigation                                                           |
| ---------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| Navigating to a hidden tab route (`href: null`) may not work in all Expo Router versions | MED    | Test in Expo Go; if broken, move mirror.tsx to a modal route instead |
| `profile.tsx` becomes long after adding CalendarHeatmap                                  | LOW    | Component is small (~50 lines); acceptable in one file               |
| `HistoryRow` type import not currently in profile.tsx                                    | LOW    | Task 3 explicitly adds it; typecheck will catch any miss             |
