import React from 'react';
import { View, Text } from 'react-native';

interface QuizQuestionHeaderProps {
  title: string;
  subtitle?: string;
  titleSize?: 'small' | 'medium' | 'large';
}

export default function QuizQuestionHeader({ 
  title, 
  subtitle, 
  titleSize = 'large' 
}: QuizQuestionHeaderProps) {
  const getTitleClasses = () => {
    switch (titleSize) {
      case 'small':
        return 'text-2xl font-semibold text-gray-800 text-center mb-4';
      case 'medium':
        return 'text-2xl font-bold text-gray-800 text-center mb-6';
      case 'large':
      default:
        return 'text-3xl font-bold text-gray-800 text-center mb-8';
    }
  };

  return (
    <View>
      {subtitle && (
        <Text className="text-2xl font-semibold text-gray-800 text-center mb-4">
          {subtitle}
        </Text>
      )}
      <Text className={getTitleClasses()}>
        {title}
      </Text>
    </View>
  );
}
