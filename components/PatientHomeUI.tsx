import { FontAwesome6, Ionicons } from "@expo/vector-icons";
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
    tags: ["physiotherapy", "recovery", "mobility", "rehabilitation"],
  },
  {
    id: 2,
    name: "Perfusion",
    icon: <Ionicons name="water" size={28} color="#4461F2" />,
    description:
      "Professional IV therapy services delivered in the comfort of your home with trained nursing staff.",
    tags: ["IV therapy", "infusion", "hydration", "medical"],
  },
  {
    id: 3,
    name: "Vaccination",
    icon: <Ionicons name="medical" size={28} color="#4461F2" />,
    description:
      "Get vaccinated at home with our certified nurses ensuring safe and convenient immunization.",
    tags: ["vaccine", "immunization", "prevention", "shot"],
  },
  {
    id: 4,
    name: "Analyses",
    icon: <Ionicons name="flask" size={28} color="#4461F2" />,
    description:
      "Home blood sample collection and laboratory test services with quick and accurate results.",
    tags: ["blood test", "lab", "diagnostic", "sample collection"],
  },
  {
    id: 5,
    name: "Consultation",
    icon: <Ionicons name="bandage" size={28} color="#4461F2" />,
    description:
      "Expert medical consultation at your doorstep with experienced healthcare professionals.",
    tags: ["doctor", "medical advice", "checkup", "examination"],
  },
  {
    id: 6,
    name: "Maternity",
    icon: <FontAwesome6 name="person-pregnant" size={28} color="#4461F2" />,
    description:
      "Comprehensive maternity care and support for new mothers in the comfort of home.",
    tags: ["pregnancy", "prenatal", "postnatal", "newborn"],
  },
  {
    id: 7,
    name: "Pediatric",
    icon: <FontAwesome6 name="baby-carriage" size={28} color="#4461F2" />,
    description:
      "Specialized pediatric care for children with gentle and experienced nursing staff.",
    tags: ["children", "kids", "infant", "baby care"],
  },
  {
    id: 8,
    name: "Medication",
    icon: <Ionicons name="hand-right" size={28} color="#4461F2" />,
    description:
      "Professional medication administration and management services at home.",
    tags: ["medicine", "pills", "drug administration", "prescription"],
  },
  {
    id: 9,
    name: "Wound Care",
    icon: <Ionicons name="medkit" size={28} color="#4461F2" />,
    description:
      "Professional wound dressing and care services to promote healing and prevent infection.",
    tags: ["dressing", "bandage", "injury", "healing"],
  },
  {
    id: 10,
    name: "Elderly Care",
    icon: <FontAwesome6 name="person-cane" size={28} color="#4461F2" />,
    description:
      "Compassionate elderly care services with assistance for daily activities and health monitoring.",
    tags: ["senior", "geriatric", "aged care", "assistance"],
  },
  {
    id: 11,
    name: "Dialysis",
    icon: <Ionicons name="heart-circle" size={28} color="#4461F2" />,
    description:
      "Home dialysis services with trained professionals ensuring safe and comfortable treatment.",
    tags: ["kidney", "renal", "filtration", "chronic care"],
  },
  {
    id: 12,
    name: "Respiratory",
    icon: <Ionicons name="fitness" size={28} color="#4461F2" />,
    description:
      "Respiratory therapy and oxygen administration services for breathing support at home.",
    tags: ["breathing", "oxygen", "lung", "respiratory therapy"],
  },
  {
    id: 13,
    name: "Post-Op Care",
    icon: <Ionicons name="bed" size={28} color="#4461F2" />,
    description:
      "Post-operative care and recovery support to ensure smooth healing after surgery.",
    tags: ["surgery", "recovery", "post-surgical", "healing"],
  },
  {
    id: 14,
    name: "Injection",
    icon: <Ionicons name="pulse" size={28} color="#4461F2" />,
    description:
      "Professional injection administration services including insulin and other medications.",
    tags: ["insulin", "shot", "intramuscular", "subcutaneous"],
  },
  {
    id: 15,
    name: "Palliative",
    icon: <Ionicons name="leaf" size={28} color="#4461F2" />,
    description:
      "Palliative care services focused on comfort and quality of life for serious illness.",
    tags: ["comfort care", "end of life", "pain management", "hospice"],
  },
  {
    id: 16,
    name: "Nutrition",
    icon: <Ionicons name="nutrition" size={28} color="#4461F2" />,
    description:
      "Nutritional support and tube feeding management with certified healthcare professionals.",
    tags: ["diet", "feeding", "tube feeding", "nutritional support"],
  },
];

export default function PatientHomeUI() {
  const [selectedService, setSelectedService] = useState<
    (typeof services)[0] | null
  >(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleServicePress = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const handleBackToHome = () => {
    setSelectedService(null);
  };

  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {selectedService ? (
        <BookingComponent
          service={selectedService}
          onBack={handleBackToHome}
        />
      ) : (
        <>
          {/* Header */}
          <View className="py-5">
            <View>
              <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
                Find a nurse
              </Text>
              <Text className="text-sm text-[#9E9E9E]">Welcome Back</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-[30px]">
            <View className="flex-row items-center bg-white rounded-[25px] px-4 h-[60px] gap-2.5">
              <Ionicons name="search" size={20} color="#9E9E9E" />
              <TextInput
                className="flex-1 text-base text-[#2D3142]"
                placeholder="Search"
                placeholderTextColor="#9E9E9E"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9E9E9E" />
                </TouchableOpacity>
              )}
              <TouchableOpacity className="w-9 h-9 bg-[#4461F2] rounded-[18px] justify-center items-center">
                <Ionicons name="options" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Services Section */}
          {searchQuery.length === 0 ? (
            <View className="mb-[30px]">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-semibold text-[#2D3142]">
                  Choose a service
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAllServices(!showAllServices)}
                >
                  <Text className="text-sm text-[#4461F2] font-medium">
                    {showAllServices ? "See Less" : "See All"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap gap-2 justify-center">
                {(showAllServices ? services : services.slice(0, 8)).map(
                  (service) => (
                    <TouchableOpacity
                      key={service.id}
                      className="w-[22%] items-center mb-4"
                      onPress={() => handleServicePress(service.id)}
                    >
                      <View className="w-full aspect-square bg-white rounded-full justify-center items-center mb-2 shadow-sm">
                        {service.icon}
                      </View>
                      <Text className="text-[10px] text-[#2D3142] text-center font-medium">
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>
          ) : (
            <View className="mb-[30px]">
              <Text className="text-xl font-semibold text-[#2D3142] mb-5">
                Search Results ({filteredServices.length})
              </Text>
              {filteredServices.length > 0 ? (
                <View className="gap-3">
                  {filteredServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      className="bg-white rounded-[20px] p-4 shadow-sm"
                      onPress={() => handleServicePress(service.id)}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="w-14 h-14 bg-[#F5F6FA] rounded-full justify-center items-center">
                          {service.icon}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-[#2D3142] mb-1">
                            {service.name}
                          </Text>
                          <Text className="text-sm text-[#9E9E9E] leading-5 mb-2">
                            {service.description}
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {service.tags.map((tag, index) => (
                              <View
                                key={index}
                                className="bg-[#F5F6FA] px-3 py-1 rounded-full"
                              >
                                <Text className="text-xs text-[#4461F2]">
                                  {tag}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="bg-white rounded-[20px] p-8 items-center">
                  <Ionicons name="search" size={48} color="#9E9E9E" />
                  <Text className="text-base text-[#2D3142] font-semibold mt-4 mb-2">
                    No services found
                  </Text>
                  <Text className="text-sm text-[#9E9E9E] text-center">
                    Try adjusting your search terms
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Consultation Banner */}
          {searchQuery.length === 0 && (
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
                source={require("@/assets/images/doctor.png")}
                className="w-36 h-[180px] absolute right-0 bottom-0"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}

          {/* Emergency Banner */}
          {searchQuery.length === 0 && (
            <TouchableOpacity className="flex-row bg-[#FF4B8C] rounded-[20px] p-5 pr-0 pb-0 overflow-hidden mb-5">
              <View className="flex-1">
                <Text className="text-xs text-white mb-3 opacity-90">
                  Need Urgent Help?
                </Text>
                <Text className="text-2xl font-bold text-white leading-[30px]">
                  We&apos;re Here for You 24/7
                </Text>
              </View>
              <Image
                source={require("@/assets/images/nurse.png")}
                className="h-[165px] relative -right-2.5 bottom-0"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}
