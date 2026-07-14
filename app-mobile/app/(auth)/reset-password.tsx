import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Input, Button, OtpInput } from '@/components/ui';
import { PasswordRules, evaluatePassword } from '@/components/PasswordRules';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/utils/i18n';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [phase, setPhase] = useState<'otp' | 'password'>('otp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const checks = evaluatePassword(password, confirm);

  const verify = async (value: string) => {
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: value,
        type: 'recovery',
      });
      if (error) throw error;
      setPhase('password');
    } catch {
      Toast.show({ type: 'error', text1: t('auth.invalidCode') });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!checks.allValid) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      Toast.show({ type: 'success', text1: t('auth.reset.updated'), text2: t('auth.reset.updatedDesc') });
      router.replace('/(auth)/sign-in');
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: e instanceof Error ? e.message : '',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding>
      <Header title="" />
      <View className="mt-2 px-1">
        <Text variant="title">{t('auth.reset.title')}</Text>
        <Text variant="subtitle" className="mt-2">
          {t('auth.reset.subtitle')}
        </Text>
      </View>

      {phase === 'otp' ? (
        <View className="mt-8 gap-6">
          <OtpInput onChange={setCode} onFilled={verify} />
          <Button
            label={t('auth.verify')}
            loading={loading}
            disabled={code.length < 6}
            onPress={() => verify(code)}
          />
        </View>
      ) : (
        <View className="mt-8 gap-5">
          <Input label={t('auth.password')} icon="lock-closed-outline" secure value={password} onChangeText={setPassword} />
          <Input
            label={t('auth.confirmPassword')}
            icon="lock-closed-outline"
            secure
            value={confirm}
            onChangeText={setConfirm}
          />
          <PasswordRules checks={checks} />
          <Button label={t('common.save')} loading={loading} disabled={!checks.allValid} onPress={save} />
        </View>
      )}
    </Screen>
  );
}
