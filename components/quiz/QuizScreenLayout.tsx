import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import PoopbotSvg from "../../assets/poopbot.svg";
import BackButton from "../navigation/BackButton";
import { useDimensions } from "../../context/core/DimensionsContext";

interface QuizScreenLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  backgroundColor?: string;
  questionText?: string;
  subtitle?: string;
  enableScrolling?: boolean;
  BackButtonComponent?: React.ComponentType<{ onPress: () => void }>;
}

export default function QuizScreenLayout({
  children,
  onBack,
  showBackButton = true,
  backgroundColor = "bg-gradient-to-b from-blue-50 to-white",
  questionText,
  subtitle,
  enableScrolling = true,
  BackButtonComponent,
}: QuizScreenLayoutProps) {
  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate PoopBot size (20% of device height)
  const poopBotSize = screenHeight * 0.25;

  // Animation values matching OnboardingScreen
  const botFloatY = useRef(new Animated.Value(-8)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;
  const botScale = useRef(new Animated.Value(1)).current;

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState("");
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const subtitleIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Start floating animation for PoopBot
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

    // Subtle breathing animation for chat bubble
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleScale, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Typewriter effect for question text
  useEffect(() => {
    if (questionText) {
      setDisplayedText("");
      setDisplayedSubtitle("");
      setIsTyping(true);
      setIsComplete(false);

      // Start with subtitle if it exists
      if (subtitle) {
        let subtitleIndex = 0;
        subtitleIntervalRef.current = window.setInterval(() => {
          if (subtitleIndex < subtitle.length) {
            setDisplayedSubtitle(subtitle.slice(0, subtitleIndex + 1));
            subtitleIndex++;
          } else {
            if (subtitleIntervalRef.current) {
              clearInterval(subtitleIntervalRef.current);
              subtitleIntervalRef.current = null;
            }
            // Start main text after subtitle is complete
            startMainTextTyping();
          }
        }, 15); // 2x faster (was 30)
      } else {
        // Start main text immediately if no subtitle
        startMainTextTyping();
      }
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
        subtitleIntervalRef.current = null;
      }
    };
  }, [questionText, subtitle]);

  const startMainTextTyping = () => {
    let index = 0;
    typingIntervalRef.current = window.setInterval(() => {
      if (index < questionText!.length) {
        setDisplayedText(questionText!.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setIsComplete(true);
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }
    }, 25); // 2x faster (was 50)
  };

  const handleScreenPress = () => {
    if (isTyping) {
      // Skip typing animation
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
        subtitleIntervalRef.current = null;
      }

      // Show complete text immediately
      if (subtitle) {
        setDisplayedSubtitle(subtitle);
      }
      setDisplayedText(questionText || "");
      setIsTyping(false);
      setIsComplete(true);
    }
  };

  // Calculate responsive values
  const bubbleWidth = screenWidth * 0.8; // 80% of screen width
  const bubblePadding = screenWidth * 0.04; // 4% of screen width
  const bubbleMinHeight = screenHeight * 0.08; // 8% of screen height
  const bubbleOffsetY = screenHeight * -0.08; // 8% up from center

  const subtitleFontSize = screenWidth * 0.035; // ~3.5% of screen width
  const mainTextFontSize = screenHeight * 0.025; // ~2.5% of screen height

  // Quiz options container responsive values
  const optionsContainerTop = enableScrolling
    ? screenHeight * 0.52
    : screenHeight * 0.5; // 52% or 50% from top
  const optionsContainerBottom = Math.min(screenHeight * 0.025, 20); // 2.5% from bottom, max 20px
  const optionsContainerPaddingH = Math.min(screenWidth * 0.06, 24); // 6% of screen width, max 24px
  const scrollViewPaddingBottom = Math.min(screenHeight * 0.025, 20); // 2.5% of screen height, max 20px
  const backButtonBottom = Math.min(screenHeight * 0.05, 40); // 5% from bottom, max 40px
  const backButtonLeft = Math.min(screenWidth * 0.025, 16); // 2.5% from left, max 16px

  return (
    <View className={`flex-1 ${backgroundColor}`}>
      {/* Main content container wrapped in Pressable for tap-to-skip */}
      <Pressable className="flex-1" onPress={handleScreenPress}>
        <View
          className="flex-1 items-center justify-center"
          style={{
            zIndex: 2,
          }}
        >
          {/* PoopBot with floating animation - positioned higher up */}
          <Animated.View
            style={{
              transform: [
                { scale: botScale },
                {
                  translateY: Animated.add(
                    botFloatY,
                    new Animated.Value(-screenHeight * 0.3)
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

          {/* Speech Bubble with question - positioned below PoopBot */}
          {questionText && (
            <Animated.View
              style={{
                position: "absolute",
                transform: [
                  { scale: bubbleScale },
                  { translateY: bubbleOffsetY }, // Responsive positioning
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
                {subtitle && (
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: subtitleFontSize,
                      fontWeight: "500",
                      textAlign: "center",
                      marginBottom: bubblePadding * 0.5,
                    }}
                  >
                    {displayedSubtitle}
                  </Text>
                )}
                <Text
                  style={{
                    color: "#1F2937",
                    fontSize: mainTextFontSize,
                    fontWeight: "bold",
                    textAlign: "center",
                    lineHeight: mainTextFontSize * 1.3,
                  }}
                >
                  {displayedText}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </Pressable>

      {/* Quiz options container - moved outside opacity-affected area */}
      <View
        style={{
          position: "absolute",
          top: optionsContainerTop,
          bottom: optionsContainerBottom,
          width: "100%",
          paddingHorizontal: optionsContainerPaddingH,
          zIndex: 3,
        }}
      >
        {enableScrolling ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scrollViewPaddingBottom }}
            style={{ flex: 1 }}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>

      {/* Back button positioned at bottom left */}
      {showBackButton && onBack && (
        <View
          style={{
            position: "absolute",
            bottom: backButtonBottom,
            left: backButtonLeft,
            zIndex: 30,
          }}
        >
          {BackButtonComponent ? (
            <BackButtonComponent onPress={onBack} />
          ) : (
            <BackButton onPress={onBack} />
          )}
        </View>
      )}
    </View>
  );
}
