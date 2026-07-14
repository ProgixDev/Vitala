import { View } from 'react-native';
import { Text, Icon } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';

export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  number: boolean;
  match: boolean;
  allValid: boolean;
}

export function evaluatePassword(password: string, confirm: string): PasswordChecks {
  const length = password.length >= 8;
  const upper = /[A-Z]/.test(password);
  const number = /[0-9]/.test(password);
  const match = password.length > 0 && password === confirm;
  return { length, upper, number, match, allValid: length && upper && number && match };
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center gap-2">
      <Icon
        name={ok ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={ok ? colors.success : colors.mutedForeground}
      />
      <Text variant="caption" className={ok ? 'text-foreground' : 'text-muted-foreground'}>
        {label}
      </Text>
    </View>
  );
}

export function PasswordRules({ checks }: { checks: PasswordChecks }) {
  const { t } = useTranslation();
  return (
    <View className="gap-1.5">
      <Rule ok={checks.length} label={t('auth.pwLength')} />
      <Rule ok={checks.upper} label={t('auth.pwUpper')} />
      <Rule ok={checks.number} label={t('auth.pwNumber')} />
      <Rule ok={checks.match} label={t('auth.pwMatch')} />
    </View>
  );
}
