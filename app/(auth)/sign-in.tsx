import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { signInSchema } from '@/features/auth/schemas/auth-schemas';
import { colors, fonts, spacing } from '@/lib/habits-colors';

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
      <Text style={s.title}>Welcome back</Text>
      <Text style={s.subtitle}>Sign in to Habits.</Text>

      {errors.general ? (
        <View style={s.error}>
          <Text style={s.errorText}>{errors.general}</Text>
        </View>
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

      <TouchableOpacity style={s.forgotRow}>
        <Link href="/(auth)/forgot-password">
          <Text style={s.forgotText}>Forgot password?</Text>
        </Link>
      </TouchableOpacity>

      <Button title="Sign In" loading={loading} onPress={handleSignIn} />
      <Button
        title="Continue with Google"
        variant="outline"
        loading={googleLoading}
        onPress={handleGoogleSignIn}
      />

      <View style={s.footer}>
        <Text style={s.footerText}>{"Don't have an account?"} </Text>
        <Link href="/(auth)/sign-up">
          <Text style={s.footerLink}>Sign up</Text>
        </Link>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.monoBold, fontSize: 28, color: colors.textPrimary, marginBottom: 4 },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sectionGap,
  },
  error: {
    backgroundColor: colors.elevated,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.danger,
  },
  errorText: { fontFamily: fonts.display, fontSize: 13, color: colors.danger, textAlign: 'center' },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.amber },
  footer: { marginTop: 24, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontFamily: fonts.display, fontSize: 14, color: colors.textSecondary },
  footerLink: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.amber },
});
