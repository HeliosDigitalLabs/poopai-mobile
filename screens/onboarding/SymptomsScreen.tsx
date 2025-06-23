import React, { useState } from "react";
import { View } from "react-native";
import { useQuiz } from "../../context/features/QuizContext";
import {
  QuizScreenLayout,
  QuizMultiSelect,
  QuizNavigationButton,
} from "../../components/quiz";

const SYMPTOMS = [
  "Constipation",
  "Diarrhea",
  "Bloating",
  "Cramping",
  "Gas",
  "Mucus in stool",
  "None",
];

interface SymptomsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export default function SymptomsScreen({
  onNext,
  onBack,
}: SymptomsScreenProps) {
  const { answers, updateAnswers } = useQuiz();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
    answers.recentSymptoms || []
  );

  const toggleSymptom = (symptom: string) => {
    let newSymptoms: string[];

    if (symptom === "None") {
      // "None" is mutually exclusive with other options
      if (selectedSymptoms.includes(symptom)) {
        newSymptoms = [];
      } else {
        newSymptoms = [symptom];
      }
    } else {
      // Remove "None" if selecting a specific symptom
      newSymptoms = selectedSymptoms.filter((s) => s !== "None");

      if (selectedSymptoms.includes(symptom)) {
        newSymptoms = newSymptoms.filter((s) => s !== symptom);
      } else {
        newSymptoms = [...newSymptoms, symptom];
      }
    }

    setSelectedSymptoms(newSymptoms);
  };

  const handleSubmit = () => {
    updateAnswers({ recentSymptoms: selectedSymptoms });
    onNext();
  };

  return (
    <QuizScreenLayout
      onBack={onBack}
      showBackButton={false}
      questionText="Have you experienced any of these recently?"
      subtitle="Select all that apply"
      enableScrolling={false}
    >
      <QuizMultiSelect
        options={SYMPTOMS}
        selectedOptions={selectedSymptoms}
        onToggleOption={toggleSymptom}
      />

      <QuizNavigationButton
        onPress={onBack}
        direction="back"
        position="bottom-left"
        enableVerticalAlignment={true}
      />

      <QuizNavigationButton
        onPress={handleSubmit}
        isEnabled={selectedSymptoms.length > 0}
        direction="next"
        position="bottom-right"
        enableVerticalAlignment={true}
      />
    </QuizScreenLayout>
  );
}
