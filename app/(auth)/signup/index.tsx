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
import { authStorage, User, MedicalProfile } from "@/utils/auth";
import InfoStep from "./components/InfoStep";
import PasswordStep from "./components/PasswordStep";
import OTPStep from "./components/OTPStep";
import MedicalProfileStep from "./components/MedicalProfileStep";

type Step = "info" | "password" | "medical" | "otp";

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

  // Step 3: Medical Profile
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(
    null,
  );
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodType, setBloodType] = useState<
    "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null
  >(null);
  const [chronicIllnesses, setChronicIllnesses] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 4: OTP
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

  const handleBack = useCallback(() => {
    if (step === "otp") {
      setStep("medical");
    } else if (step === "medical") {
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
      // Medical profile is optional, so we can continue without validation
      setTimer(59);
      setStep("otp");
    } else if (step === "otp") {
      try {
        // Create medical profile
        const medicalProfile: MedicalProfile = {
          gender,
          dateOfBirth: dateOfBirth || null,
          bloodType,
          chronicIllnesses,
          allergies,
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
        };

        // Create user object
        const user: User = {
          fullName,
          email,
          phoneNumber,
          password: newPassword,
          userType: "patient", // Default to patient for new signups
          medicalProfile,
        };

        // Save user to storage
        await authStorage.saveUser(user);

        // Set current user (without password)
        await authStorage.setCurrentUser({
          fullName,
          email,
          phoneNumber,
          userType: "patient", // Default to patient for new signups
          medicalProfile,
        });

        // Set logged in status
        await authStorage.setLoggedIn();

        console.log("Sign up complete");
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error completing signup:", error);
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

        {/* Continue/Verify Button - Hide for medical step as it has its own button */}
        {step !== "medical" && (
          <TouchableOpacity
            className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
            onPress={handleContinue}
          >
            <Text className="text-lg font-semibold text-white">
              {step === "otp" ? "Verify" : "Continue"}
            </Text>
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
    </KeyboardAvoidingView>
  );
}
