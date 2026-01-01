import { api } from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface EmergencyStatus {
  appointment: {
    _id: string;
    status: string;
    service: string;
    nurse?: {
      name: string;
      phoneNumber: string;
    };
    nurseLocation?: {
      latitude: number;
      longitude: number;
      updatedAt: string;
    };
  };
  emergencyRequest: {
    status: string;
    eta?: string;
    assignedPersonnel?: any[];
  };
}

interface EmergencyStatusTrackerProps {
  appointmentId: string;
  onClose: () => void;
}

const statusConfig = {
  pending: {
    icon: "time-outline",
    color: "#F59E0B",
    label: "Request Submitted",
    description:
      "Your emergency request has been received and is being processed.",
  },
  dispatched: {
    icon: "car-outline",
    color: "#3B82F6",
    label: "Help Dispatched",
    description: "Emergency personnel have been dispatched to your location.",
  },
  "en-route": {
    icon: "navigate-outline",
    color: "#8B5CF6",
    label: "On the Way",
    description: "Emergency personnel are on their way to you.",
  },
  "on-scene": {
    icon: "location-outline",
    color: "#10B981",
    label: "On Scene",
    description: "Emergency personnel have arrived at your location.",
  },
  completed: {
    icon: "checkmark-circle-outline",
    color: "#059669",
    label: "Completed",
    description: "Emergency service has been completed.",
  },
  cancelled: {
    icon: "close-circle-outline",
    color: "#EF4444",
    label: "Cancelled",
    description: "Emergency request has been cancelled.",
  },
};

export default function EmergencyStatusTracker({
  appointmentId,
  onClose,
}: EmergencyStatusTrackerProps) {
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const fetchStatus = async () => {
    try {
      const { accessToken } = await authStorage.getTokens();
      if (!accessToken) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      const response = await api.getEmergencyStatus(accessToken, appointmentId) as { data: EmergencyStatus };
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch emergency status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB] p-6">
        <ActivityIndicator size="large" color="#4461F2" />
        <Text className="text-[#6B7280] mt-4 font-medium">Loading emergency status...</Text>
      </View>
    );
  }

  if (error || !status) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F9FAFB] p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-[#EF4444] mt-4 text-center font-medium">
          {error || "Failed to load emergency status"}
        </Text>
      </View>
    );
  }

  const currentStatus =
    statusConfig[status.appointment.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-[#1F2937]">
            Emergency Status
          </Text>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-[#6B7280] mt-1">
          {status.appointment.service}
        </Text>
      </View>

      {/* Content */}
      <View className="px-6 mt-6">
        {/* Status Card */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View>
            <Text className="text-lg font-semibold text-[#1F2937] mb-2">
              {currentStatus.label}
            </Text>
            <Text className="text-sm text-[#6B7280] leading-5">
              {currentStatus.description}
            </Text>
          </View>
        </View>

        {/* Assigned Personnel */}
        {status.appointment.nurse && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-3">
              Assigned Personnel
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-outline" size={18} color="#6B7280" />
              <Text className="text-[#1F2937] ml-2 font-medium">
                {status.appointment.nurse.name}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text className="text-[#6B7280] ml-2">
                {status.appointment.nurse.phoneNumber}
              </Text>
            </View>
          </View>
        )}

        {/* ETA */}
        {status.emergencyRequest.eta && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-3">
              Estimated Arrival
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#4461F2" />
              <Text className="text-[#4461F2] ml-2 font-semibold text-base">
                {new Date(status.emergencyRequest.eta).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        )}

        {/* Footer Info */}
        <View className="mt-4 bg-[#EEF2FF] rounded-xl p-4">
          <View className="flex-row items-center justify-center">
            <Ionicons name="sync-outline" size={16} color="#6B7280" />
            <Text className="text-xs text-[#6B7280] ml-2 text-center">
              Status updates automatically every 30 seconds
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
