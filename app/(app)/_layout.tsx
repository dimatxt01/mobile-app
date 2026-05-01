import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function AppLayout() {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) return null;

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
