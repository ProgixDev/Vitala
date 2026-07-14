import { useState } from 'react';
import { View, Pressable, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text, Icon, Button, Well } from '@/components/ui';
import { useQuickActions } from '@/hooks/useQuickActions';
import {
  QUICK_ACTIONS,
  QUICK_ACTION_MAP,
  QUICK_ACTION_SLOTS,
  type QuickAction,
  type QuickActionId,
} from '@/constants/quickActions';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { cn } from '@/utils/cn';

/** 4 pinned, user-customizable home shortcuts. */
export function QuickActions() {
  const { t } = useTranslation();
  const { favorites, save } = useQuickActions();
  const [editing, setEditing] = useState(false);

  const actions = favorites.map((id) => QUICK_ACTION_MAP[id]).filter(Boolean);

  return (
    <View className="px-5">
      <View className="mb-3 flex-row items-center justify-between">
        <Text variant="heading">{t('quick.title')}</Text>
        <Pressable
          hitSlop={8}
          onPress={() => setEditing(true)}
          className="flex-row items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 active:opacity-70"
        >
          <Icon name="create-outline" size={14} weight="bold" />
          <Text variant="caption" className="font-semibold text-primary">
            {t('quick.customize')}
          </Text>
        </Pressable>
      </View>

      <View className="flex-row justify-between">
        {actions.map((a) => (
          <ActionTile
            key={a.id}
            action={a}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate(a.href);
            }}
          />
        ))}
      </View>

      <CustomizeSheet
        visible={editing}
        current={favorites}
        onClose={() => setEditing(false)}
        onSave={(ids) => {
          void save(ids);
          setEditing(false);
        }}
      />
    </View>
  );
}

function ActionTile({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Pressable onPress={onPress} className="w-[23%] items-center active:opacity-75">
      <Well size={66} radius={22} illustration={action.illustration} imageScale={0.66}>
        <Icon name={action.icon} size={26} color={colors.primary} />
      </Well>
      <Text variant="caption" numberOfLines={2} className="mt-2 text-center">
        {t(action.labelKey)}
      </Text>
    </Pressable>
  );
}

function CustomizeSheet({
  visible,
  current,
  onClose,
  onSave,
}: {
  visible: boolean;
  current: QuickActionId[];
  onClose: () => void;
  onSave: (ids: QuickActionId[]) => void;
}) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<QuickActionId[]>(current);

  // Re-seed the draft whenever the sheet is (re)opened.
  const [seenVisible, setSeenVisible] = useState(false);
  if (visible && !seenVisible) {
    setSeenVisible(true);
    setDraft(current);
  }
  if (!visible && seenVisible) setSeenVisible(false);

  const toggle = (id: QuickActionId) => {
    void Haptics.selectionAsync();
    setDraft((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= QUICK_ACTION_SLOTS) return prev; // full — ignore
      return [...prev, id];
    });
  };

  const full = draft.length >= QUICK_ACTION_SLOTS;
  const canSave = draft.length === QUICK_ACTION_SLOTS;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-background px-5 pt-5"
      >
        <View className="mb-1 flex-row items-center justify-between">
          <Text variant="heading">{t('quick.customizeTitle')}</Text>
          <Text variant="label" className={canSave ? 'text-primary' : 'text-muted-foreground'}>
            {draft.length}/{QUICK_ACTION_SLOTS}
          </Text>
        </View>
        <Text variant="subtitle" className="mb-4">
          {t('quick.customizeSubtitle')}
        </Text>

        <ScrollView
          style={{ maxHeight: 380 }}
          showsVerticalScrollIndicator={false}
          className="-mx-1"
        >
          <View className="gap-2 px-1">
            {QUICK_ACTIONS.map((a) => {
              const selected = draft.includes(a.id);
              const disabled = !selected && full;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => toggle(a.id)}
                  disabled={disabled}
                  className={cn(
                    'flex-row items-center gap-3 rounded-2xl border p-3',
                    selected ? 'border-primary bg-primary-soft' : 'border-border bg-surface',
                    disabled && 'opacity-40',
                  )}
                >
                  <Well size={44} radius={14} illustration={a.illustration} imageScale={0.66} elevated={false}>
                    <Icon name={a.icon} size={20} color={colors.primary} />
                  </Well>
                  <Text variant="bodyMedium" className="flex-1">
                    {t(a.labelKey)}
                  </Text>
                  <Icon
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={selected ? colors.primary : colors.border}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="mt-4 flex-row gap-3">
          <Button
            label={t('common.cancel')}
            variant="secondary"
            className="flex-1"
            onPress={onClose}
          />
          <Button
            label={t('common.save')}
            className="flex-1"
            disabled={!canSave}
            onPress={() => onSave(draft)}
          />
        </View>
      </View>
    </Modal>
  );
}
