import { Modal, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Icon } from '@/components/ui';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

interface ReviewSheetProps {
  visible: boolean;
  rating: number;
  comment: string;
  onChangeRating: (v: number) => void;
  onChangeComment: (v: string) => void;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Bottom sheet for a patient to rate a completed visit — stars + optional comment. */
export function ReviewSheet({
  visible,
  rating,
  comment,
  onChangeRating,
  onChangeComment,
  submitting,
  onCancel,
  onConfirm,
}: ReviewSheetProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onCancel} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={shadow.e3} className="gap-4 rounded-t-[28px] bg-surface p-6 pb-10">
            <View className="items-center">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>
            <Text variant="heading">{t('review.title')}</Text>
            <Text variant="subtitle">{t('review.subtitle')}</Text>

            {/* Interactive stars */}
            <View className="flex-row items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => onChangeRating(n)}
                  hitSlop={6}
                  className="active:opacity-70"
                >
                  <Icon
                    name="star"
                    size={38}
                    color={n <= rating ? colors.warning : colors.border}
                    weight="fill"
                  />
                </Pressable>
              ))}
            </View>

            <TextInput
              multiline
              value={comment}
              onChangeText={onChangeComment}
              placeholder={t('review.commentPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              textAlignVertical="top"
              maxLength={500}
              className="min-h-[100px] rounded-2xl bg-surface-alt p-4 font-sans text-[15px] text-foreground"
            />

            <View className="flex-row gap-3">
              <Button
                label={t('common.cancel')}
                variant="secondary"
                fullWidth={false}
                className="flex-1"
                onPress={onCancel}
              />
              <Button
                label={t('review.submit')}
                icon="checkmark"
                loading={submitting}
                disabled={rating < 1}
                fullWidth={false}
                className="flex-1"
                onPress={onConfirm}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
