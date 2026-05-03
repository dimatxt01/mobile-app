import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { radius, elevation } from '@/lib/hmc-tokens';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function BottomBar({ label, onPress, loading = false, disabled = false }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.pagePad }]}>
      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color={colors.base} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.pagePad,
    paddingTop: 12,
    backgroundColor: colors.surface01,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDefault,
  },
  btn: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: 'center',
    ...elevation.amber,
  },
  btnDisabled: { backgroundColor: colors.lineStrong, shadowOpacity: 0, elevation: 0 },
  label: {
    fontFamily: fonts.monoBold,
    fontSize: 15,
    color: colors.base,
    letterSpacing: 1,
  },
});
