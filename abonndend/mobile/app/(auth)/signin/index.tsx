import React, { useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import PasswordInput from "@/components/PasswordInput";
import { Button, Input, Text } from "@/components/ui";
import { login as apiLogin } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { t } from "@/utils/i18n";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setTokens } = useCurrentUser();

  // Handle back button - prevent going back from signin page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true to prevent default back behavior (exit app)
        return true;
      },
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

      const resp = await apiLogin(email, password);
      const { user: apiUser, token, refreshToken } = resp.data;

      // Store tokens
      await setTokens(token, refreshToken);

      const role =
        (apiUser as any)?.app_metadata?.role ??
        (apiUser as any)?.user_metadata?.role;
      if (role === "nurse") {
        // Nurses land on the pending screen; approved nurses can proceed from there.
        router.replace("/profile/pending");
      } else {
        router.replace("/(tabs)");
      }
    } catch (apiErr: any) {
      if (
        apiErr.message?.includes("Email not verified") ||
        apiErr.message?.includes("403")
      ) {
        Toast.show({
          type: "info",
          text1: "Email Verification Required",
          text2: "Redirecting to email verification...",
        });

        // Navigate to signup verification step
        router.replace({
          pathname: "/(auth)/signup",
          params: { step: "verification", email: email },
        });
      } else {
        console.warn("API login failed:", apiErr);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: apiErr.message || "Invalid email or password",
        });

        console.error("Error during sign in:", apiErr);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Error signing in. Please try again.",
        });
      }
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
    apiLogin; // noop to keep imports used
    (async () => {
      try {
        setIsLoading(true);
        const { forgotPassword } = await import("@/utils/api");
        const response = await forgotPassword(email);

        setIsLoading(false);

        // Supabase emails the recovery code; navigate to enter it.
        void response;
        router.push({
          pathname: "/(auth)/verify-reset-code",
          params: { email },
        });

        Toast.show({
          type: "success",
          text1: "Code Sent",
          text2: "Check your email for the reset code",
          visibilityTime: 4000,
        });
      } catch (err: any) {
        setIsLoading(false);
        console.error("Forgot password error:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: err?.message || "Could not send reset code",
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heading */}
        <View className="mb-8">
          <Text variant="h1" color="foreground">
            {t("auth.signIn.title")}
          </Text>
          <Text variant="bodyLg" color="muted" className="mt-2">
            {t("auth.signIn.subtitle")}
          </Text>
        </View>

        {/* Email */}
        <Input
          label={t("auth.email")}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon="mail-outline"
          textContentType="emailAddress"
          containerClassName="mb-4"
        />

        {/* Password */}
        <PasswordInput
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          showIcon
        />

        {/* Forgot Password */}
        <Pressable
          className="self-end mt-3 mb-8 py-1"
          onPress={handleForgotPassword}
          hitSlop={8}
        >
          <Text variant="label" color="primary" weight="semibold">
            {t("auth.forgotPassword")}
          </Text>
        </Pressable>

        {/* Continue */}
        <Button
          label={t("common.continue")}
          onPress={handleContinue}
          loading={isLoading}
          size="lg"
        />

        {/* Create Account */}
        <View className="flex-row justify-center items-center mt-6">
          <Text variant="body" color="muted">
            {t("auth.noAccount")}{" "}
          </Text>
          <Pressable onPress={handleCreateAccount} hitSlop={8}>
            <Text variant="body" color="primary" weight="semibold">
              {t("auth.createAccount")}
            </Text>
          </Pressable>
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
