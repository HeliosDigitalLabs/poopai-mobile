import React from 'react';
import { View, Text } from 'react-native';

interface AnalysisSummaryProps {
  score: number;
}

export default function AnalysisSummary({ score }: AnalysisSummaryProps) {
  const getAnalysisMessage = (score: number) => {
    if (score >= 90) return "Excellent! Your digestive health is looking fantastic! 🌟";
    if (score >= 80) return "Great job! You're maintaining good digestive health! 💚";
    if (score >= 70) return "Nice! Your digestive system is doing well overall! 👍";
    if (score >= 60) return "Not bad! There's room for some healthy improvements! 🌱";
    if (score >= 50) return "Your digestive health could use some attention! 💙";
    return "Let's work on improving your digestive wellness! 🌈";
  };

  return (
    <View className="bg-white/80 rounded-2xl p-6 mx-6 mb-8 backdrop-blur-sm border border-white/50">
      <Text className="text-gray-700 text-center text-lg font-light leading-relaxed">
        {getAnalysisMessage(score)}
      </Text>
    </View>
  );
}
