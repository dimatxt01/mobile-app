import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { signUpSchema } from '@/features/auth/schemas/auth-schemas';
import { colors, fonts } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';

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
        <View style={s.centerWrap}>
          <Eyebrow label="CHECK INBOX" />
          <Text style={s.checkTitle}>Confirmation sent.</Text>
          <Text style={s.checkBody}>
            We sent a confirmation link to <Text style={s.checkEmail}>{email}</Text>. Open it to
            activate your account.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={s.title}>Create account</Text>
      <Text style={s.subtitle}>Join HMC.</Text>

      {errors.general ? (
        <View style={s.error}>
          <Text style={s.errorText}>{errors.general}</Text>
        </View>
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

      <View style={s.footer}>
        <Text style={s.footerText}>Already have an account? </Text>
        <Link href="/(auth)/sign-in">
          <Text style={s.footerLink}>Sign in</Text>
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
    marginBottom: 32,
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
  footer: { marginTop: 24, flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontFamily: fonts.display, fontSize: 14, color: colors.textSecondary },
  footerLink: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.amber },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  checkTitle: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  checkBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkEmail: { fontFamily: fonts.displayMedium, color: colors.textPrimary },
});
