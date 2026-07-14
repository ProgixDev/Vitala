import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Header, Text, Card, Icon, EmptyState, FadeInView } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';
import { shadow } from '@/constants/theme';
import { getTopic } from '@/lib/firstAid';
import { brand } from '@/constants/brand';

export default function TopicDetail() {
  const { topic: id } = useLocalSearchParams<{ topic: string }>();
  const { t, language } = useTranslation();
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
    <Screen scroll edges={['top']} contentClassName="px-0 pb-10">
      <Header title={topic.title[lang]} subtitle={t('learn.minRead', { min: topic.minRead })} />

      {/* Hero icon */}
      <FadeInView index={0} className="items-center px-5 pb-2 pt-2">
        <View
          style={[shadow.e2, { backgroundColor: topic.color }]}
          className="h-20 w-20 items-center justify-center rounded-[26px]"
        >
          <Icon name={topic.icon} size={40} color="#FFFFFF" weight="bold" />
        </View>
        <Text variant="subtitle" className="mt-3 text-center">
          {topic.summary[lang]}
        </Text>
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

      {/* Steps */}
      <View className="mt-6 gap-3 px-5">
        {topic.steps.map((step, i) => (
          <FadeInView key={i} index={i + 2}>
            <Card className="flex-row gap-4">
              <View
                style={{ backgroundColor: topic.color }}
                className="h-8 w-8 items-center justify-center rounded-full"
              >
                <Text className="text-white" style={{ fontFamily: 'Fraunces_700Bold', fontSize: 15 }}>
                  {i + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="bodyMedium">{step.title[lang]}</Text>
                <Text variant="caption" className="mt-1 leading-5">
                  {step.body[lang]}
                </Text>
              </View>
            </Card>
          </FadeInView>
        ))}
      </View>
    </Screen>
  );
}
