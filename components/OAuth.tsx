import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

const OAuth = () => {
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await googleOAuth(startGoogleOAuthFlow);
      if (result.code === "session_exists" || result.success) {
        router.replace("/(root)/(tabs)/home");
        return;
      }
      Alert.alert("Error", result.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startAppleOAuthFlow({
        redirectUrl: "myapp://",
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(root)/(tabs)/home");
      }
    } catch (err: any) {
      console.error("Apple sign in error:", err);
      Alert.alert("Error", err?.errors?.[0]?.longMessage ?? "Apple sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
        disabled={loading}
      />

      <CustomButton
        title="Log In with Apple"
        className="mt-3 w-full shadow-none"
        IconLeft={() => (
          <Text className="text-xl mx-2"></Text>
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleAppleSignIn}
        disabled={loading}
      />
    </View>
  );
};

export default OAuth;
