import { Button, Card, Header, Screen, Text } from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";

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
  {
    id: "13",
    question: "How do I find and book a nurse?",
    answer:
      "To find and book a nurse, go to the Search tab, enter your location and select the type of care needed. Browse available nurses, check their profiles and ratings, then choose a date and time for your appointment. Confirm your booking and you'll receive a notification once scheduled.",
    category: "Appointments",
  },
  {
    id: "14",
    question: "What qualifications do the nurses have?",
    answer:
      "All nurses on our platform are licensed healthcare professionals with valid certifications. They undergo background checks and verification processes. You can view each nurse's qualifications, experience, and specializations in their profile before booking.",
    category: "Account",
  },
  {
    id: "15",
    question: "How do I leave a review for a nurse?",
    answer:
      "After your appointment is completed, you'll receive a notification to rate and review your experience. Go to your appointment history in the Schedule tab, select the completed appointment, and tap 'Leave Review'. Your feedback helps maintain service quality.",
    category: "Account",
  },
  {
    id: "16",
    question: "What happens if a nurse is late or doesn't show up?",
    answer:
      "If a nurse is running late, you'll be notified via the app. If they don't show up within 15 minutes of the scheduled time, you can contact support immediately. We'll arrange a replacement nurse or provide a full refund, depending on the circumstances.",
    category: "Appointments",
  },
  {
    id: "17",
    question: "How does the app use my location?",
    answer:
      "Your location is used to find nearby nurses and calculate distances for appointments. For emergency SOS, your location is shared with emergency services. You can control location permissions in your device settings, but some features may be limited without it.",
    category: "Privacy",
  },
  {
    id: "18",
    question: "Can I request a specific nurse for future appointments?",
    answer:
      "Yes, you can request a specific nurse when booking if they've provided care for you before. During the booking process, you can select 'Request Previous Nurse' or search for them by name. However, availability isn't guaranteed and depends on their schedule.",
    category: "Appointments",
  },
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
}) => {
  const colors = useThemeColors();
  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row items-center justify-between">
        <Text variant="label" color="foreground" className="flex-1 mr-3">
          {faq.question}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.mutedForeground}
        />
      </View>
      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-border">
          <Text variant="body" color="muted" className="leading-5">
            {faq.answer}
          </Text>
        </View>
      )}
    </Card>
  );
};

export default function FAQ() {
  const colors = useThemeColors();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/profile");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const handleFAQPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Screen scroll>
      <Header title="FAQ" onBack={() => router.replace("/(tabs)/profile")} />

      {/* Info Banner */}
      <Card
        elevation="none"
        className="mt-2 mb-5 bg-primary-soft border-0 flex-row items-center"
      >
        <View className="w-12 h-12 rounded-full bg-surface items-center justify-center mr-3">
          <Ionicons name="help-circle" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text variant="label" color="foreground" className="mb-0.5">
            Need Help?
          </Text>
          <Text variant="caption" color="muted">
            Find answers to common questions below
          </Text>
        </View>
      </Card>

      {/* FAQ List */}
      {faqData.map((faq) => (
        <FAQItemComponent
          key={faq.id}
          faq={faq}
          isExpanded={expandedId === faq.id}
          onPress={() => handleFAQPress(faq.id)}
        />
      ))}

      {/* Still Need Help */}
      <Card className="mt-3 items-center">
        <Text variant="h3" color="foreground" className="mb-2">
          Still need help?
        </Text>
        <Text variant="body" color="muted" className="text-center leading-5 mb-4">
          Can&apos;t find what you&apos;re looking for? Our support team is here
          to help!
        </Text>
        <Button
          label="Contact Support"
          onPress={() => console.log("Contact Support")}
          leftIcon="chatbubble-ellipses-outline"
          fullWidth={false}
        />
      </Card>
    </Screen>
  );
}
