import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
import { useScoreDensity } from '@/lib/score-density';

function fmtDate(d: string): string {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile } = useProfileStore();
  const [scoreDensity, setScoreDensity] = useScoreDensity();

  const { data: stats } = useQuery({
    queryKey: ['stats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_stats');
      if (error) throw error;
      return (data as {
        streak: number;
        day_count: number;
        lifetime_avg: number;
        best_score: number | null;
        best_date: string | null;
      }[])?.[0] ?? null;
    },
    enabled: !!user,
  });

  const navRow = (label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.navRow} onPress={onPress}>
      <Text style={styles.navText}>{label}</Text>
      <Text style={styles.navArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <View style={styles.headerSection}>
        <Text style={styles.name}>{profile?.full_name ?? 'User'}</Text>
        {profile?.identity_sentence && (
          <Text style={styles.identitySentence}>{profile.identity_sentence}</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Eyebrow label="STREAK" />
          <Text style={styles.statValue}>{stats?.streak ?? 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Eyebrow label="BEST" />
          <Text style={styles.statValue}>{stats?.best_score ?? 0}</Text>
          {stats?.best_date && <Text style={styles.statDate}>{fmtDate(stats.best_date)}</Text>}
        </View>
        <View style={styles.statItem}>
          <Eyebrow label="AVG" />
          <Text style={styles.statValue}>{stats?.lifetime_avg ?? 0}</Text>
        </View>
      </View>

      <Rule />

      <View style={styles.section}>
        <Eyebrow label="YOUR IDENTITY" />
        {profile?.identity_sentence && (
          <Text style={styles.identitySentenceSection}>{profile.identity_sentence}</Text>
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
        {navRow('Identity Habits', () =>
          router.push({ pathname: '/(app)/modal/edit-habits', params: { type: 'identity' } }),
        )}
        {navRow('Execution Habits', () =>
          router.push({ pathname: '/(app)/modal/edit-habits', params: { type: 'execution' } }),
        )}
        {navRow('Outcomes', () => router.push('/(app)/modal/edit-outcomes'))}
        {navRow('Penalties', () => router.push('/(app)/modal/edit-penalties'))}
      </View>

      <Rule />

      <View style={styles.section}>
        <Eyebrow label="INTEGRATIONS" />
        {navRow('Whoop', () => router.push('/(app)/modal/whoop-connect'))}
      </View>

      <Rule />

      <View style={styles.section}>
        <Eyebrow label="ACCOUNT" />
        {navRow('Subscription', () => router.push('/(app)/modal/manage-subscription'))}
        {navRow('Notifications', () => router.push('/(app)/modal/notification-settings'))}
        {navRow('Privacy & Data', () => router.push('/(app)/modal/privacy-data'))}
        {navRow('Sign Out', () => router.push('/(app)/modal/signout-confirm'))}
      </View>

      <Text style={styles.footer}>HMC · HALF MILLY CLUB · v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  headerSection: { marginBottom: 24 },
  name: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.textPrimary },
  identitySentence: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  section: { paddingVertical: 12 },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  navText: { fontFamily: fonts.display, fontSize: 15, color: colors.textPrimary },
  navArrow: { fontFamily: fonts.display, fontSize: 20, color: colors.textTertiary },
  statDate: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textTertiary,
    marginTop: 2,
  },
  identitySentenceSection: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 4,
  },
  editIdentityBtn: {
    paddingVertical: 8,
  },
  editIdentityText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.amber,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
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
  pillText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  pillTextActive: { color: colors.amber },
  footer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textQuiet,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
