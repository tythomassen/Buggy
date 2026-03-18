import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StatusBar } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-500">
        Hi Dad!
      <StatusBar style="auto" />
      </Text>
    </SafeAreaView>
  );
}

