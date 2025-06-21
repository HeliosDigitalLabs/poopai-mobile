import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface QuizGlassmorphismSingleSelectProps {
  options: string[];
  onSelectOption: (option: string) => void;
  selectedOption?: string | null;
}

interface GlassmorphismOptionButtonProps {
  text: string;
  onPress: () => void;
  index: number;
  isSelected: boolean;
  screenHeight: number;
  screenWidth: number;
}

const GlassmorphismOptionButton = ({
  text,
  onPress,
  index,
  screenHeight,
  screenWidth,
}: GlassmorphismOptionButtonProps) => {
  // Calculate responsive values
  const buttonMarginVertical = Math.min(screenHeight * 0.06, 5); // 0.6% of screen height, max 5px
  const buttonMarginHorizontal = Math.min(screenWidth * 0.02, 8); // 2% of screen width, max 8px
  const buttonBorderRadius = Math.min(screenHeight * 0.025, 20); // 2.5% of screen height, max 20px
  const buttonPaddingHorizontal = Math.min(screenWidth * 0.05, 20); // 5% of screen width, max 20px
  const buttonPaddingVertical = Math.min(screenHeight * 0.02, 36); // 2% of screen height, max 16px
  const fontSize = Math.min(screenHeight * 0.021, 17); // 2.1% of screen height, max 17px
  const lineHeight = Math.min(screenHeight * 0.027, 22); // 2.7% of screen height, max 22px
  const shadowRadius = Math.min(screenHeight * 0.01, 8); // 1% of screen height, max 8px
  const innerBorderRadius = buttonBorderRadius - 3; // Slightly smaller for inner elements

  // Define unique gradient colors for each frequency option
  const gradientColors = [
    ["#16A085", "#0D7A6B"], // Teal - "Every time I poop"
    ["#3B82F6", "#1E40AF"], // Blue - "Once a day"
    ["#8B5CF6", "#6D28D9"], // Purple - "A few times a week"
    ["#F59E0B", "#D97706"], // Orange - "A few times a month"
    ["#6B7280", "#4B5563"], // Gray - "I'm not sure yet"
  ];

  const gradient = gradientColors[index % gradientColors.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        marginVertical: buttonMarginVertical,
        marginHorizontal: buttonMarginHorizontal,
        borderRadius: buttonBorderRadius,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: shadowRadius,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={[gradient[0] + "B3", gradient[1] + "CC", gradient[1] + "66"]}
        style={{
          paddingHorizontal: buttonPaddingHorizontal,
          paddingVertical: buttonPaddingVertical,
          borderRadius: buttonBorderRadius,
          position: "relative",
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Frosted glass overlay effect */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            borderRadius: buttonBorderRadius,
          }}
        />

        {/* Inner glow effect */}
        <View
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            right: 3,
            bottom: 3,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.5)",
            borderRadius: innerBorderRadius,
          }}
        />

        {/* Content */}
        <View style={{ zIndex: 10, alignItems: "center" }}>
          <Text
            style={{
              fontSize: fontSize,
              color: "white",
              textAlign: "center",
              fontWeight: "700",
              lineHeight: lineHeight,
              textShadowColor: "rgba(0,0,0,0.4)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
            numberOfLines={2}
          >
            {text}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function QuizGlassmorphismSingleSelect({
  options,
  onSelectOption,
}: QuizGlassmorphismSingleSelectProps) {
  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate responsive values for container
  const containerPaddingHorizontal = Math.min(screenWidth * 0.01, 4); // 1% of screen width, max 4px
  const containerPaddingTop = 0; // Keep at 0 for consistent positioning
  const containerMarginTop = 0; // Keep at 0 for consistent positioning

  // Log dimensions for debugging
  console.log(
    `QuizGlassmorphismSingleSelect dimensions: ${screenWidth}x${screenHeight}`
  );

  return (
    <View
      style={{
        paddingHorizontal: containerPaddingHorizontal,
        paddingTop: containerPaddingTop,
        marginTop: containerMarginTop,
      }}
    >
      {options.map((option, index) => (
        <GlassmorphismOptionButton
          key={index}
          text={option}
          onPress={() => onSelectOption(option)}
          index={index}
          screenHeight={screenHeight}
          screenWidth={screenWidth}
          isSelected={false}
        />
      ))}
    </View>
  );
}
