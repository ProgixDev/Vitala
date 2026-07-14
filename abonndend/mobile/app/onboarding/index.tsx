import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { BackHandler, Dimensions, Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SvgProps } from "react-native-svg";

import { Button, Text } from "@/components/ui";
import { t } from "@/utils/i18n";

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

/** Check if the user has completed onboarding */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
    return value === "true";
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

/** Mark onboarding as completed */
export const markOnboardingCompleted = async (): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, "true");
  } catch (error) {
    console.error("Error marking onboarding as completed:", error);
  }
};

/** Reset onboarding status (useful for testing) */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error("Error resetting onboarding status:", error);
  }
};

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
    title: t("onboarding.slide1.title"),
    subtitle: t("onboarding.slide1.subtitle"),
    illustration: OnBoardingPageOne,
    background: BackgroundPageOne,
    primaryButton: t("onboarding.getStarted"),
  },
  {
    id: 2,
    title: t("onboarding.slide2.title"),
    subtitle: t("onboarding.slide2.subtitle"),
    illustration: OnBoardingPageTwo,
    background: BackgroundPageTwo,
    primaryButton: t("onboarding.exploreServices"),
    hasSkip: true,
  },
  {
    id: 3,
    title: t("onboarding.slide3.title"),
    subtitle: t("onboarding.slide3.subtitle"),
    illustration: OnBoardingPageThree,
    background: BackgroundPageThree,
    primaryButton: t("onboarding.createAccount"),
    secondaryButton: t("onboarding.logIn"),
  },
];

const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const nextStep = () =>
    setCurrentStep((s) => Math.min(s + 1, slides.length - 1));
  const skip = () => setCurrentStep(slides.length - 1);
  return { currentStep, nextStep, skip, totalSteps: slides.length };
};

const PaginationDots = ({ total, current }: { total: number; current: number }) => {
  return (
    <View className="flex-row justify-center items-center">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full mx-1 ${
            index === current ? "w-6 bg-primary" : "w-2 bg-border"
          }`}
        />
      ))}
    </View>
  );
};

interface OnboardingSlideProps {
  slide: SlideData;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onSkipPress?: () => void;
  showLogo?: boolean;
}

const OnboardingSlide = ({
  slide,
  onPrimaryPress,
  onSecondaryPress,
  onSkipPress,
  showLogo,
}: OnboardingSlideProps) => {
  const BackgroundSVG = slide.background;
  const IllustrationSVG = slide.illustration;

  return (
    <View className="flex-1">
      {showLogo ? (
        <View className="items-center mt-6 mb-2">
          <Image
            source={require("@/assets/images/Logo.png")}
            className="w-30 h-14"
            resizeMode="contain"
          />
        </View>
      ) : (
        <View className="h-21" />
      )}

      {/* Illustration */}
      <Animated.View
        key={`art-${slide.id}`}
        entering={FadeIn.duration(350)}
        exiting={FadeOut.duration(150)}
        className="flex-1 justify-center items-center my-4"
      >
        <View className="absolute justify-center items-center">
          <BackgroundSVG width={width * 0.9} height={height * 0.4} />
        </View>
        <View className="justify-center items-center z-10">
          <IllustrationSVG width={width * 0.8} height={height * 0.35} />
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View
        key={`content-${slide.id}`}
        entering={FadeIn.duration(350).delay(80)}
        className="px-2 pb-8 items-center"
      >
        <Text variant="h1" color="foreground" className="text-center">
          {slide.title}
        </Text>
        <Text variant="bodyLg" color="muted" className="text-center mt-3 mb-8 px-4">
          {slide.subtitle}
        </Text>

        <Button label={slide.primaryButton} onPress={onPrimaryPress} size="lg" />

        {slide.secondaryButton && onSecondaryPress && (
          <View className="flex-row items-center mt-4">
            <Text variant="body" color="muted">
              {t("onboarding.haveAccount")}{" "}
            </Text>
            <Pressable onPress={onSecondaryPress} hitSlop={8}>
              <Text variant="body" color="primary" weight="semibold">
                {slide.secondaryButton}
              </Text>
            </Pressable>
          </View>
        )}

        {slide.hasSkip && onSkipPress && (
          <Pressable onPress={onSkipPress} hitSlop={8} className="mt-4 py-2">
            <Text variant="body" color="muted">
              {t("common.skip")}
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
};

interface OnboardingProps {
  onComplete?: () => void;
  onLogin?: () => void;
}

export const Onboarding = ({ onComplete, onLogin }: OnboardingProps) => {
  const { currentStep, nextStep, skip, totalSteps } = useOnboarding();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => false,
    );
    return () => backHandler.remove();
  }, []);

  const renderSlide = () => {
    const slide = slides[currentStep];
    const showLogo = currentStep === 0;
    let onPrimary: () => void;
    let onSecondary: (() => void) | undefined;
    let onSkipPress: (() => void) | undefined;

    if (currentStep === 0) {
      onPrimary = nextStep;
    } else if (currentStep === 1) {
      onPrimary = nextStep;
      onSkipPress = skip;
    } else {
      onPrimary = () => onComplete?.();
      onSecondary = () => onLogin?.();
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
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-6">
        {renderSlide()}
        <View className="absolute bottom-5 left-0 right-0">
          <PaginationDots total={totalSteps} current={currentStep} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    markOnboardingCompleted();
    router.replace("/signup/choose");
  };

  const handleLogin = () => {
    markOnboardingCompleted();
    router.replace("/signin");
  };

  return <Onboarding onComplete={handleComplete} onLogin={handleLogin} />;
}
