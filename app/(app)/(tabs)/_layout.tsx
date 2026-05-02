import { Tabs } from 'expo-router';
import { PrintTabBar } from '@/components/hmc/PrintTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <PrintTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
      <Tabs.Screen name="month" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* Hidden routes — content moved into Profile tab */}
      <Tabs.Screen name="you" options={{ href: null }} />
      <Tabs.Screen name="trends" options={{ href: null }} />
      <Tabs.Screen name="mirror" options={{ href: null }} />
    </Tabs>
  );
}
