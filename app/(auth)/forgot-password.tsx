import { useState } from 'react';
import { Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { forgotPasswordSchema } from '@/features/auth/schemas/auth-schemas';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setEmailError(undefined);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message);
      return;
    }

    setLoading(true);
    // Always show success to avoid email enumeration
    await resetPassword(email);
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="mb-4 text-4xl">✉️</Text>
          <Text className="mb-2 text-2xl font-bold text-gray-900">Check your email</Text>
          <Text className="mb-8 text-center text-gray-500">
            If an account exists for <Text className="font-medium text-gray-900">{email}</Text>, you
            {"'"}ll receive a reset link shortly.
          </Text>
          <Link href="/(auth)/sign-in">
            <Text className="font-semibold text-blue-600">Back to sign in</Text>
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text className="mb-2 text-3xl font-bold text-gray-900">Reset password</Text>
      <Text className="mb-8 text-gray-500">
        {"Enter your email and we'll send you a reset link."}
      </Text>

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={emailError}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />

      <Button title="Send Reset Link" loading={loading} onPress={handleReset} />

      <View className="mt-4 items-center">
        <Link href="/(auth)/sign-in">
          <Text className="text-sm text-blue-600">Back to sign in</Text>
        </Link>
      </View>
    </Screen>
  );
}
