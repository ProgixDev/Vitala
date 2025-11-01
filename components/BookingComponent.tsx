import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#2D3142" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Book your nurse</Text>
          <Text style={styles.headerSubtitle}>Welcome Back</Text>
        </View>
        <Image
          source={require("../assets/images/Logo.png")}
          style={styles.logoContainer}
          resizeMode="contain"
        />
      </View>

      {/* Service Title */}
      <Text style={styles.serviceTitle}>{service.name}</Text>

      {/* Service Description */}
      <Text style={styles.serviceDescription}>{service.description}</Text>

      {/* Date Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Date</Text>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
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
            <Text style={styles.monthText}>{currentMonth}</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={20} color="#2D3142" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        >
          {dates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                selectedDate === index && styles.dateCardActive,
                !date.available && styles.dateCardDisabled,
              ]}
              onPress={() => date.available && setSelectedDate(index)}
              disabled={!date.available}
            >
              <Text
                style={[
                  styles.dateDay,
                  selectedDate === index && styles.dateDayActive,
                  !date.available && styles.dateTextDisabled,
                ]}
              >
                {date.day}
              </Text>
              <Text
                style={[
                  styles.dateNumber,
                  selectedDate === index && styles.dateNumberActive,
                  !date.available && styles.dateTextDisabled,
                ]}
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
        style={styles.timeScroll}
        contentContainerStyle={styles.timeContainer}
      >
        {timeSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeSlot,
              selectedTime === index && styles.timeSlotActive,
              !slot.available && styles.timeSlotDisabled,
            ]}
            onPress={() => slot.available && setSelectedTime(index)}
            disabled={!slot.available}
          >
            <Text
              style={[
                styles.timeText,
                selectedTime === index && styles.timeTextActive,
                !slot.available && styles.timeTextDisabled,
              ]}
            >
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location Section */}
      <View style={styles.section}>
        <View style={styles.locationHeader}>
          <Text style={styles.sectionTitle}>Add your location</Text>
          <TouchableOpacity onPress={handleAddLocation}>
            <Text style={styles.addLocationText}>Add a new location</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Location */}
        <View style={styles.locationCard}>
          <Ionicons name="location-outline" size={20} color="#000000" />
          <Text style={styles.locationText}>
            931 2nd Street, Rivers, Manitoba, R0K 1X0.
          </Text>
        </View>
      </View>

      {/* Book Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBookAppointment}
      >
        <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666666",
  },
  logoContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  dateScroll: {
    paddingLeft: 20,
  },
  dateScrollContent: {
    gap: 8,
    paddingRight: 20,
  },
  dateCard: {
    width: 60,
    height: 60,
    backgroundColor: "#E8E8E8",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCardActive: {
    backgroundColor: "#4461F2",
  },
  dateCardDisabled: {
    backgroundColor: "#F5F5F5",
  },
  dateDay: {
    fontSize: 12,
    color: "#000000",
    marginBottom: 2,
  },
  dateDayActive: {
    color: "#FFFFFF",
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  dateNumberActive: {
    color: "#FFFFFF",
  },
  dateTextDisabled: {
    color: "#CCCCCC",
  },
  timeScroll: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 20,
  },
  timeSlot: {
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timeSlotActive: {
    backgroundColor: "#4461F2",
  },
  timeSlotDisabled: {
    backgroundColor: "#F5F5F5",
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  timeTextActive: {
    color: "#FFFFFF",
  },
  timeTextDisabled: {
    color: "#CCCCCC",
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  addLocationText: {
    fontSize: 13,
    color: "#4461F2",
    fontWeight: "500",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
    lineHeight: 18,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4461F2",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
