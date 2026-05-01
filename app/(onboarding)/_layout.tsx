import { Stack } from 'expo-router';
import { colors } from '@/lib/hmc-colors';
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.base } }} />
  );
}
