import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaginationDots } from "./components/PaginationDots";
import { useOnboarding } from "./hooks/useOnboarding";
import { Onboarding1 } from "./screens/Onboarding1";
import { Onboarding2 } from "./screens/Onboarding2";
import { Onboarding3 } from "./screens/Onboarding3";

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

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <Onboarding1 onNext={nextStep} />;
      case 1:
        return <Onboarding2 onNext={nextStep} onSkip={skip} />;
      case 2:
        return (
          <Onboarding3
            onCreateAccount={handleCreateAccount}
            onLogin={handleLogin}
          />
        );
      default:
        return <Onboarding1 onNext={nextStep} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.content}>
        {renderScreen()}
        <View style={styles.paginationContainer}>
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
  paginationContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
});

export default Onboarding;
