import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '@/lib/habits-colors';

type Props = {
  label: string;
  points: number;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function HabitRow({ label, points, checked, onToggle, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked && <View style={styles.checkMark} />}
      </View>
      <Text style={[styles.label, checked && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.pts, checked && styles.ptsActive]}>+{points}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  rowPressed: {
    backgroundColor: colors.accentMuted,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { borderColor: colors.amber, backgroundColor: colors.amber },
  checkMark: {
    width: 10,
    height: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.base,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  label: { flex: 1, fontFamily: fonts.display, fontSize: 15, color: colors.textSecondary },
  labelActive: { color: colors.textPrimary },
  pts: { fontFamily: fonts.mono, fontSize: 13, color: colors.textTertiary },
  ptsActive: { color: colors.amber },
});
