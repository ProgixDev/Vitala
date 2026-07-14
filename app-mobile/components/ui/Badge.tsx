import { View } from 'react-native';
import { Text } from './Text';
import type { IconName } from './Icon';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<BadgeTone, { bg: string; text: string; dot: string }> = {
  neutral: { bg: 'bg-surface-alt', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  primary: { bg: 'bg-primary-soft', text: 'text-primary', dot: 'bg-primary' },
  success: { bg: 'bg-success/15', text: 'text-success', dot: 'bg-success' },
  warning: { bg: 'bg-warning/15', text: 'text-warning', dot: 'bg-warning' },
  danger: { bg: 'bg-emergency/15', text: 'text-emergency', dot: 'bg-emergency' },
  info: { bg: 'bg-accent/15', text: 'text-accent', dot: 'bg-accent' },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
  icon?: IconName;
  className?: string;
}

export function Badge({ label, tone = 'neutral', dot = false, className }: BadgeProps) {
  const t = tones[tone];
  return (
    <View className={cn('flex-row items-center self-start rounded-full px-3 py-1', t.bg, className)}>
      {dot ? <View className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', t.dot)} /> : null}
      <Text variant="caption" className={cn('font-semibold', t.text)}>
        {label}
      </Text>
    </View>
  );
}
