import { useRef, useState } from 'react';
import { View, FlatList, useWindowDimensions, Pressable, type ViewToken } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Icon, type IconName } from '@/components/ui';
import { BrandMark } from '@/components/BrandMark';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { cn } from '@/utils/cn';

interface Slide {
  icon: IconName;
  titleKey: string;
  subtitleKey: string;
}

const slides: Slide[] = [
  { icon: 'home-outline', titleKey: 'onb.slide1.title', subtitleKey: 'onb.slide1.subtitle' },
  { icon: 'heart-circle', titleKey: 'onb.slide2.title', subtitleKey: 'onb.slide2.subtitle' },
  { icon: 'shield-checkmark', titleKey: 'onb.slide3.title', subtitleKey: 'onb.slide3.subtitle' },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { complete } = useOnboarding();
  const colors = useThemeColors();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === slides.length - 1;

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <BrandMark size={40} withWordmark />
        {!isLast ? (
          <Pressable hitSlop={8} onPress={() => finish('/(auth)/sign-in')}>
            <Text variant="bodyMedium" className="text-muted-foreground">
              {t('common.skip')}
            </Text>
          </Pressable>
        ) : (
          <View className="h-6" />
        )}
      </View>

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
          <View style={{ width }} className="items-center justify-center px-8">
            <View className="mb-10 h-56 w-56 items-center justify-center rounded-full bg-surface-alt">
              <View className="h-36 w-36 items-center justify-center rounded-full bg-surface">
                <Icon name={item.icon} size={72} color={colors.primary} />
              </View>
            </View>
            <Text variant="title" className="text-center">
              {t(item.titleKey)}
            </Text>
            <Text variant="subtitle" className="mt-3 text-center">
              {t(item.subtitleKey)}
            </Text>
          </View>
        )}
      />

      <View className="mb-2 flex-row items-center justify-center gap-2">
        {slides.map((s, i) => (
          <View
            key={s.titleKey}
            className={cn(
              'h-2 rounded-full',
              i === index ? 'w-6 bg-primary' : 'w-2 bg-surface-alt',
            )}
          />
        ))}
      </View>

      <View className="gap-3 px-5 pb-4 pt-4">
        {isLast ? (
          <>
            <Button label={t('onb.createAccount')} onPress={() => finish('/(auth)/patient-signup')} />
            <Button
              label={t('onb.login')}
              variant="secondary"
              onPress={() => finish('/(auth)/sign-in')}
            />
          </>
        ) : (
          <Button label={t('common.next')} iconRight="arrow-forward" onPress={goNext} />
        )}
      </View>
    </SafeAreaView>
  );
}
