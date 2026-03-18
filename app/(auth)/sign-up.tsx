import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "../../components/CustomButton";
import InputField from "../../components/InputField";
import { icons, images } from "../../constants";

/**
 * SignUp Screen: Handles user registration and email verification using Clerk.
 */
const SignUp = () => {
  // 1. Clerk's useSignUp hook provides the logic for creating and verifying accounts.
  const { isLoaded, signUp, setActive } = useSignUp();

  // 2. State for the main sign-up form (name, email, password).
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 3. State for the verification modal (email code, success/error states).
  const [verification, setVerification] = useState({
    state: "default", // Possible states: default, pending, success, failed
    error: "",
    code: "",
  });

  /**
   * onSignUpPress: Initial registration step.
   * Sends the user's details to Clerk and triggers the verification email.
   */
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      // Create a new sign-up attempt with Clerk.
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      // Prepare the email verification (sends a code to the user).
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Open the verification modal by setting the state to 'pending'.
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      // Basic error handling for common sign-up issues (e.g., email already taken).
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  /**
   * onPressVerify: Verification step.
   * Sends the 6-digit code from the modal back to Clerk to finalize the account.
   */
  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      // Attempt to verify the email code.
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      // If successful, set the active session and show the success modal.
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
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
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Banner Section with background image and page title. */}
        <View className="relative w-full h-[250px]">
          <Image source={images.signupCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        {/* Main Sign-Up Form Fields. */}
        <View className="p-5">
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

          {/* Action button to trigger the sign-up process. */}
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          {/* Social login option (Google). */}
          {/* <OAuth /> */}

          {/* Navigation link for users who already have an account. */}
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        {/* Verification Modal: Appears after onSignUpPress succeeds. */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          // onBackdropPress={() => setVerification({ ...verification, state: "default" })}
          onModalHide={() => {
            if (verification.state === "success") {
              router.replace("/(root)/(tabs)/home");
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"123456"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

        {/* Success Modal: Appears after successful email verification. */}
        <ReactNativeModal isVisible={verification.state === "success"}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => router.replace("/(root)/(tabs)/home")}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
