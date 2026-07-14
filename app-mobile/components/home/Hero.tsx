import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text, Icon, Avatar } from '@/components/ui';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';

/**
 * Editorial, type-led opener. No gradient card — the warm paper is the canvas.
 * A quiet wordmark + chrome row, then a Fraunces headline whose final phrase
 * turns teal-italic: the one typographic flourish on the page.
 */
export function Hero() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();
  const firstName = me?.full_name?.split(' ')[0] ?? '';

  return (
    <View>
      {/* Top bar */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-baseline">
          <Text
            className="text-foreground"
            style={{ fontFamily: 'Fraunces_700Bold', fontSize: 23, letterSpacing: -0.3 }}
          >
            Vitala
          </Text>
          <View className="mb-1 ml-1 h-1.5 w-1.5 rounded-full bg-primary" />
        </View>

        <View className="flex-row items-center gap-2.5">
          <Pressable
            onPress={() => router.push('/profile/notifications')}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
          >
            <Icon name="notifications-outline" size={19} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={() => router.push('/profile/edit')} className="active:opacity-80">
            <Avatar name={me?.full_name} uri={me?.avatar_url} size={40} />
          </Pressable>
        </View>
      </View>

      {/* Headline */}
      <View className="mt-8">
        <Text
          variant="label"
          className="uppercase text-muted-foreground"
          style={{ letterSpacing: 2 }}
        >
          {t('home.greeting', { name: firstName })}
        </Text>
        <Text
          className="mt-2 text-foreground"
          style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 40, lineHeight: 44, letterSpacing: -1 }}
        >
          {t('home.heroLine1')}
        </Text>
        <Text
          className="text-primary"
          style={{ fontFamily: 'Fraunces_600SemiBold_Italic', fontSize: 40, lineHeight: 44, letterSpacing: -1 }}
        >
          {t('home.heroLine2')}
        </Text>
      </View>
    </View>
  );
}
