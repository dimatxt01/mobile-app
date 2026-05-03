import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = { value: number; onChange: (v: number) => void; disabled?: boolean };

export function Slider10({ value, onChange, disabled = false }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>9-TO-5</Text>
      <View style={styles.track}>
        {Array.from({ length: 11 }, (_, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.segment, i <= value && i > 0 && styles.segmentActive]}
            onPress={() => !disabled && onChange(i)}
            activeOpacity={0.8}
          />
        ))}
      </View>
      <Text style={[styles.val, value > 0 && styles.valActive]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    width: 48,
  },
  track: { flex: 1, flexDirection: 'row', gap: 4, height: 24, alignItems: 'center' },
  segment: { flex: 1, height: 12, borderRadius: 4, backgroundColor: colors.lineStrong },
  segmentActive: { backgroundColor: colors.amber },
  val: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
    width: 24,
    textAlign: 'right',
  },
  valActive: { color: colors.amber },
});
