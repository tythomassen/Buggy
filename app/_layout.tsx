import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";

import { tokenCache } from "@/lib/auth";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

LogBox.ignoreLogs(["Clerk:"]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Plus-Jakarta-Sans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Plus-Jakarta-Sans-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Plus-Jakarta-Sans-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Plus-Jakarta-Sans-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Plus-Jakarta-Sans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Plus-Jakarta-Sans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Plus-Jakarta-Sans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(root)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
