# Feature: Half Milly Club (HMC) Habit-Scoring App

## Summary
Implement the complete HMC daily scoring app on top of the existing Expo Router + Supabase + NativeWind + Zustand skeleton, replacing the placeholder tabs with a production-grade dark receipt-aesthetic app. All 9 phases build sequentially; each phase must pass `npx tsc --noEmit` before the next begins.

## Mission
Deliver a dark-only, print/receipt-aesthetic self-scoring app where users rate themselves across 4 brackets each night, lock in a score, and optionally photograph themselves — fully connected to the Supabase schema already migrated in files 0002–0007.

## Success Criteria
- [ ] Expo Go opens the app without a red screen on both iOS and Android simulators
- [ ] New user completes onboarding wizard (13 steps) and lands on TODAY tab
- [ ] TODAY tab shows all 4 brackets, live score updates, and CTA locks the checkin
- [ ] WEEK and TRENDS tabs show historical data (empty state < 7 days)
- [ ] MIRROR tab captures a photo and shows gallery
- [ ] YOU tab shows profile stats and all edit modals open
- [ ] All modal routes are reachable (no broken navigation)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx expo-doctor` shows no critical warnings

## Scope
### In Scope
- All 9 implementation phases described below
- All routes described in CLAUDE.md directory layout
- All HMC primitive components (StyleSheet-only, no NativeWind)
- All data hooks (TanStack Query), profile store (Zustand), score.ts
- Post-lock triggers (weekly/monthly review, returning-user)
- Local notification scheduling (expo-notifications)
- Camera + Supabase Storage upload (expo-camera + expo-image-picker)

### Out of Scope
- RevenueCat / react-native-purchases (paywall is a "coming soon" stub)
- react-native-svg (View-based charts only — not bundled in Expo Go SDK 54)
- Whoop OAuth integration (stub only)
- Google OAuth changes (existing implementation kept as-is)
- Supabase migrations (0001–0007 already written — do not modify)

---

## Codebase Context

### Source of Truth
**IMPORTANT**: The worktree starts from the `init` git commit which contains only the minimal scaffold. The full existing codebase lives in the main project working directory at `/Users/dzmitrypiskun/Documents/mobile-app/test-app`. The implementation agent must READ files from that path to understand patterns and port existing files to the worktree (which is at `/Users/dzmitrypiskun/.archon/workspaces/mobile-app/test-app/worktrees/archon/thread-be271229`).

### Key Files (main project path → worktree action)

| Source file (read from main project) | Worktree action |
|--------------------------------------|-----------------|
| `app/_layout.tsx` | PORT → update with font loading |
| `app/index.tsx` | PORT → update with onboarding guard |
| `app/(auth)/_layout.tsx` + all screens | PORT as-is (DO NOT CHANGE) |
| `app/(app)/_layout.tsx` | PORT → add onboarding_completed guard |
| `app/(app)/(tabs)/_layout.tsx` | REPLACE with 5-tab PrintTabBar |
| `app/(app)/(tabs)/index.tsx` | REPLACE with PrintToday UI |
| `app/(app)/(tabs)/profile.tsx` | DELETE (replaced by `you.tsx`) |
| `src/lib/supabase.ts` | PORT as-is |
| `src/lib/query-client.ts` | PORT as-is |
| `src/components/ui/Button.tsx` | PORT as-is |
| `src/components/ui/Input.tsx` | PORT as-is |
| `src/components/ui/Screen.tsx` | PORT as-is |
| `src/features/auth/**` | PORT as-is (DO NOT CHANGE) |
| `src/types/database.ts` | PORT → extend with full HMC types |
| `supabase/migrations/` | PORT as-is (reference only) |
| `global.css` | PORT as-is |
| `tailwind.config.js` | PORT as-is |
| `babel.config.js` | PORT as-is |
| `metro.config.js` | PORT as-is |
| `tsconfig.json` | PORT as-is |
| `.eslintrc.js` / `eslint.config.js` | PORT as-is |

### Patterns to Follow

**Zustand store pattern** (from `src/features/auth/store/auth-store.ts`):
```ts
import { create } from 'zustand';
type State = { field: Type; setField: (v: Type) => void };
export const useXStore = create<State>((set) => ({
  field: initial,
  setField: (v) => set({ field: v }),
}));
```

**API function pattern** (from `src/features/auth/api/sign-in.ts`):
```ts
type Result = { data: X; error: null } | { data: null; error: Error };
export async function doThing(...): Promise<Result> {
  const { data, error } = await supabase.from('table').select();
  if (error) return { data: null, error };
  return { data, error: null };
}
```

**Supabase RPC call pattern**:
```ts
const { data, error } = await supabase.rpc('function_name', { p_arg: value });
```

**StyleSheet component pattern** (for HMC components):
```ts
import { StyleSheet, View, Text } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';
export function ComponentName({ prop }: Props) {
  return <View style={styles.container}><Text style={styles.text}>{prop}</Text></View>;
}
const styles = StyleSheet.create({
  container: { ... },
  text: { fontFamily: fonts.mono, color: colors.textPrimary },
});
```

**TanStack Query hook pattern**:
```ts
import { useQuery } from '@tanstack/react-query';
export function useXxx() {
  return useQuery({ queryKey: ['xxx', userId], queryFn: () => fetchXxx(userId) });
}
```

**TanStack mutation pattern**:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
export function useXxxMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args) => callApi(args),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['xxx'] }),
  });
}
```

---

## Architecture

- **StyleSheet for all HMC components** — not NativeWind. NativeWind stays on auth screens only. Import colors from `@/lib/hmc-colors`.
- **No try/catch at call sites** — errors returned as discriminated unions `{ data, error }`.
- **No default exports on hooks/utils** — only screen components get default exports (Expo Router requirement).
- **@/ alias maps to src/** — verified in `tsconfig.json` paths.
- **Debounce 800ms on saveCheckin** — prevents flooding Supabase on every keystroke/tap.
- **perf_9to5 folded into execution_score** — the Slider10 value is added to execution bracket before calling `lock_checkin()` RPC. It's saved separately via upsert to `perf_9to5` column.
- **View-based charts** — no react-native-svg; bars and sparklines are proportional `View` rectangles.
- **Onboarding wizard is a single screen** with step state managed by `useState`. NOT multiple routes.
- **Modal stack** lives at `app/(app)/modal/` with a `_layout.tsx` using `presentation: 'modal'`.

---

## Task List

Execute phases in order. Complete and type-check after each phase before starting the next.

---

### PHASE 0 — Port existing base code to worktree

#### Task 0.1: Port all existing files
**Action**: READ each file from `/Users/dzmitrypiskun/Documents/mobile-app/test-app` and WRITE it to the worktree at `/Users/dzmitrypiskun/.archon/workspaces/mobile-app/test-app/worktrees/archon/thread-be271229`. Port every file listed in the Key Files table above marked "PORT as-is".

Files to port as-is (read source path, write to same relative path in worktree):
- `global.css`
- `nativewind-env.d.ts`
- `expo-env.d.ts`
- `babel.config.js`
- `metro.config.js`
- `tailwind.config.js`
- `.eslintrc.js`
- `eslint.config.js`
- `.prettierrc`
- `jest.config.js`
- `src/lib/supabase.ts`
- `src/lib/query-client.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Screen.tsx`
- `src/features/auth/api/oauth-google.ts`
- `src/features/auth/api/reset-password.ts`
- `src/features/auth/api/sign-in.ts`
- `src/features/auth/api/sign-out.ts`
- `src/features/auth/api/sign-up.ts`
- `src/features/auth/api/update-password.ts`
- `src/features/auth/hooks/use-auth.ts`
- `src/features/auth/schemas/auth-schemas.ts`
- `src/features/auth/store/auth-store.ts`
- `app/(auth)/_layout.tsx`
- `app/(auth)/forgot-password.tsx`
- `app/(auth)/reset-password.tsx`
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`
- `.env.example`
- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_hmc_profile.sql`
- `supabase/migrations/0003_hmc_habits.sql`
- `supabase/migrations/0004_hmc_checkins.sql`
- `supabase/migrations/0005_hmc_mirror.sql`
- `supabase/migrations/0006_hmc_reviews.sql`
- `supabase/migrations/0007_hmc_functions.sql`

Also port the existing app route files that will be updated (not as-is):
- `app/_layout.tsx` — will be updated in Phase 1
- `app/index.tsx` — will be updated in Phase 3
- `app/(app)/_layout.tsx` — will be updated in Phase 3
- `app/(app)/(tabs)/_layout.tsx` — will be replaced in Phase 1
- `app/(app)/(tabs)/index.tsx` — will be replaced in Phase 4
- `src/types/database.ts` — will be extended in Phase 2

Also port the test files:
- `__tests__/auth-schemas.test.ts`
- `__tests__/auth-store.test.ts`
- `__tests__/smoke.test.ts`

**Validate**: `ls src/features/auth/store/auth-store.ts` in worktree should exist.

---

### PHASE 1 — Foundation: Design tokens, fonts, primitives, score.ts, tab scaffold

**Goal**: App runs in Expo Go with 5 placeholder tabs, correct fonts, correct colors, all primitives renderable.

#### Task 1.1: Install font packages
**Action**: In worktree, run: `npx expo install expo-font @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono`
**Validate**: `package.json` contains `@expo-google-fonts/inter` and `@expo-google-fonts/jetbrains-mono`.

#### Task 1.2: CREATE `src/lib/hmc-colors.ts`
**Action**: Create the design token constants file.
```ts
import { StyleSheet } from 'react-native';

export const colors = {
  base: '#0A0A0B',
  elevated: '#111113',
  high: '#1A1A1D',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1A6',
  textTertiary: '#6B6B70',
  lineRegular: 'rgba(255,255,255,0.08)' as const,
  lineStrong: 'rgba(255,255,255,0.14)' as const,
  amber: '#FFB020',
  danger: '#FF453A',
} as const;

export const fonts = {
  display: 'Inter_400Regular',
  displayMedium: 'Inter_500Medium',
  displayBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const spacing = {
  pagePad: 20,
  sectionGap: 24,
  hairline: StyleSheet.hairlineWidth,
} as const;
```
**Validate**: `npx tsc --noEmit` passes.

#### Task 1.3: UPDATE `app/_layout.tsx` — add font loading
**Action**: Update the ported `app/_layout.tsx` to load Inter and JetBrains Mono fonts before rendering. Use `useFonts` from `expo-font`. Show `null` (splash stays up) until fonts are loaded.
```ts
import '../global.css';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```
**Validate**: `npx tsc --noEmit` passes.

#### Task 1.4: CREATE `src/components/hmc/Rule.tsx`
**Action**: Hairline horizontal separator.
```ts
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/hmc-colors';

export function Rule() {
  return <View style={styles.rule} />;
}
const styles = StyleSheet.create({
  rule: { height: spacing.hairline, backgroundColor: colors.lineRegular },
});
```

#### Task 1.5: CREATE `src/components/hmc/Eyebrow.tsx`
**Action**: Mono uppercase section label.
```ts
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = { label: string };
export function Eyebrow({ label }: Props) {
  return <Text style={styles.text}>{label.toUpperCase()}</Text>;
}
const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
});
```

#### Task 1.6: CREATE `src/components/hmc/BigNum.tsx`
**Action**: Large 104px tabular numeral. Amber when `highlight` is true.
```ts
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = { value: number; highlight?: boolean };
export function BigNum({ value, highlight = false }: Props) {
  return (
    <Text style={[styles.num, highlight && styles.amber]}>
      {value}
    </Text>
  );
}
const styles = StyleSheet.create({
  num: {
    fontFamily: fonts.monoBold,
    fontSize: 104,
    lineHeight: 116,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amber: { color: colors.amber },
});
```

#### Task 1.7: CREATE `src/components/hmc/HabitRow.tsx`
**Action**: Checkbox row with label and +N pts. Amber when checked.
```ts
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = {
  label: string;
  points: number;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function HabitRow({ label, points, checked, onToggle, disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked && <View style={styles.checkMark} />}
      </View>
      <Text style={[styles.label, checked && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.pts, checked && styles.ptsActive]}>+{points}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { borderColor: colors.amber, backgroundColor: colors.amber },
  checkMark: {
    width: 10,
    height: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.base,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  label: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.textSecondary },
  labelActive: { color: colors.textPrimary },
  pts: { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary },
  ptsActive: { color: colors.amber },
});
```

#### Task 1.8: CREATE `src/components/hmc/Step05.tsx`
**Action**: 0–5 integer stepper. `danger` prop for penalty items.
```ts
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  danger?: boolean;
  disabled?: boolean;
};

export function Step05({ label, value, onChange, danger = false, disabled = false }: Props) {
  const accent = danger ? colors.danger : colors.amber;
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: value === 0 ? colors.textTertiary : accent }]}>
            −
          </Text>
        </TouchableOpacity>
        <Text style={[styles.val, value > 0 && { color: accent }]}>{value}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onChange(Math.min(5, value + 1))}
          disabled={disabled || value === 5}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: value === 5 ? colors.textTertiary : accent }]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  label: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.textSecondary },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  btn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.monoBold, fontSize: 20 },
  val: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    minWidth: 20,
    textAlign: 'center',
  },
});
```

#### Task 1.9: CREATE `src/components/hmc/Slider10.tsx`
**Action**: 0–10 segmented bar for 9-to-5 performance. Tapping a segment sets value.
```ts
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = { value: number; onChange: (v: number) => void; disabled?: boolean };

export function Slider10({ value, onChange, disabled = false }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>9-TO-5</Text>
      <View style={styles.track}>
        {Array.from({ length: 11 }, (_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.segment, i <= value && i > 0 && styles.segmentActive]}
            onPress={() => !disabled && onChange(i)}
            activeOpacity={0.8}
          />
        ))}
      </View>
      <Text style={[styles.val, value > 0 && styles.valActive]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary, width: 48 },
  track: { flex: 1, flexDirection: 'row', gap: 3, height: 24, alignItems: 'center' },
  segment: { flex: 1, height: 8, borderRadius: 2, backgroundColor: colors.lineStrong },
  segmentActive: { backgroundColor: colors.amber },
  val: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
    width: 24,
    textAlign: 'right',
  },
  valActive: { color: colors.amber },
});
```

#### Task 1.10: CREATE `src/components/hmc/BracketBlock.tsx`
**Action**: Section wrapper — eyebrow + hairline + children + subtotal.
```ts
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from './Eyebrow';
import { Rule } from './Rule';

type Props = {
  title: string;
  subtotal: number;
  children: React.ReactNode;
  danger?: boolean;
};

export function BracketBlock({ title, subtotal, children, danger = false }: Props) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Eyebrow label={title} />
        <Text style={[styles.subtotal, danger && styles.danger]}>
          {danger ? `−${subtotal}` : `+${subtotal}`}
        </Text>
      </View>
      <Rule />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { paddingHorizontal: spacing.pagePad },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  subtotal: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  danger: { color: colors.danger },
  body: { paddingTop: 4 },
});
```

#### Task 1.11: CREATE `src/components/hmc/PrintBar.tsx`
**Action**: Top bar "HMC." left / "DAY X" right, with safe-area top padding.
```ts
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Rule } from './Rule';

type Props = { dayNumber: number };

export function PrintBar({ dayNumber }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <Text style={styles.logo}>HMC.</Text>
        <Text style={styles.day}>DAY {dayNumber}</Text>
      </View>
      <Rule />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.base,
    paddingHorizontal: spacing.pagePad,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: 8,
  },
  logo: { fontFamily: fonts.monoBold, fontSize: 18, color: colors.textPrimary, letterSpacing: 2 },
  day: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary, letterSpacing: 1.5 },
});
```

#### Task 1.12: CREATE `src/components/hmc/PrintTabBar.tsx`
**Action**: Custom tab bar component. Receives `BottomTabBarProps` from `@react-navigation/bottom-tabs`. Text-only labels, mono uppercase, amber underline on active tab.
```ts
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, spacing } from '@/lib/hmc-colors';

const TAB_LABELS: Record<string, string> = {
  index: 'TODAY',
  week: 'WEEK',
  trends: 'TRENDS',
  mirror: 'MIRROR',
  you: 'YOU',
};

export function PrintTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.topLine} />
      <View style={styles.tabs}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = TAB_LABELS[route.name] ?? route.name.toUpperCase();
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
              {isFocused && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  topLine: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong },
  tabs: { flexDirection: 'row', paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary },
  labelActive: { color: colors.amber },
  underline: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 2,
    backgroundColor: colors.amber,
    borderRadius: 1,
  },
});
```

#### Task 1.13: CREATE `src/components/hmc/BottomBar.tsx`
**Action**: Fixed-bottom CTA area.
```ts
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/lib/hmc-colors';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function BottomBar({ label, onPress, loading = false, disabled = false }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.pagePad }]}>
      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.base} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.pagePad,
    paddingTop: 12,
    backgroundColor: colors.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
  },
  btn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.lineStrong },
  label: {
    fontFamily: fonts.monoBold,
    fontSize: 15,
    color: colors.base,
    letterSpacing: 1,
  },
});
```

#### Task 1.14: CREATE `src/components/hmc/POCta.tsx`
**Action**: Onboarding CTA button.
```ts
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = { label: string; onPress: () => void; disabled?: boolean };
export function POCta({ label, onPress, disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>{label.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  disabled: { opacity: 0.4 },
  text: { fontFamily: fonts.monoBold, fontSize: 14, letterSpacing: 1.5, color: colors.base },
});
```

#### Task 1.15: CREATE `src/components/hmc/POBar.tsx`
**Action**: Onboarding progress bar (step N of 13).
```ts
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/lib/hmc-colors';

type Props = { step: number; total?: number };
export function POBar({ step, total = 13 }: Props) {
  const pct = Math.min((step / total) * 100, 100);
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.label}>{step}/{total}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: { flex: 1, height: 2, backgroundColor: colors.lineStrong, borderRadius: 1 },
  fill: { height: '100%', backgroundColor: colors.amber, borderRadius: 1 },
  label: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },
});
```

#### Task 1.16: CREATE `src/lib/score.ts`
**Action**: Pure compute function — no imports from React, no side effects.
```ts
type Habit = { id: string; points: number; enabled: boolean };
type Metric = { id: string };
type PenaltyItem = { id: string };

type CheckinState = {
  identityChecks: Record<string, boolean>;
  executionChecks: Record<string, boolean>;
  perf9to5: number;
  outcomeScores: Record<string, number>;
  penaltyScores: Record<string, number>;
  whoopScoreAdj: number;
  isLate: boolean;
};

export type ScoreResult = {
  identity: number;
  execution: number;
  outcome: number;
  penalty: number;
  whoopAdj: number;
  total: number;
};

export function computeScore(
  identityHabits: Habit[],
  executionHabits: Habit[],
  outcomes: Metric[],
  penalties: PenaltyItem[],
  state: CheckinState,
): ScoreResult {
  const identity = identityHabits
    .filter((h) => h.enabled && state.identityChecks[h.id])
    .reduce((sum, h) => sum + h.points, 0);

  const executionBase = executionHabits
    .filter((h) => h.enabled && state.executionChecks[h.id])
    .reduce((sum, h) => sum + h.points, 0);

  const execution = executionBase + state.perf9to5;

  const outcome = outcomes.reduce(
    (sum, m) => sum + (state.outcomeScores[m.id] ?? 0),
    0,
  );

  const penalty = penalties.reduce(
    (sum, p) => sum + (state.penaltyScores[p.id] ?? 0),
    0,
  );

  const lateAdj = state.isLate ? -10 : 0;
  const raw = identity + execution + outcome - penalty + state.whoopScoreAdj + lateAdj;
  const total = Math.max(0, raw);

  return { identity, execution, outcome, penalty, whoopAdj: state.whoopScoreAdj, total };
}
```
**Validate**: `npx tsc --noEmit` passes.

#### Task 1.17: REPLACE `app/(app)/(tabs)/_layout.tsx` — 5-tab PrintTabBar
**Action**: Remove the existing 2-tab layout. Replace with 5-tab layout using `PrintTabBar`.
```ts
import { Tabs } from 'expo-router';
import { PrintTabBar } from '@/components/hmc/PrintTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PrintTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
      <Tabs.Screen name="trends" options={{ title: 'Trends' }} />
      <Tabs.Screen name="mirror" options={{ title: 'Mirror' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
```

#### Task 1.18: CREATE placeholder tab screens
**Action**: Create these 4 new tab screens (plus replace the existing today screen). Each is a minimal placeholder with the correct dark background.

`app/(app)/(tabs)/week.tsx`, `trends.tsx`, `mirror.tsx`, `you.tsx` — all same shape:
```ts
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';
export default function XScreen() {
  return <View style={s.c}><Text style={s.t}>LABEL</Text></View>;
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center' }, t: { fontFamily: fonts.mono, color: colors.textTertiary, letterSpacing: 2 } });
```

Replace `app/(app)/(tabs)/index.tsx` with label "TODAY" using `colors.amber` for the text.

Also delete `app/(app)/(tabs)/profile.tsx` (replaced by `you.tsx`).

#### Task 1.19: CREATE `app/(app)/modal/_layout.tsx`
**Action**: Modal stack with sheet presentation.
```ts
import { Stack } from 'expo-router';
import { colors } from '@/lib/hmc-colors';
export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.elevated },
      }}
    />
  );
}
```

**Phase 1 Validation**: `npx tsc --noEmit` → 0 errors. Expo Go shows 5 tabs with custom tab bar, dark background, fonts loaded.

---

### PHASE 2 — Data Layer

**Goal**: All data hooks wired up and TypeScript-correct.

#### Task 2.1: UPDATE `src/types/database.ts` — full HMC schema
**Action**: Replace the placeholder with the complete HMC type definitions, modeled on migrations 0001–0006.

The file must export `Database` with `public.Tables` containing: `profiles` (all columns including HMC extensions), `habits`, `outcome_metrics`, `penalty_items`, `daily_checkins`, `mirror_photos`, `weekly_reviews`, `monthly_reviews`.

`public.Functions` must contain:
- `seed_default_habits`: Args `{ p_user_id: string }`, Returns `undefined`
- `lock_checkin`: Args `{ p_checkin_id: string; p_identity_score: number; p_execution_score: number; p_outcome_score: number; p_penalty_score: number }`, Returns `number`
- `get_user_stats`: Args `Record<string, never>`, Returns `Array<{ streak: number; day_count: number; lifetime_avg: number; best_score: number | null; best_date: string | null }>`
- `get_history`: Args `{ p_days?: number }`, Returns `Array<{ id: string; date: string; total_score: number; identity_score: number; execution_score: number; outcome_score: number; penalty_score: number; whoop_score_adj: number; reflection_win: string | null; reflection_broke: string | null; is_late_checkin: boolean }>`

Add convenience type aliases at the bottom:
```ts
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type OutcomeMetric = Database['public']['Tables']['outcome_metrics']['Row'];
export type PenaltyItem = Database['public']['Tables']['penalty_items']['Row'];
export type DailyCheckin = Database['public']['Tables']['daily_checkins']['Row'];
export type MirrorPhoto = Database['public']['Tables']['mirror_photos']['Row'];
export type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row'];
export type MonthlyReview = Database['public']['Tables']['monthly_reviews']['Row'];
```

**Validate**: `npx tsc --noEmit` passes.

#### Task 2.2: CREATE `src/store/profile-store.ts`
**Action**: Zustand store for profile (same pattern as `src/features/auth/store/auth-store.ts`).
```ts
import { create } from 'zustand';
import type { Profile } from '@/types/database';

type ProfileState = {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (p: Profile | null) => void;
  setLoading: (v: boolean) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (p) => set({ profile: p, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
}));
```

#### Task 2.3: CREATE `src/features/habits/use-config.ts`
**Action**: TanStack Query hook fetching all 3 config tables in parallel. Returns `{ identityHabits, executionHabits, outcomes, penalties }`.
```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Habit, OutcomeMetric, PenaltyItem } from '@/types/database';

async function fetchConfig(userId: string) {
  const [habitsRes, outcomesRes, penaltiesRes] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .order('sort_order'),
    supabase
      .from('outcome_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order'),
    supabase
      .from('penalty_items')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order'),
  ]);
  if (habitsRes.error) return { data: null, error: habitsRes.error };
  if (outcomesRes.error) return { data: null, error: outcomesRes.error };
  if (penaltiesRes.error) return { data: null, error: penaltiesRes.error };
  const habits = habitsRes.data as Habit[];
  return {
    data: {
      identityHabits: habits.filter((h) => h.type === 'identity'),
      executionHabits: habits.filter((h) => h.type === 'execution'),
      outcomes: outcomesRes.data as OutcomeMetric[],
      penalties: penaltiesRes.data as PenaltyItem[],
    },
    error: null,
  };
}

export function useConfig() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['config', user?.id],
    queryFn: () => fetchConfig(user!.id),
    enabled: !!user,
    select: (res) => res.data,
  });
}
```

#### Task 2.4: CREATE `src/features/checkin/use-checkin.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { DailyCheckin } from '@/types/database';

export function useCheckin() {
  const { user } = useAuth();
  const date = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ['checkin', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', date)
        .maybeSingle();
      if (error) return { data: null, error };
      return { data: data as DailyCheckin | null, error: null };
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
```

#### Task 2.5: CREATE `src/features/checkin/save-checkin.ts`
**Action**: Debounced upsert (800ms). Timer stored in `useRef`. Exports `useSaveCheckin`.
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { DailyCheckin } from '@/types/database';

type SavePayload = Partial<
  Pick<DailyCheckin,
    'identity_checks' | 'execution_checks' | 'perf_9to5' |
    'outcome_scores' | 'penalty_scores'>
>;

export function useSaveCheckin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: SavePayload) => {
      const date = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert(
          { user_id: user!.id, date, ...payload },
          { onConflict: 'user_id,date' },
        )
        .select()
        .single();
      if (error) return { data: null, error };
      return { data: data as DailyCheckin, error: null };
    },
    onSuccess: () => {
      const date = new Date().toISOString().slice(0, 10);
      qc.invalidateQueries({ queryKey: ['checkin', user?.id, date] });
    },
  });

  const save = useCallback(
    (payload: SavePayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => mutation.mutate(payload), 800);
    },
    [mutation],
  );

  return { save, isPending: mutation.isPending };
}
```

#### Task 2.6: CREATE `src/features/checkin/lock-checkin.ts`
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';

type LockArgs = {
  checkinId: string;
  identityScore: number;
  executionScore: number;
  outcomeScore: number;
  penaltyScore: number;
};

export function useLockCheckin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: LockArgs) => {
      const { data, error } = await supabase.rpc('lock_checkin', {
        p_checkin_id: args.checkinId,
        p_identity_score: args.identityScore,
        p_execution_score: args.executionScore,
        p_outcome_score: args.outcomeScore,
        p_penalty_score: args.penaltyScore,
      });
      if (error) return { data: null, error };
      return { data: data as number, error: null };
    },
    onSuccess: () => {
      const date = new Date().toISOString().slice(0, 10);
      qc.invalidateQueries({ queryKey: ['checkin', user?.id, date] });
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });
}
```

#### Task 2.7: CREATE `src/features/history/use-history.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function useHistory(days = 30) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['history', user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_history', { p_days: days });
      if (error) return { data: null, error };
      return { data: data ?? [], error: null };
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
```

**Phase 2 Validation**: `npx tsc --noEmit` → 0 errors.

---

### PHASE 3 — Routing & Onboarding

**Goal**: New users flow through the 13-step wizard. Guards redirect correctly.

#### Task 3.1: UPDATE `app/index.tsx` — 3-way routing guard
**Action**: Add profile loading and `onboarding_completed` branch.
```ts
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/hmc-colors';

export default function Index() {
  const { session, isInitialized } = useAuth();
  const { profile, isLoading, setProfile } = useProfileStore();

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session?.user?.id]);

  if (!isInitialized || (session && isLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!profile?.onboarding_completed) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(app)/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.base,
  },
});
```

#### Task 3.2: UPDATE `app/(app)/_layout.tsx` — add onboarding guard
```ts
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { colors } from '@/lib/hmc-colors';

export default function AppLayout() {
  const { session, isInitialized } = useAuth();
  const { profile, isLoading } = useProfileStore();

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!profile?.onboarding_completed) return <Redirect href="/(onboarding)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center' },
});
```

#### Task 3.3: CREATE `app/(onboarding)/_layout.tsx`
```ts
import { Stack } from 'expo-router';
import { colors } from '@/lib/hmc-colors';
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.base } }} />
  );
}
```

#### Task 3.4: CREATE `app/(onboarding)/index.tsx` — 13-step wizard
**Action**: Single screen, `useState<number>` for step (starts at 1). POBar at top shows progress. POCta at bottom advances step.

**Local state to track across steps**:
```ts
const [step, setStep] = useState(1);
const [name, setName] = useState(session?.user?.user_metadata?.full_name ?? '');
const [vision, setVision] = useState('');
const [identitySentence, setIdentitySentence] = useState('');
const [identityHabits, setIdentityHabits] = useState(DEFAULT_IDENTITY_HABITS);
const [executionHabits, setExecutionHabits] = useState(DEFAULT_EXECUTION_HABITS);
const [outcomes, setOutcomes] = useState(DEFAULT_OUTCOMES);
const [penalties, setPenalties] = useState(DEFAULT_PENALTIES);
const [reminderTime, setReminderTime] = useState('21:00');
const [isSaving, setIsSaving] = useState(false);
```

**Default arrays** (match DB seeds from 0007 function):
```ts
const DEFAULT_IDENTITY_HABITS = [
  { label: 'Wake On Time', points: 5 },
  { label: 'Visualization', points: 5 },
  { label: 'No BS Discipline', points: 5 },
  { label: 'Kept My Word', points: 5 },
];
const DEFAULT_EXECUTION_HABITS = [
  { label: 'Deep Work AM', points: 15 },
  { label: 'Evening Work', points: 10 },
  { label: 'Gym', points: 10 },
  { label: 'Learning', points: 5 },
  { label: 'Sales / Outreach', points: 5 },
  { label: 'Content / Brand', points: 5 },
  { label: 'Public Speaking', points: 5 },
];
const DEFAULT_OUTCOMES = [
  'Revenue / Deals', 'Authority / Content', 'Relationships', 'Mission Progress',
];
const DEFAULT_PENALTIES = ['Alcohol', 'Nicotine', 'Wasted Time'];
```

**renderStep switch**:
- Step 1: Welcome — large "HMC." text (72px mono), tagline "Score your day.\nBuild your legend." (Inter 22px textSecondary). POCta "BEGIN"
- Step 2: Name — Eyebrow "YOUR NAME", TextInput (dark bg, Inter, white text). POCta "NEXT"
- Step 3: Vision — Eyebrow "YOUR VISION", multiline TextInput. POCta "NEXT"
- Step 4: Identity sentence — Eyebrow "I AM", single TextInput with "I am " prefix label. POCta "NEXT"
- Step 5: Identity habits — Eyebrow "IDENTITY HABITS", FlatList of editable rows (label + pts). Add button at bottom. POCta "LOOKS GOOD"
- Step 6: Execution habits — Same for execution. POCta "LOOKS GOOD"
- Step 7: 9-to-5 explainer — Eyebrow "9-TO-5 SCORE", static text explaining the 0–10 slider. POCta "GOT IT"
- Step 8: Outcomes — Eyebrow "OUTCOMES (0–5 NIGHTLY)", list of up to 4 TextInput rows. Add row button. POCta "DONE"
- Step 9: Penalties — Eyebrow "PENALTIES (0–5, SUBTRACTED)", list of up to 3. POCta "DONE"
- Step 10: Whoop — Eyebrow "WHOOP INTEGRATION", text "Coming soon". POCta "SKIP FOR NOW"
- Step 11: Reminder time — Eyebrow "DAILY REMINDER", hour/minute selector (simple +/− steppers). POCta "SET REMINDER"
- Step 12: Day Zero receipt — Summary card. Eyebrow "YOUR CONFIG", show: name, vision (2 lines), identity sentence, habit counts, reminder time. POCta "LOCK IN MY CONFIG"
- Step 13: Completion — shows `<ActivityIndicator />` while saving. On mount, fire completion logic:

```ts
useEffect(() => {
  if (step !== 13) return;
  (async () => {
    setIsSaving(true);
    await supabase.from('profiles').update({
      full_name: name,
      identity_sentence: identitySentence,
      vision,
      reminder_time: reminderTime,
      onboarding_completed: true,
    }).eq('id', session!.user.id);
    await supabase.rpc('seed_default_habits', { p_user_id: session!.user.id });
    setProfile({ ...profile!, onboarding_completed: true });
    router.replace('/(app)/(tabs)');
  })();
}, [step]);
```

**Validate**: New user completes wizard and lands on TODAY tab. `npx tsc --noEmit` passes.

---

### PHASE 4 — TODAY Tab

**Goal**: Full scoring UI with live score computation and lock flow.

#### Task 4.1: REPLACE `app/(app)/(tabs)/index.tsx` — PrintToday
**Action**: Full implementation. Key points:

**State initialization from checkin data**:
```ts
const [identityChecks, setIdentityChecks] = useState<Record<string, boolean>>({});
const [executionChecks, setExecutionChecks] = useState<Record<string, boolean>>({});
const [perf9to5, setPerf9to5] = useState(0);
const [outcomeScores, setOutcomeScores] = useState<Record<string, number>>({});
const [penaltyScores, setPenaltyScores] = useState<Record<string, number>>({});

// Hydrate from checkin when it loads
useEffect(() => {
  if (!checkin) return;
  setIdentityChecks(checkin.identity_checks as Record<string, boolean> ?? {});
  setExecutionChecks(checkin.execution_checks as Record<string, boolean> ?? {});
  setPerf9to5(checkin.perf_9to5 ?? 0);
  setOutcomeScores(checkin.outcome_scores as Record<string, number> ?? {});
  setPenaltyScores(checkin.penalty_scores as Record<string, number> ?? {});
}, [checkin?.id]);
```

**Live score** (computed on every render):
```ts
const config = useConfig(); // { identityHabits, executionHabits, outcomes, penalties }
const score = config.data
  ? computeScore(
      config.data.identityHabits,
      config.data.executionHabits,
      config.data.outcomes,
      config.data.penalties,
      { identityChecks, executionChecks, perf9to5, outcomeScores, penaltyScores, whoopScoreAdj: checkin?.whoop_score_adj ?? 0, isLate },
    )
  : null;
```

**Auto-save on every state change**:
```ts
useEffect(() => {
  if (!config.data) return;
  save({ identity_checks: identityChecks, execution_checks: executionChecks, perf_9to5: perf9to5, outcome_scores: outcomeScores, penalty_scores: penaltyScores });
}, [identityChecks, executionChecks, perf9to5, outcomeScores, penaltyScores]);
```

**Late checkin detection**:
```ts
const isLate = useMemo(() => {
  if (!profile?.reminder_time) return false;
  const [rh, rm] = profile.reminder_time.split(':').map(Number);
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const minutesReminder = rh * 60 + rm;
  return minutesNow > minutesReminder + 30;
}, [profile?.reminder_time]);
```

**Lock flow**:
```ts
const handleLock = async () => {
  if (!checkin || !score) return;
  // Flush debounce immediately
  await supabase.from('daily_checkins').update({ perf_9to5: perf9to5 }).eq('id', checkin.id);
  lockCheckin.mutate({
    checkinId: checkin.id,
    identityScore: score.identity,
    executionScore: score.execution,
    outcomeScore: score.outcome,
    penaltyScore: score.penalty,
  });
};
```

**Post-lock check** (in `useLockCheckin` `onSuccess` or in a `useEffect` watching `checkin.is_locked`):
```ts
useEffect(() => {
  if (!checkin?.is_locked) return;
  const now = new Date();
  const isSunday = now.getDay() === 0;
  const isLastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() === now.getDate();
  if (isSunday) router.push('/(app)/modal/weekly-review');
  else if (isLastDay) router.push('/(app)/modal/monthly-review');
}, [checkin?.is_locked]);
```

**Returning-user check**:
```ts
useEffect(() => {
  if (!history || !history.length || checkin?.is_locked) return;
  const lastDate = history[0]?.date;
  if (!lastDate) return;
  const daysDiff = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
  if (daysDiff > 2) router.push('/(app)/modal/returning-user');
}, [history]);
```

**JSX structure** (ScrollView + fixed BottomBar):
```tsx
<View style={{ flex: 1, backgroundColor: colors.base }}>
  {isLate && (
    <View style={lateStyle}>
      <Text style={lateTextStyle}>LATE CHECK-IN · −10 PTS</Text>
    </View>
  )}
  <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
    <PrintBar dayNumber={(profile?.day_count ?? 0) + 1} />
    {profile?.identity_sentence && (
      <View style={sentenceStyle}>
        <Text style={sentenceTextStyle}>{profile.identity_sentence}</Text>
      </View>
    )}
    <BracketBlock title="IDENTITY" subtotal={score?.identity ?? 0}>
      {config.data?.identityHabits.map((h) => (
        <HabitRow key={h.id} label={h.label} points={h.points}
          checked={identityChecks[h.id] ?? false}
          onToggle={() => setIdentityChecks(prev => ({ ...prev, [h.id]: !prev[h.id] }))}
          disabled={checkin?.is_locked} />
      ))}
    </BracketBlock>
    <Rule />
    <BracketBlock title="EXECUTION" subtotal={score?.execution ?? 0}>
      {config.data?.executionHabits.map((h) => (
        <HabitRow key={h.id} label={h.label} points={h.points}
          checked={executionChecks[h.id] ?? false}
          onToggle={() => setExecutionChecks(prev => ({ ...prev, [h.id]: !prev[h.id] }))}
          disabled={checkin?.is_locked} />
      ))}
      <Slider10 value={perf9to5} onChange={setPerf9to5} disabled={checkin?.is_locked} />
    </BracketBlock>
    <Rule />
    <BracketBlock title="OUTCOMES" subtotal={score?.outcome ?? 0}>
      {config.data?.outcomes.map((m) => (
        <Step05 key={m.id} label={m.label}
          value={outcomeScores[m.id] ?? 0}
          onChange={(v) => setOutcomeScores(prev => ({ ...prev, [m.id]: v }))}
          disabled={checkin?.is_locked} />
      ))}
    </BracketBlock>
    <Rule />
    <BracketBlock title="PENALTY" subtotal={score?.penalty ?? 0} danger>
      {config.data?.penalties.map((p) => (
        <Step05 key={p.id} label={p.label}
          value={penaltyScores[p.id] ?? 0}
          onChange={(v) => setPenaltyScores(prev => ({ ...prev, [p.id]: v }))}
          danger disabled={checkin?.is_locked} />
      ))}
    </BracketBlock>
    <TouchableOpacity
      style={totalStyle}
      onPress={() => router.push({ pathname: '/(app)/modal/score-breakdown', params: { identity: score?.identity ?? 0, execution: score?.execution ?? 0, outcome: score?.outcome ?? 0, penalty: score?.penalty ?? 0, total: score?.total ?? 0 } })}
    >
      <Eyebrow label="TOTAL" />
      <BigNum value={score?.total ?? 0} highlight={checkin?.is_locked} />
      <Text style={hintStyle}>TAP FOR BREAKDOWN</Text>
    </TouchableOpacity>
  </ScrollView>
  {!checkin?.is_locked ? (
    <BottomBar
      label={`LOCK IN · ${score?.total ?? 0} PTS`}
      onPress={handleLock}
      loading={lockCheckin.isPending}
      disabled={!checkin || !score}
    />
  ) : (
    <View style={lockedBarStyle}>
      <Text style={lockedTextStyle}>LOCKED · {checkin.total_score} PTS</Text>
    </View>
  )}
</View>
```

#### Task 4.2: CREATE `app/(app)/modal/score-breakdown.tsx`
**Action**: Receives `identity`, `execution`, `outcome`, `penalty`, `total` as `useLocalSearchParams`. Shows 4 rows + total row.

**Phase 4 Validation**: Full scoring flow works. Score updates live. Lock CTA fires RPC. Locked state shows read-only. `npx tsc --noEmit` passes.

---

### PHASE 5 — WEEK + TRENDS Tabs

#### Task 5.1: REPLACE `app/(app)/(tabs)/week.tsx`
**Action**: Uses `useHistory(14)` for 2 weeks of data.

**Data derivation**:
```ts
const history = useHistory(14);
const rows = history.data ?? [];
const thisWeek = rows.slice(0, 7);
const lastWeek = rows.slice(7, 14);
const thisAvg = thisWeek.length ? Math.round(thisWeek.reduce((s, r) => s + r.total_score, 0) / thisWeek.length) : 0;
const lastAvg = lastWeek.length ? Math.round(lastWeek.reduce((s, r) => s + r.total_score, 0) / lastWeek.length) : 0;
const maxScore = Math.max(...thisWeek.map((r) => r.total_score), 1);
```

**7-bar chart**: `flexDirection: 'row'`, `alignItems: 'flex-end'`, height 80. Each bar: `height: (score / maxScore) * 80`, `width: '12%'`, backgroundColor: best bar = `colors.amber`, others fill proportional: use `colors.lineStrong` base but add subtle intensity. Below each bar: 3-letter day label (Mon etc).

**Bracket comparison table**: 4 rows × 2 columns using Views in a grid. Show this week avg / last week avg for each bracket.

**Day-by-day list**: `thisWeek.map()` rows with date + score. `onPress` → `router.push({ pathname: '/(app)/modal/week-day/[date]', params: { date: row.date } })`.

#### Task 5.2: REPLACE `app/(app)/(tabs)/trends.tsx`
**Action**: Range picker state toggles between 30 / 90 / 365. Uses `useHistory(days)`.

**Sparkline**: Row of thin Views, each `height: (score/maxScore) * 40`, amber if score >= avg else lineStrong. Wrap in `ScrollView horizontal` if many days.

**Empty state** if `history.data?.length ?? 0 < 7`: show centered Eyebrow "KEEP CHECKING IN" + subtext "Trends visible after 7 days".

**Habit consistency section**: Only shown if `days <= 30` and skip for now (return null / placeholder "Coming in a future update").

#### Task 5.3: CREATE `app/(app)/modal/week-day/[date].tsx`
**Action**: Receives `date` param. Queries `daily_checkins` for that date.
```ts
const { date } = useLocalSearchParams<{ date: string }>();
// fetch: supabase.from('daily_checkins').select('*').eq('user_id', user!.id).eq('date', date).maybeSingle()
```
Display: PrintBar-like header with "HMC. / {date}", 4 bracket score rows using BracketBlock (read-only), reflection fields (if non-null). Bottom "CLOSE" button.

**Phase 5 Validation**: Week/Trends tabs render. Day modal opens. `npx tsc --noEmit` passes.

---

### PHASE 6 — MIRROR Tab

#### Task 6.1: Install packages
**Action**: `npx expo install expo-camera expo-image-picker expo-file-system`

#### Task 6.2: CREATE `src/features/mirror/use-mirror.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { MirrorPhoto } from '@/types/database';

export function useMirror() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['mirror', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mirror_photos')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });
      if (error) return { data: null, error };
      return { data: data as MirrorPhoto[], error: null };
    },
    enabled: !!user,
    select: (res) => res.data,
  });
}
```

#### Task 6.3: CREATE `src/features/mirror/upload-photo.ts`
**Action**: Upload to Supabase Storage bucket `mirror-photos` and insert row.
```ts
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import type { MirrorPhoto } from '@/types/database';

export async function uploadMirrorPhoto(
  userId: string,
  localUri: string,
  date: string,
  dayNumber: number,
  checkinId?: string,
): Promise<{ data: MirrorPhoto | null; error: Error | null }> {
  const storagePath = `${userId}/${date}.jpg`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const { error: uploadError } = await supabase.storage
    .from('mirror-photos')
    .upload(storagePath, bytes, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) return { data: null, error: uploadError };

  const { data: { publicUrl } } = supabase.storage
    .from('mirror-photos')
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('mirror_photos')
    .upsert(
      {
        user_id: userId,
        checkin_id: checkinId ?? null,
        date,
        day_number: dayNumber,
        photo_url: publicUrl,
      },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single();
  if (error) return { data: null, error };
  return { data: data as MirrorPhoto, error: null };
}
```

#### Task 6.4: REPLACE `app/(app)/(tabs)/mirror.tsx`
**Action**: FlatList (2-column, numColumns=2) of mirror_photos with thumbnail, date, score. Header row with "CAPTURE +" button. Empty state. Tap photo → `router.push({ pathname: '/(app)/modal/mirror-day/[date]', params: { date: photo.date } })`.

Use `Image` from `react-native` for thumbnails. Width = `(SCREEN_WIDTH - 40 - 8) / 2`. Height = width * 1.25 (portrait 4:5).

#### Task 6.5: CREATE `app/(app)/modal/mirror-capture.tsx`
**Action**: Camera modal using `expo-camera`.
1. On mount: `Camera.requestCameraPermissionsAsync()`. If denied, show "Camera permission required" text + close button.
2. Render `<CameraView facing="front" ref={cameraRef} style={{ flex: 1 }} />`.
3. Capture button: `await cameraRef.current.takePictureAsync({ quality: 0.8 })` → sets `capturedUri` state.
4. Preview state: show `<Image source={{ uri: capturedUri }} />` + "USE PHOTO" / "RETAKE" buttons.
5. On "USE PHOTO": call `uploadMirrorPhoto`, invalidate `['mirror']` query, `router.back()`.

#### Task 6.6: CREATE `app/(app)/modal/mirror-day/[date].tsx`
**Action**: Full-screen photo + score overlay.
```ts
const { date } = useLocalSearchParams<{ date: string }>();
// fetch photo + checkin for that date
```
Show `Image` fullscreen, overlay at bottom with date, score (JetBrains Mono). Close button top-right.

**Phase 6 Validation**: Camera opens, photo captured, appears in grid. `npx tsc --noEmit` passes.

---

### PHASE 7 — YOU Tab + Edit Modals

#### Task 7.1: REPLACE `app/(app)/(tabs)/you.tsx`
**Action**: Profile screen. Fetches stats via RPC.
```ts
const { data: stats } = useQuery({
  queryKey: ['stats', user?.id],
  queryFn: async () => {
    const { data, error } = await supabase.rpc('get_user_stats');
    if (error) return null;
    return data?.[0] ?? null;
  },
  enabled: !!user,
});
```

Layout (wrapped in `ScrollView`, `backgroundColor: colors.base`):
1. Header section: name (Inter Bold 22px), identity sentence (textSecondary)
2. Stats row: STREAK, DAYS, AVG — each in a `View` with `flex: 1`, Eyebrow above, value below (JetBrains Mono 28px)
3. Rule
4. Eyebrow "YOUR IDENTITY" → tap row to `/(app)/modal/edit-identity-sentence`
5. Rule
6. Eyebrow "HABITS & SCORING" → 4 tap rows: edit identity habits, edit execution habits, edit outcomes, edit penalties
7. Rule
8. Eyebrow "INTEGRATIONS" → Whoop row (status indicator)
9. Rule
10. Eyebrow "ACCOUNT" → subscription, notifications, privacy/data, sign out

#### Task 7.2: CREATE `app/(app)/modal/edit-identity-sentence.tsx`
TextInput pre-filled from `profile.identity_sentence`. Save = update Supabase + `setProfile`. `router.back()`.

#### Task 7.3: CREATE `app/(app)/modal/edit-habits.tsx`
`?type=identity|execution` param. FlatList of habit rows with inline editing. Add/delete. Save batch upsert.

#### Task 7.4: CREATE `app/(app)/modal/edit-outcomes.tsx`
Editable list of `outcome_metrics`. Add/delete. No points column.

#### Task 7.5: CREATE `app/(app)/modal/edit-penalties.tsx`
Editable list of `penalty_items`. Add/delete.

#### Task 7.6: CREATE `app/(app)/modal/signout-confirm.tsx`
Confirmation sheet. "SIGN OUT" → `signOut()` + `router.replace('/(auth)/sign-in')`.

#### Task 7.7: CREATE `app/(app)/modal/notification-settings.tsx`
Time picker for reminder_time. Save = update profile column.

**Phase 7 Validation**: YOU tab renders stats. All edit modals open and save. `npx tsc --noEmit` passes.

---

### PHASE 8 — Post-lock Triggers + Notifications

#### Task 8.1: Install expo-notifications
**Action**: `npx expo install expo-notifications`

#### Task 8.2: CREATE `src/features/notifications/schedule-reminder.ts`
```ts
import * as Notifications from 'expo-notifications';

export async function scheduleReminder(time: string): Promise<void> {
  const [hour, minute] = time.split(':').map(Number);
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'HMC Check-In',
      body: 'Time to score your day.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
```

#### Task 8.3: Wire scheduleReminder into onboarding + notification-settings
- In `app/(onboarding)/index.tsx` step 13 completion: `await scheduleReminder(reminderTime)` after profile update.
- In `app/(app)/modal/notification-settings.tsx` save handler: call `scheduleReminder(newTime)`.

#### Task 8.4: Add post-lock triggers to `app/(app)/(tabs)/index.tsx`
Already covered in Task 4.1 (`useEffect` watching `checkin?.is_locked`). Verify it's present.

#### Task 8.5: CREATE `app/(app)/modal/weekly-review.tsx`
Three TextInput fields: "Big win this week", "Biggest challenge", "Intention for next week". Save upserts to `weekly_reviews`. `router.back()`.

#### Task 8.6: CREATE `app/(app)/modal/monthly-review.tsx`
Two fields: "Month reflection", "Verdict". Upserts to `monthly_reviews`. `router.back()`.

#### Task 8.7: CREATE `app/(app)/modal/returning-user.tsx`
"Welcome back" modal. Shows days-since. "LET'S GO" → `router.back()`.

**Phase 8 Validation**: Post-lock triggers route correctly. Notifications schedule. `npx tsc --noEmit` passes.

---

### PHASE 9 — Stub Modals

**Goal**: All navigation destinations resolve without crashes.

#### Task 9.1: CREATE `app/(app)/modal/paywall.tsx`
"PREMIUM — COMING SOON" stub. Close button.

#### Task 9.2: CREATE `app/(app)/modal/manage-subscription.tsx`
Shows `profile.subscription_status` + trial_ends_at. "COMING SOON" note. Close button.

#### Task 9.3: CREATE `app/(app)/modal/privacy-data.tsx`
Two rows: "Export my data" (placeholder tap) and "Delete account" (danger color, placeholder). Close button.

#### Task 9.4: CREATE `app/(app)/modal/whoop-connect.tsx`
"WHOOP INTEGRATION — COMING SOON" stub. Close button.

For all stubs, use the same structure:
```ts
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
export default function StubScreen() {
  return (
    <View style={styles.c}>
      <Eyebrow label="LABEL" />
      <Text style={styles.body}>Coming soon.</Text>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Text style={styles.closeText}>CLOSE</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.pagePad },
  body: { fontFamily: fonts.display, color: colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 16 },
  close: { marginTop: 32, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.lineStrong },
  closeText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.textSecondary },
});
```

**Phase 9 Validation**: All modal routes navigate without crashes. Final `npx tsc --noEmit` → 0 errors. `npx expo-doctor` — no critical warnings.

---

## Testing

#### CREATE `__tests__/score.test.ts`
```ts
import { computeScore } from '../src/lib/score';

const idHabits = [
  { id: 'a', points: 10, enabled: true },
  { id: 'b', points: 5, enabled: true },
];
const exHabits = [{ id: 'c', points: 15, enabled: true }];
const outcomes = [{ id: 'o1' }, { id: 'o2' }];
const penalties = [{ id: 'p1' }];

describe('computeScore', () => {
  it('sums identity + execution + outcome - penalty', () => {
    const r = computeScore(idHabits, exHabits, outcomes, penalties, {
      identityChecks: { a: true },
      executionChecks: { c: true },
      perf9to5: 5,
      outcomeScores: { o1: 3, o2: 2 },
      penaltyScores: { p1: 1 },
      whoopScoreAdj: 0,
      isLate: false,
    });
    expect(r.identity).toBe(10);
    expect(r.execution).toBe(20); // 15 habit + 5 perf
    expect(r.outcome).toBe(5);
    expect(r.penalty).toBe(1);
    expect(r.total).toBe(34);
  });

  it('subtracts 10 for late checkin', () => {
    const r = computeScore(idHabits, [], outcomes, penalties, {
      identityChecks: { a: true },
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: {},
      whoopScoreAdj: 0,
      isLate: true,
    });
    expect(r.total).toBe(0); // 10 - 10 = 0
  });

  it('floors total at 0', () => {
    const r = computeScore([], [], outcomes, penalties, {
      identityChecks: {},
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: { p1: 5 },
      whoopScoreAdj: 0,
      isLate: true,
    });
    expect(r.total).toBe(0);
  });

  it('adds whoopScoreAdj to total', () => {
    const r = computeScore([], [], outcomes, penalties, {
      identityChecks: {},
      executionChecks: {},
      perf9to5: 0,
      outcomeScores: {},
      penaltyScores: {},
      whoopScoreAdj: 8,
      isLate: false,
    });
    expect(r.total).toBe(8);
  });
});
```

---

## Validation Commands

1. Type check: `npx tsc --noEmit`
2. Tests: `npx jest`
3. Expo doctor: `npx expo-doctor`
4. Run: `npx expo start` (test in Expo Go)

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase migrations 0002–0007 not applied to remote | HIGH | Run migrations in Supabase dashboard before testing data hooks |
| `expo-camera` API differences in SDK 54 | MED | Use `CameraView` API (SDK 50+) not deprecated `Camera` class |
| `atob` not available in React Native Hermes | MED | Use `Buffer.from(b64, 'base64')` if `atob` throws |
| Profile store `isLoading: true` on first load causes infinite spinner if profile fetch fails | MED | Add timeout/error state: if fetch errors, setProfile(null) which triggers onboarding redirect |
| Worktree missing committed files | HIGH | Phase 0 explicitly ports all files from main project working dir |
| Onboarding step 13 writes to Supabase before habits seeded | LOW | `seed_default_habits` is idempotent; RPC call order doesn't matter |
