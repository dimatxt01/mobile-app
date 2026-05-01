import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-blue-600 active:bg-blue-700', text: 'text-white' },
  secondary: { container: 'bg-gray-200 active:bg-gray-300', text: 'text-gray-900' },
  outline: {
    container: 'border border-gray-300 bg-white active:bg-gray-50',
    text: 'text-gray-700',
  },
};

<<<<<<< HEAD
export function Button({ title, variant = 'primary', loading = false, disabled, ...props }: ButtonProps) {
=======
export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
  const styles = variantStyles[variant];

  return (
    <TouchableOpacity
      className={`mb-3 w-full items-center rounded-lg px-4 py-3.5 ${styles.container} ${
        disabled || loading ? 'opacity-60' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#374151'} />
      ) : (
        <Text className={`text-base font-semibold ${styles.text}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
