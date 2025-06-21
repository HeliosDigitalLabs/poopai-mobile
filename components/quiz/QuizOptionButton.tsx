import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import HeroSecondaryButton from "../ui/HeroSecondaryButton";

interface QuizOptionButtonProps {
  text: string;
  isSelected?: boolean;
  onPress: () => void;
  variant?: "default" | "secondary";
}

export default function QuizOptionButton({
  text,
  isSelected = false,
  onPress,
  variant = "default",
}: QuizOptionButtonProps) {
  // If it's a secondary variant, use HeroSecondaryButton
  if (variant === "secondary") {
    return <HeroSecondaryButton title={text} onPress={onPress} width={260} />;
  }

  // Default styling for primary options
  const getButtonClasses = () => {
    return `p-4 rounded-2xl border-2 ${
      isSelected ? "bg-blue-100 border-blue-400" : "bg-white border-gray-200"
    }`;
  };

  const getTextClasses = () => {
    return `text-lg font-medium text-center ${
      isSelected ? "text-blue-800" : "text-gray-800"
    }`;
  };

  const getShadowStyle = () => {
    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      style={getShadowStyle()}
      onPress={onPress}
    >
      <Text className={getTextClasses()}>{text}</Text>
    </TouchableOpacity>
  );
}
