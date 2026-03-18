// import { useSignIn } from "@clerk/clerk-expo"; *****
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "../../components/CustomButton";
import InputField from "../../components/InputField";
import OAuth from "../../components/OAuth";
import { icons, images } from "../../constants";

/**
 * SignIn Screen: Handles user login and session creation using Clerk.
 */
const SignIn = () => {
  // 1. Clerk's useSignIn hook provides the logic for logging in existing users.
  // const { signIn, setActive, isLoaded } = useSignIn(); *****

  // 2. State for the login form (email and password).
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  /**
   * onSignInPress: Main login handler.
   * Sends the user's credentials to Clerk to start a session.
   */
  const onSignInPress = useCallback(async () => {
    // if (!isLoaded) return; *****

    // TEMPORARY: Skip Clerk and just navigate to the home screen
    router.replace("/(root)/(tabs)/home");

    /*
    try { *****
      // Attempt to sign in with email and password. *****
      const signInAttempt = await signIn.create({ *****
        identifier: form.email, *****
        password: form.password, *****
      }); *****

      // If the sign-in is complete, set the session as active. *****
      if (signInAttempt.status === "complete") { *****
        await setActive({ session: signInAttempt.createdSessionId }); *****
        router.replace("/(root)/(tabs)/home"); *****
      } else { *****
        // Handle cases like two-factor authentication if needed. *****
        console.log(JSON.stringify(signInAttempt, null, 2)); *****
      } *****
    } catch (err: any) { *****
      // Basic error handling for login failures (e.g., wrong password). *****
      Alert.alert("Error", err.errors[0].longMessage); *****
    } *****
    */
  }, [/* isLoaded, signIn, setActive, */ form.email, form.password]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Banner Section with background image and page title. */}
        <View className="relative w-full h-[250px]">
          <Image source={images.signupCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome Back
          </Text>
        </View>

        {/* Main Sign-In Form Fields. */}
        <View className="p-5">
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

          {/* Action button to trigger the sign-in process. */}
          <CustomButton
            title="Log In"
            onPress={onSignInPress}
            className="mt-6"
          />

          {/* Social login option (Google). */}
          <OAuth />

          {/* Navigation link for users who don't have an account yet. */}
          <Link
            href="/sign-up"
            className="text-lg text-center text-general-200 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
