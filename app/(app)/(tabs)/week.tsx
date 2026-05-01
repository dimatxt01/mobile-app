import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory } from '@/features/history/use-history';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function WeekScreen() {
  const insets = useSafeAreaInsets();
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
  const maxScore = Math.max(...thisWeek.map((r) => r.total_score), 1);
  const bestIdx = thisWeek.reduce(
    (bi, r, i) => (r.total_score > (thisWeek[bi]?.total_score ?? 0) ? i : bi),
    0,
  );

  if (!rows.length) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Eyebrow label="NO DATA YET" />
        <Text style={styles.emptyText}>Complete your first check-in to see weekly data.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Eyebrow label="THIS WEEK" />
        <Text style={styles.avgText}>AVG {thisAvg}</Text>
      </View>

      <View style={styles.chart}>
        {thisWeek.map((r, i) => {
          const h = (r.total_score / maxScore) * 80;
          const dayDate = new Date(r.date + 'T00:00:00');
          const dayLabel = DAY_LABELS[dayDate.getDay()] ?? '';
          return (
            <View key={r.id} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(h, 4) },
                  i === bestIdx ? styles.barBest : styles.barNormal,
                ]}
              />
              <Text style={styles.barLabel}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>

      <Rule />

      <View style={styles.compGrid}>
        <View style={styles.compHeader}>
          <Text style={[styles.compCol, styles.compLabel]} />
          <Text style={[styles.compCol, styles.compValue]}>THIS</Text>
          <Text style={[styles.compCol, styles.compValue]}>LAST</Text>
        </View>
        {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket) => {
          const thisVal = thisWeek.length
            ? Math.round(
                thisWeek.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / thisWeek.length,
              )
            : 0;
          const lastVal = lastWeek.length
            ? Math.round(
                lastWeek.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / lastWeek.length,
              )
            : 0;
          return (
            <View key={bracket} style={styles.compRow}>
              <Text style={[styles.compCol, styles.compLabel]}>{bracket.toUpperCase()}</Text>
              <Text style={[styles.compCol, styles.compValue]}>{thisVal}</Text>
              <Text style={[styles.compCol, styles.compValue, styles.compDim]}>{lastVal}</Text>
            </View>
          );
        })}
      </View>

      <Rule />
      <Eyebrow label="DAY BY DAY" />
      {thisWeek.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.dayRow}
          onPress={() =>
            router.push({ pathname: '/(app)/modal/week-day/[date]', params: { date: r.date } })
          }
        >
          <Text style={styles.dayDate}>{r.date}</Text>
          <Text style={styles.dayScore}>{r.total_score}</Text>
        </TouchableOpacity>
      ))}

      {lastAvg > 0 && (
        <View style={styles.lastWeekNote}>
          <Eyebrow label="LAST WEEK AVG" />
          <Text style={styles.avgText}>{lastAvg}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  centered: { alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avgText: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6, marginBottom: 16 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '80%', borderRadius: 2 },
  barBest: { backgroundColor: colors.amber },
  barNormal: { backgroundColor: colors.lineStrong },
  barLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 4,
    letterSpacing: 1,
  },
  compGrid: { paddingVertical: 12 },
  compHeader: { flexDirection: 'row', marginBottom: 8 },
  compRow: { flexDirection: 'row', paddingVertical: 6 },
  compCol: { flex: 1 },
  compLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  compValue: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  compDim: { color: colors.textTertiary },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  dayDate: { fontFamily: fonts.mono, fontSize: 13, color: colors.textSecondary },
  dayScore: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  lastWeekNote: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
});
