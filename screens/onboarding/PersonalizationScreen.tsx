import React from "react";
import { View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import { useOnboarding } from "../../context/features/OnboardingContext";
import BackButton from "../../components/navigation/BackButton";
import HeroPrimaryButton from "../../components/ui/HeroPrimaryButton";

type Nav = StackNavigationProp<RootStackParamList, "Personalization">;

const contentMap = {
  laughs: {
    title: "Welcome to PoopAI's Hall of Fame.",
    description:
      "You'll get ridiculous scores, absurd metaphors, and poop history you can laugh at for years.",
  },
  curious: {
    title: "Your poop has stories to tell.",
    description:
      "PoopAI helps you decode them. You'll get poetic breakdowns and oddly specific insights into what's going on in there.",
  },
  gut: {
    title: "Your gut is your second brain.",
    description:
      "PoopAI tracks your scores and helps you improve over time. Use your calendar, see your streaks, and make real progress.",
  },
  problem: {
    title: "PoopAI is here to help.",
    description:
      "When something seems off, it gives you answers, trends, and tips. One scan at a time.",
  },
  skip: {
    title: "Let's get started!",
    description:
      "Jump right into scanning and discover what your poop reveals about your health.",
  },
};

export default function PersonalizationScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const { completeOnboarding } = useOnboarding();
  const { reason } = route.params as {
    reason: "laughs" | "curious" | "gut" | "problem" | "skip";
  };

  const content = contentMap[reason];

  const handleScanNow = () => {
    completeOnboarding("camera");
  };

  return (
    <View className="flex-1 bg-transparent justify-center items-center px-6">
      <BackButton size={42} />

      <Text className="text-2xl font-bold mb-6 text-center">
        {content.title}
      </Text>
      <Text className="text-base text-center text-gray-500 mb-10">
        {content.description}
      </Text>

      <HeroPrimaryButton
        title="Scan Now"
        onPress={handleScanNow}
        width={200}
        height={60}
        fontSize={18}
      />
    </View>
  );
}
