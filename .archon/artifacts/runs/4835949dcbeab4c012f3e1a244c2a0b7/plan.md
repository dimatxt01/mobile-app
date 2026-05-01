# Feature: Sprint 1 Design Audit — HMC Color Tokens, Today Tab, You Tab, Button Glow

## Summary

Adds 6 missing semantic color tokens to the design system, enhances the Today tab with an identity eyebrow label and delta-vs-yesterday indicator, overhauls the You tab with a Best stat, inline identity edit button, score-density toggle, and footer, and adds an amber glow shadow to the primary BottomBar CTA button. All changes use existing `StyleSheet.create` + `hmc-colors.ts` patterns.

## User Story

As a daily user of HMC
I want the app to match the design handoff's receipt-print aesthetic
So that stats, identity context, and scoring controls feel cohesive and visually polished

## Problem Statement

Six semantic color tokens used in the design handoff (bgHigher, textQuiet, accentMuted, accentDim, accentGlow, dangerMuted) are missing from `hmc-colors.ts`. The Today tab lacks the "Today, I am" eyebrow label and a delta indicator. The You tab's stats row is missing "Best", the identity section lacks an inline edit shortcut, there is no score-density display toggle, and no footer text. The primary amber CTA button has no glow shadow.

## Solution Statement

Six token constants are appended to the `colors` object in `hmc-colors.ts`. The Today screen adds an `<Eyebrow>` above the identity sentence and a `useMemo`-derived delta row below `<BigNum>`. The You screen replaces the DAYS stat with BEST (date sub-label), adds inline identity text + amber edit button, inserts a DISPLAY section with pill toggle backed by a new `useScoreDensity` hook (AsyncStorage), and appends a footer. `BottomBar.tsx` gains shadow props on the amber button style. `@react-native-async-storage/async-storage` must be installed first.

## Metadata

| Field            | Value                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| Type             | ENHANCEMENT                                                                   |
| Complexity       | MEDIUM                                                                        |
| Systems Affected | Design tokens, Today tab, You tab, BottomBar component, new score-density lib |
| Dependencies     | @react-native-async-storage/async-storage (not yet in package.json)           |
| Estimated Tasks  | 7 (1 install + 6 file edits)                                                  |

---

## UX Design

### Before State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              TODAY TAB — BEFORE                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  HMC.                                               DAY 12                    ║
║  ─────────────────────────────────────────────────────────────                ║
║  [No eyebrow label]                                                           ║
║  "I am a disciplined builder."  ← identity sentence, no label above          ║
║                                                                               ║
║  IDENTITY ......................................... +40                        ║
║  EXECUTION ........................................ +22                        ║
║  OUTCOMES ......................................... +15                        ║
║  PENALTY .......................................... -0                         ║
║                                                                               ║
║              TOTAL                                                            ║
║               77    ← BigNum, no delta indicator below                       ║
║         TAP FOR BREAKDOWN                                                     ║
║                                                                               ║
║  [LOCK IN · 77 PTS]  ← amber button, flat (no glow)                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════╗
║                              YOU TAB — BEFORE                                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Name Here                                                                    ║
║  "I am a disciplined builder."                                                ║
║                                                                               ║
║  STREAK    DAYS     AVG    ← 3 stats, no Best score                          ║
║    12       45      71                                                        ║
║  ─────────────────────────────────────────────────────                        ║
║  YOUR IDENTITY                                                                ║
║    Edit Identity Sentence  ›  ← navRow only, no inline sentence              ║
║  ─────────────────────────────────────────────────────                        ║
║  HABITS & SCORING                  ← immediately after YOUR IDENTITY         ║
║    Identity Habits  ›                                                         ║
║    Execution Habits ›                                                         ║
║    Outcomes  ›                                                                ║
║    Penalties ›                                                                ║
║  [no footer]                                                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              TODAY TAB — AFTER                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  HMC.                                               DAY 12                    ║
║  ─────────────────────────────────────────────────────────────                ║
║  TODAY, I AM  ← NEW: Eyebrow above identity sentence                         ║
║  "I am a disciplined builder."                                                ║
║                                                                               ║
║  IDENTITY ......................................... +40                        ║
║  EXECUTION ........................................ +22                        ║
║  OUTCOMES ......................................... +15                        ║
║  PENALTY .......................................... -0                         ║
║                                                                               ║
║              TOTAL                                                            ║
║               77    ← BigNum                                                 ║
║         +5 VS YESTERDAY  ← NEW: amber/danger delta indicator                 ║
║         TAP FOR BREAKDOWN                                                     ║
║                                                                               ║
║  [LOCK IN · 77 PTS]  ← amber button + NEW accentGlow shadow                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════╗
║                              YOU TAB — AFTER                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Name Here                                                                    ║
║  "I am a disciplined builder."                                                ║
║                                                                               ║
║  STREAK    BEST     AVG    ← DAYS→BEST; BEST shows score + date sub-label   ║
║    12      128       71                                                       ║
║           MAR 15  ← small date sub-label below best value                    ║
║  ─────────────────────────────────────────────────────                        ║
║  YOUR IDENTITY                                                                ║
║  "I am a disciplined builder."  ← NEW: identity sentence shown in section   ║
║  EDIT IDENTITY →  ← NEW: amber text button (replaces navRow)                ║
║  ─────────────────────────────────────────────────────                        ║
║  DISPLAY  ← NEW section above HABITS & SCORING                               ║
║  [NUMBER] [RING] [BREAKDOWN]  ← pill toggle, amber if active                ║
║  ─────────────────────────────────────────────────────                        ║
║  HABITS & SCORING                                                             ║
║    Identity Habits  ›                                                         ║
║    ...                                                                        ║
║                                                                               ║
║  HMC · HALF MILLY CLUB · v1.0  ← NEW footer in textQuiet/mono               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes

| Location                        | Before                          | After                                            | User Impact                          |
| ------------------------------- | ------------------------------- | ------------------------------------------------ | ------------------------------------ |
| Today — above identity sentence | No label                        | `TODAY, I AM` Eyebrow                            | Clearer intent context               |
| Today — below BigNum            | Only TAP FOR BREAKDOWN hint     | Delta `+N VS YESTERDAY` + hint                   | Instant performance comparison       |
| Today — BottomBar button        | Flat amber button               | Amber button + accentGlow shadow                 | Stronger visual CTA weight           |
| You — stats row                 | STREAK / DAYS / AVG             | STREAK / BEST / AVG with date sub-label          | Personal best is visible at a glance |
| You — YOUR IDENTITY section     | navRow "Edit Identity Sentence" | Sentence text + "EDIT IDENTITY →" amber button   | Inline preview + direct edit         |
| You — above HABITS & SCORING    | Missing                         | DISPLAY section with NUMBER/RING/BREAKDOWN pills | User can choose score display mode   |
| You — bottom of ScrollView      | No footer                       | `HMC · HALF MILLY CLUB · v1.0` in textQuiet      | Brand and version clarity            |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these files before starting any task:**

| Priority | File                                  | Lines | Why Read This                                          |
| -------- | ------------------------------------- | ----- | ------------------------------------------------------ |
| P0       | `src/lib/hmc-colors.ts`               | all   | Pattern to extend (const object shape with `as const`) |
| P0       | `app/(app)/(tabs)/index.tsx`          | all   | Today screen — insert points for Eyebrow and delta     |
| P0       | `app/(app)/(tabs)/you.tsx`            | all   | You screen — insert points for all 4 changes           |
| P0       | `src/components/hmc/BottomBar.tsx`    | all   | Shadow props target: `styles.btn` object               |
| P1       | `src/components/hmc/Eyebrow.tsx`      | all   | Eyebrow props (just `label: string`), no other props   |
| P1       | `src/features/history/use-history.ts` | all   | `HistoryRow` type (need `date`, `total_score`)         |
| P1       | `src/lib/score.ts`                    | all   | `ScoreResult.total` is the live score field            |

---

## Patterns to Mirror

**NAMING_CONVENTION:**

```typescript
// SOURCE: src/lib/hmc-colors.ts:1-29
// COPY THIS PATTERN — const object with `as const`, RGBA values use `as const`:
export const colors = {
  base: '#0A0A0B',
  lineRegular: 'rgba(255,255,255,0.08)' as const,
  amber: '#FFB020',
} as const;
// New tokens go inside the same object, before the closing `} as const`
```

**STYLESHEET_PATTERN:**

```typescript
// SOURCE: app/(app)/(tabs)/index.tsx:218-265
// COPY THIS PATTERN — StyleSheet.create at bottom of file, reference colors/fonts/spacing:
const styles = StyleSheet.create({
  hint: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginTop: 4,
  },
});
```

**TANSTACK_QUERY_HOOK:**

```typescript
// SOURCE: src/features/history/use-history.ts:20-32
// COPY THIS PATTERN — useQuery with enabled guard and select extractor:
export function useHistory(days = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['history', user?.id, days],
    queryFn: async () => {
      /* ... */
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
```

**CONDITIONAL_STYLE_ARRAY:**

```typescript
// SOURCE: src/components/hmc/HabitRow.tsx:42-43
// COPY THIS PATTERN — active state via conditional style array:
<Text style={[styles.label, checked && styles.labelActive]}>{label}</Text>
```

**NAVIGATION_PUSH:**

```typescript
// SOURCE: app/(app)/(tabs)/you.tsx:82
// COPY THIS PATTERN — modal navigation with router.push (string form):
router.push('/(app)/modal/edit-identity-sentence');
```

**USEMEMO_DERIVATION:**

```typescript
// SOURCE: app/(app)/(tabs)/index.tsx:47-56
// COPY THIS PATTERN — useMemo for derived values from hook data:
const isLate = useMemo(() => {
  if (!profile?.reminder_time) return false;
  // computation
}, [profile?.reminder_time]);
```

---

## Files to Change

| File                               | Action | Justification                                           |
| ---------------------------------- | ------ | ------------------------------------------------------- |
| `src/lib/hmc-colors.ts`            | UPDATE | Add 6 new semantic color tokens                         |
| `src/lib/score-density.ts`         | CREATE | New hook for score display preference (AsyncStorage)    |
| `src/components/hmc/BottomBar.tsx` | UPDATE | Add accentGlow shadow to `styles.btn`                   |
| `app/(app)/(tabs)/index.tsx`       | UPDATE | Eyebrow above sentence, delta below BigNum, hook import |
| `app/(app)/(tabs)/you.tsx`         | UPDATE | Best stat, identity section, DISPLAY section, footer    |

---

## NOT Building (Scope Limits)

- Ring or Breakdown rendering variants on the Today screen — only reads the density value, no rendering change
- Any new Supabase queries beyond the existing `useHistory(14)` call already in Today
- Changes to auth, onboarding, or any screen other than Today and You
- Navigation structure changes, new routes, or new modals
- The `bgHigher` token is added to the token file but NOT used in this sprint (reserved for future use)

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

### Task 0: Install AsyncStorage Package

- **ACTION**: Run shell command in the project root
- **COMMAND**: `cd /Users/dzmitrypiskun/Documents/mobile-app/test-app && npx expo install @react-native-async-storage/async-storage`
  - Use `npx expo install` (NOT `npm install`) — this resolves the Expo SDK 54–compatible version automatically
- **GOTCHA**: Do NOT use `npm install @react-native-async-storage/async-storage@latest` — Expo SDK 54 requires a specific version; `expo install` resolves it
- **VALIDATE**: Check `package.json` — `@react-native-async-storage/async-storage` appears in dependencies

---

### Task 1: UPDATE `src/lib/hmc-colors.ts`

- **ACTION**: UPDATE existing file
- **IMPLEMENT**: Add 6 new tokens to the `colors` object, immediately before the closing `} as const`
- **MIRROR**: `src/lib/hmc-colors.ts:3-12` — follow the exact `key: 'value'` and `'rgba(...)' as const` pattern
- **INSERT** the following 6 lines after `danger: '#FF453A',` and before `} as const`:
  ```typescript
  bgHigher: '#222226',
  textQuiet: '#48484C',
  accentMuted: 'rgba(255,176,32,0.16)' as const,
  accentDim: 'rgba(255,176,32,0.5)' as const,
  accentGlow: 'rgba(255,176,32,0.28)' as const,
  dangerMuted: 'rgba(255,69,58,0.12)' as const,
  ```
- **GOTCHA**: RGBA values need `as const` suffix (matching the existing `lineRegular` and `lineStrong` pattern); hex values do NOT need it
- **VALIDATE**: `npx tsc --noEmit` — must exit 0 with no errors

---

### Task 2: CREATE `src/lib/score-density.ts`

- **ACTION**: CREATE new file at `src/lib/score-density.ts`
- **IMPLEMENT**: Export `useScoreDensity()` hook that reads/writes 'hmc_score_density' from AsyncStorage, defaulting to 'number'
- **MIRROR**: Hook structure from `src/features/history/use-history.ts` — standalone exported function, no default export, TypeScript types explicit
- **IMPORTS**: `import AsyncStorage from '@react-native-async-storage/async-storage';` and `useState`, `useEffect`, `useCallback` from 'react'
- **FULL IMPLEMENTATION**:

  ```typescript
  import { useState, useEffect, useCallback } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  export type ScoreDensity = 'number' | 'ring' | 'breakdown';

  const STORAGE_KEY = 'hmc_score_density';
  const DEFAULT: ScoreDensity = 'number';

  export function useScoreDensity(): [ScoreDensity, (v: ScoreDensity) => void] {
    const [density, setDensity] = useState<ScoreDensity>(DEFAULT);

    useEffect(() => {
      AsyncStorage.getItem(STORAGE_KEY).then((v) => {
        if (v === 'ring' || v === 'breakdown') setDensity(v);
      });
    }, []);

    const set = useCallback((v: ScoreDensity) => {
      setDensity(v);
      AsyncStorage.setItem(STORAGE_KEY, v);
    }, []);

    return [density, set];
  }
  ```

- **GOTCHA**: `AsyncStorage.getItem` is async and returns `Promise<string | null>` — do NOT `await` in useEffect directly, chain `.then()` instead to avoid unhandled promise warnings
- **VALIDATE**: `npx tsc --noEmit` — must exit 0

---

### Task 3: UPDATE `src/components/hmc/BottomBar.tsx`

- **ACTION**: UPDATE existing file — add shadow styles to `styles.btn`
- **IMPLEMENT**: Add 5 shadow properties to the existing `btn` style object in `StyleSheet.create`
- **MIRROR**: `src/components/hmc/BottomBar.tsx:36-50` — add inside the existing `btn: { ... }` object
- **CURRENT** `btn` style (lines 36-40):
  ```typescript
  btn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ```
- **AFTER** `btn` style:
  ```typescript
  btn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.accentGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  ```
- **GOTCHA**: `colors.accentGlow` becomes available after Task 1; run Tasks in order. `shadowOpacity: 1` combined with the RGBA color in `shadowColor` provides the correct opacity — do not set a separate opacity value.
- **VALIDATE**: `npx tsc --noEmit` — must exit 0

---

### Task 4: UPDATE `app/(app)/(tabs)/index.tsx`

Four sub-changes in this file. Read the full file before editing.

#### 4a — Add `useScoreDensity` import

- **IMPLEMENT**: Add import after line 21 (`import { BottomBar } ...`):
  ```typescript
  import { useScoreDensity } from '@/lib/score-density';
  ```

#### 4b — Call the hook inside `TodayScreen`

- **IMPLEMENT**: Add after line 30 (`const { data: history } = useHistory(14);`):
  ```typescript
  // scoreDensity ('number' | 'ring' | 'breakdown') — ring/breakdown rendering is out of scope this sprint
  const [scoreDensity] = useScoreDensity();
  ```
- **GOTCHA**: ESLint will warn about an unused variable if `scoreDensity` is never referenced in JSX. To silence this without adding JSX logic, reference it as a comment-noted variable. If lint fails, add `void scoreDensity;` immediately after the destructure.

#### 4c — Add prevDayRow/delta derivation

- **IMPLEMENT**: Add new `useMemo` after the existing `score` computation (after line 74):

  ```typescript
  const prevDayRow = useMemo(() => {
    if (!history) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    return history.find((r) => r.date < todayStr) ?? null;
  }, [history]);

  const delta = prevDayRow != null && score != null ? score.total - prevDayRow.total_score : null;
  ```

- **MIRROR**: `app/(app)/(tabs)/index.tsx:47-56` — same `useMemo` pattern with dependency array
- **GOTCHA**: `history` from `useHistory(14)` contains only locked check-ins. `history[0]` is the most recent locked day. If today was locked, its date equals `todayStr`, so `.find(r => r.date < todayStr)` correctly skips today and returns yesterday's locked row.

#### 4d — Update JSX: Eyebrow + delta elements

**Change 1** — Add `<Eyebrow>` above the identity sentence text:

- **CURRENT** (lines 126-130):
  ```tsx
  {
    profile?.identity_sentence && (
      <View style={styles.sentence}>
        <Text style={styles.sentenceText}>{profile.identity_sentence}</Text>
      </View>
    );
  }
  ```
- **AFTER**:
  ```tsx
  {
    profile?.identity_sentence && (
      <View style={styles.sentence}>
        <Eyebrow label="TODAY, I AM" />
        <Text style={styles.sentenceText}>{profile.identity_sentence}</Text>
      </View>
    );
  }
  ```
- Note: `Eyebrow` is already imported on line 19 — no new import needed.

**Change 2** — Add delta indicator below `<BigNum>`:

- **CURRENT** (lines 197-199):
  ```tsx
  <Eyebrow label="TOTAL" />
  <BigNum value={score?.total ?? 0} highlight={checkin?.is_locked} />
  <Text style={styles.hint}>TAP FOR BREAKDOWN</Text>
  ```
- **AFTER**:
  ```tsx
  <Eyebrow label="TOTAL" />
  <BigNum value={score?.total ?? 0} highlight={checkin?.is_locked} />
  {delta !== null && (
    <Text style={[styles.delta, delta >= 0 ? styles.deltaPositive : styles.deltaNegative]}>
      {delta >= 0 ? `+${delta}` : `${delta}`} VS YESTERDAY
    </Text>
  )}
  <Text style={styles.hint}>TAP FOR BREAKDOWN</Text>
  ```

**Change 3** — Add `delta`, `deltaPositive`, `deltaNegative` style entries to `StyleSheet.create` (after the existing `hint` entry):

```typescript
delta: {
  fontFamily: fonts.mono,
  fontSize: 12,
  letterSpacing: 1.5,
  marginTop: 4,
},
deltaPositive: { color: colors.amber },
deltaNegative: { color: colors.danger },
```

- **GOTCHA**: The `delta` style has no color — color is applied by the conditional `deltaPositive`/`deltaNegative` overlay. This is the same pattern as `HabitRow` (`styles.label` + `styles.labelActive`).
- **VALIDATE**: `npx tsc --noEmit` — must exit 0

---

### Task 5: UPDATE `app/(app)/(tabs)/you.tsx`

Five sub-changes in this file. Read the full file before editing. This is the most invasive task — make all changes in one pass.

#### 5a — Add `useScoreDensity` import

- **IMPLEMENT**: Add import after the existing imports (after line 17):
  ```typescript
  import { useScoreDensity } from '@/lib/score-density';
  ```

#### 5b — Call the hook inside `YouScreen`

- **IMPLEMENT**: Add after line 22 (`const { profile } = useProfileStore();`):
  ```typescript
  const [scoreDensity, setScoreDensity] = useScoreDensity();
  ```

#### 5c — Replace DAYS stat with BEST (including date sub-label)

- **CURRENT** stats row inner items (lines 63-76):
  ```tsx
  <View style={styles.statItem}>
    <Eyebrow label="STREAK" />
    <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
  </View>
  <View style={styles.statItem}>
    <Eyebrow label="DAYS" />
    <Text style={styles.statValue}>{stats?.day_count ?? 0}</Text>
  </View>
  <View style={styles.statItem}>
    <Eyebrow label="AVG" />
    <Text style={styles.statValue}>{stats?.lifetime_avg ?? 0}</Text>
  </View>
  ```
- **AFTER** (replace only the middle `statItem` block):
  ```tsx
  <View style={styles.statItem}>
    <Eyebrow label="STREAK" />
    <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
  </View>
  <View style={styles.statItem}>
    <Eyebrow label="BEST" />
    <Text style={styles.statValue}>{stats?.best_score ?? 0}</Text>
    {stats?.best_date && (
      <Text style={styles.statDate}>{fmtDate(stats.best_date)}</Text>
    )}
  </View>
  <View style={styles.statItem}>
    <Eyebrow label="AVG" />
    <Text style={styles.statValue}>{stats?.lifetime_avg ?? 0}</Text>
  </View>
  ```
- **ADD** helper function `fmtDate` before the component (or as a module-level function after imports):
  ```typescript
  function fmtDate(d: string): string {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  }
  ```
- **ADD** `statDate` style entry in `StyleSheet.create`:
  ```typescript
  statDate: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textTertiary,
    marginTop: 2,
  },
  ```

#### 5d — Rewrite YOUR IDENTITY section: add sentence text + amber edit button

- **CURRENT** YOUR IDENTITY section (lines 80-83):
  ```tsx
  <View style={styles.section}>
    <Eyebrow label="YOUR IDENTITY" />
    {navRow('Edit Identity Sentence', () => router.push('/(app)/modal/edit-identity-sentence'))}
  </View>
  ```
- **AFTER** (replace entire section):
  ```tsx
  <View style={styles.section}>
    <Eyebrow label="YOUR IDENTITY" />
    {profile?.identity_sentence && (
      <Text style={styles.identitySentenceSection}>{profile.identity_sentence}</Text>
    )}
    <TouchableOpacity
      onPress={() => router.push('/(app)/modal/edit-identity-sentence')}
      activeOpacity={0.7}
      style={styles.editIdentityBtn}
    >
      <Text style={styles.editIdentityText}>EDIT IDENTITY →</Text>
    </TouchableOpacity>
  </View>
  ```
- **ADD** style entries in `StyleSheet.create`:
  ```typescript
  identitySentenceSection: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 4,
  },
  editIdentityBtn: {
    paddingVertical: 8,
  },
  editIdentityText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.amber,
  },
  ```
- **GOTCHA**: `TouchableOpacity` is already imported in you.tsx (line 5). Do NOT add a duplicate import.
- **NOTE**: The existing `navRow` helper and its `navRow`/`navText`/`navArrow` styles are still used by other sections (HABITS, INTEGRATIONS, ACCOUNT) — do NOT remove them.

#### 5e — Add DISPLAY section above HABITS & SCORING, and footer at the end

- **CURRENT** HABITS & SCORING section block (lines 87-97) has a `<Rule />` above it at line 85. The new DISPLAY section goes between the YOUR IDENTITY `<Rule />` and the existing HABITS & SCORING `<Rule />`.

- **CURRENT** (lines 85-97):

  ```tsx
  <Rule />

  <View style={styles.section}>
    <Eyebrow label="HABITS & SCORING" />
    ...
  </View>
  ```

- **AFTER** (insert DISPLAY section + its Rule before HABITS & SCORING):

  ```tsx
  <Rule />

  <View style={styles.section}>
    <Eyebrow label="DISPLAY" />
    <View style={styles.pillRow}>
      {(['number', 'ring', 'breakdown'] as const).map((v) => (
        <TouchableOpacity
          key={v}
          style={[styles.pill, scoreDensity === v && styles.pillActive]}
          onPress={() => setScoreDensity(v)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, scoreDensity === v && styles.pillTextActive]}>
            {v.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>

  <Rule />

  <View style={styles.section}>
    <Eyebrow label="HABITS & SCORING" />
    ...
  </View>
  ```

- **ADD** footer text immediately before the closing `</ScrollView>` tag (currently `</ScrollView>` at line 115):

  ```tsx
  <Text style={styles.footer}>HMC · HALF MILLY CLUB · v1.0</Text>
  ```

- **ADD** pill and footer style entries in `StyleSheet.create`:
  ```typescript
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.lineRegular,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accentDim,
  },
  pillText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  pillTextActive: { color: colors.amber },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textQuiet,
    textAlign: 'center',
    paddingVertical: 24,
  },
  ```
- **GOTCHA**: `accentMuted`, `accentDim`, and `textQuiet` are the new tokens added in Task 1. These must exist before this file is compiled. Run tasks in order.
- **VALIDATE**: `npx tsc --noEmit` — must exit 0

---

### Task 6: Final Validation

- **RUN**: `npx tsc --noEmit` from the project root — expect exit 0, no TypeScript errors
- **RUN**: `npx expo export --platform ios` from the project root — expect `✓ Export was successful` with zero errors
- **GOTCHA**: If expo export fails with `Unable to resolve module '@react-native-async-storage/async-storage'`, Task 0 was skipped or the package is not in `node_modules` — run `npm install` or re-run `npx expo install @react-native-async-storage/async-storage`

---

## Testing Strategy

### Manual Verification Checklist

| Screen | Element                | Check                                                                    |
| ------ | ---------------------- | ------------------------------------------------------------------------ |
| Today  | Identity sentence area | "TODAY, I AM" eyebrow appears above italic sentence                      |
| Today  | Below BigNum           | Delta shows `+N VS YESTERDAY` in amber or danger; absent if no prior day |
| Today  | BottomBar CTA          | Amber button has visible glow shadow                                     |
| You    | Stats row              | Second stat shows "BEST" (not "DAYS"), best_score value, date sub-label  |
| You    | YOUR IDENTITY section  | Identity sentence shown in section; "EDIT IDENTITY →" in amber           |
| You    | EDIT IDENTITY → tap    | Navigates to edit-identity-sentence modal                                |
| You    | DISPLAY section        | Three pills NUMBER / RING / BREAKDOWN visible above HABITS               |
| You    | Pill tap               | Selected pill shows amber text + accentMuted background                  |
| You    | App restart            | Selected display mode persists after kill/reopen                         |
| You    | Bottom of screen       | Footer "HMC · HALF MILLY CLUB · v1.0" in muted color                     |

### Edge Cases Checklist

- [ ] No prior locked day in history → delta indicator is hidden (not zero, not an error)
- [ ] `best_date` is null → no date sub-label below BEST stat
- [ ] `identity_sentence` is null/empty → no italic text in YOUR IDENTITY section, no crash
- [ ] `profile` is null while loading → no crash on `profile?.identity_sentence` access

---

## Validation Commands

### Level 1: TypeScript

```bash
npx tsc --noEmit
```

**EXPECT**: Exit 0, zero diagnostics

### Level 2: Expo Export (iOS)

```bash
npx expo export --platform ios
```

**EXPECT**: `✓ Export was successful`, zero bundle errors

---

## Acceptance Criteria

- [ ] All 6 color tokens added to `hmc-colors.ts` with correct types
- [ ] `src/lib/score-density.ts` exists and exports `useScoreDensity` hook and `ScoreDensity` type
- [ ] Today screen: "TODAY, I AM" Eyebrow above identity sentence
- [ ] Today screen: delta row appears when prior day exists; hidden when not
- [ ] Today screen: BottomBar amber button has accentGlow shadow
- [ ] You screen: BEST stat (value + date) replaces DAYS
- [ ] You screen: YOUR IDENTITY section shows sentence text + amber edit button
- [ ] You screen: DISPLAY section with pill toggle above HABITS & SCORING
- [ ] You screen: footer at bottom of ScrollView
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx expo export --platform ios` exits 0

---

## Risks and Mitigations

| Risk                                                         | Likelihood | Impact | Mitigation                                                                                     |
| ------------------------------------------------------------ | ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| `@react-native-async-storage/async-storage` version mismatch | MED        | HIGH   | Use `npx expo install` not `npm install` — resolves SDK-compatible version automatically       |
| Delta shows today's locked row as "yesterday"                | LOW        | MED    | `find(r => r.date < todayStr)` skips today's row if it exists in history                       |
| `scoreDensity` variable unused warning in Today              | MED        | LOW    | Add `void scoreDensity;` line or use it in a comment/console.dev; lint should not block export |
| `ActivityIndicator` unused import in you.tsx                 | LOW        | LOW    | It's already in the file; do not remove it (out of scope), lint warnings do not block export   |
| `accentMuted`/`accentDim` referenced before Task 1 runs      | LOW        | HIGH   | Run tasks strictly in order; TypeScript check after Task 1 gates subsequent tasks              |

---

## Notes

- The `bgHigher: '#222226'` token is added to `hmc-colors.ts` as a forward-compatibility token for future inactive bar fills. It is NOT consumed by any component in this sprint.
- `fmtDate` in you.tsx is a module-level helper, not a hook — it does not need `useMemo` since it receives a stable `stats?.best_date` string.
- The You screen currently imports `ActivityIndicator` (line 6) but doesn't render it. Leave it in place — removing it is out of scope.
- For the delta computation, `useHistory(14)` is already called in Today (line 30); no additional query or fetch is needed. The delta is a pure derivation over existing state.
- The pill toggle persists to AsyncStorage but does NOT yet affect rendering on Today (that is explicitly out of scope). The `scoreDensity` value is read and available for Phase 2 rendering work.
