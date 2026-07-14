import React, { useState } from "react";
import { TextInputProps } from "react-native";
import { Input } from "@/components/ui/Input";

interface PasswordInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  showIcon?: boolean;
  showPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
  error?: string;
}

/**
 * Password field built on the shared Input primitive: lock icon, show/hide
 * toggle, and inline length validation. API preserved for existing callers.
 */
export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Enter password",
  label,
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
    <Input
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      error={displayError}
      leftIcon={showIcon ? "lock-closed-outline" : undefined}
      rightIcon={showPassword ? "eye-outline" : "eye-off-outline"}
      onRightIconPress={() => setShowPassword(!showPassword)}
      secureTextEntry={!showPassword}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      {...rest}
    />
  );
}
