import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  BackHandler,
} from "react-native";

import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { authStorage } from "@/utils/auth";
import InfoStep from "../components/InfoStep";
import PasswordStep from "../components/PasswordStep";
import IdCaptureStep from "./components/IdCaptureStep";
import SelfieStep from "./components/SelfieStep";
import ReviewStep from "./components/ReviewStep";

type Step = "info" | "password" | "id" | "selfie" | "review";

export default function NurseSignUp() {
  const [step, setStep] = useState<Step>("info");

  // Step 1: Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 & 3: ID and Selfie
  const [idFrontUri, setIdFrontUri] = useState<string | undefined>();
  const [idBackUri, setIdBackUri] = useState<string | undefined>();
  const [selfieUri, setSelfieUri] = useState<string | undefined>();

  const handleBack = useCallback(() => {
    if (step === "review") {
      setStep("selfie");
    } else if (step === "selfie") {
      setStep("id");
    } else if (step === "id") {
      setStep("password");
    } else if (step === "password") {
      setStep("info");
    } else {
      router.back();
    }
  }, [step]);

  // Handle back button/swipe
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [step, handleBack]);

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
      if (!password || !confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please fill in all fields",
        });
        return;
      }

      // Validate password
      if (password.length < 8) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Password must be at least 8 characters long",
        });
        return;
      }

      if (password !== confirmPassword) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Passwords do not match",
        });
        return;
      }

      setStep("id");
    } else if (step === "id") {
      if (!idFrontUri || !idBackUri) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please capture front and back of your ID",
        });
        return;
      }

      setStep("selfie");
    } else if (step === "selfie") {
      if (!selfieUri) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please capture a selfie for verification",
        });
        return;
      }

      setStep("review");
    } else if (step === "review") {
      try {
        // Create user object
        const user: User = {
          fullName,
          email,
          phoneNumber,
          password,
          userType: "nurse",
          status: "pending",
          verification: { idFrontUri, idBackUri, selfieUri },
        };

        // Save user to storage
        await authStorage.saveUser(user);

        // Set current user (without password)
        await authStorage.setCurrentUser({
          fullName,
          email,
          phoneNumber,
          userType: "nurse",
          status: "pending",
          verification: { idFrontUri, idBackUri, selfieUri },
        });

        // Set logged in status
        await authStorage.setLoggedIn();

        Toast.show({
          type: "success",
          text1: "Submitted",
          text2: "Your account is pending verification",
        });

        console.log("Nurse sign up complete");
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error completing nurse signup:", error);
        if (error instanceof Error) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Error completing signup. Please try again.",
          });
        }
      }
    }
  };

  const handleSignIn = () => {
    router.replace("/signin");
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
            newPassword={password}
            setNewPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showPassword}
            setShowNewPassword={setShowPassword}
          />
        );

      case "id":
        return (
          <IdCaptureStep
            idFrontUri={idFrontUri}
            setIdFrontUri={setIdFrontUri}
            idBackUri={idBackUri}
            setIdBackUri={setIdBackUri}
          />
        );

      case "selfie":
        return <SelfieStep selfieUri={selfieUri} setSelfieUri={setSelfieUri} />;

      case "review":
        return (
          <ReviewStep
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            idFrontUri={idFrontUri}
            idBackUri={idBackUri}
            selfieUri={selfieUri}
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

        {/* Continue/Submit Button */}
        <TouchableOpacity
          className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
          onPress={handleContinue}
        >
          <Text className="text-lg font-semibold text-white">
            {step === "review" ? "Submit" : "Continue"}
          </Text>
        </TouchableOpacity>

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
    </KeyboardAvoidingView>
  );
}
