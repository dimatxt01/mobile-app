import { Stack } from 'expo-router';
import { colors } from '@/lib/habits-colors';
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.base } }} />
  );
}
