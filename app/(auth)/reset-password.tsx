import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { resetPasswordSchema } from '@/features/auth/schemas/auth-schemas';

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const params = useLocalSearchParams();
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // The reset email delivers a PKCE code in the deep link:
    //   coolify-ai://reset-password?code=xxx
    // We exchange it for a session so the user can call updateUser.
    async function exchangeCode() {
      const url = await Linking.getInitialURL();
      if (!url) {
        setSessionError('No reset link detected. Please tap the link in your email again.');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        setSessionError(error.message);
        return;
      }
      setSessionReady(true);
    }

    exchangeCode();
  }, []);

  async function handleUpdatePassword() {
    setErrors({});
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof typeof fieldErrors;
        if (field) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setErrors({ password: result.error.message });
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace('/(auth)/sign-in'), 2000);
  }

  if (sessionError) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="mb-2 text-xl font-bold text-red-600">Link expired or invalid</Text>
          <Text className="text-center text-gray-500">{sessionError}</Text>
        </View>
      </Screen>
    );
  }

  if (!sessionReady) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Verifying reset link…</Text>
        </View>
      </Screen>
    );
  }

  if (success) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="mb-2 text-2xl font-bold text-gray-900">Password updated!</Text>
          <Text className="text-gray-500">Redirecting to sign in…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text className="mb-2 text-3xl font-bold text-gray-900">New password</Text>
      <Text className="mb-8 text-gray-500">Choose a strong password for your account.</Text>

      <Input
        label="New password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
        placeholder="••••••••"
      />
      <Input
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="••••••••"
      />

      <Button title="Update Password" loading={loading} onPress={handleUpdatePassword} />
    </Screen>
  );
}
