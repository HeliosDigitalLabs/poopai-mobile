import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeroSecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
}

export default function HeroSecondaryButton({
  title,
  onPress,
  disabled = false,
  width = 180,
  height = 45,
  fontSize = 14,
}: HeroSecondaryButtonProps) {
  // Animation values for subtle hover effect
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{
          width,
          height,
          borderRadius: height / 2,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            disabled
              ? [
                  "rgba(156, 163, 175, 0.6)",
                  "rgba(107, 114, 128, 0.6)",
                  "rgba(75, 85, 99, 0.4)",
                ]
              : [
                  "rgba(255, 255, 255, 0.6)",
                  "rgba(248, 250, 252, 0.7)",
                  "rgba(241, 245, 249, 0.6)",
                  "rgba(226, 232, 240, 0.5)",
                ]
          }
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Subtle frosted glass overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
            }}
          />

          {/* Very subtle inner border */}
          <View
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              right: 2,
              bottom: 2,
              borderRadius: height / 2 - 2,
              borderWidth: 0.5,
              borderColor: "rgba(255, 255, 255, 0.6)",
            }}
          />

          {/* Button text */}
          <Text
            style={{
              color: disabled
                ? "rgba(107, 114, 128, 0.8)"
                : "rgba(75, 85, 99, 0.9)",
              fontSize,
              fontWeight: "600",
              textAlign: "center",
              textShadowColor: "rgba(255, 255, 255, 0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
              letterSpacing: 0.3,
              zIndex: 10,
            }}
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
