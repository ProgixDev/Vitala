import { useCurrentUser } from "@/hooks/useCurrentUser";
import { updateMedicalProfile, updateProfile } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Toast from "react-native-toast-message";

export default function EditProfile() {
  const { currentUser, refreshUser } = useCurrentUser();
  const [loading, setLoading] = useState(false);

  // Personal info state
  const [fullName, setFullName] = useState(currentUser?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  // Medical info state
  const [gender, setGender] = useState(currentUser?.medicalProfile?.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.medicalProfile?.dateOfBirth || "");
  const [bloodType, setBloodType] = useState(currentUser?.medicalProfile?.bloodType || "");
  const [height, setHeight] = useState(currentUser?.medicalProfile?.height?.toString() || "");
  const [weight, setWeight] = useState(currentUser?.medicalProfile?.weight?.toString() || "");
  const [allergies, setAllergies] = useState(currentUser?.medicalProfile?.allergies?.join(", ") || "");
  const [chronicIllnesses, setChronicIllnesses] = useState(currentUser?.medicalProfile?.chronicIllnesses?.join(", ") || "");

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
      if (currentUser.userType === 'patient') {
        const medicalData: any = {
          gender: gender.trim() || undefined,
          dateOfBirth: dateOfBirth.trim() || undefined,
          bloodType: bloodType.trim() || undefined,
          height: height ? parseFloat(height) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          allergies: allergies ? allergies.split(",").map(a => a.trim()).filter(a => a) : [],
          chronicIllnesses: chronicIllnesses ? chronicIllnesses.split(",").map(c => c.trim()).filter(c => c) : [],
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
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">
          Edit Profile
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons
            name="checkmark"
            size={24}
            color={loading ? "#9CA3AF" : "#4461F2"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information */}
        <View className="px-6 mt-6">
          <Text className="text-base font-semibold text-[#1F2937] mb-3">
            Personal Information
          </Text>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            {/* Full Name */}
            <View className="mb-4">
              <Text className="text-[13px] text-[#6B7280] mb-2">Full Name</Text>
              <TextInput
                className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-[13px] text-[#6B7280] mb-2">Email</Text>
              <TextInput
                className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone Number */}
            <View className="mb-0">
              <Text className="text-[13px] text-[#6B7280] mb-2">Phone Number</Text>
              <TextInput
                className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Medical Information */}
        {currentUser?.userType === 'patient' && (
          <View className="px-6 mt-6">
            <Text className="text-base font-semibold text-[#1F2937] mb-3">
              Medical Information
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Gender */}
              <View className="mb-4">
                <Text className="text-[13px] text-[#6B7280] mb-2">Gender</Text>
                <View className="flex-row gap-3">
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      className={`flex-1 py-3 px-4 rounded-lg border ${
                        gender === option.toLowerCase()
                          ? "border-[#4461F2] bg-[#EEF2FF]"
                          : "border-[#D1D5DB] bg-white"
                      }`}
                      onPress={() => setGender(option.toLowerCase())}
                    >
                      <Text
                        className={`text-center text-sm ${
                          gender === option.toLowerCase()
                            ? "text-[#4461F2] font-medium"
                            : "text-[#6B7280]"
                        }`}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date of Birth */}
              <View className="mb-4">
                <Text className="text-[13px] text-[#6B7280] mb-2">Date of Birth</Text>
                <TextInput
                  className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              {/* Blood Type */}
              <View className="mb-4">
                <Text className="text-[13px] text-[#6B7280] mb-2">Blood Type</Text>
                <View className="flex-row flex-wrap gap-2">
                  {bloodTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      className={`px-4 py-2 rounded-lg border ${
                        bloodType === type
                          ? "border-[#4461F2] bg-[#EEF2FF]"
                          : "border-[#D1D5DB] bg-white"
                      }`}
                      onPress={() => setBloodType(type)}
                    >
                      <Text
                        className={`text-sm ${
                          bloodType === type
                            ? "text-[#4461F2] font-medium"
                            : "text-[#6B7280]"
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Height & Weight */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[13px] text-[#6B7280] mb-2">Height (cm)</Text>
                  <TextInput
                    className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                    value={height}
                    onChangeText={setHeight}
                    placeholder="170"
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] text-[#6B7280] mb-2">Weight (kg)</Text>
                  <TextInput
                    className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Allergies */}
              <View className="mb-4">
                <Text className="text-[13px] text-[#6B7280] mb-2">
                  Allergies (comma separated)
                </Text>
                <TextInput
                  className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                  value={allergies}
                  onChangeText={setAllergies}
                  placeholder="Peanuts, Shellfish, etc."
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Chronic Illnesses */}
              <View className="mb-0">
                <Text className="text-[13px] text-[#6B7280] mb-2">
                  Chronic Conditions (comma separated)
                </Text>
                <TextInput
                  className="border border-[#D1D5DB] rounded-lg px-4 py-3 text-base"
                  value={chronicIllnesses}
                  onChangeText={setChronicIllnesses}
                  placeholder="Diabetes, Hypertension, etc."
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}