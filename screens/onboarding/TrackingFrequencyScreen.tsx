import React from "react";
import { useQuiz, QuizAnswers } from "../../context/features/QuizContext";
import { QuizScreenLayout, QuizNavigationButton } from "../../components/quiz";
import QuizGlassmorphismSingleSelect from "../../components/quiz/QuizGlassmorphismSingleSelect";

interface TrackingFrequencyScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const FREQUENCY_OPTIONS = [
  "Every time I poop",
  "Once a day",
  "A few times a week",
  "A few times a month",
  "I'm not sure yet",
];

export default function TrackingFrequencyScreen({
  onNext,
  onBack,
}: TrackingFrequencyScreenProps) {
  const { updateAnswers } = useQuiz();

  const handleFrequencySelect = (
    frequency: (typeof FREQUENCY_OPTIONS)[number]
  ) => {
    updateAnswers({
      trackingFrequency: frequency as QuizAnswers["trackingFrequency"],
    });
    // Immediately proceed to next step when option is selected
    setTimeout(onNext, 300); // Small delay for visual feedback
  };

  return (
    <>
      <QuizScreenLayout
        onBack={onBack}
        questionText="How often would you like to analyze your poop?"
        subtitle="Select one option"
        showBackButton={false}
      >
        <QuizGlassmorphismSingleSelect
          options={FREQUENCY_OPTIONS}
          onSelectOption={handleFrequencySelect}
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
