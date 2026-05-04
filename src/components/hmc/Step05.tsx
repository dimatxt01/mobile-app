import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';
import { radius } from '@/lib/hmc-tokens';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  danger?: boolean;
  disabled?: boolean;
};

export function Step05({ label, value, onChange, danger = false, disabled = false }: Props) {
  const accent = danger ? colors.danger : colors.amber;
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, danger && styles.btnDanger]}
          onPress={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: value === 0 ? colors.textTertiary : accent }]}>
            −
          </Text>
        </TouchableOpacity>
        <View style={styles.valPill}>
          <Text style={[styles.val, value > 0 && { color: accent }]}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btn, danger && styles.btnDanger]}
          onPress={() => onChange(Math.min(5, value + 1))}
          disabled={disabled || value === 5}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: value === 5 ? colors.textTertiary : accent }]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  label: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.textSecondary },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface03,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDanger: { borderColor: colors.danger },
  btnText: { fontFamily: fonts.monoBold, fontSize: 20 },
  valPill: {
    backgroundColor: colors.surface04,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  val: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    minWidth: 20,
    textAlign: 'center',
  },
});
