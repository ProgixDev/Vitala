import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Input, Text, Icon } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
  };

  return (
    <View className="gap-2">
      <Input
        label={label}
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder ?? t('auth.addTag')}
        onSubmitEditing={add}
        returnKeyType="done"
        icon="pricetag-outline"
      />
      {value.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {value.map((tag) => (
            <View
              key={tag}
              className="flex-row items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5"
            >
              <Text variant="caption" className="font-semibold text-foreground">
                {tag}
              </Text>
              <Pressable hitSlop={6} onPress={() => onChange(value.filter((v) => v !== tag))}>
                <Icon name="close" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
