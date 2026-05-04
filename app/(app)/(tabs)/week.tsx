import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useHistory } from '@/features/history/use-history';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { PrintBar } from '@/components/habits/PrintBar';
import { BigNum } from '@/components/habits/BigNum';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';
import { computeWeeksLived } from '@/lib/life-in-weeks';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEW_MODE_KEY = '@week_month_view';

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

export default function WeekMonthScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const scrollRef = useRef<ScrollView>(null);
  const [activeView, setActiveView] = useState<'week' | 'month'>('week');
  const [viewLoaded, setViewLoaded] = useState(false);
  const hasScrolled = useRef(false);

  const { data: history } = useHistory(45);

  // --- Shared ---
  const now = new Date();

  // --- Week data ---
  const weekRows = history ?? [];
  const thisWeek = weekRows.slice(0, 7);
  const lastWeek = weekRows.slice(7, 14);
  const dayOfWeek = now.getDay();
  const isSunday = dayOfWeek === 0;
  const daysUntilSunday = isSunday ? 0 : 7 - dayOfWeek;
  const weekNumber = getWeekNumber(now);
  const weeksLived = computeWeeksLived(profile?.date_of_birth ?? null);
  const thisAvg = thisWeek.length
    ? Math.round(thisWeek.reduce((s, r) => s + r.total_score, 0) / thisWeek.length)
    : 0;
  const lastAvg = lastWeek.length
    ? Math.round(lastWeek.reduce((s, r) => s + r.total_score, 0) / lastWeek.length)
    : 0;
  const weekDelta = lastAvg > 0 ? thisAvg - lastAvg : null;
  const maxWeekScore = Math.max(...thisWeek.map((r) => r.total_score), 1);
  const bestWeekIdx = thisWeek.reduce(
    (bi, r, i) => (r.total_score > (thisWeek[bi]?.total_score ?? 0) ? i : bi),
    0,
  );

  const { data: weeklyReviews } = useQuery({
    queryKey: ['weekly-reviews', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .order('week_end', { ascending: false })
        .limit(12);
      if (error) console.warn('weekly-reviews fetch failed:', error.message);
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

  // --- Month data ---
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const isLastDay = now.getDate() === lastDayOfMonth;
  const daysLeft = lastDayOfMonth - now.getDate();
  const monthRows = (history ?? []).filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthAvg = monthRows.length
    ? Math.round(monthRows.reduce((s, r) => s + r.total_score, 0) / monthRows.length)
    : 0;
  const monthMaxScore = Math.max(...monthRows.map((r) => r.total_score), 1);
  const monthBest = monthRows.length
    ? monthRows.reduce((b, r) => (r.total_score > b.total_score ? r : b), monthRows[0]!)
    : null;

  const { data: monthlyReviews } = useQuery({
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
  const pastMonthlyReviews = (monthlyReviews ?? []).filter(
    (r) => !(r.year === currentYear && r.month === currentMonth + 1),
  );

  // Restore saved view on mount
  useEffect(() => {
    AsyncStorage.getItem(VIEW_MODE_KEY).then((val) => {
      if (val === 'month') setActiveView('month');
      setViewLoaded(true);
    });
  }, []);

  // Scroll to correct page once after load (non-animated, one-time)
  useEffect(() => {
    if (viewLoaded && !hasScrolled.current) {
      hasScrolled.current = true;
      if (activeView === 'month') {
        setTimeout(() => {
          scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: false });
        }, 0);
      }
    }
  }, [viewLoaded]);

  // Update tab title and persist selection
  useEffect(() => {
    navigation.setOptions({ title: activeView === 'week' ? 'Week' : 'Month' });
    if (viewLoaded) {
      AsyncStorage.setItem(VIEW_MODE_KEY, activeView);
    }
  }, [activeView, viewLoaded]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    const view = page === 0 ? 'week' : 'month';
    if (view !== activeView) setActiveView(view);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={handleScrollEnd}
      scrollEventThrottle={16}
      style={styles.container}
    >
      {/* ── WEEK PAGE ── */}
      <ScrollView
        style={styles.page}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <PrintBar right={`WK ${weekNumber}`} />

        {thisWeek.length === 0 ? (
          <View style={styles.centered}>
            <Eyebrow label="NO DATA YET" />
            <Text style={styles.emptyText}>Complete your first check-in to see weekly data.</Text>
          </View>
        ) : (
          <>
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
                  {thisWeek[bestWeekIdx] && (
                    <Text style={styles.bestText}>
                      BEST: {DAY_LABELS[new Date(thisWeek[bestWeekIdx]!.date + 'T00:00:00').getDay()] ?? '—'} · {thisWeek[bestWeekIdx]!.total_score}
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
              <View style={styles.weekChart}>
                {thisWeek.map((r, i) => {
                  const h = (r.total_score / maxWeekScore) * 100;
                  const dayLabel = DAY_LABELS[new Date(r.date + 'T00:00:00').getDay()] ?? '';
                  return (
                    <View key={r.id} style={styles.weekBarCol}>
                      <Text style={styles.weekBarScore}>{r.total_score}</Text>
                      <View
                        style={[
                          styles.weekBar,
                          { height: Math.max(h, 4) },
                          i === bestWeekIdx ? styles.barBest : styles.barNormal,
                        ]}
                      />
                      <Text style={styles.weekBarLabel}>{dayLabel[0]}</Text>
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
                      <Text style={styles.dayWin} numberOfLines={1}>{r.reflection_win}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.dayScore}>{r.total_score}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Rule strong />

            <View style={styles.section}>
              {isSunday ? (
                <TouchableOpacity
                  style={styles.ctaBtn}
                  onPress={() => router.push('/(app)/modal/weekly-review')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ctaText}>WEEKLY CHECK-UP →</Text>
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
            </View>

            {weeklyReviews && weeklyReviews.length > 0 && (
              <>
                <Rule />
                <View style={styles.section}>
                  <Eyebrow label="PAST WEEKLY REVIEWS" />
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
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* ── MONTH PAGE ── */}
      <ScrollView
        style={styles.page}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <PrintBar right={`${MONTH_NAMES[currentMonth]} ${currentYear}`} />

        <View style={styles.heroBlock}>
          <Eyebrow label="MONTH AVERAGE" />
          <View style={styles.heroRow}>
            <BigNum value={monthAvg} highlight={false} />
            <View style={styles.heroMeta}>
              <Text style={styles.metaLine}>{monthRows.length} DAYS LOGGED</Text>
              {monthBest && <Text style={styles.metaLine}>BEST: {monthBest.total_score}</Text>}
              <Text style={styles.metaLine}>
                {now.getDate()}/{lastDayOfMonth} COMPLETE
              </Text>
            </View>
          </View>
        </View>

        <Rule strong />

        {monthRows.length > 0 ? (
          <View style={styles.chartSection}>
            <Eyebrow label="DAILY TOTALS" />
            <View style={styles.monthChart}>
              {monthRows
                .slice()
                .reverse()
                .map((r) => {
                  const h = (r.total_score / monthMaxScore) * 80;
                  const day = new Date(r.date + 'T00:00:00').getDate();
                  return (
                    <View key={r.id} style={styles.monthBarCol}>
                      <View
                        style={[
                          styles.monthBar,
                          {
                            height: Math.max(h, 2),
                            backgroundColor: r.total_score >= monthAvg ? colors.amber : colors.lineStrong,
                          },
                        ]}
                      />
                      <Text style={styles.monthBarLabel}>{day}</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>Keep going — your month is being written.</Text>
          </View>
        )}

        <Rule />

        {monthRows.length > 0 && (
          <View style={styles.section}>
            <Eyebrow label="BRACKET AVERAGES" />
            {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket) => {
              const bAvg = Math.round(
                monthRows.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / monthRows.length,
              );
              return (
                <View key={bracket} style={styles.monthBracketRow}>
                  <Text style={styles.monthBracketLabel}>{bracket.toUpperCase()}</Text>
                  <Text style={styles.monthBracketVal}>{bAvg}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Rule />

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

        {pastMonthlyReviews.length > 0 && (
          <>
            <Rule strong />
            <View style={styles.section}>
              <Eyebrow label="PAST MONTHS" />
              {pastMonthlyReviews.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.reviewRow}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/modal/monthly-review',
                      params: { readOnly: '1', year: r.year.toString(), month: r.month.toString() },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.reviewLeft}>
                    <Text style={styles.reviewMonth}>
                      {MONTH_NAMES[(r.month - 1) as number] ?? ''} {r.year}
                    </Text>
                    {r.verdict ? (
                      <Text style={styles.reviewVerdict} numberOfLines={1}>{r.verdict}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  page: { width: SCREEN_WIDTH, backgroundColor: colors.base },
  centered: {
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

  // Week
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
  lifeCard: { paddingHorizontal: spacing.pagePad, paddingVertical: 16 },
  lifeCardRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  lifeNum: { fontFamily: fonts.monoBold, fontSize: 28, color: colors.amber, fontVariant: ['tabular-nums'] },
  lifeOf: { fontFamily: fonts.display, fontSize: 15, color: colors.textTertiary, flex: 1 },
  lifeArrow: { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary, letterSpacing: 1 },
  chartSection: { paddingHorizontal: spacing.pagePad, paddingTop: 20, paddingBottom: 16 },
  weekChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6, marginTop: 14 },
  weekBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  weekBarScore: { fontFamily: fonts.mono, fontSize: 10, color: colors.textTertiary, fontVariant: ['tabular-nums'] },
  weekBar: { width: '80%', borderRadius: 2 },
  barBest: { backgroundColor: colors.amber },
  barNormal: { backgroundColor: colors.lineStrong },
  weekBarLabel: { fontFamily: fonts.mono, fontSize: 9, color: colors.textTertiary, letterSpacing: 1 },
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
  dayScore: { fontFamily: fonts.monoBold, fontSize: 20, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  ctaBtn: { paddingVertical: 16, borderWidth: 1, borderColor: colors.amber, borderRadius: 4, alignItems: 'center' },
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
  reviewLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
  reviewWin: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  reviewScore: { fontFamily: fonts.monoBold, fontSize: 20, color: colors.textPrimary, fontVariant: ['tabular-nums'] },

  // Month
  heroBlock: { paddingHorizontal: spacing.pagePad, paddingVertical: 20 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 },
  heroMeta: { alignItems: 'flex-end', paddingBottom: 8, gap: 3 },
  metaLine: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  monthChart: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', height: 88, gap: 3, marginTop: 12 },
  monthBarCol: { alignItems: 'center', gap: 4 },
  monthBar: { width: 8, borderRadius: 2 },
  monthBarLabel: {
    fontFamily: fonts.mono,
    fontSize: 7,
    color: colors.textQuiet,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  emptyChart: { paddingHorizontal: spacing.pagePad, paddingVertical: 32, alignItems: 'center' },
  monthBracketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  monthBracketLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary },
  monthBracketVal: { fontFamily: fonts.monoBold, fontSize: 15, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  reviewMonth: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.textPrimary },
  reviewVerdict: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
});
