import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { signInSchema } from '@/features/auth/schemas/auth-schemas';

export default function SignInScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  async function handleSignIn() {
    setErrors({});
    const parsed = signInSchema.safeParse({ email, password });
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
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setErrors({ general: result.error.message });
      return;
    }

    router.replace('/(app)/(tabs)');
  }

  async function handleGoogleSignIn() {
    setErrors({});
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.error) {
      setErrors({ general: result.error.message });
    }
  }

  return (
    <Screen scroll>
      <Text className="mb-2 text-3xl font-bold text-gray-900">Welcome back</Text>
      <Text className="mb-8 text-gray-500">Sign in to CoolifyAI</Text>

      {errors.general ? (
        <Text className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-center text-red-600">
          {errors.general}
        </Text>
      ) : null}

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="password"
        placeholder="••••••••"
      />

      <TouchableOpacity className="mb-6 self-end">
        <Link href="/(auth)/forgot-password">
          <Text className="text-sm text-blue-600">Forgot password?</Text>
        </Link>
      </TouchableOpacity>

      <Button title="Sign In" loading={loading} onPress={handleSignIn} />
      <Button
        title="Continue with Google"
        variant="outline"
        loading={googleLoading}
        onPress={handleGoogleSignIn}
      />

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-500">{"Don't have an account?"} </Text>
        <Link href="/(auth)/sign-up">
          <Text className="font-semibold text-blue-600">Sign up</Text>
        </Link>
      </View>
    </Screen>
  );
}
