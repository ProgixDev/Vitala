import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Input, Button, Text } from '@/components/ui';
import { useCards, detectBrand } from '@/hooks/useCards';
import { useTranslation } from '@/utils/i18n';

function formatNumber(v: string): string {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function AddCard() {
  const { t } = useTranslation();
  const { addCard } = useCards();
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const digits = number.replace(/\s/g, '');
  const valid = digits.length >= 15 && exp.length === 5 && cvv.length >= 3 && name.trim().length > 1;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await addCard({
        brand: detectBrand(number),
        last4: digits.slice(-4),
        exp,
        name: name.trim(),
      });
      Toast.show({ type: 'success', text1: t('pay.saveCard') });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top']}>
      <Header title={t('pay.addCard')} />
      <View className="gap-4 px-1 pt-2">
        <Input
          label={t('pay.cardNumber')}
          icon="card-outline"
          placeholder="4242 4242 4242 4242"
          keyboardType="number-pad"
          value={number}
          onChangeText={(v) => setNumber(formatNumber(v))}
        />
        <View className="flex-row gap-3">
          <Input
            containerClassName="flex-1"
            label={t('pay.expiry')}
            placeholder="MM/YY"
            keyboardType="number-pad"
            value={exp}
            onChangeText={(v) => setExp(formatExpiry(v))}
          />
          <Input
            containerClassName="flex-1"
            label={t('pay.cvv')}
            placeholder="123"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={cvv}
            onChangeText={(v) => setCvv(v.replace(/\D/g, ''))}
          />
        </View>
        <Input
          label={t('pay.cardholder')}
          icon="person-outline"
          placeholder="Jane Doe"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
        <Text variant="caption" className="text-muted-foreground">
          🔒 Only your card brand and last 4 digits are stored on this device.
        </Text>
        <Button label={t('pay.saveCard')} loading={saving} disabled={!valid} onPress={save} className="mt-2" />
      </View>
    </Screen>
  );
}
