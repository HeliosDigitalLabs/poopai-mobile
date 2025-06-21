import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuiz } from "../../context/features/QuizContext";
import { useOnboarding } from "../../context/features/OnboardingContext";
import {
  QuizScreenLayout,
  QuizSingleSelect,
  MainQuizGridButtons,
} from "../../components/quiz";

type QuizStep =
  | "main-goal"
  | "health-intro"
  | "health-conditions"
  | "conditions-confirmation"
  | "health-symptoms"
  | "symptoms-confirmation"
  | "health-goals"
  | "goals-confirmation"
  | "tracking-intro"
  | "tracking-conditions"
  | "tracking-conditions-confirmation"
  | "tracking-symptoms"
  | "tracking-symptoms-confirmation"
  | "tracking-frequency"
  | "tracking-interlude"
  | "tracking-goals"
  | "tracking-goals-confirmation"
  | "curiosity-analysis-preference"
  | "curiosity-confirmation"
  | "curiosity-final"
  | "fun-acknowledgment"
  | "fun-final"
  | "final-message";

interface QuizScreenProps {
  currentStep: QuizStep;
  onStepChange: (step: QuizStep) => void;
}

export default function QuizScreen({
  currentStep,
  onStepChange,
}: QuizScreenProps) {
  const navigation = useNavigation();
  const { answers, updateAnswers } = useQuiz();
  const { completeOnboarding } = useOnboarding();

  const handleMainGoalSelect = (goal: string) => {
    updateAnswers({ mainGoal: goal });

    // Navigate based on selected goal
    switch (goal) {
      case "I want to improve my health":
        onStepChange("health-intro");
        break;
      case "I want to track digestion over time":
        onStepChange("tracking-intro");
        break;
      case "I'm just curious what my poop score will be":
        onStepChange("curiosity-analysis-preference");
        break;
      case "Just for fun":
        // Save preference for funny analysis and go to fun flow
        updateAnswers({ analysisPreference: "Funny" });
        onStepChange("fun-acknowledgment");
        break;
    }
  };

  const renderMainGoalScreen = () => (
    <QuizScreenLayout
      showBackButton={false}
      questionText="How can I best help you?"
      enableScrolling={false}
    >
      <MainQuizGridButtons
        onSelectOption={handleMainGoalSelect}
        onScanNow={() => completeOnboarding("camera")}
      />
    </QuizScreenLayout>
  );

  // Render different screens based on current step
  switch (currentStep) {
    case "main-goal":
      return renderMainGoalScreen();
    default:
      return renderMainGoalScreen();
  }
}
