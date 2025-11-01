import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
      style={styles.transactionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isRefund ? "#FEE2E2" : "#F0F2FF" },
          ]}
        >
          <Ionicons
            name={iconName as keyof typeof Ionicons.glyphMap}
            size={24}
            color={isRefund ? "#EF4444" : "#4461F2"}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.serviceName}>{transaction.service}</Text>
          <View style={styles.transactionDetails}>
            <Text style={styles.paymentMethod}>
              {transaction.paymentMethod}
            </Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.date}>{transaction.date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[styles.amount, { color: isRefund ? "#10B981" : "#1F2937" }]}
        >
          {isRefund ? "+" : "-"}
          {transaction.amount}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => console.log("Filter")}
        >
          <Ionicons name="funnel-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="trending-down" size={24} color="#EF4444" />
          </View>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "#D1FAE5" },
            ]}
          >
            <Ionicons name="trending-up" size={24} color="#10B981" />
          </View>
          <Text style={styles.summaryLabel}>Total Refunds</Text>
          <Text style={[styles.summaryAmount, { color: "#10B981" }]}>
            ${totalRefunds.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeTab]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "completed" && styles.activeTab]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "pending" && styles.activeTab]}
          onPress={() => setFilter("pending")}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptyMessage}>
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  filterButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeTab: {
    backgroundColor: "#4461F2",
    borderColor: "#4461F2",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  transactionDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethod: {
    fontSize: 13,
    color: "#6B7280",
  },
  dot: {
    fontSize: 13,
    color: "#9CA3AF",
    marginHorizontal: 6,
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
