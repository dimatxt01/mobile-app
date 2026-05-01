import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';

export default function HomeScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900">CoolifyAI</Text>
        <Text className="mt-2 text-gray-500">Welcome! More features coming soon.</Text>
      </View>
    </Screen>
  );
}
