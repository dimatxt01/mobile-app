import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
export default function WhoopConnectScreen() {
  return (
    <View style={styles.c}>
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
