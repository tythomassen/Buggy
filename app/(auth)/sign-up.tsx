import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ReactNativeModal } from "react-native-modal";

import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { googleOAuth } from "@/lib/auth";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });
  const [oauthLoading, setOauthLoading] = useState(false);

  const routeByRole = async (clerkId: string) => {
    try {
      const result = await fetchAPI(`/(api)/user/${clerkId}`);
      if (result.role === "driver") {
        router.replace("/(root)/(driver)/dashboard");
      } else {
        router.replace("/(root)/(tabs)/home");
      }
    } catch {
      router.replace("/(root)/(tabs)/home");
    }
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.longMessage ?? "Sign up failed. Please try again.");
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });

        try {
          await fetchAPI("/(api)/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name || form.email.split("@")[0],
              email: form.email,
              clerkId: completeSignUp.createdUserId,
            }),
          });
        } catch (apiErr) {
          console.error("Failed to save user to DB:", apiErr);
        }

        setVerification({ ...verification, state: "success" });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage ?? "Something went wrong.",
        state: "failed",
      });
    }
  };

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
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60 }}>

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 10, marginTop: 40 }}>  
          <Text style={{ fontSize: 46, fontFamily: "LibreBodoni-BoldItalic", color: "#1a2e35", letterSpacing: 1 }}>
            Buggy
          </Text>
          <Text style={{ fontSize: 16, color: "#5c6b70", marginTop: 8, fontFamily: "Plus-Jakarta-Sans-Regular" }}>
            Create your account
          </Text>
        </View>

        {/* Inputs */}
        <InputField
          label="Name"
          placeholder="Enter name"
          icon={icons.person}
          value={form.name}
          onChangeText={(value) => setForm({ ...form, name: value })}
        />
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

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={onSignUpPress}
          style={{
            backgroundColor: "#1a2e35",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Plus-Jakarta-Sans-Bold" }}>
            Sign Up
          </Text>
        </TouchableOpacity>

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

        {/* Log In Link */}
        <Link href="/(auth)/sign-in" style={{ textAlign: "center", marginBottom: 32 }}>
          <Text style={{ fontSize: 15, color: "#8a8078", fontFamily: "Plus-Jakarta-Sans-Regular" }}>
            Already have an account?{" "}
          </Text>
          <Text style={{ fontSize: 15, color: "#1a2e35", fontFamily: "Plus-Jakarta-Sans-Bold" }}>
            Log In
          </Text>
        </Link>

      </View>

      {/* Verification Modal */}
      <ReactNativeModal
        isVisible={verification.state === "pending" || verification.state === "failed"}
        onModalHide={() => {
          if (verification.state === "success") {
            router.replace("/(root)/(tabs)/home");
          }
        }}
      >
        <View style={{ backgroundColor: "#fff", paddingHorizontal: 28, paddingVertical: 36, borderRadius: 16, minHeight: 300 }}>
          <TouchableOpacity
            onPress={() => setVerification({ ...verification, state: "default", error: "" })}
            style={{ position: "absolute", top: 16, right: 16, padding: 4 }}
          >
            <Text style={{ fontSize: 20, color: "#8a8078", lineHeight: 22 }}>✕</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: "Plus-Jakarta-Sans-ExtraBold", fontSize: 22, marginBottom: 8 }}>
            Verification
          </Text>
          <Text style={{ fontFamily: "Plus-Jakarta-Sans-Regular", marginBottom: 20 }}>
            We've sent a verification code to {form.email}.
          </Text>
          <InputField
            label="Code"
            icon={icons.lock}
            placeholder="12345"
            value={verification.code}
            keyboardType="numeric"
            onChangeText={(code) => setVerification({ ...verification, code })}
          />
          {verification.error && (
            <Text style={{ color: "#ef4444", fontSize: 13, marginTop: 4 }}>
              {verification.error}
            </Text>
          )}
          <TouchableOpacity
            onPress={onPressVerify}
            style={{
              backgroundColor: "#1a2e35",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Plus-Jakarta-Sans-Bold" }}>
              Verify Email
            </Text>
          </TouchableOpacity>
        </View>
      </ReactNativeModal>

    </ScrollView>
  );
};

export default SignUp;
