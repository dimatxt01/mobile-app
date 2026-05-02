import { Stack } from 'expo-router';
import { colors } from '@/lib/habits-colors';
export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: colors.elevated },
      }}
    />
  );
}
