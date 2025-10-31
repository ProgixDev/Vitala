import React from 'react';
import { SvgProps } from 'react-native-svg';

// Import SVG files as components
import BackgroundPageOne from '../../../assets/images/OnBoardingPages/BackgroundPageOne.svg';
import BackgroundPageThree from '../../../assets/images/OnBoardingPages/BackgroundPageThree.svg';
import BackgroundPageTwo from '../../../assets/images/OnBoardingPages/BackgroundPageTwo.svg';
import OnBoardingPageOne from '../../../assets/images/OnBoardingPages/OnBoardingPageOne.svg';
import OnBoardingPageThree from '../../../assets/images/OnBoardingPages/OnBoardingPageThree.svg';
import OnBoardingPageTwo from '../../../assets/images/OnBoardingPages/OnBoardingPageTwo.svg';

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
    title: 'Healthcare,\nAnytime, Anywhere',
    subtitle: 'Get quality home healthcare services wherever you are. fast, simple, and reliable.',
    illustration: OnBoardingPageOne,
    background: BackgroundPageOne,
    primaryButton: 'Get Started',
  },
  {
    id: 2,
    title: 'Services\nMade for You',
    subtitle: 'Find personalized care options tailored to your health needs and daily schedule.',
    illustration: OnBoardingPageTwo,
    background: BackgroundPageTwo,
    primaryButton: 'Explore our services',
    hasSkip: true,
  },
  {
    id: 3,
    title: 'Your Well-Being,\nOur Priority',
    subtitle: 'Trusted professionals dedicated to your comfort, safety, and peace of mind.',
    illustration: OnBoardingPageThree,
    background: BackgroundPageThree,
    primaryButton: 'Create your account',
    secondaryButton: 'Already have an account? Log In',
  },
];

