import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Rule } from './Rule';

type Props = { dayNumber: number };

export function PrintBar({ dayNumber }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <Text style={styles.logo}>HMC.</Text>
        <Text style={styles.day}>DAY {dayNumber}</Text>
      </View>
      <Rule />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.base,
    paddingHorizontal: spacing.pagePad,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: 8,
  },
  logo: { fontFamily: fonts.monoBold, fontSize: 18, color: colors.textPrimary, letterSpacing: 2 },
  day: { fontFamily: fonts.mono, fontSize: 12, color: colors.textTertiary, letterSpacing: 1.5 },
});
