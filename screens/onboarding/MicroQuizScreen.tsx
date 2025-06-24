import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnboarding } from "../../context/features/OnboardingContext";
import { useQuiz } from "../../context/features/QuizContext";
import QuizScreen from "./QuizScreen";
import ConditionsScreen from "./ConditionsScreen";
import SymptomsScreen from "./SymptomsScreen";
import GoalsScreen from "./GoalsScreen";
import TrackingFrequencyScreen from "./TrackingFrequencyScreen";
import AnalysisPreferenceScreen from "./AnalysisPreferenceScreen";
import OnboardingScreenComponent from "../../components/core/OnboardingScreen";
import OnboardingAuthModal from "../../components/auth/OnboardingAuthModal";

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

export default function MicroQuizScreen() {
  const { completeOnboarding } = useOnboarding();
  const navigation = useNavigation();
  const { answers, updateAnswers } = useQuiz();

  const [currentStep, setCurrentStep] = useState<QuizStep>("main-goal");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleStepChange = (step: QuizStep) => {
    setCurrentStep(step);
  };

  const goToCamera = () => {
    // Show auth modal first before going to camera
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Proceed to camera after auth modal is closed (whether user signed up or skipped)
    completeOnboarding("camera");
    // Navigation will happen automatically when hasCompletedOnboarding becomes true
  };

  const handleSkipAuth = () => {
    setShowAuthModal(false);
    // User chose to skip authentication, still proceed to camera
    completeOnboarding("camera");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "main-goal":
        return (
          <QuizScreen
            currentStep={currentStep}
            onStepChange={handleStepChange}
          />
        );

      case "health-intro":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Got it. Let's make sure I can give you the best help possible.",
                },
              ]}
              onComplete={() => setCurrentStep("health-conditions")}
              visible={true}
            />
          </View>
        );

      case "tracking-intro":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Got it. Let's make sure I can give you the best tracking data.",
                },
              ]}
              onComplete={() => setCurrentStep("tracking-conditions")}
              visible={true}
            />
          </View>
        );

      case "curiosity-analysis-preference":
        return (
          <AnalysisPreferenceScreen
            onNext={() => setCurrentStep("curiosity-confirmation")}
            onBack={() => setCurrentStep("main-goal")}
          />
        );

      case "health-conditions":
        return (
          <ConditionsScreen
            onNext={() => setCurrentStep("conditions-confirmation")}
            onBack={() => setCurrentStep("main-goal")}
          />
        );

      case "conditions-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Thanks. I'll keep that in mind when analyzing your poop.",
                },
              ]}
              onComplete={() => setCurrentStep("health-symptoms")}
              visible={true}
            />
          </View>
        );

      case "health-symptoms":
        return (
          <SymptomsScreen
            onNext={() => setCurrentStep("symptoms-confirmation")}
            onBack={() => setCurrentStep("health-conditions")}
          />
        );

      case "symptoms-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Thanks, I'll remember that. Just one more thing before we get started.",
                  buttonText: "Continue",
                  onButtonPress: () => setCurrentStep("health-goals"),
                },
              ]}
              onComplete={() => setCurrentStep("health-goals")}
              visible={true}
            />
          </View>
        );

      case "health-goals":
        return (
          <GoalsScreen
            onNext={() => setCurrentStep("goals-confirmation")}
            onBack={() => setCurrentStep("health-symptoms")}
          />
        );

      case "goals-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Congrats! You're one step closer to healthier poops.",
                },
              ]}
              onComplete={() => setCurrentStep("final-message")}
              visible={true}
            />
          </View>
        );

      // Tracking flow cases
      case "tracking-conditions":
        return (
          <ConditionsScreen
            onNext={() => setCurrentStep("tracking-conditions-confirmation")}
            onBack={() => setCurrentStep("main-goal")}
          />
        );

      case "tracking-conditions-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Thanks. I'll consider that when analyzing your poop.",
                  buttonText: "Continue",
                  onButtonPress: () => setCurrentStep("tracking-symptoms"),
                },
              ]}
              onComplete={() => setCurrentStep("tracking-symptoms")}
              visible={true}
            />
          </View>
        );

      case "tracking-symptoms":
        return (
          <SymptomsScreen
            onNext={() => setCurrentStep("tracking-symptoms-confirmation")}
            onBack={() => setCurrentStep("tracking-conditions")}
          />
        );

      case "tracking-symptoms-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Thanks, I'll remember that. Just two more things before we get started.",
                  buttonText: "Continue",
                  onButtonPress: () => setCurrentStep("tracking-frequency"),
                },
              ]}
              onComplete={() => setCurrentStep("tracking-frequency")}
              visible={true}
            />
          </View>
        );

      case "tracking-frequency":
        return (
          <TrackingFrequencyScreen
            onNext={() => setCurrentStep("tracking-interlude")}
            onBack={() => setCurrentStep("tracking-symptoms")}
          />
        );

      case "tracking-interlude":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Just one more question!",
                  buttonText: "Continue",
                  onButtonPress: () => setCurrentStep("tracking-goals"),
                },
              ]}
              onComplete={() => setCurrentStep("tracking-goals")}
              visible={true}
            />
          </View>
        );

      case "tracking-goals":
        return (
          <GoalsScreen
            onNext={() => setCurrentStep("tracking-goals-confirmation")}
            onBack={() => setCurrentStep("tracking-frequency")}
          />
        );

      case "tracking-goals-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Nice. PoopAI will remind you of this in your results and history.",
                },
              ]}
              onComplete={() => setCurrentStep("final-message")}
              visible={true}
            />
          </View>
        );

      // Curiosity flow cases
      case "curiosity-confirmation":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Sure thing! I'll keep that in mind.",
                },
              ]}
              onComplete={() => setCurrentStep("curiosity-final")}
              visible={true}
            />
          </View>
        );

      case "curiosity-final":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Now let's start scanning some poop!",
                  buttonText: "Let's go!",
                  onButtonPress: goToCamera,
                },
              ]}
              onComplete={goToCamera}
              visible={true}
            />
          </View>
        );

      // Fun flow cases
      case "fun-acknowledgment":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Love to hear it.",
                },
              ]}
              onComplete={() => setCurrentStep("fun-final")}
              visible={true}
            />
          </View>
        );

      case "fun-final":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Let's waste no more time then, let's get scannin'!",
                  buttonText: "Scan my poop",
                  onButtonPress: goToCamera,
                },
              ]}
              onComplete={goToCamera}
              visible={true}
            />
          </View>
        );

      case "final-message":
        return (
          <View className="flex-1 bg-transparent">
            <OnboardingScreenComponent
              messages={[
                {
                  text: "Now enough talking, let's scan some poop!",
                  buttonText: "Scan now",
                  onButtonPress: goToCamera,
                },
              ]}
              onComplete={goToCamera}
              visible={true}
            />
          </View>
        );

      default:
        return (
          <QuizScreen currentStep="main-goal" onStepChange={handleStepChange} />
        );
    }
  };

  return (
    <View className="flex-1">
      {renderCurrentStep()}

      {/* Onboarding Authentication Modal */}
      <OnboardingAuthModal
        visible={showAuthModal}
        onClose={handleAuthModalClose}
        onSkip={handleSkipAuth}
        initialMode="create-account-selection"
      />
    </View>
  );
}
