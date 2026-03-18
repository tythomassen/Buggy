import { Text } from "react-native";
import { SafeAreaView} from "react-native-safe-area-context";

const SignUP = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-red-500">
        Sign UP!
      </Text>
    </SafeAreaView>
  );
}