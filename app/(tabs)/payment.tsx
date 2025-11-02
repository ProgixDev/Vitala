import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";

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

export default function Payment() {
  const [cards, setCards] = useState<Card[]>([
    {
      id: "1",
      lastFour: "1234",
      type: "Visa",
      expiryMonth: "12",
      expiryYear: "26",
      isDefault: true,
    },
  ]);

  const [payments] = useState<Payment[]>([
    {
      id: "1",
      description: "Appointment Payment",
      date: "Oct 15, 2025",
      amount: -50.0,
      status: "completed",
    },
    {
      id: "2",
      description: "Consultation Fee",
      date: "Oct 10, 2025",
      amount: -75.0,
      status: "completed",
    },
    {
      id: "3",
      description: "Emergency Service",
      date: "Oct 5, 2025",
      amount: -120.0,
      status: "pending",
    },
  ]);

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

      setCards((prev) => [...prev, newCard]);
      setCardForm({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      });
      setShowAddCardModal(false);
      setIsLoading(false);
      Alert.alert("Success", "Card added successfully!");
    }, 1500);
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCards((prev) => prev.filter((card) => card.id !== cardId));
        },
      },
    ]);
  };

  const handleSetDefaultCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    );
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
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

  const getStatusIcon = (status: Payment["status"]) => {
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
      <View className="flex-1 pt-6 px-4">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="py-5">
            <View>
              <Text className="text-[28px] font-bold text-[#2D3142] mb-1">
                Payment & Cards
              </Text>
              <Text className="text-sm text-[#9E9E9E]">
                Manage your payments
              </Text>
            </View>
          </View>

          {/* Saved Cards Section */}
          <View className="mb-[30px]">
            <Text className="text-xl font-semibold text-[#2D3142] mb-5">
              Saved Cards ({cards.length})
            </Text>
            {cards.length > 0 ? (
              <View className="gap-3">
                {cards.map((card) => (
                  <Swipeable
                    key={card.id}
                    renderRightActions={() => (
                      <View className="justify-center px-4">
                        <TouchableOpacity
                          className="bg-red-500 rounded-full w-12 h-12 justify-center items-center ml-1"
                          onPress={() => handleDeleteCard(card.id)}
                        >
                          <Ionicons name="trash" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    )}
                  >
                    <View className="bg-white rounded-[20px] p-4 shadow-sm">
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                          <Ionicons name="card" size={24} color="#4461F2" />
                          <View className="ml-3">
                            <Text className="text-base font-medium">
                              **** **** **** {card.lastFour}
                            </Text>
                            <Text className="text-xs text-[#9E9E9E]">
                              Expires {card.expiryMonth}/{card.expiryYear}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm text-gray-500">
                            {card.type}
                          </Text>
                          {card.isDefault && (
                            <Text className="text-xs text-[#4461F2] font-medium mt-1">
                              Default
                            </Text>
                          )}
                        </View>
                      </View>
                      {!card.isDefault && (
                        <TouchableOpacity
                          className="bg-[#4461F2] py-3 px-4 rounded-xl"
                          onPress={() => handleSetDefaultCard(card.id)}
                        >
                          <Text className="text-white text-center font-medium">
                            Set as Default
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Swipeable>
                ))}
              </View>
            ) : (
              <View className="bg-white rounded-[20px] p-8 items-center">
                <Ionicons name="card" size={48} color="#9E9E9E" />
                <Text className="text-base text-[#2D3142] font-semibold mt-4 mb-2">
                  No cards saved
                </Text>
                <Text className="text-sm text-[#9E9E9E] text-center">
                  Add your first card to get started
                </Text>
              </View>
            )}
          </View>

          {/* Add New Card */}
          <View className="mb-[30px]">
            <TouchableOpacity
              className="bg-white rounded-[20px] p-4 shadow-sm flex-row items-center"
              onPress={() => setShowAddCardModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#4461F2" />
              <Text className="ml-3 text-base font-medium text-[#4461F2]">
                Add New Card
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Payments */}
          <View className="mb-[30px]">
            <Text className="text-xl font-semibold text-[#2D3142] mb-5">
              Recent Payments
            </Text>
            <View className="gap-3">
              {payments.map((payment) => (
                <View
                  key={payment.id}
                  className="bg-white rounded-[20px] p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name={getStatusIcon(payment.status) as any}
                          size={16}
                          color={
                            payment.status === "completed"
                              ? "#16a34a"
                              : payment.status === "pending"
                                ? "#ca8a04"
                                : "#dc2626"
                          }
                        />
                        <Text className="text-sm text-[#9E9E9E] ml-2 capitalize">
                          {payment.status}
                        </Text>
                      </View>
                      <Text className="text-base font-medium">
                        {payment.description}
                      </Text>
                      <Text className="text-sm text-[#9E9E9E]">
                        {payment.date}
                      </Text>
                    </View>
                    <Text
                      className={`text-base font-semibold ${getStatusColor(payment.status)}`}
                    >
                      ${Math.abs(payment.amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Add Card Modal */}
          <Modal
            visible={showAddCardModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddCardModal(false)}
          >
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl p-6">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-[#2D3142]">
                    Add New Card
                  </Text>
                  <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="gap-4">
                    <View>
                      <Text className="text-sm font-medium text-[#2D3142] mb-2">
                        Card Number
                      </Text>
                      <TextInput
                        className="bg-gray-50 rounded-xl p-4 text-base"
                        placeholder="1234 5678 9012 3456"
                        keyboardType="numeric"
                        value={cardForm.cardNumber}
                        onChangeText={handleCardNumberChange}
                        maxLength={19}
                      />
                    </View>

                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-[#2D3142] mb-2">
                          Expiry Month
                        </Text>
                        <TextInput
                          className="bg-gray-50 rounded-xl p-4 text-base"
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
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-[#2D3142] mb-2">
                          Expiry Year
                        </Text>
                        <TextInput
                          className="bg-gray-50 rounded-xl p-4 text-base"
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
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-[#2D3142] mb-2">
                        CVV
                      </Text>
                      <TextInput
                        className="bg-gray-50 rounded-xl p-4 text-base"
                        placeholder="123"
                        keyboardType="numeric"
                        value={cardForm.cvv}
                        onChangeText={(text) =>
                          setCardForm((prev) => ({ ...prev, cvv: text }))
                        }
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>

                    <View>
                      <Text className="text-sm font-medium text-[#2D3142] mb-2">
                        Cardholder Name
                      </Text>
                      <TextInput
                        className="bg-gray-50 rounded-xl p-4 text-base"
                        placeholder="John Doe"
                        value={cardForm.cardholderName}
                        onChangeText={(text) =>
                          setCardForm((prev) => ({
                            ...prev,
                            cardholderName: text,
                          }))
                        }
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-[#4461F2] py-4 rounded-xl mt-6 mb-4"
                    onPress={handleAddCard}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-center font-semibold text-base">
                        Add Card
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}
