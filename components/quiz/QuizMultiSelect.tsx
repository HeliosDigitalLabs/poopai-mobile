import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface QuizMultiSelectProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  mutuallyExclusiveOptions?: string[];
}

interface FrostedOptionButtonProps {
  text: string;
  isSelected: boolean;
  onPress: () => void;
  index: number;
  isFullWidth?: boolean;
  screenHeight: number;
  screenWidth: number;
}

const FrostedOptionButton = ({
  text,
  isSelected,
  onPress,
  index,
  isFullWidth = false,
  screenHeight,
  screenWidth,
}: FrostedOptionButtonProps) => {
  // Calculate responsive values
  const buttonMinHeight = Math.min(screenHeight * 0.0625, 120); // 6.5% of screen height, max 60px
  const buttonBorderRadius = Math.min(screenHeight * 0.02, 16); // 2% of screen height, max 16px
  const buttonMargin = Math.min(screenHeight * 0.008, 6); // 0.8% of screen height, max 6px
  const fontSize = Math.min(screenHeight * 0.018, 16); // 1.8% of screen height, max 16px
  const lineHeight = Math.min(screenHeight * 0.02, 18); // 2% of screen height, max 18px
  const paddingHorizontal = Math.min(screenWidth * 0.015, 12); // 1.5% of screen width, max 12px
  const paddingVertical = Math.min(screenHeight * 0.008, 6); // 0.8% of screen height, max 6px
  const overlayBorderRadius = buttonBorderRadius - 2;

  // Define gradient colors for variety
  const gradientColors = [
    ["#16A085", "#0D7A6B"], // Teal
    ["#3B82F6", "#1E40AF"], // Blue
    ["#8B5CF6", "#6D28D9"], // Purple
    ["#F59E0B", "#D97706"], // Orange
    ["#EF4444", "#DC2626"], // Red
    ["#10B981", "#059669"], // Green
    ["#8B5A2B", "#654321"], // Brown
    ["#6B7280", "#4B5563"], // Gray
  ];

  const selectedGradient = gradientColors[index % gradientColors.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: isFullWidth ? undefined : 1,
        width: isFullWidth ? "97%" : undefined,
        marginHorizontal: isFullWidth ? 0 : buttonMargin,
        marginVertical: Math.min(screenHeight * 0.003, 2), // Responsive vertical margin
        minHeight: buttonMinHeight,
        borderRadius: buttonBorderRadius,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: Math.min(screenHeight * 0.005, 4),
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={
          isSelected
            ? [
                selectedGradient[0] + "E6",
                selectedGradient[1] + "F0",
                selectedGradient[1] + "80",
              ]
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
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
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
              : "rgba(255, 255, 255, 0.4)",
            borderRadius: buttonBorderRadius,
          }}
        />

        {/* Inner glow effect */}
        <View
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            backgroundColor: isSelected
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
            borderColor: isSelected
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(255, 255, 255, 0.5)",
            borderRadius: overlayBorderRadius,
          }}
        />

        {/* Content */}
        <View
          style={{ zIndex: 10, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              fontSize: fontSize,
              color: isSelected ? "white" : "#374151",
              textAlign: "center",
              fontWeight: isSelected ? "bold" : "600",
              lineHeight: lineHeight,
              textShadowColor: isSelected
                ? "rgba(0,0,0,0.3)"
                : "rgba(0,0,0,0.1)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: isSelected ? 2 : 1,
              flexWrap: "wrap",
            }}
            numberOfLines={3}
            adjustsFontSizeToFit={false}
          >
            {text}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function QuizMultiSelect({
  options,
  selectedOptions,
  onToggleOption,
  mutuallyExclusiveOptions = [],
}: QuizMultiSelectProps) {
  // Get current device dimensions from context
  const { screenWidth, screenHeight } = useDimensions();

  // Calculate responsive values for container
  const containerPadding = Math.min(screenWidth * 0.005, 4); // 0.5% of screen width, max 4px
  const containerMarginBottom = Math.min(screenHeight * 0.02, 16); // 2% of screen height, max 16px
  const containerMarginTop = Math.min(screenHeight * 0.01, 64); // 2% of screen height to move buttons down slightly
  const rowMarginBottom = Math.min(screenHeight * 0.005, 4); // 0.5% of screen height, max 4px
  const noneButtonMarginTop = Math.min(screenHeight * 0.002, 8); // 1% of screen height, max 8px

  // Log dimensions for debugging
  console.log(`QuizMultiSelect dimensions: ${screenWidth}x${screenHeight}`);

  // Separate "None" option from regular options
  const noneOption = options.find((option) => option === "None");
  const regularOptions = options.filter((option) => option !== "None");

  return (
    <View
      style={{
        marginTop: containerMarginTop,
        marginBottom: containerMarginBottom,
        paddingHorizontal: containerPadding,
      }}
    >
      {/* 2-column grid layout for regular options */}
      <View style={{ flexDirection: "column" }}>
        {/* Create rows of 2 items each for regular options */}
        {Array.from(
          { length: Math.ceil(regularOptions.length / 2) },
          (_, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                marginBottom: rowMarginBottom,
              }}
            >
              {regularOptions
                .slice(rowIndex * 2, rowIndex * 2 + 2)
                .map((option, colIndex) => {
                  const globalIndex = rowIndex * 2 + colIndex;
                  return (
                    <FrostedOptionButton
                      key={option}
                      text={option}
                      isSelected={selectedOptions.includes(option)}
                      onPress={() => onToggleOption(option)}
                      index={globalIndex}
                      screenHeight={screenHeight}
                      screenWidth={screenWidth}
                    />
                  );
                })}
              {/* Add empty spacer if odd number of items in last row */}
              {rowIndex === Math.ceil(regularOptions.length / 2) - 1 &&
                regularOptions.length % 2 === 1 && (
                  <View
                    style={{
                      flex: 1,
                      marginHorizontal: Math.min(screenHeight * 0.008, 6),
                    }}
                  />
                )}
            </View>
          )
        )}
      </View>

      {/* Full-width "None" button */}
      {noneOption && (
        <View
          style={{
            marginTop: noneButtonMarginTop,
            marginBottom: rowMarginBottom,
            alignItems: "center",
          }}
        >
          <FrostedOptionButton
            key={noneOption}
            text={noneOption}
            isSelected={selectedOptions.includes(noneOption)}
            onPress={() => onToggleOption(noneOption)}
            index={regularOptions.length}
            isFullWidth={true}
            screenHeight={screenHeight}
            screenWidth={screenWidth}
          />
        </View>
      )}
    </View>
  );
}
