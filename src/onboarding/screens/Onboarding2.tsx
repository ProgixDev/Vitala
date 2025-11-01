import React from "react";
import { View, StyleSheet } from "react-native";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { slides } from "../constants/slides";

interface Onboarding2Props {
  onNext: () => void;
  onSkip: () => void;
}

export const Onboarding2: React.FC<Onboarding2Props> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      <OnboardingSlide
        slide={slides[1]}
        onPrimaryPress={onNext}
        onSkipPress={onSkip}
        showLogo={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
