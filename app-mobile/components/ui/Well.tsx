import type { ReactNode } from 'react';
import {
  View,
  Image,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useThemeColors, shadow } from '@/constants/theme';
import { illustrations, type IllustrationKey } from '@/constants/illustrations';

export type WellTone = 'warm' | 'teal';

export interface WellProps {
  /** Named illustration from the registry. */
  illustration?: IllustrationKey;
  /** Or a raw image source (overrides `illustration`). */
  source?: ImageSourcePropType;
  size?: number;
  radius?: number;
  /** `warm` cream tile (default) or a branded `teal` tint. */
  tone?: WellTone;
  /** Illustration size as a fraction of the well (default 0.62). */
  imageScale?: number;
  /** Raised drop shadow. Off when the well already sits on an elevated card. */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Custom content instead of an illustration (e.g. a line Icon). */
  children?: ReactNode;
}

/**
 * The signature surface. A softly-embossed rounded tile — warm cream base, a
 * lit-from-top sheen, a hairline ring, a faint floor shadow — that houses every
 * colorful illustration. Disparate sourced art becomes one cohesive, premium set.
 */
export function Well({
  illustration,
  source,
  size = 64,
  radius = 20,
  tone = 'warm',
  imageScale = 0.62,
  elevated = true,
  style,
  children,
}: WellProps) {
  const colors = useThemeColors();
  const dark = colors.scheme === 'dark';

  const bg = tone === 'teal' ? colors.primarySoft : colors.surfaceAlt;
  const img = source ?? (illustration ? illustrations[illustration] : undefined);
  const imgSize = Math.round(size * imageScale);

  return (
    <View
      style={[
        elevated ? shadow.e1 : null,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* lit-from-top sheen — the emboss highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: size * 0.55,
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        }}
      />
      {/* faint floor shade — grounds the tile */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: size * 0.3,
          backgroundColor: dark ? 'rgba(0,0,0,0.14)' : 'rgba(20,32,29,0.035)',
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
        }}
      />
      {img ? (
        <Image source={img} style={{ width: imgSize, height: imgSize }} resizeMode="contain" />
      ) : (
        children
      )}
    </View>
  );
}
