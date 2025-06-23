import React, { createContext, useState, useContext, useEffect } from "react";

interface LoadingContextValue {
  isLoading: boolean;
  progress: number;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  handleLoadingComplete: () => void;
  checkAppReadiness: () => Promise<void>;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: true,
  progress: 0,
  setLoading: () => {},
  setProgress: () => {},
  handleLoadingComplete: () => {},
  checkAppReadiness: async () => {},
});

export const LoadingProvider = ({
  children,
  fontsLoaded = true,
}: {
  children: React.ReactNode;
  fontsLoaded?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      setProgress(100);
    }
  };

  const checkAppReadiness = async (): Promise<void> => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Check 1: Wait for fonts to load if they haven't already
      if (!fontsLoaded) {
        while (!fontsLoaded) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
      setProgress(30);

      // Check 2: Brief delay for context providers to initialize
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(60);

      // Check 3: Navigation and other app components ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(90);

      // Check 4: Final readiness check
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(100);

      // Brief pause at 100% to show completion
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.warn("Loading check failed:", error);
      setProgress(100);
    }
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Start real app readiness check when fonts are loaded
    if (fontsLoaded) {
      checkAppReadiness();
    }
  }, [fontsLoaded]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progress,
        setLoading,
        setProgress,
        checkAppReadiness,
        handleLoadingComplete,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
