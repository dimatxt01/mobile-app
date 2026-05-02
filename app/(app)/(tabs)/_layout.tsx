import { Tabs } from 'expo-router';
import { PrintTabBar } from '@/components/hmc/PrintTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <PrintTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
      <Tabs.Screen name="month" options={{ title: 'Month' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      {/* Hidden route — full gallery for View All navigation */}
      <Tabs.Screen name="mirror" options={{ href: null }} />
    </Tabs>
  );
}
