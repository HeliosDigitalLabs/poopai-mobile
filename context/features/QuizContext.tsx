import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QuizAnswers {
  mainGoal?: string;
  hasDigestiveIssues?: "Yes" | "No" | "Not sure";
  digestiveConditions?: string[];
  customCondition?: string;
  digestiveSymptoms?: string[];
  recentSymptoms?: string[];
  healthGoals?: string[];
  customGoal?: string;
  trackingFrequency?:
    | "Every time I poop"
    | "Once a day"
    | "A few times a week"
    | "A few times a month"
    | "I'm not sure yet";
  analysisPreference?: "Funny" | "Serious" | "Both";
}

interface QuizContextType {
  answers: QuizAnswers;
  updateAnswers: (newAnswers: Partial<QuizAnswers>) => void;
  clearAnswers: () => void;
  saveAnswers: () => Promise<void>;
  loadAnswers: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const QUIZ_STORAGE_KEY = "poopai_quiz_answers";

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<QuizAnswers>({});

  useEffect(() => {
    loadAnswers();
  }, []);

  const updateAnswers = (newAnswers: Partial<QuizAnswers>) => {
    setAnswers((prev) => {
      const updated = { ...prev, ...newAnswers };
      // Auto-save when answers are updated
      AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAnswers = () => {
    setAnswers({});
    AsyncStorage.removeItem(QUIZ_STORAGE_KEY);
  };

  const saveAnswers = async () => {
    try {
      await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.error("Failed to save quiz answers:", error);
    }
  };

  const loadAnswers = async () => {
    try {
      const stored = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
      if (stored) {
        setAnswers(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load quiz answers:", error);
    }
  };

  return (
    <QuizContext.Provider
      value={{
        answers,
        updateAnswers,
        clearAnswers,
        saveAnswers,
        loadAnswers,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
