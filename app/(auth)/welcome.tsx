import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Onboarding = () => {
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="flex w-full items-end justify-end p-5"
      >
        <Text className="text-md font-JakartaBold text-black">Skip</Text>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-JakartaBold text-red-500">
          Onboarding!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
