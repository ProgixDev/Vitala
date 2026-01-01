import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const relationships = [
  "spouse",
  "parent",
  "child",
  "sibling",
  "friend",
  "guardian",
  "other",
];

export default function AddEmergencyContact() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    isPrimary: false,
    address: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.relationship || !formData.phoneNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!currentUser?.token) {
      Alert.alert("Error", "You must be logged in to add emergency contacts");
      return;
    }
    setLoading(true);
    try {
      await api.addEmergencyContact(currentUser.token, formData);
      Alert.alert("Success", "Emergency contact added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add emergency contact");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        <Text className="text-lg font-semibold text-[#1F2937]">
          Add Emergency Contact
        </Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-6">

        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          {/* Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-2">
              Name *
            </Text>
            <TextInput
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-base bg-white"
              placeholder="Full name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
            />
          </View>

          {/* Relationship */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-2">
              Relationship *
            </Text>
            <View className="flex-row flex-wrap">
              {relationships.map((rel) => (
                <TouchableOpacity
                  key={rel}
                  onPress={() => updateFormData("relationship", rel)}
                  className={`border rounded-lg px-4 py-2 mr-2 mb-2 ${
                    formData.relationship === rel
                      ? "border-[#4461F2] bg-[#EEF2FF]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`capitalize text-sm ${
                      formData.relationship === rel
                        ? "text-[#4461F2] font-medium"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-2">
              Phone Number *
            </Text>
            <TextInput
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-base bg-white"
              placeholder="+1 (555) 123-4567"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData("phoneNumber", value)}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-2">
              Email (Optional)
            </Text>
            <TextInput
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-base bg-white"
              placeholder="email@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
            />
          </View>

          {/* Primary Contact */}
          <View className="flex-row items-center justify-between mb-4 bg-white border border-[#E5E7EB] rounded-lg p-4">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-medium text-[#374151]">
                Primary Contact
              </Text>
              <Text className="text-xs text-[#6B7280] mt-1">
                This person will be contacted first in emergencies
              </Text>
            </View>
            <Switch
              value={formData.isPrimary}
              onValueChange={(value) => updateFormData("isPrimary", value)}
              trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
              thumbColor={formData.isPrimary ? "#4461F2" : "#F3F4F6"}
            />
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-2">
              Address (Optional)
            </Text>
            <TextInput
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-base bg-white"
              placeholder="Street address, city, state, zip"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={formData.address}
              onChangeText={(value) => updateFormData("address", value)}
            />
          </View>

          {/* Notes */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-[#374151] mb-2">
              Notes (Optional)
            </Text>
            <TextInput
              className="border border-[#E5E7EB] rounded-lg px-4 py-3 text-base bg-white"
              placeholder="Any additional information..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={formData.notes}
              onChangeText={(value) => updateFormData("notes", value)}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`mt-6 py-4 rounded-xl ${
            loading ? "bg-[#9CA3AF]" : "bg-[#4461F2]"
          }`}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-base">
            {loading ? "Adding Contact..." : "Add Emergency Contact"}
          </Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
