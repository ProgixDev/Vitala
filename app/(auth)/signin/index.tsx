import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { authStorage } from "@/utils/auth";
import PasswordInput from "@/components/PasswordInput";

export default function SignIn() {
  const [email, setEmail] = useState("test@project.dev");
  const [password, setPassword] = useState("12345678");

  const handleContinue = async () => {
    // Validate inputs
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both email and password",
      });
      return;
    }

    try {
      // Validate credentials
      const user = await authStorage.validateCredentials(email, password);

      if (!user) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid email or password",
        });
        return;
      }

      // Set current user (without password)
      const currentUser: CurrentUser = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType || "patient", // Default to patient if not set
      };
      await authStorage.setCurrentUser(currentUser);

      // Set logged in status
      await authStorage.setLoggedIn();

      console.log("Sign in successful");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error during sign in:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error signing in. Please try again.",
      });
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
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign In Title */}
        <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
          Sign In
        </Text>

        {/* Email Input */}
        <View className="mb-5">
          <View className="flex-row items-center bg-white rounded-2xl px-4 h-[60px] shadow-sm">
            <Ionicons
              name="person-outline"
              size={24}
              color="#4461F2"
              className="mr-3"
            />
            <TextInput
              className="flex-1 text-base text-[#2D3142]"
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
        <View className="mb-5">
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            showIcon={true}
          />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          className="self-end mt-2 mb-10"
          onPress={handleForgotPassword}
        >
          <Text className="text-[15px] text-[#2D3142] font-medium">
            Forgot password?
          </Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-[#4461F2] rounded-[28px] h-14 justify-center items-center shadow-lg mb-8"
          onPress={handleContinue}
        >
          <Text className="text-lg font-semibold text-white">Continue</Text>
        </TouchableOpacity>

        {/* Create Account */}
        <View className="flex-row justify-center items-center">
          <Text className="text-[15px] text-gray-500">
            Don&apos;t have an account?{" "}
          </Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text className="text-[15px] text-[#2D3142] font-semibold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
