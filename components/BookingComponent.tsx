import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authStorage } from "../utils/auth";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface Service {
  id: number;
  name: string;
  description: string;
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
  const { currentUser } = useCurrentUser();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(
    today.getMonth(),
  );

  const [dates, setDates] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");

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
      Alert.alert("Error", "You must be logged in to book an appointment");
      return;
    }

    if (selectedDate === -1 || !dates[selectedDate]) {
      Alert.alert("Error", "Please select a date");
      return;
    }

    if (selectedTime === -1 || !timeSlots[selectedTime]) {
      Alert.alert("Error", "Please select a time");
      return;
    }

    try {
      const selectedDateObj = dates[selectedDate];
      const formattedDate = selectedDateObj.fullDate.toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      await authStorage.getAppointments();

      await authStorage.saveAppointment({
        userEmail: currentUser.email,
        serviceName: service.name,
        date: formattedDate,
        time: timeSlots[selectedTime].time,
        type: type,
        location: "931 2nd Street, Rivers, Manitoba, R0K 1X0.",
      });

      // Get the newly created appointment ID (it's the last one added)
      const updatedAppointments = await authStorage.getAppointments();
      const newAppointment =
        updatedAppointments[updatedAppointments.length - 1];

      // Navigate to appointment details page
      router.push(`/appointment/${newAppointment.id}`);
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    }
  };

  const handleAddLocation = () => {
    console.log("Add new location");
    // Handle add location logic
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

  return (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity
          className="w-12 h-12 justify-center items-center"
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3142" />
        </TouchableOpacity>
        <View className="flex-1 ml-4">
          <Text className="text-xl font-bold text-black mb-1">
            Book your nurse
          </Text>
          <Text className="text-sm text-[#666666]">Welcome Back</Text>
        </View>
        <Image
          source={require("../assets/images/Logo.png")}
          className="w-12 h-12"
          resizeMode="contain"
        />
      </View>

      {/* Service Title */}
      <Text className="text-2xl font-bold text-black mb-3">{service.name}</Text>

      {/* Service Description */}
      <Text className="text-base text-[#666666] leading-6 mb-8">
        {service.description}
      </Text>

      {/* Date Selection */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg font-semibold text-black">Select Date</Text>

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
              <Ionicons name="chevron-forward" size={20} color="#2D3142" />
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-8"
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

      {/* Location Section */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg font-semibold text-black">
            Add your location
          </Text>
          <TouchableOpacity onPress={handleAddLocation}>
            <Text className="text-sm text-[#4461F2] font-medium">
              Add a new location
            </Text>
          </TouchableOpacity>
        </View>

        {/* Saved Location */}
        <View className="flex-row items-center bg-white p-5 rounded-xl gap-4 border border-[#E8E8E8]">
          <Ionicons name="location-outline" size={24} color="#000000" />
          <Text className="flex-1 text-sm font-semibold text-black leading-5">
            931 2nd Street, Rivers, Manitoba, R0K 1X0.
          </Text>
        </View>
      </View>

      {/* Book Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-[#4461F2] py-4 rounded-[28px] gap-3"
        onPress={handleBookAppointment}
      >
        <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
        <Text className="text-lg font-semibold text-white">
          Book Appointment
        </Text>
      </TouchableOpacity>
    </>
  );
}
