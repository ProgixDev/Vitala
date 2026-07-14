import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Icon } from '@/components/ui';
import { FadeInView } from '@/components/ui/motion';
import { brand } from '@/constants/brand';
import { shadow } from '@/constants/theme';
import { cn } from '@/utils/cn';

const LOGO = require('../assets/logo.png');

interface AuthScaffoldProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Shows a back chevron in the header when provided. */
  onBack?: () => void;
  /** Rendered top-right in the header (e.g. a step counter). */
  headerRight?: ReactNode;
  /** Shows the Vitala logo coin centered in the header. */
  showLogo?: boolean;
  /** `full` = coin + wordmark (default), `mark` = coin only (tight headers). */
  logoVariant?: 'full' | 'mark';
  /** Rendered under the card, centered on the page background. */
  footer?: ReactNode;
  cardClassName?: string;
}

/**
 * Shared auth chrome: a deep-teal gradient header with soft decorative orbs and
 * an overlapping white "sheet" that holds the form. Handles the status bar,
 * safe areas, scrolling and keyboard avoidance so screens only supply content.
 */
export function AuthScaffold({
  title,
  subtitle,
  children,
  onBack,
  headerRight,
  showLogo,
  logoVariant = 'full',
  footer,
  cardClassName,
}: AuthScaffoldProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      {/* Gradient bleeds behind the status bar */}
      <LinearGradient
        colors={brand.authGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 320 + insets.top,
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View
            style={{ paddingTop: insets.top + 16 }}
            className="overflow-hidden px-6 pb-9"
          >
            {/* soft decorative orbs */}
            <View
              pointerEvents="none"
              style={{ backgroundColor: brand.authOrb }}
              className="absolute -right-10 -top-8 h-56 w-56 rounded-full"
            />
            <View
              pointerEvents="none"
              style={{ backgroundColor: brand.authOrb }}
              className="absolute -left-16 top-2 h-52 w-52 rounded-full"
            />

            <View className="min-h-11 flex-row items-center justify-between">
              {showLogo ? (
                <View
                  pointerEvents="none"
                  className="absolute inset-0 flex-row items-center justify-center gap-2.5"
                >
                  <View
                    style={shadow.e1}
                    className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
                  >
                    <Image source={LOGO} style={{ width: 30, height: 30 }} contentFit="contain" />
                  </View>
                  {logoVariant === 'full' ? (
                    <Text
                      className="font-display-bold text-[20px]"
                      style={{ color: brand.authOnHeader }}
                    >
                      Vitala
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {onBack ? (
                <Pressable
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  onPress={onBack}
                  className="h-11 w-11 -ml-2 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
                >
                  <Icon name="chevron-back" size={22} color={brand.authOnHeader} />
                </Pressable>
              ) : (
                <View className="h-11 w-11" />
              )}
              {headerRight ?? null}
            </View>

            <View className="mt-8">
              <Text
                className="font-display-bold text-[28px] leading-[34px]"
                style={{ color: brand.authOnHeader }}
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  className="mt-2 font-sans text-[14px] leading-[20px]"
                  style={{ color: 'rgba(255,255,255,0.82)' }}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>

          {/* ── Overlapping white sheet ── */}
          <View
            className={cn(
              '-mt-6 flex-1 rounded-t-[28px] bg-surface px-6 pt-7',
              cardClassName,
            )}
          >
            <FadeInView duration={340} style={{ paddingBottom: insets.bottom + 20 }}>
              {children}
              {footer ? <View className="mt-6">{footer}</View> : null}
            </FadeInView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
