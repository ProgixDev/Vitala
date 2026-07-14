import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  Screen,
  Header,
  Text,
  Card,
  Button,
  Avatar,
  Icon,
  EmptyState,
  SkeletonList,
} from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { Endpoints } from '@/lib/endpoints';
import { useSession } from '@/providers/SessionProvider';
import { useTranslation } from '@/utils/i18n';
import { useThemeColors } from '@/constants/theme';
import { formatDate } from '@/utils/format';
import type { Review } from '@/types';

export default function NurseReviews() {
  const { t } = useTranslation();
  const { me } = useSession();
  const colors = useThemeColors();

  const { data, loading, refetch } = useAsync<Review[]>(
    () => (me?.id ? Endpoints.nurseReviews(me.id) : Promise.resolve([])),
    [me?.id],
  );

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const reviews = data ?? [];

  const openReply = (id: string) => {
    setRespondingId(id);
    setDraft('');
  };

  const submit = async (id: string) => {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      await Endpoints.respondReview(id, draft.trim());
      setRespondingId(null);
      setDraft('');
      Toast.show({ type: 'success', text1: t('nurse.reviews.replied') });
      await refetch();
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: t('common.somethingWrong'),
        text2: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll edges={['top']} contentClassName="pb-10">
      <Header title={t('nurse.reviews.title')} />

      <View className="gap-3 px-1 pt-1">
        {loading && !data ? (
          <SkeletonList count={3} />
        ) : reviews.length === 0 ? (
          <EmptyState
            icon="star-outline"
            title={t('nurse.reviews.none')}
            description={t('nurse.reviews.noneDesc')}
          />
        ) : (
          reviews.map((r) => (
            <Card key={r.id} elevation="e1" className="gap-3">
              <View className="flex-row items-center gap-3">
                <Avatar name={r.patient?.full_name} uri={r.patient?.avatar_url} size={40} />
                <View className="flex-1">
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {r.patient?.full_name ?? t('nurse.jobs.patient')}
                  </Text>
                  <Text variant="caption">{formatDate(r.created_at?.slice(0, 10))}</Text>
                </View>
                <Stars rating={r.rating} />
              </View>

              {r.comment ? <Text variant="body">{r.comment}</Text> : null}

              {r.nurse_response ? (
                <View className="gap-1 rounded-2xl bg-surface-alt p-3.5">
                  <Text variant="caption" className="font-semibold text-primary">
                    {t('nurse.reviews.yourReply')}
                  </Text>
                  <Text variant="body">{r.nurse_response}</Text>
                </View>
              ) : respondingId === r.id ? (
                <View className="gap-3">
                  <TextInput
                    multiline
                    autoFocus
                    value={draft}
                    onChangeText={setDraft}
                    placeholder={t('nurse.reviews.replyPlaceholder')}
                    placeholderTextColor={colors.mutedForeground}
                    textAlignVertical="top"
                    className="min-h-[80px] rounded-2xl bg-surface-alt p-3.5 font-sans text-[15px] text-foreground"
                  />
                  <View className="flex-row gap-3">
                    <Button
                      label={t('common.cancel')}
                      variant="secondary"
                      fullWidth={false}
                      className="flex-1"
                      onPress={() => setRespondingId(null)}
                    />
                    <Button
                      label={t('nurse.reviews.send')}
                      icon="arrow-forward"
                      loading={busy}
                      fullWidth={false}
                      className="flex-1"
                      onPress={() => submit(r.id)}
                    />
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => openReply(r.id)}
                  className="flex-row items-center gap-1.5 self-start active:opacity-70"
                >
                  <Icon name="chatbox-outline" size={16} color={colors.primary} />
                  <Text variant="label" className="text-primary">
                    {t('nurse.reviews.respond')}
                  </Text>
                </Pressable>
              )}
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

function Stars({ rating }: { rating: number }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={14}
          color={n <= Math.round(rating) ? colors.warning : colors.border}
          weight="fill"
        />
      ))}
    </View>
  );
}
