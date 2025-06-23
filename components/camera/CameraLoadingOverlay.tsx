import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import PoopbotSvg from "../../assets/poopbot.svg";

interface CameraLoadingOverlayProps {
  isLoading: boolean;
}

export default function CameraLoadingOverlay({
  isLoading,
}: CameraLoadingOverlayProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const botFloatY = useRef(new Animated.Value(0)).current;
  const botScale = useRef(new Animated.Value(0.9)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  // Sparkle animations
  const [sparkles, setSparkles] = useState<
    Array<{
      id: number;
      opacity: Animated.Value;
      translateX: Animated.Value;
      translateY: Animated.Value;
      x: number;
      y: number;
    }>
  >([]);

  // Camera preparation messages
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = [
    "Getting the camera ready...",
    "Preparing the lens...",
    "Warming up sensors...",
    "Calibrating focus...",
    "Almost ready to scan!",
  ];

  useEffect(() => {
    if (isLoading) {
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Bot entrance animation
      Animated.sequence([
        Animated.parallel([
          Animated.spring(botScale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        // Start floating animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(botFloatY, {
              toValue: -8,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(botFloatY, {
              toValue: 8,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Animated dots in speech bubble
      const dotsAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotsOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotsOpacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      dotsAnimation.start();

      // Sparkle generation every 1.2-2.0 seconds for camera prep feel
      const sparkleInterval = setInterval(
        () => {
          const numSparkles = 1 + Math.floor(Math.random() * 2); // 1-2 sparkles (fewer than analyzing)
          const newSparkles: Array<{
            id: number;
            opacity: Animated.Value;
            translateX: Animated.Value;
            translateY: Animated.Value;
            x: number;
            y: number;
          }> = [];

          for (let i = 0; i < numSparkles; i++) {
            // Position sparkles around PoopBot's head area
            const angle = Math.random() * 2 * Math.PI;
            const radius = 35 + Math.random() * 25; // Slightly smaller radius for camera prep
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius - 15; // Slightly above center

            const sparkle = {
              id: Date.now() + i,
              opacity: new Animated.Value(0),
              translateX: new Animated.Value(0),
              translateY: new Animated.Value(0),
              x,
              y,
            };

            newSparkles.push(sparkle);

            // Animate sparkle
            const sparkleAnimation = Animated.sequence([
              Animated.timing(sparkle.opacity, {
                toValue: 0.7,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.parallel([
                Animated.timing(sparkle.opacity, {
                  toValue: 0,
                  duration: 1000,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkle.translateY, {
                  toValue: -25,
                  duration: 1400,
                  useNativeDriver: true,
                }),
              ]),
            ]);

            sparkleAnimation.start();

            // Clean up sparkle
            setTimeout(() => {
              setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
            }, 1800);
          }

          setSparkles((prev) => [...prev, ...newSparkles]);
        },
        1200 + Math.random() * 800
      ); // Every 1.2-2.0 seconds

      // Message rotation every 1.8 seconds (faster than analyzing)
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 1800);

      return () => {
        dotsAnimation.stop();
        clearInterval(sparkleInterval);
        clearInterval(messageInterval);
      };
    } else {
      // Fade out overlay when not loading
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Reset all animation values
      botScale.setValue(0.9);
      bubbleScale.setValue(0);
      botFloatY.setValue(0);
      dotsOpacity.setValue(0);
      setSparkles([]);
      setCurrentMessageIndex(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <Animated.View
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: overlayOpacity }}
    >
      {/* Semi-transparent overlay */}
      <View className="absolute inset-0 bg-black/70" />

      {/* Main content container */}
      <View
        className="flex-1 items-center justify-center"
        style={{ zIndex: 2 }}
      >
        {/* Sparkles around PoopBot */}
        {sparkles.map((sparkle) => (
          <Animated.View
            key={sparkle.id}
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              backgroundColor: "#60A5FA", // Blue sparkles for camera prep
              borderRadius: 1.5,
              opacity: sparkle.opacity,
              transform: [
                {
                  translateX: Animated.add(
                    new Animated.Value(sparkle.x),
                    sparkle.translateX
                  ),
                },
                {
                  translateY: Animated.add(
                    new Animated.Value(sparkle.y),
                    sparkle.translateY
                  ),
                },
              ],
              shadowColor: "#60A5FA",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 10,
              zIndex: 3,
            }}
          />
        ))}

        {/* Speech Bubble */}
        <Animated.View
          className="absolute"
          style={{
            transform: [
              { scale: bubbleScale },
              { translateY: -120 }, // Position above PoopBot
            ],
          }}
        >
          {/* Bubble background */}
          <View
            className="bg-white rounded-2xl px-6 py-4 border-2 border-gray-800"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text className="text-gray-800 text-lg font-medium text-center">
              {messages[currentMessageIndex]}
            </Text>

            {/* Animated dots */}
            <Animated.View
              className="flex-row justify-center mt-2 space-x-1"
              style={{ opacity: dotsOpacity }}
            >
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
              <View className="w-2 h-2 bg-blue-400 rounded-full" />
              <View className="w-2 h-2 bg-blue-300 rounded-full" />
            </Animated.View>
          </View>

          {/* Speech bubble tail */}
          <View
            className="absolute bottom-0 left-8 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-800"
            style={{
              transform: [{ rotate: "45deg" }, { translateY: 8 }],
            }}
          />
        </Animated.View>

        {/* PoopBot with floating animation */}
        <Animated.View
          style={{
            transform: [{ scale: botScale }, { translateY: botFloatY }],
          }}
        >
          <View
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 1, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <PoopbotSvg width="130" height="130" />
          </View>
        </Animated.View>

        {/* Camera prep energy lines above PoopBot */}
        <View className="absolute" style={{ transform: [{ translateY: -75 }] }}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              className="absolute w-10 h-0.5 bg-blue-400 rounded-full"
              style={{
                left: -20 + index * 6,
                top: -25 + index * 6,
                opacity: dotsOpacity,
                transform: [
                  {
                    scaleX: dotsOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.1],
                    }),
                  },
                ],
              }}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
