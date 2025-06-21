import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useDimensions } from "../../context/core/DimensionsContext";

interface BlurToggleButtonProps {
  isBlurred: boolean;
  onPress: () => void;
  size?: "small" | "medium" | "large";
}

export default function BlurToggleButton({
  isBlurred,
  onPress,
  size = "medium",
}: BlurToggleButtonProps) {
  const { screenHeight, screenWidth } = useDimensions();

  // Size configurations
  const sizeConfig = {
    small: {
      padding: 12,
      iconSize: 20,
      fontSize: screenHeight * 0.014,
      borderRadius: 20,
      minWidth: screenWidth * 0.15,
    },
    medium: {
      padding: 16,
      iconSize: 24,
      fontSize: screenHeight * 0.016,
      borderRadius: 24,
      minWidth: screenWidth * 0.2,
    },
    large: {
      padding: 20,
      iconSize: 28,
      fontSize: screenHeight * 0.018,
      borderRadius: 28,
      minWidth: screenWidth * 0.25,
    },
  };

  const config = sizeConfig[size];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView
        intensity={8} // Reduced intensity to show color better
        tint="dark" // Use dark tint when blurred for better color overlay
        style={{
          borderRadius: config.borderRadius,
          paddingHorizontal: config.padding,
          paddingVertical: config.padding * 0.75,
          borderWidth: 1.5,
          borderColor: isBlurred
            ? "rgba(147, 197, 253, 0.5)" // Lighter blue border when blurred (Show state)
            : "rgba(248, 113, 113, 0.5)", // Lighter red border when not blurred (Hide state)
          backgroundColor: isBlurred
            ? "rgba(147, 197, 253, 0.3)" // Lighter blue background when blurred (Show state)
            : "rgba(248, 113, 113, 0.3)", // Lighter red background when not blurred (Hide state)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          minWidth: config.minWidth,
          overflow: "hidden",
        }}
      >
        {/* Additional colored overlay for blur effect */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isBlurred
              ? "rgba(147, 197, 253, 0.25)" // Lighter blue overlay when blurred (Show state)
              : "rgba(248, 113, 113, 0.25)", // Lighter red overlay when not blurred (Hide state)
            borderRadius: config.borderRadius,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons
            name={isBlurred ? "eye-outline" : "eye-off-outline"}
            size={config.iconSize}
            color="#FFFFFF" // Always white
          />
          <Text
            style={{
              color: "#FFFFFF", // Always white
              fontSize: config.fontSize,
              fontWeight: "700",
              textAlign: "center",
              textShadowColor: "rgba(0, 0, 0, 0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {isBlurred ? "Show Poop" : "Hide Poop"}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}
