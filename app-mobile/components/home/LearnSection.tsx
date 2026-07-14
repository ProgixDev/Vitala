import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text, Icon, type IconName } from '@/components/ui';
import { AskCard } from '@/components/AskCard';
import { useTranslation } from '@/utils/i18n';
import { shadow } from '@/constants/theme';
import { brand } from '@/constants/brand';

const TILES: { icon: IconName; color: string; label: string; href: string }[] = [
  { icon: 'fitness-outline', color: brand.tile.orange, label: 'learn.practice', href: '/learn?focus=practice' },
  { icon: 'chatbubble-outline', color: brand.tile.violet, label: 'learn.assistant', href: '/learn?focus=assistant' },
  { icon: 'medical-outline', color: brand.tile.pink, label: 'learn.tips', href: '/learn?focus=tips' },
];

export function LearnSection() {
  const { t } = useTranslation();

  return (
    <View>
      {/* Section header */}
      <View className="mb-3 flex-row items-center justify-between px-5">
        <Text variant="heading">{t('learn.sectionTitle')}</Text>
        <Pressable hitSlop={8} onPress={() => router.push('/learn')}>
          <Text variant="caption" className="font-semibold text-primary">
            {t('common.seeAll')}
          </Text>
        </Pressable>
      </View>

      {/* Ask-me card */}
      <View className="px-5">
        <AskCard
          title={t('learn.askTitle')}
          subtitle={t('learn.askSubtitle')}
          onPress={() => router.push('/learn?focus=assistant')}
        />
      </View>

      {/* Feature tiles */}
      <View
        style={shadow.e1}
        className="mx-5 mt-3 flex-row justify-between rounded-[24px] bg-surface p-4"
      >
        {TILES.map((tile) => (
          <Pressable
            key={tile.label}
            onPress={() => router.push(tile.href as never)}
            className="flex-1 items-center px-1 active:opacity-70"
          >
            <View
              style={[shadow.e1, { backgroundColor: tile.color }]}
              className="h-14 w-14 items-center justify-center rounded-2xl"
            >
              <Icon name={tile.icon} size={26} color="#FFFFFF" weight="bold" />
            </View>
            <Text variant="caption" className="mt-2 text-center" numberOfLines={2}>
              {t(tile.label)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
