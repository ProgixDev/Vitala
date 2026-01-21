import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import CameraModal from "./CameraModal";

interface SelfieStepProps {
  selfieUri: string | undefined;
  setSelfieUri: (value: string | undefined) => void;
}

export default function SelfieStep({
  selfieUri,
  setSelfieUri,
}: SelfieStepProps) {
  const [cameraVisible, setCameraVisible] = useState(false);

  const handleCapture = (uri: string) => {
    setSelfieUri(uri);
  };
  return (
    <>
      <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
        Selfie Verification
      </Text>

      <Text className="text-gray-600 text-center mb-8 px-6">
        Take a selfie in a well-lit area. Make sure your face is centered and
        clearly visible.
      </Text>

      <View className="items-center mb-6">
        <CaptureCard
          title="Selfie"
          uri={selfieUri}
          onCapture={() => setCameraVisible(true)}
          onRetake={() => setSelfieUri(undefined)}
          square
        />
      </View>

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
        cameraType="front"
        title="Take Selfie"
      />
    </>
  );
}

function CaptureCard({
  title,
  uri,
  onCapture,
  onRetake,
  square,
}: {
  title: string;
  uri?: string;
  onCapture: () => void;
  onRetake: () => void;
  square?: boolean;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      <Text className="text-base font-semibold text-[#2D3142] mb-3">
        {title}
      </Text>
      {uri ? (
        <View className="items-center gap-3">
          <Image
            source={{ uri }}
            style={{
              width: square ? 200 : 240,
              height: square ? 200 : 140,
              borderRadius: 12,
            }}
          />
          <TouchableOpacity
            onPress={onRetake}
            className="border border-[#4461F2] rounded-3xl h-12 px-5 justify-center items-center"
          >
            <Text className="text-[#4461F2] font-semibold">Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onCapture}
          className="bg-[#4461F2] rounded-3xl h-12 px-5 justify-center items-center"
        >
          <Text className="text-white font-semibold">Open Camera</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
