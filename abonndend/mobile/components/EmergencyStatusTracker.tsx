import { api } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Card, EmptyState, IconButton, Text } from "@/components/ui";
import { useThemeColors, type ThemeColors } from "@/constants/theme";

interface EmergencyStatus {
  appointment: {
    _id: string;
    status: string;
    service: string;
    nurse?: { name: string; phoneNumber: string };
    nurseLocation?: { latitude: number; longitude: number; updatedAt: string };
  };
  emergencyRequest: { status: string; eta?: string; assignedPersonnel?: any[] };
}

interface EmergencyStatusTrackerProps {
  appointmentId: string;
  onClose: () => void;
}

type StatusKey =
  | "pending"
  | "dispatched"
  | "en-route"
  | "on-scene"
  | "completed"
  | "cancelled";

const statusConfig: Record<
  StatusKey,
  {
    icon: keyof typeof Ionicons.glyphMap;
    tint: keyof ThemeColors;
    label: string;
    description: string;
  }
> = {
  pending: {
    icon: "time-outline",
    tint: "warning",
    label: "Request submitted",
    description: "Your emergency request has been received and is being processed.",
  },
  dispatched: {
    icon: "car-outline",
    tint: "primary",
    label: "Help dispatched",
    description: "Emergency personnel have been dispatched to your location.",
  },
  "en-route": {
    icon: "navigate-outline",
    tint: "primary",
    label: "On the way",
    description: "Emergency personnel are on their way to you.",
  },
  "on-scene": {
    icon: "location-outline",
    tint: "accent",
    label: "On scene",
    description: "Emergency personnel have arrived at your location.",
  },
  completed: {
    icon: "checkmark-circle-outline",
    tint: "accent",
    label: "Completed",
    description: "Emergency service has been completed.",
  },
  cancelled: {
    icon: "close-circle-outline",
    tint: "emergency",
    label: "Cancelled",
    description: "Emergency request has been cancelled.",
  },
};

export default function EmergencyStatusTracker({
  appointmentId,
  onClose,
}: EmergencyStatusTrackerProps) {
  const colors = useThemeColors();
  const { currentUser } = useCurrentUser();
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      if (!currentUser?.token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      const response = (await api.getEmergencyStatus(
        currentUser.token,
        appointmentId,
      )) as { data: EmergencyStatus };
      setStatus(response.data);
      setError(null);
    } catch {
      setError("Failed to fetch emergency status");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, currentUser]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [appointmentId, fetchStatus]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <ActivityIndicator size="large" color={colors.emergency} />
        <Text variant="body" color="muted" className="mt-4">
          Loading emergency status…
        </Text>
      </View>
    );
  }

  if (error || !status) {
    return (
      <View className="flex-1 justify-center">
        <EmptyState
          tone="error"
          title="Couldn't load status"
          message={error || "Failed to load emergency status."}
          actionLabel="Try again"
          onAction={() => {
            setLoading(true);
            fetchStatus();
          }}
        />
      </View>
    );
  }

  const currentStatus =
    statusConfig[status.appointment.status as StatusKey] || statusConfig.pending;
  const tintColor = colors[currentStatus.tint] as string;

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text variant="h3" color="foreground">
            Emergency status
          </Text>
          <Text variant="caption" color="muted" className="mt-0.5">
            {status.appointment.service}
          </Text>
        </View>
        <IconButton icon="close" onPress={onClose} accessibilityLabel="Close" />
      </View>

      <View className="px-5">
        {/* Status card */}
        <Card className="mb-4 flex-row items-center">
          <View
            className="w-14 h-14 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${tintColor}22` }}
          >
            <Ionicons name={currentStatus.icon} size={26} color={tintColor} />
          </View>
          <View className="flex-1">
            <Text variant="h3" color="foreground">
              {currentStatus.label}
            </Text>
            <Text variant="body" color="muted" className="mt-1">
              {currentStatus.description}
            </Text>
          </View>
        </Card>

        {/* Assigned personnel */}
        {status.appointment.nurse && (
          <Card className="mb-4">
            <Text variant="label" color="foreground" className="mb-3">
              Assigned personnel
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
              <Text variant="body" color="foreground" weight="medium" className="ml-2">
                {status.appointment.nurse.name}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={18} color={colors.mutedForeground} />
              <Text variant="body" color="muted" className="ml-2">
                {status.appointment.nurse.phoneNumber}
              </Text>
            </View>
          </Card>
        )}

        {/* ETA */}
        {status.emergencyRequest.eta && (
          <Card className="mb-4">
            <Text variant="label" color="foreground" className="mb-3">
              Estimated arrival
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text variant="h3" color="primary" className="ml-2">
                {new Date(status.emergencyRequest.eta).toLocaleTimeString()}
              </Text>
            </View>
          </Card>
        )}

        {/* Footer */}
        <View className="mt-2 bg-primary-soft rounded-lg p-4 flex-row items-center justify-center">
          <Ionicons name="sync-outline" size={16} color={colors.primary} />
          <Text variant="caption" color="primary" className="ml-2 text-center">
            Status updates automatically every 30 seconds
          </Text>
        </View>
      </View>
    </View>
  );
}
