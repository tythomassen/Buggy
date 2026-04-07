import { View, Image } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
  placeholder,
  dropdownAbove,
}: GoogleInputProps) => (
  <View
    className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
  >
    <GooglePlacesAutocomplete
      fetchDetails={true}
      placeholder={placeholder ?? "Search"}
      debounce={200}
      styles={{
        textInputContainer: {
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          marginHorizontal: 20,
          position: "relative",
          shadowColor: "#d4d4d4",
        },
        textInput: {
          backgroundColor: textInputBackgroundColor
            ? textInputBackgroundColor
            : "white",
          fontSize: 16,
          fontWeight: "600",
          marginTop: 5,
          width: "100%",
          borderRadius: 200,
        },
        listView: {
          backgroundColor: "white",
          position: "absolute",
          top: dropdownAbove ? undefined : 44,
          bottom: dropdownAbove ? 44 : undefined,
          left: 20,
          right: 0,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
          zIndex: 999,
        },
      }}
      onPress={(data, details = null) => {
        handlePress({
          latitude: details?.geometry.location.lat!,
          longitude: details?.geometry.location.lng!,
          address: data.description,
        });
      }}
      query={{
        key: googlePlacesApiKey,
        language: "en",
      }}
      renderLeftButton={() => (
        <View className="justify-center items-center w-6 h-6">
          <Image
            source={icon ? icon : icons.search}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </View>
      )}
      textInputProps={{
        placeholderTextColor: "gray",
        placeholder: initialLocation ?? (placeholder ?? "Where do you want to go?"),
      }}
    />
  </View>
);

export default GoogleTextInput;
