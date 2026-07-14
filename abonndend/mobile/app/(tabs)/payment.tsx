import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  BadgeTone,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

const CARDS_STORAGE_KEY = "@vitala_saved_cards";

const tabularNums = { fontVariant: ["tabular-nums" as const] };

interface Card {
  id: string;
  lastFour: string;
  type: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface Payment {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
}

export default function PaymentdPage() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);

  // Handle back button - go to home tab instead of back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)");
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const [payments, setPayments] = useState<ApiTransaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    // Fetch recent payments
    const fetchRecentPayments = async () => {
      try {
        if (!currentUser?.token) {
          setLoadingPayments(false);
          return;
        }

        const result = await api.getTransactions(currentUser.token, {
          limit: "5",
        });

        if (result.success && result.data) {
          setPayments(result.data);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    // Load saved cards from AsyncStorage
    const loadSavedCards = async () => {
      try {
        const savedCards = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
        if (savedCards) {
          setCards(JSON.parse(savedCards));
        }
      } catch (error) {
        console.error("Error loading saved cards:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load saved cards",
        });
      } finally {
        setLoadingCards(false);
      }
    };

    fetchRecentPayments();
    loadSavedCards();
  }, [currentUser?.token]);

  // Save cards to AsyncStorage
  const saveCardsToStorage = async (cardsToSave: Card[]) => {
    try {
      await AsyncStorage.setItem(
        CARDS_STORAGE_KEY,
        JSON.stringify(cardsToSave),
      );
    } catch (error) {
      console.error("Error saving cards:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save card",
      });
    }
  };

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  const handleAddCard = async () => {
    if (
      !cardForm.cardNumber ||
      !cardForm.expiryMonth ||
      !cardForm.expiryYear ||
      !cardForm.cvv ||
      !cardForm.cardholderName
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const month = parseInt(cardForm.expiryMonth);
    if (isNaN(month) || month < 1 || month > 12) {
      Alert.alert("Error", "Please enter a valid expiry month (1-12)");
      return;
    }

    if (cardForm.cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Error", "Please enter a valid 16-digit card number");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const cleanCardNumber = cardForm.cardNumber.replace(/\s/g, "");
      const lastFour = cleanCardNumber.slice(-4);
      const cardType = cleanCardNumber.startsWith("4")
        ? "Visa"
        : cleanCardNumber.startsWith("5")
          ? "Mastercard"
          : "Card";

      const newCard: Card = {
        id: Date.now().toString(),
        lastFour,
        type: cardType,
        expiryMonth: cardForm.expiryMonth,
        expiryYear: cardForm.expiryYear,
        isDefault: cards.length === 0,
      };

      const updatedCards = [...cards, newCard];
      setCards(updatedCards);
      saveCardsToStorage(updatedCards);

      setCardForm({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      });
      setShowAddCardModal(false);
      setIsLoading(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Card added successfully!",
      });
    }, 1500);
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedCards = cards.filter((card) => card.id !== cardId);
          setCards(updatedCards);
          saveCardsToStorage(updatedCards);
          Toast.show({
            type: "success",
            text1: "Card Deleted",
            text2: "Card removed successfully",
          });
        },
      },
    ]);
  };

  const handleSetDefaultCard = (cardId: string) => {
    const updatedCards = cards.map((card) => ({
      ...card,
      isDefault: card.id === cardId,
    }));
    setCards(updatedCards);
    saveCardsToStorage(updatedCards);
    Toast.show({
      type: "success",
      text1: "Default Card Updated",
      text2: "Your default card has been changed",
    });
  };

  const getStatusTone = (status: Payment["status"]): BadgeTone => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "emergency";
      default:
        return "neutral";
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, "");

    // Limit to 16 digits
    const limitedDigits = digitsOnly.slice(0, 16);

    // Add spaces every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, "$1 ");

    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const getStatusIcon = (
    status: Payment["status"],
  ): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "failed":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Screen scroll>
        {/* Header */}
        <View className="pt-2 pb-5">
          <Text variant="h1" color="foreground">
            Payment & Cards
          </Text>
          <Text variant="body" color="muted" className="mt-1">
            Manage your payments
          </Text>
        </View>

        {/* Saved Cards Section */}
        <View className="mb-8">
          <Text variant="h2" color="foreground" className="mb-4">
            Saved Cards ({cards.length})
          </Text>
          {loadingCards ? (
            <SkeletonList count={2} itemHeight={110} />
          ) : cards.length > 0 ? (
            <View className="gap-3">
              {cards.map((card) => (
                <Swipeable
                  key={card.id}
                  renderRightActions={() => (
                    <View className="justify-center px-4">
                      <TouchableOpacity
                        className="bg-emergency rounded-full w-12 h-12 justify-center items-center ml-1 active:opacity-80"
                        onPress={() => handleDeleteCard(card.id)}
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color={colors.onEmergency}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                >
                  <Card elevation="e1">
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center flex-1">
                        <View className="w-11 h-11 bg-primary-soft rounded-lg justify-center items-center">
                          <Ionicons
                            name="card"
                            size={22}
                            color={colors.primary}
                          />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text
                            variant="label"
                            color="foreground"
                            style={tabularNums}
                          >
                            •••• •••• •••• {card.lastFour}
                          </Text>
                          <Text
                            variant="caption"
                            color="muted"
                            className="mt-0.5"
                            style={tabularNums}
                          >
                            Expires {card.expiryMonth}/{card.expiryYear}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end gap-1">
                        <Text variant="caption" color="muted">
                          {card.type}
                        </Text>
                        {card.isDefault && (
                          <Badge label="Default" tone="primary" />
                        )}
                      </View>
                    </View>
                    {!card.isDefault && (
                      <Button
                        label="Set as Default"
                        variant="secondary"
                        size="sm"
                        onPress={() => handleSetDefaultCard(card.id)}
                      />
                    )}
                  </Card>
                </Swipeable>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="card-outline"
              title="No cards saved"
              message="Add your first card to get started"
            />
          )}
        </View>

        {/* Add New Card */}
        <View className="mb-8">
          <Button
            label="Add New Card"
            variant="secondary"
            leftIcon="add-circle"
            onPress={() => setShowAddCardModal(true)}
          />
        </View>

        {/* Recent Payments */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text variant="h2" color="foreground">
              Recent Payments
            </Text>
            <Text
              variant="label"
              color="primary"
              weight="semibold"
              onPress={() => router.push("/profile/transaction-history")}
            >
              View All
            </Text>
          </View>
          {loadingPayments ? (
            <SkeletonList count={3} itemHeight={72} />
          ) : payments.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No Payments Yet"
              message="Your recent transactions will appear here"
            />
          ) : (
            <View className="gap-3">
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  elevation="e1"
                  onPress={() => {
                    if (payment.appointmentId) {
                      router.push(
                        `/appointment/${payment.appointmentId}/payment`,
                      );
                    }
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Badge
                        label={
                          payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)
                        }
                        tone={getStatusTone(payment.status as any)}
                        icon={getStatusIcon(payment.status as any)}
                      />
                      <Text
                        variant="caption"
                        color="muted"
                        className="mt-2"
                      >
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Text
                      variant="bodyLg"
                      weight="semibold"
                      color={
                        payment.status === "completed"
                          ? "accent"
                          : payment.status === "pending"
                            ? "warning"
                            : "emergency"
                      }
                      style={tabularNums}
                    >
                      ${Math.abs(payment.amount).toFixed(2)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Add Card Modal */}
        <Modal
          visible={showAddCardModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddCardModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-surface rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text variant="h2" color="foreground">
                  Add New Card
                </Text>
                <IconButton
                  icon="close"
                  onPress={() => setShowAddCardModal(false)}
                  variant="soft"
                  color={colors.mutedForeground}
                  accessibilityLabel="Close add card form"
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    keyboardType="numeric"
                    value={cardForm.cardNumber}
                    onChangeText={handleCardNumberChange}
                    maxLength={19}
                    leftIcon="card-outline"
                  />

                  <View className="flex-row gap-4">
                    <Input
                      containerClassName="flex-1"
                      label="Expiry Month"
                      placeholder="MM"
                      keyboardType="numeric"
                      value={cardForm.expiryMonth}
                      onChangeText={(text) =>
                        setCardForm((prev) => ({
                          ...prev,
                          expiryMonth: text,
                        }))
                      }
                      maxLength={2}
                    />
                    <Input
                      containerClassName="flex-1"
                      label="Expiry Year"
                      placeholder="YY"
                      keyboardType="numeric"
                      value={cardForm.expiryYear}
                      onChangeText={(text) =>
                        setCardForm((prev) => ({
                          ...prev,
                          expiryYear: text,
                        }))
                      }
                      maxLength={2}
                    />
                  </View>

                  <Input
                    label="CVV"
                    placeholder="123"
                    keyboardType="numeric"
                    value={cardForm.cvv}
                    onChangeText={(text) =>
                      setCardForm((prev) => ({ ...prev, cvv: text }))
                    }
                    maxLength={4}
                    secureTextEntry
                    leftIcon="lock-closed-outline"
                  />

                  <Input
                    label="Cardholder Name"
                    placeholder="John Doe"
                    value={cardForm.cardholderName}
                    onChangeText={(text) =>
                      setCardForm((prev) => ({
                        ...prev,
                        cardholderName: text,
                      }))
                    }
                    autoCapitalize="words"
                    leftIcon="person-outline"
                  />
                </View>

                <Button
                  label="Add Card"
                  onPress={handleAddCard}
                  loading={isLoading}
                  disabled={isLoading}
                  className="mt-6 mb-4"
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Screen>
    </GestureHandlerRootView>
  );
}
