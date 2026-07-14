import { useEffect, useState } from 'react';
import { View, Switch, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Screen, Header, Text, Input, Button, Chip } from '@/components/ui';
import { Endpoints } from '@/lib/endpoints';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors, palette } from '@/constants/theme';
import type { ContactRelationship, EmergencyContact } from '@/types';

const RELATIONSHIPS: ContactRelationship[] = [
  'spouse',
  'parent',
  'child',
  'sibling',
  'friend',
  'guardian',
  'other',
];

export default function ContactForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const editing = !!id;

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<ContactRelationship>('parent');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [primary, setPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Endpoints.contacts()
      .then((list) => {
        const c = list.find((x) => x.id === id);
        if (c) {
          setName(c.name);
          setRelationship(c.relationship);
          setPhone(c.phone);
          setEmail(c.email ?? '');
          setPrimary(c.is_primary);
        }
      })
      .catch(() => undefined);
  }, [id]);

  const valid = name.trim().length > 1 && phone.trim().length >= 6;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    const payload: Partial<EmergencyContact> = {
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      email: email.trim() || undefined,
      is_primary: primary,
    };
    try {
      if (editing && id) await Endpoints.updateContact(id, payload);
      else await Endpoints.addContact(payload);
      Toast.show({ type: 'success', text1: t('contacts.saved') });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top']}>
      <Header title={editing ? t('contacts.edit') : t('contacts.add')} />
      <View className="gap-4 px-1 pt-2">
        <Input label={t('contacts.name')} icon="person-outline" value={name} onChangeText={setName} />

        <View className="gap-2">
          <Text variant="label">{t('contacts.relationship')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {RELATIONSHIPS.map((r) => (
              <Chip
                key={r}
                label={r.charAt(0).toUpperCase() + r.slice(1)}
                selected={relationship === r}
                onPress={() => setRelationship(r)}
              />
            ))}
          </View>
        </View>

        <Input label={t('contacts.phone')} icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <Input
          label={t('contacts.emailField')}
          icon="mail-outline"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View className="flex-row items-center justify-between px-1 py-2">
          <Text variant="bodyMedium">{t('contacts.primary')}</Text>
          <Switch
            value={primary}
            onValueChange={setPrimary}
            trackColor={{ false: palette[scheme].surfaceAlt, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Button label={t('common.save')} loading={saving} disabled={!valid} onPress={save} className="mt-2" />
      </View>
    </Screen>
  );
}
