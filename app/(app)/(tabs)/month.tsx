import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useHistory } from '@/features/history/use-history';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { scale, radius } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';
import { PrintBar } from '@/components/habits/PrintBar';
import { BigNum } from '@/components/habits/BigNum';

const MONTH_NAMES = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

export default function MonthScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isLastDay = now.getDate() === lastDayOfMonth;
  const daysLeft = lastDayOfMonth - now.getDate();

  const { data: history } = useHistory(45);

  const monthRows = (history ?? []).filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const avg = monthRows.length
    ? Math.round(monthRows.reduce((s, r) => s + r.total_score, 0) / monthRows.length)
    : 0;
  const maxScore = Math.max(...monthRows.map((r) => r.total_score), 1);
  const best = monthRows.length
    ? monthRows.reduce((b, r) => (r.total_score > b.total_score ? r : b), monthRows[0]!)
    : null;

  const { data: reviews } = useQuery({
    queryKey: ['monthly-reviews', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('monthly_reviews')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(24);
      return (data ?? []) as {
        id: string;
        year: number;
        month: number;
        verdict: string | null;
        reflection: string | null;
        monthly_avg: number | null;
      }[];
    },
    enabled: !!user,
  });

  const pastReviews = (reviews ?? []).filter(
    (r) => !(r.year === currentYear && r.month === currentMonth + 1),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <PrintBar right={`${MONTH_NAMES[currentMonth]} ${currentYear}`} />

      {/* Monthly avg hero */}
      <View style={styles.heroBlock}>
        <Eyebrow label="MONTH AVERAGE" />
        <View style={styles.heroRow}>
          <BigNum value={avg} highlight={false} />
          <View style={styles.heroMeta}>
            <Text style={styles.metaLine}>{monthRows.length} DAYS LOGGED</Text>
            {best && <Text style={styles.metaLine}>BEST: {best.total_score}</Text>}
            <Text style={styles.metaLine}>
              {now.getDate()}/{lastDayOfMonth} COMPLETE
            </Text>
          </View>
        </View>
      </View>

      <Rule strong />

      {/* Bar chart */}
      {monthRows.length > 0 ? (
        <View style={styles.chartSection}>
          <Eyebrow label="DAILY TOTALS" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
            <View style={styles.chart}>
              {monthRows
                .slice()
                .reverse()
                .map((r) => {
                  const h = (r.total_score / maxScore) * 80;
                  const day = new Date(r.date + 'T00:00:00').getDate();
                  return (
                    <View key={r.id} style={styles.barCol}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(h, 2),
                            backgroundColor:
                              r.total_score >= avg ? colors.amber : colors.lineStrong,
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>{day}</Text>
                    </View>
                  );
                })}
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>Keep going — your month is being written.</Text>
        </View>
      )}

      <Rule />

      {/* Bracket averages for month */}
      {monthRows.length > 0 && (
        <View style={styles.section}>
          <Eyebrow label="BRACKET AVERAGES" />
          {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket) => {
            const bAvg = Math.round(
              monthRows.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / monthRows.length,
            );
            return (
              <View key={bracket} style={styles.bracketRow}>
                <Text style={styles.bracketLabel}>{bracket.toUpperCase()}</Text>
                <Text style={styles.bracketVal}>{bAvg}</Text>
              </View>
            );
          })}
        </View>
      )}

      <Rule />

      {/* Monthly check-up CTA */}
      <View style={styles.section}>
        {isLastDay ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/(app)/modal/monthly-review')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>MONTHLY REVIEW →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.countdownBlock}>
            <Eyebrow label="MONTH CLOSES IN" />
            <View style={styles.countdownRow}>
              <Text style={styles.countdownNum}>{daysLeft}</Text>
              <Text style={styles.countdownUnit}>DAYS</Text>
            </View>
          </View>
        )}
      </View>

      {/* Past monthly reviews */}
      {pastReviews.length > 0 && (
        <>
          <Rule strong />
          <View style={styles.section}>
            <Eyebrow label="PAST MONTHS" />
            {pastReviews.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.reviewRow}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/modal/monthly-review',
                    params: {
                      readOnly: '1',
                      year: r.year.toString(),
                      month: r.month.toString(),
                    },
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.reviewLeft}>
                  <Text style={styles.reviewMonth}>
                    {MONTH_NAMES[(r.month - 1) as number] ?? ''} {r.year}
                  </Text>
                  {r.verdict ? (
                    <Text style={styles.reviewVerdict} numberOfLines={1}>
                      {r.verdict}
                    </Text>
                  ) : null}
                </View>
                {r.monthly_avg != null && (
                  <Text style={styles.reviewScore}>{Math.round(r.monthly_avg)}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  heroBlock: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  heroMeta: { alignItems: 'flex-end', paddingBottom: 8, gap: 3 },
  metaLine: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  chartSection: {
    marginHorizontal: spacing.pagePad,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface02,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  chartScroll: { marginTop: 12 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 88, gap: 4 },
  barCol: { alignItems: 'center', gap: 4 },
  bar: { width: 10, borderRadius: 4 },
  barLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors.textQuiet,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  emptyChart: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  section: { paddingHorizontal: spacing.pagePad, paddingVertical: 16 },
  bracketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  bracketLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  bracketVal: {
    fontFamily: fonts.monoBold,
    fontSize: 15,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  ctaBtn: {
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.amber,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  ctaText: { fontFamily: fonts.monoBold, fontSize: 13, letterSpacing: 2, color: colors.amber },
  countdownBlock: { gap: 8 },
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
  reviewMonth: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
  reviewVerdict: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  reviewScore: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
