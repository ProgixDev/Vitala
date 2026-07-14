import React from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Divider, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";

interface ReviewStepProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  idFrontUri: string | undefined;
  idBackUri: string | undefined;
  selfieUri: string | undefined;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="py-3">
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <Text variant="body" color="foreground" weight="medium" className="mt-0.5">
        {value || "—"}
      </Text>
    </View>
  );
}

export default function ReviewStep({
  fullName,
  email,
  phoneNumber,
  idFrontUri,
  idBackUri,
  selfieUri,
}: ReviewStepProps) {
  const colors = useThemeColors();
  return (
    <View>
      <Text variant="h1" color="foreground">
        Review &amp; submit
      </Text>
      <Text variant="body" color="muted" className="mt-2 mb-6">
        Please confirm everything is correct before submitting for review.
      </Text>

      <Card className="mb-4 py-1">
        <FieldRow label="Full name" value={fullName} />
        <Divider />
        <FieldRow label="Email" value={email} />
        <Divider />
        <FieldRow label="Phone" value={phoneNumber} />
      </Card>

      <Text variant="label" color="foreground" className="mb-3">
        ID photos
      </Text>
      <View className="flex-row gap-3 mb-5">
        {idFrontUri && (
          <Image
            source={{ uri: idFrontUri }}
            style={{ width: 140, height: 90, borderRadius: 12 }}
          />
        )}
        {idBackUri && (
          <Image
            source={{ uri: idBackUri }}
            style={{ width: 140, height: 90, borderRadius: 12 }}
          />
        )}
      </View>

      <Text variant="label" color="foreground" className="mb-3">
        Selfie
      </Text>
      {selfieUri && (
        <Image
          source={{ uri: selfieUri }}
          style={{ width: 96, height: 96, borderRadius: 48 }}
        />
      )}

      <Card elevation="none" className="mt-6 bg-primary-soft border-0 flex-row items-start">
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={colors.primary}
          style={{ marginRight: 8, marginTop: 1 }}
        />
        <Text variant="caption" color="primary" className="flex-1">
          By submitting, you consent to Vitala processing your information for
          verification purposes.
        </Text>
      </Card>
    </View>
  );
}
