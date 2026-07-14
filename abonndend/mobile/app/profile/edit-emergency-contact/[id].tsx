import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  Chip,
  Header,
  Input,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Switch, View } from "react-native";

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
  const colors = useThemeColors();
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
      <Screen padded={false} edges={["top"]}>
        <View className="px-5">
          <Header
            title="Edit Emergency Contact"
            showBack
            onBack={() => router.back()}
          />
        </View>
        <View className="px-5 pt-4">
          <SkeletonList count={5} itemHeight={64} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll padded={false} edges={["top"]} keyboardAvoiding>
      <View className="px-5">
        <Header
          title="Edit Emergency Contact"
          showBack
          onBack={() => router.back()}
        />
      </View>

      <View className="px-5 pt-2">
        <Card elevation="e1" className="mb-4">
          {/* Name */}
          <Input
            label="Name"
            required
            placeholder="Full name"
            leftIcon="person-outline"
            value={formData.name}
            onChangeText={(value) => updateFormData("name", value)}
            containerClassName="mb-4"
          />

          {/* Relationship */}
          <View className="mb-4">
            <View className="flex-row mb-1.5">
              <Text variant="label" color="foreground">
                Relationship
              </Text>
              <Text variant="label" color="emergency" className="ml-0.5">
                *
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {relationships.map((rel) => (
                <Chip
                  key={rel}
                  label={rel}
                  selected={formData.relationship === rel}
                  onPress={() => updateFormData("relationship", rel)}
                  className="capitalize"
                />
              ))}
            </View>
          </View>

          {/* Phone Number */}
          <Input
            label="Phone Number"
            required
            placeholder="+1 (555) 123-4567"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData("phoneNumber", value)}
            containerClassName="mb-4"
          />

          {/* Email */}
          <Input
            label="Email"
            placeholder="email@example.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            containerClassName="mb-4"
          />

          {/* Primary Contact */}
          <View className="flex-row items-center justify-between mb-4 bg-surface-alt rounded-lg p-4">
            <View className="flex-1 mr-4">
              <Text variant="label" color="foreground">
                Primary Contact
              </Text>
              <Text variant="caption" color="muted" className="mt-1">
                This person will be contacted first in emergencies
              </Text>
            </View>
            <Switch
              value={formData.isPrimary}
              onValueChange={(value) => updateFormData("isPrimary", value)}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={formData.isPrimary ? colors.primary : colors.surface}
            />
          </View>

          {/* Address */}
          <Input
            label="Address"
            placeholder="Street address, city, state, zip"
            leftIcon="location-outline"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.address}
            onChangeText={(value) => updateFormData("address", value)}
            containerClassName="mb-4"
          />

          {/* Notes */}
          <Input
            label="Notes"
            placeholder="Any additional information..."
            leftIcon="document-text-outline"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.notes}
            onChangeText={(value) => updateFormData("notes", value)}
          />
        </Card>

        <Button
          label={loading ? "Updating Contact..." : "Update Emergency Contact"}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          size="lg"
        />
      </View>
    </Screen>
  );
}
