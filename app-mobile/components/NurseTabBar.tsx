import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import type { TabBarProps } from '@/components/TabBar';

const icons: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap; labelKey: string }> = {
  index: { on: 'today', off: 'today-outline', labelKey: 'nurseTab.today' },
  schedule: { on: 'calendar', off: 'calendar-outline', labelKey: 'nurseTab.schedule' },
  earnings: { on: 'wallet', off: 'wallet-outline', labelKey: 'nurseTab.earnings' },
  profile: { on: 'person', off: 'person-outline', labelKey: 'nurseTab.profile' },
};

/** Raised teal center action — the nurse's primary daily move: work waiting. */
function JobsTabButton({ onPress }: { focused: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <View className="w-20 items-center" pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('nurseTab.jobs')}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        className="items-center"
        style={{ marginTop: -26 }}
      >
        <View
          style={shadow.e2}
          className="h-16 w-16 items-center justify-center rounded-full bg-primary"
        >
          <Ionicons name="briefcase" size={27} color="#FFFFFF" />
        </View>
        <Text variant="caption" className="mt-1 font-semibold text-primary">
          {t('nurseTab.jobs')}
        </Text>
      </Pressable>
    </View>
  );
}

/** Nurse tab bar — Today · Schedule · [Jobs] · Earnings · Profile. */
export function NurseTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { t } = useTranslation();

  return (
    <View
      style={[shadow.e2, { paddingBottom: insets.bottom || 12 }]}
      className="flex-row items-center justify-around rounded-t-[28px] bg-surface px-2 pt-3"
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const isJobs = route.name === 'jobs';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            void Haptics.selectionAsync();
            navigation.navigate(route.name);
          }
        };

        if (isJobs) {
          return <JobsTabButton key={route.key} focused={focused} onPress={onPress} />;
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
