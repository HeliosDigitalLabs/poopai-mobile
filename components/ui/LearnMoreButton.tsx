import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useDimensions } from "../../context/core/DimensionsContext";

interface LearnMoreButtonProps {
  onPress: () => void;
  isCollapsed: boolean;
  size?: "small" | "medium" | "large";
  style?: any;
  disabled?: boolean;
}

export default function LearnMoreButton({
  onPress,
  isCollapsed,
  size = "medium",
  style,
  disabled = false,
}: LearnMoreButtonProps) {
  const { screenHeight, screenWidth } = useDimensions();

  // Size configurations - matching BlurToggleButton exactly
  const sizeConfig = {
    small: {
      padding: 12,
      iconSize: 20, // Added to match BlurToggleButton
      fontSize: screenHeight * 0.014,
      borderRadius: 18,
      minWidth: screenWidth * 0.15, // Changed to match BlurToggleButton
    },
    medium: {
      padding: 16,
      iconSize: 24, // Added to match BlurToggleButton
      fontSize: screenHeight * 0.016,
      borderRadius: 22,
      minWidth: screenWidth * 0.2, // Changed to match BlurToggleButton
    },
    large: {
      padding: 20,
      iconSize: 28, // Added to match BlurToggleButton
      fontSize: screenHeight * 0.018,
      borderRadius: 26,
      minWidth: screenWidth * 0.25, // Changed to match BlurToggleButton
    },
  };

  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={style}
    >
      <BlurView
        intensity={8}
        tint="dark"
        style={{
          borderRadius: config.borderRadius,
          paddingHorizontal: config.padding,
          paddingVertical: config.padding * 0.9, // Increased from 0.75 to make it taller
          borderWidth: 1.5,
          borderColor: "rgba(168, 85, 247, 0.6)", // Brighter purple border
          backgroundColor: "rgba(168, 85, 247, 0.4)", // Brighter purple background
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          overflow: "hidden",
        }}
      >
        {/* Light purple overlay for glassmorphic effect */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(168, 85, 247, 0.3)", // Brighter purple overlay
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
          <Text
            style={{
              color: "#FFFFFF", // Always white text
              fontSize: config.fontSize,
              fontWeight: "700",
              textAlign: "center",
              textShadowColor: "rgba(0, 0, 0, 0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {isCollapsed ? "🔼 Collapse" : "📚 Learn More"}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}
