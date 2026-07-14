import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Text } from '@/components/ui';
import { shadow } from '@/constants/theme';
import { PulseLine } from './PulseLine';

/** Deep ink-teal command panel — the calm before help arrives. */
const PANEL = '#0C1F1B';
const PANEL_EDGE = '#123029';
/** Warm coral signal — emergency-adjacent, never the reserved SOS red. */
const SIGNAL = '#FF6F5E';
const CREAM = '#F4F1EA';
const CREAM_MUTED = 'rgba(244,241,234,0.62)';

interface Stat {
  value: string;
  label: string;
}

interface AcademyHeroProps {
  eyebrow: string;
  headline: string;
  lede: string;
  stats: Stat[];
}

export function AcademyHero({ eyebrow, headline, lede, stats }: AcademyHeroProps) {
  return (
    <View
      style={[shadow.e2, { backgroundColor: PANEL, borderColor: PANEL_EDGE, borderWidth: 1 }]}
      className="overflow-hidden rounded-card"
    >
      {/* Ambient coral glow bleeding up behind the pulse line */}
      <Svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <Defs>
          <RadialGradient id="heroGlow" cx="26%" cy="70%" r="78%">
            <Stop offset="0" stopColor={SIGNAL} stopOpacity="0.20" />
            <Stop offset="1" stopColor={SIGNAL} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGlow)" />
      </Svg>

      <View className="px-6 pb-6 pt-6">
        {/* Eyebrow: a small live pulse dot + tracked caps */}
        <View className="flex-row items-center gap-2">
          <View
            style={{ backgroundColor: SIGNAL }}
            className="h-1.5 w-1.5 rounded-full"
          />
          <Text
            style={{
              color: SIGNAL,
              fontFamily: 'HankenGrotesk_700Bold',
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            {eyebrow.toUpperCase()}
          </Text>
        </View>

        {/* Headline */}
        <Text
          style={{
            color: CREAM,
            fontFamily: 'Fraunces_700Bold',
            fontSize: 30,
            lineHeight: 34,
            letterSpacing: -0.4,
          }}
          className="mt-3"
        >
          {headline}
        </Text>

        <Text
          style={{ color: CREAM_MUTED, fontFamily: 'HankenGrotesk_400Regular', fontSize: 13.5, lineHeight: 19 }}
          className="mt-2 pr-4"
        >
          {lede}
        </Text>

        {/* Signature: the drawn heartbeat */}
        <View className="mt-5">
          <PulseLine color={SIGNAL} height={46} />
        </View>

        {/* Readiness stat strip */}
        <View
          style={{ borderColor: 'rgba(244,241,234,0.12)' }}
          className="mt-4 flex-row items-center border-t pt-4"
        >
          {stats.map((s, i) => (
            <View key={s.label} className="flex-row items-center">
              {i > 0 && (
                <View
                  style={{ backgroundColor: 'rgba(244,241,234,0.14)' }}
                  className="mx-4 h-7 w-px"
                />
              )}
              <View>
                <Text
                  style={{
                    color: CREAM,
                    fontFamily: 'Fraunces_700Bold',
                    fontSize: 20,
                    lineHeight: 22,
                  }}
                >
                  {s.value}
                </Text>
                <Text
                  style={{
                    color: CREAM_MUTED,
                    fontFamily: 'HankenGrotesk_500Medium',
                    fontSize: 11,
                    letterSpacing: 0.2,
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
