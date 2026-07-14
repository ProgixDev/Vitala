import React, { useState, useRef } from "react";
import { View, Modal, Pressable, ActivityIndicator } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { Button, Text } from "@/components/ui";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
  cameraType?: CameraType;
  title?: string;
}

/**
 * Full-screen camera capture. The camera surface is intentionally dark (a
 * single-look UI), with white controls for contrast against the viewfinder.
 */
export default function CameraModal({
  visible,
  onClose,
  onCapture,
  cameraType = "back",
  title = "Take Photo",
}: CameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        onCapture(photo.uri);
        onClose();
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View className="flex-1 bg-black items-center justify-center">
          <ActivityIndicator color="#FFFFFF" />
          <Text variant="body" color="inherit" className="text-white mt-3">
            Loading camera…
          </Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View className="flex-1 bg-black items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center mb-4">
            <Ionicons name="camera-outline" size={30} color="#FFFFFF" />
          </View>
          <Text variant="h3" color="inherit" className="text-white text-center">
            Camera access needed
          </Text>
          <Text
            variant="body"
            color="inherit"
            className="text-white/70 text-center mt-2 mb-6"
          >
            We use your camera to verify your identity documents.
          </Text>
          <Button label="Grant permission" onPress={requestPermission} size="lg" />
          <Pressable onPress={onClose} hitSlop={8} className="mt-4 py-2">
            <Text variant="body" color="inherit" className="text-white/70">
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <CameraView style={{ flex: 1 }} facing={cameraType} ref={cameraRef}>
          <View className="flex-1 justify-between">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-14 pb-4">
              <Pressable
                onPress={onClose}
                hitSlop={8}
                accessibilityLabel="Close camera"
                className="w-10 h-10 items-center justify-center rounded-full bg-black/40"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
              <Text variant="h3" color="inherit" className="text-white">
                {title}
              </Text>
              <View className="w-10" />
            </View>

            {/* Shutter */}
            <View className="items-center pb-12">
              <Pressable
                onPress={handleCapture}
                disabled={isCapturing}
                accessibilityLabel="Capture photo"
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <View className="w-16 h-16 rounded-full bg-white" />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}
