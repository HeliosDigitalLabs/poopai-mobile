import React from "react";
import { View, Text } from "react-native";
import { useDimensions } from "../../context/core/DimensionsContext";

interface HomeHeaderProps {
  userName?: string;
}

export default function HomeHeader({ userName }: HomeHeaderProps) {
  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate responsive values
  const headerFontSize = Math.min(screenHeight * 0.045, 36); // 4.5% of screen height, max 36px
  const headerMarginBottom = Math.min(screenHeight * 0.06, 48); // 6% of screen height, max 48px (mb-12)
  const headerMarginTop = Math.min(screenHeight * 0.04, 32); // 4% of screen height, max 32px (mt-8)
  const letterSpacing = Math.min(screenHeight * 0.0006, 0.5); // Proportional letter spacing, max 0.5

  return (
    <View
      style={{ marginBottom: headerMarginBottom, marginTop: headerMarginTop }}
    >
      <Text
        style={{
          fontSize: headerFontSize,
          fontFamily: "Super Adorable",
          fontWeight: "normal", // Custom fonts often don't need bold
          color: "#2D3748",
          textAlign: "center",
          letterSpacing: letterSpacing,
          textShadowColor: "rgba(0, 0, 0, 0.1)",
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
      >
        Welcome{userName ? `, ${userName}` : ""}!
      </Text>
    </View>
  );
}
