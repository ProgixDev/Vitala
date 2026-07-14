import type { ReactElement } from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Polyline,
  Rect,
} from 'react-native-svg';

/**
 * Bespoke onboarding illustrations, hand-drawn in the Vitala palette so the set
 * reads as one cohesive system (rather than mismatched stock art). Each scene is
 * authored on a 260×236 canvas and rendered inside the floating "care panel" on
 * the onboarding screen. The palette echoes the brand logo: deep clinical teal
 * with a single warm-amber accent (the logo's heart).
 */

const ART = {
  teal: '#0E7C6B',
  tealDeep: '#0B5A4F',
  tealMid: '#1FA98C',
  mint: '#CFE9E1',
  mintSoft: '#E9F5F0',
  amber: '#F0B429',
  amberDeep: '#DE9A00',
  white: '#FFFFFF',
  coral: '#F2795B',
} as const;

export type OnboardingArtKey = 'home' | 'personalized' | 'trust';

interface ArtProps {
  size?: number;
}

/** Small amber four-point sparkle. */
function Sparkle({ x, y, s, color = ART.amber }: { x: number; y: number; s: number; color?: string }) {
  return (
    <Path
      d={`M0,-${s} C ${s * 0.18},-${s * 0.3} ${s * 0.3},-${s * 0.18} ${s},0 C ${s * 0.3},${s * 0.18} ${s * 0.18},${s * 0.3} 0,${s} C -${s * 0.18},${s * 0.3} -${s * 0.3},${s * 0.18} -${s},0 C -${s * 0.3},-${s * 0.18} -${s * 0.18},-${s * 0.3} 0,-${s} Z`}
      fill={color}
      translateX={x}
      translateY={y}
    />
  );
}

/** A small white "+" coin — the recurring medical motif. */
function PlusCoin({ x, y, r, color = ART.teal }: { x: number; y: number; r: number; color?: string }) {
  const a = r * 0.5;
  const t = r * 0.16;
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={ART.white} />
      <Rect x={x - t} y={y - a} width={t * 2} height={a * 2} rx={t} fill={color} />
      <Rect x={x - a} y={y - t} width={a * 2} height={t * 2} rx={t} fill={color} />
    </G>
  );
}

function HomeCareArt() {
  return (
    <>
      {/* soft ground + backdrop */}
      <Circle cx={130} cy={118} r={100} fill={ART.mintSoft} />
      <Ellipse cx={130} cy={202} rx={80} ry={12} fill={ART.mint} opacity={0.7} />

      {/* roof */}
      <Path d="M72,124 L127,78 Q130,75.5 133,78 L188,124 Z" fill={ART.tealDeep} />
      {/* house body */}
      <Rect x={86} y={116} width={88} height={82} rx={12} fill={ART.teal} />
      {/* base shade */}
      <Rect x={86} y={182} width={88} height={16} fill={ART.tealDeep} opacity={0.28} />

      {/* door */}
      <Rect x={119} y={158} width={22} height={40} rx={8} fill={ART.mintSoft} />
      <Circle cx={136} cy={178} r={2} fill={ART.amber} />

      {/* left window — amber heart (care at home) */}
      <Rect x={94} y={128} width={26} height={26} rx={8} fill={ART.white} />
      <Path
        d="M107,148 C101,143 96,140 96,135.5 C96,132.8 98,131 100.4,131 C102.4,131 105,132.5 107,135 C109,132.5 111.6,131 113.6,131 C116,131 118,132.8 118,135.5 C118,140 113,143 107,148 Z"
        fill={ART.amber}
      />
      {/* right window — teal cross */}
      <Rect x={140} y={128} width={26} height={26} rx={8} fill={ART.white} />
      <Rect x={150.7} y={132} width={4.6} height={18} rx={2.3} fill={ART.teal} />
      <Rect x={144} y={138.7} width={18} height={4.6} rx={2.3} fill={ART.teal} />

      {/* floating location pin — anywhere */}
      <Path
        d="M198,66 C189,66 182,73 182,82.5 C182,94 198,108 198,108 C198,108 214,94 214,82.5 C214,73 207,66 198,66 Z"
        fill={ART.amber}
      />
      <Circle cx={198} cy={83} r={6} fill={ART.white} />

      {/* floating plus coin + sparkles */}
      <PlusCoin x={56} y={94} r={15} color={ART.teal} />
      <Sparkle x={44} y={150} s={4} />
      <Sparkle x={214} y={132} s={4.5} />
      <Circle cx={70} cy={182} r={3} fill={ART.amber} opacity={0.8} />
    </>
  );
}

function PersonalizedCareArt() {
  return (
    <>
      <Circle cx={130} cy={116} r={100} fill={ART.mintSoft} />
      <Ellipse cx={130} cy={204} rx={72} ry={11} fill={ART.mint} opacity={0.65} />

      <G rotation={-7} origin="130, 122">
        {/* app card */}
        <Rect x={92} y={54} width={76} height={136} rx={18} fill={ART.white} stroke={ART.mint} strokeWidth={1.5} />
        {/* teal header */}
        <Rect x={92} y={54} width={76} height={34} rx={18} fill={ART.teal} />
        <Rect x={92} y={72} width={76} height={16} fill={ART.teal} />

        {/* avatar */}
        <Circle cx={130} cy={72} r={13} fill={ART.white} />
        <Circle cx={130} cy={69} r={4.6} fill={ART.teal} />
        <Path d="M121,81 C121,74 139,74 139,81 Z" fill={ART.teal} />

        {/* name lines */}
        <Rect x={104} y={98} width={52} height={7} rx={3.5} fill={ART.mint} />
        <Rect x={110} y={110} width={40} height={5} rx={2.5} fill={ART.mint} opacity={0.7} />

        {/* checklist rows */}
        {[128, 146, 164].map((y, i) => (
          <G key={y}>
            <Circle cx={108} cy={y + 4} r={6.5} fill={ART.amber} />
            <Polyline
              points={`104.5,${y + 4} 107,${y + 6.5} 111.5,${y + 1.5}`}
              stroke={ART.white}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Rect x={120} y={y} width={i === 2 ? 34 : 42} height={8} rx={4} fill={ART.mint} />
          </G>
        ))}
      </G>

      {/* floating heart badge — made for you */}
      <Circle cx={182} cy={74} r={20} fill={ART.white} stroke={ART.mint} strokeWidth={1.5} />
      <Path
        d="M182,84 C175,79 170,75.5 170,70.5 C170,67.4 172.4,65.4 175,65.4 C177.4,65.4 180,67.2 182,70 C184,67.2 186.6,65.4 189,65.4 C191.6,65.4 194,67.4 194,70.5 C194,75.5 189,79 182,84 Z"
        fill={ART.amber}
      />

      {/* floating plus coin + sparkles */}
      <PlusCoin x={64} y={150} r={15} color={ART.teal} />
      <Sparkle x={58} y={92} s={4.5} />
      <Sparkle x={208} y={150} s={4} />
    </>
  );
}

function TrustArt() {
  return (
    <>
      <Circle cx={130} cy={116} r={100} fill={ART.mintSoft} />
      <Ellipse cx={130} cy={204} rx={62} ry={10} fill={ART.mint} opacity={0.65} />

      {/* shield */}
      <Path
        d="M130,52 L184,74 V128 C184,166 157,188 130,198 C103,188 76,166 76,128 V74 Z"
        fill={ART.teal}
      />
      {/* left shade for depth */}
      <Path
        d="M130,52 L76,74 V128 C76,166 103,188 130,198 Z"
        fill={ART.tealDeep}
        opacity={0.22}
      />
      {/* top sheen */}
      <Ellipse cx={130} cy={82} rx={40} ry={16} fill={ART.white} opacity={0.1} />

      {/* check */}
      <Polyline
        points="107,126 124,144 156,104"
        stroke={ART.white}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* verified amber badge */}
      <Circle cx={176} cy={68} r={16} fill={ART.amber} />
      <Polyline
        points="169,68 174,73 184,61"
        stroke={ART.white}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* sparkles */}
      <Sparkle x={60} y={84} s={5.5} />
      <Sparkle x={70} y={172} s={4} />
      <Sparkle x={198} y={150} s={5} />
      <Circle cx={54} cy={140} r={3} fill={ART.amber} opacity={0.8} />
    </>
  );
}

const SCENES: Record<OnboardingArtKey, () => ReactElement> = {
  home: HomeCareArt,
  personalized: PersonalizedCareArt,
  trust: TrustArt,
};

/** Renders the named onboarding scene at the given square size. */
export function OnboardingArt({ scene, size = 240 }: ArtProps & { scene: OnboardingArtKey }) {
  const Scene = SCENES[scene];
  return (
    <Svg width={size} height={size * (236 / 260)} viewBox="0 0 260 236">
      <Scene />
    </Svg>
  );
}
