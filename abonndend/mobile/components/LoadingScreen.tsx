import React from "react";
import { ActivityIndicator, Modal, View } from "react-native";
import { Text } from "@/components/ui";
import { shadow, useThemeColors } from "@/constants/theme";

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
  subtitle?: string;
}

export default function LoadingScreen({
  visible,
  message = "Loading...",
  subtitle,
}: LoadingScreenProps) {
  const colors = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        className="flex-1 items-center justify-center px-10"
        style={{ backgroundColor: "rgba(15,42,51,0.5)" }}
      >
        <View
          className="bg-surface rounded-xl p-8 items-center w-full max-w-xs"
          style={shadow.e3}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="h3" color="foreground" className="mt-4 text-center">
            {message}
          </Text>
          {subtitle ? (
            <Text variant="body" color="muted" className="mt-1.5 text-center">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
