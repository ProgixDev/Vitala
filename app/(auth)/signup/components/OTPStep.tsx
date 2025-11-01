import React, { useRef } from "react";
import { View, Text, TextInput } from "react-native";

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
      <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
        Enter OTP
      </Text>

      <Text className="text-base text-[#9E9E9E] text-center leading-6">
        We&apos;ve sent an OTP code to your{"\n"}phone number,
      </Text>

      <View className="flex-row justify-center gap-4 mb-10">
        {otp.map((digit, index) => (
          <View
            key={index}
            className="w-[70px] h-[70px] bg-white rounded-2xl shadow-sm"
          >
            <Text className="flex-1 text-[32px] text-[#C5D0F5] text-center" />
          </View>
        ))}
      </View>

      <View className="flex-row justify-center items-center mb-[15%]">
        <Text className="text-[15px] text-[#9E9E9E]">
          We will resend the code in{" "}
        </Text>
        <Text className="text-[15px] text-[#4461F2] font-semibold">
          {timer} s
        </Text>
      </View>
    </>
  );
}
