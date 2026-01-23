import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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

  // Refresh user data when screen comes into focus (e.g., when returning from map page)
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [refreshUser]),
  );

  // Handle back button/swipe
  // useFocusEffect(
  //   useCallback(() => {
  //     refreshUser();
  //   }, [refreshUser]),
  // );

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
      let formattedDate: string;
      let location: UserLocation;
      let patientInfo = {};

      if (type === "emergency") {
        // For emergency, use current date/time and default values
        const now = new Date();
        formattedDate = now.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
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

      const result = await api.createAppointment(currentUser.token, appointmentData);

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

  return (
    <>
      {/* Header */}
      <View className="pt-5 pb-1">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="w-12 h-12 -ml-3 justify-center items-center"
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#2D3142" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-3xl font-semibold text-[#2D3142]">
              {type === "emergency" ? "Emergency Booking" : "Book your nurse"}
            </Text>
          </View>
        </View>
      </View>

      {!isReadyToRender && (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#4461F2" />
          <Text className="mt-3 text-[#9E9E9E]">Preparing booking?</Text>
        </View>
      )}

      {isReadyToRender && (
        <>
          {type === "emergency" ? (
            /* Emergency Booking UI */
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type of Service Section */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-[#2D3142] mb-4">
                  Type of service
                </Text>
                <View className="bg-white rounded-xl p-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base text-[#2D3142]">Service:</Text>
                    <Text className="text-base text-[#4461F2] font-medium">
                      {service.name}
                    </Text>
                  </View>
                </View>
              </View>

              {/* About the Service Section */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-[#2D3142] mb-4">
                  About the service
                </Text>
                <View className="bg-white rounded-xl p-4">
                  <TextInput
                    className="h-[100px] text-base text-[#2D3142]"
                    placeholder="Describe the emergency"
                    multiline
                    textAlignVertical="top"
                    value={emergencyDescription}
                    onChangeText={setEmergencyDescription}
                  />
                </View>
              </View>

              {/* Patient Information Section */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-[#2D3142]">
                    Patient Informations
                  </Text>
                  <TouchableOpacity>
                    <Ionicons name="pencil" size={20} color="#4461F2" />
                  </TouchableOpacity>
                </View>

                {/* Patient Form */}
                <View className="bg-white rounded-xl p-4 gap-4">
                  {/* Name Input */}
                  <View>
                    <Text className="text-sm text-[#9E9E9E] mb-2">Name:</Text>
                    <Text className="text-base text-[#2D3142]">
                      {patientInfo.name}
                    </Text>
                  </View>

                  {/* Gender and Age Row */}
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="text-sm text-[#9E9E9E] mb-2">
                        Gender:
                      </Text>
                      <View className="bg-[#F5F6FA] py-2 rounded-lg">
                        <Text className="text-base text-[#2D3142] text-center">
                          {patientInfo.gender}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm text-[#9E9E9E] mb-2">Age:</Text>
                      <Text className="text-base text-[#2D3142] bg-[#F5F6FA] p-2 rounded-lg text-center">
                        {patientInfo.age}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Location Section */}
              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-semibold text-[#2D3142]">
                    Select your location
                  </Text>
                  <TouchableOpacity onPress={handleAddLocation}>
                    <Text className="text-sm text-[#4461F2] font-medium">
                      Add a new location
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Location Options */}
                <View className="gap-3">
                  {locationOptions.length > 0 ? (
                    locationOptions.map((location, index) => (
                      <View key={index} className="relative">
                        <TouchableOpacity
                          className={`flex-row items-center p-5 rounded-xl gap-4 ${
                            selectedLocation === index
                              ? "bg-[#4461F2] border-2 border-[#4461F2]"
                              : "bg-white border border-[#E8E8E8]"
                          }`}
                          onPress={() => setSelectedLocation(index)}
                        >
                          <Ionicons
                            name="location-outline"
                            size={24}
                            color={
                              selectedLocation === index ? "#FFFFFF" : "#000000"
                            }
                          />
                          <View className="flex-1">
                            <Text
                              className={`text-base font-semibold mb-1 ${
                                selectedLocation === index
                                  ? "text-white"
                                  : "text-black"
                              }`}
                            >
                              {location.label}
                            </Text>
                            <Text
                              className={`text-sm leading-5 ${
                                selectedLocation === index
                                  ? "text-white/80"
                                  : "text-[#9E9E9E]"
                              }`}
                            >
                              {location.address}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 bg-red-500 rounded-full shadow-sm"
                          onPress={() => handleDeleteLocation(index)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View className="bg-white border border-[#E8E8E8] rounded-xl p-8 items-center">
                      <Ionicons
                        name="location-outline"
                        size={48}
                        color="#9E9E9E"
                      />
                      <Text className="text-base font-semibold text-[#2D3142] mt-4 mb-2">
                        No locations saved
                      </Text>
                      <Text className="text-sm text-[#9E9E9E] text-center mb-4">
                        Add a location to continue with your emergency booking
                      </Text>
                      <TouchableOpacity
                        className="bg-[#4461F2] px-6 py-3 rounded-full"
                        onPress={handleAddLocation}
                      >
                        <Text className="text-sm font-semibold text-white">
                          Add Location
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Emergency Book Button */}
              <TouchableOpacity
                className={`flex-row items-center justify-center py-4 rounded-[28px] gap-3 mb-5 ${
                  locationOptions.length === 0 ? "bg-[#CCCCCC]" : "bg-[#4461F2]"
                }`}
                onPress={handleBookAppointment}
                disabled={locationOptions.length === 0}
              >
                <Text className="text-lg font-semibold text-white">
                  Book Appointment
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            /* Normal Booking UI */
            <>
              {/* Service Card */}
              <View className="bg-white rounded-[20px] p-5 mb-8 shadow-sm">
                <Text className="text-2xl font-bold text-[#2D3142] mb-3">
                  {service.name}
                </Text>
                <Text className="text-base text-[#9E9E9E] leading-6 mb-3">
                  {service.description}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {service.tags?.map((tag, index) => (
                    <View
                      key={index}
                      className="bg-[#F5F6FA] px-3 py-1.5 rounded-full"
                    >
                      <Text className="text-xs text-[#4461F2] font-medium">
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Date Selection */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-semibold text-black">
                    Select Date
                  </Text>

                  {/* Month Navigation */}
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                      onPress={handlePreviousMonth}
                      disabled={
                        currentYear === today.getFullYear() &&
                        currentMonthIndex === today.getMonth()
                      }
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={
                          currentYear === today.getFullYear() &&
                          currentMonthIndex === today.getMonth()
                            ? "#B8B8B8"
                            : "#2D3142"
                        }
                      />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-black">
                      {currentMonth}
                    </Text>
                    <TouchableOpacity onPress={handleNextMonth}>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#2D3142"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date Selector */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                >
                  {dates.map((date, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`w-[70px] h-[70px] rounded-full justify-center items-center ${
                        selectedDate === index
                          ? "bg-[#4461F2]"
                          : !date.available
                            ? "bg-[#F5F5F5]"
                            : "bg-[#E8E8E8]"
                      }`}
                      onPress={() => date.available && setSelectedDate(index)}
                      disabled={!date.available}
                    >
                      <Text
                        className={`text-sm mb-1 ${
                          selectedDate === index
                            ? "text-white"
                            : !date.available
                              ? "text-[#CCCCCC]"
                              : "text-black"
                        }`}
                      >
                        {date.day}
                      </Text>
                      <Text
                        className={`text-xl font-bold ${
                          selectedDate === index
                            ? "text-white"
                            : !date.available
                              ? "text-[#CCCCCC]"
                              : "text-black"
                        }`}
                      >
                        {date.date}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Time Selection */}
              <View className="mb-8">
                <Text className="text-lg font-semibold text-black mb-5">
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
                    <TouchableOpacity
                      key={index}
                      className={`px-6 py-3 rounded-[20px] ${
                        selectedTime === index
                          ? "bg-[#4461F2]"
                          : !slot.available
                            ? "bg-[#F5F5F5]"
                            : "bg-[#E8E8E8]"
                      }`}
                      onPress={() => slot.available && setSelectedTime(index)}
                      disabled={!slot.available}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          selectedTime === index
                            ? "text-white"
                            : !slot.available
                              ? "text-[#CCCCCC]"
                              : "text-black"
                        }`}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Duration Selection */}
              <View className="mb-8">
                <Text className="text-lg font-semibold text-black mb-5">
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
                    <TouchableOpacity
                      key={index}
                      className={`px-6 py-3 rounded-[20px] ${
                        selectedDuration === index
                          ? "bg-[#4461F2]"
                          : "bg-[#E8E8E8]"
                      }`}
                      onPress={() => setSelectedDuration(index)}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          selectedDuration === index
                            ? "text-white"
                            : "text-black"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Location Section */}
              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-semibold text-black">
                    Select your location
                  </Text>
                  <TouchableOpacity onPress={handleAddLocation}>
                    <Text className="text-sm text-[#4461F2] font-medium">
                      Add a new location
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Location Options */}
                <View className="gap-3">
                  {locationOptions.length > 0 ? (
                    locationOptions.map((location, index) => (
                      <View key={index} className="relative">
                        <TouchableOpacity
                          className={`flex-row items-center p-5 rounded-xl gap-4 ${
                            selectedLocation === index
                              ? "bg-[#4461F2] border-2 border-[#4461F2]"
                              : "bg-white border border-[#E8E8E8]"
                          }`}
                          onPress={() => setSelectedLocation(index)}
                        >
                          <Ionicons
                            name="location-outline"
                            size={24}
                            color={
                              selectedLocation === index ? "#FFFFFF" : "#000000"
                            }
                          />
                          <View className="flex-1">
                            <Text
                              className={`text-base font-semibold mb-1 ${
                                selectedLocation === index
                                  ? "text-white"
                                  : "text-black"
                              }`}
                            >
                              {location.label}
                            </Text>
                            <Text
                              className={`text-sm leading-5 ${
                                selectedLocation === index
                                  ? "text-white/80"
                                  : "text-[#9E9E9E]"
                              }`}
                            >
                              {location.address}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 bg-red-500 rounded-full shadow-sm"
                          onPress={() => handleDeleteLocation(index)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View className="bg-white border border-[#E8E8E8] rounded-xl p-8 items-center">
                      <Ionicons
                        name="location-outline"
                        size={48}
                        color="#9E9E9E"
                      />
                      <Text className="text-base font-semibold text-[#2D3142] mt-4 mb-2">
                        No locations saved
                      </Text>
                      <Text className="text-sm text-[#9E9E9E] text-center mb-4">
                        Add a location to continue with your booking
                      </Text>
                      <TouchableOpacity
                        className="bg-[#4461F2] px-6 py-3 rounded-full"
                        onPress={handleAddLocation}
                      >
                        <Text className="text-sm font-semibold text-white">
                          Add Location
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Book Button */}
              <TouchableOpacity
                className={`flex-row items-center justify-center py-4 rounded-[28px] gap-3 mb-5 ${
                  locationOptions.length === 0 ? "bg-[#CCCCCC]" : "bg-[#4461F2]"
                }`}
                onPress={handleBookAppointment}
                disabled={locationOptions.length === 0}
              >
                <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
                <Text className="text-lg font-semibold text-white">
                  Book Appointment
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </>
  );
}
