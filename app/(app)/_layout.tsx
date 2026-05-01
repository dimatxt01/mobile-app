import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { colors } from '@/lib/hmc-colors';

export default function AppLayout() {
  const { session, isInitialized } = useAuth();
  const { profile, isLoading } = useProfileStore();

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!profile?.onboarding_completed) return <Redirect href="/(onboarding)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center' },
});
