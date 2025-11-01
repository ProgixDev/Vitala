import React from "react";
import { View, StyleSheet } from "react-native";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { slides } from "../constants/slides";

interface Onboarding1Props {
  onNext: () => void;
}

export const Onboarding1: React.FC<Onboarding1Props> = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <OnboardingSlide
        slide={slides[0]}
        onPrimaryPress={onNext}
        showLogo={true}
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
