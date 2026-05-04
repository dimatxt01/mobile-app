import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius, elevation } from '@/lib/habits-colors';
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
    <View style={styles.card}>
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
  card: {
    backgroundColor: colors.surface02,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
    ...elevation.sm,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
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
