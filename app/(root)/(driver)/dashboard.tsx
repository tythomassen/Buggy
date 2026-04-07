import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Map from "@/components/Map";
import { fetchAPI } from "@/lib/fetch";

type PendingRide = {
  ride_id: number;
  origin_address: string;
  destination_address: string | null;
  rider_name: string;
  created_at: string;
};

export default function DriverDashboard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState<PendingRide[]>([]);
  const [accepting, setAccepting] = useState<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPending = async () => {
    try {
      const { data } = await fetchAPI("/(api)/ride/pending");
      setRides(data ?? []);
    } catch (err) {
      console.error("Poll error:", err);
    }
  };

  useEffect(() => {
    if (online) {
      fetchPending();
      pollRef.current = setInterval(fetchPending, 5000);
    } else {
      setRides([]);
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [online]);

  const handleAccept = async (ride: PendingRide) => {
    setAccepting(ride.ride_id);
    try {
      await fetchAPI("/(api)/ride/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: ride.ride_id,
          status: "accepted",
          driver_id: user?.id,
        }),
      });
      router.push({
        pathname: "/(root)/(driver)/active",
        params: {
          rideId: ride.ride_id,
          pickupAddress: ride.origin_address,
          riderName: ride.rider_name,
        },
      });
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#1a2e35",
        }}
      >
        <View>
          <Text style={{ fontFamily: "LibreBodoni-BoldItalic", fontSize: 28, color: "#dfc925" }}>
            Buggy
          </Text>
          <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", fontSize: 12, color: "#9ca3af" }}>
            Driver Mode
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ color: online ? "#4ade80" : "#9ca3af", fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 13 }}>
            {online ? "Online" : "Offline"}
          </Text>
          <Switch
            value={online}
            onValueChange={setOnline}
            trackColor={{ false: "#374151", true: "#4ade80" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Map */}
      <View style={{ height: 220 }}>
        <Map />
      </View>

      {/* Ride requests */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ fontFamily: "Plus-Jakarta-Sans-ExtraBold", fontSize: 17, color: "#111", marginBottom: 10 }}>
          {online ? "Incoming Requests" : "Go online to see requests"}
        </Text>

        {!online ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 48 }}>🏌️</Text>
            <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
              Toggle online when you're ready to accept rides
            </Text>
          </View>
        ) : (
          <FlatList
            data={rides}
            keyExtractor={(item) => item.ride_id.toString()}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <ActivityIndicator color="#1a2e35" />
                <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", color: "#9ca3af", marginTop: 12 }}>
                  Waiting for ride requests...
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.07,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text style={{ fontFamily: "Plus-Jakarta-Sans-Bold", fontSize: 15, color: "#111" }}>
                  {item.rider_name}
                </Text>
                <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", fontSize: 13, color: "#5c6b70", marginTop: 4 }}>
                  Pickup: {item.origin_address}
                </Text>
                {item.destination_address ? (
                  <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", fontSize: 13, color: "#5c6b70", marginTop: 2 }}>
                    Drop-off: {item.destination_address}
                  </Text>
                ) : null}
                <TouchableOpacity
                  onPress={() => handleAccept(item)}
                  disabled={accepting === item.ride_id}
                  style={{
                    backgroundColor: "#1a2e35",
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: "center",
                    marginTop: 14,
                  }}
                >
                  {accepting === item.ride_id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontFamily: "Plus-Jakarta-Sans-Bold", fontSize: 14 }}>
                      Accept Ride
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={() => { signOut(); router.replace("/(auth)/sign-in"); }}
        style={{ padding: 16, alignItems: "center" }}
      >
        <Text style={{ color: "#9ca3af", fontFamily: "Plus-Jakarta-Sans-Regular", fontSize: 13 }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
