import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "../../components/CustomButton";
import { onboarding } from "../../constants";

const Home = () => {
  // 1. useRef is used to directly control the Swiper component (e.g., to trigger a manual scroll).
  const swiperRef = useRef<Swiper>(null);

  // 2. useState keeps track of which onboarding slide is currently being viewed.
  const [activeIndex, setActiveIndex] = useState(0);

  // 3. Logic to determine if we are on the very last slide of the onboarding array.
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    // SafeAreaView ensures content stays within the visible area (avoiding notches and home bars).
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      
      {/* 4. "Skip" Button: Immediately redirects to the sign-up screen, bypassing onboarding. */}
      <TouchableOpacity
        onPress={() => {
          router.replace("/(auth)/sign-up");
        }}
        className="w-full flex justify-end items-end p-5"
      >
        <Text className="text-black text-md font-JakartaBold">Skip</Text>
      </TouchableOpacity>

      {/* 5. Swiper Component: Handles the horizontal swiping between onboarding slides. */}
      <Swiper
        ref={swiperRef}
        loop={false} // Prevents the slides from wrapping back to the start.
        dot={
          // The inactive dots at the bottom of the screen.
          <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          // The highlighted dot for the current slide.
          <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
        }
        // Updates our state whenever the user swipes to a new slide.
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {/* 6. Map over the onboarding data to dynamically create each slide. */}
        {onboarding.map((item) => (
          <View key={item.id} className="flex items-center justify-center p-5">
            <Image
              source={item.image}
              className="w-full h-[300px]"
              resizeMode="contain"
            />
            <View className="flex flex-row items-center justify-center w-full mt-10">
              <Text className="text-black text-3xl font-bold mx-10 text-center">
                {item.title}
              </Text>
            </View>
            <Text className="text-md font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      {/* 7. Action Button: Either moves to the next slide OR redirects to sign-up if on the last slide. */}
      <CustomButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("/(auth)/sign-up") // If last slide, go to Sign-Up.
            : swiperRef.current?.scrollBy(1)    // Otherwise, move to the next slide.
        }
        className="w-11/12 mt-10 mb-5"
      />
    </SafeAreaView>
  );
};

export default Home;
