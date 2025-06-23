import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LoadingScreenProps {
  progress?: number;
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({
  progress = 0,
  onLoadingComplete,
}: LoadingScreenProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundFadeAnim = useRef(new Animated.Value(0)).current;
  const whiteOverlayAnim = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get("window");
  const progressBarWidth = width * 0.7;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Sync background reveal with progress - start revealing background at 25% progress
    if (progress >= 25) {
      const backgroundProgress = Math.min((progress - 25) / 75, 1); // 25% to 100% maps to 0 to 1

      Animated.timing(backgroundFadeAnim, {
        toValue: backgroundProgress,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Start fading out white overlay as background becomes visible
      Animated.timing(whiteOverlayAnim, {
        toValue: 1 - backgroundProgress * 0.7, // Keep some white overlay until near completion
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    // When progress reaches 100%, start the exit animation
    if (progress >= 100) {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600, // Smooth exit animation
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 600,
            useNativeDriver: true,
          }),
          // Final fade of white overlay
          Animated.timing(whiteOverlayAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        });
      }, 100); // Brief pause at 100% before exit
    }
  }, [
    progress,
    progressAnim,
    fadeAnim,
    scaleAnim,
    backgroundFadeAnim,
    whiteOverlayAnim,
    onLoadingComplete,
  ]);

  useEffect(() => {
    // Pulse animation for the text
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, progressBarWidth],
    extrapolate: "clamp",
  });

  const textOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ffffff", // Solid white base to prevent any transparency
        zIndex: 9999,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {/* Background that matches the app's global background exactly */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: backgroundFadeAnim,
        }}
      >
        <LinearGradient
          colors={["#ffffff", "#f1f5f9", "#cbd5e1"]}
          style={{ flex: 1 }}
        >
          <ImageBackground
            source={require("../../assets/toilet-paper.png")}
            style={{ flex: 1 }}
            resizeMode="cover"
            imageStyle={{
              opacity: 0.25,
              transform: [{ scale: 1 }],
            }}
          >
            <LinearGradient
              colors={[
                "rgba(123, 170, 247, 0.1)",
                "rgba(37, 99, 235, 0.15)",
                "rgba(97, 131, 224, 0.1)",
              ]}
              style={{ flex: 1 }}
            />
          </ImageBackground>
        </LinearGradient>
      </Animated.View>

      {/* Animated white overlay that starts opaque and fades out to reveal background */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#ffffff",
          opacity: whiteOverlayAnim,
          pointerEvents: "none",
        }}
      />

      {/* Loading content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Progress Bar Container */}
        <View className="mb-8">
          <View
            className="bg-gray-200 rounded-full h-2"
            style={{ width: progressBarWidth }}
          >
            <Animated.View
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: progressWidth }}
            />
          </View>

          {/* Progress Percentage */}
          <Text className="text-gray-400 text-sm text-center mt-2">
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Loading Text */}
        <Animated.Text
          className="text-xl text-gray-600 font-bold tracking-wide"
          style={{ opacity: textOpacity }}
        >
          Crowning...
        </Animated.Text>
      </View>
    </Animated.View>
  );
}
