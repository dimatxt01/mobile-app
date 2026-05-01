import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { colors, fonts, spacing } from '@/lib/hmc-colors';
import { Eyebrow } from '@/components/hmc/Eyebrow';

export default function SignoutConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }]}
    >
      <Eyebrow label="SIGN OUT" />
      <Text style={styles.body}>Are you sure you want to sign out?</Text>
      <TouchableOpacity style={styles.dangerBtn} onPress={handleSignOut}>
        <Text style={styles.dangerText}>SIGN OUT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>CANCEL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.pagePad,
  },
  body: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginTop: 32,
  },
  dangerText: {
    fontFamily: fonts.monoBold,
    fontSize: 14,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  cancelBtn: { alignItems: 'center', marginTop: 16 },
  cancelText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textTertiary,
  },
});
