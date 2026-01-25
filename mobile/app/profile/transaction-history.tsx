import LoadingScreen from "@/components/LoadingScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface Transaction {
  id: string;
  type: "payment" | "refund";
  service: string;
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  paymentMethod: string;
  receiptNumber?: string;
  appointmentId?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#10B981";
    case "pending":
      return "#F59E0B";
    case "failed":
      return "#EF4444";
    case "cancelled":
      return "#6B7280";
    default:
      return "#6B7280";
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
            color={statusColor}
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
          {transaction.currency === "USD" ? "$" : "€"}
          {transaction.amount.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function TransactionHistory() {
  const { currentUser } = useCurrentUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "pending" | "failed" | "cancelled"
  >("all");
  const [statistics, setStatistics] = useState<{
    totalSpent: number;
    totalRefunds: number;
    currency: string;
  }>({
    totalSpent: 0,
    totalRefunds: 0,
    currency: "USD",
  });

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    try {
      if (!currentUser?.token) {
        return;
      }

      // Fetch transactions with filter
      const result = await api.getTransactions(currentUser.token);

      if (result.success && result.data) {
        // Format transactions for display
        const formattedTransactions = result.data.map((trans: any) => ({
          ...trans,
          date: new Date(trans.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));
        setTransactions(formattedTransactions);

        // Fetch statistics
        const statsResult = await api.getUserStatistics(currentUser.token);
        if (statsResult.success) {
          setStatistics({
            totalSpent: statsResult.data.totalSpent,
            totalRefunds: statsResult.data.totalRefunds,
            currency: statsResult.data.currency,
          });
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load transactions",
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load transactions",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token]);

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions]),
  );

  const handleTransactionPress = (transactionId: string) => {
    // Navigate to appointment details if appointmentId exists
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction?.appointmentId) {
      router.push(`/appointment/${transaction.appointmentId}/status`);
    } else {
      Toast.show({
        type: "info",
        text1: "Transaction Details",
        text2: `Receipt: ${transaction?.receiptNumber || "N/A"}`,
      });
    }
  };

  // Handle back button - go back to profile page
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      },
    );

    return () => backHandler.remove();
  }, []);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((transaction) => transaction.status === filter);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <LoadingScreen visible={loading} />
      {!loading && (
        <>
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-15 pb-4 bg-white border-b border-[#F3F4F6]">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-[#1F2937]">
              Transaction History
            </Text>
            <View className="w-10 h-10 items-center justify-center">
              <Ionicons name="receipt-outline" size={24} color="#1F2937" />
            </View>
          </View>

          {/* Summary Cards */}
          <View className="flex-row px-6 py-5 gap-3">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <View className="w-10 h-10 rounded-[10px] bg-[#FEE2E2] items-center justify-center mb-3">
                <Ionicons name="trending-down" size={24} color="#EF4444" />
              </View>
              <Text className="text-[13px] text-[#6B7280] mb-1">
                Total Spent
              </Text>
              <Text className="text-xl font-bold text-[#1F2937]">
                {statistics.currency === "USD" ? "$" : "€"}
                {statistics.totalSpent.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
              <View className="w-10 h-10 rounded-[10px] bg-[#D1FAE5] items-center justify-center mb-3">
                <Ionicons name="trending-up" size={24} color="#10B981" />
              </View>
              <Text className="text-[13px] text-[#6B7280] mb-1">
                Total Refunds
              </Text>
              <Text className="text-xl font-bold text-[#10B981]">
                {statistics.currency === "USD" ? "$" : "€"}
                {statistics.totalRefunds.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <View className="px-6 mb-4">
            <Text className="text-xs font-semibold text-[#6B7280] mb-2 px-1">
              Transaction Status
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              <TouchableOpacity
                className={`px-4 py-2 rounded-full ${
                  filter === "all"
                    ? "bg-[#4461F2]"
                    : "bg-white border border-gray-200"
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
                className={`px-4 py-2 rounded-full ${
                  filter === "completed"
                    ? "bg-[#32CD32]"
                    : "bg-white border border-gray-200"
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
                className={`px-4 py-2 rounded-full ${
                  filter === "pending"
                    ? "bg-[#FFA500]"
                    : "bg-white border border-gray-200"
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
              <TouchableOpacity
                className={`px-4 py-2 rounded-full ${
                  filter === "failed"
                    ? "bg-[#FF3B30]"
                    : "bg-white border border-gray-200"
                }`}
                onPress={() => setFilter("failed")}
              >
                <Text
                  className={`text-sm font-medium ${
                    filter === "failed" ? "text-white" : "text-[#6B7280]"
                  }`}
                >
                  Failed
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-4 py-2 rounded-full ${
                  filter === "cancelled"
                    ? "bg-[#6B7280]"
                    : "bg-white border border-gray-200"
                }`}
                onPress={() => setFilter("cancelled")}
              >
                <Text
                  className={`text-sm font-medium ${
                    filter === "cancelled" ? "text-white" : "text-[#6B7280]"
                  }`}
                >
                  Cancelled
                </Text>
              </TouchableOpacity>
            </View>

            {/* Results Count & Clear Filters */}
            {filter !== "all" && (
              <View className="flex-row items-center justify-between mt-3 px-1">
                <Text className="text-xs text-[#6B7280]">
                  Showing {filteredTransactions.length} result
                  {filteredTransactions.length !== 1 ? "s" : ""}
                </Text>
                <TouchableOpacity onPress={() => setFilter("all")}>
                  <Text className="text-xs font-semibold text-[#4461F2]">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
                  onPress={() => handleTransactionPress(item.id)}
                />
              )}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
}
