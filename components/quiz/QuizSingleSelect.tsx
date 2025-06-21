import React from 'react';
import { View } from 'react-native';
import QuizOptionButton from './QuizOptionButton';

interface QuizSingleSelectProps {
  options: string[];
  onSelectOption: (option: string) => void;
  includeSecondaryOption?: {
    text: string;
    onPress: () => void;
  };
}

export default function QuizSingleSelect({ 
  options, 
  onSelectOption,
  includeSecondaryOption
}: QuizSingleSelectProps) {
  return (
    <View className="space-y-4 mb-8">
      {options.map((option, index) => (
        <QuizOptionButton
          key={index}
          text={option}
          onPress={() => onSelectOption(option)}
        />
      ))}
      
      {includeSecondaryOption && (
        <QuizOptionButton
          text={includeSecondaryOption.text}
          onPress={includeSecondaryOption.onPress}
          variant="secondary"
        />
      )}
    </View>
  );
}
