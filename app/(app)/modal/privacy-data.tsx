import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';
export default function PrivacyDataScreen() {
  return (
    <View style={styles.c}>
      <Eyebrow label="PRIVACY & DATA" />
      <View style={styles.list}>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            Alert.alert('Coming Soon', 'Data export will be available in a future update.')
          }
        >
          <Text style={styles.rowText}>Export my data</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <Rule />
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            Alert.alert('Coming Soon', 'Account deletion will be available in a future update.')
          }
        >
          <Text style={[styles.rowText, styles.danger]}>Delete account</Text>
          <Text style={[styles.arrow, styles.danger]}>›</Text>
        </TouchableOpacity>
      </View>
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
  list: { width: '100%', marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  rowText: { fontFamily: fonts.display, fontSize: 15, color: colors.textPrimary },
  arrow: { fontFamily: fonts.display, fontSize: 20, color: colors.textTertiary },
  danger: { color: colors.danger },
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
