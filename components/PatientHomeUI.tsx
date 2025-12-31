import BookingComponent from "@/components/BookingComponent";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  tags?: string[];
}

const servicesData: Service[] = [
  {
    _id: "1",
    name: "Rééducation",
    description:
      "Recover safely at home with personalized physiotherapy sessions designed to restore your strength and mobility.",
    category: "reeducation",
    price: 60,
    duration: 60,
    tags: ["physiotherapy", "recovery", "mobility", "rehabilitation"],
  },
  {
    _id: "2",
    name: "Perfusion",
    description:
      "Professional IV therapy services delivered in the comfort of your home with trained nursing staff.",
    category: "perfusion",
    price: 80,
    duration: 60,
    tags: ["IV therapy", "infusion", "hydration", "medical"],
  },
  {
    _id: "3",
    name: "Vaccination",
    description:
      "Get vaccinated at home with our certified nurses ensuring safe and convenient immunization.",
    category: "vaccination",
    price: 40,
    duration: 30,
    tags: ["vaccine", "immunization", "prevention", "shot"],
  },
  {
    _id: "4",
    name: "Analyses",
    description:
      "Home blood sample collection and laboratory test services with quick and accurate results.",
    category: "analyses",
    price: 50,
    duration: 30,
    tags: ["blood test", "lab", "diagnostic", "sample collection"],
  },
  {
    _id: "5",
    name: "Consultation",
    description:
      "Expert medical consultation at your doorstep with experienced healthcare professionals.",
    category: "consultation",
    price: 70,
    duration: 45,
    tags: ["doctor", "medical advice", "checkup", "examination"],
  },
  {
    _id: "6",
    name: "Maternity",
    description:
      "Comprehensive maternity care and support for new mothers in the comfort of home.",
    category: "maternity",
    price: 90,
    duration: 60,
    tags: ["pregnancy", "prenatal", "postnatal", "newborn"],
  },
  {
    _id: "7",
    name: "Pediatric",
    description:
      "Specialized pediatric care for children with gentle and experienced nursing staff.",
    category: "pediatric",
    price: 55,
    duration: 45,
    tags: ["children", "kids", "infant", "baby care"],
  },
  {
    _id: "8",
    name: "Medication",
    description:
      "Professional medication administration and management services at home.",
    category: "medication",
    price: 35,
    duration: 30,
    tags: ["medicine", "pills", "drug administration", "prescription"],
  },
  {
    _id: "9",
    name: "Wound Care",
    description:
      "Professional wound dressing and care services to promote healing and prevent infection.",
    category: "wound-care",
    price: 65,
    duration: 45,
    tags: ["dressing", "bandage", "injury", "healing"],
  },
  {
    _id: "10",
    name: "Elderly Care",
    description:
      "Compassionate elderly care services with assistance for daily activities and health monitoring.",
    category: "elderly-care",
    price: 55,
    duration: 60,
    tags: ["senior", "geriatric", "aged care", "assistance"],
  },
  {
    _id: "11",
    name: "Dialysis",
    description:
      "Home dialysis services with trained professionals ensuring safe and comfortable treatment.",
    category: "dialysis",
    price: 120,
    duration: 240,
    tags: ["kidney", "renal", "filtration", "chronic care"],
  },
  {
    _id: "12",
    name: "Respiratory",
    description:
      "Respiratory therapy and oxygen administration services for breathing support at home.",
    category: "respiratory",
    price: 75,
    duration: 60,
    tags: ["breathing", "oxygen", "lung", "respiratory therapy"],
  },
  {
    _id: "13",
    name: "Post-Op Care",
    description:
      "Post-operative care and recovery support to ensure smooth healing after surgery.",
    category: "post-op-care",
    price: 70,
    duration: 60,
    tags: ["surgery", "recovery", "post-surgical", "healing"],
  },
  {
    _id: "14",
    name: "Injection",
    description:
      "Professional injection administration services including insulin and other medications.",
    category: "injection",
    price: 45,
    duration: 15,
    tags: ["insulin", "shot", "intramuscular", "subcutaneous"],
  },
  {
    _id: "15",
    name: "Palliative",
    description:
      "Palliative care services focused on comfort and quality of life for serious illness.",
    category: "palliative",
    price: 100,
    duration: 60,
    tags: ["comfort care", "end of life", "pain management", "hospice"],
  },
  {
    _id: "16",
    name: "Nutrition",
    description:
      "Nutritional support and tube feeding management with certified healthcare professionals.",
    category: "nutrition",
    price: 60,
    duration: 45,
    tags: ["diet", "feeding", "tube feeding", "nutritional support"],
  },
];

export default function PatientHomeUI() {
  const [services, setServices] = useState<Service[]>(servicesData);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // No API fetch needed, using static data
  }, []);

  const handleServicePress = (serviceId: string) => {
    const service = services.find((s) => s._id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const getServiceIcon = (category: string) => {
    const iconMap: Record<string, React.JSX.Element> = {
      reeducation: <Ionicons name="accessibility" size={28} color="#4461F2" />,
      perfusion: <Ionicons name="water" size={28} color="#4461F2" />,
      vaccination: <Ionicons name="medical" size={28} color="#4461F2" />,
      analyses: <Ionicons name="flask" size={28} color="#4461F2" />,
      consultation: <Ionicons name="bandage" size={28} color="#4461F2" />,
      maternity: (
        <FontAwesome6 name="person-pregnant" size={28} color="#4461F2" />
      ),
      pediatric: (
        <FontAwesome6 name="baby-carriage" size={28} color="#4461F2" />
      ),
      medication: <Ionicons name="hand-right" size={28} color="#4461F2" />,
      "wound-care": <Ionicons name="medkit" size={28} color="#4461F2" />,
      "elderly-care": (
        <FontAwesome6 name="person-cane" size={28} color="#4461F2" />
      ),
      dialysis: <Ionicons name="heart-circle" size={28} color="#4461F2" />,
      respiratory: <Ionicons name="fitness" size={28} color="#4461F2" />,
      "post-op-care": <Ionicons name="bed" size={28} color="#4461F2" />,
      injection: <Ionicons name="pulse" size={28} color="#4461F2" />,
      palliative: <Ionicons name="leaf" size={28} color="#4461F2" />,
      nutrition: <Ionicons name="nutrition" size={28} color="#4461F2" />,
    };
    return (
      iconMap[category] || <Ionicons name="medical" size={28} color="#4461F2" />
    );
  };

  const handleBackToHome = () => {
    setSelectedService(null);
  };

  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-[#2D3142]">Loading services...</Text>
        </View>
      ) : selectedService ? (
        <BookingComponent service={selectedService} onBack={handleBackToHome} />
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
          {loading ? (
            <View className="mb-[30px] items-center justify-center py-10">
              <Ionicons name="refresh" size={40} color="#4461F2" />
              <Text className="text-base text-[#2D3142] mt-4">
                Loading services...
              </Text>
            </View>
          ) : searchQuery.length === 0 ? (
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
                      key={service._id}
                      className="w-[22%] items-center mb-4"
                      onPress={() => handleServicePress(service._id)}
                    >
                      <View className="w-full aspect-square bg-white rounded-full justify-center items-center mb-2 shadow-sm">
                        {getServiceIcon(service.category)}
                      </View>
                      <Text className="text-[10px] text-[#2D3142] text-center font-medium">
                        {service.name}
                      </Text>
                    </TouchableOpacity>
                  )
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
                      key={service._id}
                      className="bg-white rounded-[20px] p-4 shadow-sm"
                      onPress={() => handleServicePress(service._id)}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="w-14 h-14 bg-[#F5F6FA] rounded-full justify-center items-center">
                          {getServiceIcon(service.category)}
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-[#2D3142] mb-1">
                            {service.name}
                          </Text>
                          <Text className="text-sm text-[#9E9E9E] leading-5 mb-2">
                            {service.description}
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            <View className="bg-[#F5F6FA] px-3 py-1 rounded-full">
                              <Text className="text-xs text-[#4461F2]">
                                {service.category.replace("-", " ")}
                              </Text>
                            </View>
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
