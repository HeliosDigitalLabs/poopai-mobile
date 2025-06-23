import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useScan } from "../../context/features/ScanContext";

interface CameraScanCounterProps {
  onPress: () => void;
  hasPremium?: boolean; // Optional prop to control visibility based on premium status
}

export default function CameraScanCounter({
  onPress,
  hasPremium = false,
}: CameraScanCounterProps) {
  const { scansLeft, isLoading } = useScan();

  // Don't show the counter if loading or if user has premium (unlimited scans)
  if (isLoading || hasPremium) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Glassmorphism background with blur */}
      <BlurView intensity={20} tint="light" style={styles.blurContainer}>
        {/* Gradient overlay for liquid glass effect */}
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.4)",
            "rgba(255, 255, 255, 0.1)",
            "rgba(255, 255, 255, 0.3)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        >
          {/* Content container */}
          <View style={styles.contentContainer}>
            {/* Scans Left Text and Counter */}
            <View style={styles.textContainer}>
              <Text style={styles.label}>Scans Left:</Text>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>{scansLeft}</Text>
              </View>
            </View>

            {/* Plus button */}
            <View style={styles.plusContainer}>
              <LinearGradient
                colors={["rgba(59, 130, 246, 0.8)", "rgba(37, 99, 235, 0.9)"]}
                style={styles.plusButton}
              >
                <Text style={styles.plusText}>+</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Subtle border glow */}
      <View style={styles.borderGlow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
    marginTop: 10,
    marginHorizontal: 20,
  },
  blurContainer: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  gradientOverlay: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 200,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 2,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.8)",
    marginRight: 8,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  counterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.9)",
    textAlign: "center",
    minWidth: 20,
  },
  plusContainer: {
    marginLeft: 8,
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "rgba(59, 130, 246, 0.4)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  plusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  borderGlow: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    zIndex: -1,
  },
});
