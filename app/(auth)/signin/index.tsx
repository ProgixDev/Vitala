import React, { useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import PasswordInput from "@/components/PasswordInput";
import { login as apiLogin } from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle back button - prevent going back from signin page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true to prevent default back behavior (exit app)
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

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
      setIsLoading(true);
      
      // Try backend login first
      try {
        const resp = await apiLogin(email, password);
        const { user: apiUser, token, refreshToken } = resp.data;

        // Store tokens
        await authStorage.setTokens(token, refreshToken);

        // Set current user
        const currentUser: CurrentUser = {
          fullName: apiUser.fullName,
          email: apiUser.email,
          phoneNumber: apiUser.phoneNumber,
          userType: apiUser.userType || "patient",
          status: apiUser.status,
          verification: apiUser.verification,
        };
        await authStorage.setCurrentUser(currentUser);
        await authStorage.setLoggedIn();

        console.log("Sign in successful (API)");
        if (
          currentUser.userType === "nurse" &&
          currentUser.status === "pending"
        ) {
          router.replace("/profile/pending");
        } else {
          router.replace("/(tabs)");
        }
        return;
      } catch (apiErr) {
        console.warn("API login failed, falling back to local:", apiErr);
      }

      // Fallback: validate local credentials (dev/demo mode)
      const user = await authStorage.validateCredentials(email, password);
      if (!user) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid email or password",
        });
        return;
      }

      const currentUser: CurrentUser = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType || "patient",
        status: user.status,
        verification: user.verification,
      };
      await authStorage.setCurrentUser(currentUser);
      await authStorage.setLoggedIn();

      console.log("Sign in successful");
      if (
        currentUser.userType === "nurse" &&
        currentUser.status === "pending"
      ) {
        router.replace("/profile/pending");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error signing in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Use entered email to request reset
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Forgot Password",
        text2: "Please enter your email above first",
      });
      return;
    }
    apiLogin // noop to keep imports used
    ;(async () => {
      try {
        const { forgotPassword } = await import("@/utils/api");
        await forgotPassword(email);
        Toast.show({
          type: "success",
          text1: "Email sent",
          text2: "Check your inbox for the reset link",
        });
      } catch (err) {
        console.error("Forgot password error:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not send reset email",
        });
      }
    })();
  };

  const handleCreateAccount = () => {
    router.replace("/signup/choose");
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
          disabled={isLoading}
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

      <LoadingScreen
        visible={isLoading}
        message="Signing you in..."
        subtitle="Please wait while we authenticate you"
      />
    </KeyboardAvoidingView>
  );
}
