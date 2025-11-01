import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import IllustrationSvg from "@/assets/images/schedule.svg";

export default function Schedule() {
  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        className="flex-1 pt-10"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 mb-6">
          <View>
            <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
              Appointments
            </Text>
            <Text className="text-sm text-[#9E9E9E]">
              Organize all your schedules
            </Text>
          </View>
        </View>

        {/* Upcoming Appointments Card */}
        <TouchableOpacity className="bg-[#4461F2] rounded-3xl mx-5 p-5 mb-5">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-semibold text-white">
              Upcoming Appointments
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </View>

          <View className="flex-row justify-between mb-5 gap-3">
            <View className="flex-1 flex-row items-center gap-2.5">
              <View className="w-10 h-10 bg-white/20 rounded-xl justify-center items-center">
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-[11px] text-white/80 mb-0.5">
                  Appointments Date
                </Text>
                <Text className="text-[13px] font-semibold text-white">
                  Sun, 10 Jan 2025
                </Text>
              </View>
            </View>

            <View className="flex-1 flex-row items-center gap-2.5">
              <View className="w-10 h-10 bg-white/20 rounded-xl justify-center items-center">
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-[11px] text-white/80 mb-0.5">
                  Appointment Time
                </Text>
                <Text className="text-[13px] font-semibold text-white">
                  08:00 - 12:00
                </Text>
              </View>
            </View>
          </View>

          {/* Service Card */}
          <View className="bg-white rounded-2xl p-4 flex-row items-center gap-3">
            <View className="w-12 h-12 bg-[#E8EBFF] rounded-xl justify-center items-center">
              <Ionicons name="accessibility" size={24} color="#4461F2" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-[#2D3142] mb-1">
                Rehabilitation Care
              </Text>
              <Text className="text-xs text-[#9E9E9E] leading-4">
                personalized physiotherapy sessions.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Stay Organized Card */}
        <View className="bg-[#4461F2] rounded-3xl mx-5 p-6 pb-[140px] relative overflow-hidden">
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
