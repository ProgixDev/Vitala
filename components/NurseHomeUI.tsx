import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Mock data for nurse UI
const mockNextPatient = {
  name: "Cody Fisher",
  role: "Patient",
  date: "Mon, 11 June 2024",
  time: "08:00AM",
  image: "https://i.pravatar.cc/150?img=12",
};

const mockRequests = [
  {
    id: 1,
    name: "Jenny Wilson",
    role: "Patient",
    time: "12:00",
    rating: 5.0,
    status: "pending",
  },
];

export default function NurseHomeUI() {
  const { currentUser } = useCurrentUser();

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="py-5">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
              Hi, {currentUser?.fullName.split(" ")[0] || "Amelia"}
            </Text>
            <Text className="text-sm text-[#9E9E9E]">Welcome Back</Text>
          </View>
          <TouchableOpacity className="bg-[#FF3B30] rounded-full px-4 py-2 flex-row items-center gap-2">
            <Text className="text-white text-xs font-semibold">SOS</Text>
            <View className="bg-white rounded-full px-2 py-0.5">
              <Text className="text-[#FF3B30] text-xs font-bold">02</Text>
            </View>
            <Text className="text-white text-xs font-semibold">
              Emergency Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Your Next Patient */}
      <View className="mb-[30px]">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-[#2D3142]">
            Your next patient
          </Text>
          <TouchableOpacity>
            <Text className="text-sm text-[#4461F2] font-medium">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-[20px] p-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: mockNextPatient.image }}
              className="w-12 h-12 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#2D3142] mb-0.5">
                {mockNextPatient.name}
              </Text>
              <Text className="text-xs text-[#9E9E9E]">
                {mockNextPatient.role}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <View>
              <Text className="text-sm font-semibold text-[#4461F2] mb-0.5">
                {mockNextPatient.date}
              </Text>
            </View>
            <Text className="text-base font-bold text-[#2D3142]">
              {mockNextPatient.time}
            </Text>
          </View>
        </View>
      </View>

      {/* Motivational Banner */}
      <View className="bg-[#4461F2] rounded-[20px] p-5 pr-0 pb-0 overflow-hidden mb-[30px] flex-row">
        <View className="flex-1">
          <Text className="text-xs text-white mb-3 opacity-90">
            Your Patients Rely On You
          </Text>
          <Text className="text-2xl font-bold text-white leading-[30px]">
            Make Every Visit
          </Text>
          <Text className="text-2xl font-bold text-white leading-[30px]">
            Count
          </Text>
          <View className="flex-row items-center mt-4 gap-3">
            <View className="flex-row -ml-2">
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=1" }}
                className="w-8 h-8 rounded-full border-2 border-[#4461F2] -ml-2"
              />
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=2" }}
                className="w-8 h-8 rounded-full border-2 border-[#4461F2] -ml-2"
              />
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=3" }}
                className="w-8 h-8 rounded-full border-2 border-[#4461F2] -ml-2"
              />
            </View>
            <View>
              <Text className="text-sm font-bold text-white">30,000+</Text>
              <Text className="text-xs text-white opacity-80">
                Happy Patients
              </Text>
            </View>
          </View>
        </View>
        <Image
          source={require("@/assets/images/doctor.png")}
          className="h-[180px] relative -right-2.5 bottom-0"
          resizeMode="contain"
        />
      </View>

      {/* Your Requests */}
      <View className="mb-[30px]">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-[#2D3142]">
            Your Requests
          </Text>
          <TouchableOpacity>
            <Text className="text-sm text-[#4461F2] font-medium">
              See All
            </Text>
          </TouchableOpacity>
        </View>

        {mockRequests.map((request) => (
          <View
            key={request.id}
            className="bg-white rounded-[20px] p-4 shadow-sm mb-3"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{
                    uri: `https://i.pravatar.cc/150?img=${request.id + 5}`,
                  }}
                  className="w-12 h-12 rounded-full"
                />
                <View>
                  <Text className="text-base font-semibold text-[#2D3142] mb-0.5">
                    {request.name}
                  </Text>
                  <Text className="text-xs text-[#9E9E9E]">
                    {request.role}
                  </Text>
                </View>
              </View>
              <View className="bg-[#6B7280] rounded-full px-3 py-1 flex-row items-center gap-1">
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text className="text-white text-xs font-semibold">
                  {request.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <TouchableOpacity className="w-10 h-10 bg-[#FEE2E2] rounded-full items-center justify-center">
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-[#2D3142]">
                  {request.time}
                </Text>
                <TouchableOpacity className="w-10 h-10 bg-[#D1FAE5] rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Text className="text-sm text-[#4461F2] font-medium">
                  See Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
