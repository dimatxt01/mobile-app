import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, spacing, radius } from '@/lib/habits-colors';

const TAB_LABELS: Record<string, string> = {
  index: 'TODAY',
  week: 'WEEK',
  month: 'MONTH',
  profile: 'YOU',
};

export function PrintTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key]!;
    return (options as { href?: unknown }).href !== null;
  });
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 4 }]}>
      <View style={styles.tabs}>
        {visibleRoutes.map((route) => {
          const index = state.routes.indexOf(route);
          const isFocused = state.index === index;
          const { options } = descriptors[route.key]!;
          const label = (options.title ?? TAB_LABELS[route.name] ?? route.name).toUpperCase();
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => {
                if (!isFocused) navigation.navigate(route.name);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.pillWrap, isFocused && styles.pillActive]}>
                <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
              </View>
              {isFocused && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.base,
    paddingHorizontal: spacing.pagePad,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDefault,
  },
  tabs: { flexDirection: 'row', paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  pillWrap: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  pillActive: {
    backgroundColor: colors.accentMuted,
  },
  label: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.5, color: colors.textTertiary },
  labelActive: { color: colors.amber },
  underline: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 2,
    backgroundColor: colors.amber,
    borderRadius: 1,
  },
});
