import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Text, Icon } from '@/components/ui';
import { FadeInView } from '@/components/ui/motion';
import { BrandMark } from '@/components/BrandMark';
import { onboardingPhotos, type OnboardingPhotoKey } from '@/constants/onboardingPhotos';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors, shadow, fonts } from '@/constants/theme';

interface Slide {
  photo: OnboardingPhotoKey;
  titleKey: string;
  subtitleKey: string;
}

const slides: Slide[] = [
  { photo: 'anywhere', titleKey: 'onb.slide1.title', subtitleKey: 'onb.slide1.subtitle' },
  { photo: 'tailored', titleKey: 'onb.slide2.title', subtitleKey: 'onb.slide2.subtitle' },
  { photo: 'trust', titleKey: 'onb.slide3.title', subtitleKey: 'onb.slide3.subtitle' },
];

const SEGMENT_W = 22;

/** The pastel wash the photo cards sit on — mint pooling into warm paper. */
function Wash() {
  const colors = useThemeColors();
  const dark = colors.scheme === 'dark';

  return (
    <LinearGradient
      colors={
        dark
          ? ['#1A3830', '#0E1512', '#0E1512', '#16302A']
          : ['#C7E6DA', '#FBF9F5', '#FBF9F5', '#DFEDD6']
      }
      locations={[0, 0.36, 0.64, 1]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.88, y: 1 }}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
}

/**
 * Copy marks its own emphasis with asterisks — "Services made *for you*" — so the
 * bold words stay with the translator rather than being hard-coded per language.
 */
function Headline({ text }: { text: string }) {
  const parts = text.split('*');
  // Both the scale and the family are set explicitly on every run. The Text
  // primitive defaults to variant="body", so a nested run would otherwise inherit
  // 15px, and its `font-sans` would collide with `font-bold` (cn is a plain join,
  // not a merge) leaving the weight up to stylesheet order.
  const scale = 'text-[33px] leading-[41px] tracking-[-0.8px] text-foreground';
  return (
    <Text className={scale} style={{ fontFamily: fonts.body }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={`${part}-${i}`} className={scale} style={{ fontFamily: fonts.bold }}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

function Segment({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const colors = useThemeColors();
  const fill = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [index - 1, index], [0, SEGMENT_W], Extrapolation.CLAMP),
  }));

  return (
    <View
      style={{
        width: SEGMENT_W,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[{ height: 3, borderRadius: 1.5, backgroundColor: colors.primary }, fill]}
      />
    </View>
  );
}

/** Advances the sequence; on the last slide it goes on to sign-up. */
function NextButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const press = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={press}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPressIn={() => {
          scale.value = withTiming(0.94, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 130 });
        }}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={shadow.e2}
        className="h-[58px] w-[58px] items-center justify-center rounded-full bg-primary"
      >
        <Icon name="arrow-forward" size={20} color={colors.onPrimary} weight="bold" />
      </Pressable>
    </Animated.View>
  );
}

function Page({
  slide,
  index,
  progress,
  width,
}: {
  slide: Slide;
  index: number;
  progress: SharedValue<number>;
  width: number;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  // The card drifts and settles; the words lift in behind it.
  const photo = useAnimatedStyle(() => {
    const d = progress.value - index;
    const away = Math.abs(d);
    return {
      opacity: interpolate(away, [0, 0.9], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: -d * 44 },
        { scale: interpolate(away, [0, 1], [1, 0.92], Extrapolation.CLAMP) },
      ],
    };
  });

  const words = useAnimatedStyle(() => {
    const away = Math.abs(progress.value - index);
    return {
      opacity: interpolate(away, [0, 0.8], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(away, [0, 1], [0, 20], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={{ width }} className="flex-1">
      <Animated.View style={[{ flex: 1 }, photo]} className="px-6 pt-2" pointerEvents="none">
        <View
          style={[
            shadow.e3,
            { flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: colors.surfaceAlt },
          ]}
        >
          <Image
            source={onboardingPhotos[slide.photo]}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={280}
          />
          {/* The same brand tint the Well gives photography, so three separately
              shot images read as one set rather than three stock photos. */}
          <LinearGradient
            colors={
              colors.scheme === 'dark'
                ? ['rgba(10,20,18,0.12)', 'rgba(10,20,18,0.44)']
                : ['rgba(14,124,107,0.06)', 'rgba(13,40,35,0.26)']
            }
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      <Animated.View style={words} className="px-7 pt-6">
        <Headline text={t(slide.titleKey)} />
        <Text className="mt-3 max-w-[310px] font-sans text-[15px] leading-[23px] text-muted-foreground">
          {t(slide.subtitleKey)}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === slides.length - 1;

  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });
  const progress = useDerivedValue(() => scrollX.value / width);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const advance = () => {
    if (isLast) {
      router.push('/(auth)/patient-signup');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <Wash />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <FadeInView className="px-7 pt-1">
          <BrandMark size={32} withWordmark />
        </FadeInView>

        <Animated.FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={slides}
          keyExtractor={(s) => s.titleKey}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item, index: i }) => (
            <Page slide={item} index={i} progress={progress} width={width} />
          )}
        />

        <FadeInView delay={420} className="px-7 pb-2 pt-4">
          <View className="flex-row items-center justify-between">
            <Pressable
              hitSlop={12}
              accessibilityRole="link"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text className="font-medium text-[14px] text-muted-foreground">
                {isLast ? t('onb.login') : t('common.skip')}
              </Text>
            </Pressable>

            {/* The arrow shows no text, so the label is all a screen reader gets. */}
            <NextButton
              label={isLast ? t('onb.createAccount') : t('common.next')}
              onPress={advance}
            />
          </View>

          {/* Centred on the bar itself, so the button growing on the last slide
              doesn't shove the ticks sideways. */}
          <View
            pointerEvents="none"
            className="absolute inset-0 flex-row items-center justify-center gap-1.5"
          >
            {slides.map((s, i) => (
              <Segment key={s.titleKey} index={i} progress={progress} />
            ))}
          </View>
        </FadeInView>
      </SafeAreaView>
    </View>
  );
}
