import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  BackHandler,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface InfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, onPress }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-3.5 px-4"
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View className="flex-row items-center flex-1">
      <View className="w-9 h-9 rounded-lg bg-[#F0F2FF] items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#4461F2" />
      </View>
      <Text className="text-[15px] font-medium text-[#1F2937]">{label}</Text>
    </View>
    <View className="flex-row items-center gap-2">
      <Text className="text-sm text-[#6B7280]">{value}</Text>
      {onPress && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
    </View>
  </TouchableOpacity>
);

interface LinkItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-3.5 px-4"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center flex-1">
      <View className="w-9 h-9 rounded-lg bg-[#F0F2FF] items-center justify-center mr-3">
        <Ionicons name={icon} size={22} color="#4461F2" />
      </View>
      <Text className="text-[15px] font-medium text-[#1F2937]">{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function About() {
  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);
  const handleOpenWebsite = () => {
    Linking.openURL("https://vitalahealth.com");
  };

  const handleOpenEmail = () => {
    Linking.openURL("mailto:support@vitalahealth.com");
  };

  const handleOpenPrivacyPolicy = () => {
    console.log("Open Privacy Policy");
  };

  const handleOpenTerms = () => {
    console.log("Open Terms & Conditions");
  };

  const handleOpenLicenses = () => {
    console.log("Open Open Source Licenses");
  };

  const handleRateApp = () => {
    console.log("Rate App");
  };

  const handleShareApp = () => {
    console.log("Share App");
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">About App</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View className="items-center py-10 bg-white mb-4">
          <View className="w-24 h-24 rounded-3xl bg-[#EEF2FF] items-center justify-center mb-4 border-3 border-[#E0E7FF]">
            <Ionicons name="medical" size={48} color="#4461F2" />
          </View>
          <Text className="text-2xl font-bold text-[#1F2937] mb-1">
            Vitala Health
          </Text>
          <Text className="text-sm text-[#6B7280] mb-4">
            Your Health, Our Priority
          </Text>
          <View className="bg-[#EEF2FF] px-4 py-1.5 rounded-full">
            <Text className="text-[13px] font-semibold text-[#4461F2]">
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* App Description */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
            About
          </Text>
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-[15px] text-[#4B5563] leading-6">
              Vitala is a comprehensive healthcare platform that connects you
              with quality medical services. Book appointments, access emergency
              services, and manage your health records all in one place.
            </Text>
          </View>
        </View>

        {/* App Information */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
            Information
          </Text>
          <View className="bg-white rounded-xl py-1 shadow-sm">
            <InfoItem
              icon="code-working-outline"
              label="Version"
              value="1.0.0"
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <InfoItem
              icon="calendar-outline"
              label="Release Date"
              value="December 2024"
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <InfoItem
              icon="document-text-outline"
              label="Build Number"
              value="100"
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <InfoItem icon="resize-outline" label="Size" value="45.2 MB" />
          </View>
        </View>

        {/* Links */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
            Legal & More
          </Text>
          <View className="bg-white rounded-xl py-1 shadow-sm">
            <LinkItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={handleOpenPrivacyPolicy}
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <LinkItem
              icon="document-text-outline"
              title="Terms & Conditions"
              onPress={handleOpenTerms}
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <LinkItem
              icon="code-slash-outline"
              title="Open Source Licenses"
              onPress={handleOpenLicenses}
            />
          </View>
        </View>

        {/* Contact */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
            Contact
          </Text>
          <View className="bg-white rounded-xl py-1 shadow-sm">
            <LinkItem
              icon="globe-outline"
              title="Visit Website"
              onPress={handleOpenWebsite}
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <LinkItem
              icon="mail-outline"
              title="Email Support"
              onPress={handleOpenEmail}
            />
          </View>
        </View>

        {/* Actions */}
        <View className="px-6 mt-6">
          <Text className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
            Support Us
          </Text>
          <View className="bg-white rounded-xl py-1 shadow-sm">
            <LinkItem
              icon="star-outline"
              title="Rate App"
              onPress={handleRateApp}
            />
            <View className="h-px bg-[#F3F4F6] ml-16" />
            <LinkItem
              icon="share-social-outline"
              title="Share App"
              onPress={handleShareApp}
            />
          </View>
        </View>

        {/* Social Media */}
        <View className="px-6 mt-8 items-center">
          <Text className="text-base font-semibold text-[#1F2937] mb-4">
            Follow Us
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-[#F0F2FF] items-center justify-center border border-[#E0E7FF]"
              onPress={() => Linking.openURL("https://facebook.com")}
            >
              <Ionicons name="logo-facebook" size={24} color="#4461F2" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-[#F0F2FF] items-center justify-center border border-[#E0E7FF]"
              onPress={() => Linking.openURL("https://twitter.com")}
            >
              <Ionicons name="logo-twitter" size={24} color="#4461F2" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-[#F0F2FF] items-center justify-center border border-[#E0E7FF]"
              onPress={() => Linking.openURL("https://instagram.com")}
            >
              <Ionicons name="logo-instagram" size={24} color="#4461F2" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-12 h-12 rounded-full bg-[#F0F2FF] items-center justify-center border border-[#E0E7FF]"
              onPress={() => Linking.openURL("https://linkedin.com")}
            >
              <Ionicons name="logo-linkedin" size={24} color="#4461F2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-8 px-6">
          <Text className="text-sm text-[#6B7280] mb-2">
            Made with ❤️ for better healthcare
          </Text>
          <Text className="text-xs text-[#9CA3AF]">
            © 2024 Vitala Health. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
