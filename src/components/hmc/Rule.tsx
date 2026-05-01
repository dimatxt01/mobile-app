import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/hmc-colors';

export function Rule() {
  return <View style={styles.rule} />;
}
const styles = StyleSheet.create({
  rule: { height: spacing.hairline, backgroundColor: colors.lineRegular },
});
