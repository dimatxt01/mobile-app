import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';

export default function ReturningUserScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.dragHandle} />
      <View style={styles.content}>
        <Text style={styles.logo}>HMC.</Text>
        <Eyebrow label="WELCOME BACK" />
        <Text style={styles.body}>
          You&apos;ve been away for a while. Your streak has reset, but your data is still here.
          {'\n\n'}Pick up where you left off.
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.cta, { marginBottom: insets.bottom + 16 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.ctaText}>LET&apos;S GO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.elevated, paddingHorizontal: spacing.pagePad },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo: { fontFamily: fonts.monoBold, fontSize: 48, color: colors.textPrimary, letterSpacing: 4 },
  body: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
  },
  cta: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { fontFamily: fonts.monoBold, fontSize: 14, letterSpacing: 1.5, color: colors.base },
});
