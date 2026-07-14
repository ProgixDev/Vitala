import { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Card, Button, Icon } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { config, isPlaceholder } from '@/lib/config';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import type { Appointment } from '@/types';

export default function PayAppointment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paying, setPaying] = useState(false);

  const { data: appt, loading } = useAsync<Appointment>(() => Endpoints.appointment(id), [id]);
  const stripeReady = !isPlaceholder(config.stripePublishableKey);

  const pay = async () => {
    setPaying(true);
    try {
      const intent = await Endpoints.createIntent(id);
      const init = await initPaymentSheet({
        merchantDisplayName: 'Vitala',
        paymentIntentClientSecret: intent.clientSecret,
        applePay: { merchantCountryCode: 'US' },
        googlePay: { merchantCountryCode: 'US', testEnv: true },
        defaultBillingDetails: { name: appt?.patient?.full_name ?? undefined },
      });
      if (init.error) throw new Error(init.error.message);

      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== 'Canceled') {
          Toast.show({ type: 'error', text1: t('pay.failed'), text2: result.error.message });
        }
        return;
      }
      Toast.show({ type: 'success', text1: t('pay.success') });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('pay.failed'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title={t('pay.payFor')} />
      {loading || !appt ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View className="flex-1 justify-between px-1 pb-4 pt-2">
          <View className="gap-4">
            <Card elevation="e2" className="gap-3">
              <Text variant="heading">{appt.service?.name ?? 'Home visit'}</Text>
              <View className="flex-row items-center justify-between">
                <Text variant="subtitle">{t('booking.estimate')}</Text>
                <Text variant="title" className="text-primary">
                  {formatPrice(appt.price)}
                </Text>
              </View>
            </Card>

            {!stripeReady ? (
              <Card elevation="flat" className="flex-row items-center gap-3 bg-warning/10">
                <Icon name="warning-outline" size={20} color={colors.warning} />
                <Text variant="caption" className="flex-1">
                  {t('pay.notConfigured')}
                </Text>
              </Card>
            ) : (
              <View className="flex-row items-center gap-2">
                <Icon name="shield-checkmark" size={16} color={colors.success} />
                <Text variant="caption">Secured by Stripe · Apple Pay & Google Pay supported</Text>
              </View>
            )}
          </View>

          <Button
            label={t('pay.payAmount', { amount: formatPrice(appt.price) })}
            icon="lock-closed"
            loading={paying}
            disabled={!stripeReady}
            onPress={pay}
          />
        </View>
      )}
    </Screen>
  );
}
