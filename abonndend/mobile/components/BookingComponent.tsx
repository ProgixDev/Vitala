import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
  Badge,
  Button,
  Card,
  Chip,
  Header,
  IconButton,
  Input,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  tags?: string[];
}

interface BookingComponentProps {
  service: Service;
  onBack: () => void;
  type?: "normal" | "emergency";
}

interface DateOption {
  day: string;
  date: number;
  available: boolean;
  fullDate: Date;
}

const timeSlots = [
  { time: "8:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "2:00 PM", available: false },
  { time: "4:00 PM", available: true },
];

const durationOptions = [
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "1 hour 30 minutes", value: 90 },
  { label: "2 hours", value: 120 },
];

const generateMonthDates = (year: number, month: number): DateOption[] => {
  const dates: DateOption[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isSunday = dayOfWeek === 0;
    const isPast = date < today;

    // Skip days that have already passed
    if (isPast) {
      continue;
    }

    dates.push({
      day: dayNames[dayOfWeek],
      date: date.getDate(),
      available: !isSunday,
      fullDate: date,
    });
  }

  return dates;
};

const getMonthName = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleString("default", { month: "long" });
};

export default function BookingComponent({
  service,
  onBack,
  type = "normal",
}: BookingComponentProps) {
  const { currentUser, loading: userLoading, refreshUser } = useCurrentUser();
  const colors = useThemeColors();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(
    today.getMonth(),
  );

  const [dates, setDates] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");

  // Get user locations or provide default
  const locationOptions =
    currentUser?.locations && currentUser.locations.length > 0
      ? currentUser.locations
      : [];

  useEffect(() => {
    const monthDates = generateMonthDates(currentYear, currentMonthIndex);
    setDates(monthDates);
    setCurrentMonth(getMonthName(currentYear, currentMonthIndex));

    // Find first available date (not Sunday) and select it
    const firstAvailable = monthDates.findIndex((d) => d.available);
    if (firstAvailable !== -1) {
      setSelectedDate(firstAvailable);
    }
  }, [currentYear, currentMonthIndex]);

  const isDatesReady = useMemo(
    () => dates.length > 0 && currentMonth !== "",
    [dates.length, currentMonth],
  );
  const isReadyToRender = useMemo(() => {
    // Emergency flow doesn't depend on dates/time/location selections to render
    if (type === "emergency") return !userLoading;
    // Normal flow: wait for user load and dates generation
    return !userLoading && isDatesReady;
  }, [type, userLoading, isDatesReady]);

  // Handle back button/swipe
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onBack();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [onBack]);

  const handleBookAppointment = async () => {
    if (!currentUser) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "You must be logged in to book an appointment",
      });
      return;
    }

    if (type === "emergency") {
      // Validate emergency description and location
      if (!emergencyDescription.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please describe the emergency",
        });
        return;
      }
      if (locationOptions.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please add a location for the emergency",
        });
        return;
      }
    } else {
      // Validate normal booking fields
      if (selectedDate === -1 || !dates[selectedDate]) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a date",
        });
        return;
      }

      if (selectedTime === -1 || !timeSlots[selectedTime]) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a time",
        });
        return;
      }
    }

    try {
      let location: UserLocation;

      if (type === "emergency") {
        // For emergency, use current date/time and default values
        location = locationOptions[selectedLocation];
      } else {
        // Normal booking with selected values
        location = locationOptions[selectedLocation];
      }

      if (!currentUser?.token) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Not authenticated",
        });
        return;
      }

      // Prepare appointment data for API
      const appointmentData = {
        service: service.name,
        appointmentType: type,
        scheduledDate:
          type === "emergency"
            ? new Date().toISOString()
            : dates[selectedDate].fullDate.toISOString(),
        scheduledTime: {
          start:
            type === "emergency"
              ? new Date().toTimeString().slice(0, 5)
              : timeSlots[selectedTime].time,
        },
        location: {
          address: location.address,
          coordinates: location.coordinates,
          label: location.label,
        },
        symptoms: type === "emergency" ? emergencyDescription : undefined,
        notes:
          type === "emergency"
            ? `Emergency request: ${emergencyDescription}`
            : undefined,
        price: service.price,
        duration: service.duration,
      };

      await api.createAppointment(currentUser.token, appointmentData);

      Toast.show({
        type: "success",
        text1: "Appointment Booked!",
        text2: "Your appointment has been scheduled successfully.",
      });

      // Navigate to schedule tab to see appointments
      router.push("/(tabs)/schedule");
    } catch (error) {
      console.error("Error booking appointment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to book appointment. Please try again.",
      });
    }
  };

  const handleAddLocation = () => {
    console.log("Add new location");
    router.push(`/map?bookingType=${type}`);
    // Handle add location logic
  };

  const handleDeleteLocation = async (index: number) => {
    try {
      if (!currentUser?.token) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Not authenticated",
        });
        return;
      }

      if (!currentUser?.locations || !currentUser.locations[index]) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Location not found",
        });
        return;
      }

      const locationId = (currentUser.locations[index] as any)._id;
      await api.deleteLocation(currentUser.token, locationId);
      await refreshUser();

      // Adjust selectedLocation if necessary
      if (selectedLocation >= locationOptions.length) {
        setSelectedLocation(0);
      }
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Location deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting location:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete location",
      });
    }
  };

  const handlePreviousMonth = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();

    // Don't allow navigation to previous months that have passed
    if (currentYear === todayYear && currentMonthIndex === todayMonth) {
      return;
    }

    if (currentMonthIndex === 0) {
      const newYear = currentYear - 1;
      // Don't go to previous year if it's before current year
      if (newYear < todayYear) {
        return;
      }
      setCurrentYear(newYear);
      setCurrentMonthIndex(11);
    } else {
      const newMonth = currentMonthIndex - 1;
      // Don't go to previous month if it's before current month in current year
      if (currentYear === todayYear && newMonth < todayMonth) {
        return;
      }
      setCurrentMonthIndex(newMonth);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonthIndex(0);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  // Static patient information (normally would come from user account)
  const [patientInfo] = useState({
    name: "Amelia Selma",
    age: "30",
    gender: "Female",
  });

  const [emergencyDescription, setEmergencyDescription] = useState("");

  const isCurrentMonth =
    currentYear === today.getFullYear() &&
    currentMonthIndex === today.getMonth();

  return (
    <>
      {/* Header */}
      <Header
        large
        title={type === "emergency" ? "Emergency Booking" : "Book your nurse"}
        onBack={onBack}
        right={
          type === "emergency" ? (
            <Badge label="Emergency" tone="emergency" icon="alert-circle" />
          ) : undefined
        }
      />

      {!isReadyToRender && (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color="muted" className="mt-3">
            Preparing booking…
          </Text>
        </View>
      )}

      {isReadyToRender && (
        <>
          {type === "emergency" ? (
            /* Emergency Booking UI */
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type of Service Section */}
              <View className="mb-6">
                <Text variant="h3" color="foreground" className="mb-4">
                  Type of service
                </Text>
                <Card>
                  <View className="flex-row justify-between items-center">
                    <Text variant="body" color="foreground">
                      Service
                    </Text>
                    <Text variant="body" color="emergency" weight="semibold">
                      {service.name}
                    </Text>
                  </View>
                </Card>
              </View>

              {/* About the Service Section */}
              <View className="mb-6">
                <Text variant="h3" color="foreground" className="mb-4">
                  About the service
                </Text>
                <Input
                  placeholder="Describe the emergency"
                  multiline
                  textAlignVertical="top"
                  value={emergencyDescription}
                  onChangeText={setEmergencyDescription}
                  style={{ height: 88 }}
                />
              </View>

              {/* Patient Information Section */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text variant="h3" color="foreground">
                    Patient Informations
                  </Text>
                  <IconButton
                    icon="pencil"
                    onPress={() => {}}
                    size={18}
                    color={colors.primary}
                    accessibilityLabel="Edit patient information"
                  />
                </View>

                {/* Patient Form */}
                <Card className="gap-4">
                  {/* Name Input */}
                  <View>
                    <Text variant="caption" color="muted" className="mb-2">
                      Name
                    </Text>
                    <Text variant="bodyLg" color="foreground">
                      {patientInfo.name}
                    </Text>
                  </View>

                  {/* Gender and Age Row */}
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text variant="caption" color="muted" className="mb-2">
                        Gender
                      </Text>
                      <View className="bg-surface-alt py-2 rounded-lg">
                        <Text
                          variant="body"
                          color="foreground"
                          className="text-center"
                        >
                          {patientInfo.gender}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text variant="caption" color="muted" className="mb-2">
                        Age
                      </Text>
                      <View className="bg-surface-alt py-2 rounded-lg">
                        <Text
                          variant="body"
                          color="foreground"
                          className="text-center"
                        >
                          {patientInfo.age}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </View>

              {/* Location Section */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-5">
                  <Text variant="h3" color="foreground">
                    Select your location
                  </Text>
                  <Pressable onPress={handleAddLocation} hitSlop={8}>
                    <Text variant="label" color="primary" weight="semibold">
                      Add a new location
                    </Text>
                  </Pressable>
                </View>

                {/* Location Options */}
                <View className="gap-3">
                  {locationOptions.length > 0 ? (
                    locationOptions.map((location, index) => {
                      const isSelected = selectedLocation === index;
                      return (
                        <View key={index} className="relative">
                          <Pressable
                            className={`flex-row items-center p-5 rounded-xl gap-4 border active:opacity-90 ${
                              isSelected
                                ? "bg-emergency border-emergency"
                                : "bg-surface border-border"
                            }`}
                            onPress={() => setSelectedLocation(index)}
                          >
                            <Ionicons
                              name="location-outline"
                              size={24}
                              color={
                                isSelected
                                  ? colors.onEmergency
                                  : colors.mutedForeground
                              }
                            />
                            <View className="flex-1 pr-10">
                              <Text
                                variant="bodyLg"
                                weight="semibold"
                                color={isSelected ? "onEmergency" : "foreground"}
                                className="mb-1"
                              >
                                {location.label}
                              </Text>
                              <Text
                                variant="body"
                                color={isSelected ? "onEmergency" : "muted"}
                              >
                                {location.address}
                              </Text>
                            </View>
                          </Pressable>
                          <IconButton
                            icon="trash-outline"
                            onPress={() => handleDeleteLocation(index)}
                            size={16}
                            color={colors.onEmergency}
                            className="absolute top-4 right-3 w-9 h-9 bg-emergency"
                            accessibilityLabel="Delete location"
                          />
                        </View>
                      );
                    })
                  ) : (
                    <Card className="items-center py-8">
                      <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-emergency-soft">
                        <Ionicons
                          name="location-outline"
                          size={30}
                          color={colors.emergency}
                        />
                      </View>
                      <Text variant="h3" color="foreground" className="text-center">
                        No locations saved
                      </Text>
                      <Text
                        variant="body"
                        color="muted"
                        className="text-center mt-1.5 mb-4"
                      >
                        Add a location to continue with your emergency booking
                      </Text>
                      <Button
                        label="Add Location"
                        onPress={handleAddLocation}
                        variant="emergency"
                        size="sm"
                        fullWidth={false}
                        className="px-6 rounded-full"
                      />
                    </Card>
                  )}
                </View>
              </View>

              {/* Emergency Book Button */}
              <Button
                label="Book Appointment"
                onPress={handleBookAppointment}
                variant="emergency"
                size="lg"
                disabled={locationOptions.length === 0}
                className="mb-5"
              />
            </ScrollView>
          ) : (
            /* Normal Booking UI */
            <>
              {/* Service Card */}
              <Card className="mb-8">
                <Text variant="h2" color="foreground" className="mb-3">
                  {service.name}
                </Text>
                <Text variant="body" color="muted" className="mb-3">
                  {service.description}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {service.tags?.map((tag, index) => (
                    <Chip key={index} label={tag} />
                  ))}
                </View>
              </Card>

              {/* Date Selection */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-5">
                  <Text variant="h3" color="foreground">
                    Select Date
                  </Text>

                  {/* Month Navigation */}
                  <View className="flex-row items-center gap-2">
                    <IconButton
                      icon="chevron-back"
                      onPress={handlePreviousMonth}
                      size={20}
                      color={
                        isCurrentMonth ? colors.border : colors.foreground
                      }
                      accessibilityLabel="Previous month"
                    />
                    <Text variant="h3" color="foreground">
                      {currentMonth}
                    </Text>
                    <IconButton
                      icon="chevron-forward"
                      onPress={handleNextMonth}
                      size={20}
                      color={colors.foreground}
                      accessibilityLabel="Next month"
                    />
                  </View>
                </View>

                {/* Date Selector */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                >
                  {dates.map((date, index) => {
                    const isSelected = selectedDate === index;
                    return (
                      <Pressable
                        key={index}
                        className={`w-20 h-20 rounded-full justify-center items-center active:opacity-90 ${
                          isSelected
                            ? "bg-primary"
                            : !date.available
                              ? "bg-surface-alt opacity-50"
                              : "bg-surface-alt"
                        }`}
                        onPress={() => date.available && setSelectedDate(index)}
                        disabled={!date.available}
                      >
                        <Text
                          variant="label"
                          className="mb-1"
                          color={isSelected ? "onPrimary" : "muted"}
                        >
                          {date.day}
                        </Text>
                        <Text
                          variant="h3"
                          weight="headingBold"
                          color={isSelected ? "onPrimary" : "foreground"}
                        >
                          {date.date}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Time Selection */}
              <View className="mb-8">
                <Text variant="h3" color="foreground" className="mb-5">
                  Select Time
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: "row",
                    gap: 12,
                    paddingRight: 20,
                  }}
                >
                  {timeSlots.map((slot, index) => (
                    <Chip
                      key={index}
                      label={slot.time}
                      selected={selectedTime === index}
                      onPress={
                        slot.available
                          ? () => setSelectedTime(index)
                          : undefined
                      }
                      className={!slot.available ? "opacity-40" : ""}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Duration Selection */}
              <View className="mb-8">
                <Text variant="h3" color="foreground" className="mb-5">
                  Estimated Time
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: "row",
                    gap: 12,
                    paddingRight: 20,
                  }}
                >
                  {durationOptions.map((option, index) => (
                    <Chip
                      key={index}
                      label={option.label}
                      selected={selectedDuration === index}
                      onPress={() => setSelectedDuration(index)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Location Section */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-5">
                  <Text variant="h3" color="foreground">
                    Select your location
                  </Text>
                  <Pressable onPress={handleAddLocation} hitSlop={8}>
                    <Text variant="label" color="primary" weight="semibold">
                      Add a new location
                    </Text>
                  </Pressable>
                </View>

                {/* Location Options */}
                <View className="gap-3">
                  {locationOptions.length > 0 ? (
                    locationOptions.map((location, index) => {
                      const isSelected = selectedLocation === index;
                      return (
                        <View key={index} className="relative">
                          <Pressable
                            className={`flex-row items-center p-5 rounded-xl gap-4 border active:opacity-90 ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "bg-surface border-border"
                            }`}
                            onPress={() => setSelectedLocation(index)}
                          >
                            <Ionicons
                              name="location-outline"
                              size={24}
                              color={
                                isSelected
                                  ? colors.onPrimary
                                  : colors.mutedForeground
                              }
                            />
                            <View className="flex-1 pr-10">
                              <Text
                                variant="bodyLg"
                                weight="semibold"
                                color={isSelected ? "onPrimary" : "foreground"}
                                className="mb-1"
                              >
                                {location.label}
                              </Text>
                              <Text
                                variant="body"
                                color={isSelected ? "onPrimary" : "muted"}
                              >
                                {location.address}
                              </Text>
                            </View>
                          </Pressable>
                          <IconButton
                            icon="trash-outline"
                            onPress={() => handleDeleteLocation(index)}
                            size={16}
                            color={colors.onEmergency}
                            className="absolute top-4 right-3 w-9 h-9 bg-emergency"
                            accessibilityLabel="Delete location"
                          />
                        </View>
                      );
                    })
                  ) : (
                    <Card className="items-center py-8">
                      <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary-soft">
                        <Ionicons
                          name="location-outline"
                          size={30}
                          color={colors.primary}
                        />
                      </View>
                      <Text variant="h3" color="foreground" className="text-center">
                        No locations saved
                      </Text>
                      <Text
                        variant="body"
                        color="muted"
                        className="text-center mt-1.5 mb-4"
                      >
                        Add a location to continue with your booking
                      </Text>
                      <Button
                        label="Add Location"
                        onPress={handleAddLocation}
                        size="sm"
                        fullWidth={false}
                        className="px-6 rounded-full"
                      />
                    </Card>
                  )}
                </View>
              </View>

              {/* Book Button */}
              <Button
                label="Book Appointment"
                onPress={handleBookAppointment}
                leftIcon="calendar-outline"
                size="lg"
                disabled={locationOptions.length === 0}
                className="mb-5"
              />
            </>
          )}
        </>
      )}
    </>
  );
}
