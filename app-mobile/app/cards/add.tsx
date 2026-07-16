import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import { Screen, Header, Button, Card, Text, Icon } from '@/components/ui';
import { Endpoints } from '@/lib/endpoints';
import { config, isPlaceholder } from '@/lib/config';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';

/**
 * Add a card, through Stripe's own sheet.
 *
 * This screen used to be four TextInputs collecting a real card number and CVV,
 * which it then threw away — keeping only a hand-typed brand and last4 in local
 * SecureStore. Nothing ever reached Stripe, nothing could be charged, and it
 * disappeared on reinstall. It also dragged the app into PCI scope, because
 * touching a raw PAN is what does that, whether or not you keep it.
 *
 * Now the card goes from Stripe's sheet to Stripe. We hold an id, nothing else.
 */
export default function AddCard() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [saving, setSaving] = useState(false);
  const stripeReady = !isPlaceholder(config.stripePublishableKey);

  const addCard = async () => {
    setSaving(true);
    try {
      const { clientSecret, setupIntentId } = await Endpoints.setupIntent();
      const init = await initPaymentSheet({
        merchantDisplayName: 'Vitala',
        // Setup mode: validate and store the card, charge nothing now.
        setupIntentClientSecret: clientSecret,
        applePay: { merchantCountryCode: 'CA' },
        googlePay: { merchantCountryCode: 'CA', testEnv: true },
      });
      if (init.error) throw new Error(init.error.message);

      const result = await presentPaymentSheet();
      if (result.error) {
        // Backing out isn't a failure — say nothing.
        if (result.error.code !== 'Canceled') {
          Toast.show({ type: 'error', text1: t('pay.cardFailed'), text2: result.error.message });
        }
        return;
      }

      // The sheet closing is our account of events; the server checks it against
      // Stripe before believing us.
      await Endpoints.saveCard(setupIntentId);
      Toast.show({ type: 'success', text1: t('pay.cardSaved'), text2: t('pay.cardSavedHint') });
      router.back();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('pay.cardFailed'),
        text2: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header title={t('pay.addCard')} />
      <View className="flex-1 justify-between px-1 pb-4 pt-2">
        <View className="gap-4">
          {/* Saving a card costs nothing today — say so. The payoff is speed at
              booking, and that has to be worth the trust being asked for now. */}
          <Card elevation="flat" className="flex-row items-start gap-3 bg-primary-soft">
            <Icon name="lock-closed" size={18} color={colors.primary} />
            <View className="flex-1 gap-1">
              <Text variant="bodyMedium" className="text-primary">
                {t('pay.addCardTitle')}
              </Text>
              <Text variant="caption">{t('pay.addCardBody')}</Text>
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
          label={t('pay.addCard')}
          icon="card-outline"
          loading={saving}
          disabled={!stripeReady}
          onPress={addCard}
        />
      </View>
    </Screen>
  );
}
