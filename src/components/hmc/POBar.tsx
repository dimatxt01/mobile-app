import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/lib/hmc-colors';

type Props = { step: number; total?: number };
export function POBar({ step, total = 13 }: Props) {
  const pct = Math.min((step / total) * 100, 100);
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
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
  track: { flex: 1, height: 2, backgroundColor: colors.lineStrong, borderRadius: 1 },
  fill: { height: '100%', backgroundColor: colors.amber, borderRadius: 1 },
  label: { fontFamily: fonts.mono, fontSize: 11, color: colors.textTertiary },
});
