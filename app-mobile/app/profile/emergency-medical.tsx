import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Input, Button } from '@/components/ui';
import { TagInput } from '@/components/TagInput';
import { useSession } from '@/providers/SessionProvider';
import { Endpoints } from '@/lib/endpoints';
import { getSosPrefs, saveSosPrefs } from '@/lib/sosPrefs';
import { useTranslation } from '@/utils/i18n';

export default function EmergencyMedical() {
  const { t } = useTranslation();
  const { me, refreshMe } = useSession();
  const [chronic, setChronic] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const mp = me?.medicalProfile;
    setChronic(mp?.chronic_illnesses ?? []);
    setAllergies(mp?.allergies ?? []);
    void getSosPrefs().then((p) => setNote(p.emergencyNote));
  }, [me?.medicalProfile]);

  const save = async () => {
    setSaving(true);
    try {
      await Endpoints.updateMedical({ chronic_illnesses: chronic, allergies });
      const prefs = await getSosPrefs();
      await saveSosPrefs({ ...prefs, emergencyNote: note.trim() });
      await refreshMe();
      Toast.show({ type: 'success', text1: t('emed.saved') });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top']}>
      <Header title={t('emed.title')} subtitle={t('emed.subtitle')} />

      <View className="mt-2 gap-5">
        <TagInput label={t('auth.chronic')} value={chronic} onChange={setChronic} placeholder={t('emed.chronicPlaceholder')} />
        <TagInput label={t('auth.allergies')} value={allergies} onChange={setAllergies} placeholder={t('emed.allergiesPlaceholder')} />

        <View>
          <Input
            label={t('emed.note')}
            value={note}
            onChangeText={setNote}
            placeholder={t('emed.notePlaceholder')}
            multiline
            numberOfLines={3}
            maxLength={140}
            style={{ minHeight: 76, textAlignVertical: 'top' }}
          />
          <Text variant="caption" className="mt-1.5">
            {t('emed.noteHint')}
          </Text>
        </View>
      </View>

      <Button label={t('common.save')} loading={saving} onPress={save} className="mt-7" />
    </Screen>
  );
}
