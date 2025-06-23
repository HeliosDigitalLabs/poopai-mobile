import React from "react";
import { useQuiz, QuizAnswers } from "../../context/features/QuizContext";
import { QuizScreenLayout, QuizNavigationButton } from "../../components/quiz";
import QuizGlassmorphismSingleSelect from "../../components/quiz/QuizGlassmorphismSingleSelect";

interface AnalysisPreferenceScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const ANALYSIS_OPTIONS = ["Funny", "Serious", "Both"];

export default function AnalysisPreferenceScreen({
  onNext,
  onBack,
}: AnalysisPreferenceScreenProps) {
  const { updateAnswers } = useQuiz();

  const handleAnalysisSelect = (preference: string) => {
    updateAnswers({
      analysisPreference: preference as QuizAnswers["analysisPreference"],
    });
    // Immediately proceed to next step when option is selected
    setTimeout(onNext, 300); // Small delay for visual feedback
  };

  return (
    <>
      <QuizScreenLayout
        onBack={onBack}
        questionText="How would you prefer your poop analysis?"
        subtitle="Select one option"
        showBackButton={false}
      >
        <QuizGlassmorphismSingleSelect
          options={ANALYSIS_OPTIONS}
          onSelectOption={handleAnalysisSelect}
        />
      </QuizScreenLayout>

      <QuizNavigationButton
        onPress={onBack}
        direction="back"
        position="bottom-left"
      />
    </>
  );
}
