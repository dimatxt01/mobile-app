import { Text, TextInput, TextInputProps, View } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label ? <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text> : null}
      <TextInput
        className={`rounded-lg border px-4 py-3 text-base text-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}
