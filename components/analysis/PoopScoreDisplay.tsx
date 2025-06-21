import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../context/auth/AuthContext";
import { RootStackParamList } from "../../types/navigation";
import { useDimensions } from "../../context/core/DimensionsContext";

// Import SVG components
import ToiletIconBackdropSvg from "../../assets/toilet_icon_backdrop.svg";
import ToiletSvg from "../../assets/toilet.svg";

const AnimatedImage = Animated.createAnimatedComponent(Image);

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface PoopScoreDisplayProps {
  score?: number; // Now expects scores from 0-10, or -1 for "no score" state
  size?: number; // Optional size prop, defaults to responsive calculation
}

export default function PoopScoreDisplay({
  score = 5.0,
  size,
}: PoopScoreDisplayProps) {
  const { isAuthenticated, setShowAuthOverlay } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Get current device dimensions from context
  const { screenHeight } = useDimensions();

  // Use provided size or calculate responsive default (only using screen height)
  const displaySize = size || screenHeight * 0.2; // 20% of screen height as default
  const backdropSize = displaySize * 1.264; // Proportional to main size (316/250 ratio)
  const backdropOffset = displaySize * -0.132; // Proportional offset (-33/250 ratio)

  // Calculate responsive values based on display size
  const scoreFontSize = displaySize * 0.328; // Proportional to size (82/250 ratio)
  const instructionFontSize = displaySize * 0.08; // Proportional to size (16/250 ratio)
  const labelFontSize = displaySize * 0.104; // Proportional to size (26/250 ratio)
  const labelMarginTop = displaySize * 0.144; // Proportional to size (36/250 ratio)

  // Convert score to 0-100 range for internal animations (score * 10)
  // Handle -1 as a special "no score" state
  const normalizedScore =
    score === -1 ? 0 : Math.max(0, Math.min(score * 10, 100));
  const animatedScore = useRef(new Animated.Value(normalizedScore)).current;

  // Animation values for floating effect
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate score changes - convert score to 0-100 range for animations
    const normalizedTarget =
      score === -1 ? 0 : Math.max(0, Math.min(score * 10, 100));
    Animated.timing(animatedScore, {
      toValue: normalizedTarget,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  // Create seamless floating animation
  useEffect(() => {
    const createSeamlessFloatingAnimation = (
      translateY: Animated.Value,
      translateX: Animated.Value,
      rotateValue: Animated.Value
    ) => {
      const animateToRandomPosition = () => {
        // Generate random target positions within a small radius
        const randomY = (Math.random() - 0.5) * 8; // -4 to +4
        const randomX = (Math.random() - 0.5) * 6; // -3 to +3
        const randomRotation = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2

        // Random duration between 2.5-4.5 seconds for natural movement
        const duration = 2500 + Math.random() * 2000;

        const animations = [
          Animated.timing(translateY, {
            toValue: randomY,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: randomX,
            duration: duration + Math.random() * 800, // Slightly different timing
            useNativeDriver: true,
          }),
          Animated.timing(rotateValue, {
            toValue: randomRotation,
            duration: duration + Math.random() * 1500, // Different timing for rotation
            useNativeDriver: true,
          }),
        ];

        Animated.parallel(animations).start(() => {
          // Recursively call to continue the animation seamlessly
          animateToRandomPosition();
        });
      };

      // Start animation with small delay
      setTimeout(() => {
        animateToRandomPosition();
      }, 500);
    };

    // Start floating animation
    createSeamlessFloatingAnimation(floatY, floatX, rotate);

    return () => {
      // Stop animations by removing all listeners
      floatY.stopAnimation();
      floatX.stopAnimation();
      rotate.stopAnimation();
    };
  }, []);

  // Calculate the fill height (how much to show from bottom)
  const fillHeight = animatedScore.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  // Color interpolation from red (0) to yellow (50) to green (100)
  const fillColor = animatedScore.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ["rgb(220, 53, 69)", "rgb(255, 193, 7)", "rgb(40, 167, 69)"], // red -> yellow -> green
  });

  const handlePress = () => {
    if (isAuthenticated) {
      navigation.navigate("Profile");
    } else {
      setShowAuthOverlay(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <View className="items-center justify-center mb-8">
        <Animated.View
          style={{
            transform: [
              { translateY: floatY },
              { translateX: floatX },
              {
                rotate: rotate.interpolate({
                  inputRange: [-0.2, 0.2],
                  outputRange: ["-0.5deg", "0.5deg"],
                }),
              },
            ],
            alignItems: "center",
          }}
        >
          <View
            style={{
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 1, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Container for the toilet images */}
            <View
              style={{
                width: displaySize,
                height: displaySize,
                position: "relative",
              }}
            >
              {/* Toilet icon backdrop SVG - behind everything */}
              <View
                style={{
                  position: "absolute",
                  width: backdropSize,
                  height: backdropSize,
                  top: backdropOffset,
                  left: backdropOffset,
                  zIndex: 0,
                }}
              >
                <ToiletIconBackdropSvg
                  width={backdropSize}
                  height={backdropSize}
                  style={{
                    width: backdropSize,
                    height: backdropSize,
                  }}
                />
              </View>

              {/* Toilet fill PNG with cropping and color tinting */}
              <View
                style={{
                  position: "absolute",
                  width: displaySize,
                  height: displaySize,
                  overflow: "hidden", // This will crop the content
                  zIndex: 1,
                }}
              >
                <Animated.View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: fillHeight,
                    overflow: "hidden",
                  }}
                >
                  {/* Toilet fill PNG with tintColor for proper masking */}
                  <Animated.Image
                    source={require("../../assets/toilet-fill.png")}
                    style={{
                      width: displaySize,
                      height: displaySize,
                      position: "absolute",
                      bottom: 0,
                      tintColor: fillColor, // This will tint only the non-transparent parts
                    }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </View>

              {/* Toilet outline SVG on top */}
              <ToiletSvg
                width={displaySize}
                height={displaySize}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 2,
                }}
              />
            </View>

            {/* Score number overlaid on top */}
            <View
              style={{
                position: "absolute",
                top: displaySize * 0.048, // Proportional to size (12/250 ratio)
                left: displaySize * 0.08, // Proportional to size (20/250 ratio)
                right: 0,
                bottom: 0,
                alignItems: "flex-start",
                justifyContent: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: scoreFontSize,
                  fontWeight: "bold",
                  color: "#374151",
                  textShadowColor: "rgba(255, 255, 255, 0.9)",
                  textShadowOffset: { width: 2, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {score === -1
                  ? "?"
                  : Number.isInteger(score)
                    ? score.toString()
                    : score.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Overlay banner for "no score" state - positioned outside toilet container for proper layering */}
          {score === -1 && (
            <View
              style={{
                position: "absolute",
                top: displaySize * 0.62, // Proportional to size (180/250 ratio)
                left: displaySize * -0.08, // Proportional to size (-20/250 ratio)
                right: displaySize * -0.08, // Proportional to size (-20/250 ratio)
                backgroundColor: "rgba(59, 130, 246, 0.95)",
                paddingVertical: displaySize * 0.032, // Proportional to size (8/250 ratio)
                paddingHorizontal: displaySize * 0.064, // Proportional to size (16/250 ratio)
                borderRadius: displaySize * 0.048, // Proportional to size (12/250 ratio)
                transform: [{ rotate: "-2deg" }],
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: displaySize * 0.016, // Proportional to size (4/250 ratio)
                },
                shadowOpacity: 0.3,
                shadowRadius: displaySize * 0.032, // Proportional to size (8/250 ratio)
                elevation: 8,
                zIndex: 10, // Ensure it appears above everything
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: instructionFontSize,
                  fontWeight: "bold",
                  textAlign: "center",
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: {
                    width: displaySize * 0.004, // Proportional to size (1/250 ratio)
                    height: displaySize * 0.004, // Proportional to size (1/250 ratio)
                  },
                  textShadowRadius: displaySize * 0.008, // Proportional to size (2/250 ratio)
                }}
              >
                Scan your poop to get a poop score
              </Text>
            </View>
          )}

          {/* Label below the poop score display - now inside animated view */}
          <Text
            style={{
              fontSize: labelFontSize,
              fontWeight: "bold",
              color: "#374151",
              marginTop: labelMarginTop,
              textAlign: "center",
            }}
          >
            Poop Score
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}
