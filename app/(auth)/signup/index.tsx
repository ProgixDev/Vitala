import React, { useState, useEffect } from "react";
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
import { authStorage, User } from "@/utils/auth";
import InfoStep from "./components/InfoStep";
import PasswordStep from "./components/PasswordStep";
import OTPStep from "./components/OTPStep";

type Step = "info" | "password" | "otp";

export default function SignUp() {
  const [step, setStep] = useState<Step>("info");

  // Step 1: Info
  const [fullName, setFullName] = useState("testing test");
  const [email, setEmail] = useState("test@project.dev");
  const [phoneNumber, setPhoneNumber] = useState("0600000000");

  // Step 2: Password
  const [newPassword, setNewPassword] = useState("12345678");
  const [confirmPassword, setConfirmPassword] = useState("12345678");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Step 3: OTP
  const [otp, setOtp] = useState(["1", "2", "3", "4"]);
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleBack = () => {
    if (step === "otp") {
      setStep("password");
    } else if (step === "password") {
      setStep("info");
    } else {
      router.back();
    }
  };
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
  }, [step]);

  const handleContinue = async () => {
    if (step === "info") {
      // Validate info fields
      if (!fullName || !email || !phoneNumber) {
        alert("Please fill in all fields");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }

      // Validate phone format
      const phoneRegex = /^[0-9]{10,}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\D/g, ""))) {
        alert("Please enter a valid phone number (at least 10 digits)");
        return;
      }

      // Validate name length
      if (fullName.trim().length < 2) {
        alert("Name must be at least 2 characters");
        return;
      }

      setStep("password");
    } else if (step === "password") {
      // Validate password
      if (!newPassword || !confirmPassword) {
        alert("Please fill in both password fields");
        return;
      }
      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      setStep("otp");
    } else {
      // Handle final OTP verification and save user
      try {
        // Create user object
        const user: User = {
          fullName,
          email,
          phoneNumber,
          password: newPassword,
        };

        // Save user to storage
        await authStorage.saveUser(user);

        // Set current user (without password)
        await authStorage.setCurrentUser({
          fullName,
          email,
          phoneNumber,
        });

        // Set logged in status
        await authStorage.setLoggedIn();

        console.log("Sign up complete");
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error completing signup:", error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("Error completing signup. Please try again.");
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
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
          />
        );

      case "otp":
        return <OTPStep otp={otp} setOtp={setOtp} timer={timer} />;
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

        {/* Continue/Verify Button */}
        <TouchableOpacity
          className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
          onPress={handleContinue}
        >
          <Text className="text-lg font-semibold text-white">
            {step === "otp" ? "Verify" : "Continue"}
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
