import { AnalysisData } from "./api";

export type RootStackParamList = {
  Onboarding: undefined;
  MicroQuiz: undefined;
  Personalization: {
    reason: "laughs" | "curious" | "gut" | "problem" | "skip";
  };
  Home: undefined;
  Camera: undefined;
  Profile: undefined;
  Settings: undefined;
  PoopGoals: undefined;
  Conditions: undefined;
  Symptoms: undefined;
  Calendar: undefined;
  Payment?: {
    noScreen?: keyof RootStackParamList; // Where to go if user dismisses/declines
    type?: "scan-credits" | "premium-subscription"; // Type of payment screen
    preselection?: "monthly" | "annual" | null; // Which option to preselect
    freeTrial?: boolean; // Whether to offer free trial
  };
  Results: {
    photo: string;
    analysisData?: AnalysisData; // Optional - will be passed when coming from successful analysis
  };
  NoPoopDetected: {
    photo: string; // The photo that didn't contain poop
  };
};
