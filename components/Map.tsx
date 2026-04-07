import React, { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Region } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

const CAPE_MAY = { latitude: 38.9390, longitude: -74.9110 };

const BOUNDS = {
  minLat: 38.893,
  maxLat: 38.975,
  minLng: -74.970,
  maxLng: -74.845,
  maxDelta: 0.06,
};

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

const inBounds = (lat: number, lng: number) =>
  lat >= BOUNDS.minLat && lat <= BOUNDS.maxLat &&
  lng >= BOUNDS.minLng && lng <= BOUNDS.maxLng;

const Map = () => {
  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();
  const { data: drivers, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const mapRef = useRef<MapView>(null);

  const initialRegion = {
    ...CAPE_MAY,
    latitudeDelta: 0.014,
    longitudeDelta: 0.014,
  };

  // Only animate to user location if they're actually in Cape May
  useEffect(() => {
    if (!userLatitude || !userLongitude) return;
    if (!inBounds(userLatitude, userLongitude)) return;
    const r = calculateRegion({ userLatitude, userLongitude, destinationLatitude, destinationLongitude });
    mapRef.current?.animateToRegion(r, 400);
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      setMarkers(generateMarkersFromData({ data: drivers, userLatitude, userLongitude }));
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({ markers, userLatitude, userLongitude, destinationLatitude, destinationLongitude })
        .then((d) => { if (d) setDrivers(d as MarkerData[]); });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  const handleRegionChangeComplete = (r: Region) => {
    const clampedLat = clamp(r.latitude, BOUNDS.minLat, BOUNDS.maxLat);
    const clampedLng = clamp(r.longitude, BOUNDS.minLng, BOUNDS.maxLng);
    const clampedDelta = Math.min(r.latitudeDelta, BOUNDS.maxDelta);

    const needsSnap =
      clampedLat !== r.latitude ||
      clampedLng !== r.longitude ||
      clampedDelta !== r.latitudeDelta;

    if (needsSnap) {
      mapRef.current?.animateToRegion({
        latitude: clampedLat,
        longitude: clampedLng,
        latitudeDelta: clampedDelta,
        longitudeDelta: clampedDelta,
      }, 200);
    }
  };

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      initialRegion={initialRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${marker.id ?? index}`}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          title={marker.title}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <Image
            source={selectedDriver === +marker.id ? icons.selectedMarker : icons.marker}
            style={{
              width: 40,
              height: 40,
              transform: [{ rotate: `${marker.heading ?? 0}deg` }],
            }}
            resizeMode="contain"
          />
        </Marker>
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{ latitude: destinationLatitude, longitude: destinationLongitude }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{ latitude: userLatitude!, longitude: userLongitude! }}
            destination={{ latitude: destinationLatitude, longitude: destinationLongitude }}
            apikey={directionsAPI!}
            strokeColor="#0286FF"
            strokeWidth={2}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
