import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useHistory } from '@/features/history/use-history';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { PrintBar } from '@/components/hmc/PrintBar';
import { BigNum } from '@/components/hmc/BigNum';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

export default function WeekScreen() {
  const { data: history } = useHistory(14);
  const rows = history ?? [];
  const thisWeek = rows.slice(0, 7);
  const lastWeek = rows.slice(7, 14);
  const thisAvg = thisWeek.length
    ? Math.round(thisWeek.reduce((s, r) => s + r.total_score, 0) / thisWeek.length)
    : 0;
  const lastAvg = lastWeek.length
    ? Math.round(lastWeek.reduce((s, r) => s + r.total_score, 0) / lastWeek.length)
    : 0;
  const weekDelta = lastAvg > 0 ? thisAvg - lastAvg : null;
  const maxScore = Math.max(...thisWeek.map((r) => r.total_score), 1);
  const bestIdx = thisWeek.reduce(
    (bi, r, i) => (r.total_score > (thisWeek[bi]?.total_score ?? 0) ? i : bi),
    0,
  );
  const weekNumber = getWeekNumber(new Date());

  if (!rows.length) {
    return (
      <View style={styles.container}>
        <PrintBar right={`WK ${weekNumber}`} />
        <View style={styles.centered}>
          <Eyebrow label="NO DATA YET" />
          <Text style={styles.emptyText}>Complete your first check-in to see weekly data.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <PrintBar right={`WK ${weekNumber}`} />

      {/* Week average hero */}
      <View style={styles.avgBlock}>
        <Eyebrow label="WEEK AVERAGE" />
        <View style={styles.avgRow}>
          <BigNum value={thisAvg} highlight={false} />
          <View style={styles.avgMeta}>
            {weekDelta !== null && (
              <Text style={[styles.deltaText, weekDelta >= 0 ? styles.deltaPos : styles.deltaNeg]}>
                {weekDelta >= 0 ? '+' : ''}{weekDelta} VS LAST WK
              </Text>
            )}
            {thisWeek[bestIdx] && (
              <Text style={styles.bestText}>
                BEST: {DAY_LABELS[new Date(thisWeek[bestIdx]!.date + 'T00:00:00').getDay()] ?? '—'} · {thisWeek[bestIdx]!.total_score}
              </Text>
            )}
          </View>
        </View>
      </View>

      <Rule strong />

      {/* Bar chart */}
      <View style={styles.chartSection}>
        <Eyebrow label="DAILY TOTALS" />
        <View style={styles.chart}>
          {thisWeek.map((r, i) => {
            const h = (r.total_score / maxScore) * 100;
            const dayDate = new Date(r.date + 'T00:00:00');
            const dayLabel = DAY_LABELS[dayDate.getDay()] ?? '';
            return (
              <View key={r.id} style={styles.barCol}>
                <Text style={styles.barScore}>{r.total_score}</Text>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(h, 4) },
                    i === bestIdx ? styles.barBest : styles.barNormal,
                  ]}
                />
                <Text style={styles.barLabel}>{dayLabel[0]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Rule />

      {/* Bracket comparison */}
      <View style={styles.section}>
        <View style={styles.bracketHeader}>
          <Text style={[styles.bracketCol, styles.bracketLabelText]} />
          <Text style={[styles.bracketCol, styles.bracketValue]}>THIS</Text>
          <Text style={[styles.bracketCol, styles.bracketValue]}>LAST</Text>
          <Text style={[styles.bracketCol, styles.bracketValue]}>Δ</Text>
        </View>
        {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket) => {
          const thisVal = thisWeek.length
            ? Math.round(thisWeek.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / thisWeek.length)
            : 0;
          const lastVal = lastWeek.length
            ? Math.round(lastWeek.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / lastWeek.length)
            : 0;
          const d = lastVal > 0 ? thisVal - lastVal : null;
          return (
            <View key={bracket} style={styles.bracketRow}>
              <Text style={[styles.bracketCol, styles.bracketLabelText]}>{bracket.toUpperCase()}</Text>
              <Text style={[styles.bracketCol, styles.bracketValue]}>{thisVal}</Text>
              <Text style={[styles.bracketCol, styles.bracketDim]}>{lastVal || '—'}</Text>
              {d !== null ? (
                <Text style={[styles.bracketCol, styles.bracketValue, d >= 0 ? styles.deltaPos : styles.deltaNeg]}>
                  {d >= 0 ? '+' : ''}{d}
                </Text>
              ) : (
                <Text style={[styles.bracketCol, styles.bracketDim]}>—</Text>
              )}
            </View>
          );
        })}
      </View>

      <Rule />

      {/* Day by day */}
      <View style={styles.section}>
        <Eyebrow label="DAY BY DAY" />
        {thisWeek.map((r, i) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.dayRow, i === thisWeek.length - 1 && styles.dayRowLast]}
            onPress={() =>
              router.push({ pathname: '/(app)/modal/week-day/[date]', params: { date: r.date } })
            }
          >
            <View style={styles.dayLeft}>
              <Text style={styles.dayDate}>
                {DAY_LABELS[new Date(r.date + 'T00:00:00').getDay()] ?? r.date} · <Text style={styles.dayDateMono}>{r.date.slice(5)}</Text>
              </Text>
              {r.reflection_win ? (
                <Text style={styles.dayWin} numberOfLines={1}>{r.reflection_win}</Text>
              ) : null}
            </View>
            <Text style={styles.dayScore}>{r.total_score}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.pagePad, paddingTop: 60 },
  emptyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  avgBlock: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineStrong,
  },
  avgRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  avgMeta: { alignItems: 'flex-end', paddingBottom: 8, gap: 4 },
  deltaText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2 },
  deltaPos: { color: colors.amber },
  deltaNeg: { color: colors.danger },
  bestText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.textTertiary },
  chartSection: { paddingHorizontal: spacing.pagePad, paddingTop: 20, paddingBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6, marginTop: 14 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barScore: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  bar: { width: '80%', borderRadius: 2 },
  barBest: { backgroundColor: colors.amber },
  barNormal: { backgroundColor: colors.lineStrong },
  barLabel: { fontFamily: fonts.mono, fontSize: 9, color: colors.textTertiary, letterSpacing: 1 },
  section: { paddingHorizontal: spacing.pagePad, paddingVertical: 16 },
  bracketHeader: { flexDirection: 'row', marginBottom: 6 },
  bracketRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  bracketCol: { flex: 1 },
  bracketLabelText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary },
  bracketValue: {
    fontFamily: fonts.monoBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  bracketDim: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  dayRowLast: { borderBottomWidth: 0 },
  dayLeft: { flex: 1, gap: 2 },
  dayDate: { fontFamily: fonts.display, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  dayDateMono: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },
  dayWin: { fontFamily: fonts.display, fontSize: 12, color: colors.textTertiary },
  dayScore: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
