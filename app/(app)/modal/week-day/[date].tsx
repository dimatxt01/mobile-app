import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';
import type { DailyCheckin } from '@/types/database';

export default function WeekDayScreen() {
  const insets = useSafeAreaInsets();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { user } = useAuth();

  const { data: checkin, isLoading } = useQuery({
    queryKey: ['checkin-day', user?.id, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', date!)
        .maybeSingle();
      if (error) throw error;
      return data as DailyCheckin | null;
    },
    enabled: !!user && !!date,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  const brackets = [
    { label: 'IDENTITY', value: checkin?.identity_score ?? 0, prefix: '+' },
    { label: 'EXECUTION', value: checkin?.execution_score ?? 0, prefix: '+' },
    { label: 'OUTCOMES', value: checkin?.outcome_score ?? 0, prefix: '+' },
    { label: 'PENALTY', value: checkin?.penalty_score ?? 0, prefix: '−', danger: true },
  ];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.headerRow}>
        <Text style={styles.logo}>HABITS.</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      <Rule />

      {checkin ? (
        <>
          <View style={styles.totalRow}>
            <Eyebrow label="TOTAL" />
            <Text style={styles.totalValue}>{checkin.total_score}</Text>
          </View>
          <Rule />
          {brackets.map((b) => (
            <View key={b.label} style={styles.bracketRow}>
              <Text style={styles.bracketLabel}>{b.label}</Text>
              <Text style={[styles.bracketValue, b.danger && styles.danger]}>
                {b.prefix}
                {b.value}
              </Text>
            </View>
          ))}
          <Rule />
          {checkin.reflection_win && (
            <View style={styles.reflectionBlock}>
              <Eyebrow label="WIN" />
              <Text style={styles.reflectionText}>{checkin.reflection_win}</Text>
            </View>
          )}
          {checkin.reflection_broke && (
            <View style={styles.reflectionBlock}>
              <Eyebrow label="WHAT BROKE" />
              <Text style={styles.reflectionText}>{checkin.reflection_broke}</Text>
            </View>
          )}
          {checkin.is_late_checkin && <Text style={styles.lateNote}>LATE CHECK-IN · −10 PTS</Text>}
        </>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No check-in for this date.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>CLOSE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.elevated, paddingHorizontal: spacing.pagePad },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: 8,
  },
  logo: { fontFamily: fonts.monoBold, fontSize: 18, color: colors.textPrimary, letterSpacing: 2 },
  dateText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textTertiary,
    letterSpacing: 1.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  totalValue: {
    fontFamily: fonts.monoBold,
    fontSize: 36,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  bracketRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  bracketLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  bracketValue: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  danger: { color: colors.danger },
  reflectionBlock: { paddingVertical: 12 },
  reflectionText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  lateNote: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.danger,
    letterSpacing: 1.5,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 32,
  },
  closeBtn: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
});
