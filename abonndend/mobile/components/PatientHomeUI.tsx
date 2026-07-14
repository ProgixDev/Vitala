import BookingComponent from "@/components/BookingComponent";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, useColorScheme, View } from "react-native";
import { Card, EmptyState, IconButton, Input, SkeletonList, Text } from "@/components/ui";
import { getCategoryTint, useThemeColors } from "@/constants/theme";
import { getServiceLabel } from "@/utils/services";
import { t } from "@/utils/i18n";

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
  { _id: "1", name: "Rééducation", description: "Recover safely at home with personalized physiotherapy sessions designed to restore your strength and mobility.", category: "reeducation", price: 60, duration: 60, tags: ["physiotherapy", "recovery", "mobility", "rehabilitation"] },
  { _id: "2", name: "Perfusion", description: "Professional IV therapy services delivered in the comfort of your home with trained nursing staff.", category: "perfusion", price: 80, duration: 60, tags: ["IV therapy", "infusion", "hydration", "medical"] },
  { _id: "3", name: "Vaccination", description: "Get vaccinated at home with our certified nurses ensuring safe and convenient immunization.", category: "vaccination", price: 40, duration: 30, tags: ["vaccine", "immunization", "prevention", "shot"] },
  { _id: "4", name: "Analyses", description: "Home blood sample collection and laboratory test services with quick and accurate results.", category: "analyses", price: 50, duration: 30, tags: ["blood test", "lab", "diagnostic", "sample collection"] },
  { _id: "5", name: "Consultation", description: "Expert medical consultation at your doorstep with experienced healthcare professionals.", category: "consultation", price: 70, duration: 45, tags: ["doctor", "medical advice", "checkup", "examination"] },
  { _id: "6", name: "Maternity", description: "Comprehensive maternity care and support for new mothers in the comfort of home.", category: "maternity", price: 90, duration: 60, tags: ["pregnancy", "prenatal", "postnatal", "newborn"] },
  { _id: "7", name: "Pediatric", description: "Specialized pediatric care for children with gentle and experienced nursing staff.", category: "pediatric", price: 55, duration: 45, tags: ["children", "kids", "infant", "baby care"] },
  { _id: "8", name: "Medication", description: "Professional medication administration and management services at home.", category: "medication", price: 35, duration: 30, tags: ["medicine", "pills", "drug administration", "prescription"] },
  { _id: "9", name: "Wound Care", description: "Professional wound dressing and care services to promote healing and prevent infection.", category: "wound-care", price: 65, duration: 45, tags: ["dressing", "bandage", "injury", "healing"] },
  { _id: "10", name: "Elderly Care", description: "Compassionate elderly care services with assistance for daily activities and health monitoring.", category: "elderly-care", price: 55, duration: 60, tags: ["senior", "geriatric", "aged care", "assistance"] },
  { _id: "11", name: "Dialysis", description: "Home dialysis services with trained professionals ensuring safe and comfortable treatment.", category: "dialysis", price: 120, duration: 240, tags: ["kidney", "renal", "filtration", "chronic care"] },
  { _id: "12", name: "Respiratory", description: "Respiratory therapy and oxygen administration services for breathing support at home.", category: "respiratory", price: 75, duration: 60, tags: ["breathing", "oxygen", "lung", "respiratory therapy"] },
  { _id: "13", name: "Post-Op Care", description: "Post-operative care and recovery support to ensure smooth healing after surgery.", category: "post-op-care", price: 70, duration: 60, tags: ["surgery", "recovery", "post-surgical", "healing"] },
  { _id: "14", name: "Injection", description: "Professional injection administration services including insulin and other medications.", category: "injection", price: 45, duration: 15, tags: ["insulin", "shot", "intramuscular", "subcutaneous"] },
  { _id: "15", name: "Palliative", description: "Palliative care services focused on comfort and quality of life for serious illness.", category: "palliative", price: 100, duration: 60, tags: ["comfort care", "end of life", "pain management", "hospice"] },
  { _id: "16", name: "Nutrition", description: "Nutritional support and tube feeding management with certified healthcare professionals.", category: "nutrition", price: 60, duration: 45, tags: ["diet", "feeding", "tube feeding", "nutritional support"] },
];

export default function PatientHomeUI() {
  const colors = useThemeColors();
  const scheme = useColorScheme();
  const [services] = useState<Service[]>(servicesData);
  const [loading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleServicePress = (serviceId: string) => {
    const service = services.find((s) => s._id === serviceId);
    if (service) setSelectedService(service);
  };

  const getServiceIcon = (category: string, size = 26, color?: string) => {
    const c = color ?? getCategoryTint(category, scheme).fg;
    const map: Record<string, React.JSX.Element> = {
      reeducation: <Ionicons name="accessibility" size={size} color={c} />,
      perfusion: <Ionicons name="water" size={size} color={c} />,
      vaccination: <Ionicons name="medical" size={size} color={c} />,
      analyses: <Ionicons name="flask" size={size} color={c} />,
      consultation: <Ionicons name="bandage" size={size} color={c} />,
      maternity: <FontAwesome6 name="person-pregnant" size={size} color={c} />,
      pediatric: <FontAwesome6 name="baby-carriage" size={size} color={c} />,
      medication: <Ionicons name="hand-right" size={size} color={c} />,
      "wound-care": <Ionicons name="medkit" size={size} color={c} />,
      "elderly-care": <FontAwesome6 name="person-cane" size={size} color={c} />,
      dialysis: <Ionicons name="heart-circle" size={size} color={c} />,
      respiratory: <Ionicons name="fitness" size={size} color={c} />,
      "post-op-care": <Ionicons name="bed" size={size} color={c} />,
      injection: <Ionicons name="pulse" size={size} color={c} />,
      palliative: <Ionicons name="leaf" size={size} color={c} />,
      nutrition: <Ionicons name="nutrition" size={size} color={c} />,
    };
    return map[category] || <Ionicons name="medical" size={size} color={c} />;
  };

  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
  });

  if (selectedService) {
    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <BookingComponent
          service={selectedService}
          onBack={() => setSelectedService(null)}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="pt-3 pb-5">
        <Text variant="overline" color="muted">
          Welcome back
        </Text>
        <Text variant="display" color="foreground" className="mt-1">
          {t("home.findNurse")}
        </Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center gap-2 mb-6">
        <Input
          placeholder={t("home.searchPlaceholder")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery.length > 0 ? "close-circle" : undefined}
          onRightIconPress={() => setSearchQuery("")}
          containerClassName="flex-1"
        />
        <IconButton
          icon="options-outline"
          onPress={() => {}}
          variant="soft"
          color={colors.primary}
          accessibilityLabel="Filter services"
        />
      </View>

      {loading ? (
        <SkeletonList count={4} />
      ) : searchQuery.length === 0 ? (
        <>
          {/* Services grid */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text variant="h2" color="foreground">
                {t("home.ourServices")}
              </Text>
              <Pressable onPress={() => setShowAllServices(!showAllServices)} hitSlop={8}>
                <Text variant="label" color="primary" weight="semibold">
                  {showAllServices ? t("common.seeLess") : t("common.seeAll")}
                </Text>
              </Pressable>
            </View>

            <View className="flex-row flex-wrap">
              {(showAllServices ? services : services.slice(0, 8)).map((service) => (
                <Pressable
                  key={service._id}
                  className="w-1/4 items-center mb-5 active:opacity-70"
                  onPress={() => handleServicePress(service._id)}
                >
                  <View
                    className="w-16 h-16 rounded-2xl justify-center items-center mb-2"
                    style={{ backgroundColor: getCategoryTint(service.category, scheme).bg }}
                  >
                    {getServiceIcon(service.category)}
                  </View>
                  <Text
                    variant="caption"
                    color="foreground"
                    weight="medium"
                    numberOfLines={1}
                    className="text-center px-1"
                  >
                    {getServiceLabel(service)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Hero — consultation */}
          <Card
            elevation="e2"
            padded={false}
            className="bg-primary mb-4 p-6 overflow-hidden"
          >
            <View className="pr-24">
              <Text variant="overline" color="onPrimary" className="opacity-70">
                Trusted nurses
              </Text>
              <Text variant="h1" color="onPrimary" weight="headingBold" className="mt-2">
                Care that comes{"\n"}to you
              </Text>
              <View className="flex-row items-center mt-5">
                <Text variant="h3" color="accent" weight="headingBold">
                  30,000+
                </Text>
                <Text variant="caption" color="onPrimary" className="opacity-70 ml-2">
                  happy patients
                </Text>
              </View>
            </View>
            <Image
              source={require("@/assets/images/doctor.png")}
              className="w-36 h-44 absolute right-0 bottom-0"
              resizeMode="contain"
            />
          </Card>

          {/* Emergency — calm slim row */}
          <Card
            onPress={() => router.navigate("/(tabs)/sos")}
            className="mb-4 flex-row items-center"
          >
            <View className="w-11 h-11 rounded-full bg-emergency-soft items-center justify-center mr-3">
              <Ionicons name="pulse" size={20} color={colors.emergency} />
            </View>
            <View className="flex-1">
              <Text variant="label" color="foreground">
                24/7 emergency care
              </Text>
              <Text variant="caption" color="muted" className="mt-0.5">
                Reach a nurse or ambulance instantly
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </Card>
        </>
      ) : (
        /* Search results */
        <View className="mb-6">
          <Text variant="h3" color="foreground" className="mb-4">
            {`Results (${filteredServices.length})`}
          </Text>
          {filteredServices.length > 0 ? (
            <View className="gap-3">
              {filteredServices.map((service) => (
                <Card key={service._id} onPress={() => handleServicePress(service._id)}>
                  <View className="flex-row items-start">
                    <View
                      className="w-14 h-14 rounded-2xl justify-center items-center mr-3"
                      style={{ backgroundColor: getCategoryTint(service.category, scheme).bg }}
                    >
                      {getServiceIcon(service.category, 24)}
                    </View>
                    <View className="flex-1">
                      <Text variant="h3" color="foreground">
                        {getServiceLabel(service)}
                      </Text>
                      <Text variant="body" color="muted" numberOfLines={2} className="mt-1">
                        {service.description}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Text variant="caption" color="primary" weight="semibold">
                          {`$${service.price}`}
                        </Text>
                        <Text variant="caption" color="muted" className="ml-2">
                          {`· ${service.duration} min`}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title={t("home.emptyResults")}
              message="Try adjusting your search terms."
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}
