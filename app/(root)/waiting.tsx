import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchAPI } from "@/lib/fetch";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

export default function Waiting() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const [status, setStatus] = useState<"pending" | "accepted" | "cancelled">("pending");
  const [driverName, setDriverName] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = async () => {
    try {
      const { data } = await fetchAPI(`/(api)/ride/${rideId}/status`);
      if (data?.status === "accepted") {
        setStatus("accepted");
        setDriverName(data.driver_name ?? "Your driver");
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (err) {
      console.error("Poll error:", err);
    }
  };

  useEffect(() => {
    pollRef.current = setInterval(checkStatus, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [rideId]);

  const handleCancel = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      await fetchAPI("/(api)/ride/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: rideId, status: "cancelled" }),
      });
    } catch (err) {
      console.error("Cancel error:", err);
    }
    router.replace("/(root)/(tabs)/home");
  };

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
          latitude: 38.939,
          longitude: -74.911,
          latitudeDelta: 0.014,
          longitudeDelta: 0.014,
        }}
      />

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
            alignItems: "center",
          }}
        >
          {status === "pending" ? (
            <>
              <ActivityIndicator size="large" color="#1a2e35" />
              <Text style={{ fontSize: 20, fontFamily: "Plus-Jakarta-Sans-ExtraBold", color: "#111", marginTop: 16 }}>
                Looking for a driver...
              </Text>
              <Text style={{ fontSize: 14, color: "#9ca3af", fontFamily: "Plus-Jakarta-Sans-Regular", marginTop: 6, textAlign: "center" }}>
                A nearby buggy driver will accept your request shortly.
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  marginTop: 20,
                  borderWidth: 1.5,
                  borderColor: "#ef4444",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                }}
              >
                <Text style={{ color: "#ef4444", fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 15 }}>
                  Cancel Request
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 40 }}>🏌️</Text>
              <Text style={{ fontSize: 20, fontFamily: "Plus-Jakarta-Sans-ExtraBold", color: "#111", marginTop: 12 }}>
                Driver on the way!
              </Text>
              <Text style={{ fontSize: 15, color: "#5c6b70", fontFamily: "Plus-Jakarta-Sans-Regular", marginTop: 6 }}>
                {driverName} accepted your ride.
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(root)/(tabs)/home")}
                style={{
                  marginTop: 20,
                  backgroundColor: "#1a2e35",
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                }}
              >
                <Text style={{ color: "#fff", fontFamily: "Plus-Jakarta-Sans-Bold", fontSize: 15 }}>
                  Got it
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
