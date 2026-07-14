import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { fonts, typeScale } from "@/constants/theme";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "bodyLg"
  | "body"
  | "label"
  | "caption"
  | "overline";

export type TextColor =
  | "foreground"
  | "muted"
  | "primary"
  | "onPrimary"
  | "accent"
  | "onAccent"
  | "emergency"
  | "onEmergency"
  | "warning"
  | "inherit";

const colorClass: Record<TextColor, string> = {
  foreground: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  onPrimary: "text-on-primary",
  accent: "text-accent",
  onAccent: "text-on-accent",
  emergency: "text-emergency",
  onEmergency: "text-on-emergency",
  warning: "text-warning",
  inherit: "",
};

// Headings use Figtree; body/labels use Noto Sans.
const variantFont: Record<TextVariant, string> = {
  display: fonts.headingBold,
  h1: fonts.headingBold,
  h2: fonts.heading,
  h3: fonts.heading,
  bodyLg: fonts.regular,
  body: fonts.regular,
  label: fonts.semibold,
  caption: fonts.medium,
  overline: fonts.semibold,
};

const variantSize: Record<
  TextVariant,
  { fontSize: number; lineHeight: number; letterSpacing?: number }
> = {
  display: typeScale.display,
  h1: typeScale.h1,
  h2: typeScale.h2,
  h3: typeScale.h3,
  bodyLg: typeScale.bodyLg,
  body: typeScale.body,
  label: typeScale.label,
  caption: typeScale.caption,
  overline: typeScale.overline,
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  /** Override the font family (e.g. force a bold heading on a body variant). */
  weight?: keyof typeof fonts;
  className?: string;
}

/**
 * Typographic primitive. Enforces the brand type scale + font pairing and a
 * semantic, theme-aware color. Prefer this over raw <Text> in redesigned UI.
 */
export function Text({
  variant = "body",
  color = "foreground",
  weight,
  className = "",
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      className={`${colorClass[color]} ${className}`.trim()}
      style={[
        variantSize[variant],
        { fontFamily: weight ? fonts[weight] : variantFont[variant] },
        variant === "overline" && { textTransform: "uppercase" as const },
        style,
      ]}
      {...rest}
    />
  );
}

export default Text;
