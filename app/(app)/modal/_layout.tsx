import { Stack } from 'expo-router';
import { colors } from '@/lib/hmc-colors';
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
