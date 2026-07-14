import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  BadgeTone,
  Card,
  Chip,
  EmptyState,
  Header,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { BackHandler, FlatList, View } from "react-native";
import Toast from "react-native-toast-message";

const tabular = { fontVariant: ["tabular-nums" as const] };

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

const getStatusTone = (status: string): BadgeTone => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "emergency";
    case "cancelled":
      return "neutral";
    default:
      return "neutral";
  }
};

const getTransactionIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "payment":
      return "card-outline";
    case "refund":
      return "arrow-undo-outline";
    case "booking":
      return "calendar-outline";
    default:
      return "receipt-outline";
  }
};

const STATUS_FILTERS: {
  value: "all" | "completed" | "pending" | "failed" | "cancelled";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

interface TransactionItemProps {
  transaction: Transaction;
  onPress: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const colors = useThemeColors();
  const iconName = getTransactionIcon(transaction.type);
  const isRefund = transaction.type === "refund";

  return (
    <Card onPress={onPress} elevation="e1" className="mb-3 flex-row items-center">
      <View className="flex-row items-center flex-1">
        <View
          className={`w-12 h-12 rounded-lg items-center justify-center mr-3 ${
            isRefund ? "bg-accent-soft" : "bg-primary-soft"
          }`}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={isRefund ? colors.accent : colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text variant="body" weight="semibold" color="foreground">
            {transaction.service}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text variant="caption" color="muted">
              {transaction.paymentMethod}
            </Text>
            <Text variant="caption" color="muted" className="mx-1.5">
              •
            </Text>
            <Text variant="caption" color="muted">
              {transaction.date}
            </Text>
          </View>
          <View className="mt-2">
            <Badge
              label={transaction.status}
              tone={getStatusTone(transaction.status)}
            />
          </View>
        </View>
      </View>
      <View className="items-end ml-2">
        <Text
          variant="bodyLg"
          weight="headingBold"
          color={isRefund ? "accent" : "foreground"}
          style={tabular}
        >
          {isRefund ? "+" : "-"}
          {transaction.currency === "USD" ? "$" : "€"}
          {transaction.amount.toFixed(2)}
        </Text>
      </View>
    </Card>
  );
};

export default function TransactionHistory() {
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
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

  // Fetch on mount and when filter changes
  useEffect(() => {
    const fetchTransactions = async () => {
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
    };

    fetchTransactions();
  }, [currentUser?.token]);

  const handleTransactionPress = (transactionId: string) => {
    // Navigate to payment details if appointmentId exists
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction?.appointmentId) {
      router.push(`/appointment/${transaction.appointmentId}/payment`);
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

  const currencySymbol = statistics.currency === "USD" ? "$" : "€";

  return (
    <Screen padded={false} edges={["top"]}>
      <View className="px-5">
        <Header title="Transaction History" showBack onBack={() => router.back()} />
      </View>

      {loading ? (
        <View className="px-5 pt-4">
          <SkeletonList count={6} itemHeight={84} />
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View className="flex-row px-5 py-4 gap-3">
            <Card elevation="e1" className="flex-1">
              <View className="w-10 h-10 rounded-lg bg-primary-soft items-center justify-center mb-3">
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
              </View>
              <Text variant="caption" color="muted" className="mb-1">
                Total Spent
              </Text>
              <Text variant="h3" weight="headingBold" color="foreground" style={tabular}>
                {currencySymbol}
                {statistics.totalSpent.toFixed(2)}
              </Text>
            </Card>
            <Card elevation="e1" className="flex-1">
              <View className="w-10 h-10 rounded-lg bg-accent-soft items-center justify-center mb-3">
                <Ionicons name="arrow-undo-outline" size={20} color={colors.accent} />
              </View>
              <Text variant="caption" color="muted" className="mb-1">
                Total Refunds
              </Text>
              <Text variant="h3" weight="headingBold" color="accent" style={tabular}>
                {currencySymbol}
                {statistics.totalRefunds.toFixed(2)}
              </Text>
            </Card>
          </View>

          {/* Filter Tabs */}
          <View className="px-5 mb-3">
            <Text variant="caption" weight="semibold" color="muted" className="mb-2">
              Transaction Status
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  label={f.label}
                  selected={filter === f.value}
                  onPress={() => setFilter(f.value)}
                />
              ))}
            </View>

            {/* Results Count & Clear Filters */}
            {filter !== "all" && (
              <View className="flex-row items-center justify-between mt-3">
                <Text variant="caption" color="muted">
                  Showing {filteredTransactions.length} result
                  {filteredTransactions.length !== 1 ? "s" : ""}
                </Text>
                <Text
                  variant="caption"
                  weight="semibold"
                  color="primary"
                  onPress={() => setFilter("all")}
                >
                  Clear Filters
                </Text>
              </View>
            )}
          </View>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions"
              message={`You don't have any ${
                filter !== "all" ? filter : ""
              } transactions yet`}
            />
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
                paddingHorizontal: 20,
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </Screen>
  );
}
