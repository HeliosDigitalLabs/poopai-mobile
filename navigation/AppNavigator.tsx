import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import HomeScreen from "../screens/core/HomeScreen";
import CameraScreen from "../screens/camera/CameraScreen";
import ResultsScreen from "../screens/analysis/ResultsScreen";
import NoPoopDetectedScreen from "../screens/analysis/NoPoopDetectedScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import PoopGoalsScreen from "../screens/profile/PoopGoalsScreen";
import ConditionsScreen from "../screens/profile/ConditionsScreen";
import SymptomsScreen from "../screens/profile/SymptomsScreen";
import CalendarScreen from "../screens/calendar/CalendarScreen";
import PaymentScreen from "../screens/subscription/PaymentScreen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import PreQuizScreen from "../screens/onboarding/PreQuizScreen";
import MicroQuizScreen from "../screens/onboarding/MicroQuizScreen";
import PersonalizationScreen from "../screens/onboarding/PersonalizationScreen";
import { useOnboarding } from "../context/features/OnboardingContext";
import { useAuth } from "../context/auth/AuthContext";
import { Easing } from "react-native";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { hasCompletedOnboarding, navigationTarget, forceSkipOnboarding } =
    useOnboarding();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // Skip onboarding for authenticated users
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && !hasCompletedOnboarding) {
      console.log("🔐 Authenticated user detected - skipping onboarding");
      forceSkipOnboarding();
    }
  }, [
    authLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    forceSkipOnboarding,
  ]);

  // Show loading while checking auth status
  if (authLoading) {
    return null; // The main loading screen is handled by LoadingContext
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "transparent" },
          cardOverlayEnabled: false,
          gestureEnabled: false,
          gestureDirection: "horizontal",
          cardStyleInterpolator: ({ current, next }) => {
            // Sequential fade: outgoing fades out, then incoming fades in
            const opacity = next
              ? next.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0, 0],
                })
              : current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0, 1],
                });
            return {
              cardStyle: { opacity },
            };
          },
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 320, easing: Easing.linear },
            },
            close: {
              animation: "timing",
              config: { duration: 220, easing: Easing.linear },
            },
          },
        }}
      >
        {!hasCompletedOnboarding ? (
          // Show onboarding first (authentication happens later)
          <>
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ gestureEnabled: false }} // Disable gestures during onboarding
            />
            <Stack.Screen
              name="PreQuiz"
              component={PreQuizScreen}
              options={{ gestureEnabled: true }} // Allow swipe back to onboarding
            />
            <Stack.Screen
              name="MicroQuiz"
              component={MicroQuizScreen}
              options={{ gestureEnabled: true }} // Allow swipe back in quiz
            />
            <Stack.Screen
              name="Personalization"
              component={PersonalizationScreen}
              options={{ gestureEnabled: true }} // Allow swipe back in personalization
            />
          </>
        ) : navigationTarget === "camera" ? (
          // Show camera first if user completed onboarding via "Scan Now"
          <>
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ gestureEnabled: false }} // Disable swipe back from camera
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ gestureEnabled: false }} // Disable gestures on home to prevent auth bypass
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ gestureEnabled: false }} // Disable gestures to prevent auth bypass
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from settings
            />
            <Stack.Screen
              name="PoopGoals"
              component={PoopGoalsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from goals
            />
            <Stack.Screen
              name="Conditions"
              component={ConditionsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from conditions
            />
            <Stack.Screen
              name="Symptoms"
              component={SymptomsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from symptoms
            />
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from calendar
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ gestureEnabled: false }} // Disable gestures on payment for security
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ gestureEnabled: false }} // Disable swipe back from results
            />
            <Stack.Screen
              name="NoPoopDetected"
              component={NoPoopDetectedScreen}
              options={{ gestureEnabled: false }} // Disable swipe back from no poop detected screen
            />
          </>
        ) : (
          // Show home first if user skipped onboarding
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ gestureEnabled: false }} // Disable gestures on home to prevent auth bypass
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ gestureEnabled: false }} // Disable swipe back from camera
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ gestureEnabled: false }} // Disable gestures to prevent auth bypass
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from settings
            />
            <Stack.Screen
              name="PoopGoals"
              component={PoopGoalsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from goals
            />
            <Stack.Screen
              name="Conditions"
              component={ConditionsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from conditions
            />
            <Stack.Screen
              name="Symptoms"
              component={SymptomsScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from symptoms
            />
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{ gestureEnabled: true }} // Allow swipe back from calendar
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ gestureEnabled: false }} // Disable gestures on payment for security
            />
            <Stack.Screen
              name="Results"
              component={ResultsScreen}
              options={{ gestureEnabled: false }} // Disable swipe back from results
            />
            <Stack.Screen
              name="NoPoopDetected"
              component={NoPoopDetectedScreen}
              options={{ gestureEnabled: false }} // Disable swipe back from no poop detected screen
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
