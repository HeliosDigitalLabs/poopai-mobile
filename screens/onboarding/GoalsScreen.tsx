import React, { useState } from "react";
import { View } from "react-native";
import { useQuiz } from "../../context/features/QuizContext";
import {
  QuizScreenLayout,
  GoalsGridButtons,
  QuizNavigationButton,
} from "../../components/quiz";

interface GoalsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const HEALTH_GOALS = [
  "Stay regular",
  "Eat more fiber",
  "Less bloating",
  "Improve overall gut health",
];

export default function GoalsScreen({ onNext, onBack }: GoalsScreenProps) {
  const { answers, updateAnswers } = useQuiz();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    answers.healthGoals || []
  );

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = () => {
    updateAnswers({
      healthGoals: selectedGoals,
    });
    onNext();
  };

  return (
    <QuizScreenLayout
      onBack={onBack}
      showBackButton={false}
      questionText="Commit to pooping better by setting at least one goal."
      subtitle="Select all that apply"
      enableScrolling={false}
    >
      <GoalsGridButtons
        options={HEALTH_GOALS}
        selectedOptions={selectedGoals}
        onToggleOption={toggleGoal}
      />

      <QuizNavigationButton
        onPress={onBack}
        direction="back"
        position="bottom-left"
        enableVerticalAlignment={true}
      />

      <QuizNavigationButton
        onPress={handleSubmit}
        direction="next"
        position="bottom-right"
        enableVerticalAlignment={true}
      />
    </QuizScreenLayout>
  );
}
