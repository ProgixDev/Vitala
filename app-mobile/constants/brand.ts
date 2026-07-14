/**
 * Vibrant "iAid" playful palette — scoped to the Hero + Learn (first-aid
 * education) surfaces. Deliberately separate from the calm clinical tokens in
 * `global.css`: these sections stay the same rich violet in light & dark.
 */
export const brand = {
  // Violet hero / card gradient (top-left → bottom-right)
  heroGradient: ['#8B6BFF', '#6D3BEC', '#5A2FD6'] as const,
  cardGradient: ['#6E43E8', '#5A2FD6'] as const,
  violet: '#6D3BEC',
  violetSoft: '#EDE7FF',
  onViolet: '#FFFFFF',

  // Green "planet" orb
  planet: {
    highlight: '#EBFFC9',
    mid: '#7BE38A',
    deep: '#0E9F6E',
  },

  // Auth surfaces — calm deep-medical teal gradient header (top → bottom-right)
  // used by AuthScaffold on the sign-in / sign-up screens.
  authGradient: ['#1FA98C', '#0E7C6B', '#0B5A4F'] as const,
  authTeal: '#0E7C6B',
  authTealDeep: '#0B5A4F',
  authOnHeader: '#FFFFFF',
  authOrb: 'rgba(255,255,255,0.10)',

  // Playful icon-tile accents
  tile: {
    orange: '#F97316',
    violet: '#7C3AED',
    pink: '#EC4899',
    blue: '#3B82F6',
    green: '#22C55E',
    red: '#F43F5E',
    amber: '#F59E0B',
  },
} as const;
