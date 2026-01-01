import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

export default function VerifyResetCode() {
  const { email, resetCode } = useLocalSearchParams<{ email: string; resetCode?: string }>();
  const [code, setCode] = useState<string[]>(resetCode ? resetCode.split("") : ["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const codeInputs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (value: string, index: number) => {
    // Allow pasting full code
    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      for (let i = 0; i < pastedCode.length; i++) {
        if (index + i < 6) {
          newCode[index + i] = pastedCode[i];
        }
      }
      setCode(newCode);
      // Focus the next input after the pasted code
      const nextIndex = Math.min(index + pastedCode.length, 5);
      codeInputs.current[nextIndex]?.focus();
      return;
    }

    // Handle single digit input
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) return; // Should not happen, but safety check

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    if (code.some((digit) => !digit)) {
      Toast.show({
        type: "error",
        text1: "Incomplete Code",
        text2: "Please enter all 6 digits",
      });
      return;
    }

    // Navigate to new password screen
    router.push({
      pathname: "/(auth)/set-new-password",
      params: {
        email,
        code: code.join(""),
      },
    });
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      const { forgotPassword } = await import("@/utils/api");
      await forgotPassword(email);

      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "A new code has been sent to your email",
      });

      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.message || "Could not resend code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.replace("/(auth)/signin");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignIn}
          >
            <Ionicons name="arrow-back" size={28} color="#2D3142" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{"\n"}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (codeInputs.current) {
                    codeInputs.current[index] = ref;
                  }
                }}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={timer > 0 || isLoading}
              style={[
                styles.resendButton,
                (timer > 0 || isLoading) && styles.resendButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  (timer > 0 || isLoading) && styles.resendButtonTextDisabled,
                ]}
              >
                {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Check your email inbox (and spam folder) for the verification
              code. The code expires in 30 minutes.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              code.some((digit) => !digit) && styles.continueButtonDisabled,
            ]}
            onPress={handleVerifyCode}
            disabled={code.some((digit) => !digit)}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LoadingScreen
        visible={isLoading}
        message="Sending code..."
        subtitle="Please wait"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    marginLeft: -12,
    justifyContent: "center",
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3142",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  email: {
    fontWeight: "600",
    color: "#2D3142",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#2D3142",
    backgroundColor: "#FFFFFF",
  },
  codeInputFilled: {
    borderColor: "#4461F2",
  },
  resendContainer: {
    marginBottom: 32,
    alignItems: "center",
  },
  resendText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4461F2",
  },
  resendButtonTextDisabled: {
    color: "#999",
  },
  instructions: {
    backgroundColor: "#E6F4FE",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  instructionsText: {
    fontSize: 14,
    color: "#2D3142",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#4461F2",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4461F2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: "#B8C5E8",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});
