import { auth, useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { servicesData } from "@/utils/services";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Schedule() {
  const { currentUser } = useCurrentUser();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "paid" | "pending" | "failed"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "cancelled"
  >("all");

  const loadAppointments = useCallback(async () => {
    try {
      if (!currentUser?.token) {
        setLoading(false);
        return;
      }

      const result = await api.getAppointments(currentUser.token);
      if (result.success) {
        // Transform API response to match frontend expectations
        const transformedAppointments = result.data.map((appointment: any) => {
          // Get service details from servicesData
          const service = servicesData.find(
            (s) => s._id === appointment.service,
          );

          return {
            id: appointment._id,
            userEmail: appointment.patient?.email,
            nurseEmail: appointment.nurse?.email,
            serviceName:
              service?.name ||
              appointment.serviceName ||
              appointment.service ||
              "Unknown Service",
            serviceCategory: service?.category || "",
            serviceId: appointment.service,
            date: appointment.scheduledDate
              ? new Date(appointment.scheduledDate).toLocaleDateString()
              : "",
            time: appointment.scheduledTime?.start || "",
            duration: appointment.duration,
            type: appointment.appointmentType,
            location: appointment.location,
            status: appointment.status,
            payment: appointment.payment || {
              status: "pending",
              amount: appointment.price || 0,
              currency: "USD",
            },
            createdAt: appointment.createdAt,
          };
        });
        setAppointments(transformedAppointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Refresh appointments when screen comes into focus (e.g., after payment)
  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments]),
  );

  const upcomingAppointments = appointments.filter((appointment) =>
    ["pending", "confirmed", "on-the-way", "in-progress"].includes(
      appointment.status,
    ),
  );

  const historyAppointments = appointments
    .filter((appointment) =>
      ["completed", "cancelled"].includes(appointment.status),
    )
    .filter((appointment) => {
      // Apply status filter
      if (statusFilter !== "all" && appointment.status !== statusFilter) {
        return false;
      }
      // Apply payment filter
      if (paymentFilter !== "all") {
        if (
          paymentFilter === "paid" &&
          appointment.payment?.status !== "completed"
        ) {
          return false;
        }
        if (
          paymentFilter === "pending" &&
          appointment.payment?.status !== "pending"
        ) {
          return false;
        }
        if (
          paymentFilter === "failed" &&
          appointment.payment?.status !== "failed"
        ) {
          return false;
        }
      }
      return true;
    });

  const displayedAppointments =
    activeTab === "upcoming" ? upcomingAppointments : historyAppointments;

  const getServiceIcon = (serviceCategory: string) => {
    const iconMap: { [key: string]: string } = {
      reeducation: "accessibility",
      perfusion: "water",
      vaccination: "medical",
      analyses: "flask",
      consultation: "bandage",
      maternity: "woman",
      pediatric: "person",
      medication: "hand-right",
      "wound-care": "medkit",
      "elderly-care": "walk",
      dialysis: "heart-circle",
      respiratory: "fitness",
      "post-op-care": "bed",
      injection: "pulse",
      palliative: "leaf",
      nutrition: "nutrition",
    };
    return iconMap[serviceCategory] || "medical";
  };

  const handleAppointmentPress = (appointmentId: string) => {
    if (currentUser?.userType === "patient") {
      router.push(`/appointment/${appointmentId}/status`);
    } else {
      router.push(`/appointment/${appointmentId}`);
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
      case "cancelled":
        return "Cancelled";
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
      case "cancelled":
        return { bg: "bg-[#FF3B30]/10", text: "text-[#FF3B30]" };
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

  const getUserInfo = (appointment: any) => {
    if (currentUser?.userType === "patient") {
      // Show nurse info for patients
      if (appointment.nurseEmail) {
        return {
          name: appointment.nurseEmail, // For now, just show email until we fetch user details
          role: "NURSE",
          email: appointment.nurseEmail,
        };
      }
    } else if (currentUser?.userType === "nurse") {
      // Show patient info for nurses
      if (appointment.userEmail) {
        return {
          name: appointment.userEmail, // For now, just show email until we fetch user details
          role: "PATIENT",
          email: appointment.userEmail,
        };
      }
    }
    return null;
  };

  return (
    <View className="flex-1 pt-6 px-4">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

        {/* Tab Bar */}
        <View className="flex-row bg-white rounded-2xl p-1 mb-5">
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-xl ${
              activeTab === "upcoming" ? "bg-[#4461F2]" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "upcoming" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              Upcoming ({upcomingAppointments.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 px-4 rounded-xl ${
              activeTab === "history" ? "bg-[#4461F2]" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("history")}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === "history" ? "text-white" : "text-[#6B7280]"
              }`}
            >
              History ({historyAppointments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section - Only show in History tab */}
        {activeTab === "history" && (
          <View className="mb-5">
            {/* Status Filter */}
            <View className="mb-3">
              <Text className="text-xs font-semibold text-[#6B7280] mb-2 px-1">
                Appointment Status
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    statusFilter === "all"
                      ? "bg-[#4461F2]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setStatusFilter("all")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      statusFilter === "all" ? "text-white" : "text-[#6B7280]"
                    }`}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    statusFilter === "completed"
                      ? "bg-[#32CD32]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setStatusFilter("completed")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      statusFilter === "completed"
                        ? "text-white"
                        : "text-[#6B7280]"
                    }`}
                  >
                    Completed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    statusFilter === "cancelled"
                      ? "bg-[#FF3B30]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setStatusFilter("cancelled")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      statusFilter === "cancelled"
                        ? "text-white"
                        : "text-[#6B7280]"
                    }`}
                  >
                    Cancelled
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Filter */}
            <View>
              <Text className="text-xs font-semibold text-[#6B7280] mb-2 px-1">
                Payment Status
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    paymentFilter === "all"
                      ? "bg-[#4461F2]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setPaymentFilter("all")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      paymentFilter === "all" ? "text-white" : "text-[#6B7280]"
                    }`}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    paymentFilter === "paid"
                      ? "bg-[#32CD32]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setPaymentFilter("paid")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      paymentFilter === "paid" ? "text-white" : "text-[#6B7280]"
                    }`}
                  >
                    Paid
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    paymentFilter === "pending"
                      ? "bg-[#FFA500]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setPaymentFilter("pending")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      paymentFilter === "pending"
                        ? "text-white"
                        : "text-[#6B7280]"
                    }`}
                  >
                    Payment Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full ${
                    paymentFilter === "failed"
                      ? "bg-[#FF3B30]"
                      : "bg-white border border-gray-200"
                  }`}
                  onPress={() => setPaymentFilter("failed")}
                >
                  <Text
                    className={`text-sm font-medium ${
                      paymentFilter === "failed"
                        ? "text-white"
                        : "text-[#6B7280]"
                    }`}
                  >
                    Failed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Results Count & Reset */}
            {(paymentFilter !== "all" || statusFilter !== "all") && (
              <View className="flex-row items-center justify-between mt-3 px-1">
                <Text className="text-xs text-[#6B7280]">
                  Showing {historyAppointments.length} result
                  {historyAppointments.length !== 1 ? "s" : ""}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPaymentFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <Text className="text-xs font-semibold text-[#4461F2]">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Appointments List */}
        {displayedAppointments.length > 0 ? (
          <View className="mb-[30px]">
            <View className="gap-4">
              {displayedAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  className="bg-[#4461F2] rounded-3xl p-5 relative overflow-hidden"
                  onPress={() => handleAppointmentPress(appointment.id)}
                >
                  {/* Header with Status Badges */}
                  <View className="flex-row justify-between items-start mb-5">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-white mb-2">
                        {appointment.status === "completed"
                          ? "Completed Appointment"
                          : appointment.status === "cancelled"
                            ? "Cancelled Appointment"
                            : "Upcoming Appointment"}
                      </Text>
                      {/* Payment Status Badge - Only show if not cancelled */}
                      {appointment?.status !== "cancelled" && (
                        <View className="flex-row items-center gap-2">
                          <View
                            className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${
                              getPaymentStatusColor(
                                appointment?.payment?.status,
                              )?.bg
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
                      )}
                      {/* Show Cancelled Badge */}
                      {appointment?.status === "cancelled" && (
                        <View className="flex-row items-center gap-2">
                          <View className="px-3 py-1 rounded-full flex-row items-center gap-1 bg-[#FF3B30]/10">
                            <Ionicons
                              name="close-circle"
                              size={14}
                              color="#FF3B30"
                            />
                            <Text className="text-xs font-semibold text-[#FF3B30]">
                              Cancelled
                            </Text>
                          </View>
                        </View>
                      )}
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
                        name={
                          getServiceIcon(appointment.serviceCategory) as any
                        }
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
                          {appointment.location.label}
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

                  {/* Nurse/Patient Info */}
                  {getUserInfo(appointment) && (
                    <View className="bg-white rounded-2xl p-4 flex-row items-center gap-3 mt-3">
                      <Image
                        source={{
                          uri: `https://i.pravatar.cc/150?u=${
                            getUserInfo(appointment)?.email
                          }`,
                        }}
                        className="w-12 h-12 rounded-full"
                      />
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold text-[#2D3142] mb-1">
                          {getUserInfo(appointment)?.name}
                        </Text>
                        <Text className="text-xs text-[#9E9E9E]">
                          {getUserInfo(appointment)?.role}
                        </Text>
                      </View>
                      <Ionicons
                        name="person-circle-outline"
                        size={24}
                        color="#4461F2"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-[20px] p-8 mb-[30px] items-center">
            <Ionicons name="calendar-outline" size={48} color="#9E9E9E" />
            <Text className="text-base text-[#2D3142] font-semibold mt-4 mb-2">
              No {activeTab} appointments
            </Text>
            <Text className="text-sm text-[#9E9E9E] text-center">
              {activeTab === "upcoming"
                ? "Book your first appointment to get started"
                : paymentFilter !== "all" || statusFilter !== "all"
                  ? "No appointments match your filters"
                  : "Your completed and cancelled appointments will appear here"}
            </Text>
            {activeTab === "history" &&
              (paymentFilter !== "all" || statusFilter !== "all") && (
                <TouchableOpacity
                  className="mt-4 bg-[#4461F2] px-6 py-3 rounded-full"
                  onPress={() => {
                    setPaymentFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <Text className="text-white font-semibold text-sm">
                    Reset Filters
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
