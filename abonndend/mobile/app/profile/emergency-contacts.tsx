import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Badge,
  Card,
  EmptyState,
  Header,
  IconButton,
  Screen,
  SkeletonList,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

interface EmergencyContact {
  _id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
  address?: string;
  notes?: string;
}

export default function EmergencyContacts() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const colors = useThemeColors();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!currentUser?.token) {
      setLoading(false);
      return;
    }
    try {
      const response = (await api.getEmergencyContacts(currentUser.token)) as {
        data: EmergencyContact[];
      };
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      Alert.alert("Error", "Failed to load emergency contacts");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      console.log("Current user available, fetching contacts...");
      fetchContacts();
    } else {
      console.log("No current user, setting loading to false");
      setLoading(false);
    }
  }, [currentUser, fetchContacts]);

  const deleteContact = async (contactId: string, name: string) => {
    Alert.alert("Delete Contact", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!currentUser?.token) return;
          try {
            await api.deleteEmergencyContact(currentUser.token, contactId);
            setContacts(contacts.filter((c) => c._id !== contactId));
          } catch {
            Alert.alert("Error", "Failed to delete contact");
          }
        },
      },
    ]);
  };

  return (
    <Screen padded={false} edges={["top"]}>
      <View className="px-5">
        <Header
          title="Emergency Contacts"
          showBack
          onBack={() => router.back()}
          rightIcon="add"
          onRightPress={() => router.push("/profile/add-emergency-contact")}
          rightLabel="Add contact"
        />
      </View>

      {loading ? (
        <View className="px-5 pt-4">
          <SkeletonList count={4} itemHeight={112} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-2">
            {contacts.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No emergency contacts"
                message="Add family members or friends who should be contacted in case of emergency"
                actionLabel="Add contact"
                onAction={() => router.push("/profile/add-emergency-contact")}
              />
            ) : (
              contacts.map((contact) => (
                <Card
                  key={contact._id}
                  onPress={() =>
                    router.push(
                      `/profile/edit-emergency-contact/${contact._id}`,
                    )
                  }
                  elevation="e1"
                  className="mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        <Text variant="h3" color="foreground">
                          {contact.name}
                        </Text>
                        {contact.isPrimary && (
                          <Badge
                            label="Primary"
                            tone="primary"
                            icon="star"
                            className="ml-2"
                          />
                        )}
                      </View>
                      <Text
                        variant="label"
                        color="muted"
                        className="capitalize mb-2"
                      >
                        {contact.relationship}
                      </Text>
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="call-outline"
                          size={16}
                          color={colors.mutedForeground}
                          style={{ marginRight: 8 }}
                        />
                        <Text variant="body" color="foreground">
                          {contact.phoneNumber}
                        </Text>
                      </View>
                      {contact.email && (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="mail-outline"
                            size={16}
                            color={colors.mutedForeground}
                            style={{ marginRight: 8 }}
                          />
                          <Text variant="label" color="muted">
                            {contact.email}
                          </Text>
                        </View>
                      )}
                    </View>
                    <IconButton
                      icon="trash-outline"
                      color={colors.emergency}
                      accessibilityLabel={`Delete ${contact.name}`}
                      onPress={() => deleteContact(contact._id, contact.name)}
                    />
                  </View>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
