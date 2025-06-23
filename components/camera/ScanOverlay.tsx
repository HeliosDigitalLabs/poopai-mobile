import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, Text } from 'react-native';

interface ScanOverlayProps {
  isScanning: boolean;
}

export default function ScanOverlay({ isScanning }: ScanOverlayProps) {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get('window');

  useEffect(() => {
    if (isScanning) {
      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Main scanning line animation
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      // Pulse animation for the scanning text
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      scanAnimation.start();
      pulseAnimation.start();

      // Stop animations after 3 seconds
      setTimeout(() => {
        scanAnimation.stop();
        pulseAnimation.stop();
      }, 3000);

      return () => {
        scanAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      // Fade out overlay when scanning stops
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isScanning, scanLineAnim, pulseAnim, overlayOpacity]);

  // Don't render anything if not scanning
  if (!isScanning) return null;

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, height - 50],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.02],
  });

  return (
    <Animated.View 
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: overlayOpacity }}
    >
      {/* Dark overlay - only when actively scanning */}
      {isScanning && <View className="absolute inset-0 bg-black/70" />}
      
      {/* Only show scanning animation when actually scanning */}
      {isScanning && (
        <>
          {/* Main scanning line with realistic glow effect */}
          <Animated.View
            className="absolute left-0 right-0"
            style={{
              transform: [{ translateY }],
            }}
          >
            {/* Outer glow */}
            <View className="h-8 bg-blue-400/10" style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 20,
            }} />
            
            {/* Middle glow */}
            <View className="absolute inset-0 h-4 top-2 bg-blue-400/20" style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
              elevation: 15,
            }} />
            
            {/* Core scanning line */}
            <View className="absolute inset-0 h-0.5 top-3.5 bg-blue-400" style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 10,
            }} />
          </Animated.View>

          {/* Scanning status */}
          <View className="absolute bottom-24 left-0 right-0 items-center">
            <Animated.View
              style={{
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              }}
              className="bg-black/80 px-6 py-4 rounded-2xl border border-blue-400/30"
            >
              <Text className="text-blue-300 text-lg font-light text-center tracking-wider">
                Analyzing Sample
              </Text>
              <View className="flex-row justify-center mt-2 space-x-1">
                <View className="w-2 h-2 bg-blue-400 rounded-full" />
                <View className="w-2 h-2 bg-blue-400/60 rounded-full" />
                <View className="w-2 h-2 bg-blue-400/30 rounded-full" />
              </View>
            </Animated.View>
          </View>
        </>
      )}
    </Animated.View>
  );
}
