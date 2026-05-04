import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius, typo } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';

export default function ScoreBreakdownScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    identity: string;
    execution: string;
    outcome: string;
    penalty: string;
    total: string;
  }>();

  const rows = [
    { label: 'IDENTITY', value: Number(params.identity ?? 0), prefix: '+' },
    { label: 'EXECUTION', value: Number(params.execution ?? 0), prefix: '+' },
    { label: 'OUTCOMES', value: Number(params.outcome ?? 0), prefix: '+' },
    { label: 'PENALTY', value: Number(params.penalty ?? 0), prefix: '−', danger: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.dragHandle} />
      <Eyebrow label="SCORE BREAKDOWN" />
      <View style={styles.card}>
        {rows.map((r) => (
          <View key={r.label}>
            <View style={styles.row}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={[styles.value, r.danger && styles.danger]}>
                {r.prefix}
                {r.value}
              </Text>
            </View>
            <Rule />
          </View>
        ))}
        <View style={styles.row}>
          <Text style={[styles.label, styles.totalLabel]}>TOTAL</Text>
          <Text style={styles.totalValue}>{params.total ?? 0}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>CLOSE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.elevated, paddingHorizontal: spacing.pagePad },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderDefault,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  card: {
    marginTop: 24,
    backgroundColor: colors.surface02,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
    paddingHorizontal: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  label: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.textTertiary },
  value: {
    fontFamily: fonts.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  danger: { color: colors.danger },
  totalLabel: { color: colors.textPrimary },
  totalValue: {
    fontFamily: fonts.monoBold,
    ...typo.d2,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderDefault,
  },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
});
