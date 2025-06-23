# Onboarding Flow

## Overview

The onboarding system provides a comprehensive first-time user experience through an interactive dialogue system with PoopBot, followed by a detailed health questionnaire. The flow is designed to collect user health data, set expectations, and create an engaging introduction to the app's capabilities.

## Architecture

### Core Components

**Onboarding Context** (`context/features/OnboardingContext.tsx`)

- Tracks completion status and navigation targets
- Manages onboarding flow state
- Integrates with authentication system

**Interactive Components** (`components/core/OnboardingScreen.tsx`)

- Reusable animated dialogue component
- PoopBot character with animations
- Typewriter text effects and interactions

**Quiz System** (`screens/onboarding/` + `components/quiz/`)

- Comprehensive health questionnaire
- Multi-screen flow with progress tracking
- Data collection and validation

## Implementation Details

### 1. Onboarding Context

**Location:** `context/features/OnboardingContext.tsx`

**Purpose:**

- Track onboarding completion across app sessions
- Manage post-onboarding navigation targets
- Coordinate with authentication for returning users

**State Structure:**

```tsx
interface OnboardingState {
  hasCompletedOnboarding: boolean;
  targetScreen: "home" | "camera";
  isLoading: boolean;
}
```

**Key Methods:**

```tsx
// Complete onboarding and set destination
completeOnboarding(targetScreen: 'home' | 'camera'): Promise<void>

// Reset for new users
resetOnboarding(): Promise<void>

// Set navigation target
setTargetScreen(screen: 'home' | 'camera'): void
```

**Persistence:**

- Stores completion status in AsyncStorage
- Automatically loads on app initialization
- Clears when user logs out (for new users)

### 2. Interactive Onboarding Component

**Location:** `components/core/OnboardingScreen.tsx`

**Purpose:**

- Reusable dialogue component with PoopBot character
- Animated text display with typewriter effects
- Interactive buttons and navigation

**Key Features:**

- **Typewriter Animation:** Configurable typing speed and delays
- **PoopBot Animations:** Floating, scaling, and sparkle effects
- **Responsive Design:** Adapts to different screen sizes
- **Skip Functionality:** Tap-to-skip text animation
- **Button States:** Primary and secondary action buttons

**Props Interface:**

```tsx
interface OnboardingScreenProps {
  messages: string[]; // Array of dialogue messages
  primaryButtonText?: string; // Main action button text
  secondaryButtonText?: string; // Secondary action button text
  onPrimaryPress?: () => void; // Primary button handler
  onSecondaryPress?: () => void; // Secondary button handler
  typingSpeed?: number; // Typing animation speed (ms)
  messageDelay?: number; // Delay between messages (ms)
  showButtons?: boolean; // Show/hide action buttons
}
```

**Animation Details:**

```tsx
// PoopBot floating animation
const poopbotFloat = useRef(new Animated.Value(-6)).current;
Animated.loop(
  Animated.sequence([
    Animated.timing(poopbotFloat, { toValue: 6, duration: 2500 }),
    Animated.timing(poopbotFloat, { toValue: -6, duration: 2500 }),
  ])
).start();

// Sparkle effects around character
const generateSparkles = () => {
  // Creates 6 sparkles with random positions and animations
  // Continuous opacity and position animations
  // Positioned around PoopBot in a circle pattern
};
```

### 3. Main Onboarding Flow

**Screen:** `screens/onboarding/OnboardingScreen.tsx`

**Purpose:**

- Initial app introduction
- PoopBot character introduction
- Transition to quiz system

**Flow:**

1. **Welcome Message:** Introduction to PoopAI
2. **Character Introduction:** Meet PoopBot
3. **App Purpose:** Explain scanning functionality
4. **Quiz Transition:** Lead into health questionnaire

**Implementation:**

```tsx
const messages = [
  "Hi there! 👋 Welcome to PoopAI!",
  "I'm PoopBot, your friendly poop analysis assistant! 🤖",
  "I'm here to help you understand your digestive health through advanced AI analysis.",
  "Ready to get started? Let's learn a bit about you first!",
];

<OnboardingScreen
  messages={messages}
  primaryButtonText="Let's go! 🚀"
  onPrimaryPress={() => navigation.navigate("MicroQuiz")}
  typingSpeed={50}
  messageDelay={2000}
/>;
```

## Quiz System

### 4. Quiz Context & Data Management

**Location:** `context/features/QuizContext.tsx`

**Purpose:**

- Store user responses throughout quiz flow
- Provide navigation state and controls
- Handle data persistence and submission

**State Structure:**

```tsx
interface QuizState {
  answers: {
    mainGoal?: string[];
    healthConditions?: string[];
    symptoms?: string[];
    healthGoals?: string[];
    trackingFrequency?: string;
    analysisPreference?: string;
    // ... other answers
  };
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  isLoading: boolean;
}
```

**Methods:**

```tsx
// Update specific answer
updateAnswer(key: string, value: any): void

// Navigation controls
nextStep(): void
previousStep(): void
goToStep(step: number): void

// Submit complete quiz
submitQuiz(): Promise<void>

// Reset quiz data
resetQuiz(): void
```

### 5. Quiz Screen Types

#### Main Goal Selection

**Screen:** `screens/onboarding/MicroQuizScreen.tsx` (Step 1)

**Purpose:** Identify user's primary motivation for using the app

**Options:**

- 🏥 **Health Monitoring** - Track digestive health changes
- 📊 **Data Tracking** - Detailed health analytics
- 🤔 **Curiosity** - Learn about digestive health
- 🎉 **Fun** - Entertainment and social sharing

**UI Component:** Grid layout with large icon buttons

#### Health Conditions Assessment

**Screen:** `screens/onboarding/ConditionsScreen.tsx`

**Purpose:** Collect existing health conditions for personalized analysis

**Categories:**

- Digestive disorders (IBS, IBD, etc.)
- Dietary restrictions
- Medications affecting digestion
- Previous health issues

**UI Component:** Multi-select checkboxes with search

#### Symptoms Evaluation

**Screen:** `screens/onboarding/SymptomsScreen.tsx`

**Purpose:** Understand current digestive symptoms

**Symptoms Tracked:**

- Frequency issues
- Pain or discomfort
- Digestive irregularities
- Energy levels
- Sleep impact

**UI Component:** Multi-select with severity ratings

#### Health Goals Setting

**Screen:** `screens/onboarding/GoalsScreen.tsx`

**Purpose:** Set personalized health objectives

**Goal Categories:**

- Improve regularity
- Reduce symptoms
- Better understanding
- Track changes over time
- Share with healthcare provider

#### Tracking Preferences

**Screen:** `screens/onboarding/TrackingFrequencyScreen.tsx`

**Purpose:** Set expectations for app usage frequency

**Options:**

- Daily tracking
- Weekly monitoring
- As-needed basis
- Irregular but consistent

#### Analysis Preferences

**Screen:** `screens/onboarding/AnalysisPreferenceScreen.tsx`

**Purpose:** Customize analysis detail level

**Preferences:**

- Detailed medical information
- Simple health insights
- Focus on trends
- Educational content

### 6. Quiz UI Components

**Location:** `components/quiz/`

#### QuizScreenLayout

**Purpose:** Common layout wrapper for all quiz screens

**Features:**

- Consistent header with progress indicator
- Back navigation with confirmation
- Responsive content area
- Action button placement

**Props:**

```tsx
interface QuizScreenLayoutProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  children: ReactNode;
}
```

#### QuizSingleSelect

**Purpose:** Single choice selection interface

**Features:**

- Radio button-style selection
- Custom styling for options
- Keyboard navigation support
- Validation feedback

#### QuizMultiSelect

**Purpose:** Multiple choice selection interface

**Features:**

- Checkbox-style selection
- Maximum selection limits
- Select all/none functionality
- Visual selection indicators

#### QuizOptionButton

**Purpose:** Individual selectable option component

**Features:**

- Animated selection states
- Custom icon and text layout
- Accessibility support
- Responsive sizing

**Implementation:**

```tsx
<QuizOptionButton
  title="Health Monitoring"
  subtitle="Track digestive health changes"
  icon="🏥"
  isSelected={selectedGoals.includes("health")}
  onPress={() => toggleGoal("health")}
  disabled={isLoading}
/>
```

## Flow Navigation

### Navigation Structure

```
OnboardingScreen → MicroQuizScreen → Individual Quiz Screens → Completion

MicroQuizScreen:
├── MainGoal Selection
├── ConditionsScreen
├── SymptomsScreen
├── GoalsScreen
├── TrackingFrequencyScreen
├── AnalysisPreferenceScreen
└── PersonalizationScreen (Final)
```

### Progress Tracking

- Linear flow with back/forward navigation
- Progress indicator shows completion percentage
- Step validation before advancing
- Data persistence between screens

### Exit Handling

- Confirmation dialogs for early exit
- Partial data preservation
- Resume capability from last completed step

## Data Integration

### Backend Submission

```tsx
// Quiz completion flow
const submitQuiz = async () => {
  try {
    const quizData = {
      mainGoal: answers.mainGoal,
      healthConditions: answers.healthConditions,
      symptoms: answers.symptoms,
      healthGoals: answers.healthGoals,
      preferences: {
        trackingFrequency: answers.trackingFrequency,
        analysisPreference: answers.analysisPreference,
      },
      completedAt: new Date().toISOString(),
    };

    await apiService.submitOnboardingData(quizData);
    await onboardingContext.completeOnboarding("home");

    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  } catch (error) {
    // Handle submission error
    showErrorAlert("Failed to save responses");
  }
};
```

### Profile Integration

- Quiz responses populate user profile
- Health data used for personalized analysis
- Preferences applied to app behavior
- Goals tracked in profile section

## Customization

### Adding New Quiz Steps

1. **Create Screen Component:**

```tsx
// screens/onboarding/NewQuizScreen.tsx
export default function NewQuizScreen() {
  const { answers, updateAnswer, nextStep } = useQuiz();

  return (
    <QuizScreenLayout title="New Question" currentStep={5} totalSteps={8}>
      {/* Quiz content */}
    </QuizScreenLayout>
  );
}
```

2. **Update Navigation:**

```tsx
// Add to navigation stack
<Stack.Screen name="NewQuiz" component={NewQuizScreen} />
```

3. **Update Quiz Context:**

```tsx
// Add to answers interface
interface QuizAnswers {
  // ... existing answers
  newAnswer?: string;
}
```

4. **Update Flow Logic:**

```tsx
// Add to step navigation
const getNextScreen = (currentStep: number) => {
  switch (currentStep) {
    case 4:
      return "NewQuiz";
    case 5:
      return "NextScreen";
    // ...
  }
};
```

### Modifying Messages and Copy

**Onboarding Messages:**

```tsx
// Update in OnboardingScreen.tsx
const messages = [
  "Updated welcome message",
  "New character introduction",
  "Modified app explanation",
];
```

**Quiz Options:**

```tsx
// Update in individual quiz screens
const healthGoalOptions = [
  { id: "regularity", title: "Improve Regularity", icon: "📅" },
  { id: "symptoms", title: "Reduce Symptoms", icon: "💊" },
  // Add new options
];
```

### Animation Customization

**Typing Speed:**

```tsx
<OnboardingScreen
  typingSpeed={30} // Faster typing
  messageDelay={1500} // Shorter delays
/>
```

**PoopBot Animations:**

```tsx
// Modify in OnboardingScreen.tsx
const floatingSpeed = 3000; // Slower floating
const sparkleCount = 8; // More sparkles
```

## Testing

### Unit Tests

- Quiz context state management
- Navigation flow logic
- Data validation and submission
- Animation component behavior

### Integration Tests

- Complete onboarding flow
- Data persistence across screens
- Navigation with back/forward
- Error handling scenarios

### User Experience Tests

- Accessibility compliance
- Different device sizes
- Animation performance
- Loading state handling

## Troubleshooting

### Common Issues

**Quiz data not saving:**

- Check QuizContext provider setup
- Verify AsyncStorage permissions
- Test data serialization/deserialization
- Check for context update race conditions

**Navigation not working:**

- Verify screen registration in navigator
- Check navigation parameter types
- Test back navigation handling
- Ensure proper navigation reset

**Animations stuttering:**

- Check useNativeDriver usage
- Reduce animation complexity
- Test on different devices
- Monitor memory usage during animations

**Onboarding not completing:**

- Verify completion logic in context
- Check AsyncStorage write operations
- Test navigation after completion
- Monitor for async operation conflicts

### Performance Optimization

- Minimize context re-renders during quiz
- Optimize animation performance
- Reduce bundle size for onboarding screens
- Cache quiz data appropriately

### Accessibility Considerations

- Screen reader support for all quiz options
- Keyboard navigation for quiz selection
- High contrast mode compatibility
- Voice control integration
