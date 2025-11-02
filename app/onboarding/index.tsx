import React, { useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SvgProps } from "react-native-svg";

// Import SVG files as components
import BackgroundPageOne from "@/assets/images/OnBoardingPages/BackgroundPageOne.svg";
import BackgroundPageThree from "@/assets/images/OnBoardingPages/BackgroundPageThree.svg";
import BackgroundPageTwo from "@/assets/images/OnBoardingPages/BackgroundPageTwo.svg";
import OnBoardingPageOne from "@/assets/images/OnBoardingPages/OnBoardingPageOne.svg";
import OnBoardingPageThree from "@/assets/images/OnBoardingPages/OnBoardingPageThree.svg";
import OnBoardingPageTwo from "@/assets/images/OnBoardingPages/OnBoardingPageTwo.svg";

const { width, height } = Dimensions.get("window");

// Onboarding Storage Constants and Functions
const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

/**
 * Check if the user has completed onboarding
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  } catch (error) {
    console.error("Error marking onboarding as completed:", error);
  }
};

/**
 * Reset onboarding status (useful for testing)
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error("Error resetting onboarding status:", error);
  }
};

// Slide Data Interface and Array
export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  illustration: React.FC<SvgProps>;
  background: React.FC<SvgProps>;
  primaryButton: string;
  secondaryButton?: string;
  hasSkip?: boolean;
}

export const slides: SlideData[] = [
  {
    id: 1,
    title: "Healthcare,\nAnytime, Anywhere",
    subtitle:
      "Get quality home healthcare services wherever you are. fast, simple, and reliable.",
    illustration: OnBoardingPageOne,
    background: BackgroundPageOne,
    primaryButton: "Get Started",
  },
  {
    id: 2,
    title: "Services\nMade for You",
    subtitle:
      "Find personalized care options tailored to your health needs and daily schedule.",
    illustration: OnBoardingPageTwo,
    background: BackgroundPageTwo,
    primaryButton: "Explore our services",
    hasSkip: true,
  },
  {
    id: 3,
    title: "Your Well-Being,\nOur Priority",
    subtitle:
      "Trusted professionals dedicated to your comfort, safety, and peace of mind.",
    illustration: OnBoardingPageThree,
    background: BackgroundPageThree,
    primaryButton: "Create your account",
    secondaryButton: "Already have an account? Log In",
  },
];

// Inline useOnboarding
const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skip = () => {
    setCurrentStep(slides.length - 1);
  };

  return {
    currentStep,
    nextStep,
    skip,
    totalSteps: slides.length,
  };
};

// Inline PaginationDots
interface PaginationDotsProps {
  total: number;
  current: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({ total, current }) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

// Inline OnboardingSlide
interface OnboardingSlideProps {
  slide: SlideData;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onSkipPress?: () => void;
  showLogo?: boolean;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  slide,
  onPrimaryPress,
  onSecondaryPress,
  onSkipPress,
  showLogo,
}) => {
  const BackgroundSVG = slide.background;
  const IllustrationSVG = slide.illustration;

  return (
    <View style={styles.slideContainer}>
      {/* Logo - only shown on first screen */}
      {showLogo ? (
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/Logo.png")}
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

interface OnboardingProps {
  onComplete?: () => void;
  onLogin?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  onComplete,
  onLogin,
}) => {
  const { currentStep, nextStep, skip, totalSteps } = useOnboarding();

  const handleCreateAccount = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    }
  };

  const renderSlide = () => {
    const slide = slides[currentStep];
    const showLogo = currentStep === 0;
    let onPrimary, onSecondary, onSkipPress;

    if (currentStep === 0) {
      onPrimary = nextStep;
    } else if (currentStep === 1) {
      onPrimary = nextStep;
      onSkipPress = skip;
    } else {
      onPrimary = handleCreateAccount;
      onSecondary = handleLogin;
    }

    return (
      <OnboardingSlide
        slide={slide}
        onPrimaryPress={onPrimary}
        onSecondaryPress={onSecondary}
        onSkipPress={onSkipPress}
        showLogo={showLogo}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        {renderSlide()}
        <View style={styles.paginationWrapper}>
          <PaginationDots total={totalSteps} current={currentStep} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  slideContainer: {
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
  paginationWrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#2D59F0",
    width: 24,
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
});

export default Onboarding;
