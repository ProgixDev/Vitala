import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SlideData } from "../constants/slides";

const { width, height } = Dimensions.get("window");

interface OnboardingSlideProps {
  slide: SlideData;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onSkipPress?: () => void;
  showLogo?: boolean;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  slide,
  onPrimaryPress,
  onSecondaryPress,
  onSkipPress,
  showLogo = false,
}) => {
  const BackgroundSVG = slide.background;
  const IllustrationSVG = slide.illustration;

  return (
    <View style={styles.container}>
      {/* Logo - only shown on first screen */}
      {showLogo ? (
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.logoSpacer} />
      )}

      {/* Illustration Section */}
      <View style={styles.illustrationContainer}>
        {/* Background SVG */}
        <View style={styles.backgroundWrapper}>
          <BackgroundSVG
            width={width * 0.9}
            height={height * 0.4}
            style={styles.backgroundImage}
          />
        </View>

        {/* Main Illustration SVG */}
        <View style={styles.illustrationWrapper}>
          <IllustrationSVG
            width={width * 0.8}
            height={height * 0.35}
            style={styles.illustrationImage}
          />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>

        {/* Primary Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
          <Text style={styles.primaryButtonText}>{slide.primaryButton}</Text>
        </TouchableOpacity>

        {/* Secondary Button or Skip */}
        {slide.secondaryButton && onSecondaryPress && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSecondaryPress}
          >
            <Text style={styles.secondaryButtonText}>
              {slide.secondaryButton}
            </Text>
          </TouchableOpacity>
        )}

        {slide.hasSkip && onSkipPress && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkipPress}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 50,
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 60,
  },
  logoSpacer: {
    height: 120, // Same height as logo + margins for consistent spacing
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginVertical: 20,
  },
  backgroundWrapper: {
    position: "absolute",
    width: width * 0.9,
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    opacity: 1,
  },
  illustrationWrapper: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  illustrationImage: {
    // SVG component handles its own dimensions via props
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: "#2D59F0",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#2D59F0",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "500",
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  skipButtonText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "400",
  },
});
