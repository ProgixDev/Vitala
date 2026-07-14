import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { SosTabButton } from '@/components/ui/SosTabButton';
import { useSosSheet } from '@/providers/SosSheetProvider';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

const icons: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap; labelKey: string }> = {
  index: { on: 'home', off: 'home-outline', labelKey: 'tab.home' },
  schedule: { on: 'calendar', off: 'calendar-outline', labelKey: 'tab.schedule' },
  payment: { on: 'card', off: 'card-outline', labelKey: 'tab.payment' },
  profile: { on: 'person', off: 'person-outline', labelKey: 'tab.profile' },
};

export interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { open: openSos } = useSosSheet();

  return (
    <View
      style={[shadow.e2, { paddingBottom: insets.bottom || 12 }]}
      className="flex-row items-center justify-around rounded-t-[28px] bg-surface px-2 pt-3"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const isSos = route.name === 'sos';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            void Haptics.selectionAsync();
            navigation.navigate(route.name);
          }
        };

        // SOS is not a destination — it opens the emergency bottom sheet instead
        // of switching tabs, so the current screen stays put behind it.
        if (isSos) {
          return <SosTabButton key={route.key} focused={focused} onPress={openSos} />;
        }

        const meta = icons[route.name];
        if (!meta) return null;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            className="flex-1 items-center gap-1 py-1"
          >
            <Ionicons
              name={focused ? meta.on : meta.off}
              size={23}
              color={focused ? colors.primary : colors.mutedForeground}
            />
            <Text
              variant="caption"
              className={focused ? 'font-semibold text-primary' : 'text-muted-foreground'}
            >
              {t(meta.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
