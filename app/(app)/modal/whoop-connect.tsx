import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius } from '@/lib/hmc-tokens';
import { Eyebrow } from '@/components/hmc/Eyebrow';
export default function WhoopConnectScreen() {
  return (
    <View style={styles.c}>
      <View style={styles.dragHandle} />
      <Eyebrow label="WHOOP INTEGRATION" />
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
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
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
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDefault,
  },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
});
