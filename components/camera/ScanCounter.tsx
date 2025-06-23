import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDimensions } from "../../context/core/DimensionsContext";

interface ScanCounterProps {
  scansLeft?: number;
  onPress?: () => void;
  cameraButtonSize?: number; // Accept camera button size as prop for consistent scaling
}

export default function ScanCounter({
  scansLeft = 3,
  onPress,
  cameraButtonSize,
}: ScanCounterProps) {
  // Get current device dimensions from context
  const { screenHeight } = useDimensions();

  // Use provided camera button size or calculate default from screen height only
  const buttonSize = cameraButtonSize || screenHeight * 0.12; // 12% of screen height as default

  // Calculate responsive values based on camera button size (proportional scaling)
  const counterSize = buttonSize * 0.27; // 27% of camera button size
  const topPosition = buttonSize * -0.11; // -11% of camera button size
  const rightPosition = buttonSize * -0.07; // -7% of camera button size
  const borderRadius = counterSize * 0.25; // 25% of counter size
  const innerBorderRadius = borderRadius - counterSize * 0.033; // Proportional inner radius (2/60 ratio)
  const paddingHorizontal = counterSize * 0.15; // 15% of counter size
  const paddingVertical = counterSize * 0.1; // 10% of counter size
  const titleFontSize = screenHeight * 0.011; // 1.1% of screen height
  const numberFontSize = screenHeight * 0.02; // 2% of screen height
  const labelFontSize = screenHeight * 0.012; // 1.2% of screen height

  // Additional responsive values for fine details
  const borderWidth = counterSize * 0.025; // Proportional border width
  const shadowHeight = counterSize * 0.05; // Proportional shadow height
  const shadowRadius = counterSize * 0.067; // Proportional shadow radius
  const titleMarginBottom = counterSize * 0.05; // Proportional title margin
  const itemGap = counterSize * 0.1; // Proportional gap between items
  const numberBoxRadius = counterSize * 0.15; // Proportional number box radius
  const numberBoxPadding = counterSize * 0.067; // Proportional number box padding
  const plusButtonSize = counterSize * 0.25; // Proportional plus button size
  const plusButtonRadius = counterSize * 0.117; // Proportional plus button radius

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        position: "absolute",
        top: topPosition,
        right: rightPosition,
        borderRadius: borderRadius,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: shadowHeight },
        shadowOpacity: 0.3,
        shadowRadius: shadowRadius,
        elevation: 12,
        zIndex: 10,
        borderWidth: borderWidth,
        borderColor: "#C8E9F5",
        minWidth: counterSize,
      }}
    >
      <LinearGradient
        colors={["#8B4513", "#C17B4C"]} // Dark brown to Sienna (less drastic gradient)
        start={{ x: 0, y: 1 }} // Bottom-left (dark)
        end={{ x: 1, y: 0 }} // Top-right (light) - 45 degree angle
        style={{
          borderRadius: innerBorderRadius,
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: titleFontSize,
              fontWeight: "600",
              textAlign: "center",
              marginBottom: titleMarginBottom,
              letterSpacing: 0.2,
            }}
          >
            Scans Left
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: itemGap }}
          >
            {/* Professional counter box for the number */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: numberBoxRadius,
                paddingHorizontal: numberBoxPadding,
                paddingVertical: numberBoxPadding * 0.6, // Slightly less vertical padding
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: counterSize * 0.017 }, // Proportional shadow
                shadowOpacity: 0.15,
                shadowRadius: counterSize * 0.033, // Proportional shadow radius
                elevation: 3,
                borderWidth: borderWidth * 0.67, // Proportional border (thinner than main border)
                borderColor: "#E5E7EB",
              }}
            >
              <Text
                style={{
                  color: "#8B4513",
                  fontSize: numberFontSize,
                  fontWeight: "bold",
                  textAlign: "center",
                  lineHeight: numberFontSize, // Line height equal to font size for proper centering
                  includeFontPadding: false, // Remove extra font padding on Android
                  textAlignVertical: "center", // Ensure vertical centering on Android
                }}
              >
                {scansLeft}
              </Text>
            </View>
            {/* Plus button */}
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: plusButtonRadius,
                width: plusButtonSize,
                height: plusButtonSize,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: counterSize * 0.017 }, // Proportional shadow
                shadowOpacity: 0.1,
                shadowRadius: counterSize * 0.017, // Proportional shadow radius
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: "#8B4513",
                  fontSize: labelFontSize,
                  fontWeight: "bold",
                  lineHeight: labelFontSize * 1.08, // Proportional line height
                }}
              >
                +
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
