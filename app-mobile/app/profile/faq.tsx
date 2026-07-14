import { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Screen, Header, Text, Card, Icon } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

const FAQ: { q: Record<string, string>; a: Record<string, string> }[] = [
  {
    q: { en: 'How do I book a nurse?', fr: 'Comment réserver un infirmier ?' },
    a: {
      en: 'Open the Home tab, pick a care service, choose a date, time and address, then confirm your booking.',
      fr: "Ouvrez l'onglet Accueil, choisissez un service, une date, une heure et une adresse, puis confirmez.",
    },
  },
  {
    q: { en: 'What happens in an emergency?', fr: "Que se passe-t-il en cas d'urgence ?" },
    a: {
      en: 'Tap the red SOS button to alert a nearby nurse, request an ambulance, or notify your emergency contacts instantly with your location.',
      fr: "Touchez le bouton SOS rouge pour alerter un infirmier, demander une ambulance ou prévenir vos contacts avec votre position.",
    },
  },
  {
    q: { en: 'How are nurses verified?', fr: 'Comment les infirmiers sont-ils vérifiés ?' },
    a: {
      en: 'Every nurse submits their professional license and a verification selfie, reviewed by our team before they can accept visits.',
      fr: "Chaque infirmier soumet sa licence et un selfie de vérification, examinés par notre équipe avant d'accepter des visites.",
    },
  },
  {
    q: { en: 'Is my payment secure?', fr: 'Mon paiement est-il sécurisé ?' },
    a: {
      en: 'Yes. Payments are processed by Stripe. Vitala never stores your full card number.',
      fr: 'Oui. Les paiements sont traités par Stripe. Vitala ne stocke jamais votre numéro de carte complet.',
    },
  },
];

export default function Faq() {
  const { t, language } = useTranslation();
  const colors = useThemeColors();
  const [open, setOpen] = useState<number | null>(0);
  const lang = language === 'fr' ? 'fr' : 'en';

  return (
    <Screen edges={['top']}>
      <Header title={t('faq.title')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-3 px-1 pb-8 pt-2">
        {FAQ.map((item, i) => {
          const expanded = open === i;
          return (
            <Pressable key={i} onPress={() => setOpen(expanded ? null : i)}>
              <Card elevation="e1" className="gap-2">
                <View className="flex-row items-center gap-3">
                  <Text variant="bodyMedium" className="flex-1">
                    {item.q[lang]}
                  </Text>
                  <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </View>
                {expanded ? <Text variant="caption">{item.a[lang]}</Text> : null}
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
