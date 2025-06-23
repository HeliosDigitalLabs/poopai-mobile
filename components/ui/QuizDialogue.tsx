import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PoopbotSvg from "../../assets/poopbot.svg";
import HeroPrimaryButton from "./HeroPrimaryButton";
import HeroSecondaryButton from "./HeroSecondaryButton";

interface QuizDialogueProps {
  message: string;
  buttonText: string;
  onButtonPress: () => void;
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  onSecondaryButtonPress?: () => void;
}

export default function QuizDialogue({
  message,
  buttonText,
  onButtonPress,
  showSecondaryButton = false,
  secondaryButtonText,
  onSecondaryButtonPress,
}: QuizDialogueProps) {
  return (
    <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
      {/* Small PoopBot in top left */}
      <View className="absolute top-16 left-4 z-10">
        <PoopbotSvg width="80" height="80" />
      </View>

      {/* Centered message */}
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-3xl font-bold text-gray-800 text-center">
          {message}
        </Text>
      </View>

      {/* Primary Action Button */}
      <View className="absolute bottom-24" style={{ alignSelf: "center" }}>
        <HeroPrimaryButton
          title={buttonText}
          onPress={onButtonPress}
          width={280}
          height={70}
          fontSize={18}
        />
      </View>

      {/* Secondary Action Button */}
      {showSecondaryButton && secondaryButtonText && onSecondaryButtonPress && (
        <View className="absolute bottom-6" style={{ alignSelf: "center" }}>
          <HeroSecondaryButton
            title={secondaryButtonText}
            onPress={onSecondaryButtonPress}
          />
        </View>
      )}
    </View>
  );
}
