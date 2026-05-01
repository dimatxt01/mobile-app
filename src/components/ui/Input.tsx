import { Text, TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { colors, fonts } from '@/lib/hmc-colors';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textTertiary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.elevated,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineStrong,
  },
  inputError: { borderColor: colors.danger },
  errorText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
});
