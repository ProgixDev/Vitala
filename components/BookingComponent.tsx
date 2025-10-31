import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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

const generateWeekDates = (startDate: Date): DateOption[] => {
  const dates: DateOption[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayOfWeek = date.getDay();
    const isSunday = dayOfWeek === 0;

    dates.push({
      day: dayNames[dayOfWeek],
      date: date.getDate(),
      available: !isSunday,
      fullDate: date,
    });
  }

  return dates;
};

const getMonthName = (date: Date): string => {
  return date.toLocaleString("default", { month: "long" });
};

export default function BookingComponent({
  service,
  onBack,
  type = "normal",
}: BookingComponentProps) {
  const { currentUser } = useCurrentUser();
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek;
  });

  const [dates, setDates] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState(0);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const weekDates = generateWeekDates(weekStartDate);
    setDates(weekDates);
    setCurrentMonth(getMonthName(weekStartDate));

    // Find first available date (not Sunday) and select it
    const firstAvailable = weekDates.findIndex((d) => d.available);
    if (firstAvailable !== -1) {
      setSelectedDate(firstAvailable);
    }
  }, [weekStartDate]);

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

      const appointments = await authStorage.getAppointments();

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

  const handlePreviousWeek = () => {
    setWeekStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setWeekStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  return (
    <>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#2D3142" />
      </TouchableOpacity>

      {/* Service Title */}
      <Text style={styles.serviceTitle}>{service.name}</Text>

      {/* Service Description */}
      <Text style={styles.serviceDescription}>{service.description}</Text>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>

        {/* Week Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={handlePreviousWeek}>
            <Ionicons name="chevron-back" size={24} color="#2D3142" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth}</Text>
          <TouchableOpacity onPress={handleNextWeek}>
            <Ionicons name="chevron-forward" size={24} color="#2D3142" />
          </TouchableOpacity>
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
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={24} color="#4461F2" />
          </View>
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
        <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
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
  backButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 20,
    marginLeft: 20,
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3142",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  serviceDescription: {
    fontSize: 15,
    color: "#757575",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3142",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3142",
  },
  dateScroll: {
    paddingLeft: 20,
  },
  dateScrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  dateCard: {
    width: 70,
    height: 85,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  dateCardActive: {
    backgroundColor: "#4461F2",
  },
  dateCardDisabled: {
    backgroundColor: "#E8E8E8",
  },
  dateDay: {
    fontSize: 14,
    color: "#2D3142",
    marginBottom: 4,
  },
  dateDayActive: {
    color: "#FFFFFF",
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3142",
  },
  dateNumberActive: {
    color: "#FFFFFF",
  },
  dateTextDisabled: {
    color: "#B8B8B8",
  },
  timeScroll: {
    paddingLeft: 20,
    marginBottom: 30,
  },
  timeContainer: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  timeSlot: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeSlotActive: {
    backgroundColor: "#4461F2",
  },
  timeSlotDisabled: {
    backgroundColor: "#E8E8E8",
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3142",
  },
  timeTextActive: {
    color: "#FFFFFF",
  },
  timeTextDisabled: {
    color: "#B8B8B8",
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addLocationText: {
    fontSize: 14,
    color: "#4461F2",
    fontWeight: "500",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#F0F2FF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3142",
    lineHeight: 20,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4461F2",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 12,
    shadowColor: "#4461F2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
