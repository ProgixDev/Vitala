import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';

/**
 * On-brand duotone illustrations for the first-aid protocols — a small set of
 * pictogram "scenes" that share one visual grammar: a soft tinted tile, one
 * ambient orb for depth, and a two-part symbol drawn in the topic's own hue
 * (soft fill + crisp line). Pure SVG, so they stay crisp at any size and need
 * no image assets or network. Keyed off the topic id.
 */

export type FirstAidArtKind = 'cpr' | 'choking' | 'bleeding' | 'burns';

/** hex (#RRGGBB) → rgba() string at the given alpha. */
function tint(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

interface FirstAidArtProps {
  kind: string;
  color: string;
  size?: number;
  /** Corner radius as a share of size. */
  radius?: number;
}

export function FirstAidArt({ kind, color, size = 64, radius = 0.26 }: FirstAidArtProps) {
  const rx = 100 * radius;
  const fill = tint(color, 0.2);
  const soft = tint(color, 0.32);
  const line = color;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="tile" x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={tint(color, 0.16)} />
          <Stop offset="1" stopColor={tint(color, 0.08)} />
        </LinearGradient>
        <RadialGradient id="orb" cx="76%" cy="20%" r="62%">
          <Stop offset="0" stopColor={tint(color, 0.22)} />
          <Stop offset="1" stopColor={tint(color, 0)} />
        </RadialGradient>
      </Defs>

      {/* Tile + ambient orb */}
      <Rect x="0" y="0" width="100" height="100" rx={rx} ry={rx} fill="url(#tile)" />
      <Rect x="0" y="0" width="100" height="100" rx={rx} ry={rx} fill="url(#orb)" />

      {kind === 'cpr' && <Cpr fill={fill} soft={soft} line={line} />}
      {kind === 'choking' && <Choking fill={fill} soft={soft} line={line} />}
      {kind === 'bleeding' && <Bleeding fill={fill} soft={soft} line={line} />}
      {kind === 'burns' && <Burns fill={fill} soft={soft} line={line} />}
    </Svg>
  );
}

interface SymbolProps {
  fill: string;
  soft: string;
  line: string;
}

/** Heart with an ECG trace running through it. */
function Cpr({ fill, line }: SymbolProps) {
  return (
    <G>
      <Path
        d="M50 76 C29 60 19 47 19 36 C19 27 26 20 35 20 C41 20 47 24 50 30 C53 24 59 20 65 20 C74 20 81 27 81 36 C81 47 71 60 50 76 Z"
        fill={fill}
        stroke={line}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* ECG trace — white underlay for legibility, then crisp line */}
      <Path
        d="M20 50 H37 L41 50 L46 37 L51 61 L55 47 L80 47"
        stroke="#FFFFFF"
        strokeOpacity={0.85}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M20 50 H37 L41 50 L46 37 L51 61 L55 47 L80 47"
        stroke={line}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  );
}

/** Head + airway with a lodged blockage and a thrust arrow (Heimlich). */
function Choking({ fill, line }: SymbolProps) {
  return (
    <G>
      {/* Head */}
      <Circle cx="43" cy="32" r="15" fill={fill} stroke={line} strokeWidth={3} />
      {/* Neck + shoulders */}
      <Path
        d="M34 44 C34 54 30 58 26 66 C24 71 27 78 34 78 H60 C67 78 69 71 66 66 C62 58 56 55 54 46 Z"
        fill={fill}
        stroke={line}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* Airway blockage at the throat */}
      <Circle cx="45" cy="52" r="4.5" fill={line} />
      {/* Upward thrust arrow (Heimlich direction) */}
      <Path
        d="M74 76 V53 M67 60 L74 52 L81 60"
        stroke={line}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  );
}

/** Blood droplet with a first-aid plaster across it. */
function Bleeding({ fill, soft, line }: SymbolProps) {
  return (
    <G>
      {/* Droplet */}
      <Path
        d="M50 18 C50 18 74 46 74 62 A24 24 0 0 1 26 62 C26 46 50 18 50 18 Z"
        fill={fill}
        stroke={line}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* Plaster crossing the lower half */}
      <G transform="rotate(-32 50 64)">
        <Rect x="26" y="56" width="48" height="17" rx="8.5" fill={line} />
        <Rect x="42" y="58.5" width="16" height="12" rx="3" fill="#FFFFFF" fillOpacity={0.9} />
        <G fill={soft}>
          <Circle cx="47" cy="62" r="1.4" />
          <Circle cx="53" cy="62" r="1.4" />
          <Circle cx="47" cy="67" r="1.4" />
          <Circle cx="53" cy="67" r="1.4" />
        </G>
      </G>
    </G>
  );
}

/** Flame being cooled by a water droplet + streaks. */
function Burns({ fill, soft, line }: SymbolProps) {
  return (
    <G>
      {/* Flame */}
      <Path
        d="M48 20 C46 34 34 38 34 54 A18 18 0 0 0 70 54 C70 44 62 40 60 31 C57 37 55 34 55 27 C53 31 50 28 48 20 Z"
        fill={fill}
        stroke={line}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* Inner flame */}
      <Path
        d="M50 42 C49 49 44 51 44 58 A9 9 0 0 0 62 58 C62 52 57 51 55 46 C53 50 51 48 50 42 Z"
        fill={soft}
      />
      {/* Cooling water droplet */}
      <Path
        d="M76 30 C76 30 84 39 84 45 A8 8 0 0 1 68 45 C68 39 76 30 76 30 Z"
        fill="#FFFFFF"
        fillOpacity={0.9}
        stroke={line}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* Cooling streaks */}
      <Path
        d="M22 40 v10 M28 34 v12"
        stroke={line}
        strokeWidth={3}
        strokeLinecap="round"
        strokeOpacity={0.5}
      />
    </G>
  );
}
