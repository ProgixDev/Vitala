import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BookingComponent from "@/components/BookingComponent";

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

  return (
    <View className="flex-1 pt-6 px-4">
      <StatusBar hidden />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {selectedService ? (
          <BookingComponent
            service={selectedService}
            onBack={handleBackToHome}
          />
        ) : (
          <>
            {/* Header */}
            <View className="flex-row justify-between items-center pb-5">
              <View className="flex-row items-center gap-3">
                <View>
                  <Text className="text-xl font-semibold text-[#2D3142]">
                    Find a nurse
                  </Text>
                  <Text className="text-sm text-[#9E9E9E] mt-0.5">
                    Welcome Back
                  </Text>
                </View>
              </View>
              <Image
                source={require("@/assets/images/Logo.png")}
                className="w-[50px] h-[50px]"
                resizeMode="contain"
              />
            </View>

            {/* Search Bar */}
            <View className="mb-[30px]">
              <View className="flex-row items-center bg-white rounded-[25px] px-4 h-[60px] gap-2.5">
                <Ionicons name="search" size={20} color="#9E9E9E" />
                <TextInput
                  className="flex-1 text-base text-[#2D3142]"
                  placeholder="Search"
                  placeholderTextColor="#9E9E9E"
                />
                <TouchableOpacity className="w-9 h-9 bg-[#4461F2] rounded-[18px] justify-center items-center">
                  <Ionicons name="options" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Services Section */}
            <View className="mb-[30px]">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-semibold text-[#2D3142]">
                  Choose a service
                </Text>
                <TouchableOpacity>
                  <Text className="text-sm text-[#4461F2] font-medium">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap justify-between">
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    className="w-[23%] items-center mb-4"
                    onPress={() => handleServicePress(service.id)}
                  >
                    <View className="w-full aspect-square bg-white rounded-full justify-center items-center mb-2 shadow-sm">
                      {service.icon}
                    </View>
                    <Text className="text-[10px] text-[#2D3142] text-center font-medium">
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Consultation Banner */}
            <TouchableOpacity className="flex-row bg-[#4461F2] rounded-[20px] mb-5 p-5 overflow-hidden">
              <View className="flex-1">
                <Text className="text-xs text-white mb-3 opacity-90">
                  Trusted Nurses on your schedule 😊
                </Text>
                <Text className="text-2xl font-bold text-white leading-[30px]">
                  Consult A Nurse
                </Text>
                <Text className="text-2xl font-bold text-white leading-[30px]">
                  — Book Today!
                </Text>
                <View className="flex-row items-center mt-4 gap-3">
                  <View className="flex-row -ml-2">
                    <View className="w-8 h-8 rounded-full border-2 border-[#4461F2] bg-[#FFB800] -ml-2" />
                    <View className="w-8 h-8 rounded-full border-2 border-[#4461F2] bg-[#FF6B6B] -ml-2" />
                    <View className="w-8 h-8 rounded-full border-2 border-[#4461F2] bg-[#4ECDC4] -ml-2" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-white">
                      30,000+
                    </Text>
                    <Text className="text-xs text-white opacity-80">
                      Happy Patients
                    </Text>
                  </View>
                </View>
              </View>
              <Image
                source={require("../../assets/images/doctor.png")}
                className="w-36 h-[180px] absolute right-0 bottom-0"
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Emergency Banner */}
            <TouchableOpacity className="flex-row bg-[#FF4B8C] rounded-[20px] p-5 pr-0 pb-0 overflow-hidden">
              <View className="flex-1">
                <Text className="text-xs text-white mb-3 opacity-90">
                  Need Urgent Help?
                </Text>
                <Text className="text-2xl font-bold text-white leading-[30px]">
                  We&apos;re Here for You 24/7
                </Text>
              </View>
              <Image
                source={require("../../assets/images/nurse.png")}
                className="h-[165px] relative -right-2.5 bottom-0"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
