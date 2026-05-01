import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from './Eyebrow';
import { Rule } from './Rule';

type Props = {
  title: string;
  subtotal: number;
  children: React.ReactNode;
  danger?: boolean;
};

export function BracketBlock({ title, subtotal, children, danger = false }: Props) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Eyebrow label={title} />
        <Text style={[styles.subtotal, danger && styles.danger]}>
          {danger ? `−${subtotal}` : `+${subtotal}`}
        </Text>
      </View>
      <Rule />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { paddingHorizontal: spacing.pagePad },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  subtotal: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  danger: { color: colors.danger },
  body: { paddingTop: 4 },
});
