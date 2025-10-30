import SecondPageImage from '@/assets/images/SecondPageImage.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  image?: any;
  imageSvg?: React.FC<any>;
  buttonText: string;
}

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: 'Healthcare,\nAnytime, Anywhere',
    subtitle: 'Get quality home healthcare services wherever you are. fast, simple, and reliable.',
    image: require('@/assets/images/FirstPageImage.png'),
    buttonText: 'Next',
  },
  {
    id: '2',
    title: 'Services\nMade for You',
    subtitle: 'Find personalized care options tailored to your health needs and daily schedule.',
    imageSvg: SecondPageImage,
    buttonText: 'Explore our services',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_PAGES.length - 1) {
      // Go to next page
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last page - complete onboarding
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@vitala_first_launch', 'false');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving first launch:', error);
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderPage = ({ item }: { item: OnboardingPage }) => {
    const SvgComponent = item.imageSvg;
    
    return (
      <View style={styles.pageContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          {SvgComponent ? (
            <SvgComponent width={width * 0.85} height={height * 0.4} />
          ) : (
            <Image
              source={item.image}
              style={styles.illustration}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Skip Button */}
      {currentIndex < ONBOARDING_PAGES.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_PAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {ONBOARDING_PAGES[currentIndex].buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  pageContainer: {
    width: width,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    width: 180,
    height: 80,
  },
  illustrationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    height: height * 0.4,
  },
  illustration: {
    width: width * 0.85,
    height: height * 0.4,
  },
  contentContainer: {
    paddingHorizontal: 10,
    marginTop: 20,
    minHeight: 140,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  skipButton: {
    position: 'absolute',
    top: 70,
    right: 30,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  paginationDotActive: {
    backgroundColor: '#2D5BFF',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#2D5BFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D5BFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

