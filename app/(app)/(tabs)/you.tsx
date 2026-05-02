import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { PrintBar } from '@/components/hmc/PrintBar';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
import { useScoreDensity } from '@/lib/score-density';

export default function YouScreen() {
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const [scoreDensity, setScoreDensity] = useScoreDensity();

  const { data: stats } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_stats');
      if (error) throw error;
      return (
        (
          data as {
            streak: number;
            day_count: number;
            lifetime_avg: number;
            best_score: number | null;
            best_date: string | null;
          }[]
        )?.[0] ?? null
      );
    },
    enabled: !!user,
  });

  const navRow = (label: string, value: string | undefined, onPress: () => void) => (
    <TouchableOpacity style={styles.navRow} onPress={onPress}>
      <Text style={styles.navText}>{label}</Text>
      <View style={styles.navRight}>
        {value ? <Text style={styles.navValue}>{value}</Text> : null}
        <Text style={styles.navArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <PrintBar />

      {/* Header */}
      <View style={styles.headerSection}>
        <Eyebrow label="PROFILE" />
        <Text style={styles.name}>{profile?.full_name ?? 'User'}</Text>
        {stats && (
          <Text style={styles.statLine}>
            DAY {stats.day_count} · STREAK {stats.streak} · YTD AVG {stats.lifetime_avg}
          </Text>
        )}
      </View>

      <Rule strong />

      {/* Identity */}
      <View style={styles.section}>
        <Eyebrow label="YOUR IDENTITY" />
        {profile?.identity_sentence && (
          <Text style={styles.identitySentence}>{profile.identity_sentence}</Text>
        )}
        <TouchableOpacity
          onPress={() => router.push('/(app)/modal/edit-identity-sentence')}
          activeOpacity={0.7}
          style={styles.editIdentityBtn}
        >
          <Text style={styles.editIdentityText}>EDIT IDENTITY →</Text>
        </TouchableOpacity>
      </View>

      <Rule />

      {/* Display preference */}
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
        {navRow('Identity Habits', undefined, () =>
          router.push({ pathname: '/(app)/modal/edit-habits', params: { type: 'identity' } }),
        )}
        {navRow('Execution Habits', undefined, () =>
          router.push({ pathname: '/(app)/modal/edit-habits', params: { type: 'execution' } }),
        )}
        {navRow('Outcomes', undefined, () => router.push('/(app)/modal/edit-outcomes'))}
        {navRow('Penalties', undefined, () => router.push('/(app)/modal/edit-penalties'))}
      </View>

      <Rule />

      <View style={styles.section}>
        <Eyebrow label="INTEGRATIONS" />
        {navRow('Whoop', undefined, () => router.push('/(app)/modal/whoop-connect'))}
      </View>

      <Rule />

      <View style={styles.section}>
        <Eyebrow label="ACCOUNT" />
        {navRow('Subscription', 'HMC PRO', () => router.push('/(app)/modal/manage-subscription'))}
        {navRow(
          'Notifications',
          profile?.reminder_time ?? '21:00',
          () => router.push('/(app)/modal/notification-settings'),
        )}
        {navRow('Privacy & Data', undefined, () => router.push('/(app)/modal/privacy-data'))}
        {navRow('Sign Out', undefined, () => router.push('/(app)/modal/signout-confirm'))}
      </View>

      <Text style={styles.footer}>HMC · HALF MILLY CLUB · v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  headerSection: {
    paddingHorizontal: spacing.pagePad,
    paddingBottom: 20,
    paddingTop: 4,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginTop: 8,
  },
  statLine: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.textTertiary,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  section: { paddingHorizontal: spacing.pagePad, paddingVertical: 14 },
  identitySentence: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.textPrimary,
    lineHeight: 26,
    letterSpacing: -0.3,
    marginTop: 10,
    marginBottom: 4,
  },
  editIdentityBtn: { paddingVertical: 8 },
  editIdentityText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.amber,
  },
  pillRow: { flexDirection: 'row', gap: 8, paddingTop: 10 },
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
  pillText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary },
  pillTextActive: { color: colors.amber },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineRegular,
  },
  navText: { fontFamily: fonts.display, fontSize: 15, color: colors.textPrimary },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navValue: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary, letterSpacing: 1 },
  navArrow: { fontFamily: fonts.display, fontSize: 20, color: colors.textTertiary },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textQuiet,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
