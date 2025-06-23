import { useEffect, useState } from "react";
import { useAuth } from "../context/auth/AuthContext";
import { useOnboarding } from "../context/features/OnboardingContext";

/**
 * Hook that coordinates authentication and onboarding state
 *
 * This handles the complex logic of when to show onboarding vs when to skip it
 * based on authentication state and authentication history.
 */
export const useAuthOnboardingCoordinator = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    setShowAuthOverlay,
  } = useAuth();
  const {
    markUserAsAuthenticated,
    shouldShowReSignInModal,
    dismissReSignInModal,
    clearUnauthenticatedData,
    checkAndSetReSignInModal,
    resetReSignInModalDismissed,
  } = useOnboarding();

  const [authModalMode, setAuthModalMode] = useState<
    "method-selection" | "login"
  >("method-selection");

  // When user becomes authenticated, mark them as having been authenticated on this device
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      markUserAsAuthenticated();
    }
  }, [authLoading, isAuthenticated, markUserAsAuthenticated]);

  // When auth check completes, determine if ReSignInModal should be shown
  useEffect(() => {
    if (!authLoading) {
      checkAndSetReSignInModal(isAuthenticated);
    }
  }, [authLoading, isAuthenticated]); // Removed checkAndSetReSignInModal from dependencies

  // Handle the case where user is not authenticated but should show re-sign-in modal
  // This is for users who were previously authenticated but got logged out
  const handleReSignInModalClose = () => {
    dismissReSignInModal();
  };

  // Handle when user wants to sign back in
  const handleSignBackIn = () => {
    dismissReSignInModal();
    resetReSignInModalDismissed(); // Reset the dismissed flag since user is explicitly trying to sign in
    setAuthModalMode("login"); // Open directly to login screen
    setTimeout(() => {
      setShowAuthOverlay(true);
    }, 150);
  };

  // Handle the case where user wants to clear data and start fresh
  const handleClearDataAndStartOver = async () => {
    await clearUnauthenticatedData();
    dismissReSignInModal();
  };

  // Reset auth modal mode when it closes
  const handleAuthModalClose = () => {
    setShowAuthOverlay(false);
    setAuthModalMode("method-selection"); // Reset to default
  };

  return {
    shouldShowReSignInModal,
    authModalMode,
    handleReSignInModalClose,
    handleSignBackIn,
    handleClearDataAndStartOver,
    handleAuthModalClose,
  };
};
