# State Management

## Overview

PoopAI uses a context-based state management architecture with multiple specialized contexts handling different aspects of the application. This approach provides clean separation of concerns, predictable data flow, and efficient re-rendering patterns while maintaining type safety throughout the application.

## Architecture

### Context Hierarchy

The app uses a hierarchical context structure where contexts are layered based on their dependencies and scope:

```tsx
<AuthProvider>
  {" "}
  // User authentication and profile
  <OnboardingProvider>
    {" "}
    // Onboarding flow state
    <ScanProvider>
      {" "}
      // Scan credits and usage tracking
      <LoadingProvider>
        {" "}
        // Global loading states
        <DimensionsProvider>
          {" "}
          // Responsive design dimensions
          <App /> // Main application
        </DimensionsProvider>
      </LoadingProvider>
    </ScanProvider>
  </OnboardingProvider>
</AuthProvider>
```

### Core Contexts

## 1. Authentication Context

**Location:** `context/auth/AuthContext.tsx`

**Purpose:**

- Manage user authentication state
- Handle user profile data
- Control session persistence
- Manage anonymous vs authenticated modes

**State Structure:**

```tsx
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  deviceId: string;
  isLoading: boolean;
  token: string | null;
}
```

**Key Methods:**

- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `register(userData)` - Create new account
- `updateProfile(data)` - Update user information
- `validateSession()` - Check token validity

**Usage Example:**

```tsx
const { isAuthenticated, user, login, logout } = useAuth();

// Check if user is logged in
if (isAuthenticated && user) {
  // Show authenticated content
}

// Login user
await login(email, password);
```

## 2. Scan Context

**Location:** `context/features/ScanContext.tsx`

**Purpose:**

- Track scan credits and usage
- Manage premium vs free user limits
- Handle scan credit awards and deductions
- Provide scan-related UI state

**State Structure:**

```tsx
interface ScanState {
  scansLeft: number;
  isPremium: boolean;
  totalScans: number;
  isLoading: boolean;
  lastScanDate: Date | null;
}
```

**Key Methods:**

- `consumeScan()` - Use a scan credit
- `awardFreeScan()` - Add free scan (via ads/sharing)
- `refreshScanData()` - Sync with backend
- `checkPremiumStatus()` - Validate premium access

**Usage Example:**

```tsx
const { scansLeft, isPremium, consumeScan } = useScan();

// Check if user can scan
if (scansLeft > 0 || isPremium) {
  await consumeScan();
  // Proceed with scan
}
```

## 3. Onboarding Context

**Location:** `context/features/OnboardingContext.tsx`

**Purpose:**

- Track onboarding completion status
- Manage navigation targets after onboarding
- Handle first-time user experience flow

**State Structure:**

```tsx
interface OnboardingState {
  hasCompletedOnboarding: boolean;
  targetScreen: "home" | "camera";
  isLoading: boolean;
}
```

**Key Methods:**

- `completeOnboarding(targetScreen)` - Mark onboarding complete
- `resetOnboarding()` - Reset for new users
- `setTargetScreen(screen)` - Set post-onboarding destination

**Usage Example:**

```tsx
const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();

// Check if user needs onboarding
if (!hasCompletedOnboarding) {
  // Show onboarding flow
} else {
  // Go to main app
}
```

## 4. Quiz Context

**Location:** `context/features/QuizContext.tsx`

**Purpose:**

- Store user quiz responses during onboarding
- Provide quiz navigation state
- Handle quiz data persistence

**State Structure:**

```tsx
interface QuizState {
  answers: QuizAnswers;
  currentStep: number;
  isComplete: boolean;
  isLoading: boolean;
}
```

**Key Methods:**

- `updateAnswer(key, value)` - Store quiz response
- `nextStep()` - Progress to next question
- `previousStep()` - Go back to previous question
- `submitQuiz()` - Submit complete quiz data

**Usage Example:**

```tsx
const { answers, updateAnswer, nextStep } = useQuiz();

// Store user's answer
updateAnswer("healthGoals", selectedGoals);

// Continue to next step
nextStep();
```

## 5. Core Contexts

### Dimensions Context

**Location:** `context/core/DimensionsContext.tsx`

**Purpose:**

- Provide responsive design dimensions
- Handle orientation changes
- Enable consistent sizing across components

**State Structure:**

```tsx
interface DimensionsState {
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
}
```

**Usage Example:**

```tsx
const { screenWidth, screenHeight } = useDimensions();

// Responsive sizing
const buttonHeight = screenHeight * 0.06;
const fontSize = screenHeight * 0.02;
```

### Loading Context

**Location:** `context/core/LoadingContext.tsx`

**Purpose:**

- Manage global loading states
- Handle app initialization
- Coordinate loading screens

**State Structure:**

```tsx
interface LoadingState {
  isLoading: boolean;
  loadingProgress: number;
  loadingMessage: string;
}
```

### Error Context

**Location:** `context/core/ErrorContext.tsx`

**Purpose:**

- Global error handling
- Error message display
- Error recovery coordination

**State Structure:**

```tsx
interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorType: "network" | "auth" | "general";
}
```

## Data Flow Patterns

### 1. Top-Down Data Flow

Data flows from parent contexts to child components through hooks:

```tsx
// Context provides data
const AuthContext = createContext<AuthContextType>();

// Hook consumes data
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Component uses data
const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  return <Text>{user?.name}</Text>;
};
```

### 2. Event-Driven Updates

Actions trigger state updates that propagate to all consumers:

```tsx
// User action triggers state change
const handleLogin = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.token);
    setIsAuthenticated(true);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Context Coordination

Related contexts coordinate through service layer or event system:

```tsx
// AuthContext update triggers ScanContext refresh
useEffect(() => {
  if (isAuthenticated && user) {
    // Refresh scan data when user logs in
    scanContext.refreshScanData();
  }
}, [isAuthenticated, user]);
```

## Performance Optimization

### 1. Context Splitting

Contexts are split by concern to minimize unnecessary re-renders:

```tsx
// Instead of one large context
interface AppState {
  user: User;
  scans: ScanData;
  onboarding: OnboardingData;
  // ... more data
}

// Use separate contexts
const AuthContext = createContext<AuthState>();
const ScanContext = createContext<ScanState>();
const OnboardingContext = createContext<OnboardingState>();
```

### 2. Memoization

Context values are memoized to prevent unnecessary re-renders:

```tsx
const contextValue = useMemo(
  () => ({
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
  }),
  [user, isAuthenticated, isLoading]
);

return (
  <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
);
```

### 3. Selective Subscriptions

Components only subscribe to needed context values:

```tsx
// Instead of using entire context
const { user, scans, onboarding, dimensions } = useAppState();

// Use specific contexts
const { user } = useAuth();
const { scansLeft } = useScan();
const { screenHeight } = useDimensions();
```

## State Persistence

### 1. Authentication State

User authentication state persists across app restarts:

```tsx
// Save to AsyncStorage
await AsyncStorage.setItem("auth_token", token);
await AsyncStorage.setItem("user_data", JSON.stringify(user));

// Load on app start
const savedToken = await AsyncStorage.getItem("auth_token");
const savedUser = JSON.parse((await AsyncStorage.getItem("user_data")) || "{}");
```

### 2. Onboarding State

Onboarding completion status is persisted:

```tsx
await AsyncStorage.setItem("onboarding_complete", "true");
```

### 3. Quiz Data

Quiz responses are temporarily stored and cleared after submission:

```tsx
// Store during quiz
await AsyncStorage.setItem("quiz_answers", JSON.stringify(answers));

// Clear after submission
await AsyncStorage.removeItem("quiz_answers");
```

## Type Safety

### Context Type Definitions

All contexts use TypeScript for type safety:

```tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
```

### Hook Type Safety

Custom hooks enforce proper context usage:

```tsx
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

## Testing Strategy

### Context Testing

Each context is tested in isolation:

```tsx
// Mock context provider for testing
const renderWithAuth = (
  component: ReactElement,
  authState: Partial<AuthState>
) => {
  return render(
    <AuthProvider initialState={authState}>{component}</AuthProvider>
  );
};

// Test context behavior
test("login updates authentication state", async () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: AuthProvider,
  });

  await act(async () => {
    await result.current.login("test@example.com", "password");
  });

  expect(result.current.isAuthenticated).toBe(true);
});
```

### Integration Testing

Test context interactions:

```tsx
test("login triggers scan data refresh", async () => {
  const mockRefreshScans = jest.fn();

  // Mock scan context
  jest.spyOn(ScanContext, "useScan").mockReturnValue({
    refreshScanData: mockRefreshScans,
    // ... other methods
  });

  // Test login
  await login("test@example.com", "password");

  expect(mockRefreshScans).toHaveBeenCalled();
});
```

## Customization

### Adding New Contexts

1. **Create Context File:**

```tsx
// context/features/NewFeatureContext.tsx
interface NewFeatureState {
  data: any;
  isLoading: boolean;
}

const NewFeatureContext = createContext<NewFeatureContextType | null>(null);

export const NewFeatureProvider = ({ children }: { children: ReactNode }) => {
  // State and methods implementation
  return (
    <NewFeatureContext.Provider value={contextValue}>
      {children}
    </NewFeatureContext.Provider>
  );
};

export const useNewFeature = () => {
  const context = useContext(NewFeatureContext);
  if (!context) {
    throw new Error("useNewFeature must be used within NewFeatureProvider");
  }
  return context;
};
```

2. **Add to Provider Hierarchy:**

```tsx
// App.tsx
<AuthProvider>
  <NewFeatureProvider>{/* Other providers */}</NewFeatureProvider>
</AuthProvider>
```

### Modifying Existing Contexts

1. **Update State Interface:**

```tsx
interface AuthState {
  // Existing fields
  isAuthenticated: boolean;
  user: User | null;

  // New field
  preferences: UserPreferences;
}
```

2. **Add New Methods:**

```tsx
const updatePreferences = useCallback(async (prefs: UserPreferences) => {
  setPreferences(prefs);
  await AsyncStorage.setItem("user_preferences", JSON.stringify(prefs));
}, []);
```

3. **Update Context Value:**

```tsx
const contextValue = useMemo(
  () => ({
    // Existing values
    isAuthenticated,
    user,
    login,
    logout,

    // New values
    preferences,
    updatePreferences,
  }),
  [isAuthenticated, user, preferences]
);
```

## Troubleshooting

### Common Issues

**Context not updating:**

- Check if component is wrapped in proper provider
- Verify context value memoization dependencies
- Ensure state updates are immutable

**Performance issues:**

- Check for unnecessary re-renders with React DevTools
- Verify context value memoization
- Consider splitting large contexts

**Type errors:**

- Ensure all context interfaces are up to date
- Check hook usage matches context type
- Verify proper null checks in components

**State not persisting:**

- Check AsyncStorage operations
- Verify context initialization loads saved state
- Ensure proper error handling in persistence logic

### Best Practices

1. **Keep contexts focused** - Each context should handle one concern
2. **Memoize context values** - Prevent unnecessary re-renders
3. **Use TypeScript** - Ensure type safety across the app
4. **Test context behavior** - Unit test context logic
5. **Handle loading states** - Provide proper loading indicators
6. **Error boundaries** - Wrap contexts in error boundaries for robustness
