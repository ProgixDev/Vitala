import AlertFamilySvg from "@/assets/images/AlertFamilly.svg";
import AmbulenceSvg from "@/assets/images/Ambulence.svg";
import EmergencyNurseAlertSvg from "@/assets/images/EmergencyNurseAlert.svg";
import EmergencyStatusTracker from "@/components/EmergencyStatusTracker";
import { Text } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useThemeColors } from "@/constants/theme";
import { api } from "@/utils/api";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCROLLVIEW_WIDTH = SCREEN_WIDTH - 32;
const CARD_WIDTH = SCROLLVIEW_WIDTH * 0.85;

// Deliberate emergency palette for the SOS carousel (kept saturated in both
// themes so white text stays legible). Red is reserved for these actions.
const CARD_COLORS = {
  nurse: "#C62F35",
  ambulance: "#94131C",
  family: "#0B7C57",
};

interface EmergencyCard {
  id: number;
  title: string;
  subtitle: string;
  backgroundColor: string;
  illustration: React.ComponentType<any>;
  action: () => void;
}

export default function SOS() {
  const colors = useThemeColors();
  const scrollX = useSharedValue(0);
  const [emergencyRequestLoading, setEmergencyRequestLoading] = useState(false);
  const [currentEmergencyAppointment, setCurrentEmergencyAppointment] =
    useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/(tabs)");
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleEmergencyRequest = async (serviceId: string) => {
    if (!currentUser?.token) {
      Alert.alert("Error", "Please log in to request emergency services");
      return;
    }
    setEmergencyRequestLoading(true);
    try {
      let response: any;
      const location = {
        address: "Current location",
        coordinates: { latitude: 0, longitude: 0 },
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
          Alert.alert(
            "Family Alert Sent",
            response.message ||
              `Emergency alert sent to ${response.data?.contactsNotified || "your"} contact(s)`,
            [{ text: "OK" }],
          );
          setEmergencyRequestLoading(false);
          return;
        default:
          throw new Error("Invalid emergency service");
      }

      if (response.data?.appointment?._id) {
        setCurrentEmergencyAppointment(response.data.appointment._id);
      }
      Alert.alert(
        "Emergency Request Sent",
        "Your emergency request has been submitted. Help is on the way.",
        [{ text: "OK" }],
      );
    } catch (error: any) {
      if (error.message?.includes("No emergency contacts found")) {
        Alert.alert(
          "No Emergency Contacts",
          "Please add emergency contacts before using this feature. Go to Settings > Emergency Contacts to add contacts.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add Contacts",
              onPress: () => router.push("/profile/emergency-contacts"),
            },
          ],
        );
      } else {
        console.error("Emergency request error:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to send emergency request. Please try again.",
        );
      }
    } finally {
      setEmergencyRequestLoading(false);
    }
  };

  const emergencyCards: EmergencyCard[] = [
    {
      id: 1,
      title: "Emergency nurse",
      subtitle: "Alert a nearby nurse for urgent medical help",
      backgroundColor: CARD_COLORS.nurse,
      illustration: EmergencyNurseAlertSvg,
      action: () => handleEmergencyRequest("emergency-nurse"),
    },
    {
      id: 2,
      title: "Ambulance",
      subtitle: "Request an ambulance from nearby hospitals",
      backgroundColor: CARD_COLORS.ambulance,
      illustration: AmbulenceSvg,
      action: () => handleEmergencyRequest("ambulance"),
    },
    {
      id: 3,
      title: "Alert family",
      subtitle: "Notify all of your emergency contacts at once",
      backgroundColor: CARD_COLORS.family,
      illustration: AlertFamilySvg,
      action: () => handleEmergencyRequest("alert-family"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {currentEmergencyAppointment ? (
        <EmergencyStatusTracker
          appointmentId={currentEmergencyAppointment}
          onClose={() => setCurrentEmergencyAppointment(null)}
        />
      ) : emergencyRequestLoading ? (
        <View className="flex-1 justify-center items-center px-8">
          <ActivityIndicator size="large" color={colors.emergency} />
          <Text variant="h3" color="foreground" className="mt-4 text-center">
            Sending emergency request…
          </Text>
          <Text variant="body" color="muted" className="mt-1.5 text-center">
            Please wait while we process your request.
          </Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View className="px-5 pt-2 pb-4">
            <Text variant="h1" color="foreground">
              Emergency
            </Text>
            <Text variant="body" color="muted" className="mt-1">
              Every second counts — get help fast.
            </Text>
          </View>

          {/* Carousel */}
          <View className="flex-1 justify-center">
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SCROLLVIEW_WIDTH}
              decelerationRate="fast"
              contentContainerStyle={{ alignItems: "center", paddingHorizontal: 16 }}
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

            <View className="flex-row justify-center items-center py-6">
              {emergencyCards.map((_, index) => (
                <PaginationDot key={index} index={index} scrollX={scrollX} />
              ))}
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

interface EmergencyCardComponentProps {
  card: EmergencyCard;
  index: number;
  scrollX: SharedValue<number>;
}

function EmergencyCardComponent({ card, index, scrollX }: EmergencyCardComponentProps) {
  const inputRange = [
    (index - 1) * SCROLLVIEW_WIDTH,
    index * SCROLLVIEW_WIDTH,
    (index + 1) * SCROLLVIEW_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  const IllustrationComponent = card.illustration;

  return (
    <Animated.View style={[{ width: SCROLLVIEW_WIDTH }, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={card.action}
        accessibilityRole="button"
        accessibilityLabel={card.title}
        style={{
          backgroundColor: card.backgroundColor,
          minHeight: 400,
          borderRadius: 28,
          overflow: "hidden",
          justifyContent: "space-between",
          marginHorizontal: 4,
        }}
      >
        <View className="flex-1 justify-center items-center px-4 pt-10">
          <IllustrationComponent width={CARD_WIDTH * 0.75} height={320} />
        </View>
        <View className="px-7 pb-10">
          <View className="flex-row items-center mb-2">
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mr-2">
              <Text color="inherit" className="text-white" weight="headingBold">
                !
              </Text>
            </View>
            <Text variant="h2" color="inherit" weight="headingBold" className="text-white">
              {card.title}
            </Text>
          </View>
          <Text variant="body" color="inherit" className="text-white opacity-95">
            {card.subtitle}
          </Text>
        </View>
      </TouchableOpacity>
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
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
    return { width, opacity };
  });
  return (
    <Animated.View style={[animatedStyle]} className="h-2 bg-emergency rounded-full mx-1" />
  );
}
