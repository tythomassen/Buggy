import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Explore Cape May ",
    description: "Your journey begins with Buggy. Find your ideal ride effortlessly.",
    bg: require("@/assets/images/cape-may.webp"),
  },
  {
    id: 2,
    title: "Best car in your\nhands with BUG2",
    description: "Discover the convenience of finding your perfect drive with BUG2.",
    bg: require("@/assets/images/lighthouseWelcome.png"),
  },
  {
    id: 3,
    title: "Your ride, your\nway. Let's go!",
    description: "Enter your destination address and let us take care of the rest.",
    bg: require("@/assets/images/cape-may-beach.jpg"),
  },
];

const Welcome = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Slides — each with its own background */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {slides.map((slide) => (
          <ImageBackground
            key={slide.id}
            source={slide.bg}
            style={[styles.slide, { width }]}
            resizeMode="cover"
          >
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={styles.overlay} />
            </View>
            <View style={styles.slideContent}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </ImageBackground>
        ))}
      </ScrollView>

      {/* Logo + buttons float on top */}
      <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.logoContainer} pointerEvents="none">
          <Image
            source={require("@/assets/images/buggyicon.png")}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Buggy</Text>
        </View>

        <View style={{ flex: 1 }} pointerEvents="none" />

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
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  slideContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 175, // How far text is from bottom of screen
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
