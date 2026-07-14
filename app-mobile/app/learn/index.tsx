import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, FadeInView } from '@/components/ui';
import { AskCard } from '@/components/AskCard';
import { AcademyHero } from '@/components/learn/AcademyHero';
import { ProtocolCard } from '@/components/learn/ProtocolCard';
import { SectionLabel } from '@/components/learn/SectionLabel';
import { useTranslation } from '@/utils/i18n';
import { FIRST_AID_TOPICS } from '@/lib/firstAid';

export default function LearnHub() {
  const { t, language } = useTranslation();
  const lang = language === 'fr' ? 'fr' : 'en';

  const soon = () => Toast.show({ type: 'info', text1: t('learn.comingSoon') });

  const totalMin = FIRST_AID_TOPICS.reduce((sum, tp) => sum + tp.minRead, 0);
  const stats = [
    { value: String(FIRST_AID_TOPICS.length), label: t('learn.statProtocols') },
    { value: `~${totalMin}`, label: t('learn.statLearn') },
    { value: 'Free', label: t('learn.statFree') },
  ];

  return (
    <Screen scroll edges={['top']} contentClassName="px-0 pb-12">
      <Header showBack />

      {/* Hero — the golden minutes */}
      <FadeInView index={0} className="px-5 pt-1">
        <AcademyHero
          eyebrow={t('learn.hubTitle')}
          headline={t('learn.hubSubtitle')}
          lede={t('learn.heroLede')}
          stats={stats}
        />
      </FadeInView>

      {/* Assistant — the one saturated block */}
      <FadeInView index={1} className="mt-6 px-5">
        <AskCard
          title={t('learn.askTitle')}
          subtitle={t('learn.assistantCta')}
          onPress={soon}
        />
        <Text variant="caption" className="mt-2 px-1">
          {t('learn.assistantDesc')}
        </Text>
      </FadeInView>

      {/* Protocols — the field manual */}
      <FadeInView index={2} className="mb-3 mt-9 px-5">
        <SectionLabel>{t('learn.topicsTitle')}</SectionLabel>
        <Text variant="heading" className="mt-2">
          {t('learn.protocolsTitle')}
        </Text>
        <Text variant="caption" className="mt-0.5">
          {t('learn.protocolsDesc')}
        </Text>
      </FadeInView>
      <View className="gap-3 px-5">
        {FIRST_AID_TOPICS.map((topic, i) => (
          <FadeInView key={topic.id} index={i + 3}>
            <ProtocolCard
              artKind={topic.id}
              color={topic.color}
              title={topic.title[lang]}
              summary={topic.summary[lang]}
              readLabel={t('learn.minRead', { min: topic.minRead })}
              onPress={() => router.push(`/learn/${topic.id}`)}
            />
          </FadeInView>
        ))}
      </View>
    </Screen>
  );
}
