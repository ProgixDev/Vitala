import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/utils/cn';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  | 'button';

const variants: Record<TextVariant, string> = {
  // Fraunces (serif) carries the editorial voice — display + section titles only.
  display: 'font-display-bold text-[34px] leading-[40px] tracking-[-0.5px] text-foreground',
  title: 'font-display-bold text-[26px] leading-[31px] tracking-[-0.3px] text-foreground',
  heading: 'font-display text-[19px] leading-[24px] tracking-[-0.2px] text-foreground',
  // Hanken Grotesk carries everything functional.
  subtitle: 'font-sans text-[15px] leading-[22px] text-muted-foreground',
  body: 'font-sans text-[15px] leading-[22px] text-foreground',
  bodyMedium: 'font-medium text-[15px] leading-[22px] text-foreground',
  label: 'font-semibold text-[13px] leading-[17px] text-foreground',
  caption: 'font-sans text-[12px] leading-[16px] text-muted-foreground',
  button: 'font-semibold text-[15px] leading-[20px]',
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  className?: string;
}

export function Text({ variant = 'body', className, ...rest }: AppTextProps) {
  return <RNText className={cn(variants[variant], className)} {...rest} />;
}
