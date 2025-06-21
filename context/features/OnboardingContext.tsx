import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingContextValue {
  hasCompletedOnboarding: boolean;
  navigationTarget: "home" | "camera";
  shouldShowReSignInModal: boolean;
  hasAuthenticationHistory: boolean;
  completeOnboarding: (navigateTo?: "home" | "camera") => void;
  forceSkipOnboarding: () => void;
  resetOnboarding: () => void;
  markUserAsAuthenticated: () => void;
  clearUnauthenticatedData: () => void;
  dismissReSignInModal: () => void;
  checkAndSetReSignInModal: (isAuthenticated: boolean) => void;
  resetReSignInModalDismissed: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  hasCompletedOnboarding: false,
  navigationTarget: "home",
  shouldShowReSignInModal: false,
  hasAuthenticationHistory: false,
  completeOnboarding: () => {},
  forceSkipOnboarding: () => {},
  resetOnboarding: () => {},
  markUserAsAuthenticated: () => {},
  clearUnauthenticatedData: () => {},
  dismissReSignInModal: () => {},
  checkAndSetReSignInModal: () => {},
  resetReSignInModalDismissed: () => {},
});

// Storage keys
const ONBOARDING_COMPLETE_KEY = "onboardingComplete";
const HAS_BEEN_AUTHENTICATED_KEY = "hasBeenAuthenticated";

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<"home" | "camera">(
    "home"
  );
  const [shouldShowReSignInModal, setShouldShowReSignInModal] = useState(false);
  const [hasAuthenticationHistory, setHasAuthenticationHistory] =
    useState(false);
  const [reSignInModalWasDismissed, setReSignInModalWasDismissed] =
    useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const [onboardingComplete, hasBeenAuthenticated] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
          AsyncStorage.getItem(HAS_BEEN_AUTHENTICATED_KEY),
        ]);

        const wasOnboardingCompleted = onboardingComplete === "true";
        const hasAuthHistory = hasBeenAuthenticated === "true";

        console.log("📱 Checking onboarding status:", {
          wasOnboardingCompleted,
          hasAuthHistory,
        });

        if (hasAuthHistory) {
          // User has been authenticated before on this device
          // Skip onboarding and track auth history
          setHasCompletedOnboarding(true);
          setHasAuthenticationHistory(true);
          // Don't set ReSignInModal here - wait for auth check to complete
          console.log("🔄 Returning user detected - auth history noted");
        } else if (wasOnboardingCompleted) {
          // User completed onboarding but never authenticated
          // Clear their data and make them start over (nudge to create account)
          await clearStoredData();
          setHasCompletedOnboarding(false);
          console.log("🧹 Unauthenticated returning user - clearing data");
        } else {
          // New user
          setHasCompletedOnboarding(false);
          console.log("👋 New user - showing onboarding");
        }
      } catch (error) {
        console.error("❌ Error checking onboarding status:", error);
        setHasCompletedOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const clearStoredData = async () => {
    try {
      // Clear onboarding completion but preserve authentication history
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      // Note: We don't clear HAS_BEEN_AUTHENTICATED_KEY here
      console.log("🧹 Cleared onboarding data for unauthenticated user");
    } catch (error) {
      console.error("❌ Error clearing stored data:", error);
    }
  };

  const completeOnboarding = async (navigateTo: "home" | "camera" = "home") => {
    console.log("✅ Completing onboarding, navigating to:", navigateTo);
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    setNavigationTarget(navigateTo);
    setHasCompletedOnboarding(true);
  };

  const forceSkipOnboarding = () => {
    console.log("🔐 Force skipping onboarding (user is authenticated)");
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = async () => {
    console.log("🔄 Resetting onboarding for development");
    await Promise.all([
      AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY),
      AsyncStorage.removeItem(HAS_BEEN_AUTHENTICATED_KEY),
    ]);
    setHasCompletedOnboarding(false);
    setNavigationTarget("home");
    setShouldShowReSignInModal(false);
    setHasAuthenticationHistory(false);
    setReSignInModalWasDismissed(false);
  };

  const markUserAsAuthenticated = async () => {
    console.log("🔐 Marking user as authenticated on this device");
    await AsyncStorage.setItem(HAS_BEEN_AUTHENTICATED_KEY, "true");
    setShouldShowReSignInModal(false);
  };

  const clearUnauthenticatedData = async () => {
    console.log("🧹 Clearing ALL local data for user starting over");
    try {
      // Clear all local storage data
      await AsyncStorage.multiRemove([
        ONBOARDING_COMPLETE_KEY,
        HAS_BEEN_AUTHENTICATED_KEY,
        "authToken",
        "userData",
        "poopai_quiz_answers", // Quiz answers
        "dev_scans_left", // Development scan counts
      ]);

      // Reset all onboarding state
      setHasCompletedOnboarding(false);
      setNavigationTarget("home");
      setShouldShowReSignInModal(false);
      setHasAuthenticationHistory(false);
      setReSignInModalWasDismissed(false);

      console.log("🧹 All local data cleared - user starting fresh");
    } catch (error) {
      console.error("❌ Error clearing local data:", error);
    }
  };

  const dismissReSignInModal = () => {
    setShouldShowReSignInModal(false);
    setReSignInModalWasDismissed(true);
  };

  const checkAndSetReSignInModal = useCallback(
    (isAuthenticated: boolean) => {
      // Only show ReSignInModal if:
      // 1. User has auth history
      // 2. User is not currently authenticated
      // 3. Modal was not manually dismissed by user
      if (
        hasAuthenticationHistory &&
        !isAuthenticated &&
        !reSignInModalWasDismissed
      ) {
        setShouldShowReSignInModal(true);
        console.log(
          "🔄 Setting ReSignInModal for logged out user with history"
        );
      } else {
        setShouldShowReSignInModal(false);
      }
    },
    [hasAuthenticationHistory, reSignInModalWasDismissed]
  );

  const resetReSignInModalDismissed = () => {
    setReSignInModalWasDismissed(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        navigationTarget,
        shouldShowReSignInModal,
        hasAuthenticationHistory,
        completeOnboarding,
        forceSkipOnboarding,
        resetOnboarding,
        markUserAsAuthenticated,
        clearUnauthenticatedData,
        dismissReSignInModal,
        checkAndSetReSignInModal,
        resetReSignInModalDismissed,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
