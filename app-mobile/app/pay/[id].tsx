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
        // Must match the charge currency (CAD) or Apple/Google Pay refuse.
        applePay: { merchantCountryCode: 'CA' },
        googlePay: { merchantCountryCode: 'CA', testEnv: true },
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
      // The card is only authorised here — the money is captured when the visit
      // is completed, and released untouched if the request is cancelled.
      Toast.show({ type: 'success', text1: t('pay.authorised'), text2: t('pay.authorisedHint') });
      router.replace(`/appointment/${id}`);
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
                  {formatPrice(appt.price, appt.payment?.currency)}
                </Text>
              </View>
            </Card>

            {/* Says plainly that this is a hold, not a charge — the single most
                important thing to be honest about at this step. */}
            <Card elevation="flat" className="flex-row items-start gap-3 bg-primary-soft">
              <Icon name="lock-closed" size={18} color={colors.primary} />
              <View className="flex-1 gap-1">
                <Text variant="bodyMedium" className="text-primary">
                  {t('pay.holdTitle')}
                </Text>
                <Text variant="caption">{t('pay.holdBody')}</Text>
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
            label={t('pay.authoriseAmount', {
              amount: formatPrice(appt.price, appt.payment?.currency),
            })}
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
