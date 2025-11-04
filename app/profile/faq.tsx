import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "How do I book an appointment?",
    answer:
      "To book an appointment, navigate to the Search tab, select your desired service, choose a date and time, and confirm your booking. You'll receive a confirmation notification once your appointment is scheduled.",
    category: "Appointments",
  },
  {
    id: "2",
    question: "Can I cancel or reschedule my appointment?",
    answer:
      "Yes, you can cancel or reschedule your appointment from the Schedule tab. Simply tap on your upcoming appointment and select the option to cancel or reschedule. Please note that cancellations made less than 24 hours before the appointment may be subject to a fee.",
    category: "Appointments",
  },
  {
    id: "3",
    question: "How do I use the emergency SOS feature?",
    answer:
      "The SOS feature is available on the SOS tab. In case of an emergency, tap the SOS button and emergency services will be notified immediately. Your location will be shared automatically to ensure quick response.",
    category: "Emergency",
  },
  {
    id: "4",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and digital wallets like Apple Pay and Google Pay. All transactions are secure and encrypted.",
    category: "Payment",
  },
  {
    id: "5",
    question: "How can I view my transaction history?",
    answer:
      "You can view all your past transactions by going to Profile > Transaction History. Here you'll find a detailed list of all your payments, refunds, and bookings.",
    category: "Payment",
  },
  {
    id: "6",
    question: "Is my personal information secure?",
    answer:
      "Yes, we take your privacy and security seriously. All your personal and medical information is encrypted and stored securely. We comply with HIPAA regulations and use industry-standard security measures to protect your data.",
    category: "Privacy",
  },
  {
    id: "7",
    question: "How do I update my profile information?",
    answer:
      "Go to Profile > My Profile and tap the edit icon. You can update your name, email, phone number, and other personal details. Make sure to save your changes before exiting.",
    category: "Account",
  },
  {
    id: "8",
    question: "What should I do if I forgot my password?",
    answer:
      "On the login screen, tap 'Forgot Password' and enter your registered email address. You'll receive a password reset link via email. Follow the instructions to create a new password.",
    category: "Account",
  },
  {
    id: "9",
    question: "How do I enable notifications?",
    answer:
      "Go to Profile > Settings > Notifications. Here you can enable or disable push notifications, email notifications, and SMS alerts. You can also customize which types of notifications you want to receive.",
    category: "Settings",
  },
  {
    id: "10",
    question: "Can I use the app in multiple languages?",
    answer:
      "Currently, the app is available in English. We're working on adding more languages in future updates. You can check for available languages in Profile > Settings > Language.",
    category: "Settings",
  },
  {
    id: "11",
    question: "How do I contact customer support?",
    answer:
      "You can contact our support team by going to Profile > Help Center or by emailing support@vitalahealth.com. Our team is available 24/7 to assist you with any questions or concerns.",
    category: "Support",
  },
  {
    id: "12",
    question: "What if I experience a technical issue?",
    answer:
      "If you encounter any technical issues, try restarting the app first. If the problem persists, contact our support team through the Help Center. Please provide details about the issue and any error messages you received.",
    category: "Support",
  },
];

const categories = [
  "All",
  "Appointments",
  "Emergency",
  "Payment",
  "Privacy",
  "Account",
  "Settings",
  "Support",
];

interface FAQItemComponentProps {
  faq: FAQItem;
  isExpanded: boolean;
  onPress: () => void;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({
  faq,
  isExpanded,
  onPress,
}) => (
  <TouchableOpacity
    className="bg-white rounded-xl p-4 mb-3 shadow-sm"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center justify-between">
      <Text className="flex-1 text-[15px] font-semibold text-[#1F2937] mr-3">
        {faq.question}
      </Text>
      <Ionicons
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={20}
        color="#6B7280"
      />
    </View>
    {isExpanded && (
      <View className="mt-3 pt-3 border-t border-[#F3F4F6]">
        <Text className="text-sm text-[#6B7280] leading-[22px]">
          {faq.answer}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  const filteredFAQs =
    selectedCategory === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  const handleFAQPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.replace("/(tabs)/profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">FAQ</Text>
        <View className="w-10 h-10" />
      </View>

      {/* Info Banner */}
      <View className="flex-row bg-[#EEF2FF] mx-6 mt-5 p-4 rounded-xl items-center">
        <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-3">
          <Ionicons name="help-circle" size={24} color="#4461F2" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-[#1F2937] mb-0.5">
            Need Help?
          </Text>
          <Text className="text-[13px] text-[#6B7280]">
            Find answers to common questions below
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-5"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            className={`px-4 py-2 rounded-full border ${
              selectedCategory === category
                ? "bg-[#4461F2] border-[#4461F2]"
                : "bg-white border-[#E5E7EB]"
            }`}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === category ? "text-white" : "text-[#6B7280]"
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView
        className="flex-1 mt-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredFAQs.length === 0 ? (
          <View className="items-center justify-center py-[60px] px-12">
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text className="text-xl font-semibold text-[#1F2937] mt-4 mb-2">
              No FAQs Found
            </Text>
            <Text className="text-sm text-[#6B7280] text-center leading-5">
              No questions found in this category
            </Text>
          </View>
        ) : (
          <View className="px-6">
            {filteredFAQs.map((faq) => (
              <FAQItemComponent
                key={faq.id}
                faq={faq}
                isExpanded={expandedId === faq.id}
                onPress={() => handleFAQPress(faq.id)}
              />
            ))}
          </View>
        )}

        {/* Still Need Help */}
        <View className="mx-6 mt-6 p-5 bg-white rounded-2xl items-center shadow-sm">
          <Text className="text-lg font-bold text-[#1F2937] mb-2">
            Still need help?
          </Text>
          <Text className="text-sm text-[#6B7280] text-center leading-5 mb-4">
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help!
          </Text>
          <TouchableOpacity
            className="flex-row items-center bg-[#4461F2] px-6 py-3 rounded-[10px] gap-2"
            onPress={() => console.log("Contact Support")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text className="text-[15px] font-semibold text-white">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
