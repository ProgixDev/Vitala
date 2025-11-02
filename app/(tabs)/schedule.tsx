import IllustrationSvg from "@/assets/images/schedule.svg";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Appointment, appointmentStorage } from "@/utils/appointments";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Schedule() {
  const { currentUser } = useCurrentUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  });

  const loadAppointments = async () => {
    try {
      const allAppointments = await appointmentStorage.getAppointments();
      // Filter appointments for current user
      const userAppointments = currentUser
        ? allAppointments.filter((appt) => appt.userEmail === currentUser.email)
        : [];
      setAppointments(userAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const iconMap: { [key: string]: string } = {
      Rééducation: "accessibility",
      Perfusion: "water",
      Vaccination: "medical",
      Analyses: "flask",
      Consultation: "bandage",
      Maternity: "heart",
      Pediatric: "heart",
      Medication: "hand-right",
      "Wound Care": "medkit",
      "Elderly Care": "heart",
      Dialysis: "heart-circle",
      Respiratory: "fitness",
      "Post-Op Care": "bed",
      Injection: "pulse",
      Palliative: "leaf",
      Nutrition: "nutrition",
    };
    return iconMap[serviceName] || "medical";
  };

  const handleAppointmentPress = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}/status`);
  };

  const handleDeleteAll = async () => {
    try {
      await appointmentStorage.clearAppointments();
      setAppointments([]);
    } catch (error) {
      console.error("Error deleting appointments:", error);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "on-the-way":
        return "On the Way";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-[#FFA500]/10", text: "text-[#FFA500]" };
      case "confirmed":
        return { bg: "bg-[#4461F2]/10", text: "text-[#4461F2]" };
      case "on-the-way":
        return { bg: "bg-[#00CED1]/10", text: "text-[#00CED1]" };
      case "in-progress":
        return { bg: "bg-[#9370DB]/10", text: "text-[#9370DB]" };
      case "completed":
        return { bg: "bg-[#32CD32]/10", text: "text-[#32CD32]" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Payment Pending";
      case "processing":
        return "Processing";
      case "completed":
        return "Paid";
      case "failed":
        return "Payment Failed";
      default:
        return "Unknown";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-[#FFA500]/20",
          text: "text-[#FFA500]",
          iconColor: "#FFA500",
          icon: "time-outline",
        };
      case "processing":
        return {
          bg: "bg-[#4461F2]/20",
          text: "text-[#4461F2]",
          iconColor: "#4461F2",
          icon: "sync-outline",
        };
      case "completed":
        return {
          bg: "bg-[#32CD32]/20",
          text: "text-[#32CD32]",
          iconColor: "#32CD32",
          icon: "checkmark-circle-outline",
        };
      case "failed":
        return {
          bg: "bg-[#FF3B30]/20",
          text: "text-[#FF3B30]",
          iconColor: "#FF3B30",
          icon: "close-circle-outline",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          iconColor: "#6B7280",
          icon: "help-circle-outline",
        };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#4461F2" />
      </View>
    );
  }

  return (
    <View className="flex-1 pt-6 px-4">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="py-5">
          <View>
            <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
              Appointments
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Organize all your schedules
            </Text>
          </View>
        </View>

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <View className="mb-[30px]">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-semibold text-[#2D3142]">
                Your Appointments
              </Text>
              <TouchableOpacity
                onPress={handleDeleteAll}
                className="bg-[#FF3B30] px-4 py-2 rounded-full"
              >
                <Text className="text-xs font-semibold text-white">
                  Delete All
                </Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {appointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  className="bg-[#4461F2] rounded-3xl p-5 relative overflow-hidden"
                  onPress={() => handleAppointmentPress(appointment.id)}
                >
                  {/* Header with Status Badges */}
                  <View className="flex-row justify-between items-start mb-5">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-white mb-2">
                        Upcoming Appointment
                      </Text>
                      {/* Payment Status Badge */}
                      <View className="flex-row items-center gap-2">
                        <View
                          className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${
                            getPaymentStatusColor(appointment?.payment?.status)
                              ?.bg
                          }`}
                        >
                          <Ionicons
                            name={
                              getPaymentStatusColor(
                                appointment?.payment?.status,
                              )?.icon as any
                            }
                            size={14}
                            color={
                              getPaymentStatusColor(
                                appointment?.payment?.status,
                              )?.iconColor
                            }
                          />
                          <Text
                            className={`text-xs font-semibold ${
                              getPaymentStatusColor(
                                appointment?.payment?.status,
                              )?.text
                            }`}
                          >
                            {getPaymentStatusLabel(
                              appointment?.payment?.status,
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row gap-2 items-center">
                      {appointment.type === "emergency" && (
                        <View className="bg-[#FF4B8C] px-3 py-1 rounded-full">
                          <Text className="text-xs font-semibold text-white">
                            Emergency
                          </Text>
                        </View>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>

                  {/* Date and Time Info */}
                  <View className="flex-row justify-between mb-5 gap-3">
                    <View className="flex-1">
                      <View className="w-12 h-12 bg-white/20 rounded-xl justify-center items-center mb-2">
                        <Ionicons
                          name="calendar-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text className="text-xs text-white/80 mb-1">
                        Appointment Date
                      </Text>
                      <Text className="text-sm font-semibold text-white">
                        {appointment.date}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <View className="w-12 h-12 bg-white/20 rounded-xl justify-center items-center mb-2">
                        <Ionicons
                          name="time-outline"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text className="text-xs text-white/80 mb-1">
                        Appointment Time
                      </Text>
                      <Text className="text-sm font-semibold text-white">
                        {appointment.time}
                      </Text>
                    </View>
                  </View>

                  {/* Service Card */}
                  <View className="bg-white rounded-2xl p-4 flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-[#E8EBFF] rounded-xl justify-center items-center">
                      <Ionicons
                        name={getServiceIcon(appointment.serviceName) as any}
                        size={24}
                        color="#4461F2"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-[#2D3142] mb-1">
                        {appointment.serviceName}
                      </Text>
                      <View className="flex-row items-center gap-1 mb-1">
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#9E9E9E"
                        />
                        <Text className="text-xs text-[#9E9E9E]">
                          {appointment.locationLabel}
                        </Text>
                      </View>
                      <View className="flex-row gap-2 items-center mt-1">
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            getStatusColor(appointment.status).bg
                          }`}
                        >
                          <Text
                            className={`text-[10px] font-semibold ${
                              getStatusColor(appointment.status).text
                            }`}
                          >
                            {getStatusLabel(appointment.status)}
                          </Text>
                        </View>
                        <Text className="text-xs text-[#9E9E9E]">
                          • {appointment?.payment?.amount}
                          {appointment?.payment?.currency === "USD" ? "$" : "€"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-[20px] p-8 mb-[30px] items-center">
            <Ionicons name="calendar-outline" size={48} color="#9E9E9E" />
            <Text className="text-base text-[#2D3142] font-semibold mt-4 mb-2">
              No appointments yet
            </Text>
            <Text className="text-sm text-[#9E9E9E] text-center">
              Book your first appointment to get started
            </Text>
          </View>
        )}

        {/* Stay Organized Card */}
        <View className="bg-[#4461F2] rounded-3xl p-6 pb-[140px] relative overflow-hidden mb-5">
          <Text className="text-xs text-white mb-3 opacity-90">
            Trusted Nurses on your schedule 😊
          </Text>
          <Text className="text-[26px] font-bold text-white leading-8">
            Stay Organized,
          </Text>
          <Text className="text-[26px] font-bold text-white leading-8">
            Stay Ahead
          </Text>

          <TouchableOpacity className="flex-row items-center bg-white/20 py-3 px-5 rounded-xl self-start mt-5 gap-2">
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            <Text className="text-sm font-semibold text-white">
              Open Calendar
            </Text>
          </TouchableOpacity>

          {/* Illustration */}
          <View className="absolute -bottom-5 -right-5 w-[200px] h-[200px]">
            <IllustrationSvg width={200} height={200} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
