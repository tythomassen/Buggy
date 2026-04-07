import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Map from "@/components/Map";
import { fetchAPI } from "@/lib/fetch";

export default function DriverActiveRide() {
  const { rideId, pickupAddress, riderName } = useLocalSearchParams<{
    rideId: string;
    pickupAddress: string;
    riderName: string;
  }>();

  const handleComplete = async () => {
    await fetchAPI("/(api)/ride/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideId, status: "completed" }),
    });
    router.replace("/(root)/(driver)/dashboard");
  };

  const handleCancel = async () => {
    await fetchAPI("/(api)/ride/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ride_id: rideId, status: "pending", driver_id: null }),
    });
    router.replace("/(root)/(driver)/dashboard");
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Map />
      </View>

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
            style={{
              backgroundColor: "#1a2e35",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "#fff", fontFamily: "Plus-Jakarta-Sans-Bold", fontSize: 16 }}>
              Complete Ride
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
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
