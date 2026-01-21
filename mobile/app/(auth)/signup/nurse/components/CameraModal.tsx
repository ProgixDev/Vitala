import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
  cameraType?: CameraType;
  title?: string;
}

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
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

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
        <View style={styles.container}>
          <Text style={styles.message}>Loading camera...</Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <Text style={styles.message}>
            We need your permission to access the camera
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={cameraType} ref={cameraRef}>
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerButton} onPress={onClose}>
                <Text style={styles.headerButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.headerButton} />
            </View>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Bottom Controls */}
            <View style={styles.controls}>
              <View style={styles.controlsInner}>
                <View style={{ width: 60 }} />
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleCapture}
                  disabled={isCapturing}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                <View style={{ width: 60 }} />
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  spacer: {
    flex: 1,
  },
  controls: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlsInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff",
  },
  message: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#4461F2",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
