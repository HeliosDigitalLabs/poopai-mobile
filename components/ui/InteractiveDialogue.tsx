import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Pressable,
} from "react-native";
import PoopbotSvg from "../../assets/poopbot.svg";
import HeroPrimaryButton from "./HeroPrimaryButton";

interface DialogueMessage {
  text: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonPress?: () => void;
}

interface InteractiveDialogueProps {
  messages: DialogueMessage[];
  onComplete: () => void;
  visible: boolean;
}

export default function InteractiveDialogue({
  messages,
  onComplete,
  visible,
}: InteractiveDialogueProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkipTip, setShowSkipTip] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const skipTipAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const botFloatY = useRef(new Animated.Value(-8)).current; // Start at top of float range
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

  const currentMessage = messages[currentMessageIndex] || {
    text: "",
    showButton: false,
  };

  useEffect(() => {
    if (visible) {
      // Fade in overlay and start entrance animation
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
      ]).start();

      // Start smooth floating animation separately
      const startFloatingAnimation = () => {
        // Don't set initial position again - it's already set to -8
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
      };

      // Start floating after entrance animation
      setTimeout(startFloatingAnimation, 600);

      // Start sparkle generation
      const sparkleInterval = setInterval(() => {
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
          const radius = 40 + Math.random() * 30;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius - 20;

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
      }, 1500 + Math.random() * 1000);

      // Start typing the first message
      typeMessage(currentMessage.text);

      // Show skip tip after 1 second on first dialogue
      if (currentMessageIndex === 0) {
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

      return () => {
        clearInterval(sparkleInterval);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        if (skipTipAnimationRef.current) {
          skipTipAnimationRef.current.stop();
        }
      };
    } else {
      // Reset when not visible
      resetAnimation();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && currentMessageIndex < messages.length) {
      typeMessage(currentMessage.text);
    }
  }, [currentMessageIndex, visible]);

  const typeMessage = (text: string) => {
    // Clear any existing typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    setIsTyping(true);
    setDisplayedText("");
    setIsComplete(false);

    // Hide button initially
    buttonOpacity.setValue(0);

    let currentIndex = 0;
    const typingSpeed = 25; // milliseconds per character (faster)

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        setIsComplete(true);

        // Show button if this message has one
        if (currentMessage.showButton) {
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      }
    }, typingSpeed);
  };

  const handleScreenTap = () => {
    // Hide skip tip once user taps (they now understand they can tap)
    if (showSkipTip) {
      // Stop the pulsating animation first
      if (skipTipAnimationRef.current) {
        skipTipAnimationRef.current.stop();
        skipTipAnimationRef.current = null;
      }

      // Fade out the skip tip
      Animated.timing(skipTipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSkipTip(false);
      });
    }

    if (isTyping) {
      // Skip to end of current message
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setDisplayedText(currentMessage.text);
      setIsTyping(false);
      setIsComplete(true);

      if (currentMessage.showButton) {
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else if (isComplete && currentMessageIndex < messages.length - 1) {
      // Move to next message
      setCurrentMessageIndex((prev) => prev + 1);
    }
    // If it's the last message and complete, do nothing (let button handle it)
  };

  const resetAnimation = () => {
    // Clear typing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    // Stop skip tip animation
    if (skipTipAnimationRef.current) {
      skipTipAnimationRef.current.stop();
      skipTipAnimationRef.current = null;
    }

    overlayOpacity.setValue(0);
    botScale.setValue(0.8);
    bubbleScale.setValue(0);
    botFloatY.setValue(-8); // Reset to top of float range
    buttonOpacity.setValue(0);
    skipTipOpacity.setValue(0);
    setSparkles([]);
    setCurrentMessageIndex(0);
    setDisplayedText("");
    setIsTyping(false);
    setIsComplete(false);
    setShowSkipTip(false);
  };

  if (!visible) return null;

  return (
    <Pressable
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      onPress={handleScreenTap}
    >
      <Animated.View
        className="absolute inset-0"
        style={{ opacity: overlayOpacity }}
      >
        {/* No background overlay - keep original background */}

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

          {/* PoopBot with floating animation - positioned above center */}
          <Animated.View
            style={{
              transform: [
                { scale: botScale },
                {
                  translateY: Animated.add(botFloatY, new Animated.Value(-80)),
                }, // Move up from center
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
              <PoopbotSvg width="250" height="250" />
            </View>
          </Animated.View>

          {/* Speech Bubble - positioned below center */}
          <Animated.View
            className="absolute"
            style={{
              transform: [
                { scale: bubbleScale },
                { translateY: 145 }, // Position below center (moved down from 120)
              ],
            }}
          >
            {/* Simple bubble background without arrow */}
            <View
              className="bg-white/35 rounded-2xl px-6 py-4 max-w-xs min-h-[60px] justify-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text className="text-gray-800 text-2xl font-medium text-center">
                {displayedText}
              </Text>
            </View>
          </Animated.View>

          {/* Skip tip - shown for first dialogue after 1 second */}
          {showSkipTip && (
            <Animated.View
              className="absolute bottom-12"
              style={{ opacity: skipTipOpacity }}
            >
              <Text className="text-gray-500 text-base text-center">
                - Tap to skip -
              </Text>
            </Animated.View>
          )}

          {/* Action Button (only for final message) */}
          {currentMessage.showButton && (
            <Animated.View
              className="absolute bottom-24"
              style={{ opacity: buttonOpacity }}
            >
              <HeroPrimaryButton
                title={currentMessage.buttonText || "Let's go!"}
                onPress={currentMessage.onButtonPress || onComplete}
                width={250}
                height={70}
                fontSize={18}
              />
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
