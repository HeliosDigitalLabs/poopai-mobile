import React from "react";
import { TouchableOpacity, Text, Animated, View } from "react-native";
import { BlurView } from "expo-blur";
import { useDimensions } from "../../context/core/DimensionsContext";

interface RetryButtonProps {
  onPress: () => void;
  scale?: Animated.Value | number;
}

export default function RetryButton({ onPress, scale = 1 }: RetryButtonProps) {
  const { screenHeight, screenWidth } = useDimensions();

  const buttonWidth = screenWidth * 0.28; // 28% of screen width (reduced from 35%)
  const buttonHeight = screenHeight * 0.06; // 6% of screen height (smaller than analyze)
  const borderRadius = 12; // Fixed rounded corners
  const fontSize = screenHeight * 0.018; // 1.8% of screen height

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
            borderColor: "rgba(239, 68, 68, 0.7)",
            backgroundColor: "rgba(239, 68, 68, 0.25)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingHorizontal: 12,
            }}
          >
            {/* Retry Icon - Left side, vertically centered */}
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: fontSize * 1.2,
                marginRight: 8,
                textShadowColor: "rgba(0, 0, 0, 0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              ↻
            </Text>

            {/* Text Content - Right side, left aligned */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: fontSize,
                  fontWeight: "800",
                  textAlign: "left",
                  textShadowColor: "rgba(0, 0, 0, 0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                  lineHeight: fontSize * 1.1,
                }}
              >
                Retake
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: fontSize,
                  fontWeight: "800",
                  textAlign: "left",
                  textShadowColor: "rgba(0, 0, 0, 0.8)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                  lineHeight: fontSize * 1.1,
                }}
              >
                Photo
              </Text>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}
