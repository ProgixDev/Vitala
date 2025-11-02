import AlertFamilySvg from "@/assets/images/AlertFamilly.svg";
import AmbulenceSvg from "@/assets/images/Ambulence.svg";
import EmergencyNurseAlertSvg from "@/assets/images/EmergencyNurseAlert.svg";
import React from "react";
import {
  Alert,
  Dimensions,
  Linking,
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
const CARD_SPACING = 20;

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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const emergencyCards: EmergencyCard[] = [
    {
      id: 1,
      title: "Emergency Nurse Alert",
      subtitle: "Call medical emergency helpline",
      backgroundColor: "#ff4b93",
      illustration: EmergencyNurseAlertSvg,
      action: () => {
        Alert.alert(
          "Emergency Nurse Alert",
          "Do you want to call the emergency helpline?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Call",
              onPress: () => {
                // Replace with your emergency number
                Linking.openURL("tel:911");
              },
            },
          ]
        );
      },
    },
    {
      id: 2,
      title: "Ambulance",
      subtitle: "Request for ambulance from nearby hospitals",
      backgroundColor: "#ff5b5b",
      illustration: AmbulenceSvg,
      action: () => {
        Alert.alert(
          "Ambulance Request",
          "Requesting ambulance from nearby hospitals...",
          [{ text: "OK" }]
        );
      },
    },
    {
      id: 3,
      title: "Alert Family",
      subtitle: "Alert all the emergency contacts",
      backgroundColor: "#00b4b4",
      illustration: AlertFamilySvg,
      action: () => {
        Alert.alert(
          "Alert Family",
          "Sending emergency alerts to all your contacts...",
          [{ text: "OK" }]
        );
      },
    },
  ];

  return (
    <View className="flex-1 pt-6 px-4">
      {/* Header */}
      <View className="py-5">
        <View>
          <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
            Emergency
          </Text>
          <Text className="text-sm text-[#9E9E9E]">
            Organize all your schedules
          </Text>
        </View>
      </View>

      {/* Main Title */}
      <View className="mt-8">
        <Text className="text-3xl font-semibold text-[#2D3142]">
          Emergency Assistance at Home
        </Text>
      </View>

      {/* Horizontal Scroll Section */}
      <View className="flex-1 justify-center">
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCROLLVIEW_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{
            alignItems: "center",
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
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
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
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
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
