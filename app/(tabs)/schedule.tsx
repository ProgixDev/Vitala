import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IllustrationSvg from "../../assets/images/Group 92.svg";

export default function Schedule() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Appointments</Text>
            <Text style={styles.headerSubtitle}>
              Organize all your schedules
            </Text>
          </View>
        </View>

        {/* Upcoming Appointments Card */}
        <TouchableOpacity style={styles.upcomingCard}>
          <View style={styles.upcomingHeader}>
            <Text style={styles.upcomingTitle}>Upcoming Appointments</Text>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </View>

          <View style={styles.appointmentDetails}>
            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Appointments Date</Text>
                <Text style={styles.detailValue}>Sun, 10 Jan 2025</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Appointment Time</Text>
                <Text style={styles.detailValue}>08:00 - 12:00</Text>
              </View>
            </View>
          </View>

          {/* Service Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceIconWrapper}>
              <Ionicons name="accessibility" size={24} color="#4461F2" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Rehabilitation Care</Text>
              <Text style={styles.serviceDescription}>
                personalized physiotherapy sessions.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Stay Organized Card */}
        <View style={styles.organizedCard}>
          <Text style={styles.organizedBadge}>
            Trusted Nurses on your schedule 😊
          </Text>
          <Text style={styles.organizedTitle}>Stay Organized,</Text>
          <Text style={styles.organizedTitle}>Stay Ahead</Text>

          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            <Text style={styles.calendarButtonText}>Open Calendar</Text>
          </TouchableOpacity>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <IllustrationSvg width={200} height={200} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3142",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  upcomingCard: {
    backgroundColor: "#4461F2",
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  upcomingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  appointmentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceIconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: "#E8EBFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3142",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: "#9E9E9E",
    lineHeight: 16,
  },
  organizedCard: {
    backgroundColor: "#4461F2",
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    paddingBottom: 140,
    position: "relative",
    overflow: "hidden",
  },
  organizedBadge: {
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 12,
    opacity: 0.9,
  },
  organizedTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 32,
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 20,
    gap: 8,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  illustrationContainer: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 200,
    height: 200,
  },
});
