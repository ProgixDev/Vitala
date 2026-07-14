import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import LoadingScreen from "@/components/LoadingScreen";
import { Button, IconButton, StepProgress, Text } from "@/components/ui";
import { registerNurse } from "@/utils/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { t } from "@/utils/i18n";
import InfoStep from "../components/InfoStep";
import PasswordStep from "../components/PasswordStep";
import IdCaptureStep from "./components/IdCaptureStep";
import ReviewStep from "./components/ReviewStep";
import SelfieStep from "./components/SelfieStep";

type Step = "info" | "password" | "id" | "selfie" | "review";

const STEP_ORDER: Step[] = ["info", "password", "id", "selfie", "review"];
const STEP_LABELS: Record<Step, string> = {
  info: "Your details",
  password: "Secure your account",
  id: "Government ID",
  selfie: "Selfie check",
  review: "Review & submit",
};

export default function NurseSignUp() {
  const [step, setStep] = useState<Step>("info");
  const [isLoading, setIsLoading] = useState(false);

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

  const { setTokens } = useCurrentUser();

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
        setIsLoading(true);

        if (!idFrontUri || !idBackUri || !selfieUri) {
          throw new Error("Missing ID/selfie files");
        }

        const form = new FormData();
        form.append("fullName", fullName);
        form.append("email", email);
        form.append("phoneNumber", phoneNumber);
        form.append("password", password);
        // optional nurse meta
        form.append("licenseNumber", "");
        form.append("specializations", JSON.stringify([]));
        form.append("experience", String(0));

        // For React Native, file objects with uri, name, and type work with FormData
        form.append("idFront", {
          uri: idFrontUri,
          name: "id_front.jpg",
          type: "image/jpeg",
        } as any);
        form.append("idBack", {
          uri: idBackUri,
          name: "id_back.jpg",
          type: "image/jpeg",
        } as any);
        form.append("selfie", {
          uri: selfieUri,
          name: "selfie.jpg",
          type: "image/jpeg",
        } as any);

        console.log("Starting nurse registration...");
        console.log("Form data:", {
          fullName,
          email,
          phoneNumber,
          idFrontUri: !!idFrontUri,
          idBackUri: !!idBackUri,
          selfieUri: !!selfieUri,
        });

        const resp = await registerNurse(form);
        console.log("Nurse registration response:", resp);
        // Nurses are pending verification — they sign in after approval, so no
        // session is stored here.

        Toast.show({
          type: "success",
          text1: "Submitted",
          text2: "Your account is pending verification",
        });
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Error completing nurse signup:", error);
        const msg =
          error instanceof Error
            ? error.message
            : "Error completing signup. Please try again.";
        Toast.show({ type: "error", text1: "Error", text2: msg });
      } finally {
        setIsLoading(false);
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

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Wizard chrome */}
      <View className="flex-row items-center mb-4">
        <IconButton
          icon="chevron-back"
          onPress={handleBack}
          accessibilityLabel="Go back"
          className="-ml-2"
        />
        <StepProgress
          current={stepIndex + 1}
          total={STEP_ORDER.length}
          label={`Step ${stepIndex + 1} of ${STEP_ORDER.length} · ${STEP_LABELS[step]}`}
          className="flex-1 ml-1"
        />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}

        <Button
          label={step === "review" ? "Submit for review" : t("common.continue")}
          onPress={handleContinue}
          loading={isLoading}
          size="lg"
          className="mt-6"
        />

        {step === "info" && (
          <View className="flex-row justify-center items-center mt-6">
            <Text variant="body" color="muted">
              {t("onboarding.haveAccount")}{" "}
            </Text>
            <Pressable onPress={handleSignIn} hitSlop={8}>
              <Text variant="body" color="primary" weight="semibold">
                {t("onboarding.logIn")}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <LoadingScreen
        visible={isLoading}
        message="Creating your account..."
        subtitle="Uploading documents and processing registration"
      />
    </KeyboardAvoidingView>
  );
}
