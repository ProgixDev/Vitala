import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Input, Chip, Button, Card, Icon } from '@/components/ui';
import { SettingToggle } from '@/components/MenuRow';
import { useSession } from '@/providers/SessionProvider';
import { SOS_TEMPLATES } from '@/constants/sosTemplates';
import { getSosPrefs, saveSosPrefs, DEFAULT_SOS_PREFS, type SosPrefs } from '@/lib/sosPrefs';
import { composeSosMessage } from '@/lib/sosMessage';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

export default function SosMessage() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const [prefs, setPrefs] = useState<SosPrefs>(DEFAULT_SOS_PREFS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getSosPrefs().then(setPrefs);
  }, []);

  const pickPreset = (id: string, bodyKey: string) => {
    setPrefs((p) => ({ ...p, templateId: id, message: t(bodyKey) }));
  };

  const editMessage = (message: string) => {
    setPrefs((p) => ({ ...p, message, templateId: 'custom' }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveSosPrefs(prefs);
      Toast.show({ type: 'success', text1: t('sosMsg.saved') });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const preview = composeSosMessage(prefs, me, t);
  const valid = prefs.message.trim().length > 0;

  return (
    <Screen scroll keyboardAvoiding edges={['top']}>
      <Header title={t('sosMsg.title')} subtitle={t('sosMsg.subtitle')} />

      {/* Presets */}
      <Text variant="label" className="mb-2 mt-2">
        {t('sosMsg.presets')}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {SOS_TEMPLATES.map((tpl) => (
          <Chip
            key={tpl.id}
            label={t(tpl.labelKey)}
            selected={prefs.templateId === tpl.id}
            onPress={() => pickPreset(tpl.id, tpl.bodyKey)}
          />
        ))}
      </View>

      {/* Editable body */}
      <View className="mt-5">
        <Input
          label={t('sosMsg.messageLabel')}
          value={prefs.message}
          onChangeText={editMessage}
          placeholder={t('sosMsg.placeholder')}
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Text variant="caption" className="mt-1.5">
          {t('sosMsg.placeholderHint')}
        </Text>
      </View>

      {/* Toggles */}
      <View className="mt-5 gap-1">
        <SettingToggle
          icon="pulse"
          label={t('sosMsg.includeMedical')}
          value={prefs.includeMedical}
          onValueChange={(v) => setPrefs((p) => ({ ...p, includeMedical: v }))}
        />
        <SettingToggle
          icon="location"
          label={t('sosMsg.shareLocation')}
          value={prefs.shareLocation}
          onValueChange={(v) => setPrefs((p) => ({ ...p, shareLocation: v }))}
        />
      </View>

      {/* Live preview of the actual SMS */}
      <Text variant="label" className="mb-2 mt-6">
        {t('sosMsg.preview')}
      </Text>
      <Card elevation="e1" className="flex-row gap-3">
        <Icon name="chatbubble-outline" size={20} color={colors.emergency} />
        <Text variant="body" className="flex-1">
          {preview}
        </Text>
      </Card>

      <Button
        label={t('common.save')}
        loading={saving}
        disabled={!valid}
        onPress={save}
        className="mt-6"
      />
    </Screen>
  );
}
