import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface ScanCounterOverlayProps {
  isVisible: boolean;
  initialScansLeft: number;
  onAnimationComplete?: () => void;
}

export default function ScanCounterOverlay({
  isVisible,
  initialScansLeft,
  onAnimationComplete,
}: ScanCounterOverlayProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.3)).current; // Start much smaller for dramatic entrance
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardRotateZ = useRef(new Animated.Value(0)).current; // Add rotation for entrance
  const cardTranslateY = useRef(new Animated.Value(100)).current; // Start from below for slide-up
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current; // Separate opacity for subtitle
  const counterRotateX = useRef(new Animated.Value(0)).current;
  const counterScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current; // Add ripple effect
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  // Two-stage expanding animation for the card
  const cardExpandScale = useRef(new Animated.Value(0.6)).current; // Start smaller for expansion effect

  // Two-stage animation values - using translateY and overflow for smooth animation
  const cardContentTranslateY = useRef(new Animated.Value(100)).current; // Start content below viewport
  const counterContentOpacity = useRef(new Animated.Value(0)).current; // For showing/hiding counter content
  const [animationStage, setAnimationStage] = useState<
    "initial" | "simple" | "expanded"
  >("initial");

  // Particle effects
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle3Y = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;

  // State for counter display
  const [displayedCount, setDisplayedCount] = useState(initialScansLeft);
  const [showCounterChange, setShowCounterChange] = useState(false);

  // Get screen dimensions
  const { screenHeight } = useDimensions();

  // Calculate responsive sizes based on screen height (made smaller)
  const cardWidth = Math.min(screenHeight * 0.35, 280); // 35% of screen height, max 280px (reduced)
  const cardHeight = Math.min(screenHeight * 0.2, 160); // 20% of screen height, max 160px (reduced)
  const titleFontSize = Math.max(screenHeight * 0.032, 24); // 3.2% of screen height, min 24px (increased)
  const counterFontSize = Math.max(screenHeight * 0.06, 48); // 6% of screen height, min 48px
  const subtitleFontSize = Math.max(screenHeight * 0.024, 18); // 2.4% of screen height, min 18px (increased)
  const cardPadding = Math.max(screenHeight * 0.03, 24); // 3% of screen height, min 24px

  useEffect(() => {
    if (isVisible) {
      // STAGE 1: Show simple "Scan Used" card
      setAnimationStage("simple");

      // For simple stage, position content at top (0) so it's visible
      cardContentTranslateY.setValue(0);

      // Dramatic entrance animation with multiple effects
      Animated.sequence([
        // Step 1: Start ripple effect from center
        Animated.parallel([
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(rippleScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          // Start floating particles
          Animated.timing(particleOpacity, {
            toValue: 0.6,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        // Step 2: Card swooshes in with rotation and scale (smaller version)
        Animated.parallel([
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(cardTranslateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(cardRotateZ, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          // Start with smaller card for expansion effect
          Animated.spring(cardExpandScale, {
            toValue: 0.7, // Start at 70% size for "Scan Used" stage (smaller)
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }),
          // Fade in title immediately with card appearance
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 400, // Same as card appearance
            useNativeDriver: true,
          }),
          // Fade out ripple as card appears
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // STAGE 1 COMPLETE: Wait 400ms then expand card and transition to full version
        setTimeout(() => {
          expandCardAndTransition();
        }, 400); // Reduced wait time
      });
    } else {
      // Reset all animations when not visible
      overlayOpacity.setValue(0);
      cardScale.setValue(0.3);
      cardOpacity.setValue(0);
      cardRotateZ.setValue(0);
      cardTranslateY.setValue(100);
      titleOpacity.setValue(0);
      subtitleOpacity.setValue(0);
      counterRotateX.setValue(0);
      counterScale.setValue(1);
      rippleScale.setValue(0);
      rippleOpacity.setValue(0);
      cardExpandScale.setValue(0.6);
      cardContentTranslateY.setValue(100);
      counterContentOpacity.setValue(0);
      particle1Y.setValue(0);
      particle2Y.setValue(0);
      particle3Y.setValue(0);
      particleOpacity.setValue(0);
      setDisplayedCount(initialScansLeft);
      setShowCounterChange(false);
      setAnimationStage("initial");
    }
  }, [isVisible, initialScansLeft]);

  const expandCardAndTransition = () => {
    // Fade out the "Scan Used" text during expansion
    Animated.timing(titleOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Expand the card from 70% to 90% size (slightly slower, smaller final size)
    Animated.spring(cardExpandScale, {
      toValue: 0.9, // Smaller full size (90% instead of 100%)
      tension: 80, // Reduced from 100 for slower animation
      friction: 10, // Increased friction for smoother feel
      useNativeDriver: true,
    }).start(() => {
      // After expansion, transition to full counter immediately
      expandToFullCounter();
    });
  };

  const expandToFullCounter = () => {
    // STAGE 2: Expand to show full counter
    setAnimationStage("expanded");

    // Move content up to reveal the full counter
    Animated.parallel([
      Animated.spring(cardContentTranslateY, {
        toValue: 0,
        tension: 100, // Faster spring
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(counterContentOpacity, {
        toValue: 1,
        duration: 150, // Much faster - reduced from 300ms
        useNativeDriver: true,
      }),
      // Fade in the subtitle text at the same time as counter
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 150, // Much faster - reduced from 300ms
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start floating particles
      startParticleAnimations();

      // Step 4: Counter animation (no delay)
      animateCounterDecrement();
    });
  };

  const startParticleAnimations = () => {
    // Floating particles with staggered timing
    Animated.stagger(200, [
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle1Y, {
            toValue: -50,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle1Y, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle2Y, {
            toValue: -40,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(particle2Y, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle3Y, {
            toValue: -30,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(particle3Y, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const animateCounterDecrement = () => {
    // X-axis flip animation - like a card flip
    setShowCounterChange(true);

    Animated.sequence([
      // Scale down slightly
      Animated.timing(counterScale, {
        toValue: 0.95,
        duration: 100, // Faster
        useNativeDriver: true,
      }),
      // Rotate to show the "flip" on X-axis
      Animated.timing(counterRotateX, {
        toValue: 1,
        duration: 200, // Faster
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update the displayed count mid-flip
      setDisplayedCount(initialScansLeft - 1);

      // Complete the flip and scale back up
      Animated.parallel([
        Animated.timing(counterRotateX, {
          toValue: 2, // Complete the flip
          duration: 200, // Faster
          useNativeDriver: true,
        }),
        Animated.timing(counterScale, {
          toValue: 1.05, // Slight bounce
          duration: 200, // Faster
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Settle back to normal scale
        Animated.timing(counterScale, {
          toValue: 1,
          duration: 100, // Faster
          useNativeDriver: true,
        }).start(() => {
          // Wait a bit longer before starting exit animation
          setTimeout(() => {
            animateExit();
          }, 500); // Increased from 300ms to 500ms (added 200ms)
        });
      });
    });
  };

  const animateExit = () => {
    // Smooth exit animation - slide down and fade out
    Animated.parallel([
      Animated.timing(cardTranslateY, {
        toValue: screenHeight * 0.5, // Move down off screen
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 300, // Fade out slightly faster than slide
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Fade out particles
      Animated.timing(particleOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Call completion after exit animation
      onAnimationComplete?.();
    });
  };

  if (!isVisible) return null;

  // Calculate rotation interpolations
  const rotateX = counterRotateX.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["0deg", "90deg", "0deg"],
  });

  const rotateZ = cardRotateZ.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  return (
    <Animated.View
      className="absolute inset-0 pointer-events-none justify-center items-center"
      style={{ opacity: overlayOpacity }}
    >
      {/* Semi-transparent overlay */}
      <View className="absolute inset-0 bg-black/70" />

      {/* Ripple Effect */}
      <Animated.View
        className="absolute"
        style={{
          width: screenHeight * 0.8,
          height: screenHeight * 0.8,
          borderRadius: screenHeight * 0.4,
          borderWidth: 2,
          borderColor: "rgba(196, 181, 253, 0.4)", // Updated to match purple theme
          opacity: rippleOpacity,
          transform: [{ scale: rippleScale }],
        }}
      />

      {/* Glassmorphic Counter Card */}
      <Animated.View
        style={{
          width: cardWidth,
          height: cardHeight,
          opacity: cardOpacity,
          overflow: "hidden", // Clip content during scale animation
          transform: [
            { scale: cardScale },
            { translateY: cardTranslateY },
            { rotateZ: rotateZ },
          ],
        }}
      >
        {/* Inner container with expansion scale */}
        <Animated.View
          style={{
            flex: 1,
            transform: [
              { scale: cardExpandScale }, // Add the expansion scale here
              { translateY: cardContentTranslateY },
            ],
          }}
        >
          <LinearGradient
            colors={[
              "rgba(196, 181, 253, 0.25)", // Slightly more opaque version
              "rgba(196, 181, 253, 0.15)", // Your specified purple color
              "rgba(196, 181, 253, 0.1)", // Slightly more transparent version
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderRadius: 24,
              padding: cardPadding,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(196, 181, 253, 0.3)", // Updated border to match purple theme
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 20,
              overflow: "hidden",
            }}
          >
            {/* Title - Only visible in simple stage */}
            {animationStage === "simple" && (
              <Animated.View
                style={{
                  opacity: titleOpacity,
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: titleFontSize,
                    fontWeight: "600",
                    color: "white",
                    textAlign: "center",
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Scan Used
                </Text>
              </Animated.View>
            )}

            {/* Counter Display - Only visible in expanded stage */}
            {animationStage === "expanded" && (
              <Animated.View style={{ opacity: counterContentOpacity }}>
                <View className="items-center">
                  {/* Counter Number - No title text in expanded stage */}
                  <Animated.View
                    style={{
                      transform: [{ rotateX }, { scale: counterScale }],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: counterFontSize,
                        fontWeight: "700",
                        color: "white",
                        textAlign: "center",
                        textShadowColor: "rgba(0, 0, 0, 0.8)",
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                        fontFamily: "monospace", // Gives it that digital counter look
                      }}
                    >
                      {displayedCount}
                    </Text>
                  </Animated.View>

                  {/* Subtitle */}
                  <Animated.View
                    style={{ opacity: subtitleOpacity }}
                    className="mt-2"
                  >
                    <Text
                      style={{
                        fontSize: subtitleFontSize,
                        fontWeight: "500",
                        color: "rgba(255, 255, 255, 0.9)",
                        textAlign: "center",
                        textShadowColor: "rgba(0, 0, 0, 0.5)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      {displayedCount === 1
                        ? "Scan Remaining"
                        : "Scans Remaining"}
                    </Text>
                  </Animated.View>
                </View>
              </Animated.View>
            )}

            {/* Decorative Elements */}
            <View className="absolute top-4 right-4">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "rgba(255, 255, 255, 0.4)",
                }}
              />
            </View>
            <View className="absolute bottom-4 left-4">
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Floating Particles */}
      <Animated.View
        className="absolute"
        style={{
          opacity: particleOpacity,
          transform: [{ translateY: particle1Y }],
          left: "20%",
          top: "30%",
        }}
      >
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
          }}
        />
      </Animated.View>

      <Animated.View
        className="absolute"
        style={{
          opacity: particleOpacity,
          transform: [{ translateY: particle2Y }],
          right: "25%",
          top: "40%",
        }}
      >
        <View
          style={{
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
        />
      </Animated.View>

      <Animated.View
        className="absolute"
        style={{
          opacity: particleOpacity,
          transform: [{ translateY: particle3Y }],
          left: "70%",
          top: "25%",
        }}
      >
        <View
          style={{
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}
