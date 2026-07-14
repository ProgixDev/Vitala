import React from "react";
import { View, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";

interface CaptureCardProps {
  title: string;
  hint?: string;
  uri?: string;
  onCapture: () => void;
  onRetake: () => void;
  square?: boolean;
}

/** Document/selfie capture tile: dashed placeholder → preview + retake. */
export default function CaptureCard({
  title,
  hint,
  uri,
  onCapture,
  onRetake,
  square,
}: CaptureCardProps) {
  const colors = useThemeColors();

  return (
    <Card elevation="e1">
      <Text variant="label" color="foreground" className="mb-3">
        {title}
      </Text>

      {uri ? (
        <View className="items-center">
          <Image
            source={{ uri }}
            style={{
              width: "100%",
              height: square ? 220 : 160,
              borderRadius: 14,
            }}
            resizeMode="cover"
          />
          <Button
            label="Retake"
            onPress={onRetake}
            variant="secondary"
            leftIcon="camera-reverse-outline"
            size="sm"
            fullWidth={false}
            className="mt-3 px-6"
          />
        </View>
      ) : (
        <Pressable
          onPress={onCapture}
          className="items-center justify-center rounded-lg border border-dashed border-border bg-surface-alt active:opacity-80"
          style={{ height: square ? 220 : 150 }}
        >
          <View className="w-12 h-12 rounded-full bg-primary-soft items-center justify-center mb-2">
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text variant="label" color="primary" weight="semibold">
            Open camera
          </Text>
          {hint && (
            <Text variant="caption" color="muted" className="mt-1 text-center px-6">
              {hint}
            </Text>
          )}
        </Pressable>
      )}
    </Card>
  );
}
