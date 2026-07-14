import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Text, Icon, type IconName } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

interface PhotoCaptureCardProps {
  label: string;
  uri: string | null;
  onCaptured: (uri: string) => void;
  front?: boolean; // use the front camera (selfie)
  icon?: IconName;
}

export function PhotoCaptureCard({
  label,
  uri,
  onCaptured,
  front = false,
  icon = 'camera-outline',
}: PhotoCaptureCardProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();

  const capture = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      cameraType: front ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onCaptured(result.assets[0].uri);
    }
  };

  return (
    <Pressable onPress={capture}>
      <View className="overflow-hidden rounded-card bg-surface-alt">
        {uri ? (
          <View>
            <Image source={{ uri }} style={{ width: '100%', height: 190 }} contentFit="cover" />
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text variant="bodyMedium">{label}</Text>
              <View className="flex-row items-center gap-1.5">
                <Icon name="refresh" size={16} color={colors.primary} />
                <Text variant="caption" className="font-semibold text-primary">
                  {t('nurse.id.retake')}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="h-[190px] items-center justify-center gap-2">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <Icon name={icon} size={26} color={colors.primary} />
            </View>
            <Text variant="bodyMedium">{label}</Text>
            <Text variant="caption" className="text-primary">
              {t('nurse.id.capture')}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
