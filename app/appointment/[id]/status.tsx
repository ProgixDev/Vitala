import { useCurrentUser } from "@/hooks/useCurrentUser";
import { appointmentStorage } from "@/utils/appointments";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
];

export default function AppointmentStatus() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [nurse, setNurse] = useState<User | null>(null);

  const loadAppointment = React.useCallback(async () => {
    try {
      const appointments = await appointmentStorage.getAppointments();
      const found = appointments.find((appt) => appt.id === id);
      setAppointment(found || null);

      // Load nurse info if appointment is confirmed and has a nurse assigned
      if (found && found.nurseEmail) {
        const users = await authStorage.getUsers();
        const nurseUser = users.find((user) => user.email === found.nurseEmail);
        setNurse(nurseUser || null);
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  // Handle back button - go to schedule tab instead of back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/schedule");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const handleGoBack = () => {
    router.replace("/(tabs)/schedule");
  };

  const handleContinue = async () => {
    if (!appointment) return;

    const statusOrder: Appointment["status"][] = [
      "pending",
      "confirmed",
      "on-the-way",
      "in-progress",
      "completed",
    ];

    const currentIndex = statusOrder.indexOf(appointment.status);
    if (currentIndex < statusOrder.length - 1) {
      const newStatus = statusOrder[currentIndex + 1];

      try {
        const appointments = await appointmentStorage.getAppointments();
        const updatedAppointments = appointments.map((appt) =>
          appt.id === appointment.id ? { ...appt, status: newStatus } : appt,
        );

        await appointmentStorage.saveAppointments(updatedAppointments);
        setAppointment({ ...appointment, status: newStatus });
      } catch (error) {
        console.error("Error updating appointment status:", error);
      }
    } else {
      if (
        appointment.payment.status === "pending" ||
        appointment.payment.status === "failed"
      )
        router.replace(`/appointment/${appointment.id}/payment`);
      else router.replace("/(tabs)");
    }
  };

  const getCurrentStepData = () => {
    if (!appointment) return statusSteps[0];
    return (
      statusSteps.find((step) => step.key === appointment.status) ||
      statusSteps[0]
    );
  };

  const getProgressDots = () => {
    if (!appointment) return 0;
    const statusOrder = [
      "pending",
      "confirmed",
      "on-the-way",
      "in-progress",
      "completed",
    ];
    return statusOrder.indexOf(appointment.status) + 1;
  };

  const handleNurseProfilePress = () => {
    if (nurse) {
      router.push(`/profile/${nurse.email}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#4461F2" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-base text-[#FF3B30] text-center">
          Appointment not found
        </Text>
      </View>
    );
  }

  const currentStep = getCurrentStepData();
  const progressDots = getProgressDots();

  return (
    <View className="flex-1 bg-gray-100 pt-6 px-4">
      <StatusBar hidden />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pb-5">
          <TouchableOpacity
            className="w-12 h-12 -ml-3 justify-center items-center mb-4"
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#2D3142" />
          </TouchableOpacity>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
                Processing
              </Text>
              <Text className="text-sm text-[#9E9E9E]">
                Services made for you
              </Text>
            </View>
            <Image
              source={require("@/assets/images/Logo.png")}
              className="w-[50px] h-[50px]"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Status Illustration */}
        <View className="items-center justify-center py-12">
          <View className="w-64 h-64 bg-white rounded-full items-center justify-center">
            <Ionicons
              name={
                appointment.status === "pending"
                  ? "hourglass-outline"
                  : appointment.status === "confirmed"
                    ? "checkmark-circle"
                    : appointment.status === "on-the-way"
                      ? "car-outline"
                      : appointment.status === "in-progress"
                        ? "medical"
                        : "checkmark-done-circle"
              }
              size={120}
              color="#4461F2"
            />
          </View>
        </View>

        {/* Status Title and Description */}
        <View className="items-center mb-8">
          <Text className="text-[28px] font-bold text-[#4461F2] mb-3 text-center">
            {currentStep.title}
          </Text>
          <Text className="text-base text-[#9E9E9E] text-center px-8 leading-6">
            {currentStep.description}
          </Text>
        </View>

        {/* Progress Dots */}
        <View className="flex-row justify-center items-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((dot) => (
            <View
              key={dot}
              className={`h-2 rounded-full ${
                dot <= progressDots ? "w-8 bg-[#4461F2]" : "w-2 bg-[#E0E0E0]"
              }`}
            />
          ))}
        </View>

        {/* Nurse Info Card - Only show when confirmed and nurse is assigned */}
        {currentUser?.role === "patient" &&
          appointment.status === "confirmed" &&
          nurse && (
            <TouchableOpacity
              className="bg-white rounded-[20px] p-5 mb-6 shadow-sm"
              onPress={handleNurseProfilePress}
            >
              <Text className="text-lg font-semibold text-[#2D3142] mb-4">
                Your Nurse
              </Text>
              <View className="flex-row items-center gap-3">
                <Image
                  source={{ uri: `https://i.pravatar.cc/150?u=${nurse.email}` }}
                  className="w-16 h-16 rounded-full"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-[#2D3142] mb-1">
                    {nurse.fullName}
                  </Text>
                  <Text className="text-sm text-[#9E9E9E] mb-2">
                    Professional Nurse
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text className="text-sm font-semibold text-[#2D3142]">
                      4.9
                    </Text>
                    <Text className="text-sm text-[#9E9E9E]">
                      {" "}
                      • {nurse.phoneNumber}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
              </View>
            </TouchableOpacity>
          )}

        {/* Appointment Details Card */}
        <View className="bg-white rounded-[20px] p-5 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-[#2D3142] mb-4">
            Appointment Details
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-[#9E9E9E]">Service:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
                {appointment.serviceName}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-[#9E9E9E]">Date:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
                {appointment.date}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-[#9E9E9E]">Time:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
                {appointment.time}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-[#9E9E9E]">Duration:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
                {appointment.duration}
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-sm text-[#9E9E9E]">Location:</Text>
              <View className="flex-1 items-end ml-2">
                <Text className="text-sm font-semibold text-[#2D3142] mb-1">
                  {appointment.location.label}
                </Text>
                <Text className="text-xs text-[#9E9E9E] text-right">
                  {appointment.location.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 bg-[#4461F2] py-4 rounded-[28px] justify-center items-center"
            onPress={handleContinue}
          >
            <Text className="text-lg font-semibold text-white">
              {currentStep.key !== "completed" ? (
                "Continue"
              ) : (
                <>
                  {appointment.payment.status === "completed"
                    ? "Done"
                    : "Pay Now"}
                </>
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-14 h-14 bg-white rounded-[28px] justify-center items-center border border-[#E0E0E0]">
            <Ionicons name="chatbubble-outline" size={24} color="#4461F2" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
