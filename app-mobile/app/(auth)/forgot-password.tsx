import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Input, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/utils/i18n';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      Toast.show({ type: 'success', text1: t('auth.codeSent') });
      router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
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
        <Text variant="title">{t('auth.forgot.title')}</Text>
        <Text variant="subtitle" className="mt-2">
          {t('auth.forgot.subtitle')}
        </Text>
      </View>
      <View className="mt-8">
        <Input
          label={t('auth.email')}
          icon="mail-outline"
          placeholder={t('auth.emailPlaceholder')}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <Button label={t('auth.forgot.send')} className="mt-6" loading={loading} onPress={send} />
    </Screen>
  );
}
