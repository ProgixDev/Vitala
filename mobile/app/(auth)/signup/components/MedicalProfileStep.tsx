import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface MedicalProfileStepProps {
  gender: "male" | "female" | "other" | null;
  setGender: (gender: "male" | "female" | "other" | null) => void;
  dateOfBirth: string;
  setDateOfBirth: (dob: string) => void;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
  setBloodType: (
    type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null,
  ) => void;
  chronicIllnesses: string[];
  setChronicIllnesses: (illnesses: string[]) => void;
  allergies: string[];
  setAllergies: (allergies: string[]) => void;
  height: string;
  setHeight: (height: string) => void;
  weight: string;
  setWeight: (weight: string) => void;
  onNext: () => void;
}

export default function MedicalProfileStep({
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  bloodType,
  setBloodType,
  chronicIllnesses,
  setChronicIllnesses,
  allergies,
  setAllergies,
  height,
  setHeight,
  weight,
  setWeight,
  onNext,
}: MedicalProfileStepProps) {
  const [newAllergy, setNewAllergy] = useState("");
  const [newIllness, setNewIllness] = useState("");
  const [rhFactor, setRhFactor] = useState<"+" | "-" | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const bloodTypes = [
    { label: "O (I)", value: "O" },
    { label: "A (II)", value: "A" },
    { label: "B (III)", value: "B" },
    { label: "AB (IV)", value: "AB" },
  ];

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddIllness = () => {
    if (newIllness.trim()) {
      setChronicIllnesses([...chronicIllnesses, newIllness.trim()]);
      setNewIllness("");
    }
  };

  const handleRemoveIllness = (index: number) => {
    setChronicIllnesses(chronicIllnesses.filter((_, i) => i !== index));
  };

  const handleBloodTypeSelect = (type: string) => {
    if (rhFactor) {
      setBloodType(`${type}${rhFactor}` as any);
    }
  };

  const handleRhFactorSelect = (factor: "+" | "-") => {
    setRhFactor(factor);
    if (bloodType) {
      const baseType = bloodType.replace(/[+-]/g, "");
      setBloodType(`${baseType}${factor}` as any);
    }
  };

  const handleDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selected) {
      setSelectedDate(selected);
      const day = String(selected.getDate()).padStart(2, "0");
      const month = String(selected.getMonth() + 1).padStart(2, "0");
      const year = selected.getFullYear();
      setDateOfBirth(`${day}/${month}/${year}`);
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDatePickerDismiss = () => {
    setShowDatePicker(false);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="mb-6">
        <Text className="text-3xl font-bold text-[#2D3142] mb-2">
          Health Assessment
        </Text>
        <Text className="text-sm text-[#9E9E9E]">
          This data will help us to customize the treatment and ensure precise
          care for your patient.
        </Text>
      </View>

      {/* Gender Selection */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          Gender
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl border-2 ${
              gender === "male"
                ? "border-[#4461F2] bg-[#4461F2]/10"
                : "border-gray-200 bg-white"
            }`}
            onPress={() => setGender("male")}
          >
            <Text
              className={`text-center font-semibold ${
                gender === "male" ? "text-[#4461F2]" : "text-[#6B7280]"
              }`}
            >
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl border-2 ${
              gender === "female"
                ? "border-[#4461F2] bg-[#4461F2]/10"
                : "border-gray-200 bg-white"
            }`}
            onPress={() => setGender("female")}
          >
            <Text
              className={`text-center font-semibold ${
                gender === "female" ? "text-[#4461F2]" : "text-[#6B7280]"
              }`}
            >
              Female
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl border-2 ${
              gender === "other"
                ? "border-[#4461F2] bg-[#4461F2]/10"
                : "border-gray-200 bg-white"
            }`}
            onPress={() => setGender("other")}
          >
            <Text
              className={`text-center font-semibold ${
                gender === "other" ? "text-[#4461F2]" : "text-[#6B7280]"
              }`}
            >
              Other
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date of Birth */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          Date of Birth
        </Text>
        <TouchableOpacity
          className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3"
          onPress={handleDatePress}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-base ${
                dateOfBirth ? "text-[#2D3142]" : "text-[#9E9E9E]"
              }`}
            >
              {dateOfBirth || "DD/MM/YYYY"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#9E9E9E" />
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            onTouchCancel={handleDatePickerDismiss}
          />
        )}
      </View>

      {/* Blood Type */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          Blood type: {bloodType || ""}
        </Text>

        {/* Blood Type Selection */}
        <View className="flex-row justify-between mb-4">
          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              className={`w-[23%] aspect-square rounded-2xl border-2 items-center justify-center ${
                bloodType?.startsWith(type.value)
                  ? "border-[#4461F2] bg-[#4461F2]"
                  : "border-gray-200 bg-white"
              }`}
              onPress={() => handleBloodTypeSelect(type.value)}
            >
              <Ionicons
                name="water"
                size={28}
                color={
                  bloodType?.startsWith(type.value) ? "#FFFFFF" : "#4461F2"
                }
              />
              <Text
                className={`text-sm font-semibold mt-1 ${
                  bloodType?.startsWith(type.value)
                    ? "text-white"
                    : "text-[#2D3142]"
                }`}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rh Factor */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 py-4 rounded-2xl ${
              rhFactor === "+"
                ? "bg-[#4461F2]"
                : "bg-white border-2 border-gray-200"
            }`}
            onPress={() => handleRhFactorSelect("+")}
          >
            <Text
              className={`text-center text-lg font-bold ${
                rhFactor === "+" ? "text-white" : "text-[#2D3142]"
              }`}
            >
              Rh +
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-4 rounded-2xl ${
              rhFactor === "-"
                ? "bg-[#4461F2]"
                : "bg-white border-2 border-gray-200"
            }`}
            onPress={() => handleRhFactorSelect("-")}
          >
            <Text
              className={`text-center text-lg font-bold ${
                rhFactor === "-" ? "text-white" : "text-[#2D3142]"
              }`}
            >
              Rh —
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Allergies */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          Allergies
        </Text>
        <View className="flex-row gap-2 mb-3">
          <TextInput
            className="flex-1 bg-white rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-[#2D3142]"
            placeholder="Add allergy"
            placeholderTextColor="#9E9E9E"
            value={newAllergy}
            onChangeText={setNewAllergy}
          />
          <TouchableOpacity
            className="bg-[#4461F2] rounded-xl px-4 justify-center"
            onPress={handleAddAllergy}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {allergies.map((allergy, index) => (
            <View
              key={index}
              className="bg-white rounded-full px-4 py-2 flex-row items-center gap-2 border border-gray-200"
            >
              <Text className="text-sm text-[#2D3142]">{allergy}</Text>
              <TouchableOpacity onPress={() => handleRemoveAllergy(index)}>
                <Ionicons name="close-circle" size={18} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Chronic Conditions */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-[#2D3142] mb-3">
          Chronic conditions
        </Text>
        <View className="flex-row gap-2 mb-3">
          <TextInput
            className="flex-1 bg-white rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-[#2D3142]"
            placeholder="Add chronic condition"
            placeholderTextColor="#9E9E9E"
            value={newIllness}
            onChangeText={setNewIllness}
          />
          <TouchableOpacity
            className="bg-[#4461F2] rounded-xl px-4 justify-center"
            onPress={handleAddIllness}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {chronicIllnesses.map((illness, index) => (
            <View
              key={index}
              className="bg-white rounded-full px-4 py-2 flex-row items-center gap-2 border border-gray-200"
            >
              <Text className="text-sm text-[#2D3142]">{illness}</Text>
              <TouchableOpacity onPress={() => handleRemoveIllness(index)}>
                <Ionicons name="close-circle" size={18} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Height and Weight */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1">
          <Text className="text-base font-semibold text-[#2D3142] mb-3">
            Your height (cm)
          </Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput
              className="text-base text-[#2D3142]"
              placeholder="172 cm"
              placeholderTextColor="#9E9E9E"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-[#2D3142] mb-3">
            Your weight (kg)
          </Text>
          <View className="bg-white rounded-xl border-2 border-gray-200 px-4 py-3">
            <TextInput
              className="text-base text-[#2D3142]"
              placeholder="85 kg"
              placeholderTextColor="#9E9E9E"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        className="bg-[#4461F2] py-4 rounded-[28px] items-center justify-center mb-6"
        onPress={onNext}
      >
        <Text className="text-white text-lg font-semibold">Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
