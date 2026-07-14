import { router } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { t } from "@/utils/i18n";

function RoleCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Card onPress={onPress} elevation="e1" className="flex-row items-center">
      <View className="w-14 h-14 rounded-lg bg-primary-soft items-center justify-center mr-4">
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text variant="h3" color="foreground">
          {title}
        </Text>
        <Text variant="body" color="muted" className="mt-0.5">
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </Card>
  );
}

export default function ChooseRole() {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/signin");
      return true;
    });
    return () => backHandler.remove();
  }, []);

  return (
    <View className="flex-1 justify-center px-2">
      <Text variant="h1" color="foreground">
        {t("auth.chooseRole.title")}
      </Text>
      <Text variant="bodyLg" color="muted" className="mt-2 mb-8">
        {t("auth.chooseRole.subtitle")}
      </Text>

      <View className="gap-4">
        <RoleCard
          icon="heart-outline"
          title={t("auth.chooseRole.patient")}
          description={t("auth.chooseRole.patientDesc")}
          onPress={() => router.replace("/signup")}
        />
        <RoleCard
          icon="medkit-outline"
          title={t("auth.chooseRole.nurse")}
          description={t("auth.chooseRole.nurseDesc")}
          onPress={() => router.replace("/signup/nurse")}
        />
      </View>

      <Pressable
        onPress={() => router.replace("/signin")}
        hitSlop={8}
        className="self-center mt-8 py-2"
      >
        <Text variant="body" color="primary" weight="semibold">
          {t("common.back")}
        </Text>
      </Pressable>
    </View>
  );
}
