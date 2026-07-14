import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import CameraModal from "./CameraModal";
import CaptureCard from "./CaptureCard";

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
  const colors = useThemeColors();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [captureType, setCaptureType] = useState<"front" | "back">("front");

  const openCamera = (type: "front" | "back") => {
    setCaptureType(type);
    setCameraVisible(true);
  };

  const handleCapture = (uri: string) => {
    if (captureType === "front") setIdFrontUri(uri);
    else setIdBackUri(uri);
  };

  return (
    <View>
      <Text variant="h1" color="foreground">
        Government ID
      </Text>
      <Text variant="body" color="muted" className="mt-2 mb-6">
        We need a clear photo of the front and back of your ID to verify you.
      </Text>

      <View className="gap-4">
        <CaptureCard
          title="ID — Front"
          hint="Place your ID on a flat surface in good light"
          uri={idFrontUri}
          onCapture={() => openCamera("front")}
          onRetake={() => setIdFrontUri(undefined)}
        />
        <CaptureCard
          title="ID — Back"
          hint="Make sure all text is readable"
          uri={idBackUri}
          onCapture={() => openCamera("back")}
          onRetake={() => setIdBackUri(undefined)}
        />
      </View>

      <Card elevation="none" className="mt-5 bg-primary-soft border-0 flex-row items-start">
        <Ionicons
          name="shield-checkmark-outline"
          size={18}
          color={colors.primary}
          style={{ marginRight: 8, marginTop: 1 }}
        />
        <Text variant="caption" color="primary" className="flex-1">
          Your documents are used only for verification and stored securely.
        </Text>
      </Card>

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
        cameraType="back"
        title={`ID ${captureType === "front" ? "Front" : "Back"}`}
      />
    </View>
  );
}
