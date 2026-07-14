import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Text,
} from "@/components/ui";
import { useThemeColors } from "@/constants/theme";
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
  const colors = useThemeColors();
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

  // Marker styling pulled from the theme (Mapbox annotations need style props).
  const markerBase = {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
  } as const;

  return (
    <View className="flex-1 relative bg-background">
      <View className="absolute top-12 left-4 z-10">
        <IconButton
          icon="arrow-back"
          onPress={() => router.back()}
          variant="surface"
          accessibilityLabel="Go back"
        />
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
                style={{
                  ...markerBase,
                  backgroundColor:
                    selectedLocationIndex === index
                      ? colors.accent
                      : colors.primary,
                }}
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
            <View style={{ ...markerBase, backgroundColor: colors.warning }} />
          </PointAnnotation>
        )}
      </MapView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl p-5 pb-12"
        style={{
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="max-h-64 mb-3"
        >
          <Text variant="h3" color="foreground" className="mb-3">
            Your Locations
          </Text>

          {currentUser?.locations && currentUser.locations.length > 0 ? (
            currentUser.locations.map((location, index) => {
              const isSelected = selectedLocationIndex === index;
              return (
                <Card
                  key={index}
                  onPress={() =>
                    handleCenterOnLocation(location.coordinates, index)
                  }
                  elevation="none"
                  className={`mb-3 ${
                    isSelected ? "bg-primary-soft border-primary" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-center w-full">
                    <View className="flex-1">
                      <Text
                        variant="bodyLg"
                        color="foreground"
                        weight="semibold"
                        className="mb-1"
                      >
                        {location.label}
                      </Text>
                      <Text variant="caption" color="muted">
                        {location.coordinates.latitude.toFixed(6)},{" "}
                        {location.coordinates.longitude.toFixed(6)}
                      </Text>
                    </View>
                    <View className="justify-center ml-2">
                      <Ionicons
                        name="location"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </Card>
              );
            })
          ) : (
            <EmptyState
              icon="location-outline"
              title="No saved locations yet"
              message="Add a location to get started."
              className="py-6"
            />
          )}
        </ScrollView>

        {!newLocation ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Add New Location"
                leftIcon="add-circle-outline"
                onPress={handleAddNewLocation}
              />
            </View>
            <IconButton
              icon="locate"
              onPress={handleCenterOnCurrentLocation}
              variant="soft"
              color={colors.primary}
              accessibilityLabel="Center on my location"
              className="w-14 h-14"
            />
          </View>
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Cancel"
                variant="secondary"
                onPress={handleCancelNewLocation}
              />
            </View>
            <View className="flex-1">
              <Button label="Save Location" onPress={handleSaveLocationPress} />
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <Card elevation="e3" className="w-full max-w-md p-6">
            <Text
              variant="h2"
              color="foreground"
              className="mb-6 text-center"
            >
              Save Location
            </Text>

            <Input
              label="Label"
              placeholder="e.g., Home, Work, Gym"
              value={label}
              onChangeText={setLabel}
              containerClassName="mb-4"
            />

            <Input
              label="Address"
              placeholder="Enter full address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              containerClassName="mb-6"
            />

            {newLocation && (
              <Card elevation="none" className="bg-primary-soft border-0 mb-6">
                <Text variant="caption" color="muted" className="mb-1">
                  Coordinates
                </Text>
                <Text variant="body" color="primary" weight="medium">
                  {newLocation.latitude.toFixed(6)},{" "}
                  {newLocation.longitude.toFixed(6)}
                </Text>
              </Card>
            )}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => {
                    setIsModalVisible(false);
                    setAddress("");
                    setLabel("");
                  }}
                />
              </View>
              <View className="flex-1">
                <Button label="Save" onPress={handleSaveLocation} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
