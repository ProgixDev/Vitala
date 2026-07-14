import { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text, Icon } from '@/components/ui';
import { shadow, useThemeColors } from '@/constants/theme';
import { categoryImage } from '@/utils/status';
import { useTranslation } from '@/utils/i18n';

interface Slide {
  /** i18n prefix — expects `${key}.eyebrow|title|cta`. */
  key: string;
  photo: string;
  href: Href;
  /** Render the CTA in emergency red — draws the eye for urgent actions. */
  urgent?: boolean;
}

const SLIDES: Slide[] = [
  { key: 'promo.book', photo: categoryImage('general-care'), href: '/booking/map' },
  { key: 'promo.sos', photo: categoryImage('emergency'), href: '/(tabs)/sos', urgent: true },
  { key: 'promo.learn', photo: categoryImage('vital-monitoring'), href: '/learn' },
];

const SIDE = 20; // horizontal page padding
const GAP = 14; // space between cards
const PEEK = 30; // how much of the next card shows

/**
 * The home hero — a swipeable carousel of full-bleed care photos, each with an
 * eyebrow, a Fraunces headline and a CTA that routes to the feature. Replaces
 * the old quick-actions grid; the images do the talking.
 */
export function PromoCarousel() {
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(0);

  const cardW = width - SIDE * 2 - PEEK;
  const snap = cardW + GAP;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / snap);
    if (i !== active) setActive(i);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snap}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: SIDE }}
        onMomentumScrollEnd={onScroll}
      >
        {SLIDES.map((s, i) => (
          <PromoSlide
            key={s.key}
            slide={s}
            width={cardW}
            style={{ marginRight: i === SLIDES.length - 1 ? 0 : GAP }}
          />
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View className="mt-3 flex-row items-center justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <Dot key={s.key} active={i === active} />
        ))}
      </View>
    </View>
  );
}

function PromoSlide({
  slide,
  width,
  style,
}: {
  slide: Slide;
  width: number;
  style?: object;
}) {
  const { t } = useTranslation();

  const onPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(slide.href);
  };

  return (
    <Pressable onPress={onPress} style={[{ width }, style]} className="active:opacity-95">
      <View style={shadow.e2} className="h-64 w-full overflow-hidden rounded-card">
        <Image
          source={{ uri: slide.photo }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={240}
        />
        {/* Legibility scrim — clear at top, deep at the bottom */}
        <LinearGradient
          colors={['rgba(8,15,25,0.05)', 'rgba(8,15,25,0.45)', 'rgba(8,15,25,0.88)']}
          locations={[0, 0.45, 1]}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* Overlaid copy + CTA */}
        <View className="absolute inset-x-0 bottom-0 gap-2 p-5">
          <Text
            variant="label"
            className="uppercase text-white/80"
            style={{ letterSpacing: 1.5, fontSize: 11 }}
          >
            {t(`${slide.key}.eyebrow`)}
          </Text>
          <Text
            className="text-white"
            style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 24, lineHeight: 27, letterSpacing: -0.5 }}
          >
            {t(`${slide.key}.title`)}
          </Text>

          {/* CTA — visual button; the whole card is the tap target.
              Urgent slides (SOS) go emergency-red to pull the eye. */}
          <View
            className={`mt-2 flex-row items-center gap-1.5 self-start rounded-full px-4 py-2.5 ${
              slide.urgent ? 'bg-emergency' : 'bg-white'
            }`}
          >
            <Text
              className={`font-semibold text-[13px] ${slide.urgent ? 'text-white' : 'text-foreground'}`}
            >
              {t(`${slide.key}.cta`)}
            </Text>
            <Icon
              name="arrow-forward"
              size={14}
              color={slide.urgent ? '#FFFFFF' : '#0F1A16'}
              weight="bold"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Dot({ active }: { active: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        height: 6,
        width: active ? 18 : 6,
        borderRadius: 3,
        backgroundColor: active ? colors.primary : colors.border,
      }}
    />
  );
}
