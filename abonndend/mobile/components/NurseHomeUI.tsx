import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  acceptAppointment,
  assignSelfAppointment,
  declineAppointment,
  getAppointments,
  getUnassignedAppointments,
} from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";

type RequestItem = {
  id: string;
  name: string;
  role: string;
  date: string;
  time: string;
  image: string;
  serviceName: string;
  userEmail: string;
};

type AppointmentItem = {
  id: string;
  name: string;
  role: string;
  date: string;
  time: string;
  image: string;
  serviceName: string;
  userEmail: string;
};

export default function NurseHomeUI() {
  const colors = useThemeColors();
  const { currentUser, refreshUser } = useCurrentUser();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentItem[]
  >([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [unassignedAppointments, setUnassignedAppointments] = useState<
    AppointmentItem[]
  >([]);
  const [unassignedLoading, setUnassignedLoading] = useState(true);

  const loadUpcomingAppointments = useCallback(async () => {
    try {
      if (!currentUser?.token) return;

      setLoading(true);
      const response = await getAppointments(currentUser.token, {
        status: "confirmed",
      });

      const allAppointments = response.data || [];

      // Filter for appointments assigned to this nurse that are confirmed
      const sortedAppointments = allAppointments
        .filter((appt: any) => {
          return (
            appt.status === "confirmed" &&
            appt.nurseEmail === currentUser?.email
          );
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

      const appointmentItems: AppointmentItem[] = sortedAppointments.map(
        (appt: any) => ({
          id: appt._id || appt.id,
          name: appt.patientName || appt.userName || "Unknown Patient",
          role: "PATIENT",
          date: appt.date,
          time: appt.time,
          image: `https://i.pravatar.cc/150?u=${appt.userEmail}`,
          serviceName: appt.serviceName,
          userEmail: appt.userEmail,
        }),
      );

      setUpcomingAppointments(appointmentItems);
    } catch (error) {
      console.error("Error loading upcoming appointments:", error);
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email, currentUser?.token]);

  const loadRequests = useCallback(async () => {
    try {
      if (!currentUser?.token) return;

      setRequestsLoading(true);
      const response = await getAppointments(currentUser.token, {
        status: "pending",
      });

      const allAppointments = response.data || [];

      // Filter for pending appointments without a nurse assigned
      const pendingAppointments = allAppointments
        .filter((appt: any) => appt.status === "pending" && !appt.nurseEmail)
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

      const requestItems: RequestItem[] = pendingAppointments.map(
        (appt: any) => ({
          id: appt._id || appt.id,
          name: appt.patientName || appt.userName || "Unknown Patient",
          role: "PATIENT",
          date: appt.date,
          time: appt.time,
          image: `https://i.pravatar.cc/150?u=${appt.userEmail}`,
          serviceName: appt.serviceName,
          userEmail: appt.userEmail,
        }),
      );

      setRequests(requestItems);
    } catch (error) {
      console.error("Error loading requests:", error);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [currentUser?.token]);

  const loadUnassignedAppointments = useCallback(async () => {
    try {
      if (!currentUser?.token) return;

      setUnassignedLoading(true);
      const response = await getUnassignedAppointments(currentUser.token);

      const allAppointments = response.data || [];

      const sortedAppointments = allAppointments.sort((a: any, b: any) => {
        const dateA = new Date(
          `${a.scheduledDate.split("T")[0]} ${a.scheduledTime.start}`,
        );
        const dateB = new Date(
          `${b.scheduledDate.split("T")[0]} ${b.scheduledTime.start}`,
        );
        return dateA.getTime() - dateB.getTime();
      });

      const appointmentItems: AppointmentItem[] = sortedAppointments.map(
        (appt: any) => ({
          id: appt._id || appt.id,
          name: appt.patient?.fullName || "Unknown Patient",
          role: "PATIENT",
          date: new Date(appt.scheduledDate).toLocaleDateString(),
          time: appt.scheduledTime.start,
          image: `https://i.pravatar.cc/150?u=${appt.patient?.email}`,
          serviceName: appt.service?.name || "Unknown Service",
          userEmail: appt.patient?.email,
        }),
      );

      setUnassignedAppointments(appointmentItems);
    } catch (error) {
      console.error("Error loading unassigned appointments:", error);
      setUnassignedAppointments([]);
    } finally {
      setUnassignedLoading(false);
    }
  }, [currentUser?.token]);

  const loadData = useCallback(async () => {
    await Promise.all([
      loadUpcomingAppointments(),
      loadRequests(),
      loadUnassignedAppointments(),
    ]);
  }, [loadUpcomingAppointments, loadRequests, loadUnassignedAppointments]);

  useEffect(() => {
    if (currentUser?.token) {
      loadData();
    }
  }, [loadData, currentUser?.token]);

  const handleAssignSelf = async (appointmentId: string) => {
    try {
      if (!currentUser?.token) return;

      await assignSelfAppointment(currentUser.token, appointmentId);

      Toast.show({
        type: "success",
        text1: "Appointment Assigned",
        text2: "You have been assigned to this appointment",
      });

      // Reload data
      await loadData();
    } catch (error: any) {
      console.error("Error assigning self:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to assign appointment",
      });
    }
  };

  const handleAcceptRequest = async (appointmentId: string) => {
    try {
      if (!currentUser?.token) return;

      await acceptAppointment(currentUser.token, appointmentId);

      Toast.show({
        type: "success",
        text1: "Request Accepted",
        text2: "The appointment has been confirmed",
      });

      // Reload data
      await loadData();
    } catch (error: any) {
      console.error("Error accepting request:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to accept request",
      });
    }
  };

  const handleDeclineRequest = async (appointmentId: string) => {
    try {
      if (!currentUser?.token) return;

      await declineAppointment(
        currentUser.token,
        appointmentId,
        "Nurse declined the request",
      );

      Toast.show({
        type: "success",
        text1: "Request Declined",
        text2: "The appointment has been declined",
      });

      await loadRequests();
    } catch (error: any) {
      console.error("Error declining request:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to decline request",
      });
    }
  };

  const handleDevVerify = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error("Error in dev verify:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to verify account",
      });
    }
  };

  return (
    <>
      {currentUser?.status === "active" ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="py-5">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-3">
                <Text variant="h1" color="foreground">
                  Hi, {currentUser?.fullName.split(" ")[0] || "Nurse"}
                </Text>
                <Text variant="caption" color="muted" className="mt-1">
                  Welcome Back
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/sos")}
                className="bg-emergency rounded-full pl-4 pr-3 py-2 flex-row items-center gap-2 active:opacity-90"
              >
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={colors.onEmergency}
                />
                <Text variant="caption" color="onEmergency" weight="semibold">
                  Emergency Map
                </Text>
                <View className="bg-surface rounded-full px-2 py-0.5">
                  <Text variant="caption" color="emergency" weight="headingBold">
                    {requests.length.toString().padStart(2, "0")}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text variant="h2" color="foreground">
                Upcoming Appointments
              </Text>
              <View className="flex-row items-center gap-1">
                <IconButton
                  icon="refresh"
                  onPress={() => loadUpcomingAppointments()}
                  size={20}
                  color={colors.primary}
                  accessibilityLabel="Refresh upcoming appointments"
                />
                <Pressable onPress={() => router.push("/schedule")} hitSlop={8}>
                  <Text variant="label" color="primary" weight="semibold">
                    See All
                  </Text>
                </Pressable>
              </View>
            </View>

            {loading ? (
              <SkeletonList count={2} itemHeight={120} />
            ) : upcomingAppointments.length > 0 ? (
              <View className="gap-3">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: appointment.image }}
                        className="w-12 h-12 rounded-full"
                      />
                      <View className="flex-1">
                        <Text variant="bodyLg" color="foreground" weight="semibold">
                          {appointment.name}
                        </Text>
                        <Badge label={appointment.role} tone="primary" className="mt-1" />
                      </View>
                    </View>
                    <View className="mt-3 pt-3 border-t border-border">
                      <Text variant="caption" color="muted" className="mb-1">
                        Service
                      </Text>
                      <Text variant="label" color="foreground" weight="medium" className="mb-3">
                        {appointment.serviceName}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text variant="label" color="primary" weight="semibold">
                          {appointment.date}
                        </Text>
                        <Text variant="bodyLg" color="foreground" weight="headingBold">
                          {appointment.time}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No upcoming appointments"
              />
            )}
          </View>

          {/* Motivational Banner */}
          <Card
            elevation="e2"
            padded={false}
            className="bg-primary border-0 mb-10 p-5 pr-0 pb-0 overflow-hidden flex-row"
          >
            <View className="flex-1">
              <Text variant="caption" color="onPrimary" className="mb-3 opacity-90">
                Your Patients Rely On You
              </Text>
              <Text variant="h1" color="onPrimary" weight="headingBold">
                Make Every Visit
              </Text>
              <Text variant="h1" color="onPrimary" weight="headingBold">
                Count
              </Text>
              <View className="flex-row items-center mt-4 gap-3">
                <View className="flex-row -ml-2">
                  <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=1" }}
                    className="w-8 h-8 rounded-full border-2 border-primary -ml-2"
                  />
                  <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=2" }}
                    className="w-8 h-8 rounded-full border-2 border-primary -ml-2"
                  />
                  <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                    className="w-8 h-8 rounded-full border-2 border-primary -ml-2"
                  />
                </View>
                <View>
                  <Text variant="label" color="onPrimary" weight="headingBold">
                    30,000+
                  </Text>
                  <Text variant="caption" color="onPrimary" className="opacity-80">
                    Happy Patients
                  </Text>
                </View>
              </View>
            </View>
            <Image
              source={require("@/assets/images/doctor.png")}
              className="h-45 relative -right-2.5 bottom-0"
              resizeMode="contain"
            />
          </Card>

          {/* Your Requests */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Text variant="h2" color="foreground">
                  Your Requests
                </Text>
                {requests.length > 0 && (
                  <Badge
                    label={requests.length.toString()}
                    tone="warning"
                  />
                )}
              </View>
              <View className="flex-row items-center gap-1">
                <IconButton
                  icon="refresh"
                  onPress={() => loadRequests()}
                  size={20}
                  color={colors.primary}
                  accessibilityLabel="Refresh requests"
                />
                <Pressable hitSlop={8}>
                  <Text variant="label" color="primary" weight="semibold">
                    See All
                  </Text>
                </Pressable>
              </View>
            </View>

            {requestsLoading ? (
              <SkeletonList count={2} itemHeight={140} />
            ) : requests.length > 0 ? (
              <View className="gap-3">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-3">
                        <Image
                          source={{ uri: request.image }}
                          className="w-12 h-12 rounded-full"
                        />
                        <View>
                          <Text variant="bodyLg" color="foreground" weight="semibold">
                            {request.name}
                          </Text>
                          <Text variant="caption" color="muted" className="mt-0.5">
                            {request.serviceName}
                          </Text>
                        </View>
                      </View>
                      <Badge label="Pending" tone="warning" />
                    </View>

                    <View className="mb-3">
                      <Text variant="label" color="muted">
                        {request.date} • {request.time}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <IconButton
                          icon="close"
                          onPress={() => handleDeclineRequest(request.id)}
                          size={20}
                          color={colors.emergency}
                          className="bg-emergency-soft"
                          accessibilityLabel="Decline request"
                        />
                        <IconButton
                          icon="checkmark"
                          onPress={() => handleAcceptRequest(request.id)}
                          size={20}
                          color={colors.accent}
                          className="bg-accent-soft"
                          accessibilityLabel="Accept request"
                        />
                      </View>
                      <Pressable hitSlop={8}>
                        <Text variant="label" color="primary" weight="semibold">
                          See Profile
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="notifications-outline"
                title="No pending requests"
              />
            )}
          </View>

          {/* Available Appointments */}
          <View className="mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text variant="h2" color="foreground">
                Available Appointments
              </Text>
              <IconButton
                icon="refresh"
                onPress={() => loadUnassignedAppointments()}
                size={20}
                color={colors.primary}
                accessibilityLabel="Refresh available appointments"
              />
            </View>

            {unassignedLoading ? (
              <SkeletonList count={2} itemHeight={140} />
            ) : unassignedAppointments.length > 0 ? (
              <View className="gap-3">
                {unassignedAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: appointment.image }}
                        className="w-12 h-12 rounded-full"
                      />
                      <View className="flex-1">
                        <Text variant="bodyLg" color="foreground" weight="semibold">
                          {appointment.name}
                        </Text>
                        <Badge label={appointment.role} tone="neutral" className="mt-1" />
                      </View>
                    </View>
                    <View className="mt-3 pt-3 border-t border-border">
                      <Text variant="caption" color="muted" className="mb-1">
                        Service
                      </Text>
                      <Text variant="label" color="foreground" weight="medium" className="mb-3">
                        {appointment.serviceName}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text variant="label" color="primary" weight="semibold">
                            {appointment.date}
                          </Text>
                          <Text variant="bodyLg" color="foreground" weight="headingBold" className="mt-0.5">
                            {appointment.time}
                          </Text>
                        </View>
                        <Button
                          label="Assign Me"
                          onPress={() => handleAssignSelf(appointment.id)}
                          size="sm"
                          fullWidth={false}
                          className="rounded-full px-5"
                        />
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="briefcase-outline"
                title="No available appointments"
              />
            )}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-warning-soft rounded-full items-center justify-center mb-6">
              <Ionicons name="time-outline" size={48} color={colors.warning} />
            </View>

            <Text variant="h1" color="foreground" className="mb-3 text-center">
              Account Under Review
            </Text>

            <Text variant="bodyLg" color="muted" className="text-center mb-2">
              Your account is currently being verified by our admin team.
            </Text>

            <Text variant="bodyLg" color="muted" className="text-center">
              You&apos;ll receive a notification once your account has been
              approved.
            </Text>
          </View>

          <Card elevation="none" className="bg-primary-soft border-0 mb-6 w-full">
            <View className="flex-row items-start gap-3">
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
              />
              <View className="flex-1">
                <Text variant="label" color="foreground" weight="semibold" className="mb-1">
                  What happens next?
                </Text>
                <Text variant="body" color="muted">
                  Our team is reviewing your credentials and ID verification.
                  This usually takes 24-48 hours.
                </Text>
              </View>
            </View>
          </Card>

          {/* Dev Button */}
          {__DEV__ && (
            <Button
              label="Dev: Verify via Admin Panel"
              onPress={handleDevVerify}
              variant="ghost"
              leftIcon="construct-outline"
              className="mb-4"
            />
          )}

          <Button
            label="View Profile"
            onPress={() => router.push("/profile")}
            variant="secondary"
          />
        </View>
      )}
    </>
  );
}
