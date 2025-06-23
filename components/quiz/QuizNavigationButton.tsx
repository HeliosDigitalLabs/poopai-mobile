import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface QuizNavigationButtonProps {
  onPress: () => void;
  isEnabled?: boolean;
  direction: "next" | "back";
  position: "bottom-right" | "bottom-left";
  enableVerticalAlignment?: boolean; // Only enable when there are paired buttons
}

export default function QuizNavigationButton({
  onPress,
  isEnabled = true,
  direction,
  position,
  enableVerticalAlignment = false,
}: QuizNavigationButtonProps) {
  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate responsive values
  const nextButtonWidth = Math.min(screenWidth * 0.22, 90); // 22% of screen width, max 90px
  const nextButtonHeight = Math.min(screenHeight * 0.08, 68); // 8% of screen height, max 68px
  const backButtonWidth = Math.min(screenWidth * 0.2, 80); // 20% of screen width, max 80px
  const backButtonHeight = Math.min(screenHeight * 0.07, 60); // 7% of screen height, max 60px
  const buttonBorderRadius = Math.min(screenHeight * 0.05, 40); // 5% of screen height, max 40px
  const innerBorderRadius = buttonBorderRadius - 4; // Inner border radius
  const bottomPosition = Math.min(screenHeight * 0.025, 20); // 2.5% of screen height, max 20px
  const sidePosition = Math.min(screenWidth * 0.05, 20); // 5% of screen width, max 20px
  const nextFontSize = Math.min(screenHeight * 0.022, 18); // 2.2% of screen height, max 18px
  const backFontSize = Math.min(screenHeight * 0.02, 16); // 2% of screen height, max 16px
  const shadowRadius = Math.min(screenHeight * 0.01, 8); // 1% of screen height, max 8px

  // Log dimensions for debugging
  console.log(
    `QuizNavigationButton dimensions: ${screenWidth}x${screenHeight}`
  );

  const isNext = direction === "next";
  const isLeft = position === "bottom-left";

  // Calculate vertical alignment offset to center buttons of different heights
  const heightDifference = Math.abs(nextButtonHeight - backButtonHeight);
  const verticalAlignmentOffset = !enableVerticalAlignment
    ? 0 // No alignment when only one button is shown (default)
    : isNext
      ? 0 // Next button is taller, so no offset needed
      : heightDifference / 2; // Back button gets offset to center-align with next button

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomPosition + verticalAlignmentOffset,
        [isLeft ? "left" : "right"]: sidePosition,
        zIndex: 10,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={!isEnabled}
        style={{
          width: isNext ? nextButtonWidth : backButtonWidth,
          height: isNext ? nextButtonHeight : backButtonHeight,
          borderRadius: buttonBorderRadius,
          overflow: "hidden",
          opacity: isEnabled ? 1 : 0.5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: shadowRadius,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={
            isEnabled
              ? isNext
                ? [
                    "rgba(59, 130, 246, 0.9)",
                    "rgba(37, 99, 235, 0.95)",
                    "rgba(29, 78, 216, 0.8)",
                  ]
                : [
                    "rgba(107, 114, 128, 0.9)",
                    "rgba(75, 85, 99, 0.95)",
                    "rgba(55, 65, 81, 0.8)",
                  ]
              : [
                  "rgba(156, 163, 175, 0.8)",
                  "rgba(107, 114, 128, 0.8)",
                  "rgba(75, 85, 99, 0.6)",
                ]
          }
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: buttonBorderRadius,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Frosted glass overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: buttonBorderRadius,
            }}
          />

          {/* Inner border glow */}
          <View
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              right: 4,
              bottom: 4,
              borderRadius: innerBorderRadius,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.4)",
            }}
          />

          <Text
            style={{
              color: isEnabled ? "white" : "rgba(255, 255, 255, 0.7)",
              fontSize: isNext ? nextFontSize : backFontSize,
              fontWeight: "700",
              textAlign: "center",
              textShadowColor: "rgba(0, 0, 0, 0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}
          >
            {isNext ? "▶" : "◀"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
