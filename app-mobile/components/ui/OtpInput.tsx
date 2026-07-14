import { OtpInput as RNOtpInput } from 'react-native-otp-entry';
import { useThemeColors } from '@/constants/theme';

interface OtpInputProps {
  numberOfDigits?: number;
  onChange?: (code: string) => void;
  onFilled?: (code: string) => void;
}

/** Themed wrapper around react-native-otp-entry. */
export function OtpInput({ numberOfDigits = 6, onChange, onFilled }: OtpInputProps) {
  const colors = useThemeColors();
  return (
    <RNOtpInput
      numberOfDigits={numberOfDigits}
      focusColor={colors.primary}
      onTextChange={onChange}
      onFilled={onFilled}
      theme={{
        pinCodeContainerStyle: {
          backgroundColor: colors.surfaceAlt,
          borderWidth: 0,
          borderRadius: 16,
          height: 58,
          width: 48,
        },
        pinCodeTextStyle: {
          color: colors.foreground,
          fontSize: 22,
          fontFamily: 'HankenGrotesk_600SemiBold',
        },
        focusedPinCodeContainerStyle: {
          borderWidth: 2,
          borderColor: colors.primary,
        },
        focusStickStyle: {
          backgroundColor: colors.primary,
        },
      }}
    />
  );
}
