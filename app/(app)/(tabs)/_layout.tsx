import { Tabs } from 'expo-router';
<<<<<<< HEAD
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
=======
import { PrintTabBar } from '@/components/hmc/PrintTabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <PrintTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="week" options={{ title: 'Week' }} />
      <Tabs.Screen name="trends" options={{ title: 'Trends' }} />
      <Tabs.Screen name="mirror" options={{ title: 'Mirror' }} />
      <Tabs.Screen name="you" options={{ title: 'You' }} />
>>>>>>> 35ae86c4ddb1472145ca485587f2c87162186555
    </Tabs>
  );
}
