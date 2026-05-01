import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function AuthLayout() {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) return null;

  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
