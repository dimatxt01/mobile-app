import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/habits-colors';

type Props = { label: string };
export function Eyebrow({ label }: Props) {
  return <Text style={styles.text}>{label.toUpperCase()}</Text>;
}
const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
});
