import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import HeroSecondaryButton from "../ui/HeroSecondaryButton";

interface QuizSubmitButtonProps {
  text?: string;
  onPress: () => void;
  isEnabled?: boolean;
  variant?: "primary" | "secondary";
  noPadding?: boolean;
}

export default function QuizSubmitButton({
  text = "Submit",
  onPress,
  isEnabled = true,
  variant = "primary",
  noPadding = false,
}: QuizSubmitButtonProps) {
  // If it's a secondary variant, use HeroSecondaryButton
  if (variant === "secondary") {
    const containerClasses = noPadding ? "" : "px-6 pb-8";
    return (
      <View className={containerClasses}>
        <View className="items-center">
          <HeroSecondaryButton title={text} onPress={onPress} width={260} />
        </View>
      </View>
    );
  }

  // Primary variant styling
  const getButtonClasses = () => {
    return `p-4 rounded-xl ${isEnabled ? "bg-blue-600" : "bg-gray-300"}`;
  };

  const getTextClasses = () => {
    return `text-lg font-semibold text-center ${
      isEnabled ? "text-white" : "text-gray-500"
    }`;
  };

  const containerClasses = noPadding ? "" : "px-6 pb-8";

  return (
    <View className={containerClasses}>
      <TouchableOpacity
        className={getButtonClasses()}
        onPress={onPress}
        disabled={!isEnabled}
      >
        <Text className={getTextClasses()}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
}
