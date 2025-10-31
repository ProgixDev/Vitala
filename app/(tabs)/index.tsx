import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import BookingComponent from "../../components/BookingComponent";
import { useDrawer } from "../../src/navigation/drawer/DrawerProvider";

const services = [
  {
    id: 1,
    name: "Rééducation",
    icon: <Ionicons name="accessibility" size={28} color="#4461F2" />,
    description:
      "Recover safely at home with personalized physiotherapy sessions designed to restore your strength and mobility.",
  },
  {
    id: 2,
    name: "Perfusion",
    icon: <Ionicons name="water" size={28} color="#4461F2" />,
    description:
      "Professional IV therapy services delivered in the comfort of your home with trained nursing staff.",
  },
  {
    id: 3,
    name: "Vaccination",
    icon: <Ionicons name="medical" size={28} color="#4461F2" />,
    description:
      "Get vaccinated at home with our certified nurses ensuring safe and convenient immunization.",
  },
  {
    id: 4,
    name: "Analyses",
    icon: <Ionicons name="flask" size={28} color="#4461F2" />,
    description:
      "Home blood sample collection and laboratory test services with quick and accurate results.",
  },
  {
    id: 5,
    name: "Consultation",
    icon: <Ionicons name="bandage" size={28} color="#4461F2" />,
    description:
      "Expert medical consultation at your doorstep with experienced healthcare professionals.",
  },
  {
    id: 6,
    name: "Maternity",
    icon: <FontAwesome6 name="person-pregnant" size={28} color="#4461F2" />,
    description:
      "Comprehensive maternity care and support for new mothers in the comfort of home.",
  },
  {
    id: 7,
    name: "Pediatric",
    icon: <FontAwesome6 name="baby-carriage" size={28} color="#4461F2" />,
    description:
      "Specialized pediatric care for children with gentle and experienced nursing staff.",
  },
  {
    id: 8,
    name: "Medication",
    icon: <Ionicons name="hand-right" size={28} color="#4461F2" />,
    description:
      "Professional medication administration and management services at home.",
  },
];

export default function Home() {
  const [selectedService, setSelectedService] = useState<
    (typeof services)[0] | null
  >(null);

  const handleServicePress = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const handleBackToHome = () => {
    setSelectedService(null);
  };

  const { toggleDrawer } = useDrawer();
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedService ? (
          <BookingComponent
            service={selectedService}
            onBack={handleBackToHome}
          />
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity style={styles.menuButton}>
                  <Ionicons name="menu" size={24} color="#2D3142" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.headerTitle}>Find a nurse</Text>
                  <Text style={styles.headerSubtitle}>Welcome Back</Text>
                </View>
              </View>
              <Image
                source={require("../../assets/images/Logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9E9E9E" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="#9E9E9E"
                />
                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons name="options" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Services Section */}
            <View style={styles.servicesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Choose a service</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.servicesGrid}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.serviceCard}
                    onPress={() => handleServicePress(service.id)}
                  >
                    <View style={styles.serviceIconContainer}>
                      {service.icon}
                    </View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Consultation Banner */}
            <TouchableOpacity style={styles.consultationBanner}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerBadge}>
                  Trusted Nurses on your schedule 😊
                </Text>
                <Text style={styles.bannerTitle}>Consult A Nurse</Text>
                <Text style={styles.bannerTitle}>— Book Today!</Text>
                <View style={styles.patientsInfo}>
                  <View style={styles.avatarsContainer}>
                    <View style={[styles.avatar, styles.avatar1]} />
                    <View style={[styles.avatar, styles.avatar2]} />
                    <View style={[styles.avatar, styles.avatar3]} />
                  </View>
                  <View>
                    <Text style={styles.patientsCount}>30,000+</Text>
                    <Text style={styles.patientsLabel}>Happy Patients</Text>
                  </View>
                </View>
              </View>
              <Image
                source={require("../../assets/images/doctor.png")}
                style={styles.doctorImage}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Emergency Banner */}
            <TouchableOpacity style={styles.emergencyBanner}>
              <View style={styles.emergencyContent}>
                <Text style={styles.bannerBadge}>Need Urgent Help?</Text>
                <Text style={styles.bannerTitle}>
                  We&apos;re Here for You 24/7
                </Text>
              </View>
              <Image
                source={require("../../assets/images/nurse.png")}
                style={styles.nurseImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3142",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 2,
  },
  logo: {
    width: 50,
    height: 50,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 60,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3142",
  },
  filterButton: {
    width: 36,
    height: 36,
    backgroundColor: "#4461F2",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  servicesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3142",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4461F2",
    fontWeight: "500",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "23%",
    alignItems: "center",
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceName: {
    fontSize: 10,
    color: "#2D3142",
    textAlign: "center",
    fontWeight: "500",
  },
  consultationBanner: {
    flexDirection: "row",
    backgroundColor: "#4461F2",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    overflow: "hidden",
  },
  bannerContent: {
    flex: 1,
  },
  bannerBadge: {
    fontSize: 12,
    color: "#FFFFFF",
    marginBottom: 12,
    opacity: 0.9,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 30,
  },
  patientsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  avatarsContainer: {
    flexDirection: "row",
    marginLeft: -8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#4461F2",
    marginLeft: -8,
  },
  avatar1: {
    backgroundColor: "#FFB800",
  },
  avatar2: {
    backgroundColor: "#FF6B6B",
  },
  avatar3: {
    backgroundColor: "#4ECDC4",
  },
  patientsCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  patientsLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  doctorImage: {
    width: 144,
    height: 180,
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  emergencyBanner: {
    flexDirection: "row",
    backgroundColor: "#FF4B8C",
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    paddingRight: 0,
    paddingBottom: 0,
    overflow: "hidden",
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  nurseImage: {
    height: 165,
    position: "relative",
    right: -10,
    bottom: 0,
  },
});
