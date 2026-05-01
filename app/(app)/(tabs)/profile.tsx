import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setLoading(true);
    setError(null);
    const result = await signOut();
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    router.replace('/(auth)/sign-in');
  }

  return (
    <Screen>
      <Text className="mb-6 text-2xl font-bold text-gray-900">Profile</Text>
      <View className="mb-8 rounded-xl bg-gray-50 p-4">
        <Text className="text-sm text-gray-500">Email</Text>
        <Text className="mt-1 text-base text-gray-900">{user?.email ?? '—'}</Text>
      </View>
      {error ? <Text className="mb-4 text-center text-red-500">{error}</Text> : null}
      <Button title="Sign Out" variant="outline" loading={loading} onPress={handleSignOut} />
    </Screen>
  );
}
