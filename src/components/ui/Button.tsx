import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fonts } from '@/lib/habits-colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantMap: Record<ButtonVariant, { btn: ViewStyle; text: TextStyle }> = {
  primary: { btn: { backgroundColor: colors.amber }, text: { color: colors.base } },
  secondary: { btn: { backgroundColor: colors.elevated }, text: { color: colors.textPrimary } },
  outline: {
    btn: {
      backgroundColor: 'transparent',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.lineStrong,
    },
    text: { color: colors.textPrimary },
  },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const v = variantMap[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.btn, v.btn, isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.base : colors.textPrimary} />
      ) : (
        <Text style={[styles.text, v.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  text: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  disabled: { opacity: 0.4 },
});
