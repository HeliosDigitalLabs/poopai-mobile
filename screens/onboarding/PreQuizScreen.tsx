import React, { useState } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import OnboardingScreenComponent from "../../components/core/OnboardingScreen";

export default function PreQuizScreen() {
  const navigation = useNavigation();
  const [showDialogue, setShowDialogue] = useState(true);

  const dialogueMessages = [
    {
      text: "Awesome. Let’s get things set up just for you.",
      buttonText: "Sure!",
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
