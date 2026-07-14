import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { useOnboarding } from '@/hooks/useOnboarding';
import { BrandMark } from '@/components/BrandMark';
import { useThemeColors } from '@/constants/theme';

export default function Index() {
  const { booting, isLoggedIn } = useSession();
  const { completed } = useOnboarding();
  const colors = useThemeColors();

  if (booting || completed === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <BrandMark size={64} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!completed) return <Redirect href="/onboarding" />;
  if (!isLoggedIn) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)" />;
}
