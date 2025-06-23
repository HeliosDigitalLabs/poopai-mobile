import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeroPrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
}

export default function HeroPrimaryButton({
  title,
  onPress,
  disabled = false,
  width = 220,
  height = 70,
  fontSize = 20,
}: HeroPrimaryButtonProps) {
  // Animation values for floating and glow effects
  const floatY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.7)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shimmerTranslateX = useRef(new Animated.Value(-width)).current;

  // Floating animation
  useEffect(() => {
    const createFloatingAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, {
            toValue: -3,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 3,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createFloatingAnimation();
  }, []);

  // Pulsing glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Shimmer effect animation
  useEffect(() => {
    const shimmerAnimation = () => {
      shimmerTranslateX.setValue(-width);
      Animated.timing(shimmerTranslateX, {
        toValue: width * 2,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        // Wait before next shimmer
        setTimeout(shimmerAnimation, 3000 + Math.random() * 2000);
      });
    };

    // Start first shimmer after a delay
    setTimeout(shimmerAnimation, 1000);
  }, [width]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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
        transform: [{ translateY: floatY }, { scale: scaleValue }],
      }}
    >
      {/* Outer glow effect with blurred edges - very small and subtle */}
      <Animated.View
        style={{
          position: "absolute",
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderRadius: height / 2 + 4,
          opacity: glowOpacity,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[
            "transparent", // Completely transparent at outer edge
            "rgba(59, 130, 246, 0.06)",
            "rgba(59, 130, 246, 0.12)",
            "rgba(147, 197, 253, 0.15)",
            "rgba(219, 234, 254, 0.12)",
            "rgba(219, 234, 254, 0.06)",
            "transparent", // Fade back to transparent at inner edge
          ]}
          style={{
            flex: 1,
            borderRadius: height / 2 + 4,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Additional soft blur layer for extra smoothness - very small */}
      <Animated.View
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: height / 2 + 2,
          opacity: Animated.multiply(glowOpacity, 0.5),
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={[
            "transparent",
            "rgba(59, 130, 246, 0.08)",
            "rgba(147, 197, 253, 0.10)",
            "rgba(219, 234, 254, 0.08)",
            "transparent",
          ]}
          style={{
            flex: 1,
            borderRadius: height / 2 + 2,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

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
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={
            disabled
              ? [
                  "rgba(156, 163, 175, 0.8)",
                  "rgba(107, 114, 128, 0.8)",
                  "rgba(75, 85, 99, 0.6)",
                ]
              : [
                  "rgba(174, 205, 255, 0.95)",
                  "rgba(98, 148, 255, 0.95)",
                  "rgba(37, 99, 235, 0.98)",
                  "rgba(59, 130, 246, 0.95)",
                ]
          }
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Frosted glass overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(219, 234, 254, 0.25)",
            }}
          />

          {/* Inner border glow */}
          <View
            style={{
              position: "absolute",
              top: 3,
              left: 3,
              right: 3,
              bottom: 3,
              borderRadius: height / 2 - 3,
              borderWidth: 1.5,
              borderColor: "rgba(219, 234, 254, 0.6)",
            }}
          />

          {/* Shimmer effect */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 40,
              backgroundColor: "rgba(219, 234, 254, 0.3)",
              transform: [
                { translateX: shimmerTranslateX },
                { skewX: "-20deg" },
              ],
            }}
          />

          {/* Button text */}
          <Text
            style={{
              color: disabled ? "rgba(255, 255, 255, 0.6)" : "white",
              fontSize: fontSize * 1.25,
              fontWeight: "700",
              textAlign: "center",
              textShadowColor: "rgba(0, 0, 0, 0.25)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
              letterSpacing: 0.5,
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
