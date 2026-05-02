import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, spacing } from '@/lib/habits-colors';

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
      <View style={styles.topLine} />
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
              <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
              {isFocused && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.base, paddingHorizontal: spacing.pagePad },
  topLine: { height: StyleSheet.hairlineWidth, backgroundColor: colors.lineStrong },
  tabs: { flexDirection: 'row', paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.textTertiary },
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
