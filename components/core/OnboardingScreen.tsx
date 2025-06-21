import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Pressable,
} from "react-native";
import PoopbotSvg from "../../assets/poopbot.svg";
import HeroPrimaryButton from "../ui/HeroPrimaryButton";
import HeroSecondaryButton from "../ui/HeroSecondaryButton";
import { useDimensions } from "../../context/core/DimensionsContext";

interface OnboardingMessage {
  text: string;
  buttonText?: string;
  onButtonPress?: () => void;
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
}

interface OnboardingScreenProps {
  messages: OnboardingMessage[];
  onComplete?: () => void;
  visible?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  typewriterSpeed?: number;
  showSparkles?: boolean;
  backgroundColor?: string;
}

export default function OnboardingScreen({
  messages,
  onComplete,
  visible = true,
  autoAdvance = false,
  autoAdvanceDelay = 2000,
  typewriterSpeed = 20,
  showSparkles = true,
  backgroundColor = "bg-gradient-to-b from-blue-50 to-white",
}: OnboardingScreenProps) {
  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate responsive values
  const poopBotSize = screenHeight * 0.25; // 25% of screen height
  const bubbleWidth = screenWidth * 0.8; // 80% of screen width
  const bubblePadding = screenWidth * 0.04; // 4% of screen width
  const bubbleMinHeight = screenHeight * 0.08; // 8% of screen height
  const bubbleFontSize = screenHeight * 0.028; // ~2.8% of screen height
  const skipTipFontSize = screenHeight * 0.02; // 2% of screen height
  const primaryButtonWidth = screenWidth * 0.65; // 65% of screen width
  const primaryButtonHeight = screenHeight * 0.08; // 8% of screen height
  const primaryButtonFontSize = screenHeight * 0.025; // 2.5% of screen height
  const secondaryButtonWidth = screenWidth * 0.5; // 50% of screen width
  const secondaryButtonHeight = screenHeight * 0.06; // 6% of screen height
  const secondaryButtonFontSize = screenHeight * 0.02; // 2% of screen height

  // Log dimensions for debugging
  // console.log(`OnboardingScreen dimensions: ${screenWidth}x${screenHeight}`);
  // console.log(`PoopBot size: ${poopBotSize}px`);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkipTip, setShowSkipTip] = useState(false);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const skipTipAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const lastProcessedMessageRef = useRef<string>(""); // Track which message was last processed
  const entranceAnimationStartedRef = useRef(false); // Track if entrance animation has started

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const botFloatY = useRef(new Animated.Value(-8)).current;
  const botScale = useRef(new Animated.Value(0.8)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const skipTipOpacity = useRef(new Animated.Value(0)).current;

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

  const currentMessage = messages[currentMessageIndex] || { text: "" };

  // Initialize entrance animations
  useLayoutEffect(() => {
    if (visible) {
      entranceAnimationStartedRef.current = true;

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
      ]).start(() => {
        // Use requestAnimationFrame to schedule state update
        requestAnimationFrame(() => {
          setIsEntranceComplete(true);
        });
      });

      // Start floating animation
      const floatingTimeout = setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(botFloatY, {
              toValue: 8,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(botFloatY, {
              toValue: -8,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 600);

      // Start sparkle generation if enabled
      let sparkleInterval: number;
      if (showSparkles) {
        sparkleInterval = setInterval(() => {
          generateSparkles();
        }, 2000);
      }

      return () => {
        clearTimeout(floatingTimeout);
        if (sparkleInterval) {
          clearInterval(sparkleInterval);
        }
      };
    }
  }, [visible, showSparkles]);

  // Handle message changes and typing animation
  useEffect(() => {
    // console.log("🔄 OnboardingScreen typewriter effect triggered:", {
    //   hasMessage: !!currentMessage.text,
    //   visible,
    //   isEntranceComplete,
    //   currentMessageIndex,
    //   messageText: currentMessage.text?.substring(0, 20) + "...",
    //   lastProcessedMessage: lastProcessedMessageRef.current.substring(0, 20) + "...",
    // });

    // Check if this message has already been processed
    const messageKey = `${currentMessageIndex}-${currentMessage.text}`;

    if (
      currentMessage.text &&
      visible &&
      isEntranceComplete &&
      lastProcessedMessageRef.current !== messageKey
    ) {
      // console.log("✅ Starting typewriter effect for NEW message:", currentMessage.text.substring(0, 30) + "...");

      // Defer the typewriter effect to next tick to avoid useInsertionEffect warning
      const timeoutId = setTimeout(() => {
        // Mark this message as being processed
        lastProcessedMessageRef.current = messageKey;

        setDisplayedText("");
        setIsTyping(true);
        setIsComplete(false);

        // Reset button opacity
        buttonOpacity.setValue(0);

        // Start typewriter effect
        let index = 0;
        const text = currentMessage.text;

        typingIntervalRef.current = window.setInterval(() => {
          if (index < text.length) {
            setDisplayedText(text.slice(0, index + 1));
            index++;
          } else {
            // console.log("✅ Typewriter effect completed for:", text.substring(0, 30) + "...");
            setIsTyping(false);
            setIsComplete(true);

            // Show button if message has one
            if (currentMessage.buttonText) {
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }

            // Auto advance if enabled and no button
            if (
              autoAdvance &&
              !currentMessage.buttonText &&
              currentMessageIndex < messages.length - 1
            ) {
              setTimeout(() => {
                nextMessage();
              }, autoAdvanceDelay);
            }

            // Show skip tip for first message
            if (currentMessageIndex === 0 && messages.length > 1) {
              setTimeout(() => {
                setShowSkipTip(true);
                // Start with full opacity and begin pulsating immediately
                skipTipOpacity.setValue(1);

                // Create a smooth pulsating animation that never goes to 0
                const pulseAnimation = Animated.loop(
                  Animated.sequence([
                    Animated.timing(skipTipOpacity, {
                      toValue: 0.7,
                      duration: 1200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(skipTipOpacity, {
                      toValue: 1,
                      duration: 1200,
                      useNativeDriver: true,
                    }),
                  ])
                );
                skipTipAnimationRef.current = pulseAnimation;
                pulseAnimation.start();
              }, 1000);
            }

            if (typingIntervalRef.current) {
              clearInterval(typingIntervalRef.current);
              typingIntervalRef.current = null;
            }
          }
        }, typewriterSpeed);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // console.log("❌ Skipping typewriter effect - conditions not met or already processed");
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (skipTipAnimationRef.current) {
        skipTipAnimationRef.current.stop();
        skipTipAnimationRef.current = null;
      }
    };
  }, [currentMessage, currentMessageIndex, visible, isEntranceComplete]);

  const generateSparkles = () => {
    const numSparkles = 2 + Math.floor(Math.random() * 2);
    const newSparkles: Array<{
      id: number;
      opacity: Animated.Value;
      translateX: Animated.Value;
      translateY: Animated.Value;
      x: number;
      y: number;
    }> = [];

    for (let i = 0; i < numSparkles; i++) {
      const angle = Math.random() * 2 * Math.PI;
      // Use responsive radius based on PoopBot size
      const baseRadius = poopBotSize * 0.2; // 20% of PoopBot size
      const radius = baseRadius + Math.random() * (baseRadius * 0.5);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius - screenHeight * 0.025; // 2.5% of screen height offset

      const sparkle = {
        id: Date.now() + i,
        opacity: new Animated.Value(0),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        x,
        y,
      };

      newSparkles.push(sparkle);

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

      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
      }, 1800);
    }

    setSparkles((prev) => [...prev, ...newSparkles]);
  };

  const nextMessage = () => {
    if (currentMessageIndex < messages.length - 1) {
      // console.log("➡️ Moving to next message, resetting processed message tracking");
      setCurrentMessageIndex(currentMessageIndex + 1);
      // Reset the processed message tracking for the new message
      lastProcessedMessageRef.current = "";
      setShowSkipTip(false);
      skipTipOpacity.setValue(0);
      // Stop pulse animation if running
      if (skipTipAnimationRef.current) {
        skipTipAnimationRef.current.stop();
        skipTipAnimationRef.current = null;
      }
    } else {
      onComplete?.();
    }
  };

  const handleScreenPress = () => {
    if (isTyping) {
      // Skip typing animation
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setDisplayedText(currentMessage.text);
      setIsTyping(false);
      setIsComplete(true);

      // Show button if message has one
      if (currentMessage.buttonText) {
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else if (isComplete && !currentMessage.buttonText) {
      // Advance to next message if no button
      nextMessage();
    }
  };

  // Calculate sparkle dimensions
  const sparkleSize = Math.min(screenHeight * 0.006, 6); // Max 6px, responsive to screen
  const sparkleBorderRadius = sparkleSize / 2;

  if (!visible) return null;

  return (
    <Pressable
      className={`flex-1 ${backgroundColor}`}
      onPress={handleScreenPress}
    >
      <Animated.View
        className="absolute inset-0"
        style={{ opacity: overlayOpacity }}
      >
        {/* Main content container */}
        <View
          className="flex-1 items-center justify-center"
          style={{ zIndex: 2 }}
        >
          {/* Sparkles around PoopBot */}
          {showSparkles &&
            sparkles.map((sparkle) => (
              <Animated.View
                key={sparkle.id}
                style={{
                  position: "absolute",
                  width: sparkleSize,
                  height: sparkleSize,
                  backgroundColor: "#FFD700",
                  borderRadius: sparkleBorderRadius,
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
                  shadowRadius: Math.min(screenHeight * 0.006, 4),
                  elevation: 10,
                  zIndex: 3,
                }}
              />
            ))}

          {/* PoopBot with floating animation - positioned above center */}
          <Animated.View
            style={{
              transform: [
                { scale: botScale },
                {
                  translateY: Animated.add(
                    botFloatY,
                    new Animated.Value(-screenHeight * 0.1)
                  ),
                },
              ],
            }}
          >
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 1, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <PoopbotSvg width={poopBotSize} height={poopBotSize} />
            </View>
          </Animated.View>

          {/* Speech Bubble - positioned below center */}
          <Animated.View
            style={{
              position: "absolute",
              transform: [
                { scale: bubbleScale },
                { translateY: screenHeight * 0.18 },
              ],
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.35)",
                borderRadius: 16,
                paddingHorizontal: bubblePadding,
                paddingVertical: bubblePadding,
                maxWidth: bubbleWidth,
                minHeight: bubbleMinHeight,
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  color: "#374151",
                  fontSize: bubbleFontSize,
                  fontWeight: "500",
                  textAlign: "center",
                  lineHeight: bubbleFontSize * 1.3,
                }}
              >
                {displayedText}
              </Text>
            </View>
          </Animated.View>

          {/* Skip tip - shown for first dialogue after 1 second */}
          {showSkipTip && (
            <Animated.View
              style={{
                position: "absolute",
                bottom: screenHeight * 0.05, // 15% from bottom
                opacity: skipTipOpacity,
              }}
            >
              <Text
                style={{
                  color: "#6B7280",
                  fontSize: skipTipFontSize,
                  textAlign: "center",
                }}
              >
                - Tap to skip -
              </Text>
            </Animated.View>
          )}

          {/* Primary Action Button */}
          {currentMessage.buttonText && (
            <Animated.View
              style={{
                position: "absolute",
                bottom: screenHeight * 0.05, // 25% from bottom
                opacity: buttonOpacity,
              }}
            >
              <HeroPrimaryButton
                title={currentMessage.buttonText}
                onPress={currentMessage.onButtonPress || nextMessage}
                width={primaryButtonWidth}
                height={primaryButtonHeight}
                fontSize={primaryButtonFontSize}
              />
            </Animated.View>
          )}

          {/* Secondary Action Button */}
          {currentMessage.showSecondaryButton &&
            currentMessage.secondaryButtonText && (
              <Animated.View
                style={{
                  position: "absolute",
                  bottom: screenHeight * 0.08, // 8% from bottom
                  opacity: buttonOpacity,
                }}
              >
                <HeroSecondaryButton
                  title={currentMessage.secondaryButtonText}
                  onPress={currentMessage.onSecondaryButtonPress || (() => {})}
                  width={secondaryButtonWidth}
                  height={secondaryButtonHeight}
                  fontSize={secondaryButtonFontSize}
                />
              </Animated.View>
            )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
