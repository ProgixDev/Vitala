import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { getServiceNameById } from "@/utils/services";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

export default function AppointmentStatus() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
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
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#4461F2" />
      </View>
    );
  }

  const currentStep = getCurrentStepData();
  const progressDots = getProgressDots();

  if (!appointment)
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-lg text-center text-gray-500">Loading</Text>
      </View>
    );

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
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Status Illustration */}

        {/* Pending confirmation indicator */}
        {appointment?.status === "pending" &&
          currentUser?.userType === "patient" && (
            <View className="bg-[#FFF8E1] rounded-xl p-3 mb-4 border border-[#FFD54F]">
              <Text className="text-sm font-semibold text-[#FF9800]">
                Waiting for confirmation
              </Text>
              <Text className="text-xs text-[#9E9E9E] mt-1">
                A nurse will confirm this appointment. We&apos;ll notify you
                once it&apos;s confirmed.
              </Text>
            </View>
          )}

        <View className="items-center justify-center py-12">
          <View className="w-64 h-64 bg-white rounded-full items-center justify-center">
            <Ionicons
              name={
                appointment?.status === "pending"
                  ? "hourglass-outline"
                  : appointment?.status === "confirmed"
                    ? "checkmark-circle"
                    : appointment?.status === "on-the-way"
                      ? "car-outline"
                      : appointment?.status === "in-progress"
                        ? "medical"
                        : appointment?.status === "cancelled"
                          ? "close-circle"
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
        {currentUser?.userType === "patient" &&
          appointment?.status === "confirmed" &&
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
                {appointment.service}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-[#9E9E9E]">Date:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
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
              <Text className="text-sm text-[#9E9E9E]">Time:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
                {appointment?.scheduledTime.start}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-[#9E9E9E]">Duration:</Text>
              <Text className="text-sm font-semibold text-[#2D3142]">
                {appointment?.duration} minutes
              </Text>
            </View>
            <View className="flex-row justify-between items-start">
              <Text className="text-sm text-[#9E9E9E]">Location:</Text>
              <View className="flex-1 items-end ml-2">
                <Text className="text-sm font-semibold text-[#2D3142] mb-1">
                  {appointment?.location?.label || "N/A"}
                </Text>
                <Text className="text-xs text-[#9E9E9E] text-right">
                  {appointment?.location?.address || ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          {currentUser?.userType === "patient" &&
            (appointment?.status === "pending" ||
              appointment?.status === "confirmed") && (
              <TouchableOpacity
                className="flex-1 py-4 rounded-[28px] justify-center items-center bg-red-500"
                onPress={handleCancel}
              >
                <Text className="text-lg font-semibold text-white">Cancel</Text>
              </TouchableOpacity>
            )}
          <TouchableOpacity
            className={`flex-1 py-4 rounded-[28px] justify-center items-center ${
              currentUser?.userType === "patient" &&
              (appointment?.status === "pending" ||
                appointment?.status === "cancelled")
                ? "bg-gray-300"
                : "bg-[#4461F2]"
            }`}
            onPress={handleContinue}
            disabled={
              currentUser?.userType === "patient" &&
              (appointment?.status === "pending" ||
                appointment?.status === "cancelled")
            }
          >
            <Text
              className={`text-lg font-semibold ${currentUser?.userType === "patient" && (appointment?.status === "pending" || appointment?.status === "cancelled") ? "text-gray-600" : "text-white"}`}
            >
              {currentStep.key !== "completed" ? (
                "Continue"
              ) : (
                <>
                  {appointment?.payment?.status === "completed"
                    ? "Go to Payment Details"
                    : "Pay Now"}
                </>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
