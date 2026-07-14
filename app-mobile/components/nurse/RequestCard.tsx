import { View } from 'react-native';
import { Text, Card, Button, Badge, Avatar, Icon } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { formatDate, formatTime, formatPrice } from '@/utils/format';
import type { Appointment } from '@/types';

interface RequestCardProps {
  appointment: Appointment;
  onAccept: () => void;
  onDecline: () => void;
  accepting?: boolean;
}

/**
 * An open-pool visit request as the nurse sees it — who, when, where, what it
 * pays, and the two decisions that matter: take it or pass. Emergencies wear the
 * SOS badge so they're impossible to miss.
 */
export function RequestCard({ appointment: a, onAccept, onDecline, accepting }: RequestCardProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const isEmergency = a.appointment_type === 'emergency';

  return (
    <Card elevation="e1" className="gap-3.5">
      <View className="flex-row items-center justify-between gap-2">
        <Text variant="bodyMedium" numberOfLines={1} className="flex-1">
          {a.service?.name ?? 'Home visit'}
        </Text>
        {isEmergency ? <Badge label="SOS" tone="danger" dot /> : null}
      </View>

      <View className="flex-row items-center gap-3">
        <Avatar name={a.patient?.full_name} uri={a.patient?.avatar_url} size={40} />
        <View className="flex-1">
          <Text variant="bodyMedium" numberOfLines={1}>
            {a.patient?.full_name ?? t('nurse.jobs.patient')}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Icon name="calendar-outline" size={13} color={colors.mutedForeground} />
            <Text variant="caption">
              {formatDate(a.scheduled_date)} · {formatTime(a.scheduled_start)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text variant="bodyMedium" className="text-primary">
            {formatPrice(a.price)}
          </Text>
          <Text variant="caption">{t('nurse.jobs.payout')}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5">
        <Icon name="location-outline" size={14} color={colors.mutedForeground} />
        <Text variant="caption" numberOfLines={1} className="flex-1">
          {a.location_label || a.address}
        </Text>
      </View>

      <View className="mt-0.5 flex-row gap-3">
        <Button
          label={t('nurse.jobs.decline')}
          variant="secondary"
          onPress={onDecline}
          fullWidth={false}
          className="flex-1"
        />
        <Button
          label={t('nurse.jobs.accept')}
          icon="checkmark"
          loading={accepting}
          onPress={onAccept}
          fullWidth={false}
          className="flex-1"
        />
      </View>
    </Card>
  );
}
