import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";

export default function Page() {
  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { userAddress, userLatitude, userLongitude, destinationAddress, destinationLatitude, destinationLongitude } = useLocationStore();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  const closeMenuThen = (route: string) => {
    setPendingNav(route);
    setMenuOpen(false);
  };

  const handleMenuDismiss = () => {
    if (!pendingNav) return;
    const route = pendingNav;
    setPendingNav(null);
    if (route === "__signout__") {
      signOut();
      router.replace("/(auth)/sign-in");
    } else {
      router.push(route as any);
    }
  };

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const label = address[0]
        ? `${address[0].name ?? ""}, ${address[0].region ?? ""}`.trim().replace(/^,\s*/, "")
        : "Cape May, NJ";

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: label,
      });
    };

    requestLocation();
  }, []);

  const handlePing = async () => {
    if (!userLatitude || !userLongitude) return;
    setRequesting(true);
    try {
      const { data } = await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_address: userAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_address: destinationAddress ?? null,
          destination_latitude: destinationLatitude ?? null,
          destination_longitude: destinationLongitude ?? null,
          user_id: user?.id,
        }),
      });

      router.push({
        pathname: "/(root)/waiting",
        params: { rideId: data.ride_id },
      });
    } catch (err) {
      console.error("Failed to create ride request:", err);
      Alert.alert("Error", "Failed to request a ride. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen map */}
      <View style={{ flex: 1 }}>
        <Map />
      </View>

      {/* Top panel */}
      <SafeAreaView
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}
        edges={["top"]}
      >
        <View
          style={{
            backgroundColor: "#fff",
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 20,
            paddingTop: 6,
            paddingBottom: 4,
            paddingHorizontal: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {/* From row */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ alignItems: "center", marginLeft: 6, marginRight: 2, width: 16 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: "#1a2e35" }} />
              <View style={{ width: 1, height: 12, backgroundColor: "#d1d5db", marginVertical: 2 }} />
              <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: "#dfc925" }} />
            </View>
            <View style={{ flex: 1 }}>
              <GoogleTextInput
                icon={icons.target}
                initialLocation={userAddress ?? "Current location"}
                placeholder={userAddress ?? "Current location"}
                textInputBackgroundColor="#f9f9f9"
                containerStyle="bg-transparent"
                handlePress={(loc) => setUserLocation(loc)}
              />
              <View style={{ height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 20 }} />
              <GoogleTextInput
                icon={icons.map}
                initialLocation={destinationAddress ?? undefined}
                placeholder="Where to? (optional)"
                textInputBackgroundColor="#f9f9f9"
                containerStyle="bg-transparent"
                handlePress={(loc) => setDestinationLocation(loc)}
              />
            </View>
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 4,
              }}
            >
              <Text style={{ fontSize: 15, color: "#1a2e35", lineHeight: 17 }}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Ping button */}
      <SafeAreaView
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        edges={["bottom"]}
      >
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handlePing}
            disabled={requesting || !userLatitude}
            style={{
              backgroundColor: requesting || !userLatitude ? "#9ca3af" : "#1a2e35",
              borderRadius: 16,
              paddingVertical: 20,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            {requesting ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
            ) : null}
            <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Plus-Jakarta-Sans-ExtraBold", letterSpacing: 0.5 }}>
              {requesting ? "Pinging..." : "Ping"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Slide-out menu */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
        onDismiss={handleMenuDismiss}
      >
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: "72%",
                  backgroundColor: "#fff",
                  paddingTop: 60,
                  paddingHorizontal: 24,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  elevation: 20,
                }}
              >
                {/* User info */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={{ fontFamily: "LibreBodoni-BoldItalic", fontSize: 32, color: "#1a2e35" }}>
                    Buggy
                  </Text>
                  <Text style={{ fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 16, color: "#111", marginTop: 12 }}>
                    {user?.fullName ?? user?.firstName}
                  </Text>
                  <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
                    {user?.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>

                <View style={{ height: 1, backgroundColor: "#f3f4f6", marginBottom: 24 }} />

                {[
                  { label: "My Rides", icon: icons.list, route: "/(root)/(tabs)/rides" },
                  { label: "Chat", icon: icons.chat, route: "/(root)/(tabs)/chat" },
                  { label: "Profile", icon: icons.profile, route: "/(root)/(tabs)/profile" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => closeMenuThen(item.route)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f3f4f6",
                    }}
                  >
                    <Image source={item.icon} style={{ width: 20, height: 20, tintColor: "#1a2e35", marginRight: 16 }} resizeMode="contain" />
                    <Text style={{ fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 15, color: "#111" }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => closeMenuThen("__signout__")}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 16, marginTop: 8 }}
                >
                  <Image source={icons.out} style={{ width: 20, height: 20, tintColor: "#ef4444", marginRight: 16 }} resizeMode="contain" />
                  <Text style={{ fontFamily: "Plus-Jakarta-Sans-SemiBold", fontSize: 15, color: "#ef4444" }}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
