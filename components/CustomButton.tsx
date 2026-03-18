import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "../types/type";

/**
 * Helper function to determine the background color of the button based on the 'bgVariant' prop.
 * This keeps the main component clean and modular.
 */
const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-gray-500";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-neutral-300 border-[0.5px]";
    default:
      // The default 'primary' blue color used throughout the app.
      return "bg-[#0286FF]";
  }
};

/**
 * Helper function to determine the text color of the button based on the 'textVariant' prop.
 * Ensures the text contrast is correct for each background variant.
 */
const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      // Default white text for better readability on darker backgrounds.
      return "text-white";
  }
};

/**
 * CustomButton Component: A highly reusable and stylable button.
 * 
 * Props:
 * - onPress: Function to call when the button is clicked.
 * - title: The label text inside the button.
 * - bgVariant: Preset style for the background (primary, danger, etc.).
 * - textVariant: Preset style for the text color.
 * - IconLeft / IconRight: Optional components (like icons) to show before or after the text.
 * - className: Additional Tailwind CSS classes to apply to the button container.
 * - ...props: Any other standard TouchableOpacity props (like 'disabled').
 */
const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      // Combines base styling (width, padding, etc.) with dynamic variant and custom classes.
      className={`w-full rounded-full p-3 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant)} ${className}`}
      {...props}
    >
      {/* 1. Render the left icon if provided. */}
      {IconLeft && <IconLeft />}

      {/* 2. Render the main button text with dynamic styling. */}
      <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>

      {/* 3. Render the right icon if provided. */}
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;
