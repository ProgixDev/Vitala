import { Pressable, View } from 'react-native';
import { Text, Card, Badge, Avatar, Icon } from '@/components/ui';
import { useThemeColors } from '@/constants/theme';
import { appointmentStatusMeta, paymentStatusMeta } from '@/utils/status';
import { formatDate, formatTime } from '@/utils/format';
import type { Appointment, PaymentStatus } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  /** Which counterpart to show: patient (nurse view) or nurse (patient view). */
  counterpart?: 'patient' | 'nurse';
  paymentStatus?: PaymentStatus | null;
  onPress?: () => void;
}

export function AppointmentCard({
  appointment,
  counterpart = 'nurse',
  paymentStatus,
  onPress,
}: AppointmentCardProps) {
  const colors = useThemeColors();
  const status = appointmentStatusMeta(appointment.status);
  const person = counterpart === 'nurse' ? appointment.nurse : appointment.patient;
  const pay = paymentStatus ?? appointment.payment?.status;
  const isEmergency = appointment.appointment_type === 'emergency';

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card elevation="e1" className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2">
            <Text variant="bodyMedium" numberOfLines={1} className="flex-shrink">
              {appointment.service?.name ?? 'Home visit'}
            </Text>
            {isEmergency ? <Badge label="SOS" tone="danger" /> : null}
          </View>
          <Badge label={status.label} tone={status.tone} dot />
        </View>

        <View className="flex-row items-center gap-3">
          <Avatar
            name={person?.full_name}
            uri={person?.avatar_url}
            size={40}
            fallback={counterpart === 'patient' ? 'icon' : 'initials'}
          />
          <View className="flex-1">
            <Text variant="caption" className="text-muted-foreground">
              {counterpart === 'nurse' ? 'Nurse' : 'Patient'}
            </Text>
            <Text variant="bodyMedium" numberOfLines={1}>
              {person?.full_name ?? (counterpart === 'nurse' ? 'Awaiting assignment' : '—')}
            </Text>
          </View>
          {pay ? <Badge label={paymentStatusMeta(pay).label} tone={paymentStatusMeta(pay).tone} /> : null}
        </View>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Icon name="calendar-outline" size={14} color={colors.mutedForeground} />
            <Text variant="caption">{formatDate(appointment.scheduled_date)}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Icon name="time-outline" size={14} color={colors.mutedForeground} />
            <Text variant="caption">{formatTime(appointment.scheduled_start)}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
