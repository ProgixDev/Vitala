import '../global.css';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StripeProvider } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { SessionProvider } from '@/providers/SessionProvider';
import { SosSheetProvider } from '@/providers/SosSheetProvider';
import { IncomingJobProvider } from '@/providers/IncomingJobProvider';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { useToastConfig } from '@/components/AppToast';
import { NotificationsBridge } from '@/components/NotificationsBridge';
import { config, isPlaceholder } from '@/lib/config';
import { restoreLanguage } from '@/utils/i18n';

void SplashScreen.preventAutoHideAsync();

function ToastHost() {
  const toastConfig = useToastConfig();
  return <Toast config={toastConfig} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const [splashDone, setSplashDone] = useState(false);

  // Read the cached language before the first paint, so an English user doesn't
  // watch the app come up in French. Held behind the same gate as the fonts —
  // it's one AsyncStorage read, and the splash is already covering us.
  const [langReady, setLangReady] = useState(false);
  useEffect(() => {
    void restoreLanguage().finally(() => setLangReady(true));
  }, []);

  const ready = fontsLoaded && langReady;

  const onReady = useCallback(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  if (!ready) return null;

  const stripeKey = isPlaceholder(config.stripePublishableKey)
    ? ''
    : config.stripePublishableKey;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider
          publishableKey={stripeKey}
          merchantIdentifier={config.stripeMerchantId}
        >
          <SessionProvider>
            <NotificationsBridge />
            <IncomingJobProvider>
              <SosSheetProvider>
                <View className="flex-1 bg-background">
                  <StatusBar style="auto" />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: 'transparent' },
                      animation: 'fade',
                      animationDuration: 260,
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(nurse)" />
                    <Stack.Screen
                      name="booking/map"
                      options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                    />
                    {/* Mapbox owns the whole screen while navigating. */}
                    <Stack.Screen
                      name="navigate/[id]"
                      options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                    />
                  </Stack>
                </View>
              </SosSheetProvider>
            </IncomingJobProvider>
          </SessionProvider>
        </StripeProvider>
      </SafeAreaProvider>
      <ToastHost />
      {!splashDone ? <AnimatedSplash onDone={() => setSplashDone(true)} /> : null}
    </GestureHandlerRootView>
  );
}
