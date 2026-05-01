import { Redirect } from 'expo-router';
<<<<<<< HEAD
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function Index() {
  const { session, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
=======
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileStore } from '@/store/profile-store';
import { supabase } from '@/lib/supabase';
import { colors } from '@/lib/hmc-colors';

export default function Index() {
  const { session, isInitialized } = useAuth();
  const { profile, isLoading, setProfile } = useProfileStore();

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn('Profile fetch error', error.message);
          return; // stay in loading state — don't redirect on transient errors
        }
        setProfile(data);
      });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  if (!isInitialized || (session && isLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
      </View>
    );
  }

<<<<<<< HEAD
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
=======
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!profile?.onboarding_completed) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(app)/(tabs)" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.base,
  },
});
>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
