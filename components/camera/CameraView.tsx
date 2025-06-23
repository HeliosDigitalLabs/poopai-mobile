import React, { useRef, useEffect } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import {
  CameraView as ExpoCamera,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";

// Import Focus SVG
import FocusSvg from "../../assets/focus.svg";

interface CameraViewProps {
  onCapture: (uri: string) => void;
  isReady: boolean;
  isCameraWarmed: boolean;
  flashMode?: FlashMode;
  onCameraReady?: () => void; // New callback for when camera is mounted
}

export default function CameraView({
  onCapture,
  isReady,
  isCameraWarmed,
  flashMode = "auto",
  onCameraReady,
}: CameraViewProps) {
  const cameraRef = useRef<ExpoCamera | null>(null);
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const focusBoxScale = useRef(new Animated.Value(0)).current;
  const focusBoxOpacity = useRef(new Animated.Value(0)).current;

  // Animate focus box when camera is warmed up
  useEffect(() => {
    if (isCameraWarmed) {
      // Reset to 0 first to ensure clean start
      focusBoxScale.setValue(0);
      focusBoxOpacity.setValue(0);

      // Animate focus box appearing with scale and fade
      Animated.parallel([
        Animated.spring(focusBoxScale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(focusBoxOpacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset focus box when camera not ready
      focusBoxScale.setValue(0);
      focusBoxOpacity.setValue(0);
    }
  }, [isCameraWarmed, focusBoxScale, focusBoxOpacity]);

  const handlePress = async () => {
    if (!isReady || !cameraRef.current) return;

    try {
      // Animate focus box expanding outwards and disappearing
      Animated.parallel([
        Animated.timing(focusBoxScale, {
          toValue: 1.5, // Expand outwards
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(focusBoxOpacity, {
          toValue: 0, // Fade out
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Create ripple effect
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Take the actual photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      onCapture(photo.uri);
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
  });

  return (
    <TouchableOpacity
      className="flex-1 relative"
      onPress={handlePress}
      activeOpacity={0.95}
    >
      {/* Actual Camera Preview - Optimized for faster initialization */}
      <ExpoCamera
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        ratio="16:9"
        animateShutter={false}
        onCameraReady={() => {
          console.log("📷 Camera is ready and mounted");
          onCameraReady?.();
        }}
      />

      {/* Center focus indicator - Animated SVG when camera is ready */}
      <View className="absolute inset-0 items-center justify-center pointer-events-none">
        <Animated.View
          style={{
            transform: [{ scale: focusBoxScale }],
            opacity: focusBoxOpacity,
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <FocusSvg width="96" height="96" />
          </View>
        </Animated.View>
      </View>

      {/* Ripple effect overlay */}
      <Animated.View
        className="absolute inset-0 bg-blue-400/20"
        style={{
          transform: [{ scale: rippleScale }],
          opacity: rippleOpacity,
        }}
        pointerEvents="none"
      />
    </TouchableOpacity>
  );
}
