import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Input, Text } from "@/components/ui";

interface InfoStepProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

const validateEmail = (email: string): string => {
  if (!email) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

const validatePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  const phoneRegex = /^[0-9]{10,}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, "")))
    return "Please enter a valid phone number (at least 10 digits)";
  return "";
};

const validateFullName = (name: string): string => {
  if (!name) return "";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return "";
};

export default function InfoStep({
  fullName,
  setFullName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
}: InfoStepProps) {
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (fullName) setNameError(validateFullName(fullName));
  }, [fullName]);
  useEffect(() => {
    if (email) setEmailError(validateEmail(email));
  }, [email]);
  useEffect(() => {
    if (phoneNumber) setPhoneError(validatePhoneNumber(phoneNumber));
  }, [phoneNumber]);

  return (
    <View>
      <Text variant="h1" color="foreground">
        Create your account
      </Text>
      <Text variant="bodyLg" color="muted" className="mt-2 mb-7">
        Tell us a little about yourself
      </Text>

      <Input
        label="Full name"
        placeholder="Jane Doe"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoCorrect={false}
        leftIcon="person-outline"
        error={nameError}
        textContentType="name"
        containerClassName="mb-4"
      />

      <Input
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon="mail-outline"
        error={emailError}
        textContentType="emailAddress"
        containerClassName="mb-4"
      />

      <Input
        label="Phone number"
        placeholder="(555) 000-0000"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        autoCorrect={false}
        leftIcon="call-outline"
        error={phoneError}
        textContentType="telephoneNumber"
        containerClassName="mb-2"
      />
    </View>
  );
}
