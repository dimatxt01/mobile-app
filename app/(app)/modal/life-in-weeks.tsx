import { View, Text, TouchableOpacity, FlatList, Dimensions, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfileStore } from '@/store/profile-store';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';
import { Rule } from '@/components/habits/Rule';
import { computeWeeksLived } from '@/lib/life-in-weeks';

const WEEKS_TOTAL = 4004; // 52 weeks x 77 years
const COLS = 52;
const GAP = 1;
const { width } = Dimensions.get('window');
const SQUARE = Math.floor((width - spacing.pagePad * 2 - GAP * (COLS - 1)) / COLS);

export default function LifeInWeeksScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfileStore();
  const weeksLived = computeWeeksLived(profile?.date_of_birth ?? null);
  const weeksRemaining = Math.max(WEEKS_TOTAL - weeksLived, 0);

  const weeks = Array.from({ length: WEEKS_TOTAL }, (_, i) => i);

  const renderHeader = () => (
    <View>
      <View style={[styles.headerTop, { paddingTop: insets.top + 16 }]}>
        <Eyebrow label="LIFE IN WEEKS" />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
      <Rule />
      <View style={styles.statsBlock}>
        <Text style={styles.statPrimary}>
          You have lived{' '}
          <Text style={styles.statNum}>{weeksLived.toLocaleString()}</Text>
          {' '}weeks
        </Text>
        <Text style={styles.statSecondary}>
          ~{weeksRemaining.toLocaleString()} weeks remaining
        </Text>
      </View>
      <Rule />
      <View style={styles.gridPad} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={weeks}
        renderItem={({ item }) => (
          <View
            style={[
              styles.square,
              item < weeksLived ? styles.squareLived : styles.squareFuture,
            ]}
          />
        )}
        keyExtractor={(item) => String(item)}
        numColumns={COLS}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={styles.footer} />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={COLS * 8}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.elevated },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.pagePad,
    paddingBottom: 12,
  },
  closeText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
  statsBlock: {
    paddingHorizontal: spacing.pagePad,
    paddingVertical: 20,
    gap: 6,
  },
  statPrimary: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textSecondary,
  },
  statNum: {
    fontFamily: fonts.monoBold,
    fontSize: 22,
    color: colors.amber,
    fontVariant: ['tabular-nums'],
  },
  statSecondary: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  gridPad: { height: 12 },
  gridRow: {
    gap: GAP,
    marginBottom: GAP,
    paddingHorizontal: spacing.pagePad,
  },
  square: {
    width: SQUARE,
    height: SQUARE,
    borderRadius: 1,
  },
  squareLived: { backgroundColor: colors.amber },
  squareFuture: { backgroundColor: colors.lineStrong },
  footer: { height: 40 },
});
