import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function MyProfile() {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return (
      <View className="flex-1 bg-[#F9FAFB]">
        <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#1F2937]">
            My Profile
          </Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-[#6B7280]">
            No user data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">My Profile</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Ionicons name="create-outline" size={24} color="#4461F2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View className="items-center py-8 bg-white mb-4">
          <View className="relative">
            <View className="w-[100px] h-[100px] rounded-full bg-[#EEF2FF] items-center justify-center border-4 border-[#E0E7FF]">
              <Ionicons name="person" size={50} color="#4461F2" />
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#4461F2] items-center justify-center border-3 border-white">
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
        <View className="px-6 mb-6">
          <Text className="text-base font-semibold text-[#1F2937] mb-3">
            Personal Information
          </Text>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                <Ionicons name="person-outline" size={22} color="#4461F2" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-[#6B7280] mb-1">
                  Full Name
                </Text>
                <Text className="text-base font-semibold text-[#1F2937]">
                  {currentUser.fullName}
                </Text>
              </View>
            </View>

            <View className="h-px bg-[#F3F4F6] my-4" />

            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                <Ionicons name="mail-outline" size={22} color="#4461F2" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-[#6B7280] mb-1">Email</Text>
                <Text className="text-base font-semibold text-[#1F2937]">
                  {currentUser.email}
                </Text>
              </View>
            </View>

            <View className="h-px bg-[#F3F4F6] my-4" />

            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                <Ionicons name="call-outline" size={22} color="#4461F2" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-[#6B7280] mb-1">
                  Phone Number
                </Text>
                <Text className="text-base font-semibold text-[#1F2937]">
                  {currentUser.phoneNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6">
          <TouchableOpacity className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm">
            <Ionicons name="key-outline" size={22} color="#4461F2" />
            <Text className="flex-1 text-[15px] font-medium text-[#374151] ml-3">
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm">
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#4461F2"
            />
            <Text className="flex-1 text-[15px] font-medium text-[#374151] ml-3">
              Privacy Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
