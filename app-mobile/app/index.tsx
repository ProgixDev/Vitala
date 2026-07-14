import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { useOnboarding } from '@/hooks/useOnboarding';
import { BrandMark } from '@/components/BrandMark';
import { useThemeColors } from '@/constants/theme';

export default function Index() {
  const { booting, isLoggedIn, me, loadingMe } = useSession();
  const { completed } = useOnboarding();
  const colors = useThemeColors();

  // Wait while booting, resolving onboarding, or loading the profile we need to
  // route by role — so a nurse lands straight in their shell, no flash of tabs.
  if (booting || completed === null || (isLoggedIn && !me && loadingMe)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <BrandMark size={64} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!completed) return <Redirect href="/onboarding" />;
  if (!isLoggedIn) return <Redirect href="/(auth)/sign-in" />;
  if (me?.role === 'nurse') return <Redirect href="/(nurse)" />;
  return <Redirect href="/(tabs)" />;
}
