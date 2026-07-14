import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  Card,
  Chip,
  Divider,
  EmptyState,
  IconButton,
  Screen,
  Skeleton,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";

type TabType = "About" | "Schedule" | "Ratings";

const TABS: TabType[] = ["About", "Schedule", "Ratings"];

const SPECIALIZATIONS = [
  "Home Care",
  "Elderly Care",
  "Emergency Care",
  "Pediatric Care",
];

const SCHEDULE = [
  { day: "Monday", time: "9:00 AM - 5:00 PM" },
  { day: "Tuesday", time: "9:00 AM - 5:00 PM" },
  { day: "Wednesday", time: "9:00 AM - 5:00 PM" },
  { day: "Thursday", time: "9:00 AM - 5:00 PM" },
  { day: "Friday", time: "9:00 AM - 5:00 PM" },
  { day: "Saturday", time: "10:00 AM - 2:00 PM" },
  { day: "Sunday", time: "Unavailable" },
];

const REVIEWS = [
  {
    name: "Sarah Johnson",
    rating: 5,
    comment: "Excellent care and very professional. Highly recommend!",
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
];

export default function NurseProfile() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
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
      <Screen edges={["top"]}>
        <View className="items-center pt-10">
          <Skeleton width={112} height={112} radius={56} />
          <View className="h-4" />
          <Skeleton width={140} height={22} />
          <View className="h-2" />
          <Skeleton width={80} height={14} />
        </View>
        <View className="flex-row gap-2 mt-8">
          <Skeleton width={90} height={40} radius={20} />
          <Skeleton width={90} height={40} radius={20} />
          <Skeleton width={90} height={40} radius={20} />
        </View>
        <View className="mt-6">
          <Skeleton width="100%" height={180} radius={24} />
        </View>
      </Screen>
    );
  }

  if (!nurse) {
    return (
      <Screen edges={["top"]} className="justify-center">
        <EmptyState
          icon="person-outline"
          title="Nurse Not Found"
          message="The nurse profile you're looking for doesn't exist."
          tone="error"
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const firstName = nurse.fullName.split(" ")[0];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar hidden />

      {/* Floating back button */}
      <View className="absolute top-12 left-4 z-10">
        <IconButton
          icon="arrow-back"
          onPress={handleGoBack}
          variant="surface"
          accessibilityLabel="Go back"
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="bg-primary items-center pt-20 pb-8 px-5">
          <Image
            source={{ uri: `https://i.pravatar.cc/300?u=${nurse.email}` }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
            className="border-4 border-surface mb-4"
          />
          <Text variant="h1" color="onPrimary">
            {firstName}
          </Text>
          <View className="mt-2">
            <Badge label="Nurse" tone="neutral" icon="medkit-outline" />
          </View>
        </View>

        {/* Tabs */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row gap-2">
            {TABS.map((tab) => (
              <Chip
                key={tab}
                label={tab}
                selected={activeTab === tab}
                onPress={() => setActiveTab(tab)}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <View className="px-5 pb-32">
          {activeTab === "About" && (
            <Card elevation="e1" className="p-5">
              <Text variant="h2" color="foreground" className="mb-3">
                {nurse.fullName}
              </Text>
              <Text variant="body" color="muted">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et
                massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                sapien fringilla, mattis ligula consectetur, ultrices mauris.
                Maecenas vitae mattis tellus. Nullam quis imperdiet augue.
                Vestibulum auctor ornare leo, non suscipit magna interdum eu.
                Curabitur pellentesque nibh nibh, at maximus diam molestie ac.
                Mauris fermentum commodo lacus at sodales sodales.
              </Text>

              {/* Contact Information */}
              <Divider className="my-5" />
              <Text variant="h3" color="foreground" className="mb-4">
                Contact Information
              </Text>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-primary-soft rounded-full items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color={colors.primary} />
                </View>
                <Text variant="body" color="foreground">
                  {nurse.email}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary-soft rounded-full items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={20} color={colors.primary} />
                </View>
                <Text variant="body" color="foreground">
                  {nurse.phoneNumber}
                </Text>
              </View>

              {/* Specializations */}
              <Divider className="my-5" />
              <Text variant="h3" color="foreground" className="mb-4">
                Specializations
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <Chip key={spec} label={spec} />
                ))}
              </View>
            </Card>
          )}

          {activeTab === "Schedule" && (
            <Card elevation="e1" className="p-5">
              <Text variant="h2" color="foreground" className="mb-2">
                Available Schedule
              </Text>
              {SCHEDULE.map((schedule, index) => {
                const unavailable = schedule.time === "Unavailable";
                return (
                  <View key={index}>
                    <View className="flex-row justify-between items-center py-4">
                      <Text variant="body" weight="semibold" color="foreground">
                        {schedule.day}
                      </Text>
                      {unavailable ? (
                        <Badge label="Unavailable" tone="emergency" />
                      ) : (
                        <Text variant="body" color="muted">
                          {schedule.time}
                        </Text>
                      )}
                    </View>
                    {index !== SCHEDULE.length - 1 && <Divider />}
                  </View>
                );
              })}
            </Card>
          )}

          {activeTab === "Ratings" && (
            <Card elevation="e1" className="p-5">
              <View className="items-center pb-5">
                <Text variant="display" weight="headingBold" color="foreground">
                  4.9
                </Text>
                <View className="flex-row items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= 4 ? "star" : "star-half"}
                      size={22}
                      color={colors.warning}
                    />
                  ))}
                </View>
                <Text variant="label" color="muted">
                  Based on 127 reviews
                </Text>
              </View>
              <Divider />

              {/* Reviews */}
              {REVIEWS.map((review, index) => (
                <View key={index}>
                  <View className="py-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text variant="body" weight="semibold" color="foreground">
                          {review.name}
                        </Text>
                        <Text variant="caption" color="muted" className="mt-1">
                          {review.date}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name="star"
                            size={14}
                            color={colors.warning}
                          />
                        ))}
                      </View>
                    </View>
                    <Text variant="label" color="muted">
                      {review.comment}
                    </Text>
                  </View>
                  {index !== REVIEWS.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
