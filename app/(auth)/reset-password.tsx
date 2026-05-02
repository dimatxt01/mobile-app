import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { resetPasswordSchema } from '@/features/auth/schemas/auth-schemas';
import { colors, fonts, spacing } from '@/lib/habits-colors';
import { Eyebrow } from '@/components/habits/Eyebrow';

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
        <View style={s.centerWrap}>
          <Eyebrow label="LINK EXPIRED" />
          <Text style={s.errorTitle}>Reset link invalid.</Text>
          <Text style={s.stateBody}>{sessionError}</Text>
          <Link href="/(auth)/forgot-password">
            <Text style={s.link}>Request a new link</Text>
          </Link>
        </View>
      </Screen>
    );
  }

  if (!sessionReady) {
    return (
      <Screen>
        <View style={s.centerWrap}>
          <Eyebrow label="PLEASE WAIT" />
          <Text style={s.stateBody}>Verifying reset link…</Text>
        </View>
      </Screen>
    );
  }

  if (success) {
    return (
      <Screen>
        <View style={s.centerWrap}>
          <Eyebrow label="ALL DONE" />
          <Text style={s.successTitle}>Password updated.</Text>
          <Text style={s.stateBody}>Redirecting to sign in…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={s.title}>New password</Text>
      <Text style={s.subtitle}>Choose a strong password for your account.</Text>

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
      <View style={s.backRow}>
        <Link href="/(auth)/sign-in">
          <Text style={s.link}>Back to sign in</Text>
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
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  errorTitle: {
    fontFamily: fonts.monoBold,
    fontSize: 20,
    color: colors.danger,
    marginTop: 16,
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  backRow: { marginTop: 16, alignItems: 'center' },
  link: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.amber },
});
