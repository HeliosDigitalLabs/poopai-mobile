import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { BlurView } from "expo-blur";
import PoopbotSvg from "../../assets/poopbot.svg";
import { useDimensions } from "../../context/core/DimensionsContext";

interface AnalyzePromptProps {
  isVisible?: boolean;
  scale?: Animated.Value | number;
}

export default function AnalyzePrompt({
  isVisible = true,
  scale = 1,
}: AnalyzePromptProps) {
  const { screenHeight, screenWidth } = useDimensions();

  // Animation values for floating motion
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const bobY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.8)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubblePulse = useRef(new Animated.Value(1)).current; // New pulsating animation value

  // Separate animation values for chat bubble to create offset motion
  const bubbleFloatY = useRef(new Animated.Value(0)).current;
  const bubbleFloatX = useRef(new Animated.Value(0)).current;

  // Entrance/Exit animations with twist - Single container animation
  const containerScale = useRef(new Animated.Value(0)).current;
  const containerRotation = useRef(new Animated.Value(-180)).current; // Start at -180 degrees
  const containerOpacity = useRef(new Animated.Value(0)).current;

  // PoopBot size based on screen height
  const poopbotSize = screenHeight * 0.2; // 14% of screen height for better visual balance
  const bubbleWidth = screenWidth * 0.55; // 55% of screen width

  useEffect(() => {
    if (!isVisible) {
      // Exit animation - single container shrinking and rotating
      Animated.parallel([
        Animated.timing(containerScale, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(containerRotation, {
          toValue: -180, // Return to -180 for exit
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    // Entrance animation - single container growing and rotating
    Animated.parallel([
      Animated.spring(containerScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(containerRotation, {
        toValue: 0, // Rotate from -180 to 0 degrees while growing
        duration: 600,
        easing: Easing.out(Easing.back(1.2)), // Add some bounce to the rotation
        useNativeDriver: true,
      }),
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Bubble scale animation (independent of container)
    Animated.spring(bubbleScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Bubble opacity animation (independent of container)
    Animated.timing(bubbleOpacity, {
      toValue: 1,
      duration: 600, // Increased from 600 to 1200 for longer fade-in
      useNativeDriver: true,
    }).start();

    // Continuous floating animation
    const createFloatingMotion = () => {
      // Primary floating motion (seamless loop)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatY, {
            toValue: 4, // Go up first
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: -4, // Then down
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatY, {
            toValue: 0, // Return to center for seamless loop
            duration: 3500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Secondary bobbing motion (seamless loop)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobY, {
            toValue: 1.5,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bobY, {
            toValue: -1.5,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bobY, {
            toValue: 0, // Return to center
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Horizontal drift (seamless loop)
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatX, {
            toValue: 2,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatX, {
            toValue: -2,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatX, {
            toValue: 0, // Return to center
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Subtle rotation (seamless loop)
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotation, {
            toValue: 1,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: -1,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotation, {
            toValue: 0, // Return to center
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Chat bubble floating animations (offset from PoopBot, seamless loops)
      // Bubble vertical motion
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleFloatY, {
            toValue: 3,
            duration: 4000, // Rounder number for better sync
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleFloatY, {
            toValue: -3,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleFloatY, {
            toValue: 0, // Return to center
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Bubble horizontal drift (offset)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleFloatX, {
            toValue: -1.5, // Start opposite direction from PoopBot
            duration: 5000, // Rounder number
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleFloatX, {
            toValue: 1.5,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubbleFloatX, {
            toValue: 0, // Return to center
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Bubble pulsating animation (subtle growing/shrinking)
      Animated.loop(
        Animated.sequence([
          Animated.timing(bubblePulse, {
            toValue: 1.05, // Grow to 105%
            duration: 3000, // 3 second duration for gentle pulse
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubblePulse, {
            toValue: 0.98, // Shrink to 98%
            duration: 3000, // 3 second duration
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bubblePulse, {
            toValue: 1, // Return to normal size
            duration: 3000, // 3 second duration
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createFloatingMotion();

    // Cleanup animations on unmount
    return () => {
      floatY.stopAnimation();
      floatX.stopAnimation();
      bobY.stopAnimation();
      rotation.stopAnimation();
      bubbleScale.stopAnimation();
      bubbleOpacity.stopAnimation();
      bubbleFloatY.stopAnimation();
      bubbleFloatX.stopAnimation();
      bubblePulse.stopAnimation(); // Add cleanup for pulsating animation
      containerScale.stopAnimation();
      containerRotation.stopAnimation();
      containerOpacity.stopAnimation();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        alignItems: "center",
        justifyContent: "center",
        width: "100%", // Take full width to enable proper centering
      }}
    >
      {/* Single container for both PoopBot and Chat Bubble with unified entrance/exit animations */}
      <Animated.View
        style={{
          transform: [
            { scale: containerScale }, // Container scaling
            {
              rotate: containerRotation.interpolate({
                inputRange: [-180, 0],
                outputRange: ["-180deg", "0deg"],
                extrapolate: "clamp",
              }),
            }, // Container rotation
          ],
          opacity: containerOpacity, // Container opacity
          alignItems: "center",
          justifyContent: "center",
          width: "100%", // Take full width to enable proper centering
        }}
      >
        {/* Floating PoopBot */}
        <Animated.View
          style={{
            transform: [
              { translateX: floatX },
              { translateY: Animated.add(Animated.add(floatY, bobY), -20) }, // Moved up to be above the bubble
            ],
            alignItems: "center", // Ensure horizontal centering
            justifyContent: "center", // Ensure vertical centering
          }}
        >
          {/* Inner animated view for floating rotation */}
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotation.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ["-1deg", "1deg"],
                  }),
                },
              ],
            }}
          >
            <PoopbotSvg width={poopbotSize} height={poopbotSize} />
          </Animated.View>
        </Animated.View>

        {/* Simple Chat Bubble - Onboarding Style */}
        <Animated.View
          style={{
            transform: [
              { scale: Animated.multiply(bubbleScale, bubblePulse) }, // Combine bubble scale with pulsating animation
              { translateY: Animated.add(0, bubbleFloatY) }, // Moved closer to PoopBot - changed from 5 to -5
              { translateX: bubbleFloatX }, // Floating animation
            ],
            opacity: bubbleOpacity, // Independent bubble opacity
            marginTop: 0, // Negative margin to bring even closer - changed from 5 to -5
            alignItems: "center", // Ensure horizontal centering
            justifyContent: "center", // Ensure vertical centering
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.75)", // Increased opacity from 0.35 to 0.75
              borderRadius: 20, // Increased border radius for more modern look
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.6)", // Add glassmorphic border
              paddingHorizontal: screenWidth * 0.04, // 4% of screen width
              paddingVertical: screenWidth * 0.04, // 4% of screen width
              maxWidth: bubbleWidth * 1.1, // Reduced from 1.4 to 1.1 for narrower bubble
              minHeight: screenHeight * 0.08, // 8% of screen height
              justifyContent: "center",
              alignItems: "center", // Center the text horizontally within the bubble
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 }, // Increased shadow offset
              shadowOpacity: 0.15, // Reduced shadow opacity for softer look
              shadowRadius: 12, // Increased shadow radius
              elevation: 8, // Increased elevation
            }}
          >
            <Text
              style={{
                color: "#374151",
                fontSize: Math.round(screenHeight * 0.028),
                fontWeight: "500",
                textAlign: "center",
                lineHeight: Math.round(screenHeight * 0.028) * 1.3,
              }}
            >
              Ready for me to check it out?
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
