import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Input, Button } from '@/components/ui';
import { PasswordRules, evaluatePassword } from '@/components/PasswordRules';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/utils/i18n';

export default function ChangePassword() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const checks = evaluatePassword(password, confirm);

  const save = async () => {
    if (!checks.allValid) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Toast.show({ type: 'success', text1: t('changePw.updated') });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top']}>
      <Header title={t('changePw.title')} />
      <View className="gap-4 px-1 pt-2">
        <Input label={t('changePw.current')} icon="lock-closed-outline" secure value={current} onChangeText={setCurrent} />
        <Input label={t('changePw.new')} icon="lock-closed-outline" secure value={password} onChangeText={setPassword} />
        <Input label={t('changePw.confirm')} icon="lock-closed-outline" secure value={confirm} onChangeText={setConfirm} />
        <PasswordRules checks={checks} />
        <Button label={t('common.save')} loading={saving} disabled={!checks.allValid} onPress={save} className="mt-2" />
      </View>
    </Screen>
  );
}
