import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Input, Button } from '@/components/ui';
import { TagInput } from '@/components/TagInput';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';

export default function NurseCredentials() {
  const { t } = useTranslation();
  const { me, refreshMe } = useSession();
  const np = me?.nurseProfile;

  const [license, setLicense] = useState(np?.license_number ?? '');
  const [specializations, setSpecializations] = useState<string[]>(np?.specializations ?? []);
  const [experience, setExperience] = useState(
    np?.experience_years != null ? String(np.experience_years) : '',
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const years = experience.trim() ? Number(experience.trim()) : undefined;
      await Endpoints.updateNurse({
        license_number: license.trim() || undefined,
        specializations,
        experience_years: Number.isFinite(years) ? years : undefined,
      });
      await refreshMe();
      Toast.show({ type: 'success', text1: t('nurse.credentials.saved') });
      router.back();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll edges={['top']} contentClassName="pb-10">
      <Header title={t('nurse.credentials.title')} />
      <View className="gap-5 px-1 pt-1">
        <Text variant="subtitle">{t('nurse.credentials.subtitle')}</Text>

        <Input
          label={t('nurse.license')}
          icon="shield-checkmark-outline"
          value={license}
          onChangeText={setLicense}
          placeholder={t('nurse.credentials.licensePlaceholder')}
          autoCapitalize="characters"
        />

        <Input
          label={t('nurse.experience')}
          icon="ribbon-outline"
          value={experience}
          onChangeText={(v) => setExperience(v.replace(/[^0-9]/g, ''))}
          placeholder="0"
          keyboardType="number-pad"
        />

        <TagInput
          label={t('nurse.specializations')}
          value={specializations}
          onChange={setSpecializations}
          placeholder={t('auth.addTag')}
        />

        <Button label={t('common.save')} icon="checkmark" loading={saving} onPress={save} />
      </View>
    </Screen>
  );
}
