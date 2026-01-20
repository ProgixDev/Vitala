import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      console.log("Current user available, fetching contacts...");
      fetchContacts();
    } else {
      console.log("No current user, setting loading to false");
      setLoading(false);
    }
  }, [currentUser]);

  const fetchContacts = async () => {
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
  };

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
          } catch (error) {
            Alert.alert("Error", "Failed to delete contact");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F9FAFB] justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-[#1F2937]">
          Emergency Contacts
        </Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.push("/profile/add-emergency-contact")}
        >
          <Ionicons name="add" size={28} color="#4461F2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-6">
          {contacts.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <View className="w-16 h-16 bg-[#F3F4F6] rounded-full items-center justify-center mb-4">
                <Ionicons name="people-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-[#1F2937] font-semibold text-lg mb-2">
                No Emergency Contacts
              </Text>
              <Text className="text-[#6B7280] text-center text-sm">
                Add family members or friends who should be contacted in case of
                emergency
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <TouchableOpacity
                key={contact._id}
                onPress={() =>
                  router.push(`/profile/edit-emergency-contact/${contact._id}`)
                }
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-[17px] font-semibold text-[#1F2937]">
                        {contact.name}
                      </Text>
                      {contact.isPrimary && (
                        <View className="bg-[#EEF2FF] px-2 py-1 rounded-md ml-2">
                          <Text className="text-[#4461F2] text-xs font-medium">
                            Primary
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[#6B7280] text-sm capitalize mb-1">
                      {contact.relationship}
                    </Text>
                    <Text className="text-[#1F2937] text-[15px] mb-1">
                      {contact.phoneNumber}
                    </Text>
                    {contact.email && (
                      <Text className="text-[#6B7280] text-sm">
                        {contact.email}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteContact(contact._id, contact.name)}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
