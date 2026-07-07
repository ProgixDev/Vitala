import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";
import { router } from "expo-router";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

type Coordinate = { latitude: number; longitude: number };

function toLngLat(c: Coordinate): [number, number] {
  return [c.longitude, c.latitude];
}

const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128];
const DEFAULT_ZOOM = 12;

export default function App() {
  const { currentUser, refreshUser } = useCurrentUser();
  const cameraRef = useRef<Camera>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [newLocation, setNewLocation] = useState<Coordinate | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<
    number | null
  >(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const animateTo = useCallback(
    (lngLat: [number, number], zoom: number = 14) => {
      cameraRef.current?.setCamera({
        centerCoordinate: lngLat,
        zoomLevel: zoom,
        animationDuration: 350,
      });
    },
    [],
  );

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

  useEffect(() => {
    if (userLocation && !newLocation) {
      animateTo([
        userLocation.coords.longitude,
        userLocation.coords.latitude,
      ], 14);
    }
  }, [userLocation, newLocation, animateTo]);

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
    if (userLocation) {
      setNewLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
      animateTo(
        [userLocation.coords.longitude, userLocation.coords.latitude],
        14,
      );
    }
    setSelectedLocationIndex(null);
  };

  const handleSaveLocationPress = () => {
    if (!newLocation) return;
    setIsModalVisible(true);
  };

  const handleCenterOnLocation = (coordinate: Coordinate, index: number) => {
    setSelectedLocationIndex(index);
    animateTo([coordinate.longitude, coordinate.latitude], 14);
  };

  const handleSaveLocation = async () => {
    if (!address.trim() || !label.trim()) {
      Alert.alert("Error", "Please fill in both address and label");
      return;
    }

    if (!newLocation) return;

    try {
      if (!currentUser?.token) {
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

      await api.addLocation(currentUser.token, locationData);
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

    if (!userLocation) {
      Alert.alert("Error", "Unable to get your current location");
      return;
    }

    animateTo([
      userLocation.coords.longitude,
      userLocation.coords.latitude,
    ], 14);
  };

  const initialCenter = userLocation
    ? [userLocation.coords.longitude, userLocation.coords.latitude]
    : DEFAULT_CENTER;

  return (
    <View className="flex-1 relative">
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-lg"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3142" />
        </TouchableOpacity>
      </View>

      <MapView style={styles.map}>
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: initialCenter,
            zoomLevel: DEFAULT_ZOOM,
          }}
        />

        {!newLocation &&
          currentUser?.locations?.map((location, index) => (
            <PointAnnotation
              key={`loc-${index}`}
              id={`loc-${index}`}
              coordinate={toLngLat(location.coordinates)}
              title={location.label}
            >
              <View
                style={[
                  styles.marker,
                  selectedLocationIndex === index && styles.markerSelected,
                ]}
              />
            </PointAnnotation>
          ))}

        {newLocation && (
          <PointAnnotation
            id="new-location"
            coordinate={toLngLat(newLocation)}
            draggable
            onDragEnd={(payload) => {
              const coords = payload?.geometry?.coordinates;
              if (Array.isArray(coords) && coords.length >= 2) {
                setNewLocation({ longitude: coords[0], latitude: coords[1] });
              }
            }}
            title="New Location"
          >
            <View style={[styles.marker, styles.markerNew]} />
          </PointAnnotation>
        )}
      </MapView>

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
  map: {
    flex: 1,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E53935",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerSelected: {
    backgroundColor: "#4461F2",
  },
  markerNew: {
    backgroundColor: "#2196F3",
  },
});
