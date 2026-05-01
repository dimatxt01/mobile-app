import { useState } from 'react';
import { Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { signUpSchema } from '@/features/auth/schemas/auth-schemas';

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function SignUpScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignUp() {
    setErrors({});
    const parsed = signUpSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);

    if (result.error) {
      setErrors({ general: result.error.message });
      return;
    }

    if (result.data.needsConfirmation) {
      setCheckEmail(true);
    } else {
      router.replace('/(app)/(tabs)');
    }
  }

  async function handleGoogleSignIn() {
    setErrors({});
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) setErrors({ general: error.message });
  }

  if (checkEmail) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="mb-4 text-4xl">📧</Text>
          <Text className="mb-2 text-2xl font-bold text-gray-900">Check your email</Text>
          <Text className="text-center text-gray-500">
            We sent a confirmation link to{' '}
            <Text className="font-medium text-gray-900">{email}</Text>. Open it to activate your
            account.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text className="mb-2 text-3xl font-bold text-gray-900">Create account</Text>
      <Text className="mb-8 text-gray-500">Join CoolifyAI</Text>

      {errors.general ? (
        <Text className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-center text-red-600">
          {errors.general}
        </Text>
      ) : null}

      <Input
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        error={errors.fullName}
        autoComplete="name"
        placeholder="Jane Smith"
      />
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
        autoComplete="new-password"
        placeholder="••••••••"
      />
      <Input
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="••••••••"
      />

      <Button title="Create Account" loading={loading} onPress={handleSignUp} />
      <Button
        title="Continue with Google"
        variant="outline"
        loading={googleLoading}
        onPress={handleGoogleSignIn}
      />

      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-500">Already have an account? </Text>
        <Link href="/(auth)/sign-in">
          <Text className="font-semibold text-blue-600">Sign in</Text>
        </Link>
      </View>
    </Screen>
  );
}
