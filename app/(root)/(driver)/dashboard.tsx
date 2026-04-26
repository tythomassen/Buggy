import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchAPI } from "@/lib/fetch";

type PendingRide = {
  ping_id: number;
  ride_id: number;
  origin_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_address: string | null;
  rider_name: string;
  created_at: string;
};

export default function DriverDashboard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState<PendingRide[]>([]);
  const [accepting, setAccepting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simUsed, setSimUsed] = useState(false);
  const [currentRide, setCurrentRide] = useState<PendingRide | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView>(null);

  const fetchPending = async () => {
    if (!user?.id) return;
    try {
      const { data } = await fetchAPI(
        `/(api)/ride/pings?driverClerkId=${user.id}`
      );
      const pending: PendingRide[] = data ?? [];
      setRides(pending);
      // Show the first pending ping as the current card
      if (pending.length > 0 && !currentRide) {
        setCurrentRide(pending[0]);
      }
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
      setCurrentRide(null);
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [online]);

  // Fit map to show all ping markers when they load
  useEffect(() => {
    if (rides.length === 0) return;
    const coords = rides.map((r) => ({
      latitude: Number(r.origin_latitude),
      longitude: Number(r.origin_longitude),
    }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 120, right: 40, bottom: 260, left: 40 },
      animated: true,
    });
  }, [rides.length]);

  const handleSimulate = async () => {
    if (!user?.id || simulating || simUsed) return;
    setSimulating(true);
    try {
      await fetchAPI("/(api)/ride/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverClerkId: user.id, count: 4 }),
      });
      await fetchPending();
      setSimUsed(true);
    } catch (err) {
      console.error("Simulate error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleAccept = async () => {
    if (!currentRide) return;
    setAccepting(true);
    try {
      await Promise.all([
        // Mark ride as accepted with this driver
        fetchAPI("/(api)/ride/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ride_id: currentRide.ride_id,
            status: "accepted",
            driver_id: user?.id,
          }),
        }),
        // Mark this ping accepted and expire all other drivers' pings for same ride
        fetchAPI("/(api)/ride/pings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ping_id: currentRide.ping_id,
            status: "accepted",
            expire_ride_id: currentRide.ride_id,
          }),
        }),
      ]);
      router.push({
        pathname: "/(root)/(driver)/active",
        params: {
          rideId: currentRide.ride_id,
          pickupAddress: currentRide.origin_address,
          pickupLatitude: currentRide.origin_latitude,
          pickupLongitude: currentRide.origin_longitude,
          riderName: currentRide.rider_name,
        },
      });
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setAccepting(false);
    }
  };

  const handlePass = async () => {
    if (!currentRide) return;
    const remaining = rides.filter((r) => r.ping_id !== currentRide.ping_id);
    setRides(remaining);
    setCurrentRide(remaining.length > 0 ? remaining[0] : null);
    try {
      await fetchAPI("/(api)/ride/pings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping_id: currentRide.ping_id, status: "passed" }),
      });
    } catch (err) {
      console.error("Pass error:", err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen map */}
      <MapView
        ref={mapRef}
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
      >
        {rides.map((ride) => {
          const isSelected = currentRide?.ping_id === ride.ping_id;
          return (
            <Marker
              key={ride.ping_id}
              coordinate={{
                latitude: Number(ride.origin_latitude),
                longitude: Number(ride.origin_longitude),
              }}
              onPress={() => setCurrentRide(ride)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Image
                source={require("@/assets/icons/PingIcon.png")}
                style={{
                  width: isSelected ? 48 : 36,
                  height: isSelected ? 48 : 36,
                  opacity: isSelected ? 1 : 0.75,
                }}
                resizeMode="contain"
              />
            </Marker>
          );
        })}
      </MapView>

      {/* Header overlay */}
      <SafeAreaView
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: "#1a2e35",
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: "LibreBodoni-BoldItalic",
                fontSize: 26,
                color: "#dfc925",
              }}
            >
              Buggy
            </Text>
            <Text
              style={{
                fontFamily: "Plus-Jakarta-Sans-Regular",
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              Driver Mode
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {online && (
              <TouchableOpacity
                onPress={handleSimulate}
                disabled={simulating || simUsed}
                style={{
                  backgroundColor: simulating || simUsed ? "#374151" : "#dfc925",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    color: simUsed ? "#6b7280" : "#1a2e35",
                    fontFamily: "Plus-Jakarta-Sans-Bold",
                    fontSize: 12,
                  }}
                >
                  {simulating ? "..." : simUsed ? "Pings Sent" : "+ Sim Pings"}
                </Text>
              </TouchableOpacity>
            )}
            <Text
              style={{
                color: "#fff",
                fontFamily: "Plus-Jakarta-Sans-SemiBold",
                fontSize: 13,
              }}
            >
              {online ? "Online" : "Offline"}
            </Text>
            <Switch
              value={online}
              onValueChange={setOnline}
              trackColor={{ false: "#6b7280", true: "#4ade80" }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Ping card overlay at bottom */}
      {online && currentRide && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 36,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {/* Ping header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: "#374151",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Plus-Jakarta-Sans-Bold",
                    color: "#374151",
                    lineHeight: 14,
                  }}
                >
                  i
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Plus-Jakarta-Sans-Bold",
                  fontSize: 17,
                  color: "#111",
                }}
              >
                Ping
              </Text>
            </View>
            <TouchableOpacity onPress={handlePass} hitSlop={12}>
              <Text style={{ fontSize: 18, color: "#6b7280" }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <Text
            style={{
              fontFamily: "Plus-Jakarta-Sans-Regular",
              fontSize: 15,
              color: "#374151",
              marginBottom: 18,
            }}
          >
            {currentRide.origin_address}
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleAccept}
              disabled={accepting}
              style={{
                flex: 1,
                backgroundColor: "#2d6a4f",
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              {accepting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "Plus-Jakarta-Sans-Bold",
                    fontSize: 16,
                  }}
                >
                  Accept
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePass}
              style={{
                flex: 1,
                backgroundColor: "#e63946",
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "Plus-Jakarta-Sans-Bold",
                  fontSize: 16,
                }}
              >
                Pass
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
