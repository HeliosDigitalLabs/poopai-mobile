import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../types/navigation";
import { useDimensions } from "../../context/core/DimensionsContext";

// Import SVG assets
import CameraSvg from "../../assets/camera.svg";
import PoopbotSvg from "../../assets/poopbot.svg";

type NoPoopDetectedScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NoPoopDetected"
>;
type NoPoopDetectedScreenRouteProp = RouteProp<
  RootStackParamList,
  "NoPoopDetected"
>;

export default function NoPoopDetectedScreen() {
  const navigation = useNavigation<NoPoopDetectedScreenNavigationProp>();
  const route = useRoute<NoPoopDetectedScreenRouteProp>();
  const { screenHeight, screenWidth } = useDimensions();

  // Get the photo from route params
  const photo = route.params?.photo;

  // PoopBot floating animation values
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const bobY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const bubblePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start PoopBot floating animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 4,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: -4,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, {
          toValue: 1.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: -1.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(bobY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatX, {
          toValue: 2,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: -2,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(floatX, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubblePulse, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(bubblePulse, {
          toValue: 0.98,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(bubblePulse, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      floatY.stopAnimation();
      floatX.stopAnimation();
      bobY.stopAnimation();
      rotation.stopAnimation();
      bubblePulse.stopAnimation();
    };
  }, []);

  const handleTryAgain = () => {
    // Navigate back to camera screen
    navigation.navigate("Camera");
  };

  const handleGoHome = () => {
    // Navigate to home screen
    navigation.navigate("Home");
  };

  return (
    <View className="flex-1">
      {/* Status Bar Spacing */}
      <View className="pt-16" />

      {/* Main Content Container */}
      <View
        className="flex-1 mx-4 my-6 rounded-3xl overflow-hidden"
        style={{
          borderWidth: 3,
          borderColor: "rgb(120, 79, 46)",
          backgroundColor: "rgb(120, 79, 46)",
        }}
      >
        {/* Photo Background */}
        <ImageBackground
          source={{ uri: photo }}
          className="flex-1"
          resizeMode="cover"
        >
          {/* Dark overlay for better text readability */}
          <View
            className="flex-1"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          >
            {/* Content Area */}
            <View className="flex-1 justify-center items-center px-8">
              {/* PoopBot */}
              <View
                style={{
                  alignItems: "center",
                  marginBottom: screenHeight * 0.02,
                  minHeight: screenHeight * 0.2,
                  justifyContent: "center",
                }}
              >
                {/* Floating PoopBot */}
                <Animated.View
                  style={{
                    transform: [
                      { translateX: floatX },
                      {
                        translateY: Animated.add(Animated.add(floatY, bobY), 0),
                      },
                    ],
                  }}
                >
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: rotation.interpolate({
                            inputRange: [-1, 1],
                            outputRange: ["-1deg", "1deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <PoopbotSvg
                      width={screenHeight * 0.18}
                      height={screenHeight * 0.18}
                    />
                  </Animated.View>
                </Animated.View>
              </View>

              {/* Chat Bubble - Matching AnalyzePrompt Style */}
              <View
                style={{
                  alignItems: "center",
                  marginBottom: screenHeight * 0.04,
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: bubblePulse }],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.75)",
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.6)",
                      paddingHorizontal: screenWidth * 0.04,
                      paddingVertical: screenWidth * 0.04,
                      maxWidth: screenWidth * 0.55 * 1.1,
                      minHeight: screenHeight * 0.08,
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#DC2626",
                        fontSize: screenHeight * 0.024,
                        fontWeight: "600",
                        textAlign: "center",
                        lineHeight: screenHeight * 0.028,
                      }}
                    >
                      🚫 Oops! I'm not seeing any poop.
                    </Text>
                    <Text
                      style={{
                        color: "#374151",
                        fontSize: screenHeight * 0.019,
                        fontWeight: "400",
                        textAlign: "center",
                        lineHeight: screenHeight * 0.023,
                        marginTop: 8,
                      }}
                    >
                      Might've been the lighting, the angle, or... not poop.
                      Let's try again!
                    </Text>
                  </View>
                </Animated.View>
              </View>

              {/* Tips Section */}
              <View
                className="p-4 rounded-2xl mb-4"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  borderWidth: 1,
                  borderColor: "rgba(59, 130, 246, 0.4)",
                  width: "100%",
                }}
              >
                <Text
                  className="text-blue-200 font-semibold mb-3 text-center"
                  style={{
                    fontSize: screenHeight * 0.02,
                  }}
                >
                  💡 Tips for a Clearer Scan:
                </Text>
                <View className="space-y-2">
                  <Text
                    className="text-blue-100 leading-relaxed"
                    style={{
                      fontSize: screenHeight * 0.018,
                    }}
                  >
                    • Good lighting helps me see better
                  </Text>
                  <Text
                    className="text-blue-100 leading-relaxed"
                    style={{
                      fontSize: screenHeight * 0.018,
                    }}
                  >
                    • Keep the poop clearly in view
                  </Text>
                  <Text
                    className="text-blue-100 leading-relaxed"
                    style={{
                      fontSize: screenHeight * 0.018,
                    }}
                  >
                    • Avoid blur or glare
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Action Buttons */}
      <View className="mx-4 mb-4">
        <View className="flex-row justify-between" style={{ height: 120 }}>
          {/* Try Again Button */}
          <View className="flex-1 items-center justify-center">
            <TouchableOpacity
              onPress={handleTryAgain}
              className="items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <CameraSvg width={96} height={96} color="#16A34A" />
              <Text
                className="text-green-600 font-semibold text-center mt-2"
                style={{ fontSize: screenHeight * 0.018 }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>

          {/* Go Home Button */}
          <View className="flex-1 items-center justify-center">
            <TouchableOpacity
              onPress={handleGoHome}
              className="items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View
                className="w-24 h-24 rounded-full justify-center items-center"
                style={{
                  backgroundColor: "rgba(107, 114, 128, 0.1)",
                  borderWidth: 2,
                  borderColor: "rgba(107, 114, 128, 0.3)",
                }}
              >
                <Text className="text-4xl">🏠</Text>
              </View>
              <Text
                className="text-gray-600 font-semibold text-center mt-2"
                style={{ fontSize: screenHeight * 0.018 }}
              >
                Go Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
