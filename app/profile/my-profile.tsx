import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  updateMedicalProfile,
  updateProfile,
  uploadProfilePicture,
} from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function MyProfile() {
  const { currentUser, refreshUser } = useCurrentUser();
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
    let token = currentUser?.token;

    // Fallback: get token from authStorage if not in currentUser
    if (!token) {
      try {
        const { accessToken } = await authStorage.getTokens();
        token = accessToken || undefined;
      } catch (error) {
        console.error("Error getting token from authStorage:", error);
      }
    }

    if (!token) {
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

      const response = await uploadProfilePicture(token, formData);

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

    let token = currentUser?.token;
    if (!token) {
      try {
        const { accessToken } = await authStorage.getTokens();
        token = accessToken || undefined;
      } catch (error) {
        console.error("Error getting token from authStorage:", error);
      }
    }

    if (!token) {
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
      await updateProfile(token, profileData);

      // Update medical profile if it exists
      if (editedUser.medicalProfile) {
        await updateMedicalProfile(token, editedUser.medicalProfile);
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

  if (!currentUser) {
    return (
      <View className="flex-1 bg-[#F9FAFB]">
        <View className="flex-row items-center justify-between px-4 pt-[60px] pb-4 bg-white border-b border-[#F3F4F6]">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#1F2937]">
            My Profile
          </Text>
          <View className="w-10 h-10" />
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-[#6B7280]">
            No user data available
          </Text>
        </View>
      </View>
    );
  }

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
        <Text className="text-lg font-semibold text-[#1F2937]">My Profile</Text>
        <View className="flex-row">
          {isEditing ? (
            <>
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center mr-2"
                onPress={cancelEditing}
                disabled={saving}
              >
                <Ionicons name="close" size={24} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                onPress={saveProfile}
                disabled={saving}
              >
                <Ionicons
                  name={saving ? "hourglass" : "checkmark"}
                  size={24}
                  color="#10B981"
                />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={startEditing}
            >
              <Ionicons name="create-outline" size={24} color="#4461F2" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View className="items-center py-8 bg-white mb-4">
          <View className="relative">
            <View className="w-[100px] h-[100px] rounded-full bg-[#EEF2FF] items-center justify-center border-4 border-[#E0E7FF] overflow-hidden">
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
                  <Ionicons name="person" size={50} color="#4461F2" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#4461F2] items-center justify-center border-3 border-white"
              onPress={pickImage}
              disabled={uploadingImage}
            >
              <Ionicons
                name={uploadingImage ? "hourglass" : "camera"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
          {uploadingImage && (
            <Text className="text-sm text-[#6B7280] mt-2">Uploading...</Text>
          )}
        </View>

        {/* Personal Information */}
        <View className="px-6 mb-6">
          <Text className="text-base font-semibold text-[#1F2937] mb-3">
            Personal Information
          </Text>

          <View className="bg-white rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                <Ionicons name="person-outline" size={22} color="#4461F2" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-[#6B7280] mb-1">
                  Full Name
                </Text>
                {isEditing ? (
                  <TextInput
                    className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
                    value={editedUser?.fullName || ""}
                    onChangeText={(text) =>
                      setEditedUser({ ...editedUser, fullName: text })
                    }
                    placeholder="Enter full name"
                  />
                ) : (
                  <Text className="text-base font-semibold text-[#1F2937]">
                    {currentUser.fullName}
                  </Text>
                )}
              </View>
            </View>

            <View className="h-px bg-[#F3F4F6] my-4" />

            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                <Ionicons name="mail-outline" size={22} color="#4461F2" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-[#6B7280] mb-1">Email</Text>
                {isEditing ? (
                  <TextInput
                    className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
                    value={editedUser?.email || ""}
                    onChangeText={(text) =>
                      setEditedUser({ ...editedUser, email: text })
                    }
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text className="text-base font-semibold text-[#1F2937]">
                    {currentUser.email}
                  </Text>
                )}
              </View>
            </View>

            <View className="h-px bg-[#F3F4F6] my-4" />

            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                <Ionicons name="call-outline" size={22} color="#4461F2" />
              </View>
              <View className="flex-1">
                <Text className="text-[13px] text-[#6B7280] mb-1">
                  Phone Number
                </Text>
                {isEditing ? (
                  <TextInput
                    className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
                    value={editedUser?.phoneNumber || ""}
                    onChangeText={(text) =>
                      setEditedUser({ ...editedUser, phoneNumber: text })
                    }
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text className="text-base font-semibold text-[#1F2937]">
                    {currentUser.phoneNumber}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        {currentUser.medicalProfile && (
          <View className="px-6 mb-6">
            <Text className="text-base font-semibold text-[#1F2937] mb-3">
              Medical Information
            </Text>

            <View className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Gender */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing && currentUser.medicalProfile?.gender)) && (
                <>
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                      <Ionicons
                        name="male-female-outline"
                        size={22}
                        color="#4461F2"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] text-[#6B7280] mb-1">
                        Gender
                      </Text>
                      {isEditing ? (
                        <TextInput
                          className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
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
                        />
                      ) : (
                        <Text className="text-base font-semibold text-[#1F2937] capitalize">
                          {currentUser.medicalProfile.gender}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="h-px bg-[#F3F4F6] my-4" />
                </>
              )}

              {/* Date of Birth */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing && currentUser.medicalProfile?.dateOfBirth)) && (
                <>
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                      <Ionicons
                        name="calendar-outline"
                        size={22}
                        color="#4461F2"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] text-[#6B7280] mb-1">
                        Date of Birth
                      </Text>
                      {isEditing ? (
                        <TextInput
                          className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
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
                        />
                      ) : (
                        <Text className="text-base font-semibold text-[#1F2937]">
                          {
                            currentUser.medicalProfile.dateOfBirth?.split(
                              "T",
                            )[0]
                          }
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="h-px bg-[#F3F4F6] my-4" />
                </>
              )}

              {/* Blood Type */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing && currentUser.medicalProfile?.bloodType)) && (
                <>
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                      <Ionicons name="water" size={22} color="#4461F2" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] text-[#6B7280] mb-1">
                        Blood Type
                      </Text>
                      {isEditing ? (
                        <TextInput
                          className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
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
                        />
                      ) : (
                        <Text className="text-base font-semibold text-[#1F2937]">
                          {currentUser.medicalProfile.bloodType}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="h-px bg-[#F3F4F6] my-4" />
                </>
              )}

              {/* Height & Weight */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing &&
                  (currentUser.medicalProfile?.height ||
                    currentUser.medicalProfile?.weight))) && (
                <>
                  <View className="flex-row items-center">
                    <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                      <Ionicons
                        name="resize-outline"
                        size={22}
                        color="#4461F2"
                      />
                    </View>
                    <View className="flex-1 flex-row justify-between">
                      {((isEditing && editedUser?.medicalProfile) ||
                        (!isEditing && currentUser.medicalProfile?.height)) && (
                        <View className={isEditing ? "flex-1 mr-4" : ""}>
                          <Text className="text-[13px] text-[#6B7280] mb-1">
                            Height
                          </Text>
                          {isEditing ? (
                            <TextInput
                              className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
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
                            <Text className="text-base font-semibold text-[#1F2937]">
                              {currentUser.medicalProfile.height} cm
                            </Text>
                          )}
                        </View>
                      )}
                      {((isEditing && editedUser?.medicalProfile) ||
                        (!isEditing && currentUser.medicalProfile?.weight)) && (
                        <View className={isEditing ? "flex-1" : ""}>
                          <Text className="text-[13px] text-[#6B7280] mb-1">
                            Weight
                          </Text>
                          {isEditing ? (
                            <TextInput
                              className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
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
                            <Text className="text-base font-semibold text-[#1F2937]">
                              {currentUser.medicalProfile.weight} kg
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="h-px bg-[#F3F4F6] my-4" />
                </>
              )}

              {/* Allergies */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing &&
                  currentUser.medicalProfile?.allergies &&
                  currentUser.medicalProfile.allergies.length > 0)) && (
                <>
                  <View className="flex-row items-start">
                    <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                      <Ionicons
                        name="warning-outline"
                        size={22}
                        color="#4461F2"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] text-[#6B7280] mb-2">
                        Allergies
                      </Text>
                      {isEditing ? (
                        <TextInput
                          className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
                          value={
                            editedUser?.medicalProfile?.allergies?.join(", ") ||
                            ""
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
                        />
                      ) : (
                        <View className="flex-row flex-wrap gap-2">
                          {currentUser.medicalProfile.allergies.map(
                            (allergy, index) => (
                              <View
                                key={index}
                                className="bg-[#FEF2F2] px-3 py-1.5 rounded-full border border-[#FEE2E2]"
                              >
                                <Text className="text-sm text-[#DC2626]">
                                  {allergy}
                                </Text>
                              </View>
                            ),
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="h-px bg-[#F3F4F6] my-4" />
                </>
              )}

              {/* Chronic Illnesses */}
              {((isEditing && editedUser?.medicalProfile) ||
                (!isEditing &&
                  currentUser.medicalProfile?.chronicIllnesses &&
                  currentUser.medicalProfile.chronicIllnesses.length > 0)) && (
                <View className="flex-row items-start">
                  <View className="w-11 h-11 rounded-xl bg-[#F0F2FF] items-center justify-center mr-4">
                    <Ionicons
                      name="medical-outline"
                      size={22}
                      color="#4461F2"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] text-[#6B7280] mb-2">
                      Chronic Conditions
                    </Text>
                    {isEditing ? (
                      <TextInput
                        className="text-base font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-1"
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
                      />
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {currentUser.medicalProfile.chronicIllnesses.map(
                          (illness, index) => (
                            <View
                              key={index}
                              className="bg-[#EFF6FF] px-3 py-1.5 rounded-full border border-[#DBEAFE]"
                            >
                              <Text className="text-sm text-[#1D4ED8]">
                                {illness}
                              </Text>
                            </View>
                          ),
                        )}
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="px-6">
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/profile/change-password")}
          >
            <Ionicons name="key-outline" size={22} color="#4461F2" />
            <Text className="flex-1 text-[15px] font-medium text-[#374151] ml-3">
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white rounded-xl p-4 mb-3 shadow-sm"
            onPress={() => router.push("/profile/privacy-settings")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#4461F2"
            />
            <Text className="flex-1 text-[15px] font-medium text-[#374151] ml-3">
              Privacy Settings
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
