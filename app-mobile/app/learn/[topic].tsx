import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Header, Text, Icon, EmptyState, FadeInView } from '@/components/ui';
import { PulseLine } from '@/components/learn/PulseLine';
import { SectionLabel } from '@/components/learn/SectionLabel';
import { FirstAidArt } from '@/components/learn/FirstAidArt';
import { useTranslation } from '@/utils/i18n';
import { shadow, useThemeColors } from '@/constants/theme';
import { getTopic } from '@/lib/firstAid';
import { brand } from '@/constants/brand';

export default function TopicDetail() {
  const { topic: id } = useLocalSearchParams<{ topic: string }>();
  const { t, language } = useTranslation();
  const colors = useThemeColors();
  const lang = language === 'fr' ? 'fr' : 'en';
  const topic = getTopic(String(id));

  if (!topic) {
    return (
      <Screen edges={['top']}>
        <Header />
        <EmptyState icon="help-circle-outline" title={t('learn.comingSoon')} />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['top']} contentClassName="px-0 pb-12">
      <Header showBack />

      {/* Hero — the protocol at a glance */}
      <FadeInView index={0} className="px-5 pt-1">
        <View
          style={[shadow.e1, { borderColor: colors.border }]}
          className="overflow-hidden rounded-card border bg-surface"
        >
          <View style={{ backgroundColor: topic.color, height: 5 }} />
          <View className="p-5">
            <View className="flex-row items-center gap-3">
              <FirstAidArt kind={topic.id} color={topic.color} size={68} />
              <View className="flex-1">
                <SectionLabel>{t('learn.protocolsTitle')}</SectionLabel>
                <View className="mt-1 flex-row items-center gap-1">
                  <Icon name="time-outline" size={12} color={colors.mutedForeground} />
                  <Text variant="caption">
                    {t('learn.minRead', { min: topic.minRead })}
                  </Text>
                </View>
              </View>
            </View>
            <Text variant="title" className="mt-4" numberOfLines={2}>
              {topic.title[lang]}
            </Text>
            <Text variant="subtitle" className="mt-2">
              {topic.summary[lang]}
            </Text>
            <View className="mt-3">
              <PulseLine color={topic.color} height={34} />
            </View>
          </View>
        </View>
      </FadeInView>

      {/* Warning */}
      <FadeInView index={1} className="mt-4 px-5">
        <View
          style={shadow.e1}
          className="flex-row items-start gap-3 rounded-card bg-emergency/10 p-4"
        >
          <Icon name="warning-outline" size={22} color={brand.tile.red} weight="bold" />
          <Text variant="caption" className="flex-1 text-emergency">
            {topic.warning[lang]}
          </Text>
        </View>
      </FadeInView>

      {/* Steps — a genuine sequence, so numbered */}
      <FadeInView index={2} className="mb-3 mt-8 px-5">
        <SectionLabel>{t('learn.steps')}</SectionLabel>
      </FadeInView>
      <View className="gap-3 px-5">
        {topic.steps.map((step, i) => (
          <FadeInView key={i} index={i + 3}>
            <View
              style={shadow.e1}
              className="flex-row items-stretch overflow-hidden rounded-card bg-surface"
            >
              <View style={{ backgroundColor: topic.color, width: 5 }} />
              <View className="flex-1 flex-row gap-4 p-4 pl-[18px]">
                <View
                  style={{ backgroundColor: topic.color }}
                  className="h-8 w-8 items-center justify-center rounded-full"
                >
                  <Text
                    className="text-white"
                    style={{ fontFamily: 'Fraunces_700Bold', fontSize: 15 }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text variant="bodyMedium">{step.title[lang]}</Text>
                  <Text variant="caption" className="mt-1 leading-5">
                    {step.body[lang]}
                  </Text>
                </View>
              </View>
            </View>
          </FadeInView>
        ))}
      </View>
    </Screen>
  );
}
