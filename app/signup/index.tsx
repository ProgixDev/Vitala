import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { authStorage } from "../../utils/auth";
import InfoStep from "./components/InfoStep";
import PasswordStep from "./components/PasswordStep";
import OTPStep from "./components/OTPStep";

type Step = "info" | "password" | "otp";

export default function SignUp() {
  const [step, setStep] = useState<Step>("info");

  // Step 1: Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 2: Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Step 3: OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(59);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const checkLoginStatus = async () => {
    const isLoggedIn = await authStorage.isLoggedIn();
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  };

  const handleContinue = async () => {
    if (step === "info") {
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
      // Handle final submission
      console.log("Sign up complete");

      // After successful signup, set loggedIn to true
      try {
        await authStorage.setLoggedIn();
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error saving login status:", error);
      }
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {renderStepContent()}

        {/* Continue/Verify Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {step === "otp" ? "Verify" : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>
            {step === "otp"
              ? "Remembered password? "
              : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 140,
  },
  continueButton: {
    backgroundColor: "#4461F2",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4461F2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 15,
    color: "#757575",
  },
  signInLink: {
    fontSize: 15,
    color: "#2D3142",
    fontWeight: "600",
  },
});
