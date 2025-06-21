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
      text: "I was trained on countless poop samples. I've seen it all.",
    },
    {
      text: "Every poop says a thousand words. I'll help you read them.",
    },
    {
      text: "Ready to start scanning poop?",
      buttonText: "Let's go!",
      onButtonPress: () => {
        setShowDialogue(false);
        (navigation as any).navigate("MicroQuiz");
      },
    },
  ];

  const handleDialogueComplete = () => {
    setShowDialogue(false);
    (navigation as any).navigate("MicroQuiz");
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
