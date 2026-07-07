import React from "react";
import { View, Text, Image } from "react-native";

interface ReviewStepProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  idFrontUri: string | undefined;
  idBackUri: string | undefined;
  selfieUri: string | undefined;
}

export default function ReviewStep({
  fullName,
  email,
  phoneNumber,
  idFrontUri,
  idBackUri,
  selfieUri,
}: ReviewStepProps) {
  return (
    <>
      <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
        Review & Submit
      </Text>

      <Text className="text-gray-600 text-center mb-8 px-6">
        Please review your information before submitting.
      </Text>

      <View className="mb-6">
        <FieldRow label="Full Name" value={fullName} />
      </View>

      <View className="mb-6">
        <FieldRow label="Email" value={email} />
      </View>

      <View className="mb-6">
        <FieldRow label="Phone" value={phoneNumber} />
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          ID Photos
        </Text>
        <View className="flex-row gap-3">
          {idFrontUri && (
            <Image
              source={{ uri: idFrontUri }}
              style={{ width: 120, height: 80, borderRadius: 8 }}
            />
          )}
          {idBackUri && (
            <Image
              source={{ uri: idBackUri }}
              style={{ width: 120, height: 80, borderRadius: 8 }}
            />
          )}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          Selfie
        </Text>
        {selfieUri && (
          <Image
            source={{ uri: selfieUri }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        )}
      </View>

      <View className="bg-blue-50 rounded-2xl p-4 mb-6">
        <Text className="text-sm text-gray-600 text-center">
          By submitting, you consent to Vitala processing your information for
          verification purposes.
        </Text>
      </View>
    </>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-white rounded-2xl px-4 py-4 shadow-sm">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <Text className="text-base text-[#2D3142] font-medium">{value}</Text>
    </View>
  );
}
