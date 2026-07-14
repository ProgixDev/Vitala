import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text, Icon } from '@/components/ui';
import { useTranslation } from '@/utils/i18n';

interface SocialAuthRowProps {
  /** Copy for the divider, e.g. "Or sign up with". */
  label?: string;
  onGoogle?: () => void;
  onApple?: () => void;
}

/** "Or continue with" divider + circular Google / Apple buttons. */
export function SocialAuthRow({ label, onGoogle, onApple }: SocialAuthRowProps) {
  const { t } = useTranslation();

  const press = (fn?: () => void) => () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn?.();
  };

  return (
    <View className="items-center">
      <View className="w-full flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text variant="caption" className="text-muted-foreground">
          {label ?? t('auth.orContinueWith')}
        </Text>
        <View className="h-px flex-1 bg-border" />
      </View>

      <View className="mt-4 flex-row gap-4">
        <SocialButton icon="logo-google" label="Google" onPress={press(onGoogle)} />
        <SocialButton icon="logo-apple" label="Apple" onPress={press(onApple)} />
      </View>
    </View>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
}: {
  icon: 'logo-google' | 'logo-apple';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-14 w-14 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
    >
      <Icon name={icon} size={26} weight="fill" />
    </Pressable>
  );
}
