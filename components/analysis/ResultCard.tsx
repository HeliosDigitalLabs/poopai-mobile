import React from 'react';
import { View, Text } from 'react-native';

interface ResultCardProps {
  score: number;
}

export default function ResultCard({ score }: ResultCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50/90';
    if (score >= 60) return 'bg-yellow-50/90';
    return 'bg-red-50/90';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200/60';
    if (score >= 60) return 'border-yellow-200/60';
    return 'border-red-200/60';
  };

  return (
    <View className={`${getScoreBgColor(score)} rounded-3xl p-8 mx-6 border-2 ${getScoreBorderColor(score)} backdrop-blur-sm`}>
      <View className="items-center">
        <Text className="text-gray-600 text-lg font-light mb-2 tracking-wide">
          Your Poop Score
        </Text>
        <Text className={`text-7xl font-light mb-4 ${getScoreColor(score)}`}>
          {score}
        </Text>
        <View className="w-16 h-1 bg-gray-300/50 rounded-full" />
      </View>
    </View>
  );
}
