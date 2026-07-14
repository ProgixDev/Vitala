import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Card, Icon, Badge, FadeInView } from '@/components/ui';
import { AskCard } from '@/components/AskCard';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors, shadow } from '@/constants/theme';
import { FIRST_AID_TOPICS } from '@/lib/firstAid';
import { brand } from '@/constants/brand';

const SCENARIOS = [
  { icon: 'pulse-outline' as const, color: brand.tile.red, key: 'cpr' },
  { icon: 'alert-circle-outline' as const, color: brand.tile.amber, key: 'choking' },
];

export default function LearnHub() {
  const { t, language } = useTranslation();
  const colors = useThemeColors();
  const lang = language === 'fr' ? 'fr' : 'en';

  const soon = () =>
    Toast.show({ type: 'info', text1: t('learn.comingSoon') });

  return (
    <Screen scroll edges={['top']} contentClassName="px-0 pb-10">
      <Header title={t('learn.hubTitle')} subtitle={t('learn.hubSubtitle')} />

      {/* Assistant */}
      <FadeInView index={0} className="mt-2 px-5">
        <AskCard
          title={t('learn.askTitle')}
          subtitle={t('learn.assistantCta')}
          onPress={soon}
        />
        <Text variant="caption" className="mt-2 px-1">
          {t('learn.assistantDesc')}
        </Text>
      </FadeInView>

      {/* Practice scenarios */}
      <FadeInView index={1} className="mb-3 mt-8 px-5">
        <Text variant="heading">{t('learn.practiceTitle')}</Text>
        <Text variant="caption" className="mt-0.5">
          {t('learn.practiceDesc')}
        </Text>
      </FadeInView>
      <View className="flex-row gap-3 px-5">
        {SCENARIOS.map((s) => (
          <Pressable key={s.key} onPress={soon} className="flex-1 active:opacity-80">
            <Card className="items-start gap-3">
              <View
                style={[shadow.e1, { backgroundColor: s.color }]}
                className="h-12 w-12 items-center justify-center rounded-2xl"
              >
                <Icon name={s.icon} size={24} color="#FFFFFF" weight="bold" />
              </View>
              <Text variant="bodyMedium" numberOfLines={2}>
                {FIRST_AID_TOPICS.find((x) => x.id === s.key)?.title[lang]}
              </Text>
              <Badge label={t('learn.comingSoon')} tone="neutral" />
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Emergency tips */}
      <FadeInView index={2} className="mb-3 mt-8 px-5">
        <Text variant="heading">{t('learn.topicsTitle')}</Text>
      </FadeInView>
      <View className="gap-3 px-5">
        {FIRST_AID_TOPICS.map((topic, i) => (
          <FadeInView key={topic.id} index={i + 3}>
            <Pressable
              onPress={() => router.push(`/learn/${topic.id}`)}
              className="active:opacity-80"
            >
              <Card className="flex-row items-center gap-4">
                <View
                  style={[shadow.e1, { backgroundColor: topic.color }]}
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                >
                  <Icon name={topic.icon} size={24} color="#FFFFFF" weight="bold" />
                </View>
                <View className="flex-1">
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {topic.title[lang]}
                  </Text>
                  <Text variant="caption" numberOfLines={1} className="mt-0.5">
                    {t('learn.minRead', { min: topic.minRead })} · {topic.summary[lang]}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
              </Card>
            </Pressable>
          </FadeInView>
        ))}
      </View>
    </Screen>
  );
}
