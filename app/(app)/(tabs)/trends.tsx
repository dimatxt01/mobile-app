import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useHistory, type HistoryRow } from '@/features/history/use-history';
import { useConfig } from '@/features/habits/use-config';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { PrintBar } from '@/components/hmc/PrintBar';
import { BigNum } from '@/components/hmc/BigNum';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';

const RANGES = [30, 90, 365] as const;
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

  // Align grid start to Monday, 4 weeks back
  const dayOfWeek = today.getDay(); // 0=Sun
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - daysFromMonday - 21); // go back to monday 4 weeks ago

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

export default function TrendsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const { data: history } = useHistory(days);
  const config = useConfig();
  const rows = history ?? [];

  const { data: checkinHabits } = useQuery({
    queryKey: ['habit-consistency', user?.id, days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data } = await supabase
        .from('daily_checkins')
        .select('identity_checks, execution_checks')
        .eq('user_id', user!.id)
        .gte('date', since.toISOString().slice(0, 10))
        .eq('is_locked', true);
      return (data ?? []) as Array<{
        identity_checks: Record<string, boolean>;
        execution_checks: Record<string, boolean>;
      }>;
    },
    enabled: !!user && rows.length >= 7,
  });

  const habitConsistency = useMemo(() => {
    if (!config.data || !checkinHabits || checkinHabits.length === 0) return [];
    const total = checkinHabits.length;
    const allHabits = [
      ...config.data.identityHabits.map((h) => ({ ...h, kind: 'identity' as const })),
      ...config.data.executionHabits.map((h) => ({ ...h, kind: 'execution' as const })),
    ];
    return allHabits
      .map((h) => {
        const count = checkinHabits.filter((c) => {
          const checks = h.kind === 'identity' ? c.identity_checks : c.execution_checks;
          return checks?.[h.id] === true;
        }).length;
        return { label: h.label, pct: Math.round((count / total) * 100) };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }, [config.data, checkinHabits]);

  if (rows.length < 7) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <PrintBar />
        <Eyebrow label="KEEP CHECKING IN" />
        <Text style={styles.emptyText}>Trends visible after 7 days.</Text>
      </View>
    );
  }

  const avg = Math.round(rows.reduce((s, r) => s + r.total_score, 0) / rows.length);
  const maxScore = Math.max(...rows.map((r) => r.total_score), 1);
  const best = rows.reduce((b, r) => (r.total_score > b.total_score ? r : b), rows[0]!);
  const rangeLabel = days === 365 ? '1Y' : `${days}D`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <PrintBar right={rangeLabel} />

      {/* Range selector */}
      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setDays(r)}
            style={styles.rangeBtn}
          >
            <Text style={[styles.rangeBtnText, days === r && styles.rangeBtnActive]}>
              {r === 365 ? '1Y' : `${r}D`}
            </Text>
            {days === r && <View style={styles.rangeUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <Rule strong />

      {/* Avg hero */}
      <View style={styles.avgBlock}>
        <Eyebrow label="AVERAGE" />
        <View style={styles.avgRow}>
          <BigNum value={avg} highlight={false} />
          <View style={styles.avgMeta}>
            <Text style={styles.bestLabel}>BEST: {best.total_score}</Text>
            <Text style={styles.bestDate}>{best.date.slice(5)}</Text>
          </View>
        </View>
      </View>

      <Rule />

      {/* Sparkline — View-based bars */}
      <View style={styles.section}>
        <Eyebrow label="SCORE OVER TIME" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sparkScroll}>
          <View style={styles.sparkRow}>
            {rows
              .slice()
              .reverse()
              .map((r) => {
                const h = (r.total_score / maxScore) * 56;
                return (
                  <View
                    key={r.id}
                    style={[
                      styles.sparkBar,
                      {
                        height: Math.max(h, 2),
                        backgroundColor: r.total_score >= avg ? colors.amber : colors.lineStrong,
                      },
                    ]}
                  />
                );
              })}
          </View>
        </ScrollView>
      </View>

      <Rule />

      {/* Calendar heatmap */}
      <View style={styles.section}>
        <Eyebrow label="CALENDAR" />
        <View style={styles.calendarWrap}>
          <CalendarHeatmap rows={rows} />
        </View>
      </View>

      <Rule />

      {/* Habit consistency */}
      {habitConsistency.length > 0 && (
        <View style={styles.section}>
          <Eyebrow label={`HABIT CONSISTENCY · ${rangeLabel}`} />
          {habitConsistency.map((h, i) => (
            <View
              key={h.label}
              style={[styles.habitRow, i === habitConsistency.length - 1 && styles.habitRowLast]}
            >
              <View style={styles.habitTop}>
                <Text style={styles.habitLabel}>{h.label}</Text>
                <Text style={styles.habitPct}>{h.pct}%</Text>
              </View>
              <View style={styles.habitBar}>
                <View style={[styles.habitBarFill, { width: `${h.pct}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      <Rule />

      {/* Bracket averages */}
      <View style={styles.section}>
        <Eyebrow label="BRACKET AVERAGES" />
        {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket, i, arr) => {
          const bracketAvg = Math.round(
            rows.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / rows.length,
          );
          return (
            <View
              key={bracket}
              style={[styles.bracketRow, i === arr.length - 1 && styles.bracketRowLast]}
            >
              <Text style={styles.bracketLabel}>{bracket.toUpperCase()}</Text>
              <Text style={styles.bracketValue}>{bracketAvg}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  centered: { alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 10,
    gap: 20,
  },
  rangeBtn: { alignItems: 'center', position: 'relative' },
  rangeBtnText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    paddingBottom: 4,
  },
  rangeBtnActive: { color: colors.textPrimary, fontWeight: '600' },
  rangeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.amber,
  },
  avgBlock: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 20,
  },
  avgRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  avgMeta: { alignItems: 'flex-end', paddingBottom: 8, gap: 4 },
  bestLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2, color: colors.amber },
  bestDate: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  section: { paddingHorizontal: spacing.pagePad, paddingVertical: 16 },
  sparkScroll: { marginTop: 14 },
  sparkRow: { flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 2 },
  sparkBar: { width: 4, borderRadius: 1 },
  calendarWrap: { marginTop: 14 },
  habitRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  habitRowLast: { borderBottomWidth: 0 },
  habitTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  habitLabel: { fontFamily: fonts.display, fontSize: 14, color: colors.textPrimary },
  habitPct: {
    fontFamily: fonts.monoBold,
    fontSize: 12,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  habitBar: {
    height: 2,
    backgroundColor: colors.lineRegular,
  },
  habitBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.amber,
  },
  bracketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  bracketRowLast: { borderBottomWidth: 0 },
  bracketLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary },
  bracketValue: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
