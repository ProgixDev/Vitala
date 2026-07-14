import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  updateMedicalProfile,
  updateProfile,
  uploadProfilePicture,
} from "@/utils/api";

import {
  Badge,
  Card,
  Divider,
  EmptyState,
  Header,
  IconButton,
  Input,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function MyProfile() {
  const { currentUser, loading, refreshUser } = useCurrentUser();
  const colors = useThemeColors();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera roll permissions are required to select a profile picture.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      "Select Image",
      "Choose an option to select your profile picture",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permissions are required to take a photo.",
        [{ text: "OK" }],
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      Toast.show({
        type: "info",
        text1: "Processing Image...",
        text2: "Please wait while we upload your photo",
      });
      await uploadImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      Toast.show({
        type: "info",
        text1: "Processing Image...",
        text2: "Please wait while we upload your photo",
      });
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!currentUser?.token) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "Please log in again",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      // Use the same approach as nurse signup (uri, name, type object)
      formData.append("profilePicture", {
        uri: asset.uri,
        type: asset.type === "image" ? "image/jpeg" : "image/jpeg",
        name: `profile-picture-${Date.now()}.jpg`,
      } as any);

      await uploadProfilePicture(currentUser.token, formData);

      await refreshUser();

      Toast.show({
        type: "success",
        text1: "Profile Picture Updated",
        text2: "Your profile picture has been updated successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.message || "Failed to upload profile picture",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const startEditing = () => {
    setEditedUser({
      ...currentUser,
      medicalProfile: currentUser?.medicalProfile
        ? {
            ...currentUser.medicalProfile,
            allergies: currentUser.medicalProfile.allergies || [],
            chronicIllnesses: currentUser.medicalProfile.chronicIllnesses || [],
          }
        : {
            allergies: [],
            chronicIllnesses: [],
          },
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedUser(null);
  };

  const saveProfile = async () => {
    if (!editedUser) return;

    if (!currentUser?.token) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "Please log in again",
      });
      return;
    }

    setSaving(true);
    try {
      // Update basic profile
      const profileData = {
        fullName: editedUser.fullName,
        email: editedUser.email,
        phoneNumber: editedUser.phoneNumber,
      };
      await updateProfile(currentUser.token, profileData);

      // Update medical profile if it exists
      if (editedUser.medicalProfile) {
        await updateMedicalProfile(
          currentUser.token,
          editedUser.medicalProfile,
        );
      }

      await refreshUser();
      setIsEditing(false);
      setEditedUser(null);

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error("Save error:", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: error.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  // Reusable row with an icon medallion, label and content (value or field).
  const InfoRow = ({
    icon,
    label,
    align = "center",
    children,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    align?: "center" | "start";
    children: React.ReactNode;
  }) => (
    <View
      className={`flex-row ${align === "start" ? "items-start" : "items-center"}`}
    >
      <View className="w-11 h-11 rounded-xl bg-primary-soft items-center justify-center mr-4">
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text variant="caption" color="muted" className="mb-1">
          {label}
        </Text>
        {children}
      </View>
    </View>
  );

  // Show loading with same header so user never sees "No user data" flash
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="px-5">
          <Header
            title="My Profile"
            onBack={() => router.replace("/(tabs)/profile")}
          />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color="muted" className="mt-3">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="px-5">
          <Header
            title="My Profile"
            onBack={() => router.replace("/(tabs)/profile")}
          />
        </View>
        <View className="flex-1 items-center justify-center">
          <EmptyState
            icon="person-outline"
            title="No user data available"
            message="We couldn't load your profile."
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5">
        <Header
          title="My Profile"
          onBack={() => router.replace("/(tabs)/profile")}
          right={
            isEditing ? (
              <View className="flex-row">
                <IconButton
                  icon="close"
                  onPress={() => {
                    if (!saving) cancelEditing();
                  }}
                  color={colors.emergency}
                  accessibilityLabel="Cancel editing"
                  className="mr-1"
                />
                <IconButton
                  icon={saving ? "hourglass" : "checkmark"}
                  onPress={() => {
                    if (!saving) saveProfile();
                  }}
                  color={colors.success}
                  accessibilityLabel="Save changes"
                />
              </View>
            ) : (
              <IconButton
                icon="create-outline"
                onPress={startEditing}
                color={colors.primary}
                accessibilityLabel="Edit profile"
              />
            )
          }
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View className="items-center py-8">
          <View className="relative">
            <View
              className="w-25 h-25 rounded-full bg-primary-soft items-center justify-center overflow-hidden"
              style={{ borderWidth: 4, borderColor: colors.primarySoft }}
            >
              {currentUser?.profilePicture ? (
                <TouchableOpacity
                  className="w-full h-full"
                  onPress={() => {
                    Toast.show({
                      type: "info",
                      text1: "Change Profile Picture",
                      text2: "Tap the camera icon to update your photo",
                    });
                  }}
                >
                  <Image
                    source={{ uri: currentUser.profilePicture }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="w-full h-full items-center justify-center"
                  onPress={() => {
                    Toast.show({
                      type: "info",
                      text1: "Add Profile Picture",
                      text2: "Tap the camera icon to add your photo",
                    });
                  }}
                >
                  <Ionicons name="person" size={50} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary items-center justify-center"
              style={{ borderWidth: 3, borderColor: colors.surface }}
              onPress={pickImage}
              disabled={uploadingImage}
            >
              <Ionicons
                name={uploadingImage ? "hourglass" : "camera"}
                size={18}
                color={colors.onPrimary}
              />
            </TouchableOpacity>
          </View>
          {uploadingImage && (
            <Text variant="caption" color="muted" className="mt-2">
              Uploading...
            </Text>
          )}
        </View>

        {/* Personal Information */}
        <View className="px-5 mb-6">
          <Text variant="h3" color="foreground" className="mb-3">
            Personal Information
          </Text>

          <Card elevation="e1" className="p-5">
            <InfoRow icon="person-outline" label="Full Name">
              {isEditing ? (
                <Input
                  value={editedUser?.fullName || ""}
                  onChangeText={(text) =>
                    setEditedUser({ ...editedUser, fullName: text })
                  }
                  placeholder="Enter full name"
                  containerClassName="mt-1"
                />
              ) : (
                <Text variant="bodyLg" weight="semibold" color="foreground">
                  {currentUser.fullName}
                </Text>
              )}
            </InfoRow>

            <Divider className="my-4" />

            <InfoRow icon="mail-outline" label="Email">
              {isEditing ? (
                <Input
                  value={editedUser?.email || ""}
                  onChangeText={(text) =>
                    setEditedUser({ ...editedUser, email: text })
                  }
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerClassName="mt-1"
                />
              ) : (
                <Text variant="bodyLg" weight="semibold" color="foreground">
                  {currentUser.email}
                </Text>
              )}
            </InfoRow>

            <Divider className="my-4" />

            <InfoRow icon="call-outline" label="Phone Number">
              {isEditing ? (
                <Input
                  value={editedUser?.phoneNumber || ""}
                  onChangeText={(text) =>
                    setEditedUser({ ...editedUser, phoneNumber: text })
                  }
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  containerClassName="mt-1"
                />
              ) : (
                <Text variant="bodyLg" weight="semibold" color="foreground">
                  {currentUser.phoneNumber}
                </Text>
              )}
            </InfoRow>
          </Card>
        </View>

        {/* Medical Information */}
        {currentUser.userType === "patient" && currentUser.medicalProfile && (
          <View className="px-5 mb-6">
            <Text variant="h3" color="foreground" className="mb-3">
              Medical Information
            </Text>

            <Card elevation="e1" className="p-5">
              {/* Gender */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing && currentUser.medicalProfile?.gender)) && (
                <>
                  <InfoRow icon="male-female-outline" label="Gender">
                    {isEditing ? (
                      <Input
                        value={editedUser?.medicalProfile?.gender || ""}
                        onChangeText={(text) =>
                          setEditedUser({
                            ...editedUser,
                            medicalProfile: {
                              ...editedUser.medicalProfile,
                              gender: text,
                            },
                          })
                        }
                        placeholder="Enter gender"
                        containerClassName="mt-1"
                      />
                    ) : (
                      <Text
                        variant="bodyLg"
                        weight="semibold"
                        color="foreground"
                        className="capitalize"
                      >
                        {currentUser.medicalProfile.gender}
                      </Text>
                    )}
                  </InfoRow>
                  <Divider className="my-4" />
                </>
              )}

              {/* Date of Birth */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing && currentUser.medicalProfile?.dateOfBirth)) && (
                <>
                  <InfoRow icon="calendar-outline" label="Date of Birth">
                    {isEditing ? (
                      <Input
                        value={editedUser?.medicalProfile?.dateOfBirth || ""}
                        onChangeText={(text) =>
                          setEditedUser({
                            ...editedUser,
                            medicalProfile: {
                              ...editedUser.medicalProfile,
                              dateOfBirth: text,
                            },
                          })
                        }
                        placeholder="YYYY-MM-DD"
                        containerClassName="mt-1"
                      />
                    ) : (
                      <Text
                        variant="bodyLg"
                        weight="semibold"
                        color="foreground"
                      >
                        {currentUser.medicalProfile.dateOfBirth?.split("T")[0]}
                      </Text>
                    )}
                  </InfoRow>
                  <Divider className="my-4" />
                </>
              )}

              {/* Blood Type */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing && currentUser.medicalProfile?.bloodType)) && (
                <>
                  <InfoRow icon="water" label="Blood Type">
                    {isEditing ? (
                      <Input
                        value={editedUser?.medicalProfile?.bloodType || ""}
                        onChangeText={(text) =>
                          setEditedUser({
                            ...editedUser,
                            medicalProfile: {
                              ...editedUser.medicalProfile,
                              bloodType: text,
                            },
                          })
                        }
                        placeholder="Enter blood type"
                        containerClassName="mt-1"
                      />
                    ) : (
                      <Text
                        variant="bodyLg"
                        weight="semibold"
                        color="foreground"
                      >
                        {currentUser.medicalProfile.bloodType}
                      </Text>
                    )}
                  </InfoRow>
                  <Divider className="my-4" />
                </>
              )}

              {/* Height & Weight */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing &&
                  (currentUser.medicalProfile?.height ||
                    currentUser.medicalProfile?.weight))) && (
                <>
                  <InfoRow icon="resize-outline" label="Measurements">
                    <View className="flex-row justify-between">
                      {((isEditing && editedUser?.medicalProfile) ||
                        (!isEditing && currentUser.medicalProfile?.height)) && (
                        <View className={isEditing ? "flex-1 mr-4" : "mr-6"}>
                          <Text variant="caption" color="muted" className="mb-1">
                            Height
                          </Text>
                          {isEditing ? (
                            <Input
                              value={
                                editedUser?.medicalProfile?.height?.toString() ||
                                ""
                              }
                              onChangeText={(text) =>
                                setEditedUser({
                                  ...editedUser,
                                  medicalProfile: {
                                    ...editedUser.medicalProfile,
                                    height: text ? parseInt(text) : undefined,
                                  },
                                })
                              }
                              placeholder="Height in cm"
                              keyboardType="numeric"
                            />
                          ) : (
                            <Text
                              variant="bodyLg"
                              weight="semibold"
                              color="foreground"
                            >
                              {currentUser.medicalProfile.height} cm
                            </Text>
                          )}
                        </View>
                      )}
                      {((isEditing && editedUser?.medicalProfile) ||
                        (!isEditing && currentUser.medicalProfile?.weight)) && (
                        <View className={isEditing ? "flex-1" : ""}>
                          <Text variant="caption" color="muted" className="mb-1">
                            Weight
                          </Text>
                          {isEditing ? (
                            <Input
                              value={
                                editedUser?.medicalProfile?.weight?.toString() ||
                                ""
                              }
                              onChangeText={(text) =>
                                setEditedUser({
                                  ...editedUser,
                                  medicalProfile: {
                                    ...editedUser.medicalProfile,
                                    weight: text ? parseInt(text) : undefined,
                                  },
                                })
                              }
                              placeholder="Weight in kg"
                              keyboardType="numeric"
                            />
                          ) : (
                            <Text
                              variant="bodyLg"
                              weight="semibold"
                              color="foreground"
                            >
                              {currentUser.medicalProfile.weight} kg
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </InfoRow>
                  <Divider className="my-4" />
                </>
              )}

              {/* Allergies */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing &&
                  currentUser.medicalProfile?.allergies &&
                  currentUser.medicalProfile.allergies.length > 0)) && (
                <>
                  <InfoRow icon="warning-outline" label="Allergies" align="start">
                    {isEditing ? (
                      <Input
                        value={
                          editedUser?.medicalProfile?.allergies?.join(", ") || ""
                        }
                        onChangeText={(text) =>
                          setEditedUser({
                            ...editedUser,
                            medicalProfile: {
                              ...editedUser.medicalProfile,
                              allergies: text
                                ? text
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter((s) => s)
                                : [],
                            },
                          })
                        }
                        placeholder="Enter allergies separated by commas"
                        containerClassName="mt-1"
                      />
                    ) : (
                      <View className="flex-row flex-wrap gap-2 mt-1">
                        {currentUser.medicalProfile.allergies.map(
                          (allergy, index) => (
                            <Badge key={index} tone="warning" label={allergy} />
                          ),
                        )}
                      </View>
                    )}
                  </InfoRow>
                  <Divider className="my-4" />
                </>
              )}

              {/* Chronic Illnesses */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing &&
                  currentUser.medicalProfile?.chronicIllnesses &&
                  currentUser.medicalProfile.chronicIllnesses.length > 0)) && (
                <InfoRow
                  icon="medical-outline"
                  label="Chronic Conditions"
                  align="start"
                >
                  {isEditing ? (
                    <Input
                      value={
                        editedUser?.medicalProfile?.chronicIllnesses?.join(
                          ", ",
                        ) || ""
                      }
                      onChangeText={(text) =>
                        setEditedUser({
                          ...editedUser,
                          medicalProfile: {
                            ...editedUser.medicalProfile,
                            chronicIllnesses: text
                              ? text
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter((s) => s)
                              : [],
                          },
                        })
                      }
                      placeholder="Enter chronic conditions separated by commas"
                      containerClassName="mt-1"
                    />
                  ) : (
                    <View className="flex-row flex-wrap gap-2 mt-1">
                      {currentUser.medicalProfile.chronicIllnesses.map(
                        (illness, index) => (
                          <Badge key={index} tone="primary" label={illness} />
                        ),
                      )}
                    </View>
                  )}
                </InfoRow>
              )}
            </Card>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-5">
          <Card
            onPress={() => router.push("/profile/change-password")}
            elevation="e1"
            padded={false}
            className="flex-row items-center p-4 mb-3"
          >
            <Ionicons name="key-outline" size={22} color={colors.primary} />
            <Text
              variant="body"
              weight="medium"
              color="foreground"
              className="flex-1 ml-3"
            >
              Change Password
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </Card>

          <Card
            onPress={() => router.push("/profile/privacy-settings")}
            elevation="e1"
            padded={false}
            className="flex-row items-center p-4 mb-3"
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color={colors.primary}
            />
            <Text
              variant="body"
              weight="medium"
              color="foreground"
              className="flex-1 ml-3"
            >
              Privacy Settings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
