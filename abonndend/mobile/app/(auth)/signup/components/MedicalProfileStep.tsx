import React, { useState } from "react";
import { View, Pressable, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Chip, IconButton, Input, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";

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

const GENDERS: { label: string; value: "male" | "female" | "other" }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const BLOOD_TYPES = [
  { label: "O", value: "O" },
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "AB", value: "AB" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text variant="label" color="foreground" className="mb-3">
      {children}
    </Text>
  );
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
  const colors = useThemeColors();
  const [newAllergy, setNewAllergy] = useState("");
  const [newIllness, setNewIllness] = useState("");
  const [rhFactor, setRhFactor] = useState<"+" | "-" | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };
  const handleAddIllness = () => {
    if (newIllness.trim()) {
      setChronicIllnesses([...chronicIllnesses, newIllness.trim()]);
      setNewIllness("");
    }
  };

  const handleBloodTypeSelect = (type: string) => {
    if (rhFactor) setBloodType(`${type}${rhFactor}` as any);
  };
  const handleRhFactorSelect = (factor: "+" | "-") => {
    setRhFactor(factor);
    if (bloodType) {
      const baseType = bloodType.replace(/[+-]/g, "");
      setBloodType(`${baseType}${factor}` as any);
    }
  };

  const handleDateChange = (event: any, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
      const day = String(selected.getDate()).padStart(2, "0");
      const month = String(selected.getMonth() + 1).padStart(2, "0");
      const year = selected.getFullYear();
      setDateOfBirth(`${day}/${month}/${year}`);
    }
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="mb-6">
        <Text variant="h1" color="foreground">
          Health profile
        </Text>
        <Text variant="body" color="muted" className="mt-2">
          This helps us match you with the right care. All fields are optional.
        </Text>
      </View>

      {/* Gender */}
      <View className="mb-6">
        <SectionLabel>Gender</SectionLabel>
        <View className="flex-row gap-3">
          {GENDERS.map((g) => (
            <Chip
              key={g.value}
              label={g.label}
              selected={gender === g.value}
              onPress={() => setGender(g.value)}
              className="flex-1 justify-center"
            />
          ))}
        </View>
      </View>

      {/* Date of Birth */}
      <View className="mb-6">
        <SectionLabel>Date of birth</SectionLabel>
        <Pressable
          className="flex-row items-center justify-between bg-surface rounded-lg border border-border px-4 h-14"
          onPress={() => setShowDatePicker(true)}
        >
          <Text variant="body" color={dateOfBirth ? "foreground" : "muted"}>
            {dateOfBirth || "DD/MM/YYYY"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.mutedForeground} />
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            onTouchCancel={() => setShowDatePicker(false)}
          />
        )}
      </View>

      {/* Blood Type */}
      <View className="mb-6">
        <SectionLabel>{`Blood type${bloodType ? ` · ${bloodType}` : ""}`}</SectionLabel>
        <View className="flex-row justify-between mb-3">
          {BLOOD_TYPES.map((type) => {
            const active = bloodType?.startsWith(type.value);
            return (
              <Pressable
                key={type.value}
                onPress={() => handleBloodTypeSelect(type.value)}
                className={`w-[23%] aspect-square rounded-lg border items-center justify-center ${
                  active ? "bg-primary border-primary" : "bg-surface border-border"
                }`}
              >
                <Ionicons
                  name="water-outline"
                  size={24}
                  color={active ? colors.onPrimary : colors.primary}
                />
                <Text
                  variant="label"
                  weight="semibold"
                  color={active ? "onPrimary" : "foreground"}
                  className="mt-1"
                >
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View className="flex-row gap-3">
          <Chip
            label="Rh +"
            selected={rhFactor === "+"}
            onPress={() => handleRhFactorSelect("+")}
            className="flex-1 justify-center"
          />
          <Chip
            label="Rh −"
            selected={rhFactor === "-"}
            onPress={() => handleRhFactorSelect("-")}
            className="flex-1 justify-center"
          />
        </View>
      </View>

      {/* Allergies */}
      <View className="mb-6">
        <SectionLabel>Allergies</SectionLabel>
        <View className="flex-row gap-2 mb-3 items-center">
          <Input
            placeholder="Add an allergy"
            value={newAllergy}
            onChangeText={setNewAllergy}
            onSubmitEditing={handleAddAllergy}
            returnKeyType="done"
            containerClassName="flex-1"
          />
          <IconButton
            icon="add"
            onPress={handleAddAllergy}
            variant="soft"
            color={colors.primary}
            accessibilityLabel="Add allergy"
          />
        </View>
        {allergies.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {allergies.map((allergy, index) => (
              <Chip
                key={index}
                label={allergy}
                onRemove={() =>
                  setAllergies(allergies.filter((_, i) => i !== index))
                }
              />
            ))}
          </View>
        )}
      </View>

      {/* Chronic Conditions */}
      <View className="mb-6">
        <SectionLabel>Chronic conditions</SectionLabel>
        <View className="flex-row gap-2 mb-3 items-center">
          <Input
            placeholder="Add a condition"
            value={newIllness}
            onChangeText={setNewIllness}
            onSubmitEditing={handleAddIllness}
            returnKeyType="done"
            containerClassName="flex-1"
          />
          <IconButton
            icon="add"
            onPress={handleAddIllness}
            variant="soft"
            color={colors.primary}
            accessibilityLabel="Add condition"
          />
        </View>
        {chronicIllnesses.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {chronicIllnesses.map((illness, index) => (
              <Chip
                key={index}
                label={illness}
                onRemove={() =>
                  setChronicIllnesses(
                    chronicIllnesses.filter((_, i) => i !== index),
                  )
                }
              />
            ))}
          </View>
        )}
      </View>

      {/* Height and Weight */}
      <View className="flex-row gap-4 mb-6">
        <Input
          label="Height (cm)"
          placeholder="172"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          containerClassName="flex-1"
        />
        <Input
          label="Weight (kg)"
          placeholder="70"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          containerClassName="flex-1"
        />
      </View>

      <Button label="Continue" onPress={onNext} size="lg" className="mb-8" />
    </ScrollView>
  );
}
