import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  Header,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, View } from "react-native";

type CardDetails = {
  complete: boolean;
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text variant="body" color="muted">
        {label}
      </Text>
      <Text
        variant="body"
        color="foreground"
        weight="semibold"
        className="ml-2 text-right flex-1"
      >
        {value}
      </Text>
    </View>
  );
}

export default function PaymentPage() {
  const { currentUser } = useCurrentUser();
  const { id } = useLocalSearchParams();
  const colors = useThemeColors();
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
      <Screen scroll>
        <StatusBar hidden />
        <Header title="Payment Method" onBack={handleGoBack} large />
        <SkeletonList count={3} itemHeight={120} />
      </Screen>
    );
  }

  if (!appointment) {
    return (
      <Screen>
        <StatusBar hidden />
        <Header title="Payment Method" onBack={handleGoBack} />
        <EmptyState
          tone="error"
          title="Appointment not found"
          message="We couldn't load this appointment. Please try again."
          actionLabel="Back to schedule"
          onAction={handleBookAnother}
        />
      </Screen>
    );
  }

  const isPaymentCompleted = appointment.payment?.status === "completed";
  const canPay =
    currentUser?.userType === "patient" &&
    !["cancelled", "declined", "pending"].includes(appointment.status);

  // Receipt View
  if (isPaymentCompleted) {
    return (
      <Screen scroll>
        <StatusBar hidden />
        <Header title="Payment Successful" onBack={handleGoBack} large />

        {/* Success Card */}
        <Card className="mb-6" padded={false}>
          <View className="p-6">
            {/* Success Icon */}
            <View className="items-center mb-6">
              <View className="w-24 h-24 bg-accent-soft rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark" size={50} color={colors.success} />
              </View>
              <Badge
                label="Paid"
                tone="success"
                icon="checkmark-circle"
              />
            </View>

            {/* Receipt Details */}
            <View>
              <SummaryRow
                label="Reference"
                value={appointment.payment?.reference ?? "—"}
              />
              <SummaryRow
                label="Date"
                value={new Date(
                  appointment.payment?.transactionDate!,
                ).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              />
              <SummaryRow
                label="Time"
                value={new Date(
                  appointment.payment?.transactionDate!,
                ).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
              <SummaryRow
                label="Service Duration"
                value={String(appointment.duration)}
              />
              <SummaryRow label="Payment Method" value="Credit Card" />

              <Divider className="my-2" />

              <View className="flex-row justify-between items-center py-2">
                <Text variant="bodyLg" color="foreground" weight="semibold">
                  Total
                </Text>
                <Text variant="h2" color="foreground" weight="headingBold">
                  {appointment.payment?.amount}
                  {appointment.payment?.currency === "USD" ? "$" : "€"}
                </Text>
              </View>
            </View>

            {/* Download Button */}
            <Button
              label="Download Receipt (PDF)"
              variant="secondary"
              leftIcon="download-outline"
              onPress={handleDownloadReceipt}
              className="mt-6"
            />
          </View>
        </Card>

        {/* Book Another Appointment */}
        <Button label="Back to Schedule" onPress={handleBookAnother} />
      </Screen>
    );
  }

  // Payment Method Selection View
  return (
    <Screen scroll>
      <StatusBar hidden />
      <Header
        title="Payment Method"
        subtitle="Choose your method"
        onBack={handleGoBack}
        large
      />

      {/* Payment Summary */}
      <Text variant="h3" color="foreground" className="mb-3">
        Payment Summary
      </Text>
      <Card className="mb-6 bg-surface-alt" elevation="none">
        <SummaryRow label="Service" value={appointment.service} />
        <SummaryRow
          label="Date"
          value={new Date(appointment.scheduledDate).toLocaleDateString()}
        />
        <SummaryRow label="Time" value={appointment.scheduledTime.start} />
        <SummaryRow
          label="Duration"
          value={`${appointment.duration} minutes`}
        />
        <Divider className="my-3" />
        <View className="flex-row justify-between items-center py-2">
          <Text variant="bodyLg" color="foreground" weight="semibold">
            Total Amount
          </Text>
          <Text variant="h2" color="primary" weight="headingBold">
            {appointment.payment?.amount}
            {appointment.payment?.currency === "USD" ? "$" : "€"}
          </Text>
        </View>
      </Card>

      {/* Payment Restriction Message */}
      {!canPay && (
        <Card
          elevation="none"
          className="bg-emergency-soft border-0 mb-6"
        >
          <Text variant="body" color="emergency" className="text-center">
            {currentUser?.userType !== "patient"
              ? "Only patients can make payments for their appointments."
              : `Payment is not available for appointments with status: ${appointment.status}.`}
          </Text>
        </Card>
      )}

      {/* Card Input Section */}
      {canPay && clientSecret && (
        <View className="mb-6">
          <Text variant="h3" color="foreground" className="mb-3">
            Card Details
          </Text>

          {/* Stripe CardField */}
          <Card className="mb-4">
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: "4242 4242 4242 4242",
              }}
              cardStyle={{
                backgroundColor: colors.surface,
                textColor: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                fontSize: 16,
                placeholderColor: colors.mutedForeground,
              }}
              style={{
                width: "100%",
                height: 50,
              }}
              onCardChange={(details) => {
                setCardDetails(details);
              }}
            />
          </Card>

          {/* Card status indicator */}
          {cardDetails?.complete && (
            <View className="flex-row items-center mb-4">
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
              <Text variant="body" color="accent" className="ml-2">
                Card details complete
                {cardDetails.brand && ` (${cardDetails.brand})`}
              </Text>
            </View>
          )}

          {/* Secure payment notice */}
          <View className="flex-row items-center justify-center py-3">
            <Ionicons
              name="lock-closed"
              size={16}
              color={colors.mutedForeground}
            />
            <Text variant="body" color="muted" className="ml-2">
              Secured by Stripe
            </Text>
          </View>
        </View>
      )}

      {/* Loading state for payment initialization */}
      {canPay && !clientSecret && !loading && (
        <View className="mb-6 items-center py-8">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="body" color="muted" className="mt-2">
            Initializing payment...
          </Text>
        </View>
      )}

      {/* Process Payment Button */}
      <Button
        label={
          !canPay
            ? "Payment Not Available"
            : `Pay ${appointment?.payment?.amount}${
                appointment?.payment?.currency === "USD" ? "$" : "€"
              }`
        }
        onPress={handleProcessPayment}
        loading={processing}
        disabled={
          processing || !cardDetails?.complete || !canPay || !clientSecret
        }
        className="mt-2"
      />
    </Screen>
  );
}
