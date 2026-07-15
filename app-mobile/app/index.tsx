import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { BrandMark } from '@/components/BrandMark';
import { useThemeColors } from '@/constants/theme';

export default function Index() {
  const { booting, isLoggedIn, me, loadingMe } = useSession();
  const colors = useThemeColors();

  // Wait while booting or loading the profile we need to route by role — so a
  // nurse lands straight in their shell, no flash of tabs.
  if (booting || (isLoggedIn && !me && loadingMe)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <BrandMark size={64} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  // Logged out: onboarding is the front door — it carries the sign-in / sign-up CTAs.
  if (!isLoggedIn) return <Redirect href="/onboarding" />;
  if (me?.role === 'nurse') return <Redirect href="/(nurse)" />;
  return <Redirect href="/(tabs)" />;
}
