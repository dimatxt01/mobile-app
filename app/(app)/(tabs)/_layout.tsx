import { Tabs } from 'expo-router';
import { PrintTabBar } from '@/components/hmc/PrintTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <PrintTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
      <Tabs.Screen name="trends" options={{ title: 'Trends' }} />
      <Tabs.Screen name="mirror" options={{ title: 'Mirror' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
    </Tabs>
  );
}
