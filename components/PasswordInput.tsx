import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
      <View className="flex-row items-center bg-white rounded-2xl px-4 h-[60px] shadow-sm">
        {showIcon && (
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color="#4461F2"
            className="mr-3"
          />
        )}
        <TextInput
          className="flex-1 text-base text-[#2D3142]"
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
          className="p-1"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={24}
            color="#B8B8B8"
          />
        </TouchableOpacity>
      </View>
      {displayError && (
        <Text className="text-[#FF3B30] text-[13px] mt-1.5 ml-1">
          {displayError}
        </Text>
      )}
    </>
  );
}
