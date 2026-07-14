import { Redirect, Tabs } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  const { booting, isLoggedIn } = useSession();

  if (booting) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: 'fade',
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="sos" />
      <Tabs.Screen name="payment" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
