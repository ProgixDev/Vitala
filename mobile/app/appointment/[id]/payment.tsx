import { api } from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { getServiceNameById } from "@/utils/services";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type PaymentMethodType = "credit_card" | null;

export default function PaymentPage() {
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(null);
  const [processing, setProcessing] = useState(false);

  const loadAppointment = useCallback(async () => {
    try {
      const { accessToken } = await authStorage.getTokens();
      if (!accessToken) {
        console.error("No access token");
        setLoading(false);
        return;
      }

      const result = await api.getAppointmentById(accessToken, id as string);
      if (result.success) {
        const appointmentData = result.data;

        const formattedAppointment = {
          ...appointmentData,
          id: appointmentData._id || appointmentData.id,
          serviceName:
            appointmentData.serviceName ||
            getServiceNameById(appointmentData.service) ||
            appointmentData.service ||
            "Unknown Service",
          date: appointmentData.scheduledDate
            ? new Date(appointmentData.scheduledDate).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )
            : "",
          time: appointmentData.scheduledTime?.start || "",
          duration: appointmentData.duration
            ? `${appointmentData.duration} minutes`
            : "Unknown duration",
          location: appointmentData.location || {},
          status: appointmentData.status,
          payment: appointmentData.payment || {
            status: "pending",
            amount: appointmentData.price || 0,
            currency: "USD",
          },
        };

        setAppointment(formattedAppointment);
        if (formattedAppointment.payment.method) {
          setSelectedMethod(formattedAppointment.payment.method);
        }
      } else {
        console.error("Failed to load appointment:", result);
        setAppointment(null);
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
      setAppointment(null);
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

  const handleProcessPayment = async () => {
    console.log("Processing payment...");
    console.log("Selected method:", selectedMethod);
    console.log("Appointment ID:", appointment?.id);
    console.log("Appointment _ID:", (appointment as any)?._id);
    console.log("Payment amount:", appointment?.payment?.amount);

    if (!selectedMethod) {
      Alert.alert("Payment Method Required", "Please select a payment method");
      return;
    }

    if (!appointment) {
      console.log("No appointment found");
      return;
    }

    if (!appointment.id) {
      console.error("Appointment ID is missing!");
      Alert.alert("Error", "Appointment ID is missing. Please try again.");
      return;
    }

    setProcessing(true);

    try {
      const { accessToken } = await authStorage.getTokens();
      console.log("Access token:", !!accessToken);

      if (!accessToken) {
        Alert.alert("Authentication Error", "Please log in again");
        setProcessing(false);
        return;
      }

      const paymentData = {
        appointmentId: appointment.id,
        paymentMethod: selectedMethod,
        amount: appointment.payment.amount,
      };

      console.log("Calling payment API with data:", paymentData);
      const result = await api.processPayment(accessToken, paymentData);

      console.log("Payment result:", result);

      if (result.success) {
        console.log("Payment successful, reloading appointment...");
        // Reload appointment to show receipt
        await loadAppointment();
      } else {
        Alert.alert("Payment Failed", result.message || "Please try again");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Payment Failed", "Please try again");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      "Download Receipt",
      "Receipt download functionality will be implemented",
    );
  };

  const handleBookAnother = () => {
    router.replace("/(tabs)/schedule");
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

  const isPaymentCompleted = appointment.payment.status === "completed";

  // Receipt View
  if (isPaymentCompleted) {
    return (
      <View className="flex-1 bg-white pt-6 px-4">
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
            <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
              Payment Successful
            </Text>
          </View>

          {/* Success Card */}
          <View className="bg-[#E8EBF9] rounded-3xl p-8 mb-6">
            {/* Success Icon */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 bg-[#B8C5E8] rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark" size={50} color="#4461F2" />
              </View>
              <Text className="text-xl font-bold text-[#2D3142]">
                Payment Successful
              </Text>
            </View>

            {/* Receipt Details */}
            <View className="space-y-4">
              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">Reference</Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {appointment.payment.reference}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">Date</Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {new Date(
                    appointment.payment.transactionDate!,
                  ).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">Time</Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {new Date(
                    appointment.payment.transactionDate!,
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">
                  Service Duration
                </Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {appointment.duration}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">
                  Payment Method
                </Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  Credit Card
                </Text>
              </View>

              <View className="h-px bg-[#D1D5DB] my-2" />

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">Total</Text>
                <Text className="text-xl font-bold text-[#2D3142]">
                  {appointment.payment.amount}
                  {appointment.payment.currency === "USD" ? "$" : "€"}
                </Text>
              </View>
            </View>

            {/* Download Button */}
            <TouchableOpacity
              className="bg-white py-4 rounded-2xl justify-center items-center mt-6 shadow-sm"
              onPress={handleDownloadReceipt}
            >
              <Text className="text-base font-semibold text-[#4461F2]">
                Download Receipt (PDF)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Book Another Appointment */}
          <TouchableOpacity
            className="bg-[#4461F2] py-4 rounded-[28px] justify-center items-center shadow-lg"
            onPress={handleBookAnother}
          >
            <Text className="text-lg font-semibold text-white">
              Back to Schedule
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Payment Method Selection View
  return (
    <View className="flex-1 bg-white pt-6 px-4">
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

        {/* Payment Summary */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-[#2D3142] mb-4">
            Payment Summary
          </Text>
          <View className="bg-[#F5F7FA] rounded-2xl p-5">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Service:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.serviceName}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Date:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.date}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Time:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.time}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Duration:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.duration}
              </Text>
            </View>
            <View className="h-px bg-[#D1D5DB] my-3" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-lg font-bold text-[#2D3142]">
                Total Amount:
              </Text>
              <Text className="text-2xl font-bold text-[#4461F2]">
                {appointment.payment.amount}
                {appointment.payment.currency === "USD" ? "$" : "€"}
              </Text>
            </View>
          </View>
        </View>

        {/* Credit Card Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-[#2D3142]">
              Credit card
            </Text>
            <TouchableOpacity onPress={() => setSelectedMethod("credit_card")}>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedMethod === "credit_card"
                    ? "border-[#4461F2]"
                    : "border-[#D1D5DB]"
                }`}
              >
                {selectedMethod === "credit_card" && (
                  <View className="w-3 h-3 rounded-full bg-[#4461F2]" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Credit Card Display */}
          <TouchableOpacity
            className="bg-linear-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 mb-4 shadow-2xl border border-gray-700"
            onPress={() => setSelectedMethod("credit_card")}
          >
            {/* Card Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="w-12 h-8 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-md mr-3 flex-row items-center justify-center">
                  <Text className="text-black text-xs font-bold">VISA</Text>
                </View>
                <Ionicons name="wifi" size={20} color="white" />
              </View>
              <View className="flex-row items-center">
                <Ionicons name="card" size={20} color="white" />
              </View>
            </View>

            {/* Card Number */}
            <Text className="text-white text-xl font-mono mb-6 tracking-wider">
              **** **** **** 1234
            </Text>

            {/* Card Footer */}
            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-gray-300 text-xs mb-1">Card Holder</Text>
                <Text className="text-white text-sm font-semibold">
                  YOUR NAME
                </Text>
              </View>
              <View>
                <Text className="text-gray-300 text-xs mb-1">Expires</Text>
                <Text className="text-white text-sm font-semibold">MM/YY</Text>
              </View>
              <View className="w-16 h-10 bg-linear-to-r from-blue-500 to-blue-600 rounded-md items-center justify-center">
                <Text className="text-white text-xs font-bold">VISA</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Add Card Button */}
          <TouchableOpacity className="border-2 border-dashed border-[#4461F2] py-4 rounded-2xl justify-center items-center">
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={24} color="#4461F2" />
              <Text className="text-base font-semibold text-[#4461F2] ml-2">
                Add New Card
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Process Payment Button */}
        <TouchableOpacity
          className={`py-4 rounded-[28px] justify-center items-center shadow-lg mt-5 ${
            processing || !selectedMethod ? "bg-[#B8C5E8]" : "bg-[#4461F2]"
          }`}
          onPress={handleProcessPayment}
          disabled={processing || !selectedMethod}
        >
          {processing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-lg font-semibold text-white">Pay Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
