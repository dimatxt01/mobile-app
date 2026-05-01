import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
};

export function Screen({ children, scroll = false, className = '' }: ScreenProps) {
  const inner = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-6 py-8"
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 px-6 py-8 ${className}`}>{children}</View>
  );

  return <SafeAreaView className="flex-1 bg-white">{inner}</SafeAreaView>;
}
