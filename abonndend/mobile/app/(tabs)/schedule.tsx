import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  BadgeTone,
  Card,
  Chip,
  EmptyState,
  IconButton,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, View } from "react-native";

const tabularNums = { fontVariant: ["tabular-nums" as const] };

export default function Schedule() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "paid" | "pending" | "failed"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "cancelled"
  >("all");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentUser?.token) {
        return;
      }
      const result = await api.getAppointments(currentUser.token);
      if (result.success) {
        setAppointments(result?.data || []);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  const onRefresh = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const upcomingAppointments = appointments.filter((appointment) =>
    ["pending", "confirmed", "on-the-way", "in-progress"].includes(
      appointment.status,
    ),
  );

  const historyAppointments = appointments
    .filter((appointment) =>
      ["completed", "cancelled"].includes(appointment.status),
    )
    .filter((appointment) => {
      // Apply status filter
      if (statusFilter !== "all" && appointment.status !== statusFilter) {
        return false;
      }
      // Apply payment filter
      if (paymentFilter !== "all") {
        if (
          paymentFilter === "paid" &&
          appointment.payment?.status !== "completed"
        ) {
          return false;
        }
        if (
          paymentFilter === "pending" &&
          appointment.payment?.status !== "pending"
        ) {
          return false;
        }
        if (
          paymentFilter === "failed" &&
          appointment.payment?.status !== "failed"
        ) {
          return false;
        }
      }
      return true;
    });

  const displayedAppointments =
    activeTab === "upcoming" ? upcomingAppointments : historyAppointments;

  const getServiceIcon = (serviceCategory: string) => {
    const iconMap: { [key: string]: string } = {
      reeducation: "accessibility",
      perfusion: "water",
      vaccination: "medical",
      analyses: "flask",
      consultation: "bandage",
      maternity: "woman",
      pediatric: "person",
      medication: "hand-right",
      "wound-care": "medkit",
      "elderly-care": "walk",
      dialysis: "heart-circle",
      respiratory: "fitness",
      "post-op-care": "bed",
      injection: "pulse",
      palliative: "leaf",
      nutrition: "nutrition",
    };
    return iconMap[serviceCategory] || "medical";
  };

  const handleAppointmentPress = (appointmentId: string) => {
    if (currentUser?.userType === "patient") {
      router.push(`/appointment/${appointmentId}/status`);
    } else {
      router.push(`/appointment/${appointmentId}`);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "on-the-way":
        return "On the Way";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusTone = (status: string): BadgeTone => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
      case "on-the-way":
      case "in-progress":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "emergency";
      default:
        return "neutral";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "processing":
        return "Processing";
      case "completed":
        return "Paid";
      case "failed":
        return "Payment Failed";
      default:
        return "Unknown";
    }
  };

  const getPaymentTone = (status: string): BadgeTone => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "completed":
        return "success";
      case "failed":
        return "emergency";
      default:
        return "neutral";
    }
  };

  const getPaymentIcon = (
    status: string,
  ): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "processing":
        return "sync-outline";
      case "completed":
        return "checkmark-circle-outline";
      case "failed":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <Screen scroll>
      {/* Header */}
      <View className="pt-2 pb-5 flex-row justify-between items-center">
        <View className="flex-1">
          <Text variant="h1" color="foreground">
            Appointments
          </Text>
          <Text variant="body" color="muted" className="mt-1">
            Organize all your schedules
          </Text>
        </View>
        <IconButton
          icon="refresh"
          onPress={onRefresh}
          variant="soft"
          color={colors.primary}
          accessibilityLabel="Refresh appointments"
        />
      </View>

      {/* Tab Bar */}
      <View className="flex-row gap-2 mb-5">
        <Chip
          label={`Upcoming (${upcomingAppointments.length})`}
          selected={activeTab === "upcoming"}
          onPress={() => setActiveTab("upcoming")}
        />
        <Chip
          label={`History (${historyAppointments.length})`}
          selected={activeTab === "history"}
          onPress={() => setActiveTab("history")}
        />
      </View>

      {/* Filter Section - Only show in History tab */}
      {activeTab === "history" && (
        <View className="mb-5">
          {/* Status Filter */}
          <View className="mb-3">
            <Text
              variant="caption"
              color="muted"
              weight="semibold"
              className="mb-2 px-1"
            >
              Appointment Status
            </Text>
            <View className="flex-row gap-2">
              <Chip
                label="All"
                selected={statusFilter === "all"}
                onPress={() => setStatusFilter("all")}
              />
              <Chip
                label="Completed"
                selected={statusFilter === "completed"}
                onPress={() => setStatusFilter("completed")}
              />
              <Chip
                label="Cancelled"
                selected={statusFilter === "cancelled"}
                onPress={() => setStatusFilter("cancelled")}
              />
            </View>
          </View>

          {/* Payment Filter */}
          <View>
            <Text
              variant="caption"
              color="muted"
              weight="semibold"
              className="mb-2 px-1"
            >
              Payment Status
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              <Chip
                label="All"
                selected={paymentFilter === "all"}
                onPress={() => setPaymentFilter("all")}
              />
              <Chip
                label="Paid"
                selected={paymentFilter === "paid"}
                onPress={() => setPaymentFilter("paid")}
              />
              <Chip
                label="Payment Pending"
                selected={paymentFilter === "pending"}
                onPress={() => setPaymentFilter("pending")}
              />
              <Chip
                label="Failed"
                selected={paymentFilter === "failed"}
                onPress={() => setPaymentFilter("failed")}
              />
            </View>
          </View>

          {/* Results Count & Reset */}
          {(paymentFilter !== "all" || statusFilter !== "all") && (
            <View className="flex-row items-center justify-between mt-3 px-1">
              <Text variant="caption" color="muted">
                Showing {historyAppointments.length} result
                {historyAppointments.length !== 1 ? "s" : ""}
              </Text>
              <Text
                variant="caption"
                color="primary"
                weight="semibold"
                onPress={() => {
                  setPaymentFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Appointments List */}
      {loading ? (
        <View className="mb-12">
          <SkeletonList count={3} itemHeight={220} />
        </View>
      ) : displayedAppointments.length > 0 ? (
        <View className="mb-12 gap-4">
          {displayedAppointments.map((appointment) => (
            <Card
              key={appointment._id}
              elevation="e1"
              onPress={() => handleAppointmentPress(appointment._id)}
            >
              {/* Header with Status Badges */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 pr-2">
                  <Text variant="h3" color="foreground" className="mb-2">
                    {appointment.status === "completed"
                      ? "Completed Appointment"
                      : appointment.status === "cancelled"
                        ? "Cancelled Appointment"
                        : "Upcoming Appointment"}
                  </Text>
                  {/* Payment Status Badge - Only show if not cancelled */}
                  {appointment?.payment?.status !== undefined &&
                    appointment?.status !== "cancelled" && (
                      <Badge
                        label={getPaymentStatusLabel(
                          appointment?.payment?.status,
                        )}
                        tone={getPaymentTone(appointment?.payment?.status)}
                        icon={getPaymentIcon(appointment?.payment?.status)}
                      />
                    )}
                  {/* Show Cancelled Badge */}
                  {appointment?.status === "cancelled" && (
                    <Badge
                      label="Cancelled"
                      tone="emergency"
                      icon="close-circle"
                    />
                  )}
                </View>
                <View className="flex-row gap-2 items-center">
                  {appointment.appointmentType === "emergency" && (
                    <Badge label="Emergency" tone="emergency" />
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.mutedForeground}
                  />
                </View>
              </View>

              {/* Date, Time and Location Info */}
              <View className="flex-row justify-between mb-4 gap-3">
                <View className="flex-1">
                  <View className="w-11 h-11 bg-primary-soft rounded-lg justify-center items-center mb-2">
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <Text variant="caption" color="muted" className="mb-1">
                    Appointment Date
                  </Text>
                  <Text variant="label" color="foreground">
                    {appointment.scheduledDate.split("T")[0]}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="w-11 h-11 bg-primary-soft rounded-lg justify-center items-center mb-2">
                    <Ionicons
                      name="time-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <Text variant="caption" color="muted" className="mb-1">
                    Appointment Time
                  </Text>
                  <Text variant="label" color="foreground">
                    {appointment.scheduledTime.start}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="w-11 h-11 bg-primary-soft rounded-lg justify-center items-center mb-2">
                    <Ionicons
                      name="location-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <Text variant="caption" color="muted" className="mb-1">
                    Location
                  </Text>
                  <Text variant="label" color="foreground" numberOfLines={1}>
                    {appointment.location?.label || "N/A"}
                  </Text>
                </View>
              </View>

              {/* Service Card */}
              <View className="bg-surface-alt rounded-lg p-4 flex-row items-center gap-3">
                <View className="w-12 h-12 bg-primary-soft rounded-lg justify-center items-center">
                  <Ionicons
                    name={getServiceIcon(appointment.service) as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text variant="label" color="foreground" className="mb-1.5">
                    {appointment.service}
                  </Text>
                  <View className="flex-row gap-2 items-center">
                    <Badge
                      label={getStatusLabel(appointment.status)}
                      tone={getStatusTone(appointment.status)}
                    />
                    <Text
                      variant="caption"
                      color="muted"
                      style={tabularNums}
                    >
                      {appointment.price}
                      {appointment?.payment?.currency === "USD" ? "$" : "€"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Nurse/Patient Info */}
              {((currentUser?.userType === "patient" && appointment?.nurse) ||
                currentUser?.userType === "nurse") && (
                <View className="bg-surface-alt rounded-lg p-4 flex-row items-center gap-3 mt-3">
                  <Image
                    source={{
                      uri: `https://i.pravatar.cc/150?u=${appointment.nurse?.email}`,
                    }}
                    className="w-12 h-12 rounded-full"
                  />
                  <View className="flex-1">
                    <Text variant="label" color="foreground" className="mb-1">
                      {currentUser?.userType === "patient"
                        ? appointment.nurse?.fullName
                        : appointment.patient?.fullName}
                    </Text>
                    {currentUser?.userType === "patient" && (
                      <Text variant="caption" color="muted">
                        {appointment.nurse?.email}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>
              )}
            </Card>
          ))}
        </View>
      ) : (
        <View className="mb-12">
          <EmptyState
            icon="calendar-outline"
            title={`No ${activeTab} appointments`}
            message={
              activeTab === "upcoming"
                ? "Book your first appointment to get started"
                : paymentFilter !== "all" || statusFilter !== "all"
                  ? "No appointments match your filters"
                  : "Your completed and cancelled appointments will appear here"
            }
            actionLabel={
              activeTab === "history" &&
              (paymentFilter !== "all" || statusFilter !== "all")
                ? "Reset Filters"
                : undefined
            }
            onAction={
              activeTab === "history" &&
              (paymentFilter !== "all" || statusFilter !== "all")
                ? () => {
                    setPaymentFilter("all");
                    setStatusFilter("all");
                  }
                : undefined
            }
          />
        </View>
      )}
    </Screen>
  );
}
