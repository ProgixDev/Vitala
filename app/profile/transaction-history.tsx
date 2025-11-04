import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Transaction {
  id: string;
  type: "payment" | "refund" | "booking";
  service: string;
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "payment",
    service: "Emergency Ambulance Service",
    amount: "$150.00",
    date: "Dec 15, 2024",
    status: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "2",
    type: "booking",
    service: "Medical Consultation",
    amount: "$80.00",
    date: "Dec 12, 2024",
    status: "completed",
    paymentMethod: "PayPal",
  },
  {
    id: "3",
    type: "payment",
    service: "Health Checkup",
    amount: "$120.00",
    date: "Dec 10, 2024",
    status: "pending",
    paymentMethod: "Credit Card",
  },
  {
    id: "4",
    type: "refund",
    service: "Cancelled Appointment",
    amount: "$80.00",
    date: "Dec 8, 2024",
    status: "completed",
    paymentMethod: "Credit Card",
  },
  {
    id: "5",
    type: "payment",
    service: "Prescription Medicine",
    amount: "$45.00",
    date: "Dec 5, 2024",
    status: "completed",
    paymentMethod: "Debit Card",
  },
  {
    id: "6",
    type: "booking",
    service: "Lab Test",
    amount: "$95.00",
    date: "Dec 3, 2024",
    status: "failed",
    paymentMethod: "Credit Card",
  },
  {
    id: "7",
    type: "payment",
    service: "Physical Therapy",
    amount: "$110.00",
    date: "Dec 1, 2024",
    status: "completed",
    paymentMethod: "PayPal",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#10B981";
    case "pending":
      return "#F59E0B";
    case "failed":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};

const getStatusBgColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#D1FAE5";
    case "pending":
      return "#FEF3C7";
    case "failed":
      return "#FEE2E2";
    default:
      return "#F3F4F6";
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "payment":
      return "card-outline";
    case "refund":
      return "arrow-back-circle-outline";
    case "booking":
      return "calendar-outline";
    default:
      return "receipt-outline";
  }
};

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const statusColor = getStatusColor(transaction.status);
  const statusBgColor = getStatusBgColor(transaction.status);
  const iconName = getTransactionIcon(transaction.type);
  const isRefund = transaction.type === "refund";

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
            isRefund ? "bg-[#FEE2E2]" : "bg-[#F0F2FF]"
          }`}
        >
          <Ionicons
            name={iconName as keyof typeof Ionicons.glyphMap}
            size={24}
            color={isRefund ? "#EF4444" : "#4461F2"}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-[#1F2937] mb-1">
            {transaction.service}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-[13px] text-[#6B7280]">
              {transaction.paymentMethod}
            </Text>
            <Text className="text-[13px] text-[#9CA3AF] mx-1.5">•</Text>
            <Text className="text-[13px] text-[#6B7280]">
              {transaction.date}
            </Text>
          </View>
        </View>
      </View>
      <View className="items-end">
        <Text
          className={`text-base font-bold mb-1.5 ${
            isRefund ? "text-[#10B981]" : "text-[#1F2937]"
          }`}
        >
          {isRefund ? "+" : "-"}
          {transaction.amount}
        </Text>
        <View
          className="px-2.5 py-1 rounded-xl"
          style={{ backgroundColor: statusBgColor }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: statusColor }}
          >
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TransactionHistory() {
  const [transactions] = useState(mockTransactions);
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

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

  const filteredTransactions = transactions.filter((trans) =>
    filter === "all" ? true : trans.status === filter,
  );

  const totalSpent = transactions
    .filter((t) => t.type !== "refund" && t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace("$", "")), 0);

  const totalRefunds = transactions
    .filter((t) => t.type === "refund" && t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace("$", "")), 0);

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
        <Text className="text-lg font-semibold text-[#1F2937]">
          Transaction History
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => console.log("Filter")}
        >
          <Ionicons name="funnel-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View className="flex-row px-6 py-5 gap-3">
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <View className="w-10 h-10 rounded-[10px] bg-[#FEE2E2] items-center justify-center mb-3">
            <Ionicons name="trending-down" size={24} color="#EF4444" />
          </View>
          <Text className="text-[13px] text-[#6B7280] mb-1">Total Spent</Text>
          <Text className="text-xl font-bold text-[#1F2937]">
            ${totalSpent.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
          <View className="w-10 h-10 rounded-[10px] bg-[#D1FAE5] items-center justify-center mb-3">
            <Ionicons name="trending-up" size={24} color="#10B981" />
          </View>
          <Text className="text-[13px] text-[#6B7280] mb-1">Total Refunds</Text>
          <Text className="text-xl font-bold text-[#10B981]">
            ${totalRefunds.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-6 gap-3 mb-4">
        <TouchableOpacity
          className={`flex-1 py-2.5 px-4 rounded-[10px] items-center border ${
            filter === "all"
              ? "bg-[#4461F2] border-[#4461F2]"
              : "bg-white border-[#E5E7EB]"
          }`}
          onPress={() => setFilter("all")}
        >
          <Text
            className={`text-sm font-medium ${
              filter === "all" ? "text-white" : "text-[#6B7280]"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 px-4 rounded-[10px] items-center border ${
            filter === "completed"
              ? "bg-[#4461F2] border-[#4461F2]"
              : "bg-white border-[#E5E7EB]"
          }`}
          onPress={() => setFilter("completed")}
        >
          <Text
            className={`text-sm font-medium ${
              filter === "completed" ? "text-white" : "text-[#6B7280]"
            }`}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2.5 px-4 rounded-[10px] items-center border ${
            filter === "pending"
              ? "bg-[#4461F2] border-[#4461F2]"
              : "bg-white border-[#E5E7EB]"
          }`}
          onPress={() => setFilter("pending")}
        >
          <Text
            className={`text-sm font-medium ${
              filter === "pending" ? "text-white" : "text-[#6B7280]"
            }`}
          >
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-12">
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-[#1F2937] mt-4 mb-2">
            No Transactions
          </Text>
          <Text className="text-sm text-[#6B7280] text-center leading-5">
            You don&apos;t have any {filter !== "all" ? filter : ""}{" "}
            transactions yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => console.log("Transaction details:", item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
