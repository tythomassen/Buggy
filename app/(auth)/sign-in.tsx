import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { fetchAPI } from "@/lib/fetch";

import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });
  const [oauthLoading, setOauthLoading] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkBiometrics = async () => {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const enabled = await SecureStore.getItemAsync("biometrics_enabled");
      if (hardware && enrolled && enabled === "true") {
        setBiometricsEnabled(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        setBiometricType(hasFace ? "face" : "fingerprint");
      }
    };
    checkBiometrics();
  }, []);

  const routeByRole = async (clerkId: string) => {
    try {
      console.log("[routeByRole] fetching role for clerkId:", clerkId);
      const result = await fetchAPI(`/(api)/user/${clerkId}`);
      console.log("[routeByRole] API response:", JSON.stringify(result));
      const { role } = result;
      console.log("[routeByRole] role:", role);
      if (role === "driver") {
        console.log("[routeByRole] routing to driver dashboard");
        router.replace("/(root)/(driver)/dashboard");
      } else {
        console.log("[routeByRole] routing to rider home");
        router.replace("/(root)/(tabs)/home");
      }
    } catch (err) {
      console.error("[routeByRole] error:", err);
      router.replace("/(root)/(tabs)/home");
    }
  };

  const offerBiometrics = async (email: string, password: string) => {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hardware || !enrolled) return;
    const alreadyEnabled = await SecureStore.getItemAsync("biometrics_enabled");
    if (alreadyEnabled === "true") return;

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    const label = hasFace ? "Face ID" : "Touch ID";

    Alert.alert(
      `Enable ${label}`,
      `Sign in faster next time using ${label}.`,
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Enable",
          onPress: async () => {
            await SecureStore.setItemAsync("biometrics_email", email);
            await SecureStore.setItemAsync("biometrics_password", password);
            await SecureStore.setItemAsync("biometrics_enabled", "true");
            setBiometricsEnabled(true);
            setBiometricType(hasFace ? "face" : "fingerprint");
          },
        },
      ]
    );
  };

  const handleBiometricSignIn = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Sign in to Buggy",
      fallbackLabel: "Use Password",
      disableDeviceFallback: false,
    });

    if (!result.success) return;

    const email = await SecureStore.getItemAsync("biometrics_email");
    const password = await SecureStore.getItemAsync("biometrics_password");
    if (!email || !password) {
      Alert.alert("Error", "No saved credentials. Please sign in with your password.");
      return;
    }

    try {
      const attempt = await signIn!.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActive!({ session: attempt.createdSessionId });
        await routeByRole(attempt.createdUserId!);
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.longMessage ?? "Biometric sign in failed.");
    }
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        await offerBiometrics(form.email, form.password);
        await routeByRole(signInAttempt.createdUserId!);
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.longMessage ?? "Sign in failed. Please try again.");
    }
  }, [isLoaded, form.email, form.password]);

  const handleGoogleSignIn = async () => {
    if (oauthLoading) return;
    setOauthLoading(true);
    try {
      const result = await googleOAuth(startGoogleOAuthFlow);
      if (result.code === "session_exists" || result.success) {
        if (result.userId) {
          await routeByRole(result.userId);
        } else {
          router.replace("/(root)/(tabs)/home");
        }
        return;
      }
      Alert.alert("Error", result.message);
    } finally {
      setOauthLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (oauthLoading) return;
    setOauthLoading(true);
    try {
      const { createdSessionId, setActive, createdUserId } = await startAppleOAuthFlow({
        redirectUrl: "myapp://",
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        if (createdUserId) {
          await routeByRole(createdUserId);
        } else {
          router.replace("/(root)/(tabs)/home");
        }
      }
    } catch (err: any) {
      console.error("Apple sign in error:", err);
      Alert.alert("Error", err?.errors?.[0]?.longMessage ?? "Apple sign in failed.");
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F5F0E8" }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 140 }}>

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text style={{ fontSize: 46, fontFamily: "LibreBodoni-BoldItalic", color: "#1a2e35", letterSpacing: 1 }}>
            Buggy
          </Text>
          <Text style={{ fontSize: 16, color: "#5c6b70", marginTop: 8, fontFamily: "Plus-Jakarta-Sans-Regular" }}>
            Sign in to continue with Buggy
          </Text>
        </View>

        {/* Inputs */}
        <InputField
          label="Email"
          placeholder="Enter email"
          icon={icons.email}
          textContentType="emailAddress"
          value={form.email}
          onChangeText={(value) => setForm({ ...form, email: value })}
        />

        <InputField
          label="Password"
          placeholder="Enter password"
          icon={icons.lock}
          secureTextEntry={true}
          textContentType="password"
          value={form.password}
          onChangeText={(value) => setForm({ ...form, password: value })}
        />

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={onSignInPress}
          style={{
            backgroundColor: "#1a2e35",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Plus-Jakarta-Sans-Bold" }}>
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Face ID / Touch ID button */}
        {biometricsEnabled && (
          <TouchableOpacity
            onPress={handleBiometricSignIn}
            style={{
              borderWidth: 1.5,
              borderColor: "#1a2e35",
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>
              {biometricType === "face" ? "" : ""}
            </Text>
            <Text style={{ fontSize: 16, fontFamily: "Plus-Jakarta-Sans-SemiBold", color: "#1a2e35" }}>
              {biometricType === "face" ? "Sign in with Face ID" : "Sign in with Touch ID"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#d4cfc8" }} />
          <Text style={{ marginHorizontal: 12, color: "#8a8078", fontFamily: "Plus-Jakarta-Sans-Regular" }}>Or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#d4cfc8" }} />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={oauthLoading}
          style={{
            backgroundColor: "#dfc925",
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Image source={icons.google} style={{ width: 20, height: 20, marginRight: 10 }} resizeMode="contain" />
          <Text style={{ fontSize: 16, fontFamily: "Plus-Jakarta-Sans-SemiBold", color: "#fff" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          onPress={handleAppleSignIn}
          disabled={oauthLoading}
          style={{
            backgroundColor: "#dfc925",
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 20, marginRight: 10, color: "#fff" }}>{'\uF8FF'}</Text>
          <Text style={{ fontSize: 16, fontFamily: "Plus-Jakarta-Sans-SemiBold", color: "#fff" }}>
            Continue with Apple
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <Link href="/(auth)/sign-up" style={{ textAlign: "center", marginBottom: 32 }}>
          <Text style={{ fontSize: 15, color: "#8a8078", fontFamily: "Plus-Jakarta-Sans-Regular" }}>
            Don't have an account?{" "}
          </Text>
          <Text style={{ fontSize: 15, color: "#1a2e35", fontFamily: "Plus-Jakarta-Sans-Bold" }}>
            Sign Up
          </Text>
        </Link>

      </View>
    </ScrollView>
  );
};

export default SignIn;
