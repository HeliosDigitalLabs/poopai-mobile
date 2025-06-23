import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  className?: string;
}

export default function PrimaryButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon,
  className = '' 
}: PrimaryButtonProps) {
  const baseStyle = "rounded-2xl py-4 px-8 items-center justify-center";
  const variantStyle = variant === 'primary' 
    ? "bg-green-500/90 border-2 border-green-400/50" 
    : "bg-white/90 border-2 border-gray-300/50";
  
  const textStyle = variant === 'primary'
    ? "text-white font-medium text-lg tracking-wide"
    : "text-gray-700 font-medium text-lg tracking-wide";
  
  return (
    <TouchableOpacity 
      className={`${baseStyle} ${variantStyle} ${className}`}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        {icon && <View className="mr-2">{icon}</View>}
        <Text className={textStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
