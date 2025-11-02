import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { appointmentStorage, Appointment, Payment } from "@/utils/appointments";

type PaymentMethodType = "credit_card" | "paypal" | null;

export default function PaymentPage() {
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(null);
  const [processing, setProcessing] = useState(false);

  const loadAppointment = useCallback(async () => {
    try {
      const appointments = await appointmentStorage.getAppointments();
      const found = appointments.find((appt) => appt.id === id);
      setAppointment(found || null);
      if (found?.payment.method) {
        setSelectedMethod(found.payment.method);
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

  const handleGoBack = () => {
    router.back();
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      Alert.alert("Payment Method Required", "Please select a payment method");
      return;
    }

    if (!appointment) return;

    setProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        const updatedPayment: Payment = {
          ...appointment.payment,
          status: "completed",
          method: selectedMethod,
          transactionDate: new Date().toISOString(),
          cardDetails:
            selectedMethod === "credit_card"
              ? {
                  cardNumber: "**** **** **** 9010",
                  cardHolder: "GULZAR AHMED",
                  expiryDate: "12/20",
                }
              : undefined,
        };

        await appointmentStorage.updateAppointmentPayment(
          appointment.id,
          updatedPayment,
        );

        // Reload appointment to show receipt
        await loadAppointment();
        setProcessing(false);
      } catch (error) {
        console.error("Error processing payment:", error);
        setProcessing(false);
        Alert.alert("Payment Failed", "Please try again");
      }
    }, 2000);
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      "Download Receipt",
      "Receipt download functionality will be implemented",
    );
  };

  const handleBookAnother = () => {
    router.replace("/(tabs)");
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
              Success payment
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
                Paiement avec succès
              </Text>
            </View>

            {/* Receipt Details */}
            <View className="space-y-4">
              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">
                  Référencement
                </Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {appointment.payment.reference}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">
                  Date et heure
                </Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {new Date(
                    appointment.payment.transactionDate!,
                  ).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  ,{" "}
                  {new Date(
                    appointment.payment.transactionDate!,
                  ).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">
                  Temps du service
                </Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {appointment.duration}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">
                  Méthode de paiement
                </Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {appointment.payment.method === "credit_card"
                    ? "Mastercard"
                    : "Paypal"}
                </Text>
              </View>

              <View className="h-px bg-[#D1D5DB] my-2" />

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">Tarification</Text>
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
                Télécharger la facture en PDF
              </Text>
            </TouchableOpacity>
          </View>

          {/* Book Another Appointment */}
          <TouchableOpacity
            className="bg-[#4461F2] py-4 rounded-[28px] justify-center items-center shadow-lg"
            onPress={handleBookAnother}
          >
            <Text className="text-lg font-semibold text-white">
              Book Appointment
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
              <Text className="text-[15px] text-[#6B7280]">Date & Time:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.date}, {appointment.time}
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
            className="rounded-3xl p-6 mb-4 shadow-lg"
            style={{
              backgroundColor: "#1E3A8A",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={() => setSelectedMethod("credit_card")}
          >
            {/* Card Header */}
            <View className="flex-row justify-between items-center mb-8">
              <View className="flex-row items-center">
                <View className="w-10 h-8 bg-[#FFD700] rounded-md mr-2" />
                <Ionicons name="wifi" size={24} color="white" />
              </View>
              <Text className="text-white text-lg font-bold">
                Visa Platinum
              </Text>
            </View>

            {/* Card Number */}
            <Text className="text-white text-2xl font-bold mb-6 tracking-widest">
              *000 123* 5518 9010
            </Text>

            {/* Card Footer */}
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/60 text-xs mb-1">Card Holder</Text>
                <Text className="text-white text-sm font-semibold">
                  GULZAR AHMED
                </Text>
              </View>
              <View>
                <Text className="text-white/60 text-xs mb-1">Expires</Text>
                <Text className="text-white text-sm font-semibold">12/20</Text>
              </View>
              <Text className="text-white text-3xl font-bold">VISA</Text>
            </View>
          </TouchableOpacity>

          {/* Add Card Button */}
          <TouchableOpacity className="border-2 border-dashed border-[#4461F2] py-4 rounded-2xl justify-center items-center">
            <View className="flex-row items-center">
              <Ionicons name="add-circle-outline" size={24} color="#4461F2" />
              <Text className="text-base font-semibold text-[#4461F2] ml-2">
                Credit Card
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Other Methods Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-[#2D3142] mb-4">
            Other methods
          </Text>

          {/* PayPal Option */}
          <TouchableOpacity
            className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex-row items-center justify-between shadow-sm"
            onPress={() => setSelectedMethod("paypal")}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-[#F5F7FA] rounded-xl items-center justify-center mr-4">
                <Ionicons name="logo-paypal" size={28} color="#003087" />
              </View>
              <Text className="text-base font-semibold text-[#2D3142]">
                Paypal
              </Text>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedMethod === "paypal"
                  ? "border-[#4461F2]"
                  : "border-[#D1D5DB]"
              }`}
            >
              {selectedMethod === "paypal" && (
                <View className="w-3 h-3 rounded-full bg-[#4461F2]" />
              )}
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
            <Text className="text-lg font-semibold text-white">
              Process Payment
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
