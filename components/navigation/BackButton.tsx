import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { RootStackParamList } from "../../types/navigation";

// Import Back SVG
import BackSvg from "../../assets/back.svg";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BackButtonProps {
  className?: string;
  textClassName?: string;
  children?: React.ReactNode;
  size?: number;
  showIcon?: boolean;
  onPress?: () => void;
}

export default function BackButton({
  className = "absolute top-12 left-6",
  textClassName = "text-lg",
  children,
  size = 30,
  showIcon = true,
  onPress,
}: BackButtonProps) {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        position: "absolute",
        top: 48, // Use a larger top value for more space from the status bar/time
        left: 24,
        zIndex: 999,
      }}
      activeOpacity={0.8}
    >
      {showIcon ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Glassmorphism background with blur */}
          <BlurView
            intensity={25}
            tint="light"
            style={{
              flex: 1,
              borderRadius: 24,
              overflow: "hidden",
              borderWidth: 1.5,
              borderColor: "rgba(255, 255, 255, 0.4)",
            }}
          >
            {/* Gradient overlay for liquid glass effect */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.4)",
                "rgba(255, 255, 255, 0.1)",
                "rgba(255, 255, 255, 0.3)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 24,
                position: "relative",
              }}
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
                  borderRadius: 24,
                }}
              />

              {/* Inner glow effect */}
              <View
                style={{
                  position: "absolute",
                  top: 1,
                  left: 1,
                  right: 1,
                  bottom: 1,
                  borderRadius: 23,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.6)",
                }}
              />

              {/* Glass reflection highlight */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "40%",
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  opacity: 0.6,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                }}
              />

              {/* Back arrow icon */}
              <View style={{ zIndex: 2 }}>
                <BackSvg
                  width={size * 0.6}
                  height={size * 0.6}
                  style={{
                    shadowColor: "rgba(0, 0, 0, 0.3)",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.5,
                    shadowRadius: 2,
                  }}
                />
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      ) : (
        <Text className={textClassName}>{children || "◁ Back"}</Text>
      )}
    </TouchableOpacity>
  );
}
