import type { ImageSourcePropType } from 'react-native';

/**
 * Central registry of the colorful flat illustrations. Every one is meant to be
 * shown inside a <Well/>, which gives the (independently-sourced) art a single,
 * consistent frame so the set reads as one curated system.
 *
 * Add new art here and reference it by key — never `require()` at the call site.
 */
export type IllustrationKey = 'appointment' | 'card' | 'siren';

export const illustrations: Record<IllustrationKey, ImageSourcePropType> = {
  appointment: require('../assets/illustrations/medical-appointment.png'),
  card: require('../assets/illustrations/atm-card.png'),
  siren: require('../assets/illustrations/siren.png'),
};
