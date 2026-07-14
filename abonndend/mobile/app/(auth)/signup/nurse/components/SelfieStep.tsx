import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui";
import CameraModal from "./CameraModal";
import CaptureCard from "./CaptureCard";

interface SelfieStepProps {
  selfieUri: string | undefined;
  setSelfieUri: (value: string | undefined) => void;
}

export default function SelfieStep({ selfieUri, setSelfieUri }: SelfieStepProps) {
  const [cameraVisible, setCameraVisible] = useState(false);

  return (
    <View>
      <Text variant="h1" color="foreground">
        Selfie verification
      </Text>
      <Text variant="body" color="muted" className="mt-2 mb-6">
        Take a selfie in a well-lit area with your face centered and clearly
        visible.
      </Text>

      <CaptureCard
        title="Selfie"
        hint="Remove hats or sunglasses so we can see your face"
        uri={selfieUri}
        onCapture={() => setCameraVisible(true)}
        onRetake={() => setSelfieUri(undefined)}
        square
      />

      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={(uri) => setSelfieUri(uri)}
        cameraType="front"
        title="Take Selfie"
      />
    </View>
  );
}
