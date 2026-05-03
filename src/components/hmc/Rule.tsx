import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/hmc-colors';

export function Rule({ strong }: { strong?: boolean }) {
  return <View style={strong ? styles.strong : styles.rule} />;
}
const styles = StyleSheet.create({
  rule: { height: spacing.hairline, backgroundColor: colors.borderSubtle },
  strong: { height: spacing.hairline, backgroundColor: colors.borderDefault },
});
