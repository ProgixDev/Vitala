import { useCurrentUser } from "@/hooks/useCurrentUser";
import { updateMedicalProfile, updateProfile } from "@/utils/api";
import { Card, Chip, Header, Input, Screen, Text } from "@/components/ui";
import { router } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function EditProfile() {
  const { currentUser, refreshUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  // Personal info state
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || "",
  );
  const [email, setEmail] = useState(currentUser?.email || "");

  // Medical info state
  const [gender, setGender] = useState(
    currentUser?.medicalProfile?.gender || "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    currentUser?.medicalProfile?.dateOfBirth || "",
  );
  const [bloodType, setBloodType] = useState(
    currentUser?.medicalProfile?.bloodType || "",
  );
  const [height, setHeight] = useState(
    currentUser?.medicalProfile?.height?.toString() || "",
  );
  const [weight, setWeight] = useState(
    currentUser?.medicalProfile?.weight?.toString() || "",
  );
  const [allergies, setAllergies] = useState(
    currentUser?.medicalProfile?.allergies?.join(", ") || "",
  );
  const [chronicIllnesses, setChronicIllnesses] = useState(
    currentUser?.medicalProfile?.chronicIllnesses?.join(", ") || "",
  );

  const handleSave = async () => {
    if (!currentUser?.token) return;

    setLoading(true);
    try {
      // Update personal profile
      await updateProfile(currentUser.token, {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
      });

      // Update medical profile if user is a patient
      if (currentUser.userType === "patient") {
        const medicalData: any = {
          gender: gender.trim() || undefined,
          dateOfBirth: dateOfBirth.trim() || undefined,
          bloodType: bloodType.trim() || undefined,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          allergies: allergies
            ? allergies
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a)
            : [],
          chronicIllnesses: chronicIllnesses
            ? chronicIllnesses
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c)
            : [],
        };

        await updateMedicalProfile(currentUser.token, medicalData);
      }

      // Refresh user data
      await refreshUser();

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been updated successfully",
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ["Male", "Female", "Other"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Screen scroll keyboardAvoiding>
      <Header
        title="Edit Profile"
        onBack={() => router.back()}
        rightIcon="checkmark"
        rightLabel="Save"
        onRightPress={() => {
          if (!loading) handleSave();
        }}
      />

      {/* Personal Information */}
      <View className="mt-4">
        <Text variant="h3" color="foreground" className="mb-3">
          Personal Information
        </Text>

        <Card elevation="e1">
          {/* Full Name */}
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            containerClassName="mb-4"
          />

          {/* Email */}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            containerClassName="mb-4"
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </Card>
      </View>

      {/* Medical Information */}
      {currentUser?.userType === "patient" && (
        <View className="mt-6">
          <Text variant="h3" color="foreground" className="mb-3">
            Medical Information
          </Text>

          <Card elevation="e1">
            {/* Gender */}
            <View className="mb-4">
              <Text variant="label" color="foreground" className="mb-2">
                Gender
              </Text>
              <View className="flex-row gap-3">
                {genderOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={gender === option.toLowerCase()}
                    onPress={() => setGender(option.toLowerCase())}
                    className="flex-1 justify-center"
                  />
                ))}
              </View>
            </View>

            {/* Date of Birth */}
            <Input
              label="Date of Birth"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="YYYY-MM-DD"
              containerClassName="mb-4"
            />

            {/* Blood Type */}
            <View className="mb-4">
              <Text variant="label" color="foreground" className="mb-2">
                Blood Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {bloodTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    selected={bloodType === type}
                    onPress={() => setBloodType(type)}
                  />
                ))}
              </View>
            </View>

            {/* Height & Weight */}
            <View className="flex-row gap-3 mb-4">
              <Input
                label="Height (cm)"
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                keyboardType="numeric"
                containerClassName="flex-1"
              />
              <Input
                label="Weight (kg)"
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                keyboardType="numeric"
                containerClassName="flex-1"
              />
            </View>

            {/* Allergies */}
            <Input
              label="Allergies (comma separated)"
              value={allergies}
              onChangeText={setAllergies}
              placeholder="Peanuts, Shellfish, etc."
              multiline
              numberOfLines={2}
              containerClassName="mb-4"
            />

            {/* Chronic Illnesses */}
            <Input
              label="Chronic Conditions (comma separated)"
              value={chronicIllnesses}
              onChangeText={setChronicIllnesses}
              placeholder="Diabetes, Hypertension, etc."
              multiline
              numberOfLines={2}
            />
          </Card>
        </View>
      )}
    </Screen>
  );
}
