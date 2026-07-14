import { View, ActivityIndicator } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { NurseTabBar } from '@/components/NurseTabBar';
import { NursePending } from '@/components/NursePending';
import { useThemeColors } from '@/constants/theme';

export default function NurseLayout() {
  const { booting, isLoggedIn, me } = useSession();
  const colors = useThemeColors();

  if (booting) return null;
  if (!isLoggedIn) return <Redirect href="/(auth)/sign-in" />;

  // Wait for the profile before deciding what the nurse shell should show.
  if (!me) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Safety: a patient should never be in the nurse group.
  if (me.role !== 'nurse') return <Redirect href="/(tabs)" />;

  // Unapproved nurses see the verification gate instead of the working shell.
  const status = me.nurseProfile?.verification_status ?? 'pending';
  if (status !== 'approved') return <NursePending name={me.full_name} status={status} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: 'fade',
      }}
      tabBar={(props) => <NurseTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="earnings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
