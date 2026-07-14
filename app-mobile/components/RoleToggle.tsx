import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text, Icon, type IconName } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { cn } from '@/utils/cn';

export type AuthRole = 'patient' | 'nurse';

interface RoleToggleProps {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}

const OPTIONS: { key: AuthRole; icon: IconName; labelKey: string }[] = [
  { key: 'patient', icon: 'person-outline', labelKey: 'auth.patient' },
  { key: 'nurse', icon: 'medkit-outline', labelKey: 'auth.nurse' },
];

/** Segmented Patient / Nurse selector for the sign-up flow. */
export function RoleToggle({ value, onChange }: RoleToggleProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="flex-row rounded-2xl bg-surface-alt p-1">
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              void Haptics.selectionAsync();
              onChange(o.key);
            }}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3',
              active && 'bg-primary',
            )}
          >
            <Icon
              name={o.icon}
              size={18}
              color={active ? colors.onPrimary : colors.mutedForeground}
              weight={active ? 'fill' : 'regular'}
            />
            <Text
              variant="button"
              className={active ? 'text-on-primary' : 'text-muted-foreground'}
            >
              {t(o.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
