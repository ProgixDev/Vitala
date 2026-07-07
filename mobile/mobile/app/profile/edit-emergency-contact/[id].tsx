import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

interface EmergencyContact {
  _id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
  address?: string;
  notes?: string;
}

export default function EditEmergencyContact() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { currentUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    isPrimary: false,
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    if (!currentUser?.token) {
      setFetchLoading(false);
      Alert.alert("Error", "You must be logged in");
      router.back();
      return;
    }
    try {
      const response = (await api.getEmergencyContacts(currentUser.token)) as {
        data: EmergencyContact[];
      };
      const contact = response.data.find((c: EmergencyContact) => c._id === id);
      if (contact) {
        setFormData({
          name: contact.name,
          relationship: contact.relationship,
          phoneNumber: contact.phoneNumber,
          email: contact.email || "",
          isPrimary: contact.isPrimary,
          address: contact.address || "",
          notes: contact.notes || "",
        });
      }
    } catch (error) {
      console.error("Error loading contact details:", error);
      Alert.alert("Error", "Failed to load contact details");
      router.back();
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.relationship || !formData.phoneNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!currentUser?.token) {
      Alert.alert(
        "Error",
        "You must be logged in to update emergency contacts",
      );
      return;
    }
    setLoading(true);
    try {
      await api.updateEmergencyContact(
        currentUser.token,
        id as string,
        formData,
      );
      Alert.alert("Success", "Emergency contact updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update emergency contact",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (fetchLoading) {
    return (
      <View className="flex-1 bg-[#F9FAFB] justify-center items-center">
        <Text className="text-gray-600">Loading contact details...</Text>
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
        <Text className="text-lg font-semibold text-[#1F2937]">
          Edit Emergency Contact
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
                className="border border-[#E5E7EB] bg-white rounded-lg px-4 py-3 text-base text-[#1F2937]"
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
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <Text
                      className={`capitalize ${
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
                className="border border-[#E5E7EB] bg-white rounded-lg px-4 py-3 text-base text-[#1F2937]"
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
                className="border border-[#E5E7EB] bg-white rounded-lg px-4 py-3 text-base text-[#1F2937]"
                placeholder="email@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
              />
            </View>

            {/* Primary Contact */}
            <View className="bg-white border border-[#E5E7EB] p-4 rounded-lg mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
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
            </View>

            {/* Address */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-[#374151] mb-2">
                Address (Optional)
              </Text>
              <TextInput
                className="border border-[#E5E7EB] bg-white rounded-lg px-4 py-3 text-base text-[#1F2937]"
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
                className="border border-[#E5E7EB] bg-white rounded-lg px-4 py-3 text-base text-[#1F2937]"
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
            className={`py-4 rounded-xl ${
              loading ? "bg-gray-400" : "bg-[#4461F2]"
            }`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? "Updating Contact..." : "Update Emergency Contact"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
