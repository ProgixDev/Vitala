import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Card, Chip, Divider } from '@/components/ui';
import { SettingToggle } from '@/components/MenuRow';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { setLanguage, useTranslation } from '@/utils/i18n';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export default function Settings() {
  const { t, language } = useTranslation();
  const { me, refreshMe } = useSession();
  const s = me?.settings;

  const [push, setPush] = useState(s?.notify_push ?? true);
  const [emailN, setEmailN] = useState(s?.notify_email ?? true);
  const [sms, setSms] = useState(s?.notify_sms ?? false);
  const [share, setShare] = useState(s?.share_location ?? true);
  const [biometric, setBiometric] = useState(s?.biometric_auth ?? false);

  const persist = async (patch: Record<string, unknown>) => {
    try {
      await Endpoints.updateSettings(patch);
    } catch {
      Toast.show({ type: 'error', text1: t('common.somethingWrong') });
    }
  };

  const changeLanguage = async (code: string) => {
    setLanguage(code);
    await persist({ language: code });
    await refreshMe();
  };

  return (
    <Screen edges={['top']}>
      <Header title={t('settings.title')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-1 pb-8 gap-4">
        <Card elevation="e1" className="py-1">
          <SettingToggle
            icon="notifications-outline"
            label={t('settings.push')}
            value={push}
            onValueChange={(v) => {
              setPush(v);
              void persist({ notify_push: v });
            }}
          />
          <Divider />
          <SettingToggle
            icon="mail-outline"
            label={t('settings.emailNotif')}
            value={emailN}
            onValueChange={(v) => {
              setEmailN(v);
              void persist({ notify_email: v });
            }}
          />
          <Divider />
          <SettingToggle
            icon="chatbox-outline"
            label={t('settings.smsNotif')}
            value={sms}
            onValueChange={(v) => {
              setSms(v);
              void persist({ notify_sms: v });
            }}
          />
        </Card>

        <Card elevation="e1" className="py-1">
          <SettingToggle
            icon="location-outline"
            label={t('settings.shareLocation')}
            value={share}
            onValueChange={(v) => {
              setShare(v);
              void persist({ share_location: v });
            }}
          />
          <Divider />
          <SettingToggle
            icon="finger-print-outline"
            label={t('settings.biometric')}
            value={biometric}
            onValueChange={(v) => {
              setBiometric(v);
              void persist({ biometric_auth: v });
            }}
          />
        </Card>

        <View className="gap-2 px-1">
          <Text variant="label">{t('settings.language')}</Text>
          <View className="flex-row gap-2">
            {LANGS.map((l) => (
              <Chip
                key={l.code}
                label={l.label}
                selected={language === l.code}
                onPress={() => changeLanguage(l.code)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
