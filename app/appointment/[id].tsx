import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { authStorage, Appointment } from "@/utils/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AppointmentDetails() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      const appointments = await authStorage.getAppointments();
      const found = appointments.find((appt) => appt.id === id);
      setAppointment(found || null);
    } catch (error) {
      console.error("Error loading appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleConfirmBooking = () => {
    // Handle payment/confirmation
    router.replace("/(tabs)");
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
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center"
            onPress={handleGoBack}
          >
            <Ionicons name="chevron-back" size={24} color="#2D3142" />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <Text className="text-xl font-semibold text-[#2D3142]">
              Payment Method
            </Text>
            <Text className="text-sm text-[#9E9E9E] mt-0.5">
              Choose your method
            </Text>
          </View>
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-[50px] h-[50px]"
            resizeMode="contain"
          />
        </View>

        {/* About the Service */}
        <View className="mb-6 px-5">
          <Text className="text-lg font-semibold text-[#2D3142] mb-4">
            About the service
          </Text>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Service:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.serviceName}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Appointment */}
        <View className="mb-6 px-5">
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
                30Min
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Information */}
        <View className="mb-6 px-5">
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
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Age:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                Not specified
              </Text>
            </View>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity
          className="bg-[#4461F2] mx-5 py-4 rounded-[28px] justify-center items-center shadow-lg mt-5"
          onPress={handleConfirmBooking}
        >
          <Text className="text-lg font-semibold text-white">
            Book Appointment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
