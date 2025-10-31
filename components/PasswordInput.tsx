import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  showPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
  error?: string;
}

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Enter password",
  showIcon = false,
  showPassword: externalShowPassword,
  setShowPassword: externalSetShowPassword,
  error = "",
  ...rest
}: PasswordInputProps) {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const showPassword =
    externalShowPassword !== undefined
      ? externalShowPassword
      : internalShowPassword;
  const setShowPassword = externalSetShowPassword || setInternalShowPassword;

  const hasLengthError = value.length > 0 && value.length < 8;
  const displayError =
    error ||
    (hasLengthError ? "Password must be at least 8 characters long" : "");

  return (
    <>
      <View style={styles.inputWrapper}>
        {showIcon && (
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="#4461F2"
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#B8B8B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="#B8B8B8"
          />
        </TouchableOpacity>
      </View>
      {displayError && <Text style={styles.errorText}>{displayError}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
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
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});
