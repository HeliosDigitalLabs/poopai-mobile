import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useOnboarding } from "../../context/features/OnboardingContext";
import OnboardingScreenComponent from "../../components/core/OnboardingScreen";

export default function OnboardingScreen() {
  const { completeOnboarding } = useOnboarding();
  const navigation = useNavigation();
  const [showDialogue, setShowDialogue] = useState(true);

  const dialogueMessages = [
    {
      text: "Hi! I'm PoopAI.",
    },
    {
      text: "Trained from countless poops, I've truly seen it all.",
    },
    {
      text: "After all that, one thing's clear: every poop says a thousand words.",
    },
    {
      text: "Now I’m here to show you exactly what yours is saying.",
    },
    {
      text: "Just take a photo and I'll break it all down before you can even flush.",
    },
    {
      text: "Ready to start scanning your poop?",
      buttonText: "Let's go!",
      onButtonPress: () => {
        setShowDialogue(false);
        (navigation as any).navigate("PreQuiz");
      },
    },
  ];

  const handleDialogueComplete = () => {
    setShowDialogue(false);
    (navigation as any).navigate("PreQuiz");
  };

  return (
    <View className="flex-1 bg-transparent">
      <OnboardingScreenComponent
        messages={dialogueMessages}
        onComplete={handleDialogueComplete}
        visible={showDialogue}
      />
    </View>
  );
}
