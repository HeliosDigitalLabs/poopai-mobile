import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../types/navigation";
import HomeHeader from "../../components/navigation/HomeHeader";
import PoopScoreDisplay from "../../components/analysis/PoopScoreDisplay";
import ScanCounter from "../../components/camera/ScanCounter";
import { useAuth } from "../../context/auth/AuthContext";
import { useScan } from "../../context/features/ScanContext";
import { useDimensions } from "../../context/core/DimensionsContext";

// Import SVGs directly as components
import CameraSvg from "../../assets/camera.svg";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreenMVP() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isAuthenticated, setShowAuthOverlay, user, refreshUserData } =
    useAuth();
  const { scansLeft, isPremium, refreshScanData } = useScan();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Get current device dimensions from context
  const { screenHeight } = useDimensions();

  // Calculate responsive values using only screen height
  const cameraButtonSize = screenHeight * 0.25; // 12% of screen height
  const poopScoreSize = screenHeight * 0.2; // 20% of screen height (direct sizing, not scale)

  // Layout calculations based on screen height only
  const spaceBetweenElements = screenHeight * 0.08; // 8% of screen height
  const mainContentMarginTop = -screenHeight * 0.06; // 6% negative margin for centering

  // Poop score positioning
  const poopScoreMarginBottom = spaceBetweenElements;

  // Label styling using screen height only
  const labelFontSize = screenHeight * 0.025; // 2.5% of screen height
  const labelMarginTop = screenHeight * 0.012; // 1.2% of screen height

  // Sparkle effects scaled to camera button
  const sparkleRadius = cameraButtonSize * 0.5; // Proportional to camera button
  const sparkleBaseRadius = cameraButtonSize * 0.42; // Better base radius

  // Add a ref to track if we're already refreshing to prevent multiple calls
  const isRefreshingRef = useRef(false);

  // Animation values for floating effect
  const cameraFloatY = useRef(new Animated.Value(0)).current;
  const cameraFloatX = useRef(new Animated.Value(0)).current;
  const cameraRotate = useRef(new Animated.Value(0)).current;

  const scoreFloatY = useRef(new Animated.Value(0)).current;
  const scoreFloatX = useRef(new Animated.Value(0)).current;
  const scoreRotate = useRef(new Animated.Value(0)).current;

  // Sparkle animation values for camera button
  const [sparkles, setSparkles] = React.useState<
    Array<{
      id: number;
      opacity: Animated.Value;
      translateX: Animated.Value;
      translateY: Animated.Value;
      x: number;
      y: number;
    }>
  >([]);

  // Create seamless floating animations
  useEffect(() => {
    // Request camera permission on mount
    const requestCameraPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        setHasPermission(false);
      }
    };

    requestCameraPermission();

    const createSeamlessFloatingAnimation = (
      translateY: Animated.Value,
      translateX: Animated.Value,
      rotate: Animated.Value,
      baseDelay: number = 0
    ) => {
      const animateToRandomPosition = () => {
        // Generate random target positions within a small radius
        const randomY = (Math.random() - 0.5) * 10; // -5 to +5
        const randomX = (Math.random() - 0.5) * 8; // -4 to +4
        const randomRotation = (Math.random() - 0.5) * 0.6; // -0.3 to +0.3

        // Random duration between 2-5 seconds for natural movement
        const duration = 2000 + Math.random() * 3000;

        const animations = [
          Animated.timing(translateY, {
            toValue: randomY,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: randomX,
            duration: duration + Math.random() * 1000, // Slightly different timing
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: randomRotation,
            duration: duration + Math.random() * 800, // Different timing for rotation
            useNativeDriver: true,
          }),
        ];

        // Run all animations in parallel
        Animated.parallel(animations).start(() => {
          // Continue the animation loop
          animateToRandomPosition();
        });
      };

      // Start the animation with a slight initial delay
      setTimeout(() => {
        animateToRandomPosition();
      }, baseDelay);
    };

    // Start floating animations for all buttons
    createSeamlessFloatingAnimation(
      cameraFloatY,
      cameraFloatX,
      cameraRotate,
      0
    );
    createSeamlessFloatingAnimation(scoreFloatY, scoreFloatX, scoreRotate, 800);

    // Sparkle animation around camera button (less frequent)
    const sparkleInterval = setInterval(
      () => {
        const sparkleCount = 3 + Math.random() * 4; // 3-6 sparkles
        const newSparkles: Array<{
          id: number;
          opacity: Animated.Value;
          translateX: Animated.Value;
          translateY: Animated.Value;
          x: number;
          y: number;
        }> = [];

        for (let i = 0; i < sparkleCount; i++) {
          // Position sparkles in a circle around the camera button with some randomness
          const angle = (i / sparkleCount) * 2 * Math.PI + Math.random() * 0.8;
          const radius =
            sparkleBaseRadius +
            Math.random() * (sparkleRadius - sparkleBaseRadius); // Dynamic radius based on camera button size
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const sparkle = {
            id: Date.now() + i,
            opacity: new Animated.Value(0),
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            x,
            y,
          };

          newSparkles.push(sparkle);

          // Add staggered delay for each sparkle (0-600ms)
          const delay = i * (50 + Math.random() * 450); // 50-500ms between each sparkle

          // Animate sparkle with delay: fade in, move in random direction, fade out
          setTimeout(() => {
            // Random movement direction and distance
            const randomDirection = Math.random() * 2 * Math.PI;
            const randomDistance = 20 + Math.random() * 40; // 20-60px movement
            const moveX = Math.cos(randomDirection) * randomDistance;
            const moveY = Math.sin(randomDirection) * randomDistance;

            const sparkleAnimation = Animated.sequence([
              Animated.timing(sparkle.opacity, {
                toValue: 0.9,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.parallel([
                Animated.timing(sparkle.opacity, {
                  toValue: 0,
                  duration: 1600,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkle.translateX, {
                  toValue: moveX, // Move in random direction
                  duration: 3000,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkle.translateY, {
                  toValue: moveY, // Move in random direction
                  duration: 3000,
                  useNativeDriver: true,
                }),
              ]),
            ]);

            sparkleAnimation.start();
          }, delay);

          // Clean up this specific sparkle after its full animation completes (delay + animation duration)
          const totalDuration = delay + 3400; // delay + 400ms fade in + 3000ms movement/fade out
          setTimeout(() => {
            setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
          }, totalDuration);
        }

        setSparkles((prev) => [...prev, ...newSparkles]);
      },
      2500 + Math.random() * 2500
    ); // Every 2.5-5 seconds (25% less frequent)

    return () => clearInterval(sparkleInterval);
  }, []);

  // Refresh user data when screen comes into focus (for updated poop scores)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        // Refresh both user data and scan data to get latest info
        Promise.all([refreshUserData(), refreshScanData()])
          .catch((error) => {
            console.error("Error refreshing data on home focus:", error);
          })
          .finally(() => {
            isRefreshingRef.current = false;
          });
      }
    }, [isAuthenticated, refreshUserData, refreshScanData])
  );

  const handleCameraPress = () => {
    console.log("Camera button pressed, navigating to camera");
    navigation.navigate("Camera");
  };

  const handlePoopScorePress = () => {
    console.log("Poop score pressed, navigating to profile");
    navigation.navigate("Profile");
  };

  const handleScanCounterPress = () => {
    // Navigate to payment screen focused on getting more scan credits
    navigation.navigate("Payment", {
      noScreen: "Home",
      type: "premium-subscription",
      preselection: "monthly",
      freeTrial: false,
    });
  };

  return (
    <View className="flex-1 bg-transparent">
      <View className="flex-1 px-6 pt-16">
        <HomeHeader userName={user?.profile?.name} />

        {/* Main content area - improved responsive positioning */}
        <View
          className="flex-1 justify-center items-center"
          style={{
            marginTop: mainContentMarginTop,
            paddingHorizontal: screenHeight * 0.025, // 2.5% of screen height for padding
          }}
        >
          {/* Poop Score Display - Top centered with responsive sizing */}
          <View
            className="items-center justify-center"
            style={{
              marginBottom: poopScoreMarginBottom,
              width: "100%", // Full width for better centering
            }}
          >
            <Animated.View
              style={{
                transform: [
                  { translateY: scoreFloatY },
                  { translateX: scoreFloatX },
                  {
                    rotate: scoreRotate.interpolate({
                      inputRange: [-0.3, 0.3],
                      outputRange: ["-0.4deg", "0.4deg"],
                    }),
                  },
                ],
                alignItems: "center",
                width: "100%", // Full width for better centering
              }}
            >
              <TouchableOpacity
                onPress={handlePoopScorePress}
                activeOpacity={0.8}
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: Math.min(screenHeight * 0.005, 4), // Responsive shadow
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: Math.min(screenHeight * 0.01, 8), // Responsive shadow radius
                  elevation: 8,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PoopScoreDisplay
                    score={
                      user?.profile?.poopScoreAvg != null
                        ? user.profile.poopScoreAvg
                        : -1
                    }
                    size={poopScoreSize}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Camera Button - Bottom centered */}
          <View className="items-center justify-center">
            {/* Premium sparkles icon - positioned outside camera container to avoid transparency */}
            {isPremium && (
              <View
                style={{
                  position: "absolute",
                  top: cameraButtonSize * -0.11, // Same positioning as ScanCounter
                  right: -cameraButtonSize * 0.07,
                  width: cameraButtonSize * 0.34,
                  height: cameraButtonSize * 0.34,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10, // High z-index to ensure it's on top
                }}
              >
                <Ionicons
                  name="sparkles"
                  size={cameraButtonSize * 0.32}
                  color="#FFD700" // Pure gold without alpha
                  style={{ textShadowColor: "#000", textShadowRadius: 2 }}
                />
              </View>
            )}

            <Animated.View
              style={{
                transform: [
                  { translateY: cameraFloatY },
                  { translateX: cameraFloatX },
                  {
                    rotate: cameraRotate.interpolate({
                      inputRange: [-0.3, 0.3],
                      outputRange: ["-0.8deg", "0.8deg"],
                    }),
                  },
                ],
                alignItems: "center",
              }}
            >
              <View style={{ position: "relative" }}>
                {/* Sparkles around camera button - positioned on top */}
                {sparkles.map((sparkle) => (
                  <Animated.View
                    key={sparkle.id}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      marginLeft: -1.5, // Center the sparkle horizontally
                      marginTop: -1.5, // Center the sparkle vertically
                      width: 3,
                      height: 3,
                      backgroundColor: "#FFD700",
                      borderRadius: 1.5,
                      opacity: sparkle.opacity,
                      transform: [
                        {
                          translateX: Animated.add(
                            new Animated.Value(sparkle.x), // Use actual sparkle position
                            sparkle.translateX
                          ),
                        },
                        {
                          translateY: Animated.add(
                            new Animated.Value(sparkle.y), // Use actual sparkle position
                            sparkle.translateY
                          ),
                        },
                      ],
                      shadowColor: "#FFD700",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 3,
                      elevation: 10,
                      zIndex: 3,
                    }}
                  />
                ))}

                <TouchableOpacity
                  onPress={handleCameraPress}
                  className="items-center justify-center"
                  activeOpacity={0.7}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 1, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 8,
                    zIndex: 2,
                  }}
                >
                  <CameraSvg
                    width={cameraButtonSize}
                    height={cameraButtonSize}
                  />
                </TouchableOpacity>

                {/* Scan Counter for free users */}
                {!isPremium && (
                  <ScanCounter
                    scansLeft={scansLeft}
                    onPress={handleScanCounterPress}
                    cameraButtonSize={cameraButtonSize}
                  />
                )}
              </View>

              {/* Label below camera button */}
              <Text
                style={{
                  fontSize: labelFontSize,
                  fontWeight: "bold",
                  color: "#374151",
                  marginTop: labelMarginTop,
                  textAlign: "center",
                }}
              >
                Scan
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}
