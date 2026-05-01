import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type Props = { value: number; highlight?: boolean };
export function BigNum({ value, highlight = false }: Props) {
  return <Text style={[styles.num, highlight && styles.amber]}>{value}</Text>;
}
const styles = StyleSheet.create({
  num: {
    fontFamily: fonts.monoBold,
    fontSize: 104,
    lineHeight: 116,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amber: { color: colors.amber },
});
