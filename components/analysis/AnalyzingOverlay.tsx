import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import { useDimensions } from "../../context/core/DimensionsContext";
import PoopbotSvg from "../../assets/poopbot.svg";

interface AnalyzingOverlayProps {
  isAnalyzing: boolean;
}

export default function AnalyzingOverlay({
  isAnalyzing,
}: AnalyzingOverlayProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const botFloatY = useRef(new Animated.Value(0)).current;
  const botScale = useRef(new Animated.Value(0.9)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  // Add scanning line animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Get current device dimensions from context
  const { screenHeight } = useDimensions();

  // Calculate dynamic scanning line margins based on screen height
  const scanMargin = Math.min(screenHeight * 0.05, 50); // 5% of screen height, max 50px

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

  // Rotating funny messages
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = [
    "Analyzing poop...",
    "Judging your dump...",
    "Consulting my smell database...",
    "Processing your sample...",
    "Calculating stool quality...",
  ];

  useEffect(() => {
    if (isAnalyzing) {
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
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(dotsOpacity, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      dotsAnimation.start();

      // Add scanning line animation (behind PoopBot)
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      scanAnimation.start();

      // Sparkle generation every 1.5-2.5 seconds for natural feel
      const sparkleInterval = setInterval(
        () => {
          const numSparkles = 2 + Math.floor(Math.random() * 2); // 2-3 sparkles
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
            const radius = 40 + Math.random() * 30; // Around the bot's head
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius - 20; // Slightly above center

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
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.parallel([
                Animated.timing(sparkle.opacity, {
                  toValue: 0,
                  duration: 1200,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkle.translateY, {
                  toValue: -30,
                  duration: 1500,
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
        1500 + Math.random() * 1000
      ); // Every 1.5-2.5 seconds for natural timing

      // Message rotation every 2.5 seconds
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2500);

      return () => {
        dotsAnimation.stop();
        scanAnimation.stop();
        clearInterval(sparkleInterval);
        clearInterval(messageInterval);
      };
    } else {
      // Reset animations when not analyzing
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
      scanLineAnim.setValue(0);
      setSparkles([]);
      setCurrentMessageIndex(0);
    }
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  // Calculate scanning line position
  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [scanMargin, screenHeight - scanMargin],
  });

  return (
    <Animated.View
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: overlayOpacity }}
    >
      {/* Semi-transparent overlay */}
      <View className="absolute inset-0 bg-black/60" />

      {/* Scanning Line Animation (behind everything) */}
      <Animated.View
        className="absolute left-0 right-0"
        style={{
          transform: [{ translateY }],
          zIndex: 1,
        }}
      >
        {/* Outer glow */}
        <View
          className="h-8 bg-blue-400/10"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
            elevation: 20,
          }}
        />

        {/* Middle glow */}
        <View
          className="absolute inset-0 h-4 top-2 bg-blue-400/20"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 15,
          }}
        />

        {/* Core scanning line */}
        <View
          className="absolute inset-0 h-0.5 top-3.5 bg-blue-400"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 10,
          }}
        />
      </Animated.View>

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
              width: 4,
              height: 4,
              backgroundColor: "#FFD700",
              borderRadius: 2,
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
              shadowColor: "#FFD700",
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
            <PoopbotSvg width="150" height="150" />
          </View>
        </Animated.View>

        {/* Wavy energy lines above PoopBot */}
        <View className="absolute" style={{ transform: [{ translateY: -80 }] }}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              className="absolute w-12 h-0.5 bg-blue-400 rounded-full"
              style={{
                left: -24 + index * 8,
                top: -30 + index * 8,
                opacity: dotsOpacity,
                transform: [
                  {
                    scaleX: dotsOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.2],
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
