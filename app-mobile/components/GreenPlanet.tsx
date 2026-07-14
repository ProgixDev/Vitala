import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Ellipse, Path } from 'react-native-svg';
import { brand } from '@/constants/brand';

interface GreenPlanetProps {
  size?: number;
}

/**
 * Swirled green gradient "planet" orb — the friendly mascot of the Learn /
 * first-aid education surfaces. Pure SVG so it stays crisp at any size.
 */
export function GreenPlanet({ size = 96 }: GreenPlanetProps) {
  const c = size / 2;
  const r = size / 2 - 1;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="orb" cx="34%" cy="28%" r="80%">
          <Stop offset="0" stopColor={brand.planet.highlight} />
          <Stop offset="0.42" stopColor={brand.planet.mid} />
          <Stop offset="1" stopColor={brand.planet.deep} />
        </RadialGradient>
        <LinearGradient id="swirl" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Body */}
      <Circle cx={c} cy={c} r={r} fill="url(#orb)" />

      {/* Swirl bands — soft translucent sweeps for the "planet" look */}
      <Path
        d="M14 44 C34 30 66 30 88 42 C70 52 40 54 14 44 Z"
        fill="url(#swirl)"
        opacity={0.5}
      />
      <Path
        d="M20 64 C40 56 62 58 82 66 C64 74 40 74 20 64 Z"
        fill="#0B7A55"
        opacity={0.18}
      />

      {/* Top-left specular highlight */}
      <Ellipse cx="36" cy="30" rx="16" ry="11" fill="#FFFFFF" opacity={0.35} />
    </Svg>
  );
}
