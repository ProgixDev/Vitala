import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { Screen, Header, Input, Button, Avatar, Icon } from '@/components/ui';
import { Endpoints } from '@/lib/endpoints';
import { uploadImage } from '@/lib/upload';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';

export default function EditProfile() {
  const { t } = useTranslation();
  const { me, refreshMe } = useSession();
  const colors = useThemeColors();
  const [fullName, setFullName] = useState(me?.full_name ?? '');
  const [phone, setPhone] = useState(me?.phone ?? '');
  const [avatar, setAvatar] = useState<string | null>(me?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    try {
      const path = await uploadImage('avatars', result.assets[0].uri);
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatar(data.publicUrl);
    } catch {
      setAvatar(result.assets[0].uri);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await Endpoints.updateMe({
        full_name: fullName.trim(),
        phone: phone.trim(),
        avatar_url: avatar ?? undefined,
      });
      await refreshMe();
      Toast.show({ type: 'success', text1: t('profile.saved') });
      router.back();
    } catch (e) {
      Toast.show({ type: 'error', text1: t('common.somethingWrong'), text2: e instanceof Error ? e.message : '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll keyboardAvoiding edges={['top']}>
      <Header title={t('profile.edit')} />
      <View className="items-center py-4">
        <Pressable onPress={pickAvatar} className="active:opacity-80">
          <Avatar name={fullName} uri={avatar} size={96} />
          <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="camera" size={16} color={colors.onPrimary} />
          </View>
        </Pressable>
      </View>
      <View className="gap-4 px-1">
        <Input label={t('auth.fullName')} icon="person-outline" value={fullName} onChangeText={setFullName} />
        <Input label={t('auth.phone')} icon="call-outline" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <Button label={t('common.save')} loading={saving} onPress={save} className="mt-2" />
      </View>
    </Screen>
  );
}
