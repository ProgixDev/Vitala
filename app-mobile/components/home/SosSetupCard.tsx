import { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Text, Icon, FadeInView, type IconName } from '@/components/ui';
import { useSession } from '@/providers/SessionProvider';
import { Endpoints } from '@/lib/endpoints';
import { getSosPrefs, hasTemplate } from '@/lib/sosPrefs';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

interface Step {
  key: string;
  labelKey: string;
  icon: IconName;
  done: boolean;
  optional?: boolean;
  route: string;
}

/**
 * First-run nudge on Home: complete SOS setup so one tap reaches family. Shows
 * only while incomplete (≥1 family contact + a saved message; medical optional),
 * then removes itself. Progress is derived from live data, so it self-heals if a
 * user later deletes their contacts.
 */
export function SosSetupCard() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { me } = useSession();

  const [hasContacts, setHasContacts] = useState<boolean | null>(null);
  const [hasMessage, setHasMessage] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  const load = useCallback(async () => {
    const [contacts, prefs] = await Promise.all([
      Endpoints.contacts().catch(() => []),
      getSosPrefs(),
    ]);
    setHasContacts(contacts.length > 0);
    setHasMessage(hasTemplate(prefs));
    setHasNote(prefs.emergencyNote.trim().length > 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const mp = me?.medicalProfile;
  const hasMedical =
    (mp?.chronic_illnesses?.length ?? 0) > 0 || (mp?.allergies?.length ?? 0) > 0 || hasNote;

  // Wait for the first read before deciding to render (avoids a flash).
  if (hasContacts === null) return null;

  const steps: Step[] = [
    { key: 'family', labelKey: 'sosSetup.stepFamily', icon: 'people', done: hasContacts, route: '/profile/emergency-contacts' },
    { key: 'message', labelKey: 'sosSetup.stepMessage', icon: 'chatbubble-outline', done: hasMessage, route: '/profile/sos-message' },
    { key: 'medical', labelKey: 'sosSetup.stepMedical', icon: 'pulse', done: hasMedical, optional: true, route: '/profile/emergency-medical' },
  ];

  const complete = hasContacts && hasMessage;
  if (complete) return null;

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <FadeInView className="mt-6 px-5">
      <View style={shadow.e2} className="overflow-hidden rounded-card bg-surface">
        {/* Header band */}
        <View className="flex-row items-center gap-3 bg-emergency/10 px-4 py-3.5">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-emergency">
            <Icon name="alert" size={20} color="#FFFFFF" weight="fill" />
          </View>
          <View className="flex-1">
            <Text variant="bodyMedium" className="text-foreground">
              {t('sosSetup.cardTitle')}
            </Text>
            <Text variant="caption">{t('sosSetup.cardSubtitle')}</Text>
          </View>
          <Text variant="caption" className="font-semibold text-emergency">
            {doneCount}/{steps.length}
          </Text>
        </View>

        {/* Steps */}
        <View className="px-2 py-1">
          {steps.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => router.push(s.route)}
              className="flex-row items-center gap-3 px-2 py-3 active:opacity-70"
            >
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: s.done ? colors.success : `${colors.emergency}14` }}
              >
                <Icon
                  name={s.done ? 'checkmark' : s.icon}
                  size={s.done ? 18 : 17}
                  color={s.done ? '#FFFFFF' : colors.emergency}
                  weight={s.done ? 'bold' : 'regular'}
                />
              </View>
              <View className="flex-1">
                <Text
                  variant="bodyMedium"
                  className={s.done ? 'text-muted-foreground line-through' : 'text-foreground'}
                >
                  {t(s.labelKey)}
                </Text>
                {s.optional && !s.done ? (
                  <Text variant="caption">{t('common.optional')}</Text>
                ) : null}
              </View>
              {!s.done ? (
                <Icon name="chevron-forward" size={16} color={colors.mutedForeground} weight="bold" />
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>
    </FadeInView>
  );
}
