import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EmailVerificationStepProps {
  code: string[];
  setCode: (value: string[]) => void;
  timer: number;
  onResend: () => void;
  onVerify: () => void;
  email: string;
  isLoading?: boolean;
}

export default function EmailVerificationStep({
  code,
  setCode,
  timer,
  onResend,
  onVerify,
  email,
  isLoading = false,
}: EmailVerificationStepProps) {
  const codeInputs = useRef<(TextInput | null)[]>([]);

  // Ensure code is always an array
  const safeCode = Array.isArray(code) ? code : ["", "", "", "", "", ""];

  const handleCodeChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...safeCode];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !safeCode[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a 6-digit verification code to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>
      </View>

      {/* Code Input */}
      <View style={styles.codeContainer}>
        {safeCode.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (codeInputs.current) {
                codeInputs.current[index] = ref;
              }
            }}
            style={styles.codeInput}
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
        <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
        <TouchableOpacity
          onPress={onResend}
          disabled={timer > 0}
          style={[
            styles.resendButton,
            timer > 0 && styles.resendButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.resendButtonText,
              timer > 0 && styles.resendButtonTextDisabled,
            ]}
          >
            {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Check your email inbox (and spam folder) for the verification code.
          The code expires in 10 minutes.
        </Text>
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.verifyButton,
          (isLoading || safeCode.some((digit) => !digit)) &&
            styles.verifyButtonDisabled,
        ]}
        onPress={onVerify}
        disabled={isLoading || safeCode.some((digit) => !digit)}
      >
        <Text style={styles.verifyButtonText}>
          {isLoading ? "Verifying..." : "Verify Email"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
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
    height: 48,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3142",
  },
  resendContainer: {
    marginBottom: 32,
  },
  resendText: {
    textAlign: "center",
    fontSize: 15,
    color: "#666",
    marginBottom: 16,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#4461F2",
  },
  resendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  resendButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  resendButtonTextDisabled: {
    color: "#999",
  },
  instructions: {
    backgroundColor: "#E6F4FE",
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  instructionsText: {
    fontSize: 14,
    color: "#0066CC",
  },
  verifyButton: {
    backgroundColor: "#4461F2",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
});
