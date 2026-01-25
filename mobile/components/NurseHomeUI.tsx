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
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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
  const { currentUser, logout } = useCurrentUser();
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
      // In a real app, this would call an API endpoint to update nurse status
      // For dev purposes, we'll just show a toast and refresh
      Toast.show({
        type: "info",
        text1: "Dev Mode",
        text2: "Account verification should be done via admin panel",
      });

      // Force logout and re-login to refresh user data
      await logout();
      router.replace("/signin");
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
              <View className="flex-1">
                <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
                  Hi, {currentUser?.fullName.split(" ")[0] || "Nurse"}
                </Text>
                <Text className="text-sm text-[#9E9E9E]">Welcome Back</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/sos")}
                className="bg-[#FF3B30] rounded-full px-4 py-2 flex-row items-center gap-2"
              >
                <Text className="text-white text-xs font-semibold">SOS</Text>
                <View className="bg-white rounded-full px-2 py-0.5">
                  <Text className="text-[#FF3B30] text-xs font-bold">
                    {requests.length.toString().padStart(2, "0")}
                  </Text>
                </View>
                <Text className="text-white text-xs font-semibold">
                  Emergency Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View className="mb-12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-[#2D3142]">
                Upcoming Appointments
              </Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={() => loadUpcomingAppointments()}>
                  <Ionicons name="refresh" size={20} color="#4461F2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/schedule")}>
                  <Text className="text-sm text-[#4461F2] font-medium">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View className="bg-white rounded-[20px] p-4 shadow-sm items-center justify-center h-32">
                <ActivityIndicator size="large" color="#4461F2" />
              </View>
            ) : upcomingAppointments.length > 0 ? (
              <View className="gap-3">
                {upcomingAppointments.map((appointment) => (
                  <View
                    key={appointment.id}
                    className="bg-white rounded-[20px] p-4 shadow-sm"
                  >
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: appointment.image }}
                        className="w-12 h-12 rounded-full"
                      />
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-[#2D3142] mb-0.5">
                          {appointment.name}
                        </Text>
                        <Text className="text-xs text-[#9E9E9E]">
                          {appointment.role}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-3 pt-3 border-t border-gray-100">
                      <Text className="text-xs text-[#9E9E9E] mb-1">
                        Service
                      </Text>
                      <Text className="text-sm font-medium text-[#2D3142] mb-3">
                        {appointment.serviceName}
                      </Text>
                      <View className="flex-row justify-between">
                        <View>
                          <Text className="text-sm font-semibold text-[#4461F2] mb-0.5">
                            {appointment.date}
                          </Text>
                        </View>
                        <Text className="text-base font-bold text-[#2D3142]">
                          {appointment.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-white rounded-[20px] p-4 shadow-sm items-center justify-center h-32">
                <Ionicons name="calendar-outline" size={32} color="#9E9E9E" />
                <Text className="text-sm text-[#9E9E9E] mt-2">
                  No upcoming appointments
                </Text>
              </View>
            )}
          </View>

          {/* Motivational Banner */}
          <View className="bg-[#4461F2] rounded-[20px] p-5 pr-0 pb-0 overflow-hidden mb-12 flex-row">
            <View className="flex-1">
              <Text className="text-xs text-white mb-3 opacity-90">
                Your Patients Rely On You
              </Text>
              <Text className="text-2xl font-bold text-white leading-12">
                Make Every Visit
              </Text>
              <Text className="text-2xl font-bold text-white leading-12">
                Count
              </Text>
              <View className="flex-row items-center mt-4 gap-3">
                <View className="flex-row -ml-2">
                  <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=1" }}
                    className="w-8 h-8 rounded-full border-2 border-[#4461F2] -ml-2"
                  />
                  <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=2" }}
                    className="w-8 h-8 rounded-full border-2 border-[#4461F2] -ml-2"
                  />
                  <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                    className="w-8 h-8 rounded-full border-2 border-[#4461F2] -ml-2"
                  />
                </View>
                <View>
                  <Text className="text-sm font-bold text-white">30,000+</Text>
                  <Text className="text-xs text-white opacity-80">
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
          </View>

          {/* Your Requests */}
          <View className="mb-12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-[#2D3142]">
                Your Requests
              </Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={() => loadRequests()}>
                  <Ionicons name="refresh" size={20} color="#4461F2" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-sm text-[#4461F2] font-medium">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {requestsLoading ? (
              <View className="bg-white rounded-[20px] p-4 shadow-sm items-center justify-center h-32">
                <ActivityIndicator size="large" color="#4461F2" />
              </View>
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <View
                  key={request.id}
                  className="bg-white rounded-[20px] p-4 shadow-sm mb-3"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: request.image }}
                        className="w-12 h-12 rounded-full"
                      />
                      <View>
                        <Text className="text-base font-semibold text-[#2D3142] mb-0.5">
                          {request.name}
                        </Text>
                        <Text className="text-xs text-[#9E9E9E]">
                          {request.serviceName}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm text-[#9E9E9E]">
                      {request.date} • {request.time}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        onPress={() => handleDeclineRequest(request.id)}
                        className="w-10 h-10 bg-[#FEE2E2] rounded-full items-center justify-center"
                      >
                        <Ionicons name="close" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleAcceptRequest(request.id)}
                        className="w-10 h-10 bg-[#D1FAE5] rounded-full items-center justify-center"
                      >
                        <Ionicons name="checkmark" size={20} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                      <Text className="text-sm text-[#4461F2] font-medium">
                        See Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white rounded-[20px] p-4 shadow-sm items-center justify-center h-32">
                <Ionicons
                  name="notifications-outline"
                  size={32}
                  color="#9E9E9E"
                />
                <Text className="text-sm text-[#9E9E9E] mt-2">
                  No pending requests
                </Text>
              </View>
            )}
          </View>

          {/* Available Appointments */}
          <View className="mb-12">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-[#2D3142]">
                Available Appointments
              </Text>
              <TouchableOpacity onPress={() => loadUnassignedAppointments()}>
                <Ionicons name="refresh" size={20} color="#4461F2" />
              </TouchableOpacity>
            </View>

            {unassignedLoading ? (
              <View className="bg-white rounded-[20px] p-4 shadow-sm items-center justify-center h-32">
                <ActivityIndicator size="large" color="#4461F2" />
              </View>
            ) : unassignedAppointments.length > 0 ? (
              unassignedAppointments.map((appointment) => (
                <View
                  key={appointment.id}
                  className="bg-white rounded-[20px] p-4 shadow-sm mb-3"
                >
                  <View className="flex-row items-center gap-3">
                    <Image
                      source={{ uri: appointment.image }}
                      className="w-12 h-12 rounded-full"
                    />
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-[#2D3142] mb-0.5">
                        {appointment.name}
                      </Text>
                      <Text className="text-xs text-[#9E9E9E]">
                        {appointment.role}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs text-[#9E9E9E] mb-1">Service</Text>
                    <Text className="text-sm font-medium text-[#2D3142] mb-3">
                      {appointment.serviceName}
                    </Text>
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-sm font-semibold text-[#4461F2] mb-0.5">
                          {appointment.date}
                        </Text>
                        <Text className="text-base font-bold text-[#2D3142]">
                          {appointment.time}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAssignSelf(appointment.id)}
                        className="bg-[#4461F2] rounded-full px-4 py-2"
                      >
                        <Text className="text-white text-sm font-semibold">
                          Assign Me
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white rounded-[20px] p-4 shadow-sm items-center justify-center h-32">
                <Ionicons name="briefcase-outline" size={32} color="#9E9E9E" />
                <Text className="text-sm text-[#9E9E9E] mt-2">
                  No available appointments
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-[#FEF3C7] rounded-full items-center justify-center mb-6">
              <Ionicons name="time-outline" size={48} color="#F59E0B" />
            </View>

            <Text className="text-2xl font-bold text-[#2D3142] mb-3 text-center">
              Account Under Review
            </Text>

            <Text className="text-base text-[#9E9E9E] text-center mb-2 leading-6">
              Your account is currently being verified by our admin team.
            </Text>

            <Text className="text-base text-[#9E9E9E] text-center leading-6">
              You&apos;ll receive a notification once your account has been
              approved.
            </Text>
          </View>

          <View className="bg-[#EFF6FF] rounded-[20px] p-4 mb-6 w-full">
            <View className="flex-row items-start gap-3">
              <Ionicons name="information-circle" size={24} color="#4461F2" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#2D3142] mb-1">
                  What happens next?
                </Text>
                <Text className="text-sm text-[#9E9E9E] leading-5">
                  Our team is reviewing your credentials and ID verification.
                  This usually takes 24-48 hours.
                </Text>
              </View>
            </View>
          </View>

          {/* Dev Button */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={handleDevVerify}
              className="bg-[#F97316] rounded-[20px] px-6 py-3 w-full items-center mb-4"
            >
              <Text className="text-white font-semibold text-base">
                🔧 Dev: Verify via Admin Panel
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="border-2 border-[#4461F2] rounded-[20px] px-6 py-3 w-full items-center"
          >
            <Text className="text-[#4461F2] font-semibold text-base">
              View Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
