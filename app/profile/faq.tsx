import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
    style={styles.faqItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.questionContainer}>
      <Text style={styles.question}>{faq.question}</Text>
      <Ionicons
        name={isExpanded ? "chevron-up" : "chevron-down"}
        size={20}
        color="#6B7280"
      />
    </View>
    {isExpanded && (
      <View style={styles.answerContainer}>
        <Text style={styles.answer}>{faq.answer}</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFAQs =
    selectedCategory === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  const handleFAQPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.backButton} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoBannerIcon}>
          <Ionicons name="help-circle" size={24} color="#4461F2" />
        </View>
        <View style={styles.infoBannerContent}>
          <Text style={styles.infoBannerTitle}>Need Help?</Text>
          <Text style={styles.infoBannerText}>
            Find answers to common questions below
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.activeCategoryChip,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.activeCategoryChipText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFAQs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No FAQs Found</Text>
            <Text style={styles.emptyMessage}>
              No questions found in this category
            </Text>
          </View>
        ) : (
          <View style={styles.faqList}>
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
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Still need help?</Text>
          <Text style={styles.helpText}>
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help!
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => console.log("Contact Support")}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    marginHorizontal: 24,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  infoBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 13,
    color: "#6B7280",
  },
  categoryScroll: {
    marginTop: 20,
  },
  categoryContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeCategoryChip: {
    backgroundColor: "#4461F2",
    borderColor: "#4461F2",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeCategoryChipText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  faqList: {
    paddingHorizontal: 24,
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 12,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  answer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  helpSection: {
    marginHorizontal: 24,
    marginTop: 24,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4461F2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
