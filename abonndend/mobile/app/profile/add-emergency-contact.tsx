import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Button, Card, Chip, Header, Input, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function AddEmergencyContact() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
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
    <Screen scroll padded={false} edges={["top"]} keyboardAvoiding>
      <View className="px-5">
        <Header
          title="Add Emergency Contact"
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
          label={loading ? "Adding Contact..." : "Add Emergency Contact"}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          size="lg"
        />
      </View>
    </Screen>
  );
}
