import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useHistory } from '@/features/history/use-history';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { scale, radius } from '@/lib/hmc-tokens';
import { PrintBar } from '@/components/hmc/PrintBar';
import { BigNum } from '@/components/hmc/BigNum';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
import { computeWeeksLived } from '@/lib/life-in-weeks';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

export default function WeekScreen() {
  const { user } = useAuth();
  const { data: history } = useHistory(14);
  const rows = history ?? [];
  const thisWeek = rows.slice(0, 7);
  const lastWeek = rows.slice(7, 14);

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const isSunday = dayOfWeek === 0;
  const daysUntilSunday = isSunday ? 0 : 7 - dayOfWeek;
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - dayOfWeek);
  const weekStart = currentWeekStart.toISOString().slice(0, 10);

  const { data: weeklyReviews } = useQuery({
    queryKey: ['weekly-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .order('week_end', { ascending: false })
        .limit(12);
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        week_start: string;
        week_end: string;
        win: string | null;
        challenge: string | null;
        next_week: string | null;
        weekly_avg: number | null;
        photo_urls: string[] | null;
      }[];
    },
    enabled: !!user,
  });
  const isActiveCheckup =
    weeklyReviews !== undefined && !weeklyReviews.some((r) => r.week_start === weekStart);
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
  const { profile } = useProfileStore();
  const weeksLived = computeWeeksLived(profile?.date_of_birth ?? null);

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

      <View style={styles.avgBlock}>
        <Eyebrow label="WEEK AVERAGE" />
        <View style={styles.avgRow}>
          <BigNum value={thisAvg} highlight={false} />
          <View style={styles.avgMeta}>
            {weekDelta !== null && (
              <Text style={[styles.deltaText, weekDelta >= 0 ? styles.deltaPos : styles.deltaNeg]}>
                {weekDelta >= 0 ? '+' : ''}
                {weekDelta} VS LAST WK
              </Text>
            )}
            {thisWeek[bestIdx] && (
              <Text style={styles.bestText}>
                BEST: {DAY_LABELS[new Date(thisWeek[bestIdx]!.date + 'T00:00:00').getDay()] ?? '—'}{' '}
                · {thisWeek[bestIdx]!.total_score}
              </Text>
            )}
          </View>
        </View>
      </View>

      <Rule strong />

      <TouchableOpacity
        style={styles.lifeCard}
        onPress={() => router.push('/(app)/modal/life-in-weeks')}
        activeOpacity={0.8}
      >
        <Eyebrow label="LIFE IN WEEKS" />
        <View style={styles.lifeCardRow}>
          <Text style={styles.lifeNum}>{weeksLived.toLocaleString()}</Text>
          <Text style={styles.lifeOf}> of ~4,000 weeks</Text>
          <Text style={styles.lifeArrow}>→</Text>
        </View>
      </TouchableOpacity>

      <Rule />

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

      <View style={styles.section}>
        <View style={styles.bracketHeader}>
          <Text style={[styles.bracketCol, styles.bracketLabelText]} />
          <Text style={[styles.bracketCol, styles.bracketValue]}>THIS</Text>
          <Text style={[styles.bracketCol, styles.bracketValue]}>LAST</Text>
          <Text style={[styles.bracketCol, styles.bracketValue]}>Δ</Text>
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
          const d = lastVal > 0 ? thisVal - lastVal : null;
          return (
            <View key={bracket} style={styles.bracketRow}>
              <Text style={[styles.bracketCol, styles.bracketLabelText]}>
                {bracket.toUpperCase()}
              </Text>
              <Text style={[styles.bracketCol, styles.bracketValue]}>{thisVal}</Text>
              <Text style={[styles.bracketCol, styles.bracketDim]}>{lastVal || '—'}</Text>
              {d !== null ? (
                <Text
                  style={[
                    styles.bracketCol,
                    styles.bracketValue,
                    d >= 0 ? styles.deltaPos : styles.deltaNeg,
                  ]}
                >
                  {d >= 0 ? '+' : ''}
                  {d}
                </Text>
              ) : (
                <Text style={[styles.bracketCol, styles.bracketDim]}>—</Text>
              )}
            </View>
          );
        })}
      </View>

      <Rule />

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
                {DAY_LABELS[new Date(r.date + 'T00:00:00').getDay()] ?? r.date} ·{' '}
                <Text style={styles.dayDateMono}>{r.date.slice(5)}</Text>
              </Text>
              {r.reflection_win ? (
                <Text style={styles.dayWin} numberOfLines={1}>
                  {r.reflection_win}
                </Text>
              ) : null}
            </View>
            <Text style={styles.dayScore}>{r.total_score}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Rule strong />

      <View style={styles.section}>
        <Eyebrow label="WEEKLY CHECK-UPS" />

        {isActiveCheckup ? (
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
            <View style={styles.countdownRow}>
              <Text style={styles.countdownNum}>{daysUntilSunday}</Text>
              <Text style={styles.countdownUnit}>DAYS</Text>
            </View>
          </View>
        )}

        {weeklyReviews && weeklyReviews.length > 0 && (
          <View style={styles.reviewsList}>
            {weeklyReviews.map((r) => {
              const endDate = new Date(r.week_end + 'T00:00:00');
              const label = endDate
                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                .toUpperCase();
              return (
                <TouchableOpacity
                  key={r.id}
                  style={styles.reviewRow}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/modal/weekly-review',
                      params: {
                        readOnly: '1',
                        weekStart: r.week_start,
                        weekEnd: r.week_end,
                      },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.reviewLeft}>
                    <Text style={styles.reviewLabel}>WK OF {label}</Text>
                    {r.win ? (
                      <Text style={styles.reviewWin} numberOfLines={1}>
                        {r.win}
                      </Text>
                    ) : null}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.pagePad,
    paddingTop: 60,
  },
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
  },
  avgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  avgMeta: { alignItems: 'flex-end', paddingBottom: 8, gap: 4 },
  deltaText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2 },
  deltaPos: { color: colors.amber },
  deltaNeg: { color: colors.danger },
  bestText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.textTertiary },
  chartSection: {
    marginHorizontal: spacing.pagePad,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface02,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6, marginTop: 14 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barScore: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  bar: { width: '80%', borderRadius: 4 },
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
  bracketLabelText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
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
  dayDate: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dayDateMono: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary },
  dayWin: { fontFamily: fonts.display, fontSize: 12, color: colors.textTertiary },
  dayScore: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
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
  reviewsList: { marginTop: 16 },
  countdownBlock: { gap: 8, marginTop: 12 },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  countdownNum: {
    fontFamily: fonts.monoBold,
    fontSize: 48,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    lineHeight: 52,
  },
  countdownUnit: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textTertiary,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  reviewLeft: { flex: 1, gap: 3 },
  reviewLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
  reviewWin: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  reviewScore: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  lifeCard: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 16,
  },
  lifeCardRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  lifeNum: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  lifeOf: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textTertiary,
    flex: 1,
  },
  lifeArrow: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textTertiary,
    letterSpacing: 1,
  },
});
