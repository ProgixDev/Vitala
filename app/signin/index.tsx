import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authStorage, CurrentUser } from "../../utils/auth";
import PasswordInput from "../../components/PasswordInput";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const isLoggedIn = await authStorage.isLoggedIn();
    if (isLoggedIn) {
      router.replace("/(tabs)" as any);
    }
  };

  const handleContinue = async () => {
    // Validate inputs
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      // Validate credentials
      const user = await authStorage.validateCredentials(email, password);

      if (!user) {
        alert("Invalid email or password");
        return;
      }

      // Set current user (without password)
      const currentUser: CurrentUser = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      };
      await authStorage.setCurrentUser(currentUser);

      // Set logged in status
      await authStorage.setLoggedIn();

      console.log("Sign in successful");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error during sign in:", error);
      alert("Error signing in. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password
    console.log("Forgot password");
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar hidden />
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

        {/* Sign In Title */}
        <Text style={styles.title}>Sign In</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={24}
              color="#4461F2"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#B8B8B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            showIcon={true}
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Create Account */}
        <View style={styles.createAccountContainer}>
          <Text style={styles.createAccountText}>
            Don&apos;t have an account?{" "}
          </Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccountLink}>Create Account</Text>
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
  title: {
    fontSize: 36,
    fontWeight: "600",
    color: "#2D3142",
    textAlign: "center",
    marginBottom: 60,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2D3142",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 40,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: "#2D3142",
    fontWeight: "500",
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
  createAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  createAccountText: {
    fontSize: 15,
    color: "#757575",
  },
  createAccountLink: {
    fontSize: 15,
    color: "#2D3142",
    fontWeight: "600",
  },
});
