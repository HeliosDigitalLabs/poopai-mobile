# Navigation System

## Overview

The navigation system manages app routing, screen transitions, and navigation flow control. It uses React Navigation v6 with stack navigation, handles authentication-based routing, and provides smooth transitions between screens. The system includes navigation guards, parameter passing, and deep linking support.

## Architecture

### Core Components

**App Navigator** (`navigation/AppNavigator.tsx`)

- Main navigation structure and stack configuration
- Authentication-based flow routing
- Screen transition animations and gestures

**Navigation Types** (`types/navigation.ts`)

- TypeScript definitions for route parameters
- Screen name type safety and validation
- Navigation prop types and interfaces

**Navigation Utils** (`utils/navigation.ts`)

- Helper functions for navigation operations
- Deep linking utilities and route parsing
- Navigation state management helpers

## Implementation Details

### 1. App Navigator Structure

**Location:** `navigation/AppNavigator.tsx`

**Purpose:**

- Central navigation configuration
- Route definition and parameter types
- Authentication-based flow control
- Screen transition customization

**Stack Structure:**

```tsx
export type RootStackParamList = {
  // Core screens
  Home: undefined;
  Camera: undefined;
  Results: {
    analysisResult: AnalysisResult;
    photoUri: string;
  };
  Calendar: {
    initialDate?: Date;
    highlightDate?: boolean;
  };

  // Onboarding flow
  Onboarding: undefined;
  MicroQuiz: undefined;
  ConditionsQuiz: undefined;
  SymptomsQuiz: undefined;
  GoalsQuiz: undefined;
  TrackingFrequencyQuiz: undefined;
  AnalysisPreferenceQuiz: undefined;
  PersonalizationQuiz: undefined;

  // Profile & Settings
  Profile: undefined;
  Settings: undefined;
  PoopGoals: undefined;
  Conditions: undefined;
  Symptoms: undefined;

  // Subscription
  Payment: {
    type: "scan-credits" | "premium-subscription";
    noScreen?: string;
    preselection?: "monthly" | "annual";
    freeTrial?: boolean;
  };

  // Auth
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};
```

**Navigator Implementation:**

```tsx
const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } =
    useOnboarding();
  const { isLoading: loadingLoading } = useLoading();

  // Show loading screen during initialization
  if (authLoading || onboardingLoading || loadingLoading) {
    return <LoadingScreen />;
  }

  // Determine initial route based on user state
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!isAuthenticated) {
      return hasCompletedOnboarding ? "Home" : "Onboarding";
    }

    return hasCompletedOnboarding ? "Home" : "Onboarding";
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          transitionSpec: {
            open: TransitionSpecs.TransitionIOSSpec,
            close: TransitionSpecs.TransitionIOSSpec,
          },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        {/* Core App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            gestureEnabled: false, // Disable gesture on camera
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            gestureEnabled: false, // Prevent accidental dismissal
            cardStyleInterpolator:
              CardStyleInterpolators.forModalPresentationIOS,
          }}
        />
        <Stack.Screen name="Calendar" component={CalendarScreen} />

        {/* Onboarding Flow */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="MicroQuiz" component={MicroQuizScreen} />
        <Stack.Screen name="ConditionsQuiz" component={ConditionsScreen} />
        <Stack.Screen name="SymptomsQuiz" component={SymptomsScreen} />
        <Stack.Screen name="GoalsQuiz" component={GoalsScreen} />
        <Stack.Screen
          name="TrackingFrequencyQuiz"
          component={TrackingFrequencyScreen}
        />
        <Stack.Screen
          name="AnalysisPreferenceQuiz"
          component={AnalysisPreferenceScreen}
        />
        <Stack.Screen
          name="PersonalizationQuiz"
          component={PersonalizationScreen}
        />

        {/* Profile & Settings */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="PoopGoals" component={PoopGoalsScreen} />
        <Stack.Screen name="Conditions" component={ConditionsScreen} />
        <Stack.Screen name="Symptoms" component={SymptomsScreen} />

        {/* Subscription */}
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            cardStyleInterpolator:
              CardStyleInterpolators.forModalPresentationIOS,
          }}
        />

        {/* Authentication */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            cardStyleInterpolator:
              CardStyleInterpolators.forModalPresentationIOS,
          }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{
            cardStyleInterpolator:
              CardStyleInterpolators.forModalPresentationIOS,
          }}
        />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2. Navigation Types & Type Safety

**Location:** `types/navigation.ts`

**Purpose:**

- Ensure type safety for navigation parameters
- Define route parameter interfaces
- Provide navigation prop types

**Type Definitions:**

```tsx
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";

// Screen-specific navigation prop types
export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Home"
>;
export type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Camera"
>;
export type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Results"
>;
export type PaymentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Payment"
>;

// Screen-specific route prop types
export type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;
export type ResultsScreenRouteProp = RouteProp<RootStackParamList, "Results">;
export type PaymentScreenRouteProp = RouteProp<RootStackParamList, "Payment">;

// Generic navigation props for components
export interface NavigationProps<ScreenName extends keyof RootStackParamList> {
  navigation: StackNavigationProp<RootStackParamList, ScreenName>;
  route: RouteProp<RootStackParamList, ScreenName>;
}

// Helper type for screens with optional navigation
export interface OptionalNavigationProps<
  ScreenName extends keyof RootStackParamList,
> {
  navigation?: StackNavigationProp<RootStackParamList, ScreenName>;
  route?: RouteProp<RootStackParamList, ScreenName>;
}
```

### 3. Navigation Flow Control

#### Authentication-Based Routing

```tsx
// Navigation guards based on auth state
const useNavigationGuard = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const navigateWithAuthCheck = useCallback(
    (
      screenName: keyof RootStackParamList,
      params?: any,
      requireAuth: boolean = false
    ) => {
      if (requireAuth && !isAuthenticated) {
        // Show auth modal or redirect to login
        navigation.navigate("Login");
        return false;
      }

      navigation.navigate(screenName as never, params as never);
      return true;
    },
    [isAuthenticated, navigation]
  );

  return { navigateWithAuthCheck };
};
```

#### Onboarding Flow Navigation

```tsx
// Sequential onboarding navigation
const useOnboardingNavigation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { answers, currentStep, totalSteps } = useQuiz();

  const getNextScreen = (currentScreen: string): keyof RootStackParamList => {
    const flowMap: { [key: string]: keyof RootStackParamList } = {
      Onboarding: "MicroQuiz",
      MicroQuiz: "ConditionsQuiz",
      ConditionsQuiz: "SymptomsQuiz",
      SymptomsQuiz: "GoalsQuiz",
      GoalsQuiz: "TrackingFrequencyQuiz",
      TrackingFrequencyQuiz: "AnalysisPreferenceQuiz",
      AnalysisPreferenceQuiz: "PersonalizationQuiz",
      PersonalizationQuiz: "Home",
    };

    return flowMap[currentScreen] || "Home";
  };

  const navigateNext = (currentScreen: string) => {
    const nextScreen = getNextScreen(currentScreen);

    if (nextScreen === "Home") {
      // Complete onboarding and reset navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } else {
      navigation.navigate(nextScreen);
    }
  };

  const navigatePrevious = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return {
    navigateNext,
    navigatePrevious,
    currentStep,
    totalSteps,
  };
};
```

### 4. Screen Transitions & Animations

#### Custom Transition Configurations

```tsx
// Custom transition specs
export const CustomTransitions = {
  // Slide up from bottom (for modals)
  slideUp: {
    gestureDirection: "vertical" as const,
    transitionSpec: {
      open: {
        animation: "timing",
        config: {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        },
      },
      close: {
        animation: "timing",
        config: {
          duration: 250,
          easing: Easing.in(Easing.cubic),
        },
      },
    },
    cardStyleInterpolator: ({ current, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        },
      };
    },
  },

  // Fade transition
  fade: {
    transitionSpec: {
      open: TransitionSpecs.FadeInFromBottomAndroidSpec,
      close: TransitionSpecs.FadeOutToBottomAndroidSpec,
    },
    cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
  },

  // No animation (instant)
  instant: {
    transitionSpec: {
      open: { animation: "timing", config: { duration: 0 } },
      close: { animation: "timing", config: { duration: 0 } },
    },
    cardStyleInterpolator: () => ({}),
  },
};
```

#### Screen-Specific Transitions

```tsx
// Apply custom transitions to specific screens
const getScreenOptions = (screenName: keyof RootStackParamList) => {
  const baseOptions = {
    headerShown: false,
    gestureEnabled: true,
  };

  switch (screenName) {
    case "Payment":
    case "Login":
    case "Signup":
      return {
        ...baseOptions,
        ...CustomTransitions.slideUp,
      };

    case "Camera":
      return {
        ...baseOptions,
        gestureEnabled: false,
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
      };

    case "Results":
      return {
        ...baseOptions,
        gestureEnabled: false,
        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
      };

    default:
      return {
        ...baseOptions,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      };
  }
};
```

### 5. Navigation Utilities

#### Navigation Helpers

```tsx
// Utility functions for common navigation patterns
export const NavigationUtils = {
  // Reset navigation stack to specific screen
  resetToScreen: (
    navigation: NavigationProp<RootStackParamList>,
    screenName: keyof RootStackParamList,
    params?: any
  ) => {
    navigation.reset({
      index: 0,
      routes: [{ name: screenName, params }],
    });
  },

  // Go back with fallback
  goBackWithFallback: (
    navigation: NavigationProp<RootStackParamList>,
    fallbackScreen: keyof RootStackParamList
  ) => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(fallbackScreen);
    }
  },

  // Navigate with replace (no back button)
  replaceScreen: (
    navigation: NavigationProp<RootStackParamList>,
    screenName: keyof RootStackParamList,
    params?: any
  ) => {
    navigation.replace(screenName, params);
  },

  // Deep link navigation
  navigateFromDeepLink: (
    navigation: NavigationProp<RootStackParamList>,
    url: string
  ) => {
    const route = parseDeepLink(url);
    if (route) {
      navigation.navigate(route.screen, route.params);
    }
  },
};
```

#### Deep Linking Support

```tsx
// Deep link configuration
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["poopai://", "https://poopai.app"],
  config: {
    screens: {
      Home: "",
      Camera: "camera",
      Results: "results/:analysisId",
      Calendar: "calendar",
      Profile: "profile",
      Settings: "settings",
      Payment: {
        path: "upgrade/:type?",
        parse: {
          type: (type: string) =>
            type as "scan-credits" | "premium-subscription",
        },
      },
      Login: "login",
      Signup: "signup",
    },
  },
};

// Parse deep link URLs
const parseDeepLink = (
  url: string
): { screen: keyof RootStackParamList; params?: any } | null => {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;

    if (path.startsWith("/camera")) {
      return { screen: "Camera" };
    }

    if (path.startsWith("/results/")) {
      const analysisId = path.split("/")[2];
      return { screen: "Results", params: { analysisId } };
    }

    if (path.startsWith("/upgrade")) {
      const type = parsedUrl.searchParams.get("type") || "scan-credits";
      return { screen: "Payment", params: { type } };
    }

    return null;
  } catch (error) {
    console.error("Failed to parse deep link:", error);
    return null;
  }
};
```

### 6. Navigation Context & State Management

#### Navigation State Hook

```tsx
// Custom hook for navigation state management
export const useNavigationState = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      const state = e.data.state;
      if (state) {
        const currentRoute = state.routes[state.index];
        setNavigationHistory((prev) => [...prev, currentRoute.name].slice(-10)); // Keep last 10
      }
    });

    return unsubscribe;
  }, [navigation]);

  const canGoBack = navigation.canGoBack();
  const currentScreen = route.name;
  const previousScreen = navigationHistory[navigationHistory.length - 2];

  return {
    currentScreen,
    previousScreen,
    navigationHistory,
    canGoBack,
  };
};
```

#### Navigation Analytics

```tsx
// Track navigation events for analytics
export const useNavigationAnalytics = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("state", (e) => {
      const state = e.data.state;
      if (state) {
        const currentRoute = state.routes[state.index];

        // Track screen view
        analytics.track("Screen View", {
          screen: currentRoute.name,
          params: currentRoute.params,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return unsubscribe;
  }, [navigation]);
};
```

## Integration Points

### With Authentication System

- Route to login/signup when authentication required
- Redirect to appropriate screen after login
- Clear navigation stack on logout

### With Onboarding System

- Sequential navigation through quiz screens
- Progress tracking and back navigation
- Completion navigation to main app

### With Subscription System

- Navigate to payment screens with proper parameters
- Return to previous screen after purchase
- Handle subscription status changes

## Customization

### Adding New Navigation Flows

**Custom Flow Example:**

```tsx
// Health assessment flow
const HealthAssessmentNavigator = () => {
  const Stack = createStackNavigator<HealthAssessmentParamList>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen name="HealthIntro" component={HealthIntroScreen} />
      <Stack.Screen
        name="SymptomAssessment"
        component={SymptomAssessmentScreen}
      />
      <Stack.Screen
        name="HealthRecommendations"
        component={HealthRecommendationsScreen}
      />
    </Stack.Navigator>
  );
};
```

### Custom Gestures and Interactions

**Custom Gesture Handler:**

```tsx
// Custom swipe gestures for navigation
const useCustomGestures = () => {
  const navigation = useNavigation();

  const handleSwipeRight = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleSwipeUp = useCallback(() => {
    // Custom action for swipe up
    navigation.navigate("Camera");
  }, [navigation]);

  return {
    handleSwipeRight,
    handleSwipeUp,
  };
};
```

## Testing

### Navigation Testing

```tsx
// Test navigation flows
describe("Navigation", () => {
  test("navigates through onboarding flow", async () => {
    const { getByText } = render(<AppNavigator />);

    // Test onboarding navigation
    fireEvent.press(getByText("Get Started"));
    expect(getByText("Quiz Question 1")).toBeVisible();

    fireEvent.press(getByText("Next"));
    expect(getByText("Quiz Question 2")).toBeVisible();
  });

  test("handles authentication navigation", async () => {
    const { getByText } = render(<AppNavigator />);

    // Test auth navigation
    fireEvent.press(getByText("Sign In"));
    expect(getByText("Login Form")).toBeVisible();
  });
});
```

### Deep Link Testing

```tsx
// Test deep link navigation
test("handles deep links correctly", async () => {
  const url = "poopai://upgrade/scan-credits";

  await Linking.openURL(url);

  expect(mockNavigation.navigate).toHaveBeenCalledWith("Payment", {
    type: "scan-credits",
  });
});
```

## Troubleshooting

### Common Issues

**Navigation not working:**

- Check navigation prop types and screen registration
- Verify parameter types match RootStackParamList
- Ensure proper navigation provider setup
- Test navigation state updates

**Screen transitions stuttering:**

- Check for heavy components in screen renders
- Optimize useNativeDriver usage in animations
- Reduce bundle size for better performance
- Test on different device types

**Deep links not working:**

- Verify linking configuration in app.json
- Check URL scheme registration
- Test deep link parsing logic
- Monitor for parameter validation errors

**Back navigation issues:**

- Check navigation.canGoBack() before calling goBack()
- Verify navigation stack state
- Test with different navigation flows
- Handle edge cases with reset navigation

### Performance Optimization

- Use React.memo for screen components
- Optimize screen mounting and unmounting
- Lazy load heavy screens
- Monitor navigation state complexity

### Accessibility

- Ensure proper screen reader navigation
- Add accessibility labels to navigation elements
- Support keyboard navigation
- Test with assistive technologies
