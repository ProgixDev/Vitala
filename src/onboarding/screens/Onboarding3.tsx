import React from 'react';
import { View, StyleSheet } from 'react-native';
import { OnboardingSlide } from '../components/OnboardingSlide';
import { slides } from '../constants/slides';

interface Onboarding3Props {
  onCreateAccount: () => void;
  onLogin: () => void;
}

export const Onboarding3: React.FC<Onboarding3Props> = ({ onCreateAccount, onLogin }) => {
  return (
    <View style={styles.container}>
      <OnboardingSlide
        slide={slides[2]}
        onPrimaryPress={onCreateAccount}
        onSecondaryPress={onLogin}
        showLogo={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

