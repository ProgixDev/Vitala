import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  BadgeTone,
  Button,
  Card,
  Divider,
  EmptyState,
  Header,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";

// Import services data

function DetailRow({
  label,
  value,
  alignTop = false,
}: {
  label: string;
  value: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <View
      className={`flex-row justify-between py-3 ${
        alignTop ? "items-start" : "items-center"
      }`}
    >
      <Text variant="body" color="muted">
        {label}
      </Text>
      {typeof value === "string" ? (
        <Text
          variant="body"
          color="foreground"
          weight="semibold"
          className="ml-2 text-right flex-1"
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}

export default function AppointmentDetails() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [appointment, setAppointment] = useState<ApiAppointment | null>(null);
  const [patientDetails, setPatientDetails] = useState<PopulatedUser | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

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
          // populate patient details if available from API
          setPatientDetails(result.data.patient || null);
        }
      } catch (err) {
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [currentUser?.token, id]);

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

  const handleConfirmBooking = () => {
    // Navigate to payment page
    router.push(`/appointment/${id}/payment`);
  };

  if (loading) {
    return (
      <Screen scroll>
        <StatusBar hidden />
        <Header title="Appointment Details" onBack={handleGoBack} large />
        <SkeletonList count={4} itemHeight={120} />
      </Screen>
    );
  }

  if (!appointment) {
    return (
      <Screen>
        <StatusBar hidden />
        <Header title="Appointment Details" onBack={handleGoBack} />
        <EmptyState
          tone="error"
          title="Unable to load appointment"
          message="We couldn't load this appointment. Please try again."
          actionLabel="Back to schedule"
          onAction={handleGoBack}
        />
      </Screen>
    );
  }

  const paymentStatus = appointment.payment?.status;
  const paymentTone: BadgeTone =
    paymentStatus === "completed"
      ? "success"
      : paymentStatus === "pending"
        ? "warning"
        : paymentStatus === "failed"
          ? "emergency"
          : "primary";
  const paymentLabel =
    paymentStatus === "completed"
      ? "Paid"
      : paymentStatus === "pending"
        ? "Payment Pending"
        : paymentStatus === "failed"
          ? "Payment Failed"
          : "Processing";

  return (
    <Screen scroll>
      <StatusBar hidden />
      <Header title="Appointment Details" onBack={handleGoBack} large />

      {/* About the Service */}
      <Text variant="h3" color="foreground" className="mb-3">
        About the service
      </Text>
      <Card className="mb-6">
        <DetailRow label="Service" value={appointment.service} />
      </Card>

      {/* Schedule Appointment */}
      <Text variant="h3" color="foreground" className="mb-3">
        Schedule appointment
      </Text>
      <Card className="mb-6 py-1">
        <DetailRow label="Date" value={appointment.scheduledDate} />
        <Divider />
        <DetailRow label="Time" value={appointment.scheduledTime.start} />
        <Divider />
        <DetailRow label="Duration" value={`${appointment.duration} minutes`} />
        <Divider />
        <DetailRow
          label="Location"
          alignTop
          value={
            <View className="flex-1 items-end ml-2">
              <Text variant="body" color="foreground" weight="semibold">
                {appointment.location.label}
              </Text>
              <Text
                variant="caption"
                color="muted"
                className="text-right mt-0.5"
              >
                {appointment.location.address}
              </Text>
            </View>
          }
        />
      </Card>

      {/* Patient Information */}
      <Text variant="h3" color="foreground" className="mb-3">
        Patient information
      </Text>
      <Card className="mb-6 py-1">
        <DetailRow
          label="Name"
          value={patientDetails?.fullName || "Not specified"}
        />
        <Divider />
        <DetailRow
          label="Gender"
          value={patientDetails?.medicalProfile?.gender || "Not specified"}
        />
        <Divider />
        <DetailRow
          label="Age"
          value={patientDetails?.medicalProfile?.dateOfBirth || "Not specified"}
        />
      </Card>

      {/* Medical Information */}
      <Text variant="h3" color="foreground" className="mb-3">
        Medical information
      </Text>
      <Card className="mb-6 py-1">
        <DetailRow
          label="Blood Type"
          value={patientDetails?.medicalProfile?.bloodType || "Not specified"}
        />
        <Divider />
        <View className="py-3">
          <Text variant="body" color="muted" className="mb-2">
            Chronic Illnesses
          </Text>
          {patientDetails?.medicalProfile?.chronicIllnesses.length ? (
            patientDetails.medicalProfile.chronicIllnesses.map(
              (illness: string, index: number) => (
                <Text
                  key={index}
                  variant="body"
                  color="foreground"
                  weight="semibold"
                >
                  - {illness}
                </Text>
              ),
            )
          ) : (
            <Text variant="body" color="foreground" weight="semibold">
              None
            </Text>
          )}
        </View>
        <Divider />
        <View className="py-3">
          <Text variant="body" color="muted" className="mb-2">
            Allergies
          </Text>
          {patientDetails?.medicalProfile?.allergies.length ? (
            patientDetails.medicalProfile.allergies.map(
              (allergy: string, index: number) => (
                <Text
                  key={index}
                  variant="body"
                  color="foreground"
                  weight="semibold"
                >
                  - {allergy}
                </Text>
              ),
            )
          ) : (
            <Text variant="body" color="foreground" weight="semibold">
              None
            </Text>
          )}
        </View>
        <Divider />
        <DetailRow
          label="Height"
          value={
            patientDetails?.medicalProfile?.height
              ? `${patientDetails.medicalProfile.height} cm`
              : "Not specified"
          }
        />
        <Divider />
        <DetailRow
          label="Weight"
          value={
            patientDetails?.medicalProfile?.weight
              ? `${patientDetails.medicalProfile.weight} kg`
              : "Not specified"
          }
        />
      </Card>

      {/* Payment Summary */}
      <Text variant="h3" color="foreground" className="mb-3">
        Payment details
      </Text>
      <Card className="mb-6 py-1">
        <DetailRow
          label="Service Fee"
          value={`${appointment.payment?.amount || 0}${
            appointment.payment?.currency === "USD" ? "$" : "?"
          }`}
        />
        <Divider />
        <DetailRow
          label="Payment Status"
          value={<Badge label={paymentLabel} tone={paymentTone} />}
        />
      </Card>

      {/* Go to Schedule Button - placed above payment button */}
      <Button
        label="Done"
        variant="secondary"
        onPress={() => router.push("/(tabs)/schedule")}
        className="mt-2"
      />

      {/* Continue to Payment Button - Only show if not paid */}
      {appointment.payment?.status !== "completed" &&
        currentUser?.userType === "patient" && (
          <Button
            label="Continue to Payment"
            onPress={handleConfirmBooking}
            className="mt-4"
          />
        )}

      {/* View Receipt Button - Only show if paid */}
      {appointment.payment?.status === "completed" &&
        currentUser?.userType === "patient" && (
          <Button
            label="Go to Payment Details"
            leftIcon="receipt-outline"
            onPress={handleConfirmBooking}
            className="mt-4"
          />
        )}
    </Screen>
  );
}
