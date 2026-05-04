import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/lib/hmc-colors';

type Props = { step: number; total?: number };
export function POBar({ step, total = 13 }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, i < step ? styles.segmentActive : styles.segmentInactive]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        {step}/{total}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: { flex: 1, flexDirection: 'row', gap: 3 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  segmentActive: { backgroundColor: colors.amber },
  segmentInactive: { backgroundColor: colors.surface03 },
  label: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },
});
