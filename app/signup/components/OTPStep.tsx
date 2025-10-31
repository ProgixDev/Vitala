import React, { useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface OTPStepProps {
  otp: string[];
  setOtp: (value: string[]) => void;
  timer: number;
}

export default function OTPStep({ otp, setOtp, timer }: OTPStepProps) {
  const otpInputs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <Text style={styles.title}>Enter OTP</Text>

      <Text style={styles.subtitle}>
        We&apos;ve sent an OTP code to your{"\n"}phone number,
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <View key={index} style={styles.otpInputWrapper}>
            <TextInput
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent: { key } }) =>
                handleOtpKeyPress(key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>We will resend the code in </Text>
        <Text style={styles.timerCount}>{timer} s</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "600",
    color: "#2D3142",
    textAlign: "center",
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 60,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 40,
  },
  otpInputWrapper: {
    width: 70,
    height: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  otpInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "400",
    color: "#C5D0F5",
    textAlign: "center",
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  timerText: {
    fontSize: 15,
    color: "#9E9E9E",
  },
  timerCount: {
    fontSize: 15,
    color: "#4461F2",
    fontWeight: "600",
  },
});
