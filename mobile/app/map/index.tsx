import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { authStorage } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { LatLng, Marker, Region } from "react-native-maps";

import * as Location from "expo-location";

export default function App() {
  const { currentUser, refreshUser } = useCurrentUser();
  const mapRef = useRef<MapView | null>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [newLocation, setNewLocation] = useState<LatLng | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<
    number | null
  >(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required");
          setIsLoadingLocation(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        setIsLoadingLocation(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setIsLoadingLocation(false);
        Alert.alert("Error", "Failed to get your location");
      }
    }

    getCurrentLocation();
  }, []);

  // Animate to user location when it's loaded
  useEffect(() => {
    if (userLocation && mapRef.current && !newLocation) {
      const region: Region = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [userLocation]);

  // Handle back button - go back to previous screen (booking flow)
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

  const handleAddNewLocation = () => {
    setNewLocation({
      latitude: userLocation?.coords.latitude || 0,
      longitude: userLocation?.coords.longitude || 0,
    });
    setSelectedLocationIndex(null);
  };

  const handleSaveLocationPress = () => {
    if (!newLocation) return;
    setIsModalVisible(true);
  };

  const handleCenterOnLocation = (coordinate: LatLng, index: number) => {
    if (!mapRef.current) return;
    setSelectedLocationIndex(index);
    const region: Region = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
    mapRef.current.animateToRegion(region, 350);
  };

  const handleSaveLocation = async () => {
    if (!address.trim() || !label.trim()) {
      Alert.alert("Error", "Please fill in both address and label");
      return;
    }

    if (!newLocation) return;

    try {
      const { accessToken } = await authStorage.getTokens();
      if (!accessToken) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const locationData = {
        label: label.trim(),
        address: address.trim(),
        coordinates: {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        },
      };

      await api.addLocation(accessToken, locationData);
      await refreshUser();

      Alert.alert("Success", "Location saved successfully");
      setIsModalVisible(false);
      setNewLocation(null);
      setAddress("");
      setLabel("");
    } catch (error) {
      console.error("Error saving location:", error);
      Alert.alert("Error", "Failed to save location");
    }
  };

  const handleCancelNewLocation = () => {
    setNewLocation(null);
    setAddress("");
    setLabel("");
  };

  const handleCenterOnCurrentLocation = () => {
    if (isLoadingLocation) {
      Alert.alert("Loading", "Getting your location...");
      return;
    }

    if (!userLocation || !mapRef.current) {
      Alert.alert("Error", "Unable to get your current location");
      return;
    }

    const region: Region = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
    mapRef.current.animateToRegion(region, 350);
  };

  return (
    <View className="flex-1 relative">
      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-lg"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3142" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.coords.latitude || 40.7128, // Default to New York
          longitude: userLocation?.coords.longitude || -74.006,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Existing user locations */}
        {!newLocation &&
          currentUser?.locations?.map((location, index) => (
            <Marker
              key={index}
              coordinate={location.coordinates}
              title={location.label}
              description={location.address}
              pinColor={selectedLocationIndex === index ? "#4461F2" : "red"}
            />
          ))}

        {/* New draggable location marker */}
        {newLocation && (
          <Marker
            draggable
            onDragEnd={(e) => setNewLocation(e.nativeEvent.coordinate)}
            coordinate={newLocation}
            title="New Location"
            description="Drag to adjust position"
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 shadow-2xl pb-12">
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="max-h-64 mb-3"
        >
          <Text className="text-lg font-semibold text-[#2D3142] mb-3">
            Your Locations
          </Text>

          {currentUser?.locations && currentUser.locations.length > 0 ? (
            currentUser.locations.map((location, index) => {
              const isSelected = selectedLocationIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  className={`rounded-2xl p-4 mb-3 border items-start justify-between ${
                    isSelected
                      ? "bg-[#4461F2]/5 border-[#4461F2]"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  onPress={() =>
                    handleCenterOnLocation(location.coordinates, index)
                  }
                >
                  <View className="flex-row items-center justify-center w-full">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-[#2D3142] mb-1">
                        {location.label}
                      </Text>
                      <Text className="text-xs text-[#9E9E9E]">
                        {location.coordinates.latitude.toFixed(6)},{" "}
                        {location.coordinates.longitude.toFixed(6)}
                      </Text>
                    </View>
                    <View className="justify-center ml-2">
                      <Ionicons name="location" size={18} color="#4461F2" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text className="text-sm text-[#9E9E9E] mb-4">
              No saved locations yet
            </Text>
          )}
        </ScrollView>

        {/* Action Buttons */}
        {!newLocation ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleAddNewLocation}
              className="flex-1 bg-[#4461F2] py-4 rounded-full flex-row items-center justify-center gap-2"
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text className="text-base font-semibold text-white">
                Add New Location
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCenterOnCurrentLocation}
              className="w-15 bg-gray-200 py-4 rounded-full items-center justify-center"
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#4461F2" />
              ) : (
                <Ionicons name="locate" size={24} color="#4461F2" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancelNewLocation}
              className="flex-1 bg-gray-200 py-4 rounded-full items-center justify-center"
            >
              <Text className="text-base font-semibold text-[#2D3142]">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveLocationPress}
              className="flex-1 bg-[#4461F2] py-4 rounded-full items-center justify-center"
            >
              <Text className="text-base font-semibold text-white">
                Save Location
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal for Address and Label Input */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
        className="shadow-2xl"
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-[#2D3142] mb-6 text-center">
              Save Location
            </Text>

            {/* Label Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#2D3142] mb-2">
                Label
              </Text>
              <TextInput
                className="bg-gray-50 rounded-2xl px-4 py-3 text-base text-[#2D3142] border border-gray-200"
                placeholder="e.g., Home, Work, Gym"
                value={label}
                onChangeText={setLabel}
                placeholderTextColor="#9E9E9E"
              />
            </View>

            {/* Address Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-[#2D3142] mb-2">
                Address
              </Text>
              <TextInput
                className="bg-gray-50 rounded-2xl px-4 py-3 text-base text-[#2D3142] border border-gray-200"
                placeholder="Enter full address"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Coordinates Display */}
            {newLocation && (
              <View className="bg-[#4461F2]/10 rounded-2xl p-3 mb-6">
                <Text className="text-xs text-[#9E9E9E] mb-1">
                  Coordinates:
                </Text>
                <Text className="text-sm font-medium text-[#4461F2]">
                  {newLocation.latitude.toFixed(6)},{" "}
                  {newLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setAddress("");
                  setLabel("");
                }}
                className="flex-1 bg-gray-200 py-3 rounded-full items-center justify-center"
              >
                <Text className="text-base font-semibold text-[#2D3142]">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveLocation}
                className="flex-1 bg-[#4461F2] py-3 rounded-full items-center justify-center"
              >
                <Text className="text-base font-semibold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
