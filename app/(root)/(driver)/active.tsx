import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

import { fetchAPI } from "@/lib/fetch";

export default function DriverActiveRide() {
  const { rideId, pickupAddress, pickupLatitude, pickupLongitude, riderName } = useLocalSearchParams<{
    rideId: string;
    pickupAddress: string;
    pickupLatitude: string;
    pickupLongitude: string;
    riderName: string;
  }>();

  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await fetchAPI("/(api)/ride/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: rideId, status: "completed" }),
      });
      router.replace("/(root)/(driver)/dashboard");
    } catch {
      Alert.alert("Error", "Could not complete ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel and release this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await fetchAPI("/(api)/ride/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ride_id: rideId, status: "pending", clear_driver: true }),
              });
              router.replace("/(root)/(driver)/dashboard");
            } catch {
              Alert.alert("Error", "Could not cancel ride. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const lat = pickupLatitude ? parseFloat(pickupLatitude) : 38.939;
  const lng = pickupLongitude ? parseFloat(pickupLongitude) : -74.911;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        mapType="mutedStandard"
        showsPointsOfInterest={false}
        userInterfaceStyle="light"
        showsUserLocation={true}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.014,
          longitudeDelta: 0.014,
        }}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lng }}
          title={pickupAddress ?? "Pickup"}
          pinColor="#1a2e35"
        />
      </MapView>

      <SafeAreaView edges={["bottom"]} style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <View
          style={{
            backgroundColor: "#fff",
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text style={{ fontFamily: "Plus-Jakarta-Sans-ExtraBold", fontSize: 18, color: "#111" }}>
            Active Ride
          </Text>
          <Text style={{ fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 15, color: "#1a2e35", marginTop: 10 }}>
            Rider: {riderName}
          </Text>
          <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", fontSize: 13, color: "#5c6b70", marginTop: 4 }}>
            Pickup: {pickupAddress}
          </Text>

          <TouchableOpacity
            onPress={handleComplete}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9ca3af" : "#1a2e35",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontFamily: "Plus-Jakarta-Sans-Bold", fontSize: 16 }}>
                Complete Ride
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            disabled={loading}
            style={{
              borderWidth: 1.5,
              borderColor: "#ef4444",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "#ef4444", fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 15 }}>
              Cancel & Release
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
