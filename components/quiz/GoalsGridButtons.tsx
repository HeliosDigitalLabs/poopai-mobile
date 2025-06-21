import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface GoalsGridButtonsProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
}

interface GoalButtonProps {
  title: string;
  gradient: [string, string];
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  screenHeight: number;
}

const GoalButton = ({
  title,
  gradient,
  icon,
  isSelected,
  onPress,
  screenHeight,
}: GoalButtonProps) => {
  // Calculate responsive values for this button with max constraints (same as MainQuizGridButtons)
  const buttonMargin = Math.min(screenHeight * 0.01, 8); // Max 8px margin
  const buttonBorderRadius = Math.min(screenHeight * 0.03, 24); // Max 24px radius
  const iconFontSize = Math.min(screenHeight * 0.045, 38); // Max 38px icon (same as MainQuizGridButtons)
  const titleFontSize = Math.min(screenHeight * 0.02, 16); // Max 16px title (same as MainQuizGridButtons)
  const overlayBorderRadius = buttonBorderRadius * 0.85; // Slightly smaller for inner elements

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        aspectRatio: 1,
        borderRadius: buttonBorderRadius,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      <LinearGradient
        colors={
          isSelected
            ? [gradient[0] + "E6", gradient[1] + "F0", gradient[1] + "80"]
            : [
                "rgba(255, 255, 255, 0.8)",
                "rgba(255, 255, 255, 0.6)",
                "rgba(255, 255, 255, 0.4)",
              ]
        }
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          borderRadius: buttonBorderRadius,
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
            backgroundColor: isSelected
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(255, 255, 255, 0.25)",
            borderRadius: buttonBorderRadius,
          }}
        />

        {/* Inner glow effect */}
        <View
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            right: 4,
            bottom: 4,
            backgroundColor: isSelected
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            borderColor: isSelected
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(255, 255, 255, 0.3)",
            borderRadius: overlayBorderRadius,
          }}
        />

        {/* Content */}
        <View
          style={{
            zIndex: 10,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: Math.min(screenHeight * 0.015, 12),
            paddingVertical: Math.min(screenHeight * 0.01, 8),
          }}
        >
          <Text
            style={{
              fontSize: iconFontSize,
              lineHeight: iconFontSize * 1.1,
              textAlign: "center",
              textShadowColor: "rgba(0,0,0,0.2)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              marginBottom: Math.min(screenHeight * 0.008, 6),
            }}
          >
            {icon}
          </Text>
          <Text
            style={{
              fontSize: titleFontSize,
              color: isSelected ? "white" : "#374151",
              textAlign: "center",
              fontWeight: "bold",
              lineHeight: titleFontSize * 1.125,
              textShadowColor: isSelected
                ? "rgba(0,0,0,0.4)"
                : "rgba(0,0,0,0.1)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: isSelected ? 2 : 1,
            }}
          >
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function GoalsGridButtons({
  options,
  selectedOptions,
  onToggleOption,
}: GoalsGridButtonsProps) {
  // Get screen dimensions for responsive sizing (same as MainQuizGridButtons)
  const { screenHeight, screenWidth } = useDimensions();

  // Calculate responsive values for grid buttons with max constraints (same as MainQuizGridButtons)
  // Use the smaller dimension to prevent oversizing on tablets
  const baseDimension = Math.min(screenHeight, screenWidth);
  const gridSpacing = Math.min(screenHeight * 0.02, 16); // Max 16px spacing between buttons
  const gridPaddingH = Math.min(screenHeight * 0.02, 20); // Max 20px padding
  // Calculate max height based on button size + spacing (each button will be ~45% of container width)
  const estimatedButtonSize = Math.min(
    (screenWidth - gridPaddingH * 2 - gridSpacing) / 2,
    baseDimension * 0.25
  );
  const gridMaxHeight = estimatedButtonSize * 2 + gridSpacing; // 2 rows + spacing

  // Match MainQuizGridButtons positioning exactly:
  // MainQuiz has: gridToScannerGap (6%) + scannerButtonMargin (3%) = 9% total from bottom
  const gridBottomMargin = Math.min(screenHeight * 0.12, 108); // 9% from bottom to match MainQuiz, max 72px

  // Log dimensions for debugging
  console.log(`GoalsGridButtons dimensions: ${screenWidth}x${screenHeight}`);

  // Separate "None" option from regular options
  const noneOption = options.find((option) => option === "None");
  const regularOptions = options.filter((option) => option !== "None");

  const goalOptions = [
    {
      title: "Stay regular",
      icon: "🚽",
      gradient: ["#16A085", "#0D7A6B"] as [string, string], // Teal
    },
    {
      title: "Eat more fiber",
      icon: "🥬",
      gradient: ["#10B981", "#059669"] as [string, string], // Green
    },
    {
      title: "Less bloating",
      icon: "😌",
      gradient: ["#8B5CF6", "#6D28D9"] as [string, string], // Purple
    },
    {
      title: "Improve overall gut health",
      icon: "💪",
      gradient: ["#3B82F6", "#1E40AF"] as [string, string], // Blue
    },
  ];

  return (
    <>
      {/* Grid positioned absolutely from bottom - matching MainQuizGridButtons */}
      <View
        style={{
          position: "absolute",
          bottom: gridBottomMargin, // 9% from bottom
          left: 0,
          right: 0,
          paddingHorizontal: gridPaddingH,
        }}
      >
        {/* 2x2 Grid content stays the same */}
        <View>
          {/* Top row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: gridSpacing,
              marginBottom: gridSpacing,
            }}
          >
            <View
              style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: Math.min(baseDimension * 0.36, 230),
                maxHeight: Math.min(baseDimension * 0.36, 230),
              }}
            >
              <GoalButton
                title={goalOptions[0].title}
                gradient={goalOptions[0].gradient}
                icon={goalOptions[0].icon}
                isSelected={selectedOptions.includes(goalOptions[0].title)}
                onPress={() => onToggleOption(goalOptions[0].title)}
                screenHeight={screenHeight}
              />
            </View>
            <View
              style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: Math.min(baseDimension * 0.36, 230),
                maxHeight: Math.min(baseDimension * 0.36, 230),
              }}
            >
              <GoalButton
                title={goalOptions[1].title}
                gradient={goalOptions[1].gradient}
                icon={goalOptions[1].icon}
                isSelected={selectedOptions.includes(goalOptions[1].title)}
                onPress={() => onToggleOption(goalOptions[1].title)}
                screenHeight={screenHeight}
              />
            </View>
          </View>

          {/* Bottom row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: gridSpacing,
            }}
          >
            <View
              style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: Math.min(baseDimension * 0.36, 230),
                maxHeight: Math.min(baseDimension * 0.36, 230),
              }}
            >
              <GoalButton
                title={goalOptions[2].title}
                gradient={goalOptions[2].gradient}
                icon={goalOptions[2].icon}
                isSelected={selectedOptions.includes(goalOptions[2].title)}
                onPress={() => onToggleOption(goalOptions[2].title)}
                screenHeight={screenHeight}
              />
            </View>
            <View
              style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: Math.min(baseDimension * 0.36, 230),
                maxHeight: Math.min(baseDimension * 0.36, 230),
              }}
            >
              <GoalButton
                title={goalOptions[3].title}
                gradient={goalOptions[3].gradient}
                icon={goalOptions[3].icon}
                isSelected={selectedOptions.includes(goalOptions[3].title)}
                onPress={() => onToggleOption(goalOptions[3].title)}
                screenHeight={screenHeight}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
