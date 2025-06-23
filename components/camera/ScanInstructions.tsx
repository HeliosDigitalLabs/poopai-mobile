import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface ScanInstructionsProps {
  isVisible: boolean;
}

export default function ScanInstructions({ isVisible }: ScanInstructionsProps) {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isVisible) {
      // Create subtle breathing animation
      const breathingAnimation = () => {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.4,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Loop the animation
          if (isVisible) {
            breathingAnimation();
          }
        });
      };
      
      breathingAnimation();
    } else {
      // Reset animation when not visible
      fadeAnim.setValue(0.4);
    }
  }, [isVisible, fadeAnim]);

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 flex-1 items-center justify-center pointer-events-none">
      {/* Simple instruction text below center box */}
      <View className="mt-44">
        <Animated.Text 
          className="text-white/60 text-2xl font-light italic text-center"
          style={{ opacity: fadeAnim }}
        >
          Tap screen to scan
        </Animated.Text>
      </View>
    </View>
  );
}
