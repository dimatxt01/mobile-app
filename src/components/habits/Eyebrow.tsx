import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/habits-colors';

type Props = { label: string; size?: 'sm' | 'md' };
export function Eyebrow({ label, size = 'sm' }: Props) {
  return <Text style={size === 'md' ? styles.md : styles.sm}>{label.toUpperCase()}</Text>;
}
const styles = StyleSheet.create({
  sm: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  md: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 1.2,
    color: colors.textTertiary,
  },
});
