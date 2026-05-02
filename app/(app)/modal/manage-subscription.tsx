import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '@/store/profile-store';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';
export default function ManageSubscriptionScreen() {
  const { profile } = useProfileStore();
  return (
    <View style={styles.c}>
      <Eyebrow label="SUBSCRIPTION" />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>STATUS</Text>
          <Text style={styles.value}>{profile?.subscription_status?.toUpperCase() ?? 'TRIAL'}</Text>
        </View>
        <Rule />
        {profile?.trial_ends_at && (
          <View style={styles.row}>
            <Text style={styles.label}>TRIAL ENDS</Text>
            <Text style={styles.value}>{profile.trial_ends_at.slice(0, 10)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.body}>Coming soon.</Text>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Text style={styles.closeText}>CLOSE</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  c: {
    flex: 1,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.pagePad,
  },
  card: { width: '100%', marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary },
  value: { fontFamily: fonts.monoBold, fontSize: 14, color: colors.textPrimary },
  body: {
    fontFamily: fonts.display,
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  close: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
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
