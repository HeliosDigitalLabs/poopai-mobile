import React from "react";
import { TouchableOpacity, Text, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { useDimensions } from "../../context/core/DimensionsContext";

interface AnalyzeButtonProps {
  onPress: () => void;
  scale?: Animated.Value | number;
  fullWidth?: boolean; // Add fullWidth prop
}

export default function AnalyzeButton({
  onPress,
  scale = 1,
  fullWidth = false, // Default to false for backwards compatibility
}: AnalyzeButtonProps) {
  const { screenHeight, screenWidth } = useDimensions();

  // Adjust width based on fullWidth prop
  const buttonWidth = fullWidth
    ? screenWidth * 0.84 // Full width minus padding (100% - 16% padding = 84%)
    : screenWidth * 0.56; // Original width (56% of screen width)
  const buttonHeight = screenHeight * 0.08; // 8% of screen height
  const borderRadius = 16; // Fixed rounded corners
  const fontSize = screenHeight * 0.02; // 2% of screen height

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <BlurView
          intensity={25}
          tint="light"
          style={{
            width: buttonWidth,
            height: buttonHeight,
            borderRadius: borderRadius,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 2,
            borderColor: "rgba(22, 163, 74, 0.9)",
            backgroundColor: "rgba(10, 185, 75, 0.45)",
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: fontSize,
              fontWeight: "800",
              textAlign: "center",
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            ✓ Let's check it!
          </Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}
