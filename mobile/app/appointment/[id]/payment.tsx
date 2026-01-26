import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
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

type CardDetails = {
  complete: boolean;
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
};

export default function PaymentPage() {
  const { currentUser } = useCurrentUser();
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const { confirmPayment } = useConfirmPayment();

  const loadAppointment = useCallback(async () => {
    setLoading(true);
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

        // Only create PaymentIntent for appointments that can be paid
        // Skip pending appointments - they need to be confirmed first
        const canCreateIntent =
          result.data.payment?.status !== "completed" &&
          !["pending", "cancelled", "declined"].includes(result.data.status);

        if (canCreateIntent) {
          const intentResult = await api.createPaymentIntent(
            currentUser.token,
            { appointmentId: result.data._id },
          );
          if (intentResult.success) {
            setClientSecret(intentResult.clientSecret);
            setPaymentIntentId(intentResult.paymentIntentId);
          } else {
            console.error("Failed to create payment intent:", intentResult);
          }
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
  }, [id, currentUser?.token]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleProcessPayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Card Required", "Please enter your complete card details");
      return;
    }

    if (!appointment) {
      return;
    }

    if (!clientSecret) {
      Alert.alert("Error", "Payment not initialized. Please try again.");
      return;
    }

    setProcessing(true);

    try {
      if (!currentUser?.token) {
        Alert.alert("Authentication Error", "Please log in again");
        return;
      }

      // Confirm payment with Stripe
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            email: currentUser.email,
            name: currentUser.fullName,
          },
        },
      });

      if (error) {
        console.error("Stripe payment error:", error);
        Alert.alert(
          "Payment Failed",
          error.message || "Please check your card details and try again",
        );
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntentId) {
        // Confirm with backend
        const confirmResult = await api.confirmStripePayment(
          currentUser.token,
          { paymentIntentId },
        );

        if (confirmResult.success) {
          // Reload appointment to show receipt
          await loadAppointment();
        } else {
          Alert.alert(
            "Payment Verification Failed",
            confirmResult.message || "Please contact support",
          );
        }
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

  const isPaymentCompleted = appointment.payment?.status === "completed";
  const canPay =
    currentUser?.userType === "patient" &&
    !["cancelled", "declined", "pending"].includes(appointment.status);

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
                  {appointment.payment?.reference}
                </Text>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-[15px] text-[#6B7280]">Date</Text>
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  {new Date(
                    appointment.payment?.transactionDate!,
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
                    appointment.payment?.transactionDate!,
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
                  {appointment.payment?.amount}
                  {appointment.payment?.currency === "USD" ? "$" : "€"}
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
                {appointment.service}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Date:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {new Date(appointment.scheduledDate).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Time:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.scheduledTime.start}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[15px] text-[#6B7280]">Duration:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {appointment.duration} minutes
              </Text>
            </View>
            <View className="h-px bg-[#D1D5DB] my-3" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-lg font-bold text-[#2D3142]">
                Total Amount:
              </Text>
              <Text className="text-2xl font-bold text-[#4461F2]">
                {appointment.payment?.amount}
                {appointment.payment?.currency === "USD" ? "$" : "€"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Restriction Message */}
        {!canPay && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <Text className="text-red-800 text-center">
              {currentUser?.userType !== "patient"
                ? "Only patients can make payments for their appointments."
                : `Payment is not available for appointments with status: ${appointment.status}.`}
            </Text>
          </View>
        )}

        {/* Card Input Section */}
        {canPay && clientSecret && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-[#2D3142] mb-4">
              Card Details
            </Text>

            {/* Stripe CardField */}
            <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: "4242 4242 4242 4242",
                }}
                cardStyle={{
                  backgroundColor: "#FFFFFF",
                  textColor: "#2D3142",
                  borderColor: "#E5E7EB",
                  borderWidth: 1,
                  borderRadius: 8,
                  fontSize: 16,
                  placeholderColor: "#9CA3AF",
                }}
                style={{
                  width: "100%",
                  height: 50,
                }}
                onCardChange={(details) => {
                  setCardDetails(details);
                }}
              />
            </View>

            {/* Card status indicator */}
            {cardDetails?.complete && (
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-sm text-green-600 ml-2">
                  Card details complete
                  {cardDetails.brand && ` (${cardDetails.brand})`}
                </Text>
              </View>
            )}

            {/* Secure payment notice */}
            <View className="flex-row items-center justify-center py-3">
              <Ionicons name="lock-closed" size={16} color="#6B7280" />
              <Text className="text-sm text-gray-500 ml-2">
                Secured by Stripe
              </Text>
            </View>
          </View>
        )}

        {/* Loading state for payment initialization */}
        {canPay && !clientSecret && !loading && (
          <View className="mb-6 items-center py-8">
            <ActivityIndicator size="small" color="#4461F2" />
            <Text className="text-sm text-gray-500 mt-2">
              Initializing payment...
            </Text>
          </View>
        )}

        {/* Process Payment Button */}
        <TouchableOpacity
          className={`py-4 rounded-[28px] justify-center items-center shadow-lg mt-5 ${
            processing || !cardDetails?.complete || !canPay || !clientSecret
              ? "bg-[#B8C5E8]"
              : "bg-[#4461F2]"
          }`}
          onPress={handleProcessPayment}
          disabled={
            processing || !cardDetails?.complete || !canPay || !clientSecret
          }
        >
          {processing ? (
            <ActivityIndicator size="small" color="white" />
          ) : !canPay ? (
            <Text className="text-lg font-semibold text-white">
              Payment Not Available
            </Text>
          ) : (
            <Text className="text-lg font-semibold text-white">
              Pay {appointment?.payment?.amount}
              {appointment?.payment?.currency === "USD" ? "$" : "€"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
