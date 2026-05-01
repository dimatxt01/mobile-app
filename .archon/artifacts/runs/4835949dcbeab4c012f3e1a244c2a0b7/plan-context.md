# Plan Context

**Generated**: 2026-05-01 00:00
**Workflow ID**: 4835949dcbeab4c012f3e1a244c2a0b7
**Plan Source**: `.archon/artifacts/runs/4835949dcbeab4c012f3e1a244c2a0b7/plan.md`

---

## Branch

| Field      | Value                  |
| ---------- | ---------------------- |
| **Branch** | archon/thread-11bc3c07 |
| **Base**   | main                   |
| **Repo**   | dimatxt01/mobile-app   |

---

## Plan Summary

**Title**: Sprint 1 Design Audit — HMC Color Tokens, Today Tab, You Tab, Button Glow

**Overview**: Adds 6 missing semantic color tokens to the design system, enhances the Today tab with an identity eyebrow label and delta-vs-yesterday indicator, overhauls the You tab with a Best stat / inline identity edit / score-density toggle / footer, and adds an amber glow shadow to the primary BottomBar CTA button. All changes use existing `StyleSheet.create` + `hmc-colors.ts` patterns.

---

## Files to Change

| File                               | Action | Justification                                           |
| ---------------------------------- | ------ | ------------------------------------------------------- |
| `src/lib/hmc-colors.ts`            | UPDATE | Add 6 new semantic color tokens                         |
| `src/lib/score-density.ts`         | CREATE | New hook for score display preference (AsyncStorage)    |
| `src/components/hmc/BottomBar.tsx` | UPDATE | Add accentGlow shadow to `styles.btn`                   |
| `app/(app)/(tabs)/index.tsx`       | UPDATE | Eyebrow above sentence, delta below BigNum, hook import |
| `app/(app)/(tabs)/you.tsx`         | UPDATE | Best stat, identity section, DISPLAY section, footer    |

**Dependency install required first**: `@react-native-async-storage/async-storage` via `npx expo install`

---

## NOT Building (Scope Limits)

**CRITICAL FOR REVIEWERS**: These items are **intentionally excluded** from scope. Do NOT flag them as bugs or missing features.

- Ring and Breakdown rendering variants on the Today screen — only reads the density value, no rendering change this sprint
- Any new Supabase queries beyond the existing `useHistory(14)` call already in Today
- Changes to auth flows, onboarding, or any screen other than Today (`index.tsx`) and You (`you.tsx`)
- Navigation structure changes, new routes, or new modals
- The `bgHigher` token is added to the token file but NOT consumed by any component in this sprint (reserved for future use)

---

## Validation Commands

```bash
# After each task:
npx tsc --noEmit

# Final gate before PR:
npx expo export --platform ios
```

**EXPECT**: `npx tsc --noEmit` exits 0 with zero diagnostics. `npx expo export` exits with `✓ Export was successful`.

---

## Acceptance Criteria

- [ ] All 6 color tokens added to `hmc-colors.ts` with correct types
- [ ] `src/lib/score-density.ts` exists and exports `useScoreDensity` hook and `ScoreDensity` type
- [ ] Today screen: "TODAY, I AM" Eyebrow above identity sentence
- [ ] Today screen: delta row appears when prior day exists; hidden when no prior day
- [ ] Today screen: BottomBar amber button has accentGlow shadow
- [ ] You screen: BEST stat (value + date) replaces DAYS
- [ ] You screen: YOUR IDENTITY section shows sentence text + amber edit button
- [ ] You screen: DISPLAY section with pill toggle above HABITS & SCORING
- [ ] You screen: footer at bottom of ScrollView
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx expo export --platform ios` exits 0

---

## Patterns to Mirror

| Pattern               | Source File                           | Lines   |
| --------------------- | ------------------------------------- | ------- |
| Color token shape     | `src/lib/hmc-colors.ts`               | 1–29    |
| StyleSheet.create     | `app/(app)/(tabs)/index.tsx`          | 218–265 |
| useMemo derivation    | `app/(app)/(tabs)/index.tsx`          | 47–56   |
| useHistory hook       | `src/features/history/use-history.ts` | 20–32   |
| Conditional style arr | `src/components/hmc/HabitRow.tsx`     | 42–43   |
| router.push modal     | `app/(app)/(tabs)/you.tsx`            | ~82     |

---

## Task Execution Order

1. **Task 0** — Install `@react-native-async-storage/async-storage` (`npx expo install`)
2. **Task 1** — UPDATE `src/lib/hmc-colors.ts` — add 6 tokens
3. **Task 2** — CREATE `src/lib/score-density.ts` — `useScoreDensity` hook
4. **Task 3** — UPDATE `src/components/hmc/BottomBar.tsx` — shadow on `styles.btn`
5. **Task 4** — UPDATE `app/(app)/(tabs)/index.tsx` — Eyebrow, delta, hook import
6. **Task 5** — UPDATE `app/(app)/(tabs)/you.tsx` — Best stat, identity section, DISPLAY, footer
7. **Task 6** — Final validation: `npx tsc --noEmit` + `npx expo export --platform ios`

**GOTCHA**: Tasks 4 and 5 reference `colors.accentMuted`, `colors.accentDim`, `colors.accentGlow`, `colors.textQuiet` — these tokens only exist after Task 1. Run tasks strictly in order.

---

## Key Implementation Notes

- `AsyncStorage.getItem` is async — use `.then()` chaining in `useEffect`, not `await` directly
- Delta in Today: `history.find(r => r.date < todayStr)` skips today's locked row if present
- `scoreDensity` variable in Today is intentionally unused in JSX this sprint; add `void scoreDensity;` to silence ESLint if needed
- `TouchableOpacity` in you.tsx is already imported — no duplicate import needed
- `navRow` helper and its styles in you.tsx must NOT be removed — still used by HABITS, INTEGRATIONS, ACCOUNT sections
- `fmtDate` in you.tsx is a module-level helper (not a hook), no `useMemo` needed
- Shadow on React Native: `shadowOpacity: 1` combined with RGBA in `shadowColor` gives correct opacity
- `bgHigher` token is added but intentionally unused — do not flag as dead code

---

## Next Steps

1. `archon-confirm-plan` — Verify files and patterns referenced in plan still exist
2. `archon-implement-tasks` — Execute Tasks 0–6 in order
3. `archon-validate` — Run `npx tsc --noEmit` + `npx expo export --platform ios`
4. `archon-finalize-pr` — Create PR against `main` on `dimatxt01/mobile-app`
