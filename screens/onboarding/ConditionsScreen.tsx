import React, { useState } from "react";
import { View } from "react-native";
import { useQuiz } from "../../context/features/QuizContext";
import {
  QuizScreenLayout,
  QuizMultiSelect,
  QuizNavigationButton,
} from "../../components/quiz";

interface ConditionsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const CONDITIONS = [
  "IBS",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "Celiac Disease",
  "GERD / Acid Reflux",
  "Lactose Intolerance",
  "Gallbladder Issues",
  "Diverticulitis",
  "None",
];

export default function ConditionsScreen({
  onNext,
  onBack,
}: ConditionsScreenProps) {
  const { answers, updateAnswers } = useQuiz();
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    answers.digestiveConditions || []
  );

  const toggleCondition = (condition: string) => {
    if (condition === "None") {
      // "None" is mutually exclusive with other options
      if (selectedConditions.includes(condition)) {
        setSelectedConditions([]);
      } else {
        setSelectedConditions([condition]);
      }
    } else {
      // Remove "None" if selecting a specific condition
      let newConditions = selectedConditions.filter((c) => c !== "None");

      if (selectedConditions.includes(condition)) {
        newConditions = newConditions.filter((c) => c !== condition);
      } else {
        newConditions = [...newConditions, condition];
      }

      setSelectedConditions(newConditions);
    }
  };

  const handleSubmit = () => {
    updateAnswers({
      digestiveConditions: selectedConditions,
    });
    onNext();
  };

  return (
    <QuizScreenLayout
      onBack={onBack}
      showBackButton={false}
      questionText="Do you have any of these conditions?"
      subtitle="Select all that apply"
      enableScrolling={false}
    >
      <QuizMultiSelect
        options={CONDITIONS}
        selectedOptions={selectedConditions}
        onToggleOption={toggleCondition}
      />

      <QuizNavigationButton
        onPress={onBack}
        direction="back"
        position="bottom-left"
        enableVerticalAlignment={true}
      />

      <QuizNavigationButton
        onPress={handleSubmit}
        isEnabled={selectedConditions.length > 0}
        direction="next"
        position="bottom-right"
        enableVerticalAlignment={true}
      />
    </QuizScreenLayout>
  );
}
