import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface MainQuizGridButtonsProps {
  onSelectOption: (option: string) => void;
  onScanNow: () => void;
}

interface GridButtonProps {
  title: string;
  subtitle: string;
  gradient: [string, string];
  icon: string;
  onPress: () => void;
  screenHeight: number;
}

const GridButton = ({
  title,
  subtitle,
  gradient,
  icon,
  onPress,
  screenHeight,
}: GridButtonProps) => {
  // Calculate responsive values for this button with max constraints
  const buttonMargin = Math.min(screenHeight * 0.01, 8); // Max 8px margin
  const buttonBorderRadius = Math.min(screenHeight * 0.03, 24); // Max 24px radius
  const iconFontSize = Math.min(screenHeight * 0.045, 38); // Max 38px icon
  const titleFontSize = Math.min(screenHeight * 0.02, 16); // Max 16px title
  const subtitleFontSize = Math.min(screenHeight * 0.015, 12); // Max 12px subtitle
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
        colors={[gradient[0] + "E6", gradient[1] + "F0", gradient[1] + "80"]}
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
            backgroundColor: "rgba(255, 255, 255, 0.25)",
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
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.3)",
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
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              lineHeight: titleFontSize * 1.125,
              marginBottom: Math.min(screenHeight * 0.004, 3),
              textShadowColor: "rgba(0,0,0,0.4)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: subtitleFontSize,
              color: "rgba(255,255,255,0.95)",
              textAlign: "center",
              lineHeight: subtitleFontSize * 1.167,
              textShadowColor: "rgba(0,0,0,0.3)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}
          >
            {subtitle}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function MainQuizGridButtons({
  onSelectOption,
  onScanNow,
}: MainQuizGridButtonsProps) {
  // Get screen dimensions for responsive sizing
  const { screenHeight, screenWidth } = useDimensions();

  // Calculate responsive values for grid buttons with max constraints
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
  // Calculate responsive values for scanner button
  const scannerButtonBottom = Math.min(screenHeight * 0.025, 30); // Max 30px from bottom
  const scannerButtonPaddingH = Math.min(screenHeight * 0.03, 25); // Max 25px padding
  const scannerButtonPaddingV = Math.min(screenHeight * 0.015, 15); // Max 15px padding
  const scannerButtonBorderRadius = Math.min(screenHeight * 0.02, 20); // Max 20px radius
  const scannerButtonFontSize = Math.min(screenHeight * 0.02, 18); // Max 18px font

  // Calculate grid position based on scanner button position
  const scannerButtonHeight =
    scannerButtonPaddingV * 2 + scannerButtonFontSize * 1.2; // Approximate button height
  const gridToScannerGap = Math.min(screenHeight * 0.06, 25); // Gap between grid and scanner button
  const gridBottomPosition =
    scannerButtonBottom + scannerButtonHeight + gridToScannerGap;

  const gridOptions = [
    {
      title: "Improve My Health",
      subtitle: "Feel better",
      gradient: ["#16A085", "#0D7A6B"] as [string, string], // Enhanced teal gradient
      icon: "🌱",
      value: "I want to improve my health",
    },
    {
      title: "Track My Progress",
      subtitle: "Spot patterns",
      gradient: ["#3B82F6", "#1E40AF"] as [string, string], // Enhanced blue gradient
      icon: "📊",
      value: "I want to track digestion over time",
    },
    {
      title: "I'm Just Curious",
      subtitle: "Let's see what happens",
      gradient: ["#8B5CF6", "#6D28D9"] as [string, string], // Enhanced purple gradient
      icon: "🤔",
      value: "I'm just curious what my poop score will be",
    },
    {
      title: "Give Me My Poop Score",
      subtitle: "Just sounds funny",
      gradient: ["#F59E0B", "#D97706"] as [string, string], // Enhanced orange gradient
      icon: "🎉",
      value: "Just for fun",
    },
  ];

  return (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      {/* Grid positioned with flex and consistent margin from scanner */}
      <View
        style={{
          paddingHorizontal: gridPaddingH,
          marginBottom: gridToScannerGap, // Consistent gap regardless of device
        }}
      >
        {/* Top Row */}
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
              maxWidth: Math.min(baseDimension * 0.36, 230), // Increased max size
              maxHeight: Math.min(baseDimension * 0.36, 230),
            }}
          >
            <GridButton
              title={gridOptions[0].title}
              subtitle={gridOptions[0].subtitle}
              gradient={gridOptions[0].gradient}
              icon={gridOptions[0].icon}
              onPress={() => onSelectOption(gridOptions[0].value)}
              screenHeight={screenHeight}
            />
          </View>
          <View
            style={{
              flex: 1,
              aspectRatio: 1,
              maxWidth: Math.min(baseDimension * 0.36, 230), // Increased max size
              maxHeight: Math.min(baseDimension * 0.36, 230),
            }}
          >
            <GridButton
              title={gridOptions[1].title}
              subtitle={gridOptions[1].subtitle}
              gradient={gridOptions[1].gradient}
              icon={gridOptions[1].icon}
              onPress={() => onSelectOption(gridOptions[1].value)}
              screenHeight={screenHeight}
            />
          </View>
        </View>

        {/* Bottom Row */}
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
              maxWidth: Math.min(baseDimension * 0.36, 230), // Increased max size
              maxHeight: Math.min(baseDimension * 0.36, 230),
            }}
          >
            <GridButton
              title={gridOptions[2].title}
              subtitle={gridOptions[2].subtitle}
              gradient={gridOptions[2].gradient}
              icon={gridOptions[2].icon}
              onPress={() => onSelectOption(gridOptions[2].value)}
              screenHeight={screenHeight}
            />
          </View>
          <View
            style={{
              flex: 1,
              aspectRatio: 1,
              maxWidth: Math.min(baseDimension * 0.36, 230), // Increased max size
              maxHeight: Math.min(baseDimension * 0.36, 230),
            }}
          >
            <GridButton
              title={gridOptions[3].title}
              subtitle={gridOptions[3].subtitle}
              gradient={gridOptions[3].gradient}
              icon={gridOptions[3].icon}
              onPress={() => onSelectOption(gridOptions[3].value)}
              screenHeight={screenHeight}
            />
          </View>
        </View>
      </View>

      {/* Scanner button with consistent margin */}
      <TouchableOpacity
        onPress={onScanNow}
        style={{
          marginBottom: Math.min(screenHeight * 0.03, 30), // Consistent bottom margin
          marginHorizontal: scannerButtonPaddingH,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          paddingHorizontal: scannerButtonPaddingH,
          paddingVertical: scannerButtonPaddingV,
          borderRadius: scannerButtonBorderRadius,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.4)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: "#374151",
            textAlign: "center",
            fontWeight: "500",
            fontSize: scannerButtonFontSize,
          }}
        >
          Take me to the scanner
        </Text>
      </TouchableOpacity>
    </View>
  );
}
