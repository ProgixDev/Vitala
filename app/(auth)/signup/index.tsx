import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import { registerPatient } from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import EmailVerificationStep from "./components/EmailVerificationStep";
import InfoStep from "./components/InfoStep";
import MedicalProfileStep from "./components/MedicalProfileStep";
import PasswordStep from "./components/PasswordStep";

type Step = "info" | "password" | "medical" | "verification";

export default function SignUp() {
  const params = useLocalSearchParams();
  const [step, setStep] = useState<Step>((params.step as Step) || "info");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Info
  const [fullName, setFullName] = useState((params.fullName as string) || "");
  const [email, setEmail] = useState((params.email as string) || "");
  const [phoneNumber, setPhoneNumber] = useState((params.phoneNumber as string) || "");

  // Step 2: Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Step 3: Medical Profile
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(
    null
  );
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodType, setBloodType] = useState<
    "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null
  >(null);
  const [chronicIllnesses, setChronicIllnesses] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 4: Email Verification
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);

  const handleBack = useCallback(() => {
    if (step === "verification") {
      setStep("medical");
    } else if (step === "medical") {
      setStep("password");
    } else if (step === "password") {
      setStep("info");
    } else {
      router.replace("/signup/choose");
    }
  }, [step]);
  // Handle back button/swipe
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [step, handleBack]);

  // Timer countdown for verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verification" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleContinue = async () => {
    if (step === "info") {
      // Validate info fields
      if (!fullName || !email || !phoneNumber) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill in all fields",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter a valid email address",
        });
        return;
      }

      // Validate phone format
      const phoneRegex = /^[0-9]{10,}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\D/g, ""))) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please enter a valid phone number (at least 10 digits)",
        });
        return;
      }

      // Validate name length
      if (fullName.trim().length < 2) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Name must be at least 2 characters",
        });
        return;
      }

      setStep("password");
    } else if (step === "password") {
      // Validate password fields
      if (!newPassword || !confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill in all fields",
        });
        return;
      }

      if (newPassword.length < 8) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Password must be at least 8 characters long",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Passwords do not match",
        });
        return;
      }

      setStep("medical");
    } else if (step === "medical") {
      // Submit registration to backend, then go to verification
      try {
        setIsLoading(true);

        const medicalProfile: MedicalProfile = {
          gender,
          dateOfBirth: dateOfBirth
            ? new Date(dateOfBirth.split("/").reverse().join("-")).toISOString()
            : null,
          bloodType,
          chronicIllnesses,
          allergies,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
        };

        const resp = await registerPatient({
          fullName,
          email,
          phoneNumber,
          password: newPassword,
          medicalProfile,
        });

        const { user: apiUser, token, refreshToken } = resp.data;
        await authStorage.setTokens(token, refreshToken);
        await authStorage.setCurrentUser({
          fullName: apiUser.fullName,
          email: apiUser.email,
          phoneNumber: apiUser.phoneNumber,
          userType: apiUser.userType || "patient",
          status: apiUser.status,
        });
        await authStorage.setLoggedIn();

        // Start the resend timer
        setTimer(59);
        setStep("verification");
      } catch (err) {
        console.error("Registration error:", err);
        Toast.show({ type: "error", text1: "Error", text2: String(err) });
      } finally {
        setIsLoading(false);
      }
    } else if (step === "verification") {
      // Verify email code
      try {
        setIsLoading(true);
        const code = verificationCode.join("");

        if (code.length !== 6) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please enter the complete 6-digit code",
          });
          return;
        }

        const { verifyEmail } = await import("@/utils/api");
        await verifyEmail(code);

        Toast.show({
          type: "success",
          text1: "Email Verified",
          text2: "Your account has been successfully verified!",
        });

        router.replace("/(tabs)");
      } catch (err) {
        console.error("Verification error:", err);
        Toast.show({ type: "error", text1: "Error", text2: String(err) });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignIn = () => {
    router.replace("/signin");
  };

  const handleResendCode = async () => {
    try {
      const { resendEmailVerification } = await import("@/utils/api");
      await resendEmailVerification(email);
      setTimer(59);
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "A new verification code has been sent to your email",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend verification code",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "info":
        return (
          <InfoStep
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
          />
        );

      case "password":
        return (
          <PasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
          />
        );

      case "medical":
        return (
          <MedicalProfileStep
            gender={gender}
            setGender={setGender}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            bloodType={bloodType}
            setBloodType={setBloodType}
            chronicIllnesses={chronicIllnesses}
            setChronicIllnesses={setChronicIllnesses}
            allergies={allergies}
            setAllergies={setAllergies}
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            onNext={handleContinue}
          />
        );

      case "verification":
        return (
          <EmailVerificationStep
            code={verificationCode}
            setCode={setVerificationCode}
            timer={timer}
            onResend={handleResendCode}
            onVerify={handleContinue}
            email={email}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}

        {/* Continue/Verify Button - Hide for medical and verification steps */}
        {step !== "medical" && step !== "verification" && (
          <TouchableOpacity
            className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
            onPress={handleContinue}
            disabled={isLoading}
          >
            <Text className="text-lg font-semibold text-white">Continue</Text>
          </TouchableOpacity>
        )}

        {/* Sign In Link */}
        {step === "info" && (
          <View className="flex-row justify-center items-center">
            <Text className="text-[15px] text-gray-500">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text className="text-[15px] text-[#2D3142] font-semibold">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <LoadingScreen
        visible={isLoading}
        message={
          step === "medical"
            ? "Creating your account..."
            : "Loading..."
        }
        subtitle={
          step === "medical"
            ? "Setting up your medical profile"
            : ""
        }
      />
    </KeyboardAvoidingView>
  );
}
