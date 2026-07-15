import type { ImageSourcePropType } from 'react-native';

/**
 * The three onboarding photographs.
 *
 * Sourced from Pexels (free for commercial use, no attribution required) and
 * cropped to 1000×1150 — the aspect of the card that frames them on screen, with
 * the crop biased toward the top so faces sit in the upper third.
 *
 * To swap one out: drop a replacement at the same path. Match the aspect ratio,
 * or the card will cover-crop it and you may lose a head.
 *
 *   slide-1  Doctor taking blood pressure at a consultation — AI25 Studio
 *   slide-2  Doctor going through results on a tablet — Thirdman
 *   slide-3  Mother, grandmother and baby together — RDNE
 */
export type OnboardingPhotoKey = 'anywhere' | 'tailored' | 'trust';

export const onboardingPhotos: Record<OnboardingPhotoKey, ImageSourcePropType> = {
  anywhere: require('../assets/onboarding/slide-1.jpg'),
  tailored: require('../assets/onboarding/slide-2.jpg'),
  trust: require('../assets/onboarding/slide-3.jpg'),
};
