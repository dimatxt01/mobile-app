import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory } from '@/features/history/use-history';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';
import { Rule } from '@/components/hmc/Rule';

const RANGES = [30, 90, 365] as const;

export default function TrendsScreen() {
  const insets = useSafeAreaInsets();
  const [days, setDays] = useState<number>(30);
  const { data: history } = useHistory(days);
  const rows = history ?? [];

  if (rows.length < 7) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Eyebrow label="KEEP CHECKING IN" />
        <Text style={styles.emptyText}>Trends visible after 7 days.</Text>
      </View>
    );
  }

  const avg = Math.round(rows.reduce((s, r) => s + r.total_score, 0) / rows.length);
  const maxScore = Math.max(...rows.map((r) => r.total_score), 1);
  const best = rows.reduce((b, r) => (r.total_score > b.total_score ? r : b), rows[0]!);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Eyebrow label="TRENDS" />
        <View style={styles.pills}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.pill, days === r && styles.pillActive]}
              onPress={() => setDays(r)}
            >
              <Text style={[styles.pillText, days === r && styles.pillTextActive]}>{r}D</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Eyebrow label="AVG" />
          <Text style={styles.statValue}>{avg}</Text>
        </View>
        <View style={styles.statItem}>
          <Eyebrow label="BEST" />
          <Text style={styles.statValue}>{best.total_score}</Text>
        </View>
        <View style={styles.statItem}>
          <Eyebrow label="DAYS" />
          <Text style={styles.statValue}>{rows.length}</Text>
        </View>
      </View>

      <Rule />

      <Eyebrow label="SCORE OVER TIME" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sparkScroll}>
        <View style={styles.sparkRow}>
          {rows
            .slice()
            .reverse()
            .map((r) => {
              const h = (r.total_score / maxScore) * 40;
              return (
                <View
                  key={r.id}
                  style={[
                    styles.sparkBar,
                    {
                      height: Math.max(h, 2),
                      backgroundColor: r.total_score >= avg ? colors.amber : colors.lineStrong,
                    },
                  ]}
                />
              );
            })}
        </View>
      </ScrollView>

      <Rule />

      <View style={styles.bracketSection}>
        <Eyebrow label="BRACKET AVERAGES" />
        {(['identity', 'execution', 'outcome', 'penalty'] as const).map((bracket) => {
          const bracketAvg = Math.round(
            rows.reduce((s, r) => s + (r[`${bracket}_score`] ?? 0), 0) / rows.length,
          );
          return (
            <View key={bracket} style={styles.bracketRow}>
              <Text style={styles.bracketLabel}>{bracket.toUpperCase()}</Text>
              <Text style={styles.bracketValue}>{bracketAvg}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  centered: { alignItems: 'center', justifyContent: 'center' },
  emptyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pills: { flexDirection: 'row', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  pillActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  pillText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textTertiary },
  pillTextActive: { color: colors.base },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontFamily: fonts.monoBold,
    fontSize: 28,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  sparkScroll: { marginVertical: 16 },
  sparkRow: { flexDirection: 'row', alignItems: 'flex-end', height: 44, gap: 2 },
  sparkBar: { width: 4, borderRadius: 1 },
  bracketSection: { paddingVertical: 12 },
  bracketRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  bracketLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  bracketValue: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
