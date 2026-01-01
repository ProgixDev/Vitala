import AlertFamilySvg from "@/assets/images/AlertFamilly.svg";
import AmbulenceSvg from "@/assets/images/Ambulence.svg";
import EmergencyNurseAlertSvg from "@/assets/images/EmergencyNurseAlert.svg";
import EmergencyStatusTracker from "@/components/EmergencyStatusTracker";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCROLLVIEW_WIDTH = SCREEN_WIDTH - 32; // Accounting for px-4 (16*2) on parent View
const CARD_WIDTH = SCROLLVIEW_WIDTH * 0.85;

interface EmergencyCard {
  id: number;
  title: string;
  subtitle: string;
  backgroundColor: string;
  illustration: React.ComponentType<any>;
  action: () => void;
}

export default function SOS() {
  const scrollX = useSharedValue(0);
  const [emergencyRequestLoading, setEmergencyRequestLoading] = useState(false);
  const [currentEmergencyAppointment, setCurrentEmergencyAppointment] =
    useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  // Handle back button - go to home tab instead of back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleBackToSOS = () => {
    setCurrentEmergencyAppointment(null);
  };

  const handleEmergencyRequest = async (serviceId: string) => {
    if (!currentUser?.token) {
      Alert.alert("Error", "Please log in to request emergency services");
      return;
    }

    setEmergencyRequestLoading(true);
    try {
      let response: any;
      const location = {
        address: "Current location", // In a real app, get actual location
        coordinates: { latitude: 0, longitude: 0 }, // Get actual coordinates
      };

      switch (serviceId) {
        case "emergency-nurse":
          response = await api.createNurseAlert(currentUser.token, {
            description: "Emergency nurse assistance requested",
            location,
          });
          break;
        case "ambulance":
          response = await api.createAmbulanceRequest(currentUser.token, {
            description: "Ambulance service requested",
            location,
          });
          break;
        case "alert-family":
          response = await api.sendFamilyAlert(currentUser.token, {
            message: `EMERGENCY! I need immediate assistance. Current location: ${location.address}`,
          });

          // Family alerts don't have appointments, show success message
          Alert.alert(
            "Family Alert Sent",
            response.message ||
              `Emergency alert sent to ${response.data?.contactsNotified || "your"} contact(s)`,
            [{ text: "OK" }]
          );
          setEmergencyRequestLoading(false);
          return; // Exit early since no appointment tracking needed
        default:
          throw new Error("Invalid emergency service");
      }

      if (response.data?.appointment?._id) {
        setCurrentEmergencyAppointment(response.data.appointment._id);
      }

      Alert.alert(
        "Emergency Request Sent",
        "Your emergency request has been submitted. Help is on the way.",
        [{ text: "OK" }]
      );
    } catch (error: any) {
      // Special handling for missing emergency contacts
      if (error.message?.includes("No emergency contacts found")) {
        // Expected error - user needs to add contacts first
        Alert.alert(
          "No Emergency Contacts",
          "Please add emergency contacts before using this feature. Go to Settings > Emergency Contacts to add contacts.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Add Contacts", 
              onPress: () => router.push("/profile/emergency-contacts")
            }
          ]
        );
      } else {
        // Log unexpected errors for debugging
        console.error("Emergency request error:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to send emergency request. Please try again."
        );
      }
    } finally {
      setEmergencyRequestLoading(false);
    }
  };

  const emergencyCards: EmergencyCard[] = [
    {
      id: 1,
      title: "Emergency Nurse Alert",
      subtitle: "Call medical emergency helpline",
      backgroundColor: "#ff4b93",
      illustration: EmergencyNurseAlertSvg,
      action: () => handleEmergencyRequest("emergency-nurse"),
    },
    {
      id: 2,
      title: "Ambulance",
      subtitle: "Request for ambulance from nearby hospitals",
      backgroundColor: "#ff5b5b",
      illustration: AmbulenceSvg,
      action: () => handleEmergencyRequest("ambulance"),
    },
    {
      id: 3,
      title: "Alert Family",
      subtitle: "Alert all the emergency contacts",
      backgroundColor: "#00b4b4",
      illustration: AlertFamilySvg,
      action: () => handleEmergencyRequest("alert-family"),
    },
  ];

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {currentEmergencyAppointment ? (
        <EmergencyStatusTracker
          appointmentId={currentEmergencyAppointment}
          onClose={handleBackToSOS}
        />
      ) : emergencyRequestLoading ? (
        <View className="flex-1 justify-center items-center bg-[#F9FAFB]">
          <ActivityIndicator size="large" color="#ff4b93" />
          <Text className="text-[#6B7280] mt-4 text-center font-medium">
            Sending emergency request...
          </Text>
          <Text className="text-[#9CA3AF] mt-2 text-center text-sm">
            Please wait while we process your request
          </Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View className="px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
            <Text className="text-2xl font-bold text-[#1F2937] mb-1">
              Emergency
            </Text>
            <Text className="text-sm text-[#6B7280]">
              Quick access to emergency services
            </Text>
          </View>

          {/* Horizontal Scroll Section */}
          <View className="flex-1 justify-center px-4">
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SCROLLVIEW_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={{
                alignItems: "center",
                paddingVertical: 20,
              }}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            >
              {emergencyCards.map((card, index) => (
                <EmergencyCardComponent
                  key={card.id}
                  card={card}
                  index={index}
                  scrollX={scrollX}
                />
              ))}
            </Animated.ScrollView>

            {/* Pagination Dots */}
            <View className="flex-row justify-center items-center py-6 absolute bottom-0 left-0 right-0">
              {emergencyCards.map((_, index) => (
                <PaginationDot key={index} index={index} scrollX={scrollX} />
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

interface EmergencyCardComponentProps {
  card: EmergencyCard;
  index: number;
  scrollX: SharedValue<number>;
}

function EmergencyCardComponent({
  card,
  index,
  scrollX,
}: EmergencyCardComponentProps) {
  const inputRange = [
    (index - 1) * SCROLLVIEW_WIDTH,
    index * SCROLLVIEW_WIDTH,
    (index + 1) * SCROLLVIEW_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const IllustrationComponent = card.illustration;

  return (
    <Animated.View
      style={[
        {
          width: SCROLLVIEW_WIDTH,
        },
        animatedStyle,
      ]}
    >
      <View style={{ justifyContent: "center" }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={card.action}
          style={{
            backgroundColor: card.backgroundColor,
            minHeight: 400,
            borderRadius: 24,
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Illustration */}
          <View className="flex-1 justify-center items-center px-4 pt-10">
            <IllustrationComponent width={CARD_WIDTH * 0.75} height={320} />
          </View>

          {/* Text Content */}
          <View className="px-7 pb-10">
            <Text className="text-2xl font-bold text-white mb-2 leading-tight">
              {card.title}
            </Text>
            <Text
              className="text-[15px] text-white font-normal leading-snug"
              style={{ opacity: 0.95 }}
            >
              {card.subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
}

function PaginationDot({ index, scrollX }: PaginationDotProps) {
  const inputRange = [
    (index - 1) * SCROLLVIEW_WIDTH,
    index * SCROLLVIEW_WIDTH,
    (index + 1) * SCROLLVIEW_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP,
    );

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[animatedStyle]}
      className="h-2 bg-[#ff4b93] rounded-full mx-1"
    />
  );
}
