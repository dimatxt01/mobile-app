import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { forgotPasswordSchema } from '@/features/auth/schemas/auth-schemas';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';

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
        <View style={s.centerWrap}>
          <Eyebrow label="CHECK INBOX" />
          <Text style={s.sentTitle}>Reset link sent.</Text>
          <Text style={s.sentBody}>
            If an account exists for <Text style={s.sentEmail}>{email}</Text>, you
            {"'"}ll receive a reset link shortly.
          </Text>
          <Link href="/(auth)/sign-in">
            <Text style={s.backLink}>Back to sign in</Text>
          </Link>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={s.title}>Reset password</Text>
      <Text style={s.subtitle}>{"Enter your email and we'll send you a reset link."}</Text>

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

      <View style={s.backRow}>
        <Link href="/(auth)/sign-in">
          <Text style={s.backLink}>Back to sign in</Text>
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
  backRow: { marginTop: 16, alignItems: 'center' },
  backLink: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.5, color: colors.amber },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sentTitle: {
    fontFamily: fonts.monoBold,
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  sentBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sentEmail: { fontFamily: fonts.displayMedium, color: colors.textPrimary },
});
