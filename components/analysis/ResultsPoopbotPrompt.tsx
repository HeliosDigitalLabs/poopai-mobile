import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import PoopbotSvg from "../../assets/poopbot.svg";
import { useDimensions } from "../../context/core/DimensionsContext";

export default function ResultsPoopbotPrompt() {
  const { screenHeight, screenWidth } = useDimensions();
  // Floating and pulsating animation values
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const bobY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const bubblePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Floating PoopBot
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 4,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: -4,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, {
          toValue: 1.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: -1.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatX, {
          toValue: 2,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: -2,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubblePulse, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(bubblePulse, {
          toValue: 0.98,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(bubblePulse, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    return () => {
      floatY.stopAnimation();
      floatX.stopAnimation();
      bobY.stopAnimation();
      rotation.stopAnimation();
      bubblePulse.stopAnimation();
    };
  }, []);

  const poopbotSize = screenHeight * 0.13;
  const bubbleWidth =
    screenWidth * 0.65; /* Increased from 0.45 to 0.65 for single line text */

  return (
    <View
      style={{
        alignItems: "center",
        marginBottom: 2,
        minHeight: screenHeight * 0.22, // Add minimum height to accommodate floating animation
        paddingTop: 4, // Reduced from 8 to 4 to decrease top gap
      }}
    >
      {/* Reduced from 6 to 2 */}
      {/* Floating PoopBot */}
      <Animated.View
        style={{
          transform: [
            { translateX: floatX },
            { translateY: Animated.add(Animated.add(floatY, bobY), 0) },
          ],
        }}
      >
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
      {/* Chat Bubble */}
      <Animated.View
        style={{
          transform: [{ scale: bubblePulse }],
          marginTop: 8 /* Increased from -8 to 8 for more gap */,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.75)",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.6)",
            paddingHorizontal:
              screenWidth * 0.03 /* Reduced from 0.04 to 0.03 */,
            paddingVertical:
              screenWidth * 0.025 /* Reduced from 0.03 to 0.025 */,
            maxWidth: bubbleWidth,
            minHeight: screenHeight * 0.05 /* Reduced from 0.06 to 0.05 */,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: "#374151",
              fontSize: Math.round(
                screenHeight * 0.022
              ) /* Reduced from 0.025 to 0.022 */,
              fontWeight: "500",
              textAlign: "center",
              lineHeight:
                Math.round(screenHeight * 0.022) *
                1.3 /* Updated to match new font size */,
            }}
          >
            {"Here's what I can see..."}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
