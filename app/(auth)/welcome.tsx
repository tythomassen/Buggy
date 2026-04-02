import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const { height } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Explore Cape May ",
    description:
      "Your journey begins with Buggy. Find your ideal ride effortlessly.",
  },
  {
    id: 2,
    title: "Best car in your\nhands with BUG2",
    description:
      "Discover the convenience of finding your perfect drive with BUG2.",
  },
  {
    id: 3,
    title: "Your ride, your\nway. Let's go!",
    description:
      "Enter your destination address and let us take care of the rest.",
  },
];

const Welcome = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/cape-may.webp")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.overlay} />
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          {/* App name at top */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/buggyicon.png")}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Buggy</Text>
          </View>

          {/* Swipeable slides */}
          <Swiper
            ref={swiperRef}
            loop={false}
            showsPagination={false}
            onIndexChanged={(index) => setActiveIndex(index)}
            style={{ flex: 1 }}
          >
            {slides.map((slide) => (
              <View key={slide.id} style={styles.slide}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            ))}
          </Swiper>

          {/* Buttons + dots pinned to bottom */}
          <View style={styles.bottomContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.replace("/(auth)/sign-up")}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Dot indicators */}
            <View style={styles.dotsContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 45,
    gap: 10,
  },
  logoIcon: {
    width: 75,
    height: 75,
  },
  logoText: {
    color: "white",
    fontSize: 60,
    fontFamily: "LibreBodoni-BoldItalic",
    letterSpacing: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    color: "white",
    fontSize: 36,
    fontFamily: "Plus-Jakarta-Sans-ExtraBold",
    lineHeight: 44,
    marginBottom: 12,
  },
  description: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontFamily: "Plus-Jakarta-Sans-Regular",
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#B8F5C8",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Plus-Jakarta-Sans-SemiBold",
    color: "#1a1a1a",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: "white",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});

export default Welcome;
