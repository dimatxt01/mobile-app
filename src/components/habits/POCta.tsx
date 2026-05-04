import { TouchableOpacity, Text, StyleSheet } from 'react-native';
<<<<<<< HEAD:src/components/habits/POCta.tsx
import { colors, fonts } from '@/lib/habits-colors';
=======
import { colors, fonts } from '@/lib/hmc-colors';
import { radius, elevation } from '@/lib/hmc-tokens';
>>>>>>> c17a8265a084b4125b138d6df2628fd553809dbb:src/components/hmc/POCta.tsx

type Props = { label: string; onPress: () => void; disabled?: boolean };
export function POCta({ label, onPress, disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>{label.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 20,
    ...elevation.amber,
  },
  disabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
  text: { fontFamily: fonts.monoBold, fontSize: 14, letterSpacing: 1.5, color: colors.base },
});
