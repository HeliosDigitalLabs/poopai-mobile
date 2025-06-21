import React from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { useDimensions } from "../../context/core/DimensionsContext";

interface CameraWarningPillProps {
  isVisible?: boolean;
}

export default function CameraWarningPill({
  isVisible = true,
}: CameraWarningPillProps) {
  const { screenWidth, screenHeight } = useDimensions();

  if (!isVisible) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: screenHeight * 0.05, // 5% from bottom - moved down from 8%
        left: screenWidth * 0.05, // 5% margin from sides
        right: screenWidth * 0.05, // 5% margin from sides
        zIndex: 5,
        alignItems: "center",
        opacity: 0.4, // Lower overall opacity for the whole component
      }}
    >
      <BlurView
        intensity={15}
        tint="light"
        style={{
          borderRadius: 36, // Pill shape
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          backgroundColor: "rgba(255, 255, 255, 0.15)", // Much more transparent
          overflow: "hidden", // Ensures content respects border radius
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Warning Icon - Left side, vertically centered */}
          <Text
            style={{
              fontSize: 16,
              marginRight: 8,
              textShadowColor: "rgba(0, 0, 0, 0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            ⚠️
          </Text>

          {/* Text Content - Right side, center aligned */}
          <View style={{ alignItems: "center" }}>
            {/* First line of text */}
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: "700",
                textAlign: "center",
                lineHeight: 18,
                textShadowColor: "rgba(0, 0, 0, 0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              Only stool images are analyzed.
            </Text>

            {/* Second line of text - light gray */}
            <Text
              style={{
                color: "#CCCCCC",
                fontSize: 13,
                fontWeight: "700",
                textAlign: "center",
                lineHeight: 18,
                textShadowColor: "rgba(0, 0, 0, 0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              All images count as scans.
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}
