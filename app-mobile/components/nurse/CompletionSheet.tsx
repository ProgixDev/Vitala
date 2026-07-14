import { Modal, View, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button } from '@/components/ui';
import { shadow, useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

interface CompletionSheetProps {
  visible: boolean;
  notes: string;
  onChangeNotes: (v: string) => void;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Bottom sheet to close out a visit — an optional care note, then confirm. */
export function CompletionSheet({
  visible,
  notes,
  onChangeNotes,
  submitting,
  onCancel,
  onConfirm,
}: CompletionSheetProps) {
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
            <Text variant="heading">{t('nurse.visit.completeTitle')}</Text>
            <Text variant="subtitle">{t('nurse.visit.completeSubtitle')}</Text>
            <TextInput
              multiline
              value={notes}
              onChangeText={onChangeNotes}
              placeholder={t('nurse.visit.notesPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              textAlignVertical="top"
              className="min-h-[110px] rounded-2xl bg-surface-alt p-4 font-sans text-[15px] text-foreground"
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
                label={t('nurse.visit.completeConfirm')}
                icon="checkmark"
                loading={submitting}
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
