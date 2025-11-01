import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface InfoItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, onPress }) => (
  <TouchableOpacity
    style={styles.infoItem}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={styles.infoLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color="#4461F2" />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <View style={styles.infoRight}>
      <Text style={styles.infoValue}>{value}</Text>
      {onPress && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
    </View>
  </TouchableOpacity>
);

interface LinkItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

const LinkItem: React.FC<LinkItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity
    style={styles.linkItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.linkLeft}>
      <View style={styles.linkIconContainer}>
        <Ionicons name={icon} size={22} color="#4461F2" />
      </View>
      <Text style={styles.linkTitle}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function About() {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About App</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo and Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="medical" size={48} color="#4461F2" />
          </View>
          <Text style={styles.appName}>Vitala Health</Text>
          <Text style={styles.appTagline}>Your Health, Our Priority</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* App Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.description}>
              Vitala is a comprehensive healthcare platform that connects you
              with quality medical services. Book appointments, access emergency
              services, and manage your health records all in one place.
            </Text>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoCard}>
            <InfoItem
              icon="code-working-outline"
              label="Version"
              value="1.0.0"
            />
            <View style={styles.divider} />
            <InfoItem
              icon="calendar-outline"
              label="Release Date"
              value="December 2024"
            />
            <View style={styles.divider} />
            <InfoItem
              icon="document-text-outline"
              label="Build Number"
              value="100"
            />
            <View style={styles.divider} />
            <InfoItem
              icon="resize-outline"
              label="Size"
              value="45.2 MB"
            />
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & More</Text>
          <View style={styles.linkCard}>
            <LinkItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={handleOpenPrivacyPolicy}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="document-text-outline"
              title="Terms & Conditions"
              onPress={handleOpenTerms}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="code-slash-outline"
              title="Open Source Licenses"
              onPress={handleOpenLicenses}
            />
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.linkCard}>
            <LinkItem
              icon="globe-outline"
              title="Visit Website"
              onPress={handleOpenWebsite}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="mail-outline"
              title="Email Support"
              onPress={handleOpenEmail}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Us</Text>
          <View style={styles.linkCard}>
            <LinkItem
              icon="star-outline"
              title="Rate App"
              onPress={handleRateApp}
            />
            <View style={styles.divider} />
            <LinkItem
              icon="share-social-outline"
              title="Share App"
              onPress={handleShareApp}
            />
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL("https://facebook.com")}
            >
              <Ionicons name="logo-facebook" size={24} color="#4461F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL("https://twitter.com")}
            >
              <Ionicons name="logo-twitter" size={24} color="#4461F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL("https://instagram.com")}
            >
              <Ionicons name="logo-instagram" size={24} color="#4461F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL("https://linkedin.com")}
            >
              <Ionicons name="logo-linkedin" size={24} color="#4461F2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for better healthcare
          </Text>
          <Text style={styles.copyright}>
            © 2024 Vitala Health. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#E0E7FF",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  versionBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4461F2",
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  description: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0F2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    color: "#6B7280",
  },
  linkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F0F2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 64,
  },
  socialSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: "center",
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  socialContainer: {
    flexDirection: "row",
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F2FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
