import { View, useColorScheme } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';
import { Text, Icon, type IconName } from '@/components/ui';
import { shadow, palette } from '@/constants/theme';

function ToastCard({
  icon,
  color,
  title,
  message,
}: {
  icon: IconName;
  color: string;
  title?: string;
  message?: string;
}) {
  return (
    <View
      style={shadow.e2}
      className="mx-4 w-[92%] flex-row items-center gap-3 rounded-2xl bg-surface p-4"
    >
      <View
        style={{ backgroundColor: `${color}22` }}
        className="h-10 w-10 items-center justify-center rounded-full"
      >
        <Icon name={icon} size={20} color={color} />
      </View>
      <View className="flex-1">
        {title ? <Text variant="bodyMedium">{title}</Text> : null}
        {message ? (
          <Text variant="caption" numberOfLines={2}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Themed toast presets used app-wide via Toast.show({ type }). */
export function useToastConfig(): ToastConfig {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = palette[scheme];
  return {
    success: ({ text1, text2 }) => (
      <ToastCard icon="checkmark-circle" color={c.success} title={text1} message={text2} />
    ),
    error: ({ text1, text2 }) => (
      <ToastCard icon="alert-circle" color={c.emergency} title={text1} message={text2} />
    ),
    info: ({ text1, text2 }) => (
      <ToastCard icon="information-circle" color={c.primary} title={text1} message={text2} />
    ),
  };
}
