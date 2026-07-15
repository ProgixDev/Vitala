import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Chip } from '@/components/ui';
import { shadow } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { JOB_CATEGORIES, RADIUS_OPTIONS } from '@/utils/jobFilters';

interface JobFiltersSheetProps {
  visible: boolean;
  radiusKm: number;
  categories: string[];
  saving?: boolean;
  onClose: () => void;
  onSave: (next: { radiusKm: number; categories: string[] }) => void;
}

/**
 * Which jobs the nurse wants to see: how far, and what kind.
 *
 * Edits are local until Save, so backing out with the scrim leaves the saved
 * filters untouched.
 */
export function JobFiltersSheet({
  visible,
  radiusKm,
  categories,
  saving,
  onClose,
  onSave,
}: JobFiltersSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [radius, setRadius] = useState(radiusKm);
  const [picked, setPicked] = useState<string[]>(categories);

  // Re-seed from the saved values each time it opens, so a cancelled edit
  // doesn't linger.
  useEffect(() => {
    if (visible) {
      setRadius(radiusKm);
      setPicked(categories);
    }
  }, [visible, radiusKm, categories]);

  const toggle = (slug: string) =>
    setPicked((p) => (p.includes(slug) ? p.filter((c) => c !== slug) : [...p, slug]));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <View
          style={[shadow.e3, { paddingBottom: (insets.bottom || 16) + 8 }]}
          className="rounded-t-[28px] bg-surface px-5 pt-3"
        >
          <View className="items-center pb-1">
            <View className="h-1 w-10 rounded-full bg-border" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[520px]">
            <View className="gap-5 pt-2">
              <View className="gap-1">
                <Text variant="heading">{t('nurse.filters.title')}</Text>
                <Text variant="caption">{t('nurse.filters.subtitle')}</Text>
              </View>

              {/* Radius */}
              <View className="gap-2.5">
                <Text variant="bodyMedium">{t('nurse.filters.radius')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {RADIUS_OPTIONS.map((km) => (
                    <Chip
                      key={km}
                      label={t('nurse.filters.km', { km: String(km) })}
                      selected={radius === km}
                      onPress={() => setRadius(km)}
                    />
                  ))}
                </View>
                <Text variant="caption">{t('nurse.filters.radiusHint')}</Text>
              </View>

              {/* Categories */}
              <View className="gap-2.5">
                <Text variant="bodyMedium">{t('nurse.filters.services')}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {JOB_CATEGORIES.map((slug) => (
                    <Chip
                      key={slug}
                      label={t(`service.category.${slug}`)}
                      selected={picked.includes(slug)}
                      onPress={() => toggle(slug)}
                    />
                  ))}
                </View>
                <Text variant="caption">
                  {picked.length === 0
                    ? t('nurse.filters.allServices')
                    : t('nurse.filters.someServices', { count: String(picked.length) })}
                </Text>
              </View>

              <Button
                label={t('nurse.filters.apply')}
                icon="checkmark"
                loading={saving}
                onPress={() => onSave({ radiusKm: radius, categories: picked })}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
