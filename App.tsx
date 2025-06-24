import React, { useEffect, useRef } from "react";
import { View, StyleSheet, AppState, AppStateStatus } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  PaperProvider,
  configureFonts,
  MD3LightTheme,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { OnboardingProvider } from "./context/features/OnboardingContext";
import { QuizProvider } from "./context/features/QuizContext";
import { LoadingProvider, useLoading } from "./context/core/LoadingContext";
import { AuthProvider, useAuth } from "./context/auth/AuthContext";
import { ScanProvider } from "./context/features/ScanContext";
import { SubscriptionProvider } from "./context/features/SubscriptionContext";
import { DimensionsProvider } from "./context/core/DimensionsContext";
import AuthOverlay from "./components/auth/AuthOverlay";
import LoadingScreen from "./components/core/LoadingScreen";
import { initAnalytics, logEvent } from "./lib/analytics";
import { APP_OPENED, APP_CLOSED } from "./lib/analyticsEvents";
<<<<<<< HEAD
import { BlurProvider } from "./context/features/BlurContext";
=======
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304

// Import the global CSS for NativeWind
import "./global.css";

const theme = {
  ...MD3LightTheme,
};

function AuthOverlayRenderer() {
  const { showAuthOverlay, setShowAuthOverlay } = useAuth();

  return (
    <AuthOverlay
      visible={showAuthOverlay}
      onClose={() => setShowAuthOverlay(false)}
    />
  );
}

function AppContent() {
  const { isLoading, progress, handleLoadingComplete } = useLoading();

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ScanProvider>
<<<<<<< HEAD
          <BlurProvider>
            <OnboardingProvider>
              <QuizProvider>
                <PaperProvider theme={theme}>
                  <StatusBar style="dark" />
                  {/* Global background that stays consistent during transitions */}
                  <LinearGradient
                    colors={["#ffffff", "#f1f5f9", "#cbd5e1"]}
                    style={{ flex: 1 }}
                  >
                    <ImageBackground
                      source={require("./assets/toilet-paper.png")}
                      style={{ flex: 1 }}
                      resizeMode="cover"
                      imageStyle={{
                        opacity: 0.25,
                        transform: [{ scale: 1 }],
                      }}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(123, 170, 247, 0.1)",
                          "rgba(37, 99, 235, 0.15)",
                          "rgba(97, 131, 224, 0.1)",
                        ]}
                        style={{ flex: 1 }}
                      >
                        <AppNavigator />
                        {/* Loading screen as an overlay instead of replacement */}
                        {isLoading && (
                          <LoadingScreen
                            progress={progress}
                            onLoadingComplete={handleLoadingComplete}
                          />
                        )}
                      </LinearGradient>
                    </ImageBackground>
                  </LinearGradient>
                </PaperProvider>
                <AuthOverlayRenderer />
              </QuizProvider>
            </OnboardingProvider>
          </BlurProvider>
=======
          <OnboardingProvider>
            <QuizProvider>
              <PaperProvider theme={theme}>
                <StatusBar style="dark" />
                {/* Global background that stays consistent during transitions */}
                <LinearGradient
                  colors={["#ffffff", "#f1f5f9", "#cbd5e1"]}
                  style={{ flex: 1 }}
                >
                  <ImageBackground
                    source={require("./assets/toilet-paper.png")}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                    imageStyle={{
                      opacity: 0.25,
                      transform: [{ scale: 1 }],
                    }}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(123, 170, 247, 0.1)",
                        "rgba(37, 99, 235, 0.15)",
                        "rgba(97, 131, 224, 0.1)",
                      ]}
                      style={{ flex: 1 }}
                    >
                      <AppNavigator />
                      {/* Loading screen as an overlay instead of replacement */}
                      {isLoading && (
                        <LoadingScreen
                          progress={progress}
                          onLoadingComplete={handleLoadingComplete}
                        />
                      )}
                    </LinearGradient>
                  </ImageBackground>
                </LinearGradient>
              </PaperProvider>
              <AuthOverlayRenderer />
            </QuizProvider>
          </OnboardingProvider>
>>>>>>> 5a9bbd588055ef2a2b282113038f674c9f6c7304
        </ScanProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "Super Adorable": require("./assets/fonts/Super Adorable.ttf"),
  });

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const sessionStartTime = useRef<number>(Date.now());

  // Initialize Amplitude analytics
  useEffect(() => {
    initAnalytics();
    logEvent(APP_OPENED);
    sessionStartTime.current = Date.now();
  }, []);

  // Track app state changes for APP_CLOSED event
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/active|foreground/) &&
        nextAppState === "background"
      ) {
        // App is going to background - log session duration
        const sessionDuration = (Date.now() - sessionStartTime.current) / 1000;
        logEvent(APP_CLOSED, {
          sessionDuration: parseFloat(sessionDuration.toFixed(1)),
        });
      } else if (nextAppState === "active") {
        // App is coming back to foreground - restart session timer
        sessionStartTime.current = Date.now();
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);

  return (
    <DimensionsProvider>
      <LoadingProvider fontsLoaded={fontsLoaded}>
        <AppContent />
      </LoadingProvider>
    </DimensionsProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
