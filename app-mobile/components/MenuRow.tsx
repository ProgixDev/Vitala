import { Pressable, View, Switch, useColorScheme } from 'react-native';
import { Text, Icon, type IconName } from '@/components/ui';
import { useThemeColors, palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

interface MenuRowProps {
  icon: IconName;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: 'chevron' | 'none';
  className?: string;
}

export function MenuRow({
  icon,
  label,
  sublabel,
  onPress,
  danger = false,
  right = 'chevron',
  className,
}: MenuRowProps) {
  const colors = useThemeColors();
  const tint = danger ? colors.emergency : colors.foreground;
  return (
    <Pressable
      onPress={onPress}
      className={cn('flex-row items-center gap-3.5 px-1 py-3.5 active:opacity-70', className)}
    >
      <Icon name={icon} size={23} color={tint} />
      <View className="flex-1">
        <Text variant="bodyMedium" className={danger ? 'text-emergency' : undefined}>
          {label}
        </Text>
        {sublabel ? <Text variant="caption">{sublabel}</Text> : null}
      </View>
      {right === 'chevron' ? (
        <Icon name="chevron-forward" size={18} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

interface SettingToggleProps {
  icon: IconName;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export function SettingToggle({ icon, label, value, onValueChange }: SettingToggleProps) {
  const colors = useThemeColors();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <View className="flex-row items-center gap-3.5 px-1 py-3">
      <Icon name={icon} size={23} color={colors.foreground} />
      <Text variant="bodyMedium" className="flex-1">
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette[scheme].surfaceAlt, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
