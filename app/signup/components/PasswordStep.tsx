import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PasswordInput from "../../../components/PasswordInput";

interface PasswordStepProps {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
}

export default function PasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
}: PasswordStepProps) {
  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    newPassword.length > 0 &&
    newPassword !== confirmPassword;

  return (
    <>
      <Text style={styles.title}>Set Password</Text>

      <View style={[styles.inputContainer, styles.passwordInput]}>
        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          showPassword={showNewPassword}
          setShowPassword={setShowNewPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          showPassword={showNewPassword}
          setShowPassword={setShowNewPassword}
          error={passwordsDoNotMatch ? "Passwords do not match" : ""}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  passwordInput: {
    marginTop: 60,
  },
});
