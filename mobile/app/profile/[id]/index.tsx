import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "About" | "Schedule" | "Ratings";

export default function NurseProfile() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<TabType>("About");
  const [nurse, setNurse] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNurseData = async () => {
      try {
        if (!currentUser?.token) {
          console.error("No access token");
          setLoading(false);
          return;
        }

        const result = await api.getUserById(currentUser.token, id as string);
        if (result.success) {
          setNurse(result.data);
        } else {
          console.error("Failed to load nurse data:", result);
        }
      } catch (error) {
        console.error("Error loading nurse data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNurseData();
  }, [id, currentUser]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <ActivityIndicator size="large" color="#4461F2" />
      </View>
    );
  }

  if (!nurse) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center px-6">
        <Ionicons name="person-outline" size={64} color="#9E9E9E" />
        <Text className="text-xl font-semibold text-[#2D3142] mt-4">
          Nurse Not Found
        </Text>
        <Text className="text-sm text-[#9E9E9E] mt-2 text-center">
          The nurse profile you&apos;re looking for doesn&apos;t exist.
        </Text>
        <TouchableOpacity
          className="bg-[#4461F2] px-6 py-3 rounded-full mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const firstName = nurse.fullName.split(" ")[0];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-100">
      <StatusBar hidden />

      {/* Header with Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          className="w-10 h-10 bg-white/90 rounded-full justify-center items-center shadow-lg"
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3142" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient */}
        <View className="relative h-100">
          {/* Gradient Background */}
          <View className="absolute inset-0 bg-[#4461F2]" />

          {/* Profile Image */}
          <View className="absolute bottom-0 left-0 right-0 items-center pb-8">
            <Image
              source={{ uri: `https://i.pravatar.cc/300?u=${nurse.email}` }}
              className="w-70 h-70 rounded-full border-8 border-white shadow-xl mb-4"
            />
            <Text className="text-[32px] font-bold text-white drop-shadow-lg">
              {firstName}
            </Text>
            <Text className="text-lg text-white/90">Nurse</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="px-4 pt-6 pb-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === "About" ? "bg-[#4461F2]" : "bg-white"
              } shadow-sm`}
              onPress={() => setActiveTab("About")}
            >
              <Text
                className={`text-[15px] font-semibold ${
                  activeTab === "About" ? "text-white" : "text-[#2D3142]"
                }`}
              >
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === "Schedule" ? "bg-[#4461F2]" : "bg-white"
              } shadow-sm`}
              onPress={() => setActiveTab("Schedule")}
            >
              <Text
                className={`text-[15px] font-semibold ${
                  activeTab === "Schedule" ? "text-white" : "text-[#2D3142]"
                }`}
              >
                Schedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === "Ratings" ? "bg-[#4461F2]" : "bg-white"
              } shadow-sm`}
              onPress={() => setActiveTab("Ratings")}
            >
              <Text
                className={`text-[15px] font-semibold ${
                  activeTab === "Ratings" ? "text-white" : "text-[#2D3142]"
                }`}
              >
                Ratings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pb-32">
          {activeTab === "About" && (
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              <Text className="text-xl font-bold text-[#2D3142] mb-3">
                {nurse.fullName}
              </Text>
              <Text className="text-[15px] text-[#9E9E9E] leading-6 text-justify">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
                massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                sapien fringilla, mattis ligula consectetur, ultrices mauris.
                Maecenas vitae mattis tellus. Nullam quis imperdiet augue.
                Vestibulum auctor ornare leo, non suscipit magna interdum eu.
                Curabitur pellentesque nibh nibh, at maximus diam molestie ac.
                Mauris fermentum commodo lacus at sodales sodales.
              </Text>

              {/* Contact Information */}
              <View className="mt-6 pt-5 border-t border-gray-100">
                <Text className="text-lg font-semibold text-[#2D3142] mb-4">
                  Contact Information
                </Text>
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-10 h-10 bg-[#4461F2]/10 rounded-full items-center justify-center">
                    <Ionicons name="mail-outline" size={20} color="#4461F2" />
                  </View>
                  <Text className="text-[15px] text-[#2D3142]">
                    {nurse.email}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-[#4461F2]/10 rounded-full items-center justify-center">
                    <Ionicons name="call-outline" size={20} color="#4461F2" />
                  </View>
                  <Text className="text-[15px] text-[#2D3142]">
                    {nurse.phoneNumber}
                  </Text>
                </View>
              </View>

              {/* Specializations */}
              <View className="mt-6 pt-5 border-t border-gray-100">
                <Text className="text-lg font-semibold text-[#2D3142] mb-4">
                  Specializations
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  <View className="bg-[#4461F2]/10 px-4 py-2 rounded-full">
                    <Text className="text-sm font-medium text-[#4461F2]">
                      Home Care
                    </Text>
                  </View>
                  <View className="bg-[#32CD32]/10 px-4 py-2 rounded-full">
                    <Text className="text-sm font-medium text-[#32CD32]">
                      Elderly Care
                    </Text>
                  </View>
                  <View className="bg-[#FF3B30]/10 px-4 py-2 rounded-full">
                    <Text className="text-sm font-medium text-[#FF3B30]">
                      Emergency Care
                    </Text>
                  </View>
                  <View className="bg-[#FFA500]/10 px-4 py-2 rounded-full">
                    <Text className="text-sm font-medium text-[#FFA500]">
                      Pediatric Care
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === "Schedule" && (
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              <Text className="text-xl font-bold text-[#2D3142] mb-4">
                Available Schedule
              </Text>

              {/* Days of the week */}
              {[
                { day: "Monday", time: "9:00 AM - 5:00 PM" },
                { day: "Tuesday", time: "9:00 AM - 5:00 PM" },
                { day: "Wednesday", time: "9:00 AM - 5:00 PM" },
                { day: "Thursday", time: "9:00 AM - 5:00 PM" },
                { day: "Friday", time: "9:00 AM - 5:00 PM" },
                { day: "Saturday", time: "10:00 AM - 2:00 PM" },
                { day: "Sunday", time: "Unavailable" },
              ].map((schedule, index) => (
                <View
                  key={index}
                  className={`flex-row justify-between items-center py-4 ${
                    index !== 6 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <Text className="text-[15px] font-semibold text-[#2D3142]">
                    {schedule.day}
                  </Text>
                  <Text
                    className={`text-[15px] ${
                      schedule.time === "Unavailable"
                        ? "text-[#FF3B30]"
                        : "text-[#9E9E9E]"
                    }`}
                  >
                    {schedule.time}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === "Ratings" && (
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              <View className="items-center mb-6 pb-6 border-b border-gray-100">
                <Text className="text-5xl font-bold text-[#2D3142] mb-2">
                  4.9
                </Text>
                <View className="flex-row items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= 4 ? "star" : "star-half"}
                      size={24}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text className="text-sm text-[#9E9E9E]">
                  Based on 127 reviews
                </Text>
              </View>

              {/* Reviews */}
              {[
                {
                  name: "Sarah Johnson",
                  rating: 5,
                  comment:
                    "Excellent care and very professional. Highly recommend!",
                  date: "2 weeks ago",
                },
                {
                  name: "Michael Brown",
                  rating: 5,
                  comment:
                    "Very attentive and knowledgeable. Made my recovery so much easier.",
                  date: "1 month ago",
                },
                {
                  name: "Emily Davis",
                  rating: 4,
                  comment: "Great service overall. Very punctual and caring.",
                  date: "1 month ago",
                },
              ].map((review, index) => (
                <View
                  key={index}
                  className={`py-4 ${
                    index !== 2 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-[#2D3142]">
                        {review.name}
                      </Text>
                      <Text className="text-xs text-[#9E9E9E] mt-1">
                        {review.date}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={14}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                  </View>
                  <Text className="text-[14px] text-[#9E9E9E] leading-5">
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
