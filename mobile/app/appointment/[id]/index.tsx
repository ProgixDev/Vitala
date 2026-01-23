import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";

// Import services data
const servicesData = [
  {
    _id: "1",
    name: "Rééducation",
    description:
      "Recover safely at home with personalized physiotherapy sessions designed to restore your strength and mobility.",
    category: "reeducation",
    price: 60,
    duration: 60,
  },
  {
    _id: "2",
    name: "Perfusion",
    description:
      "Professional IV therapy services delivered in the comfort of your home with trained nursing staff.",
    category: "perfusion",
    price: 80,
    duration: 60,
  },
  {
    _id: "3",
    name: "Vaccination",
    description:
      "Get vaccinated at home with our certified nurses ensuring safe and convenient immunization.",
    category: "vaccination",
    price: 40,
    duration: 30,
  },
  {
    _id: "4",
    name: "Analyses",
    description:
      "Home blood sample collection and laboratory test services with quick and accurate results.",
    category: "analyses",
    price: 50,
    duration: 30,
  },
  {
    _id: "5",
    name: "Consultation",
    description:
      "Expert medical consultation at your doorstep with experienced healthcare professionals.",
    category: "consultation",
    price: 70,
    duration: 45,
  },
  {
    _id: "6",
    name: "Maternity",
    description:
      "Comprehensive maternity care and support for new mothers in the comfort of home.",
    category: "maternity",
    price: 90,
    duration: 60,
  },
  {
    _id: "7",
    name: "Pediatric",
    description:
      "Specialized pediatric care for children with gentle and experienced nursing staff.",
    category: "pediatric",
    price: 55,
    duration: 45,
  },
  {
    _id: "8",
    name: "Medication",
    description:
      "Professional medication administration and management services at home.",
    category: "medication",
    price: 35,
    duration: 30,
  },
  {
    _id: "9",
    name: "Wound Care",
    description:
      "Professional wound dressing and care services to promote healing and prevent infection.",
    category: "wound-care",
    price: 65,
    duration: 45,
  },
  {
    _id: "10",
    name: "Elderly Care",
    description:
      "Compassionate elderly care services with assistance for daily activities and health monitoring.",
    category: "elderly-care",
    price: 55,
    duration: 60,
  },
  {
    _id: "11",
    name: "Dialysis",
    description:
      "Home dialysis services with trained professionals ensuring safe and comfortable treatment.",
    category: "dialysis",
    price: 120,
    duration: 240,
  },
  {
    _id: "12",
    name: "Respiratory",
    description:
      "Respiratory therapy and oxygen administration services for breathing support at home.",
    category: "respiratory",
    price: 75,
    duration: 60,
  },
  {
    _id: "13",
    name: "Post-Op Care",
    description:
      "Post-operative care and recovery support to ensure smooth healing after surgery.",
    category: "post-op-care",
    price: 70,
    duration: 60,
  },
  {
    _id: "14",
    name: "Injection",
    description:
      "Professional injection administration services including insulin and other medications.",
    category: "injection",
    price: 45,
    duration: 15,
  },
  {
    _id: "15",
    name: "Palliative",
    description:
      "Palliative care services focused on comfort and quality of life for serious illness.",
    category: "palliative",
    price: 100,
    duration: 60,
  },
  {
    _id: "16",
    name: "Nutrition",
    description:
      "Nutritional support and tube feeding management with certified healthcare professionals.",
    category: "nutrition",
    price: 60,
    duration: 45,
  },
];

export default function AppointmentDetails() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [appointment, setAppointment] = useState<any | null>(null);
  const [partialAppointment, setPartialAppointment] = useState<any | null>(
    null,
  );
  const [patientDetails, setPatientDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointment = useCallback(async () => {
    try {
      if (!currentUser?.token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const result = await api.getAppointmentById(currentUser.token, id as string);
      if (result.success) {
        const appointmentData = result.data;

        // Find service details
        const serviceDetails = servicesData.find(
          (s) => s._id === appointmentData.service,
        );

        // Format appointment data for frontend
        const formattedAppointment = {
          ...appointmentData,
          serviceName: serviceDetails ? serviceDetails.name : "Unknown Service",
          date: new Date(appointmentData.scheduledDate).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            },
          ),
          time: appointmentData.scheduledTime.start,
          duration: `${serviceDetails ? serviceDetails.duration : appointmentData.duration} minutes`,
        };

        setAppointment(formattedAppointment);
        // populate patient details if available from API
        setPatientDetails(appointmentData.patient || null);
      } else {
        setError("Appointment not found");
      }
    } catch (err) {
      console.error("Error loading appointment:", err);
      const msg = String((err as any)?.message || err);
      if (/not authorized/i.test(msg)) {
        try {
          if (currentUser?.token) {
            const listRes = await api.getAppointments(currentUser.token);
            if (listRes.success) {
              const found = listRes.data.find(
                (a: any) => a._id === id || a.id === id,
              );
              if (found) {
                const fallback = {
                  id: found._id || found.id,
                  serviceName:
                    found.service || found.serviceName || "Unknown Service",
                  date: found.scheduledDate
                    ? new Date(found.scheduledDate).toLocaleDateString()
                    : "",
                  time: found.scheduledTime?.start || "",
                  location: found.location || {},
                  status: found.status,
                  payment: found.payment || {
                    status: "pending",
                    amount: found.price || 0,
                    currency: "USD",
                  },
                };
                setPartialAppointment(fallback);
                setError(
                  "Limited access: some details are hidden. Here is what we can show.",
                );
              } else {
                setError("Not authorized to view this appointment");
              }
            } else {
              setError("Not authorized to view this appointment");
            }
          } else {
            setError("Not authenticated");
          }
        } catch (err2) {
          console.error("Fallback error:", err2);
          setError("Not authorized to view this appointment");
        }
      } else {
        setError("Failed to load appointment");
      }
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

  if (error || !appointment) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center px-6">
        <Text className="text-base text-[#FF3B30] text-center">
          {error || "Appointment not found"}
        </Text>

        {partialAppointment ? (
          <View className="bg-white rounded-xl p-4 mt-4 w-full">
            <Text className="font-semibold text-[#2D3142] mb-2">
              Limited appointment details
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Service: {partialAppointment.serviceName}
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Date: {partialAppointment.date}
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Time: {partialAppointment.time}
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Location:{" "}
              {partialAppointment.location?.label ||
                partialAppointment.location?.address ||
                "N/A"}
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Status: {partialAppointment.status}
            </Text>

            <View className="flex-row gap-2 mt-4">
              <TouchableOpacity
                className="bg-[#4461F2] py-3 px-4 rounded-lg"
                onPress={() => loadAppointment()}
              >
                <Text className="text-white font-semibold">Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-white border border-[#E0E0E0] py-3 px-4 rounded-lg"
                onPress={() =>
                  Linking.openURL(
                    "mailto:support@vitala.app?subject=Appointment%20Access%20Request&body=I%20need%20access%20to%20appointment%20ID%20" +
                      id,
                  )
                }
              >
                <Text className="text-[#4461F2] font-semibold">
                  Contact support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            className="mt-4 bg-[#4461F2] py-3 px-6 rounded-lg"
            onPress={() => {
              setError(null);
              setLoading(true);
              loadAppointment();
            }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        )}
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
              Appointment Details
            </Text>
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
                  {appointment.location.label}
                </Text>
                <Text className="text-[13px] text-[#9E9E9E] text-right">
                  {appointment.location.address}
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
                {patientDetails?.fullName || "Not specified"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Gender:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {patientDetails?.gender || "Not specified"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-[15px] text-[#9E9E9E]">Age:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {patientDetails?.age || "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-[#2D3142]">
              Medical Information
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Blood Type:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {patientDetails?.medicalProfile?.bloodType || "Not specified"}
              </Text>
            </View>
            <View className="py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E] mb-2">
                Chronic Illnesses:
              </Text>
              {patientDetails?.medicalProfile?.chronicIllnesses.length ? (
                patientDetails.medicalProfile.chronicIllnesses.map(
                  (illness: string, index: number) => (
                    <Text
                      key={index}
                      className="text-[15px] font-semibold text-[#2D3142]"
                    >
                      - {illness}
                    </Text>
                  ),
                )
              ) : (
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  None
                </Text>
              )}
            </View>
            <View className="py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E] mb-2">
                Allergies:
              </Text>
              {patientDetails?.medicalProfile?.allergies.length ? (
                patientDetails.medicalProfile.allergies.map(
                  (allergy: string, index: number) => (
                    <Text
                      key={index}
                      className="text-[15px] font-semibold text-[#2D3142]"
                    >
                      - {allergy}
                    </Text>
                  ),
                )
              ) : (
                <Text className="text-[15px] font-semibold text-[#2D3142]">
                  None
                </Text>
              )}
            </View>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <Text className="text-[15px] text-[#9E9E9E]">Height:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {patientDetails?.medicalProfile?.height
                  ? `${patientDetails.medicalProfile.height} cm`
                  : "Not specified"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-[15px] text-[#9E9E9E]">Weight:</Text>
              <Text className="text-[15px] font-semibold text-[#2D3142]">
                {patientDetails?.medicalProfile?.weight
                  ? `${patientDetails.medicalProfile.weight} kg`
                  : "Not specified"}
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
                {appointment.payment.currency === "USD" ? "$" : "?"}
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

        {/* Go to Schedule Button - placed above payment button */}
        <TouchableOpacity
          className="bg-white border border-[#4461F2] py-4 rounded-[28px] justify-center items-center shadow-sm mt-2"
          onPress={() => router.push("/(tabs)/schedule")}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold text-[#4461F2]">Done</Text>
          </View>
        </TouchableOpacity>

        {/* Continue to Payment Button - Only show if not paid */}
        {appointment.payment.status !== "completed" &&
          currentUser?.userType === "patient" && (
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
        {appointment.payment.status === "completed" &&
          currentUser?.userType === "patient" && (
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
