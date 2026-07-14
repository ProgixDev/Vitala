import { Badge, Card, Divider, Header, IconButton, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Linking, TouchableOpacity, View } from "react-native";

interface InfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, onPress }) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3.5 px-4"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-9 h-9 rounded-md bg-primary-soft items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text variant="label" color="foreground">
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text variant="body" color="muted">
          {value}
        </Text>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.mutedForeground}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface LinkItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3.5 px-4"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-9 h-9 rounded-md bg-primary-soft items-center justify-center mr-3">
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <Text variant="label" color="foreground">
          {title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.mutedForeground}
      />
    </TouchableOpacity>
  );
};

export default function About() {
  const colors = useThemeColors();
  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);
  const handleOpenWebsite = () => {
    Linking.openURL("https://vitalahealth.com");
  };

  const handleOpenEmail = () => {
    Linking.openURL("mailto:support@vitalahealth.com");
  };

  const handleOpenPrivacyPolicy = () => {
    console.log("Open Privacy Policy");
  };

  const handleOpenTerms = () => {
    console.log("Open Terms & Conditions");
  };

  const handleOpenLicenses = () => {
    console.log("Open Open Source Licenses");
  };

  const handleRateApp = () => {
    console.log("Rate App");
  };

  const handleShareApp = () => {
    console.log("Share App");
  };

  return (
    <Screen scroll>
      <Header
        title="About App"
        onBack={() => router.replace("/(tabs)/profile")}
      />

      {/* App Logo and Name */}
      <View className="items-center pt-6 pb-8">
        <View className="w-24 h-24 rounded-3xl bg-primary-soft items-center justify-center mb-4 border border-border">
          <Ionicons name="medical" size={48} color={colors.primary} />
        </View>
        <Text variant="h2" color="foreground" className="mb-1">
          Vitala Health
        </Text>
        <Text variant="body" color="muted" className="mb-4">
          Your Health, Our Priority
        </Text>
        <Badge tone="primary" label="Version 1.0.0" />
      </View>

      {/* App Description */}
      <Text
        variant="caption"
        color="muted"
        weight="semibold"
        className="uppercase tracking-wider mb-2"
      >
        About
      </Text>
      <Card>
        <Text variant="body" color="muted" className="leading-6">
          Vitala is a comprehensive healthcare platform that connects you with
          quality medical services. Book appointments, access emergency
          services, and manage your health records all in one place.
        </Text>
      </Card>

      {/* App Information */}
      <Text
        variant="caption"
        color="muted"
        weight="semibold"
        className="uppercase tracking-wider mt-6 mb-2"
      >
        Information
      </Text>
      <Card padded={false} className="py-1">
        <InfoItem icon="code-working-outline" label="Version" value="1.0.0" />
        <Divider className="ml-16" />
        <InfoItem
          icon="calendar-outline"
          label="Release Date"
          value="December 2024"
        />
        <Divider className="ml-16" />
        <InfoItem
          icon="document-text-outline"
          label="Build Number"
          value="100"
        />
        <Divider className="ml-16" />
        <InfoItem icon="resize-outline" label="Size" value="45.2 MB" />
      </Card>

      {/* Links */}
      <Text
        variant="caption"
        color="muted"
        weight="semibold"
        className="uppercase tracking-wider mt-6 mb-2"
      >
        Legal & More
      </Text>
      <Card padded={false} className="py-1">
        <LinkItem
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          onPress={handleOpenPrivacyPolicy}
        />
        <Divider className="ml-16" />
        <LinkItem
          icon="document-text-outline"
          title="Terms & Conditions"
          onPress={handleOpenTerms}
        />
        <Divider className="ml-16" />
        <LinkItem
          icon="code-slash-outline"
          title="Open Source Licenses"
          onPress={handleOpenLicenses}
        />
      </Card>

      {/* Contact */}
      <Text
        variant="caption"
        color="muted"
        weight="semibold"
        className="uppercase tracking-wider mt-6 mb-2"
      >
        Contact
      </Text>
      <Card padded={false} className="py-1">
        <LinkItem
          icon="globe-outline"
          title="Visit Website"
          onPress={handleOpenWebsite}
        />
        <Divider className="ml-16" />
        <LinkItem
          icon="mail-outline"
          title="Email Support"
          onPress={handleOpenEmail}
        />
      </Card>

      {/* Actions */}
      <Text
        variant="caption"
        color="muted"
        weight="semibold"
        className="uppercase tracking-wider mt-6 mb-2"
      >
        Support Us
      </Text>
      <Card padded={false} className="py-1">
        <LinkItem icon="star-outline" title="Rate App" onPress={handleRateApp} />
        <Divider className="ml-16" />
        <LinkItem
          icon="share-social-outline"
          title="Share App"
          onPress={handleShareApp}
        />
      </Card>

      {/* Social Media */}
      <View className="mt-8 items-center">
        <Text variant="h3" color="foreground" className="mb-4">
          Follow Us
        </Text>
        <View className="flex-row gap-4">
          <IconButton
            icon="logo-facebook"
            variant="soft"
            color={colors.primary}
            accessibilityLabel="Facebook"
            onPress={() => Linking.openURL("https://facebook.com")}
          />
          <IconButton
            icon="logo-twitter"
            variant="soft"
            color={colors.primary}
            accessibilityLabel="Twitter"
            onPress={() => Linking.openURL("https://twitter.com")}
          />
          <IconButton
            icon="logo-instagram"
            variant="soft"
            color={colors.primary}
            accessibilityLabel="Instagram"
            onPress={() => Linking.openURL("https://instagram.com")}
          />
          <IconButton
            icon="logo-linkedin"
            variant="soft"
            color={colors.primary}
            accessibilityLabel="LinkedIn"
            onPress={() => Linking.openURL("https://linkedin.com")}
          />
        </View>
      </View>

      {/* Footer */}
      <View className="items-center py-8">
        <View className="flex-row items-center mb-2">
          <Text variant="body" color="muted">
            Made with{" "}
          </Text>
          <Ionicons name="heart" size={14} color={colors.emergency} />
          <Text variant="body" color="muted">
            {" "}
            for better healthcare
          </Text>
        </View>
        <Text variant="caption" color="muted">
          © 2024 Vitala Health. All rights reserved.
        </Text>
      </View>
    </Screen>
  );
}
