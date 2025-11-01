import React, { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

const validatePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  const phoneRegex = /^[0-9]{10,}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
    return "Please enter a valid phone number (at least 10 digits)";
  }
  return "";
};

const validateFullName = (name: string): string => {
  if (!name) return "";
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
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
    if (fullName) {
      setNameError(validateFullName(fullName));
    }
  }, [fullName]);

  useEffect(() => {
    if (email) {
      setEmailError(validateEmail(email));
    }
  }, [email]);

  useEffect(() => {
    if (phoneNumber) {
      setPhoneError(validatePhoneNumber(phoneNumber));
    }
  }, [phoneNumber]);

  return (
    <>
      <Text className="text-4xl font-semibold text-[#2D3142] text-center my-[15%]">
        Sign Up
      </Text>

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
            placeholder="Enter full name"
            placeholderTextColor="#B8B8B8"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        {nameError ? (
          <Text className="text-[#FF3B30] text-[13px] mt-1.5 ml-1">
            {nameError}
          </Text>
        ) : null}
      </View>

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
        {emailError ? (
          <Text className="text-[#FF3B30] text-[13px] mt-1.5 ml-1">
            {emailError}
          </Text>
        ) : null}
      </View>

      <View className="mb-5">
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-[60px] shadow-sm">
          <Ionicons
            name="call-outline"
            size={24}
            color="#4461F2"
            className="mr-3"
          />
          <TextInput
            className="flex-1 text-base text-[#2D3142]"
            placeholder="Enter phone number"
            placeholderTextColor="#B8B8B8"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCorrect={false}
          />
        </View>
        {phoneError ? (
          <Text className="text-[#FF3B30] text-[13px] mt-1.5 ml-1">
            {phoneError}
          </Text>
        ) : null}
      </View>
    </>
  );
}
