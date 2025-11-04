import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { appointmentStorage } from "@/utils/appointments";
import { authStorage } from "@/utils/auth";
import { router } from "expo-router";
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
  const { currentUser } = useCurrentUser();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentItem[]
  >([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const loadUpcomingAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const allAppointments = await appointmentStorage.getAppointments();

      // Filter for appointments assigned to this nurse that are confirmed
      const sortedAppointments = allAppointments
        .filter((appt) => {
          return (
            appt.status === "confirmed" &&
            appt.nurseEmail === currentUser?.email
          );
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

      const users = await authStorage.getUsers();

      const appointmentItems: AppointmentItem[] = sortedAppointments.map(
        (appt) => {
          const patient = users.find((user) => user.email === appt.userEmail);
          return {
            id: appt.id,
            name: patient?.fullName || "Unknown Patient",
            role: "PATIENT",
            date: appt.date,
            time: appt.time,
            image: `https://i.pravatar.cc/150?u=${appt.userEmail}`,
            serviceName: appt.serviceName,
            userEmail: appt.userEmail,
          };
        },
      );

      setUpcomingAppointments(appointmentItems);
    } catch (error) {
      console.error("Error loading upcoming appointments:", error);
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  const loadRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const allAppointments = await appointmentStorage.getAppointments();

      // Filter for pending appointments without a nurse assigned
      const pendingAppointments = allAppointments
        .filter((appt) => appt.status === "pending" && !appt.nurseEmail)
        .sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

      const users = await authStorage.getUsers();

      const requestItems: RequestItem[] = pendingAppointments.map((appt) => {
        const patient = users.find((user) => user.email === appt.userEmail);
        return {
          id: appt.id,
          name: patient?.fullName || "Unknown Patient",
          role: "PATIENT",
          date: appt.date,
          time: appt.time,
          image: `https://i.pravatar.cc/150?u=${appt.userEmail}`,
          serviceName: appt.serviceName,
          userEmail: appt.userEmail,
        };
      });

      setRequests(requestItems);
    } catch (error) {
      console.error("Error loading requests:", error);
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadUpcomingAppointments(), loadRequests()]);
  }, [loadUpcomingAppointments, loadRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcceptRequest = async (appointmentId: string) => {
    try {
      const allAppointments = await appointmentStorage.getAppointments();
      const appointmentIndex = allAppointments.findIndex(
        (appt) => appt.id === appointmentId,
      );

      if (appointmentIndex !== -1) {
        allAppointments[appointmentIndex].status = "confirmed";
        allAppointments[appointmentIndex].nurseEmail = currentUser?.email;
        await appointmentStorage.saveAppointments(allAppointments);

        // Reload data
        await loadData();
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (appointmentId: string) => {
    try {
      await appointmentStorage.deleteAppointment(appointmentId);
      await loadRequests();
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  const handleDevVerify = async () => {
    try {
      if (!currentUser?.email) return;

      const users = await authStorage.getUsers();
      const userIndex = users.findIndex(
        (user) => user.email === currentUser.email,
      );

      if (userIndex !== -1) {
        users[userIndex].status = "verified";
        // Manually save updated users array
        await AsyncStorage.setItem("users", JSON.stringify(users));

        await authStorage.setCurrentUser({
          ...currentUser,
          status: "verified",
        });

        Toast.show({
          type: "success",
          text1: "Account Verified",
          text2: "Your account has been verified (dev mode)",
        });

        // Force a refresh by reloading data
        await loadData();
        router.push("/(tabs)");
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to verify account",
      });
    }
  };

  return (
    <>
      {currentUser?.status === "verified" ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="py-5">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
                  Hi, {currentUser?.fullName.split(" ")[0] || "Amelia"}
                </Text>
                <Text className="text-sm text-[#9E9E9E]">Welcome Back</Text>
              </View>
              <TouchableOpacity className="bg-[#FF3B30] rounded-full px-4 py-2 flex-row items-center gap-2">
                <Text className="text-white text-xs font-semibold">SOS</Text>
                <View className="bg-white rounded-full px-2 py-0.5">
                  <Text className="text-[#FF3B30] text-xs font-bold">02</Text>
                </View>
                <Text className="text-white text-xs font-semibold">
                  Emergency Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upcoming Appointments */}
          <View className="mb-[30px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-[#2D3142]">
                Upcoming Appointments
              </Text>
              <TouchableOpacity onPress={() => router.push("/schedule")}>
                <Text className="text-sm text-[#4461F2] font-medium">
                  See All
                </Text>
              </TouchableOpacity>
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
          <View className="bg-[#4461F2] rounded-[20px] p-5 pr-0 pb-0 overflow-hidden mb-[30px] flex-row">
            <View className="flex-1">
              <Text className="text-xs text-white mb-3 opacity-90">
                Your Patients Rely On You
              </Text>
              <Text className="text-2xl font-bold text-white leading-[30px]">
                Make Every Visit
              </Text>
              <Text className="text-2xl font-bold text-white leading-[30px]">
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
              className="h-[180px] relative -right-2.5 bottom-0"
              resizeMode="contain"
            />
          </View>

          {/* Your Requests */}
          <View className="mb-[30px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-[#2D3142]">
                Your Requests
              </Text>
              <TouchableOpacity>
                <Text className="text-sm text-[#4461F2] font-medium">
                  See All
                </Text>
              </TouchableOpacity>
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
          <TouchableOpacity
            onPress={handleDevVerify}
            className="bg-[#F97316] rounded-[20px] px-6 py-3 w-full items-center mb-4"
          >
            <Text className="text-white font-semibold text-base">
              🔧 Dev: Verify Account
            </Text>
          </TouchableOpacity>

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
