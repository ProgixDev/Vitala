import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
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
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#4461F2"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            placeholderTextColor="#B8B8B8"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="person-outline"
            size={24}
            color="#4461F2"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#B8B8B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={24}
            color="#4461F2"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor="#B8B8B8"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCorrect={false}
          />
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
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
  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
});
