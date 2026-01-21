import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import CameraModal from "./CameraModal";

interface IdCaptureStepProps {
  idFrontUri: string | undefined;
  setIdFrontUri: (value: string | undefined) => void;
  idBackUri: string | undefined;
  setIdBackUri: (value: string | undefined) => void;
}

export default function IdCaptureStep({
  idFrontUri,
  setIdFrontUri,
  idBackUri,
  setIdBackUri,
}: IdCaptureStepProps) {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [captureType, setCaptureType] = useState<"front" | "back">("front");

  const openCamera = (type: "front" | "back") => {
    setCaptureType(type);
    setCameraVisible(true);
  };

  const handleCapture = (uri: string) => {
    if (captureType === "front") {
      setIdFrontUri(uri);
    } else {
      setIdBackUri(uri);
    }
  };

  return (
    <>
      <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
        Government ID
      </Text>

      <Text className="text-gray-600 text-center mb-8 px-6">
        We need a clear photo of the front and back of your ID for verification.
      </Text>

      <View className="mb-6">
        <CaptureCard
          title="ID Front"
          uri={idFrontUri}
          onCapture={() => openCamera("front")}
          onRetake={() => setIdFrontUri(undefined)}
        />
      </View>

      <View className="mb-6">
        <CaptureCard
          title="ID Back"
          uri={idBackUri}
          onCapture={() => openCamera("back")}
          onRetake={() => setIdBackUri(undefined)}
        />
      </View>

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
        cameraType="back"
        title={`ID ${captureType === "front" ? "Front" : "Back"}`}
      />
    </>
  );
}

function CaptureCard({
  title,
  uri,
  onCapture,
  onRetake,
}: {
  title: string;
  uri?: string;
  onCapture: () => void;
  onRetake: () => void;
}) {
  return (
    <View className="bg-white rounded-3xl p-4 shadow-sm">
      <Text className="text-base font-semibold text-[#2D3142] mb-3">
        {title}
      </Text>
      {uri ? (
        <View className="items-start gap-3">
          <Image
            source={{ uri }}
            style={{ width: 240, height: 140, borderRadius: 12 }}
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
