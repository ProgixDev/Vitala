import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Appointment, appointmentStorage } from "@/utils/appointments";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AppointmentDetails() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAppointment = useCallback(async () => {
    try {
      const appointments = await appointmentStorage.getAppointments();
      const found = appointments.find((appt) => appt.id === id);
      setAppointment(found || null);
    } catch (error) {
      console.error("Error loading appointment:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handleGoBack = () => {
    router.back();
  };

  const handleConfirmBooking = () => {
    // Navigate to payment page
    router.push(`/appointment/${id}/payment`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#4461F2" />
      </View>
    );
  }

  if (!appointment || !currentUser) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-base text-[#FF3B30] text-center">
          Appointment not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-6 px-4">
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
          <View>
            <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
              Payment Method
            </Text>
            <Text className="text-sm text-[#9E9E9E]">Choose your method</Text>
          </View>
        </View>

        {/* About the Service */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-[#2D3142] mb-4">
            About the service
          </Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-[15px] text-[#9E9E9E]">Service:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.serviceName}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Appointment */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-[#2D3142]">
              Schedule appointment
            </Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={24} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Date:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.date}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Time:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.time}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Duration:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.duration}
              </Text>
            </View>
            <View className="flex-row justify-between items-start py-3">
              <Text className="text-[15px] text-[#9E9E9E]">Location:</Text>
              <View className="flex-1 items-end ml-2">
                <Text className="text-[15px] font-semibold text-[#2D3142] mb-1">
                  {appointment.locationLabel}
                </Text>
                <Text className="text-[13px] text-[#9E9E9E] text-right">
                  {appointment.location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Patient Information */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-[#2D3142]">
              Patient Informations
            </Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={24} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Name:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {currentUser.fullName}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Gender:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                Not specified
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-[15px] text-[#9E9E9E]">Age:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                Not specified
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-[#2D3142] mb-4">
            Payment Details
          </Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Service Fee:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.payment.amount}
                {appointment.payment.currency === "USD" ? "$" : "€"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-[15px] text-[#9E9E9E]">
                Payment Status:
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  appointment.payment.status === "completed"
                    ? "bg-[#32CD32]/10"
                    : appointment.payment.status === "pending"
                      ? "bg-[#FFA500]/10"
                      : appointment.payment.status === "failed"
                        ? "bg-[#FF3B30]/10"
                        : "bg-[#4461F2]/10"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    appointment.payment.status === "completed"
                      ? "text-[#32CD32]"
                      : appointment.payment.status === "pending"
                        ? "text-[#FFA500]"
                        : appointment.payment.status === "failed"
                          ? "text-[#FF3B30]"
                          : "text-[#4461F2]"
                  }`}
                >
                  {appointment.payment.status === "completed"
                    ? "Paid"
                    : appointment.payment.status === "pending"
                      ? "Payment Pending"
                      : appointment.payment.status === "failed"
                        ? "Payment Failed"
                        : "Processing"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Continue to Payment Button - Only show if not paid */}
        {appointment.payment.status !== "completed" && (
          <TouchableOpacity
            className="bg-[#4461F2] py-4 rounded-[28px] justify-center items-center shadow-lg mt-5"
            onPress={handleConfirmBooking}
          >
            <Text className="text-lg font-semibold text-white">
              Continue to Payment
            </Text>
          </TouchableOpacity>
        )}

        {/* View Receipt Button - Only show if paid */}
        {appointment.payment.status === "completed" && (
          <TouchableOpacity
            className="bg-[#32CD32] py-4 rounded-[28px] justify-center items-center shadow-lg mt-5"
            onPress={handleConfirmBooking}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="receipt-outline" size={20} color="white" />
              <Text className="text-lg font-semibold text-white">
                View Receipt
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
