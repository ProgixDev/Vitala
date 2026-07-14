import { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  useWindowDimensions,
  Pressable,
  type ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Text, Button } from '@/components/ui';
import { FadeInView } from '@/components/ui/motion';
import { OnboardingArt, type OnboardingArtKey } from '@/components/onboarding/OnboardingArt';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTranslation } from '@/utils/i18n';
import { shadow } from '@/constants/theme';
import { brand } from '@/constants/brand';
import { cn } from '@/utils/cn';

const LOGO = require('../assets/logo.png');

interface Slide {
  scene: OnboardingArtKey;
  eyebrowKey: string;
  titleKey: string;
  subtitleKey: string;
  tagA: string;
  tagB: string;
  dotA: string;
  dotB: string;
}

const AMBER = '#F0B429';

const slides: Slide[] = [
  {
    scene: 'home',
    eyebrowKey: 'onb.slide1.eyebrow',
    titleKey: 'onb.slide1.title',
    subtitleKey: 'onb.slide1.subtitle',
    tagA: 'onb.slide1.tagA',
    tagB: 'onb.slide1.tagB',
    dotA: '#0E7C6B',
    dotB: AMBER,
  },
  {
    scene: 'personalized',
    eyebrowKey: 'onb.slide2.eyebrow',
    titleKey: 'onb.slide2.title',
    subtitleKey: 'onb.slide2.subtitle',
    tagA: 'onb.slide2.tagA',
    tagB: 'onb.slide2.tagB',
    dotA: AMBER,
    dotB: '#0E7C6B',
  },
  {
    scene: 'trust',
    eyebrowKey: 'onb.slide3.eyebrow',
    titleKey: 'onb.slide3.title',
    subtitleKey: 'onb.slide3.subtitle',
    tagA: 'onb.slide3.tagA',
    tagB: 'onb.slide3.tagB',
    dotA: '#0E7C6B',
    dotB: AMBER,
  },
];

/** A frosted proof-chip that gently drifts — the screen's one signature flourish. */
function FloatChip({
  label,
  dotColor,
  phase,
  className,
}: {
  label: string;
  dotColor: string;
  phase: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.value = withDelay(
      phase,
      withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true),
    );
  }, [reduced, phase, t]);

  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: t.value * -8 }] }));

  return (
    <Animated.View
      style={[
        anim,
        shadow.e2,
        { backgroundColor: 'rgba(255,255,255,0.96)' },
      ]}
      className={cn('absolute flex-row items-center gap-2 rounded-full py-2 pl-3 pr-3.5', className)}
    >
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
      <Text className="font-semibold text-[12px] text-foreground">{label}</Text>
    </Animated.View>
  );
}

function CarePanel({ slide, width }: { slide: Slide; width: number }) {
  const { t } = useTranslation();
  const panelW = Math.min(width - 72, 300);

  return (
    <View style={{ width: panelW, height: panelW * 0.94 }}>
      {/* framed art card */}
      <LinearGradient
        colors={['#FFFFFF', '#E9F5F0']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={[
          shadow.e3,
          {
            flex: 1,
            borderRadius: 34,
            borderWidth: 1,
            borderColor: 'rgba(14,124,107,0.10)',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          },
        ]}
      >
        <OnboardingArt scene={slide.scene} size={panelW * 0.82} />
      </LinearGradient>

      {/* orbiting proof-chips */}
      <FloatChip
        label={t(slide.tagA)}
        dotColor={slide.dotA}
        phase={0}
        className="-left-3 top-6"
      />
      <FloatChip
        label={t(slide.tagB)}
        dotColor={slide.dotB}
        phase={900}
        className="-right-2 bottom-8"
      />
    </View>
  );
}

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { complete } = useOnboarding();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === slides.length - 1;
  const panelZone = Math.round(height * 0.46);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const finish = async (dest: '/(auth)/patient-signup' | '/(auth)/sign-in') => {
    await complete();
    router.replace(dest);
  };

  const goNext = () => {
    if (isLast) return;
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* teal canvas — the same world the auth screens live in */}
      <LinearGradient
        colors={brand.authGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.54 }}
      />
      {/* decorative orbs */}
      <View
        pointerEvents="none"
        style={{ backgroundColor: brand.authOrb }}
        className="absolute -right-12 top-10 h-60 w-60 rounded-full"
      />
      <View
        pointerEvents="none"
        style={{ backgroundColor: brand.authOrb }}
        className="absolute -left-16 top-40 h-56 w-56 rounded-full"
      />

      {/* overlapping white sheet */}
      <View
        pointerEvents="none"
        style={[shadow.e3, { height: height * 0.5 }]}
        className="absolute bottom-0 left-0 right-0 rounded-t-[36px] bg-surface"
      />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {/* header */}
        <View className="flex-row items-center justify-between px-6 pt-2">
          <View className="flex-row items-center gap-2.5">
            <View
              style={shadow.e1}
              className="h-10 w-10 items-center justify-center rounded-2xl bg-white"
            >
              <Image source={LOGO} style={{ width: 27, height: 27 }} contentFit="contain" />
            </View>
            <Text className="font-display-bold text-[19px] text-white">Vitala</Text>
          </View>
          {!isLast ? (
            <Pressable
              hitSlop={8}
              onPress={() => finish('/(auth)/sign-in')}
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}
            >
              <Text className="font-medium text-[13px] text-white">{t('common.skip')}</Text>
            </Pressable>
          ) : (
            <View className="h-8 w-14" />
          )}
        </View>

        {/* paged slides */}
        <FlatList
          ref={listRef}
          data={slides}
          keyExtractor={(s) => s.titleKey}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item }) => (
            <View style={{ width }} className="flex-1">
              <View style={{ height: panelZone }} className="items-center justify-center">
                <CarePanel slide={item} width={width} />
              </View>
              <View className="flex-1 items-center px-9 pt-6">
                <Text className="font-semibold text-[12px] uppercase tracking-[2px] text-primary">
                  {t(item.eyebrowKey)}
                </Text>
                <Text
                  className="mt-3 text-center font-display-bold text-[27px] leading-[33px] text-foreground"
                >
                  {t(item.titleKey)}
                </Text>
                <Text className="mt-3 text-center font-sans text-[15px] leading-[22px] text-muted-foreground">
                  {t(item.subtitleKey)}
                </Text>
              </View>
            </View>
          )}
        />

        {/* progress dots */}
        <View className="mb-5 mt-1 flex-row items-center justify-center gap-2">
          {slides.map((s, i) => (
            <View
              key={s.titleKey}
              className={cn(
                'h-2 rounded-full',
                i === index ? 'w-7 bg-primary' : 'w-2 bg-surface-alt',
              )}
            />
          ))}
        </View>

        {/* CTAs */}
        <View className="gap-3 px-6 pb-3">
          {isLast ? (
            <FadeInView key="cta-last" className="gap-3">
              <Button
                label={t('onb.createAccount')}
                iconRight="arrow-forward"
                onPress={() => finish('/(auth)/patient-signup')}
              />
              <Pressable
                className="items-center py-2"
                hitSlop={8}
                onPress={() => finish('/(auth)/sign-in')}
              >
                <Text className="font-medium text-[14px] text-muted-foreground">
                  {t('onb.haveAccount')}{' '}
                  <Text className="font-semibold text-primary">{t('onb.login')}</Text>
                </Text>
              </Pressable>
            </FadeInView>
          ) : (
            <Button label={t('common.next')} iconRight="arrow-forward" onPress={goNext} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
