import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { getServiceNameById } from "@/utils/services";
import {
  Badge,
  BadgeTone,
  Button,
  Card,
  EmptyState,
  Header,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import Toast from "react-native-toast-message";

const statusSteps = [
  {
    key: "pending",
    title: "Service Confirmation",
    description:
      "We're assigning a qualified healthcare professional near you...",
    step: "1/4",
  },
  {
    key: "confirmed",
    title: "Confirmed",
    description:
      "Your appointment has been confirmed. The nurse will arrive soon.",
    step: "2/4",
  },
  {
    key: "on-the-way",
    title: "On the Way",
    description:
      "Our professional is on the way — feel free to prepare the area for their arrival.",
    step: "2/4",
  },
  {
    key: "in-progress",
    title: "Task in Progress",
    description:
      "Our professionals are doing their best to complete their tasks perfectly.",
    step: "3/4",
  },
  {
    key: "completed",
    title: "Completed",
    description:
      "Service completed successfully. Thank you for choosing Vitala!",
    step: "4/4",
  },
  {
    key: "cancelled",
    title: "Cancelled",
    description: "This appointment has been cancelled.",
    step: "0/4",
  },
];

const statusMeta: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; tone: BadgeTone }
> = {
  pending: { icon: "hourglass-outline", tone: "warning" },
  confirmed: { icon: "checkmark-circle", tone: "primary" },
  "on-the-way": { icon: "car-outline", tone: "primary" },
  "in-progress": { icon: "medical", tone: "primary" },
  completed: { icon: "checkmark-done-circle", tone: "success" },
  cancelled: { icon: "close-circle", tone: "emergency" },
};

export default function AppointmentStatus() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
  const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [nurse, setNurse] = useState<PopulatedUser | null>(null);

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        if (!currentUser?.token) {
          return;
        }

        const result = await api.getAppointmentById(
          currentUser.token,
          id as string,
        );
        if (result.success && result.data) {
          setAppointment(result.data);

          // populate nurse if present in API response
          if (result.data.nurse) {
            setNurse(result.data.nurse);
          }
        } else {
          setAppointment(null);
        }
      } catch (err) {
        console.error("Error loading appointment:", err);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };
    loadAppointment();
  }, [currentUser?.token, id]);

  const handleGoBack = () => {
    router.replace("/(tabs)/schedule");
  };

  const handleCancel = async () => {
    if (!appointment) return;

    try {
      if (!currentUser?.token) throw new Error("Not authenticated");

      const appointmentId = appointment._id ?? appointment._id;
      const res = await api.cancelAppointment(
        currentUser.token,
        appointmentId,
        "Cancelled by user",
      );
      if (res.success) {
        const updated = res.data;
        const formatted = {
          ...updated,
          serviceName:
            updated.serviceName ||
            getServiceNameById(updated.service) ||
            updated.service ||
            "Unknown Service",
          date: updated.scheduledDate
            ? new Date(updated.scheduledDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "",
          time: updated.scheduledTime?.start || "",
          duration: updated.duration
            ? `${updated.duration} minutes`
            : "Unknown duration",
        };

        setAppointment(formatted);
        Toast.show({
          type: "success",
          text1: "Appointment cancelled",
          text2: "The appointment has been cancelled successfully",
        });
      } else {
        console.error("Failed to cancel appointment", res);
        Toast.show({
          type: "error",
          text1: "Cancel failed",
          text2: "Could not cancel appointment",
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      Toast.show({
        type: "error",
        text1: "Cancel failed",
        text2: String(error),
      });
    }
  };

  const handleContinue = async () => {
    if (!appointment || !appointment.status) return;

    const statusOrder: Appointment["status"][] = [
      "pending",
      "confirmed",
      "on-the-way",
      "in-progress",
      "completed",
    ];

    const currentIndex =
      appointment.status !== "declined"
        ? statusOrder.indexOf(appointment.status)
        : -1;

    if (currentIndex < statusOrder.length - 1) {
      const newStatus = statusOrder[currentIndex + 1];

      try {
        if (!currentUser?.token) throw new Error("Not authenticated");

        const res = await api.updateAppointmentStatus(
          currentUser.token,
          appointment._id,
          newStatus,
        );
        if (res.success) {
          const updated = res.data;
          const formatted = {
            ...updated,
            serviceName:
              updated.serviceName ||
              getServiceNameById(updated.service) ||
              updated.service ||
              "Unknown Service",
            date: updated.scheduledDate
              ? new Date(updated.scheduledDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "",
            time: updated.scheduledTime?.start || "",
            duration: updated.duration
              ? `${updated.duration} minutes`
              : "Unknown duration",
          };

          setAppointment(formatted);
          if (updated.nurse) setNurse(updated.nurse);

          // Show success toast
          Toast.show({
            type: "success",
            text1: "Status updated",
            text2: `Appointment is now ${newStatus}`,
          });
        } else {
          console.error("Failed to update status", res);
          Toast.show({
            type: "error",
            text1: "Update failed",
            text2: "Could not change appointment status",
          });
        }
      } catch (error) {
        console.error("Error updating appointment status:", error);
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: String(error),
        });
      }
    } else {
      router.replace(`/appointment/${appointment._id}/payment`);
    }
  };

  const getCurrentStepData = () => {
    if (!appointment || !appointment.status) return statusSteps[0];
    return (
      statusSteps.find((step) => step.key === appointment.status) ||
      statusSteps[0]
    );
  };

  const getProgressDots = () => {
    if (!appointment || !appointment.status) return 0;
    const statusOrder = [
      "pending",
      "confirmed",
      "on-the-way",
      "in-progress",
      "completed",
    ];
    const index = statusOrder.indexOf(appointment.status);
    return index >= 0 ? index + 1 : 0;
  };

  const handleNurseProfilePress = () => {
    if (nurse) {
      router.push(`/profile/${(nurse as any)._id || (nurse as any).id}`);
    }
  };

  if (loading) {
    return (
      <Screen scroll>
        <StatusBar hidden />
        <Header title="Processing" onBack={handleGoBack} large />
        <SkeletonList count={3} itemHeight={140} />
      </Screen>
    );
  }

  const currentStep = getCurrentStepData();
  const progressDots = getProgressDots();

  if (!appointment)
    return (
      <Screen>
        <StatusBar hidden />
        <Header title="Processing" onBack={handleGoBack} />
        <EmptyStateFallback onAction={handleGoBack} />
      </Screen>
    );

  const meta = statusMeta[currentStep.key] ?? statusMeta.pending;
  const medallionBg =
    meta.tone === "warning"
      ? "bg-warning-soft"
      : meta.tone === "success"
        ? "bg-accent-soft"
        : meta.tone === "emergency"
          ? "bg-emergency-soft"
          : "bg-primary-soft";
  const medallionIconColor =
    meta.tone === "warning"
      ? colors.warning
      : meta.tone === "success"
        ? colors.success
        : meta.tone === "emergency"
          ? colors.emergency
          : colors.primary;
  const isContinueDisabled =
    currentUser?.userType === "patient" &&
    (appointment?.status === "pending" || appointment?.status === "cancelled");
  const continueLabel =
    currentStep.key !== "completed"
      ? "Continue"
      : appointment?.payment?.status === "completed"
        ? "Go to Payment Details"
        : "Pay Now";

  return (
    <Screen scroll>
      <StatusBar hidden />
      <Header
        title="Processing"
        subtitle="Services made for you"
        onBack={handleGoBack}
        large
        right={
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-11 h-11"
            resizeMode="contain"
          />
        }
      />

      {/* Pending confirmation indicator */}
      {appointment?.status === "pending" &&
        currentUser?.userType === "patient" && (
          <Card
            elevation="none"
            className="bg-warning-soft border-0 mb-4"
          >
            <Text variant="label" color="warning">
              Waiting for confirmation
            </Text>
            <Text variant="caption" color="muted" className="mt-1">
              A nurse will confirm this appointment. We&apos;ll notify you once
              it&apos;s confirmed.
            </Text>
          </Card>
        )}

      {/* Status Medallion */}
      <View className="items-center justify-center py-10">
        <View
          className={`w-52 h-52 rounded-full items-center justify-center ${medallionBg}`}
        >
          <Ionicons name={meta.icon} size={112} color={medallionIconColor} />
        </View>
      </View>

      {/* Status Title and Description */}
      <View className="items-center mb-6">
        <Badge label={currentStep.title} tone={meta.tone} className="mb-3" />
        <Text
          variant="body"
          color="muted"
          className="text-center px-6 leading-6"
        >
          {currentStep.description}
        </Text>
      </View>

      {/* Progress Dots */}
      <View className="flex-row justify-center items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((dot) => (
          <View
            key={dot}
            className={`h-2 rounded-full ${
              dot <= progressDots ? "w-8 bg-primary" : "w-2 bg-surface-alt"
            }`}
          />
        ))}
      </View>

      {/* Nurse Info Card - Only show when confirmed and nurse is assigned */}
      {currentUser?.userType === "patient" &&
        appointment?.status === "confirmed" &&
        nurse && (
          <Card onPress={handleNurseProfilePress} className="mb-6">
            <Text variant="h3" color="foreground" className="mb-4">
              Your Nurse
            </Text>
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: `https://i.pravatar.cc/150?u=${nurse.email}` }}
                className="w-16 h-16 rounded-full"
              />
              <View className="flex-1">
                <Text variant="bodyLg" color="foreground" weight="semibold">
                  {nurse.fullName}
                </Text>
                <Text variant="caption" color="muted" className="mb-1">
                  Professional Nurse
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text variant="caption" color="foreground" weight="semibold">
                    4.9
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.mutedForeground}
              />
            </View>
          </Card>
        )}

      {/* Appointment Details Card */}
      <Card className="mb-6">
        <Text variant="h3" color="foreground" className="mb-4">
          Appointment Details
        </Text>
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text variant="body" color="muted">
              Service
            </Text>
            <Text variant="body" color="foreground" weight="semibold">
              {appointment.service}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="body" color="muted">
              Date
            </Text>
            <Text
              variant="body"
              color="foreground"
              weight="semibold"
              className="ml-2 text-right flex-1"
            >
              {new Date(appointment?.scheduledDate).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                },
              )}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="body" color="muted">
              Time
            </Text>
            <Text variant="body" color="foreground" weight="semibold">
              {appointment?.scheduledTime.start}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="body" color="muted">
              Duration
            </Text>
            <Text variant="body" color="foreground" weight="semibold">
              {appointment?.duration} minutes
            </Text>
          </View>
          <View className="flex-row justify-between items-start">
            <Text variant="body" color="muted">
              Location
            </Text>
            <View className="flex-1 items-end ml-2">
              <Text variant="body" color="foreground" weight="semibold">
                {appointment?.location?.label || "N/A"}
              </Text>
              <Text
                variant="caption"
                color="muted"
                className="text-right mt-0.5"
              >
                {appointment?.location?.address || ""}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        {currentUser?.userType === "patient" &&
          (appointment?.status === "pending" ||
            appointment?.status === "confirmed") && (
            <View className="flex-1">
              <Button label="Cancel" variant="danger" onPress={handleCancel} />
            </View>
          )}
        <View className="flex-1">
          <Button
            label={continueLabel}
            onPress={handleContinue}
            disabled={isContinueDisabled}
          />
        </View>
      </View>
    </Screen>
  );
}

function EmptyStateFallback({ onAction }: { onAction: () => void }) {
  return (
    <EmptyState
      tone="error"
      title="Unable to load appointment"
      message="We couldn't load this appointment. Please try again."
      actionLabel="Back to schedule"
      onAction={onAction}
    />
  );
}
